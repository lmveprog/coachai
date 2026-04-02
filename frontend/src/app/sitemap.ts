import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://coachai.dev";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/challenges`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/leaderboard`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/learn/sql-pour-data-analysts`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/learn/machine-learning-fondamentaux`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/learn/python-pandas-debutant`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}
