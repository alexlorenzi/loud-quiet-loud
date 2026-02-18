import type { PitchClass, ScaleType, Mode, ChordQuality } from '../types/music.js';
import type { ProgressionChord } from '../constants/progressions.js';
import { SCALE_FORMULAS } from './music-theory.js';
import { CHORD_INTERVALS } from './chord-tones.js';
import { generateDiatonicChords } from './chord-generator.js';
import { pitchClassToName } from './note-utils.js';

export interface ScaleRecommendation {
  scaleType: ScaleType;
  root: PitchClass;
  displayName: string;
  score: number;
  reason: string;
  tags: string[];
}

interface PerChordScore {
  degree: number;
  coverage: number;
  clashes: number;
}

interface ScoredCandidate {
  scaleType: ScaleType;
  coverageScore: number;
  clashPenalty: number;
  perChord: PerChordScore[];
}

const CANDIDATE_SCALES: ScaleType[] = [
  'major', 'natural-minor', 'dorian', 'mixolydian', 'phrygian',
  'lydian', 'harmonic-minor', 'pentatonic-major', 'pentatonic-minor', 'blues',
];

const SCALE_DISPLAY_NAMES: Record<ScaleType, string> = {
  'major': 'Major',
  'natural-minor': 'Natural Minor',
  'harmonic-minor': 'Harmonic Minor',
  'pentatonic-major': 'Major Pentatonic',
  'pentatonic-minor': 'Minor Pentatonic',
  'blues': 'Blues',
  'dorian': 'Dorian',
  'mixolydian': 'Mixolydian',
  'phrygian': 'Phrygian',
  'lydian': 'Lydian',
};

const PENTATONIC_TYPES = new Set<ScaleType>(['pentatonic-major', 'pentatonic-minor', 'blues']);

const W_COVERAGE = 0.60;
const W_CLASH = 0.25;
const W_PRACTICAL = 0.15;

function getChordTonePitchClasses(chordRoot: PitchClass, quality: ChordQuality): PitchClass[] {
  const intervals = CHORD_INTERVALS[quality];
  return intervals.map(interval => ((chordRoot + interval) % 12) as PitchClass);
}

export function scoreScale(
  scaleType: ScaleType,
  keyRoot: PitchClass,
  mode: Mode,
  progression: ProgressionChord[],
): ScoredCandidate {
  const formula = SCALE_FORMULAS[scaleType];
  const scaleDegrees = new Set(
    formula.map(interval => ((keyRoot + interval) % 12) as PitchClass),
  );

  const diatonicChords = generateDiatonicChords(keyRoot, mode);
  const perChord: PerChordScore[] = [];
  let totalCoverage = 0;
  let totalClashes = 0;
  let totalChordTones = 0;

  for (const loopChord of progression) {
    const diatonic = diatonicChords.find(c => c.degree === loopChord.degree);
    if (!diatonic) continue;

    const quality = loopChord.quality ?? diatonic.quality;
    const chordTones = getChordTonePitchClasses(diatonic.root, quality);
    let covered = 0;
    let clashes = 0;

    for (const tone of chordTones) {
      if (scaleDegrees.has(tone)) {
        covered++;
      } else {
        // Check for half-step clash: scale has a note 1 semitone away
        const above = ((tone + 1) % 12) as PitchClass;
        const below = ((tone - 1 + 12) % 12) as PitchClass;
        if (scaleDegrees.has(above) || scaleDegrees.has(below)) {
          clashes++;
        }
      }
    }

    const coverage = chordTones.length > 0 ? covered / chordTones.length : 1;
    perChord.push({ degree: loopChord.degree, coverage, clashes });
    totalCoverage += coverage;
    totalClashes += clashes;
    totalChordTones += chordTones.length;
  }

  const avgCoverage = progression.length > 0 ? totalCoverage / progression.length : 0;
  const maxPossibleClashes = Math.max(totalChordTones * 0.5, 1);
  const clashPenalty = Math.min(totalClashes / maxPossibleClashes, 1);

  return { scaleType, coverageScore: avgCoverage, clashPenalty, perChord };
}

