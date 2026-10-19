'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  Edit3,
  History,
  PlusCircle,
  CheckCircle2,
  MessageSquare,
  Send,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Sparkles,
  UserCheck,
  FileText,
} from 'lucide-react';
import {
  Customer,
  CustomerCategory,
  LanguageCode,
  LANGUAGE_NAMES,
  SMSTone,
  formatRand0,
  generateSMSText,
  tt,
} from '@/lib/bahi-data';
import { DotMatrixCounter, StatusRing } from './VisualCharts';

interface CustomerProfileScreenProps {
  customer: Customer;
  shopName: string;
  appLang: LanguageCode;
  onBack: () => void;
  onRecordTransaction: (
    customerId: number,
    type: 'credit_sale' | 'payment',
    amount: number,
    productNote: string
  ) => void;
  onSendSMS: (
    customer: Customer,
    lang: LanguageCode,
    tone: SMSTone,
    message: string
  ) => void;
  onUpdateCustomer: (data: {
    id: number;
    name: string;
    phone: string;
    category: CustomerCategory;
    preferredLang: LanguageCode;
    notes: string;
  }) => void;
}

export function CustomerProfileScreen({
  customer,
  shopName,
  appLang,
  onBack,
  onRecordTransaction,
  onSendSMS,
  onUpdateCustomer,
}: CustomerProfileScreenProps) {
  // Quick Ledger Transaction State
  const [amountStr, setAmountStr] = useState('');
  const [itemNote, setItemNote] = useState('');

  // History Filter State
  const [historyFilter, setHistoryFilter] = useState<
    'all' | 'credit_sale' | 'payment' | 'sms_reminder'
  >('all');

  // Edit Details Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone);
  const [editCategory, setEditCategory] = useState<CustomerCategory>(
    customer.category
  );
  const [editPreferredLang, setEditPreferredLang] = useState<LanguageCode>(
    customer.preferredLang || appLang
  );
  const [editNotes, setEditNotes] = useState(customer.notes || '');
  const [savedBanner, setSavedBanner] = useState(false);

  // SMS Composer State
  const [smsLang, setSmsLang] = useState<LanguageCode>(
    customer.preferredLang || appLang
  );
  const [smsTone, setSmsTone] = useState<SMSTone>(
    customer.daysOverdue >= 7 ? 'urgent' : 'standard'
  );
  const [copiedSms, setCopiedSms] = useState(false);

  useEffect(() => {
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditCategory(customer.category);
    setEditPreferredLang(customer.preferredLang || appLang);
    setEditNotes(customer.notes || '');
    setSmsLang(customer.preferredLang || appLang);
    setSmsTone(customer.daysOverdue >= 7 ? 'urgent' : 'standard');
  }, [customer, appLang]);

  const repaymentRate = Math.min(
    100,
    Math.round(
      (customer.totalPaid / Math.max(1, customer.totalCreditExtended)) * 100
    )
  );

  const overduePct = Math.min(100, (customer.daysOverdue / 14) * 100);
  const statusColor =
    customer.daysOverdue >= 7
      ? '#E8453C'
      : customer.daysOverdue >= 3
      ? '#F4C84E'
      : '#74C2F6';

  const smsPreview = generateSMSText({
    customerName: customer.name,
    shopName,
    amountOwed: customer.owed,
    daysOverdue: customer.daysOverdue,
    lang: smsLang,
    tone: smsTone,
  });

  const filteredHistory = customer.history.filter((tx) => {
    if (historyFilter === 'all') return true;
    return tx.type === historyFilter;
  });

  const handleSaveDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateCustomer({
      id: customer.id,
      name: editName.trim(),
      phone: editPhone.trim() || '+27 72 000 0000',
      category: editCategory,
      preferredLang: editPreferredLang,
      notes: editNotes.trim(),
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
    setIsEditing(false);
  };

  const handleCopySms = () => {
    navigator.clipboard?.writeText(smsPreview).catch(() => {});
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="space-y-4"
    >
      {/* Top Profile Navigation & Identity Card */}
      <div className="bg-white/85 rounded-[44px] p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={onBack}
            className="min-h-[44px] px-4 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {tt('Customers', appLang)}</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsEditing((prev) => !prev)}
              className={`min-h-[44px] px-4 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
                isEditing
                  ? 'bg-[#DDF24E] text-[#13222B] font-semibold'
                  : 'bg-[#13222B] text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{tt('Edit details', appLang)}</span>
            </motion.button>
          </div>
        </div>

        {/* Customer Identity Header */}
        <div className="mt-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-16 h-16 rounded-full grid place-items-center font-fraunces font-semibold text-2xl text-[#13222B] shrink-0 shadow-sm"
              style={{ backgroundColor: customer.avatarColor }}
            >
              {customer.name[0]}
            </div>
            <div className="min-w-0">
              <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#13222B] truncate">
                {customer.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#78808A] mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[#13222B] font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#1F5F63]" />
                  {customer.phone}
                </span>
                <span aria-hidden="true">·</span>
                <span className="capitalize font-medium text-[#1F5F63]">
                  {customer.category} customer
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  SMS: {LANGUAGE_NAMES[customer.preferredLang || 'en'].label}
                </span>
                <span aria-hidden="true">·</span>
                <span>Last active {customer.lastPurchaseDate}</span>
              </div>
              {customer.notes && (
                <p className="text-xs text-[#78808A] mt-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#78808A] shrink-0" />
                  <span>{customer.notes}</span>
                </p>
              )}
            </div>
          </div>

          <StatusRing
            percent={customer.owed > 0 ? overduePct : 0}
            color={statusColor}
            label={customer.owed > 0 ? `${customer.daysOverdue}d` : '✓'}
          />
        </div>
      </div>

      {/* Main 2-Column Layout for Customer Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Total Credit Summary, Quick Ledger Actions, & Edit Details Form */}
        <div className="lg:col-span-5 space-y-4">
          {/* Total Credit & Repayment Metrics Card */}
          <div className="bg-white/85 rounded-[44px] p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-[#78808A]">
                  {tt('Owes you', appLang)} (Current Balance)
                </div>
                <div className="text-4xl sm:text-5xl text-[#13222B] my-1">
                  <DotMatrixCounter value={customer.owed} decimals={2} />
                </div>
                <div className="text-xs text-[#78808A]">
                  {customer.owed > 0
                    ? customer.daysOverdue >= 7
                      ? tt(`Late · ${customer.daysOverdue} days`, appLang)
                      : tt(`Owing · ${customer.daysOverdue} days`, appLang)
                    : tt('Settled', appLang)}
                </div>
              </div>
            </div>

            {/* 3-Metric Breakdown: Total Credit Extended, Total Paid, Visits */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-[#ECE8DE]">
              <div className="bg-[#F4F2EC] rounded-3xl p-3">
                <small className="text-[11px] text-[#78808A] block">
                  Total credit
                </small>
                <div className="font-doto font-bold text-lg text-[#13222B] mt-0.5">
                  {formatRand0(customer.totalCreditExtended)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-3xl p-3">
                <small className="text-[11px] text-[#78808A] block">
                  Total paid
                </small>
                <div className="font-doto font-bold text-lg text-[#1F5F63] mt-0.5">
                  {formatRand0(customer.totalPaid)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-3xl p-3">
                <small className="text-[11px] text-[#78808A] block">
                  Purchases
                </small>
                <div className="font-doto font-bold text-lg text-[#13222B] mt-0.5">
                  {customer.purchaseCount}x
                </div>
              </div>
            </div>

            {/* Repayment Spectrum Bar */}
            <div className="mt-8 mb-1">
              <div className="h-3 rounded-full bg-[#F4F2EC] relative">
                <motion.i
                  initial={{ width: 0 }}
                  animate={{ width: `${repaymentRate}%` }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  className="absolute inset-y-0 left-0 rounded-full block"
                  style={{
                    background:
                      'linear-gradient(90deg, #DDF24E, #74C2F6 30%, #F5B83D 62%, #E8453C)',
                  }}
                />
                <motion.span
                  initial={{ left: '0%' }}
                  animate={{ left: `${repaymentRate}%` }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  className="absolute -top-7 -translate-x-1/2 bg-[#0B0B0C] text-white rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                >
                  {repaymentRate}% repaid
                </motion.span>
              </div>
            </div>
          </div>

          {/* Edit Details Form Card (Always accessible & toggleable) */}
          <div className="bg-white/85 rounded-[44px] p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1F5F63]" />
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  {tt('Edit details', appLang)}
                </h3>
              </div>
              {savedBanner && (
                <span className="text-xs font-medium text-[#1F5F63] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveDetailsSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[#78808A] mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Customer full name"
                  className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#78808A] mb-1">
                  Phone Number (SMS & WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#78808A] absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full bg-[#F4F2EC] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-[#78808A] mb-1">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#F4F2EC] p-1 rounded-2xl">
                    {(['regular', 'new', 'vip'] as CustomerCategory[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditCategory(cat)}
                          className={`min-h-[36px] rounded-xl text-xs font-medium capitalize transition-colors ${
                            editCategory === cat
                              ? 'bg-[#13222B] text-white'
                              : 'text-[#78808A] hover:text-[#13222B]'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#78808A] mb-1">
                    SMS Language
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#F4F2EC] p-1 rounded-2xl">
                    {(['en', 'zu', 'st'] as LanguageCode[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setEditPreferredLang(l);
                          setSmsLang(l);
                        }}
                        className={`min-h-[36px] rounded-xl text-xs font-semibold uppercase transition-colors ${
                          editPreferredLang === l
                            ? 'bg-[#DDF24E] text-[#13222B]'
                            : 'text-[#78808A] hover:text-[#13222B]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#78808A] mb-1">
                  Shopkeeper Trust Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Pension payout 1st Tuesday of month"
                  className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="w-full min-h-[48px] rounded-full bg-[#13222B] text-white font-medium text-sm flex items-center justify-center gap-2 mt-1"
              >
                <Check className="w-4 h-4 text-[#DDF24E]" />
                <span>Save Contact Details</span>
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Column: Record Credit/Payment, Purchase History, & Multi-Language SMS */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Record Credit Sale / Payment Card */}
          <div className="bg-white/85 rounded-[44px] p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white space-y-3.5">
            <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
              Record sale or payment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="number"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder={tt('Amount in rand', appLang)}
                className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 font-doto text-xl font-bold text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
              />
              <input
                type="text"
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                placeholder="Items (e.g. Maize meal 5kg + Bread)"
                className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[20, 50, 100, 200].map((preset) => (
                <motion.button
                  key={preset}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setAmountStr(String(preset))}
                  className="px-3.5 py-1.5 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-doto font-bold text-[#13222B]"
                >
                  +R{preset}
                </motion.button>
              ))}
              {customer.owed > 0 && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setAmountStr(String(customer.owed))}
                  className="px-3.5 py-1.5 rounded-full bg-[#DDF24E] text-xs font-semibold text-[#13222B]"
                >
                  Settle Full {formatRand0(customer.owed)}
                </motion.button>
              )}
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
                      'credit_sale',
                      val,
                      itemNote.trim() || 'Shop credit purchase'
                    );
                    setAmountStr('');
                    setItemNote('');
                  }
                }}
                className="min-h-[48px] rounded-2xl bg-[#13222B] text-white text-sm font-medium px-4 py-3 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-[#DDF24E] shrink-0" />
                <span>{tt('Add credit sale', appLang)}</span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  const val = parseFloat(amountStr);
                  if (val > 0) {
                    onRecordTransaction(
                      customer.id,
                      'payment',
                      val,
                      itemNote.trim() || 'Cash payment received'
                    );
                    setAmountStr('');
                    setItemNote('');
                  }
                }}
                className="min-h-[48px] rounded-2xl bg-[#1F5F63] text-white text-sm font-medium px-4 py-3 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#DDF24E] shrink-0" />
                <span>{tt('Record payment', appLang)}</span>
              </motion.button>
            </div>
          </div>

          {/* Complete Purchase & Payment History Card */}
          <div className="bg-white/85 rounded-[44px] p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#1F5F63]" />
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  {tt('Purchase history', appLang)}
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-full flex-wrap">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'credit_sale', label: 'Credit' },
                    { id: 'payment', label: 'Payments' },
                    { id: 'sms_reminder', label: 'SMS' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      historyFilter === f.id
                        ? 'bg-[#13222B] text-white'
                        : 'text-[#78808A] hover:text-[#13222B]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 mt-4">
              <AnimatePresence initial={false}>
                {filteredHistory.length === 0 ? (
                  <p className="text-sm text-[#78808A] py-8 text-center">
                    No records match this filter.
                  </p>
                ) : (
                  filteredHistory.map((tx) => {
                    const isPayment = tx.type === 'payment';
                    const isSms = tx.type === 'sms_reminder';
                    return (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#F4F2EC] rounded-[24px] p-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${
                              isPayment
                                ? 'bg-[#BDEBE3] text-[#13222B]'
                                : isSms
                                ? 'bg-[#DDF24E] text-[#13222B]'
                                : 'bg-[#F6C4C0] text-[#13222B]'
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
                                ? 'Payment received'
                                : isSms
                                ? `SMS Reminder (${(
                                    tx.langUsed || 'en'
                                  ).toUpperCase()})`
                                : tx.productName || 'Credit purchase'}
                            </b>
                            <small className="text-xs text-[#78808A] block truncate">
                              {tx.date}
                              {tx.notes && tx.notes !== tx.productName
                                ? ` · ${tx.notes}`
                                : ''}
                            </small>
                          </div>
                        </div>

                        {!isSms && (
                          <span
                            className={`font-doto font-extrabold text-base shrink-0 ${
                              isPayment ? 'text-[#1F5F63]' : 'text-[#E8453C]'
                            }`}
                          >
                            {isPayment ? '-' : '+'}
                            {formatRand0(tx.amount)}
                          </span>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Multi-Language SMS Reminder Composer Card */}
          <div className="bg-white/85 rounded-[44px] p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1F5F63]" />
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  {tt('Send reminder SMS', appLang)}
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-full">
                {(['en', 'zu', 'st'] as LanguageCode[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSmsLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      smsLang === l
                        ? 'bg-[#13222B] text-white'
                        : 'text-[#78808A] hover:text-[#13222B]'
                    }`}
                  >
                    {LANGUAGE_NAMES[l].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'friendly', label: 'Warm & Polite' },
                  { id: 'standard', label: 'Standard' },
                  { id: 'urgent', label: 'Firm / Overdue' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSmsTone(t.id)}
                  className={`min-h-[38px] rounded-xl text-xs font-medium transition-colors ${
                    smsTone === t.id
                      ? 'bg-[#DDF24E] text-[#13222B] font-semibold'
                      : 'bg-[#F4F2EC] text-[#78808A] hover:text-[#13222B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="bg-[#F4F2EC] rounded-[24px] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#78808A]">
                <span>Recipient: {customer.phone}</span>
                <span className="flex items-center gap-1 text-[#1F5F63]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {LANGUAGE_NAMES[smsLang].label}
                </span>
              </div>
              <p className="text-sm text-[#13222B] leading-relaxed">
                “{smsPreview}”
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={handleCopySms}
                className="min-h-[48px] rounded-full bg-[#F4F2EC] text-[#13222B] text-sm font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedSms ? 'Copied!' : 'Copy SMS'}</span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() =>
                  onSendSMS(customer, smsLang, smsTone, smsPreview)
                }
                className="min-h-[48px] rounded-full bg-[#DDF24E] text-[#13222B] text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{tt('Send reminder SMS', appLang)}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
