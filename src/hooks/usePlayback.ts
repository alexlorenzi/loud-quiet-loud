import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/app-store.js';
import { getAudioEngine } from '../audio/audio-engine.js';
import { ensureAudioContext } from '../audio/context-manager.js';
import { getStrumPatternForGenre } from '../constants/strum-patterns.js';
import { generateDiatonicChords } from '../engine/chord-generator.js';
import { nameToPitchClass, pitchClassToName } from '../engine/note-utils.js';
import { getDefaultVoicing, VOICING_NOTE_NAMES } from '../data/voicing-lookup.js';
import { resolveActiveProgression } from '../engine/progression-resolver.js';
import type { ScheduledProgression, ScheduledChord } from '../types/audio.js';
import type { ResolvedProgression } from '../types/loop.js';
import type { ChordQuality, NoteName } from '../types/music.js';

/** Qualities that should fall back to a minor voicing when no exact match exists. */
const MINOR_FAMILY_QUALITIES = new Set<ChordQuality>([
  'minor', 'm7', 'm9', 'm11', 'm7b5', 'dim',
]);

/**
 * Build a ScheduledProgression from a resolved progression and current key.
 */
function buildScheduledProgression(
  resolved: ResolvedProgression,
  keyRoot: NoteName,
  mode: 'major' | 'minor'
): ScheduledProgression | null {
  const rootPitchClass = nameToPitchClass(keyRoot);
  const diatonicChords = generateDiatonicChords(rootPitchClass, mode);

  const scheduledChords: ScheduledChord[] = [];

  for (const patternChord of resolved.pattern) {
    const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);
    if (!diatonic) continue;

    const quality = patternChord.quality ?? diatonic.quality;
    const noteName = VOICING_NOTE_NAMES[diatonic.root] ?? 'C';

    // Try exact match first
    const pos = getDefaultVoicing(noteName, quality);
    let voicing: { frets: number[]; baseFret: number } | undefined;

    if (pos) {
      voicing = { frets: pos.frets, baseFret: pos.baseFret };
    }

    if (!voicing) {
      // Fallback: try the basic major/minor voicing
      const fallbackQuality: ChordQuality = MINOR_FAMILY_QUALITIES.has(quality) ? 'minor' : 'major';
      const fallbackPos = getDefaultVoicing(noteName, fallbackQuality);

      if (fallbackPos) {
        voicing = { frets: fallbackPos.frets, baseFret: fallbackPos.baseFret };
      }
    }

    if (!voicing) {
      // Last resort: quality-appropriate open shape
      voicing = MINOR_FAMILY_QUALITIES.has(quality)
        ? { frets: [0, 2, 2, 0, 0, 0], baseFret: 1 }  // Em
        : { frets: [0, 0, 1, 2, 2, 0], baseFret: 1 };  // E
    }

    scheduledChords.push({
      voicing,
      durationBeats: patternChord.beats ?? resolved.beatsPerChord,
    });
  }

  const totalBeats = scheduledChords.reduce((sum, c) => sum + c.durationBeats, 0);

  return {
    chords: scheduledChords,
    totalBeats,
    beatsPerChord: resolved.beatsPerChord,
  };
}

/** Display name mapping for chord qualities. */
const QUALITY_DISPLAY: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  dim: 'dim',
  aug: 'aug',
  '7': '7',
  maj7: 'maj7',
  m7: 'm7',
  m7b5: 'm7b5',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  maj9: 'maj9',
  m9: 'm9',
  '9': '9',
  '11': '11',
  m11: 'm11',
};

/**
 * Get the display name for a chord in the resolved progression at a given index.
 */
function getChordDisplayName(
  resolved: ResolvedProgression,
  chordIndex: number,
  keyRoot: NoteName,
  mode: 'major' | 'minor'
): string {
  if (chordIndex < 0 || chordIndex >= resolved.pattern.length) return '';

  const rootPitchClass = nameToPitchClass(keyRoot);
  const diatonicChords = generateDiatonicChords(rootPitchClass, mode);
  const patternChord = resolved.pattern[chordIndex];
  const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);

  if (!diatonic) return patternChord.romanNumeral;

  const quality = patternChord.quality ?? diatonic.quality;
  const noteName = pitchClassToName(diatonic.root, true);
  const suffix = QUALITY_DISPLAY[quality] ?? '';

  return `${noteName}${suffix}`;
}

/**
 * React hook for playback control.
 * Resolves progression chords to voicings and manages transport state.
 */
