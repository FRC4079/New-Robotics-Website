"use client";
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ImageStyle, SiteContent } from '@/utils/content';
import { getStoredStyle, readContentPath } from '@/utils/contentHelpers';
import { useEditMode } from '@/contexts/EditModeContext';

function parsePercent(token: string | undefined, fallback: number): number {
  if (!token) return fallback;
  const lower = token.toLowerCase();
  if (lower === 'left' || lower === 'top') return 0;
  if (lower === 'center') return 50;
  if (lower === 'right' || lower === 'bottom') return 100;
  const parsed = Number.parseFloat(lower);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : fallback;
}

export function parseObjectPosition(pos?: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const parts = pos.trim().split(/\s+/);
  if (parts.length === 1) {
    const token = parts[0].toLowerCase();
    if (token === 'top' || token === 'bottom') {
      return { x: 50, y: parsePercent(token, 50) };
    }
    return { x: parsePercent(token, 50), y: 50 };
  }
  return {
    x: parsePercent(parts[0], 50),
    y: parsePercent(parts[1], 50),
  };
}

interface UseBannerControlsOptions {
  content: SiteContent | null;
  bannerPath: string;
  fallbackSrc: string;
}

export function useBannerControls({ content, bannerPath, fallbackSrc }: UseBannerControlsOptions) {
  const { isEditMode: editModeOn, canEdit, addPendingChange, pendingChanges } = useEditMode();
  const isEditMode = editModeOn && canEdit(bannerPath);

  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [styleEditorPos, setStyleEditorPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    overflowX: number;
    overflowY: number;
  } | null>(null);

  const { bannerSrc, bannerStyle } = useMemo(() => {
    const pendingValue = pendingChanges.get(bannerPath);
    const pendingStyle = pendingChanges.get(`${bannerPath}.style`) as ImageStyle | undefined;
    const savedValue = readContentPath(content, bannerPath);
    const storedStyle = getStoredStyle(content, bannerPath);

    const activeValue = pendingValue !== undefined ? pendingValue : savedValue;
    let src = fallbackSrc;
    let baseStyle: ImageStyle = storedStyle ?? {};

    if (typeof activeValue === 'string' && activeValue) {
      src = activeValue;
    } else if (activeValue && typeof activeValue === 'object') {
      const obj = activeValue as { src?: string; value?: string; style?: ImageStyle };
      src = obj.src || obj.value || fallbackSrc;
      baseStyle = { ...baseStyle, ...(obj.style || {}) };
    }

    const mergedStyle: ImageStyle = {
      ...baseStyle,
      ...(pendingStyle || {}),
    };

    return { bannerSrc: src, bannerStyle: mergedStyle };
  }, [content, bannerPath, fallbackSrc, pendingChanges]);

  const position = useMemo(() => parseObjectPosition(bannerStyle.objectPosition), [bannerStyle.objectPosition]);

  const updateBannerStyle = useCallback(
    (nextStyle: ImageStyle) => {
      const pendingValue = pendingChanges.get(bannerPath);
      const savedValue = readContentPath(content, bannerPath);
      const activeValue = pendingValue !== undefined ? pendingValue : savedValue;

      if (activeValue && typeof activeValue === 'object' && !Array.isArray(activeValue)) {
        addPendingChange(bannerPath, { ...(activeValue as Record<string, unknown>), style: nextStyle });
      } else {
        addPendingChange(`${bannerPath}.style`, nextStyle);
      }
    },
    [addPendingChange, bannerPath, content, pendingChanges]
  );

  const updateBannerMedia = useCallback(
    (newSrc: string) => {
      addPendingChange(bannerPath, {
        src: newSrc,
        ...(Object.keys(bannerStyle).length > 0 ? { style: bannerStyle } : {}),
      });
    },
    [addPendingChange, bannerPath, bannerStyle]
  );

  const measureOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { overflowX: 0, overflowY: 0 };
    const rect = container.getBoundingClientRect();
    const mediaEl = container.querySelector('[data-banner-media-wrapper="true"] img, [data-banner-media-wrapper="true"] video') as
      | HTMLImageElement
      | HTMLVideoElement
      | null;

    let naturalW = 0;
    let naturalH = 0;
    if (mediaEl instanceof HTMLImageElement) {
      naturalW = mediaEl.naturalWidth;
      naturalH = mediaEl.naturalHeight;
    } else if (mediaEl instanceof HTMLVideoElement) {
      naturalW = mediaEl.videoWidth;
      naturalH = mediaEl.videoHeight;
    }

    if (!naturalW || !naturalH || !rect.width || !rect.height) {
      return { overflowX: rect.width * 0.5, overflowY: rect.height * 0.6 };
    }

    const mediaAspect = naturalW / naturalH;
    const boxAspect = rect.width / rect.height;

    if (mediaAspect > boxAspect) {
      // Media is wider than box: horizontal overflow
      const renderedWidth = rect.height * mediaAspect;
      return { overflowX: Math.max(0, renderedWidth - rect.width), overflowY: 0 };
    } else {
      // Media is taller than box: vertical overflow
      const renderedHeight = rect.width / mediaAspect;
      return { overflowX: 0, overflowY: Math.max(0, renderedHeight - rect.height) };
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isEditMode || !isRepositioning) return;
      if ((e.target as HTMLElement).closest('[data-banner-control="true"]')) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const { overflowX, overflowY } = measureOverflow();
      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: position.x,
        originY: position.y,
        overflowX,
        overflowY,
      };
      setIsDragging(true);
    },
    [isEditMode, isRepositioning, measureOverflow, position.x, position.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || !isRepositioning) return;

      const rect = containerRef.current?.getBoundingClientRect();
      const fallbackSpanY = rect?.height ? rect.height * 0.65 : 260;
      const fallbackSpanX = rect?.width ? rect.width * 0.65 : 400;

      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;

      // Dragging the image down (deltaY > 0) reveals more of the top (Y% decreases toward 0%).
      const spanY = drag.overflowY > 12 ? drag.overflowY : fallbackSpanY;
      const spanX = drag.overflowX > 12 ? drag.overflowX : fallbackSpanX;

      const nextY =
        drag.overflowY > 4 || Math.abs(deltaY) >= Math.abs(deltaX)
          ? Math.round(Math.max(0, Math.min(100, drag.originY - (deltaY / spanY) * 100)))
          : drag.originY;

      const nextX =
        drag.overflowX > 4
          ? Math.round(Math.max(0, Math.min(100, drag.originX - (deltaX / spanX) * 100)))
          : drag.originX;

      updateBannerStyle({
        ...bannerStyle,
        objectPosition: `${nextX}% ${nextY}%`,
      });
    },
    [bannerStyle, isRepositioning, updateBannerStyle]
  );

  const handlePointerUp = useCallback(() => {
    dragStateRef.current = null;
    setIsDragging(false);
  }, []);

  const resetPosition = useCallback(() => {
    updateBannerStyle({
      ...bannerStyle,
      objectPosition: '50% 50%',
    });
  }, [bannerStyle, updateBannerStyle]);

  const openStyleEditorFrom = useCallback((el: HTMLElement | null) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      setStyleEditorPos({ x: rect.left - 340, y: rect.bottom + 8 });
    } else {
      setStyleEditorPos({ x: 0, y: 0 });
    }
    setShowStyleEditor((prev) => !prev);
  }, []);

  return {
    isEditMode,
    containerRef,
    bannerSrc,
    bannerStyle,
    position,
    isRepositioning,
    setIsRepositioning,
    isDragging,
    showMediaPicker,
    setShowMediaPicker,
    showStyleEditor,
    setShowStyleEditor,
    styleEditorPos,
    openStyleEditorFrom,
    updateBannerStyle,
    updateBannerMedia,
    resetPosition,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
