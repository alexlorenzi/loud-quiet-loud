import styles from './SkipToContent.module.css';

export function SkipToContent(): JSX.Element {
  return (
    <a className={styles.skipLink} href="#main-content">
      Skip to main content
    </a>
  );
}
