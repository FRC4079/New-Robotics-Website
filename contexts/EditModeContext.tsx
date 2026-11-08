"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface EditModeContextType {
  isEditMode: boolean;
  /** Whether the signed-in account may edit this content path. */
  canEdit: (path: string) => boolean;
  enableEditMode: () => void;
  disableEditMode: () => void;
  toggleEditMode: () => void;
  pendingChanges: Map<string, any>;
  addPendingChange: (path: string, value: any) => void;
  clearPendingChanges: () => void;
  savePendingChanges: () => Promise<boolean>;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, canEditAny, canEdit } = useAuth();
  const [editRequested, setIsEditMode] = useState(false);
  // Editing is only possible while signed in, so logging out also ends edit mode.
  const isEditMode = editRequested && isAuthenticated && canEditAny;
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(new Map());

  const enableEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
    setPendingChanges(new Map()); // Clear changes when exiting edit mode
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      setPendingChanges(new Map()); // Clear changes when toggling off
    }
  }, [isEditMode]);

  const addPendingChange = useCallback((path: string, value: any) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(path, value);
      return newMap;
    });
  }, []);

  const clearPendingChanges = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  const savePendingChanges = useCallback(async () => {
    if (pendingChanges.size === 0) {
      return true;
    }

    try {
      // Convert Map to object for API
      const changes: Record<string, any> = {};
      pendingChanges.forEach((value, key) => {
        changes[key] = value;
      });

      const response = await fetch('/api/content/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      // Clear pending changes after successful save
      setPendingChanges(new Map());
      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      return false;
    }
  }, [pendingChanges]);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        canEdit,
        enableEditMode,
        disableEditMode,
        toggleEditMode,
        pendingChanges,
        addPendingChange,
        clearPendingChanges,
        savePendingChanges,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}
