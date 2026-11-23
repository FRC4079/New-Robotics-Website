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
  if (!content) return content;

  const user = await getSessionUser();
  let next = content;

  if (content.news?.articles && !(user && canEditPath(user, 'news'))) {
    next = {
      ...next,
      news: {
        ...content.news,
        articles: content.news.articles.filter((article) => article.status !== 'draft'),
      },
    };
  }

  if (content.customPages && !(user && canEditPath(user, 'customPages'))) {
    const visiblePages: NonNullable<SiteContent['customPages']> = {};
    for (const [slug, page] of Object.entries(content.customPages)) {
      if (page && page.published !== false) {
        visiblePages[slug] = page;
      }
    }
    next = {
      ...next,
      customPages: visiblePages,
    };
  }

  return next;
}
