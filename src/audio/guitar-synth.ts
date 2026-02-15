import * as Tone from 'tone';
import { STANDARD_TUNING_MIDI } from '../constants/tuning.js';

export class GuitarSynth {
  private strings: Tone.PluckSynth[];

  constructor() {
    this.strings = Array.from({ length: 6 }, () =>
      new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.97,
      }).toDestination()
    );
  }

  /**
   * Strum a chord voicing.
   * frets[i] === -1: muted string, skip
   * frets[i] === 0: open string = STANDARD_TUNING_MIDI[i]
   * frets[i] > 0: STANDARD_TUNING_MIDI[i] + (baseFret - 1) + frets[i]
   */
  strum(
    frets: number[],
    baseFret: number,
    time?: number,
    strumDelay = 0.01
  ): void {
    const now = time ?? Tone.now();

    for (let i = 0; i < 6; i++) {
      const fret = frets[i];
      if (fret === undefined || fret === -1) continue;

      let midi: number;
      if (fret === 0) {
        midi = STANDARD_TUNING_MIDI[i];
      } else {
        midi = STANDARD_TUNING_MIDI[i] + (baseFret - 1) + fret;
      }

      const freq = Tone.Frequency(midi, 'midi').toFrequency();
      // Strum from low strings to high with delay between each
      this.strings[i].triggerAttack(freq, now + i * strumDelay);
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
    this.strings = [];
  }
}
