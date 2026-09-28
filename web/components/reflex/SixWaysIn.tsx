"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { REFLEX_CONTENT } from "@/content/reflex";
import { CopyButton } from "./CopyPill";

export function SixWaysIn() {
  const { sixWaysIn } = REFLEX_CONTENT;
  const [activeTabId, setActiveTabId] = useState<string>(sixWaysIn.tabs[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeTab =
    sixWaysIn.tabs.find((t) => t.id === activeTabId) || sixWaysIn.tabs[0];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % sixWaysIn.tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + sixWaysIn.tabs.length) % sixWaysIn.tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = sixWaysIn.tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    setActiveTabId(sixWaysIn.tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="reflex-section reflex-sixways-section">
      <div className="reflex-container">
        <div className="reflex-eyebrow">{sixWaysIn.eyebrow}</div>
        <h2 className="reflex-section-title">{sixWaysIn.title}</h2>

        {/* Desktop / Tablet Tablist */}
        <div
          className="sixways-tablist"
          role="tablist"
          aria-label="Six ways in code examples"
        >
          {sixWaysIn.tabs.map((tab, idx) => {
            const isSelected = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={`sixways-tab-btn ${isSelected ? "is-selected" : ""}`}
                onClick={() => setActiveTabId(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Select (< 640px) */}
        <div className="sixways-select-wrapper">
          <label htmlFor="sixways-mobile-select" className="sr-only">
            Select integration path
          </label>
          <select
            id="sixways-mobile-select"
            className="sixways-mobile-select"
            value={activeTabId}
            onChange={(e) => setActiveTabId(e.target.value)}
          >
            {sixWaysIn.tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Tab Panel */}
        <div
          id={`tabpanel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          className="sixways-code-grid"
        >
          <div className="code-block code-block-before">
            <div className="code-block-header">BEFORE</div>
            <pre className="code-block-content">{activeTab.before}</pre>
          </div>

          <div className="code-block code-block-after">
            <div className="code-block-header">
              <span>AFTER</span>
              <CopyButton text={activeTab.after} />
            </div>
            <pre className="code-block-content">{activeTab.after}</pre>
          </div>
        </div>

        {/* Bottom Providers & Agent row */}
        <div className="sixways-bottom-row">
          <div className="models-col">
            <h3 className="models-title">{sixWaysIn.modelsTitle}</h3>
            <div className="models-list">
              <span className="model-brand model-featured">Jev</span>
              <span className="model-brand model-featured">Laya</span>
              <span className="models-divider" />
              <span className="model-brand">OpenAI</span>
              <span className="model-brand">Anthropic</span>
              <span className="model-brand">Gemini</span>
              <span className="model-brand model-sub">any OpenAI-compatible API</span>
            </div>
            <p className="models-desc">{sixWaysIn.modelsDesc}</p>
          </div>

          <div className="agent-card">
            <h3 className="agent-title">{sixWaysIn.agentTitle}</h3>
            <div className="agent-prompt-box">{sixWaysIn.agentPrompt}</div>
            <p className="agent-desc">{sixWaysIn.agentDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
