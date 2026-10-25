import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postDate(d: Date, style: 'short' | 'long' = 'short'): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    ...(style === 'long' ? { day: 'numeric' } : {}),
    year: 'numeric',
    timeZone: 'UTC',
  });
}
