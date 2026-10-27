import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_STATE } from "../lib/bahi-data.ts";
import {
  appendReconciliation,
  createDayReconciliation,
  MAX_RECONCILIATIONS,
  readReconciliationHistory,
  randToCents,
  reconciliationDay,
} from "../lib/day-reconciliation.ts";

const now = Date.parse("2026-10-27T15:00:00.000Z");
const inputs = {
  day: "2026-10-27",
  openingFloatCents: 10_000,
  countedCashCents: 22_500,
  paidOutCents: 2_500,
  paidOutNotes: "Cash removed for a recorded supplier payment",
};
const tx = (id, type, amount, timestamp = now) => ({
  id,
  type,
  amount,
  timestamp,
  date: "An intentionally incorrect display label",
});
function workspace(transactions = [], histories = []) {
  return {
    ...structuredClone(INITIAL_STATE),
    shopName: "Reconciliation test shop",
    items: [],
    transactions,
    customers: histories.map((history, index) => ({
      ...structuredClone(INITIAL_STATE.customers[0]),
      id: index + 1,
      owed: 75,
      history,
    })),
    // Running dashboard totals must not substitute for timestamped ledger facts.
    today: { cash: 999_999, credit: 999_999 },
  };
}

test("reconciliation uses the SAST calendar boundary and timestamp, not display labels", () => {
  const before = Date.parse("2026-10-26T21:59:59.999Z");
  const boundary = before + 1;
  assert.equal(reconciliationDay(before), "2026-10-26");
  assert.equal(reconciliationDay(boundary), "2026-10-27");
  const state = workspace([
    tx("previous-day", "cash_sale", 100, before),
    tx("current-day", "cash_sale", 25, boundary),
    tx("following-day", "cash_sale", 200, Date.parse("2026-10-27T22:00:00.000Z")),
  ]);
  const result = createDayReconciliation(state, inputs, now);
  assert.equal(result.totals.cashSalesCents, 2_500);
  assert.deepEqual(result.transactionIds, ["current-day"]);
});

test("drawer cash combines cash sales and repayments, excludes credit and unconfirmed restock outflows", () => {
  const state = workspace(
    [
      tx("cash", "cash_sale", 100),
      tx("repayment", "payment", 50),
      tx("credit", "credit_sale", 200),
      tx("stock", "restock", 800),
      tx("draft", "sms_reminder", 1),
    ],
    [[]],
  );
  const result = createDayReconciliation(state, inputs, now);
  assert.deepEqual(result.totals, {
    cashSalesCents: 10_000,
    debtPaymentsCents: 5_000,
    creditSalesCents: 20_000,
    paidOutCents: 2_500,
    expectedCashCents: 22_500,
    countedCashCents: 22_500,
    differenceCents: 0,
    currentOutstandingCents: 7_500,
  });
  assert.deepEqual(result.transactionIds, ["cash", "credit", "repayment"]);
  assert.deepEqual(result.issues, []);
  assert.equal(
    createDayReconciliation(state, { ...inputs, countedCashCents: 20_000 }, now).totals
      .differenceCents,
    -2_500,
  );
  assert.throws(
    () => createDayReconciliation(state, { ...inputs, paidOutNotes: "  " }, now),
    /Explain the cash paid out/,
  );
});

test("one transaction mirrored in the workspace and customer history counts once", () => {
  const payment = tx("shared-payment", "payment", 50);
  const result = createDayReconciliation(workspace([payment], [[payment]]), inputs, now);
  assert.equal(result.totals.debtPaymentsCents, 5_000);
  assert.deepEqual(result.transactionIds, [payment.id]);
  assert.deepEqual(result.duplicateIds, [payment.id]);
  assert.deepEqual(result.issues, []);
  assert.equal(readReconciliationHistory(appendReconciliation([], result)).length, 1);
});

test("conflicting amounts, timestamps, kinds or customer ownership exclude the ID and block saving", () => {
  const payment = { ...tx("conflicting", "payment", 50), customerId: 1 };
  for (const patch of [
    { amount: 75 },
    { timestamp: now - 1 },
    { type: "credit_sale" },
    { customerId: 2 },
  ]) {
    const result = createDayReconciliation(
      workspace([payment], [[{ ...payment, ...patch }]]),
      inputs,
      now,
    );
    assert.equal(result.totals.debtPaymentsCents, 0);
    assert.equal(result.totals.creditSalesCents, 0);
    assert.deepEqual(result.transactionIds, []);
    assert.match(result.issues.join(" "), /Conflicting transaction ID/);
    assert.throws(() => appendReconciliation([], result), /Resolve ledger issues/);
  }
});

test("malformed ledger rows and outstanding balances are visible issues, never silently zeroed into a saved result", () => {
  const state = workspace(
    [tx("bad-timestamp", "cash_sale", 100, NaN), tx("bad-money", "payment", -1)],
    [[]],
  );
  state.customers[0].owed = -25;
  const result = createDayReconciliation(state, inputs, now);
  assert.equal(result.totals.cashSalesCents, 0);
  assert.equal(result.totals.debtPaymentsCents, 0);
  assert.ok(result.issues.some((issue) => issue.includes("invalid transaction")));
  assert.ok(result.issues.some((issue) => issue.includes("outstanding total is incomplete")));
  assert.throws(() => appendReconciliation([], result), /Resolve ledger issues/);
});

test("amounts and dates reject invalid precision, overflow and impossible calendar days", () => {
  assert.equal(randToCents("0.01"), 1);
  assert.equal(randToCents(0.29), 29);
  for (const value of ["1.001", "1e2", "-1", "R10", "NaN", Infinity, -1, 0.001, 1_000_000_001]) {
    assert.throws(() => randToCents(value), RangeError);
  }
  for (const timestamp of [-1, NaN, Infinity])
    assert.throws(() => reconciliationDay(timestamp), RangeError);
  assert.throws(
    () => createDayReconciliation(workspace(), { ...inputs, day: "2026-02-30" }, now),
    RangeError,
  );
});

test("saved history round-trips exact facts and rejects corrupt, inconsistent or duplicate records", () => {
  const snapshot = createDayReconciliation(workspace([tx("cash", "cash_sale", 25)]), inputs, now);
  assert.deepEqual(readReconciliationHistory(null), []);
  assert.deepEqual(readReconciliationHistory(appendReconciliation([], snapshot)), [snapshot]);
  const mutations = [
    { ...snapshot, version: 2 },
    { ...snapshot, totals: { ...snapshot.totals, expectedCashCents: 1 } },
    { ...snapshot, totals: { ...snapshot.totals, differenceCents: 1 } },
    { ...snapshot, inputs: { ...snapshot.inputs, countedCashCents: 1 } },
    { ...snapshot, transactionIds: ["cash", "cash"] },
    { ...snapshot, day: "2026-10-26" },
  ];
  for (const raw of [
    "{",
    "null",
    "{}",
    JSON.stringify([snapshot, snapshot]),
    ...mutations.map((value) => JSON.stringify([value])),
  ]) {
    assert.throws(() => readReconciliationHistory(raw), /preserved/);
  }
  assert.throws(() => readReconciliationHistory("x".repeat(1_000_001)), /too large/);
});

test("the history cap refuses a new record without evicting prior reconciliations", () => {
  const history = Array.from({ length: MAX_RECONCILIATIONS }, (_, index) =>
    createDayReconciliation(workspace(), inputs, now + index),
  );
  const before = structuredClone(history);
  assert.throws(
    () => appendReconciliation(history, createDayReconciliation(workspace(), inputs, now + 100)),
    /50 saved reconciliations/,
  );
  assert.deepEqual(history, before);
});
