import type React from 'react';
import { useRef, useCallback } from 'react';
import type { FretPosition } from '../../types/music.js';
import type { NoteDisplayType } from '../../types/ui.js';
import { FretMarkers } from './FretMarkers.js';
import { NoteCircle } from './NoteCircle.js';
import styles from './Fretboard.module.css';

interface FretboardProps {
  fretboard: FretPosition[][];
  noteClassifier: (pos: FretPosition) => NoteDisplayType;
  onNoteClick?: (pos: FretPosition) => void;
}

const FRETS_TO_SHOW = 15;
const STRING_SPACING = 40;
const FRET_WIDTH = 60;
const LEFT_MARGIN = 60;
const TOP_MARGIN = 40;
const BOTTOM_MARGIN = 40;

const STRING_THICKNESSES = [4, 3.5, 3, 2.5, 2, 1.5];

/**
 * Build an index of visible (non "non-scale") note positions for
 * roving-tabindex keyboard navigation.  Returns a 2D grid
 * [stringIndex][fret] => boolean indicating whether a note is visible.
 */
function buildVisibleNoteGrid(
  fretboard: FretPosition[][],
  noteClassifier: (pos: FretPosition) => NoteDisplayType,
): boolean[][] {
  return fretboard.map((stringPositions) =>
    stringPositions.slice(0, FRETS_TO_SHOW + 1).map((pos) => {
      const noteType = noteClassifier(pos);
      return noteType !== 'non-scale';
    }),
  );
}

export function Fretboard({
  fretboard,
  noteClassifier,
  onNoteClick,
}: FretboardProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = LEFT_MARGIN + FRET_WIDTH * FRETS_TO_SHOW + 60;
  const height = TOP_MARGIN + STRING_SPACING * 5 + BOTTOM_MARGIN;

  function getFretX(fret: number): number {
    if (fret === 0) return LEFT_MARGIN - 10;
    return LEFT_MARGIN + (fret - 0.5) * FRET_WIDTH;
  }

  function getStringY(string: number): number {
    return TOP_MARGIN + (5 - string) * STRING_SPACING;
  }

  /**
   * Roving tabindex keyboard handler.
   * Arrow keys navigate between visible notes on the fretboard grid.
   * Enter/Space triggers note playback.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, stringIndex: number, fret: number) => {
      const visibleGrid = buildVisibleNoteGrid(fretboard, noteClassifier);

      function focusNote(si: number, fi: number): void {
        const el = containerRef.current?.querySelector<SVGGElement>(
          `[data-string="${si}"][data-fret="${fi}"]`,
        );
        if (el) {
          el.focus();
        }
      }

      function findNextVisible(
        startString: number,
        startFret: number,
        dString: number,
        dFret: number,
      ): { s: number; f: number } | null {
        let s = startString + dString;
        let f = startFret + dFret;
        while (s >= 0 && s < fretboard.length && f >= 0 && f <= FRETS_TO_SHOW) {
          if (visibleGrid[s]?.[f]) return { s, f };
          s += dString;
          f += dFret;
        }
        return null;
      }

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const next = findNextVisible(stringIndex, fret, -1, 0);
          if (next) focusNote(next.s, next.f);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const next = findNextVisible(stringIndex, fret, 1, 0);
          if (next) focusNote(next.s, next.f);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const next = findNextVisible(stringIndex, fret, 0, -1);
          if (next) focusNote(next.s, next.f);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const next = findNextVisible(stringIndex, fret, 0, 1);
          if (next) focusNote(next.s, next.f);
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const pos = fretboard[stringIndex]?.[fret];
          if (pos) onNoteClick?.(pos);
          break;
        }
      }
    },
    [fretboard, noteClassifier, onNoteClick],
  );

  // Precompute the first visible note position for roving tabindex.
  // No manual useMemo — React Compiler handles memoization automatically.
  let firstVisibleNote: { string: number; fret: number } | null = null;
  for (let si = 0; si < fretboard.length && !firstVisibleNote; si++) {
    const stringPositions = fretboard[si];
    for (let fi = 0; fi <= FRETS_TO_SHOW && fi < stringPositions.length; fi++) {
      const noteType = noteClassifier(stringPositions[fi]);
      if (noteType !== 'non-scale') {
        firstVisibleNote = { string: si, fret: fi };
        break;
      }
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="grid"
        aria-label="Guitar fretboard"
      >
        {/* Strings */}
        {fretboard.map((_, stringIndex) => (
          <line
            key={`string-${stringIndex}`}
            className={styles.string}
            x1={LEFT_MARGIN}
            y1={getStringY(stringIndex)}
            x2={LEFT_MARGIN + FRET_WIDTH * FRETS_TO_SHOW}
            y2={getStringY(stringIndex)}
            strokeWidth={STRING_THICKNESSES[stringIndex]}
          />
        ))}

        {/* Frets */}
        {Array.from({ length: FRETS_TO_SHOW + 1 }).map((_, fretIndex) => {
          const x = LEFT_MARGIN + fretIndex * FRET_WIDTH;
          const isNut = fretIndex === 0;

          return (
            <line
              key={`fret-${fretIndex}`}
              className={isNut ? styles.nut : styles.fret}
              x1={x}
              y1={TOP_MARGIN}
              x2={x}
              y2={TOP_MARGIN + STRING_SPACING * 5}
            />
          );
        })}

        {/* Fret markers */}
        <FretMarkers
          fretWidth={FRET_WIDTH}
          leftMargin={LEFT_MARGIN}
          topMargin={TOP_MARGIN}
          stringSpacing={STRING_SPACING}
        />

        {/* Notes */}
        {fretboard.map((stringPositions, stringIndex) =>
          stringPositions.slice(0, FRETS_TO_SHOW + 1).map((pos) => {
            const noteType = noteClassifier(pos);
            if (noteType === 'non-scale') return null;

            const x = getFretX(pos.fret);
            const y = getStringY(stringIndex);

            // First visible note gets tabindex 0 (roving tabindex entry point)
            const isFirst = firstVisibleNote?.string === stringIndex && firstVisibleNote?.fret === pos.fret;

            return (
              <g
                key={`note-${stringIndex}-${pos.fret}`}
                className={styles.noteButton}
                onClick={() => onNoteClick?.(pos)}
                onKeyDown={(e) => handleKeyDown(e, stringIndex, pos.fret)}
                role="gridcell"
                aria-label={`${pos.noteName} on string ${6 - stringIndex}, fret ${pos.fret}`}
                tabIndex={isFirst ? 0 : -1}
                data-string={stringIndex}
                data-fret={pos.fret}
              >
                <NoteCircle
                  x={x}
                  y={y}
                  noteName={pos.noteName}
                  noteType={noteType}
                />
              </g>
            );
          })
        )}

        {/* Fret numbers */}
        {[3, 5, 7, 9, 12, 15].map((fret) => (
          <text
            key={`fret-num-${fret}`}
            className={styles.fretNumber}
            x={LEFT_MARGIN + (fret - 0.5) * FRET_WIDTH}
            y={height - 15}
            textAnchor="middle"
          >
            {fret}
          </text>
        ))}
      </svg>
    </div>
  );
}
