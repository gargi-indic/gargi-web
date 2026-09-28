import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageView } from "@/components/PageView";
import { ContactSupport } from "@/components/ContactSupport";
import { LAB_PAGE, PRODUCTS } from "@/content/lab";

export const metadata: Metadata = {
  title: "Lab",
  description: LAB_PAGE.mission,
};

export default function LabPage() {
  const { name, howWeWork, products } = LAB_PAGE;

  return (
    <div className="shell">
      <PageView page="lab" />
      <SiteHeader current="lab" />
      <main className="page-main">
        <section className="reflex-section page-first">
          <div className="reflex-container split-grid">
            <h1 className="page-title">{LAB_PAGE.title}</h1>
            <p className="page-lede">{LAB_PAGE.mission}</p>
          </div>
        </section>

        <section className="reflex-section">
          <div className="reflex-container split-grid">
            <h2 className="reflex-section-title">{name.title}</h2>
            <p className="page-body">{name.body}</p>
          </div>
        </section>

        <section className="reflex-section">
          <div className="reflex-container">
            <h2 className="reflex-section-title">{howWeWork.title}</h2>
            <ol className="numbered-rows">
              {howWeWork.items.map((item, i) => (
                <li key={item.title} className="numbered-row">
                  <span className="numbered-row-n">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="numbered-row-title">{item.title}</h3>
                  <p className="numbered-row-body">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="reflex-section">
          <div className="reflex-container">
            <h2 className="reflex-section-title">{products.title}</h2>
            <div className="product-grid">
              {PRODUCTS.map((p) => (
                <Link key={p.id} href={p.href} className={`product-cell product-cell-${p.id}`}>
                  <span className={`status-tag ${p.statusType === "live" ? "status-live" : "status-dev"}`}>
                    {p.status}
                  </span>
                  <h3 className="product-cell-name">{p.name}</h3>
                  <p className="product-cell-tagline">{p.tagline}</p>
                  <p className="product-cell-body">{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ContactSupport source="lab" />
      </main>
      <SiteFooter />
    </div>
  );
}
