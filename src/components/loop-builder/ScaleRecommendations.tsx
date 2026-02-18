import type React from 'react';
import { useAppStore } from '../../store/app-store.js';
import type { ScaleType } from '../../types/music.js';
import type { ScaleRecommendation } from '../../engine/scale-recommender.js';
import styles from './ScaleRecommendations.module.css';

interface ScaleRecommendationsProps {
  recommendations: ScaleRecommendation[];
}

const SUPPORTED_SCALE_TYPES = new Set<string>([
  'pentatonic-minor', 'pentatonic-major', 'blues', 'major',
]);

export function ScaleRecommendations({ recommendations }: ScaleRecommendationsProps): React.JSX.Element | null {
  const { selectOrDeselectScale } = useAppStore();

  if (recommendations.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Recommended scales:</span>
      <div className={styles.list}>
        {recommendations.map(rec => {
          const hasShape = SUPPORTED_SCALE_TYPES.has(rec.scaleType);
          return (
            <div key={rec.scaleType} className={styles.item}>
              <div className={styles.header}>
                <span className={styles.scaleName}>{rec.displayName}</span>
                <span className={styles.score}>{rec.score}%</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${rec.score}%` }} />
              </div>
              <div className={styles.reason}>{rec.reason}</div>
              {rec.tags.length > 0 && (
                <div className={styles.tags}>
                  {rec.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              {hasShape && (
                <button
                  className={styles.applyBtn}
                  onClick={() => selectOrDeselectScale(rec.scaleType as ScaleType)}
                >
                  Show on fretboard
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
