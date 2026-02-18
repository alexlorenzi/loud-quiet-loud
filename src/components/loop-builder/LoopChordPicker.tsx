import type React from 'react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { generateDiatonicChords } from '../../engine/chord-generator.js';
import { nameToPitchClass } from '../../engine/note-utils.js';
import { getAudioEngine } from '../../audio/audio-engine.js';
import { ensureAudioContext } from '../../audio/context-manager.js';
import { getDefaultVoicing, VOICING_NOTE_NAMES } from '../../data/voicing-lookup.js';
import type { DiatonicChord } from '../../types/music.js';
import type { ProgressionChord } from '../../constants/progressions.js';
import styles from './LoopChordPicker.module.css';

interface LoopChordPickerProps {
  onAdd: (chord: ProgressionChord) => void;
  disabled: boolean;
}

function strumPreview(chord: DiatonicChord): void {
  void ensureAudioContext().then((ready) => {
    if (!ready) return;
    const noteName = VOICING_NOTE_NAMES[chord.root] ?? 'C';
    const pos = getDefaultVoicing(noteName, chord.quality);
    if (!pos) return;
    const engine = getAudioEngine();
    engine.guitar.strum(pos.frets, pos.baseFret);
  });
}

export function LoopChordPicker({ onAdd, disabled }: LoopChordPickerProps): React.JSX.Element {
  const { keyRoot, mode } = useAppStore();

  const diatonicChords = useMemo(() => {
    const rootPitchClass = nameToPitchClass(keyRoot);
    return generateDiatonicChords(rootPitchClass, mode);
  }, [keyRoot, mode]);

  function handleClick(chord: DiatonicChord): void {
    onAdd({
      degree: chord.degree,
      romanNumeral: chord.romanNumeral,
    });
    strumPreview(chord);
  }

  return (
    <div className={styles.grid}>
      {diatonicChords.map(chord => (
        <button
          key={chord.degree}
          className={styles.chordBtn}
          onClick={() => handleClick(chord)}
          disabled={disabled}
          aria-label={`Add ${chord.romanNumeral} ${chord.displayName}`}
        >
          <span className={styles.roman}>{chord.romanNumeral}</span>
          <span className={styles.name}>{chord.displayName}</span>
        </button>
      ))}
    </div>
  );
}
