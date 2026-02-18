import type React from 'react';
import styles from './LoopSlot.module.css';

interface LoopSlotProps {
  romanNumeral: string;
  displayName: string;
  beats: number;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function LoopSlot({
  romanNumeral,
  displayName,
  beats,
  isActive,
  isSelected,
  onSelect,
  onRemove,
}: LoopSlotProps): React.JSX.Element {
  const classes = [styles.slot];
  if (isActive) classes.push(styles.active);
  if (isSelected) classes.push(styles.selected);

  return (
    <div
      className={classes.join(' ')}
      data-loop-slot
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
      aria-label={`${romanNumeral} ${displayName}, ${beats} beat${beats !== 1 ? 's' : ''}`}
    >
      <span className={styles.roman}>{romanNumeral}</span>
      <span className={styles.name}>{displayName}</span>
      <span className={styles.beatsBadge}>{beats}</span>
      <button
        className={styles.remove}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        aria-label={`Remove ${displayName}`}
      >
        ×
      </button>
    </div>
  );
}
