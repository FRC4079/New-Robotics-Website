'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/hooks/useContent';
import { useEditMode } from '@/contexts/EditModeContext';
import Icon from '@/components/icons/Icon';
import type { CustomPage, CustomSection } from '@/utils/content';
import { createSectionFromTemplate } from '@/utils/sectionTemplates';
import ui from '../ui.module.scss';
import styles from './pages.module.scss';

type Status = { kind: 'ok' | 'error'; text: string } | null;
type TabKey = 'custom' | 'builtin' | 'navigation';
type StarterTemplate = 'blank' | 'program' | 'event' | 'resources';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'uploads',
  'about',
  'contact',
  'frc',
  'ftc',
  'vex',
  'news',
  'sponsors',
  'team',
  '_next',
]);

const BUILTIN_PAGES = [
  { key: 'homepage', name: 'Homepage', href: '/', description: 'Hero, about brief, impact stats, goals, team cards' },
  { key: 'about', name: 'About', href: '/about', description: 'Mission, programs, impact cards, join CTA' },
  { key: 'news', name: 'News & Media', href: '/news', description: 'Articles, newsletters, categories' },
  { key: 'sponsors', name: 'Sponsors', href: '/sponsors', description: 'Sponsor tiers, benefits, sponsorship form' },
  { key: 'frc', name: 'FRC Team 4079', href: '/frc', description: 'FRC overview, robot gallery, subteams, schedule' },
  { key: 'ftc', name: 'FTC Teams', href: '/ftc', description: 'FTC overview, robot gallery, subteams, schedule' },
  { key: 'vex', name: 'VEX Robotics', href: '/vex', description: 'VEX overview, robot gallery, subteams, schedule' },
  { key: 'team', name: 'Team Members', href: '/team', description: 'Roster and leadership showcase' },
  { key: 'contact', name: 'Contact', href: '/contact', description: 'Contact methods and inquiry form' },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildStarterSections(template: StarterTemplate): CustomSection[] {
  if (template === 'blank') return [];
  if (template === 'program') {
    return [
      createSectionFromTemplate('text-media'),
      createSectionFromTemplate('cards'),
      createSectionFromTemplate('cta'),
    ];
  }
  if (template === 'event') {
    return [
      createSectionFromTemplate('stats'),
      createSectionFromTemplate('media-showcase'),
      createSectionFromTemplate('cta'),
    ];
  }
  return [
    createSectionFromTemplate('rich-text'),
    createSectionFromTemplate('cards'),
  ];
}

type PageDraft = {
  existingSlug: string | null;
  title: string;
  slug: string;
  slugEdited: boolean;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStyle: 'banner' | 'minimal';
  starter: StarterTemplate;
  accentColor: string;
  backgroundTint: string;
  published: boolean;
  addToNav: boolean;
  addToFooter: boolean;
};

const EMPTY_DRAFT: PageDraft = {
  existingSlug: null,
  title: '',
  slug: '',
  slugEdited: false,
  description: '',
  heroTitle: '',
  heroSubtitle: '',
  heroStyle: 'banner',
  starter: 'program',
  accentColor: '',
  backgroundTint: '',
  published: true,
  addToNav: true,
  addToFooter: false,
};

export default function PagesAdmin() {
  const router = useRouter();
  const { user, isLoading, canEdit } = useAuth();
  const { content, updateContent } = useContent();
  const { enableEditMode } = useEditMode();

  const [tab, setTab] = useState<TabKey>('custom');
  const [draft, setDraft] = useState<PageDraft | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const [navItems, setNavItems] = useState(() => content?.navigation?.items || []);
  const [footerLinks, setFooterLinks] = useState(() => content?.footer?.quickLinks || []);
  const [seenNav, setSeenNav] = useState(content?.navigation?.items);
  const [seenFooter, setSeenFooter] = useState(content?.footer?.quickLinks);

  if (seenNav !== content?.navigation?.items) {
    setSeenNav(content?.navigation?.items);
    setNavItems(content?.navigation?.items || []);
  }
  if (seenFooter !== content?.footer?.quickLinks) {
    setSeenFooter(content?.footer?.quickLinks);
    setFooterLinks(content?.footer?.quickLinks || []);
  }

  const canManagePages = canEdit('customPages');
  const canManageNav = canEdit('navigation');
  const allowed = canManagePages || canManageNav;

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace('/admin');
    }
  }, [isLoading, allowed, router]);

  if (!allowed || !user) return null;

  const customPages = content?.customPages || {};
  const pageList = Object.entries(customPages).map(([slug, page]) => ({
    ...page,
    slug,
  }));

  const openLiveEditor = (href: string) => {
    enableEditMode();
    router.push(href);
  };

  const openEditPage = (page: CustomPage) => {
    setDraft({
      existingSlug: page.slug,
      title: page.title,
      slug: page.slug,
      slugEdited: true,
      description: page.description || '',
      heroTitle: page.hero?.title || page.title,
      heroSubtitle: page.hero?.subtitle || '',
      heroStyle: page.heroStyle || 'banner',
      starter: 'blank',
      accentColor: page.theme?.accentColor || '',
      backgroundTint: page.theme?.backgroundTint || '',
      published: page.published !== false,
      addToNav: false,
      addToFooter: false,
    });
    setStatus(null);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    const cleanSlug = slugify(draft.slug);
    if (!cleanSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setStatus({ kind: 'error', text: 'Use lowercase letters, numbers, and hyphens for the URL slug.' });
      return;
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
      setStatus({ kind: 'error', text: `"/${cleanSlug}" is reserved for a built-in page.` });
      return;
    }
    if (!draft.existingSlug && customPages[cleanSlug]) {
      setStatus({ kind: 'error', text: `A page at "/${cleanSlug}" already exists.` });
      return;
    }

    setBusy(true);
    setStatus(null);

    const existing = draft.existingSlug ? customPages[draft.existingSlug] : undefined;
    const pagePayload: CustomPage = {
      slug: cleanSlug,
      title: draft.title.trim(),
      description: draft.description.trim(),
      published: draft.published,
      heroStyle: draft.heroStyle,
      hero: {
        ...(existing?.hero || {}),
        title: (draft.heroTitle || draft.title).trim(),
        subtitle: draft.heroSubtitle.trim(),
      },
      theme: {
        ...(draft.accentColor.trim() ? { accentColor: draft.accentColor.trim() } : {}),
        ...(draft.backgroundTint.trim() ? { backgroundTint: draft.backgroundTint.trim() } : {}),
      },
      sections: existing?.sections ?? buildStarterSections(draft.starter),
    };

    const nextCustomPages = { ...customPages };
    if (draft.existingSlug && draft.existingSlug !== cleanSlug) {
      delete nextCustomPages[draft.existingSlug];
    }
    nextCustomPages[cleanSlug] = pagePayload;

    const res = await updateContent('customPages', nextCustomPages);
    if (!res.success) {
      setBusy(false);
      setStatus({ kind: 'error', text: res.error ?? 'Could not save page.' });
      return;
    }

    // Optionally add to navigation / footer quick links on creation
    if (!draft.existingSlug) {
      const href = `/${cleanSlug}`;
      if (draft.addToNav && canManageNav) {
        const currentNav = content?.navigation?.items || [];
        if (!currentNav.some((item) => item.href === href)) {
          const maxOrder = currentNav.reduce((max, item) => Math.max(max, item.order || 0), 0);
          await updateContent('navigation.items', [
            ...currentNav,
            { name: pagePayload.title, href, visible: true, order: maxOrder + 1 },
          ]);
        }
      }
      if (draft.addToFooter && canEdit('footer.quickLinks')) {
        const currentFooter = content?.footer?.quickLinks || [];
        if (!currentFooter.some((item) => item.href === href)) {
          await updateContent('footer.quickLinks', [
            ...currentFooter,
            { name: pagePayload.title, href },
          ]);
        }
      }
    }

    setBusy(false);
    setDraft(null);
    setStatus({
      kind: 'ok',
      text: draft.existingSlug
        ? `Updated "/${cleanSlug}".`
        : `Created "/${cleanSlug}". Open it in Edit Mode to customize sections and media.`,
    });
  };

  const togglePublish = async (page: CustomPage) => {
    setBusy(true);
    const nextPublished = page.published === false;
    const res = await updateContent(`customPages.${page.slug}.published`, nextPublished);
    setBusy(false);
    setStatus(
      res.success
        ? { kind: 'ok', text: `${page.title} is now ${nextPublished ? 'live' : 'a draft'}.` }
        : { kind: 'error', text: res.error ?? 'Could not update page.' }
    );
  };

  const deletePage = async (slug: string) => {
    setBusy(true);
    setPendingDelete(null);
    const nextPages = { ...customPages };
    delete nextPages[slug];
    const res = await updateContent('customPages', nextPages);
    setBusy(false);
    setStatus(
      res.success
        ? { kind: 'ok', text: `Deleted "/${slug}".` }
        : { kind: 'error', text: res.error ?? 'Could not delete page.' }
    );
  };

  const moveNavItem = (index: number, delta: -1 | 1) => {
    const sorted = navItems.slice().sort((a, b) => a.order - b.order);
    const target = index + delta;
    if (target < 0 || target >= sorted.length) return;
    const [moved] = sorted.splice(index, 1);
    sorted.splice(target, 0, moved);
    setNavItems(sorted.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const saveNavigation = async () => {
    setBusy(true);
    setStatus(null);
    const normalized = navItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    const res = await updateContent('navigation.items', normalized);
    setBusy(false);
    setStatus(
      res.success
        ? { kind: 'ok', text: 'Navigation menu saved.' }
        : { kind: 'error', text: res.error ?? 'Could not save navigation.' }
    );
  };

  const saveFooterLinks = async () => {
    setBusy(true);
    setStatus(null);
    const res = await updateContent('footer.quickLinks', footerLinks);
    setBusy(false);
    setStatus(
      res.success
        ? { kind: 'ok', text: 'Footer quick links saved.' }
        : { kind: 'error', text: res.error ?? 'Could not save footer links.' }
    );
  };

  const sortedNav = navItems.slice().sort((a, b) => a.order - b.order);

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div>
          <h1>Pages &amp; navigation</h1>
          <p>Create new pages, jump into inline section editing on any page, and organize the menu.</p>
        </div>
        {canManagePages && tab === 'custom' && !draft && (
          <button type="button" className={ui.button} onClick={() => setDraft({ ...EMPTY_DRAFT })}>
            <Icon name="plus" size={16} /> New page
          </button>
        )}
      </header>

      {status && (
        <p className={`${ui.notice} ${status.kind === 'ok' ? ui.noticeOk : ui.noticeError}`} role="status">
          {status.text}
        </p>
      )}

      <div className={styles.tabs} role="tablist">
        {canManagePages && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'custom'}
            className={`${styles.tab} ${tab === 'custom' ? styles.tabActive : ''}`}
            onClick={() => setTab('custom')}
          >
            Custom Pages ({pageList.length})
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'builtin'}
          className={`${styles.tab} ${tab === 'builtin' ? styles.tabActive : ''}`}
          onClick={() => setTab('builtin')}
        >
          Built-in Pages
        </button>
        {canManageNav && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'navigation'}
            className={`${styles.tab} ${tab === 'navigation' ? styles.tabActive : ''}`}
            onClick={() => setTab('navigation')}
          >
            Navigation &amp; Footer
          </button>
        )}
      </div>

      {tab === 'custom' && canManagePages && (
        <>
          {draft && (
            <form className={ui.card} onSubmit={handleSavePage}>
              <h2>{draft.existingSlug ? `Edit /${draft.existingSlug}` : 'Create new page'}</h2>

              <div className={ui.fieldGrid}>
                <div className={ui.field}>
                  <label htmlFor="page-title">Page Title</label>
                  <input
                    id="page-title"
                    type="text"
                    required
                    value={draft.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              title: nextTitle,
                              slug: prev.slugEdited ? prev.slug : slugify(nextTitle),
                            }
                          : prev
                      );
                    }}
                    placeholder="e.g., Summer Robotics Camp"
                  />
                </div>

                <div className={ui.field}>
                  <label htmlFor="page-slug">URL Slug</label>
                  <input
                    id="page-slug"
                    type="text"
                    required
                    value={draft.slug}
                    onChange={(e) =>
                      setDraft((prev) => (prev ? { ...prev, slug: e.target.value, slugEdited: true } : prev))
                    }
                    placeholder="summer-camp"
                  />
                  <span className={styles.slugPreview}>URL: /{slugify(draft.slug) || 'your-page'}</span>
                </div>

                <div className={ui.field}>
                  <label htmlFor="hero-title">Hero Headline</label>
                  <input
                    id="hero-title"
                    type="text"
                    value={draft.heroTitle}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, heroTitle: e.target.value } : prev))}
                    placeholder="Defaults to page title"
                  />
                </div>

                <div className={ui.field}>
                  <label htmlFor="hero-style">Hero Style</label>
                  <select
                    id="hero-style"
                    value={draft.heroStyle}
                    onChange={(e) =>
                      setDraft((prev) => (prev ? { ...prev, heroStyle: e.target.value as 'banner' | 'minimal' } : prev))
                    }
                  >
                    <option value="banner">Media Banner (photo, GIF, or video + reposition)</option>
                    <option value="minimal">Minimal Gradient Header (like About page)</option>
                  </select>
                </div>
              </div>

              <div className={ui.field}>
                <label htmlFor="hero-sub">Hero Subtitle / Page Summary</label>
                <textarea
                  id="hero-sub"
                  rows={2}
                  value={draft.heroSubtitle}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, heroSubtitle: e.target.value } : prev))}
                  placeholder="A concise subtitle shown in the page header."
                />
              </div>

              <div className={ui.fieldGrid}>
                {!draft.existingSlug && (
                  <div className={ui.field}>
                    <label htmlFor="starter">Starter Sections</label>
                    <select
                      id="starter"
                      value={draft.starter}
                      onChange={(e) =>
                        setDraft((prev) => (prev ? { ...prev, starter: e.target.value as StarterTemplate } : prev))
                      }
                    >
                      <option value="program">Program Showcase (Split Media + Feature Cards + CTA)</option>
                      <option value="event">Event Recap (Stats + Media Gallery + CTA)</option>
                      <option value="resources">Resources &amp; Guides (Text Block + Cards)</option>
                      <option value="blank">Blank Page (add sections manually)</option>
                    </select>
                  </div>
                )}

                <div className={ui.field}>
                  <label htmlFor="accent-override">Accent Color Override (optional)</label>
                  <input
                    id="accent-override"
                    type="text"
                    value={draft.accentColor}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, accentColor: e.target.value } : prev))}
                    placeholder="Default (#e0242f)"
                  />
                </div>

                <div className={ui.field}>
                  <label htmlFor="bg-override">Background Tint Override (optional)</label>
                  <input
                    id="bg-override"
                    type="text"
                    value={draft.backgroundTint}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, backgroundTint: e.target.value } : prev))}
                    placeholder="Default (#07080f)"
                  />
                </div>
              </div>

              <div className={ui.checkGrid}>
                <label className={ui.checkRow}>
                  <input
                    type="checkbox"
                    checked={draft.published}
                    onChange={(e) => setDraft((prev) => (prev ? { ...prev, published: e.target.checked } : prev))}
                  />
                  <span>
                    Publish page
                    <small>Unpublished drafts are hidden from public visitors.</small>
                  </span>
                </label>

                {!draft.existingSlug && canManageNav && (
                  <label className={ui.checkRow}>
                    <input
                      type="checkbox"
                      checked={draft.addToNav}
                      onChange={(e) => setDraft((prev) => (prev ? { ...prev, addToNav: e.target.checked } : prev))}
                    />
                    <span>
                      Add to top navbar
                      <small>Includes a visible link to this page in the site menu.</small>
                    </span>
                  </label>
                )}

                {!draft.existingSlug && canEdit('footer.quickLinks') && (
                  <label className={ui.checkRow}>
                    <input
                      type="checkbox"
                      checked={draft.addToFooter}
                      onChange={(e) => setDraft((prev) => (prev ? { ...prev, addToFooter: e.target.checked } : prev))}
                    />
                    <span>
                      Add to footer quick links
                      <small>Adds a link under Quick Links in the footer.</small>
                    </span>
                  </label>
                )}
              </div>

              <div className={ui.actions}>
                <button type="submit" className={ui.button} disabled={busy}>
                  {busy ? 'Saving…' : draft.existingSlug ? 'Save changes' : 'Create page'}
                </button>
                <button type="button" className={ui.buttonQuiet} onClick={() => setDraft(null)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {pageList.length === 0 ? (
            <p className={ui.empty}>No custom pages yet. Click &ldquo;New page&rdquo; to build one with sections, animations, and custom styling.</p>
          ) : (
            <ul className={ui.list}>
              {pageList.map((page) => (
                <li key={page.slug} className={ui.row}>
                  <div className={ui.rowMain}>
                    <strong>{page.title}</strong>
                    <span>
                      <span className={`${ui.badge} ${page.published === false ? ui.badgeDraft : ui.badgeLive}`}>
                        {page.published === false ? 'Draft' : 'Live'}
                      </span>{' '}
                      /{page.slug} · {(page.sections || []).length} section{(page.sections || []).length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className={ui.rowActions}>
                    {pendingDelete === page.slug ? (
                      <>
                        <button type="button" className={ui.buttonDanger} onClick={() => void deletePage(page.slug)}>
                          Confirm delete
                        </button>
                        <button type="button" className={ui.buttonQuiet} onClick={() => setPendingDelete(null)}>
                          Keep
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={ui.button}
                          onClick={() => openLiveEditor(`/${page.slug}`)}
                        >
                          <Icon name="pencil" size={14} /> Edit Page
                        </button>
                        <button type="button" className={ui.buttonQuiet} onClick={() => openEditPage(page)}>
                          Settings
                        </button>
                        <button
                          type="button"
                          className={ui.buttonQuiet}
                          disabled={busy}
                          onClick={() => void togglePublish(page)}
                        >
                          {page.published === false ? 'Publish' : 'Unpublish'}
                        </button>
                        <button
                          type="button"
                          className={ui.buttonDanger}
                          onClick={() => setPendingDelete(page.slug)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'builtin' && (
        <section className={ui.card}>
          <h2>Add &amp; edit sections on built-in pages</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 0 }}>
            Open any page in Edit Mode to edit text, drag banner positions, swap images/GIFs/videos, and add or style custom sections.
          </p>
          <div className={styles.builtinGrid}>
            {BUILTIN_PAGES.filter((p) => canEdit(p.key === 'frc' || p.key === 'ftc' || p.key === 'vex' ? `teams.${p.key}` : p.key)).map((p) => {
              const extraCount = (content?.pageSections?.[p.key] || []).length;
              return (
                <div key={p.key} className={styles.builtinCard}>
                  <strong>{p.name}</strong>
                  <span>{p.href} · {extraCount} custom section{extraCount === 1 ? '' : 's'}</span>
                  <span>{p.description}</span>
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      className={ui.buttonQuiet}
                      onClick={() => openLiveEditor(p.href)}
                    >
                      <Icon name="pencil" size={14} /> Open &amp; Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'navigation' && canManageNav && (
        <>
          <section className={ui.card}>
            <h2>Top Navigation Menu</h2>
            <div className={ui.list}>
              {sortedNav.map((item, idx) => (
                <div key={`${item.href}-${idx}`} className={styles.navRow}>
                  <input
                    type="text"
                    aria-label="Menu label"
                    value={item.name}
                    onChange={(e) => {
                      const next = sortedNav.slice();
                      next[idx] = { ...item, name: e.target.value };
                      setNavItems(next);
                    }}
                  />
                  <input
                    type="text"
                    aria-label="Menu link"
                    value={item.href}
                    onChange={(e) => {
                      const next = sortedNav.slice();
                      next[idx] = { ...item, href: e.target.value };
                      setNavItems(next);
                    }}
                  />
                  <div className={styles.navControls}>
                    <button
                      type="button"
                      className={ui.buttonQuiet}
                      disabled={idx === 0}
                      onClick={() => moveNavItem(idx, -1)}
                      title="Move up"
                    >
                      <Icon name="arrow-up" size={14} />
                    </button>
                    <button
                      type="button"
                      className={ui.buttonQuiet}
                      disabled={idx === sortedNav.length - 1}
                      onClick={() => moveNavItem(idx, 1)}
                      title="Move down"
                    >
                      <Icon name="arrow-down" size={14} />
                    </button>
                    <button
                      type="button"
                      className={ui.buttonQuiet}
                      onClick={() => {
                        const next = sortedNav.slice();
                        next[idx] = { ...item, visible: !item.visible };
                        setNavItems(next);
                      }}
                      title={item.visible ? 'Hide from navbar' : 'Show in navbar'}
                    >
                      <Icon name={item.visible ? 'eye' : 'eye-off'} size={14} />
                    </button>
                    <button
                      type="button"
                      className={ui.buttonDanger}
                      onClick={() => setNavItems(sortedNav.filter((_, i) => i !== idx))}
                      title="Remove link"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={ui.actions} style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className={ui.buttonQuiet}
                onClick={() =>
                  setNavItems([
                    ...sortedNav,
                    { name: 'New Link', href: '/', visible: true, order: sortedNav.length + 1 },
                  ])
                }
              >
                <Icon name="plus" size={14} /> Add nav item
              </button>
              <button type="button" className={ui.button} disabled={busy} onClick={() => void saveNavigation()}>
                {busy ? 'Saving…' : 'Save navigation'}
              </button>
            </div>
          </section>

          {canEdit('footer.quickLinks') && (
            <section className={ui.card}>
              <h2>Footer Quick Links</h2>
              <div className={ui.list}>
                {footerLinks.map((link, idx) => (
                  <div key={`${link.href}-${idx}`} className={styles.navRow}>
                    <input
                      type="text"
                      aria-label="Quick link label"
                      value={link.name}
                      onChange={(e) => {
                        const next = footerLinks.slice();
                        next[idx] = { ...link, name: e.target.value };
                        setFooterLinks(next);
                      }}
                    />
                    <input
                      type="text"
                      aria-label="Quick link URL"
                      value={link.href}
                      onChange={(e) => {
                        const next = footerLinks.slice();
                        next[idx] = { ...link, href: e.target.value };
                        setFooterLinks(next);
                      }}
                    />
                    <div className={styles.navControls}>
                      <button
                        type="button"
                        className={ui.buttonDanger}
                        onClick={() => setFooterLinks(footerLinks.filter((_, i) => i !== idx))}
                        title="Remove quick link"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className={ui.actions} style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className={ui.buttonQuiet}
                  onClick={() => setFooterLinks([...footerLinks, { name: 'New Link', href: '/' }])}
                >
                  <Icon name="plus" size={14} /> Add quick link
                </button>
                <button type="button" className={ui.button} disabled={busy} onClick={() => void saveFooterLinks()}>
                  {busy ? 'Saving…' : 'Save footer links'}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
