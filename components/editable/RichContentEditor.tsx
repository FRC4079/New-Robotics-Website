"use client";
import React, { useState, useRef } from 'react';
import styles from './RichContentEditor.module.scss';
import { useEditMode } from '@/contexts/EditModeContext';
import { MEDIA_ACCEPT, isVideoUrl, uploadMediaFile } from '@/utils/mediaHelpers';

interface ContentBlock {
  type: 'text' | 'image' | 'video';
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

function parseContent(html: string): ContentBlock[] {
    // Split by image and video tags and create blocks
    const parts: ContentBlock[] = [];
    const mediaRegex = /<(img|video)\b[^>]*\bsrc="([^"]+)"[^>]*>(?:<\/video>)?/gi;
    let lastIndex = 0;
    let match;
    let blockId = 0;

    while ((match = mediaRegex.exec(html)) !== null) {
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

      const tag = match[1].toLowerCase();
      parts.push({
        type: tag === 'video' || isVideoUrl(match[2]) ? 'video' : 'image',
        content: match[2],
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

export default function RichContentEditor({
  content,
  path,
  onChange,
  className = '',
}: RichContentEditorProps) {
  const { isEditMode, addPendingChange, notify } = useEditMode();
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseContent(content));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Take new content from the props when it changes (adjusting state while rendering).
  const [seenContent, setSeenContent] = useState(content);
  if (seenContent !== content) {
    setSeenContent(content);
    setBlocks(parseContent(content));
  }



  function serializeContent(blocks: ContentBlock[]): string {
    return blocks.map(block => {
      if (block.type === 'text') {
        return block.content;
      } else {
        const alignment = block.imageStyle?.alignment || 'center';
        const width = block.imageStyle?.width || '100%';
        const margin = alignment === 'center' ? '20px auto' : alignment === 'right' ? '20px 0 20px auto' : '20px auto 20px 0';
        const styleAttr = `width: ${width}; display: block; margin: ${margin};`;
        if (block.type === 'video' || isVideoUrl(block.content)) {
          return `<video src="${block.content}" controls playsInline style="${styleAttr}"></video>`;
        }
        return `<img src="${block.content}" alt="Article media" style="${styleAttr}" />`;
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
        const filePath = await uploadMediaFile(file, 'images', 'articles');
        const blockType = isVideoUrl(filePath) || file.type.startsWith('video/') ? 'video' : 'image';

        const insertIndex = blocks.findIndex(b => b.id === afterBlockId) + 1;
        const newBlocks = [
          ...blocks.slice(0, insertIndex),
          {
            type: blockType as 'image' | 'video',
            content: filePath,
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
        console.error('Error uploading media:', error);
        notify(error instanceof Error ? error.message : 'Could not upload the media.');
      }
    };
  };

  const handleImageStyleChange = (blockId: string, newStyle: ContentBlock['imageStyle']) => {
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
        accept={MEDIA_ACCEPT}
        style={{ display: 'none' }}
      />
      
      {blocks.map((block) => (
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
              {block.type === 'video' || isVideoUrl(block.content) ? (
                <video
                  src={block.content}
                  controls
                  playsInline
                  style={{
                    width: block.imageStyle?.width || '100%',
                    margin: '20px auto',
                    display: 'block',
                  }}
                />
              ) : (
                <img
                  src={block.content}
                  alt="Article content"
                  style={{
                    width: block.imageStyle?.width || '100%',
                    margin: '20px auto',
                    display: 'block',
                  }}
                />
              )}
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
                    alignment: e.target.value as 'left' | 'center' | 'right' | 'full',
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
