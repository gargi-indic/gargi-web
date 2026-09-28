import React from "react";
import { RESEARCH } from "@/content/reflex";

export function ResearchHeader() {
  const { header } = RESEARCH;
  return (
    <div className="research-header">
      <div className="research-eyebrow">{header.eyebrow}</div>
      <h1 className="research-title">{header.title}</h1>
      <p className="research-subtitle">{header.subtitle}</p>
    </div>
  );
}
