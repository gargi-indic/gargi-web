import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PageView } from "@/components/PageView";
import { CONTRIBUTORS, M1, POSTS } from "@/content/indic";

const POST = POSTS[0];

export const metadata: Metadata = {
  title: POST.title,
  description: POST.excerpt,
};

const HF = `https://huggingface.co/${M1.hf.instruct}`;
const HF_BASE = `https://huggingface.co/${M1.hf.base}`;

export default function GargiM1IsOut() {
  return (
    <div className="shell">
      <PageView page="blog/gargi-m1-is-out" />
      <SiteHeader current="blog" />

      <header className="article-head">
        <Link className="article-back" href="/blog">← Notes</Link>
        <div className="post-meta">
          <span className="tag tag-accent">{POST.tag}</span>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {POST.date} · {POST.read}
          </span>
        </div>
        <h1>{POST.title}</h1>
        <p className="article-standfirst text-muted">
          {M1.name} is a {M1.params}-parameter Malayalam language model, trained from Malayalam
          rather than translated into it. Both checkpoints are open. This is the short account
          of what it is and what it still cannot do.
        </p>
      </header>

      <div className="prose article">
        <p>
          {M1.name} is public today. The <a href={HF_BASE} target="_blank" rel="noreferrer">base</a>{" "}
          and <a href={HF} target="_blank" rel="noreferrer">instruct</a> checkpoints and the
          tokenizer are on Hugging Face under {M1.license}, and you can{" "}
          <Link href="/indic/chat">try it in chat</Link> right now — switch between the two checkpoints
          in the header and watch them disagree.
        </p>

        <h2>What it is</h2>
        <div className="table-scroll">
          <table className="table article-table">
            <tbody>
              <tr><td>Parameters</td><td>{M1.params} — {M1.layers} layers, {M1.heads} heads, {M1.dModel} hidden</td></tr>
              <tr><td>Context</td><td>{M1.context} tokens</td></tr>
              <tr><td>Vocabulary</td><td>{M1.vocab} byte-level BPE, Malayalam only</td></tr>
              <tr><td>Training</td><td>{M1.trainingTokens} tokens, held-out loss {M1.valLoss}</td></tr>
              <tr><td>Tokenizer fertility</td><td>{M1.fertility}</td></tr>
              <tr><td>Licence</td><td>{M1.license}</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A decoder-only transformer in the GPT-2 shape — deliberately conventional. At{" "}
          {M1.params}, the two things that move the number are the tokenizer and the data, not
          the architecture, so that is where the work went.
        </p>

        <h2>Why the tokenizer matters most</h2>
        <p>
          Malayalam is agglutinative, and most multilingual tokenizers split its conjunct forms
          three or four ways. This one is trained on Malayalam alone and averages{" "}
          {M1.fertility}. That is not a benchmark flourish — it is the context window. Fewer
          tokens per word means more real Malayalam inside the same {M1.context} tokens, and
          more documents seen per compute hour. At this size the tokenizer is the budget.
        </p>

        <h2>What it cannot do</h2>
        <p>
          {M1.name} is a {M1.status.toLowerCase()}. {M1.context} tokens of context is short, and{" "}
          {M1.params} parameters holds limited world knowledge — it will state things
          confidently that are not true. Instruction following is early, and the corpus is drawn
          largely from written, formal sources, which is not how most of Kerala actually speaks.
          None of that is hidden behind a waitlist: the failures are in the same chat as the
          successes.
        </p>

        <h2>Why this is out now</h2>
        <p>
          {M1.name} is the first step of something larger — an open language layer for Indian
          languages, not a single model — and that is not a thing one person finishes. So this
          release is also a call for people. If any of these are you, I would like to hear from
          you:
        </p>
        <ul>
          {CONTRIBUTORS.map((c) => (
            <li key={c.role}><b>{c.role}.</b> {c.body}</li>
          ))}
        </ul>
        <p>
          You do not need a machine-learning background to help — some of the most useful work
          right now is reading model output and saying precisely where it is wrong. The weights,
          the tokenizer and the evaluation code are open and stay open. Take them apart, then
          email <a href="mailto:gishnum.work@gmail.com">gishnum.work@gmail.com</a> or leave your
          address below.
        </p>
      </div>

      <section className="blog-cta">
        <div className="accent-panel-ghost ml" aria-hidden>ഗ</div>
        <div className="blog-cta-left">
          <div className="manifesto" style={{ maxWidth: "24ch", fontSize: 38 }}>
            A billion people should not have to think in English to be understood by a machine.
          </div>
        </div>
        <div className="blog-cta-right">
          <WaitlistForm source="post-gargi-m1" label="Work on this" cta="Get in touch" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
