import { useAppStore } from '../../store/app-store.js';

/**
 * Invisible live region that announces state changes to screen readers.
 * Reads the latest announcement from the store.
 */
export function ScreenReaderAnnouncer(): JSX.Element {
  const announcement = useAppStore((s) => s.announcement);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {announcement?.message ?? ''}
    </div>
  );
}
