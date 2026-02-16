import type React from 'react';
import { useState } from 'react';
import styles from './LandscapePrompt.module.css';

const DISMISSED_KEY = 'lql-landscape-dismissed';

export function LandscapePrompt(): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(DISMISSED_KEY) === 'true';
  });

  if (dismissed) return null;

  function handleDismiss(): void {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  }

  return (
    <div className={styles.prompt} role="status">
      <span className={styles.icon} aria-hidden="true">
        &#x21BB;
      </span>
      <span className={styles.text}>
        Rotate to landscape for the best fretboard experience
      </span>
      <button
        className={styles.dismiss}
        onClick={handleDismiss}
        aria-label="Dismiss rotation suggestion"
      >
        &times;
      </button>
    </div>
  );
}
