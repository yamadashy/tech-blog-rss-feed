import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { FEED_INFO_LIST, type FeedInfo } from '../resources/feed-info-list';

const dirName = url.fileURLToPath(new URL('.', import.meta.url));

const FEED_INFO_LIST_PATH = path.join(dirName, '../resources/feed-info-list.ts');

const LIST_START = 'createFeedInfoList([\n';
const LIST_END = '\n]);';
const EXAMPLE_COMMENT = "  // ['企業名・製品名など', 'RSS/AtomフィードのURL'],";

// Sort by label: numbers first, then latin (case-insensitive), then Japanese.
// The secondary compare keeps the order deterministic when labels differ only in case.
const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });
const compareFeedInfo = (a: FeedInfo, b: FeedInfo): number =>
  collator.compare(a.label, b.label) || a.label.localeCompare(b.label, 'ja');

// Labels may contain single quotes (e.g. Linc'well); fall back to double quotes for those.
const quote = (value: string): string => (value.includes("'") ? `"${value}"` : `'${value}'`);

const source = fs.readFileSync(FEED_INFO_LIST_PATH, 'utf-8');
const startIndex = source.indexOf(LIST_START);
const endIndex = source.indexOf(LIST_END, startIndex);
if (startIndex === -1 || endIndex === -1) {
  throw new Error(`FEED_INFO_LIST array block not found in ${FEED_INFO_LIST_PATH}`);
}

const sortedFeedInfoList = [...FEED_INFO_LIST].sort(compareFeedInfo);
const entryLines = sortedFeedInfoList.map((feedInfo) => `  [${quote(feedInfo.label)}, ${quote(feedInfo.url)}],`);
const listBlock = [EXAMPLE_COMMENT, ...entryLines].join('\n');

fs.writeFileSync(
  FEED_INFO_LIST_PATH,
  source.slice(0, startIndex + LIST_START.length) + listBlock + source.slice(endIndex),
);

console.log(`Sorted ${sortedFeedInfoList.length} feed entries in feed-info-list.ts`);
