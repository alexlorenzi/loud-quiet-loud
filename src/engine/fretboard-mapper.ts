import type { PitchClass, FretPosition, NoteWithOctave } from '../types/music.js';
import { midiToNoteWithOctave, nameToPitchClass } from './note-utils.js';
import { STANDARD_TUNING_MIDI, FRET_COUNT } from '../constants/tuning.js';

export { STANDARD_TUNING_MIDI, FRET_COUNT };

export function getNoteMidi(string: number, fret: number): number {
  return STANDARD_TUNING_MIDI[string] + fret;
}

export function getFretPosition(string: number, fret: number, preferSharps: boolean): FretPosition {
  const midiNote = getNoteMidi(string, fret);
  const noteWithOctave = midiToNoteWithOctave(midiNote, preferSharps);
  const pitchClass = (midiNote % 12) as PitchClass;

  const noteNameMatch = noteWithOctave.match(/^([A-G][#b]?)/);
  if (!noteNameMatch) {
    throw new Error(`Invalid note with octave: ${noteWithOctave}`);
  }
  const noteName = noteNameMatch[1] as any;

  return {
    string,
    fret,
    pitchClass,
    noteName,
    midiNote,
    noteWithOctave
  };
}

export function computeFretboard(preferSharps: boolean): FretPosition[][] {
  const fretboard: FretPosition[][] = [];

  for (let string = 0; string < 6; string++) {
    const stringPositions: FretPosition[] = [];
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      stringPositions.push(getFretPosition(string, fret, preferSharps));
    }
    fretboard.push(stringPositions);
  }

  return fretboard;
}
