import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { useTheoryContent } from '../../hooks/useTheoryContent.js';
import { getTheoryContent } from '../../constants/theory-content.js';
import styles from './TheoryPopup.module.css';

const CATEGORY_LABELS: Record<string, string> = {
  'chord-function': 'Chord Function',
  progression: 'Progression',
  scale: 'Scale',
  interval: 'Concept',
};

export function TheoryPopup(): JSX.Element | null {
  const activeId = useAppStore((s) => s.activeTheoryPopupId);
  const setTheoryPopup = useAppStore((s) => s.setTheoryPopup);
  const keyRoot = useAppStore((s) => s.keyRoot);
  const mode = useAppStore((s) => s.mode);
  const { getContent } = useTheoryContent();

  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setTheoryPopup(null);
  }, [setTheoryPopup]);

  // Close on Escape
  useEffect(() => {
    if (!activeId) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeId, close]);

  // Focus trap: capture and restore focus
  useEffect(() => {
    if (!activeId) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Focus the panel on open
    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [activeId]);

  if (!activeId) return null;

  const rawEntry = getTheoryContent(activeId);
  const resolved = getContent(activeId, {
    key: keyRoot,
    mode,
    root: keyRoot,
  });

  if (!resolved || !rawEntry) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={resolved.title}
    >
      <div
        className={styles.panel}
        ref={panelRef}
        tabIndex={-1}
      >
        <button
          className={styles.closeButton}
          onClick={close}
          aria-label="Close"
        >
          &times;
        </button>

        <div className={styles.category}>
          {CATEGORY_LABELS[rawEntry.category] ?? rawEntry.category}
        </div>

        <h2 className={styles.title}>{resolved.title}</h2>

        <div className={styles.content}>{resolved.content}</div>
      </div>
    </div>
  );
}
