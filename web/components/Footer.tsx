import Link from "next/link";
import { SITE } from "@/content/site";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="site-footer">
      <span className="footer-mark"><Wordmark /></span>
      <span className="text-muted">{SITE.tagline}</span>
      <span className="footer-links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/chat">Open chat</Link>
      </span>
    </footer>
  );
}
