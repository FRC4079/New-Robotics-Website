'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/icons/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { PERMISSION_AREAS } from '@/utils/permissions';
import ui from './ui.module.scss';
import styles from './dashboard.module.scss';

export default function AdminDashboard() {
  const { user, isSuperAdmin, canEdit } = useAuth();
  const { enableEditMode } = useEditMode();
  if (!user) return null;

  const areas = isSuperAdmin
    ? 'Everything on the site'
    : PERMISSION_AREAS.filter((a) => user.permissions.includes(a.key))
        .map((a) => a.label)
        .join(', ') || 'Nothing yet';

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <p>You can edit: {areas}</p>
        </div>
      </header>

      <div className={styles.tiles}>
        <Link href="/" className={styles.tile} onClick={enableEditMode}>
          <Icon name="pencil" size={26} />
          <strong>Edit pages</strong>
          <span>Open the website and change text, images and icons right where they appear.</span>
        </Link>

        {canEdit('news') && (
          <Link href="/admin/news" className={styles.tile}>
            <Icon name="megaphone" size={26} />
            <strong>News and newsletters</strong>
            <span>Write articles, attach a newsletter link, save drafts and publish.</span>
          </Link>
        )}

        {isSuperAdmin && (
          <Link href="/admin/users" className={styles.tile}>
            <Icon name="users" size={26} />
            <strong>Accounts</strong>
            <span>Create accounts for team members and choose which pages each can edit.</span>
          </Link>
        )}

        {!isSuperAdmin && (
          <Link href="/admin/account" className={styles.tile}>
            <Icon name="settings" size={26} />
            <strong>My password</strong>
            <span>Change the password you sign in with.</span>
          </Link>
        )}
      </div>
    </div>
  );
}
