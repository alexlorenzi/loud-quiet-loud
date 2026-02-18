import type { PitchClass, NoteName, Mode, Scale, ScaleType, ScaleFormula, KeySignature } from '../types/music.js';
import { pitchClassToName, nameToPitchClass, getAccidentalPreference } from './note-utils.js';

const SHARP_PREFERRED_SCALES = new Set<ScaleType>([
  'major', 'pentatonic-major', 'blues', 'mixolydian', 'lydian',
]);

export const SCALE_FORMULAS: Record<ScaleType, ScaleFormula> = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'natural-minor': [0, 2, 3, 5, 7, 8, 10],
  'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
  'pentatonic-major': [0, 2, 4, 7, 9],
  'pentatonic-minor': [0, 3, 5, 7, 10],
  'blues': [0, 3, 5, 6, 7, 10],
  'dorian': [0, 2, 3, 5, 7, 9, 10],
  'mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'phrygian': [0, 1, 3, 5, 7, 8, 10],
  'lydian': [0, 2, 4, 6, 7, 9, 11],
};

const CIRCLE_OF_FIFTHS_SHARPS: NoteName[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const CIRCLE_OF_FIFTHS_FLATS: NoteName[] = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

const RELATIVE_MINOR_OFFSET = 9;
const RELATIVE_MAJOR_OFFSET = 3;

export function computeScale(root: PitchClass, type: ScaleType): Scale {
  const formula = SCALE_FORMULAS[type];
  const degrees = formula.map(interval => ((root + interval) % 12) as PitchClass);

  const preferSharps = SHARP_PREFERRED_SCALES.has(type);
  const noteNames = degrees.map(pc => pitchClassToName(pc, preferSharps));

  return {
    root,
    type,
    degrees,
    noteNames
  };
}

export function getKeySignature(root: NoteName, mode: Mode): KeySignature {
  const rootPitchClass = nameToPitchClass(root);
  const scaleType = mode === 'major' ? 'major' : 'natural-minor';
  const scale = computeScale(rootPitchClass, scaleType);

  const preferSharps = getAccidentalPreference(root, mode);
  const scaleNotes = scale.degrees.map(pc => pitchClassToName(pc, preferSharps === 'sharps'));

  let sharpsOrFlats: 'sharps' | 'flats' | 'neither';
  let accidentalCount = 0;

  if (mode === 'major') {
    const sharpIndex = CIRCLE_OF_FIFTHS_SHARPS.indexOf(root);
    const flatIndex = CIRCLE_OF_FIFTHS_FLATS.indexOf(root);

    if (sharpIndex > 0) {
      sharpsOrFlats = 'sharps';
      accidentalCount = sharpIndex;
    } else if (flatIndex > 0) {
      sharpsOrFlats = 'flats';
      accidentalCount = flatIndex;
    } else {
      sharpsOrFlats = 'neither';
      accidentalCount = 0;
    }
  } else {
    const relativeMajorPitchClass = ((rootPitchClass + RELATIVE_MAJOR_OFFSET) % 12) as PitchClass;
    const relativeMajorRoot = pitchClassToName(relativeMajorPitchClass, preferSharps === 'sharps');
    const relativeMajorSig = getKeySignature(relativeMajorRoot, 'major');
    sharpsOrFlats = relativeMajorSig.sharpsOrFlats;
    accidentalCount = relativeMajorSig.accidentalCount;
  }

  let relativeKey: { root: NoteName; mode: Mode };
  if (mode === 'major') {
    const relativeMinorPitchClass = ((rootPitchClass + RELATIVE_MINOR_OFFSET) % 12) as PitchClass;
    const relativeMinorRoot = pitchClassToName(relativeMinorPitchClass, preferSharps === 'sharps');
    relativeKey = { root: relativeMinorRoot, mode: 'minor' };
  } else {
    const relativeMajorPitchClass = ((rootPitchClass + RELATIVE_MAJOR_OFFSET) % 12) as PitchClass;
    const relativeMajorRoot = pitchClassToName(relativeMajorPitchClass, preferSharps === 'sharps');
    relativeKey = { root: relativeMajorRoot, mode: 'major' };
  }

  return {
    root,
    mode,
    sharpsOrFlats,
    accidentalCount,
    scaleNotes,
    relativeKey
  };
}

export function isNoteInScale(pitchClass: PitchClass, scale: Scale): boolean {
  return scale.degrees.includes(pitchClass);
}

export function getScaleDegree(pitchClass: PitchClass, scale: Scale): number | null {
  const index = scale.degrees.indexOf(pitchClass);
  return index === -1 ? null : index + 1;
}
