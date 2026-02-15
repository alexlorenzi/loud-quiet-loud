import type { PitchClass, Mode, DiatonicChord, ChordQuality, ChordFunction, RomanNumeral, Scale } from '../types/music.js';
import { computeScale, SCALE_FORMULAS } from './music-theory.js';
import { pitchClassToName, getAccidentalPreference } from './note-utils.js';

export const CHORD_FUNCTION_MAP: Record<number, ChordFunction> = {
  1: 'tonic',
  2: 'subdominant',
  3: 'tonic',
  4: 'subdominant',
  5: 'dominant',
  6: 'tonic',
  7: 'dominant'
};

const MAJOR_KEY_QUALITIES: ChordQuality[] = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
const MINOR_KEY_QUALITIES: ChordQuality[] = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];

const MAJOR_KEY_ROMAN_NUMERALS: RomanNumeral[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viidim'];
const MINOR_KEY_ROMAN_NUMERALS: RomanNumeral[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viidim'];

export function getChordFunction(degree: number): ChordFunction {
  return CHORD_FUNCTION_MAP[degree] ?? 'tonic';
}

export function generateDiatonicChords(root: PitchClass, mode: Mode): DiatonicChord[] {
  const scaleType = mode === 'major' ? 'major' : 'natural-minor';
  const scale = computeScale(root, scaleType);
  const qualities = mode === 'major' ? MAJOR_KEY_QUALITIES : MINOR_KEY_QUALITIES;
  const romanNumerals = mode === 'major' ? MAJOR_KEY_ROMAN_NUMERALS : MINOR_KEY_ROMAN_NUMERALS;

  const preferSharps = getAccidentalPreference(pitchClassToName(root, true), mode) === 'sharps';

  const chords: DiatonicChord[] = [];

  for (let degree = 1; degree <= 7; degree++) {
    const degreeIndex = degree - 1;
    const chordRoot = scale.degrees[degreeIndex];
    const chordRootName = pitchClassToName(chordRoot, preferSharps);
    const quality = qualities[degreeIndex];
    const romanNumeral = romanNumerals[degreeIndex];

    const third = scale.degrees[(degreeIndex + 2) % 7];
    const fifth = scale.degrees[(degreeIndex + 4) % 7];
    const tones = [chordRoot, third, fifth];

    const displayName = formatChordDisplayName(chordRootName, quality);

    chords.push({
      degree,
      romanNumeral,
      root: chordRoot,
      rootName: chordRootName,
      quality,
      chordFunction: getChordFunction(degree),
      displayName,
      tones
    });
  }

  return chords;
}

export function getChordVariations(chord: DiatonicChord, scale: Scale): DiatonicChord[] {
  const variations: DiatonicChord[] = [];

  const seventh = scale.degrees[(chord.degree - 1 + 6) % 7];
  const ninth = scale.degrees[(chord.degree - 1 + 1) % 7];
  const fourth = scale.degrees[(chord.degree - 1 + 3) % 7];

  if (chord.quality === 'major') {
    variations.push({
      ...chord,
      quality: 'major7',
      displayName: `${chord.rootName}maj7`,
      tones: [...chord.tones, seventh]
    });

    variations.push({
      ...chord,
      quality: 'dominant7',
      displayName: `${chord.rootName}7`,
      tones: [...chord.tones, seventh]
    });

    variations.push({
      ...chord,
      quality: 'major9',
      displayName: `${chord.rootName}maj9`,
      tones: [...chord.tones, seventh, ninth]
    });

    variations.push({
      ...chord,
      quality: 'add9',
      displayName: `${chord.rootName}add9`,
      tones: [...chord.tones, ninth]
    });

    variations.push({
      ...chord,
      quality: 'sus2',
      displayName: `${chord.rootName}sus2`,
      tones: [chord.root, ((chord.root + 2) % 12) as PitchClass, chord.tones[2]]
    });

    variations.push({
      ...chord,
      quality: 'sus4',
      displayName: `${chord.rootName}sus4`,
      tones: [chord.root, fourth, chord.tones[2]]
    });
  } else if (chord.quality === 'minor') {
    variations.push({
      ...chord,
      quality: 'minor7',
      displayName: `${chord.rootName}m7`,
      tones: [...chord.tones, seventh]
    });

    variations.push({
      ...chord,
      quality: 'minor9',
      displayName: `${chord.rootName}m9`,
      tones: [...chord.tones, seventh, ninth]
    });

    variations.push({
      ...chord,
      quality: 'minor11',
      displayName: `${chord.rootName}m11`,
      tones: [...chord.tones, seventh, ninth, fourth]
    });
  } else if (chord.quality === 'diminished') {
    variations.push({
      ...chord,
      quality: 'half-diminished7',
      displayName: `${chord.rootName}m7b5`,
      tones: [...chord.tones, seventh]
    });
  }

  return variations;
}

function formatChordDisplayName(root: string, quality: ChordQuality): string {
  switch (quality) {
    case 'major':
      return root;
    case 'minor':
      return `${root}m`;
    case 'diminished':
      return `${root}dim`;
    case 'augmented':
      return `${root}aug`;
    case 'dominant7':
      return `${root}7`;
    case 'major7':
      return `${root}maj7`;
    case 'minor7':
      return `${root}m7`;
    case 'half-diminished7':
      return `${root}m7b5`;
    case 'sus2':
      return `${root}sus2`;
    case 'sus4':
      return `${root}sus4`;
    case 'add9':
      return `${root}add9`;
    case 'major9':
      return `${root}maj9`;
    case 'minor9':
      return `${root}m9`;
    case 'dominant9':
      return `${root}9`;
    case '11':
      return `${root}11`;
    case 'minor11':
      return `${root}m11`;
    default:
      return root;
  }
}
