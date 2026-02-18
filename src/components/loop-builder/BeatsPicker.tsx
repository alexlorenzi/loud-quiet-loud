import type React from 'react';
import styles from './BeatsPicker.module.css';

interface BeatsPickerProps {
  value: number;
  onChange: (beats: number) => void;
}

export function BeatsPicker({ value, onChange }: BeatsPickerProps): React.JSX.Element {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Beats/chord:</span>
      <div className={styles.segmented}>
        <button
          className={`${styles.option} ${value === 2 ? styles.active : ''}`}
          onClick={() => onChange(2)}
          aria-pressed={value === 2}
        >
          2
        </button>
        <button
          className={`${styles.option} ${value === 4 ? styles.active : ''}`}
          onClick={() => onChange(4)}
          aria-pressed={value === 4}
        >
          4
        </button>
      </div>
    </div>
  );
}
