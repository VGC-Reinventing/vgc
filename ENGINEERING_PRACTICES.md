# VGC Engineering Practices

Hard-won rules for working on this project. Each one exists because breaking it
cost real time or shipped a real defect — the incident is cited so the rule can
be re-evaluated rather than followed blindly.

Scope: `FrontEnd/` (Vite + React + TS, deployed to Vercel at **baroda.app**) and
`XANO/` (XanoScript backend, workspace `161992`, instance
`x8ki-letl-twmt.n7.xano.io`).

---

## 1. Verification

### Use the repo's own scripts. Never a hand-rolled equivalent.

In `FrontEnd/`:

```bash
npm run build     # tsc -b && vite build   <- the real gate
npm test          # vitest, 10 tests, ~130ms
npm run typecheck # tsc -b --noEmit
```

**Do not use `npx tsc --noEmit`.** It is *not* equivalent to `tsc -b`: build mode
with project references catches errors bare `--noEmit` misses.

> **Incident (2026-07-25):** a mistyped generic helper in `src/api/admin.ts`
> passed `npx tsc --noEmit`, broke `tsc -b`, failed the Vercel deploy, and had
> already been pushed to `main`.

Enforced by `FrontEnd/.githooks/pre-push` (runs build + tests). Enable per clone:

```bash
git config core.hooksPath .githooks
```

**Vercel is git-connected: every push to `main` triggers a production build.**
Verified from the deployment history — pushes carry `githubDeployment: 1` and a
`frontend-git-main-…` branch alias. A failed build is *not* promoted, so a broken
commit on `main` leaves production serving the last good deploy.

That means the build is already checked on every push, by Vercel, whether or not
GitHub Actions exists. The broken commit of 2026-07-25 produced three
`state: ERROR` deployments and never reached `baroda.app`.

Two consequences:

1. **Do not run `vercel --prod` after pushing.** The push already deploys.
   Doing both creates two production deployments per commit — which is exactly
   what happened throughout 2026-07-25 (visible in the history as pairs, one
   with full github metadata and one with `actor: claude-code…`). Deploy via
   push; use the CLI only to deploy something that is deliberately *not*
   committed.

   **But confirm the push actually produced one.** On 2026-07-27 a push to
   `main` (`4c5d35a`) landed on GitHub and no deployment was ever created —
   the hook simply did not fire, and production sat on the previous commit
   with nothing reporting a failure. So the check after a push is not "did the
   build pass" but "does a deployment for *this SHA* exist":

   ```bash
   npx vercel ls --yes | head -3          # newest deployment + age
   ```

   If there is none after a few minutes, `npx vercel --prod --yes` from
   `FrontEnd/` deploys the committed tree — that is the exception to the rule
   above, not a contradiction of it. Verify by fetching something from the new
   build off `baroda.app`, not by reading the CLI's output.
2. **There is deliberately no GitHub Actions CI.** It would be redundant with
   Vercel's push build, and it was removed rather than left parked. One gap is
   accepted as a consequence: Vercel runs `npm run build` but **not** `npm test`,
   so vitest runs only in the local pre-push hook. If this project ever gains a
   second contributor or machine, that is the trigger to reconsider — until then
   the hook is the test gate, so keep it enabled (`git config core.hooksPath
   .githooks`).

### `baroda.app` is the only serving origin. Everything else 308s to it.

Four hostnames point at the Vercel project. Exactly one returns content:

| hostname | behaviour |
|---|---|
| `baroda.app` | serves the app — the canonical origin |
| `www.baroda.app` | 308 → `baroda.app` |
| `vadodara.app` | 308 → `baroda.app` |
| `www.vadodara.app` | 308 → `baroda.app` |

