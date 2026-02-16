/** Chromatic note as integer 0-11 (C=0, C#=1, D=2, ..., B=11) */
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** Note name without octave */
export type NoteName =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb'
  | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#'
  | 'Ab' | 'A' | 'A#' | 'Bb' | 'B' | 'Cb';

/** Note with octave for audio pitch */
export type NoteWithOctave = `${NoteName}${number}`;

/** Musical mode */
export type Mode = 'major' | 'minor';

/** Scale type identifier */
export type ScaleType =
  | 'major'
  | 'natural-minor'
  | 'harmonic-minor'
  | 'pentatonic-major'
  | 'pentatonic-minor'
  | 'blues';

/** Scale formula as array of semitone intervals from root */
export type ScaleFormula = readonly number[];

/** Chord quality */
export type ChordQuality =
  | 'major' | 'minor' | 'dim' | 'aug'
  | '7' | 'maj7' | 'm7' | 'm7b5'
  | 'sus2' | 'sus4' | 'add9'
  | 'maj9' | 'm9' | '9'
  | '11' | 'm11';

/** Chord function in a key */
export type ChordFunction = 'tonic' | 'subdominant' | 'dominant';

/** Roman numeral degree */
export type RomanNumeral = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'viidim';

/** Interval name for display */
export type IntervalName =
  | 'root' | 'minor-2nd' | 'major-2nd' | 'minor-3rd' | 'major-3rd'
  | 'perfect-4th' | 'tritone' | 'perfect-5th' | 'minor-6th' | 'major-6th'
  | 'minor-7th' | 'major-7th';

/** A scale computed for a given key */
export interface Scale {
  root: PitchClass;
  type: ScaleType;
  degrees: PitchClass[];
  noteNames: NoteName[];
}

/** A diatonic chord in a key */
export interface DiatonicChord {
  degree: number;
  romanNumeral: RomanNumeral;
  root: PitchClass;
  rootName: NoteName;
  quality: ChordQuality;
  chordFunction: ChordFunction;
  displayName: string;
  tones: PitchClass[];
}

/** Key signature info */
export interface KeySignature {
  root: NoteName;
  mode: Mode;
  sharpsOrFlats: 'sharps' | 'flats' | 'neither';
  accidentalCount: number;
  scaleNotes: NoteName[];
  relativeKey: { root: NoteName; mode: Mode };
}

/** Fretboard position */
export interface FretPosition {
  string: number;
  fret: number;
  pitchClass: PitchClass;
  noteName: NoteName;
  midiNote: number;
  noteWithOctave: NoteWithOctave;
}

/** Scale shape position data (static, not derived) */
export interface ScaleShapePosition {
  id: string;
  name: string;
  scaleType: ScaleType;
  description: string;
  usage: string;
  pattern: Array<{
    string: number;
    fretOffset: number;
    degree: number;
    finger?: number;
  }>;
  span: number;
  rootPositions: Array<{ string: number; fretOffset: number }>;
}
