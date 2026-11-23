"use client";
import React, { useState, useRef } from 'react';
import styles from './MediaInserter.module.scss';
import { useEditMode } from '@/contexts/EditModeContext';
import { MEDIA_ACCEPT, uploadMediaFile } from '@/utils/mediaHelpers';

interface MediaInserterProps {
  onInsert: (imageUrl: string, alt: string) => void;
}

export default function MediaInserter({ onInsert }: MediaInserterProps) {
  const { isEditMode, notify } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEditMode) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = await uploadMediaFile(file, 'images');
      onInsert(filePath, file.name);
      setIsOpen(false);
    } catch (error) {
      console.error('Error uploading media:', error);
      notify(error instanceof Error ? error.message : 'Could not upload the media.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.mediaInserter}>
      <button
        className={styles.insertButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Image"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className={styles.insertMenu}>
          <input
            ref={fileInputRef}
            type="file"
            accept={MEDIA_ACCEPT}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className={styles.menuOption}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image / GIF / Video'}
          </button>
        </div>
      )}
    </div>
  );
}
