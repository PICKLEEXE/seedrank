export const DEMO_KEYWORDS = [
  { keyword: "ai seo tools", volume: 2400, difficulty: 45, position: null },
  { keyword: "content automation", volume: 1200, difficulty: 38, position: 15 },
  { keyword: "seo autopilot", volume: 880, difficulty: 52, position: null },
  { keyword: "rankroot alternative", volume: 320, difficulty: 28, position: 7 },
  { keyword: "blog automation software", volume: 1600, difficulty: 41, position: 23 },
];

export const DEMO_ARTICLES = [
  {
    id: "demo-1",
    title: "Complete Guide to AI SEO Tools in 2026",
    status: "published",
    seoScore: 87,
    targetKeywords: ["ai seo tools", "content automation"],
    publishedAt: new Date("2026-03-15"),
    createdAt: new Date("2026-03-14"),
  },
  {
    id: "demo-2",
    title: "How to Automate Your Content Strategy",
    status: "approved",
    seoScore: 79,
    targetKeywords: ["content automation", "blog automation software"],
    publishedAt: null,
    createdAt: new Date("2026-03-20"),
  },
  {
    id: "demo-3",
    title: "Top 10 SEO Autopilot Solutions Compared",
    status: "draft",
    seoScore: 65,
    targetKeywords: ["seo autopilot"],
    publishedAt: null,
    createdAt: new Date("2026-04-01"),
  },
];

export const DEMO_BACKLINKS = [
  { sourceUrl: "https://techcrunch.com/article/ai-tools", targetUrl: "/", status: "active" },
  { sourceUrl: "https://searchenginejournal.com/seo-tools", targetUrl: "/features", status: "active" },
  { sourceUrl: "https://moz.com/blog/automation", targetUrl: "/blog", status: "lost" },
];

export const DEMO_STATS = {
  articlesGenerated: 3,
  organicTraffic: 1240,
  blogs: 1,
  activeSites: 1,
};

export const DEMO_LINKEDIN_POSTS = [
  {
    id: "li-1",
    content: "Most founders burn 6 months writing blog posts nobody reads.\n\nThe problem is not effort. The problem is that they pick keywords based on gut feeling instead of search data.\n\nHere is what changed our organic traffic overnight:\n\n1. We analyzed 200+ keywords for search volume and difficulty\n2. We targeted long tail phrases with low competition\n3. We let AI draft the first version and then refined it with real expertise\n\nResult: 340% increase in organic impressions in 8 weeks.\n\nStop guessing. Start measuring.",
    hook: "Most founders burn 6 months writing blog posts nobody reads.",
    cta: "Comment 'SEO' and I will send you our keyword research template.",
    hashtags: ["SEO", "ContentMarketing", "StartupGrowth", "AI"],
    status: "published",
    scheduledFor: new Date("2026-09-28T09:00:00"),
    publishedAt: new Date("2026-09-28T09:00:00"),
    impressions: 12840,
    likes: 287,
    comments: 94,
    shares: 41,
    clicks: 438,
    createdAt: new Date("2026-09-27"),
  },
  {
    id: "li-2",
    content: "I automated our entire content pipeline in one weekend.\n\nBefore: 12 hours per blog post, from keyword research to publishing.\nAfter: 45 minutes of review. The rest is handled by AI.\n\nThe key was building a system, not just using a tool.\n\nOur workflow now:\n\n1. AI scans Google Search Console for keyword gaps\n2. It generates a draft optimized for those exact terms\n3. We review, refine, and publish directly to WordPress\n4. It repurposes the article into LinkedIn and Twitter posts\n\nWe went from 2 posts per month to 12.\n\nSame team. Same budget. 6x the output.",
    hook: "I automated our entire content pipeline in one weekend.",
    cta: "Follow for more on AI content strategy.",
    hashtags: ["ContentAutomation", "AI", "GrowthHacking", "MarketingTips"],
    status: "published",
    scheduledFor: new Date("2026-10-01T10:30:00"),
    publishedAt: new Date("2026-10-01T10:30:00"),
    impressions: 8920,
    likes: 198,
    comments: 56,
    shares: 29,
    clicks: 312,
    createdAt: new Date("2026-09-30"),
  },
  {
    id: "li-3",
    content: "Your competitors are publishing 10x more content than you.\n\nBut here is the thing: quantity without strategy is noise.\n\nThe winning formula is simple:\n\n1. Find keywords your audience actually searches for\n2. Create content that answers their questions better than page one results\n3. Distribute it across every channel your audience uses\n\nWe built RankRoot to do exactly this. One platform that handles research, writing, publishing, and distribution.\n\nThe future of SEO is not about working harder. It is about building smarter systems.",
    hook: "Your competitors are publishing 10x more content than you.",
    cta: "Agree? Share this with someone who needs to hear it.",
    hashtags: ["SEO", "ContentStrategy", "DigitalMarketing", "SaaS"],
    status: "scheduled",
    scheduledFor: new Date("2026-10-07T09:00:00"),
    publishedAt: null,
    impressions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
    createdAt: new Date("2026-10-03"),
  },
  {
    id: "li-4",
    content: "We analyzed 500 LinkedIn posts from B2B SaaS founders.\n\nThe ones that performed best all shared three traits:\n\n1. They opened with a bold, specific claim (not a generic question)\n2. They used short paragraphs with white space between every line\n3. They ended with a clear call to action, not a vague 'thoughts?'\n\nThe average engagement rate for posts following this structure was 4.2%.\n\nFor posts that did not: 0.8%.\n\nStructure matters more than genius.",
    hook: "We analyzed 500 LinkedIn posts from B2B SaaS founders.",
    cta: "Save this for your next LinkedIn post.",
    hashtags: ["LinkedIn", "B2BSaaS", "ContentTips", "PersonalBranding"],
    status: "draft",
    scheduledFor: null,
    publishedAt: null,
    impressions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
    createdAt: new Date("2026-10-04"),
  },
];

