import type React from 'react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { PRESET_PROGRESSIONS } from '../../constants/progressions.js';
import { getStrumPatternForGenre } from '../../constants/strum-patterns.js';
import { generateDiatonicChords } from '../../engine/chord-generator.js';
import { nameToPitchClass, pitchClassToName } from '../../engine/note-utils.js';
import { computeBeatGroups } from '../../engine/strum-notation.js';
import { getDefaultVoicing, VOICING_NOTE_NAMES } from '../../data/voicing-lookup.js';
import { ChordDiagram } from '../chord-explorer/ChordDiagram.js';
import { RhythmNotation } from './RhythmNotation.js';
import type { ChordQuality } from '../../types/music.js';
import type { ChordPosition } from '../../types/chords.js';
import styles from './ProgressionChordBar.module.css';

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  dim: 'dim',
  aug: 'aug',
  '7': '7',
  maj7: 'maj7',
  m7: 'm7',
  m7b5: 'm7b5',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  maj9: 'maj9',
  m9: 'm9',
  '9': '9',
  '11': '11',
  m11: 'm11',
};

interface ProgressionChord {
  romanNumeral: string;
  displayName: string;
  index: number;
  voicing: ChordPosition | null;
}

export function ProgressionChordBar(): React.JSX.Element | null {
  const {
    selectedProgressionId,
    keyRoot,
    mode,
    currentChordIndex,
    currentEighthInBar,
    playbackState,
  } = useAppStore();

  const chords = useMemo((): ProgressionChord[] => {
    if (!selectedProgressionId) return [];

    const preset = PRESET_PROGRESSIONS.find((p) => p.id === selectedProgressionId);
    if (!preset) return [];

    const rootPitchClass = nameToPitchClass(keyRoot);
    const diatonicChords = generateDiatonicChords(rootPitchClass, mode);

    return preset.pattern.map((patternChord, index) => {
      const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);
      let displayName = patternChord.romanNumeral;
      let voicing: ChordPosition | null = null;

      if (diatonic) {
        const quality = patternChord.quality ?? diatonic.quality;
        const noteName = pitchClassToName(diatonic.root, true);
        const suffix = QUALITY_SUFFIX[quality] ?? '';
        displayName = `${noteName}${suffix}`;

        const voicingNoteName = VOICING_NOTE_NAMES[diatonic.root] ?? 'C';
        voicing = getDefaultVoicing(voicingNoteName, quality);
      }

      return {
        romanNumeral: patternChord.romanNumeral,
        displayName,
        index,
        voicing,
      };
    });
  }, [selectedProgressionId, keyRoot, mode]);

  const beatGroups = useMemo(() => {
    if (!selectedProgressionId) return null;
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === selectedProgressionId);
    const strumPattern = getStrumPatternForGenre(preset?.genre ?? '');
    return computeBeatGroups(strumPattern);
  }, [selectedProgressionId]);

  if (chords.length === 0) return null;

  const isPlaying = playbackState === 'playing' || playbackState === 'paused';

  return (
    <div className={styles.staff}>
      {chords.map((chord, i) => {
        const isCurrent = isPlaying && chord.index === currentChordIndex;
        const showChord = i === 0 || chord.displayName !== chords[i - 1].displayName;

        return (
          <div
            key={chord.index}
            className={`${styles.measure} ${isCurrent ? styles.activeMeasure : ''}`}
          >
            <div className={styles.chordLabel}>
              {showChord && (
                <>
                  {chord.voicing && (
                    <div className={styles.diagram}>
                      <ChordDiagram
                        frets={chord.voicing.frets}
                        fingers={chord.voicing.fingers}
                        barres={chord.voicing.barres}
                        baseFret={chord.voicing.baseFret}
                        compact
                      />
                    </div>
                  )}
                  <span className={styles.name}>{chord.displayName}</span>
                  <span className={styles.roman}>{chord.romanNumeral}</span>
                </>
              )}
            </div>

            {beatGroups && (
              <RhythmNotation
                beatGroups={beatGroups}
                activeEighth={isCurrent ? currentEighthInBar : null}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
