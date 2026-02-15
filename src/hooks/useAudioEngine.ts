import { useAppStore } from '../store/app-store.js';
import { getAudioEngine } from '../audio/audio-engine.js';
import { ensureAudioContext } from '../audio/context-manager.js';
import type { AudioEngine } from '../audio/audio-engine.js';

/**
 * React hook that provides the audio engine singleton and manages
 * AudioContext initialization on first user interaction.
 */
export function useAudioEngine(): {
  engine: AudioEngine;
  initAudio: () => Promise<boolean>;
} {
  // getAudioEngine() returns a module-level singleton that never changes,
  // so it's safe to call directly without a ref.
  const engine = getAudioEngine();
  const { setAudioContextReady, setAudioLoadError } = useAppStore();

  async function initAudio(): Promise<boolean> {
    try {
      const success = await ensureAudioContext();
      setAudioContextReady(success);
      if (!success) {
        setAudioLoadError(true);
      }
      return success;
    } catch {
      setAudioLoadError(true);
      setAudioContextReady(false);
      return false;
    }
  }

  return {
    engine,
    initAudio,
  };
}
