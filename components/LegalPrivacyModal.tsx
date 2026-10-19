'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Scale,
  MessageSquareWarning,
  Database,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  FileWarning,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import { BahiState } from '@/lib/bahi-data';
import { BahiBrandLogo } from './VisualCharts';

export type LegalSectionTab = 'privacy' | 'terms' | 'sms' | 'rights';

interface LegalPrivacyModalProps {
  isOpen: boolean;
  state: BahiState;
  initialSection?: LegalSectionTab;
  onClose: () => void;
  onAcceptLegalTerms: () => void;
  onExportDataJson: () => void;
  onWipeAllData: () => void;
}

export function LegalPrivacyModal({
  isOpen,
  state,
  initialSection = 'privacy',
  onClose,
  onAcceptLegalTerms,
  onExportDataJson,
  onWipeAllData,
}: LegalPrivacyModalProps) {
  const [activeSection, setActiveSection] =
    useState<LegalSectionTab>(initialSection);
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    if (isOpen && initialSection) {
      setActiveSection(initialSection);
      setConfirmWipe(false);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const consentedCustomersCount = state.customers.filter(
    (c) => c.popiaConsent !== false
  ).length;

  const tabs: {
    id: LegalSectionTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'privacy', label: 'Data & POPIA', icon: Lock },
    { id: 'terms', label: 'NCA & Tax', icon: Scale },
    { id: 'sms', label: 'SMS Rules', icon: MessageSquareWarning },
    { id: 'rights', label: 'Data Controls', icon: Database },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-[#0A1417]/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="bg-[#FBF8F3] text-[#13222B] rounded-t-[36px] sm:rounded-[38px] p-5 sm:p-7 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#13222B] flex items-center justify-center shrink-0">
                <BahiBrandLogo size={36} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-[#1F5F63]">
                    Legal, Privacy & Data Governance
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-[#78808A]">
                    v1.4 · RSA / POPIA / GDPR
                  </span>
                </div>
                <h2 className="font-fraunces text-2xl sm:text-3xl font-medium tracking-tight leading-tight">
                  Data Usage, Privacy & Legal Terms
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close legal and privacy center"
              className="w-10 h-10 rounded-full bg-[#ECE8DE] flex items-center justify-center text-[#13222B] hover:bg-[#ded9cc] shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#ECE8DE] p-1.5 rounded-[22px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(tab.id);
                    setConfirmWipe(false);
                  }}
                  className={`min-h-[42px] rounded-[16px] px-2.5 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    active
                      ? 'bg-[#13222B] text-white shadow-sm'
                      : 'text-[#13222B]/80 hover:text-[#13222B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Data Usage Policy & POPIA / GDPR Privacy */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8DE] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1F5F63]" />
                    <h3 className="font-fraunces text-lg font-medium">
                      1. Local-First Data Usage Policy
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-[#1F5F63]">
                    Zero Third-Party Resale
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#5A6570] leading-relaxed">
                  <b>BahiApp</b> is built with an{' '}
                  <b>Offline-First, Device-Local Architecture</b>. All shop
                  stock records, daily cash and credit totals, customer names,
                  phone numbers, custom tags, and repayment histories are stored
                  directly inside your device’s browser storage (
                  <code className="font-mono text-xs bg-[#F4F2EC] px-1.5 py-0.5 rounded">
                    localStorage
                  </code>{' '}
                  and PWA cache).
                </p>
                <ul className="space-y-2 text-xs text-[#13222B]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F5F63] shrink-0 mt-0.5" />
                    <span>
                      <b>No Data Brokers or Credit Bureaus:</b> We never sell,
                      rent, or transmit your customers’ credit balances or phone
                      numbers to third-party credit bureaus, advertisers, or
                      external debt collectors.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F5F63] shrink-0 mt-0.5" />
                    <span>
                      <b>Strict Data Minimization:</b> Only essential fields
                      required to maintain an informal shop ledger (First/Last
                      Name, Mobile Number for SMS receipts, Balance, and Promise
                      Date) are recorded. Do not store national ID numbers,
                      SASSA card PINs, or bank passwords in customer notes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F5F63] shrink-0 mt-0.5" />
                    <span>
                      <b>Camera & Barcode Permission:</b> Camera access is used
                      exclusively in real time on your device for barcode
                      scanning and is never recorded or uploaded.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8DE] space-y-2.5">
                <h3 className="font-fraunces text-lg font-medium">
                  2. POPIA (South Africa) & GDPR Roles
                </h3>
                <p className="text-xs text-[#5A6570] leading-relaxed">
                  Under the{' '}
                  <b>
                    Protection of Personal Information Act, 2013 (POPIA – Act 4
                    of 2013)
                  </b>{' '}
                  and the <b>EU General Data Protection Regulation (GDPR)</b>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="rounded-2xl bg-[#F4F2EC] p-3.5 space-y-1">
                    <div className="text-xs font-semibold text-[#13222B]">
                      Shopkeeper = Responsible Party
                    </div>
                    <p className="text-[11px] text-[#5A6570] leading-relaxed">
                      As the shop owner ({state.ownerName} · {state.shopName}),
                      you are the <b>Responsible Party / Data Controller</b> for
                      obtaining verbal or written consent before recording a
                      customer’s phone number or credit account.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F4F2EC] p-3.5 space-y-1">
                    <div className="text-xs font-semibold text-[#13222B]">
                      BahiApp = Software Tool / Operator
                    </div>
                    <p className="text-[11px] text-[#5A6570] leading-relaxed">
                      BahiApp provides local ledger software on an “as-is” basis
                      and does not independently access, profile, or monetize
                      personal customer records entered on your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: NCA Credit, Bookkeeping & Limitation of Liability */}
          {activeSection === 'terms' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8DE] space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#1F5F63]" />
                  <h3 className="font-fraunces text-lg font-medium">
                    1. National Credit Act (NCA) Disclaimer
                  </h3>
                </div>
                <p className="text-xs text-[#5A6570] leading-relaxed">
                  <b>BahiApp is NOT a bank, micro-lender, or registered credit provider</b>{' '}
                  under the South African{' '}
                  <b>National Credit Act, 2005 (Act 34 of 2005 – NCA)</b> or the{' '}
                  <b>Financial Sector Conduct Authority (FSCA)</b>.
                </p>
                <div className="rounded-2xl bg-[#F4F2EC] p-3.5 space-y-2 text-xs text-[#13222B]">
                  <p>
                    • <b>Informal Interest-Free Bookkeeping Only:</b> BahiApp is
                    a digital replacement for a paper counter book (bahi/duka
                    ledger) recording informal, interest-free (0% APR) store
                    tabs between a merchant and customer.
                  </p>
                  <p>
                    • <b>Prohibition on Unlawful Lending:</b> If you charge
                    interest, initiation fees, or collection fees on credit, you
                    are solely responsible for registering as a credit provider
                    with the National Credit Regulator (NCR) and issuing
                    statutory pre-agreement statements.
                  </p>
                  <p>
                    • <b>No Illegal Collateral Retention:</b> Under South
                    African law, it is strictly illegal for any shopkeeper to
                    confiscate or hold a customer’s{' '}
                    <b>SASSA grant card, Smart ID card, passport, or bank card</b>{' '}
                    as security for a shop credit balance.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8DE] space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-[#F5B83D]" />
                  <h3 className="font-fraunces text-lg font-medium">
                    2. SARS Tax, Accounting & Limitation of Liability
                  </h3>
                </div>
                <p className="text-xs text-[#5A6570] leading-relaxed">
                  Daily, weekly, and monthly summaries in BahiApp are operational
                  estimates based solely on figures you type into the app. They
                  do not constitute audited financial statements, certified tax
                  invoices, or{' '}
                  <b>South African Revenue Service (SARS)</b> VAT/Turnover Tax
                  advice.
                </p>
                <p className="text-xs text-[#5A6570] leading-relaxed">
                  <b>“As-Is” Software & Hold Harmless Clause:</b> To the maximum
                  extent permitted by the{' '}
                  <b>Consumer Protection Act, 2008 (CPA)</b>, BahiApp and its
                  creators shall not be liable for any unpaid customer debts,
                  bad credit write-offs, arithmetic entry mistakes, device
                  loss/theft, browser cache clearing, or disputes between
                  shopkeepers and customers. You agree to export regular JSON
                  backups of your ledger.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: SMS Fair Collection & Anti-Harassment Policy */}
          {activeSection === 'sms' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8DE] space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-[#1F5F63]" />
                  <h3 className="font-fraunces text-lg font-medium">
                    SMS Reminder & Fair Collection Rules
                  </h3>
                </div>
                <p className="text-xs text-[#5A6570] leading-relaxed">
                  To protect your shop from complaints under{' '}
                  <b>POPIA Section 69 (Direct Marketing)</b>, the{' '}
                  <b>WASPA Code of Conduct</b>, and the{' '}
                  <b>Debt Collectors Act (Act 114 of 1998)</b>, all SMS
                  reminders generated through BahiApp must follow these mandatory
                  rules:
                </p>
                <div className="space-y-2 text-xs text-[#13222B]">
                  <div className="rounded-2xl bg-[#F4F2EC] p-3">
                    <b>1. Transactional Account Notices Only:</b> SMS messages
                    may only be sent to customers who explicitly provided their
                    phone number to receive balance updates for an active shop
                    account. Never send unsolicited promotional spam.
                  </div>
                  <div className="rounded-2xl bg-[#F4F2EC] p-3">
                    <b>2. Respectful Contact Hours (08:00 – 19:00):</b> Do not
                    send payment reminders late at night, before 08:00, or on
                    Sundays/public holidays, and avoid excessive daily messaging.
                  </div>
                  <div className="rounded-2xl bg-[#F4F2EC] p-3">
                    <b>3. No Threats, Defamation, or Public Shaming:</b> Never
                    threaten customers, impersonate court sheriffs or lawyers,
                    or post customer debt lists publicly on shop windows or
                    community WhatsApp groups (which violates POPIA and
                    defamation law).
                  </div>
                  <div className="rounded-2xl bg-[#F4F2EC] p-3">
                    <b>4. Immediate Opt-Out & Dispute Handling:</b> If a
                    customer replies <b>STOP</b> or disputes a balance, pause
                    automated SMS reminders immediately and review the
                    item-by-item counter book together in store.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Data Subject Rights, Audit & Export/Wipe Controls */}
          {activeSection === 'rights' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8DE] space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#1F5F63]" />
                    <h3 className="font-fraunces text-lg font-medium">
                      POPIA Compliance & Data Portability
                    </h3>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#1F5F63]">
                    {consentedCustomersCount}/{state.customers.length} customers
                    consented
                  </span>
                </div>

                <p className="text-xs text-[#5A6570] leading-relaxed">
                  Under <b>POPIA Sections 23 & 24</b>, customers have the right
                  to ask what balance and personal information your shop holds
                  about them, request corrections, or ask for their record to be
                  deleted once their balance is settled (`R0`).
                </p>

                <div className="rounded-2xl bg-[#F4F2EC] p-3.5 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs font-semibold text-[#13222B]">
                      Shopkeeper Legal Acknowledgement
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-[#78808A]">
                      {state.legalAcceptedAt
                        ? `Accepted: ${state.legalAcceptedAt}`
                        : 'Pending shopkeeper acknowledgement'}
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={onAcceptLegalTerms}
                    className="min-h-[40px] px-4 py-2 rounded-full bg-[#DDF24E] text-[#13222B] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Record Compliance Timestamp</span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={onExportDataJson}
                    className="min-h-[48px] rounded-2xl bg-[#13222B] text-white text-xs font-semibold px-4 py-3 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#DDF24E]" />
                    <span>Download Full Ledger (.JSON)</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="min-h-[48px] rounded-2xl bg-[#ECE8DE] text-[#13222B] text-xs font-semibold px-4 py-3 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Customer Privacy Notice</span>
                  </motion.button>
                </div>
              </div>

              {/* Right to Erasure / Wipe Local Storage */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8453C]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#E8453C]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-fraunces text-lg font-medium">
                    Right to Erasure (Wipe Device Data)
                  </h3>
                </div>
                <p className="text-xs text-[#5A6570] leading-relaxed">
                  If you are handing this phone to another person or closing
                  your shop, use this control to permanently erase all customer
                  records, phone numbers, and transaction histories stored on
                  this device.
                </p>

                {!confirmWipe ? (
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(true)}
                    className="w-full min-h-[46px] rounded-2xl bg-[#F6C4C0]/45 hover:bg-[#F6C4C0]/70 text-[#8F1D14] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Erase All Local Customer & Shop Data</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-[#F6C4C0]/35 p-3.5 space-y-2.5 border border-[#E8453C]/40">
                    <p className="text-xs font-semibold text-[#8F1D14]">
                      Are you sure? This will clear all customer profiles and
                      reset the device ledger. Download a JSON backup first if
                      needed.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onWipeAllData();
                          setConfirmWipe(false);
                          onClose();
                        }}
                        className="flex-1 min-h-[42px] rounded-xl bg-[#E8453C] text-white text-xs font-semibold"
                      >
                        Yes, Permanently Erase Device Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmWipe(false)}
                        className="min-h-[42px] px-4 rounded-xl bg-white text-[#13222B] text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-2 border-t border-[#ECE8DE] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span className="text-[11px] text-[#78808A] text-center sm:text-left">
              Protected by local-only storage · POPIA, NCA & CPA Disclaimers
              active
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onAcceptLegalTerms();
                  onClose();
                }}
                className="flex-1 sm:flex-initial min-h-[44px] px-5 rounded-full bg-[#13222B] text-white text-xs font-semibold"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
