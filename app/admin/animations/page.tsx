'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/hooks/useContent';
import Icon from '@/components/icons/Icon';
import type {
  AnimationSpeed,
  CardHoverType,
  HeroEntranceType,
  ScrollRevealType,
  SiteAnimationSettings,
} from '@/utils/content';
import {
  ANIMATION_PRESETS,
  DEFAULT_ANIMATION_SETTINGS,
  resolveAnimationSettings,
} from '@/utils/animationHelpers';
import ui from '../ui.module.scss';
import styles from './animations.module.scss';

type Status = { kind: 'ok' | 'error'; text: string } | null;

const SCROLL_REVEALS: Array<{ value: ScrollRevealType; label: string }> = [
  { value: 'none', label: 'None (instant)' },
  { value: 'fade', label: 'Fade in' },
  { value: 'fade-up', label: 'Fade up' },
  { value: 'fade-down', label: 'Fade down' },
  { value: 'slide-left', label: 'Slide from right' },
  { value: 'slide-right', label: 'Slide from left' },
  { value: 'zoom-in', label: 'Zoom in' },
  { value: 'flip-up', label: '3D flip up' },
];

const HERO_ENTRANCES: Array<{ value: HeroEntranceType; label: string }> = [
  { value: 'none', label: 'None (instant)' },
  { value: 'rise', label: 'Rise up' },
  { value: 'fade', label: 'Soft fade' },
  { value: 'slide-left', label: 'Slide in from left' },
  { value: 'zoom', label: 'Zoom settle' },
  { value: 'stagger', label: 'Staggered showcase' },
];

const CARD_HOVERS: Array<{ value: CardHoverType; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'lift', label: 'Lift up' },
  { value: 'glow', label: 'Accent border & glow' },
  { value: 'scale', label: 'Subtle scale' },
  { value: 'tilt', label: '3D tilt lift' },
];

const SPEEDS: Array<{ value: AnimationSpeed; label: string }> = [
  { value: 'slow', label: 'Slow & deliberate' },
  { value: 'normal', label: 'Normal (balanced)' },
  { value: 'fast', label: 'Fast & snappy' },
];

