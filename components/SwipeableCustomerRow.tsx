'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from 'motion/react';
import {
  ChevronRight,
  Edit3,
  Trash2,
  Zap,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Customer, LanguageCode, formatRand0, tt } from '@/lib/bahi-data';
import { StatusRing } from './VisualCharts';

interface SwipeableCustomerRowProps {
  customer: Customer;
  appLang: LanguageCode;
  onOpenProfile: (customerId: number) => void;
  onSwipeEdit: (customer: Customer) => void;
  onSwipeDelete: (customer: Customer) => void;
  onQuickPay?: (
    customerId: number,
    amount: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

export function SwipeableCustomerRow({
  customer,
  appLang,
  onOpenProfile,
  onSwipeEdit,
  onSwipeDelete,
  onQuickPay,
}: SwipeableCustomerRowProps) {
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [snapState, setSnapState] = useState<'closed' | 'left' | 'right'>(
    'closed'
  );
  const [showMoreAmounts, setShowMoreAmounts] = useState(false);
  const [recentPaid, setRecentPaid] = useState<number | null>(null);

  // Transform scales & opacities for left (Swipe-Right = Quick Edit) & right (Swipe-Left = Edit + Delete) trays
  const leftActionScale = useTransform(x, [0, 48, 96], [0.7, 0.95, 1.08]);
  const leftActionOpacity = useTransform(x, [0, 24, 70], [0, 0.85, 1]);
  const rightActionScale = useTransform(x, [0, -50, -140], [0.75, 0.95, 1.04]);
  const rightActionOpacity = useTransform(x, [0, -24, -80], [0, 0.85, 1]);

  const springTo = (target: number, nextState: 'closed' | 'left' | 'right') => {
    setSnapState(nextState);
    animate(x, target, {
      type: 'spring',
      stiffness: 420,
      damping: 34,
    });
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const currentX = x.get();

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);

    // Full swipe right -> Immediate Edit trigger
    if (currentX > 82 || (offset > 55 && velocity > 420)) {
      springTo(0, 'closed');
      onSwipeEdit(customer);
      return;
    }

    // Half swipe right -> Snap open left Edit button
    if (currentX > 36) {
      springTo(84, 'right');
      return;
    }

    // Full swipe left -> Immediate Delete trigger
    if (currentX < -138 || (offset < -95 && velocity < -520)) {
      springTo(0, 'closed');
      onSwipeDelete(customer);
      return;
    }

    // Half swipe left -> Snap open right Edit + Delete action tray
    if (currentX < -38) {
      springTo(-148, 'left');
      return;
    }

    springTo(0, 'closed');
  };

  const handleRowClick = () => {
    if (isDraggingRef.current) return;
    if (snapState !== 'closed') {
      springTo(0, 'closed');
      return;
    }
    onOpenProfile(customer.id);
  };

  const triggerQuickPayment = (
    amount: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (!onQuickPay || customer.owed <= 0) return;
    const effectiveAmount = Math.min(amount, customer.owed);
    setRecentPaid(effectiveAmount);
    onQuickPay(customer.id, effectiveAmount, e);
    setTimeout(() => {
      setRecentPaid(null);
    }, 1500);
  };

  const p = Math.min(100, (customer.daysOverdue / 14) * 100);
  const ringColor =
    customer.daysOverdue >= 7
      ? '#E8453C'
      : customer.daysOverdue >= 3
      ? '#F4C84E'
      : '#74C2F6';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -120, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="relative rounded-[28px] overflow-hidden select-none"
    >
      {/* Underlying Swipe Action Track */}
      <div className="absolute inset-0 flex items-center justify-between rounded-[28px] bg-[#13222B] px-2.5">
        {/* Left Action (Revealed on Swipe Right -> Quick Edit) */}
        <motion.button
          type="button"
          style={{ scale: leftActionScale, opacity: leftActionOpacity }}
          onClick={(e) => {
            e.stopPropagation();
            springTo(0, 'closed');
            onSwipeEdit(customer);
          }}
          aria-label={`Edit ${customer.name}`}
          className="h-[calc(100%-12px)] px-4 rounded-[22px] bg-gradient-to-r from-[#2997FF] to-[#28E08C] text-[#07191C] font-semibold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Edit3 className="w-4 h-4 shrink-0" />
          <span>Edit</span>
        </motion.button>

        {/* Right Action Tray (Revealed on Swipe Left -> Edit & Delete) */}
        <motion.div
          style={{ scale: rightActionScale, opacity: rightActionOpacity }}
          className="flex items-center gap-1.5 h-[calc(100%-12px)] ml-auto"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              springTo(0, 'closed');
              onSwipeEdit(customer);
            }}
            aria-label={`Edit ${customer.name}`}
            className="h-full w-[66px] rounded-[20px] bg-[#2997FF] hover:bg-[#1B84EC] text-white font-semibold text-[11px] flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              springTo(0, 'closed');
              onSwipeDelete(customer);
            }}
            aria-label={`Delete ${customer.name}`}
            className="h-full w-[66px] rounded-[20px] bg-[#FF4B4B] hover:bg-[#E03A3A] text-white font-semibold text-[11px] flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </motion.div>
      </div>

      {/* Draggable Foreground Customer Card */}
      <motion.div
        style={{ x, touchAction: 'pan-y' }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -156, right: 96 }}
        dragElastic={0.18}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onOpenProfile(customer.id);
          } else if (e.key === 'ArrowLeft') {
            springTo(-148, 'left');
          } else if (e.key === 'ArrowRight') {
            springTo(0, 'closed');
          }
        }}
        className="relative z-10 bg-[#F4F2EC] hover:bg-[#ECE8DE] rounded-[28px] p-3.5 cursor-grab active:cursor-grabbing transition-colors group"
      >
        {/* Top Row: Customer Identity + Balance Summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <StatusRing
              percent={customer.owed > 0 ? p : 0}
              color={ringColor}
              label={customer.owed > 0 ? `${customer.daysOverdue}d` : '✓'}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <b className="text-base font-medium text-[#13222B] truncate">
                  {customer.name}
                </b>
                {customer.tags &&
                  customer.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      style={{ backgroundColor: tag.color }}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#13222B]"
                    >
                      {tag.label}
                    </span>
                  ))}
              </div>
              <small className="text-xs text-[#78808A] block truncate">
                {customer.owed > 0
                  ? customer.daysOverdue >= 7
                    ? tt(`Late · ${customer.daysOverdue} days`, appLang)
                    : tt(`Owing · ${customer.daysOverdue} days`, appLang)
                  : tt('Settled', appLang)}{' '}
                · <span className="capitalize">{customer.category}</span> ·{' '}
                <span className="font-mono tabular-nums">{customer.phone}</span>
              </small>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <b className="font-mono font-extrabold tabular-nums text-lg text-[#13222B] block">
                {formatRand0(customer.owed)}
              </b>
              <small className="text-[11px] text-[#78808A]">
                Total:{' '}
                <span className="font-mono tabular-nums">
                  {formatRand0(customer.totalCreditExtended)}
                </span>
              </small>
            </div>
            <ChevronRight className="w-4 h-4 text-[#78808A] group-hover:text-[#13222B] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Bottom Shortcut Strip: One-Tap Quick Pay Actions */}
        {onQuickPay && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 pt-2.5 border-t border-[#ECE8DE] flex items-center justify-between gap-2 flex-wrap cursor-default"
          >
            {customer.owed > 0 ? (
              <>
                <div className="flex items-center gap-1.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreAmounts((prev) => !prev);
                    }}
                    aria-label={`Quick Pay options for ${customer.name}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F5F63] hover:underline px-1.5 py-1 rounded-lg"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>{tt('Quick Pay', appLang)}</span>
                  </motion.button>

                  <AnimatePresence>
                    {recentPaid !== null && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.85, x: -4 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold tabular-nums text-[#1F5F63]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>-{formatRand0(recentPaid)}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* One-tap R50 button */}
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => triggerQuickPayment(50, e)}
                    aria-label={`Quick Pay R50 for ${customer.name}`}
                    className="min-h-[34px] px-3 py-1 rounded-full bg-[#DDF24E] text-[#13222B] font-mono text-xs font-bold tabular-nums shadow-xs hover:brightness-95 transition-all flex items-center gap-1"
                  >
                    <span>-R50</span>
                  </motion.button>

                  {/* One-tap R100 button */}
                  {customer.owed > 50 && (
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => triggerQuickPayment(100, e)}
                      aria-label={`Quick Pay R100 for ${customer.name}`}
                      className="min-h-[34px] px-3 py-1 rounded-full bg-[#DDF24E] text-[#13222B] font-mono text-xs font-bold tabular-nums shadow-xs hover:brightness-95 transition-all flex items-center gap-1"
                    >
                      <span>-R100</span>
                    </motion.button>
                  )}

                  {/* Extra amounts toggled via Quick Pay button (R20 / R200) */}
                  <AnimatePresence>
                    {showMoreAmounts && (
                      <>
                        {customer.owed >= 20 && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => triggerQuickPayment(20, e)}
                            aria-label={`Quick Pay R20 for ${customer.name}`}
                            className="min-h-[34px] px-2.5 py-1 rounded-full bg-white border border-[#ECE8DE] text-[#13222B] font-mono text-xs font-semibold tabular-nums"
                          >
                            -R20
                          </motion.button>
                        )}
                        {customer.owed > 100 && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => triggerQuickPayment(200, e)}
                            aria-label={`Quick Pay R200 for ${customer.name}`}
                            className="min-h-[34px] px-2.5 py-1 rounded-full bg-white border border-[#ECE8DE] text-[#13222B] font-mono text-xs font-semibold tabular-nums"
                          >
                            -R200
                          </motion.button>
                        )}
                      </>
                    )}
                  </AnimatePresence>

                  {/* One-tap Settle All button when owed differs from 50 and 100 */}
                  {customer.owed !== 50 && customer.owed !== 100 && (
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => triggerQuickPayment(customer.owed, e)}
                      aria-label={`Settle full ${formatRand0(customer.owed)} for ${customer.name}`}
                      className="min-h-[34px] px-3 py-1 rounded-full bg-[#13222B] text-white text-xs font-medium transition-all flex items-center gap-1"
                    >
                      <span>{tt('Settle all', appLang)}</span>
                      <span className="font-mono font-bold tabular-nums">
                        ({formatRand0(customer.owed)})
                      </span>
                    </motion.button>
                  )}

                  {/* Toggle extra denominations pill */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreAmounts((prev) => !prev);
                    }}
                    aria-label="More Quick Pay amounts"
                    title="More Quick Pay amounts (R20, R200)"
                    className={`w-[34px] h-[34px] rounded-full border border-[#ECE8DE] grid place-items-center text-xs transition-colors ${
                      showMoreAmounts
                        ? 'bg-[#13222B] text-white'
                        : 'bg-white text-[#78808A] hover:text-[#13222B]'
                    }`}
                  >
                    <Plus
                      className={`w-3.5 h-3.5 transition-transform ${
                        showMoreAmounts ? 'rotate-45' : ''
                      }`}
                    />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full text-xs text-[#78808A]">
                <span className="inline-flex items-center gap-1.5 text-[#1F5F63] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{tt('Settled', appLang)} · R0 owing</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProfile(customer.id);
                  }}
                  className="text-xs font-medium text-[#13222B] hover:underline"
                >
                  + Add credit →
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
