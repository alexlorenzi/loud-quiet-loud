import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/app-store.js';
import { getAudioEngine } from '../audio/audio-engine.js';
import { ensureAudioContext } from '../audio/context-manager.js';
import { PRESET_PROGRESSIONS } from '../constants/progressions.js';
import { generateDiatonicChords } from '../engine/chord-generator.js';
import { nameToPitchClass, pitchClassToName } from '../engine/note-utils.js';
import type { ScheduledProgression, ScheduledChord } from '../types/audio.js';
import type { ChordQuality, NoteName } from '../types/music.js';
import type { ChordPosition } from '../types/chords.js';
import type { ChordVoicingData } from '../types/chords.js';
import chordVoicingsData from '../data/chord-voicings.json';

// Type the imported JSON
const chordVoicings = chordVoicingsData as Record<string, ChordVoicingData>;

/**
 * Maps the JSON note-name convention used in chord-voicings.json.
 * The JSON uses: C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B
 */
const VOICING_NOTE_NAMES: Record<number, string> = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'Eb',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'Ab',
  9: 'A',
  10: 'Bb',
  11: 'B',
};

/**
 * Map ChordQuality to the suffix used in chord-voicings.json keys.
 * Falls back to a simpler voicing when an exact match isn't available.
 */
const QUALITY_TO_SUFFIX: Record<ChordQuality, string> = {
  major: 'major',
  minor: 'minor',
  diminished: 'dim',
  augmented: 'aug',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'minor',     // no m7 suffix in JSON, fall back to minor
  'half-diminished7': 'm7b5',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  major9: 'maj9',
  minor9: 'minor',     // no m9 suffix in JSON, fall back to minor
  dominant9: '9',
  '11': '11',
  minor11: 'minor',    // no m11 suffix in JSON, fall back to minor
};

function getVoicingKey(pitchClass: number, quality: ChordQuality): string {
  const noteName = VOICING_NOTE_NAMES[pitchClass] ?? 'C';
  const suffix = QUALITY_TO_SUFFIX[quality] ?? 'major';
  return `${noteName}_${suffix}`;
}

function findDefaultVoicing(voicingData: ChordVoicingData): ChordPosition | null {
  if (!voicingData?.positions || voicingData.positions.length === 0) {
    return null;
  }
  return voicingData.positions.find((p) => p.isDefault) ?? voicingData.positions[0];
}

/**
 * Build a ScheduledProgression from a preset progression and current key.
 */
function buildScheduledProgression(
  progressionId: string,
  keyRoot: NoteName,
  mode: 'major' | 'minor'
): ScheduledProgression | null {
  const preset = PRESET_PROGRESSIONS.find((p) => p.id === progressionId);
  if (!preset) return null;

  const rootPitchClass = nameToPitchClass(keyRoot);
  const diatonicChords = generateDiatonicChords(rootPitchClass, mode);

  const scheduledChords: ScheduledChord[] = [];

  for (const patternChord of preset.pattern) {
    const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);
    if (!diatonic) continue;

    // Use the quality override from the progression pattern if specified,
    // otherwise use the diatonic quality
    const quality = patternChord.quality ?? diatonic.quality;
    const voicingKey = getVoicingKey(diatonic.root, quality);
    const voicingData = chordVoicings[voicingKey];

    let voicing: { frets: number[]; baseFret: number } | undefined;

    if (voicingData) {
      const pos = findDefaultVoicing(voicingData);
      if (pos) {
        voicing = { frets: pos.frets, baseFret: pos.baseFret };
      }
    }

    if (!voicing) {
      // Fallback: try the basic major/minor voicing
      const isMinorQuality = quality === 'minor' || quality.startsWith('minor') || quality === 'half-diminished7' || quality === 'diminished';
      const fallbackSuffix = isMinorQuality ? 'minor' : 'major';
      const fallbackKey = `${VOICING_NOTE_NAMES[diatonic.root] ?? 'C'}_${fallbackSuffix}`;
      const fallbackData = chordVoicings[fallbackKey];

      if (fallbackData) {
        const pos = findDefaultVoicing(fallbackData);
        if (pos) {
          voicing = { frets: pos.frets, baseFret: pos.baseFret };
        }
      }
    }

    if (!voicing) {
      // Last resort: quality-appropriate open shape
      voicing = (quality === 'minor' || quality.startsWith('minor') || quality === 'half-diminished7' || quality === 'diminished')
        ? { frets: [0, 2, 2, 0, 0, 0], baseFret: 1 }  // Em
        : { frets: [0, 0, 1, 2, 2, 0], baseFret: 1 };  // E
    }

    scheduledChords.push({
      voicing,
      durationBeats: preset.beatsPerChord,
    });
  }

  const totalBeats = scheduledChords.reduce((sum, c) => sum + c.durationBeats, 0);

  return {
    chords: scheduledChords,
    totalBeats,
    beatsPerChord: preset.beatsPerChord,
  };
}

