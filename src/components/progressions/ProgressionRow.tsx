import type { PresetProgression } from '../../constants/progressions.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './ProgressionRow.module.css';

interface ProgressionRowProps {
  progression: PresetProgression;
  isSelected: boolean;
  isRevealed: boolean;
  genreColor: string;
}

export function ProgressionRow({
  progression,
  isSelected,
  isRevealed,
  genreColor,
}: ProgressionRowProps): JSX.Element {
  const { setProgression, toggleProgressionReveal } = useAppStore();

  const romanNumeralSequence = progression.pattern
    .map((chord) => chord.romanNumeral)
    .join(' \u2013 ');

  function handleClick(): void {
    setProgression(isSelected ? null : progression.id);
  }

  function handleRevealToggle(e: React.MouseEvent): void {
    e.stopPropagation();
    toggleProgressionReveal(progression.id);
  }

  return (
    <button
      className={`${styles.row} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
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
        <div
          className={`${styles.sequence} ${isRevealed ? styles.revealed : styles.redacted}`}
        >
          {romanNumeralSequence}
        </div>
      </div>

      <button
        className={styles.revealToggle}
        onClick={handleRevealToggle}
        aria-label={isRevealed ? 'Hide chord sequence' : 'Reveal chord sequence'}
        tabIndex={-1}
      >
        {isRevealed ? '\u25BE' : '\u25B8'}
      </button>
    </button>
  );
}
