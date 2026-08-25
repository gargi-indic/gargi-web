"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires one page_view per mount. Dropped into each page's tree. */
export function PageView({ page }: { page: string }) {
  useEffect(() => {
    track("page_view", { page });
  }, [page]);
  return null;
}
