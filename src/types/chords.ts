export interface ChordVoicingData {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

export interface ChordPosition {
  frets: number[];
  fingers: number[];
  barres: number[];
  baseFret: number;
  midi: number[];
  isDefault: boolean;
}
