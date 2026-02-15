import type { ChordQuality } from '../types/music.js';
import type { ChordVoicingData, ChordPosition } from '../types/chords.js';

/**
 * Pitch class (0-11) to the note name convention used in chords-db keys.
 */
export const VOICING_NOTE_NAMES: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B',
};

/** Normalize chords-db key names: "Csharp" -> "C#", "Fsharp" -> "F#" */
const DB_KEY_NAME_MAP: Record<string, string> = {
  C: 'C', Csharp: 'C#', D: 'D', Eb: 'Eb',
  E: 'E', F: 'F', Fsharp: 'F#', G: 'G',
  Ab: 'Ab', A: 'A', Bb: 'Bb', B: 'B',
};

interface RawPosition {
  frets: number[];
  fingers: number[];
  barres?: number[];
  baseFret: number;
  midi: number[];
}

interface RawChord {
  key: string;
  suffix: string;
  positions: RawPosition[];
}

interface RawGuitarDb {
  chords: Record<string, RawChord[]>;
}

// Vite handles JSON imports from node_modules at build time.
// We cast through unknown since the JSON has no .d.ts.
import rawGuitarDb from '@tombatossals/chords-db/lib/guitar.json' with { type: 'json' };
const guitarDb = rawGuitarDb as unknown as RawGuitarDb;

// Lazy-initialized flat lookup: "C#_maj7" -> ChordVoicingData
let _lookup: Record<string, ChordVoicingData> | null = null;

function getLookup(): Record<string, ChordVoicingData> {
  if (_lookup) return _lookup;

  const result: Record<string, ChordVoicingData> = {};

  for (const [dbKeyName, chords] of Object.entries(guitarDb.chords)) {
    const normalizedKey = DB_KEY_NAME_MAP[dbKeyName] ?? dbKeyName;

    for (const chord of chords as RawChord[]) {
      const positions: ChordPosition[] = chord.positions.map((pos) => ({
        frets: pos.frets,
        fingers: pos.fingers,
        barres: pos.barres ?? [],
        baseFret: pos.baseFret,
        midi: pos.midi,
      }));

      const lookupKey = `${normalizedKey}_${chord.suffix}`;
      result[lookupKey] = { key: normalizedKey, suffix: chord.suffix, positions };
    }
  }

  _lookup = result;
  return result;
}

/**
 * Get all voicing data for a chord (root name + quality/suffix).
 * Returns null if no voicing data exists.
 */
export function getVoicingData(rootName: string, quality: ChordQuality): ChordVoicingData | null {
  const lookup = getLookup();
  return lookup[`${rootName}_${quality}`] ?? null;
}

/**
 * Get the default (first) voicing position for a chord.
 * Returns null if no voicing data exists.
 */
export function getDefaultVoicing(rootName: string, quality: ChordQuality): ChordPosition | null {
  const data = getVoicingData(rootName, quality);
  if (!data?.positions || data.positions.length === 0) return null;
  return data.positions[0];
}

/**
 * Get all voicing positions for a chord.
 * Returns empty array if no voicing data exists.
 */
export function getAllVoicings(rootName: string, quality: ChordQuality): ChordPosition[] {
  const data = getVoicingData(rootName, quality);
  return data?.positions ?? [];
}