/**
 * Get the display name for a chord in the current progression at a given index.
 */
function getChordDisplayName(
  progressionId: string,
  chordIndex: number,
  keyRoot: NoteName,
  mode: 'major' | 'minor'
): string {
  const preset = PRESET_PROGRESSIONS.find((p) => p.id === progressionId);
  if (!preset || chordIndex < 0 || chordIndex >= preset.pattern.length) return '';

  const rootPitchClass = nameToPitchClass(keyRoot);
  const diatonicChords = generateDiatonicChords(rootPitchClass, mode);
  const patternChord = preset.pattern[chordIndex];
  const diatonic = diatonicChords.find((c) => c.degree === patternChord.degree);

  if (!diatonic) return patternChord.romanNumeral;

  // Build display name from quality
  const quality = patternChord.quality ?? diatonic.quality;
  const noteName = pitchClassToName(diatonic.root, true);

  switch (quality) {
    case 'major': return noteName;
    case 'minor': return `${noteName}m`;
    case 'diminished': return `${noteName}dim`;
    case 'augmented': return `${noteName}aug`;
    case 'dominant7': return `${noteName}7`;
    case 'major7': return `${noteName}maj7`;
    case 'minor7': return `${noteName}m7`;
    case 'half-diminished7': return `${noteName}m7b5`;
    case 'sus2': return `${noteName}sus2`;
    case 'sus4': return `${noteName}sus4`;
    case 'add9': return `${noteName}add9`;
    case 'major9': return `${noteName}maj9`;
    case 'minor9': return `${noteName}m9`;
    case 'dominant9': return `${noteName}9`;
    case '11': return `${noteName}11`;
    case 'minor11': return `${noteName}m11`;
    default: return noteName;
  }
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
    setAudioContextReady,
  } = useAppStore();

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
  const currentChordName = selectedProgressionId
    ? getChordDisplayName(selectedProgressionId, currentChordIndex, keyRoot, mode)
    : '';

  const play = useCallback(async () => {
    if (!selectedProgressionId || isSchedulingRef.current) return;

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
    const scheduled = buildScheduledProgression(selectedProgressionId, keyRoot, mode);
    if (!scheduled) return;

    // Apply current settings
    engine.transport.setTempo(tempo);
    engine.setMasterVolume(masterVolume);
    engine.drums.setMuted(drumsMuted);
    engine.metronome.enabled = metronomeEnabled;

    // Set count-in state
    setPlaybackState('count-in');
    setCurrentChordIndex(0);

    // Schedule the progression
    engine.transport.scheduleProgression(
      scheduled,
      (chordIndex) => {
        setCurrentChordIndex(chordIndex);
      },
      (_beat) => {
        // On first beat after count-in, switch to playing state
        if (useAppStore.getState().playbackState === 'count-in') {
          setPlaybackState('playing');
          // Auto-reveal the progression's chords
          if (selectedProgressionId) {
            useAppStore.getState().revealProgression(selectedProgressionId);
          }
        }
      },
      engine.guitar,
      engine.drums,
      engine.metronome
    );

    isScheduledRef.current = true;

    // Start transport
    engine.transport.resume();
    } finally {
      isSchedulingRef.current = false;
    }
  }, [
    selectedProgressionId,
    keyRoot,
    mode,
    playbackState,
    tempo,
    masterVolume,
    drumsMuted,
    metronomeEnabled,
    setPlaybackState,
    setCurrentChordIndex,
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
  }, [setPlaybackState, setCurrentChordIndex]);

  // Stop playback when progression or key changes
  useEffect(() => {
    if (isScheduledRef.current) {
      const engine = getAudioEngine();
      engine.transport.clear();
      isScheduledRef.current = false;
      setPlaybackState('stopped');
      setCurrentChordIndex(0);
    }
  }, [selectedProgressionId, keyRoot, mode, setPlaybackState, setCurrentChordIndex]);

  return {
    play,
    pause,
    stop,
    currentChordName,
  };
}
