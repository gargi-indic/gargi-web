"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { LAB_GITHUB } from "@/content/lab";

export type SiteHeaderCurrent = "reflex" | "harness" | "indic" | "blog" | "lab" | string | null;

interface SiteHeaderProps {
  current?: SiteHeaderCurrent;
}

export function SiteHeader({ current = null }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  const mark = (key: string) => (current === key ? { "aria-current": "page" as const } : {});

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-brand" aria-label="Gargi Labs home">
          <Wordmark />
        </Link>

        <button
          className="site-header-toggle"
          type="button"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav className={`site-header-nav${open ? " is-open" : ""}`}>
          <Link href="/reflex" {...mark("reflex")} onClick={() => setOpen(false)}>
            Reflex
          </Link>
          <Link href="/harness" {...mark("harness")} onClick={() => setOpen(false)}>
            Harness
          </Link>
          <Link href="/indic" {...mark("indic")} onClick={() => setOpen(false)}>
            Indic SLMs
          </Link>
          <Link href="/blog" {...mark("blog")} onClick={() => setOpen(false)}>
            Blog
          </Link>
          <Link href="/lab" {...mark("lab")} onClick={() => setOpen(false)}>
            Lab
          </Link>
          <a
            href={LAB_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-github"
            onClick={() => setOpen(false)}
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
