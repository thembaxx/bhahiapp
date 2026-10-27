# BahiApp

A mobile-first, offline-oriented business-management prototype for South African spaza shops and informal retailers. The current interface includes stock and inventory views, customer and credit records, sales reporting, barcode-scanning UI, multilingual reminder composition, and interactive charts.

> **Status:** Product prototype. Verify camera permissions, persistence, sync and production data safeguards before introducing real customer information. Reminder text generation is not evidence that an SMS was delivered; never imply actual delivery without a verified integration.

## Technology

Next.js, React, TypeScript, Tailwind CSS, Motion and Three.js. The versioned source of truth is [package.json](package.json).

## Run and validate

```sh
bun install --frozen-lockfile
bun run dev
bun run lint
bun run format:check
bun run typecheck
bun run test
bun run build
```

Node 24 is used by the lightweight CI. Unit tests cover rand formatting and the content of English, isiZulu and Sesotho credit reminders.

## Safety and privacy

- Customer records and consent preferences must be treated as personal information under South African privacy requirements.
- Before real use, verify access control, at-rest protection, backup and recovery, and any external AI/SMS provider disclosure.
- Do not assume that a demo, local persistence or simulated analytics proves production readiness.
- Never commit real customer data, access tokens or service credentials.

## Daily cash reconciliation

Reports include an explicit end-of-day cash reconciliation. Enter the SAST date, opening float, counted cash and any cash paid out (with an explanation). Expected cash uses recorded cash sales plus debt payments; credit sales remain separate and stock restocks do not imply cash expenditure. Duplicate ledger/customer-history entries count once; conflicting IDs block saving. Current customer balances are labelled separately from historical closing balances. Reports use recorded transactions rather than sample sales curves.

Reconciliations are saved separately in this browser, bounded to 50 records without silently evicting history. Download them to retain a copy; they are not included in the workspace backup. Invalid history is preserved and blocks overwrites. Reminder actions save/review drafts or open another app; they do not prove delivery. Connectivity is a simulation, not server synchronisation. New visits begin with an empty personal workspace; example data requires an explicit reset in Settings.
