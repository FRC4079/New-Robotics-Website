import { getSessionUser } from '@/utils/auth';
import { getServerContent } from '@/utils/contentStore';
import { canEditPath } from '@/utils/permissions';
import type { SiteContent } from '@/utils/content';

/**
 * Site content as the current visitor is allowed to see it. Draft articles
 * are only sent to accounts that can edit the news, so they never reach the
 * public page, the content API or the browser.
 */
export async function getVisibleContent(): Promise<SiteContent | null> {
  const content = await getServerContent();
  if (!content?.news?.articles) return content;

  const user = await getSessionUser();
  if (user && canEditPath(user, 'news')) return content;

  return {
    ...content,
    news: {
      ...content.news,
      articles: content.news.articles.filter((article) => article.status !== 'draft'),
    },
  };
}
