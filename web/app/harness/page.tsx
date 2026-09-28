import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageView } from "@/components/PageView";
import { WaitlistForm } from "@/components/WaitlistForm";
import { HARNESS } from "@/content/lab";

export const metadata: Metadata = {
  title: HARNESS.title,
  description: HARNESS.body,
};

export default function HarnessPage() {
  return (
    <div className="shell">
      <PageView page="harness" />
      <SiteHeader current="harness" />
      <main className="page-main">
        <section className="reflex-section page-first">
          <div className="reflex-container split-grid">
            <div>
              <span className="status-tag status-dev">{HARNESS.status}</span>
              <h1 className="page-title">{HARNESS.title}</h1>
            </div>
            <div className="harness-body">
              <p className="page-lede">{HARNESS.body}</p>
              <div className="harness-waitlist">
                <WaitlistForm source="harness" label={HARNESS.waitlistLabel} cta={HARNESS.waitlistCta} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
