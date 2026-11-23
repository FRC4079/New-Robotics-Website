"use client";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon, { ICON_NAMES } from '@/components/icons/Icon';
import type { CustomSection, CustomSectionItem, CustomSectionStyle, CustomSectionType } from '@/utils/content';
import { SECTION_TEMPLATES } from '@/utils/sectionTemplates';
import styles from './CustomSections.module.scss';

interface SectionTemplatePickerModalProps {
  onPick: (type: CustomSectionType) => void;
  onClose: () => void;
}

export function SectionTemplatePickerModal({
  onPick,
  onClose,
}: SectionTemplatePickerModalProps): React.ReactElement | null {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Add section"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add a New Section</h3>
          <button type="button" className={styles.controlBtn} onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.templateGrid}>
            {SECTION_TEMPLATES.map((tpl) => (
              <button
                key={tpl.type}
                type="button"
                className={styles.templateCard}
                onClick={() => {
                  onPick(tpl.type);
                  onClose();
                }}
              >
                <span className={styles.cardIcon}>
                  <Icon name={tpl.icon} size={22} />
                </span>
                <strong>{tpl.label}</strong>
                <span>{tpl.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface SectionDesignerModalProps {
  section: CustomSection;
  allowPlacement?: boolean;
  onSave: (updated: CustomSection) => void;
  onClose: () => void;
}

export function SectionDesignerModal({
  section,
  allowPlacement = true,
  onSave,
  onClose,
}: SectionDesignerModalProps): React.ReactElement | null {
  const [draft, setDraft] = useState<CustomSection>(() => JSON.parse(JSON.stringify(section)) as CustomSection);

  const updateStyle = <K extends keyof CustomSectionStyle>(key: K, value: CustomSectionStyle[K]) => {
    setDraft((prev) => ({
      ...prev,
      style: {
        ...(prev.style || {}),
        [key]: value,
      },
    }));
  };

  const addItem = () => {
    const nextItem: CustomSectionItem = {
      id: `${draft.id}-item-${Date.now()}`,
      icon: 'star',
      value: draft.type === 'stats' ? '100%' : undefined,
      title: draft.type === 'stats' ? 'New Metric' : 'New Item',
      description: 'Click text on the page to customize this description.',
      media: draft.type === 'media-showcase' ? '/images/robotics/group.jpeg' : undefined,
    };
    setDraft((prev) => ({
      ...prev,
      items: [...(prev.items || []), nextItem],
    }));
  };

  const updateItem = (idx: number, patch: Partial<CustomSectionItem>) => {
    setDraft((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== idx),
    }));
  };

  if (typeof document === 'undefined') return null;

  const st = draft.style || {};
  const hasItems = draft.type === 'cards' || draft.type === 'stats' || draft.type === 'media-showcase';
  const hasButtons = draft.type === 'text-media' || draft.type === 'cta';

  return createPortal(
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Section style and items"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Section Style &amp; Settings</h3>
          <button type="button" className={styles.controlBtn} onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="sec-surface">Background Surface</label>
              <select
                id="sec-surface"
                value={st.surface || 'default'}
                onChange={(e) => updateStyle('surface', e.target.value as CustomSectionStyle['surface'])}
              >
                <option value="default">Standard Dark (--bg)</option>
                <option value="raised">Raised Panel (--bg-raised)</option>
                <option value="accent-glow">Accent Radial Glow</option>
                <option value="custom">Custom Color / Gradient</option>
              </select>
            </div>

            {st.surface === 'custom' && (
              <div className={styles.formField}>
                <label htmlFor="sec-custom-bg">Custom CSS Background</label>
                <input
                  id="sec-custom-bg"
                  type="text"
                  value={st.customBackground || ''}
                  onChange={(e) => updateStyle('customBackground', e.target.value)}
                  placeholder="e.g., #11162a or linear-gradient(...)"
                />
              </div>
            )}

            <div className={styles.formField}>
              <label htmlFor="sec-pad">Vertical Padding</label>
              <select
                id="sec-pad"
                value={st.padding || 'normal'}
                onChange={(e) => updateStyle('padding', e.target.value as CustomSectionStyle['padding'])}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="sec-width">Content Width</label>
              <select
                id="sec-width"
                value={st.maxWidth || 'standard'}
                onChange={(e) => updateStyle('maxWidth', e.target.value as CustomSectionStyle['maxWidth'])}
              >
                <option value="narrow">Narrow (Reading / CTA)</option>
                <option value="standard">Standard (1280px)</option>
                <option value="wide">Wide (1440px)</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="sec-align">Header Alignment</label>
              <select
                id="sec-align"
                value={st.textAlign || 'left'}
                onChange={(e) => updateStyle('textAlign', e.target.value as CustomSectionStyle['textAlign'])}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="sec-anim">Section Animation</label>
              <select
                id="sec-anim"
                value={st.animation || 'inherit'}
                onChange={(e) => updateStyle('animation', e.target.value as CustomSectionStyle['animation'])}
              >
                <option value="inherit">Inherit Site Setting</option>
                <option value="none">None</option>
                <option value="fade">Fade In</option>
                <option value="fade-up">Fade Up</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="zoom-in">Zoom In</option>
              </select>
            </div>

            {allowPlacement && (
              <div className={styles.formField}>
                <label htmlFor="sec-placement">Page Placement</label>
                <select
                  id="sec-placement"
                  value={draft.placement || 'before-footer'}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      placement: e.target.value as 'after-hero' | 'before-footer',
                    }))
                  }
                >
                  <option value="after-hero">Top (Right After Hero)</option>
                  <option value="before-footer">Bottom (Before Footer)</option>
                </select>
              </div>
            )}

            {draft.type === 'text-media' && (
              <div className={styles.formField}>
                <label htmlFor="sec-media-side">Media Placement</label>
                <select
                  id="sec-media-side"
                  value={st.mediaPosition || 'right'}
                  onChange={(e) => updateStyle('mediaPosition', e.target.value as 'left' | 'right')}
                >
                  <option value="right">Media on Right</option>
                  <option value="left">Media on Left</option>
                </select>
              </div>
            )}

            {hasItems && (
              <>
                <div className={styles.formField}>
                  <label htmlFor="sec-cols">Grid Columns</label>
                  <select
                    id="sec-cols"
                    value={String(st.columns || 3)}
                    onChange={(e) => updateStyle('columns', Number(e.target.value) as 2 | 3 | 4)}
                  >
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                  </select>
                </div>

                {draft.type !== 'media-showcase' && (
                  <div className={styles.formField}>
                    <label htmlFor="sec-card-style">Card Surface</label>
                    <select
                      id="sec-card-style"
                      value={st.cardStyle || 'glass'}
                      onChange={(e) => updateStyle('cardStyle', e.target.value as CustomSectionStyle['cardStyle'])}
                    >
                      <option value="glass">Glass Surface</option>
                      <option value="solid">Solid Surface</option>
                      <option value="minimal">Minimal Outlined</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className={styles.formField}>
              <label htmlFor="sec-accent">Accent Color Override</label>
              <input
                id="sec-accent"
                type="text"
                value={st.accentColor || ''}
                onChange={(e) => updateStyle('accentColor', e.target.value)}
                placeholder="Default (#e0242f)"
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="sec-title-color">Heading Color Override</label>
              <input
                id="sec-title-color"
                type="text"
                value={st.titleColor || ''}
                onChange={(e) => updateStyle('titleColor', e.target.value)}
                placeholder="Default (#f3f5fa)"
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="sec-text-color">Body Text Color Override</label>
              <input
                id="sec-text-color"
                type="text"
                value={st.textColor || ''}
                onChange={(e) => updateStyle('textColor', e.target.value)}
                placeholder="Default (#aab1c3)"
              />
            </div>
          </div>

          {hasButtons && (
            <div className={styles.itemRow}>
              <strong>Action Buttons (leave label blank to hide)</strong>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Primary Button Label</label>
                  <input
                    type="text"
                    value={draft.primaryButton?.label || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        primaryButton: { label: e.target.value, href: prev.primaryButton?.href || '/contact' },
                      }))
                    }
                  />
                </div>
                <div className={styles.formField}>
                  <label>Primary Button Link</label>
                  <input
                    type="text"
                    value={draft.primaryButton?.href || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        primaryButton: { label: prev.primaryButton?.label || '', href: e.target.value },
                      }))
                    }
                    placeholder="/contact or https://..."
                  />
                </div>
                <div className={styles.formField}>
                  <label>Secondary Button Label</label>
                  <input
                    type="text"
                    value={draft.secondaryButton?.label || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        secondaryButton: { label: e.target.value, href: prev.secondaryButton?.href || '/about' },
                      }))
                    }
                  />
                </div>
                <div className={styles.formField}>
                  <label>Secondary Button Link</label>
                  <input
                    type="text"
                    value={draft.secondaryButton?.href || ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        secondaryButton: { label: prev.secondaryButton?.label || '', href: e.target.value },
                      }))
                    }
                    placeholder="/about or https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {hasItems && (
            <div className={styles.itemRow}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Items ({(draft.items || []).length})</strong>
                <button type="button" className={styles.controlBtn} onClick={addItem}>
                  <Icon name="plus" size={14} /> Add Item
                </button>
              </div>
              {(draft.items || []).map((item, idx) => (
                <div key={item.id} className={styles.formGrid} style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <div className={styles.formField}>
                    <label>Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(idx, { title: e.target.value })}
                    />
                  </div>
                  {draft.type === 'stats' ? (
                    <div className={styles.formField}>
                      <label>Metric Value</label>
                      <input
                        type="text"
                        value={item.value || ''}
                        onChange={(e) => updateItem(idx, { value: e.target.value })}
                      />
                    </div>
                  ) : draft.type === 'cards' ? (
                    <div className={styles.formField}>
                      <label>Icon</label>
                      <select
                        value={item.icon || 'star'}
                        onChange={(e) => updateItem(idx, { icon: e.target.value })}
                      >
                        {ICON_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div className={styles.formField}>
                    <label>Link Label (optional)</label>
                    <input
                      type="text"
                      value={item.linkLabel || ''}
                      onChange={(e) => updateItem(idx, { linkLabel: e.target.value })}
                      placeholder="Learn more"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Link URL (optional)</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <input
                        type="text"
                        style={{ flex: 1 }}
                        value={item.linkHref || ''}
                        onChange={(e) => updateItem(idx, { linkHref: e.target.value })}
                        placeholder="/frc"
                      />
                      <button
                        type="button"
                        className={`${styles.controlBtn} ${styles.controlDanger}`}
                        onClick={() => removeItem(idx)}
                        title="Remove item"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.controlBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Apply Section Settings
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
