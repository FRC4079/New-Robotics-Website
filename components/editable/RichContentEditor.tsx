"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './RichContentEditor.module.scss';
import { useEditMode } from '@/contexts/EditModeContext';

interface ContentBlock {
  type: 'text' | 'image';
  content: string;
  id: string;
  imageStyle?: {
    width?: string;
    alignment?: 'left' | 'center' | 'right' | 'full';
  };
}

interface RichContentEditorProps {
  content: string;
  path: string;
  onChange?: (content: string) => void;
  className?: string;
}

export default function RichContentEditor({
  content,
  path,
  onChange,
  className = '',
}: RichContentEditorProps) {
  const { isEditMode, addPendingChange } = useEditMode();
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseContent(content));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update blocks when content prop changes
  useEffect(() => {
    setBlocks(parseContent(content));
  }, [content]);

  function parseContent(html: string): ContentBlock[] {
    // Simple parser - split by image tags and create blocks
    const parts: ContentBlock[] = [];
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    let lastIndex = 0;
    let match;
    let blockId = 0;

    while ((match = imgRegex.exec(html)) !== null) {
      // Add text before image
      if (match.index > lastIndex) {
        const textContent = html.substring(lastIndex, match.index);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: textContent,
            id: `block-${blockId++}`,
          });
        }
      }

      // Add image
      parts.push({
        type: 'image',
        content: match[1],
        id: `block-${blockId++}`,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < html.length) {
      const textContent = html.substring(lastIndex);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent,
          id: `block-${blockId++}`,
        });
      }
    }

    // If no blocks, return a single text block
    return parts.length > 0 ? parts : [{
      type: 'text',
      content: html,
      id: 'block-0',
    }];
  }

  function serializeContent(blocks: ContentBlock[]): string {
    return blocks.map(block => {
      if (block.type === 'text') {
        return block.content;
      } else {
        const alignment = block.imageStyle?.alignment || 'center';
        const width = block.imageStyle?.width || '100%';
        return `<img src="${block.content}" alt="Article image" style="width: ${width}; display: block; margin: ${alignment === 'center' ? '20px auto' : alignment === 'right' ? '20px 0 20px auto' : '20px auto 20px 0'};" />`;
      }
    }).join('');
  }

  const handleTextChange = (blockId: string, newContent: string) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    );
    setBlocks(newBlocks);
    const serialized = serializeContent(newBlocks);
    onChange?.(serialized);
    addPendingChange(path, serialized);
  };

  const handleInsertImage = async (afterBlockId: string) => {
    fileInputRef.current?.click();
    fileInputRef.current!.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'images');
        formData.append('subcategory', 'articles');

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        
        // Insert new image block after the specified block
        const insertIndex = blocks.findIndex(b => b.id === afterBlockId) + 1;
        const newBlocks = [
          ...blocks.slice(0, insertIndex),
          {
            type: 'image' as const,
            content: data.filePath,
            id: `block-${Date.now()}`,
            imageStyle: { width: '100%', alignment: 'center' as const },
          },
          ...blocks.slice(insertIndex),
        ];
        
        setBlocks(newBlocks);
        const serialized = serializeContent(newBlocks);
        onChange?.(serialized);
        addPendingChange(path, serialized);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      }
    };
  };

  const handleImageStyleChange = (blockId: string, newStyle: any) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, imageStyle: newStyle } : block
    );
    setBlocks(newBlocks);
    const serialized = serializeContent(newBlocks);
    onChange?.(serialized);
    addPendingChange(path, serialized);
  };

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter(b => b.id !== blockId);
    setBlocks(newBlocks);
    const serialized = serializeContent(newBlocks);
    onChange?.(serialized);
    addPendingChange(path, serialized);
  };

  if (!isEditMode) {
    // View mode - just render the HTML
    return (
      <div
        className={`${styles.richContent} ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Edit mode - render editable blocks
  return (
    <div className={`${styles.richContentEditor} ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {blocks.map((block, index) => (
        <div key={block.id} className={styles.block}>
          {block.type === 'text' ? (
            <div className={styles.textBlock}>
              <textarea
                value={block.content}
                onChange={(e) => handleTextChange(block.id, e.target.value)}
                className={styles.textArea}
                placeholder="Enter text..."
              />
              <button
                className={styles.insertImageButton}
                onClick={() => handleInsertImage(block.id)}
                title="Insert image after this block"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className={styles.imageBlock}>
              <img
                src={block.content}
                alt="Article content"
                style={{
                  width: block.imageStyle?.width || '100%',
                  margin: '20px auto',
                  display: 'block',
                }}
              />
              <div className={styles.imageControls}>
                <select
                  value={block.imageStyle?.width || '100%'}
                  onChange={(e) => handleImageStyleChange(block.id, {
                    ...block.imageStyle,
                    width: e.target.value,
                  })}
                  className={styles.widthSelector}
                >
                  <option value="100%">Full Width</option>
                  <option value="75%">75% Width</option>
                  <option value="50%">Half Width</option>
                  <option value="33%">Third Width</option>
                </select>
                <select
                  value={block.imageStyle?.alignment || 'center'}
                  onChange={(e) => handleImageStyleChange(block.id, {
                    ...block.imageStyle,
                    alignment: e.target.value as any,
                  })}
                  className={styles.alignmentSelector}
                >
                  <option value="left">Align Left</option>
                  <option value="center">Align Center</option>
                  <option value="right">Align Right</option>
                </select>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteBlock(block.id)}
                  title="Delete image"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
