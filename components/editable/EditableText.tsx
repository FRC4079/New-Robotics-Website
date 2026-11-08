"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { useContent } from '@/hooks/useContent';
import styles from './EditableText.module.scss';
import StyleEditor from './StyleEditor';
import { TextStyle } from '@/utils/content';
import { getContentStyle, getContentValue, getStoredStyle } from '@/utils/contentHelpers';
import Icon from '@/components/icons/Icon';

interface EditableTextProps {
  value: unknown; // Can be string or {value, style} object
  path: string; // JSON path like "homepage.hero.title"
  onChange?: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  style?: TextStyle;
  onStyleChange?: (style: TextStyle) => void;
}

export default function EditableText({
  value: rawValue,
  path,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit...',
  as: Component = 'div',
  style: initialStyle,
  onStyleChange,
}: EditableTextProps) {
  const { isEditMode: editModeOn, canEdit, addPendingChange, pendingChanges } = useEditMode();
  const isEditMode = editModeOn && canEdit(path);
  const { content } = useContent();
  
  // Normalize the value - handle both string and {value, style} formats
  const value = getContentValue(rawValue);
  
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<number | null>(null);
  const [localValue, setLocalValue] = useState(value);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [styleEditorPosition, setStyleEditorPosition] = useState({ x: 0, y: 0 });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  // Portals only render in edit mode, which never happens on the server.
  const mounted = typeof document !== 'undefined';
  const editRef = useRef<HTMLDivElement>(null);
  const isFirstFocusRef = useRef(false);

  // The style button belongs to whichever text is hovered or being edited, so only one shows at a time.
  const showHover = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    setHovered(true);
  };
  const hideHover = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHovered(false), 250);
  };
  const buttonActive = hovered || isEditing || showStyleEditor;


  // The style that comes from props or the stored content. Local edits made in
  // the style editor stay in place until this changes.
  const incomingStyle = useMemo<TextStyle | null>(() => {
    const embedded = getContentStyle(rawValue);
    if (embedded && Object.keys(embedded).length > 0) return embedded;
    if (initialStyle) return initialStyle;
    if (!content || !path) return null;

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
    const stored = getContentStyle(current);
    return stored && Object.keys(stored).length > 0 ? stored : null;
  }, [rawValue, initialStyle, content, path]);

  const incomingKey = incomingStyle ? JSON.stringify(incomingStyle) : '';
  const [localStyle, setLocalStyle] = useState<TextStyle>(incomingStyle ?? {});
  const [seenStyleKey, setSeenStyleKey] = useState(incomingKey);
  if (seenStyleKey !== incomingKey) {
    setSeenStyleKey(incomingKey);
    if (incomingStyle) setLocalStyle(incomingStyle);
  }

  // Take a new value from the props unless the user is typing.
  const [seenValue, setSeenValue] = useState(value);
  if (!isEditing && value !== seenValue) {
    setSeenValue(value);
    setLocalValue(value);
  }

  const hasChanges = pendingChanges.has(path) || pendingChanges.has(`${path}.style`);

  // Update button position when in edit mode and not editing
  useEffect(() => {
    if (isEditMode && buttonActive && editRef.current) {
      let rafId: number | null = null;
      
      const updateButtonPosition = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
          if (editRef.current) {
            const rect = editRef.current.getBoundingClientRect();
            // Position button to the right and below the element to never overlap
            // Beside the text, but kept on screen and clear of the edit bar at the bottom.
            const maxY = window.innerHeight - 7.5 * 16;
            const aboveY = rect.top - 2.75 * 16 - 4;
            const belowY = rect.bottom + 4;
            const y = belowY <= maxY ? belowY : Math.max(8, Math.min(aboveY, maxY));
            setButtonPosition({
              x: Math.max(8, Math.min(rect.right + 8, window.innerWidth - 2.75 * 16 - 8)),
              y,
            });
          }
        });
      };
      
      updateButtonPosition();
      
      // Use passive listeners and throttle with RAF
      window.addEventListener('scroll', updateButtonPosition, { passive: true, capture: true });
      window.addEventListener('resize', updateButtonPosition, { passive: true });
      
      return () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        window.removeEventListener('scroll', updateButtonPosition, true);
        window.removeEventListener('resize', updateButtonPosition);
      };
    }
  }, [isEditMode, buttonActive]);

  const handleClick = () => {
    if (isEditMode && !isEditing) {
      isFirstFocusRef.current = true;
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const currentText = editRef.current?.textContent || '';
    if (currentText !== value) {
      setLocalValue(currentText);
      addPendingChange(path, currentText);
      onChange?.(currentText);
    }
  };

  const handleInput = () => {
    // Don't update localValue during input to avoid re-renders
    // The actual value is stored in the contentEditable element
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      editRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value); // Revert changes
      editRef.current?.blur();
    }
  };

  const handleStyleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showStyleEditor && editRef.current) {
      const rect = editRef.current.getBoundingClientRect();
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

  const handleStyleChange = (newStyle: TextStyle) => {
    setLocalStyle(newStyle);
    addPendingChange(`${path}.style`, newStyle);
    onStyleChange?.(newStyle);
  };

  // Focus when entering edit mode and position cursor at the end
  useEffect(() => {
    if (isEditing && editRef.current && isFirstFocusRef.current) {
      isFirstFocusRef.current = false;
      editRef.current.focus();
      
      const currentValue = editRef.current.textContent || '';
      if (!currentValue) {
        // Clear placeholder text when entering edit mode
        editRef.current.textContent = '';
      } else {
        // Move cursor to the end of the text instead of selecting all
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editRef.current);
        range.collapse(false); // Collapse to end (true = start, false = end)
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing]);

  const combinedClassName = `
    ${className}
    ${isEditMode ? styles.editable : ''}
    ${isEditing ? styles.editing : ''}
    ${hasChanges ? styles.hasChanges : ''}
  `.trim();

  const inlineStyle = {
    color: localStyle.color,
    fontSize: localStyle.fontSize,
    fontFamily: localStyle.fontFamily,
    fontWeight: localStyle.fontWeight,
    lineHeight: localStyle.lineHeight,
    whiteSpace: localStyle.whiteSpace,
  };

  return (
    <>
      <Component
          ref={editRef as React.Ref<HTMLDivElement & HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>}
          className={combinedClassName}
          contentEditable={isEditMode && isEditing}
          suppressContentEditableWarning
          onClick={handleClick}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-path={path}
          data-editable="text"
          data-placeholder={!localValue && isEditMode ? placeholder : undefined}
          style={inlineStyle}
          onMouseEnter={isEditMode ? showHover : undefined}
          onMouseLeave={isEditMode ? hideHover : undefined}
        >
          {localValue}
        </Component>

      {mounted && isEditMode && buttonActive && createPortal(
        <button
          className={styles.styleButton}
          onClick={handleStyleButtonClick}
          onMouseEnter={showHover}
          onMouseLeave={hideHover}
          onMouseDown={(e) => e.preventDefault()}
          title="Edit styles"
          aria-label="Edit text styles"
          style={{
            position: 'fixed',
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            opacity: buttonPosition.x === 0 && buttonPosition.y === 0 ? 0 : 1,
            transition: 'none',  // Disable all transitions
            transform: 'none'     // No transform by default
          }}
        >
          <Icon name="palette" size={18} />
        </button>,
        document.body
      )}

      {mounted && showStyleEditor && createPortal(
        <StyleEditor
          type="text"
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
