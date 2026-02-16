import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { NoteName, Mode } from '../../types/music.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './KeySelector.module.css';

const MAJOR_KEYS: NoteName[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const MINOR_KEYS: NoteName[] = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'Eb', 'Bb', 'F', 'C', 'G', 'D'];

export function KeySelector(): React.JSX.Element {
  const { keyRoot, mode, setKey, setPlaybackState } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleKeyChange(root: NoteName, newMode: Mode): void {
    setKey(root, newMode);
    setPlaybackState('stopped');
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const displayText = `${keyRoot} ${mode === 'major' ? 'Major' : 'Minor'}`;

  return (
    <div className={styles.selector} ref={dropdownRef}>
      <button
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select musical key"
      >
        <span className={styles.label}>Key:</span>
        <span className={styles.value}>{displayText}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Major Keys</div>
            {MAJOR_KEYS.map((root) => (
              <button
                key={`major-${root}`}
                className={`${styles.option} ${
                  keyRoot === root && mode === 'major' ? styles.selected : ''
                }`}
                onClick={() => handleKeyChange(root, 'major')}
                role="option"
                aria-selected={keyRoot === root && mode === 'major'}
              >
                {root} Major
              </button>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Minor Keys</div>
            {MINOR_KEYS.map((root) => (
              <button
                key={`minor-${root}`}
                className={`${styles.option} ${
                  keyRoot === root && mode === 'minor' ? styles.selected : ''
                }`}
                onClick={() => handleKeyChange(root, 'minor')}
                role="option"
                aria-selected={keyRoot === root && mode === 'minor'}
              >
                {root} Minor
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
