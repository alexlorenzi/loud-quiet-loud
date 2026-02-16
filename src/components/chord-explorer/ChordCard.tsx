import type React from 'react';
import type { DiatonicChord } from '../../types/music.js';
import styles from './ChordCard.module.css';

interface ChordCardProps {
  chord: DiatonicChord;
  isSelected: boolean;
  isNowPlaying?: boolean;
  onClick: () => void;
}

export function ChordCard({
  chord,
  isSelected,
  isNowPlaying = false,
  onClick,
}: ChordCardProps): React.JSX.Element {
  const cardClasses = [styles.card];
  if (isSelected) cardClasses.push(styles.selected);
  if (isNowPlaying) cardClasses.push(styles.nowPlaying);

  return (
    <button
      className={cardClasses.join(' ')}
      onClick={onClick}
      aria-label={`${chord.romanNumeral} chord, ${chord.displayName}`}
      aria-pressed={isSelected}
    >
      <div className={`${styles.functionBorder} ${styles[chord.chordFunction]}`} />
      <div className={styles.romanNumeral}>{chord.romanNumeral}</div>
      <div className={styles.chordName}>{chord.displayName}</div>
    </button>
  );
}
