import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_STATE } from "../lib/bahi-data.ts";
import { createEmptyWorkspace, hydrateWorkspace, isBahiState } from "../lib/workspace-storage.ts";

test("empty customer, product and transaction arrays survive hydration", () => {
  const saved = { ...structuredClone(INITIAL_STATE), items: [], customers: [], transactions: [] };
  const result = hydrateWorkspace(JSON.stringify(saved));
  assert.equal(result.status, "saved");
  assert.deepEqual(result.state, saved);
  assert.deepEqual(hydrateWorkspace(JSON.stringify(result.state)).state, saved);
});

test("the first visit starts an empty personal workspace", () => {
  const result = hydrateWorkspace(null);
  assert.equal(result.status, "saved");
  assert.deepEqual(result.state.customers, []);
  assert.deepEqual(result.state.items, []);
  assert.deepEqual(result.state.transactions, []);
});

test("existing complete ledgers and older records without optional tags remain readable", () => {
  const saved = structuredClone(INITIAL_STATE);
  delete saved.soundEnabled;
  delete saved.hapticsEnabled;
  delete saved.customers[0].tags;
  const result = hydrateWorkspace(JSON.stringify(saved));
  assert.equal(result.status, "saved");
  assert.equal(result.state.customers[0].name, saved.customers[0].name);
  assert.equal(result.state.transactions.length, saved.transactions.length);
  assert.deepEqual(result.state.customers[0].tags, []);
  assert.equal(result.state.today.cash, saved.today.cash);
});

test("malformed saved data returns an error without replacement state", () => {
  for (const raw of [
    "",
    "{",
    "null",
    "[]",
    "{}",
    JSON.stringify({ ...INITIAL_STATE, customers: {} }),
  ]) {
    const result = hydrateWorkspace(raw);
    assert.equal(result.status, "invalid");
    assert.equal(result.state, null);
    assert.ok(result.error.length > 0);
  }
});

test("invalid nested records and non-finite money cannot hydrate", () => {
  const samples = [
    { ...INITIAL_STATE, today: { cash: "123", credit: 0 } },
    { ...INITIAL_STATE, transactions: [{ ...INITIAL_STATE.customers[0].history[0], amount: -1 }] },
    { ...INITIAL_STATE, customers: [{ ...INITIAL_STATE.customers[0], history: "history" }] },
    { ...INITIAL_STATE, items: [{ ...INITIAL_STATE.items[0], qty: -2 }] },
    { ...INITIAL_STATE, syncQueue: 1.5 },
    { ...INITIAL_STATE, customers: [INITIAL_STATE.customers[0], INITIAL_STATE.customers[0]] },
  ];
  for (const sample of samples)
    assert.equal(hydrateWorkspace(JSON.stringify(sample)).status, "invalid");
  assert.equal(isBahiState({ ...INITIAL_STATE, today: { cash: Infinity, credit: 0 } }), false);
});

test("personal workspaces start empty and preserve chosen preferences without fabricated consent", () => {
  const empty = createEmptyWorkspace({
    ownerName: "Sam",
    shopName: "Sam's Shop",
    lang: "zu",
    theme: "dark",
  });
  assert.equal(empty.ownerName, "Sam");
  assert.equal(empty.lang, "zu");
  assert.equal(empty.theme, "dark");
  assert.equal(empty.onboarded, false);
  assert.equal(empty.legalAcceptedAt, undefined);
  assert.deepEqual(empty.today, { cash: 0, credit: 0 });
  assert.deepEqual(empty.month, { given: 0, collected: 0 });
  assert.deepEqual(empty.customers, []);
  assert.deepEqual(empty.items, []);
  assert.deepEqual(empty.transactions, []);
  assert.equal(isBahiState(empty), true);
  assert.deepEqual(hydrateWorkspace(JSON.stringify(empty)).state, empty);
});
