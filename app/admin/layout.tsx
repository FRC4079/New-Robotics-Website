'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/icons/Icon';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/public/logos/OARoboticsLogo_24-25.webp';
import styles from './layout.module.scss';

type NavItem = { href: string; label: string; icon: string; show: boolean };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isSuperAdmin, canEdit, logout } = useAuth();

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!isLogin && !isLoading && !user) router.replace('/admin/login');
  }, [isLogin, isLoading, user, router]);

  if (isLogin) return <>{children}</>;

  if (isLoading || !user) {
    return <div className={styles.loading}>Loading…</div>;
  }

  const items: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: 'home', show: true },
    { href: '/admin/news', label: 'News', icon: 'megaphone', show: canEdit('news') },
    { href: '/admin/users', label: 'Accounts', icon: 'users', show: isSuperAdmin },
    { href: '/admin/account', label: 'My password', icon: 'settings', show: !isSuperAdmin },
    { href: '/', label: 'View website', icon: 'compass', show: true },
  ];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <Image src={logo} alt="" width={36} height={36} />
          <span>OA Robotics</span>
        </Link>

        <nav className={styles.nav} aria-label="Admin">
          {items
            .filter((item) => item.show)
            .map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href) && item.href !== '/';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className={styles.account}>
          <p>
            <strong>{user.displayName}</strong>
            {!isSuperAdmin && 'Editor'}
          </p>
          <button type="button" className={styles.signOut} onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
