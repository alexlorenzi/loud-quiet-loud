import type { PresetProgression } from '../../constants/progressions.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './ProgressionCard.module.css';

interface ProgressionCardProps {
  progression: PresetProgression;
  isSelected: boolean;
  isNowPlaying?: boolean;
  genreColor: string;
}

export function ProgressionCard({
  progression,
  isSelected,
  isNowPlaying = false,
  genreColor,
}: ProgressionCardProps): JSX.Element {
  const { setProgression } = useAppStore();

  const cardClasses = [styles.card];
  if (isSelected) cardClasses.push(styles.selected);
  if (isNowPlaying) cardClasses.push(styles.nowPlaying);

  const romanNumeralSequence = progression.pattern
    .map((chord) => chord.romanNumeral)
    .join(' - ');

  function handleClick(): void {
    setProgression(isSelected ? null : progression.id);
  }

  return (
    <button
      className={cardClasses.join(' ')}
      onClick={handleClick}
      aria-label={`${progression.name} progression`}
      aria-pressed={isSelected}
    >
      <div className={styles.genreBorder} style={{ background: genreColor }} />

      <div className={styles.header}>
        <span className={styles.name}>{progression.name}</span>
        <span className={styles.badge}>{progression.beatsPerChord} beats/chord</span>
      </div>

      <div className={styles.romanNumerals}>{romanNumeralSequence}</div>
      <div className={styles.feel}>{progression.feel}</div>
    </button>
  );
}
