import type { MetadataRoute } from "next";
import { SITE } from "@/content/lab";

/** Every public route. /admin and /api/* are deliberately left out. */
const ROUTES = [
  "/",
  "/lab",
  "/reflex",
  "/reflex/research",
  "/reflex/docs",
  "/harness",
  "/indic",
  "/indic/models",
  "/indic/about",
  "/indic/chat",
  "/blog",
  "/blog/gargi-m1-is-out",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: new URL(path, SITE.url).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
