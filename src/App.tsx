import type React from 'react';
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
import { SCALE_SHAPE_POSITIONS } from './constants/scales.js';
import type { FretPosition } from './types/music.js';
import type { NoteDisplayType } from './types/ui.js';
import type { ChordToneInfo } from './engine/chord-tones.js';
import { AppShell } from './components/layout/AppShell.js';
import { Header } from './components/layout/Header.js';
import { KeySelector } from './components/key-selector/KeySelector.js';
import { KeyInfo } from './components/key-selector/KeyInfo.js';
import { ChordExplorer } from './components/chord-explorer/ChordExplorer.js';
import { ProgressionPicker } from './components/progressions/ProgressionPicker.js';
import { Fretboard } from './components/fretboard/Fretboard.js';
import { FretboardLegend } from './components/fretboard/FretboardLegend.js';
import { ScaleSelector } from './components/scales/ScaleSelector.js';
import { PlaybackControls } from './components/playback/PlaybackControls.js';


function App(): React.JSX.Element {
  const {
    keyRoot,
    mode,
    selectedProgressionId,
    selectedScaleShapeId,
    scaleShapeVisible,
    currentChordIndex,
    playbackState,
    audioContextReady,
    setAudioContextReady,
  } = useAppStore();

  // Auto-resume AudioContext on first user interaction (click/key/touch).
  // Browsers allow resuming a previously-started context after any user gesture,
  // so returning users don't need to click the dedicated banner every time.
  useEffect(() => {
    if (audioContextReady) return;

    function tryResume() {
      void ensureAudioContext().then((ok) => {
        if (ok) {
          setAudioContextReady(true);
          cleanup();
        }
      });
    }

    function cleanup() {
      window.removeEventListener('click', tryResume);
      window.removeEventListener('keydown', tryResume);
      window.removeEventListener('touchstart', tryResume);
    }

    window.addEventListener('click', tryResume);
    window.addEventListener('keydown', tryResume);
    window.addEventListener('touchstart', tryResume);
    return cleanup;
  }, [audioContextReady, setAudioContextReady]);

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

  // Compute the set of (string, fret) positions that belong to the selected
  // scale shape, anchored to the current key root on the low E string.
  const scaleShapePositionSet = useMemo(() => {
    if (!scaleShapeVisible) return null;

    const shape = SCALE_SHAPE_POSITIONS.find((s) => s.id === selectedScaleShapeId);
    if (!shape) return null;

    // Find the root fret on the low E string (fretboard index 0 = low E, MIDI 40).
    // MIDI 40 = E2. The root pitch class tells us what fret to anchor to.
    const rootPitchClass = nameToPitchClass(keyRoot);
    const lowEPitchClass = 4; // E = pitch class 4
    const rootFret = (rootPitchClass - lowEPitchClass + 12) % 12;

    // Scale shape patterns use guitar convention: string 5 = low E, string 0 = high E.
    // Fretboard array uses: index 0 = low E, index 5 = high E.
    // So fretboard index = 5 - shape.string.
    const positions = new Set<string>();
    for (const note of shape.pattern) {
      const fretboardStringIndex = 5 - note.string;
      const absoluteFret = rootFret + note.fretOffset;
      if (absoluteFret >= 0 && absoluteFret <= 15) {
        positions.add(`${fretboardStringIndex}:${absoluteFret}`);
      }
    }
    return positions;
  }, [scaleShapeVisible, selectedScaleShapeId, keyRoot]);

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
    // When scale shape overlay is active, only show notes within the shape
    if (scaleShapePositionSet) {
      const key = `${pos.string}:${pos.fret}`;
      if (!scaleShapePositionSet.has(key)) {
        return 'non-scale';
      }
      // Within the shape, still classify against chord if playing
      if (currentChordTones) {
        return classifyNoteAgainstChord(pos.pitchClass, currentChordTones, scale);
      }
      // Show root vs scale within the shape
      if (pos.pitchClass === scale.root) {
        return 'root';
      }
      return 'scale';
    }

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
      <AppShell
        header={<Header keySelector={<KeySelector />} keyInfo={<KeyInfo />} />}
        sidebar={
          <>
            <ProgressionPicker />
            <ChordExplorer />
          </>
        }
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
