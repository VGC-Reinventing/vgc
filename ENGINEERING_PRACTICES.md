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
2. **There is deliberately no GitHub Actions CI.** It would be redundant with
   Vercel's push build, and it was removed rather than left parked. One gap is
   accepted as a consequence: Vercel runs `npm run build` but **not** `npm test`,
   so vitest runs only in the local pre-push hook. If this project ever gains a
   second contributor or machine, that is the trigger to reconsider — until then
   the hook is the test gate, so keep it enabled (`git config core.hooksPath
   .githooks`).

### Never grep command output for success strings only.

```bash
vercel --prod --yes | grep -E "Aliased|ready"   # WRONG
```

On failure this matches nothing, prints nothing, and reads as success. Check exit
codes, or print the tail of the output. Same incident as above: this is *why* the
failed deploy went unnoticed.

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

### Omitted numeric inputs resolve to `0`, never `null`.

So `$input.foo ?? $fallback` never fires for an absent `int`/`decimal`.

```xanoscript
int window?=1                    // declare an explicit default, or
                                 // treat 0 as "not supplied" in the stack
```

Hit as TR-280 (`totp_verify_code` clock-drift window) and TR-284 (proposal
acceptance — the revenue split summed to 0, so **every** proposal acceptance from
the admin UI failed and the member-proposal pipeline was dead).

### Compound `A != null && A.field == true` evaluates to `null`.

Not `false` — `null`, silently. Split the null check into its own `conditional`
gating a `var.update`. Documented in `enforce_role.xs`; hit again as TR-281
(admin TOTP login always fell back to the email path after enrolment).

### `startsWith` is not a valid filter inside a `where` clause.

It fails input validation, so the endpoint 400s for every caller before running.
Use `in` against an explicit list, or `includes`. Hit as TR-288 (`pts/audit-log`).

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

### Scoped pushes emit bogus "table does not exist" warnings.

Pushing a subset of files without their table definitions warns e.g.
`db.* → table "loans" does not exist` for tables that plainly do exist. The push
still succeeds — verify the endpoint by calling it rather than trusting the
warning either way.

---

## 4. Free-plan constraints

- **API rate limit: 10 requests / 20 seconds.** Bulk operations and test sweeps
  must be paced or they fail with 429 — and a 429-starved screen renders
  skeletons that pass a naive audit (§1).
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

Likewise use **real image files** of varied and hostile aspect ratios (64×64
through 2400×1800, plus 1600×600 and 600×1600) rather than hotlinked
placeholders, and verify rendered `<img>` elements for distortion, overflow and
broken loads.

Credentials, IDs and the current data inventory live in
`.local-archive/AUTH_REFERENCE.md` (gitignored, machine-local — never committed).
