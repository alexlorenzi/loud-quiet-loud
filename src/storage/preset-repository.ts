import {
  readIndex,
  writeIndex,
  readPreset,
  writePreset,
  deletePresetStorage,
  MAX_PRESETS,
} from './local-storage.js';
import type { StoredPreset } from './local-storage.js';

export type { StoredPreset } from './local-storage.js';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class PresetRepository {
  /**
   * List all stored presets in index order.
   * Silently drops entries whose data is missing or corrupt.
   */
  list(): StoredPreset[] {
    const ids = readIndex();
    const presets: StoredPreset[] = [];
    for (const id of ids) {
      const preset = readPreset(id);
      if (preset) presets.push(preset);
    }
    return presets;
  }

  /**
   * Get a single preset by ID.
   */
  get(id: string): StoredPreset | null {
    return readPreset(id);
  }

  /**
   * Save a new preset. Returns the created preset, or null if at max capacity
   * or if the write fails (e.g. storage quota exceeded).
   */
  save(data: Omit<StoredPreset, 'id' | 'createdAt'>): StoredPreset | null {
    if (this.isFull()) return null;

    const preset: StoredPreset = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    if (!writePreset(preset)) return null;

    const ids = readIndex();
    ids.push(preset.id);
    if (!writeIndex(ids)) {
      // Rollback the preset write
      deletePresetStorage(preset.id);
      return null;
    }

    return preset;
  }

  /**
   * Delete a preset by ID. Returns true if it existed and was removed.
   */
  delete(id: string): boolean {
    const ids = readIndex();
    const idx = ids.indexOf(id);
    if (idx === -1) return false;

    ids.splice(idx, 1);
    writeIndex(ids);
    deletePresetStorage(id);
    return true;
  }

  /**
   * Rename a preset. Returns true if the preset was found and renamed.
   */
  rename(id: string, newName: string): boolean {
    const preset = readPreset(id);
    if (!preset) return false;

    preset.name = newName;
    return writePreset(preset);
  }

  /**
   * Check if the preset store is at maximum capacity.
   */
  isFull(): boolean {
    return readIndex().length >= MAX_PRESETS;
  }
}
