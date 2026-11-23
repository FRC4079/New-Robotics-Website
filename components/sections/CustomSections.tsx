"use client";
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useContent } from '@/hooks/useContent';
import { useEditMode } from '@/contexts/EditModeContext';
import EditableText from '@/components/editable/EditableText';
import EditableImage from '@/components/editable/EditableImage';
import EditableIcon from '@/components/icons/EditableIcon';
import Icon from '@/components/icons/Icon';
import type { CustomSection, CustomSectionType } from '@/utils/content';
import { readContentPath } from '@/utils/contentHelpers';
import { createSectionFromTemplate } from '@/utils/sectionTemplates';
import { SectionDesignerModal, SectionTemplatePickerModal } from './SectionDesignerModal';
import styles from './CustomSections.module.scss';

interface CustomSectionsProps {
  /** Key in `pageSections.<pageKey>` for built-in pages. */
  pageKey?: string;
  /** Explicit content path (e.g. "customPages.outreach.sections"). */
  customPath?: string;
  /** Which slot on the page this instance renders. */
  placement?: 'after-hero' | 'before-footer';
  /** Show the "+ Add Section" button in Edit Mode. */
  showAddButton?: boolean;
  /** Label for the add button. */
  addLabel?: string;
  /** Allow switching placement between top/bottom in the Section Designer. */
  allowPlacementToggle?: boolean;
}