`vadodara.app` was bought 2026-07-26 as an alias, not a second brand. The
redirects are **Vercel project-domain redirects** (edge-level, set per domain via
`PATCH /v9/projects/{id}/domains/{domain}` with `redirect` + `redirectStatusCode`)
— *not* rules in `vercel.json`. So they apply to every deployment, need no
rebuild, and grepping the repo for them finds nothing. Check them with:

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://vadodara.app/
```

**Why one origin and not several:** the auth token lives in `localStorage`
(`src/store/auth.ts`), which is per-origin. Two hostnames both serving 200 means
two separate sessions, two separate PWA installs with separate caches, and
duplicate content for crawlers. A member logged in on one would appear logged out
on the other. Any future domain gets a 308, not a second front door.

Path is preserved through the redirect, so emailed deep links survive it — but
generate them against `baroda.app` anyway rather than relying on the hop.

### Never grep command output for success strings only.

```bash
vercel --prod --yes | grep -E "Aliased|ready"   # WRONG
```

On failure this matches nothing, prints nothing, and reads as success. Check exit
codes, or print the tail of the output. Same incident as above: this is *why* the
failed deploy went unnoticed.

**Grepping for a success string is just as wrong as grepping for silence**, and
`npm run build` will catch you out specifically:

```bash
npm run build | grep -E "built in"     # WRONG — matches on a FAILING build
```

Vite prints `✓ built in 1.70s` when the bundle is written, then runs the PWA
plugin, which can fail *afterwards*. The success line is already on stdout by
then, and `grep` in a pipeline reports its own exit status, not the build's.

> **Incident (2026-07-26):** the app bundle crossed workbox's 2 MiB precache
> limit and `vite build` started exiting non-zero. Two consecutive "verified"
> builds reported `✓ built in` and were treated as passing; the failure only
> surfaced when the pre-push hook refused the push.

```bash
npm run build > /tmp/build.log 2>&1; echo "EXIT: $?"   # RIGHT
```

### Never `git push` in the same command as a deploy.

Order is: **verify → commit → push → deploy**, checking each step. Pushing
concurrently with a deploy means nothing gates the push.

### A check that cannot fail is not a check.

Before trusting a pass, prove the check can fail — feed it a known-bad input and
confirm it reports the failure.

> **Incident (2026-07-25):** the mobile-layout sweep reported "0 defects across
> 75 routes" **four** separate times while measuring nothing:
> 1. `page.evaluate(fn, a, b)` passed two args to a one-arg function; the audit
>    threw and a `catch` swallowed it.
> 2. An injected simulation stylesheet silently failed to apply, so PWA
>    safe-area mode measured the unpadded layout.
> 3. The dev server had been killed during cleanup, so every route redirected
>    and still reported clean.
> 4. Xano's rate limit starved screens into rendering skeleton placeholders,
>    which sweep clean and prove nothing.
>
> It only became trustworthy after a control run with the fix stripped out
> confirmed it flagged defects on nearly every route.

Practical form: assert the subject actually materialised (not merely that no
error was thrown), fail loudly when a measurement precondition is unmet, and pace
requests so starvation cannot masquerade as a pass.

### Safe-area insets are only checkable through the `--sa-*` variables.

`env(safe-area-inset-*)` cannot be set from script, so on a desktop browser it
is 0 and a padded and an unpadded layout measure identically. Every call site
therefore reads `--sa-top` / `--sa-right` / `--sa-bottom` / `--sa-left`, defined
once in `FrontEnd/src/styles/tokens.css`; a check overrides those on `:root` to
reproduce a notched iPhone (47px top / 34px bottom), and asserts the top-edge
element's computed `padding-top` actually changed before trusting anything else.
Reusable audit: `.local-archive/tools/safearea_audit.js`. **Never write a bare
`env()` at a call site** — it re-creates a layout no test can see.

The other half of the same lesson: **do not express "nothing above me paints the
top edge" as a structural selector.** `:first-child` is a claim about the DOM at
the time of writing, and it decays silently — no error, no failing test, just a
rule that stops matching.

> **Incident (2026-07-26):** the redesign gave the tab shell's scroll region the
> top inset via `.vgc-phone > .vgc-screen:first-child`. Two commits later the
> motion system inserted the pull-to-refresh indicator as `.vgc-phone`'s first
> child. The selector then matched **zero** elements, every tab screen lost its
> top inset, and on a home-screen PWA the greeting and the bell rendered under
> the status bar. It shipped and was only caught from a member's screenshot.

Match on the condition itself instead — here "no sticky header inside me" — and
prefer `:last-child`-style tests only when the sibling being tested for is the
thing that owns the edge.

### Never size the app shell in `vh`/`dvh` on iOS. Fix it to the viewport.

`height: 100dvh` is resolved against a viewport iOS is still settling on at
launch and revises on every toolbar transition. The shell came out short, which
made the *document* scrollable, and everything downstream of that looked like a
different bug.

> **Incident (2026-07-26):** on the first open of the installed PWA the bottom
> nav sat well above the bottom of the screen and a scroll "over the nav"
> snapped it into place. The same document scroll was also stealing the
> pull-to-refresh drag — iOS sent `touchcancel` mid-pull, the pull ended below
> its threshold, and the gesture animated perfectly while refreshing nothing.

`position: fixed; inset: 0` on the shell plus `body { overflow: hidden }` (phone
widths only — the ≥600px device mock still needs the page scrollbar). Nothing to
mis-measure, and only `.vgc-screen` scrolls.

### A standalone iOS web app is given less screen than it appears to have.

With a translucent status bar, the layout viewport is the screen *minus* the
status-bar height, still anchored at the physical top. The leftover strip at the
bottom belongs to iOS: it holds the home indicator, it is painted from the
**manifest's `background_color`** — not `<meta name="theme-color">` — and page
content cannot be drawn into it. Safari on the same device has no such strip,
which is the tell that it is the viewport and not the layout.

> **Incident (2026-07-27):** 59px of dead space under the bottom nav on a
> 393×852pt iPhone: viewport ended at y=793, screen 852, and 59 is that device's
> top inset. The first fix extended the shell past 793 with a negative `bottom`.
> The nav's box duly moved down 59px — and its labels disappeared, because
> nothing below the viewport renders. **The strip cannot be reclaimed.**

Two things follow, and both are in the code:

1. Colour the strip so it is not a hole. `background_color` matching the bottom
   bar makes it read as the bar continuing to the edge of the screen.
2. Do not reserve the home-indicator inset *again* inside the viewport — the
   strip already is that clearance. `--sa-bottom-eff` (tokens.css) subtracts the
   measured strip from `env(safe-area-inset-bottom)`, and every bottom bar uses
   it instead of the raw inset. Reserving both stranded the tab labels ~100px
   above the bottom of the screen.

`lib/standaloneViewport.ts` measures the strip as `screen.height - innerHeight`.
**Measure it; never assume it equals the top inset** — on an iOS that reports the
viewport correctly the difference is 0 and everything falls back to the plain
inset. Guard the reading: standalone only, portrait only (iOS reports
`screen.height` orientation-independently, so the landscape subtraction is
nonsense), and reject anything implausible.

### Read the screenshot's pixels instead of eyeballing it.

Both of the above were diagnosed by decoding the user's screenshot in a canvas
and printing the colour transitions down one column, clear of text. The device
pixel row of each boundary, divided by the DPR, gives exact CSS coordinates to
compare against a local measurement. Eyeballing the same image had produced an
estimate 60px out — enough to have chased the wrong cause.

```bash
# serve the image somewhere http (a file:// canvas is tainted and cannot be read)
cd .playwright-mcp && python3 -m http.server 8899
```

### A sticky box rests against the scroll container's *content* box.

Not its scrollport. `bottom: 0` on a bar inside `.vgc-screen` parks it
`padding-bottom` (32px) above where it looks like it should be, and that gap
reads as a floating card.

> **Incident (2026-07-26):** the Buy now bar sat ~66px above the bottom nav —
> 32px from this, plus a home-indicator inset it added itself on top of the one
> `.vgc-nav` already owns. Measured at 634→715 inside a 747px region.

Offset by the padding (`bottom: calc(-1 * var(--s-8))`) and let exactly one
element per edge carry the safe-area inset.

### Layout checks are not correctness checks.

The route sweep verifies overflow, clipping, opaque bars, tap targets and safe
areas. It cannot tell a loaded list from an errored one: a screen whose data call
500s still renders its header and chrome and reports "ok".

> **Incident (2026-07-25):** `/loans` swept clean while `GET /loans/me` was
> returning a fatal error — the screen chrome rendered, the list did not.

Exercise endpoints directly as well as rendering screens.

---

## 2. XanoScript quirks

These are language/platform behaviours, not bugs in our code. All have bitten
more than once.

### Never do raw arithmetic with `now` or a timestamp field.

`now + n`, `now - n`, `now - $row.some_timestamp` all throw a fatal
**"Not numeric."** Cast explicitly, or use the timestamp filters:

```xanoscript
// WRONG
value = now + $seconds
value = ($sess.scheduled_start - now)