export async function mockGenerateLinkedInPost(articleTitle: string, articleContent: string) {
  await sleep(2000);

  const hooks = [
    `Most people get ${articleTitle.split(" ")[0].toLowerCase()} wrong.`,
    `I spent 3 months studying this. Here is what I found.`,
    `Stop doing this if you want organic traffic.`,
    `This one change doubled our results.`,
  ];

  const ctas = [
    "Follow for more insights like this.",
    "Comment 'YES' if you want the full breakdown.",
    "Share this with a founder who needs to hear it.",
    "Save this post. You will need it later.",
  ];

  const hook = hooks[randomInt(0, hooks.length - 1)];
  const cta = ctas[randomInt(0, ctas.length - 1)];

  const body = `${hook}\n\nHere is what we learned from ${articleTitle}:\n\n1. The biggest mistake is ignoring search intent when creating content\n2. Long tail keywords convert 2.5x better than head terms\n3. Consistency beats perfection every single time\n\nWe tested this across 50 client sites and the results were clear.\n\nThe companies that published weekly with a data backed strategy grew 3x faster than those posting randomly.\n\n${cta}`;

  return {
    content: body,
    hook,
    cta,
    hashtags: ["SEO", "ContentMarketing", "GrowthStrategy", "AI"],
    status: "draft",
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateLoremHTML(words: number) {
  const lorem =
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat";
  const wordArray = lorem.split(" ");
  let result = "<h2>Introduction</h2><p>";
  for (let i = 0; i < words; i++) {
    result += wordArray[i % wordArray.length] + " ";
    if (i > 0 && i % 80 === 0) result += "</p><h2>Section " + Math.ceil(i / 80) + "</h2><p>";
  }
  result += "</p>";
  return result;
}

export async function mockGenerateArticle(keywords: string[]) {
  await sleep(3000);
  return {
    title: `Ultimate Guide to ${keywords[0] || "SEO"} in 2026`,
    content: generateLoremHTML(600),
    seoScore: randomInt(70, 95),
    status: "draft",
    targetKeywords: keywords,
  };
}
