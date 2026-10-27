"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Package,
} from "lucide-react";
import { DayReconciliation } from "./DayReconciliation";
import { BahiState, LanguageCode, ReportPeriod, formatRand0, tt } from "@/lib/bahi-data";
import { DotMatrixCounter, PixelBlockChart, SalesWaveChart } from "./VisualCharts";

interface ReportsDashboardProps {
  state: BahiState;
  appLang: LanguageCode;
  onQuickSell: (itemId: number, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ReportsDashboard({ state, appLang, onQuickSell }: ReportsDashboardProps) {
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [productSort, setProductSort] = useState<"quantity" | "revenue">("revenue");

  const [reportNow, setReportNow] = useState(0);
  useEffect(() => {
    setReportNow(Date.now());
    const timer = setInterval(() => setReportNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const today = new Date(reportNow + 7_200_000).toISOString().slice(0, 10);
  const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
  const dayKeys = Array.from({ length: days }, (_, index) =>
    new Date(Date.parse(today + "T12:00:00Z") - (days - 1 - index) * 86_400_000)
      .toISOString()
      .slice(0, 10),
  );
  const transactions = [...new Map(state.transactions.map((tx) => [tx.id, tx])).values()].filter(
    (tx) =>
      Number.isFinite(tx.timestamp) &&
      tx.timestamp <= reportNow &&
      dayKeys.includes(new Date(tx.timestamp + 7_200_000).toISOString().slice(0, 10)),
  );
  const sum = (type: string) =>
    transactions.filter((tx) => tx.type === type).reduce((total, tx) => total + tx.amount, 0);
  const periodMetrics = {
    totalSales: sum("cash_sale") + sum("credit_sale"),
    creditExtended: sum("credit_sale"),
    paymentsReceived: sum("payment"),
    outstanding: state.customers.reduce((total, customer) => total + customer.owed, 0),
    growthLabel: "Recorded transactions only · SAST · debt repayments are separate from sales",
    waveValues: dayKeys.map((day) =>
      transactions
        .filter(
          (tx) =>
            new Date(tx.timestamp + 7_200_000).toISOString().slice(0, 10) === day &&
            (tx.type === "cash_sale" || tx.type === "credit_sale"),
        )
        .reduce((total, tx) => total + tx.amount, 0),
    ),
    waveLabels: dayKeys.map((day) => day.slice(5)),
  };

  const collectionRate = Math.min(
    100,
    Math.round((periodMetrics.paymentsReceived / Math.max(1, periodMetrics.creditExtended)) * 100),
  );

  // Compute Top 5 Selling Products for the selected period
  const top5Products = [...state.items]
    .map((item) => {
      const unitsSold =
        period === "daily"
          ? item.soldDaily
          : period === "weekly"
            ? item.soldWeekly
            : item.soldMonthly;
      const revenue = unitsSold * item.price;
      const profit = unitsSold * (item.price - item.costPrice);
      return {
        ...item,
        unitsSold,
        revenue,
        profit,
      };
    })
    .sort((a, b) =>
      productSort === "quantity" ? b.unitsSold - a.unitsSold : b.revenue - a.revenue,
    )
    .slice(0, 5);

  const maxProductMetric = Math.max(
    1,
    ...top5Products.map((p) => (productSort === "quantity" ? p.unitsSold : p.revenue)),
  );

  return (
    <div className="space-y-4">
      {/* Period Selector Pill Bar (Stacked cleanly on mobile, side-by-side on sm+) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/85 rounded-[36px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
      >
        <div>
          <h2 className="font-fraunces text-2xl font-medium text-[#13222B]">
            {tt("Reports", appLang)} & Analytics
          </h2>
          <p className="text-xs text-[#78808A]">
            Sales velocity, credit recovery, and top moving spaza stock
          </p>
        </div>
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#F4F2EC] p-1.5 rounded-full w-full sm:w-auto">
          {(["daily", "weekly", "monthly"] as ReportPeriod[]).map((p) => {
            const label =
              p === "daily"
                ? tt("Daily", appLang)
                : p === "weekly"
                  ? tt("Weekly", appLang)
                  : tt("Monthly", appLang);
            const active = period === p;
            return (
              <motion.button
                key={p}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`relative px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap text-center z-10 ${
                  active ? "text-white font-semibold" : "text-[#78808A] hover:text-[#13222B]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="reportPeriodPill"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="absolute inset-0 rounded-full bg-[#13222B] -z-10 shadow-sm"
                  />
                )}
                {label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <DayReconciliation state={state} />
      {/* Main Responsive Grid for Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Core Financial Metrics & Trend Wave */}
        <div className="lg:col-span-7 space-y-4">
          {/* Primary Sales + 4-Metric Breakdown Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm text-[#78808A]">
                  {tt("Total sales", appLang)} ({period})
                </div>
                <div className="text-4xl sm:text-5xl text-[#13222B] mt-1">
                  <DotMatrixCounter value={periodMetrics.totalSales} decimals={2} />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#78808A] mt-2">
                  <span className="w-5 h-5 rounded-full bg-[#4CB944] text-white grid place-items-center text-[11px] font-bold">
                    ↑
                  </span>
                  <span>{tt(periodMetrics.growthLabel, appLang)}</span>
                </div>
              </div>
              <PixelBlockChart />
            </div>

            {/* 4 Key Metrics Grid: Total Sales, Credit Extended, Payments Received, Outstanding Credit */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-[#ECE8DE]">
              <div className="bg-[#F4F2EC] rounded-3xl p-3.5">
                <small className="text-xs text-[#78808A] block">{tt("Total sales", appLang)}</small>
                <div className="font-mono font-bold tabular-nums text-lg sm:text-xl text-[#13222B] mt-1">
                  {formatRand0(periodMetrics.totalSales)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-3xl p-3.5">
                <small className="text-xs text-[#78808A] block">
                  {tt("Credit extended", appLang)}
                </small>
                <div className="font-mono font-bold tabular-nums text-lg sm:text-xl text-[#13222B] mt-1">
                  {formatRand0(periodMetrics.creditExtended)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-3xl p-3.5">
                <small className="text-xs text-[#78808A] block">
                  {tt("Payments received", appLang)}
                </small>
                <div className="font-mono font-bold tabular-nums text-lg sm:text-xl text-[#1F5F63] mt-1">
                  {formatRand0(periodMetrics.paymentsReceived)}
                </div>
              </div>
              <div className="bg-[#F4F2EC] rounded-3xl p-3.5">
                <small className="text-xs text-[#78808A] block">
                  {tt("Outstanding credit", appLang)}
                </small>
                <div className="font-mono font-bold tabular-nums text-lg sm:text-xl text-[#E8453C] mt-1">
                  {formatRand0(periodMetrics.outstanding)}
                </div>
              </div>
            </div>

            {/* Spectrum Collection Rate Bar */}
            <div className="mt-9 mb-2">
              <div className="h-3 rounded-full bg-[#F4F2EC] relative">
                <motion.i
                  initial={{ width: 0 }}
                  animate={{ width: `${collectionRate}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="absolute inset-y-0 left-0 rounded-full block"
                  style={{
                    background:
                      "linear-gradient(90deg, #DDF24E, #74C2F6 30%, #F5B83D 62%, #E8453C)",
                  }}
                />
                <motion.span
                  initial={{ left: "0%" }}
                  animate={{ left: `${collectionRate}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="absolute -top-8 -translate-x-1/2 bg-[#0B0B0C] text-white rounded-full px-3 py-0.5 text-xs font-mono tabular-nums font-semibold whitespace-nowrap"
                >
                  {tt(`Collected ${collectionRate}%`, appLang)}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Period Sales Wave Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#78808A]">Revenue trajectory ({period})</div>
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  Cash + Credit velocity
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F4F2EC] grid place-items-center text-[#13222B]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <SalesWaveChart values={periodMetrics.waveValues} labels={periodMetrics.waveLabels} />
          </motion.div>
        </div>

        {/* Right Column: Top 5 Selling Products Report */}
        <div className="lg:col-span-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.06,
              type: "spring",
              stiffness: 260,
              damping: 24,
            }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1F5F63]" />
                <h3 className="font-fraunces text-xl font-medium text-[#13222B]">
                  {tt("Top 5 selling products", appLang)}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-full w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setProductSort("revenue")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap text-center ${
                    productSort === "revenue"
                      ? "bg-[#13222B] text-white"
                      : "text-[#78808A] hover:text-[#13222B]"
                  }`}
                >
                  {tt("By revenue", appLang)}
                </button>
                <button
                  type="button"
                  onClick={() => setProductSort("quantity")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap text-center ${
                    productSort === "quantity"
                      ? "bg-[#13222B] text-white"
                      : "text-[#78808A] hover:text-[#13222B]"
                  }`}
                >
                  {tt("By quantity", appLang)}
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {top5Products.map((prod, idx) => {
                const metricVal = productSort === "quantity" ? prod.unitsSold : prod.revenue;
                const pct = Math.round((metricVal / maxProductMetric) * 100);
                return (
                  <motion.div
                    key={prod.id}
                    layout
                    whileHover={{ y: -1 }}
                    className="bg-[#F4F2EC] rounded-[26px] p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-full bg-white font-mono font-bold tabular-nums text-xs text-[#13222B] grid place-items-center shrink-0">
                          0{idx + 1}
                        </span>
                        <b className="text-sm sm:text-base font-medium text-[#13222B] leading-snug">
                          {prod.name}
                        </b>
                      </div>
                      <div className="font-mono font-extrabold tabular-nums text-base sm:text-lg text-[#13222B] shrink-0">
                        {productSort === "quantity"
                          ? `${prod.unitsSold}u`
                          : formatRand0(prod.revenue)}
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-white overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 160,
                          damping: 22,
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: idx === 0 ? "#1F5F63" : idx === 1 ? "#74C2F6" : "#F5B83D",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <small className="text-xs text-[#78808A]">
                        <span className="font-mono tabular-nums font-semibold">
                          {prod.unitsSold}
                        </span>{" "}
                        sold ·{" "}
                        <span className="font-mono tabular-nums font-semibold">
                          {formatRand0(prod.revenue)}
                        </span>{" "}
                        rev ·{" "}
                        <span className="font-mono tabular-nums font-semibold text-[#1F5F63]">
                          {formatRand0(prod.profit)}
                        </span>{" "}
                        profit
                      </small>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => onQuickSell(prod.id, e)}
                        className="min-h-[34px] px-3.5 rounded-full bg-[#13222B] text-white text-xs font-medium shrink-0"
                      >
                        +Sell
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Shop Book Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
          >
            <h3 className="font-fraunces text-xl font-medium text-[#13222B] mb-3">
              Recent ledger entries
            </h3>
            <div className="space-y-2.5">
              {state.transactions.slice(0, 5).map((tx) => {
                const isPayment = tx.type === "payment";
                const isCash = tx.type === "cash_sale";
                const isSms = tx.type === "sms_reminder";
                return (
                  <div
                    key={tx.id}
                    className="bg-[#F4F2EC] rounded-2xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${
                          isPayment || isCash
                            ? "bg-[#DDF24E] text-[#13222B]"
                            : isSms
                              ? "bg-[#BDEBE3] text-[#13222B]"
                              : "bg-[#F6C4C0] text-[#13222B]"
                        }`}
                      >
                        {isPayment ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : isSms ? (
                          <MessageSquare className="w-4 h-4" />
                        ) : isCash ? (
                          <Package className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <b className="text-xs sm:text-sm font-medium text-[#13222B] block truncate">
                          {tx.customerName
                            ? `${tx.customerName} · ${
                                isPayment
                                  ? "Payment"
                                  : isSms
                                    ? "Reminder / delivery unverified"
                                    : "Credit"
                              }`
                            : tx.productName || "Cash Sale"}
                        </b>
                        <small className="text-[11px] text-[#78808A] block truncate">
                          {tx.date}
                        </small>
                      </div>
                    </div>
                    {tx.amount > 0 && (
                      <span className="font-mono font-bold tabular-nums text-sm text-[#13222B] shrink-0">
                        {formatRand0(tx.amount)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
