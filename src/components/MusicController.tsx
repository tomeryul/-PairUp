import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * Generates a soft, slowly evolving ambient pad with the Web Audio API.
 * No audio files needed — keeps the bundle light and works offline.
 */
export function MusicController() {
  const enabled = useAppStore((s) => s.musicEnabled);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ master: GainNode; oscs: OscillatorNode[] } | null>(
    null,
  );

  useEffect(() => {
    if (!enabled) {
      // Fade out and stop.
      const ac = ctxRef.current;
      const nodes = nodesRef.current;
      if (ac && nodes) {
        nodes.master.gain.cancelScheduledValues(ac.currentTime);
        nodes.master.gain.setValueAtTime(nodes.master.gain.value, ac.currentTime);
        nodes.master.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);
        nodes.oscs.forEach((o) => o.stop(ac.currentTime + 1.4));
        nodesRef.current = null;
      }
      return;
    }

    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ac = ctxRef.current ?? new AC();
    ctxRef.current = ac;
    if (ac.state === 'suspended') ac.resume();

    const master = ac.createGain();
    master.gain.setValueAtTime(0, ac.currentTime);
    master.gain.linearRampToValueAtTime(0.05, ac.currentTime + 2.5);
    master.connect(ac.destination);

    // A warm, open chord (A major-ish) across two octaves.
    const freqs = [220, 277.18, 329.63, 440];
    const oscs = freqs.map((f, i) => {
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
      return osc;
    });

    nodesRef.current = { master, oscs };

    return () => {
      const nodes = nodesRef.current;
      if (nodes) {
        try {
          nodes.oscs.forEach((o) => o.stop());
        } catch {
          /* already stopped */
        }
      }
    };
  }, [enabled]);

  return null;
}
