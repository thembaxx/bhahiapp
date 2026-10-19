'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { formatRand0 } from '@/lib/bahi-data';

// Animated Dot-Matrix Number Counter
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
    const duration = 650;
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
      <span className={`font-doto font-extrabold tracking-tight tabular-nums ${className}`}>
        {prefix}
        {Number(whole).toLocaleString('en-US')}
        <span className="opacity-50">.{cents}</span>
      </span>
    );
  }

  return (
    <span className={`font-doto font-extrabold tracking-tight tabular-nums ${className}`}>
      {prefix}
      {Math.round(displayVal).toLocaleString('en-US')}
    </span>
  );
}

// Pixel-block spectrum mini chart from the inspiration photos
export function PixelBlockChart() {
  const heights = [2, 3, 2, 4, 3, 5, 3];
  const colors = ['#74C2F6', '#74C2F6', '#F4C84E', '#74C2F6', '#8FA9F2', '#F07CA0', '#E8453C'];

  return (
    <div className="flex items-end gap-1 h-16 shrink-0" aria-hidden="true">
      {heights.map((h, colIdx) => (
        <div key={colIdx} className="flex flex-col-reverse gap-1">
          {Array.from({ length: h }).map((_, rowIdx) => (
            <motion.i
              key={rowIdx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 - rowIdx * 0.18 }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 22,
                delay: colIdx * 0.04 + rowIdx * 0.03,
              }}
              className="block w-3 h-3 rounded-[3px]"
              style={{ backgroundColor: colors[colIdx] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Smooth cubic-bezier sales wave chart with interactive points (Theme-Aware)
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
    <div className="mt-3 select-none">
      <div className="relative">
        <svg className="w-full h-auto overflow-visible block" viewBox="0 0 316 90">
          <defs>
            <linearGradient id="waveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DDF24E" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#DDF24E" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line
            x1="4"
            x2="312"
            y1="80"
            y2="80"
            stroke="var(--mut)"
            strokeOpacity="0.55"
            strokeDasharray="1 6"
            strokeLinecap="round"
          />
          <path d={areaD} fill="url(#waveAreaGrad)" />
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
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
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={isSelected ? 6.5 : i % 2 ? 5 : 4}
                  fill={isSelected || i % 2 ? '#DDF24E' : 'var(--card)'}
                  stroke="var(--ink)"
                  strokeWidth={isSelected ? '2.2' : '1.6'}
                />
              </g>
            );
          })}
        </svg>
        {activeIdx !== null && values[activeIdx] !== undefined && (
          <div className="flex items-center justify-between text-xs text-[#78808A] mt-1 px-1">
            <span>
              Selected: <strong className="text-[#13222B]">{labels[activeIdx]}</strong>
            </span>
            <span className="font-doto font-bold text-[#13222B] text-sm">
              {formatRand0(values[activeIdx])}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[11px] text-[#78808A] mt-1.5 px-1">
        {labels.map((label, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={`transition-colors ${
              activeIdx === idx ? 'text-[#13222B] font-semibold' : 'hover:text-[#13222B]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Half-circle credit gauge with animated pointer (Theme-Aware)
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
      className="relative w-[228px] h-[116px] mx-auto mt-3 overflow-hidden"
      style={{ '--p': clamped } as React.CSSProperties}
    >
      <div
        className="absolute inset-x-0 top-0 -bottom-[116px] rounded-full"
        style={{
          background: `conic-gradient(from 270deg, #9AD3F8 0deg, #F4C84E ${
            clamped * 1.08
          }deg, #E8453C ${clamped * 1.8}deg, var(--ln) 0deg 180deg, transparent 0deg)`,
        }}
      />
      <div
        className="absolute w-[146px] h-[146px] left-[41px] top-[41px] rounded-full transition-colors"
        style={{ backgroundColor: 'var(--card)' }}
      />
      <div className="absolute z-10 inset-x-0 bottom-1.5 text-center">
        <div className="text-xs text-[#78808A]">{collectedLabel}</div>
        <b className="font-doto font-extrabold text-2xl text-[#13222B]">{collectedAmount}</b>
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
        className="w-[38px] h-[38px] rounded-full grid place-items-center text-xs font-doto font-bold transition-colors"
        style={{ backgroundColor: 'var(--in)', color: 'var(--ink)' }}
      >
        {label}
      </b>
    </div>
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
        style={{ background: 'linear-gradient(#F2B8B5, #FFFFFF)' }}
      />
      <div
        className="absolute left-[12%] top-[44%] w-14 h-20 rounded-t-full rounded-b-lg animate-float-delayed opacity-85"
        style={{ background: 'linear-gradient(#2C8C8A, #DDF24E)' }}
      />
    </div>
  );
}
