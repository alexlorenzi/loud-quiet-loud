import type { PitchClass, ScaleShapePosition } from '../types/music.js';
import type { BoxNoteInfo, BoxNoteMap } from '../types/ui.js';
import { STANDARD_TUNING_MIDI, FRET_COUNT } from '../constants/tuning.js';

/**
 * Semitone interval → display label.
 * Covers every interval used by our four scale types.
 */
const INTERVAL_LABELS: Record<number, string> = {
  0: 'R',
  2: 'Δ2',
  3: 'b3',
  4: 'Δ3',
  5: 'p4',
  6: 'b5',
  7: 'p5',
  9: 'Δ6',
  10: 'b7',
  11: 'Δ7',
};

/**
 * Given a scale shape and the current key root, compute the set of
 * box-position notes with their fretboard coordinates, display labels, and colors.
 *
 * Pattern string convention: pattern.string 5 = low E, pattern.string 0 = high E
 * (reversed from fretboard array indexing where index 0 = low E).
 */
export function computeBoxNotes(
  shape: ScaleShapePosition,
  rootPitchClass: PitchClass,
): BoxNoteMap {
  const map: BoxNoteMap = new Map();

  // Compute the root fret from the anchor root position (always the first entry)
  const anchor = shape.rootPositions[0];
  const anchorFretboardIndex = 5 - anchor.string;
  const openMidi = STANDARD_TUNING_MIDI[anchorFretboardIndex];
  const openPitchClass = openMidi % 12;
  const rootFret = (rootPitchClass - openPitchClass + 12) % 12;

  for (const note of shape.pattern) {
    const actualFret = rootFret + note.fretOffset;
    if (actualFret < 0 || actualFret > FRET_COUNT) continue;

    // Convert pattern string to fretboard index
    const fretboardString = 5 - note.string;

    // Compute the actual pitch class at this position
    const midi = STANDARD_TUNING_MIDI[fretboardString] + actualFret;
    const pitchClass = midi % 12;
    const interval = (pitchClass - rootPitchClass + 12) % 12;

    const label = INTERVAL_LABELS[interval] ?? `${interval}`;

    let displayType: BoxNoteInfo['displayType'];
    if (interval === 0) {
      displayType = 'box-root';
    } else if (shape.scaleType === 'blues' && interval === 6) {
      displayType = 'box-blue-note';
    } else {
      displayType = 'box-scale';
    }

    map.set(`${fretboardString}-${actualFret}`, { displayType, label });
  }

  return map;
}
