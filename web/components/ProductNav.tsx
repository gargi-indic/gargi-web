import Link from "next/link";
import { PRODUCT_NAV } from "@/content/lab";

export interface ProductNavProps {
  product: "reflex" | "indic";
  current?: string | null;
}

export function ProductNav({ product, current = null }: ProductNavProps) {
  const links = PRODUCT_NAV[product];
  if (!links) return null;

  return (
    <nav className="product-nav" aria-label={`${product} product navigation`}>
      <div className="product-nav-inner">
        {links.map((link) => {
          const isCurrent = current === link.id || current === link.href;
          const mark = isCurrent ? { "aria-current": "page" as const } : {};

          if ("external" in link && link.external) {
            return (
              <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            );
          }

          return (
            <Link key={link.id} href={link.href} {...mark}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
