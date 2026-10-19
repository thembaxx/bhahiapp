'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from 'motion/react';
import { ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { Customer, LanguageCode, formatRand0, tt } from '@/lib/bahi-data';
import { StatusRing } from './VisualCharts';

interface SwipeableCustomerRowProps {
  customer: Customer;
  appLang: LanguageCode;
  onOpenProfile: (customerId: number) => void;
  onSwipeEdit: (customer: Customer) => void;
  onSwipeDelete: (customer: Customer) => void;
}

export function SwipeableCustomerRow({
  customer,
  appLang,
  onOpenProfile,
  onSwipeEdit,
  onSwipeDelete,
}: SwipeableCustomerRowProps) {
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [snapState, setSnapState] = useState<'closed' | 'left' | 'right'>(
    'closed'
  );

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
        className="relative z-10 flex items-center justify-between gap-3 bg-[#F4F2EC] hover:bg-[#ECE8DE] rounded-[28px] p-3.5 cursor-grab active:cursor-grabbing transition-colors group"
      >
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
      </motion.div>
    </motion.div>
  );
}
