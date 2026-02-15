interface FretMarkersProps {
  fretWidth: number;
  leftMargin: number;
  topMargin: number;
  stringSpacing: number;
}

export function FretMarkers({
  fretWidth,
  leftMargin,
  topMargin,
  stringSpacing,
}: FretMarkersProps): JSX.Element {
  const markerFrets = [3, 5, 7, 9, 15];
  const doubleMarkerFrets = [12];
  const centerY = topMargin + (stringSpacing * 5) / 2;
  const radius = 6;
  const markerColor = 'var(--border-default)';

  return (
    <>
      {markerFrets.map((fret) => {
        const x = leftMargin + (fret - 0.5) * fretWidth;
        return (
          <circle
            key={`marker-${fret}`}
            cx={x}
            cy={centerY}
            r={radius}
            fill={markerColor}
          />
        );
      })}

      {doubleMarkerFrets.map((fret) => {
        const x = leftMargin + (fret - 0.5) * fretWidth;
        const offset = stringSpacing * 1.5;
        return (
          <g key={`double-marker-${fret}`}>
            <circle cx={x} cy={centerY - offset} r={radius} fill={markerColor} />
            <circle cx={x} cy={centerY + offset} r={radius} fill={markerColor} />
          </g>
        );
      })}
    </>
  );
}
