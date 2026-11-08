'use client';

import React, { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';
import { SiteContent, ImageStyle, TextStyle } from '@/utils/content';
import styles from './content.module.scss';

interface EditingField {
  section: string;
  path: string;
  value: any;
  type: 'text' | 'textarea' | 'array' | 'object' | 'number' | 'boolean' | 'image' | 'imageStyle' | 'textStyle';
}

export default function ContentManager() {
  const { content, loading, error, updateContent, addContent, deleteContent } = useContent();
  const [activeSection, setActiveSection] = useState<string>('site');
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemSection, setNewItemSection] = useState('');
  const [editingImageStyle, setEditingImageStyle] = useState<{
    section: string;
    parentPath: string;
    fieldName: string;
    style: ImageStyle;
  } | null>(null);
  const [editingTextStyle, setEditingTextStyle] = useState<{
    section: string;
    parentPath: string;
    fieldName: string;
    style: TextStyle;
  } | null>(null);

  if (loading) {
    return <div className={styles.loading}>Loading content...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!content) {
    return <div className={styles.error}>No content available</div>;
  }

  const sections = [
    { key: 'site', label: 'Site Settings', icon: '⚙️' },
    { key: 'homepage', label: 'Homepage', icon: '🏠' },
    { key: 'navigation', label: 'Navigation', icon: '🧭' },
    { key: 'about', label: 'About Page', icon: 'ℹ️' },
    { key: 'contact', label: 'Contact Page', icon: '📞' },
    { key: 'teams', label: 'Teams', icon: '🤖' },
  ];

  const handleEdit = (section: string, path: string, value: any, type: string) => {
    setEditingField({
      section,
      path,
      value: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      type: type as any
    });
  };

  const handleSave = async () => {
    if (!editingField) return;

    console.log('Saving field:', editingField);

    let processedValue = editingField.value;
    
    // Process value based on type
    if (editingField.type === 'number') {
      processedValue = Number(processedValue);
    } else if (editingField.type === 'boolean') {
      processedValue = processedValue === 'true' || processedValue === true;
    } else if (editingField.type === 'array' || editingField.type === 'object') {
      try {
        processedValue = JSON.parse(processedValue);
      } catch (e) {
        alert('Invalid JSON format');
        return;
      }
    }

    console.log('Processed value:', processedValue);
    console.log('Updating path:', editingField.path);

    const result = await updateContent(editingField.path, processedValue);
    console.log('Update result:', result);
    
    if (result.success) {
      setEditingField(null);
      alert('Content updated successfully!');
    } else {
      alert('Failed to update content: ' + result.error);
    }
  };

  const handleAddNew = async (section: string, type: string) => {
    let newItem;
    
    if (section === 'navigation.items') {
      newItem = {
        name: 'New Page',
        href: '/new-page',
        visible: true,
        order: (content.navigation.items?.length || 0) + 1
      };
    } else if (section === 'homepage.stats.items') {
      newItem = {
        id: String(Date.now()),
        label: 'New Stat',
        value: '0',
        description: 'Description',
        icon: '📊'
      };
    } else if (section.includes('sections')) {
      newItem = {
        id: String(Date.now()),
        title: 'New Section',
        content: 'Content goes here...',
        type: 'text'
      };
    }

    if (newItem) {
      const result = await addContent(section, newItem);
      if (result.success) {
        alert('Item added successfully!');
      } else {
        alert('Failed to add item: ' + result.error);
      }
    }
  };

  const handleDelete = async (section: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const result = await deleteContent(section, itemId);
    if (result.success) {
      alert('Item deleted successfully!');
    } else {
      alert('Failed to delete item: ' + result.error);
    }
  };

  const handleEditImageStyle = (section: string, parentPath: string, fieldName: string) => {
    // Get current style or create default
    const currentContent = getNestedValue(content, parentPath);
    const currentStyle: ImageStyle = currentContent?.[`${fieldName}Style`] || {
      width: 'auto',
      height: 'auto',
      borderRadius: '0px',
      objectFit: 'cover'
    };
    
    setEditingImageStyle({
      section,
      parentPath,
      fieldName,
      style: currentStyle
    });
  };

  const handleEditTextStyle = (section: string, parentPath: string, fieldName: string) => {
    // Get current style or create default
    const currentContent = getNestedValue(content, parentPath);
    const currentStyle: TextStyle = currentContent?.[`${fieldName}Style`] || {
      fontSize: '16px',
      fontFamily: 'Titillium Web',
      fontWeight: '400',
      lineHeight: 'normal',
      whiteSpace: 'normal'
    };
    
    setEditingTextStyle({
      section,
      parentPath,
      fieldName,
      style: currentStyle
    });
  };

  const handleSaveImageStyle = async () => {
    if (!editingImageStyle) return;

    const stylePath = `${editingImageStyle.parentPath}.${editingImageStyle.fieldName}Style`;
    const result = await updateContent(stylePath, editingImageStyle.style);
    
    if (result.success) {
      setEditingImageStyle(null);
      alert('Image style updated successfully!');
    } else {
      alert('Failed to update image style: ' + result.error);
    }
  };

  const handleSaveTextStyle = async () => {
    if (!editingTextStyle) return;

    const stylePath = `${editingTextStyle.parentPath}.${editingTextStyle.fieldName}Style`;
    const result = await updateContent(stylePath, editingTextStyle.style);
    
    if (result.success) {
      setEditingTextStyle(null);
      alert('Text style updated successfully!');
    } else {
      alert('Failed to update text style: ' + result.error);
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderValue = (value: any, section: string, path: string, key: string) => {
    const fullPath = `${section}.${path ? path + '.' : ''}${key}`;
    
    if (typeof value === 'string') {
      const isImage = value.includes('/images/') || value.includes('/logos/') || value.includes('/handmade/');
      const isLongText = value.length > 100;
      
      // Check if this field has associated style properties
      const pathParts = fullPath.split('.');
      const parentPath = pathParts.slice(0, -1).join('.');
      const fieldName = pathParts[pathParts.length - 1];
      
      return (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>{key}:</label>
          <div className={styles.fieldValue}>
            {isImage && (
              <img src={value} alt={key} className={styles.previewImage} />
            )}
            <span className={isLongText ? styles.longText : ''}>{value}</span>
            <div className={styles.fieldActions}>
              <button 
                onClick={() => handleEdit(section, fullPath, value, isLongText ? 'textarea' : 'text')}
                className={styles.editBtn}
                title="Edit content"
              >
                ✏️
              </button>
              {isImage && (
                <button 
                  onClick={() => handleEditImageStyle(section, parentPath, fieldName)}
                  className={styles.styleBtn}
                  title="Edit image style"
                >
                  🎨
                </button>
              )}
              {!isImage && (fieldName === 'description' || fieldName === 'content' || fieldName === 'title' || fieldName === 'subtitle') && (
                <button 
                  onClick={() => handleEditTextStyle(section, parentPath, fieldName)}
                  className={styles.styleBtn}
                  title="Edit text style"
                >
                  📝
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>{key}:</label>
          <div className={styles.fieldValue}>
            <span>{String(value)}</span>
            <button 
              onClick={() => handleEdit(section, fullPath, value, typeof value)}
              className={styles.editBtn}
            >
              ✏️
            </button>
          </div>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div className={styles.arraySection}>
          <div className={styles.arrayHeader}>
            <label className={styles.fieldLabel}>{key} ({value.length} items):</label>
            <button 
              onClick={() => handleAddNew(fullPath, 'array')}
              className={styles.addBtn}
            >
              + Add Item
            </button>
          </div>
          <div className={styles.arrayItems}>
            {value.map((item, index) => (
              <div key={index} className={styles.arrayItem}>
                <div className={styles.arrayItemHeader}>
                  <span>Item {index + 1}</span>
                  {item.id && (
                    <button 
                      onClick={() => handleDelete(fullPath, item.id)}
                      className={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  )}
                  {item.name && (
                    <button 
                      onClick={() => handleDelete(fullPath, item.name)}
                      className={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {typeof item === 'object' && item !== null ? (
                  <div className={styles.objectContent}>
                    {Object.entries(item).map(([subKey, subValue]) => (
                      <div key={subKey}>
                        {renderValue(subValue, section, `${path ? path + '.' : ''}${key}.${index}`, subKey)}
                      </div>
                    ))}
                  </div>
                ) : (
                  renderValue(item, section, `${path ? path + '.' : ''}${key}`, String(index))
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      return (
        <div className={styles.objectSection}>
          <label className={styles.sectionLabel}>{key}:</label>
          <div className={styles.objectContent}>
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey}>
                {renderValue(subValue, section, `${path ? path + '.' : ''}${key}`, subKey)}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const filteredContent = searchTerm 
    ? Object.entries(content).filter(([key, value]) => 
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : Object.entries(content);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Content Manager</h1>
        <p>Edit all website content, text, and settings dynamically</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sectionTabs}>
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`${styles.sectionTab} ${activeSection === section.key ? styles.active : ''}`}
            >
              <span className={styles.sectionIcon}>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.contentArea}>
        {activeSection === 'all' ? (
          <div className={styles.allSections}>
            {filteredContent.map(([sectionKey, sectionValue]) => (
              <div key={sectionKey} className={styles.section}>
                <h2 className={styles.sectionTitle}>{sectionKey}</h2>
                <div className={styles.sectionContent}>
                  {Object.entries(sectionValue as object).map(([key, value]) => (
                    <div key={key}>
                      {renderValue(value, sectionKey, '', key)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {sections.find(s => s.key === activeSection)?.label}
            </h2>
            <div className={styles.sectionContent}>
              {content[activeSection as keyof typeof content] && 
                Object.entries(content[activeSection as keyof typeof content] as object).map(([key, value]) => (
                  <div key={key}>
                    {renderValue(value, activeSection, '', key)}
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingField && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Content</h3>
              <button 
                onClick={() => setEditingField(null)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.editField}>
                <label>Path: {editingField.path}</label>
                {editingField.type === 'textarea' ? (
                  <textarea
                    value={editingField.value}
                    onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                    className={styles.editTextarea}
                    rows={10}
                  />
                ) : editingField.type === 'array' || editingField.type === 'object' ? (
                  <textarea
                    value={editingField.value}
                    onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                    className={styles.editTextarea}
                    rows={15}
                    placeholder="Enter valid JSON..."
                  />
                ) : (
                  <input
                    type={editingField.type === 'number' ? 'number' : 'text'}
                    value={editingField.value}
                    onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                    className={styles.editInput}
                  />
                )}
              </div>
              
              <div className={styles.modalActions}>
                <button onClick={handleSave} className={styles.saveBtn}>
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditingField(null)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Style Modal */}
      {editingImageStyle && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Image Style</h3>
              <button 
                onClick={() => setEditingImageStyle(null)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.styleForm}>
                <div className={styles.formField}>
                  <label>Width:</label>
                  <input
                    type="text"
                    value={editingImageStyle.style.width || 'auto'}
                    onChange={(e) => setEditingImageStyle({
                      ...editingImageStyle,
                      style: { ...editingImageStyle.style, width: e.target.value }
                    })}
                    placeholder="e.g., 300px, 50%, auto"
                    className={styles.editInput}
                  />
                  <small>Examples: 300px, 50%, 100%, auto</small>
                </div>
                
                <div className={styles.formField}>
                  <label>Height:</label>
                  <input
                    type="text"
                    value={editingImageStyle.style.height || 'auto'}
                    onChange={(e) => setEditingImageStyle({
                      ...editingImageStyle,
                      style: { ...editingImageStyle.style, height: e.target.value }
                    })}
                    placeholder="e.g., 300px, 50%, auto"
                    className={styles.editInput}
                  />
                  <small>Examples: 300px, 50%, 100%, auto</small>
                </div>
                
                <div className={styles.formField}>
                  <label>Border Radius (Roundness):</label>
                  <input
                    type="text"
                    value={editingImageStyle.style.borderRadius || '0px'}
                    onChange={(e) => setEditingImageStyle({
                      ...editingImageStyle,
                      style: { ...editingImageStyle.style, borderRadius: e.target.value }
                    })}
                    placeholder="e.g., 8px, 50%, 0px"
                    className={styles.editInput}
                  />
                  <small>Examples: 8px (rounded corners), 50% (circular), 0px (square)</small>
                </div>
                
                <div className={styles.formField}>
                  <label>Object Fit:</label>
                  <select
                    value={editingImageStyle.style.objectFit || 'cover'}
                    onChange={(e) => setEditingImageStyle({
                      ...editingImageStyle,
                      style: { ...editingImageStyle.style, objectFit: e.target.value as any }
                    })}
                    className={styles.editInput}
                  >
                    <option value="cover">Cover (fills area, may crop)</option>
                    <option value="contain">Contain (fits within area)</option>
                    <option value="fill">Fill (stretches to fill)</option>
                    <option value="none">None (original size)</option>
                    <option value="scale-down">Scale Down (smaller of none or contain)</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button onClick={handleSaveImageStyle} className={styles.saveBtn}>
                  Save Style
                </button>
                <button 
                  onClick={() => setEditingImageStyle(null)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Style Modal */}
      {editingTextStyle && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Text Style</h3>
              <button 
                onClick={() => setEditingTextStyle(null)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.styleForm}>
                <div className={styles.formField}>
                  <label>Font Size:</label>
                  <input
                    type="text"
                    value={editingTextStyle.style.fontSize || '16px'}
                    onChange={(e) => setEditingTextStyle({
                      ...editingTextStyle,
                      style: { ...editingTextStyle.style, fontSize: e.target.value }
                    })}
                    placeholder="e.g., 16px, 1.5rem, 1.2em"
                    className={styles.editInput}
                  />
                  <small>Examples: 16px, 1.5rem, 1.2em</small>
                </div>
                
                <div className={styles.formField}>
                  <label>Font Family:</label>
                  <select
                    value={editingTextStyle.style.fontFamily || 'Titillium Web'}
                    onChange={(e) => setEditingTextStyle({
                      ...editingTextStyle,
                      style: { ...editingTextStyle.style, fontFamily: e.target.value as any }
                    })}
                    className={styles.editInput}
                  >
                    <option value="Titillium Web">Titillium Web (Default)</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="sans-serif">Sans Serif</option>
                  </select>
                </div>
                
                <div className={styles.formField}>
                  <label>Font Weight:</label>
                  <select
                    value={editingTextStyle.style.fontWeight || '400'}
                    onChange={(e) => setEditingTextStyle({
                      ...editingTextStyle,
                      style: { ...editingTextStyle.style, fontWeight: e.target.value as any }
                    })}
                    className={styles.editInput}
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
                
                <div className={styles.formField}>
                  <label>Line Height:</label>
                  <input
                    type="text"
                    value={editingTextStyle.style.lineHeight || 'normal'}
                    onChange={(e) => setEditingTextStyle({
                      ...editingTextStyle,
                      style: { ...editingTextStyle.style, lineHeight: e.target.value }
                    })}
                    placeholder="e.g., 1.5, 24px, normal"
                    className={styles.editInput}
                  />
                  <small>Examples: 1.5 (multiplier), 24px (fixed), normal</small>
                </div>
                
                <div className={styles.formField}>
                  <label>Text Formatting:</label>
                  <select
                    value={editingTextStyle.style.whiteSpace || 'normal'}
                    onChange={(e) => setEditingTextStyle({
                      ...editingTextStyle,
                      style: { ...editingTextStyle.style, whiteSpace: e.target.value as any }
                    })}
                    className={styles.editInput}
                  >
                    <option value="normal">Normal (collapses whitespace)</option>
                    <option value="pre-line">Preserve Line Breaks</option>
                    <option value="pre-wrap">Preserve All Formatting</option>
                  </select>
                  <small>Use "Preserve Line Breaks" for paragraph formatting</small>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button onClick={handleSaveTextStyle} className={styles.saveBtn}>
                  Save Style
                </button>
                <button 
                  onClick={() => setEditingTextStyle(null)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}