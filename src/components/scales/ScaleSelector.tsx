import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { ScaleType } from '../../types/music.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './ScaleSelector.module.css';

const SCALE_TYPES: { type: ScaleType; label: string }[] = [
  { type: 'pentatonic-minor', label: 'Min Pent' },
  { type: 'pentatonic-major', label: 'Maj Pent' },
  { type: 'blues', label: 'Blues' },
  { type: 'major', label: 'Major' },
];

const POSITIONS = [1, 2, 3, 4, 5];

export function ScaleSelector(): React.JSX.Element {
  const { selectedScaleType, selectedPosition, scaleShapeVisible, selectOrDeselectScale, setPosition } =
    useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = scaleShapeVisible && selectedScaleType !== null;

  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className={styles.selector} role="radiogroup" aria-label="Scale shape overlay">
      <span className={styles.label}>SHAPE</span>
      <div className={styles.shapes}>
        {SCALE_TYPES.map(({ type, label }) => {
          const selected = isActive && selectedScaleType === type;
          return (
            <div
              key={type}
              className={`${styles.shapeGroup} ${selected ? styles.activeGroup : ''}`}
              ref={selected ? dropdownRef : undefined}
            >
              <button
                className={`${styles.shape} ${selected ? styles.active : ''}`}
                onClick={() => {
                  selectOrDeselectScale(type);
                  setDropdownOpen(false);
                }}
                role="radio"
                aria-checked={selected}
                aria-label={label}
              >
                <span className={styles.shapeName}>{label}</span>
              </button>
              {selected && (
                <button
                  className={styles.positionButton}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                  aria-label={`Position ${selectedPosition}`}
                >
                  {selectedPosition}
                </button>
              )}
              {selected && dropdownOpen && (
                <div className={styles.dropdown} role="listbox">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      className={`${styles.dropdownOption} ${pos === selectedPosition ? styles.dropdownSelected : ''}`}
                      onClick={() => {
                        setPosition(pos);
                        setDropdownOpen(false);
                      }}
                      role="option"
                      aria-selected={pos === selectedPosition}
                    >
                      Pos {pos}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
