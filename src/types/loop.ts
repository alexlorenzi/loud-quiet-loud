import type { ProgressionChord } from '../constants/progressions.js';

/** A custom loop constructed in the loop builder. */
export interface CustomLoop {
  chords: ProgressionChord[];
  beatsPerChord: number;
  strumGenre: string;
}

/** Unified descriptor from either a preset or custom loop. */
export interface ResolvedProgression {
  pattern: ProgressionChord[];
  beatsPerChord: number;
  genre: string;
  source: 'preset' | 'loop';
}
