import { SCALE_SHAPE_POSITIONS } from '../../constants/scales.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './ScaleSelector.module.css';

const SHORT_NAMES: Record<string, string> = {
  'pentatonic-minor-box1': 'Min Pent',
  'pentatonic-major-box1': 'Maj Pent',
  'major-3nps': 'Maj 3NPS',
  'natural-minor-3nps': 'Min 3NPS',
};

export function ScaleSelector(): JSX.Element {
  const { selectedScaleShapeId, scaleShapeVisible, selectOrDeselectShape } =
    useAppStore();

  return (
    <div className={styles.selector} role="radiogroup" aria-label="Scale shape overlay">
      <span className={styles.label}>SHAPE</span>
      <div className={styles.shapes}>
        {SCALE_SHAPE_POSITIONS.map((shape) => {
          const isActive = scaleShapeVisible && selectedScaleShapeId === shape.id;
          return (
            <button
              key={shape.id}
              className={`${styles.shape} ${isActive ? styles.active : ''}`}
              onClick={() => selectOrDeselectShape(shape.id)}
              role="radio"
              aria-checked={isActive}
              aria-label={shape.name}
              title={shape.description}
            >
              <span className={styles.shapeName}>
                {SHORT_NAMES[shape.id] ?? shape.name}
              </span>
              {isActive && <span className={styles.indicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
