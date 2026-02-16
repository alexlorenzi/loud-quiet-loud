import type React from 'react';
import type { ReactNode } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { useIsMobile, useIsTablet } from '../../hooks/use-media-query.js';
import { SkipToContent } from '../shared/SkipToContent.js';
import { ScreenReaderAnnouncer } from '../shared/ScreenReaderAnnouncer.js';
import { LandscapePrompt } from '../shared/LandscapePrompt.js';
import { MobileTabNav } from './MobileTabNav.js';
import { MiniPlayer } from './MiniPlayer.js';
import styles from './AppShell.module.css';

interface AppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  fretboard: ReactNode;
  transport: ReactNode;
  scaleSelector: ReactNode;
}

export function AppShell({
  header,
  sidebar,
  fretboard,
  transport,
  scaleSelector,
}: AppShellProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const activeTab = useAppStore((s) => s.activeTab);

  // Mobile: render only the active tab's content
  function renderMobileContent(): ReactNode {
    switch (activeTab) {
      case 'chords':
        return (
          <div
            id="tabpanel-chords"
            role="tabpanel"
            aria-labelledby="tab-chords"
            className={styles.tabPanel}
          >
            {sidebar}
          </div>
        );
      case 'fretboard':
        return (
          <div
            id="tabpanel-fretboard"
            role="tabpanel"
            aria-labelledby="tab-fretboard"
            className={styles.tabPanel}
          >
            <div className={styles.fretboardScrollWrapper}>
              {fretboard}
            </div>
          </div>
        );
      case 'scales':
        return (
          <div
            id="tabpanel-scales"
            role="tabpanel"
            aria-labelledby="tab-scales"
            className={styles.tabPanel}
          >
            {scaleSelector}
            <div className={styles.fretboardScrollWrapper}>
              {fretboard}
            </div>
          </div>
        );
    }
  }

  // Tablet: sidebar + full-width fretboard
  if (isTablet) {
    return (
      <div className={styles.shell}>
        <SkipToContent />
        <ScreenReaderAnnouncer />
        <header className={styles.header}>{header}</header>
        <main id="main-content" className={styles.mainTablet}>
          <div className={styles.tabletSidebar}>{sidebar}</div>
          <div className={styles.tabletFretboard}>
            {fretboard}
            {scaleSelector}
          </div>
        </main>
        <footer className={styles.transport}>{transport}</footer>
      </div>
    );
  }

  // Mobile: tab-switched single column
  if (isMobile) {
    return (
      <div className={styles.shell}>
        <SkipToContent />
        <ScreenReaderAnnouncer />
        <header className={styles.headerMobile}>{header}</header>
        <LandscapePrompt />
        <main id="main-content" className={styles.mainMobile}>
          {renderMobileContent()}
        </main>
        <MobileTabNav />
        <MiniPlayer fullControls={transport} />
      </div>
    );
  }

  // Desktop: two-column grid (sidebar + fretboard)
  return (
    <div className={styles.shell}>
      <SkipToContent />
      <ScreenReaderAnnouncer />
      <header className={styles.header}>{header}</header>
      <main id="main-content" className={styles.main}>
        <aside className={styles.sidebar}>{sidebar}</aside>
        <div className={styles.fretboardZone}>
          {fretboard}
          {scaleSelector}
        </div>
      </main>
      <footer className={styles.transport}>{transport}</footer>
    </div>
  );
}
