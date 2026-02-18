import type React from 'react';
import styles from './LoopSlot.module.css';

interface LoopSlotProps {
  romanNumeral: string;
  displayName: string;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function LoopSlot({
  romanNumeral,
  displayName,
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
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
      aria-label={`${romanNumeral} ${displayName}`}
    >
      <span className={styles.roman}>{romanNumeral}</span>
      <span className={styles.name}>{displayName}</span>
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
