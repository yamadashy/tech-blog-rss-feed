import { computeLastModifiedBlogsDate } from './lib/last-modified-blogs-date';

export default async () => {
  const feedDataModule = await import('../feeds/feed.json');
  const feedData = feedDataModule.default;

  return computeLastModifiedBlogsDate(feedData.items);
};
