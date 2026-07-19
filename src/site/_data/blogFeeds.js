import { decorateBlogFeeds } from './lib/blog-feeds';
import { dayjs } from './lib/dayjs-setup';

export default async () => {
  const blogFeedsModule = await import('../blog-feeds/blog-feeds.json');
  const blogFeeds = blogFeedsModule.default;

  return decorateBlogFeeds(blogFeeds, dayjs());
};
