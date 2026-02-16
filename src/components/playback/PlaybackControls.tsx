import type React from 'react';
import { useAppStore } from '../../store/app-store.js';
import { usePlayback } from '../../hooks/usePlayback.js';
import styles from './PlaybackControls.module.css';

export function PlaybackControls(): React.JSX.Element {
  const {
    playbackState,
    tempo,
    masterVolume,
    drumsMuted,
    metronomeEnabled,
    selectedProgressionId,
    setTempo,
    setMasterVolume,
    toggleDrumsMuted,
    toggleMetronome,
  } = useAppStore();

  const { play, pause, stop, currentChordName } = usePlayback();

  function handlePlay(): void {
    if (playbackState === 'playing') {
      pause();
    } else {
      void play();
    }
  }

  function handleStop(): void {
    stop();
  }

  const isDisabled = !selectedProgressionId;
  const isActive = playbackState === 'playing' || playbackState === 'count-in';

  return (
    <div className={styles.controls}>
      <div className={styles.transport}>
        <button
          className={`${styles.button} ${isActive ? styles.primary : ''}`}
          onClick={handlePlay}
          disabled={isDisabled}
          aria-label={playbackState === 'playing' ? 'Pause' : 'Play'}
        >
          {playbackState === 'playing' ? '\u23F8' : '\u25B6'}
        </button>
        <button
          className={styles.button}
          onClick={handleStop}
          disabled={isDisabled}
          aria-label="Stop"
        >
          {'\u23F9'}
        </button>
      </div>

      <div className={styles.currentChord}>
        <div className={styles.chordLabel}>
          {playbackState === 'count-in' ? 'Count In...' : 'Current Chord'}
        </div>
        <div className={styles.chordName}>
          {isActive || playbackState === 'paused'
            ? currentChordName || '\u2014'
            : '\u2014'}
        </div>
      </div>

      <div className={styles.settings}>
        <div className={styles.setting}>
          <span className={styles.label}>Tempo:</span>
          <input
            type="range"
            min="60"
            max="200"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className={styles.slider}
            aria-label="Tempo"
          />
          <span className={styles.value}>{tempo} BPM</span>
        </div>

        <div className={styles.setting}>
          <span className={styles.label}>Volume:</span>
          <input
            type="range"
            min="-40"
            max="0"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className={styles.slider}
            aria-label="Master volume"
          />
          <span className={styles.value}>{masterVolume} dB</span>
        </div>

        <button
          className={`${styles.toggleButton} ${drumsMuted ? '' : styles.active}`}
          onClick={toggleDrumsMuted}
          aria-pressed={!drumsMuted}
        >
          Drums
        </button>

        <button
          className={`${styles.toggleButton} ${metronomeEnabled ? styles.active : ''}`}
          onClick={toggleMetronome}
          aria-pressed={metronomeEnabled}
        >
          Metro
        </button>
      </div>
    </div>
  );
}
