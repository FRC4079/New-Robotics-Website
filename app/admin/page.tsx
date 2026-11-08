'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './media.module.scss';
import Icon from '@/components/icons/Icon';

interface MediaFile {
  type: 'file';
  path: string;
  size?: any;
}

interface MediaStructure {
  [key: string]: MediaFile | MediaStructure;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

interface ReplaceModalState {
  isOpen: boolean;
  filePath: string;
  fileName: string;
}

export default function MediaManager() {
  const router = useRouter();
  const [mediaStructure, setMediaStructure] = useState<MediaStructure>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('images');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [replaceModal, setReplaceModal] = useState<ReplaceModalState>({
    isOpen: false,
    filePath: '',
    fileName: ''
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect anyway
      router.push('/');
    }
  };

  // Fetch media files
  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch('/api/media');
      const data = await response.json();
      if (data.success) {
        setMediaStructure(data.media);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Add to upload progress
      setUploadProgress(prev => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory);
      formData.append('subcategory', selectedSubcategory);

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // Update progress to success
          setUploadProgress(prev => 
            prev.map(item => 
              item.fileName === file.name 
                ? { ...item, progress: 100, status: 'success' }
                : item
            )
          );
          
          // Refresh media structure
          await fetchMedia();
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => 
          prev.map(item => 
            item.fileName === file.name 
              ? { ...item, status: 'error' }
              : item
          )
        );
      }
    }

    // Clear progress after 3 seconds
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  };

  // Handle file delete
  const handleDelete = async (filePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/media?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await fetchMedia();
      } else {
        alert('Failed to delete file: ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  // Handle file replace
  const handleReplace = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('existingPath', replaceModal.filePath.substring(1)); // Remove leading slash

    try {
      const response = await fetch('/api/media/replace', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        await fetchMedia();
        setReplaceModal({ isOpen: false, filePath: '', fileName: '' });
        alert('File replaced successfully!');
      } else {
        alert('Failed to replace file: ' + result.error);
      }
    } catch (error) {
      console.error('Replace error:', error);
      alert('Failed to replace file');
    }
  };

  // Open replace modal
  const openReplaceModal = (filePath: string, fileName: string) => {
    setReplaceModal({
      isOpen: true,
      filePath,
      fileName
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Render media files recursively
  const renderMediaFiles = (structure: MediaStructure, basePath = '') => {
    return Object.entries(structure).map(([key, value]) => {
      if (value.type === 'file') {
        const file = value as MediaFile;
        return (
          <div key={file.path} className={styles.mediaItem}>
            <div className={styles.imageContainer}>
              <img 
                src={file.path} 
                alt={key} 
                className={styles.thumbnail}
                onError={(e) => {
                  e.currentTarget.src = '/images/PlaceholderBanner.jpg';
                }}
              />
              <div className={styles.overlay}>
                <button 
                  onClick={() => navigator.clipboard.writeText(file.path)}
                  className={styles.copyBtn}
                  title="Copy path"
                >
                  <Icon name="clipboard" size={16} />
                </button>
                <button 
                  onClick={() => openReplaceModal(file.path, key)}
                  className={styles.replaceBtn}
                  title="Replace file"
                >
                  <Icon name="refresh" size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(file.path.substring(1))}
                  className={styles.deleteBtn}
                  title="Delete file"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
            <div className={styles.fileName}>{key}</div>
            <div className={styles.filePath}>{file.path}</div>
          </div>
        );
      } else {
        return (
          <div key={key} className={styles.folder}>
            <h4 className={styles.folderTitle}>{key}</h4>
            <div className={styles.folderContent}>
              {renderMediaFiles(value as MediaStructure, `${basePath}/${key}`)}
            </div>
          </div>
        );
      }
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading media files...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Media Manager</h1>
            <p>Upload and manage images and media files for your robotics website</p>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.categorySelector}>
          <label>
            Category:
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="images">Images</option>
              <option value="logos">Logos</option>
              <option value="handmade">Handmade</option>
            </select>
          </label>
          
          <label>
            Subcategory:
            <input 
              type="text"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              placeholder="e.g., comp, robotics, sponsors"
            />
          </label>
        </div>

        <div 
          className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className={styles.fileInput}
            id="fileInput"
          />
          <label htmlFor="fileInput" className={styles.uploadLabel}>
            <div className={styles.uploadIcon}><Icon name="upload" size={32} /></div>
            <div>Drag & drop images here or click to select</div>
            <div className={styles.uploadNote}>
              Uploading to: /{selectedCategory}{selectedSubcategory && `/${selectedSubcategory}`}
            </div>
          </label>
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <div className={styles.uploadProgress}>
          <h3>Upload Progress</h3>
          {uploadProgress.map((item, index) => (
            <div key={index} className={`${styles.progressItem} ${styles[item.status]}`}>
              <span>{item.fileName}</span>
              <span className={styles.status}>
                {item.status === 'uploading' && 'Uploading…'}
                {item.status === 'success' && <><Icon name="check-circle" size={16} /> Uploaded</>}
                {item.status === 'error' && <><Icon name="x-circle" size={16} /> Failed</>}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.mediaGrid}>
        {Object.keys(mediaStructure).length === 0 ? (
          <div className={styles.empty}>No media files found</div>
        ) : (
          renderMediaFiles(mediaStructure)
        )}
      </div>

      {/* Replace Modal */}
      {replaceModal.isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Replace Image</h3>
              <button 
                onClick={() => setReplaceModal({ isOpen: false, filePath: '', fileName: '' })}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.currentImage}>
                <h4>Current Image:</h4>
                <img 
                  src={replaceModal.filePath} 
                  alt={replaceModal.fileName}
                  className={styles.previewImage}
                />
                <p><strong>File:</strong> {replaceModal.fileName}</p>
                <p><strong>Path:</strong> {replaceModal.filePath}</p>
              </div>
              
              <div className={styles.replaceUpload}>
                <h4>Select New Image:</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (confirm(`Replace ${replaceModal.fileName} with ${file.name}?`)) {
                        handleReplace(file);
                      }
                    }
                  }}
                  className={styles.replaceInput}
                />
                <p className={styles.replaceNote}>
                  The new image will replace the existing file. A backup will be created automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}