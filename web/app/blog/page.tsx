import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PageView } from "@/components/PageView";
import { M1, POSTS } from "@/content/site";

export const metadata: Metadata = {
  title: "Notes",
  description: "Progress on the models, decisions we are working through, and what we find while building.",
};

export default function Blog() {
  const featured = POSTS.find((p) => "featured" in p && p.featured);
  const rest = POSTS.filter((p) => p !== featured);

  return (
    <div className="shell">
      <PageView page="blog" />
      <Nav current="blog" />

      <div className="blog-head">
        <h1>Notes</h1>
        <p className="text-muted">
          Progress on the models, decisions we are working through, and what we find while
          building the language layer. Written as the work happens, not after it.
        </p>
      </div>

      {featured && (
        <article className="post-featured">
          <div className="post-featured-body">
            <div className="post-meta">
              <span className="tag tag-accent">{featured.tag}</span>
              <span className="text-muted" style={{ fontSize: 13 }}>
                {featured.date} · {featured.read}
              </span>
            </div>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="post-more">{featured.href ? "Read the post →" : "Coming soon"}</div>
          </div>
          <div className="post-featured-mark">
            <div className="post-featured-glyph">
              <span className="dim">[</span><span className="ml">ഗ</span><span className="dim">]</span>
            </div>
            <div className="post-featured-tag">{M1.name} · {M1.params}</div>
          </div>
        </article>
      )}

      <div className="post-list">
        {rest.map((p) => (
          <article className="post-row" key={p.title}>
            <span className="post-row-date text-muted">{p.date}</span>
            <span className="post-row-tag"><span className="tag tag-outline">{p.tag}</span></span>
            <span className="post-row-main">
              <span className="post-row-title">{p.title}</span>
              <span className="post-row-excerpt text-muted">{p.excerpt}</span>
            </span>
            <span className="post-row-read text-muted">{p.read}</span>
          </article>
        ))}
      </div>

      <section className="blog-cta">
        <div className="accent-panel-ghost ml" aria-hidden>ഗ</div>
        <div className="blog-cta-left">
          <div className="manifesto" style={{ maxWidth: "24ch", fontSize: 38 }}>
            Work in progress, published as it goes.
          </div>
        </div>
        <div className="blog-cta-right">
          <WaitlistForm source="blog" label="Get new posts" cta="Subscribe" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
