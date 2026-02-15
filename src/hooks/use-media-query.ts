import { useCallback, useSyncExternalStore } from 'react';

/**
 * Hook that tracks a CSS media query match state.
 * Returns true when the media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Returns true when viewport width is < 768px */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Returns true when viewport width is 768px-1023px */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}
