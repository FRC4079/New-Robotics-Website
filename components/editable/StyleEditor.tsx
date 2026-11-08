"use client";
import React, { useState, useRef, useLayoutEffect } from 'react';
import styles from './StyleEditor.module.scss';
import { ImageStyle, TextStyle } from '@/utils/content';

type AnyStyle = TextStyle & ImageStyle;

// The native color input only accepts #rrggbb, so expand #rgb and fall back to black.
function toPickerColor(color: string | undefined): string {
  if (!color) return '#000000';
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(color);
  return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : '#000000';
}

interface StyleEditorProps {
  type: 'text' | 'image';
  currentStyles: AnyStyle;
  onStyleChange: (styles: AnyStyle) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function StyleEditor({
  type,
  currentStyles,
  onStyleChange,
  onClose,
  position
}: StyleEditorProps) {
  const [localStyles, setLocalStyles] = useState(currentStyles);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const editorRef = useRef<HTMLDivElement>(null);

  // Follow the styles passed in when they change (adjusting state while rendering).
  const [seenStyles, setSeenStyles] = useState(currentStyles);
  if (seenStyles !== currentStyles) {
    setSeenStyles(currentStyles);
    setLocalStyles(currentStyles);
  }

  // Adjust position to keep editor within viewport bounds
  // Use useLayoutEffect for immediate measurement before paint
  useLayoutEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const editorRect = editor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // Ensure we have valid starting position
    if (x === 0 && y === 0) {
      // Center it if no valid position was provided
      x = (viewportWidth - editorRect.width) / 2;
      y = (viewportHeight - editorRect.height) / 2;
    }

    // Check if editor goes off the right edge
    if (x + editorRect.width > viewportWidth) {
      x = viewportWidth - editorRect.width - 10; // 10px margin
    }

    // Check if editor goes off the left edge
    if (x < 10) {
      x = 10;
    }

    // Check if editor goes off the bottom edge
    if (y + editorRect.height > viewportHeight) {
      y = viewportHeight - editorRect.height - 10; // 10px margin
    }

    // Check if editor goes off the top edge
    if (y < 10) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [position]);

  const handleChange = (property: string, value: string) => {
    const updated = { ...localStyles, [property]: value };
    setLocalStyles(updated);
    onStyleChange(updated);
  };

  const handleReset = (property: string) => {
    const updated = { ...localStyles };
    delete (updated as Record<string, unknown>)[property];
    setLocalStyles(updated);
    onStyleChange(updated);
  };