function hasQualityInProgression(progression: ProgressionChord[], quality: ChordQuality): boolean {
  return progression.some(c => c.quality === quality);
}

function buildReason(
  scaleType: ScaleType,
  candidate: ScoredCandidate,
  mode: Mode,
  progression: ProgressionChord[],
): { reason: string; tags: string[] } {
  const tags: string[] = [];
  const reasons: string[] = [];

  if (PENTATONIC_TYPES.has(scaleType)) {
    tags.push('safe-choice');
    reasons.push('No avoid notes — safe over any chord.');
  }

  if (scaleType === 'blues') {
    tags.push('bluesy');
    if (hasQualityInProgression(progression, '7')) {
      reasons.push('Classic choice over dominant 7th chords.');
    }
  }

  if (scaleType === 'mixolydian') {
    tags.push('modal');
    if (hasQualityInProgression(progression, '7')) {
      reasons.push('Idiomatic over dominant 7th chords.');
    } else {
      reasons.push('Major sound with a b7 — adds bluesy color.');
    }
  }

  if (scaleType === 'dorian') {
    tags.push('modal');
    if (mode === 'minor') {
      reasons.push('Brighter than natural minor — the raised 6th avoids clash with dominant chords.');
    } else {
      reasons.push('Works well over minor chords in the progression.');
    }
  }

  if (scaleType === 'phrygian') {
    tags.push('modal');
    reasons.push('Dark, Spanish-flavored sound.');
  }

  if (scaleType === 'lydian') {
    tags.push('modal');
    reasons.push('Bright, dreamy quality with the raised 4th.');
  }

  if (scaleType === 'harmonic-minor') {
    tags.push('classical');
    reasons.push('Strong leading tone for minor key resolution.');
  }

  if (scaleType === 'major' && mode === 'major') {
    reasons.push('The parent scale of the key — covers all diatonic chord tones.');
  }

  if (scaleType === 'natural-minor' && mode === 'minor') {
    reasons.push('The parent scale of the key — covers all diatonic chord tones.');
  }

  if (candidate.coverageScore > 0.95 && candidate.clashPenalty < 0.1) {
    tags.push('perfect-fit');
  }

  const reason = reasons.length > 0
    ? reasons.join(' ')
    : `Covers ${Math.round(candidate.coverageScore * 100)}% of chord tones.`;

  return { reason, tags };
}

/**
 * Analyze a chord progression and return ranked scale recommendations.
 *
 * @param keyRoot - Current key root pitch class
 * @param mode - Current key mode
 * @param progression - The chord pattern to analyze
 * @param topN - Maximum results (default 5)
 */
export function recommendScales(
  keyRoot: PitchClass,
  mode: Mode,
  progression: ProgressionChord[],
  topN = 5,
): ScaleRecommendation[] {
  if (progression.length === 0) return [];

  const preferSharps = mode === 'major';
  const rootName = pitchClassToName(keyRoot, preferSharps);

  return CANDIDATE_SCALES
    .map(scaleType => {
      const candidate = scoreScale(scaleType, keyRoot, mode, progression);
      const practicalBonus = PENTATONIC_TYPES.has(scaleType) ? W_PRACTICAL : 0;
      const rawScore =
        candidate.coverageScore * W_COVERAGE
        - candidate.clashPenalty * W_CLASH
        + practicalBonus;
      const score = Math.max(0, Math.min(100, Math.round(rawScore * 100)));

      const { reason, tags } = buildReason(scaleType, candidate, mode, progression);
      const displayName = `${rootName} ${SCALE_DISPLAY_NAMES[scaleType]}`;

      return { scaleType, root: keyRoot, displayName, score, reason, tags };
    })
    .sort((a, b) => b.score - a.score || a.displayName.localeCompare(b.displayName))
    .slice(0, topN);
}
