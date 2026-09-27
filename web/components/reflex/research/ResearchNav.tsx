import React from "react";
import { RESEARCH } from "@/content/reflex";

export function ResearchNav() {
  return (
    <aside className="research-nav-aside">
      <span className="research-nav-title">CONTENTS</span>
      {RESEARCH.nav.map((item) => (
        <a key={item.id} href={`#${item.id}`} className="research-nav-link">
          {item.label}
        </a>
      ))}
    </aside>
  );
}