export default function AnimationsAdminPage() {
  const router = useRouter();
  const { user, isLoading, canEdit } = useAuth();
  const { content, updateContent } = useContent();

  const [settings, setSettings] = useState<SiteAnimationSettings>(() =>
    resolveAnimationSettings(content?.site?.animations)
  );
  const [seenSaved, setSeenSaved] = useState(content?.site?.animations);
  if (seenSaved !== content?.site?.animations) {
    setSeenSaved(content?.site?.animations);
    setSettings(resolveAnimationSettings(content?.site?.animations));
  }

  const [previewNonce, setPreviewNonce] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const allowed = canEdit('site.animations');

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace('/admin');
    }
  }, [isLoading, allowed, router]);

  if (!allowed || !user) return null;

  const applyPreset = (presetSettings: SiteAnimationSettings) => {
    setSettings({ ...presetSettings });
    setPreviewNonce((n) => n + 1);
    setStatus(null);
  };

  const updateField = <K extends keyof SiteAnimationSettings>(
    key: K,
    value: SiteAnimationSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPreviewNonce((n) => n + 1);
    setStatus(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const result = await updateContent('site.animations', settings);
    setBusy(false);
    if (result.success) {
      setStatus({ kind: 'ok', text: 'Website animation settings saved.' });
    } else {
      setStatus({ kind: 'error', text: result.error ?? 'Could not save animation settings.' });
    }
  };

  const handleResetDefaults = () => {
    applyPreset(DEFAULT_ANIMATION_SETTINGS);
  };

  const previewDuration =
    settings.preset === 'none'
      ? '0.01ms'
      : settings.speed === 'slow'
        ? '0.9s'
        : settings.speed === 'fast'
          ? '0.35s'
          : '0.6s';

  const previewHoverDuration =
    settings.preset === 'none'
      ? '0.01ms'
      : settings.speed === 'slow'
        ? '0.34s'
        : settings.speed === 'fast'
          ? '0.14s'
          : '0.2s';

  const heroAnimClass =
    settings.preset === 'none' ? styles.anim_none : styles[`anim_${settings.heroEntrance}`] || '';
  const revealAnimClass =
    settings.preset === 'none' ? styles.anim_none : styles[`anim_${settings.scrollReveal}`] || '';
  const hoverAnimClass =
    settings.preset === 'none' ? styles.hover_none : styles[`hover_${settings.cardHover}`] || '';

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div>
          <h1>Website animations</h1>
          <p>Choose motion presets, scroll reveals, hero entrances, and card hover interactions across every page.</p>
        </div>
        <button type="button" className={ui.buttonQuiet} onClick={handleResetDefaults}>
          Reset to defaults
        </button>
      </header>

      {status && (
        <p className={`${ui.notice} ${status.kind === 'ok' ? ui.noticeOk : ui.noticeError}`} role="status">
          {status.text}
        </p>
      )}

      {/* Live Preview Stage */}
      <section className={ui.card} aria-label="Animation preview">
        <div className={styles.previewTop}>
          <div>
            <span className={styles.previewBadge}>Live Preview</span>
            <h2 style={{ margin: '0.25rem 0 0' }}>See how pages animate</h2>
          </div>
          <button
            type="button"
            className={ui.buttonQuiet}
            onClick={() => setPreviewNonce((n) => n + 1)}
          >
            <Icon name="refresh" size={16} /> Replay animations
          </button>
        </div>

        <div
          key={previewNonce}
          className={styles.previewStage}
          style={
            {
              '--preview-reveal-dur': previewDuration,
              '--preview-dur': previewHoverDuration,
            } as React.CSSProperties
          }
        >
          <div className={`${styles.previewHero} ${heroAnimClass}`}>
            <h3>Oxford Academy Robotics</h3>
            <p>Hero entrance ({settings.heroEntrance}) · Speed ({settings.speed})</p>
          </div>

          <div className={styles.previewGrid}>
            {['Design & Build', 'Autonomous Code', 'Competition Ready'].map((title, idx) => (
              <div
                key={title}
                className={`${styles.previewCard} ${revealAnimClass} ${hoverAnimClass}`}
                style={{
                  animationDelay:
                    settings.stagger && settings.preset !== 'none'
                      ? `${idx * (settings.staggerDelayMs ?? 70)}ms`
                      : '0ms',
                }}
              >
                <strong>{title}</strong>
                <span>Hover to test &ldquo;{settings.cardHover}&rdquo; · Reveal &ldquo;{settings.scrollReveal}&rdquo;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={handleSave}>
        <section className={ui.card}>
          <h2>Quick presets</h2>
          <div className={styles.presets}>
            {ANIMATION_PRESETS.map((preset) => {
              const active = settings.preset === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  className={`${styles.presetCard} ${active ? styles.presetActive : ''}`}
                  onClick={() => applyPreset(preset.settings)}
                >
                  <strong>{preset.label}</strong>
                  <span>{preset.description}</span>
                </button>
              );
            })}
          </div>

          <h2>Fine-grained controls</h2>
          <div className={ui.fieldGrid}>
            <div className={ui.field}>
              <label htmlFor="scrollReveal">Section scroll reveal</label>
              <select
                id="scrollReveal"
                value={settings.scrollReveal}
                onChange={(e) => updateField('scrollReveal', e.target.value as ScrollRevealType)}
              >
                {SCROLL_REVEALS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <small>How sections appear as visitors scroll down the page.</small>
            </div>

            <div className={ui.field}>
              <label htmlFor="heroEntrance">Hero banner entrance</label>
              <select
                id="heroEntrance"
                value={settings.heroEntrance}
                onChange={(e) => updateField('heroEntrance', e.target.value as HeroEntranceType)}
              >
                {HERO_ENTRANCES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <small>How page titles and hero overlays animate on load.</small>
            </div>

            <div className={ui.field}>
              <label htmlFor="cardHover">Card hover style</label>
              <select
                id="cardHover"
                value={settings.cardHover}
                onChange={(e) => updateField('cardHover', e.target.value as CardHoverType)}
              >
                {CARD_HOVERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <small>Interactive hover effect across team, news, stat, and custom cards.</small>
            </div>

            <div className={ui.field}>
              <label htmlFor="speed">Animation speed</label>
              <select
                id="speed"
                value={settings.speed}
                onChange={(e) => updateField('speed', e.target.value as AnimationSpeed)}
              >
                {SPEEDS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <small>Controls both reveal duration and hover responsiveness.</small>
            </div>
          </div>

          <div className={ui.fieldGrid}>
            <div className={ui.field}>
              <label className={ui.checkRow}>
                <input
                  type="checkbox"
                  checked={settings.stagger}
                  onChange={(e) => updateField('stagger', e.target.checked)}
                />
                <span>
                  Stagger grid items
                  <small>Animate cards one after another when a section enters view.</small>
                </span>
              </label>
            </div>

            <div className={ui.field}>
              <label htmlFor="staggerDelay">Stagger delay (ms)</label>
              <input
                id="staggerDelay"
                type="number"
                min={0}
                max={250}
                step={10}
                disabled={!settings.stagger}
                value={settings.staggerDelayMs ?? 70}
                onChange={(e) => updateField('staggerDelayMs', Math.max(0, Math.min(250, Number(e.target.value) || 0)))}
              />
              <small>Delay between consecutive cards (recommended: 50–100 ms).</small>
            </div>
          </div>

          <div className={ui.field}>
            <label className={ui.checkRow}>
              <input
                type="checkbox"
                checked={settings.respectReducedMotion}
                onChange={(e) => updateField('respectReducedMotion', e.target.checked)}
              />
              <span>
                Respect visitor reduced-motion preference
                <small>Recommended for accessibility when visitors enable reduced motion in their OS.</small>
              </span>
            </label>
          </div>

          <div className={ui.actions}>
            <button type="submit" className={ui.button} disabled={busy}>
              {busy ? 'Saving…' : 'Save animation settings'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
