'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  Plus,
  X,
} from 'lucide-react';
import {
  Customer,
  CustomerCategory,
  CustomerTag,
  LanguageCode,
  LANGUAGE_NAMES,
  PRESET_CUSTOMER_TAGS,
  SMSTone,
  TAG_COLOR_SWATCHES,
  formatRand0,
  generateSMSText,
  tt,
} from '@/lib/bahi-data';
import { DotMatrixCounter, StatusRing } from './VisualCharts';

interface CustomerProfileScreenProps {
  customer: Customer;
  shopName: string;
  appLang: LanguageCode;
  initialEditing?: boolean;
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
    tags?: CustomerTag[];
  }) => void;
}

export function CustomerProfileScreen({
  customer,
  shopName,
  appLang,
  initialEditing = false,
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

  // Edit Details & Custom Tags State
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [showTagDrawer, setShowTagDrawer] = useState(false);
  const editCardRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [editName, setEditName] = useState(customer.name);
  const [editPhone, setEditPhone] = useState(customer.phone);
  const [editCategory, setEditCategory] = useState<CustomerCategory>(
    customer.category
  );
  const [editPreferredLang, setEditPreferredLang] = useState<LanguageCode>(
    customer.preferredLang || appLang
  );
  const [editNotes, setEditNotes] = useState(customer.notes || '');
  const [editTags, setEditTags] = useState<CustomerTag[]>(customer.tags || []);
  const [customTagLabel, setCustomTagLabel] = useState('');
  const [customTagColor, setCustomTagColor] = useState<string>(
    TAG_COLOR_SWATCHES[0].hex
  );
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
    setEditTags(customer.tags || []);
    setSmsLang(customer.preferredLang || appLang);
    setSmsTone(customer.daysOverdue >= 7 ? 'urgent' : 'standard');
  }, [customer, appLang]);

  useEffect(() => {
    if (initialEditing) {
      setIsEditing(true);
      const timer = setTimeout(() => {
        editCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        nameInputRef.current?.focus();
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [initialEditing, customer.id]);

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

  // Immediately persist updated tags to the customer record
  const syncCustomerTags = (nextTags: CustomerTag[]) => {
    setEditTags(nextTags);
    onUpdateCustomer({
      id: customer.id,
      name: editName.trim() || customer.name,
      phone: editPhone.trim() || customer.phone,
      category: editCategory,
      preferredLang: editPreferredLang,
      notes: editNotes.trim(),
      tags: nextTags,
    });
  };

  const handleTogglePresetTag = (preset: { label: string; color: string }) => {
    const exists = editTags.some(
      (t) => t.label.toLowerCase() === preset.label.toLowerCase()
    );
    const nextTags = exists
      ? editTags.filter(
          (t) => t.label.toLowerCase() !== preset.label.toLowerCase()
        )
      : [
          ...editTags,
          {
            id: `tag-${preset.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            label: preset.label,
            color: preset.color,
          },
        ];
    syncCustomerTags(nextTags);
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTagLabel.trim();
    if (!clean) return;
    const duplicate = editTags.some(
      (t) => t.label.toLowerCase() === clean.toLowerCase()
    );
    if (duplicate) {
      setCustomTagLabel('');
      return;
    }
    const newTag: CustomerTag = {
      id: `tag-custom-${Date.now()}`,
      label: clean,
      color: customTagColor,
    };
    syncCustomerTags([...editTags, newTag]);
    setCustomTagLabel('');
  };

  const handleRemoveTag = (tagId: string) => {
    syncCustomerTags(editTags.filter((t) => t.id !== tagId));
  };

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
      tags: editTags,
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
      {/* Top Profile Navigation, Identity & Color-Coded Tags Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <motion.button
            type="button"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={onBack}
            className="min-h-[42px] px-4 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {tt('Customers', appLang)}</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowTagDrawer((prev) => !prev)}
              className={`min-h-[42px] px-4 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showTagDrawer
                  ? 'bg-[#DDF24E] text-[#13222B] font-semibold'
                  : 'bg-[#F4F2EC] hover:bg-[#ECE8DE] text-[#13222B]'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#1F5F63]" />
              <span>Tags ({editTags.length})</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setIsEditing((prev) => {
                  const next = !prev;
                  if (next) {
                    setTimeout(() => {
                      editCardRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                      nameInputRef.current?.focus();
                    }, 80);
                  }
                  return next;
                });
              }}
              className={`min-h-[42px] px-4 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
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
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full grid place-items-center font-fraunces font-semibold text-2xl text-[#13222B] shrink-0 shadow-sm"
              style={{ backgroundColor: customer.avatarColor }}
            >
              {customer.name[0]}
            </motion.div>
            <div className="min-w-0">
              <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#13222B] leading-tight">
                {customer.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#78808A] mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#F4F2EC] px-2.5 py-1 rounded-full text-[#13222B] font-mono tabular-nums font-medium">
                  <Phone className="w-3 h-3 text-[#1F5F63]" />
                  {customer.phone}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F4F2EC] capitalize font-medium text-[#1F5F63]">
                  {customer.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F4F2EC] text-[#78808A]">
                  SMS: {LANGUAGE_NAMES[customer.preferredLang || 'en'].label}
                </span>
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

        {/* Active Color-Coded Customer Tags Row */}
        <div className="mt-4 pt-3.5 border-t border-[#ECE8DE] flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#78808A] flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#1F5F63]" />
            <span>Tags:</span>
          </span>
          <AnimatePresence initial={false}>
            {editTags.map((tag) => (
              <motion.span
                key={tag.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                style={{ backgroundColor: tag.color }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#13222B] shadow-2xs"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="w-4 h-4 rounded-full bg-black/10 hover:bg-black/20 grid place-items-center transition-colors"
                  aria-label={`Remove ${tag.label} tag`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowTagDrawer((prev) => !prev)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#1F5F63]" />
            <span>{showTagDrawer ? 'Done' : 'Add tag'}</span>
          </motion.button>
        </div>

        {/* Expandable Quick Color-Coded Tag Builder Drawer */}
        <AnimatePresence>
          {showTagDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="mt-3.5 bg-[#F4F2EC] rounded-[28px] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#13222B]">
                    Quick Preset Tags (Tap to toggle)
                  </span>
                  <span className="text-[11px] text-[#78808A]">
                    Saved automatically
                  </span>
                </div>

                {/* Preset Color-Coded Tag Pills */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_CUSTOMER_TAGS.map((preset) => {
                    const isApplied = editTags.some(
                      (t) =>
                        t.label.toLowerCase() === preset.label.toLowerCase()
                    );
                    return (
                      <motion.button
                        key={preset.label}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => handleTogglePresetTag(preset)}
                        style={{
                          backgroundColor: isApplied ? preset.color : undefined,
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                          isApplied
                            ? 'text-[#13222B] font-semibold ring-2 ring-[#13222B]/30 shadow-xs'
                            : 'bg-white text-[#13222B] hover:bg-[#ECE8DE]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span>{preset.label}</span>
                        {isApplied && <Check className="w-3 h-3" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Custom Tag Name + Color Swatch Picker */}
                <form
                  onSubmit={handleAddCustomTag}
                  className="pt-2 border-t border-[#ECE8DE] space-y-2.5"
                >
                  <label className="block text-xs font-medium text-[#13222B]">
                    Create Custom Color-Coded Tag
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      value={customTagLabel}
                      onChange={(e) => setCustomTagLabel(e.target.value)}
                      placeholder="Custom tag (e.g. Trusted, Month-End, VIP)..."
                      className="flex-1 bg-white rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                    />
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-2xl">
                        {TAG_COLOR_SWATCHES.map((swatch) => {
                          const selected = customTagColor === swatch.hex;
                          return (
                            <button
                              key={swatch.hex}
                              type="button"
                              onClick={() => setCustomTagColor(swatch.hex)}
                              aria-label={`Select ${swatch.name} tag color`}
                              title={swatch.name}
                              style={{ backgroundColor: swatch.hex }}
                              className={`w-6 h-6 rounded-full transition-transform ${
                                selected
                                  ? 'scale-115 ring-2 ring-[#13222B]'
                                  : 'opacity-80 hover:opacity-100'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.94 }}
                        className="min-h-[38px] px-4 rounded-2xl bg-[#13222B] text-white text-xs font-medium flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#DDF24E]" />
                        <span>Add Tag</span>
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main 2-Column Layout for Customer Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Total Credit Summary & Edit Details Form */}
        <div className="lg:col-span-5 space-y-4">
          {/* Total Credit & Repayment Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
          >
            <div>
              <div className="text-sm text-[#78808A]">
                {tt('Owes you', appLang)} (Current Balance)
              </div>
              <div className="text-4xl sm:text-5xl text-[#13222B] my-1.5">
                <DotMatrixCounter value={customer.owed} decimals={2} />
              </div>
              <div className="text-xs text-[#78808A]">
                {customer.owed > 0
                  ? customer.daysOverdue >= 7
                    ? tt(`Late · ${customer.daysOverdue} days`, appLang)
                    : tt(`Owing · ${customer.daysOverdue} days`, appLang)
                  : tt('Settled', appLang)}{' '}
                · Last active {customer.lastPurchaseDate}
              </div>
            </div>

            {/* 3-Metric Breakdown: Total Credit Extended, Total Paid, Visits */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-5 pt-4 border-t border-[#ECE8DE]">
              <div className="bg-[#F4F2EC] rounded-2xl sm:rounded-3xl p-3">
                <small className="text-[11px] text-[#78808A] block truncate">
                  Total credit
                </small>
                <div className="font-mono font-bold tabular-nums text-base sm:text-lg text-[#13222B] mt-0.5">
                  {formatRand0(customer.totalCreditExtended)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-2xl sm:rounded-3xl p-3">
                <small className="text-[11px] text-[#78808A] block truncate">
                  Total paid
                </small>
                <div className="font-mono font-bold tabular-nums text-base sm:text-lg text-[#1F5F63] mt-0.5">
                  {formatRand0(customer.totalPaid)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-2xl sm:rounded-3xl p-3">
                <small className="text-[11px] text-[#78808A] block truncate">
                  Purchases
                </small>
                <div className="font-mono font-bold tabular-nums text-base sm:text-lg text-[#13222B] mt-0.5">
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
                  className="absolute -top-7 -translate-x-1/2 bg-[#0B0B0C] text-white rounded-full px-2.5 py-0.5 text-[11px] font-mono tabular-nums font-semibold whitespace-nowrap"
                >
                  {repaymentRate}% repaid
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Edit Details & Custom Color-Coded Tags Form Card */}
          <motion.div
            ref={editCardRef}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border transition-all ${
              isEditing
                ? 'border-[#2997FF] ring-2 ring-[#2997FF]/35'
                : 'border-white'
            }`}
          >
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

            <form onSubmit={handleSaveDetailsSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#78808A] mb-1">
                  Customer Full Name
                </label>
                <input
                  ref={nameInputRef}
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
                    className="w-full bg-[#F4F2EC] rounded-2xl pl-10 pr-4 py-3 text-sm font-mono tabular-nums text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                  />
                </div>
              </div>

              {/* Stacked on mobile so 6 buttons never squash horizontally */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#78808A] mb-1.5">
                    Customer Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#F4F2EC] p-1 rounded-2xl">
                    {(['regular', 'new', 'vip'] as CustomerCategory[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditCategory(cat)}
                          className={`min-h-[38px] rounded-xl text-xs font-medium capitalize transition-colors ${
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
                  <label className="block text-xs text-[#78808A] mb-1.5">
                    SMS Language
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#F4F2EC] p-1 rounded-2xl">
                    {(['en', 'zu', 'st'] as LanguageCode[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setEditPreferredLang(l);
                          setSmsLang(l);
                        }}
                        className={`min-h-[38px] rounded-xl text-xs font-mono font-semibold uppercase transition-colors ${
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

              {/* Custom Color-Coded Tags Section inside Edit Details Form */}
              <div className="bg-[#F4F2EC] rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#13222B] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#1F5F63]" />
                    <span>Color-Coded Customer Tags</span>
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-[#78808A]">
                    {editTags.length} active
                  </span>
                </div>

                {/* Preset Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CUSTOMER_TAGS.map((preset) => {
                    const isApplied = editTags.some(
                      (t) =>
                        t.label.toLowerCase() === preset.label.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleTogglePresetTag(preset)}
                        style={{
                          backgroundColor: isApplied ? preset.color : undefined,
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                          isApplied
                            ? 'text-[#13222B] font-semibold ring-1 ring-[#13222B]/30'
                            : 'bg-white text-[#78808A] hover:text-[#13222B]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input + Swatches */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customTagLabel}
                      onChange={(e) => setCustomTagLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Add custom tag (e.g. Trusted)..."
                      className="flex-1 bg-white rounded-xl px-3 py-2 text-xs text-[#13222B] focus:outline-2 focus:outline-[#74C2F6] min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomTag()}
                      className="px-3 py-2 rounded-xl bg-[#13222B] text-white text-xs font-medium shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#DDF24E]" />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#78808A]">
                      Tag color:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {TAG_COLOR_SWATCHES.map((swatch) => {
                        const selected = customTagColor === swatch.hex;
                        return (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setCustomTagColor(swatch.hex)}
                            aria-label={`Color ${swatch.name}`}
                            style={{ backgroundColor: swatch.hex }}
                            className={`w-5 h-5 rounded-full transition-transform ${
                              selected
                                ? 'scale-115 ring-2 ring-[#13222B]'
                                : 'opacity-75 hover:opacity-100'
                            }`}
                          />
                        );
                      })}
                    </div>
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
          </motion.div>
        </div>

        {/* Right Column: Record Credit/Payment, Purchase History, & Multi-Language SMS */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Record Credit Sale / Payment Card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white space-y-3.5"
          >
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
                className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 font-mono tabular-nums text-xl font-bold text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
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
                  className="px-3.5 py-2 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-mono tabular-nums font-bold text-[#13222B]"
                >
                  +R{preset}
                </motion.button>
              ))}
              {customer.owed > 0 && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setAmountStr(String(customer.owed))}
                  className="px-3.5 py-2 rounded-full bg-[#DDF24E] text-xs font-semibold text-[#13222B]"
                >
                  Settle Full{' '}
                  <span className="font-mono tabular-nums">
                    {formatRand0(customer.owed)}
                  </span>
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
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
          </motion.div>

          {/* Complete Purchase & Payment History Card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#1F5F63]" />
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  {tt('Purchase history', appLang)}
                </h3>
              </div>

              <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-full w-full sm:w-auto">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'credit_sale', label: 'Credit' },
                    { id: 'payment', label: 'Paid' },
                    { id: 'sms_reminder', label: 'SMS' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-center ${
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
                            className={`font-mono font-extrabold tabular-nums text-base shrink-0 ${
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
          </motion.div>

          {/* Multi-Language SMS Reminder Composer Card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1F5F63]" />
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  {tt('Send reminder SMS', appLang)}
                </h3>
              </div>
              <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-full w-full sm:w-auto">
                {(['en', 'zu', 'st'] as LanguageCode[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSmsLang(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors text-center ${
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
                  { id: 'urgent', label: 'Firm / Late' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSmsTone(t.id)}
                  className={`min-h-[40px] rounded-xl text-xs font-medium px-2 transition-colors ${
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
              <div className="flex items-center justify-between text-xs text-[#78808A] flex-wrap gap-1">
                <span>
                  Recipient:{' '}
                  <span className="font-mono tabular-nums">
                    {customer.phone}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[#1F5F63]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {LANGUAGE_NAMES[smsLang].label}
                </span>
              </div>
              <p className="text-sm text-[#13222B] leading-relaxed">
                “{smsPreview}”
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
