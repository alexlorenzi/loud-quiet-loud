import type React from 'react';
import { type ReactNode, useId } from 'react';
import styles from './SidebarAccordion.module.css';

interface SidebarAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function SidebarAccordion({
  title,
  isOpen,
  onToggle,
  children,
}: SidebarAccordionProps): React.JSX.Element {
  const contentId = useId();

  return (
    <div className={`${styles.accordion} ${isOpen ? styles.accordionOpen : ''}`}>
      <button
        className={styles.trigger}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <h2 className={styles.title}>{title}</h2>
        <span className={`${styles.chevron} ${isOpen ? '' : styles.chevronCollapsed}`} />
      </button>

      <div
        id={contentId}
        className={`${styles.body} ${isOpen ? styles.bodyExpanded : ''}`}
        role="region"
        aria-labelledby={undefined}
      >
        <div className={styles.bodyInner}>{children}</div>
      </div>
    </div>
  );
}
