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
