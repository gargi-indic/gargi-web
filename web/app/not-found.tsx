import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="shell">
      <SiteHeader />
      <div className="prose">
        <h1>Not found</h1>
        <p className="text-muted">That page does not exist.</p>
        <p><Link href="/">Back to the home page</Link></p>
      </div>
      <SiteFooter />
    </div>
  );
}
