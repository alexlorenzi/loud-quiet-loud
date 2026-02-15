import { useState, useMemo } from 'react';
import { PRESET_PROGRESSIONS } from '../../constants/progressions.js';
import { useAppStore } from '../../store/app-store.js';
import { ProgressionRow } from './ProgressionRow.js';
import styles from './ProgressionPicker.module.css';

const GENRE_COLORS: Record<string, string> = {
  'Pop/Rock': 'var(--genre-pop)',
  'Blues': 'var(--genre-blues)',
  'Jazz': 'var(--genre-jazz)',
  'Pop-Punk': 'var(--genre-punk)',
  'Folk/Country': 'var(--genre-folk)',
};

const GENRE_SHORT: Record<string, string> = {
  'Pop/Rock': 'POP',
  'Blues': 'BLUES',
  'Jazz': 'JAZZ',
  'Pop-Punk': 'PUNK',
  'Folk/Country': 'FOLK',
};

export function ProgressionPicker(): JSX.Element {
  const { selectedProgressionId, revealedProgressionIds } = useAppStore();

  const genres = useMemo(() => {
    const seen = new Set<string>();
    for (const p of PRESET_PROGRESSIONS) {
      seen.add(p.genre);
    }
    return Array.from(seen);
  }, []);

  const [activeGenre, setActiveGenre] = useState(genres[0] || 'Pop/Rock');

  const filteredProgressions = useMemo(
    () => PRESET_PROGRESSIONS.filter((p) => p.genre === activeGenre),
    [activeGenre]
  );

  return (
    <div className={styles.picker}>
      <h2 className={styles.title}>Progressions</h2>

      <div className={styles.genreTabs}>
        {genres.map((genre) => (
          <button
            key={genre}
            className={`${styles.genreChip} ${activeGenre === genre ? styles.active : ''}`}
            style={{ borderLeftColor: GENRE_COLORS[genre] || 'var(--accent-primary)' }}
            onClick={() => setActiveGenre(genre)}
          >
            {GENRE_SHORT[genre] || genre}
          </button>
        ))}
      </div>

      <div className={styles.progressionList}>
        {filteredProgressions.map((p) => (
          <ProgressionRow
            key={p.id}
            progression={p}
            isSelected={selectedProgressionId === p.id}
            isRevealed={revealedProgressionIds.has(p.id)}
            genreColor={GENRE_COLORS[p.genre] || 'var(--accent-primary)'}
          />
        ))}
      </div>
    </div>
  );
}
