import type React from 'react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { getKeySignature } from '../../engine/music-theory.js';
import styles from './KeyInfo.module.css';

export function KeyInfo(): React.JSX.Element {
  const { keyRoot, mode } = useAppStore();

  const keySignature = useMemo(() => getKeySignature(keyRoot, mode), [keyRoot, mode]);

  const scaleNotesDisplay = keySignature.scaleNotes.join(' ');
  const relativeKeyDisplay = `${keySignature.relativeKey.root} ${
    keySignature.relativeKey.mode === 'major' ? 'Major' : 'Minor'
  }`;

  let signatureDisplay = '';
  if (keySignature.accidentalCount === 0) {
    signatureDisplay = 'No sharps/flats';
  } else {
    const accidentalType = keySignature.sharpsOrFlats === 'sharps' ? '♯' : '♭';
    signatureDisplay = `${keySignature.accidentalCount}${accidentalType}`;
  }

  return (
    <div className={styles.keyInfo}>
      <div className={styles.section}>
        <span className={styles.label}>Scale:</span>
        <span className={styles.scaleNotes}>{scaleNotesDisplay}</span>
      </div>
      <div className={styles.section}>
        <span className={styles.label}>Relative:</span>
        <span className={styles.relativeKey}>{relativeKeyDisplay}</span>
      </div>
      <div className={styles.section}>
        <span className={styles.signature}>{signatureDisplay}</span>
      </div>
    </div>
  );
}
