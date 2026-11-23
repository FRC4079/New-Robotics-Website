"use client";
import React from 'react';
import Navbar from '@/app/_components/navbar/navbar';
import Footer from '@/app/_components/footer/footer';
import Title from '@/app/_components/title/title';
import EditableText from '@/components/editable/EditableText';
import CustomSections from '@/components/sections/CustomSections';
import { useContent } from '@/hooks/useContent';
import styles from './CustomPageView.module.scss';

interface CustomPageViewProps {
  slug: string;
}

export default function CustomPageView({ slug }: CustomPageViewProps): React.ReactElement | null {
  const { content } = useContent();
  const page = content?.customPages?.[slug];

  if (!page) return null;

  const basePath = `customPages.${slug}`;
  const themeStyle = {
    ...(page.theme?.accentColor ? { '--accent': page.theme.accentColor } : {}),
    ...(page.theme?.backgroundTint ? { '--bg': page.theme.backgroundTint } : {}),
  } as React.CSSProperties;

  return (
    <div className={styles.customPage} style={themeStyle}>
      <Navbar isFixed={true} />

      {page.heroStyle === 'minimal' ? (
        <header className={styles.minimalHero}>
          {page.published === false && (
            <div className={styles.draftBanner}>Draft page — visible only to editors</div>
          )}
          <div className={styles.minimalInner}>
            <EditableText
              value={page.hero?.title || page.title}
              path={`${basePath}.hero.title`}
              as="h1"
            />
            <EditableText
              value={page.hero?.subtitle || page.description || ''}
              path={`${basePath}.hero.subtitle`}
              as="p"
              multiline
              className={styles.minimalSubtitle}
            />
          </div>
        </header>
      ) : (
        <>
          {page.published === false && (
            <div className={styles.draftBanner} style={{ paddingTop: 'calc(var(--nav-height) + 0.5rem)' }}>
              Draft page — visible only to editors
            </div>
          )}
          <Title
            title={page.hero?.title || page.title}
            description={page.hero?.subtitle || page.description || ''}
            heroPath={`${basePath}.hero`}
          />
        </>
      )}

      <CustomSections
        customPath={`${basePath}.sections`}
        allowPlacementToggle={false}
        addLabel="Add Section to This Page"
      />

      <Footer />
    </div>
  );
}
