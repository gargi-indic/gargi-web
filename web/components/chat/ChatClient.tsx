"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { M1 } from "@/content/site";

type Checkpoint = "instruct" | "base";
type Script = "malayalam" | "manglish" | "english";

type Turn = {
  role: "user" | "assistant";
  content: string;
  generationId?: string | null;
  checkpoint?: Checkpoint;
  meta?: { completion_tokens?: number; total_ms?: number; tokens_per_sec?: number } | null;
  rating?: "up" | "down" | null;
  streaming?: boolean;
};

type Conversation = { id: string; title: string; checkpoint: string; updated_at: string | null };

const SUGGESTIONS = [
  "കേരളത്തിന്റെ തലസ്ഥാനം ഏതാണ്?",
  "സൂര്യൻ എന്താണ്?",
  "ഒരു ചെറിയ കഥ പറയുക.",
];

export function ChatClient() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState<Checkpoint>("instruct");
  const [script, setScript] = useState<Script>("malayalam");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastPrompt = useRef<string>("");

  useEffect(() => { track("chat_opened", { checkpoint }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch { /* the sidebar is not worth an error state */ }
  }, []);
  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    lastPrompt.current = message;
    setError(null);
    setBusy(true);
    setInput("");
    setDrawerOpen(false);
    setTurns((t) => [
      ...t,
      { role: "user", content: message },
      { role: "assistant", content: "", checkpoint, streaming: true },
    ]);
    track("message_sent", { checkpoint, script, chars: message.length });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId, checkpoint, scriptPref: script }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const ev = frame.split("\n").find((l) => l.startsWith("event: "))?.slice(7).trim();
          const raw = frame.split("\n").find((l) => l.startsWith("data: "))?.slice(6);
          if (!ev || !raw) continue;

          let payload: Record<string, unknown>;
          try { payload = JSON.parse(raw); } catch { continue; }

          if (ev === "meta" && payload.conversationId) {
            setConversationId(payload.conversationId as string);
          } else if (ev === "token") {
            setTurns((t) => {
              const next = [...t];
              next[next.length - 1] = {
                ...next[next.length - 1],
                content: next[next.length - 1].content + String(payload.t ?? ""),
              };
              return next;
            });
          } else if (ev === "done") {
            setTurns((t) => {
              const next = [...t];
              next[next.length - 1] = {
                ...next[next.length - 1],
                streaming: false,
                generationId: (payload.generationId as string) ?? null,
                meta: payload as Turn["meta"],
              };
              return next;
            });
          } else if (ev === "error") {
            throw new Error(String(payload.message ?? "The model stopped unexpectedly."));
          }
        }
      }
      void loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setTurns((t) => {
        const next = [...t];
        const last = next[next.length - 1];
        // Drop an assistant turn that never produced anything, rather than
        // leaving an empty bubble sitting there.
        if (last?.role === "assistant" && !last.content) next.pop();
        else if (last) next[next.length - 1] = { ...last, streaming: false };
        return next;
      });
    } finally {
      setBusy(false);
      taRef.current?.focus();
    }
  }

  async function rate(index: number, rating: "up" | "down") {
    const turn = turns[index];
    if (!turn?.generationId) return;
    setTurns((t) => t.map((x, i) => (i === index ? { ...x, rating } : x)));
    track("feedback_given", { rating, checkpoint: turn.checkpoint });
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId: turn.generationId, rating }),
    }).catch(() => {});
  }

  function newChat() {
    setTurns([]); setConversationId(null); setError(null); setDrawerOpen(false);
    taRef.current?.focus();
  }

  function switchCheckpoint(next: Checkpoint) {
    if (next === checkpoint) return;
    setCheckpoint(next);
    track("checkpoint_switched", { to: next });
  }

  return (
    <div className="chat-shell">
      {drawerOpen && <div className="chat-scrim" onClick={() => setDrawerOpen(false)} />}

      <aside className="chat-sidebar" data-open={drawerOpen}>
        <Link href="/" className="chat-brand">
          <span style={{ display: "flex", gap: 2 }}>
            <span style={{ color: "var(--color-accent-400)" }}>[</span>
            <span className="ml">ഗ</span>
            <span style={{ color: "var(--color-accent-400)" }}>]</span>
          </span>
          GARGI
        </Link>

        <div className="chat-side-block">
          <div className="chat-side-label">Input script</div>
          <div className="script-grid">
            {(
              [
                ["malayalam", "ഗ", "Malayalam"],
                ["manglish", "Mg", "Manglish — coming soon"],
                ["english", "En", "English — coming soon"],
              ] as const
            ).map(([id, glyph, title]) => (
              <button
                key={id}
                type="button"
                className="script-opt"
                title={title}
                aria-pressed={script === id}
                disabled={id !== "malayalam"}
                onClick={() => setScript(id as Script)}
              >
                {glyph}
              </button>
            ))}
          </div>
          <div className="chat-side-note">
            Malayalam only. Manglish and English need a transliteration layer that does not
            exist yet.
          </div>
        </div>

        <div className="chat-new">
          <button className="btn btn-primary btn-block" onClick={newChat}>
            + <span className="ml">പുതിയ ചാറ്റ്</span>
          </button>
        </div>

        {conversations.length > 0 && (
          <>
            <div className="chat-history-label chat-side-label">Recent</div>
            <div className="chat-history">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  className="chat-history-item ml"
                  aria-current={c.id === conversationId}
                  title={c.title}
                  onClick={() => { setConversationId(c.id); setDrawerOpen(false); }}
                >
                  {c.title || "Untitled"}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="chat-side-foot">Research preview</div>
      </aside>

      <main className="chat-main">
        <div className="chat-topbar">
          <button
            className="chat-menu-btn"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle conversations"
          >
            ☰
          </button>
          <div className="chat-model">
            <span className="chat-model-name">{M1.name}</span>
            <span className="chat-model-sub text-muted">
              {M1.params} · <span className="ml">മലയാളം</span>
            </span>
          </div>
          <div className="seg chat-seg" role="group" aria-label="Checkpoint">
            {(["instruct", "base"] as const).map((c) => (
              <label className="seg-opt" key={c}>
                <input
                  type="radio"
                  name="checkpoint"
                  checked={checkpoint === c}
                  onChange={() => switchCheckpoint(c)}
                />
                {c === "instruct" ? "Instruct" : "Base"}
              </label>
            ))}
          </div>
        </div>

        <div className="chat-scroll" ref={scrollRef}>
          <div className="chat-ghost" aria-hidden>ഗ</div>

          {turns.length === 0 ? (
            <div className="chat-empty">
              <h2>Ask {M1.name} something in Malayalam</h2>
              <p className="text-muted">
                A {M1.params}-parameter research preview with a {M1.contextTokens}-token
                context. It will get things wrong. <b>Instruct</b> answers questions;{" "}
                <b>Base</b> only continues text.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chat-suggestion" onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-turns">
              {turns.map((t, i) =>
                t.role === "user" ? (
                  <div className="turn-user" key={i}>
                    <div className="turn-label">You</div>
                    <div className="turn-body ml">{t.content}</div>
                  </div>
                ) : (
                  <div className="turn-assistant" key={i}>
                    <div className="turn-label text-muted">
                      Gargi{t.checkpoint === "base" ? " · base" : ""}
                    </div>
                    <div className="turn-body ml">
                      {t.content}
                      {t.streaming && <span className="caret" aria-label="generating" />}
                    </div>
                    {!t.streaming && t.content && (
                      <div className="turn-actions text-muted">
                        {t.meta?.total_ms != null && (
                          <span>
                            {(Number(t.meta.total_ms) / 1000).toFixed(1)}s ·{" "}
                            {t.meta.completion_tokens} tokens
                            {t.meta.tokens_per_sec ? ` · ${t.meta.tokens_per_sec} tok/s` : ""}
                          </span>
                        )}
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            void navigator.clipboard.writeText(t.content);
                            track("response_copied", {});
                          }}
                        >
                          Copy
                        </button>
                        <button
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() => {
                            setTurns((x) => x.slice(0, i - 1));
                            track("regenerated", {});
                            void send(lastPrompt.current);
                          }}
                        >
                          Regenerate
                        </button>
                        <button
                          className="btn btn-ghost"
                          aria-pressed={t.rating === "up"}
                          aria-label="Good response"
                          onClick={() => void rate(i, "up")}
                        >
                          ↑ Good
                        </button>
                        <button
                          className="btn btn-ghost"
                          aria-pressed={t.rating === "down"}
                          aria-label="Bad response"
                          onClick={() => void rate(i, "down")}
                        >
                          ↓ Bad
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="chat-composer">
          <div className="chat-composer-inner">
            <form
              className="chat-input-row"
              onSubmit={(e) => { e.preventDefault(); void send(input); }}
            >
              <label className="sr-only" htmlFor="chat-input">Your message</label>
              <textarea
                id="chat-input"
                ref={taRef}
                className="input chat-textarea"
                placeholder="ഒരു സന്ദേശം എഴുതൂ…"
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={2}
              />
              <button className="btn btn-primary chat-send" type="submit" disabled={busy || !input.trim()}>
                {busy ? "…" : "Send"}
              </button>
            </form>

            {error && <div className="chat-error" role="alert">{error}</div>}

            <div className="chat-notice text-muted">
              {M1.name} is a research preview and can be wrong. Conversations are stored to
              improve the model — see <Link href="/privacy">privacy</Link>.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
