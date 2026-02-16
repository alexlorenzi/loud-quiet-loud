import * as Tone from 'tone';
import { STANDARD_TUNING_MIDI } from '../constants/tuning.js';
import type { StrumDirection } from '../types/strum.js';

/** String index order for downstrokes (low E → high E) */
const DOWN_INDICES = [0, 1, 2, 3, 4, 5];
/** String index order for upstrokes (high E → low E) */
const UP_INDICES = [5, 4, 3, 2, 1, 0];

export class GuitarSynth {
  private strings: Tone.PluckSynth[];
  private stringGains: Tone.Gain[];

  constructor() {
    // Per-string gain nodes for velocity control
    this.stringGains = Array.from({ length: 6 }, () =>
      new Tone.Gain(1).toDestination()
    );

    // Route each PluckSynth through its gain node
    this.strings = Array.from({ length: 6 }, (_, i) =>
      new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.97,
      }).connect(this.stringGains[i])
    );
  }

  /**
   * Strum a chord voicing.
   *
   * @param frets - 6-element array: -1 = muted, 0 = open, >0 = fretted
   * @param baseFret - Barre/capo position (1-indexed)
   * @param time - Tone.js transport time (defaults to Tone.now())
   * @param strumDelay - Seconds between each string attack (default 0.01)
   * @param direction - 'down' = low-to-high, 'up' = high-to-low (default 'down')
   * @param velocity - Gain multiplier 0–1.2 (default 0.85)
   */
  strum(
    frets: number[],
    baseFret: number,
    time?: number,
    strumDelay = 0.01,
    direction: StrumDirection = 'down',
    velocity = 0.85
  ): void {
    const now = time ?? Tone.now();
    const indices = direction === 'up' ? UP_INDICES : DOWN_INDICES;

    let strumPosition = 0;
    for (const i of indices) {
      const fret = frets[i];
      if (fret === undefined || fret === -1) continue;

      let midi: number;
      if (fret === 0) {
        midi = STANDARD_TUNING_MIDI[i];
      } else {
        midi = STANDARD_TUNING_MIDI[i] + (baseFret - 1) + fret;
      }

      const freq = Tone.Frequency(midi, 'midi').toFrequency();
      const triggerTime = now + strumPosition * strumDelay;

      // Apply velocity via per-string gain
      this.stringGains[i].gain.setValueAtTime(velocity, triggerTime);
      this.strings[i].triggerAttack(freq, triggerTime);

      strumPosition++;
    }
  }

  /**
   * Play a single note by MIDI number (for fretboard click previews).
   */
  pluckNote(midi: number, time?: number): void {
    const now = time ?? Tone.now();
    const freq = Tone.Frequency(midi, 'midi').toFrequency();
    // Use string 0 (highest) for single note previews
    this.strings[0].triggerAttack(freq, now);
  }

  dispose(): void {
    for (const synth of this.strings) {
      synth.dispose();
    }
    for (const gain of this.stringGains) {
      gain.dispose();
    }
    this.strings = [];
    this.stringGains = [];
  }
}