export function usePlayback(): {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  currentChordName: string;
} {
  const {
    selectedProgressionId,
    activeLoop,
    keyRoot,
    mode,
    playbackState,
    currentChordIndex,
    tempo,
    masterVolume,
    drumsMuted,
    metronomeEnabled,
    setPlaybackState,
    setCurrentChordIndex,
    setCurrentEighthInBar,
    setAudioContextReady,
  } = useAppStore();

  const resolved = useMemo(
    () => resolveActiveProgression(selectedProgressionId, activeLoop),
    [selectedProgressionId, activeLoop],
  );

  const isScheduledRef = useRef(false);
  const isSchedulingRef = useRef(false);

  // Sync tempo changes to the transport
  useEffect(() => {
    const engine = getAudioEngine();
    engine.transport.setTempo(tempo);
  }, [tempo]);

  // Sync master volume
  useEffect(() => {
    const engine = getAudioEngine();
    engine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Sync drums muted
  useEffect(() => {
    const engine = getAudioEngine();
    engine.drums.setMuted(drumsMuted);
  }, [drumsMuted]);

  // Sync metronome enabled
  useEffect(() => {
    const engine = getAudioEngine();
    engine.metronome.enabled = metronomeEnabled;
  }, [metronomeEnabled]);

  // Get current chord display name
  const currentChordName = resolved
    ? getChordDisplayName(resolved, currentChordIndex, keyRoot, mode)
    : '';

  const play = useCallback(async () => {
    if (!resolved || isSchedulingRef.current) return;

    isSchedulingRef.current = true;
    try {
    // Ensure audio context is running
    const contextReady = await ensureAudioContext();
    setAudioContextReady(contextReady);
    if (!contextReady) return;

    const engine = getAudioEngine();

    if (playbackState === 'paused') {
      // Resume from pause
      engine.transport.resume();
      setPlaybackState('playing');
      return;
    }

    // Build the scheduled progression
    const scheduled = buildScheduledProgression(resolved, keyRoot, mode);
    if (!scheduled) return;

    // Apply current settings
    engine.transport.setTempo(tempo);
    engine.setMasterVolume(masterVolume);
    engine.drums.setMuted(drumsMuted);
    engine.metronome.enabled = metronomeEnabled;

    // Set count-in state
    setPlaybackState('count-in');
    setCurrentChordIndex(0);

    // Resolve the strum pattern from the progression's genre
    const strumPattern = getStrumPatternForGenre(resolved.genre);

    isScheduledRef.current = true;

    // Schedule the progression
    engine.transport.scheduleProgression(
      scheduled,
      strumPattern,
      (chordIndex) => {
        setCurrentChordIndex(chordIndex);
      },
      () => {
        // On first beat after count-in, switch to playing state
        if (useAppStore.getState().playbackState === 'count-in') {
          setPlaybackState('playing');
        }
      },
      (slotInBar) => {
        setCurrentEighthInBar(slotInBar);
      },
      engine.guitar,
      engine.drums,
      engine.metronome
    );

    // Start transport
    engine.transport.resume();
    } finally {
      isSchedulingRef.current = false;
    }
  }, [
    resolved,
    keyRoot,
    mode,
    playbackState,
    tempo,
    masterVolume,
    drumsMuted,
    metronomeEnabled,
    setPlaybackState,
    setCurrentChordIndex,
    setCurrentEighthInBar,
    setAudioContextReady,
  ]);

  const pause = useCallback(() => {
    const engine = getAudioEngine();
    engine.transport.pause();
    setPlaybackState('paused');
  }, [setPlaybackState]);

  const stop = useCallback(() => {
    const engine = getAudioEngine();
    engine.transport.clear();
    isScheduledRef.current = false;
    setPlaybackState('stopped');
    setCurrentChordIndex(0);
    setCurrentEighthInBar(0);
  }, [setPlaybackState, setCurrentChordIndex, setCurrentEighthInBar]);

  // Stop playback when progression, loop, or key changes
  useEffect(() => {
    if (isScheduledRef.current) {
      const engine = getAudioEngine();
      engine.transport.clear();
      isScheduledRef.current = false;
      setPlaybackState('stopped');
      setCurrentChordIndex(0);
      setCurrentEighthInBar(0);
    }
  }, [selectedProgressionId, activeLoop, keyRoot, mode, setPlaybackState, setCurrentChordIndex, setCurrentEighthInBar]);

  return {
    play,
    pause,
    stop,
    currentChordName,
  };
}
