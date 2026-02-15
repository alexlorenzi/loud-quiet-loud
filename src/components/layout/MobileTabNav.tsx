import { useAppStore } from '../../store/app-store.js';
import type { MobileTab } from '../../types/ui.js';
import styles from './MobileTabNav.module.css';

interface TabDef {
  id: MobileTab;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { id: 'chords', label: 'Chords', icon: '\u{1F3B5}' },     // musical note
  { id: 'fretboard', label: 'Fretboard', icon: '\u{1F3B8}' }, // guitar
  { id: 'scales', label: 'Scales', icon: '\u{1F3BC}' },       // musical score
];

export function MobileTabNav(): JSX.Element {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav className={styles.tabNav} role="tablist" aria-label="Main navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          className={styles.tab}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className={styles.tabIcon} aria-hidden="true">
            {tab.icon}
          </span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
