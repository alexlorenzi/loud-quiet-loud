import type React from 'react';
import { useMemo, useState } from 'react';
import type { DiatonicChord, ChordQuality } from '../../types/music.js';
import { useAppStore } from '../../store/app-store.js';
import { computeScale } from '../../engine/music-theory.js';
import { getChordVariations } from '../../engine/chord-generator.js';
import { nameToPitchClass } from '../../engine/note-utils.js';
import { getDefaultVoicing } from '../../data/voicing-lookup.js';
import { ChordDiagram } from './ChordDiagram.js';
import styles from './ChordVariations.module.css';

interface ChordVariationsProps {
  chord: DiatonicChord;
}

export function ChordVariations({ chord }: ChordVariationsProps): React.JSX.Element {
  const { keyRoot, mode } = useAppStore();
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number | null>(null);

  const scale = useMemo(() => {
    const rootPitchClass = nameToPitchClass(keyRoot);
    const scaleType = mode === 'major' ? 'major' : 'natural-minor';
    return computeScale(rootPitchClass, scaleType);
  }, [keyRoot, mode]);

  const variations = useMemo(
    () => getChordVariations(chord, scale),
    [chord, scale]
  );

  if (variations.length === 0) {
    return (
      <div className={styles.variations}>
        <div className={styles.title}>No variations available</div>
      </div>
    );
  }

  return (
    <div className={styles.variations}>
      <div className={styles.title}>Variations for {chord.displayName}</div>

      <div className={styles.pills}>
        {variations.map((variation, index) => (
          <button
            key={index}
            className={`${styles.pill} ${
              selectedVariationIndex === index ? styles.selected : ''
            }`}
            onClick={() =>
              setSelectedVariationIndex(selectedVariationIndex === index ? null : index)
            }
          >
            {variation.displayName}
          </button>
        ))}
      </div>

      {selectedVariationIndex !== null && (
        <div className={styles.diagramGrid}>
          {(() => {
            const variation = variations[selectedVariationIndex];
            const voicing = getDefaultVoicing(
              variation.rootName,
              variation.quality as ChordQuality
            );

            if (!voicing) {
              return (
                <div className={styles.diagramCard}>
                  <div className={styles.diagramLabel}>No voicing data available</div>
                </div>
              );
            }

            return (
              <div className={styles.diagramCard}>
                <div className={styles.diagramLabel}>{variation.displayName}</div>
                <ChordDiagram
                  frets={voicing.frets}
                  fingers={voicing.fingers}
                  barres={voicing.barres}
                  baseFret={voicing.baseFret}
                  compact={false}
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
