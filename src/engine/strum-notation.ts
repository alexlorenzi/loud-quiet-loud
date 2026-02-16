/**
 * Beat grouping logic for rendering strum patterns as rhythmic notation.
 *
 * Converts an 8-slot StrumPattern (eighth-note resolution) into 4 BeatGroups
 * that determine the visual notation for each quarter-note beat:
 * - quarter-note: single notehead + stem (downbeat active, upbeat rest)
 * - quarter-rest: both slots silent
 * - beamed-eighths: two slots rendered with beam (both notes), flag (one note), or rest
 */

import type { StrumSlot, StrumPattern } from '../types/strum.js';

/** Active strum slot (excludes rest) */
export type ActiveSlot = Exclude<StrumSlot, '-'>;

/** What to render for a single eighth-note position within a beamed pair */
export type SlotRender =
  | { type: 'note'; slot: ActiveSlot }
  | { type: 'rest' };

/** Visual representation of one quarter-note beat (2 eighth-note slots) */
export type BeatGroup =
  | { kind: 'quarter-note'; slot: ActiveSlot }
  | { kind: 'quarter-rest' }
  | { kind: 'beamed-eighths'; down: SlotRender; up: SlotRender };

/** Tuple of 4 BeatGroups (one per beat in a 4/4 bar) */
export type BeatGroupTuple = readonly [BeatGroup, BeatGroup, BeatGroup, BeatGroup];

/**
 * Convert an 8-slot StrumPattern into 4 BeatGroups for notation rendering.
 *
 * Rules:
 *   downbeat note + upbeat rest  → quarter-note (single stem, no beam)
 *   both rest                    → quarter-rest
 *   any other combination        → beamed-eighths (rest+note, note+note, note+rest)
 */
export function computeBeatGroups(pattern: StrumPattern): BeatGroupTuple {
  const groups: BeatGroup[] = [];

  for (let beat = 0; beat < 4; beat++) {
    const downSlot = pattern[beat * 2];
    const upSlot = pattern[beat * 2 + 1];
    const downActive = downSlot !== '-';
    const upActive = upSlot !== '-';

    if (downActive && !upActive) {
      groups.push({ kind: 'quarter-note', slot: downSlot as ActiveSlot });
    } else if (!downActive && !upActive) {
      groups.push({ kind: 'quarter-rest' });
    } else {
      groups.push({
        kind: 'beamed-eighths',
        down: downActive
          ? { type: 'note', slot: downSlot as ActiveSlot }
          : { type: 'rest' },
        up: upActive
          ? { type: 'note', slot: upSlot as ActiveSlot }
          : { type: 'rest' },
      });
    }
  }

  return groups as unknown as BeatGroupTuple;
}
