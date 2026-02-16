import type React from 'react';
import type { BeatGroup, BeatGroupTuple, ActiveSlot } from '../../engine/strum-notation.js';
import styles from './RhythmNotation.module.css';

/**
 * Rhythmic slash notation for strum patterns.
 *
 * Renders 4 beat groups (one per quarter-note beat) using standard music
 * notation: slash noteheads, stems, beams, flags, rests, accent marks,
 * and down/up strum arrows. All SVG elements use currentColor so the
 * CSS `color` property drives active/inactive highlighting.
 *
 * ViewBox per beat group: 0 0 28 52
 *   y 0–8:   accent mark zone
 *   y 8–36:  notehead + stem + beam/flag zone
 *   y 36–52: strum direction arrow zone
 */

// ── SVG glyph primitives ──────────────────────────────────────────────

/** Slash notehead (filled diamond/rhombus) centered at (cx, 28) */
function SlashNotehead({ cx }: { cx: number }): React.JSX.Element {
  return (
    <polygon
      points={`${cx - 5},28 ${cx},23 ${cx + 5},28 ${cx},33`}
      fill="currentColor"
    />
  );
}

/** Ghost/muted notehead (× shape) centered at (cx, 28) */
function GhostNotehead({ cx }: { cx: number }): React.JSX.Element {
  return (
    <g>
      <line x1={cx - 4} y1={24} x2={cx + 4} y2={32} strokeWidth="2" stroke="currentColor" />
      <line x1={cx - 4} y1={32} x2={cx + 4} y2={24} strokeWidth="2" stroke="currentColor" />
    </g>
  );
}

/** Vertical stem from notehead top up to beam/flag zone */
function Stem({ cx }: { cx: number }): React.JSX.Element {
  return (
    <line x1={cx} y1={23} x2={cx} y2={10} strokeWidth="1.5" stroke="currentColor" />
  );
}

/** Horizontal beam connecting two stems (for beamed eighth-note pairs) */
function Beam(): React.JSX.Element {
  return (
    <line x1={8} y1={10} x2={20} y2={10} strokeWidth="2.5" stroke="currentColor" />
  );
}

/** Eighth-note flag (for isolated eighth notes — no beam partner) */
function Flag({ cx }: { cx: number }): React.JSX.Element {
  return (
    <path
      d={`M${cx},10 Q${cx + 6},15 ${cx + 3},21`}
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
    />
  );
}

/** Quarter rest (zigzag glyph) centered horizontally in beat group */
function QuarterRest(): React.JSX.Element {
  return (
    <path
      d="M12,18 L16,23 L10,28 L16,33 L12,38"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
    />
  );
}

/** Eighth rest (slanted line with dot) positioned at cx */
function EighthRest({ cx }: { cx: number }): React.JSX.Element {
  return (
    <g>
      <line x1={cx + 2} y1={21} x2={cx - 2} y2={31} strokeWidth="1.5" stroke="currentColor" />
      <circle cx={cx + 2} cy={21} r="1.5" fill="currentColor" />
    </g>
  );
}

/** Accent mark (>) above the note */
function AccentMark({ cx }: { cx: number }): React.JSX.Element {
  return (
    <path
      d={`M${cx - 4},3 L${cx + 3},6 L${cx - 4},9`}
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Down-strum arrow (↓) below the notehead */
function DownArrow({ cx }: { cx: number }): React.JSX.Element {
  return (
    <path
      d={`M${cx},39 L${cx},48 M${cx - 3},45 L${cx},48 L${cx + 3},45`}
      strokeWidth="1.2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Up-strum arrow (↑) below the notehead */
function UpArrow({ cx }: { cx: number }): React.JSX.Element {
  return (
    <path
      d={`M${cx},48 L${cx},39 M${cx - 3},42 L${cx},39 L${cx + 3},42`}
      strokeWidth="1.2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

// ── Slot rendering helper ─────────────────────────────────────────────

/** Render notehead + stem + accent + arrow for an active slot at a given cx */
function NoteSlot({ cx, slot }: { cx: number; slot: ActiveSlot }): React.JSX.Element {
  const isGhost = slot === 'x';
  const isAccent = slot === 'A';
  const isUp = slot === 'U';

  return (
    <g>
      {isAccent && <AccentMark cx={cx} />}
      {isGhost ? <GhostNotehead cx={cx} /> : <SlashNotehead cx={cx} />}
      <Stem cx={cx} />
      {isUp ? <UpArrow cx={cx} /> : <DownArrow cx={cx} />}
    </g>
  );
}

// ── Beat group SVG ────────────────────────────────────────────────────

interface BeatGroupSvgProps {
  group: BeatGroup;
  activeSlot: 0 | 1 | null;
}

function BeatGroupSvg({ group, activeSlot }: BeatGroupSvgProps): React.JSX.Element {
  if (group.kind === 'quarter-rest') {
    return (
      <svg width="28" height="52" viewBox="0 0 28 52" className={styles.beatGroup}>
        <g className={styles.inactive}>
          <QuarterRest />
        </g>
      </svg>
    );
  }

  if (group.kind === 'quarter-note') {
    // Quarter note centered — highlights for both eighth positions (0 or 1)
    const isActive = activeSlot === 0 || activeSlot === 1;
    return (
      <svg width="28" height="52" viewBox="0 0 28 52" className={styles.beatGroup}>
        <g className={isActive ? styles.active : styles.inactive}>
          <NoteSlot cx={14} slot={group.slot} />
        </g>
      </svg>
    );
  }

  // beamed-eighths: two slots, potentially with beam connecting them
  const { down, up } = group;
  const bothNotes = down.type === 'note' && up.type === 'note';
  const downActive = activeSlot === 0;
  const upActive = activeSlot === 1;

  return (
    <svg width="28" height="52" viewBox="0 0 28 52" className={styles.beatGroup}>
      {/* Beam connecting both stems (only if both are notes) */}
      {bothNotes && (
        <g className={downActive || upActive ? styles.active : styles.inactive}>
          <Beam />
        </g>
      )}

      {/* Downbeat slot (left, cx=8) */}
      <g className={downActive ? styles.active : styles.inactive}>
        {down.type === 'note' ? (
          <g>
            <NoteSlot cx={8} slot={down.slot} />
            {!bothNotes && <Flag cx={8} />}
          </g>
        ) : (
          <EighthRest cx={8} />
        )}
      </g>

      {/* Upbeat slot (right, cx=20) */}
      <g className={upActive ? styles.active : styles.inactive}>
        {up.type === 'note' ? (
          <g>
            <NoteSlot cx={20} slot={up.slot} />
            {!bothNotes && <Flag cx={20} />}
          </g>
        ) : (
          <EighthRest cx={20} />
        )}
      </g>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────

interface RhythmNotationProps {
  beatGroups: BeatGroupTuple;
  activeEighth: number | null; // 0-7 within the bar, or null if not playing
}

export function RhythmNotation({ beatGroups, activeEighth }: RhythmNotationProps): React.JSX.Element {
  return (
    <div className={styles.notation}>
      {beatGroups.map((group, beatIndex) => {
        // Determine which slot within this beat is active (0=downbeat, 1=upbeat)
        let activeSlot: 0 | 1 | null = null;
        if (activeEighth !== null) {
          const beatStart = beatIndex * 2;
          if (activeEighth === beatStart) activeSlot = 0;
          else if (activeEighth === beatStart + 1) activeSlot = 1;
        }
        return (
          <BeatGroupSvg key={beatIndex} group={group} activeSlot={activeSlot} />
        );
      })}
    </div>
  );
}
