"use client";

import React, { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { formatRand0 } from "@/lib/bahi-data";

// Reworked BahiApp Brand Logo (Inspired directly by IMG_5832: layered translucent glass pages, frosted spine & smooth multi-stop spectrum mesh gradient)
export function BahiBrandLogo({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const backId = `bahiBack_${uid}`;
  const mainId = `bahiMain_${uid}`;
  const glowId = `bahiGlow_${uid}`;
  const spineId = `bahiSpine_${uid}`;
  const specId = `bahiSpec_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Tilted translucent back page (inspired by Calendar/Slides in IMG_5832) */}
        <linearGradient id={backId} x1="16" y1="6" x2="54" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#74C2F6" />
          <stop offset="100%" stopColor="#2CE59B" />
        </linearGradient>

        {/* Main spectrum mesh gradient (inspired by G/M smooth multi-hue transition in IMG_5832) */}
        <linearGradient id={mainId} x1="12" y1="12" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2997FF" />
          <stop offset="28%" stopColor="#28E08C" />
          <stop offset="56%" stopColor="#DDF24E" />
          <stop offset="80%" stopColor="#FFB024" />
          <stop offset="100%" stopColor="#FF4B4B" />
        </linearGradient>

        {/* Soft warm radial glow in bottom-right corner */}
        <radialGradient id={glowId} cx="0.82" cy="0.82" r="0.65">
          <stop offset="0%" stopColor="#FF4B4B" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#FFB024" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2997FF" stopOpacity="0" />
        </radialGradient>

        {/* Frosted translucent left spine (inspired by Wallet/Docs fold in IMG_5832) */}
        <linearGradient id={spineId} x1="15" y1="8" x2="15" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#DDF0FF" />
          <stop offset="100%" stopColor="#7CC4FF" />
        </linearGradient>

        {/* Top inner specular highlight */}
        <linearGradient id={specId} x1="32" y1="12" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Tilted back ledger sheet */}
      <rect
        x="18"
        y="7"
        width="37"
        height="39"
        rx="12"
        transform="rotate(-8 36 26)"
        fill={`url(#${backId})`}
        opacity="0.82"
      />

      {/* Main spectrum rounded ledger card */}
      <rect x="12" y="13" width="43" height="43" rx="14" fill={`url(#${mainId})`} />
      <rect x="12" y="13" width="43" height="43" rx="14" fill={`url(#${glowId})`} />
      <rect x="12" y="13" width="43" height="22" rx="14" fill={`url(#${specId})`} />

      {/* Lowercase 'b' frosted-glass spine on left */}
      <rect x="9" y="8" width="13.5" height="48" rx="6.75" fill={`url(#${spineId})`} />

      {/* Crisp white 'b' coin bowl inside card */}
      <circle cx="35.5" cy="35.5" r="9.5" stroke="#FFFFFF" strokeWidth="4.4" />

      {/* Luminous status coin pip in bottom-right (like Wallet/Meet dot in IMG_5832) */}
      <circle cx="48" cy="48" r="2.7" fill="#FFFFFF" />
    </svg>
  );
}

// Animated Monospace Number Counter with Signature Grey Cents (from inspiration photos)
export function DotMatrixCounter({
  value,
  prefix = "R",
  decimals = 0,
  className = "",
}: {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    let frameId: number;
    const startVal = displayVal;
    const diff = value - startVal;
    if (Math.abs(diff) < 0.01) {
      setDisplayVal(value);
      return;
    }
    const duration = 680;
    const startTime = performance.now();

    const step = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayVal(startVal + diff * eased);
      if (p < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (decimals > 0) {
    const [whole, cents] = displayVal.toFixed(decimals).split(".");
    return (
      <span
        className={`font-mono font-extrabold tracking-tight tabular-nums inline-flex items-baseline ${className}`}
      >
        <span>
          {prefix}
          {Number(whole).toLocaleString("en-US")}
        </span>
        <span className="text-[0.62em] font-semibold text-[#78808A] ml-0.5">.{cents}</span>
      </span>
    );
  }

  return (
    <span className={`font-mono font-extrabold tracking-tight tabular-nums ${className}`}>
      {prefix}
      {Math.round(displayVal).toLocaleString("en-US")}
    </span>
  );
}

// Interactive Pixel-Block Spectrum Chart from the inspiration photos
export function PixelBlockChart() {
  const heights = [2, 3, 2, 4, 3, 5, 4];
  const colors = ["#74C2F6", "#74C2F6", "#F4C84E", "#74C2F6", "#8FA9F2", "#F07CA0", "#E8453C"];

  return (
    <div
      className="flex items-end gap-1.5 h-16 shrink-0 bg-[#F4F2EC] px-3 py-2.5 rounded-2xl"
      aria-hidden="true"
    >
      {heights.map((h, colIdx) => (
        <div key={colIdx} className="flex flex-col-reverse gap-1">
          {Array.from({ length: h }).map((_, rowIdx) => (
            <motion.i
              key={rowIdx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 - rowIdx * 0.14 }}
              whileHover={{ scale: 1.2 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 20,
                delay: colIdx * 0.04 + rowIdx * 0.03,
              }}
              className="block w-3 h-2.5 rounded-[3px]"
              style={{ backgroundColor: colors[colIdx] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Smooth cubic-bezier sales wave chart with interactive spring points (Theme-Aware)
export function SalesWaveChart({ values, labels }: { values: number[]; labels: string[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(values.length - 1);
  const maxVal = Math.max(...values, 1000) * 1.12;

  const points = values.map((v, i) => [
    i * (300 / Math.max(1, values.length - 1)) + 8,
    72 - (v / maxVal) * 56,
  ]);

  let pathD = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const ctrlX = (prev[0] + curr[0]) / 2;
    pathD += ` C ${ctrlX} ${prev[1]}, ${ctrlX} ${curr[1]}, ${curr[0]} ${curr[1]}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1][0]} 82 L ${points[0][0]} 82 Z`;

  return (
    <div className="mt-4 select-none">
      <div className="relative">
        <svg className="w-full h-auto overflow-visible block" viewBox="0 0 316 90">
          <defs>
            <linearGradient id="waveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DDF24E" stopOpacity="0.48" />
              <stop offset="65%" stopColor="#74C2F6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#DDF24E" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Subtle reference grid lines */}
          {[26, 53, 80].map((yLine) => (
            <line
              key={yLine}
              x1="4"
              x2="312"
              y1={yLine}
              y2={yLine}
              stroke="var(--mut)"
              strokeOpacity={yLine === 80 ? "0.55" : "0.18"}
              strokeDasharray={yLine === 80 ? "1 6" : "2 6"}
              strokeLinecap="round"
            />
          ))}
          <path d={areaD} fill="url(#waveAreaGrad)" />
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.95, ease: "easeOut" }}
          />
          {points.map((p, i) => {
            const isSelected = activeIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => setActiveIdx(i)}
                onPointerEnter={() => setActiveIdx(i)}
              >
                <circle cx={p[0]} cy={p[1]} r="14" fill="transparent" />
                {isSelected && (
                  <circle cx={p[0]} cy={p[1]} r="10" fill="#DDF24E" fillOpacity="0.35" />
                )}
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={isSelected ? 6.5 : i % 2 ? 4.8 : 4}
                  fill={isSelected || i % 2 ? "#DDF24E" : "var(--card)"}
                  stroke="var(--ink)"
                  strokeWidth={isSelected ? "2.4" : "1.7"}
                />
              </g>
            );
          })}
        </svg>
        {activeIdx !== null && values[activeIdx] !== undefined && (
          <div className="flex items-center justify-between text-xs text-[#78808A] mt-2 px-3 py-2 rounded-2xl bg-[#F4F2EC]">
            <span>
              Day: <strong className="text-[#13222B]">{labels[activeIdx]}</strong>
            </span>
            <span className="font-mono font-bold tabular-nums text-[#13222B] text-sm">
              {formatRand0(values[activeIdx])}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#78808A] mt-2 px-1">
        {labels.map((label, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`px-1.5 py-0.5 rounded-lg transition-colors ${
              activeIdx === idx ? "bg-[#DDF24E] text-[#13222B] font-bold" : "hover:text-[#13222B]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Half-circle credit gauge with spring-animated pointer (Theme-Aware)
export function CreditHalfGauge({
  percent,
  collectedLabel,
  collectedAmount,
}: {
  percent: number;
  collectedLabel: string;
  collectedAmount: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className="relative w-[228px] h-[116px] mx-auto mt-4 overflow-hidden"
      style={{ "--p": clamped } as React.CSSProperties}
    >
      <div
        className="absolute inset-x-0 top-0 -bottom-[116px] rounded-full"
        style={{
          background: `conic-gradient(from 270deg, #74C2F6 0deg, #DDF24E ${
            clamped * 0.65
          }deg, #F5B83D ${clamped * 1.25}deg, #E8453C ${
            clamped * 1.8
          }deg, var(--ln) 0deg 180deg, transparent 0deg)`,
        }}
      />
      <div
        className="absolute w-[148px] h-[148px] left-[40px] top-[40px] rounded-full transition-colors"
        style={{ backgroundColor: "var(--card)" }}
      />
      <div className="absolute z-10 inset-x-0 bottom-1.5 text-center">
        <div className="text-xs text-[#78808A]">{collectedLabel}</div>
        <b className="font-mono font-extrabold tabular-nums text-2xl text-[#13222B]">
          {collectedAmount}
        </b>
      </div>
      <motion.div
        className="absolute z-20 left-0 bottom-0 w-[228px] h-0 origin-[114px_0px]"
        initial={{ rotate: 0 }}
        animate={{ rotate: clamped * 1.8 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <span
          className="absolute left-1.5 -top-2.5 w-5 h-5 block"
          style={{
            backgroundColor: "var(--ink)",
            clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
          }}
        />
      </motion.div>
    </div>
  );
}

// Circular Progress Ring for stock & customer items (Theme-Aware)
export function StatusRing({
  percent,
  color,
  label,
}: {
  percent: number;
  color: string;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="w-12 h-12 rounded-full grid place-items-center shrink-0 transition-transform group-hover:scale-105"
      style={{
        background: `conic-gradient(${color} ${clamped}%, var(--ln) 0)`,
      }}
    >
      <b
        className="w-[38px] h-[38px] rounded-full grid place-items-center text-xs font-mono font-bold tabular-nums transition-colors"
        style={{ backgroundColor: "var(--in)", color: "var(--ink)" }}
      >
        {label}
      </b>
    </div>
  );
}

// Spaza Reminder Assistant Vector Illustration (Archway + Signal Bars + Scallop Star)
export function ReminderSignalIllustration() {
  const heights = [16, 26, 36, 46];
  const barColors = ["#74C2F6", "#8FD6A5", "#F5B83D", "#E8453C"];

  return (
    <div
      className="flex items-end gap-1.5 shrink-0 bg-[#F4F2EC] px-3 py-2 rounded-2xl"
      aria-hidden="true"
    >
      {heights.map((h, idx) => (
        <motion.i
          key={idx}
          initial={{ height: 6 }}
          animate={{ height: h }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 20,
            delay: idx * 0.06,
          }}
          className="w-2.5 rounded-t-full block"
          style={{
            background: `linear-gradient(180deg, ${barColors[idx]} 0%, rgba(116,194,246,0.18) 100%)`,
          }}
        />
      ))}
    </div>
  );
}

// Spaza Shop Door Arch & Awning Illustration for Stock Order & Brand Cards
export function SpazaArchIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 88"
      className={`w-16 h-16 shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spazaDoorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#74C2F6" />
          <stop offset="48%" stopColor="#DDF24E" />
          <stop offset="100%" stopColor="#EF5B45" />
        </linearGradient>
      </defs>
      {/* Background Soft Circle */}
      <circle cx="44" cy="44" r="40" fill="#BDEBE3" fillOpacity="0.45" />
      {/* Arch Door */}
      <path d="M26 72 V40 A18 18 0 0 1 62 40 V72 Z" fill="url(#spazaDoorGrad)" />
      {/* Awning Scallops */}
      <path
        d="M18 24 H70 L74 33 A7 7 0 0 1 60 33 A7 7 0 0 1 46 33 A7 7 0 0 1 32 33 A7 7 0 0 1 18 33 L14 33 Z"
        fill="#13222B"
      />
      {/* Sun Coin */}
      <circle cx="44" cy="46" r="6" fill="#FFFFFF" />
    </svg>
  );
}

// Decorative floating geometric shapes (scalloped coin, starburst, shop door arches)
export function DecorativeShapes({ className = "" }: { className?: string }) {
  const petalPath = (() => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2;
      const q = 40 * (1 + 0.07 * Math.sin(12 * t));
      d +=
        (i ? "L" : "M") +
        (50 + q * Math.cos(t)).toFixed(1) +
        " " +
        (50 + q * Math.sin(t)).toFixed(1);
    }
    return d + "Z";
  })();

  const starPath = (n: number) => {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const t = (i / n) * Math.PI;
      const q = i % 2 ? 14 : 46;
      d +=
        (i ? "L" : "M") +
        (50 + q * Math.cos(t)).toFixed(1) +
        " " +
        (50 + q * Math.sin(t)).toFixed(1);
    }
    return d + "Z";
  };

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        className="absolute w-24 h-24 left-[5%] top-[12%] animate-float-slow opacity-90"
      >
        <path d={petalPath} fill="#2C8C8A" />
        <path d={starPath(8)} transform="translate(25 25) scale(0.5)" fill="#FFFFFF" />
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="absolute w-14 h-14 right-[14%] top-[38%] animate-float-delayed opacity-90"
      >
        <path d={starPath(14)} fill="#EF5B45" />
      </svg>
      <div
        className="absolute right-[10%] top-[10%] w-16 h-20 rounded-t-full rounded-b-lg animate-float-slow opacity-85"
        style={{ background: "linear-gradient(#F2B8B5, #FFFFFF)" }}
      />
      <div
        className="absolute left-[12%] top-[44%] w-14 h-20 rounded-t-full rounded-b-lg animate-float-delayed opacity-85"
        style={{ background: "linear-gradient(#2C8C8A, #DDF24E)" }}
      />
    </div>
  );
}

// Luminous Layered-Gradient Icon Suite Showcase (Direct inspiration from IMG_5832)
export function BahiIconSuiteShowcase() {
  return (
    <div className="bg-[#050709] rounded-[28px] p-4 sm:p-5 border border-white/10 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-white/70">Luminous Glass Icon System</span>
        <span className="text-[11px] font-mono tabular-nums text-[#DDF24E]">5 Core Modules</span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3 place-items-center py-2">
        {/* 1. Bahi Ledger Mark */}
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.94 }}
          className="flex flex-col items-center gap-1.5"
        >
          <BahiBrandLogo size={46} />
          <span className="text-[10px] text-white/70 font-medium">Bahi</span>
        </motion.div>

        {/* 2. 31-Day Credit Calendar (Inspired by 31 Calendar in IMG_5832) */}
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.94 }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="46" height="46" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient
                id="calBack"
                x1="16"
                y1="8"
                x2="48"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient
                id="calFront"
                x1="12"
                y1="16"
                x2="52"
                y2="56"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <rect x="16" y="8" width="32" height="24" rx="10" fill="url(#calBack)" opacity="0.85" />
            <rect x="11" y="15" width="42" height="40" rx="13" fill="url(#calFront)" />
            <text
              x="32"
              y="42"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="21"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              30
            </text>
          </svg>
          <span className="text-[10px] text-white/70 font-medium">Terms</span>
        </motion.div>

        {/* 3. Multi-Language SMS Bubble (Inspired by Green Chat Bubble in IMG_5832) */}
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.94 }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="46" height="46" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient
                id="smsBack"
                x1="14"
                y1="10"
                x2="50"
                y2="34"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient
                id="smsFront"
                x1="10"
                y1="18"
                x2="54"
                y2="52"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <rect x="14" y="11" width="36" height="26" rx="13" fill="url(#smsBack)" opacity="0.8" />
            <path
              d="M10 31C10 22.7157 16.7157 16 25 16H39C47.2843 16 54 22.7157 54 31C54 39.2843 47.2843 46 39 46H26L17 53V45.5C12.8 43.2 10 37.5 10 31Z"
              fill="url(#smsFront)"
            />
            <path
              d="M23 31.5C25.8 35.5 38.2 35.5 41 31.5"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[10px] text-white/70 font-medium">SMS</span>
        </motion.div>

        {/* 4. Spaza Till Wallet (Inspired by Blue Wallet with Spine & Dot in IMG_5832) */}
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.94 }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="46" height="46" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient
                id="walBody"
                x1="10"
                y1="14"
                x2="54"
                y2="50"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient
                id="walFold"
                x1="10"
                y1="14"
                x2="26"
                y2="50"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#7DD3FC" />
              </linearGradient>
            </defs>
            <rect x="10" y="14" width="44" height="36" rx="11" fill="url(#walBody)" />
            <rect x="10" y="14" width="14" height="36" rx="7" fill="url(#walFold)" opacity="0.9" />
            <circle cx="44" cy="40" r="3.5" fill="#FFFFFF" />
          </svg>
          <span className="text-[10px] text-white/70 font-medium">Till</span>
        </motion.div>

        {/* 5. Settled Check Badge (Inspired by Layered Check Circle in IMG_5832) */}
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.94 }}
          className="flex flex-col items-center gap-1.5"
        >
          <svg width="46" height="46" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient
                id="chkTop"
                x1="12"
                y1="10"
                x2="52"
                y2="50"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="60%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#A5B4FC" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="36" r="19" fill="#93C5FD" opacity="0.65" />
            <circle cx="32" cy="30" r="20" fill="url(#chkTop)" />
            <path
              d="M23.5 30.5L29.2 36L41 24.5"
              stroke="#FFFFFF"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] text-white/70 font-medium">Settled</span>
        </motion.div>
      </div>
    </div>
  );
}