  return (
    <div 
      ref={editorRef}
      className={styles.styleEditor}
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px` 
      }}
    >
      <div className={styles.header}>
        <h4>Style Properties</h4>
        <button onClick={onClose} className={styles.closeBtn}>×</button>
      </div>

      <div className={styles.content}>
        {type === 'text' ? (
          <>
            {/* Text Color */}
            <div className={styles.property}>
              <label>Text Color</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={(localStyles as TextStyle).color || ''}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="e.g., #ff0000, red, rgb(255,0,0)"
                />
                <input
                  type="color"
                  value={toPickerColor((localStyles as TextStyle).color)}
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{ width: '40px', marginLeft: '5px' }}
                />
                <button onClick={() => handleReset('color')} title="Reset">↺</button>
              </div>
            </div>

            {/* Font Size */}
            <div className={styles.property}>
              <label>Font Size</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={(localStyles as TextStyle).fontSize || ''}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                  placeholder="e.g., 16px, 1.5rem"
                />
                <button onClick={() => handleReset('fontSize')} title="Reset">↺</button>
              </div>
            </div>

            {/* Font Family */}
            <div className={styles.property}>
              <label>Font Family</label>
              <div className={styles.inputGroup}>
                <select
                  value={(localStyles as TextStyle).fontFamily || ''}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="Titillium Web">Titillium Web</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="sans-serif">Sans-serif</option>
                </select>
                <button onClick={() => handleReset('fontFamily')} title="Reset">↺</button>
              </div>
            </div>

            {/* Font Weight */}
            <div className={styles.property}>
              <label>Font Weight</label>
              <div className={styles.inputGroup}>
                <select
                  value={(localStyles as TextStyle).fontWeight || ''}
                  onChange={(e) => handleChange('fontWeight', e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="900">Black (900)</option>
                </select>
                <button onClick={() => handleReset('fontWeight')} title="Reset">↺</button>
              </div>
            </div>

            {/* Line Height */}
            <div className={styles.property}>
              <label>Line Height</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={(localStyles as TextStyle).lineHeight || ''}
                  onChange={(e) => handleChange('lineHeight', e.target.value)}
                  placeholder="e.g., 1.5, 24px"
                />
                <button onClick={() => handleReset('lineHeight')} title="Reset">↺</button>
              </div>
            </div>

            {/* White Space */}
            <div className={styles.property}>
              <label>White Space</label>
              <div className={styles.inputGroup}>
                <select
                  value={(localStyles as TextStyle).whiteSpace || ''}
                  onChange={(e) => handleChange('whiteSpace', e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="normal">Normal</option>
                  <option value="pre-line">Pre-line</option>
                  <option value="pre-wrap">Pre-wrap</option>
                </select>
                <button onClick={() => handleReset('whiteSpace')} title="Reset">↺</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Width */}
            <div className={styles.property}>
              <label>Width</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={(localStyles as ImageStyle).width || ''}
                  onChange={(e) => handleChange('width', e.target.value)}
                  placeholder="e.g., 300px, 50%, auto"
                />
                <button onClick={() => handleReset('width')} title="Reset">↺</button>
              </div>
            </div>

            {/* Height */}
            <div className={styles.property}>
              <label>Height</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={(localStyles as ImageStyle).height || ''}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="e.g., 200px, auto"
                />
                <button onClick={() => handleReset('height')} title="Reset">↺</button>
              </div>
            </div>

            {/* Border Radius */}
            <div className={styles.property}>
              <label>Border Radius</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={(localStyles as ImageStyle).borderRadius || ''}
                  onChange={(e) => handleChange('borderRadius', e.target.value)}
                  placeholder="e.g., 8px, 50%, 0"
                />
                <button onClick={() => handleReset('borderRadius')} title="Reset">↺</button>
              </div>
            </div>

            {/* Object Fit */}
            <div className={styles.property}>
              <label>Object Fit</label>
              <div className={styles.inputGroup}>
                <select
                  value={(localStyles as ImageStyle).objectFit || ''}
                  onChange={(e) => handleChange('objectFit', e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                  <option value="scale-down">Scale Down</option>
                </select>
                <button onClick={() => handleReset('objectFit')} title="Reset">↺</button>
              </div>
            </div>

            {/* Object Position */}
            <div className={styles.property}>
              <label>Object Position</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Horizontal Position */}
                <div className={styles.inputGroup}>
                  <select
                    value={(() => {
                      const pos = (localStyles as ImageStyle).objectPosition || 'center center';
                      const parts = pos.split(' ');
                      return parts[0] || 'center';
                    })()}
                    onChange={(e) => {
                      const currentPos = (localStyles as ImageStyle).objectPosition || 'center center';
                      const parts = currentPos.split(' ');
                      const vertical = parts[1] || 'center';
                      handleChange('objectPosition', `${e.target.value} ${vertical}`);
                    }}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="0%">0%</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                  </select>
                  <span style={{ padding: '0 8px', color: '#666' }}>Horizontal</span>
                </div>
                
                {/* Vertical Position */}
                <div className={styles.inputGroup}>
                  <select
                    value={(() => {
                      const pos = (localStyles as ImageStyle).objectPosition || 'center center';
                      const parts = pos.split(' ');
                      return parts[1] || 'center';
                    })()}
                    onChange={(e) => {
                      const currentPos = (localStyles as ImageStyle).objectPosition || 'center center';
                      const parts = currentPos.split(' ');
                      const horizontal = parts[0] || 'center';
                      handleChange('objectPosition', `${horizontal} ${e.target.value}`);
                    }}
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                    <option value="0%">0%</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                  </select>
                  <span style={{ padding: '0 8px', color: '#666' }}>Vertical</span>
                </div>
                
                {/* Custom Input */}
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={(localStyles as ImageStyle).objectPosition || ''}
                    onChange={(e) => handleChange('objectPosition', e.target.value)}
                    placeholder="Custom: e.g., 50% 25%"
                  />
                  <button onClick={() => handleReset('objectPosition')} title="Reset">↺</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <small>Changes save automatically</small>
      </div>
    </div>
  );
}
