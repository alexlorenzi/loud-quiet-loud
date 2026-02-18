const PRESETS_INDEX_KEY = 'lql:presets:index';
const PRESET_KEY_PREFIX = 'lql:presets:item:';
const MAX_PRESETS = 10;

export { MAX_PRESETS };

export interface StoredPreset {
  id: string;
  name: string;
  createdAt: string;       // ISO 8601
  keyRoot: string;         // NoteName
  mode: string;            // Mode
  progressionId: string;
  scaleShapeId: string;    // legacy, kept for backward compat
  scaleType?: string;      // ScaleType or empty
  scalePosition?: number;  // 1-5
  tempo: number;
}

/**
 * Read the ordered list of preset IDs from localStorage.
 * Returns an empty array on parse error or missing key.
 */
export function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(PRESETS_INDEX_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

/**
 * Write the ordered list of preset IDs to localStorage.
 * Returns false if the write fails (e.g. QuotaExceededError).
 */
export function writeIndex(ids: string[]): boolean {
  try {
    localStorage.setItem(PRESETS_INDEX_KEY, JSON.stringify(ids));
    return true;
  } catch (e) {
    console.error('Failed to write preset index:', e);
    return false;
  }
}

/**
 * Read a single preset by ID from localStorage.
 * Returns null on parse error or missing key.
 */
export function readPreset(id: string): StoredPreset | null {
  try {
    const raw = localStorage.getItem(PRESET_KEY_PREFIX + id);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    // Basic shape check
    const obj = parsed as Record<string, unknown>;
    if (
      typeof obj.id !== 'string' ||
      typeof obj.name !== 'string' ||
      typeof obj.createdAt !== 'string' ||
      typeof obj.keyRoot !== 'string' ||
      typeof obj.mode !== 'string' ||
      typeof obj.progressionId !== 'string' ||
      typeof obj.scaleShapeId !== 'string' ||
      typeof obj.tempo !== 'number'
    ) {
      return null;
    }
    return obj as unknown as StoredPreset;
  } catch {
    return null;
  }
}

/**
 * Write a single preset to localStorage.
 * Returns false if the write fails (e.g. QuotaExceededError).
 */
export function writePreset(preset: StoredPreset): boolean {
  try {
    localStorage.setItem(PRESET_KEY_PREFIX + preset.id, JSON.stringify(preset));
    return true;
  } catch (e) {
    console.error('Failed to write preset:', e);
    return false;
  }
}

/**
 * Delete a single preset from localStorage.
 */
export function deletePresetStorage(id: string): void {
  localStorage.removeItem(PRESET_KEY_PREFIX + id);
}
