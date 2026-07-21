# VGC Reinventing — Fix Session Prompt

Use this file as the opening instruction for the next (and every subsequent) fix session. It is the fix-phase equivalent of `E2E_TEST_SESSION_PROMPT.md` — read that file's history for context on how the defects here were found, but do not re-run it; this is a different phase with different rules (see below).

---

You are the lead fix engineer for VGC Reinventing: React 18 + TypeScript + Vite PWA frontend (`FrontEnd/`) against a live Xano no-code backend (`XANO/`, workspace 161992, branch `v1`), plus a root documentation/orchestration repo at:

```text
/Users/boss/Documents/VGC
```

Three separate Git repositories exist here: root (`VGC-Reinventing/vgc`, public), `FrontEnd/` (`VGC-Reinventing/frontend`, private), `XANO/` (`VGC-Reinventing/xano`, private, sanitized). Each has its own `origin/main`.

## What phase this is

The exhaustive E2E test-and-log phase (`E2E-20260719-01`) is closed — see `E2E_EXECUTION_LOG.md`'s final "SESSION CLOSED" checkpoint. That phase found 250 defects, tracked in `TEST_REGISTER.md`. **This is now the fix-and-verify phase.** Unlike the test phase, you are authorized and expected to modify product code in `FrontEnd/` and `XANO/`.

Read, in this order, before doing anything else:

