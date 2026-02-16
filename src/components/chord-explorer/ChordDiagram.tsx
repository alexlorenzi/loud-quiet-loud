import type React from 'react';
import styles from './ChordDiagram.module.css';

interface ChordDiagramProps {
  frets: number[];
  fingers: number[];
  barres: number[];
  baseFret: number;
  compact?: boolean;
}

export function ChordDiagram({
  frets,
  fingers,
  barres,
  baseFret,
  compact = false,
}: ChordDiagramProps): React.JSX.Element {
  const strings = 6;
  const fretsToShow = 5;
  const stringSpacing = compact ? 12 : 16;
  const fretHeight = compact ? 16 : 20;
  const width = (strings - 1) * stringSpacing + 40;
  const height = fretsToShow * fretHeight + 40;
  const leftMargin = 20;
  const topMargin = 25;

  const showNut = baseFret === 1;

  return (
    <div className={styles.diagram}>
      <svg
        className={styles.svg}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Chord fingering diagram"
      >
        {/* Strings (vertical lines) */}
        {Array.from({ length: strings }).map((_, i) => {
          const x = leftMargin + i * stringSpacing;
          return (
            <line
              key={`string-${i}`}
              className={styles.string}
              x1={x}
              y1={topMargin}
              x2={x}
              y2={topMargin + fretsToShow * fretHeight}
            />
          );
        })}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: fretsToShow + 1 }).map((_, i) => {
          const y = topMargin + i * fretHeight;
          const isNut = showNut && i === 0;
          return (
            <line
              key={`fret-${i}`}
              className={isNut ? styles.nut : styles.fret}
              x1={leftMargin}
              y1={y}
              x2={leftMargin + (strings - 1) * stringSpacing}
              y2={y}
            />
          );
        })}

        {/* Muted/Open string markers */}
        {frets.map((fret, stringIndex) => {
          const x = leftMargin + stringIndex * stringSpacing;
          const y = topMargin - 12;

          if (fret === -1) {
            return (
              <text
                key={`marker-${stringIndex}`}
                className={styles.muted}
                x={x}
                y={y}
                textAnchor="middle"
              >
                X
              </text>
            );
          }

          if (fret === 0) {
            return (
              <text
                key={`marker-${stringIndex}`}
                className={styles.open}
                x={x}
                y={y}
                textAnchor="middle"
              >
                O
              </text>
            );
          }

          return null;
        })}

        {/* Barre bars */}
        {barres.map((barreFret, barreIndex) => {
          const fretPosition = barreFret - baseFret + 1;
          if (fretPosition < 1 || fretPosition > fretsToShow) return null;

          const y = topMargin + (fretPosition - 0.5) * fretHeight;
          const stringsInBarre = frets
            .map((f, i) => (f === barreFret ? i : -1))
            .filter((i) => i >= 0);

          if (stringsInBarre.length < 2) return null;

          const x1 = leftMargin + Math.min(...stringsInBarre) * stringSpacing;
          const x2 = leftMargin + Math.max(...stringsInBarre) * stringSpacing;

          return (
            <line
              key={`barre-${barreIndex}`}
              className={styles.barre}
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
            />
          );
        })}

        {/* Finger positions */}
        {frets.map((fret, stringIndex) => {
          if (fret <= 0) return null;

          const fretPosition = fret - baseFret + 1;
          if (fretPosition < 1 || fretPosition > fretsToShow) return null;

          const x = leftMargin + stringIndex * stringSpacing;
          const y = topMargin + (fretPosition - 0.5) * fretHeight;
          const finger = fingers[stringIndex];

          return (
            <g key={`finger-${stringIndex}`}>
              <circle className={styles.finger} cx={x} cy={y} r={compact ? 5 : 6} />
              {finger > 0 && (
                <text
                  className={styles.fingerNumber}
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}

        {/* Fret number indicator (when not showing nut) */}
        {!showNut && baseFret > 1 && (
          <text
            className={styles.fretNumber}
            x={leftMargin - 10}
            y={topMargin + fretHeight / 2 + 3}
            textAnchor="end"
          >
            {baseFret}
          </text>
        )}
      </svg>
    </div>
  );
}
