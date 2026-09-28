/**
 * Client-side event beacon. Fire-and-forget: analytics must never delay or
 * break the thing the visitor actually came for, so every failure is swallowed.
 */
export type EventName =
  | "page_view"
  | "cta_click"
  | "chat_opened"
  | "message_sent"
  | "checkpoint_switched"
  | "feedback_given"
  | "response_copied"
  | "regenerated"
  | "waitlist_signup"
  | "contact_submitted";

export function track(name: EventName, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    name,
    path: window.location.pathname,
    props,
  });
  try {
    // sendBeacon survives page unload, which a fetch() does not.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics is never worth an exception */
  }
}
