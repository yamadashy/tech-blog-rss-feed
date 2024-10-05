export default async () => {
  const feedDataModule = await import('../feeds/feed.json');
  const feedData = feedDataModule.default;

  return new Date(feedData.items[0].date_published).toISOString();
};
