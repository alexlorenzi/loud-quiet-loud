import * as Tone from 'tone';
import { GuitarSynth } from './guitar-synth.js';
import { DrumSynth } from './drum-synth.js';
import { Metronome } from './metronome.js';
import { Transport } from './transport.js';

export class AudioEngine {
  readonly guitar: GuitarSynth;
  readonly drums: DrumSynth;
  readonly metronome: Metronome;
  readonly transport: Transport;

  constructor() {
    this.guitar = new GuitarSynth();
    this.drums = new DrumSynth();
    this.metronome = new Metronome();
    this.transport = new Transport();
  }

  setMasterVolume(db: number): void {
    Tone.Destination.volume.value = db;
  }

  dispose(): void {
    this.transport.clear();
    this.guitar.dispose();
    this.drums.dispose();
    this.metronome.dispose();
  }
}

// Singleton instance
let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    try {
      engineInstance = new AudioEngine();
    } catch (e) {
      console.error('Failed to initialize audio engine:', e);
      throw new Error('Audio system initialization failed. Your browser may not support Web Audio API.');
    }
  }
  return engineInstance;
}
