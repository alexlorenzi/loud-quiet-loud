import { describe, it, expect } from 'vitest';
import { recommendScales, scoreScale } from '../../engine/scale-recommender.js';
import type { PitchClass } from '../../types/music.js';
import type { ProgressionChord } from '../../constants/progressions.js';

const C: PitchClass = 0;
const A: PitchClass = 9;

describe('recommendScales', () => {
  it('returns empty array for empty progression', () => {
    expect(recommendScales(C, 'major', [])).toEqual([]);
  });

  it('ranks major scale highest for I-V-vi-IV in major', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, romanNumeral: 'I' },
      { degree: 5, romanNumeral: 'V' },
      { degree: 6, romanNumeral: 'vi' },
      { degree: 4, romanNumeral: 'IV' },
    ];
    const results = recommendScales(C, 'major', progression);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].scaleType).toBe('major');
  });

  it('includes blues or pentatonic-minor in results for I7-IV7-V7 blues', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 4, quality: '7', romanNumeral: 'IV7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' },
    ];
    const results = recommendScales(C, 'major', progression);
    const allTypes = results.map(r => r.scaleType);
    const hasBluesOrPentatonic =
      allTypes.includes('blues') || allTypes.includes('pentatonic-minor');
    expect(hasBluesOrPentatonic).toBe(true);
    // Mixolydian should rank high for dominant 7th progressions
    expect(allTypes).toContain('mixolydian');
  });

  it('ranks major in top 2 for ii-V-I jazz', () => {
    const progression: ProgressionChord[] = [
      { degree: 2, quality: 'm7', romanNumeral: 'iim7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' },
      { degree: 1, quality: 'maj7', romanNumeral: 'Imaj7' },
    ];
    const results = recommendScales(C, 'major', progression);
    const top2Types = results.slice(0, 2).map(r => r.scaleType);
    expect(top2Types).toContain('major');
  });

  it('ranks dorian or natural-minor at top for i-iv-v in minor', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, romanNumeral: 'i' },
      { degree: 4, romanNumeral: 'iv' },
      { degree: 5, romanNumeral: 'v' },
    ];
    const results = recommendScales(A, 'minor', progression);
    expect(results.length).toBeGreaterThan(0);
    const top2Types = results.slice(0, 2).map(r => r.scaleType);
    const hasMinorOrDorian =
      top2Types.includes('natural-minor') || top2Types.includes('dorian');
    expect(hasMinorOrDorian).toBe(true);
  });

  it('returns at most topN results', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, romanNumeral: 'I' },
      { degree: 4, romanNumeral: 'IV' },
    ];
    const results = recommendScales(C, 'major', progression, 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('includes displayName with root and scale name', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, romanNumeral: 'I' },
    ];
    const results = recommendScales(C, 'major', progression);
    expect(results[0].displayName).toMatch(/^C /);
  });

  it('scores are between 0 and 100', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 4, quality: '7', romanNumeral: 'IV7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' },
    ];
    const results = recommendScales(C, 'major', progression);
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

describe('scoreScale', () => {
  it('gives perfect coverage for major scale over diatonic major chords', () => {
    const progression: ProgressionChord[] = [
      { degree: 1, romanNumeral: 'I' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 5, romanNumeral: 'V' },
    ];
    const result = scoreScale('major', C, 'major', progression);
    expect(result.coverageScore).toBe(1);
    expect(result.clashPenalty).toBe(0);
  });

  it('penalizes clashes for lydian over IV chord', () => {
    // Lydian has #4 which clashes with the IV chord's root (perfect 4th)
    const progression: ProgressionChord[] = [
      { degree: 4, romanNumeral: 'IV' },
    ];
    const major = scoreScale('major', C, 'major', progression);
    const lydian = scoreScale('lydian', C, 'major', progression);
    // Major should have better coverage or fewer clashes than lydian on IV
    expect(major.coverageScore).toBeGreaterThanOrEqual(lydian.coverageScore);
  });
});
