import { SiteHeader } from "@/components/SiteHeader";
import { ProductNav } from "@/components/ProductNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function ReflexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <SiteHeader current="reflex" />
      <ProductNav product="reflex" />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