// RIGHT
value = now|add_secs_to_timestamp:($seconds|to_int)
value = ((now|to_int) - ($sess.scheduled_start|to_int))
```

Hit **seven** times: TR-238 (group delete hold), TR-282 (marketplace
proof-of-delivery), TR-285 (course amendments), TR-287 (rate announcements),
TR-289 (`loans/me`, investment overdue-request, contract escalate,
admin investments). Several were latent — they only fire once data reaches the
relevant state, so a passing smoke test proves little.

Audit for regressions with:

```bash
cd XANO && grep -rnE "(now[[:space:]]*[+-]|[+-][[:space:]]*now)" --include="*.xs" . | grep -v archive
```

(Quote the `--include` glob — unquoted, zsh expands it and grep silently scans
nothing, which is its own instance of §1's "a check that cannot fail".)

### Omitted inputs are never `null` — of any type.

`$input.foo ?? $fallback` **never fires** for an absent input. Each type has its
own empty value, and none of them is null:

| declared type | value when omitted |
|---|---|
| `int` / `decimal` | `0` |
| `text` / `enum` | `""` |
| `bool` | `false` |
| `int[]` / `json` | `[]` / `{}` |

So never write `?? $row.x` against an input. Start from the stored value and
override it inside a `conditional` that tests for a *meaningfully supplied*
value (`!= ""`, `> 0`, `|count > 0`).

Hit **six** times, and the failure gets worse the further you go down that table:

- TR-280 `totp_verify_code` clock-drift window (`int`).
- TR-284 proposal acceptance revenue split (`decimal`) — summed to 0, so every
  acceptance from the admin UI failed and the member-proposal pipeline was dead.
- TR-294 proposal acceptance category (`int[]`) — same endpoint, missed by
  TR-284; every accepted listing was uncategorised.
- TR-300 donor publication amount (`decimal`) — every public donor record was
  published showing 0.
- TR-302 activity-catalog PATCH (`text`, `int`, **`bool`**) — the destructive
  one. A PATCH that set a single field overwrote every field the caller did not
  mention, blanking the label, zeroing the reward and flipping `active` to
  false. A partial update silently deleted data.

**Booleans have no safe form.** An omitted `bool` is indistinguishable from an
explicit `false`, so a partial update cannot honour one. Where a PATCH must
support "leave this alone", declare the field as a tri-state
`enum { values = ["true","false"] }` and map it in the stack (TR-302).

### `type?` means nullable; `name?` means optional. They are not the same.

`int[]? evidence_file_ids` is nullable but **still required to be present** — omit
the key and Xano 400s with `Missing param`. `int[] evidence_file_ids?` is the
optional form. Hit as TR-305: `POST /contracts/{id}/dispute` used the first form
while its three sibling dispute endpoints used the second, so no contract-level
dispute could be opened. The same required-but-nullable trap is why
`POST /expenses` needs `reason`/`platform_ref` present-but-null.

### Compound `A != null && A.field == true` evaluates to `null`.

Not `false` — `null`, silently. Split the null check into its own `conditional`
gating a `var.update`. Documented in `enforce_role.xs`; hit again as TR-281
(admin TOTP login always fell back to the email path after enrolment).

### `startsWith` is not a valid filter inside a `where` clause.

It fails input validation, so the endpoint 400s for every caller before running.
Use `in` against an explicit list, or `includes`. Hit as TR-288 (`pts/audit-log`).

### Admin access needs a live 2FA session, and three constants define it.

`enforce_role.xs` gates admin endpoints on more than `is_admin`: it also
requires `admin_totp.last_login_at` to be inside a window, and that field is
written **only** by `admin/2fa/verify` — never by plain `/login`. So an admin
who signs in through the member screen holds a token every admin endpoint
refuses, with the error naming an HTTP method at whoever is running the
platform.

The window is **2592000s (30 days)** as of 2026-07-27, up from 86400s. Three
values have to move together, or the pair goes wrong in one of two ways:

| where | what |
|---|---|
| `function/quick_start/enforce_role.xs` | the 2FA window |
| `api/admin/admin/2_fa/verify_POST.xs` | token `expiration` |
| `api/admin/admin/2_fa/recover_POST.xs` | token `expiration` |

A window **longer** than the token buys nothing — the token dies first and the
admin is signed out regardless. A window **shorter** than the token strands a
signed-in admin in a console that refuses every screen inside it. Member login
(`api/authentication/login_POST.xs`) is separate and stays at 86400.

The frontend mirrors this: `setToken(token, { adminSession: true })` on the two
2FA success paths, and `RequireAdmin` sends an admin without that marker to
`/admin/login`. The marker is only sound while the token and the window are the
same span — one more reason they move together.

### Date-only bounds parse to that day's midnight.

`created_at <= to` with `to = "2026-07-25"` excludes all of 25 July. Widen the
bound to `T23:59:59.999Z`. Hit as TR-286 — every admin report silently omitted
the current day and read as zeros.

---

## 3. Xano sync discipline

Live workspace is the source of truth; the `XANO/` tree mirrors it.

```bash
# 1. Pull to a scratch dir and diff against the tracked tree
xano workspace pull -d /tmp/xano-check
diff -rq /tmp/xano-check XANO \
  -x .git -x .env -x archive -x README.md \
  -x LIVE_SYNC_STATUS.md -x SESSION_LOG.md -x .gitignore

