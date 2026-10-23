"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Phone,
  UserCheck,
  History,
  MessageSquare,
  Edit3,
  PlusCircle,
  CheckCircle2,
  Copy,
  Send,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  Customer,
  CustomerCategory,
  LanguageCode,
  LANGUAGE_NAMES,
  SMSTone,
  formatRand0,
  generateSMSText,
  tt,
} from "@/lib/bahi-data";
import { DotMatrixCounter } from "./VisualCharts";

interface CRMCustomerModalProps {
  customer: Customer | null;
  isCreatingNew?: boolean;
  isOpen: boolean;
  shopName: string;
  appLang: LanguageCode;
  onClose: () => void;
  onRecordTransaction: (
    customerId: number,
    type: "credit_sale" | "payment",
    amount: number,
    productNote: string,
  ) => void;
  onSendSMS: (customer: Customer, lang: LanguageCode, tone: SMSTone, message: string) => void;
  onSaveCustomer: (
    customerData: {
      id?: number;
      name: string;
      phone: string;
      category: CustomerCategory;
      preferredLang: LanguageCode;
      notes: string;
      popiaConsent?: boolean;
    },
    initialCredit?: number,
  ) => void;
}

export function CRMCustomerModal({
  customer,
  isCreatingNew = false,
  isOpen,
  shopName,
  appLang,
  onClose,
  onRecordTransaction,
  onSendSMS,
  onSaveCustomer,
}: CRMCustomerModalProps) {
  const [subTab, setSubTab] = useState<"ledger" | "history" | "sms" | "edit">("ledger");
  const [amountStr, setAmountStr] = useState("");
  const [itemNote, setItemNote] = useState("");
  const [smsLang, setSmsLang] = useState<LanguageCode>("en");
  const [smsTone, setSmsTone] = useState<SMSTone>("standard");
  const [copied, setCopied] = useState(false);

  // Edit / Create fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<CustomerCategory>("regular");
  const [preferredLang, setPreferredLang] = useState<LanguageCode>("en");
  const [notes, setNotes] = useState("");
  const [initialCreditStr, setInitialCreditStr] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(true);

  useEffect(() => {
    if (isCreatingNew) {
      setSubTab("edit");
      setName("");
      setPhone("+27 ");
      setCategory("new");
      setPreferredLang(appLang);
      setNotes("");
      setInitialCreditStr("");
      setPopiaConsent(true);
    } else if (customer) {
      setSubTab("ledger");
      setAmountStr("");
      setItemNote("");
      setSmsLang(customer.preferredLang || appLang);
      setSmsTone(customer.daysOverdue >= 7 ? "urgent" : "standard");
      setName(customer.name);
      setPhone(customer.phone);
      setCategory(customer.category);
      setPreferredLang(customer.preferredLang || appLang);
      setNotes(customer.notes || "");
      setPopiaConsent(customer.popiaConsent ?? true);
    }
  }, [customer, isCreatingNew, appLang, isOpen]);

  if (!isOpen) return null;

  const smsPreview = customer
    ? generateSMSText({
        customerName: customer.name,
        shopName,
        amountOwed: customer.owed,
        daysOverdue: customer.daysOverdue,
        lang: smsLang,
        tone: smsTone,
      })
    : "";

  const handleCopySMS = () => {
    if (!smsPreview) return;
    navigator.clipboard?.writeText(smsPreview).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveCustomer(
      {
        id: customer?.id,
        name: name.trim(),
        phone: phone.trim() || "+27 72 000 0000",
        category,
        preferredLang,
        notes: notes.trim(),
        popiaConsent,
      },
      isCreatingNew ? parseFloat(initialCreditStr) || 0 : undefined,
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: "100%", scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="bg-white w-full max-w-[480px] rounded-t-[42px] sm:rounded-[42px] p-6 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="w-10 h-1.5 bg-[#ECE8DE] rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {customer && !isCreatingNew && (
                  <div
                    className="w-12 h-12 rounded-full grid place-items-center font-fraunces font-semibold text-xl text-[#13222B] shrink-0"
                    style={{ backgroundColor: customer.avatarColor }}
                  >
                    {customer.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-fraunces text-2xl font-medium text-[#13222B] truncate">
                    {isCreatingNew ? tt("Add customer", appLang) : customer?.name}
                  </h2>
                  {!isCreatingNew && customer && (
                    <div className="flex items-center gap-2 text-xs text-[#78808A] mt-0.5 flex-wrap">
                      <span className="font-mono tabular-nums">{customer.phone}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize font-medium text-[#13222B]">
                        {customer.category} customer
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        <span className="font-mono tabular-nums">{customer.purchaseCount}</span>{" "}
                        visits
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] rounded-full bg-[#F4F2EC] grid place-items-center text-[#13222B] hover:bg-[#ECE8DE] transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Sub-Navigation inside Customer CRM Modal */}
            {!isCreatingNew && customer && (
              <div className="grid grid-cols-4 gap-1.5 bg-[#F4F2EC] p-1.5 rounded-2xl mt-4">
                {(
                  [
                    { id: "ledger", label: "Account", icon: UserCheck },
                    { id: "history", label: "History", icon: History },
                    { id: "sms", label: "SMS", icon: MessageSquare },
                    { id: "edit", label: "Profile", icon: Edit3 },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = subTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubTab(item.id)}
                      className={`min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                        active
                          ? "bg-[#13222B] text-white shadow-sm"
                          : "text-[#78808A] hover:text-[#13222B]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 1: LEDGER (Credit / Payment / Quick Summary) */}
            {!isCreatingNew && customer && subTab === "ledger" && (
              <div className="mt-5 space-y-4">
                <div className="bg-[#F4F2EC] rounded-[28px] p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs text-[#78808A]">{tt("Owes you", appLang)}</div>
                    <div className="text-4xl mt-0.5 text-[#13222B]">
                      <DotMatrixCounter value={customer.owed} decimals={2} />
                    </div>
                    <div className="text-xs text-[#78808A] mt-1">
                      {customer.owed > 0
                        ? `${customer.daysOverdue} days open · Last active ${customer.lastPurchaseDate}`
                        : "Account fully settled"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#78808A] space-y-1">
                    <div>
                      Total credit:{" "}
                      <strong className="font-doto text-[#13222B]">
                        {formatRand0(customer.totalCreditExtended)}
                      </strong>
                    </div>
                    <div>
                      Total paid:{" "}
                      <strong className="font-doto text-[#2C8C8A]">
                        {formatRand0(customer.totalPaid)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Amount Input + Quick Chips */}
                <div>
                  <label className="block text-xs text-[#78808A] mb-1.5">
                    {tt("Amount in rand", appLang)}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 font-doto text-2xl font-bold text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                  />
                  <div className="flex gap-2 flex-wrap mt-2">
                    {[20, 50, 100, 200].map((preset) => (
                      <motion.button
                        key={preset}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setAmountStr(String(preset))}
                        className="px-3.5 py-2 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-doto font-bold text-[#13222B] transition-colors"
                      >
                        +R{preset}
                      </motion.button>
                    ))}
                    {customer.owed > 0 && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setAmountStr(String(customer.owed))}
                        className="px-3.5 py-2 rounded-full bg-[#DDF24E] text-xs font-medium text-[#13222B]"
                      >
                        Full{" "}
                        <span className="font-mono font-bold tabular-nums">
                          {formatRand0(customer.owed)}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="Optional note (e.g. Maize meal 5kg + Bread)"
                    className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      const val = parseFloat(amountStr);
                      if (val > 0) {
                        onRecordTransaction(
                          customer.id,
                          "credit_sale",
                          val,
                          itemNote.trim() || "Shop credit purchase",
                        );
                        setAmountStr("");
                        setItemNote("");
                      }
                    }}
                    className="min-h-[48px] rounded-2xl bg-[#13222B] text-white text-sm font-medium px-4 py-3 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>{tt("Add credit sale", appLang)}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      const val = parseFloat(amountStr);
                      if (val > 0) {
                        onRecordTransaction(
                          customer.id,
                          "payment",
                          val,
                          itemNote.trim() || "Cash payment received",
                        );
                        setAmountStr("");
                        setItemNote("");
                      }
                    }}
                    className="min-h-[48px] rounded-2xl bg-[#2C8C8A] text-white text-sm font-medium px-4 py-3 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{tt("Record payment", appLang)}</span>
                  </motion.button>
                </div>

                {/* Instant Multi-language SMS Preview Box */}
                <div className="bg-[#F4F2EC] rounded-[24px] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#13222B]">
                      SMS Reminder ({LANGUAGE_NAMES[smsLang].label})
                    </span>
                    <div className="flex items-center gap-1">
                      {(["en", "zu", "st"] as LanguageCode[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setSmsLang(l)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            smsLang === l
                              ? "bg-[#13222B] text-white"
                              : "bg-white text-[#78808A] hover:text-[#13222B]"
                          }`}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#78808A] leading-relaxed">{smsPreview}</p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSendSMS(customer, smsLang, smsTone, smsPreview)}
                    className="w-full min-h-[48px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{tt("Send reminder SMS", appLang)}</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* TAB 2: COMPLETE PURCHASE & PAYMENT HISTORY */}
            {!isCreatingNew && customer && subTab === "history" && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#78808A] px-1">
                  <span>{tt("Purchase history", appLang)}</span>
                  <span>{customer.history.length} entries recorded</span>
                </div>
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {customer.history.length === 0 ? (
                    <p className="text-sm text-[#78808A] py-8 text-center">
                      No transactions recorded for this customer yet.
                    </p>
                  ) : (
                    customer.history.map((tx) => {
                      const isPayment = tx.type === "payment";
                      const isSms = tx.type === "sms_reminder";
                      return (
                        <div
                          key={tx.id}
                          className="bg-[#F4F2EC] rounded-2xl p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${
                                isPayment
                                  ? "bg-[#BDEBE3] text-[#13222B]"
                                  : isSms
                                    ? "bg-[#DDF24E] text-[#13222B]"
                                    : "bg-[#F6C4C0] text-[#13222B]"
                              }`}
                            >
                              {isPayment ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : isSms ? (
                                <MessageSquare className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <b className="text-sm font-medium text-[#13222B] block truncate">
                                {isPayment
                                  ? "Payment received"
                                  : isSms
                                    ? `SMS Reminder (${(tx.langUsed || "en").toUpperCase()})`
                                    : tx.productName || "Credit purchase"}
                              </b>
                              <small className="text-xs text-[#78808A] block truncate">
                                {tx.date}
                                {tx.notes ? ` · ${tx.notes}` : ""}
                              </small>
                            </div>
                          </div>
                          {!isSms && (
                            <span
                              className={`font-doto font-bold text-base shrink-0 ${
                                isPayment ? "text-[#1F5F63]" : "text-[#E8453C]"
                              }`}
                            >
                              {isPayment ? "-" : "+"}
                              {formatRand0(tx.amount)}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MULTI-LANGUAGE SMS COMPOSER */}
            {!isCreatingNew && customer && subTab === "sms" && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs text-[#78808A] mb-2">
                    Select SMS Reminder Language
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["en", "zu", "st"] as LanguageCode[]).map((langKey) => (
                      <motion.button
                        key={langKey}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSmsLang(langKey)}
                        className={`p-3 rounded-2xl text-left border transition-all ${
                          smsLang === langKey
                            ? "bg-[#13222B] text-white border-[#13222B]"
                            : "bg-[#F4F2EC] text-[#13222B] border-transparent"
                        }`}
                      >
                        <div className="font-doto font-bold text-xs opacity-75">
                          {langKey.toUpperCase()}
                        </div>
                        <div className="font-medium text-sm mt-0.5">
                          {LANGUAGE_NAMES[langKey].label}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#78808A] mb-2">
                    Message Tone & Cultural Context
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "friendly", label: "Warm & Polite" },
                        { id: "standard", label: "Standard" },
                        { id: "urgent", label: "Firm / Overdue" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSmsTone(t.id)}
                        className={`min-h-[42px] rounded-xl text-xs font-medium px-3 py-2 transition-colors ${
                          smsTone === t.id
                            ? "bg-[#DDF24E] text-[#13222B] font-semibold"
                            : "bg-[#F4F2EC] text-[#78808A] hover:text-[#13222B]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F4F2EC] rounded-[24px] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#78808A]">
                    <span>
                      To: <span className="font-mono tabular-nums">{customer.phone}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#1F5F63]">
                      <Sparkles className="w-3.5 h-3.5" />
                      {LANGUAGE_NAMES[smsLang].label} verified
                    </span>
                  </div>
                  <p className="text-sm text-[#13222B] leading-relaxed font-normal py-1">
                    “{smsPreview}”
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={handleCopySMS}
                    className="min-h-[48px] rounded-full bg-[#F4F2EC] text-[#13222B] text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? "Copied!" : "Copy text"}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onSendSMS(customer, smsLang, smsTone, smsPreview)}
                    className="min-h-[48px] rounded-full bg-[#DDF24E] text-[#13222B] text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send SMS</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* TAB 4: EDIT OR ADD CUSTOMER PROFILE */}
            {(isCreatingNew || subTab === "edit") && (
              <form onSubmit={handleSaveDetails} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs text-[#78808A] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mama Nomsa Khumalo"
                    className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#78808A] mb-1">Phone Number (SMS)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#78808A] absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 82 000 0000"
                      className="w-full bg-[#F4F2EC] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#78808A] mb-1.5">Customer Category</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#F4F2EC] p-1 rounded-2xl">
                      {(["regular", "new", "vip"] as CustomerCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`min-h-[38px] rounded-xl text-xs font-medium capitalize transition-colors ${
                            category === cat
                              ? "bg-[#13222B] text-white"
                              : "text-[#78808A] hover:text-[#13222B]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#78808A] mb-1.5">
                      Preferred SMS Lang
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#F4F2EC] p-1 rounded-2xl">
                      {(["en", "zu", "st"] as LanguageCode[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setPreferredLang(l)}
                          className={`min-h-[38px] rounded-xl text-xs font-mono font-semibold uppercase transition-colors ${
                            preferredLang === l
                              ? "bg-[#DDF24E] text-[#13222B]"
                              : "text-[#78808A] hover:text-[#13222B]"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isCreatingNew && (
                  <div>
                    <label className="block text-xs text-[#78808A] mb-1">
                      Opening Credit Balance (Rand, optional)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={initialCreditStr}
                      onChange={(e) => setInitialCreditStr(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3 font-doto text-lg font-bold text-[#13222B]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-[#78808A] mb-1">
                    Shopkeeper Notes (Payday / Trust info)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Pays every Friday afternoon"
                    className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3 text-sm text-[#13222B]"
                  />
                </div>

                {/* POPIA & Transactional SMS Consent Confirmation */}
                <label className="flex items-start gap-3 bg-[#F4F2EC] rounded-2xl p-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={popiaConsent}
                    onChange={(e) => setPopiaConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#1F5F63] rounded shrink-0"
                  />
                  <span className="text-xs text-[#78808A] leading-relaxed">
                    <b className="text-[#13222B] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1F5F63] inline" />
                      POPIA & SMS Consent:
                    </b>{" "}
                    Customer consented to store their name & mobile number on this device and
                    receive transactional SMS balance reminders (interest-free informal bookkeeping
                    under NCA).
                  </span>
                </label>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="w-full min-h-[50px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-sm shadow-sm mt-2"
                >
                  {isCreatingNew ? "Save new customer" : "Save customer profile"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
