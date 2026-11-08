'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSION_AREAS } from '@/utils/permissions';
import ui from '../ui.module.scss';

type Account = {
  username: string;
  displayName: string;
  permissions: string[];
  disabled?: boolean;
};

type Status = { kind: 'ok' | 'error'; text: string } | null;

type Draft = {
  /** Set when editing an existing account. */
  existing: string | null;
  username: string;
  displayName: string;
  password: string;
  permissions: string[];
};

const emptyDraft: Draft = { existing: null, username: '', displayName: '', password: '', permissions: [] };

async function call(url: string, method: string, body?: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    return data.success ? { ok: true } : { ok: false, error: data.error ?? 'Request failed' };
  } catch {
    return { ok: false, error: 'Could not reach the server.' };
  }
}

export default function UsersPage() {
  const router = useRouter();
  const { isSuperAdmin, isLoading } = useAuth();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/users', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) setAccounts(data.users);
      else setStatus({ kind: 'error', text: data.error ?? 'Could not load accounts.' });
    } catch {
      setStatus({ kind: 'error', text: 'Could not reach the server.' });
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) router.replace('/admin');
    if (isSuperAdmin) void load();
  }, [isLoading, isSuperAdmin, router, load]);

  if (!isSuperAdmin) return null;

  const togglePermission = (key: string) =>
    setDraft((d) =>
      d ? { ...d, permissions: d.permissions.includes(key) ? d.permissions.filter((p) => p !== key) : [...d.permissions, key] } : d
    );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    setStatus(null);

    const result = draft.existing
      ? await call(`/api/users/${encodeURIComponent(draft.existing)}`, 'PATCH', {
          displayName: draft.displayName,
          permissions: draft.permissions,
          ...(draft.password ? { password: draft.password } : {}),
        })
      : await call('/api/users', 'POST', {
          username: draft.username,
          displayName: draft.displayName,
          password: draft.password,
          permissions: draft.permissions,
        });

    setBusy(false);
    if (result.ok) {
      setStatus({ kind: 'ok', text: draft.existing ? 'Account updated.' : 'Account created.' });
      setDraft(null);
      await load();
    } else {
      setStatus({ kind: 'error', text: result.error ?? 'Request failed' });
    }
  };

  const setDisabled = async (account: Account, disabled: boolean) => {
    const result = await call(`/api/users/${encodeURIComponent(account.username)}`, 'PATCH', { disabled });
    setStatus(result.ok ? { kind: 'ok', text: `${account.displayName} ${disabled ? 'can no longer sign in.' : 'can sign in again.'}` } : { kind: 'error', text: result.error ?? 'Request failed' });
    await load();
  };

  const remove = async (account: Account) => {
    const result = await call(`/api/users/${encodeURIComponent(account.username)}`, 'DELETE');
    setPendingDelete(null);
    setStatus(result.ok ? { kind: 'ok', text: `Deleted ${account.displayName}.` } : { kind: 'error', text: result.error ?? 'Request failed' });
    await load();
  };

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div>
          <h1>Accounts</h1>
          <p>Give team members their own login and choose which parts of the site they can edit.</p>
        </div>
        {!draft && (
          <button type="button" className={ui.button} onClick={() => setDraft({ ...emptyDraft })}>
            New account
          </button>
        )}
      </header>

      {status && (
        <p className={`${ui.notice} ${status.kind === 'ok' ? ui.noticeOk : ui.noticeError}`} role="status">
          {status.text}
        </p>
      )}

      {draft && (
        <form className={ui.card} onSubmit={save}>
          <h2>{draft.existing ? `Edit ${draft.existing}` : 'New account'}</h2>
          <div className={ui.fieldGrid}>
            <div className={ui.field}>
              <label htmlFor="displayName">Name</label>
              <input id="displayName" type="text" value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} />
            </div>
            {!draft.existing && (
              <div className={ui.field}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  value={draft.username}
                  onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase() })}
                  required
                />
                <small>3 to 32 letters, numbers, dots, dashes or underscores.</small>
              </div>
            )}
          </div>
          <div className={ui.field}>
            <label htmlFor="password">{draft.existing ? 'New password (leave empty to keep the current one)' : 'Password'}</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={draft.existing && !draft.password ? undefined : 10}
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              required={!draft.existing}
            />
            <small>At least 10 characters. Share it privately; they can change it after signing in.</small>
          </div>

          <fieldset className={ui.checkGrid}>
            <legend className={ui.legend}>Can edit</legend>
            {PERMISSION_AREAS.map((area) => (
              <label key={area.key} className={ui.checkRow}>
                <input type="checkbox" checked={draft.permissions.includes(area.key)} onChange={() => togglePermission(area.key)} />
                <span>
                  {area.label}
                  <small>{area.description}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <div className={ui.actions}>
            <button type="submit" className={ui.button} disabled={busy}>
              {busy ? 'Saving…' : draft.existing ? 'Save changes' : 'Create account'}
            </button>
            <button type="button" className={ui.buttonQuiet} onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {accounts === null ? (
        <p className={ui.empty}>Loading…</p>
      ) : accounts.length === 0 ? (
        <p className={ui.empty}>No team accounts yet. Create one to let someone edit pages without your password.</p>
      ) : (
        <ul className={ui.list}>
          {accounts.map((account) => (
            <li key={account.username} className={ui.row}>
              <div className={ui.rowMain}>
                <strong>
                  {account.displayName} {account.disabled && <span className={`${ui.badge} ${ui.badgeOff}`}>Disabled</span>}
                </strong>
                <span>
                  {account.username} ·{' '}
                  {account.permissions.length === 0
                    ? 'No access yet'
                    : PERMISSION_AREAS.filter((a) => account.permissions.includes(a.key))
                        .map((a) => a.label)
                        .join(', ')}
                </span>
              </div>
              <div className={ui.rowActions}>
                {pendingDelete === account.username ? (
                  <>
                    <button type="button" className={ui.buttonDanger} onClick={() => void remove(account)}>
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
                      className={ui.buttonQuiet}
                      onClick={() =>
                        setDraft({ existing: account.username, username: account.username, displayName: account.displayName, password: '', permissions: account.permissions })
                      }
                    >
                      Edit
                    </button>
                    <button type="button" className={ui.buttonQuiet} onClick={() => void setDisabled(account, !account.disabled)}>
                      {account.disabled ? 'Enable' : 'Disable'}
                    </button>
                    <button type="button" className={ui.buttonDanger} onClick={() => setPendingDelete(account.username)}>
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
