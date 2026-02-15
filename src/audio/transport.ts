import * as Tone from 'tone';
import type { ScheduledProgression } from '../types/audio.js';
import type { GuitarSynth } from './guitar-synth.js';
import type { DrumSynth } from './drum-synth.js';
import type { Metronome } from './metronome.js';

export class Transport {
  private scheduledEventIds: number[] = [];
  private loopId: number | null = null;
  private beatCounter = 0;

  /**
   * Schedule a progression for playback with a 4-beat count-in.
   *
   * @param progression - The chord progression to play
   * @param onChordChange - Called each time the chord changes (index into progression.chords)
   * @param onBeat - Called on each beat (beat number within the current chord, 0-indexed)
   * @param guitar - GuitarSynth instance
   * @param drums - DrumSynth instance
   * @param metronome - Metronome instance
   */
  scheduleProgression(
    progression: ScheduledProgression,
    onChordChange: (chordIndex: number) => void,
    onBeat: (beat: number) => void,
    guitar: GuitarSynth,
    drums: DrumSynth,
    metronome: Metronome
  ): void {
    this.clear();

    const transport = Tone.getTransport();
    const countInBeats = 4;

    // Schedule count-in: 4 beats of metronome only (always audible)
    for (let beat = 0; beat < countInBeats; beat++) {
      const id = transport.schedule((time) => {
        metronome.click(time, beat === 0);
        // Use Tone.getDraw() to schedule UI updates on the animation frame
        Tone.getDraw().schedule(() => {
          onBeat(beat);
        }, time);
      }, `0:${beat}:0`);
      this.scheduledEventIds.push(id);
    }

    // Schedule the progression loop after the count-in
    const totalProgressionBeats = progression.totalBeats;
    const countInBars = `${Math.ceil(countInBeats / 4)}:0:0`;

    // Use a repeating callback for the main progression loop
    this.beatCounter = 0;

    this.loopId = transport.scheduleRepeat(
      (time) => {
        const currentBeat = this.beatCounter % totalProgressionBeats;

        // Determine which chord we're on
        let beatsAccum = 0;
        let chordIndex = 0;
        for (let i = 0; i < progression.chords.length; i++) {
          if (currentBeat < beatsAccum + progression.chords[i].durationBeats) {
            chordIndex = i;
            break;
          }
          beatsAccum += progression.chords[i].durationBeats;
        }

        const beatWithinChord = currentBeat - beatsAccum;
        const globalBeat = currentBeat % 4; // beat within a 4-beat bar

        // Guitar: strum at the start of each chord
        if (beatWithinChord === 0) {
          const chord = progression.chords[chordIndex];
          guitar.strum(chord.voicing.frets, chord.voicing.baseFret, time);
        }

        // Drums: kick on beats 0,2 (1,3 in musician terms); snare on beats 1,3 (2,4)
        if (globalBeat === 0 || globalBeat === 2) {
          drums.triggerKick(time);
        }
        if (globalBeat === 1 || globalBeat === 3) {
          drums.triggerSnare(time);
        }

        // Metronome: only if enabled (count-in always has metronome, handled above)
        if (metronome.enabled) {
          metronome.click(time, globalBeat === 0);
        }

        // UI callbacks via Draw scheduler
        Tone.getDraw().schedule(() => {
          if (beatWithinChord === 0) {
            onChordChange(chordIndex);
          }
          onBeat(currentBeat);
        }, time);

        this.beatCounter++;
      },
      '4n', // every quarter note
      countInBars // start after count-in
    );
  }

  setTempo(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  pause(): void {
    Tone.getTransport().pause();
  }

  resume(): void {
    Tone.getTransport().start();
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
  }

  clear(): void {
    const transport = Tone.getTransport();
    for (const id of this.scheduledEventIds) {
      transport.clear(id);
    }
    this.scheduledEventIds = [];

    if (this.loopId !== null) {
      transport.clear(this.loopId);
      this.loopId = null;
    }

    transport.stop();
    transport.position = 0;
    transport.cancel(0);
    this.beatCounter = 0;
  }
}
