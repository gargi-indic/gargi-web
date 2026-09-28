import type { MetadataRoute } from "next";
import { SITE } from "@/content/lab";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: new URL("/sitemap.xml", SITE.url).toString(),
  };
}
