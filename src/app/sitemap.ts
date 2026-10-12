import type { MetadataRoute } from "next";

const routes = [
  "",
  "about",
  "mission",
  "leadership",
  "news",
  "events",
  "banner-generator",
  "faqs",
  "contact",
  "privacy",
  "terms",
  "ha",
  "ha/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `/${route}`,
    changeFrequency: route === "news" || route === "events" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "about" || route === "mission" ? 0.8 : 0.6,
  }));
}
