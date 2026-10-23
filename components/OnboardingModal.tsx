"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LanguageCode, LANGUAGE_NAMES, tt } from "@/lib/bahi-data";
import { ThreeOnboardingScene } from "./ThreeOnboardingScene";
import { DecorativeShapes, DotMatrixCounter } from "./VisualCharts";

interface OnboardingModalProps {
  isOpen: boolean;
  lang: LanguageCode;
  theme?: "light" | "dark";
  ownerName: string;
  shopName: string;
  onSelectLanguage: (l: LanguageCode) => void;
  onComplete: (ownerName: string, shopName: string) => void;
}

export function OnboardingModal({
  isOpen,
  lang,
  theme = "light",
  ownerName,
  shopName,
  onSelectLanguage,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<number>(0);
  const [nameInput, setNameInput] = useState(ownerName);
  const [shopInput, setShopInput] = useState(shopName);

  if (!isOpen) return null;

  const isDark = theme === "dark";
  const shopSuggestions = ["Thandi’s Spaza", "Mama’s Duka", "Corner Tuck Shop", "Ubuntu General"];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(165deg, #07191C 0%, #123A3F 55%, #1E4E56 100%)"
          : "linear-gradient(165deg, #BDEBE3 0%, #E6F58B 55%, #F6C4C0 100%)",
      }}
    >
      {/* Background Architectural Shapes */}
      <DecorativeShapes className="absolute inset-0 z-0" />

      {/* Interactive Three.js 3D Scene */}
      <ThreeOnboardingScene
        step={step}
        theme={theme}
        className="absolute inset-x-0 top-0 h-[58vh] z-10"
      />

      {/* Top Progress Pill Indicator & Skip Button */}
      <div className="absolute top-6 inset-x-0 z-30 flex items-center justify-center px-5">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                step === i
                  ? isDark
                    ? "w-8 bg-[#DDF24E]"
                    : "w-8 bg-[#13222B]"
                  : isDark
                    ? "w-2.5 bg-white/30"
                    : "w-2.5 bg-[#13222B]/25"
              }`}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => onComplete(nameInput.trim() || ownerName, shopInput.trim() || shopName)}
          className="absolute right-5 px-4 py-2 rounded-full bg-white text-[#13222B] text-xs font-medium shadow-sm"
        >
          {tt("Skip", lang)}
        </motion.button>
      </div>

      {/* Bottom Sheet Card with Spring Entrance */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ y: 50, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative z-20 w-full max-w-[520px] mx-auto bg-white rounded-t-[44px] p-7 pb-9 shadow-[0_-20px_60px_-30px_rgba(19,60,60,0.5)]"
        >
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-fraunces text-3xl sm:text-4xl font-medium text-[#13222B] tracking-tight leading-tight">
                {tt("Welcome to BahiApp", lang)}
              </h2>
              <p className="text-sm text-[#78808A]">{tt("Choose your language", lang)}</p>
              <div className="space-y-2.5 pt-2">
                {(["en", "zu", "st"] as LanguageCode[]).map((l) => (
                  <motion.button
                    key={l}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      onSelectLanguage(l);
                      setStep(1);
                    }}
                    className="w-full flex items-center justify-between bg-[#F4F2EC] hover:bg-[#ECE8DE] rounded-full p-2 pr-5 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-11 h-11 rounded-full bg-[#DDF24E] grid place-items-center font-doto font-bold text-sm text-[#13222B]">
                        {l.toUpperCase()}
                      </span>
                      <div>
                        <b className="font-medium text-base text-[#13222B] block">
                          {LANGUAGE_NAMES[l].label}
                        </b>
                        <small className="text-xs text-[#78808A]">{LANGUAGE_NAMES[l].region}</small>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#1F5F63]">Select →</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3.5">
              <h2 className="font-fraunces text-3xl sm:text-4xl font-medium text-[#13222B] tracking-tight leading-tight">
                {tt("Tell us about your shop", lang)}
              </h2>
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={tt("Your name", lang)}
                  className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-4 text-base text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                />
                <input
                  type="text"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                  placeholder={tt("Shop name", lang)}
                  className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-4 text-base text-[#13222B] focus:outline-2 focus:outline-[#74C2F6]"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {shopSuggestions.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setShopInput(s)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                      shopInput === s
                        ? "bg-[#13222B] text-white"
                        : "bg-[#F4F2EC] text-[#13222B] hover:bg-[#ECE8DE]"
                    }`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                className="w-full min-h-[52px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-base shadow-[0_14px_30px_-14px_rgba(130,160,0,0.8)] mt-3"
              >
                {tt("Continue", lang)}
              </motion.button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-fraunces text-3xl sm:text-4xl font-medium text-[#13222B] tracking-tight leading-tight">
                {tt("How BahiApp works", lang)}
              </h2>
              <div className="space-y-2">
                <div className="bg-[#F4F2EC] rounded-[24px] p-3.5">
                  <b className="font-medium text-sm text-[#13222B] block">
                    {tt("Works without data", lang)}
                  </b>
                  <small className="text-xs text-[#78808A]">
                    {tt("Everything saves on your phone and syncs later.", lang)}
                  </small>
                </div>
                <div className="bg-[#F4F2EC] rounded-[24px] p-3.5">
                  <b className="font-medium text-sm text-[#13222B] block">
                    {tt("Your credit book", lang)}
                  </b>
                  <small className="text-xs text-[#78808A]">
                    {tt("See who owes you, and for how long.", lang)}
                  </small>
                </div>
                <div className="bg-[#F4F2EC] rounded-[24px] p-3.5">
                  <b className="font-medium text-sm text-[#13222B] block">
                    {tt("Friendly reminders", lang)}
                  </b>
                  <small className="text-xs text-[#78808A]">
                    {tt("Automatic SMS to late customers.", lang)}
                  </small>
                </div>
                <div className="bg-[#F4F2EC] rounded-[24px] p-3.5 flex items-center justify-between">
                  <div>
                    <small className="text-xs text-[#78808A] block">{tt("Collected", lang)}</small>
                    <div className="text-3xl text-[#13222B]">
                      <DotMatrixCounter value={3120} />
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-[#1F5F63]">
                    65% recovery rate
                  </span>
                </div>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  onComplete(nameInput.trim() || ownerName, shopInput.trim() || shopName)
                }
                className="w-full min-h-[52px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-base shadow-[0_14px_30px_-14px_rgba(130,160,0,0.8)] mt-3"
              >
                {tt("Open my shop", lang)}
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
