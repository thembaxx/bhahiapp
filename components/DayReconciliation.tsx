"use client";

import { useEffect, useState } from "react";
import type { BahiState } from "@/lib/bahi-data";
import {
  appendReconciliation,
  createDayReconciliation,
  readReconciliationHistory,
  reconciliationDay,
  randToCents,
  RECONCILIATION_STORAGE_KEY,
  type DayReconciliationSnapshot,
} from "@/lib/day-reconciliation";

const format = (cents: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
const field =
  "mt-1 w-full rounded-xl border border-[#78808A] bg-white p-3 text-base text-[#13222B]";
const button = "rounded-full border border-[#78808A] px-4 py-3 text-sm disabled:opacity-50";

function download(text: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DayReconciliation({ state }: { state: BahiState }) {
  const [today, setToday] = useState(() => reconciliationDay());
  const [day, setDay] = useState(() => reconciliationDay());
  const [opening, setOpening] = useState("");
  const [counted, setCounted] = useState("");
  const [paidOut, setPaidOut] = useState("");
  const [paidOutNotes, setPaidOutNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<DayReconciliationSnapshot[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [originalRaw, setOriginalRaw] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saved, setSaved] = useState<DayReconciliationSnapshot | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECONCILIATION_STORAGE_KEY);
      setOriginalRaw(raw);
      setHistory(readReconciliationHistory(raw));
      setStorageReady(true);
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? error.message
          : "Local history could not be opened. Existing data has been preserved.",
      );
    }
    const timer = setInterval(() => setToday(reconciliationDay()), 60000);
    return () => clearInterval(timer);
  }, []);
  let preview: DayReconciliationSnapshot | null = null;
  let validation =
    "Enter the opening float, counted cash and cash paid out. Enter 0 when there was none.";
  try {
    preview = createDayReconciliation(
      state,
      {
        day,
        openingFloatCents: randToCents(opening),
        countedCashCents: randToCents(counted),
        paidOutCents: randToCents(paidOut),
        paidOutNotes,
        notes,
      },
      0,
    );
    validation = "";
  } catch (error) {
    if (opening && counted && paidOut)
      validation = error instanceof Error ? error.message : "Check the cash amounts.";
  }
  const edited = () => {
    setSaved(null);
    setStatus("");
  };
  const sameDayCount = history.filter(
    (entry) => entry.day === day && entry.shopName === state.shopName,
  ).length;
  const currentSaved =
    saved &&
    preview &&
    JSON.stringify({ ...saved, id: preview.id, recordedAt: preview.recordedAt }) ===
      JSON.stringify(preview)
      ? saved
      : null;
  return (
    <section
      className="rounded-[32px] border border-white bg-white/85 p-5 text-[#13222B] sm:p-6"
      aria-labelledby="day-reconciliation-title"
    >
      <h2 id="day-reconciliation-title" className="font-fraunces text-2xl">
        End-of-day cash check
      </h2>
      <p className="mt-2 text-sm">
        Compare counted cash with dated entries in your shop book. Times use South Africa (UTC+2).
        Enter actual amounts; this check does not verify the completeness of your records.
      </p>
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus("");
          if (!preview || preview.issues.length || day > today) return;
          try {
            if (!storageReady || storageError)
              throw new Error("Local history is unavailable. Download this check instead.");
            const current = readReconciliationHistory(
              localStorage.getItem(RECONCILIATION_STORAGE_KEY),
            );
            const snapshot = createDayReconciliation(state, preview.inputs);
            const raw = appendReconciliation(current, snapshot);
            localStorage.setItem(RECONCILIATION_STORAGE_KEY, raw);
            setHistory([...current, snapshot]);
            setOriginalRaw(raw);
            setSaved(snapshot);
            setStatus("Cash check saved on this device. Previous records were retained.");
          } catch (error) {
            setStatus(
              error instanceof Error
                ? error.message
                : "The check could not be saved. Download it instead.",
            );
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Shop-book date
            <input
              type="date"
              required
              value={day}
              max={today}
              onChange={(e) => {
                setDay(e.target.value);
                edited();
              }}
              className={field}
            />
          </label>
          {[
            { label: "Opening cash float (rand)", value: opening, set: setOpening },
            { label: "Cash counted at close (rand)", value: counted, set: setCounted },
            { label: "Cash paid out on this date (rand)", value: paidOut, set: setPaidOut },
          ].map((input) => (
            <label key={input.label} className="text-sm">
              {input.label}
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="1000000000"
                step="0.01"
                required
                value={input.value}
                onChange={(e) => {
                  input.set(e.target.value);
                  edited();
                }}
                className={field}
              />
            </label>
          ))}
        </div>
        <label className="mt-4 block text-sm">
          Cash-out details (required when more than zero)
          <textarea
            rows={2}
            maxLength={1000}
            value={paidOutNotes}
            onChange={(e) => {
              setPaidOutNotes(e.target.value);
              edited();
            }}
            className={field}
            placeholder="For example: cash paid to supplier, with receipt reference"
          />
        </label>
        <label className="mt-4 block text-sm">
          Notes about this check
          <textarea
            rows={2}
            maxLength={2000}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              edited();
            }}
            className={field}
          />
        </label>
        {validation && (
          <p className="mt-3 text-sm" role="status">
            {validation}
          </p>
        )}
        {day > today && (
          <p className="mt-3 text-sm" role="alert">
            Choose today or a past date.
          </p>
        )}
        {preview && (
          <div className="mt-4 rounded-2xl bg-[#F4F2EC] p-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Recorded cash sales", preview.totals.cashSalesCents],
                ["Recorded debt payments", preview.totals.debtPaymentsCents],
                ["Cash paid out (your entry)", preview.totals.paidOutCents],
                ["Expected cash including float", preview.totals.expectedCashCents],
                ["Cash counted (your entry)", preview.totals.countedCashCents],
                ["Difference: counted minus expected", preview.totals.differenceCents],
                ["Credit sales (excluded from cash)", preview.totals.creditSalesCents],
                ["Current recorded customer balances", preview.totals.currentOutstandingCents],
              ].map(([label, amount]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd className="font-mono font-semibold">{format(amount as number)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs">
              {preview.transactionIds.length} dated entries counted. {preview.duplicateIds.length}{" "}
              repeated IDs found across the ledger; matching entries are counted once. Debt payments
              are treated as cash because the shop book does not record a payment method. Restocks
              and reminder drafts have no cash-out value here. Current customer balances reflect
              this workspace now, not the selected date’s closing debt.
            </p>
            {preview.issues.length > 0 && (
              <div role="alert" className="mt-3">
                <p className="font-semibold">
                  Totals are incomplete. Resolve these ledger issues before saving.
                </p>
                <ul className="ml-5 list-disc">
                  {preview.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {storageError && (
          <p className="mt-3 text-sm" role="alert">
            {storageError} Saving is blocked so existing history is not overwritten.
          </p>
        )}
        {sameDayCount > 0 && (
          <p className="mt-3 text-sm">
            {sameDayCount} saved check(s) already exist for this date and shop. Saving adds another
            record.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className={`${button} bg-[#DDF24E]`}
            disabled={
              !preview ||
              Boolean(preview.issues.length) ||
              !storageReady ||
              Boolean(storageError) ||
              Boolean(currentSaved) ||
              day > today
            }
          >
            {sameDayCount ? "Save another check" : "Save cash check"}
          </button>
          <button
            type="button"
            className={button}
            disabled={!preview || day > today}
            onClick={() => {
              if (!preview) return;
              try {
                const snapshot = currentSaved ?? createDayReconciliation(state, preview.inputs);
                download(JSON.stringify(snapshot, null, 2), `bahi-cash-check-${day}.json`);
                setStatus("Download requested. Check your downloads for the JSON file.");
              } catch {
                setStatus("The download could not be prepared.");
              }
            }}
          >
            Download this check
          </button>
          {originalRaw !== null && (
            <button
              type="button"
              className={button}
              onClick={() => {
                try {
                  download(originalRaw, "bahi-cash-check-history.json");
                  setStatus("History download requested.");
                } catch {
                  setStatus("The history download could not be prepared.");
                }
              }}
            >
              Download saved history
            </button>
          )}
        </div>
        <p className="mt-3 text-sm" role="status">
          {status}
        </p>
      </form>
      <p className="mt-2 text-xs">
        Up to 50 checks are kept separately on this device. They are not included in the main
        workspace backup. Download the history regularly. A zero difference only means these entered
        and recorded amounts match.
      </p>
      {history.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm">Saved checks ({history.length})</summary>
          <ul className="mt-2 space-y-2 text-sm">
            {[...history].reverse().map((entry) => (
              <li key={entry.id} className="rounded-xl bg-[#F4F2EC] p-3">
                {entry.day} · {entry.shopName} · difference {format(entry.totals.differenceCents)}
                <button
                  type="button"
                  className="ml-3 underline"
                  onClick={() => {
                    try {
                      download(JSON.stringify(entry, null, 2), `bahi-cash-check-${entry.id}.json`);
                    } catch {
                      setStatus("The saved check could not be downloaded.");
                    }
                  }}
                >
                  Download record
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
