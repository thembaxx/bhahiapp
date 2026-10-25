import test from "node:test";
import assert from "node:assert/strict";
import { formatRand0, formatRandParts, generateSMSText } from "../lib/bahi-data.ts";

test("rand formatting handles cents and grouping", () => {
  assert.equal(formatRand0(1250), "R1,250");
  assert.deepEqual(formatRandParts(1250.5), { whole: "R1,250", cents: ".50" });
});

test("credit reminders keep correct customer and rand amount", () => {
  const params = { customerName: "Thandi Dlamini", shopName: "Corner Shop", amountOwed: 450, daysOverdue: 3 };
  for (const lang of ["en", "zu", "st"]) {
    const text = generateSMSText({ ...params, lang, tone: "urgent" });
    assert.match(text, /Thandi/);
    assert.match(text, /Corner Shop/);
    assert.match(text, /R450/);
  }
});

test("friendly reminders must not promise that a message was sent", () => {
  const text = generateSMSText({
    customerName: "Sipho", shopName: "My Shop", amountOwed: 0,
    daysOverdue: 0, lang: "en", tone: "friendly",
  });
  assert.match(text, /R0/);
  assert.doesNotMatch(text, /message sent|SMS delivered/i);
});
