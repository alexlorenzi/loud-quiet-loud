import type React from 'react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/app-store.js';
import { generateDiatonicChords, getChordVariations } from '../../engine/chord-generator.js';
import { computeScale } from '../../engine/music-theory.js';
import { nameToPitchClass, pitchClassToName } from '../../engine/note-utils.js';
import { recommendScales } from '../../engine/scale-recommender.js';
import { usePlayback } from '../../hooks/usePlayback.js';
import type { ProgressionChord } from '../../constants/progressions.js';
import type { ChordQuality } from '../../types/music.js';
import { LoopChordPicker } from './LoopChordPicker.js';
import { LoopSlot } from './LoopSlot.js';
import { StrumPicker } from './StrumPicker.js';
import { BeatsPicker } from './BeatsPicker.js';
import { ScaleRecommendations } from './ScaleRecommendations.js';
import styles from './LoopBuilder.module.css';

const MAX_CHORDS = 16;

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '', minor: 'm', dim: 'dim', aug: 'aug',
  '7': '7', maj7: 'maj7', m7: 'm7', m7b5: 'm7b5',
  sus2: 'sus2', sus4: 'sus4', add9: 'add9',
  maj9: 'maj9', m9: 'm9', '9': '9', '11': '11', m11: 'm11',
};

let nextSlotId = 0;

interface DraftChord extends ProgressionChord {
  slotId: number;
}

export function LoopBuilder(): React.JSX.Element {
  const {
    keyRoot, mode, currentChordIndex, playbackState, activeLoop,
    setActiveLoop, clearLoop,
  } = useAppStore();

  const { play } = usePlayback();

  const [draftChords, setDraftChords] = useState<DraftChord[]>([]);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [strumGenre, setStrumGenre] = useState('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const pendingPlayRef = useRef(false);

  const rootPitchClass = nameToPitchClass(keyRoot);

  const diatonicChords = useMemo(
    () => generateDiatonicChords(rootPitchClass, mode),
    [rootPitchClass, mode],
  );

  const scale = useMemo(
    () => computeScale(rootPitchClass, mode === 'major' ? 'major' : 'natural-minor'),
    [rootPitchClass, mode],
  );

  // Compute display name for a draft chord
  const getDisplayName = useCallback((chord: ProgressionChord): string => {
    const diatonic = diatonicChords.find(c => c.degree === chord.degree);
    if (!diatonic) return chord.romanNumeral;
    const quality = chord.quality ?? diatonic.quality;
    const noteName = pitchClassToName(diatonic.root, true);
    const suffix = QUALITY_SUFFIX[quality] ?? '';
    return `${noteName}${suffix}`;
  }, [diatonicChords]);

  // Get variations for the selected slot
  const selectedVariations = useMemo(() => {
    if (selectedSlotIndex === null || selectedSlotIndex >= draftChords.length) return [];
    const chord = draftChords[selectedSlotIndex];
    const diatonic = diatonicChords.find(c => c.degree === chord.degree);
    if (!diatonic) return [];
    const variations = getChordVariations(diatonic, scale);
    return [diatonic, ...variations];
  }, [selectedSlotIndex, draftChords, diatonicChords, scale]);

  // Scale recommendations based on current draft
  const recommendations = useMemo(() => {
    if (draftChords.length === 0) return [];
    return recommendScales(rootPitchClass, mode, draftChords);
  }, [draftChords, rootPitchClass, mode]);

  // Auto-play after activeLoop is committed to the store
  useEffect(() => {
    if (pendingPlayRef.current && activeLoop !== null) {
      pendingPlayRef.current = false;
      void play();
    }
  }, [activeLoop, play]);

  const handleAddChord = useCallback((chord: ProgressionChord) => {
    setDraftChords(prev => {
      if (prev.length >= MAX_CHORDS) return prev;
      return [...prev, { ...chord, slotId: nextSlotId++ }];
    });
  }, []);

  const handleRemoveChord = useCallback((index: number) => {
    setDraftChords(prev => prev.filter((_, i) => i !== index));
    setSelectedSlotIndex(null);
  }, []);

  const handleSelectSlot = useCallback((index: number) => {
    setSelectedSlotIndex(prev => prev === index ? null : index);
  }, []);

  const handleSetQuality = useCallback((quality: ChordQuality, romanNumeral: string) => {
    if (selectedSlotIndex === null) return;
    setDraftChords(prev => prev.map((chord, i) => {
      if (i !== selectedSlotIndex) return chord;
      const diatonic = diatonicChords.find(c => c.degree === chord.degree);
      const isDefault = diatonic && quality === diatonic.quality;
      return {
        ...chord,
        quality: isDefault ? undefined : quality,
        romanNumeral,
      };
    }));
  }, [selectedSlotIndex, diatonicChords]);

  const handlePlay = useCallback(() => {
    if (draftChords.length === 0) return;
    pendingPlayRef.current = true;
    setActiveLoop({ chords: draftChords, beatsPerChord, strumGenre });
  }, [draftChords, beatsPerChord, strumGenre, setActiveLoop]);

  const handleClear = useCallback(() => {
    setDraftChords([]);
    setSelectedSlotIndex(null);
    clearLoop();
  }, [clearLoop]);

  const isPlaying = playbackState === 'playing' || playbackState === 'paused';
  const isLoopActive = activeLoop !== null;

  return (
    <div className={styles.builder}>
      <div className={styles.header}>
        <h2 className={styles.title}>Loop Builder</h2>
        <span className={styles.count}>{draftChords.length}/{MAX_CHORDS}</span>
      </div>

      <LoopChordPicker
        onAdd={handleAddChord}
        disabled={draftChords.length >= MAX_CHORDS}
      />

      <div className={styles.sequence}>
        {draftChords.length === 0 ? (
          <span className={styles.emptyMessage}>Tap chords above to build your loop</span>
        ) : (
          draftChords.map((chord, index) => (
            <LoopSlot
              key={chord.slotId}
              romanNumeral={chord.romanNumeral}
              displayName={getDisplayName(chord)}
              isActive={isLoopActive && isPlaying && index === currentChordIndex}
              isSelected={selectedSlotIndex === index}
              onSelect={() => handleSelectSlot(index)}
              onRemove={() => handleRemoveChord(index)}
            />
          ))
        )}
      </div>

      {selectedVariations.length > 0 && selectedSlotIndex !== null && (
        <div className={styles.variations}>
          {selectedVariations.map(variation => {
            const currentChord = draftChords[selectedSlotIndex];
            const currentQuality = currentChord?.quality ?? diatonicChords.find(c => c.degree === currentChord?.degree)?.quality;
            const isActive = variation.quality === currentQuality;
            return (
              <button
                key={variation.quality}
                className={`${styles.variationChip} ${isActive ? styles.activeVariation : ''}`}
                onClick={() => handleSetQuality(variation.quality, variation.romanNumeral)}
              >
                {variation.displayName}
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.settings}>
        <BeatsPicker value={beatsPerChord} onChange={setBeatsPerChord} />
        <StrumPicker value={strumGenre} onChange={setStrumGenre} />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.playBtn}
          onClick={handlePlay}
          disabled={draftChords.length === 0}
        >
          Play Loop
        </button>
        <button
          className={styles.clearBtn}
          onClick={handleClear}
          disabled={draftChords.length === 0 && !isLoopActive}
        >
          Clear
        </button>
      </div>

      <ScaleRecommendations recommendations={recommendations} />
    </div>
  );
}
