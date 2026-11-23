"use client";
import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { useContent } from '@/hooks/useContent';
import styles from './EditableImage.module.scss';
import StyleEditor from './StyleEditor';
import { ImageStyle } from '@/utils/content';
import { getContentImageStyle, getStoredStyle } from '@/utils/contentHelpers';
import Icon from '@/components/icons/Icon';
import MediaAsset from '@/components/media/MediaAsset';
import MediaPickerModal from '@/components/media/MediaPickerModal';
import { MEDIA_ACCEPT, uploadMediaFile } from '@/utils/mediaHelpers';

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
  const [seenSrc, setSeenSrc] = useState(src);
  if (src !== seenSrc) {
    setSeenSrc(src);
    if (!pendingChanges.has(path)) {
      setLocalSrc(src);
    }
  }
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
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

  const applyMediaSrc = (newSrc: string) => {
    setLocalSrc(newSrc);
    addPendingChange(path, newSrc);
    onChange?.(newSrc);
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditMode) {
      setShowMediaPicker(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newSrc = await uploadMediaFile(file);
      applyMediaSrc(newSrc);
    } catch (error) {
      console.error('Error uploading media:', error);
      notify(error instanceof Error ? error.message : 'Could not upload the media file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStyleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsFocused(false);
          }
        }}
        onClick={(e) => {
          if (isEditMode) {
            e.preventDefault();
            setIsHovered((prev) => !prev);
          }
        }}
        data-path={path}
        data-editable="image"
        data-el-anim={localStyle.animation && localStyle.animation !== 'inherit' ? localStyle.animation : undefined}
      >
        <MediaAsset
          src={localSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          useNextImage={useNextImage}
          className={className}
          style={
            useNextImage
              ? {
                  objectFit: imageStyle.objectFit,
                  objectPosition: imageStyle.objectPosition,
                  borderRadius: imageStyle.borderRadius,
                }
              : imageStyle
          }
        />

        {isEditMode && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={MEDIA_ACCEPT}
              onChange={handleFileChange}
              className={styles.hiddenInput}
              hidden
            />
            
            {(isHovered || isFocused || isUploading) && (
              <div className={styles.overlay}>
                <button
                  type="button"
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
                      <Icon name="image" size={14} /> Replace
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={styles.styleButton}
                  onClick={handleStyleButtonClick}
                  title="Edit styles"
                >
                  <Icon name="palette" size={14} /> Style
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {mounted && showMediaPicker && (
        <MediaPickerModal
          title="Replace Image, GIF, or Video"
          initialUrl={localSrc}
          onSelect={applyMediaSrc}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

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
