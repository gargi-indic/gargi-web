"use client";

import { useState } from "react";

interface CopyPillProps {
  command?: string;
  className?: string;
}

export function CopyPill({ command = "pip install gargi-reflex", className = "" }: CopyPillProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`copy-pill ${className}`}>
      <span className="copy-pill-prompt">$</span>
      <span className="copy-pill-command">{command}</span>
      <button
        type="button"
        className="copy-pill-btn"
        onClick={handleCopy}
        aria-label="Copy command"
      >
        {copied ? "Copied" : "copy"}
      </button>
    </div>
  );
}

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      className={`copy-btn ${className}`}
      onClick={handleCopy}
      aria-label="Copy text"
    >
      {copied ? "Copied" : "copy"}
    </button>
  );
}
