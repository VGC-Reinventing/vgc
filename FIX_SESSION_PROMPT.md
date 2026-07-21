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
Last updated: 2026-07-21 (plan preparation — no fixes started yet)
Current phase: Phase 0 (not yet started)
Last completed fix: none
Exact next fix: Cluster F0 — TR-194 + TR-239, marketplace settlement hardcoded currency
  (FIX_PLAN.md §Phase 0). Read the cluster section in full before starting;
  it fixes 5 call sites in one change, not just the one TR-239 repro case.
Repo sync state at last checkpoint: root/FrontEnd/XANO all ahead 0 / behind 0
  as of commit 86795a2 (root).
Open blockers: none.
Fixture/persona state: reuse existing disposable personas from
  E2E_FIXTURE_LEDGER.md (VGC50-VGC67) rather than creating new ones, unless
  a specific fix needs a genuinely fresh/untouched account (e.g. re-testing
  signup/verification gating in Phase 1).
Known standing residue to correct once tooling allows: VGC53's wallet
  (E2E_FIXTURE_LEDGER.md "Known uncorrected residue" row) is intentionally
  left short 11.73 points / over-credited 11.73 tokens as live evidence of
  TR-239/240. Correct it via admin/wallets/adjust once Phase 2 Cluster F2a
  lands, then update that fixture-ledger row.
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
