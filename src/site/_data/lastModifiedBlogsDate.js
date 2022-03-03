const fs = require('fs/promises');
const path = require('path');

module.exports = async () => {
  const feedData = JSON.parse(await fs.readFile(path.join(__dirname, '../feeds/feed.json')));

  return new Date(feedData.items[0].date_published).toISOString();
};
