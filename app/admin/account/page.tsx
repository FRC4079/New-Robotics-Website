'use client';

import React, { useState } from 'react';
import ui from '../ui.module.scss';

type Status = { kind: 'ok' | 'error'; text: string } | null;

export default function AccountPage() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (next !== confirm) {
      setStatus({ kind: 'error', text: 'The new passwords do not match.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, next }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus({ kind: 'ok', text: 'Password changed.' });
        setCurrent('');
        setNext('');
        setConfirm('');
      } else {
        setStatus({ kind: 'error', text: data.error ?? 'Could not change the password.' });
      }
    } catch {
      setStatus({ kind: 'error', text: 'Could not reach the server.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div>
          <h1>My password</h1>
          <p>Passwords need at least 10 characters.</p>
        </div>
      </header>

      <form className={ui.card} onSubmit={submit}>
        {status && (
          <p className={`${ui.notice} ${status.kind === 'ok' ? ui.noticeOk : ui.noticeError}`} role="status">
            {status.text}
          </p>
        )}
        <div className={ui.field}>
          <label htmlFor="current">Current password</label>
          <input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div className={ui.field}>
          <label htmlFor="next">New password</label>
          <input id="next" type="password" autoComplete="new-password" minLength={10} value={next} onChange={(e) => setNext(e.target.value)} required />
        </div>
        <div className={ui.field}>
          <label htmlFor="confirm">Repeat new password</label>
          <input id="confirm" type="password" autoComplete="new-password" minLength={10} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <div className={ui.actions}>
          <button type="submit" className={ui.button} disabled={busy}>
            {busy ? 'Saving…' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  );
}
