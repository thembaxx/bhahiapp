import type { BahiState, TransactionRecord } from "./bahi-data.ts";

export const RECONCILIATION_STORAGE_KEY = "bahi-day-reconciliation-v1";
export const MAX_RECONCILIATIONS = 50;
export const MAX_RECONCILIATION_BYTES = 1_000_000;
const MAX_CENTS = 100_000_000_000;

export interface ReconciliationInputs {
  day: string;
  openingFloatCents: number;
  countedCashCents: number;
  paidOutCents: number;
  paidOutNotes: string;
  notes?: string;
}

export interface DayReconciliationSnapshot {
  version: 1;
  id: string;
  recordedAt: number;
  day: string;
  shopName: string;
  inputs: ReconciliationInputs;
  totals: {
    cashSalesCents: number;
    debtPaymentsCents: number;
    creditSalesCents: number;
    paidOutCents: number;
    expectedCashCents: number;
    countedCashCents: number;
    differenceCents: number;
    currentOutstandingCents: number;
  };
  transactionIds: string[];
  duplicateIds: string[];
  issues: string[];
}

/** South Africa uses UTC+2 throughout the year. Never read the display date label. */
export function reconciliationDay(timestamp = Date.now()): string {
  if (!Number.isFinite(timestamp) || timestamp < 0)
    throw new RangeError("The transaction timestamp is invalid.");
  const date = new Date(timestamp + 2 * 60 * 60 * 1000);
  if (!Number.isFinite(date.getTime()))
    throw new RangeError("The transaction timestamp is invalid.");
  return date.toISOString().slice(0, 10);
}

export function randToCents(value: number | string): number {
  if (typeof value === "string" && !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
    throw new RangeError("Enter a rand amount with no more than two decimal places.");
  }
  const amount = typeof value === "string" ? Number(value.trim()) : value;
  const cents = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isSafeInteger(cents) ||
    cents > MAX_CENTS ||
    Math.abs(amount * 100 - cents) > 0.00001
  ) {
    throw new RangeError(
      "Enter a valid amount between R0 and R1,000,000,000, with at most two decimal places.",
    );
  }
  return cents;
}

function validDay(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

function checkedAdd(left: number, right: number): number {
  const total = left + right;
  if (!Number.isSafeInteger(total))
    throw new RangeError("The recorded total is too large to calculate safely.");
  return total;
}

function checkInputs(input: ReconciliationInputs): void {
  if (!validDay(input.day)) throw new RangeError("Choose a valid South African calendar date.");
  for (const amount of [input.openingFloatCents, input.countedCashCents, input.paidOutCents]) {
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_CENTS)
      throw new RangeError("Enter valid cash amounts in cents.");
  }
  if (
    typeof input.paidOutNotes !== "string" ||
    input.paidOutNotes.length > 1000 ||
    typeof (input.notes ?? "") !== "string" ||
    (input.notes?.length ?? 0) > 2000
  ) {
    throw new RangeError(
      "Keep cash-out notes within 1,000 characters and other notes within 2,000 characters.",
    );
  }
  if (input.paidOutCents > 0 && !input.paidOutNotes.trim())
    throw new RangeError("Explain the cash paid out for this date.");
}

/** Captures recorded facts; current customer balances are not reconstructed closing balances. */
export function createDayReconciliation(
  state: BahiState,
  input: ReconciliationInputs,
  now = Date.now(),
): DayReconciliationSnapshot {
  checkInputs(input);
  reconciliationDay(now);
  const issues: string[] = [];
  const issue = (message: string) => {
    if (issues.length < 100 && !issues.includes(message)) issues.push(message);
  };
  const entries = new Map<string, { tx: TransactionRecord; cents: number; customerId?: number }>();
  const duplicates = new Set<string>();
  const conflicts = new Set<string>();
  const records = [
    ...state.transactions,
    ...state.customers.flatMap((customer) =>
      customer.history.map((tx) => ({ ...tx, customerId: tx.customerId ?? customer.id })),
    ),
  ];
  if (records.length > 10000)
    throw new RangeError(
      "This workspace has more than 10,000 ledger rows. Export and review it before reconciling here.",
    );
  for (const tx of records) {
    try {
      if (!tx.id || tx.id.length > 200) throw new RangeError("A transaction ID is invalid.");
      reconciliationDay(tx.timestamp);
      const cents = randToCents(tx.amount);
      const old = entries.get(tx.id);
      if (old) {
        duplicates.add(tx.id);
        if (
          old.tx.type !== tx.type ||
          old.cents !== cents ||
          old.tx.timestamp !== tx.timestamp ||
          (old.customerId !== undefined &&
            tx.customerId !== undefined &&
            old.customerId !== tx.customerId)
        ) {
          conflicts.add(tx.id);
          issue(
            `Conflicting transaction ID ${tx.id}; excluded from totals. Review the original ledger.`,
          );
        } else if (old.customerId === undefined) old.customerId = tx.customerId;
      } else entries.set(tx.id, { tx, cents, customerId: tx.customerId });
    } catch {
      if (typeof tx.id === "string") conflicts.add(tx.id);
      issue(
        "An invalid transaction amount, timestamp or ID was excluded. Review the original ledger before saving.",
      );
    }
  }
  let cashSalesCents = 0,
    debtPaymentsCents = 0,
    creditSalesCents = 0;
  const transactionIds: string[] = [];
  for (const [id, { tx, cents }] of entries) {
    if (conflicts.has(id) || reconciliationDay(tx.timestamp) !== input.day) continue;
    if (tx.type === "restock" || tx.type === "sms_reminder") continue;
    if (tx.type === "cash_sale") cashSalesCents = checkedAdd(cashSalesCents, cents);
    else if (tx.type === "payment") debtPaymentsCents = checkedAdd(debtPaymentsCents, cents);
    else if (tx.type === "credit_sale") creditSalesCents = checkedAdd(creditSalesCents, cents);
    else {
      issue("An unsupported transaction type was excluded.");
      continue;
    }
    transactionIds.push(id);
  }
  let currentOutstandingCents = 0;
  for (const customer of state.customers) {
    try {
      currentOutstandingCents = checkedAdd(currentOutstandingCents, randToCents(customer.owed));
    } catch {
      issue("A current customer balance is invalid. The outstanding total is incomplete.");
    }
  }
  const expectedCashCents =
    checkedAdd(checkedAdd(input.openingFloatCents, cashSalesCents), debtPaymentsCents) -
    input.paidOutCents;
  return {
    version: 1,
    id: `${input.day}-${now}`,
    recordedAt: now,
    day: input.day,
    shopName: state.shopName,
    inputs: { ...input },
    totals: {
      cashSalesCents,
      debtPaymentsCents,
      creditSalesCents,
      paidOutCents: input.paidOutCents,
      expectedCashCents,
      countedCashCents: input.countedCashCents,
      differenceCents: input.countedCashCents - expectedCashCents,
      currentOutstandingCents,
    },
    transactionIds: transactionIds.sort(),
    duplicateIds: [...duplicates].sort(),
    issues,
  };
}

