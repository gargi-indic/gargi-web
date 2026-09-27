"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductNav } from "@/components/ProductNav";

export default function IndicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname?.startsWith("/indic/chat");

  if (isChat) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader current="indic" />
      <ProductNav product="indic" current={pathname} />
      {children}
    </>
  );
}
