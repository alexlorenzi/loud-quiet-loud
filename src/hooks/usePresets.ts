import { useState, useCallback, useMemo } from 'react';
import { PresetRepository } from '../storage/preset-repository.js';
import type { StoredPreset } from '../storage/preset-repository.js';
import { useAppStore } from '../store/app-store.js';

const repo = new PresetRepository();

export interface UsePresetsResult {
  presets: StoredPreset[];
  isFull: boolean;
  savePreset: (name: string) => boolean;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;
}

export function usePresets(): UsePresetsResult {
  // Revision counter to force re-read from localStorage after mutations
  const [revision, setRevision] = useState(0);

  const presets = useMemo(() => {
    // revision dependency ensures we re-read after mutations
    void revision;
    return repo.list();
  }, [revision]);

  const isFull = useMemo(() => repo.isFull(), [revision]);

  const refresh = useCallback(() => {
    setRevision((r) => r + 1);
  }, []);

  const savePreset = useCallback(
    (name: string): boolean => {
      const state = useAppStore.getState();
      const result = repo.save({
        name,
        keyRoot: state.keyRoot,
        mode: state.mode,
        progressionId: state.selectedProgressionId ?? '',
        scaleShapeId: state.selectedScaleShapeId,
        tempo: state.tempo,
      });

      if (result) {
        refresh();
        return true;
      }
      return false;
    },
    [refresh],
  );

  const loadPreset = useCallback((id: string): void => {
    const preset = repo.get(id);
    if (!preset) return;

    const store = useAppStore.getState();
    store.setKey(
      preset.keyRoot as Parameters<typeof store.setKey>[0],
      preset.mode as Parameters<typeof store.setKey>[1],
    );
    store.setProgression(preset.progressionId || null);
    store.setScaleShape(preset.scaleShapeId);
    store.setTempo(preset.tempo);
  }, []);

  const deletePreset = useCallback(
    (id: string): void => {
      repo.delete(id);
      refresh();
    },
    [refresh],
  );

  const renamePreset = useCallback(
    (id: string, name: string): void => {
      repo.rename(id, name);
      refresh();
    },
    [refresh],
  );

  return { presets, isFull, savePreset, loadPreset, deletePreset, renamePreset };
}
