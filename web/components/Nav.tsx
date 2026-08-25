import Link from "next/link";
import { Wordmark } from "./Wordmark";

type Page = "models" | "blog" | "about" | null;

export function Nav({ current = null }: { current?: Page }) {
  const mark = (p: Page) => (current === p ? { "aria-current": "page" as const } : {});
  return (
    <nav className="nav site-nav">
      <Link href="/" className="nav-brand nav-brand-link">
        <Wordmark />
      </Link>
      <Link href="/models" {...mark("models")}>Models</Link>
      <Link href="/blog" {...mark("blog")}>Blog</Link>
      <Link href="/about" {...mark("about")}>About</Link>
      <Link className="btn btn-primary nav-cta" href="/chat">Open chat</Link>
    </nav>
  );
}
