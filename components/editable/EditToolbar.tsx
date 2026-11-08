"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useEditMode } from '@/contexts/EditModeContext';
import Icon from '@/components/icons/Icon';
import styles from './EditToolbar.module.scss';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** "news.articles[2].title" becomes "News › Articles 3 › Title". */
function describePath(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, (_, n: string) => `.${Number(n) + 1}`)
    .split('.')
    .filter(Boolean)
    .map((part) =>
      /^\d+$/.test(part)
        ? part
        : part.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
    )
    .reduce<string[]>((parts, part) => {
      // Fold "Articles" + "3" into "Articles 3".
      if (/^\d+$/.test(part) && parts.length > 0) parts[parts.length - 1] += ` ${part}`;
      else parts.push(part);
      return parts;
    }, [])
    .join(' › ');
}

export default function EditToolbar() {
  const { isEditMode, disableEditMode, pendingChanges, savePendingChanges, clearPendingChanges, notice } = useEditMode();
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [listOpen, setListOpen] = useState(false);
  const [confirming, setConfirming] = useState<'discard' | 'done' | null>(null);

  const changeCount = pendingChanges.size;
  const changeCountRef = useRef(changeCount);
  useEffect(() => {
    changeCountRef.current = changeCount;
  }, [changeCount]);

  const save = useCallback(async () => {
    if (changeCountRef.current === 0) return;
    setSaveState('saving');
    setConfirming(null);
    const ok = await savePendingChanges();
    if (ok) {
      setSaveState('saved');
      // Reload so every component starts from the content that was just stored.
      window.setTimeout(() => window.location.reload(), 500);
    } else {
      setSaveState('error');
    }
  }, [savePendingChanges]);

  const discard = () => {
    clearPendingChanges();
    window.location.reload();
  };

  const finish = () => {
    clearPendingChanges();
    disableEditMode();
    setConfirming(null);
    setListOpen(false);
  };

  // Ctrl/Cmd+S saves instead of opening the browser's save dialog.
  useEffect(() => {
    if (!isEditMode) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditMode, save]);

  // Warn before the tab is closed or reloaded with unsaved edits.
  useEffect(() => {
    if (!isEditMode || changeCount === 0 || saveState === 'saved') return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isEditMode, changeCount, saveState]);

  // Keep the bar from covering the bottom of the page.
  useEffect(() => {
    if (!isEditMode) return;
    document.body.style.paddingBottom = 'calc(5.5rem + env(safe-area-inset-bottom))';
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [isEditMode]);

  if (!isEditMode) return null;

  const changes = Array.from(pendingChanges.keys());

  return (
    <div className={styles.toolbar} role="region" aria-label="Page editor">
      {listOpen && changeCount > 0 && (
        <ul className={styles.changeList} aria-label="Unsaved changes">
          {changes.map((path) => (
            <li key={path}>{describePath(path)}</li>
          ))}
        </ul>
      )}

      <div className={styles.bar}>
        <div className={styles.left}>
          <span className={styles.badge}>
            <Icon name="pencil" size={14} /> Editing
          </span>
          <button
            type="button"
            className={styles.changes}
            onClick={() => setListOpen((open) => !open)}
            aria-expanded={listOpen}
            disabled={changeCount === 0}
          >
            {changeCount === 0 ? 'No changes yet' : `${changeCount} unsaved change${changeCount === 1 ? '' : 's'}`}
          </button>
          <span className={styles.status} role="status" aria-live="polite">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'Saved'}
            {saveState === 'error' && 'Could not save. Check your connection and try again.'}
            {saveState === 'idle' && notice}
          </span>
        </div>

        <div className={styles.actions}>
          {confirming === 'discard' && (
            <>
              <button type="button" className={`${styles.button} ${styles.danger}`} onClick={discard}>
                Discard {changeCount}
              </button>
              <button type="button" className={styles.button} onClick={() => setConfirming(null)}>
                Keep editing
              </button>
            </>
          )}
          {confirming === 'done' && (
            <>
              <button type="button" className={`${styles.button} ${styles.danger}`} onClick={finish}>
                Leave without saving
              </button>
              <button type="button" className={styles.button} onClick={() => setConfirming(null)}>
                Keep editing
              </button>
            </>
          )}
          {confirming === null && (
            <>
              <Link href="/admin" className={styles.button}>
                Dashboard
              </Link>
              {changeCount > 0 && (
                <button type="button" className={styles.button} onClick={() => setConfirming('discard')}>
                  Discard
                </button>
              )}
              <button
                type="button"
                className={styles.button}
                onClick={() => (changeCount > 0 ? setConfirming('done') : finish())}
              >
                Done
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.primary}`}
                onClick={() => void save()}
                disabled={saveState === 'saving' || changeCount === 0}
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
