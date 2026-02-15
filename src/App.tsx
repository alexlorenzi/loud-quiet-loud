import { useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from './store/app-store.js';
import { computeScale } from './engine/music-theory.js';
import { generateDiatonicChords } from './engine/chord-generator.js';
import { computeFretboard } from './engine/fretboard-mapper.js';
import { getChordTones, classifyNoteAgainstChord } from './engine/chord-tones.js';
import { nameToPitchClass, getAccidentalPreference } from './engine/note-utils.js';
import { getAudioEngine } from './audio/audio-engine.js';
import { ensureAudioContext } from './audio/context-manager.js';
import { PRESET_PROGRESSIONS } from './constants/progressions.js';
import type { FretPosition } from './types/music.js';
import type { NoteDisplayType } from './types/ui.js';
import type { ChordToneInfo } from './engine/chord-tones.js';
import { AppShell } from './components/layout/AppShell.js';
import { Header } from './components/layout/Header.js';
import { KeySelector } from './components/key-selector/KeySelector.js';
import { KeyInfo } from './components/key-selector/KeyInfo.js';
import { ChordExplorer } from './components/chord-explorer/ChordExplorer.js';
import { ProgressionLibrary } from './components/progressions/ProgressionLibrary.js';
import { Fretboard } from './components/fretboard/Fretboard.js';
import { FretboardLegend } from './components/fretboard/FretboardLegend.js';
import { ScaleSelector } from './components/scales/ScaleSelector.js';
import { PlaybackControls } from './components/playback/PlaybackControls.js';
import { AudioBanner } from './components/shared/AudioBanner.js';

function App(): JSX.Element {
  const {
    keyRoot,
    mode,
    selectedProgressionId,
    currentChordIndex,
    playbackState,
    audioContextReady,
  } = useAppStore();

  // Compute scale for the current key
  const scale = useMemo(() => {
    const rootPitchClass = nameToPitchClass(keyRoot);
    const scaleType = mode === 'major' ? 'major' : 'natural-minor';
    return computeScale(rootPitchClass, scaleType);
  }, [keyRoot, mode]);

  // Generate diatonic chords
  const diatonicChords = useMemo(() => {
    const rootPitchClass = nameToPitchClass(keyRoot);
    return generateDiatonicChords(rootPitchClass, mode);
  }, [keyRoot, mode]);

  // Compute fretboard positions
  const fretboard = useMemo(() => {
    const preferSharps = getAccidentalPreference(keyRoot, mode) === 'sharps';
    return computeFretboard(preferSharps);
  }, [keyRoot, mode]);

  // Get current chord tones for highlighting during playback
  const currentChordTones: ChordToneInfo[] | null = useMemo(() => {
    if (!selectedProgressionId || currentChordIndex < 0) {
      return null;
    }

    // Only highlight during active playback
    if (playbackState !== 'playing' && playbackState !== 'paused') {
      return null;
    }

    const preset = PRESET_PROGRESSIONS.find((p) => p.id === selectedProgressionId);
    if (!preset || currentChordIndex >= preset.pattern.length) {
      return null;
    }

    const patternChord = preset.pattern[currentChordIndex];
    const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);
    if (!diatonic) return null;

    const quality = patternChord.quality ?? diatonic.quality;
    return getChordTones(diatonic.root, quality);
  }, [selectedProgressionId, currentChordIndex, playbackState, diatonicChords]);

  // Classify each note on the fretboard
  function classifyNote(pos: FretPosition): NoteDisplayType {
    if (currentChordTones) {
      return classifyNoteAgainstChord(pos.pitchClass, currentChordTones, scale);
    }

    // Default: show scale notes
    if (scale.degrees.includes(pos.pitchClass)) {
      return 'scale';
    }

    return 'non-scale';
  }

  const handleNoteClick = useCallback((pos: FretPosition): void => {
    // Play the note via GuitarSynth
    void ensureAudioContext().then((ready) => {
      if (ready) {
        const engine = getAudioEngine();
        engine.guitar.pluckNote(pos.midiNote);
      }
    });
  }, []);

  return (
    <>
      {!audioContextReady && <AudioBanner />}
      <AppShell
        header={<Header keySelector={<KeySelector />} keyInfo={<KeyInfo />} />}
        leftPanel={<ChordExplorer />}
        center={<ProgressionLibrary />}
        rightPanel={null}
        fretboard={
          <>
            <Fretboard
              fretboard={fretboard}
              noteClassifier={classifyNote}
              onNoteClick={handleNoteClick}
            />
            <FretboardLegend isChordActive={currentChordTones !== null} />
          </>
        }
        scaleSelector={<ScaleSelector />}
        transport={<PlaybackControls />}
      />
    </>
  );
}

export default App;