# 2. Expect ONLY the files you changed. Copy them in, re-diff to zero.
```

To push local edits, always dry-run first and **scope with `--include`**:

```bash
xano workspace push --dry-run -i "api/path/to/file.xs"
xano workspace push --force --transaction -i "api/path/to/file.xs"
```

### Known comparator false-positives — do not push these to silence the preview.

An unscoped `push --dry-run` reports updates for files that were exported from
that very workspace and are byte-identical in intent:

- `GET /admin/orders`
- `DELETE /files/{id}`
- `GET /investments/{id}` (historically)

This is an import/export comparator artifact, not local drift.

A pull-diff also reports `function/pts_compute_rate.xs` as differing when the
only difference is trailing whitespace on otherwise-blank lines — the exporter
emits it, the tracked copy has it stripped. Same class: ignore it, don't push it.

### Scoped pushes emit bogus "does not exist" warnings — for functions too.

Pushing a subset of files without their table definitions warns e.g.
`db.* → table "loans" does not exist` for tables that plainly do exist. The push
still succeeds — verify the endpoint by calling it rather than trusting the
warning either way.

The same happens for **cross-file function references**, and there the wording is
alarming enough to be worth naming. Pushing `reset/request-reset-link` alone
warned:

```
=== Unresolved References ===
  WARNING   query   reset/request-reset-link
            function.run → function "Quick Start/generate_magic_link" does not exist
