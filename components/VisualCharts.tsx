'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { formatRand0 } from '@/lib/bahi-data';

// Signature BahiApp Brand Logo (Lowercase 'b' Ledger Spine + Spectrum Coin + Spaza Awning)
export function BahiBrandLogo({
  size = 44,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bahiLogoSpectrum" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DDF24E" />
          <stop offset="35%" stopColor="#74C2F6" />
          <stop offset="70%" stopColor="#F5B83D" />
          <stop offset="100%" stopColor="#E8453C" />
        </linearGradient>
        <linearGradient id="bahiLogoAwning" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#74C2F6" />
          <stop offset="50%" stopColor="#DDF24E" />
          <stop offset="100%" stopColor="#EF5B45" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#0B0B0C" />
      {/* Spaza Shop Awning Scallops */}
      <path
        d="M14 10.5 H50 A3 3 0 0 1 53 13.5 V15 A4.5 4.5 0 0 1 44 15 A4.5 4.5 0 0 1 35 15 A4.5 4.5 0 0 1 26 15 A4.5 4.5 0 0 1 17 15 H11 V13.5 A3 3 0 0 1 14 10.5 Z"
        fill="url(#bahiLogoAwning)"
      />
      {/* Book Spine Stem */}
      <rect x="16" y="15" width="11" height="38" rx="5.5" fill="#FFFFFF" />
      {/* Spectrum Coin Bowl */}
      <circle
        cx="37.5"
        cy="39"
        r="10.5"
        fill="none"
        stroke="url(#bahiLogoSpectrum)"
        strokeWidth="9.5"
      />
      {/* Center Coin Pip */}
      <circle cx="37.5" cy="39" r="3.2" fill="#DDF24E" />
    </svg>
  );
}

// Animated Monospace Number Counter with Signature Grey Cents (from inspiration photos)
export function DotMatrixCounter({
  value,
  prefix = 'R',
  decimals = 0,
  className = '',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (decimals > 0) {
    const [whole, cents] = displayVal.toFixed(decimals).split('.');
    return (
      <span
        className={`font-mono font-extrabold tracking-tight tabular-nums inline-flex items-baseline ${className}`}
      >
        <span>
          {prefix}
          {Number(whole).toLocaleString('en-US')}
        </span>
        <span className="text-[0.62em] font-semibold text-[#78808A] ml-0.5">
          .{cents}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`font-mono font-extrabold tracking-tight tabular-nums ${className}`}
    >
      {prefix}
      {Math.round(displayVal).toLocaleString('en-US')}
    </span>
  );
}

// Interactive Pixel-Block Spectrum Chart from the inspiration photos
export function PixelBlockChart() {
  const heights = [2, 3, 2, 4, 3, 5, 4];
  const colors = [
    '#74C2F6',
    '#74C2F6',
    '#F4C84E',
    '#74C2F6',
    '#8FA9F2',
    '#F07CA0',
    '#E8453C',
  ];

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
                type: 'spring',
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
export function SalesWaveChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
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
        <svg
          className="w-full h-auto overflow-visible block"
          viewBox="0 0 316 90"
        >
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
              strokeOpacity={yLine === 80 ? '0.55' : '0.18'}
              strokeDasharray={yLine === 80 ? '1 6' : '2 6'}
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
            transition={{ duration: 0.95, ease: 'easeOut' }}
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
                  <circle
                    cx={p[0]}
                    cy={p[1]}
                    r="10"
                    fill="#DDF24E"
                    fillOpacity="0.35"
                  />
                )}
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={isSelected ? 6.5 : i % 2 ? 4.8 : 4}
                  fill={isSelected || i % 2 ? '#DDF24E' : 'var(--card)'}
                  stroke="var(--ink)"
                  strokeWidth={isSelected ? '2.4' : '1.7'}
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
              activeIdx === idx
                ? 'bg-[#DDF24E] text-[#13222B] font-bold'
                : 'hover:text-[#13222B]'
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
      style={{ '--p': clamped } as React.CSSProperties}
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
        style={{ backgroundColor: 'var(--card)' }}
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
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <span
          className="absolute left-1.5 -top-2.5 w-5 h-5 block"
          style={{
            backgroundColor: 'var(--ink)',
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
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
        style={{ backgroundColor: 'var(--in)', color: 'var(--ink)' }}
      >
        {label}
      </b>
    </div>
  );
}

// Spaza Reminder Assistant Vector Illustration (Archway + Signal Bars + Scallop Star)
export function ReminderSignalIllustration() {
  const heights = [16, 26, 36, 46];
  const barColors = ['#74C2F6', '#8FD6A5', '#F5B83D', '#E8453C'];

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
            type: 'spring',
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
export function SpazaArchIllustration({ className = '' }: { className?: string }) {
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
      <path
        d="M26 72 V40 A18 18 0 0 1 62 40 V72 Z"
        fill="url(#spazaDoorGrad)"
      />
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
export function DecorativeShapes({ className = '' }: { className?: string }) {
  const petalPath = (() => {
    let d = '';
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 2;
      const q = 40 * (1 + 0.07 * Math.sin(12 * t));
      d +=
        (i ? 'L' : 'M') +
        (50 + q * Math.cos(t)).toFixed(1) +
        ' ' +
        (50 + q * Math.sin(t)).toFixed(1);
    }
    return d + 'Z';
  })();

  const starPath = (n: number) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const t = (i / n) * Math.PI;
      const q = i % 2 ? 14 : 46;
      d +=
        (i ? 'L' : 'M') +
        (50 + q * Math.cos(t)).toFixed(1) +
        ' ' +
        (50 + q * Math.sin(t)).toFixed(1);
    }
    return d + 'Z';
  };

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute w-24 h-24 left-[5%] top-[12%] animate-float-slow opacity-90"
      >
        <path d={petalPath} fill="#2C8C8A" />
        <path
          d={starPath(8)}
          transform="translate(25 25) scale(0.5)"
          fill="#FFFFFF"
        />
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="absolute w-14 h-14 right-[14%] top-[38%] animate-float-delayed opacity-90"
      >
        <path d={starPath(14)} fill="#EF5B45" />
      </svg>
      <div
        className="absolute right-[10%] top-[10%] w-16 h-20 rounded-t-full rounded-b-lg animate-float-slow opacity-85"
        style={{ background: 'linear-gradient(#F2B8B5, #FFFFFF)' }}
      />
      <div
        className="absolute left-[12%] top-[44%] w-14 h-20 rounded-t-full rounded-b-lg animate-float-delayed opacity-85"
        style={{ background: 'linear-gradient(#2C8C8A, #DDF24E)' }}
      />
    </div>
  );
}
