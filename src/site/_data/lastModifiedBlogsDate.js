const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async () => {
  const feedData = JSON.parse(await fs.readFile(path.join(__dirname, '../feeds/feed.json')));

  return new Date(feedData.items[0].date_published).toISOString();
};
