"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
  ariaLabel?: string;
}

export function CopyButton({
  text,
  className = "",
  ariaLabel = "Copy to clipboard",
}: CopyButtonProps) {
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
      aria-label={ariaLabel}
    >
      {copied ? "Copied" : "copy"}
    </button>
  );
}
