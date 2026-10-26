"use client";

import { useEffect, useRef } from "react";

/** Native modal dialogs contain focus and make the background inert. */
export function useModalDialog(isOpen: boolean) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        !document.querySelector("dialog[open]")
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return ref;
}
