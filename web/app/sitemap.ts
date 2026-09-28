import type { MetadataRoute } from "next";
import { SITE } from "@/content/lab";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;
  const routes = [
    "",
    "/lab",
    "/reflex",
    "/reflex/research",
    "/reflex/docs",
    "/harness",
    "/indic",
    "/indic/models",
    "/indic/chat",
    "/indic/about",
    "/blog",
    "/blog/gargi-m1-is-out",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
