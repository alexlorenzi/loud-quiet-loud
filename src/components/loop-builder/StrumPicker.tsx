import type React from 'react';
import styles from './StrumPicker.module.css';

const STRUM_OPTIONS = [
  { genre: '', label: 'Default' },
  { genre: 'Pop/Rock', label: 'Pop' },
  { genre: 'Blues', label: 'Blues' },
  { genre: 'Jazz', label: 'Jazz' },
  { genre: 'Pop-Punk', label: 'Punk' },
  { genre: 'Folk/Country', label: 'Folk' },
];

interface StrumPickerProps {
  value: string;
  onChange: (genre: string) => void;
}

export function StrumPicker({ value, onChange }: StrumPickerProps): React.JSX.Element {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Strum pattern:</span>
      <div className={styles.chips}>
        {STRUM_OPTIONS.map(opt => (
          <button
            key={opt.genre}
            className={`${styles.chip} ${value === opt.genre ? styles.active : ''}`}
            onClick={() => onChange(opt.genre)}
            aria-pressed={value === opt.genre}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
