import { SCALE_SHAPE_POSITIONS } from '../../constants/scales.js';
import { useAppStore } from '../../store/app-store.js';
import styles from './ScaleSelector.module.css';

export function ScaleSelector(): JSX.Element {
  const { selectedScaleShapeId, scaleShapeVisible, setScaleShape, toggleScaleShapeOverlay } =
    useAppStore();

  return (
    <div className={styles.selector}>
      <div className={styles.tabs}>
        {SCALE_SHAPE_POSITIONS.map((shape) => (
          <button
            key={shape.id}
            className={`${styles.tab} ${
              selectedScaleShapeId === shape.id ? styles.selected : ''
            }`}
            onClick={() => setScaleShape(shape.id)}
            aria-pressed={selectedScaleShapeId === shape.id}
          >
            {shape.name}
          </button>
        ))}
      </div>

      <button
        className={`${styles.toggle} ${scaleShapeVisible ? styles.active : ''}`}
        onClick={toggleScaleShapeOverlay}
        aria-pressed={scaleShapeVisible}
      >
        Shape {scaleShapeVisible ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
