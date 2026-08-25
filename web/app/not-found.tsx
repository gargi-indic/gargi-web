import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="shell">
      <Nav />
      <div className="prose">
        <h1>Not found</h1>
        <p className="text-muted">That page does not exist.</p>
        <p><Link href="/">Back to the home page</Link></p>
      </div>
      <Footer />
    </div>
  );
}
