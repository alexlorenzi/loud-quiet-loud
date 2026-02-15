# Loud Quiet Loud

A guitar chord progression helper for exploring music theory and discovering songwriting ideas. Select a key, browse diatonic chords with fingering diagrams, pick from preset progressions, and hear them played back with synthesized guitar, drums, and metronome.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | TypeScript check + production bundle |
| `npm run build:chords` | Regenerate `chord-voicings.json` from chords-db |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** for state management
- **Tone.js** for Web Audio synthesis (guitar, drums, metronome)
- **Vitest** + **Testing Library** for tests
- Plain CSS (no framework)
- localStorage for preset persistence

## Project Structure

```
src/
├── types/          # TypeScript type definitions (music, audio, chords, progression, ui)
├── constants/      # Static data (tuning, scales, progressions, theory content)
├── engine/         # Music theory computation (scales, chords, fretboard mapping)
├── audio/          # Web Audio synthesis via Tone.js (guitar, drums, metronome, transport)
├── data/           # Generated chord voicings JSON
├── store/          # Zustand store + selectors
├── storage/        # localStorage abstraction + preset CRUD
├── hooks/          # Custom React hooks (audio, playback, fretboard, presets, etc.)
├── components/
│   ├── layout/         # AppShell, Header, MobileTabNav, MiniPlayer
│   ├── key-selector/   # Key & mode selection
│   ├── chord-explorer/ # Diatonic chord grid + SVG fingering diagrams
│   ├── progressions/   # Preset progression library
│   ├── fretboard/      # Interactive ARIA-grid fretboard
│   ├── scales/         # Scale shape visualization
│   ├── playback/       # Transport controls
│   ├── presets/        # Save/load presets
│   ├── theory/         # Contextual theory explanations
│   └── shared/         # Accessibility helpers, toasts, banners
└── __tests__/      # Vitest unit tests
```

## How It Works

1. Select a **key** and **mode** (major/minor)
2. The engine computes the **scale** and **diatonic chords** for that key
3. Pick a **chord progression** from the preset library (organized by genre/feel)
4. Hit **play** to hear it via Tone.js-scheduled synthesis
5. The **fretboard** highlights scale notes and chord tones in real time
6. Save favorite setups as **presets** to localStorage
