"use client";
import React, { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './EditToolbar.module.scss';
import Icon from '@/components/icons/Icon';

export default function EditToolbar() {
  const { isEditMode, disableEditMode, pendingChanges, savePendingChanges, clearPendingChanges } = useEditMode();
  const { logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isEditMode) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    const success = await savePendingChanges();
    
    if (success) {
      setSaveStatus('success');
      // Reload the page to ensure all components get the updated content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setSaveStatus('error');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (pendingChanges.size > 0) {
      const confirmed = confirm(`You have ${pendingChanges.size} unsaved change(s). Are you sure you want to discard them?`);
      if (!confirmed) return;
    }
    clearPendingChanges();
    disableEditMode();
    window.location.reload(); // Reload to show original content
  };

  const handleLogout = async () => {
    if (pendingChanges.size > 0) {
      const confirmed = confirm(`You have ${pendingChanges.size} unsaved change(s). Save before logging out?`);
      if (confirmed) {
        await handleSave();
      }
    }
    await logout();
  };

  const changeCount = pendingChanges.size;

  return (
    <div className={styles.toolbar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.badge}>
            <Icon name="pencil" size={14} /> Edit mode
          </div>
          {changeCount > 0 && (
            <div className={styles.changesCount}>
              {changeCount} change{changeCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {saveStatus === 'success' && (
            <div className={styles.saveSuccess}>
              <Icon name="check" size={14} /> Saved
            </div>
          )}
          {saveStatus === 'error' && (
            <div className={styles.saveError}>
              <Icon name="x" size={14} /> Save failed
            </div>
          )}

          <button
            className={`${styles.button} ${styles.cancel}`}
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            className={`${styles.button} ${styles.save}`}
            onClick={handleSave}
            disabled={isSaving || changeCount === 0}
          >
            {isSaving ? 'Saving…' : `Save ${changeCount > 0 ? `(${changeCount})` : ''}`}
          </button>

          <button
            className={`${styles.button} ${styles.logout}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
