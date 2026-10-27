import type { BahiState, Customer, ProductItem, TransactionRecord } from "./bahi-data.ts";

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown) => typeof value === "string";
const amount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const count = (value: unknown) => amount(value) && Number.isSafeInteger(value);
const language = (value: unknown) => value === "en" || value === "zu" || value === "st";
const optional = (value: unknown, validate: (value: unknown) => boolean) =>
  value === undefined || validate(value);

function transaction(value: unknown): value is TransactionRecord {
  if (!object(value)) return false;
  return (
    text(value.id) &&
    ["cash_sale", "credit_sale", "payment", "restock", "sms_reminder"].includes(
      String(value.type),
    ) &&
    amount(value.amount) &&
    text(value.date) &&
    amount(value.timestamp) &&
    optional(value.customerId, count) &&
    optional(value.productId, count) &&
    optional(value.customerName, text) &&
    optional(value.productName, text) &&
    optional(value.quantity, amount) &&
    optional(value.notes, text) &&
    optional(value.langUsed, language)
  );
}

function product(value: unknown): value is ProductItem {
  if (!object(value)) return false;
  return (
    count(value.id) &&
    text(value.name) &&
    text(value.barcode) &&
    ["Staples", "Pantry", "Fresh", "Household"].includes(String(value.category)) &&
    ["qty", "maxQty", "price", "costPrice", "soldDaily", "soldWeekly", "soldMonthly"].every((key) =>
      amount(value[key]),
    )
  );
}

function customer(value: unknown): value is Customer {
  if (!object(value)) return false;
  return (
    count(value.id) &&
    ["name", "phone", "avatarColor", "lastPurchaseDate", "notes"].every((key) =>
      text(value[key]),
    ) &&
    ["regular", "new", "vip"].includes(String(value.category)) &&
    language(value.preferredLang) &&
    ["owed", "daysOverdue", "totalCreditExtended", "totalPaid", "purchaseCount"].every((key) =>
      amount(value[key]),
    ) &&
    optional(value.popiaConsent, (entry) => typeof entry === "boolean") &&
    optional(
      value.tags,
      (entries) =>
        Array.isArray(entries) &&
        entries.every(
          (entry) => object(entry) && text(entry.id) && text(entry.label) && text(entry.color),
        ),
    ) &&
    Array.isArray(value.history) &&
    value.history.every(transaction)
  );
}

function uniqueIds(entries: Array<{ id: string | number }>) {
  return new Set(entries.map((entry) => entry.id)).size === entries.length;
}

/** Validate old v3 records before letting them replace the current workspace. */
export function isBahiState(value: unknown): value is BahiState {
  if (!object(value)) return false;
  return (
    typeof value.onboarded === "boolean" &&
    typeof value.online === "boolean" &&
    count(value.syncQueue) &&
    language(value.lang) &&
    text(value.ownerName) &&
    text(value.shopName) &&
    object(value.today) &&
    amount(value.today.cash) &&
    amount(value.today.credit) &&
    object(value.month) &&
    amount(value.month.given) &&
    amount(value.month.collected) &&
    optional(value.theme, (entry) => entry === "light" || entry === "dark") &&
    optional(value.soundEnabled, (entry) => typeof entry === "boolean") &&
    optional(value.hapticsEnabled, (entry) => typeof entry === "boolean") &&
    optional(value.legalAcceptedAt, text) &&
    Array.isArray(value.items) &&
    value.items.every(product) &&
    uniqueIds(value.items) &&
    Array.isArray(value.customers) &&
    value.customers.every(customer) &&
    uniqueIds(value.customers) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(transaction) &&
    uniqueIds(value.transactions)
  );
}

type PersonalPreferences = Pick<
  BahiState,
  "ownerName" | "shopName" | "lang" | "theme" | "soundEnabled" | "hapticsEnabled"
>;

/** A personal ledger contains no sample people, stock, transactions or consent. */
export function createEmptyWorkspace(preferences: Partial<PersonalPreferences> = {}): BahiState {
  return {
    onboarded: false,
    online: true,
    syncQueue: 0,
    lang: preferences.lang ?? "en",
    theme: preferences.theme ?? "light",
    soundEnabled: preferences.soundEnabled ?? true,
    hapticsEnabled: preferences.hapticsEnabled ?? true,
    ownerName: preferences.ownerName ?? "",
    shopName: preferences.shopName ?? "",
    today: { cash: 0, credit: 0 },
    month: { given: 0, collected: 0 },
    items: [],
    customers: [],
    transactions: [],
  };
}

export type WorkspaceHydration =
  | { status: "demo" | "saved"; state: BahiState; error: null }
  | { status: "invalid"; state: null; error: string };

/** This function never writes storage; invalid saved text must remain recoverable. */
export function hydrateWorkspace(raw: string | null): WorkspaceHydration {
  if (raw === null) {
    return {
      status: "saved",
      state: createEmptyWorkspace({ ownerName: "Shop owner", shopName: "My shop" }),
      error: null,
    };
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (!isBahiState(value)) {
      return {
        status: "invalid",
        state: null,
        error:
          "Saved shop data could not be read safely. Export or recover it before replacing it.",
      };
    }
    return {
      status: "saved",
      state: {
        ...value,
        customers: value.customers.map((entry) => ({ ...entry, tags: entry.tags ?? [] })),
      },
      error: null,
    };
  } catch {
    return {
      status: "invalid",
      state: null,
      error:
        "Saved shop data is not valid JSON. Keep the original data before resetting the workspace.",
    };
  }
}
