'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Store,
  Globe,
  Wifi,
  WifiOff,
  Sparkles,
  Printer,
  Check,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import {
  BahiState,
  LanguageCode,
  LANGUAGE_NAMES,
  tt,
} from '@/lib/bahi-data';
import { PWAInstallBanner } from './PWAInstallBanner';

interface SettingsModalProps {
  isOpen: boolean;
  state: BahiState;
  onClose: () => void;
  onUpdateShopDetails: (ownerName: string, shopName: string) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onToggleTheme: (theme: 'light' | 'dark') => void;
  onToggleSync: () => void;
  onLaunchOnboarding: () => void;
  onOpenBrandPoster: () => void;
  onOpenLegalPrivacy: () => void;
  onResetDemoData: () => void;
}

export function SettingsModal({
  isOpen,
  state,
  onClose,
  onUpdateShopDetails,
  onSelectLanguage,
  onToggleTheme,
  onToggleSync,
  onLaunchOnboarding,
  onOpenBrandPoster,
  onOpenLegalPrivacy,
  onResetDemoData,
}: SettingsModalProps) {
  const [ownerInput, setOwnerInput] = useState(state.ownerName);
  const [shopInput, setShopInput] = useState(state.shopName);
  const [savedShop, setSavedShop] = useState(false);

  useEffect(() => {
    setOwnerInput(state.ownerName);
    setShopInput(state.shopName);
  }, [state.ownerName, state.shopName, isOpen]);

  if (!isOpen) return null;

  const currentTheme = state.theme || 'light';

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShopDetails(
      ownerInput.trim() || 'Thandi',
      shopInput.trim() || 'Thandi’s Spaza'
    );
    setSavedShop(true);
    setTimeout(() => setSavedShop(false), 1800);
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
            initial={{ y: '100%', scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="bg-white w-full max-w-[480px] rounded-t-[42px] sm:rounded-[42px] p-6 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="w-10 h-1.5 bg-[#ECE8DE] rounded-full mx-auto mb-1 sm:hidden" />

            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-fraunces text-2xl font-medium text-[#13222B]">
                  Shop Settings
                </h2>
                <p className="text-xs text-[#78808A]">
                  Theme, language, shop identity & offline sync
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] rounded-full bg-[#F4F2EC] grid place-items-center text-[#13222B] hover:bg-[#ECE8DE]"
                aria-label="Close Settings"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* 1. Theme Appearance Switcher (Light vs High-Contrast Dark Mode) */}
            <div className="bg-[#F4F2EC] rounded-[28px] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#13222B] flex items-center gap-1.5">
                  {currentTheme === 'dark' ? (
                    <Moon className="w-4 h-4 text-[#DDF24E]" />
                  ) : (
                    <Sun className="w-4 h-4 text-[#1F5F63]" />
                  )}
                  Appearance & Contrast
                </span>
                <span className="text-[11px] text-[#78808A]">
                  Daylight or Night Till
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onToggleTheme('light')}
                  className={`min-h-[44px] rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    currentTheme === 'light'
                      ? 'bg-[#13222B] text-white shadow-sm'
                      : 'bg-white text-[#13222B] hover:bg-[#ECE8DE]'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Warm Paper (Light)</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onToggleTheme('dark')}
                  className={`min-h-[44px] rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-[#DDF24E] text-[#13222B] shadow-sm'
                      : 'bg-white text-[#13222B] hover:bg-[#ECE8DE]'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>High-Contrast Dark</span>
                </motion.button>
              </div>
            </div>

            {/* 2. Language Switcher */}
            <div className="bg-[#F4F2EC] rounded-[28px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#13222B] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#1F5F63]" />
                  {tt('Choose your language', state.lang)}
                </span>
                <span className="text-[11px] text-[#78808A]">
                  UI & SMS Reminders
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['en', 'zu', 'st'] as LanguageCode[]).map((l) => {
                  const active = state.lang === l;
                  return (
                    <motion.button
                      key={l}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectLanguage(l)}
                      className={`p-3 rounded-2xl text-left transition-all ${
                        active
                          ? 'bg-[#13222B] text-white shadow-sm'
                          : 'bg-white text-[#13222B] hover:bg-[#ECE8DE]'
                      }`}
                    >
                      <div
                        className={`font-doto font-bold text-xs ${
                          active ? 'text-[#DDF24E]' : 'text-[#78808A]'
                        }`}
                      >
                        {l.toUpperCase()}
                      </div>
                      <div className="font-medium text-sm mt-0.5">
                        {LANGUAGE_NAMES[l].label}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 3. Offline-First Sync Control */}
            <div className="bg-[#F4F2EC] rounded-[28px] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${
                    state.online
                      ? 'bg-[#5BD16B]/20 text-[#1F5F63]'
                      : 'bg-[#F4C84E]/30 text-[#13222B]'
                  }`}
                >
                  {state.online ? (
                    <Wifi className="w-5 h-5" />
                  ) : (
                    <WifiOff className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <b className="text-sm font-medium text-[#13222B] block">
                    {state.online
                      ? tt('Synced', state.lang)
                      : tt(
                          `Offline · ${state.syncQueue} queued`,
                          state.lang
                        )}
                  </b>
                  <small className="text-xs text-[#78808A] block">
                    {state.online
                      ? 'Connected · Tap to simulate offline mode'
                      : 'Saving locally on device · Tap to reconnect & sync'}
                  </small>
                </div>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={onToggleSync}
                className={`min-h-[42px] px-4 rounded-full text-xs font-semibold shrink-0 ${
                  state.online
                    ? 'bg-white text-[#13222B]'
                    : 'bg-[#DDF24E] text-[#13222B]'
                }`}
              >
                {state.online ? 'Go Offline' : 'Sync Now'}
              </motion.button>
            </div>

            {/* 4. Shop & Owner Profile Form */}
            <form
              onSubmit={handleSaveShop}
              className="bg-[#F4F2EC] rounded-[28px] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#13222B] flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#1F5F63]" />
                  {tt('Tell us about your shop', state.lang)}
                </span>
                {savedShop && (
                  <span className="text-xs font-medium text-[#1F5F63] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Updated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-[#78808A] mb-1">
                    {tt('Your name', state.lang)}
                  </label>
                  <input
                    type="text"
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    placeholder="Thandi"
                    className="w-full bg-white rounded-xl px-3.5 py-2.5 text-sm text-[#13222B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#78808A] mb-1">
                    {tt('Shop name', state.lang)}
                  </label>
                  <input
                    type="text"
                    value={shopInput}
                    onChange={(e) => setShopInput(e.target.value)}
                    placeholder="Thandi’s Spaza"
                    className="w-full bg-white rounded-xl px-3.5 py-2.5 text-sm text-[#13222B]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['Thandi’s Spaza', 'Mama’s Duka', 'Corner Tuck Shop'].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setShopInput(preset)}
                      className="px-3 py-1 rounded-full bg-white text-[11px] text-[#78808A] hover:text-[#13222B]"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="w-full min-h-[44px] rounded-full bg-[#13222B] text-white text-xs font-medium"
              >
                Save Shop Details
              </motion.button>
            </form>

            {/* 5. Quick Actions: 3D Onboarding, Window Poster, PWA Install, Reset Demo Data */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    onLaunchOnboarding();
                  }}
                  className="min-h-[48px] rounded-2xl bg-[#F4F2EC] hover:bg-[#ECE8DE] text-[#13222B] text-xs font-medium px-3.5 py-2.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#1F5F63]" />
                  <span>3D Onboarding</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    onOpenBrandPoster();
                  }}
                  className="min-h-[48px] rounded-2xl bg-[#F4F2EC] hover:bg-[#ECE8DE] text-[#13222B] text-xs font-medium px-3.5 py-2.5 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-[#1F5F63]" />
                  <span>{tt('Window poster', state.lang)}</span>
                </motion.button>
              </div>

              {/* Legal, Privacy & Data Usage Policy Trigger */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  onOpenLegalPrivacy();
                }}
                className="w-full min-h-[46px] rounded-2xl bg-[#F4F2EC] hover:bg-[#ECE8DE] text-[#13222B] text-xs font-medium px-4 py-2.5 flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1F5F63]" />
                  <span>Data Usage, POPIA Privacy & Legal Terms</span>
                </span>
                <span className="text-[11px] font-mono text-[#78808A]">
                  NCA · POPIA
                </span>
              </motion.button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <PWAInstallBanner />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onResetDemoData();
                    onClose();
                  }}
                  className="min-h-[40px] px-4 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#78808A] hover:text-[#13222B] flex items-center gap-1.5 ml-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
