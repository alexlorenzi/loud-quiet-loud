import type React from 'react';
import styles from './SkipToContent.module.css';

export function SkipToContent(): React.JSX.Element {
  return (
    <a className={styles.skipLink} href="#main-content">
      Skip to main content
    </a>
  );
}
