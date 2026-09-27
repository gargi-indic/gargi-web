import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { LAB_LINE } from "@/content/lab";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link href="/" aria-label="Gargi Labs home">
            <Wordmark />
          </Link>
          <p className="site-footer-line">{LAB_LINE}</p>
        </div>
        <nav className="site-footer-nav" aria-label="Footer navigation">
          <Link href="/reflex">Reflex</Link>
          <Link href="/harness">Harness</Link>
          <Link href="/indic">Indic SLMs</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/lab">Lab</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
