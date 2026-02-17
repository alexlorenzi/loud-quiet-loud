export type NoteDisplayType = 'root' | '3rd' | '5th' | '7th' | '9th' | 'scale' | 'scale-highlight' | 'non-scale';
export type NoteShape = 'filled-circle' | 'diamond' | 'square' | 'triangle' | 'outline-circle' | 'small-dot';

export interface NoteDisplayState {
  type: NoteDisplayType;
  shape: NoteShape;
  color: string;
}

export type MobileTab = 'chords' | 'fretboard' | 'scales';

export interface Announcement {
  message: string;
  timestamp: number;
}
