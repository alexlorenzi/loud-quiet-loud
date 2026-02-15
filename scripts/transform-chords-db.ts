import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface RawChordPosition {
  frets: number[];
  fingers: number[];
  barres?: number[];
  capo?: boolean;
  baseFret: number;
  midi: number[];
}

interface RawChordData {
  key: string;
  suffix: string;
  positions: RawChordPosition[];
}

interface ChordPosition {
  frets: number[];
  fingers: number[];
  barres: number[];
  baseFret: number;
  midi: number[];
  isDefault: boolean;
}

interface ChordVoicingData {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

const MVP_SUFFIXES = new Set([
  'major', 'minor', 'dim', 'aug',
  '7', 'maj7', 'min7', 'm7b5',
  '9', 'maj9', 'min9', '11',
  'sus2', 'sus4', 'add9',
]);

// chords-db v0.5 ships a pre-compiled lib/guitar.json
const GUITAR_JSON_PATH = join(
  process.cwd(),
  'node_modules', '@tombatossals', 'chords-db', 'lib', 'guitar.json',
);
const OUTPUT_PATH = join(process.cwd(), 'src', 'data', 'chord-voicings.json');

// Key name mapping: chords-db uses "Csharp", "Eb", etc.
const KEY_NAME_MAP: Record<string, string> = {
  'C': 'C', 'Csharp': 'C#', 'D': 'D', 'Eb': 'Eb',
  'E': 'E', 'F': 'F', 'Fsharp': 'F#', 'G': 'G',
  'Ab': 'Ab', 'A': 'A', 'Bb': 'Bb', 'B': 'B',
};

function transformChordData(): void {
  console.log('Starting chord data transformation...');

  if (!existsSync(GUITAR_JSON_PATH)) {
    throw new Error(`guitar.json not found at: ${GUITAR_JSON_PATH}`);
  }

  const guitarDb = JSON.parse(readFileSync(GUITAR_JSON_PATH, 'utf-8')) as {
    chords: Record<string, RawChordData[]>;
  };

  const result: Record<string, ChordVoicingData> = {};
  let totalChords = 0;
  let includedChords = 0;

  for (const [dbKeyName, chords] of Object.entries(guitarDb.chords)) {
    const normalizedKey = KEY_NAME_MAP[dbKeyName] ?? dbKeyName;

    for (const chord of chords) {
      totalChords++;

      if (!MVP_SUFFIXES.has(chord.suffix)) continue;

      const positions: ChordPosition[] = chord.positions.map((pos, i) => ({
        frets: pos.frets,
        fingers: pos.fingers,
        barres: pos.barres ?? [],
        baseFret: pos.baseFret,
        midi: pos.midi,
        isDefault: i === 0,
      }));

      const lookupKey = `${normalizedKey}_${chord.suffix}`;
      result[lookupKey] = { key: normalizedKey, suffix: chord.suffix, positions };
      includedChords++;
    }
  }

  // Ensure output directory exists
  const outDir = dirname(OUTPUT_PATH);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`Transformation complete!`);
  console.log(`Total chords processed: ${totalChords}`);
  console.log(`Chords included (MVP suffixes): ${includedChords}`);
  console.log(`Output written to: ${OUTPUT_PATH}`);
}

try {
  transformChordData();
} catch (error) {
  console.error('Error transforming chord data:', error);
  process.exit(1);
}
