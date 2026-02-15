import { create } from 'zustand';
import type { NoteName, Mode } from '../types/music.js';
import type { PlaybackState } from '../types/audio.js';
import type { MobileTab, Announcement } from '../types/ui.js';

interface AppState {
  // Key selection
  keyRoot: NoteName;
  mode: Mode;
  setKey: (root: NoteName, mode: Mode) => void;

  // Progression selection
  selectedProgressionId: string | null;
  setProgression: (id: string | null) => void;

  // Scale shape visualization
  selectedScaleShapeId: string;
  scaleShapeVisible: boolean;
  setScaleShape: (id: string) => void;
  toggleScaleShapeOverlay: () => void;
  selectOrDeselectShape: (id: string) => void;

  // Playback state
  playbackState: PlaybackState;
  currentChordIndex: number;
  tempo: number;
  masterVolume: number;
  drumsMuted: boolean;
  metronomeEnabled: boolean;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentChordIndex: (index: number) => void;
  setTempo: (bpm: number) => void;
  setMasterVolume: (db: number) => void;
  toggleDrumsMuted: () => void;
  toggleMetronome: () => void;

  // Theory popup (for chord explanations)
  activeTheoryPopupId: string | null;
  setTheoryPopup: (id: string | null) => void;

  // Mobile navigation
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;

  // Audio system status
  audioContextReady: boolean;
  audioLoadError: boolean;
  setAudioContextReady: (ready: boolean) => void;
  setAudioLoadError: (error: boolean) => void;

  // Chord selection for detail view
  selectedChordDegree: number | null;
  setSelectedChordDegree: (degree: number | null) => void;

  // High contrast mode
  highContrast: boolean;
  toggleHighContrast: () => void;

  // Screen reader announcements
  announcement: Announcement | null;
  announce: (message: string) => void;

  // Mini player expanded state
  miniPlayerExpanded: boolean;
  setMiniPlayerExpanded: (expanded: boolean) => void;

  // Toast notifications
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial key: C Major
  keyRoot: 'C',
  mode: 'major',
  setKey: (root, mode) =>
    set({ keyRoot: root, mode, playbackState: 'stopped', currentChordIndex: 0 }),

  // No progression selected initially
  selectedProgressionId: null,
  setProgression: (id) =>
    set({ selectedProgressionId: id, playbackState: 'stopped', currentChordIndex: 0 }),

  // Default scale shape: Minor Pentatonic Box 1
  selectedScaleShapeId: 'pentatonic-minor-box1',
  scaleShapeVisible: false,
  setScaleShape: (id) => set({ selectedScaleShapeId: id }),
  toggleScaleShapeOverlay: () => set((state) => ({ scaleShapeVisible: !state.scaleShapeVisible })),
  selectOrDeselectShape: (id) =>
    set((state) => {
      if (state.selectedScaleShapeId === id && state.scaleShapeVisible) {
        return { scaleShapeVisible: false };
      }
      return { selectedScaleShapeId: id, scaleShapeVisible: true };
    }),

  // Playback defaults
  playbackState: 'stopped',
  currentChordIndex: 0,
  tempo: 100,
  masterVolume: -6,
  drumsMuted: false,
  metronomeEnabled: false,
  setPlaybackState: (state) => set({ playbackState: state }),
  setCurrentChordIndex: (index) => set({ currentChordIndex: index }),
  setTempo: (bpm) => set({ tempo: bpm }),
  setMasterVolume: (db) => set({ masterVolume: db }),
  toggleDrumsMuted: () => set((state) => ({ drumsMuted: !state.drumsMuted })),
  toggleMetronome: () => set((state) => ({ metronomeEnabled: !state.metronomeEnabled })),

  // Theory popup
  activeTheoryPopupId: null,
  setTheoryPopup: (id) => set({ activeTheoryPopupId: id }),

  // Mobile tab (default to chords)
  activeTab: 'chords',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Audio system (not ready until user interaction)
  audioContextReady: false,
  audioLoadError: false,
  setAudioContextReady: (ready) => set({ audioContextReady: ready }),
  setAudioLoadError: (error) => set({ audioLoadError: error }),

  // Chord detail view
  selectedChordDegree: null,
  setSelectedChordDegree: (degree) => set({ selectedChordDegree: degree }),

  // High contrast (load from localStorage, safely, and sync DOM on init)
  highContrast: (() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('lql-high-contrast') === 'true';
      if (stored) {
        document.body.classList.add('high-contrast');
      }
      return stored;
    } catch {
      return false;
    }
  })(),
  toggleHighContrast: () =>
    set((state) => {
      const next = !state.highContrast;
      localStorage.setItem('lql-high-contrast', String(next));
      if (next) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      return { highContrast: next };
    }),

  // Screen reader announcements
  announcement: null,
  announce: (message) => set({ announcement: { message, timestamp: Date.now() } }),

  // Mini player
  miniPlayerExpanded: false,
  setMiniPlayerExpanded: (expanded) => set({ miniPlayerExpanded: expanded }),

  // Toast notifications
  toastMessage: null,
  toastType: 'info',
  showToast: (message, type = 'info') => set({ toastMessage: message, toastType: type }),
  dismissToast: () => set({ toastMessage: null }),
}));
