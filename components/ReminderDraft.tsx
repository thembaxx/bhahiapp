"use client";

import { useState } from "react";
import { useModalDialog } from "@/hooks/use-modal-dialog";

export type ReminderDraftData = { recipient: string; phone: string; message: string };

export function ReminderDraft({
  draft,
  onClose,
  onSave,
}: {
  draft: ReminderDraftData;
  onClose: () => void;
  onSave: (message: string) => void;
}) {
  const ref = useModalDialog(true);
  const [message, setMessage] = useState(draft.message);
  const [status, setStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const phone = draft.phone.replace(/[^+\d]/g, "");
  return (
    <dialog
      ref={ref}
      aria-labelledby="reminder-draft-title"
      onCancel={onClose}
      className="m-auto w-[min(94vw,34rem)] rounded-3xl border-0 bg-[#FBF8F3] p-6 text-[#13222B] shadow-xl backdrop:bg-black/50"
    >
      <h2 id="reminder-draft-title" className="font-fraunces text-2xl">
        Reminder draft
      </h2>
      <p className="my-3 text-sm">
        For {draft.recipient}. Review the text before opening your messaging app. BahiApp cannot
        send messages or confirm delivery.
      </p>
      <label className="block text-sm">
        Message
        <textarea
          value={message}
          maxLength={2000}
          onChange={(e) => { setMessage(e.target.value); setSaved(false); setStatus("Edited draft. Save again to record these changes."); }}
          rows={6}
          className="mt-2 w-full rounded-xl border border-[#78808A] bg-white p-3 text-base"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-[#DDF24E] px-4 py-3"
          disabled={saved || !message.trim()}
          onClick={() => {
            onSave(message.trim());
            setSaved(true);
            setStatus("Draft recorded locally. Delivery is unverified.");
          }}
        >
          Save draft
        </button>
        <button
          type="button"
          className="rounded-full border px-4 py-3"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message);
              setStatus("Draft copied. Nothing has been sent.");
            } catch {
              setStatus("Copy is unavailable. Select the message and copy it manually.");
            }
          }}
        >
          Copy
        </button>
        {typeof navigator !== "undefined" && navigator.share && (
          <button
            type="button"
            className="rounded-full border px-4 py-3"
            onClick={async () => {
              try {
                await navigator.share({ title: "Reminder draft", text: message });
                setStatus("Draft shared with your chosen app. Delivery is unverified.");
              } catch (error) {
                setStatus(
                  error instanceof DOMException && error.name === "AbortError"
                    ? "Sharing cancelled. Draft retained."
                    : "Sharing failed. Draft retained.",
                );
              }
            }}
          >
            Share
          </button>
        )}
        {phone && (
          <a
            className="rounded-full border px-4 py-3"
            href={`sms:${phone}?body=${encodeURIComponent(message)}`}
          >
            Open messaging
          </a>
        )}
        <button type="button" className="rounded-full border px-4 py-3" onClick={onClose}>
          Close
        </button>
      </div>
      <p role="status" className="mt-3 text-sm">
        {status}
      </p>
    </dialog>
  );
}
