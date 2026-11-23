"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useContent } from '@/hooks/useContent';
import { useEditMode } from '@/contexts/EditModeContext';
import { resolveAnimationSettings } from '@/utils/animationHelpers';

const STAGGER_GRID_SELECTOR =
  '[data-stagger-group], [class*="Grid"], [class*="grid"], [class*="List"], [class*="list"]';

/**
 * Applies the admin-configured website animation settings onto <html> and
 * runs an IntersectionObserver for scroll-reveal sections on public pages.
 */
export default function AnimationEffects(): null {
  const { content } = useContent();
  const { isEditMode } = useEditMode();
  const pathname = usePathname();
  const settings = resolveAnimationSettings(content?.site?.animations);
  const isAdminRoute = pathname.startsWith('/admin');

  // Keep root data attributes & CSS variables synced with site.animations.
  useEffect(() => {
    const root = document.documentElement;
    if (isAdminRoute) {
      root.dataset.animPreset = 'none';
      root.dataset.animReveal = 'none';
      root.dataset.animHero = 'none';
      root.dataset.animHover = 'none';
      root.dataset.animSpeed = 'normal';
      root.dataset.animStagger = 'false';
      root.dataset.animReduced = 'true';
      return;
    }

    root.dataset.animPreset = settings.preset;
    root.dataset.animReveal = settings.scrollReveal;
    root.dataset.animHero = settings.heroEntrance;
    root.dataset.animHover = settings.cardHover;
    root.dataset.animSpeed = settings.speed;
    root.dataset.animStagger = settings.stagger ? 'true' : 'false';
    root.dataset.animReduced = settings.respectReducedMotion ? 'true' : 'false';
    root.style.setProperty('--anim-stagger-ms', `${settings.staggerDelayMs ?? 70}ms`);
  }, [isAdminRoute, settings]);

  // Observe sections for scroll reveals when enabled on non-admin pages.
  useEffect(() => {
    if (isAdminRoute) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('section, [data-reveal-section="true"]')
    );

    const disableReveal =
      isEditMode ||
      settings.preset === 'none' ||
      settings.scrollReveal === 'none';

    if (disableReveal) {
      for (const sec of sections) {
        sec.removeAttribute('data-reveal-state');
      }
      return;
    }

    // Assign stagger indices to grid children inside sections.
    if (settings.stagger) {
      for (const sec of sections) {
        const grids = sec.querySelectorAll<HTMLElement>(STAGGER_GRID_SELECTOR);
        for (const grid of grids) {
          Array.from(grid.children).forEach((child, idx) => {
            if (child instanceof HTMLElement) {
              child.style.setProperty('--stagger-i', String(Math.min(idx, 10)));
              child.setAttribute('data-stagger-item', 'true');
            }
          });
        }
      }
    }

    const viewportCutoff = window.innerHeight * 0.92;
    const pending: HTMLElement[] = [];

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      // Never hide sections already in or above the viewport on load.
      if (rect.top <= viewportCutoff) {
        sec.setAttribute('data-reveal-state', 'visible');
      } else {
        sec.setAttribute('data-reveal-state', 'pending');
        pending.push(sec);
      }
    }

    if (pending.length === 0 || typeof IntersectionObserver === 'undefined') {
      for (const sec of pending) sec.setAttribute('data-reveal-state', 'visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute('data-reveal-state', 'visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    for (const sec of pending) observer.observe(sec);
    return () => observer.disconnect();
  }, [
    pathname,
    isAdminRoute,
    isEditMode,
    settings.preset,
    settings.scrollReveal,
    settings.stagger,
    settings.staggerDelayMs,
    content,
  ]);

  return null;
}
