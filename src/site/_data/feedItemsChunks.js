import { dayjs } from './lib/dayjs-setup';
import { computeFeedItemsChunks } from './lib/feed-items-chunks';

export default async () => {
  const feedDataModule = await import('../feeds/feed.json');
  const feedData = feedDataModule.default;

  return computeFeedItemsChunks(feedData.items, dayjs());
};
