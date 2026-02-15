import { useEffect } from 'react';
import { useAppStore } from '../../store/app-store.js';
import styles from './Toast.module.css';

const ICONS: Record<string, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u2139',
};

const AUTO_DISMISS_MS = 3000;

export function Toast(): JSX.Element | null {
  const message = useAppStore((s) => s.toastMessage);
  const type = useAppStore((s) => s.toastType);
  const dismiss = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [message, dismiss]);

  if (!message) return null;

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon}>{ICONS[type]}</span>
      {message}
    </div>
  );
}
