# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # TypeScript type-check + Vite production build
npm run lint         # ESLint (flat config, ESLint 9.x)
npx vitest           # Run all tests (Vitest + JSDOM + Testing Library)
npx vitest run src/__tests__/engine/music-theory.test.ts  # Run a single test file
```

## Verification

- After completing any piece of work, always run lint and build before considering it done:
  ```bash
  npm run lint && npm run build
  ```

## Git

- The git repo is in the `app/` directory — always commit from there
- Use **Conventional Commits** for all commit messages: `type(scope): description`
  - Types: `feat`, `fix`, `style`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`
  - Example: `style(ui): restyle to brutalist aesthetic`
- **Commit signing**: This repo uses SSH commit signing via 1Password. The `git` binary is excluded from the sandbox, but shell-level heredocs (`cat <<'EOF'`) fail because the shell is still sandboxed. Always pass commit messages with `-m` flags, not heredocs.

## Architecture

Guitar chord progression explorer — pick a key, browse diatonic chords with fingering diagrams, select preset progressions, and hear them played back with synthesized guitar, drums, and metronome.

**Stack**: React 19 · TypeScript (strict) · Vite · Zustand 5 · Tone.js 15 · chords-db · Vitest

### Source layout (`src/`)

| Directory | Purpose |
|-----------|---------|
| `types/` | Domain types: `music.ts` (PitchClass, Scale, DiatonicChord, ChordQuality), `audio.ts`, `chords.ts`, `ui.ts` |
| `engine/` | Pure music theory: scale computation, diatonic chord generation, chord-tone classification, fretboard mapping, note conversions |
| `audio/` | Tone.js wrappers: `AudioEngine` singleton orchestrates `GuitarSynth` (6 PluckSynths), `DrumSynth`, `Metronome`, and `Transport` (beat scheduling with 4-beat count-in) |
| `constants/` | Static data: 40+ preset progressions, scale shapes, standard tuning MIDI values, theory content |
| `data/` | `voicing-lookup.ts` — maps chord qualities to guitar voicings from chords-db |
| `store/` | Single Zustand store (`app-store.ts`) — key/mode, progression, playback state, UI state |
| `storage/` | localStorage abstraction for user preset CRUD |
| `hooks/` | `usePlayback` (scheduling + play/pause/stop), `useAudioEngine` (init), `usePresets` (CRUD), `useTheoryContent`, `use-media-query` |
| `components/` | Organized by domain: `layout/`, `key-selector/`, `chord-explorer/`, `progressions/`, `fretboard/`, `scales/`, `playback/`, `presets/`, `theory/`, `shared/` |

### Data flow

1. User selects key → store updates root + mode
2. `App.tsx` derives scale and 7 diatonic chords via memoized engine calls
3. User picks a preset progression → store updates
4. `usePlayback` maps progression degrees to chord voicings → `ScheduledProgression`
5. Play → `ensureAudioContext()` + `transport.scheduleProgression()` (Tone.js Transport)
6. Per-beat callbacks update UI via `Tone.getDraw()` (animation-frame safe) — current chord index, fretboard note classification (root/3rd/5th/7th/scale/non-scale → color codes)

### Key types

- **`PitchClass`** (0–11): canonical chromatic pitch, used everywhere in engine
- **`ChordQuality`**: 16 variants (major, minor, dim, aug, 7, maj7, m7, m7b5, sus2, sus4, add9, maj9, m9, 9, 11, m11) — these map to chords-db suffix strings
- **`DiatonicChord`**: degree, romanNumeral, root, quality, chordFunction, tones
- **`ScheduledProgression`**: chords[] with voicing (frets + baseFret), totalBeats, beatsPerChord
