"use client";

export type HapticAudioCueType =
  | "cha_ching"
  | "credit_logged"
  | "payment_received"
  | "account_settled"
  | "restock"
  | "sms_sent"
  | "tap"
  | "warning";

export interface HapticAudioOptions {
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export interface CueMetadata {
  id: HapticAudioCueType;
  label: string;
  shortTag: string;
  vibratePattern: number[];
}

export const CUE_METADATA: Record<HapticAudioCueType, CueMetadata> = {
  cha_ching: {
    id: "cha_ching",
    label: "Cash Sale Cha-Ching",
    shortTag: "CHA-CHING ♪",
    vibratePattern: [18, 38, 42],
  },
  credit_logged: {
    id: "credit_logged",
    label: "Credit Book Stamp",
    shortTag: "CREDIT STAMP ♪",
    vibratePattern: [14, 28, 24],
  },
  payment_received: {
    id: "payment_received",
    label: "Payment Coin Chime",
    shortTag: "COIN CHIME ♪",
    vibratePattern: [15, 30, 32],
  },
  account_settled: {
    id: "account_settled",
    label: "Account Settled Bell",
    shortTag: "SETTLED CHIME ♪",
    vibratePattern: [18, 30, 22, 30, 50],
  },
  restock: {
    id: "restock",
    label: "Stock Crate Pop",
    shortTag: "RESTOCK ♪",
    vibratePattern: [12, 24, 16],
  },
  sms_sent: {
    id: "sms_sent",
    label: "SMS Dispatched Whoosh",
    shortTag: "SMS SENT ♪",
    vibratePattern: [10, 22, 18],
  },
  tap: {
    id: "tap",
    label: "Tactile Tap",
    shortTag: "TAP",
    vibratePattern: [10],
  },
  warning: {
    id: "warning",
    label: "Low Stock Alert",
    shortTag: "ALERT",
    vibratePattern: [28, 40, 28],
  },
};

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay restrictions
    });
  }
  return sharedAudioCtx;
}

/**
 * Helper to schedule a bell / harmonic partial with smooth attack and exponential release
 */
function playBellPartial(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  peakGain: number,
  type: OscillatorType = "sine",
  endFreq?: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
  }

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/**
 * Helper to synthesize a brief mechanical till latch / coin clink noise burst
 */
function playMechanicalClick(
  ctx: AudioContext,
  startTime: number,
  duration = 0.028,
  bandpassFreq = 2400,
  peakGain = 0.14,
) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Exponentially decaying white noise burst
    const env = Math.pow(1 - i / bufferSize, 2.2);
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(bandpassFreq, startTime);
  filter.Q.setValueAtTime(3.2, startTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peakGain, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(startTime);
  noise.stop(startTime + duration);
}

/**
 * Triggers synchronized device vibration and Web Audio synthesized sound cues
 * tailored for noisy, fast-paced spaza shop hours.
 */
export function triggerHapticAudio(
  cue: HapticAudioCueType,
  options: HapticAudioOptions = { soundEnabled: true, hapticsEnabled: true },
): CueMetadata {
  const meta = CUE_METADATA[cue] || CUE_METADATA.tap;
  const soundOn = options.soundEnabled !== false;
  const hapticsOn = options.hapticsEnabled !== false;

  // 1. Trigger synchronized tactile vibration pattern
  if (hapticsOn && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(meta.vibratePattern);
    } catch {
      // Ignore vibration permission errors on desktop browsers
    }
  }

  // 2. Trigger Web Audio synthesis if enabled and beyond a plain micro-tap
  if (!soundOn || cue === "tap") {
    return meta;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return meta;
    const now = ctx.currentTime;

    switch (cue) {
      case "cha_ching": {
        // "Cha-" (mechanical cash drawer latch + coin clink)
        playMechanicalClick(ctx, now, 0.032, 2600, 0.16);
        playBellPartial(ctx, 185, now, 0.055, 0.12, "triangle", 110);
        // Coin metallic grace note (B5: 987.77 Hz + overtone)
        playBellPartial(ctx, 987.77, now + 0.015, 0.14, 0.16, "sine");
        playBellPartial(ctx, 1975.53, now + 0.015, 0.11, 0.07, "triangle");

        // "-Ching!" (resonant brass register bell E6: 1318.51 Hz + shimmering harmonics)
        const chingStart = now + 0.082;
        playBellPartial(ctx, 1318.51, chingStart, 0.52, 0.22, "sine");
        playBellPartial(ctx, 2637.02, chingStart, 0.38, 0.09, "sine");
        playBellPartial(ctx, 3955.53, chingStart, 0.24, 0.045, "triangle");
        break;
      }

      case "credit_logged": {
        // Tactile warm wooden ledger stamp + two-note Kalimba confirmation (D5 -> A5)
        playMechanicalClick(ctx, now, 0.022, 1200, 0.12);
        playBellPartial(ctx, 587.33, now + 0.01, 0.18, 0.18, "triangle");
        playBellPartial(ctx, 1174.66, now + 0.01, 0.12, 0.05, "sine");

        const secondNote = now + 0.095;
        playBellPartial(ctx, 880.0, secondNote, 0.34, 0.2, "sine");
        playBellPartial(ctx, 1760.0, secondNote, 0.22, 0.06, "triangle");
        break;
      }

      case "payment_received": {
        // Crisp coin-drop cascade + warm rising interval (G5 -> B5 ->E6)
        playMechanicalClick(ctx, now, 0.025, 3100, 0.14);
        playBellPartial(ctx, 783.99, now, 0.16, 0.15, "sine");
        playBellPartial(ctx, 987.77, now + 0.065, 0.2, 0.17, "sine");
        playBellPartial(ctx, 1318.51, now + 0.13, 0.42, 0.21, "sine");
        playBellPartial(ctx, 2637.02, now + 0.13, 0.28, 0.07, "triangle");
        break;
      }

      case "account_settled": {
        // Celebratory full-settlement cha-ching flourish (G5 -> B5 -> D6 -> G6 bell)
        playMechanicalClick(ctx, now, 0.03, 2800, 0.15);
        playBellPartial(ctx, 783.99, now, 0.15, 0.15, "sine");
        playBellPartial(ctx, 987.77, now + 0.06, 0.18, 0.16, "sine");
        playBellPartial(ctx, 1174.66, now + 0.12, 0.22, 0.18, "sine");
        playBellPartial(ctx, 1567.98, now + 0.185, 0.56, 0.22, "sine");
        playBellPartial(ctx, 3135.96, now + 0.185, 0.38, 0.08, "triangle");
        break;
      }

      case "restock": {
        // Rising crate pop (C5 -> G5)
        playBellPartial(ctx, 523.25, now, 0.12, 0.14, "triangle", 659.25);
        playBellPartial(ctx, 783.99, now + 0.07, 0.22, 0.16, "sine");
        break;
      }

      case "sms_sent": {
        // Soft ascending signal chime (E5 -> B5)
        playBellPartial(ctx, 659.25, now, 0.14, 0.13, "sine");
        playBellPartial(ctx, 987.77, now + 0.075, 0.26, 0.15, "sine");
        break;
      }

      case "warning": {
        // Gentle double low-marimba knock
        playBellPartial(ctx, 311.13, now, 0.14, 0.16, "triangle", 261.63);
        playBellPartial(ctx, 277.18, now + 0.12, 0.18, 0.16, "triangle", 220.0);
        break;
      }
    }
  } catch {
    // Ignore Web Audio API errors in restricted environments
  }

  return meta;
}
