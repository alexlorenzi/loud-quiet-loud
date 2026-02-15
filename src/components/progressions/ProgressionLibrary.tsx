import { useState, useMemo } from 'react';
import { PRESET_PROGRESSIONS } from '../../constants/progressions.js';
import { useAppStore } from '../../store/app-store.js';
import { ProgressionCard } from './ProgressionCard.js';
import styles from './ProgressionLibrary.module.css';

const GENRE_COLORS: Record<string, string> = {
  'Pop/Rock': 'var(--genre-pop)',
  'Blues': 'var(--genre-blues)',
  'Jazz': 'var(--genre-jazz)',
  'Pop-Punk': 'var(--genre-punk)',
  'Folk/Country': 'var(--genre-folk)',
};

export function ProgressionLibrary(): JSX.Element {
  const { selectedProgressionId } = useAppStore();
  const [openGenres, setOpenGenres] = useState<Set<string>>(
    new Set(Object.keys(GENRE_COLORS))
  );

  const progressionsByGenre = useMemo(() => {
    const grouped: Record<string, typeof PRESET_PROGRESSIONS> = {};
    for (const progression of PRESET_PROGRESSIONS) {
      if (!grouped[progression.genre]) {
        grouped[progression.genre] = [];
      }
      grouped[progression.genre].push(progression);
    }
    return grouped;
  }, []);

  function toggleGenre(genre: string): void {
    const newOpenGenres = new Set(openGenres);
    if (newOpenGenres.has(genre)) {
      newOpenGenres.delete(genre);
    } else {
      newOpenGenres.add(genre);
    }
    setOpenGenres(newOpenGenres);
  }

  return (
    <div className={styles.library}>
      <h2 className={styles.title}>Progression Library</h2>

      {Object.entries(progressionsByGenre).map(([genre, progressions]) => {
        const isOpen = openGenres.has(genre);
        const color = GENRE_COLORS[genre] || 'var(--accent-primary)';

        return (
          <div key={genre} className={styles.genre}>
            <div className={styles.genreHeader} onClick={() => toggleGenre(genre)}>
              <div className={styles.genreIndicator} style={{ background: color }} />
              <div className={styles.genreLabel}>{genre}</div>
              <div className={`${styles.genreChevron} ${isOpen ? styles.open : ''}`}>
                ▸
              </div>
            </div>

            {isOpen && (
              <div className={styles.progressionList}>
                {progressions.map((progression) => (
                  <ProgressionCard
                    key={progression.id}
                    progression={progression}
                    isSelected={selectedProgressionId === progression.id}
                    genreColor={color}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
