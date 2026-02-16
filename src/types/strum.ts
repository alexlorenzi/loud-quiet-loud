/**
 * Strum pattern types for genre-based strumming.
 *
 * Patterns operate at eighth-note resolution (8 slots per bar of 4/4 time).
 * Each slot maps to: [1, &, 2, &, 3, &, 4, &]
 */

/** Single eighth-note slot action */
export type StrumSlot =
  | 'D'  // downstroke (low-to-high, normal velocity)
  | 'U'  // upstroke (high-to-low, normal velocity)
  | 'A'  // accent downstroke (low-to-high, boosted velocity)
  | 'x'  // ghost/muted stroke (low-to-high, reduced velocity)
  | '-'; // rest (no strum)

/** One bar of 4/4 at eighth-note resolution: exactly 8 slots */
export type StrumPattern = readonly [
  StrumSlot, StrumSlot, StrumSlot, StrumSlot,
  StrumSlot, StrumSlot, StrumSlot, StrumSlot,
];

/** Strum direction for string iteration order */
export type StrumDirection = 'down' | 'up';
