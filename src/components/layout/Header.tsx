import type React from 'react';
import type { ReactNode } from 'react';
import { useAppStore } from '../../store/app-store.js';
import styles from './Header.module.css';

interface HeaderProps {
  keySelector: ReactNode;
  keyInfo: ReactNode;
}

export function Header({ keySelector, keyInfo }: HeaderProps): React.JSX.Element {
  const highContrast = useAppStore((s) => s.highContrast);
  const toggleHighContrast = useAppStore((s) => s.toggleHighContrast);

  return (
    <div className={styles.header}>
      <div className={styles.logo}>LQL</div>
      <div className={styles.keyInfo}>
        {keySelector}
        {keyInfo}
      </div>
      <div className={styles.actions}>
        <button
          className={`${styles.contrastToggle} ${highContrast ? styles.active : ''}`}
          onClick={toggleHighContrast}
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
          title="High contrast"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
          </svg>
        </button>
        <div className={styles.presetDropdown}>
          {/* Preset dropdown placeholder */}
        </div>
      </div>
    </div>
  );
}
