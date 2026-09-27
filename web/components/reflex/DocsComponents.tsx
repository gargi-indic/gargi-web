import Image from "next/image";
import { DOCS } from "@/content/reflex";
import { REFLEX_GITHUB } from "@/content/lab";
import { CopyPill, CopyButton } from "./CopyPill";

export function DocsIntro() {
  const { intro } = DOCS;
  return (
    <section className="reflex-section docs-intro-section" data-screen-label="Docs intro">
      <div className="reflex-container docs-intro-grid">
        <div className="docs-intro-left">
          <div className="reflex-eyebrow">{intro.eyebrow}</div>
          <h1 className="reflex-section-title docs-intro-title">{intro.title}</h1>
          <p className="docs-intro-sub">{intro.sub}</p>
        </div>
        <div className="docs-intro-right">
          <CopyPill command={intro.pipCommand} className="docs-copy-pill" />
          <div className="docs-agent-card">
            <div className="docs-agent-eyebrow">{intro.agentEyebrow}</div>
            <div className="docs-agent-prompt">{intro.agentPrompt}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DocsQuickStart() {
  const { quickStart } = DOCS;
  return (
    <section className="reflex-section docs-quickstart-section" data-screen-label="Quick start">
      <div className="reflex-container">
        <div className="reflex-eyebrow">{quickStart.eyebrow}</div>
        <div className="quickstart-grid">
          {quickStart.steps.map((step) => (
            <div key={step.num} className="quickstart-col">
              <span className="quickstart-num">{step.num}</span>
              <span className="quickstart-title">{step.title}</span>
              <code className="quickstart-code">{step.code}</code>
              <span className="quickstart-desc">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DocsIntegrationPaths() {
  const { integrationPaths } = DOCS;
  const gargiMdUrl = `${REFLEX_GITHUB}/gargi-decision-harness/blob/main/${integrationPaths.docPath}`;

  return (
    <section className="reflex-section docs-paths-section" data-screen-label="Integration paths">
      <div className="reflex-container">
        <div className="docs-paths-header">
          <div className="reflex-eyebrow">{integrationPaths.eyebrow}</div>
          <a
            href={gargiMdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-paths-link"
          >
            {integrationPaths.githubGuideLabel}
          </a>
        </div>
        <div className="docs-paths-grid">
          {integrationPaths.paths.map((path) => (
            <a
              key={path.title}
              href={gargiMdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="docs-path-card"
            >
              <span className="docs-path-tag">{path.tag}</span>
              <span className="docs-path-title">{path.title}</span>
              <code className="docs-path-code">{path.code}</code>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DocsGuidesLifecycle() {
  const { guidesAndLifecycle } = DOCS;

  return (
    <section className="reflex-section docs-guides-lifecycle-section" data-screen-label="Guides and lifecycle">
      <div className="reflex-container docs-gl-grid">
        {/* Left Column: Guides */}
        <div className="docs-guides-col">
          <div className="reflex-eyebrow">{guidesAndLifecycle.guidesEyebrow}</div>
          <div className="docs-guides-list">
            {guidesAndLifecycle.guides.map((guide) => {
              const url = `${REFLEX_GITHUB}/gargi-decision-harness/blob/main/${guide.docPath}`;
              return (
                <a
                  key={guide.title}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="docs-guide-item"
                >
                  <div className="docs-guide-left">
                    <span className="docs-guide-title">{guide.title}</span>
                    <span className="docs-guide-desc">{guide.desc}</span>
                  </div>
                  <span className="docs-guide-link-label">{guide.linkLabel}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lifecycle */}
        <div className="docs-lifecycle-col">
          <div className="reflex-eyebrow">{guidesAndLifecycle.lifecycleEyebrow}</div>
          <div className="lifecycle-box">
            <div className="lifecycle-pills-row">
              <span className="lifecycle-pill pill-teacher">teacher</span>
              <span className="lifecycle-transition">{guidesAndLifecycle.lifecycleTransitions[0]}</span>
              <span className="lifecycle-pill pill-shadow">shadow</span>
              <span className="lifecycle-transition">{guidesAndLifecycle.lifecycleTransitions[1]}</span>
              <span className="lifecycle-pill pill-assist">assist</span>
            </div>
            <div className="lifecycle-reset-text">{guidesAndLifecycle.resetText}</div>
            <div className="lifecycle-desc-list">
              {guidesAndLifecycle.lifecycleItems.map((item) => (
                <div key={item.role} className="lifecycle-desc-item">
                  <b className={`role-${item.roleClass}`}>{item.role}</b> · {item.desc}
                </div>
              ))}
            </div>
          </div>

          <div className="lifecycle-report-box">
            <Image
              src={guidesAndLifecycle.reportImage}
              alt={guidesAndLifecycle.reportAlt}
              width={1160}
              height={580}
              className="lifecycle-report-img"
            />
          </div>
          <div className="lifecycle-report-caption">
            {guidesAndLifecycle.reportCaption}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DocsCli() {
  const { cli } = DOCS;

  return (
    <section className="reflex-section docs-cli-section" data-screen-label="CLI">
      <div className="reflex-container">
        <div className="reflex-eyebrow">{cli.eyebrow}</div>
        <div className="docs-cli-list">
          {cli.commands.map((item) => (
            <div key={item.cmd} className="docs-cli-row">
              <div className="docs-cli-cmd-wrap">
                <code className="docs-cli-cmd">{item.cmd}</code>
                <CopyButton text={item.cmd} className="docs-cli-copy" />
              </div>
              <span className="docs-cli-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
