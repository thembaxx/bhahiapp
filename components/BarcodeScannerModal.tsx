'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Barcode, Sparkles, Plus } from 'lucide-react';
import { LanguageCode, ProductItem, formatRand0, tt } from '@/lib/bahi-data';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  items: ProductItem[];
  appLang: LanguageCode;
  onClose: () => void;
  onSellItem: (itemId: number) => void;
  onAddNewItem: (item: {
    name: string;
    price: number;
    category: ProductItem['category'];
    barcode: string;
    qty: number;
  }) => void;
}

export function BarcodeScannerModal({
  isOpen,
  items,
  appLang,
  onClose,
  onSellItem,
  onAddNewItem,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Point the camera at a barcode');
  const [manualCode, setManualCode] = useState('');
  const [unknownBarcode, setUnknownBarcode] = useState<string | null>(null);

  // New item fields
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('12');
  const [newCategory, setNewCategory] = useState<ProductItem['category']>('Staples');

  const handleDetectedBarcode = (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    const found = items.find((i) => i.barcode === clean);
    if (found) {
      if (found.qty <= 0) {
        setStatusMessage(`${found.name}: ${tt('Out of stock. Restock first', appLang)}`);
        return;
      }
      onSellItem(found.id);
      setStatusMessage(`${tt('Sold', appLang)}: ${found.name} (${formatRand0(found.price)})`);
    } else {
      setUnknownBarcode(clean);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setUnknownBarcode(null);
    setManualCode('');
    setStatusMessage(tt('Point the camera at a barcode', appLang));

    let stream: MediaStream | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let lastCode = '';
    let lastTime = 0;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('No camera API');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        const BarcodeDetectorClass = (
          window as unknown as {
            BarcodeDetector?: new () => {
              detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
            };
          }
        ).BarcodeDetector;

        if (BarcodeDetectorClass && videoRef.current) {
          const detector = new BarcodeDetectorClass();
          intervalId = setInterval(async () => {
            try {
              if (!videoRef.current) return;
              const results = await detector.detect(videoRef.current);
              if (results && results[0]?.rawValue) {
                const raw = results[0].rawValue;
                const now = Date.now();
                if (raw === lastCode && now - lastTime < 2500) return;
                lastCode = raw;
                lastTime = now;
                handleDetectedBarcode(raw);
              }
            } catch {
              // ignore frame errors
            }
          }, 450);
        }
      } catch {
        setCameraActive(false);
        setStatusMessage(tt('Camera unavailable. Type the barcode instead.', appLang));
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (!newName.trim() || !(priceNum > 0)) return;
    onAddNewItem({
      name: newName.trim(),
      price: priceNum,
      category: newCategory,
      barcode: unknownBarcode || `6001234509${items.length}`,
      qty: parseInt(newQty, 10) || 10,
    });
    setNewName('');
    setNewPrice('');
    setUnknownBarcode(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-white w-full max-w-[440px] rounded-t-[42px] sm:rounded-[42px] p-6 pb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-fraunces text-2xl font-medium text-[#13222B]">
              {unknownBarcode ? tt('Add item', appLang) : tt('Scan barcode', appLang)}
            </h2>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-full bg-[#F4F2EC] grid place-items-center text-[#13222B]"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {!unknownBarcode ? (
            <div className="mt-4 space-y-3.5">
              <div className="relative rounded-[24px] overflow-hidden bg-[#13222B] h-48 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                {!cameraActive && (
                  <div className="text-center px-6 text-white/80 space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-[#DDF24E]" />
                    <p className="text-xs">{statusMessage}</p>
                  </div>
                )}
                {/* Animated Laser Guide */}
                <motion.div
                  animate={{ y: [-50, 50, -50] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-x-6 h-0.5 bg-[#DDF24E] shadow-[0_0_12px_#DDF24E]"
                />
              </div>

              <div className="bg-[#F4F2EC] rounded-2xl p-3.5 text-xs text-[#13222B] font-medium flex items-center gap-2">
                <Barcode className="w-4 h-4 text-[#1F5F63] shrink-0" />
                <span>{statusMessage}</span>
              </div>

              <input
                type="text"
                inputMode="numeric"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={tt('Or type the barcode', appLang)}
                className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 font-doto text-lg text-[#13222B]"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleDetectedBarcode(manualCode)}
                  className="min-h-[48px] rounded-2xl bg-[#13222B] text-white text-sm font-medium"
                >
                  {tt('Use code', appLang)}
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    if (randomItem) handleDetectedBarcode(randomItem.barcode);
                  }}
                  className="min-h-[48px] rounded-2xl bg-[#DDF24E] text-[#13222B] text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{tt('Try demo code', appLang)}</span>
                </motion.button>
              </div>

              <button
                type="button"
                onClick={() => setUnknownBarcode(`6001234500${items.length + 1}`)}
                className="w-full min-h-[44px] rounded-2xl border border-[#ECE8DE] text-xs font-medium text-[#78808A] hover:text-[#13222B] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add a new product manually</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateItem} className="mt-4 space-y-3">
              <div className="bg-[#F4F2EC] rounded-2xl p-3 text-xs text-[#78808A]">
                {tt('Unknown barcode. Add this item', appLang)}:{' '}
                <strong className="font-doto text-[#13222B]">{unknownBarcode}</strong>
              </div>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={tt('Item name', appLang)}
                className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 text-sm text-[#13222B]"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder={tt('Price in rand', appLang)}
                  className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 font-doto text-base font-bold text-[#13222B]"
                />
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="Initial Qty"
                  className="w-full bg-[#F4F2EC] rounded-2xl px-4 py-3.5 font-doto text-base font-bold text-[#13222B]"
                />
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-[#F4F2EC] p-1 rounded-2xl">
                {(['Staples', 'Pantry', 'Fresh', 'Household'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`min-h-[38px] rounded-xl text-xs font-medium transition-colors ${
                      newCategory === cat
                        ? 'bg-[#13222B] text-white'
                        : 'text-[#78808A] hover:text-[#13222B]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="w-full min-h-[50px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-sm mt-2"
              >
                {tt('Add item', appLang)}
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
