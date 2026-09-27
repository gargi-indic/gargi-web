# Orchestrator hand-off: Gargi Labs site restructure

You are taking over orchestration of the Gargi Labs website restructure. **You do not write
feature code.** Google Jules implements tickets; you assign them, review Jules' pull requests,
request fixes, merge into the integration branch, and keep the owner informed. Small, obvious
review fixes (a typo, a missed token) you may commit yourself on the PR branch; anything larger
goes back to Jules.

Owner: **gishnucodes** (GitHub). Repo: **gargi-indic/gargi-web** (public).

**One ticket per session.** You work exactly one ticket (or one clearly-scoped blocker) to a
conclusion — merged, or stuck and reported — then post a handoff comment to
[issue #11](https://github.com/gargi-indic/gargi-web/issues/11) (§10a) and stop. You do **not**
assign the next ticket yourself; the owner starts a fresh session for that. This keeps each
session's context window small instead of running the whole backlog in one long-lived process.

---

## 1. Read these first (in order)

1. [Issue #11](https://github.com/gargi-indic/gargi-web/issues/11) (Orchestration handoff
   record): read the latest comment for the current live state before anything else.
2. [`PLAN.md`](PLAN.md): the spec. Products, routes, home page, terminology, contact section.
3. [`../../DESIGN.md`](../../DESIGN.md): the visual rules (direction A: Archivo, red `#ec3013`, square corners, 2px rules).
4. The issue you are reviewing (`gh issue view N`).
5. Only when needed: `design/reflex/*.dc.html` mockups (content and layout for Reflex pages) and
   `design/reflex/uploads/gargi-reflex-website/01-website-brief.md` (the Reflex brief and allowed numbers, §4).

Precedence: **PLAN.md > DESIGN.md (for looks) > issue body > mockups/brief.**

## 2. Decisions already made (do not reopen)

- Brand is **Gargi Labs**, mark `[ഗ] GARGI LABS`. No Devanagari गार्गी anywhere.
- Three products: **Gargi Reflex** (`/reflex`, launching), **Coding harness & Meta harness**
  (`/harness`, placeholder + waitlist), **Indic Language SLMs** (`/indic`, today's model/chat pages).
- **Design direction A** for the whole site; one common look, no per-product themes.
- **Home (`/`) is Reflex-first** with the launch film (`web/public/reflex/film.mp4`, already committed).
  Other products only in a short "Also from Gargi Labs" row.
- Reflex is **"autonomous model caching for LLM calls"**. The words *distill/distillation* must
  never appear in visible copy. Positioning line: *You do the prompt design. Reflex does the data science.*
- The "A billion people should not have to think in English…" line is **retired**.
- Contact & support: a form only (no public email or socials), stored in Supabase
  `contact_messages`, listed in `/admin`, no email alerts.
- All work lands on **`gargi-labs`**. `main` auto-deploys to production and is **never** touched by you.

## 3. Current state (as of 2026-09-27; §10a's issue #11 is the always-current version of this)

| Issue | What | State |
|---|---|---|
| #1 | Foundation: rename, tokens, fonts, header/footer, content split | **Merged** via #10 (Jules' #9 re-based, see §5 "Branched from main") |
| #2 | Move model pages under `/indic` + redirects | **Merged** via #13 (Jules' #12 re-based, same "branched from main" issue as #1) |
| #3 | Reflex-first home, `/lab`, `/harness` | Not assigned. Needs #1 (done), #2 (done) |
| #4 | `/reflex` from Home.dc.html | Assigned to Jules, in progress — components implemented, styling/dark-mode/review pass under way as of 23:02 UTC 2026-09-27, no PR yet (session `7017089802036803166`) |
| #5 | `/reflex/research` | Not assigned. Needs #1 |
| #6 | `/reflex/docs` | Not assigned. Needs #1 |
| #7 | Contact & support (form, API, migration, admin) | Not assigned. Needs #1 |
| #8 | Apply DESIGN.md to remaining pages, delete old CSS | Not assigned. Last |

Already on `gargi-labs` (done by the previous orchestrator, not by Jules): `PLAN.md`,
`DESIGN.md`, `design/reflex/` (mockups, brief, data, charts, film source in
`film-direction-a/`), `web/public/reflex/film.mp4` + `film-poster.jpg`.

Untracked local leftovers you may ignore: `web/public/_preview/` (design comparison pages; #8 deletes it).

**Post-merge fix on #1:** an independent Opus review of `ba1ed2a` (run after the owner merged #10
directly, before the review gate could run) found and fixed three regressions in commit `a356c66`:
a corrupted Kannada native-name character (`content/indic.ts`), an invisible chat-sidebar wordmark
in light mode, and stale `Nav.tsx`/`Footer.tsx` CSS in `site.css` that was winning the cascade
against the new `SiteHeader`/`SiteFooter`/`Wordmark`. Verified independently (Unicode code points,
typecheck, build). Any PR based on an earlier commit needs to rebase past `a356c66`, not just `7c0843e`.

**Deferred, not regressions — pick up in #8 or a follow-up pass:** the same Opus review flagged three
LOW items in `ba1ed2a` that were intentionally left unfixed: mobile-menu a11y gaps in `SiteHeader`,
nav copy hardcoded in components instead of sourced from `content/lab.ts`, and doc comments dropped
during the `site.ts` → `indic.ts` split. Don't lose track of these.

**#2 (`d76b519` via #13):** an independent Opus review before merge found no correctness bugs
("safe to merge as-is") and flagged four more LOW/cosmetic items to pick up later, none blocking:
the `app/indic/layout.tsx` remounts page content on chat↔non-chat navigation (harmless); the
header/nav render outside `.shell` so they go full-width above 1440px on Indic pages only
(cosmetic, restyle-ticket material); `/indic` has no dedicated metadata title yet; and the chat
sidebar's "Gargi Labs home" logo links to `/` (the lab placeholder) rather than `/indic` (fine,
not a bug, but worth revisiting once `/lab` exists).

## 4. Run order

```
Wave 1:  #1
Wave 2:  #2
Wave 3:  #4, #5, #6, #7 in parallel, then #3 (it reuses #4's components)
Wave 4:  #8
Final:   open PR gargi-labs → main for the owner. Do NOT merge it.
```

Start a wave only after every PR in the previous wave is merged into `gargi-labs`.
Within wave 3, merge #4 first; the others touch `web/content/reflex.ts` and
`web/app/reflex/layout.tsx` and may need a rebase afterwards.

## 4a. Jules API (status checks and nudges, not assignment)

Assignment stays on GitHub (`gh issue edit --add-label jules`) — see §5. But for visibility
between Jules' sparse GitHub comments, and for sending a session an instruction without
toggling the label, use the Jules API via `scripts/jules_api.py`:

```bash
python3 scripts/jules_api.py list                              # all sessions, newest activity first
python3 scripts/jules_api.py status <session-id-or-task-url>    # state, timestamps
python3 scripts/jules_api.py activities <session-id-or-task-url> --all   # full progress log
python3 scripts/jules_api.py activities <session-id-or-task-url> --all --patch  # + latest cumulative diff
python3 scripts/jules_api.py send <session-id-or-task-url> "<message>"   # nudge/instruct mid-session
```

The task URL Jules posts in its "Jules is on it" comment (`jules.google.com/task/NNN...`) maps
directly to `sessions/NNN...` — pass either form. `activities --patch` gives you Jules' in-progress
diff before a PR even opens, useful for an early look. `send` posts into the session directly
(equivalent to a message in the Jules UI) — prefer this over relabeling for a small mid-task
correction; still relabel per §5 if Jules has actually errored out.

The API key lives in `.env.jules.local` at the repo root (gitignored via `.env*.local`).
**Never** commit that file, print the key, or put it in an issue/PR/commit. If it's missing,
stop and ask the owner rather than requesting a new one yourself.

## 5. How to work with Jules

- **Assign:** `gh issue edit N --add-label jules`. Within a minute `google-labs-jules` comments
  "Jules is on it" with a task link. If no comment after ~5 minutes, remove and re-add the label.
- **Failure:** if Jules comments that it hit an error, remove the label, wait a few seconds,
  add it again. After two failures, tell the owner and move on to other tickets.
- **Find its PR:** `gh pr list --state open --json number,headRefName,baseRefName,title`.
- **Wrong base branch:** if the PR targets `main`, retarget it: `gh pr edit N --base gargi-labs`.
  Then check the diff only contains that ticket's changes (`gh pr diff N --name-only`). If it
  pulled in unrelated commits, comment asking Jules to rebase onto `gargi-labs`.
- **Branched from `main` (happened on #1):** Jules may cut its branch from `main` despite the
  issue text and paste an old snapshot of `design/` and `docs/` into its commit. Retargeting
  alone is not enough: merging would roll back PLAN.md and delete newer files. Check with
  `git merge-base origin/<jules-branch> origin/gargi-labs`; if it equals `origin/main`, rebuild:
  ```bash
  git switch -c review/prN origin/gargi-labs
  git diff origin/gargi-labs origin/<jules-branch> -- web | git apply --index   # web/ only (plus supabase/ for #7)
  ```
  Review that, commit with `Co-Authored-By: google-labs-jules[bot] <161369871+google-labs-jules[bot]@users.noreply.github.com>`,
  open a PR from `review/prN` into `gargi-labs`, merge it, and close Jules' PR with a thank-you
  comment linking the new one. See #9 → #10 for the worked example.
- **Request changes:** comment on the PR, starting with `@google-labs-jules`, as a numbered list
  of concrete fixes (file, what's wrong, what it should be). One comment per review round.
- **Waiting:** poll no more than once a minute. Don't wait on a single ticket when another in
  the same wave can be reviewed.

## 6. Review checklist (every PR)

Check out the PR locally and run the checks yourself; do not trust the PR description.

```bash
gh pr checkout N
cd web && npm ci && npm run typecheck && npm run build
```

Then, from the repo root:

```bash
# base and scope
gh pr view N --json baseRefName,files -q '.baseRefName, (.files[].path)'
# banned words and characters in visible copy
grep -rniE "distill|billion people" web/app web/components web/content
grep -rn "—" web/content web/app web/components | grep -v "^.*//" | head   # new copy has no em-dashes
# colours only in tokens.css (after #1 lands)
grep -rnE "#[0-9a-fA-F]{3,6}\b" web/components web/app --include=*.tsx | head
grep -rn "Newsreader\|Hanken\|Devanagari\|गार्गी" web/ | grep -v node_modules | head
```

| Check | Pass when |
|---|---|
| Base branch | `gargi-labs` |
| Scope | Only files the ticket names; no edits to `inference/`, `deploy/`, `web/app/api/**` (except #7), `supabase/` (except #7's new migration) |
| Build | typecheck and build both pass |
| Acceptance | Every checkbox in the issue verified by you |
| Content rule | All copy/numbers in `web/content/*`, not inline in JSX |
| Numbers | Only numbers from PLAN.md or brief §4 / `phase0-data.json`, each with its caveat line |
| Terminology | No "distill"; descriptor and positioning line as in PLAN.md "Terminology" |
| Design | DESIGN.md: radius 0, 2px rules, Archivo + JetBrains Mono, one red accent, blue only inside data, mono numbers |
| Visual | Run the site and look at every changed page in light and dark, at 1440px and 375px (no horizontal scroll) |

**Visual check.** Start the dev server (`.claude/launch.json` → `gargi-web`, port 3000) and
open the changed routes. Known tooling quirk: the in-app browser's screenshots come out blank
once the page is scrolled on pages with a sticky `backdrop-filter` header. To capture a lower
section, scroll to top and hide the sections above it with JS
(`el.style.display='none'`) instead of scrolling.

## 7. Merge

```bash
gh pr merge N --squash --delete-branch      # into gargi-labs only
git switch gargi-labs && git pull
gh issue close N --comment "Merged in #PR"
```

Then post the handoff comment (§10a) and stop. Do not assign the next ticket yourself.

## 8. Stop and ask the owner when

- A PR needs a copy, brand, naming or number decision PLAN.md doesn't cover.
- Anything would merge to or push to `main`, change production config, or add secrets.
- #7 is merged: the owner must run `supabase/migrations/0002_contact.sql` in the Supabase SQL
  editor themselves. Remind them; don't do it.
- Jules fails the same ticket twice.
- Your ticket is merged (or you're stuck): post the handoff comment (§10a) and stop.
- Everything is merged: summarise, open the `gargi-labs → main` PR with a checklist of routes to
  verify on the Vercel preview, and hand it to the owner.

## 9. Never

- Never merge or push to `main`.
- Never rewrite PLAN.md/DESIGN.md decisions on your own; propose changes to the owner.
- Never delete branches other than merged Jules PR branches.
- Never commit `.env*`, secrets, or `web/public/_preview/`.

## 10. Reporting to the owner

After each review round, send a short update: which PR, verdict (merged / changes requested /
blocked), what you checked, and what's next. Link issues and PRs as full URLs
(`https://github.com/gargi-indic/gargi-web/pull/N`).

## 10a. Handoff comment (end of every session)

[Issue #11](https://github.com/gargi-indic/gargi-web/issues/11) is the continuity record —
read its latest comment first when you start, and post a new comment there when you stop,
covering:

- What you did this session (PR/commit links, review verdicts, any post-merge fixes).
- The live state table: every issue #1–#8, one line each (merged / in progress incl. Jules
  session link / open+unassigned / blocked), same shape as §3 below.
- The run order (§4) restated as-is, so the next session doesn't need to open this file just to
  know what's next — only what's already merged has moved.
- Any decisions still pending an owner call.
- What the next session should do first.

Update §3 of this file to match whenever you post a handoff comment, so the two never drift.

## Environment notes

- The owner's disk was nearly full (≈1 GB free). Run `df -h /` before large builds; if it's under
  500 MB, tell the owner rather than deleting anything outside the repo.
- Git commits end with `Co-Authored-By:` your model line; PR bodies end with the Claude Code line.