const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const signedCents = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value);
const strings = (value: unknown, max: number, length: number): value is string[] =>
  Array.isArray(value) &&
  value.length <= max &&
  value.every((entry) => typeof entry === "string" && entry.length <= length);

function validSnapshot(value: unknown): value is DayReconciliationSnapshot {
  if (
    !record(value) ||
    value.version !== 1 ||
    typeof value.id !== "string" ||
    value.id.length > 250 ||
    !signedCents(value.recordedAt) ||
    value.recordedAt < 0 ||
    typeof value.day !== "string" ||
    typeof value.shopName !== "string" ||
    value.shopName.length > 500 ||
    !record(value.inputs) ||
    !record(value.totals)
  )
    return false;
  try {
    checkInputs(value.inputs as unknown as ReconciliationInputs);
    reconciliationDay(value.recordedAt);
  } catch {
    return false;
  }
  const input = value.inputs as unknown as ReconciliationInputs;
  const total = value.totals;
  const keys = [
    "cashSalesCents",
    "debtPaymentsCents",
    "creditSalesCents",
    "paidOutCents",
    "expectedCashCents",
    "countedCashCents",
    "differenceCents",
    "currentOutstandingCents",
  ];
  if (
    !keys.every((key) => signedCents(total[key])) ||
    !keys
      .filter((key) => key !== "expectedCashCents" && key !== "differenceCents")
      .every((key) => (total[key] as number) >= 0)
  )
    return false;
  return (
    value.day === input.day &&
    value.id === `${value.day}-${value.recordedAt}` &&
    total.paidOutCents === input.paidOutCents &&
    total.countedCashCents === input.countedCashCents &&
    total.expectedCashCents ===
      input.openingFloatCents +
        (total.cashSalesCents as number) +
        (total.debtPaymentsCents as number) -
        input.paidOutCents &&
    total.differenceCents === input.countedCashCents - (total.expectedCashCents as number) &&
    strings(value.transactionIds, 10000, 200) &&
    new Set(value.transactionIds).size === value.transactionIds.length &&
    strings(value.duplicateIds, 10000, 200) &&
    strings(value.issues, 100, 1000)
  );
}

/** Invalid or oversized history is left untouched by callers, never replaced with an empty list. */
export function readReconciliationHistory(raw: string | null): DayReconciliationSnapshot[] {
  if (raw === null) return [];
  if (new TextEncoder().encode(raw).length > MAX_RECONCILIATION_BYTES)
    throw new Error(
      "Saved reconciliation history is too large. Download it before making changes.",
    );
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Saved reconciliation history could not be read. It has been preserved.");
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length > MAX_RECONCILIATIONS ||
    !parsed.every(validSnapshot) ||
    new Set(parsed.map((value) => value.id)).size !== parsed.length
  )
    throw new Error("Saved reconciliation history could not be verified. It has been preserved.");
  return parsed;
}

export function appendReconciliation(
  history: DayReconciliationSnapshot[],
  snapshot: DayReconciliationSnapshot,
): string {
  if (snapshot.issues.length)
    throw new Error("Resolve ledger issues before saving a reconciliation.");
  if (history.length >= MAX_RECONCILIATIONS)
    throw new Error(
      "This device already has 50 saved reconciliations. Download the history; existing records have not been replaced.",
    );
  const raw = JSON.stringify([...history, snapshot]);
  readReconciliationHistory(raw);
  return raw;
}
