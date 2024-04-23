export const FLAG_ZENN_PUBLICATION: unique symbol = Symbol('Zenn Publication');
type FEED_INFO_FLAG = typeof FLAG_ZENN_PUBLICATION;

export type FeedInfo = {
  label: string;
  url: string;
  flags?: FEED_INFO_FLAG[];
};

const createFeedInfoList = (feedInfoTuples: [label: string, url: string, flags?: FEED_INFO_FLAG[]][]) => {
  const feedInfoList: FeedInfo[] = [];

  for (const [label, url, flags] of feedInfoTuples) {
    feedInfoList.push({ label, url, flags });
  }

  return feedInfoList;
};

// フィード情報一覧。アルファベット順
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  // ['企業名・製品名など', 'RSS/AtomフィードのURL'],
  ['OpenAI', 'https://jamesg.blog/openai.xml'],
  ['Zennのトピック「LLM」', 'https://zenn.dev/topics/llm/feed'],
  ['MLQ.ai', 'https://www.mlq.ai/rss/'],
  ['LangChain blog', 'https://blog.langchain.dev/rss/'],
  ['Chip Huyen', 'https://huyenchip.com/feed'],
  ['梶谷健人 / Kent Kajitani - Note', 'https://note.com/kajiken0630/rss'],
  ['LLM - Medium', 'https://medium.com/feed/tag/llm'],
  ['Platinum Data Blog by BrainPad', 'https://blog.brainpad.co.jp/feed'],
  ['LlamaIndex Blog - Medium', 'https://medium.com/feed/llamaindex-blog'],
  ['mah_lab / 西見 公宏 - Note', 'https://note.com/mahlab/rss'],
  ['LLM - Note', 'https://note.com/hashtag/LLM/rss'],
  ['LangChain - Note', 'https://note.com/hashtag/LangChain/rss'],
  ['character.ai', 'https://blog.character.ai/rss/'],
  ['Blog - AutoGPT Official', 'https://autogpt.net/blog/feed/'],
  ['Hugging Face - Blog', 'https://huggingface.co/blog/feed.xml'],
  ['RevComm Tech Blog', 'https://tech.revcomm.co.jp/feed'],
  ["Writer's·Room·|·AI·blog", 'https://writer.com/blog/feed/'],
  ['にょす - Note', 'https://note.com/nyosubro/rss'],
  ['Stories by Cassie Kozyrkov on Medium', 'https://kozyrkov.medium.com/feed'],
  ['Stories by Assaf Elovic on Medium', 'https://medium.com/feed/@assafelovic'],
  ['Stories by Cobus Greyling on Medium', 'https://medium.com/feed/@cobusgreyling'],
  ['Algomatic Tech Blog', 'https://tech.algomatic.jp/feed'],
  ['株式会社エクスプラザ（公式）', 'https://note.com/explaza_inc/rss'],
  ['LLM Agent - Medium', 'https://medium.com/feed/tag/llm-agent'],
  ['The latest on AI | Sequoia Capital', 'https://www.sequoiacap.com/article/tag/ai/feed'],
  ['Microsoft Research', 'https://www.microsoft.com/en-us/research/blog/feed/'],
  ['The Gradient', 'https://thegradient.pub/rss/'],
]);