```

"These will become placeholder statements after import" would mean a silently
gutted function stack — password reset generating no token at all. It did not
happen: the function was untouched on the server, and the warning only means the
referenced function wasn't part of *this* push. **Verify rather than assume, in
the direction that catches the bad case** — pull the workspace back to a scratch
dir and diff the pushed file against local. Byte-identical, with the
`function.run` line intact, is the proof. A 200 from the endpoint is not: the
call sits inside a `try_catch`, so a placeholder would be swallowed and still
return 200.

---

## 4. Free-plan constraints

- **API rate limit: 10 requests / 20 seconds — one bucket for the whole
  instance.** Measured 2026-07-26, not assumed. It is *not* per token, per
  session or per IP: exhausting the budget with one member's token immediately
  429s a second member's token, and an unauthenticated `GET /config` too. So
  spreading test load across accounts or machines buys nothing.

  Consequences worth holding on to:

  - **The metadata API (`/api:meta/...`) is on a separate budget.** It answered
    200 while the app API was fully throttled. Use it for verification, row
    counts and fixture seeding (`addTableContentBulk`, `patchTableContentBulk`
    write many rows in one request) and reserve app-endpoint calls for the
    behaviour actually under test. Metadata writes bypass business logic, so
    they are for fixtures — never for contract tests.
  - **Pace browser sweeps at ~24s per route.** Bulk operations and test sweeps
    must be paced or they fail with 429 — and a 429-starved screen renders
    skeletons that pass a naive audit (§1). At 7s per route, 45 of 52 routes
    came back rate-limited.
  - **Never retry a 429.** The default TanStack backoff is far shorter than the
    20s window, so retries are throttled too and one over-budget request
    becomes three. `lib/queryClient.ts` allows a single retry delayed past the
    window; keep it that way.
  - **~30 requests/minute is the whole platform's ceiling.** Budget polling
    against it: every `refetchInterval` needs a `document.hidden` guard, and a
    10s poll costs 6 req/min — 20% of the instance — per open tab.
- **Email** goes through **Resend** (`no-reply@baroda.app`), not Xano's native
  sender, which only delivers to the workspace owner. Key is the workspace env
  var `RESEND_API_KEY`.
- **File uploads** go to **Cloudinary** via an unsigned preset; Xano file
  storage is not available on this plan. Only the returned `secure_url` is
  stored.

---

## 5. Test data

Test members are `vgcreinventinggaming+vgctest.<name>@gmail.com`, all sharing one
password, all real deliverable inboxes (aliases of the admin Gmail).

**Populate through the real UI, not by poking the API.** API-shaped test data
hides contract mismatches.

> **Incident (2026-07-25):** a group post written via the API stored
> `media: [url]`, but the app reads `media: { urls: [...] }`. The image silently
> never rendered. Only exercising the actual upload path surfaced it.

When a script must drive the API directly for volume, **copy the payload out of
the frontend's own `api/*.ts` module** rather than writing what the endpoint
looks like it wants. Population then doubles as a contract test.

> **Incident (2026-07-26):** doing exactly that turned up **nine** endpoints the
> app could never successfully call — proof of delivery, loan approve and
> write-off, expense settle, donor publish, investor payout mark-paid,
> marketplace partial-refund, sponsorship dispute, course amendments — each
> failing on a required input the screen never sent. Several sat behind buttons
> that had been "exercised" in an earlier pass by calling the endpoint with
> backend-shaped input, which is why they read as working.

A cheap way to find the rest of that class without firing anything:

```bash
# every write endpoint's REQUIRED body inputs, to diff against what the FE sends
grep -A40 'input {' XANO/api/**/*_POST.xs   # or scratchpad/contract_audit.py
```

Likewise use **real image files** of varied and hostile aspect ratios (64×64
through 2400×1800, plus 1600×600 and 600×1600) rather than hotlinked
placeholders, and verify rendered `<img>` elements for distortion, overflow and
broken loads.

## Starting a session

Read **`.local-archive/SESSION_START.md`** first. It is the single entry point
for every credential and tool on this project — Xano metadata token and CLI,
admin 2FA (including the TOTP secret), the test-member roster, Cloudinary,
Resend, Vercel — plus the free-plan constraints and the current state of the
data. `AUTH_REFERENCE.md` alongside it holds the longer-form auth flows and the
test-data inventory; `RENDER_LOG.md` holds the sweep history.

Reusable tooling is preserved in `.local-archive/tools/` (Xano API wrappers, a
TOTP-aware admin login, the paced route sweeps, the required-input contract
audit, image generators, and a table-name → id map).

All of `.local-archive/` is gitignored and machine-local — **never commit it**,
and never paste its contents into a commit message, issue, PR, or any external
service. Verify with `git check-ignore -v .local-archive/SESSION_START.md`.
