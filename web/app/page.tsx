import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageView } from "@/components/PageView";

export default function Home() {
  return (
    <div className="shell">
      <PageView page="home" />
      <SiteHeader />
      <main style={{ padding: "64px var(--gutter, 24px)" }}>
        <h1>Gargi Labs</h1>
        <nav style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
          <Link href="/reflex">Reflex</Link>
          <Link href="/harness">Harness</Link>
          <Link href="/indic">Indic SLMs</Link>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
