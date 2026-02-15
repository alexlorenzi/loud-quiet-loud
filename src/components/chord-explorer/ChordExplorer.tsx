import { useMemo } from 'react';
import type { DiatonicChord, ChordFunction } from '../../types/music.js';
import { useAppStore } from '../../store/app-store.js';
import { generateDiatonicChords } from '../../engine/chord-generator.js';
import { nameToPitchClass } from '../../engine/note-utils.js';
import { getAudioEngine } from '../../audio/audio-engine.js';
import { ensureAudioContext } from '../../audio/context-manager.js';
import { getDefaultVoicing, VOICING_NOTE_NAMES } from '../../data/voicing-lookup.js';
import { ChordCard } from './ChordCard.js';
import { ChordVariations } from './ChordVariations.js';
import styles from './ChordExplorer.module.css';

function strumChordPreview(chord: DiatonicChord): void {
  void ensureAudioContext().then((ready) => {
    if (!ready) return;

    const noteName = VOICING_NOTE_NAMES[chord.root] ?? 'C';
    const pos = getDefaultVoicing(noteName, chord.quality);

    if (!pos) return;

    const engine = getAudioEngine();
    engine.guitar.strum(pos.frets, pos.baseFret);
  });
}

const FUNCTION_INFO: Record<
  ChordFunction,
  { label: string; description: string }
> = {
  tonic: {
    label: 'Tonic',
    description: 'Home base, resolution, stable',
  },
  subdominant: {
    label: 'Subdominant',
    description: 'Movement away from home, preparation',
  },
  dominant: {
    label: 'Dominant',
    description: 'Tension, pull back to tonic',
  },
};

export function ChordExplorer(): JSX.Element {
  const { keyRoot, mode, selectedChordDegree, setSelectedChordDegree } = useAppStore();

  const diatonicChords = useMemo(() => {
    const rootPitchClass = nameToPitchClass(keyRoot);
    return generateDiatonicChords(rootPitchClass, mode);
  }, [keyRoot, mode]);

  const chordsByFunction = useMemo(() => {
    const grouped: Record<ChordFunction, DiatonicChord[]> = {
      tonic: [],
      subdominant: [],
      dominant: [],
    };

    for (const chord of diatonicChords) {
      grouped[chord.chordFunction].push(chord);
    }

    return grouped;
  }, [diatonicChords]);

  function handleChordClick(chord: DiatonicChord): void {
    // Toggle selection
    setSelectedChordDegree(selectedChordDegree === chord.degree ? null : chord.degree);
    // Strum preview
    strumChordPreview(chord);
  }

  return (
    <div className={styles.explorer}>
      <h2 className={styles.title}>Chord Explorer</h2>

      {(['tonic', 'subdominant', 'dominant'] as ChordFunction[]).map((func) => {
        const chords = chordsByFunction[func];
        if (chords.length === 0) return null;

        const info = FUNCTION_INFO[func];

        return (
          <div key={func} className={styles.functionGroup}>
            <div className={styles.functionHeader}>
              <div className={`${styles.functionIndicator} ${styles[func]}`} />
              <div>
                <div className={styles.functionLabel}>{info.label}</div>
                <div className={styles.functionDescription}>{info.description}</div>
              </div>
            </div>

            <div className={styles.chordGrid}>
              {chords.map((chord) => (
                <ChordCard
                  key={chord.degree}
                  chord={chord}
                  isSelected={selectedChordDegree === chord.degree}
                  onClick={() => handleChordClick(chord)}
                />
              ))}
            </div>

            {chords.some((chord) => selectedChordDegree === chord.degree) && (
              <ChordVariations
                chord={chords.find((c) => c.degree === selectedChordDegree)!}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
