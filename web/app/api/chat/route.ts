import { NextRequest } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { getOrCreateSessionId, ipHash, requestContext } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";
import { scoreGeneration } from "@/lib/quality";
import { GEN_DEFAULTS } from "@/content/indic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Chat proxy.
 *
 * Sits between the browser and the inference Space so that (a) the Space's
 * bearer token never reaches a client, (b) tokens are re-streamed with no
 * added latency, and (c) the full exchange is logged after the stream closes.
 *
 * Logging deliberately happens *after* `done`, never between tokens: the
 * visitor should not wait on a database write to see the model think.
 */

type Body = {
  message: string;
  conversationId?: string | null;
  checkpoint?: "instruct" | "base";
  scriptPref?: string;
  temperature?: number;
  topK?: number;
  maxTokens?: number;
};

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const message = body?.message?.trim();
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > 2000) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }

  const checkpoint = body?.checkpoint === "base" ? "base" : "instruct";
  const sessionId = await getOrCreateSessionId();
  const ipKey = await ipHash();

  const limit = await checkRateLimit(sessionId, ipKey);
  if (!limit.ok) {
    return Response.json(
      { error: limit.reason },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const inferenceUrl = process.env.GARGI_INFERENCE_URL;
  if (!inferenceUrl) {
    return Response.json(
      { error: "The model endpoint is not configured. Set GARGI_INFERENCE_URL." },
      { status: 503 }
    );
  }

  // --- ensure a conversation row exists before streaming ---
  let conversationId = body?.conversationId ?? null;
  const db = supabaseConfigured() ? supabaseAdmin() : null;

  if (db) {
    const ctx = await requestContext();
    await db.from("sessions").upsert(
      { id: sessionId, last_seen: new Date().toISOString(), ...ctx },
      { onConflict: "id" }
    );

    if (!conversationId) {
      const { data } = await db
        .from("conversations")
        .insert({
          session_id: sessionId,
          checkpoint,
          script_pref: body?.scriptPref ?? "malayalam",
          title: message.slice(0, 80),
        })
        .select("id")
        .single();
      conversationId = data?.id ?? null;
    }
  }

  // --- call the Space ---
  let upstream: Response;
  try {
    upstream = await fetch(`${inferenceUrl.replace(/\/$/, "")}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // .trim() because a token pasted into a dashboard env var routinely
        // carries a trailing newline, which fails auth while looking identical.
        ...(process.env.GARGI_API_TOKEN
          ? { Authorization: `Bearer ${process.env.GARGI_API_TOKEN.trim()}` }
          : {}),
      },
      body: JSON.stringify({
        prompt: message,
        checkpoint,
        temperature: body?.temperature ?? GEN_DEFAULTS.temperature,
        top_k: body?.topK ?? GEN_DEFAULTS.topK,
        max_tokens: body?.maxTokens ?? GEN_DEFAULTS.maxTokens,
      }),
    });
  } catch {
    return Response.json(
      { error: "Could not reach the model. It may be waking up — try again in a moment." },
      { status: 503 }
    );
  }

  if (upstream.status === 503) {
    return Response.json(
      { error: "Gargi Labs is answering someone else. Try again in a moment." },
      { status: 503, headers: { "Retry-After": "5" } }
    );
  }
  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: `Model returned ${upstream.status}.` }, { status: 502 });
  }

  const started = Date.now();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      let full = "";
      let doneMeta: Record<string, unknown> | null = null;

      // Tell the client its conversation id up front so a refresh mid-stream
      // does not orphan the thread.
      controller.enqueue(encoder.encode(sse("meta", { conversationId, checkpoint })));

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const evLine = frame.split("\n").find((l) => l.startsWith("event: "));
            const dataLine = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!evLine || !dataLine) continue;

            const event = evLine.slice(7).trim();
            let payload: Record<string, unknown>;
            try {
              payload = JSON.parse(dataLine.slice(6));
            } catch {
              continue;
            }

            if (event === "token") {
              full += String(payload.t ?? "");
              controller.enqueue(encoder.encode(sse("token", { t: payload.t })));
            } else if (event === "done") {
              doneMeta = payload;
            } else if (event === "error") {
              controller.enqueue(encoder.encode(sse("error", payload)));
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode(sse("error", { message: "Stream interrupted." })));
      }

      const text = (doneMeta?.text as string) || full;
      const quality = scoreGeneration(text);

      let generationId: string | null = null;
      if (db && conversationId) {
        generationId = await persist({
          conversationId,
          sessionId,
          ipKey,
          checkpoint,
          message,
          text,
          doneMeta,
          quality,
          wallMs: Date.now() - started,
          params: {
            temperature: body?.temperature ?? GEN_DEFAULTS.temperature,
            top_k: body?.topK ?? GEN_DEFAULTS.topK,
            max_tokens: body?.maxTokens ?? GEN_DEFAULTS.maxTokens,
          },
        });
      }

      controller.enqueue(
        encoder.encode(sse("done", { ...doneMeta, conversationId, generationId, quality }))
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

async function persist(args: {
  conversationId: string;
  sessionId: string;
  ipKey: string;
  checkpoint: string;
  message: string;
  text: string;
  doneMeta: Record<string, unknown> | null;
  quality: ReturnType<typeof scoreGeneration>;
  wallMs: number;
  params: Record<string, number>;
}): Promise<string | null> {
  const db = supabaseAdmin();
  const m = args.doneMeta ?? {};

  try {
    const { data: seqRow } = await db
      .from("messages")
      .select("seq")
      .eq("conversation_id", args.conversationId)
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSeq = (seqRow?.seq ?? -1) + 1;

    await db.from("messages").insert([
      { conversation_id: args.conversationId, role: "user", content: args.message, seq: nextSeq },
      { conversation_id: args.conversationId, role: "assistant", content: args.text, seq: nextSeq + 1 },
    ]);

    const { data: gen } = await db
      .from("generations")
      .insert({
        conversation_id: args.conversationId,
        session_id: args.sessionId,
        ip_hash: args.ipKey,
        checkpoint: args.checkpoint,
        prompt_text: args.message,
        response_text: args.text,
        prompt_tokens: m.prompt_tokens ?? null,
        completion_tokens: m.completion_tokens ?? null,
        ttft_ms: m.ttft_ms ?? null,
        total_ms: m.total_ms ?? args.wallMs,
        tokens_per_sec: m.tokens_per_sec ?? null,
        stop_reason: m.stop_reason ?? null,
        prompt_truncated: m.prompt_truncated ?? false,
        temperature: args.params.temperature,
        top_k: args.params.top_k,
        max_tokens: args.params.max_tokens,
      })
      .select("id")
      .single();

    if (gen?.id) {
      await db.from("generation_quality").insert({ generation_id: gen.id, ...args.quality });
      await db
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", args.conversationId);
      return gen.id;
    }
  } catch (err) {
    // A logging failure must never surface as a broken chat.
    console.error("[gargi] failed to persist generation:", err);
  }
  return null;
}
