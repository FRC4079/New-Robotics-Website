'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ui from '../ui.module.scss';
import styles from './news.module.scss';

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  image?: string;
  tags: string[];
  link?: string;
  linkText?: string;
  status?: 'draft' | 'published';
};

type Status = { kind: 'ok' | 'error'; text: string } | null;

const CATEGORIES = ['Newsletter', 'Competition', 'Achievement', 'Event', 'General'];

const today = () => new Date().toISOString().slice(0, 10);

function blankArticle(author: string): Article {
  return {
    id: String(Date.now()),
    title: '',
    excerpt: '',
    content: '',
    author,
    publishDate: today(),
    category: 'Newsletter',
    image: '',
    tags: [],
    link: '',
    linkText: 'Read the newsletter',
    status: 'draft',
  };
}

const byNewest = (a: Article, b: Article) => b.publishDate.localeCompare(a.publishDate);

async function loadArticles(): Promise<Article[]> {
  const response = await fetch('/api/content', { cache: 'no-store' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error ?? 'Could not load the articles.');
  return data.content?.news?.articles ?? [];
}

async function saveArticles(articles: Article[]): Promise<void> {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section: 'news.articles', data: articles }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error ?? 'Could not save.');
}

export default function NewsManager() {
  const router = useRouter();
  const { user, isLoading, canEdit } = useAuth();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [draft, setDraft] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tagText, setTagText] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const allowed = canEdit('news');

  const refresh = useCallback(async () => {
    try {
      setArticles((await loadArticles()).slice().sort(byNewest));
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error ? error.message : 'Could not load the articles.' });
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!allowed) router.replace('/admin');
    else void refresh();
  }, [isLoading, allowed, router, refresh]);

  if (!allowed || !user) return null;

  const open = (article: Article, fresh: boolean) => {
    setDraft({ ...article });
    setTagText(article.tags.join(', '));
    setIsNew(fresh);
    setStatus(null);
  };

  const patch = (changes: Partial<Article>) => setDraft((d) => (d ? { ...d, ...changes } : d));

  // Every change starts from the latest saved list, so two people editing at
  // once do not overwrite each other's articles.
  const commit = async (change: (list: Article[]) => Article[], done: string): Promise<boolean> => {
    setBusy(true);
    setStatus(null);
    try {
      const fresh = await loadArticles();
      const next = change(fresh);
      await saveArticles(next);
      setArticles(next.slice().sort(byNewest));
      setStatus({ kind: 'ok', text: done });
      return true;
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error ? error.message : 'Could not save.' });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async (publish: boolean | null) => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setStatus({ kind: 'error', text: 'Give the article a title first.' });
      return;
    }
    const link = (draft.link ?? '').trim();
    if (link && !/^(https?:\/\/|\/)/i.test(link)) {
      setStatus({ kind: 'error', text: 'The link must start with https:// (or / for a page on this site).' });
      return;
    }

    const finished: Article = {
      ...draft,
      title: draft.title.trim(),
      link,
      tags: tagText.split(',').map((t) => t.trim()).filter(Boolean),
      status: publish === null ? draft.status ?? 'published' : publish ? 'published' : 'draft',
    };

    const label = finished.status === 'published' ? 'Published.' : 'Saved as a draft.';
    const ok = await commit(
      (list) => {
        const index = list.findIndex((a) => a.id === finished.id);
        if (index === -1) return [...list, finished];
        const copy = list.slice();
        copy[index] = finished;
        return copy;
      },
      label
    );
    if (ok) setDraft(null);
  };

  const remove = async (article: Article) => {
    setPendingDelete(null);
    await commit((list) => list.filter((a) => a.id !== article.id), `Deleted "${article.title}".`);
  };

  const togglePublished = async (article: Article) => {
    const publish = article.status === 'draft';
    await commit(
      (list) => list.map((a) => (a.id === article.id ? { ...a, status: publish ? 'published' : 'draft' } : a)),
      publish ? 'Published.' : 'Moved back to drafts.'
    );
  };

  const upload = async (file: File) => {
    setUploading(true);
    setStatus(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('category', 'images');
      form.append('subcategory', 'articles');
      const response = await fetch('/api/media', { method: 'POST', body: form });
      const data = await response.json();
      if (data.success) patch({ image: data.filePath });
      else setStatus({ kind: 'error', text: data.error ?? 'Upload failed.' });
    } catch {
      setStatus({ kind: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div>
          <h1>News and newsletters</h1>
          <p>Drafts stay hidden from visitors until you publish them.</p>
        </div>
        {!draft && (
          <button type="button" className={ui.button} onClick={() => open(blankArticle(user.displayName), true)}>
            New article
          </button>
        )}
      </header>

      {status && (
        <p className={`${ui.notice} ${status.kind === 'ok' ? ui.noticeOk : ui.noticeError}`} role="status">
          {status.text}
        </p>
      )}

      {draft && (
        <form
          className={ui.card}
          onSubmit={(e) => {
            e.preventDefault();
            void save(null);
          }}
        >
          <h2>{isNew ? 'New article' : 'Edit article'}</h2>

          <div className={ui.field}>
            <label htmlFor="title">Title</label>
            <input id="title" type="text" value={draft.title} onChange={(e) => patch({ title: e.target.value })} required />
          </div>

          <div className={ui.fieldGrid}>
            <div className={ui.field}>
              <label htmlFor="category">Type</label>
              <select id="category" value={draft.category} onChange={(e) => patch({ category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className={ui.field}>
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={draft.publishDate} onChange={(e) => patch({ publishDate: e.target.value })} required />
            </div>
            <div className={ui.field}>
              <label htmlFor="author">Author</label>
              <input id="author" type="text" value={draft.author} onChange={(e) => patch({ author: e.target.value })} />
            </div>
            <div className={ui.field}>
              <label htmlFor="tags">Tags</label>
              <input id="tags" type="text" value={tagText} onChange={(e) => setTagText(e.target.value)} />
              <small>Separate with commas, for example FRC, Outreach.</small>
            </div>
          </div>

          <div className={ui.field}>
            <label htmlFor="excerpt">Summary</label>
            <textarea id="excerpt" rows={2} value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} />
            <small>Shown on the news cards. One or two sentences.</small>
          </div>

          <div className={ui.field}>
            <label htmlFor="content">Article text</label>
            <textarea id="content" rows={10} value={draft.content} onChange={(e) => patch({ content: e.target.value })} />
            <small>Leave a blank line between paragraphs.</small>
          </div>

          <div className={ui.field}>
            <label htmlFor="link">Newsletter or external link (optional)</label>
            <input id="link" type="url" inputMode="url" value={draft.link ?? ''} onChange={(e) => patch({ link: e.target.value })} />
            <small>For a newsletter hosted elsewhere, such as an Issuu or Google Drive PDF link.</small>
          </div>

          <div className={ui.field}>
            <label htmlFor="linkText">Link button text</label>
            <input id="linkText" type="text" value={draft.linkText ?? ''} onChange={(e) => patch({ linkText: e.target.value })} />
          </div>

          <div className={ui.field}>
            <label htmlFor="imageFile">Cover image</label>
            {draft.image && (
              // eslint-disable-next-line @next/next/no-img-element -- previewing an arbitrary saved URL
              <img src={draft.image} alt="" className={styles.preview} />
            )}
            <input
              ref={fileInput}
              id="imageFile"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            {draft.image && (
              <button type="button" className={ui.buttonQuiet} onClick={() => patch({ image: '' })}>
                Remove image
              </button>
            )}
          </div>

          <div className={ui.actions}>
            <button type="button" className={ui.button} disabled={busy || uploading} onClick={() => void save(true)}>
              {busy ? 'Saving…' : 'Publish'}
            </button>
            <button type="button" className={ui.buttonQuiet} disabled={busy || uploading} onClick={() => void save(false)}>
              Save as draft
            </button>
            <button type="button" className={ui.buttonQuiet} onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {articles === null ? (
        <p className={ui.empty}>Loading…</p>
      ) : articles.length === 0 ? (
        <p className={ui.empty}>Nothing here yet. Use “New article” to post your first update or newsletter.</p>
      ) : (
        <ul className={ui.list}>
          {articles.map((article) => (
            <li key={article.id} className={ui.row}>
              <div className={ui.rowMain}>
                <strong>{article.title || 'Untitled'}</strong>
                <span>
                  <span className={`${ui.badge} ${article.status === 'draft' ? ui.badgeDraft : ui.badgeLive}`}>
                    {article.status === 'draft' ? 'Draft' : 'Live'}
                  </span>{' '}
                  {article.category} · {article.publishDate}
                </span>
              </div>
              <div className={ui.rowActions}>
                {pendingDelete === article.id ? (
                  <>
                    <button type="button" className={ui.buttonDanger} onClick={() => void remove(article)}>
                      Confirm delete
                    </button>
                    <button type="button" className={ui.buttonQuiet} onClick={() => setPendingDelete(null)}>
                      Keep
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className={ui.buttonQuiet} onClick={() => open(article, false)}>
                      Edit
                    </button>
                    <button type="button" className={ui.buttonQuiet} disabled={busy} onClick={() => void togglePublished(article)}>
                      {article.status === 'draft' ? 'Publish' : 'Unpublish'}
                    </button>
                    <button type="button" className={ui.buttonDanger} onClick={() => setPendingDelete(article.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
