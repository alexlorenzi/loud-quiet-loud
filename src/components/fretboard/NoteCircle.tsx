import type { NoteName } from '../../types/music.js';
import type { NoteDisplayType } from '../../types/ui.js';

interface NoteCircleProps {
  x: number;
  y: number;
  noteName: NoteName;
  noteType: NoteDisplayType;
}

const NOTE_SHAPES: Record<NoteDisplayType, 'circle' | 'diamond' | 'square' | 'triangle'> = {
  root: 'circle',
  '3rd': 'diamond',
  '5th': 'square',
  '7th': 'triangle',
  '9th': 'circle',
  scale: 'circle',
  'non-scale': 'circle',
};

const NOTE_COLORS: Record<NoteDisplayType, string> = {
  root: 'var(--note-root)',
  '3rd': 'var(--note-chord-tone)',
  '5th': 'var(--note-chord-tone)',
  '7th': 'var(--note-chord-tone)',
  '9th': 'var(--note-chord-tone)',
  scale: 'var(--note-scale)',
  'non-scale': 'var(--note-nonscale)',
};

export function NoteCircle({ x, y, noteName, noteType }: NoteCircleProps): JSX.Element {
  const shape = NOTE_SHAPES[noteType];
  const color = NOTE_COLORS[noteType];
  const size = noteType === 'non-scale' ? 4 : 12;
  const isFilled = noteType === 'root' || noteType === 'non-scale';

  if (shape === 'circle') {
    return (
      <g>
        <circle
          cx={x}
          cy={y}
          r={size}
          fill={isFilled ? color : 'none'}
          stroke={isFilled ? 'none' : color}
          strokeWidth={2}
        />
        {noteType !== 'non-scale' && (
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fill={isFilled ? 'var(--bg-primary)' : color}
            fontSize="10"
            fontFamily="var(--font-mono)"
            fontWeight="600"
          >
            {noteName}
          </text>
        )}
      </g>
    );
  }

  if (shape === 'diamond') {
    const points = `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`;
    return (
      <g>
        <polygon points={points} fill={color} />
        <text
          x={x}
          y={y + 3}
          textAnchor="middle"
          fill="var(--bg-primary)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {noteName}
        </text>
      </g>
    );
  }

  if (shape === 'square') {
    return (
      <g>
        <rect
          x={x - size}
          y={y - size}
          width={size * 2}
          height={size * 2}
          fill={color}
        />
        <text
          x={x}
          y={y + 3}
          textAnchor="middle"
          fill="var(--bg-primary)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {noteName}
        </text>
      </g>
    );
  }

  if (shape === 'triangle') {
    const points = `${x},${y - size} ${x + size},${y + size} ${x - size},${y + size}`;
    return (
      <g>
        <polygon points={points} fill={color} />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill="var(--bg-primary)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {noteName}
        </text>
      </g>
    );
  }

  return <></>;
}
