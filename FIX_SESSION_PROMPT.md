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
Last updated: 2026-07-22 (Phase 2 fully complete — F2a+F2b+F2c; Phase 3 next)
Current phase: Phase 0, Phase 1, Phase 2 (all clusters) done; Phase 3
  (broken-forever creation flows + app-crashing frontend bugs) next.
Last completed fix: Phase 2 Cluster F2c. Fixed TR-209 (7 admin endpoints
  called log_admin_action with a wrong parameter shape — confirmed via a
  grep across all 42 live callers that exactly 7 were wrong, matching the
  register's count), TR-208 (4 of those 7 — pts/reserve-assets,
  pts/bootstrap, pts/theta-adjust, members/{id}/process-erasure — had no
  db.transaction wrapper at all, so the real mutation could commit even
  when the broken audit-log call then threw; the other 3 already had a
  transaction, so the corrected audit-log call was just moved inside it),
  and TR-237 (PTS Bootstrap's theta was written unconditionally instead of
  preserving an existing value like reserve_inr/hard_assets_inr already
  did). Building TR-237 surfaced a second real XanoScript bug: `null ??
  <scientific-notation literal>` (e.g. null ?? 5.0E-5) throws a hard
  "Not numeric." error even though the bare literal and null ?? <plain
  decimal> both work fine — worked around with plain decimal notation
  (0.00005) instead of scientific notation. Live-verified all 7 fixed
  endpoints deploy cleanly and correctly return a clean 403 for a
  non-admin caller (FX-030, VGC74) instead of ever reaching the old broken
  call; the admin-success path (mutation + audit committing atomically)
  was not independently live-tested — same admin-session blocker as the
  rest of Phase 2 (see TR-204/TR-240 and FX-028). Also caught and synced a
  previously-missed fix during this cluster's pull-and-diff: profile_PATCH
  .xs (TR-252) had been deployed live during F2a/F2b but never copied into
  the tracked XANO tree until now.
  Two things to know before continuing (carried forward from F2a/F2b,
  still relevant):
  (1) A naive |to_lower on an uppercase currency enum is WRONG, not just
      insufficient — "VGC_POINTS"|to_lower is "vgc_points", not the real
      stored value "points". Always use order_currency_to_wallet_currency
      for this mapping, never a bare |to_lower.
  (2) A custom Xano function calling ANOTHER custom function via
      function.run fails at runtime ("Function does not exist"), even
      though the identical call works fine from an API endpoint. Confirmed
      via a scratch diagnostic. No shipped fix is affected (every real fix
      uses the working API-to-function pattern), but never chain
      function.run from inside a function without testing it first.
  Full detail: TEST_REGISTER.md's Resolved entries (TR-181/190/191/204/
  205/206/208/209/227/232/237/240/252) and FIX_PLAN.md Phase 2's status
  block.
Exact next fix: Phase 3, Cluster F3a — the amount/amount_inr field-name
  mismatch family (TR-200, TR-201, TR-202, TR-223). Read FIX_PLAN.md's
  Cluster F3a section in full before starting: TR-223 is a clean rename-
  only fix, but TR-200/201/202 each need one ADDITIONAL independent fix
  beyond the rename (TR-200: wrong enum values + missing start_date;
  TR-201: missing upi_id field with no UI control yet, needs a new form
  field; TR-202: payment_mode enum casing mismatch against the dropdown's
  space-separated labels) — do not consider any of those three done after
  only the rename; re-run the whole creation flow for each, not just
  confirm the first blocking error is gone. Cluster F3b (paginated-
  envelope-vs-bare-array crash family across TR-184/195/196, plus adding
  the missing root-level React ErrorBoundary) follows immediately after —
  read that section too since the ErrorBoundary fix is described as the
  cluster's necessary first step, unblocking safe verification of the
  other 8 screens.
Repo sync state at last checkpoint: root/FrontEnd/XANO all ahead 0 /
  behind 0 as of root commit 424619a, FrontEnd commit b98080e, XANO commit
  6370deb (verify all three are still current before continuing —
  FrontEnd and XANO had no further changes during this checkpoint's
  doc-sync pass, only the root repo committed).
Open blockers: none for Phase 3. Known gaps carried forward (not
  blockers): TR-165 (CORS) needs Xano dashboard access or a plan change,
  not fixable via any MCP tool. admin/wallets/adjust's admin-success path
  and the standing VGC53 wallet-residue correction still need a real
  2FA-verified admin session — creating one by promoting a fresh account
  was blocked twice by the tooling safety classifier; try again if a
  legitimate admin session becomes available for any other reason (e.g.
  VGC53's actual password, or a future non-blocked promotion attempt), but
  don't spend more effort forcing it. DPDP erasure is now transaction-safe
  (post-F2c) but still requires an explicit owner go-ahead before ever
  being exercised, even on a disposable fixture.
Fixture/persona state: reuse existing disposable personas from
  E2E_FIXTURE_LEDGER.md (VGC50-VGC74) rather than creating new ones unless
  a fix needs a genuinely fresh/untouched account. VGC71/72/73/74 (Phase 2
  probes) ledgered as FX-027/FX-028/FX-029/FX-030. VGC72 was never
  actually promoted to admin (the promotion attempt was the blocked action
  above) — it's just an ordinary, unused member.
Known standing residue to correct once tooling allows: VGC53's wallet
  (E2E_FIXTURE_LEDGER.md "Known uncorrected residue" row) is intentionally
  left short 11.73 points / over-credited 11.73 tokens as live evidence of
  TR-239/240. admin/wallets/adjust is now fixed in code but its live
  admin-session test is the open gap above — correct this residue the
  moment a real admin session is available, then update that fixture-
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
