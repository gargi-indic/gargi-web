import type { Metadata } from "next";
import { Archivo, Noto_Sans_Malayalam } from "next/font/google";
import { SITE } from "@/content/site";
import "@/styles/modernist.css";
import "@/styles/site.css";

// The design system asks for Archivo, which has no Malayalam glyphs at all --
// every ഗ, every മലയാളം and every chat message would otherwise fall back to
// whatever the visitor's OS happens to ship, so the site would look different
// on every machine. Noto Sans Malayalam covers the script deliberately.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  weight: ["400", "600", "800"],
  variable: "--font-noto-malayalam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${notoMalayalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