export default function CustomSections({
  pageKey,
  customPath,
  placement = 'before-footer',
  showAddButton = true,
  addLabel,
  allowPlacementToggle = true,
}: CustomSectionsProps): React.ReactElement | null {
  const { content } = useContent();
  const { isEditMode: editModeOn, canEdit, pendingChanges, addPendingChange } = useEditMode();

  const sectionsPath = customPath || `pageSections.${pageKey || 'homepage'}`;
  const isEditMode = editModeOn && canEdit(sectionsPath);

  const [showPicker, setShowPicker] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const allSections = useMemo<CustomSection[]>(() => {
    const pending = pendingChanges.get(sectionsPath);
    if (Array.isArray(pending)) return pending as CustomSection[];
    const saved = readContentPath(content, sectionsPath);
    return Array.isArray(saved) ? (saved as CustomSection[]) : [];
  }, [content, pendingChanges, sectionsPath]);

  // Apply any inline pending field edits (e.g., `pageSections.about[0].title`)
  // back into the array before performing structural operations (reorder/delete/modal).
  const materializePendingFields = (source: CustomSection[]): CustomSection[] => {
    const copy = JSON.parse(JSON.stringify(source)) as CustomSection[];
    const prefixBracket = `${sectionsPath}[`;
    const prefixDot = `${sectionsPath}.`;

    pendingChanges.forEach((value, key) => {
      let rest: string | null = null;
      if (key.startsWith(prefixBracket)) {
        rest = key.slice(prefixBracket.length).replace(/^(\d+)\]\./, '$1.');
      } else if (key.startsWith(prefixDot)) {
        rest = key.slice(prefixDot.length);
      }
      if (!rest) return;

      const parts = rest.replace(/\[(\d+)\]/g, '.$1').split('.');
      // Ignore ".style" sub-entries here; they stay under _styles or item style.
      if (parts[parts.length - 1] === 'style') return;

      let cursor: unknown = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i];
        if (cursor && typeof cursor === 'object') {
          cursor = Array.isArray(cursor)
            ? cursor[Number(seg)]
            : (cursor as Record<string, unknown>)[seg];
        } else {
          cursor = null;
        }
      }
      const last = parts[parts.length - 1];
      if (cursor && typeof cursor === 'object') {
        if (Array.isArray(cursor)) cursor[Number(last)] = value;
        else (cursor as Record<string, unknown>)[last] = value;
      }
    });

    return copy;
  };

  const commitSections = (next: CustomSection[]) => {
    addPendingChange(sectionsPath, next);
  };

  const handleAddSection = (type: CustomSectionType) => {
    const current = materializePendingFields(allSections);
    const created = createSectionFromTemplate(type, placement);
    commitSections([...current, created]);
  };

  const handleMove = (index: number, delta: -1 | 1) => {
    const current = materializePendingFields(allSections);
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    const next = current.slice();
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    commitSections(next);
  };

  const handleDuplicate = (index: number) => {
    const current = materializePendingFields(allSections);
    const clone = JSON.parse(JSON.stringify(current[index])) as CustomSection;
    clone.id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    if (clone.items) {
      clone.items = clone.items.map((item, idx) => ({
        ...item,
        id: `${clone.id}-${idx + 1}`,
      }));
    }
    const next = current.slice();
    next.splice(index + 1, 0, clone);
    commitSections(next);
  };

  const handleDelete = (id: string) => {
    const current = materializePendingFields(allSections);
    commitSections(current.filter((sec) => sec.id !== id));
    setConfirmDeleteId(null);
  };

  const handleSaveSectionModal = (updated: CustomSection) => {
    const current = materializePendingFields(allSections);
    commitSections(current.map((sec) => (sec.id === updated.id ? updated : sec)));
  };

  const visibleEntries = allSections
    .map((sec, index) => ({ sec, index }))
    .filter(({ sec }) => (sec.placement || 'before-footer') === placement);

  if (visibleEntries.length === 0 && !isEditMode) {
    return null;
  }

  const editingSection = editingSectionId
    ? allSections.find((s) => s.id === editingSectionId) || null
    : null;

  return (
    <>
      {visibleEntries.map(({ sec, index }) => {
        const basePath = `${sectionsPath}[${index}]`;
        const st = sec.style || {};
        const surfaceClass =
          st.surface === 'raised'
            ? styles.surface_raised
            : st.surface === 'accent-glow'
              ? styles.surface_accent_glow
              : '';
        const padClass =
          st.padding === 'compact'
            ? styles.pad_compact
            : st.padding === 'spacious'
              ? styles.pad_spacious
              : '';
        const widthClass =
          st.maxWidth === 'narrow'
            ? styles.width_narrow
            : st.maxWidth === 'wide'
              ? styles.width_wide
              : '';
        const alignClass = st.textAlign === 'center' ? styles.align_center : '';
        const colsClass =
          st.columns === 2 ? styles.cols_2 : st.columns === 4 ? styles.cols_4 : '';
        const cardSurfaceClass =
          st.cardStyle === 'solid'
            ? ''
            : st.cardStyle === 'minimal'
              ? styles.card_minimal
              : styles.card_glass;

        const customCssVars = {
          ...(st.surface === 'custom' && st.customBackground ? { '--sec-bg': st.customBackground } : {}),
          ...(st.accentColor ? { '--sec-accent': st.accentColor } : {}),
          ...(st.titleColor ? { '--sec-title': st.titleColor } : {}),
          ...(st.textColor ? { '--sec-text': st.textColor } : {}),
        } as React.CSSProperties;

        const sectionAnim =
          st.animation && st.animation !== 'inherit' ? st.animation : undefined;

        return (
          <section
            key={sec.id}
            className={`${styles.section} ${surfaceClass} ${padClass}`}
            style={customCssVars}
            data-el-anim={sectionAnim}
          >
            <div className={`${styles.inner} ${widthClass} ${alignClass}`}>
              {isEditMode && (
                <div className={styles.sectionEditBar}>
                  <span className={styles.sectionBadge}>
                    Custom Section · {sec.type}
                  </span>
                  <div className={styles.sectionControls}>
                    <button
                      type="button"
                      className={styles.controlBtn}
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      title="Move section up"
                    >
                      <Icon name="arrow-up" size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.controlBtn}
                      disabled={index === allSections.length - 1}
                      onClick={() => handleMove(index, 1)}
                      title="Move section down"
                    >
                      <Icon name="arrow-down" size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.controlBtn}
                      onClick={() => setEditingSectionId(sec.id)}
                    >
                      <Icon name="palette" size={14} /> Style &amp; Items
                    </button>
                    <button
                      type="button"
                      className={styles.controlBtn}
                      onClick={() => handleDuplicate(index)}
                      title="Duplicate section"
                    >
                      <Icon name="plus" size={14} /> Duplicate
                    </button>
                    {confirmDeleteId === sec.id ? (
                      <>
                        <button
                          type="button"
                          className={`${styles.controlBtn} ${styles.controlDanger}`}
                          onClick={() => handleDelete(sec.id)}
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          className={styles.controlBtn}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.controlBtn} ${styles.controlDanger}`}
                        onClick={() => setConfirmDeleteId(sec.id)}
                      >
                        <Icon name="trash" size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )}

              {sec.type === 'text-media' && (
                <div className={`${styles.splitGrid} ${st.mediaPosition === 'left' ? styles.splitMediaLeft : ''}`}>
                  <div className={styles.splitText}>
                    {(sec.eyebrow || isEditMode) && (
                      <EditableText
                        value={sec.eyebrow || ''}
                        path={`${basePath}.eyebrow`}
                        as="span"
                        className={styles.eyebrow}
                        placeholder="Eyebrow label..."
                      />
                    )}
                    <EditableText
                      value={sec.title}
                      path={`${basePath}.title`}
                      as="h2"
                      className={styles.title}
                    />
                    <EditableText
                      value={sec.body || ''}
                      path={`${basePath}.body`}
                      as="p"
                      multiline
                      className={styles.body}
                    />
                    {(sec.primaryButton?.label || sec.secondaryButton?.label) && (
                      <div className={styles.actions}>
                        {sec.primaryButton?.label && (
                          <Link href={sec.primaryButton.href || '#'} className={styles.primaryBtn}>
                            <EditableText
                              value={sec.primaryButton.label}
                              path={`${basePath}.primaryButton.label`}
                              as="span"
                            />
                          </Link>
                        )}
                        {sec.secondaryButton?.label && (
                          <Link href={sec.secondaryButton.href || '#'} className={styles.secondaryBtn}>
                            <EditableText
                              value={sec.secondaryButton.label}
                              path={`${basePath}.secondaryButton.label`}
                              as="span"
                            />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <figure className={styles.splitMediaWrap} style={{ margin: 0 }}>
                    <EditableImage
                      src={sec.media || '/images/robotics/robotics_working.jpg'}
                      alt={sec.mediaAlt || sec.title}
                      path={`${basePath}.media`}
                      width={680}
                      height={440}
                    />
                    {(sec.mediaCaption || isEditMode) && (
                      <figcaption className={styles.mediaCaption}>
                        <EditableText
                          value={sec.mediaCaption || ''}
                          path={`${basePath}.mediaCaption`}
                          as="span"
                          placeholder="Optional caption..."
                        />
                      </figcaption>
                    )}
                  </figure>
                </div>
              )}

              {(sec.type === 'cards' || sec.type === 'stats' || sec.type === 'media-showcase') && (
                <>
                  <div className={styles.header}>
                    {(sec.eyebrow || isEditMode) && (
                      <EditableText
                        value={sec.eyebrow || ''}
                        path={`${basePath}.eyebrow`}
                        as="span"
                        className={styles.eyebrow}
                        placeholder="Eyebrow label..."
                      />
                    )}
                    <EditableText
                      value={sec.title}
                      path={`${basePath}.title`}
                      as="h2"
                      className={styles.title}
                    />
                    {(sec.subtitle || isEditMode) && (
                      <EditableText
                        value={sec.subtitle || ''}
                        path={`${basePath}.subtitle`}
                        as="p"
                        multiline
                        className={styles.subtitle}
                        placeholder="Optional subtitle..."
                      />
                    )}
                  </div>

                  <div className={`${styles.grid} ${colsClass}`}>
                    {(sec.items || []).map((item, itemIdx) => {
                      const itemPath = `${basePath}.items[${itemIdx}]`;
                      if (sec.type === 'media-showcase') {
                        return (
                          <article key={item.id} className={styles.mediaCard}>
                            <div className={styles.mediaCardMedia}>
                              <EditableImage
                                src={item.media || '/images/comp/FRC_1.jpg'}
                                alt={item.title}
                                path={`${itemPath}.media`}
                                width={640}
                                height={400}
                              />
                            </div>
                            <div className={styles.mediaCardBody}>
                              <EditableText
                                value={item.title}
                                path={`${itemPath}.title`}
                                as="h3"
                              />
                              <EditableText
                                value={item.description}
                                path={`${itemPath}.description`}
                                as="p"
                                multiline
                              />
                            </div>
                          </article>
                        );
                      }

                      return (
                        <article key={item.id} className={`${styles.card} ${cardSurfaceClass}`}>
                          {(item.icon || isEditMode) && (
                            <div className={styles.cardIcon}>
                              <EditableIcon
                                value={item.icon || 'star'}
                                path={`${itemPath}.icon`}
                                size={24}
                              />
                            </div>
                          )}
                          {sec.type === 'stats' && (
                            <EditableText
                              value={item.value || '0'}
                              path={`${itemPath}.value`}
                              as="div"
                              className={styles.statValue}
                            />
                          )}
                          <EditableText
                            value={item.title}
                            path={`${itemPath}.title`}
                            as="h3"
                          />
                          <EditableText
                            value={item.description}
                            path={`${itemPath}.description`}
                            as="p"
                            multiline
                          />
                          {item.linkHref && item.linkLabel && (
                            <Link href={item.linkHref} className={styles.cardLink}>
                              {item.linkLabel} →
                            </Link>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}

              {(sec.type === 'cta' || sec.type === 'rich-text') && (
                <div className={styles.header}>
                  {(sec.eyebrow || isEditMode) && (
                    <EditableText
                      value={sec.eyebrow || ''}
                      path={`${basePath}.eyebrow`}
                      as="span"
                      className={styles.eyebrow}
                      placeholder="Eyebrow label..."
                    />
                  )}
                  <EditableText
                    value={sec.title}
                    path={`${basePath}.title`}
                    as="h2"
                    className={styles.title}
                  />
                  <EditableText
                    value={sec.body || ''}
                    path={`${basePath}.body`}
                    as="p"
                    multiline
                    className={styles.body}
                  />
                  {sec.type === 'cta' && (sec.primaryButton?.label || sec.secondaryButton?.label) && (
                    <div className={styles.actions}>
                      {sec.primaryButton?.label && (
                        <Link href={sec.primaryButton.href || '#'} className={styles.primaryBtn}>
                          <EditableText
                            value={sec.primaryButton.label}
                            path={`${basePath}.primaryButton.label`}
                            as="span"
                          />
                        </Link>
                      )}
                      {sec.secondaryButton?.label && (
                        <Link href={sec.secondaryButton.href || '#'} className={styles.secondaryBtn}>
                          <EditableText
                            value={sec.secondaryButton.label}
                            path={`${basePath}.secondaryButton.label`}
                            as="span"
                          />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {isEditMode && showAddButton && (
        <div className={styles.addSectionWrap}>
          <button
            type="button"
            className={styles.addSectionBtn}
            onClick={() => setShowPicker(true)}
          >
            <Icon name="plus" size={16} />
            {addLabel || (placement === 'after-hero' ? 'Add Section at Top' : 'Add New Section')}
          </button>
        </div>
      )}

      {showPicker && (
        <SectionTemplatePickerModal
          onPick={handleAddSection}
          onClose={() => setShowPicker(false)}
        />
      )}

      {editingSection && (
        <SectionDesignerModal
          section={editingSection}
          allowPlacement={allowPlacementToggle}
          onSave={handleSaveSectionModal}
          onClose={() => setEditingSectionId(null)}
        />
      )}
    </>
  );
}
