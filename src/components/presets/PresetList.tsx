import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePresets } from '../../hooks/usePresets.js';
import { useAppStore } from '../../store/app-store.js';
import { MAX_PRESETS } from '../../storage/local-storage.js';
import { SavePresetDialog } from './SavePresetDialog.js';
import styles from './PresetList.module.css';

export function PresetList(): React.JSX.Element {
  const { presets, isFull, savePreset, loadPreset, deletePreset } = usePresets();
  const showToast = useAppStore((s) => s.showToast);

  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLoad = useCallback(
    (id: string) => {
      loadPreset(id);
      setIsOpen(false);
      showToast('Preset loaded', 'success');
    },
    [loadPreset, showToast],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deletePreset(id);
      showToast('Preset deleted', 'info');
    },
    [deletePreset, showToast],
  );

  const handleSave = useCallback(
    (name: string) => {
      const success = savePreset(name);
      setShowSaveDialog(false);
      if (success) {
        showToast('Preset saved', 'success');
      } else {
        showToast('Could not save preset (at capacity)', 'error');
      }
    },
    [savePreset, showToast],
  );

  return (
    <>
      <div className={styles.wrapper} ref={wrapperRef}>
        <button
          className={styles.trigger}
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className={styles.triggerLabel}>Presets</span>
          <span className={styles.count}>
            {presets.length}/{MAX_PRESETS}
          </span>
          <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>
            &#9660;
          </span>
        </button>

        {isOpen && (
          <div className={styles.dropdown} role="menu">
            <button
              className={styles.saveButton}
              onClick={() => {
                setIsOpen(false);
                setShowSaveDialog(true);
              }}
              disabled={isFull}
            >
              {isFull ? 'Preset slots full' : 'Save Current'}
            </button>

            {presets.length > 0 && <div className={styles.divider} />}

            {presets.length === 0 && (
              <div className={styles.emptyMessage}>No saved presets yet</div>
            )}

            {presets.map((preset) => (
              <button
                key={preset.id}
                className={styles.presetItem}
                onClick={() => handleLoad(preset.id)}
                role="menuitem"
              >
                <div className={styles.presetInfo}>
                  <div className={styles.presetName}>{preset.name}</div>
                  <div className={styles.presetMeta}>
                    {preset.keyRoot} {preset.mode}
                    {preset.progressionId ? ` \u00B7 ${preset.progressionId}` : ''}
                  </div>
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => handleDelete(e, preset.id)}
                  aria-label={`Delete preset ${preset.name}`}
                  type="button"
                >
                  &times;
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {showSaveDialog && (
        <SavePresetDialog
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
          isFull={isFull}
        />
      )}
    </>
  );
}
