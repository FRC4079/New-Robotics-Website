// Client-safe helper functions for content normalization
// These can be imported in client components

import { TextStyle, ImageStyle } from './content';

// Helper to normalize content values that may be strings or objects with value/style
type StyledValue = { value?: unknown; src?: unknown; style?: TextStyle & ImageStyle };

export function normalizeContentValue(input: unknown): { value: string; style?: TextStyle } {
  const value = input as StyledValue | string | null | undefined;
  // Handle null or undefined
  if (value === null || value === undefined) {
    return { value: '' };
  }
  
  // If it's a string, return as-is
  if (typeof value === 'string') {
    return { value };
  }
  
  // If it's an object with a value property
  if (typeof value === 'object') {
    // Handle both { value: ..., style: ... } and { src: ..., style: ... } formats
    if ('value' in value) {
      return {
        value: String(value.value || ''),
        style: value.style
      };
    }
    // For image objects with src
    if ('src' in value) {
      return {
        value: String(value.src || ''),
        style: value.style
      };
    }
  }
  
  // Fallback: convert to string
  return { value: String(input) };
}

// Helper to extract just the string value from normalized content
export function getContentValue(value: unknown): string {
  const normalized = normalizeContentValue(value);
  return normalized.value;
}

// Helper to extract style from normalized content
export function getContentStyle(value: unknown): TextStyle | undefined {
  return normalizeContentValue(value).style;
}

// Helper to extract image style from normalized content
export function getContentImageStyle(value: unknown): ImageStyle | undefined {
  if (typeof value === 'object' && value !== null && 'style' in value && value.style) {
    return value.style as ImageStyle;
  }
  return undefined;
}
