"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

type IntentOption = {
  id: "contribute" | "support" | "question" | "updates";
  label: string;
};

const INTENTS: IntentOption[] = [
  { id: "contribute", label: "Contribute" },
  { id: "support", label: "Support the project" },
  { id: "question", label: "Ask a question" },
  { id: "updates", label: "Get updates" },
];

export function ContactForm({ source = "indic" }: { source?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<"contribute" | "support" | "question" | "updates">("contribute");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // Honeypot field

  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setState("error");
      setErrorMessage("That does not look like a valid email address.");
      return;
    }

    setState("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          intent,
          message: message.trim(),
          company: company.trim(),
          source,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setState("success");
      setSuccessMessage(data.message || "Thank you for reaching out.");
      track("contact_submitted", { source, intent });
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "success") {
    return (
      <div className="contact-success" role="status" style={{ padding: "24px 0" }}>
        <p style={{ fontSize: "18px", fontWeight: 500, margin: 0, color: "var(--on-accent)" }}>
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Honeypot field - visually hidden */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label htmlFor={`contact-company-${source}`}>Company</label>
        <input
          id={`contact-company-${source}`}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          htmlFor={`contact-name-${source}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--on-accent)",
            fontWeight: 600,
          }}
        >
          Name
        </label>
        <input
          id={`contact-name-${source}`}
          type="text"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={state === "sending"}
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            borderRadius: 0,
            padding: "10px 14px",
            fontSize: "15px",
            fontFamily: "var(--font-sans)",
            outline: "none",
          }}
        />
      </div>

      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          htmlFor={`contact-email-${source}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--on-accent)",
            fontWeight: 600,
          }}
        >
          Email <span style={{ color: "var(--on-accent)", opacity: 0.8 }}>*</span>
        </label>
        <input
          id={`contact-email-${source}`}
          type="email"
          required
          maxLength={320}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          disabled={state === "sending"}
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            borderRadius: 0,
            padding: "10px 14px",
            fontSize: "15px",
            fontFamily: "var(--font-sans)",
            outline: "none",
          }}
        />
      </div>

      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span
          id={`contact-intent-label-${source}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--on-accent)",
            fontWeight: 600,
          }}
        >
          I want to
        </span>
        <div
          role="group"
          aria-labelledby={`contact-intent-label-${source}`}
          style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          {INTENTS.map((item) => {
            const isSelected = intent === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                disabled={state === "sending"}
                onClick={() => setIntent(item.id)}
                style={{
                  borderRadius: 0,
                  border: isSelected ? "2px solid var(--on-accent)" : "1px solid rgba(255, 255, 255, 0.4)",
                  background: isSelected ? "var(--on-accent)" : "transparent",
                  color: isSelected ? "var(--ink)" : "var(--on-accent)",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          htmlFor={`contact-message-${source}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--on-accent)",
            fontWeight: 600,
          }}
        >
          Message
        </label>
        <textarea
          id={`contact-message-${source}`}
          rows={4}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={state === "sending"}
          style={{
            background: "var(--paper)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            borderRadius: 0,
            padding: "10px 14px",
            fontSize: "15px",
            fontFamily: "var(--font-sans)",
            resize: "vertical",
            outline: "none",
          }}
        />
      </div>

      {state === "error" && (
        <div
          className="contact-error"
          role="alert"
          style={{
            color: "var(--on-accent)",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: 600,
            borderLeft: "4px solid var(--on-accent)",
          }}
        >
          {errorMessage}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={state === "sending"}
          style={{
            borderRadius: 0,
            border: "2px solid var(--on-accent)",
            background: "var(--on-accent)",
            color: "var(--ink)",
            padding: "12px 24px",
            fontSize: "15px",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            cursor: state === "sending" ? "not-allowed" : "pointer",
            width: "100%",
            textAlign: "center",
          }}
        >
          {state === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
