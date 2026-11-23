"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/icons/Icon';
import MediaAsset from './MediaAsset';
import { MEDIA_ACCEPT, isGifUrl, isVideoUrl, uploadMediaFile } from '@/utils/mediaHelpers';
import styles from './MediaPickerModal.module.scss';

type MediaNode =
  | { type: 'file'; path: string; size: number }
  | { [name: string]: MediaNode };

type FlatMedia = {
  path: string;
  name: string;
  kind: 'image' | 'gif' | 'video';
};

function flattenMedia(node: MediaNode | undefined, out: FlatMedia[] = []): FlatMedia[] {
  if (!node || typeof node !== 'object') return out;
  if ('type' in node && node.type === 'file' && typeof node.path === 'string') {
    const name = node.path.split('/').pop() || node.path;
    const kind: FlatMedia['kind'] = isVideoUrl(node.path)
      ? 'video'
      : isGifUrl(node.path)
        ? 'gif'
        : 'image';
    out.push({ path: node.path, name, kind });
    return out;
  }
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') {
      flattenMedia(value as MediaNode, out);
    }
  }
  return out;
}

interface MediaPickerModalProps {
  title?: string;
  initialUrl?: string;
  category?: string;
  subcategory?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPickerModal({
  title = 'Choose Image, GIF, or Video',
  initialUrl = '',
  category = 'images',
  subcategory = '',
  onSelect,
  onClose,
}: MediaPickerModalProps): React.ReactElement | null {
  const [tab, setTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<FlatMedia[] | null>(null);
  const [filterKind, setFilterKind] = useState<'all' | 'image' | 'gif' | 'video'>('all');
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState(initialUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (tab !== 'library' || library !== null) return;
    let active = true;
    fetch('/api/media', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.success && data.media) {
          setLibrary(flattenMedia(data.media as MediaNode));
        } else {
          setLibrary([]);
          setError(data?.error || 'Could not load media library.');
        }
      })
      .catch(() => {
        if (active) {
          setLibrary([]);
          setError('Could not load media library.');
        }
      });
    return () => {
      active = false;
    };
  }, [tab, library]);

  const filteredLibrary = useMemo(() => {
    if (!library) return [];
    const q = search.trim().toLowerCase();
    return library.filter((item) => {
      if (filterKind !== 'all' && item.kind !== filterKind) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.path.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [library, filterKind, search]);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const uploadedPath = await uploadMediaFile(file, category, subcategory);
      onSelect(uploadedPath);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = urlInput.trim();
    if (!cleaned || !/^(https?:\/\/|\/)/i.test(cleaned)) {
      setError('Enter a valid relative path (starting with /) or URL (https://...).');
      return;
    }
    onSelect(cleaned);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'upload'}
            className={`${styles.tab} ${tab === 'upload' ? styles.tabActive : ''}`}
            onClick={() => setTab('upload')}
          >
            Upload File
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'library'}
            className={`${styles.tab} ${tab === 'library' ? styles.tabActive : ''}`}
            onClick={() => setTab('library')}
          >
            Media Library
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'url'}
            className={`${styles.tab} ${tab === 'url' ? styles.tabActive : ''}`}
            onClick={() => setTab('url')}
          >
            Paste URL
          </button>
        </div>

        <div className={styles.body}>
          {error && <p className={styles.error} role="alert">{error}</p>}

          {tab === 'upload' && (
            <div
              className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={MEDIA_ACCEPT}
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <Icon name="upload" size={32} />
              <strong>{uploading ? 'Uploading…' : 'Drop an image, GIF, or video here'}</strong>
              <p>Supports JPG, PNG, WebP, SVG, GIF (up to 10 MB) and MP4, WebM, MOV, OGV (up to 50 MB)</p>
              <button type="button" className={styles.uploadButton} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Browse files'}
              </button>
            </div>
          )}

          {tab === 'library' && (
            <>
              <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                  {(['all', 'image', 'gif', 'video'] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className={`${styles.tab} ${filterKind === kind ? styles.tabActive : ''}`}
                      onClick={() => setFilterKind(kind)}
                    >
                      {kind === 'all' ? 'All' : kind === 'gif' ? 'GIFs' : `${kind}s`}
                    </button>
                  ))}
                </div>
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder="Search files…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {library === null ? (
                <p className={styles.empty}>Loading media library…</p>
              ) : filteredLibrary.length === 0 ? (
                <p className={styles.empty}>No matching media files found. Upload one in the Upload tab!</p>
              ) : (
                <div className={styles.grid}>
                  {filteredLibrary.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      className={styles.mediaItem}
                      onClick={() => {
                        onSelect(item.path);
                        onClose();
                      }}
                      title={item.path}
                    >
                      <div className={styles.thumb}>
                        <MediaAsset src={item.path} alt={item.name} />
                        {item.kind !== 'image' && (
                          <span className={styles.kindBadge}>{item.kind}</span>
                        )}
                      </div>
                      <span className={styles.itemName}>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'url' && (
            <form className={styles.urlForm} onSubmit={handleUrlSubmit}>
              <label htmlFor="media-url-input">Image, GIF, or Video URL</label>
              <input
                id="media-url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="/uploads/videos/robot-demo.mp4 or https://..."
              />
              <small>Works with site paths (/uploads/..., /images/...) or external image, GIF, and MP4/WebM links.</small>
              {urlInput.trim() && (
                <div className={styles.urlPreview}>
                  <MediaAsset src={urlInput.trim()} alt="Preview" />
                </div>
              )}
              <div>
                <button type="submit" className={styles.uploadButton}>
                  Use This Media
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
