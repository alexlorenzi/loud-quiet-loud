import type { ReactNode } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/app-store.js';
import styles from './MiniPlayer.module.css';

interface MiniPlayerProps {
  /** Full PlaybackControls component rendered inside the expanded overlay */
  fullControls: ReactNode;
}

export function MiniPlayer({ fullControls }: MiniPlayerProps): JSX.Element {
  const playbackState = useAppStore((s) => s.playbackState);
  const tempo = useAppStore((s) => s.tempo);
  const setPlaybackState = useAppStore((s) => s.setPlaybackState);
  const miniPlayerExpanded = useAppStore((s) => s.miniPlayerExpanded);
  const setMiniPlayerExpanded = useAppStore((s) => s.setMiniPlayerExpanded);

  const triggerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isPlaying = playbackState === 'playing';

  function handlePlayPause(): void {
    if (isPlaying) {
      setPlaybackState('paused');
    } else {
      setPlaybackState('playing');
    }
  }

  function handleExpand(): void {
    setMiniPlayerExpanded(true);
  }

  const handleClose = useCallback((): void => {
    setMiniPlayerExpanded(false);
    // Return focus to trigger
    triggerRef.current?.focus();
  }, [setMiniPlayerExpanded]);

  // Focus trap when expanded
  useEffect(() => {
    if (!miniPlayerExpanded) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key !== 'Tab' || !overlayRef.current) return;

      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [miniPlayerExpanded, handleClose]);

  if (miniPlayerExpanded) {
    return (
      <div
        className={styles.overlay}
        ref={overlayRef}
        role="dialog"
        aria-label="Playback controls"
        aria-modal="true"
      >
        <div className={styles.overlayHeader}>
          <span className={styles.overlayTitle}>Playback</span>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close playback controls"
          >
            &times;
          </button>
        </div>
        <div className={styles.overlayContent}>{fullControls}</div>
      </div>
    );
  }

  return (
    <div className={styles.miniPlayer} ref={triggerRef} tabIndex={-1}>
      <button
        className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
        onClick={handlePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '\u23F8' : '\u25B6'}
      </button>
      <div
        className={styles.info}
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        aria-label="Expand playback controls"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleExpand();
          }
        }}
      >
        <div className={styles.chordName}>&mdash;</div>
        <div className={styles.tempo}>{tempo} BPM</div>
      </div>
      <span className={styles.expandHint} aria-hidden="true">
        Tap for more
      </span>
    </div>
  );
}
