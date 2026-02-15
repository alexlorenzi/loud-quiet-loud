import { useAppStore } from '../../store/app-store.js';
import { ensureAudioContext } from '../../audio/context-manager.js';
import styles from './AudioBanner.module.css';

export function AudioBanner(): JSX.Element {
  const { setAudioContextReady } = useAppStore();

  async function handleClick(): Promise<void> {
    const success = await ensureAudioContext();
    setAudioContextReady(success);
  }

  return (
    <div
      className={styles.banner}
      onClick={() => void handleClick()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          void handleClick();
        }
      }}
    >
      <svg
        className={styles.icon}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
      <span className={styles.text}>Tap to enable audio</span>
    </div>
  );
}
