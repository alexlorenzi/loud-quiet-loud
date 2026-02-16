import * as Tone from 'tone';
import type { ScheduledProgression } from '../types/audio.js';
import type { StrumPattern, StrumDirection } from '../types/strum.js';
import { STRUM_VELOCITY } from '../constants/strum-patterns.js';
import type { GuitarSynth } from './guitar-synth.js';
import type { DrumSynth } from './drum-synth.js';
import type { Metronome } from './metronome.js';

export class Transport {
  private scheduledEventIds: number[] = [];
  private loopId: number | null = null;
  private eighthNoteCounter = 0;

  /**
   * Schedule a progression for playback with a 4-beat count-in.
   *
   * The main loop runs at eighth-note resolution ('8n') to support strum
   * patterns. Drums and metronome are gated to quarter-note positions only.
   *
   * @param progression - The chord progression to play
   * @param strumPattern - 8-slot pattern defining strum actions per bar
   * @param onChordChange - Called each time the chord changes (index into progression.chords)
   * @param onBeat - Called on each quarter-note beat
   * @param onEighthNote - Called on each eighth note with the slot index (0-7) within the bar
   * @param guitar - GuitarSynth instance
   * @param drums - DrumSynth instance
   * @param metronome - Metronome instance
   */
  scheduleProgression(
    progression: ScheduledProgression,
    strumPattern: StrumPattern,
    onChordChange: (chordIndex: number) => void,
    onBeat: (beat: number) => void,
    onEighthNote: (slotInBar: number) => void,
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
    const totalEighthNotes = totalProgressionBeats * 2;
    const countInBars = `${Math.ceil(countInBeats / 4)}:0:0`;

    this.eighthNoteCounter = 0;

    this.loopId = transport.scheduleRepeat(
      (time) => {
        const currentEighth = this.eighthNoteCounter % totalEighthNotes;
        const isUpbeat = currentEighth % 2 === 1; // & of the beat

        // Convert eighth-note position to quarter-note beat
        const currentBeat = Math.floor(currentEighth / 2);

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

        // Strum pattern: compute slot index (0-7) within the current bar
        const barBeat = currentBeat % 4;
        const slotInBar = barBeat * 2 + (isUpbeat ? 1 : 0);
        const strumSlot = strumPattern[slotInBar];

        // Guitar: execute strum based on pattern slot
        if (strumSlot !== '-') {
          const chord = progression.chords[chordIndex];
          const direction: StrumDirection = strumSlot === 'U' ? 'up' : 'down';
          const velocity = STRUM_VELOCITY[strumSlot];
          guitar.strum(
            chord.voicing.frets,
            chord.voicing.baseFret,
            time,
            0.01,
            direction,
            velocity
          );
        }

        // Drums: kick on beats 0,2; snare on beats 1,3 — quarter notes only
        if (!isUpbeat) {
          if (globalBeat === 0 || globalBeat === 2) {
            drums.triggerKick(time);
          }
          if (globalBeat === 1 || globalBeat === 3) {
            drums.triggerSnare(time);
          }
        }

        // Metronome: only on quarter-note beats, only if enabled
        if (!isUpbeat && metronome.enabled) {
          metronome.click(time, globalBeat === 0);
        }

        // UI callbacks via Draw scheduler
        Tone.getDraw().schedule(() => {
          // Chord change and beat callbacks on quarter notes only
          if (!isUpbeat) {
            if (beatWithinChord === 0) {
              onChordChange(chordIndex);
            }
            onBeat(currentBeat);
          }
          // Eighth-note cursor for rhythm notation (fires every eighth)
          onEighthNote(slotInBar);
        }, time);

        this.eighthNoteCounter++;
      },
      '8n', // eighth-note resolution for strum patterns
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
    this.eighthNoteCounter = 0;
  }
}
