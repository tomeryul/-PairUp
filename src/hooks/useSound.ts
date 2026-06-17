import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

type SoundName = 'tap' | 'reveal' | 'success' | 'sparkle' | 'pop';

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
};

const tone = (
  freq: number,
  start: number,
  duration: number,
  gain = 0.08,
  type: OscillatorType = 'sine',
) => {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + start + duration,
  );
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.02);
};

const recipes: Record<SoundName, () => void> = {
  tap: () => tone(420, 0, 0.08, 0.05, 'triangle'),
  pop: () => tone(660, 0, 0.1, 0.06, 'sine'),
  reveal: () => {
    tone(523.25, 0, 0.18, 0.06);
    tone(659.25, 0.08, 0.22, 0.05);
  },
  success: () => {
    tone(523.25, 0, 0.16, 0.06);
    tone(659.25, 0.1, 0.16, 0.06);
    tone(783.99, 0.2, 0.28, 0.06);
  },
  sparkle: () => {
    tone(880, 0, 0.12, 0.04, 'triangle');
    tone(1174.66, 0.07, 0.14, 0.035, 'triangle');
    tone(1567.98, 0.14, 0.2, 0.03, 'triangle');
  },
};

/** Returns a play() callback that respects the user's sound preference. */
export function useSound() {
  const enabled = useAppStore((s) => s.soundEnabled);

  return useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      const ac = getCtx();
      if (ac && ac.state === 'suspended') ac.resume();
      try {
        recipes[name]();
      } catch {
        /* ignore audio errors */
      }
    },
    [enabled],
  );
}
