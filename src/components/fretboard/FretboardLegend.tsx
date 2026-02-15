import type { NoteDisplayType } from '../../types/ui.js';
import styles from './FretboardLegend.module.css';

interface LegendEntry {
  type: NoteDisplayType;
  label: string;
}

const CHORD_ENTRIES: LegendEntry[] = [
  { type: 'root', label: 'Root' },
  { type: '3rd', label: '3rd' },
  { type: '5th', label: '5th' },
  { type: '7th', label: '7th' },
  { type: '9th', label: '9th' },
  { type: 'scale', label: 'Scale' },
];

const SCALE_ENTRIES: LegendEntry[] = [
  { type: 'scale', label: 'Scale note' },
];

const NOTE_COLORS: Record<NoteDisplayType, string> = {
  root: 'var(--note-root)',
  '3rd': 'var(--note-chord-tone)',
  '5th': 'var(--note-chord-tone)',
  '7th': 'var(--note-chord-tone)',
  '9th': 'var(--note-chord-tone)',
  scale: 'var(--note-scale)',
  'non-scale': 'var(--note-nonscale)',
};

function ShapeSwatch({ type }: { type: NoteDisplayType }): JSX.Element {
  const color = NOTE_COLORS[type];
  const s = 8; // half-size for shapes
  const cx = 10;
  const cy = 10;

  return (
    <svg className={styles.swatch} width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      {type === 'root' && (
        <circle cx={cx} cy={cy} r={s} fill={color} />
      )}
      {type === '3rd' && (
        <polygon
          points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
          fill={color}
        />
      )}
      {type === '5th' && (
        <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} fill={color} />
      )}
      {type === '7th' && (
        <polygon
          points={`${cx},${cy - s} ${cx + s},${cy + s} ${cx - s},${cy + s}`}
          fill={color}
        />
      )}
      {type === '9th' && (
        <circle cx={cx} cy={cy} r={s} fill="none" stroke={color} strokeWidth={2} />
      )}
      {type === 'scale' && (
        <circle cx={cx} cy={cy} r={s} fill="none" stroke={color} strokeWidth={2} />
      )}
    </svg>
  );
}

interface FretboardLegendProps {
  isChordActive: boolean;
}

export function FretboardLegend({ isChordActive }: FretboardLegendProps): JSX.Element {
  const entries = isChordActive ? CHORD_ENTRIES : SCALE_ENTRIES;

  return (
    <div className={styles.legend} aria-label="Fretboard legend">
      {entries.map((entry) => (
        <div key={entry.type + entry.label} className={styles.entry}>
          <ShapeSwatch type={entry.type} />
          <span className={styles.label}>{entry.label}</span>
        </div>
      ))}
    </div>
  );
}
