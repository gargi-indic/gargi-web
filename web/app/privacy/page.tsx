import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageView } from "@/components/PageView";
import { M1, SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Gargi stores, why, and how to have it removed.",
};

export default function Privacy() {
  return (
    <div className="shell">
      <PageView page="privacy" />
      <Nav />
      <div className="prose">
        <h1>Privacy</h1>
        <p className="updated text-muted">Last updated 25 August 2026</p>

        <p>
          {SITE.name} is a research project. The short version: <b>we store the messages you
          send to {M1.name} and the replies it gives</b>, and we use them to make the next
          model better. We do not ask who you are, and we do not sell anything to anyone.
        </p>

        <h2>What is stored</h2>
        <ul>
          <li>
            <b>Your messages and the model&rsquo;s replies.</b> Kept in full, because they are
            the training and evaluation data this project exists to produce.
          </li>
          <li>
            <b>Generation metrics.</b> Which checkpoint answered, how many tokens, time to
            first token, total time, why generation stopped, and automated quality scores
            (how much of the output was Malayalam script, and whether it repeated itself).
          </li>
          <li>
            <b>Your rating</b> when you press Good or Bad on a response.
          </li>
          <li>
            <b>Basic usage events.</b> Page views, which buttons were pressed, coarse device
            type, browser user-agent, referring site and country.
          </li>
          <li>
            <b>Your email</b>, only if you type it into the waitlist form.
          </li>
        </ul>

        <h2>What is not stored</h2>
        <ul>
          <li>No account, no name, no login.</li>
          <li>
            <b>No IP addresses.</b> Rate limiting needs to tell requests apart, so your
            address is hashed with a secret salt and only the hash is kept. It cannot be
            reversed back to an address.
          </li>
          <li>No advertising or third-party tracking cookies.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          One cookie, <code>gargi_sid</code>. It holds a random identifier so your own
          conversations appear in your sidebar and so rate limiting works. It is not linked
          to any identity. Clear it and you are a new visitor with a new empty history.
        </p>

        <h2>Please do not type secrets</h2>
        <p>
          Because conversations are stored and may be read by us or published as part of an
          open dataset, treat this chat as public. Do not enter passwords, financial
          details, health information, or anything else you would not want kept.
        </p>

        <h2>Retention and deletion</h2>
        <p>
          Conversation data is kept for as long as it is useful for training. If you want
          yours removed, email <a href="mailto:gishnum.work@gmail.com">gishnum.work@gmail.com</a>{" "}
          with the identifier in your <code>gargi_sid</code> cookie and we will delete every
          row tied to it. If any of it has already gone into a published dataset, we will say
          so plainly rather than pretend otherwise.
        </p>

        <h2>Disclaimer and limitation of liability</h2>
        <p>
          {M1.name} is a {M1.params}-parameter research preview with a {M1.contextTokens}-token
          context. It is provided <b>&ldquo;as is&rdquo;, without warranties of any kind</b>,
          express or implied. Its output is frequently wrong, incomplete, or nonsensical, and
          must not be relied on for any medical, legal, financial, or otherwise consequential
          decision.
        </p>
        <p>
          You are responsible for anything you do with the output. To the fullest extent
          permitted by law, {SITE.name} and its maintainers accept <b>no liability</b> for any
          loss or damage arising from your use of {M1.name} or reliance on the content it
          generates.
        </p>

        <h2>Open data</h2>
        <p>
          Some of this may eventually be released as an open Malayalam instruction dataset,
          because that is the point of the project. Anything released is reviewed first and
          stripped of personal information.
        </p>
      </div>
      <Footer />
    </div>
  );
}
