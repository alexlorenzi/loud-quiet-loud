import type React from 'react';
import type { PresetProgression } from '../../constants/progressions.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './ProgressionRow.module.css';

interface ProgressionRowProps {
  progression: PresetProgression;
  isSelected: boolean;
  genreColor: string;
}

export function ProgressionRow({
  progression,
  isSelected,
  genreColor,
}: ProgressionRowProps): React.JSX.Element {
  const { setProgression } = useAppStore();

  const romanNumeralSequence = progression.pattern
    .map((chord) => chord.romanNumeral)
    .join(' \u2013 ');

  function handleClick(): void {
    setProgression(isSelected ? null : progression.id);
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${progression.feel} progression`}
      aria-pressed={isSelected}
    >
      <div className={styles.genreMark} style={{ background: genreColor }} />

      <div className={styles.content}>
        <div className={styles.topLine}>
          <span className={styles.feel}>{progression.feel}</span>
          <span className={styles.chordCount}>
            {progression.pattern.length} chords
          </span>
        </div>
        <div className={styles.sequence}>
          {romanNumeralSequence}
        </div>
      </div>
    </div>
  );
}
