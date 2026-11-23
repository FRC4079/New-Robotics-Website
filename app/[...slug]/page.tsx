import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomPageView from '@/app/_components/customPage/CustomPageView';
import { getVisibleContent } from '@/utils/visibleContent';

export const dynamic = 'force-dynamic';

type PageParams = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const slugKey = slug.join('/').toLowerCase();
  const content = await getVisibleContent();
  const page = content?.customPages?.[slugKey];

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: `${page.title} - ${content?.site?.title || 'OA Robotics'}`,
    description: page.description || page.hero?.subtitle || content?.site?.description,
  };
}

export default async function DynamicCustomPage({ params }: PageParams) {
  const { slug } = await params;
  const slugKey = slug.join('/').toLowerCase();
  const content = await getVisibleContent();
  const page = content?.customPages?.[slugKey];

  if (!page) {
    notFound();
  }

  return <CustomPageView slug={slugKey} />;
}
