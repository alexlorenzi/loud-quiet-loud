import { PRESET_PROGRESSIONS } from '../constants/progressions.js';
import type { CustomLoop, ResolvedProgression } from '../types/loop.js';

/**
 * Resolve the active playback source into a unified descriptor.
 * Returns null when nothing is selected/active.
 */
export function resolveActiveProgression(
  selectedProgressionId: string | null,
  activeLoop: CustomLoop | null,
): ResolvedProgression | null {
  if (selectedProgressionId) {
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === selectedProgressionId);
    if (!preset) return null;
    return {
      pattern: preset.pattern,
      beatsPerChord: preset.beatsPerChord,
      genre: preset.genre,
      source: 'preset',
    };
  }
  if (activeLoop && activeLoop.chords.length > 0) {
    return {
      pattern: activeLoop.chords,
      beatsPerChord: activeLoop.beatsPerChord,
      genre: activeLoop.strumGenre,
      source: 'loop',
    };
  }
  return null;
}