1. This file, completely.
2. `FIX_PLAN.md` — the controlling plan. It defines phase order, why that order, root-cause clusters (fixing one cluster often closes 4-7 TR-IDs at once — do not fix these one row at a time without reading the cluster context), the Definition of Done, and the sync cadence.
3. `TEST_REGISTER.md`'s Active Issues table — the authoritative, current defect list. **This is not the file to archive or treat as stale** — it is committed to continuously and is the single source of truth for what's still broken. (`E2E_TEST_PLAN.md` is a different document — the original test *plan*, which itself designates `TEST_REGISTER.md` as its defect register in its own header. They are complementary, not duplicates; don't conflate them.)
4. The resume checkpoint immediately below, to find exactly where the last session stopped.

## Resume checkpoint

**Update this section at the end of every session, in place — this is the only part of this file that changes session to session.** Overwrite the block below; do not append a history of old checkpoints here (that history lives in commit messages and `TEST_REGISTER.md`'s own Fix Summary fields).

```text
Last updated: 2026-07-22 (Phase 3 Cluster F3a complete; F3b next)
Current phase: Phase 0, Phase 1, Phase 2 (all clusters), Phase 3 Cluster
  F3a done; Phase 3 Cluster F3b (paginated-envelope crash family + missing
  ErrorBoundary) next.
Last completed fix: Phase 3, Cluster F3a. Fixed TR-200 (investment
  creation: wrong option enum values, amount->principal_inr rename,
  missing required start_date — added a real date picker), TR-201 (loan
  request: amount->amount_inr rename, added a required UPI ID field with
  no prior UI control), TR-202 (expense logging: amount->amount_inr
  rename, payment_mode enum casing, PLUS 3 more independent blockers found
  during live verification — reason/entry_type/platform_ref/
  remark_visibility are required-key-but-nullable on the live endpoint
  even though the tracked .xs source shows them as optional, remark/
  platform/reference didn't match the real field names, and expenses/me's
  monthly-bucket calc threw a fatal "Not numeric." on $e.date arithmetic
  since `date`-typed fields aren't numeric — fixed with |to_ms), TR-223
  (sponsorship creation: clean amount->amount_inr rename). The mandated
  recurrence check (grep every FE mutation sending a bare `amount:` key)
  found 4 MORE previously-uncataloged instances of the same defect family:
  TR-253 (depositSecureFunding sent amount, needs tokens; button also had
  no amount input, hardcoded to deposit 0), TR-254 (createDistributionRecord
  sent event_id, real field is event_ref_id), TR-255 (repayLoan sent
  amount, needs amount_tokens), and TR-256 (3 more $auth.role_flags-direct-
  reference instances on investments/{id}, proposals/{id}, events/{id}/
  submissions — same family as TR-204/205/206 Phase 2 — fixed via
  get_current_user). All fixed and either fully or partially live-verified
  using a fresh disposable persona (VGC75, FX-031) — created 1 real
  investment (with correct payout schedule), 1 sponsorship, 1 loan
  request, and 1 expense end-to-end, each appearing correctly in its list.
  TR-253/254/256(the 2 untested instances)/TR-255's full happy-path
  couldn't be fully live-completed (no live season exists for TR-253/254;
  TR-213 admin-approval gap blocks TR-255's full repay cycle; no proposal/
  event-submission records exist for 2 of TR-256's 3 endpoints) but each
  was confirmed to reach the correct downstream domain error instead of a
  "missing param" or fatal 500, which is the same partial-verification
  standard used throughout Phase 2.
  TWO NEW OPEN DEFECTS LOGGED, NOT FIXED THIS PASS — read before doing any
  further work on investments/sponsorships/expenses:
  (1) TR-257 (High, open): POST /investments and POST /sponsorships are
      designed as "public-or-member" (omit auth, read $auth opportunistic-
      ally). This does NOT work in this Xano version — omitting `auth`
      means the Authorization header is never decoded at all, so $auth is
      unconditionally null even for a valid Bearer token. Every submission
      is anonymous regardless of login state; member_id is never linked.
      No documented "optional-auth" mode exists to fix this with a simple
      script edit. Needs an owner decision (accept always-anonymous /
      require login / explore manual JWT decoding via security.jwe_decode
      or jws_decode, untested & higher-risk) before attempting a fix.
  (2) TR-258 (Medium, open): GET /expenses/me's dashboard breakdown
      aggregates (by_category/by_payment_mode/by_month) return null for
      every nested count/total_inr — a ??/dynamic-object-merge quirk, same
      general shape as other documented compound-expression bugs. Does
      NOT block expense creation or the flat items list; top-level
      dashboard totals are correct. Low priority, not yet isolated to a
      root cause.
  Two things to know before continuing (carried forward from Phase 2,
  still relevant):
  (1) A naive |to_lower on an uppercase currency enum is WRONG — always
      use order_currency_to_wallet_currency for currency-code mapping.
  (2) A custom Xano function calling ANOTHER custom function via
      function.run fails at runtime; never chain function.run from inside
      a function without testing it first.
  Full detail: TEST_REGISTER.md's Resolved entries (TR-200/201/202/223/
  253/254/255/256) and its Active entries (TR-257/258), plus FIX_PLAN.md
  Cluster F3a's status block.
Exact next fix: Phase 3, Cluster F3b — paginated-envelope-vs-bare-array
  crash family (TR-184, TR-195, TR-196 — 9 screens total, 5 different
  envelope wrapper keys) plus the missing root-level React ErrorBoundary.
  Read FIX_PLAN.md's Cluster F3b section in full before starting: fix
  approach is explicitly 2-part — (1) add the ErrorBoundary FIRST, since
  it unblocks safe verification of the other 8 screens and any future
  undiscovered 10th instance, then (2) fix each of the 9 screens'
  response-unwrapping to match its endpoint's actual verified envelope
  shape (verify each one live via a direct API call first — do not assume
  they share one wrapper key). TR-184 also has a bundled, unrelated
  action-body-shape bug ({approve} vs {decision}) to fix in the same
  change. Required checks include proving the ErrorBoundary itself works
  (force a deliberately-bad response and confirm a friendly fallback
  renders instead of a blank page) and completing one real Guardian
  Approvals Approve action end-to-end.
Repo sync state at last checkpoint: root/FrontEnd/XANO all ahead 0 /
  behind 0 as of root commit 22f82c8, FrontEnd commit e41f178, XANO
  commit 7fef80e (verify all three are still current before continuing).
Open blockers: none for Cluster F3b. Known gaps carried forward (not
  blockers): TR-165 (CORS) needs Xano dashboard access or a plan change.
  admin/wallets/adjust's admin-success path and the standing VGC53
  wallet-residue correction still need a real 2FA-verified admin session
  (blocked twice by the tooling safety classifier so far). DPDP erasure is
  transaction-safe but still needs an explicit owner go-ahead. TR-257/258
  (this cluster's new open findings, see above) are NOT blockers for F3b —
  unrelated code paths — but don't forget they exist.
Fixture/persona state: reuse existing disposable personas from
  E2E_FIXTURE_LEDGER.md (VGC50-VGC75) rather than creating new ones unless
  a fix needs a genuinely fresh/untouched account. VGC75 (FX-031, "Fix
  Phase3a Probe") now has real dependent records (1 investment+payout
  schedule, 1 sponsorship, 1 loan, 1 expense) that back this cluster's
  live-verification claims — do not delete without re-confirming the
  fixes independently first. VGC71-74 (Phase 2 probes) unchanged from the
  last checkpoint. VGC72 was never promoted to admin (blocked) — ordinary
  member only.
Known standing residue to correct once tooling allows: VGC53's wallet
  (E2E_FIXTURE_LEDGER.md "Known uncorrected residue" row) is intentionally
  left short 11.73 points / over-credited 11.73 tokens as live evidence of
  TR-239/240. admin/wallets/adjust is fixed in code but its live
  admin-session test is still the open gap above — correct this residue
  the moment a real admin session is available, then update that fixture-
  ledger row.
```

## Preserve the project

Before doing anything else, capture the state of all three repos:

```bash
git status --short --branch
git -C FrontEnd status --short --branch
git -C XANO status --short --branch
```

If any repo shows unexpected drift from the resume checkpoint above, investigate before touching anything — do not assume it's safe to proceed. Never reset, discard, overwrite, or force-push. See `git log` in each repo for what actually landed since the checkpoint if the state looks different than expected.

## Rules for this phase (different from the test phase)

- **Product code changes are in scope and expected** in `FrontEnd/` and `XANO/`, following `FIX_PLAN.md`'s phase order and each fix's Definition of Done (`FIX_PLAN.md` §2).
- **Follow the phase order in `FIX_PLAN.md`.** Do not skip ahead to an appealing individual bug in Phase 4 while Phase 0/1 sit open — the plan's §0 explains the dependency reasoning; Phase 2+ verification is only trustworthy once Phase 1's auth fixes land, and Phase 0 is live financial harm that outranks everything by design.
- **One fix (or one explicitly-paired fix, per the TR-204/TR-205 constraint in `FIX_PLAN.md` §2.3) per commit.** Never batch unrelated fixes.
- **Every fix must be live-verified, not just read as correct** — reproduce the exact `Steps to Reproduce` from the TR's row in `TEST_REGISTER.md` and confirm `Actual` no longer occurs. A plausible-looking diff is not a done fix; several of this register's own bugs (TR-190/191's field-name mismatches, for example) are exactly the kind of thing that looks correct on read and only a live call catches.
- **XanoScript schema changes** (add/remove/rename a column, change a type, delete a table) **require explicit user confirmation before the tool call**, per the Xano MCP's own standing instruction — this is unchanged from the test phase. Most fixes in `FIX_PLAN.md` are function-stack logic changes, not schema changes; the plan flags the few exceptions (e.g. TR-233's `display_name`/`bio` columns, if the "build" option is chosen over "remove").
- **Never touch real user data.** Use the existing disposable personas in `E2E_FIXTURE_LEDGER.md` or freshly-created ones following the same `E2E-<YYYYMMDD>-<run>-<purpose>` marker convention. Ledger any new fixture the same way the test phase did — this project's "ledger every asset ID before leaving a workflow" rule still applies.
- **Financial fixes require the reconciliation proof**: `sum(debits) = sum(credits) + documented fee`, no unexplained negative wallet, one logical action = one side-effect set, with before/after wallet snapshots.
- **Update `TEST_REGISTER.md` as you go, not in a batch at the end.** Move each fixed row from Active Issues to Resolved Issues immediately after its live verification passes — same ID, never renumbered or deleted, with `Date Fixed`/`Fix Summary`/`Files Changed` filled in.
- **Update `E2E_COVERAGE_LEDGER.md`** for every route/control/API/table/workflow row that cited a now-fixed TR-ID — flip its status to `Pass` with a one-line note citing the fix commit. Append, never delete prior evidence text.
- **No destructive Git operations, no force-push, no `--no-verify`, no skipped hooks** — unchanged standing rule.

## Sync cadence — do this, not "push at the end"

Full detail in `FIX_PLAN.md` §8; the short version:

- Commit after every individual fix.
- Push at the end of every **cluster** (typically 1–6 TRs) — not just at the end of a session.
- Push all three repos together whenever any of them has new commits, so `TEST_REGISTER.md`/coverage-ledger updates in the root repo never drift out of sync with the `FrontEnd`/`XANO` commits implementing the fix they describe.
- Before ending any work block (not just the whole session), confirm all three repos read `ahead 0 / behind 0` via `git status -sb` in each. If they don't, that's the last thing you do before stopping, not a note for next time.

## Verification tooling

```bash
cd /Users/boss/Documents/VGC/FrontEnd
npm run typecheck
npm run test
npm run build
```

All three clean before any commit that touches `FrontEnd/`. For `XANO/` changes, use the Xano MCP's validate/dry-run path before pushing, and read back the deployed function stack to confirm it matches intent before considering the change live. Prefer the real browser and live HTTP calls over inference for the "live re-verification" step of the Definition of Done — the same discipline the test phase used throughout (`E2E_TEST_PLAN.md` §2's "non-negotiable definition of tested" applies to fix verification too, not just original test coverage).

## Commit message convention

```text
fix: <what changed, plain description> (TR-XXX)
```

or, for an explicitly-paired fix (e.g. TR-204+TR-205, which must ship together per `FIX_PLAN.md` §2.3):

```text
fix: <what changed> (TR-XXX, TR-YYY)
```

Reference every TR-ID the commit closes. For root-repo documentation commits (TEST_REGISTER.md/coverage-ledger updates that accompany a code fix), a matching message referencing the same TR-ID(s) keeps the three repos' histories legible against each other even though they're separate repos with separate commit graphs.

## Checkpoints

Update the **Resume checkpoint** block near the top of this file:

- after every cluster (not just every phase);
- after every individual defect fix if working outside a cluster (Phase 4's "remaining individual defects");
- before switching phases;
- before any context/session end, even an unplanned one.

Each checkpoint must record: last completed fix, exact next fix (with enough context to start cold — cite the `FIX_PLAN.md` section, don't just say "next TR"), repo sync state, any open blockers, and fixture/persona state. This file is the resumability contract — a future session (possibly you, possibly not) should be able to read only this file's checkpoint block plus `FIX_PLAN.md` and continue with zero other context.

## First action now

1. Read `FIX_PLAN.md` in full if you haven't already this session.
2. Run the "Preserve the project" git-status checks above and confirm they match the resume checkpoint's recorded sync state.
3. Read the exact next fix cited in the resume checkpoint, and the full cluster section it belongs to in `FIX_PLAN.md` (not just the one-line table row) before writing any code.
4. State a concise kickoff: current phase, exact next fix, repo sync state, any blocker. Then proceed — do not wait for confirmation to start work that's already scoped by `FIX_PLAN.md`, per this project's established autonomous-execution norm. Only stop and ask when something in the plan is genuinely ambiguous (the plan flags several such points explicitly — e.g. TR-215's shape decision, TR-224/226/228/233's "confirm with owner" notes) or when live behavior contradicts what `FIX_PLAN.md` assumed.
