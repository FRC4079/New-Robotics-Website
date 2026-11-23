import type { AnimationPreset, SiteAnimationSettings } from './content';

export const DEFAULT_ANIMATION_SETTINGS: SiteAnimationSettings = {
  preset: 'smooth',
  scrollReveal: 'fade-up',
  heroEntrance: 'rise',
  cardHover: 'lift',
  speed: 'normal',
  stagger: true,
  staggerDelayMs: 70,
  respectReducedMotion: true,
};

export const ANIMATION_PRESETS: Array<{
  key: AnimationPreset;
  label: string;
  description: string;
  settings: SiteAnimationSettings;
}> = [
  {
    key: 'none',
    label: 'Off (Instant)',
    description: 'Disable entrance, scroll, and hover animations across the site.',
    settings: {
      preset: 'none',
      scrollReveal: 'none',
      heroEntrance: 'none',
      cardHover: 'none',
      speed: 'normal',
      stagger: false,
      staggerDelayMs: 0,
      respectReducedMotion: true,
    },
  },
  {
    key: 'subtle',
    label: 'Subtle',
    description: 'Gentle fades and micro-lifts for a calm, understated feel.',
    settings: {
      preset: 'subtle',
      scrollReveal: 'fade',
      heroEntrance: 'fade',
      cardHover: 'lift',
      speed: 'normal',
      stagger: false,
      staggerDelayMs: 50,
      respectReducedMotion: true,
    },
  },
  {
    key: 'smooth',
    label: 'Smooth Rise',
    description: 'Balanced upward reveals, hero rise, and tactile card lift.',
    settings: {
      preset: 'smooth',
      scrollReveal: 'fade-up',
      heroEntrance: 'rise',
      cardHover: 'lift',
      speed: 'normal',
      stagger: true,
      staggerDelayMs: 70,
      respectReducedMotion: true,
    },
  },
  {
    key: 'dynamic',
    label: 'Dynamic Showcase',
    description: 'Bolder zoom reveals, staggered hero entrance, and glowing card hovers.',
    settings: {
      preset: 'dynamic',
      scrollReveal: 'zoom-in',
      heroEntrance: 'stagger',
      cardHover: 'glow',
      speed: 'normal',
      stagger: true,
      staggerDelayMs: 90,
      respectReducedMotion: true,
    },
  },
  {
    key: 'snappy',
    label: 'Snappy Tech',
    description: 'Fast, crisp slide-ins and subtle 3D tilt hover response.',
    settings: {
      preset: 'snappy',
      scrollReveal: 'slide-left',
      heroEntrance: 'slide-left',
      cardHover: 'tilt',
      speed: 'fast',
      stagger: true,
      staggerDelayMs: 55,
      respectReducedMotion: true,
    },
  },
];

export function resolveAnimationSettings(
  input?: Partial<SiteAnimationSettings> | null
): SiteAnimationSettings {
  return {
    ...DEFAULT_ANIMATION_SETTINGS,
    ...(input || {}),
  };
}
