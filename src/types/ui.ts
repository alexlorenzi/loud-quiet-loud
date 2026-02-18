export type NoteDisplayType = 'root' | '3rd' | '5th' | '7th' | '9th' | 'scale' | 'scale-highlight' | 'box-root' | 'box-scale' | 'box-blue-note' | 'non-scale';

/** A single note in a rendered box position */
export interface BoxNoteInfo {
  displayType: 'box-root' | 'box-scale' | 'box-blue-note';
  label: string;
}

/** Map keyed by "string-fret" for O(1) box position lookup */
export type BoxNoteMap = Map<string, BoxNoteInfo>;

export type MobileTab = 'chords' | 'fretboard' | 'scales';

export interface Announcement {
  message: string;
  timestamp: number;
}
