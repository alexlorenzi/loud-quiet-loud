import type { PitchClass, NoteName, Mode, NoteWithOctave } from '../types/music.js';

const SHARP_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES: NoteName[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SHARP_KEYS = new Set<string>([
  'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
  'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'
]);

const FLAT_KEYS = new Set<string>([
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'
]);

const NOTE_TO_PITCH_CLASS: Record<NoteName, PitchClass> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11,
  'Cb': 11
};

const ENHARMONIC_MAP: Partial<Record<NoteName, NoteName>> = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#'
};

export function pitchClassToName(pc: PitchClass, preferSharps: boolean): NoteName {
  return preferSharps ? SHARP_NAMES[pc] : FLAT_NAMES[pc];
}

export function nameToPitchClass(name: NoteName): PitchClass {
  return NOTE_TO_PITCH_CLASS[name];
}

export function getEnharmonic(name: NoteName): NoteName | null {
  return ENHARMONIC_MAP[name] ?? null;
}

export function getAccidentalPreference(keyRoot: NoteName, mode: Mode): 'sharps' | 'flats' {
  const keyName = mode === 'major' ? keyRoot : `${keyRoot}m`;

  if (SHARP_KEYS.has(keyName)) {
    return 'sharps';
  }
  if (FLAT_KEYS.has(keyName)) {
    return 'flats';
  }

  return 'sharps';
}

export function midiToNoteWithOctave(midi: number, preferSharps: boolean): NoteWithOctave {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = (midi % 12) as PitchClass;
  const noteName = pitchClassToName(pitchClass, preferSharps);
  return `${noteName}${octave}` as NoteWithOctave;
}

export function noteWithOctaveToMidi(note: NoteWithOctave): number {
  const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid note format: ${note}`);
  }

  const noteName = match[1] as NoteName;
  const octave = parseInt(match[2], 10);
  const pitchClass = nameToPitchClass(noteName);

  return (octave + 1) * 12 + pitchClass;
}
