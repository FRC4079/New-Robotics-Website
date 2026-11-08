// Server-only access to the JSON file that backs the site content.
// Do not import from client components.
import { copyFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SiteContent } from '@/utils/content';

/** Content that ships with the app. Used as the seed for a custom CONTENT_FILE. */
const SEED_FILE = path.join(process.cwd(), 'content', 'site-content.json');

export type ContentDocument = Record<string, unknown>;

/**
 * Where the live content is stored. Set CONTENT_FILE to a path on a mounted
 * volume so edits survive redeploys; it is seeded from the bundled content the
 * first time it is needed.
 */
export function getContentFilePath(): string {
  const configured = process.env.CONTENT_FILE;
  return configured ? path.resolve(configured) : SEED_FILE;
}

async function ensureContentFile(): Promise<string> {
  const file = getContentFilePath();
  try {
    await stat(file);
  } catch {
    if (file === SEED_FILE) throw new Error(`Content file not found at ${file}`);
    await mkdir(path.dirname(file), { recursive: true });
    await copyFile(SEED_FILE, file);
  }
  return file;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

let cache: { mtimeMs: number; size: number; content: SiteContent } | null = null;

/** Reads the content for rendering. Re-reads the file only when it changed. */
export async function getServerContent(): Promise<SiteContent | null> {
  try {
    const file = await ensureContentFile();
    await addMissingSeedContent();
    const info = await stat(file);
    if (cache && cache.mtimeMs === info.mtimeMs && cache.size === info.size) {
      return cache.content;
    }
    const content = JSON.parse(await readFile(file, 'utf-8')) as SiteContent;
    cache = { mtimeMs: info.mtimeMs, size: info.size, content };
    return content;
  } catch (error) {
    console.error('Error reading server content:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Upgrading older content files
// ---------------------------------------------------------------------------

/** Adds keys from `seed` that `live` does not have. Existing values, and lists, are left alone. */
function fillMissing(live: unknown, seed: unknown): unknown {
  if (Array.isArray(live) || Array.isArray(seed)) return live ?? seed;
  if (live && typeof live === 'object' && seed && typeof seed === 'object') {
    const target = live as Record<string, unknown>;
    for (const [key, value] of Object.entries(seed as Record<string, unknown>)) {
      target[key] = key in target ? fillMissing(target[key], value) : value;
    }
    return target;
  }
  return live ?? seed;
}

let seedChecked = false;

/**
 * A content file kept on a volume was created by an older version and may lack
 * sections that newer pages edit. Copy any missing sections from the bundled
 * content, once per start, without touching anything that was edited.
 */
async function addMissingSeedContent(): Promise<void> {
  if (seedChecked) return;
  seedChecked = true;
  if (getContentFilePath() === SEED_FILE) return;
  try {
    const seed = JSON.parse(await readFile(SEED_FILE, 'utf-8')) as ContentDocument;
    await updateContent((content) => {
      fillMissing(content, seed);
    });
  } catch (error) {
    console.error('Could not add missing content sections:', error);
  }
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

let writeQueue: Promise<unknown> = Promise.resolve();

async function writeFileAtomically(file: string, data: string): Promise<void> {
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, data, 'utf-8');
  await rename(temp, file);
}

/**
 * Applies a change to the content file. Changes run one at a time so
 * concurrent saves cannot overwrite each other, and the file is replaced
 * atomically so a crash cannot leave it half written. The mutator edits the
 * document in place, or returns a new document to replace it entirely. If it
 * throws, nothing is written.
 */
export function updateContent(
  mutator: (content: ContentDocument) => ContentDocument | void | Promise<ContentDocument | void>
): Promise<void> {
  const run = writeQueue.then(async () => {
    const file = await ensureContentFile();
    const current = JSON.parse(await readFile(file, 'utf-8')) as ContentDocument;
    const next = (await mutator(current)) ?? current;
    await writeFileAtomically(file, JSON.stringify(next, null, 2));
    cache = null;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** Thrown for malformed or unsafe paths so routes can answer with a 400. */
export class ContentPathError extends Error {}

const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Splits "news.articles[0].title" or "news.articles.0.title" into segments,
 * rejecting anything that could reach Object.prototype.
 */
export function parseContentPath(input: unknown): string[] {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new ContentPathError('A content path is required');
  }
  const segments = input.replace(/\[(\d+)\]/g, '.$1').split('.');
  for (const segment of segments) {
    if (segment === '') throw new ContentPathError(`Invalid content path: ${input}`);
    if (FORBIDDEN_SEGMENTS.has(segment)) {
      throw new ContentPathError(`Forbidden path segment: ${segment}`);
    }
  }
  return segments;
}

type Container = Record<string, unknown> | unknown[];

function isContainer(value: unknown): value is Container {
  return typeof value === 'object' && value !== null;
}

function isIndex(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function readChild(container: Container, key: string): unknown {
  return Array.isArray(container)
    ? container[Number(key)]
    : (container as Record<string, unknown>)[key];
}

function writeChild(container: Container, key: string, value: unknown): void {
  if (Array.isArray(container)) {
    if (!isIndex(key)) {
      throw new ContentPathError(`Expected an array index but got "${key}"`);
    }
    const index = Number(key);
    // Allow replacing an item or appending, but never creating huge sparse arrays.
    if (index > container.length) {
      throw new ContentPathError(`Index ${index} is out of range`);
    }
    container[index] = value;
  } else {
    (container as Record<string, unknown>)[key] = value;
  }
}

/** Reads a value, returning undefined when any part of the path is missing. */
export function getAtPath(root: ContentDocument, segments: string[]): unknown {
  let current: unknown = root;
  for (const segment of segments) {
    if (!isContainer(current)) return undefined;
    current = readChild(current, segment);
  }
  return current;
}

/**
 * Walks to the container that holds the last segment, creating missing
 * objects (or arrays, when the next segment is an index) along the way.
 */
function walkToParent(root: ContentDocument, segments: string[]): Container {
  let current: Container = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    let next = readChild(current, key);
    if (next === undefined || next === null) {
      next = isIndex(segments[i + 1]) ? [] : {};
      writeChild(current, key, next);
    }
    if (!isContainer(next)) {
      throw new ContentPathError(
        `Cannot traverse into a ${typeof next} value at ${segments.slice(0, i + 1).join('.')}`
      );
    }
    current = next;
  }
  return current;
}

/** Sets the value at a path. */
export function setAtPath(root: ContentDocument, segments: string[], value: unknown): void {
  writeChild(walkToParent(root, segments), segments[segments.length - 1], value);
}

/**
 * Adds an item: pushes onto an array, or merges the item's fields into an
 * object. Missing parts of the path are created as objects.
 */
export function addAtPath(root: ContentDocument, segments: string[], item: unknown): void {
  const parent = walkToParent(root, segments);
  const key = segments[segments.length - 1];
  let target = readChild(parent, key);
  if (target === undefined || target === null) {
    target = {};
    writeChild(parent, key, target);
  }
  if (Array.isArray(target)) {
    target.push(item);
    return;
  }
  if (!isContainer(target) || !isContainer(item) || Array.isArray(item)) {
    throw new ContentPathError(`Cannot add this item at ${segments.join('.')}`);
  }
  for (const [field, fieldValue] of Object.entries(item)) {
    if (FORBIDDEN_SEGMENTS.has(field)) continue;
    (target as Record<string, unknown>)[field] = fieldValue;
  }
}

/**
 * Deletes a section, or when itemId is given, the entries of the array at that
 * path whose id or name matches. Returns false when the path does not exist.
 */
export function removeAtPath(root: ContentDocument, segments: string[], itemId?: string): boolean {
  const parent = segments.length > 1 ? getAtPath(root, segments.slice(0, -1)) : root;
  if (!isContainer(parent)) return false;

  const key = segments[segments.length - 1];
  const target = readChild(parent, key);

  if (itemId && Array.isArray(target)) {
    const remaining = target.filter((entry) => {
      const item = entry as { id?: unknown; name?: unknown } | null;
      return item?.id !== itemId && item?.name !== itemId;
    });
    writeChild(parent, key, remaining);
    return true;
  }

  if (target === undefined) return false;
  if (Array.isArray(parent)) {
    parent.splice(Number(key), 1);
  } else {
    delete (parent as Record<string, unknown>)[key];
  }
  return true;
}

/**
 * Applies one edit from the inline editor. Text fields that already carry a
 * style are stored as { value, style }; updating the text keeps that style.
 * Returns false (and changes nothing) when the path runs into a plain value.
 */
export function applyContentChange(root: ContentDocument, jsonPath: string, value: unknown): boolean {
  const segments = parseContentPath(jsonPath);

  // A style for a field that holds a plain value (a string, say) is kept in a
  // separate `_styles` map, so the field itself keeps its shape.
  if (segments.length >= 2 && segments[segments.length - 1] === 'style') {
    const ownerPath = segments.slice(0, -1);
    try {
      const ownerParent = walkToParent(root, ownerPath);
      const owner = readChild(ownerParent, ownerPath[ownerPath.length - 1]);
      if (!isContainer(owner)) {
        const styles = (isContainer(root._styles) ? root._styles : (root._styles = {})) as Record<string, unknown>;
        const key = ownerPath.join('.');
        const isEmpty = value === null || value === undefined || (typeof value === 'object' && Object.keys(value as object).length === 0);
        if (isEmpty) delete styles[key];
        else styles[key] = value;
        return true;
      }
    } catch (error) {
      if (!(error instanceof ContentPathError)) throw error;
    }
  }

  let parent: Container;
  try {
    parent = walkToParent(root, segments);
  } catch (error) {
    if (error instanceof ContentPathError) {
      console.warn(`Skipping change to ${jsonPath}: ${error.message}`);
      return false;
    }
    throw error;
  }

  const key = segments[segments.length - 1];
  const existing = readChild(parent, key);
  if (key !== 'style' && isContainer(existing) && !Array.isArray(existing) && 'style' in existing) {
    (existing as Record<string, unknown>).value = value;
  } else {
    writeChild(parent, key, value);
  }
  return true;
}
