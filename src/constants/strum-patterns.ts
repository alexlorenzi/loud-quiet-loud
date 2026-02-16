import type { StrumPattern, StrumSlot } from '../types/strum.js';

/**
 * Genre-based strum patterns at eighth-note resolution.
 *
 * Slot positions: [1, &, 2, &, 3, &, 4, &]
 * D = downstroke, U = upstroke, A = accent down, x = ghost/muted, - = rest
 */

/** Maps genre strings (matching PresetProgression.genre) to strum patterns */
export const GENRE_STRUM_PATTERNS: Record<string, StrumPattern> = {
  // Classic campfire strum — syncopated, the missing downstroke on beat 3 creates groove
  'Pop/Rock': ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'],

  // Heavy downbeats with shuffle feel — ghost on &2, upstroke pickup into next bar
  'Blues': ['A', '-', 'D', 'x', 'A', '-', 'D', 'U'],

  // Sparse comping — understated, ghost on beat 2, plenty of space
  'Jazz': ['D', '-', 'x', 'U', '-', '-', 'D', '-'],

  // Relentless eighth-note drive — all downstrokes, accents on downbeats
  'Pop-Punk': ['A', 'D', 'A', 'D', 'A', 'D', 'A', 'D'],

  // Boom-chick alternating feel — accent on beat 1, down-up patterns
  'Folk/Country': ['A', '-', 'D', 'U', 'D', '-', 'D', 'U'],
};

/** Plain quarter-note downstrokes — used when genre has no specific pattern */
export const DEFAULT_STRUM_PATTERN: StrumPattern = ['D', '-', 'D', '-', 'D', '-', 'D', '-'];

/**
 * Velocity multipliers for each active strum slot type.
 * Applied via per-string gain nodes in GuitarSynth.
 */
export const STRUM_VELOCITY: Record<Exclude<StrumSlot, '-'>, number> = {
  A: 1.2,   // accent — slight boost above normal
  D: 0.85,  // downstroke — standard level
  U: 0.75,  // upstroke — naturally softer
  x: 0.3,   // ghost — muted, percussive
};

/** Look up the strum pattern for a genre, falling back to quarter-note downstrokes */
export function getStrumPatternForGenre(genre: string): StrumPattern {
  return GENRE_STRUM_PATTERNS[genre] ?? DEFAULT_STRUM_PATTERN;
}
