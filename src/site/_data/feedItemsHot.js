import { dayjs } from './lib/dayjs-setup';
import { computeFeedItemsHot } from './lib/feed-items-hot';

export default async () => {
  const feedDataModule = await import('../feeds/feed.json');
  const feedData = feedDataModule.default;

  return computeFeedItemsHot(feedData.items, dayjs());
};
