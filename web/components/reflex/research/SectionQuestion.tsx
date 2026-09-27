import React from "react";
import { RESEARCH } from "@/content/reflex";

export function SectionQuestion() {
  const { question } = RESEARCH;
  return (
    <section id="q" className="research-section">
      <div className="section-num">{question.num}</div>
      <h2 className="section-title">{question.title}</h2>
      <p className="section-p">{question.p1}</p>
      <p className="section-p">
        <strong>Setup. </strong>
        {question.p2.replace("Setup. ", "")}
      </p>

      <div className="research-table-wrapper">
        <div className="research-table-grid research-table-header">
          <span></span>
          <span>BANKING77</span>
          <span>SUPPORT TICKETS</span>
        </div>
        {question.table.map((row, idx) => (
          <div key={idx} className="research-table-grid research-table-row">
            <span className="table-feature">{row.feature}</span>
            <span className="table-mono">{row.banking77}</span>
            <span className="table-mono">{row.tickets}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
