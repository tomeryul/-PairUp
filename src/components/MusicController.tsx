import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * Generates a soft, slowly evolving ambient pad with the Web Audio API.
 * No audio files needed — keeps the bundle light and works offline.
 *
 * The whole audio graph is built when music turns on and torn down (with a
 * gentle fade-out) when it turns off or the component unmounts. Every node we
 * create — including the tremolo LFOs — is tracked so nothing leaks.
 */
export function MusicController() {
  const enabled = useAppStore((s) => s.musicEnabled);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;

    const ac = ctxRef.current ?? new AC();
    ctxRef.current = ac;
    void ac.resume();

    const now = ac.currentTime;
    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.05, now + 2.5);
    master.connect(ac.destination);

    // Track every oscillator (pad voices + tremolo LFOs) so we can stop them.
    const allOscs: OscillatorNode[] = [];

    // A warm, open chord across two octaves.
    const freqs = [220, 277.18, 329.63, 440];
    freqs.forEach((f, i) => {
      const osc = ac.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (i - 1.5) * 6;

      const g = ac.createGain();
      g.gain.value = 0.25 / freqs.length;

      // Slow tremolo for a breathing pad.
      const lfo = ac.createOscillator();
      lfo.frequency.value = 0.06 + i * 0.02;
      const lfoGain = ac.createGain();
      lfoGain.gain.value = 0.12 / freqs.length;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      lfo.start();

      osc.connect(g);
      g.connect(master);
      osc.start();

      allOscs.push(osc, lfo);
    });

    // Cleanup: fade the master down, then stop and disconnect everything.
    return () => {
      const t = ac.currentTime;
      try {
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(0.0001, t + 1.2);
      } catch {
        /* ignore */
      }
      allOscs.forEach((o) => {
        try {
          o.stop(t + 1.3);
        } catch {
          /* already stopped */
        }
      });
      window.setTimeout(() => {
        try {
          master.disconnect();
        } catch {
          /* ignore */
        }
      }, 1500);
    };
  }, [enabled]);

  return null;
}
