import * as Tone from 'tone';

export class DrumSynth {
  private kick: Tone.MembraneSynth;
  private snare: Tone.NoiseSynth;
  private kickVolume: Tone.Volume;
  private snareVolume: Tone.Volume;
  private muted = false;

  constructor() {
    // -6dB relative to guitar
    this.kickVolume = new Tone.Volume(-6).toDestination();
    this.snareVolume = new Tone.Volume(-6).toDestination();

    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
      },
    }).connect(this.kickVolume);

    this.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.2,
      },
    }).connect(this.snareVolume);
  }

  triggerKick(time?: number): void {
    if (this.muted) return;
    this.kick.triggerAttackRelease('C2', '8n', time);
  }

  triggerSnare(time?: number): void {
    if (this.muted) return;
    this.snare.triggerAttackRelease('8n', time);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    this.kick.dispose();
    this.snare.dispose();
    this.kickVolume.dispose();
    this.snareVolume.dispose();
  }
}
