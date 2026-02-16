import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/app-store.js';
import styles from './SavePresetDialog.module.css';

interface SavePresetDialogProps {
  onSave: (name: string) => void;
  onCancel: () => void;
  isFull: boolean;
}

export function SavePresetDialog({
  onSave,
  onCancel,
  isFull,
}: SavePresetDialogProps): React.JSX.Element {
  const keyRoot = useAppStore((s) => s.keyRoot);
  const mode = useAppStore((s) => s.mode);
  const selectedProgressionId = useAppStore((s) => s.selectedProgressionId);

  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !isFull;

  // Focus input on mount, restore focus on unmount
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSave) {
      onSave(trimmedName);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Save preset"
    >
      <form className={styles.panel} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Save Preset</h2>

        <div className={styles.context}>
          {keyRoot} {mode}
          {selectedProgressionId ? ` \u00B7 ${selectedProgressionId}` : ''}
        </div>

        <label className={styles.label} htmlFor="preset-name">
          Preset Name
        </label>
        <input
          id="preset-name"
          ref={inputRef}
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My preset..."
          maxLength={40}
          autoComplete="off"
        />

        {isFull && (
          <div className={styles.errorMessage}>
            Maximum presets reached. Delete one to save a new preset.
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={!canSave}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
