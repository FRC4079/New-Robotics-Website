'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { SiteContent } from '@/utils/content';

type MutationResult = { success: boolean; error?: string };

interface ContentContextType {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
  updateContent: (section: string, data: unknown) => Promise<MutationResult>;
  addContent: (section: string, item: unknown) => Promise<MutationResult>;
  deleteContent: (section: string, itemId?: string) => Promise<MutationResult>;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

type ContentProviderProps = {
  children: ReactNode;
  /** Content loaded on the server, so the first render already has it. */
  initialContent?: SiteContent | null;
};

export function ContentProvider({ children, initialContent = null }: ContentProviderProps) {
  const [content, setContent] = useState<SiteContent | null>(initialContent);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  // Loads the latest content. Overlapping calls share a single request.
  const refreshContent = useCallback((): Promise<void> => {
    if (inFlight.current) return inFlight.current;

    inFlight.current = (async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await response.json();
        if (data.success) {
          setContent(data.content);
          setError(null);
        } else {
          setError(data.error ?? 'Failed to fetch content');
        }
      } catch (err) {
        setError('Failed to fetch content');
        console.error('Content fetch error:', err);
      } finally {
        inFlight.current = null;
      }
    })();

    return inFlight.current;
  }, []);

  // Only needed when the server could not provide the content.
  useEffect(() => {
    if (initialContent === null) void refreshContent();
  }, [initialContent, refreshContent]);

  // Sends a change to the API and reloads the content when it succeeds.
  const mutate = useCallback(
    async (request: () => Promise<Response>, failure: string): Promise<MutationResult> => {
      try {
        const result = await (await request()).json();
        if (!result.success) return { success: false, error: result.error };
        await refreshContent();
        return { success: true };
      } catch (err) {
        console.error(failure, err);
        return { success: false, error: failure };
      }
    },
    [refreshContent]
  );

  const updateContent = useCallback(
    (section: string, data: unknown) =>
      mutate(
        () =>
          fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section, data }),
          }),
        'Failed to update content'
      ),
    [mutate]
  );

  const addContent = useCallback(
    (section: string, item: unknown) =>
      mutate(
        () =>
          fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section, item }),
          }),
        'Failed to add content'
      ),
    [mutate]
  );

  const deleteContent = useCallback(
    (section: string, itemId?: string) => {
      const query = new URLSearchParams({ section });
      if (itemId) query.set('itemId', itemId);
      return mutate(
        () => fetch(`/api/content?${query.toString()}`, { method: 'DELETE' }),
        'Failed to delete content'
      );
    },
    [mutate]
  );

  const loading = content === null && error === null;

  const value = useMemo(
    () => ({ content, loading, error, updateContent, addContent, deleteContent, refreshContent }),
    [content, loading, error, updateContent, addContent, deleteContent, refreshContent]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
