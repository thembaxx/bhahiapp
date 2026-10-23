"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Smartphone, X, Share } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) return null;

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowModal(true);
          }
        }}
        className="min-h-[40px] px-3.5 py-2 rounded-full bg-[#13222B] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
        aria-label="Install BahiApp PWA"
      >
        <Download className="w-3.5 h-3.5 text-[#DDF24E]" />
        <span>Install App</span>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-[36px] max-w-sm w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#13222B] grid place-items-center text-[#DDF24E]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-fraunces text-lg font-medium text-[#13222B]">
                      Install BahiApp Offline
                    </h3>
                    <p className="text-xs text-[#78808A]">Works without mobile data</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-full bg-[#F4F2EC] grid place-items-center text-[#13222B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="bg-[#F4F2EC] rounded-2xl p-4 text-xs text-[#13222B] space-y-2 leading-relaxed">
                  <p className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-[#1F5F63] shrink-0" />
                    <span>
                      1. Tap the <strong>Share</strong> icon in your Safari toolbar.
                    </span>
                  </p>
                  <p>
                    2. Scroll down and select <strong>Add to Home Screen</strong>.
                  </p>
                  <p>
                    3. Open <strong>BahiApp</strong> from your home screen anytime, even with zero
                    data.
                  </p>
                </div>
              ) : (
                <div className="bg-[#F4F2EC] rounded-2xl p-4 text-xs text-[#13222B] space-y-2 leading-relaxed">
                  <p>
                    1. Open your browser menu (<strong>⋮</strong> or address bar icon) and tap{" "}
                    <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </p>
                  <p>
                    2. BahiApp caches its ledger shell and local database on your device so you can
                    record sales offline.
                  </p>
                </div>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                className="w-full min-h-[46px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-sm"
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
