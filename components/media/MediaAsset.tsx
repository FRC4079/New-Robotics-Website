"use client";
import React from 'react';
import Image from 'next/image';
import { isVideoUrl } from '@/utils/mediaHelpers';

interface MediaAssetProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  fill?: boolean;
  useNextImage?: boolean;
  controls?: boolean;
}

/**
 * Renders an image, animated GIF, or muted looping video seamlessly depending
 * on the media URL, so videos and GIFs drop cleanly into any image slot.
 */
export default function MediaAsset({
  src,
  alt,
  className,
  style,
  width,
  height,
  fill = false,
  useNextImage = false,
  controls = false,
}: MediaAssetProps): React.ReactElement | null {
  if (!src) return null;

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        className={className}
        style={style}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        autoPlay
        loop
        muted={!controls}
        playsInline
        controls={controls}
        aria-label={alt || undefined}
      />
    );
  }

  if (useNextImage) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          style={style}
          className={className}
          unoptimized
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width || 500}
        height={height || 300}
        style={style}
        className={className}
        unoptimized
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
    />
  );
}
