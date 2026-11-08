"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { useContent } from '@/hooks/useContent';
import styles from './EditableText.module.scss';
import StyleEditor from './StyleEditor';
import { TextStyle } from '@/utils/content';
import { getContentStyle, getContentValue } from '@/utils/contentHelpers';
import Icon from '@/components/icons/Icon';

interface EditableTextProps {
  value: string | any; // Can be string or {value, style} object
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
  const [localValue, setLocalValue] = useState(value);
  const [hasChanges, setHasChanges] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [styleEditorPosition, setStyleEditorPosition] = useState({ x: 0, y: 0 });
  const [localStyle, setLocalStyle] = useState<TextStyle>(initialStyle || {});
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const prevStyleRef = useRef<string>('');
  const prevValueRef = useRef<string>(value);
  const isFirstFocusRef = useRef(false);

  // Load style from rawValue or content JSON
  useEffect(() => {
    // First check if style is embedded in the rawValue prop
    const embeddedStyle = getContentStyle(rawValue);
    if (embeddedStyle && Object.keys(embeddedStyle).length > 0) {
      const styleString = JSON.stringify(embeddedStyle);
      if (styleString !== prevStyleRef.current) {
        setLocalStyle(embeddedStyle);
        prevStyleRef.current = styleString;
      }
      return;
    }
    
    // Fallback: Load style from content JSON using the path
    if (!initialStyle && content && path) {
      const keys = path.split('.').flatMap(key => {
        const arrayMatch = key.match(/^([^\[]+)\[(\d+)\]$/);
        if (arrayMatch) {
          return [arrayMatch[1], arrayMatch[2]];
        }
        return key;
      });
      
      let current: any = content;
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          current = null;
          break;
        }
      }
      
      // Extract style from the value
      const style = getContentStyle(current);
      if (style && Object.keys(style).length > 0) {
        const styleString = JSON.stringify(style);
        if (styleString !== prevStyleRef.current) {
          setLocalStyle(style);
          prevStyleRef.current = styleString;
        }
      }
    }
  }, [content, path, initialStyle, rawValue]);

  // Track if component is mounted for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update local value when prop changes
  useEffect(() => {
    // Always update if the value from props changes and we're not currently editing
    if (!isEditing && value !== prevValueRef.current) {
      setLocalValue(value);
      prevValueRef.current = value;
    }
  }, [value, isEditing]);

  // Update local style when prop changes (use JSON comparison to avoid infinite loops)
  useEffect(() => {
    if (initialStyle) {
      const styleString = JSON.stringify(initialStyle);
      if (styleString !== prevStyleRef.current) {
        setLocalStyle(initialStyle);
        prevStyleRef.current = styleString;
      }
    }
  }, [initialStyle]);

  // Check if this field has pending changes
  useEffect(() => {
    setHasChanges(pendingChanges.has(path) || pendingChanges.has(`${path}.style`));
  }, [pendingChanges, path]);

  // Update button position when in edit mode and not editing
  useEffect(() => {
    if (isEditMode && !isEditing && editRef.current) {
      let rafId: number | null = null;
      
      const updateButtonPosition = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
          if (editRef.current) {
            const rect = editRef.current.getBoundingClientRect();
            // Position button to the right and below the element to never overlap
            setButtonPosition({
              x: rect.right + 8,  // 8px spacing to the right
              y: rect.bottom + 4  // 4px below the element (changed from top)
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
  }, [isEditMode, isEditing]);

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

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
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
      const viewportHeight = window.innerHeight;
      
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
      <div className={styles.editableTextWrapper} style={{ position: 'relative', display: 'inline-block' }}>
        <Component
          ref={editRef as any}
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
        >
          {localValue}
        </Component>
      </div>

      {mounted && isEditMode && !isEditing && createPortal(
        <button
          className={styles.styleButton}
          onClick={handleStyleButtonClick}
          title="Edit styles"
          style={{
            position: 'fixed',
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            opacity: buttonPosition.x === 0 && buttonPosition.y === 0 ? 0 : 1,
            transition: 'none',  // Disable all transitions
            transform: 'none'     // No transform by default
          }}
        >
          <Icon name="palette" size={14} />
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
