import * as Tone from 'tone';

export class Metronome {
  private synth: Tone.Synth;
  private volume: Tone.Volume;
  private _enabled = false;

  constructor() {
    // -3dB relative to guitar
    this.volume = new Tone.Volume(-3).toDestination();

    this.synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    }).connect(this.volume);
  }

  /**
   * Play a metronome click.
   * G5 for downbeat (beat 1), C5 for other beats.
   */
  click(time?: number, isDownbeat = false): void {
    const note = isDownbeat ? 'G5' : 'C5';
    this.synth.triggerAttackRelease(note, '32n', time);
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  dispose(): void {
    this.synth.dispose();
    this.volume.dispose();
  }
}
