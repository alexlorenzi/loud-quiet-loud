import type { PitchClass, ChordQuality, IntervalName, Scale } from '../types/music.js';

export interface ChordToneInfo {
  pitchClass: PitchClass;
  intervalName: IntervalName;
  intervalLabel: string;
}

const INTERVAL_LABELS: Record<IntervalName, string> = {
  'root': 'Root',
  'minor-2nd': 'Minor 2nd',
  'major-2nd': 'Major 2nd',
  'minor-3rd': 'Minor 3rd',
  'major-3rd': 'Major 3rd',
  'perfect-4th': 'Perfect 4th',
  'tritone': 'Tritone',
  'perfect-5th': 'Perfect 5th',
  'minor-6th': 'Minor 6th',
  'major-6th': 'Major 6th',
  'minor-7th': 'Minor 7th',
  'major-7th': 'Major 7th'
};

const INTERVAL_TO_NAME: Record<number, IntervalName> = {
  0: 'root',
  1: 'minor-2nd',
  2: 'major-2nd',
  3: 'minor-3rd',
  4: 'major-3rd',
  5: 'perfect-4th',
  6: 'tritone',
  7: 'perfect-5th',
  8: 'minor-6th',
  9: 'major-6th',
  10: 'minor-7th',
  11: 'major-7th'
};

export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  'm7b5': [0, 3, 6, 10],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  'add9': [0, 2, 4, 7],
  'maj9': [0, 2, 4, 7, 11],
  'm9': [0, 2, 3, 7, 10],
  '9': [0, 2, 4, 7, 10],
  '11': [0, 2, 4, 5, 7, 10],
  'm11': [0, 2, 3, 5, 7, 10]
};

export function getChordTones(root: PitchClass, quality: ChordQuality): ChordToneInfo[] {
  const intervals = CHORD_INTERVALS[quality];
  if (!intervals) {
    throw new Error(`Unknown chord quality: ${quality}`);
  }

  return intervals.map(interval => {
    const pitchClass = ((root + interval) % 12) as PitchClass;
    const intervalName = INTERVAL_TO_NAME[interval];
    const intervalLabel = INTERVAL_LABELS[intervalName];

    return {
      pitchClass,
      intervalName,
      intervalLabel
    };
  });
}

export function classifyNoteAgainstChord(
  notePitchClass: PitchClass,
  chordTones: ChordToneInfo[],
  scale: Scale
): 'root' | '3rd' | '5th' | '7th' | '9th' | 'scale' | 'non-scale' {
  const toneIndex = chordTones.findIndex(tone => tone.pitchClass === notePitchClass);

  if (toneIndex === -1) {
    return scale.degrees.includes(notePitchClass) ? 'scale' : 'non-scale';
  }

  const intervalName = chordTones[toneIndex].intervalName;

  if (intervalName === 'root') {
    return 'root';
  }

  if (intervalName === 'minor-3rd' || intervalName === 'major-3rd') {
    return '3rd';
  }

  if (intervalName === 'perfect-5th' || intervalName === 'tritone' || intervalName === 'minor-6th') {
    return '5th';
  }

  if (intervalName === 'minor-7th' || intervalName === 'major-7th') {
    return '7th';
  }

  if (intervalName === 'major-2nd' || intervalName === 'minor-2nd') {
    return '9th';
  }

  return scale.degrees.includes(notePitchClass) ? 'scale' : 'non-scale';
}
