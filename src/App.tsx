import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppStore } from './store/app-store.js';
import { computeScale, SCALE_FORMULAS } from './engine/music-theory.js';
import { generateDiatonicChords } from './engine/chord-generator.js';
import { computeFretboard } from './engine/fretboard-mapper.js';
import { getChordTones, classifyNoteAgainstChord } from './engine/chord-tones.js';
import { nameToPitchClass, getAccidentalPreference } from './engine/note-utils.js';
import { getAudioEngine } from './audio/audio-engine.js';
import { ensureAudioContext } from './audio/context-manager.js';
import { resolveActiveProgression } from './engine/progression-resolver.js';
import { SCALE_SHAPE_POSITIONS } from './constants/scales.js';
import type { FretPosition, PitchClass } from './types/music.js';
import type { NoteDisplayType } from './types/ui.js';
import type { ChordToneInfo } from './engine/chord-tones.js';
import { AppShell } from './components/layout/AppShell.js';
import { Header } from './components/layout/Header.js';
import { KeySelector } from './components/key-selector/KeySelector.js';
import { KeyInfo } from './components/key-selector/KeyInfo.js';
import { ChordExplorer } from './components/chord-explorer/ChordExplorer.js';
import { ProgressionPicker } from './components/progressions/ProgressionPicker.js';
import { ProgressionChordBar } from './components/progressions/ProgressionChordBar.js';
import { LoopBuilder } from './components/loop-builder/LoopBuilder.js';
import { Fretboard } from './components/fretboard/Fretboard.js';
import { FretboardLegend } from './components/fretboard/FretboardLegend.js';
import { ScaleSelector } from './components/scales/ScaleSelector.js';
import { PlaybackControls } from './components/playback/PlaybackControls.js';
import { SidebarAccordion } from './components/shared/SidebarAccordion.js';


type SidebarSection = 'progressions' | 'loop-builder' | 'chord-explorer';

function SidebarSections(): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<SidebarSection>('progressions');

  function toggle(section: SidebarSection) {
    setActiveSection((prev) => (prev === section ? prev : section));
  }

  return (
    <>
      <SidebarAccordion
        title="Progressions"
        isOpen={activeSection === 'progressions'}
        onToggle={() => toggle('progressions')}
      >
        <ProgressionPicker />
      </SidebarAccordion>
      <SidebarAccordion
        title="Loop Builder"
        isOpen={activeSection === 'loop-builder'}
        onToggle={() => toggle('loop-builder')}
      >
        <LoopBuilder />
      </SidebarAccordion>
      <SidebarAccordion
        title="Chord Explorer"
        isOpen={activeSection === 'chord-explorer'}
        onToggle={() => toggle('chord-explorer')}
      >
        <ChordExplorer />
      </SidebarAccordion>
    </>
  );
}

function App(): React.JSX.Element {
  const {
    keyRoot,
    mode,
    selectedProgressionId,
    activeLoop,
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

  // Resolve active playback source (preset or custom loop)
  const resolvedProgression = useMemo(
    () => resolveActiveProgression(selectedProgressionId, activeLoop),
    [selectedProgressionId, activeLoop],
  );

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

  // Compute the set of pitch classes that belong to the selected scale type
  // (e.g., pentatonic-minor → 5 pitch classes across the entire fretboard).
  const scaleHighlightPitchClasses = useMemo(() => {
    if (!scaleShapeVisible) return null;

    const shape = SCALE_SHAPE_POSITIONS.find((s) => s.id === selectedScaleShapeId);
    if (!shape) return null;

    const rootPitchClass = nameToPitchClass(keyRoot);
    const formula = SCALE_FORMULAS[shape.scaleType];
    const pitchClasses = new Set(
      formula.map((interval) => ((rootPitchClass + interval) % 12) as PitchClass),
    );
    return pitchClasses;
  }, [scaleShapeVisible, selectedScaleShapeId, keyRoot]);

  // Get current chord tones for highlighting during playback
  const currentChordTones: ChordToneInfo[] | null = useMemo(() => {
    if (!resolvedProgression || currentChordIndex < 0) {
      return null;
    }

    // Only highlight during active playback
    if (playbackState !== 'playing' && playbackState !== 'paused') {
      return null;
    }

    if (currentChordIndex >= resolvedProgression.pattern.length) {
      return null;
    }

    const patternChord = resolvedProgression.pattern[currentChordIndex];
    const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);
    if (!diatonic) return null;

    const quality = patternChord.quality ?? diatonic.quality;
    return getChordTones(diatonic.root, quality);
  }, [resolvedProgression, currentChordIndex, playbackState, diatonicChords]);

  // Classify each note on the fretboard
  function classifyNote(pos: FretPosition): NoteDisplayType {
    // When a scale type is selected, show all key notes but highlight scale-type notes
    if (scaleHighlightPitchClasses) {
      // Root is always root
      if (pos.pitchClass === scale.root) {
        return 'root';
      }

      // During chord playback, chord tones take priority over scale highlighting
      if (currentChordTones) {
        const chordType = classifyNoteAgainstChord(pos.pitchClass, currentChordTones, scale);
        // Show chord tone function (3rd, 5th, 7th, 9th) if it's an actual chord tone
        if (chordType !== 'scale' && chordType !== 'non-scale') {
          return chordType;
        }
      }

      // Notes in the selected scale type are highlighted
      if (scaleHighlightPitchClasses.has(pos.pitchClass)) {
        return 'scale-highlight';
      }

      // Notes in the diatonic scale but not in the scale type
      if (scale.degrees.includes(pos.pitchClass)) {
        return 'scale';
      }

      // Chromatic notes outside the key
      return 'non-scale';
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
          <SidebarSections />
        }
        progressionBar={<ProgressionChordBar />}
        fretboard={
          <>
            <Fretboard
              fretboard={fretboard}
              noteClassifier={classifyNote}
              onNoteClick={handleNoteClick}
            />
            <FretboardLegend isChordActive={currentChordTones !== null} isScaleHighlightActive={scaleHighlightPitchClasses !== null} />
          </>
        }
        scaleSelector={<ScaleSelector />}
        transport={<PlaybackControls />}
      />
    </>
  );
}

export default App;
