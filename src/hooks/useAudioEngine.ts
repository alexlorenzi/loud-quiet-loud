import { useEffect, useRef } from 'react';
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
  const engineRef = useRef<AudioEngine>(getAudioEngine());
  const { setAudioContextReady, setAudioLoadError } = useAppStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't dispose the singleton on component unmount -
      // it lives for the lifetime of the app
    };
  }, []);

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
    engine: engineRef.current,
    initAudio,
  };
}
