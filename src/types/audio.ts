export type PlaybackState = 'stopped' | 'playing' | 'paused' | 'count-in';

export interface ScheduledChord {
  voicing: { frets: number[]; baseFret: number };
  durationBeats: number;
}

export interface ScheduledProgression {
  chords: ScheduledChord[];
  totalBeats: number;
  beatsPerChord: number;
}
