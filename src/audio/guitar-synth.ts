import * as Tone from 'tone';
import { STANDARD_TUNING_MIDI } from '../constants/tuning.js';
import type { StrumDirection } from '../types/strum.js';

/** String index order for downstrokes (low E → high E) */
const DOWN_INDICES = [0, 1, 2, 3, 4, 5];
/** String index order for upstrokes (high E → low E) */
const UP_INDICES = [5, 4, 3, 2, 1, 0];

/** Per-string PluckSynth parameters. Index 0 = low E (MIDI 40), index 5 = high e (MIDI 64). */
const STRING_PARAMS: ReadonlyArray<{ attackNoise: number; dampening: number; resonance: number }> = [
  { attackNoise: 1.4, dampening: 2800, resonance: 0.985 }, // 0: low E  — boomy, slow decay
  { attackNoise: 1.2, dampening: 3200, resonance: 0.982 }, // 1: A
  { attackNoise: 1.1, dampening: 3600, resonance: 0.978 }, // 2: D
  { attackNoise: 1.0, dampening: 4000, resonance: 0.975 }, // 3: G      — baseline
  { attackNoise: 0.8, dampening: 4600, resonance: 0.970 }, // 4: B
  { attackNoise: 0.6, dampening: 5200, resonance: 0.965 }, // 5: high e — thin, crisp
];

/** Humanization parameters */
const HUMANIZE = {
  /** ±seconds of random variation on the base strum delay */
  strumDelayJitter: 0.003,
  /** ±seconds of per-string micro-timing offset */
  timingJitter: 0.002,
  /** ±absolute offset on per-string velocity */
  velocityJitter: 0.08,
  /** How much velocity affects strum speed (accents faster, ghosts slower) */
  strumSpeedScale: 0.5,
} as const;

export class GuitarSynth {
  private strings: Tone.PluckSynth[];
  private stringGains: Tone.Gain[];
  private masterBus: Tone.Gain;
  private eq3: Tone.EQ3;
  private compressor: Tone.Compressor;
  private chorus: Tone.Chorus;
  private reverb: Tone.Reverb;

  constructor() {
    // Effects chain: masterBus → EQ3 → Compressor → Chorus → Reverb → Destination
    this.reverb = new Tone.Reverb({ decay: 0.8, preDelay: 0.01, wet: 0.25 });
    this.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.15,
      wet: 0.25,
    }).start();
    this.compressor = new Tone.Compressor({
      threshold: -18,
      ratio: 4,
      attack: 0.005,
      release: 0.1,
      knee: 6,
    });
    this.eq3 = new Tone.EQ3({
      low: 2,
      mid: 0,
      high: -4,
      lowFrequency: 250,
      highFrequency: 3500,
    });
    this.masterBus = new Tone.Gain(1);
    this.masterBus.chain(this.eq3, this.compressor, this.chorus, this.reverb, Tone.Destination);

    // Per-string gain nodes route into the master bus
    this.stringGains = Array.from({ length: 6 }, () =>
      new Tone.Gain(1).connect(this.masterBus)
    );

    // Per-string PluckSynths with differentiated parameters
    this.strings = Array.from({ length: 6 }, (_, i) =>
      new Tone.PluckSynth(STRING_PARAMS[i]).connect(this.stringGains[i])
    );
  }

  /**
   * Strum a chord voicing with humanized timing and velocity.
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

    // Velocity-linked strum speed: accents strum faster, ghosts slower
    const velocityOffset = (velocity - 0.85) / 0.85;
    const jitteredDelay =
      strumDelay * (1 - HUMANIZE.strumSpeedScale * velocityOffset) +
      (Math.random() * 2 - 1) * HUMANIZE.strumDelayJitter;
    const effectiveDelay = Math.max(0.003, jitteredDelay);

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

      // Per-string velocity jitter
      const velJitter = (Math.random() * 2 - 1) * HUMANIZE.velocityJitter;
      const stringVelocity = Math.max(0.05, velocity + velJitter);

      // Per-string timing micro-jitter
      const timeJitter = (Math.random() * 2 - 1) * HUMANIZE.timingJitter;
      const triggerTime = now + strumPosition * effectiveDelay + timeJitter;

      this.stringGains[i].gain.setValueAtTime(stringVelocity, triggerTime);
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
    this.masterBus.dispose();
    this.eq3.dispose();
    this.compressor.dispose();
    this.chorus.dispose();
    this.reverb.dispose();
    this.strings = [];
    this.stringGains = [];
  }
}
