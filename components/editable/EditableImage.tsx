"use client";
import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { useContent } from '@/hooks/useContent';
import styles from './EditableImage.module.scss';
import Image from 'next/image';
import StyleEditor from './StyleEditor';
import { ImageStyle } from '@/utils/content';
import { getContentImageStyle, getStoredStyle } from '@/utils/contentHelpers';
import Icon from '@/components/icons/Icon';

interface EditableImageProps {
  src: string;
  alt: string;
  path: string; // JSON path like "homepage.hero.backgroundImage"
  onChange?: (src: string) => void;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  useNextImage?: boolean;
  style?: ImageStyle;
  onStyleChange?: (style: ImageStyle) => void;
}

export default function EditableImage({
  src,
  alt,
  path,
  onChange,
  className = '',
  width,
  height,
  fill,
  objectFit = 'cover',
  useNextImage = false,
  style: initialStyle,
  onStyleChange,
}: EditableImageProps) {
  const { isEditMode: editModeOn, canEdit, addPendingChange, pendingChanges, notify } = useEditMode();
  const isEditMode = editModeOn && canEdit(path);
  const { content } = useContent();
  const [localSrc, setLocalSrc] = useState(src);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [styleEditorPosition, setStyleEditorPosition] = useState({ x: 0, y: 0 });
  // Portals only render in edit mode, which never happens on the server.
  const mounted = typeof document !== 'undefined';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const hasChanges = pendingChanges.has(path) || pendingChanges.has(`${path}.style`);

  // The style stored with this image in the content, unless one is passed in.
  const incomingStyle = useMemo<ImageStyle | null>(() => {
    if (initialStyle || !content || !path) return initialStyle ?? null;

    const separate = getStoredStyle(content, path);
    if (separate && Object.keys(separate).length > 0) return separate;

    const keys = path.split('.').flatMap((key) => {
      const arrayMatch = key.match(/^([^[]+)\[(\d+)\]$/);
      return arrayMatch ? [arrayMatch[1], arrayMatch[2]] : key;
    });
    let current: unknown = content;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }
    return getContentImageStyle(current) ?? null;
  }, [content, path, initialStyle]);

  const incomingKey = incomingStyle ? JSON.stringify(incomingStyle) : '';
  const [localStyle, setLocalStyle] = useState<ImageStyle>(incomingStyle ?? {});
  const [seenStyleKey, setSeenStyleKey] = useState(incomingKey);
  if (seenStyleKey !== incomingKey) {
    setSeenStyleKey(incomingKey);
    if (incomingStyle) setLocalStyle(incomingStyle);
  }

  const handleReplaceClick = () => {
    if (isEditMode) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify('That image is over 5 MB. Please choose a smaller one.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to media API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // API returns filePath, not url
      const newSrc = data.filePath;

      // Update local state
      setLocalSrc(newSrc);
      
      // Add to pending changes
      addPendingChange(path, newSrc);
      
      // Call onChange callback
      onChange?.(newSrc);
    } catch (error) {
      console.error('Error uploading image:', error);
      notify(error instanceof Error ? error.message : 'Could not upload the image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStyleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showStyleEditor && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Calculate initial position to the right of the element
      let x = rect.right + 10;
      let y = rect.top;
      
      // If element is too far right, try placing it to the left instead
      if (x + 320 > viewportWidth) { // 320px is approximate editor width
        x = rect.left - 330;
      }
      
      // If still off screen, just use a safe default
      if (x < 0) {
        x = 10;
      }
      
      // Ensure y is within reasonable bounds
      if (y < 0) {
        y = 10;
      }
      
      setStyleEditorPosition({ x, y });
    }
    setShowStyleEditor(!showStyleEditor);
  };

  const handleStyleChange = (newStyle: ImageStyle) => {
    setLocalStyle(newStyle);
    addPendingChange(`${path}.style`, newStyle);
    onStyleChange?.(newStyle);
  };

  const wrapperClassName = `
    ${styles.editableImage}
    ${isEditMode ? styles.editable : ''}
    ${hasChanges ? styles.hasChanges : ''}
  `.trim();

  // Sizes only become inline styles when an editor explicitly set them;
  // otherwise CSS decides, so images stay responsive.
  const imageStyle = {
    width: localStyle.width,
    height: localStyle.height,
    borderRadius: localStyle.borderRadius,
    objectFit: localStyle.objectFit || objectFit,
    objectPosition: localStyle.objectPosition,
  };

  return (
    <>
      <div
        ref={imageRef}
        className={wrapperClassName}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-path={path}
        data-editable="image"
      >
        {useNextImage ? (
          fill ? (
            <Image
              src={localSrc}
              alt={alt}
              fill
              style={{ 
                objectFit: imageStyle.objectFit, 
                objectPosition: imageStyle.objectPosition,
                borderRadius: imageStyle.borderRadius 
              }}
              className={className}
            />
          ) : (
            <Image
              src={localSrc}
              alt={alt}
              width={width || 500}
              height={height || 300}
              style={{ 
                objectFit: imageStyle.objectFit, 
                objectPosition: imageStyle.objectPosition,
                borderRadius: imageStyle.borderRadius 
              }}
              className={className}
            />
          )
        ) : (
          <img
            src={localSrc}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className={className}
            style={imageStyle}
          />
        )}

        {isEditMode && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenInput}
              hidden
            />
            
            {(isHovered || isUploading) && (
              <div className={styles.overlay}>
                <button
                  className={styles.replaceButton}
                  onClick={handleReplaceClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icon name="image" size={16} /> Replace Image
                    </>
                  )}
                </button>
                <button
                  className={styles.styleButton}
                  onClick={handleStyleButtonClick}
                  title="Edit styles"
                >
                  <Icon name="palette" size={16} /> Style
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {mounted && showStyleEditor && createPortal(
        <StyleEditor
          type="image"
          currentStyles={localStyle}
          onStyleChange={handleStyleChange}
          onClose={() => setShowStyleEditor(false)}
          position={styleEditorPosition}
        />,
        document.body
      )}
    </>
  );
}
