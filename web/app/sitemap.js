import { allNames, categories, SITE_URL } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap() {
  const pages = ['', 'icons/', 'categories/', 'docs/', 'roadmap/'].map(p => ({ url: `${SITE_URL}/${p}`, changeFrequency: 'weekly', priority: p ? 0.8 : 1 }));
  const cats = categories().map(c => ({ url: `${SITE_URL}/categories/${c.id}/`, changeFrequency: 'weekly', priority: 0.7 }));
  const icons = allNames().map(n => ({ url: `${SITE_URL}/icons/${n}/`, changeFrequency: 'monthly', priority: 0.5 }));
  return [...pages, ...cats, ...icons];
}
