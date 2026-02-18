import type React from 'react';
import { type ReactNode, useState, useId } from 'react';
import styles from './SidebarAccordion.module.css';

interface SidebarAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function SidebarAccordion({
  title,
  defaultOpen = true,
  children,
}: SidebarAccordionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={styles.accordion}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <h2 className={styles.title}>{title}</h2>
        <span className={`${styles.chevron} ${isOpen ? '' : styles.chevronCollapsed}`} />
      </button>

      <div
        id={contentId}
        className={`${styles.body} ${isOpen ? '' : styles.bodyCollapsed}`}
        role="region"
        aria-labelledby={undefined}
      >
        <div className={styles.bodyInner}>{children}</div>
      </div>
    </div>
  );
}
