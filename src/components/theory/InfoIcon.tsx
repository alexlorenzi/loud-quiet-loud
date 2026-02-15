import { useAppStore } from '../../store/app-store.js';
import styles from './InfoIcon.module.css';

interface InfoIconProps {
  theoryContentId: string;
  /** Optional accessible label override */
  label?: string;
}

/**
 * A small "i" button that opens the TheoryPopup for the given content ID.
 */
export function InfoIcon({ theoryContentId, label }: InfoIconProps): JSX.Element {
  const setTheoryPopup = useAppStore((s) => s.setTheoryPopup);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation(); // Prevent parent click handlers (e.g. ChordCard)
    setTheoryPopup(theoryContentId);
  }

  return (
    <button
      className={styles.infoButton}
      onClick={handleClick}
      aria-label={label ?? 'More info'}
      title="Learn more"
      type="button"
    >
      i
    </button>
  );
}
