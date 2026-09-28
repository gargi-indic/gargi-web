import React from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionLimitations() {
  const { limitations } = RESEARCH;

  return (
    <section id="limits" className="research-section">
      <div className="section-num">{limitations.num}</div>
      <h2 className="section-title">{limitations.title}</h2>

      <ol className="limitations-list">
        {limitations.items.map((item) => (
          <li key={item.num} className="limitation-item">
            <span className="item-num">{item.num}</span>
            <span className="item-body">
              <strong>{item.bold} </strong>
              {item.text}
            </span>
          </li>
        ))}
      </ol>

      <div className="reproduce-header">{limitations.reproduceTitle}</div>
      <pre className="reproduce-codeblock">{limitations.reproduceCmd}</pre>

      <div className="limitations-links">
        {limitations.links.map((link, idx) => (
          <a key={idx} href={link.href} className="research-link">
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
