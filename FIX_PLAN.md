# VGC Reinventing — Defect Fix Plan

**Plan version:** 1.0
**Prepared:** 2026-07-21
**Scope:** every `Open` row in `TEST_REGISTER.md`'s Active Issues table as of this plan's preparation (99 rows, TR-132 through TR-251, minus 7 rows the owner has already explicitly deferred — see §7).
**Defect source of truth:** `TEST_REGISTER.md` (Active Issues table). Do not re-derive defects from memory — read the actual row before starting any fix.
**Test-plan source of truth:** `E2E_TEST_PLAN.md` — this document cites its §-numbers and WF-IDs throughout so every fix has a concrete re-verification script, not a vague "make sure it works."
**Coverage/evidence source of truth:** `E2E_COVERAGE_LEDGER.md` (route/control/API/table/workflow status) and `E2E_DEFECT_LOG.md`/`E2E_EXECUTION_LOG.md` (how each defect was originally proven).

This is **not** a second test plan and it does not replace `TEST_REGISTER.md`. It is the execution order and the acceptance bar for turning that register's 99 open rows into 0. `TEST_REGISTER.md` stays the authoritative defect list — this document only says which order to fix them in, how to prove each fix, and how not to reopen the same bug next month.

---

## 0. Why this order, not TR-ID order or severity-only order

Three considerations shaped the phase order below, in priority:

1. **Live financial harm outranks everything**, including higher-*count* clusters. TR-194/TR-239 (marketplace settlement pays the wrong wallet) is actively mis-crediting/mis-debiting real accounts on every non-token transaction happening right now, independent of any other fix. It ships alone, first, before anything else is even branched.
2. **Trust the auth layer before trusting any other test result.** Phases 2+ involve fixing admin tooling and re-verifying fixes *as an admin persona*. If TR-176/178/179/236 (2FA bypass, role-check null-coalescing, suspension/verification ignored at login) aren't fixed first, every subsequent "verified as admin" claim in this plan is unfalsifiable — you can't prove a fix was checked with real admin authority when any account can obtain admin authority for free.
3. **Fix the thing that unblocks measurement before fixing the things it would measure.** Cluster 5 (9 screens that crash the entire app on load) and Cluster 4 (4 financial-creation forms that have *never once* succeeded) are currently making large parts of `E2E_COVERAGE_LEDGER.md` unverifiable — you cannot regression-test around a screen that white-screens the whole SPA. These come before the long tail of individual medium/low defects specifically so Phase 4+ verification work isn't fighting the app itself.

Within a phase, Critical → High → Medium → Low, except where an explicit dependency is called out (Phase 2's TR-204/TR-205 pairing is the one hard sequencing constraint in this plan — see §2.3).

---

## 1. Ground rules for every fix session (apply to all phases)

These carry forward unchanged from the E2E testing phase's own discipline — read `E2E_TEST_PLAN.md` §6 (Safety, data isolation and permissions) before touching anything.

- **This is now a fix-and-verify phase, not test-and-log.** Product code changes in `FrontEnd/` and `XANO/` are in scope and expected. Testing-document updates remain in scope as before.
- **Never touch real user data.** All re-verification uses disposable fixtures marked `E2E-<YYYYMMDD>-<run>-<purpose>` or the existing disposable personas (`VGC50`–`VGC67`) already ledgered in `E2E_FIXTURE_LEDGER.md`. Reuse them; don't spawn new ones unless a fix specifically needs a fresh, never-touched account (e.g. re-testing signup/verification gating).
- **XanoScript schema changes (column add/remove/rename/type change, table delete) require explicit user confirmation before the tool call**, per the Xano MCP's own standing instruction. Most fixes in this plan are function-stack logic changes, not schema changes — flag the few that aren't (Cluster "amount_inr" fixes are FE-only field renames, not schema changes; TR-233's missing `display_name`/`bio` columns *would* be a schema change if fixed by adding columns — call this out explicitly when reached).
- **One fix, one commit, one TR reference (or one tightly-coupled TR pair — see §2.3).** Do not batch unrelated fixes into one commit. This keeps every commit revertible independently and keeps `git log` a legible audit trail against `TEST_REGISTER.md`.
- **Every fix is proven live, not just read as correct.** A source-code change that "looks right" is not done. Re-run the exact `Steps to Reproduce` from the TR's row in `TEST_REGISTER.md` against the running app/API and confirm `Actual` now matches `Expected`.
- **Financial fixes require the reconciliation proof already used throughout E2E** (`E2E_TEST_PLAN.md` §6.4/§11.3): `sum(debits) = sum(credits) + documented fee`, no unexplained negative wallet, one logical action = one side-effect set. Capture before/after wallet state exactly as the E2E runs did.
- **No destructive Git operations, no force-push, no `--no-verify`**, same as the whole project's standing rule.

---

## 2. Definition of Done (apply this checklist to every single TR before marking it Fixed)

1. Re-read the TR row in `TEST_REGISTER.md` in full — file/line citations may have drifted since the row was written; confirm the current source still matches before editing.
2. Make the minimal targeted change. No opportunistic refactors, no renaming unrelated things, no "while I'm in here" scope creep.
3. `FrontEnd` changes: `npm run typecheck && npm run test && npm run build` all clean.
4. `XANO` changes: use the Xano MCP's own validate/dry-run path before pushing; read back the deployed function stack to confirm it matches intent.
5. Live re-verification using a disposable fixture, reproducing the TR's exact `Steps to Reproduce` and confirming the `Actual` column's old value no longer occurs.
6. Adjacent-regression check: confirm the behavior this fix *didn't* intend to change is still correct (e.g., after fixing the auth-bypass cluster, re-confirm an ordinary verified, non-suspended member can still log in and use the app normally).
7. Move the row from **Active Issues** to **Resolved Issues** in `TEST_REGISTER.md` — same ID, never renumbered, never deleted. Fill `Date Fixed`, `Fix Summary`, `Files Changed`, `SRS Ref` (if applicable).
8. Update every `E2E_COVERAGE_LEDGER.md` row that cited this TR-ID (route/control/API/table/workflow) from its old status to `Pass`, with a one-line note citing the fix commit hash. Do not delete the old evidence text — append, matching this project's "no row may be removed" rule.
9. Commit message: `fix: <what changed> (TR-XXX)` — or `fix: <what changed> (TR-XXX, TR-YYY)` for an intentionally-paired fix. Reference every TR the commit closes.
10. Sync per §8 below.

A fix that skips step 5 (live re-verification) is not done, no matter how obviously correct the diff looks — this exact failure mode (a plausible-looking fix that wasn't actually re-run) is how several of this register's bugs shipped in the first place (e.g. TR-190/191's field-name mismatches are the kind of thing a code reviewer approves on sight and only a live call catches).

---

## Phase 0 — Stop the live financial bleeding

**Do this first, alone, before branching anything else.** This is the only phase where "ship it the moment it's verified" beats "batch with related fixes" — every hour this stays open is more real wallet drift.

### Cluster F0 — Marketplace settlement hardcodes the wrong currency

| TR | Severity | Endpoint(s) |
|---|---|---|
| TR-194 | Critical | `cancel_POST.xs`, `mark_received_POST.xs`, `auto_settle`, `settle`, `resolve_dispute` (all 5 settlement paths) |
| TR-239 | Critical | Same root cause as TR-194, live-reproduced instance on `cancel_POST.xs` specifically |

**Root cause:** every `mutate_wallet` call in these 5 endpoints hardcodes `currency:"token"` instead of reading the order/item's real `currency` field (`INR`/`VGC_TOKEN`/`VGC_POINTS`). A points- or INR-priced order's cancellation or settlement silently debits/credits the token wallet instead of the wallet that was actually touched at escrow time.

**Fix:** replace the hardcoded `"token"` literal with the order's actual `currency` field (already present on the `orders` row — used correctly at escrow-debit time, just not at refund/settlement time) in all 5 call sites. This is one shared bug in 5 places; fix and verify all 5 in the same change since they share the exact same root line pattern — do not ship a partial fix that closes TR-239's specific repro (cancel) while leaving `mark_received`/`auto_settle`/`settle`/`resolve_dispute` still hardcoded.

**Required checks (beyond the standard Definition of Done):**
- Place a fresh disposable order priced in each of the 3 currencies (INR/token/points) against a disposable catalog item; cancel one, mark-received-settle another, and (if a disposable dispute can be safely staged) resolve-dispute the third. Confirm the correct wallet moves in each case, not just the token wallet.
- **Immediately use this fix to correct the standing documented residue**: `E2E_FIXTURE_LEDGER.md`'s "Known uncorrected residue" row records `VGC53`'s wallet as short 11.73 points / over-credited 11.73 tokens from the original TR-239 live reproduction. Once TR-240 (Phase 2) also lands and `admin/wallets/adjust` works, use it to zero out this exact residue and update the fixture ledger row to `Cleaned up` with the correction evidence. Until then, this residue is a live illustration of the bug class — do not "fix" it manually via a direct table write before the endpoint fix is verified; that would remove your own regression evidence.

**Success criteria:** cancelling/settling an order in any of the 3 currencies refunds/pays the same currency that was debited at escrow time, for all 5 endpoints, with an exact reconciliation (no residual drift) on each.

**Cross-ref:** `E2E_TEST_PLAN.md` WF-09 (Marketplace proposal, listing, cart and order lifecycle) §14; `E2E_COVERAGE_LEDGER.md` `UI-027` (`/market/orders/:id`) and the WF-09 row — both currently `Fail`, flip to `Pass`.

---

## Phase 1 — Auth/session security foundation

**Nothing in Phase 2 onward is verified "as admin" until this phase closes.** This is the highest-severity cluster on the whole register by count of Critical rows (4) and by blast radius (every one of these is a full, unauthenticated-or-under-authenticated path to the entire admin control plane).

### Cluster F1 — Login/session/2FA bypass family

| TR | Severity | Defect |
|---|---|---|
| TR-176 | Critical | Admin 2FA fully bypassable — `require_admin.xs` authorizes on `role_flags.is_admin` alone, no way to tell a 2FA-verified token from a plain `/login` token |
| TR-178 | Critical | `enforce_role` never denies admin access to anyone — `role_hierarchy\|get:$user_role` returns `null` for an empty-string role; `null < 2` never throws |
| TR-179 | Critical | `suspended` flag has no effect — `login_POST.xs` never checks it |
| TR-236 | Critical | Email verification has no effect on login — `login_POST.xs` never checks `email_verified_at` |
| TR-186 | High | Admin login enumerates accounts and admin flag via 3 distinct error messages |
| TR-163 | High | Password reset enumerates accounts the same way |
| TR-187 | Critical | Password-reset magic link is completely non-functional (wrong domain entirely + no token/email delimiter) |
| TR-235 | High | Admin 2FA recovery-code login never sends `challenge_token` |
| TR-177 | High | `GET /admin/members` leaks password hashes and other sensitive fields `me_GET.xs` correctly strips |
| TR-166 | High | Backup-admin status endpoint readable with no auth at all |
| TR-165 | High | CORS reflects arbitrary `Origin` with credentials enabled |

**Root cause (shared across TR-176/178/179/236):** the login/session layer checks password correctness and nothing else. No code path anywhere validates account state (`suspended`, `email_verified_at`) at the point a token is issued, and no code path distinguishes an OTP-verified admin session from an ordinary one at the point a token is *used*. `enforce_role`'s specific bug (`null < 2` never throwing) is the same class of defect as the other two — a state check that was written but silently never fires.

**Fix approach:**
- `login_POST.xs`: add explicit `suspended == false` precondition before token issuance (safe to enforce immediately — no real account is currently suspended). Add the `email_verified_at != 0` precondition too, but **owner decision 2026-07-21: code it, do not enable it yet.** Gate it behind a `system_config` flag (e.g. `enforce_email_verification_at_login`, default `false`) rather than an unconditional precondition. Reason: several real, non-fixture accounts (Varun Ghavare, Kashish Mutta, Barkha Gorana, Sneha Gorana, Vishal Gorana, the owner's own "Boss" persona) currently have `email_verified_at:0` and cannot receive a real verification email under the Xano free-plan sandbox restriction (§ same limitation as TR-137) — enforcing this unconditionally the moment it's published to branch `v1` would lock all of them out with no recovery path on the current plan. Flip the flag to `true` only after email delivery is actually fixed (paid plan / SendGrid, per TR-137's own deferral rationale) or after those specific accounts are manually re-verified. Both preconditions return one generic rejection message regardless of which one fails (do not leak *which* condition failed — that itself would be a smaller version of TR-163/186's enumeration bug).
- Admin 2FA: after `admin/2_fa/verify_POST.xs` succeeds, embed an explicit `mfa_verified:true` claim in the issued token (not inferable from `role_flags.is_admin`). `require_admin.xs` must check for that claim, not just the role flag. A plain `/login` token — even for an admin account — must fail `require_admin`.
- `enforce_role`: fix the null-coalescing so an unset/empty role resolves to the lowest privilege level (`0`), not `null`, so the existing `< 2` comparison actually throws for non-admins as originally intended. Do not just patch the specific `null` case — grep every other `role_hierarchy` consumer for the same pattern, since this is exactly the kind of copy-paste-inherited bug this whole register is full of.
- TR-186/TR-163: collapse all three response branches (unregistered / wrong-role / wrong-password) to the single generic message already proven correct by the TR-146 fix on ordinary login. Reuse that exact fix, don't reinvent it.
- TR-187: fix the magic-link URL to point at the app's real `/reset` route (not Xano's demo page) and insert an actual delimiter between token and email in the link payload.
- TR-235: `AdminLoginScreen.tsx`'s recovery-code submit already holds `challengeToken` in state (used correctly by the sibling OTP-verify call) — pass it through `adminRecoverOtp({ recovery_code, challenge_token })`.
- TR-177: strip the same sensitive-field set `me_GET.xs` already excludes (password hash, reset token/expiry, device fingerprint, registration IP) from `GET /admin/members`'s response.
- TR-166: add an `auth` requirement to the backup-admin status endpoint.
- TR-165: replace Origin reflection with an explicit allowlist (production domain + local dev origin).

**Required checks (beyond standard DoD):**
- Re-run `E2E_TEST_PLAN.md` §18 quarantine-gate items 1–3 exactly as originally specified: obtain a plain `/login` token for a `role_flags.is_admin` disposable account and confirm an admin endpoint now correctly rejects it (TR-176); confirm an ordinary never-admin-flagged member is rejected by an `enforce_role`-gated endpoint (TR-178); confirm a `suspended:true` and separately a never-verified disposable account are both blocked at `/login` (TR-179, TR-236).
- Regression: confirm an ordinary verified, non-suspended member's login is completely unaffected, and a legitimately 2FA-completed admin session still works end-to-end through `/admin`.
- Update the "Security/integrity quarantine gate" table in `E2E_EXECUTION_LOG.md` — every row this cluster touches (Admin MFA token provenance, Role/`role_flags` split-brain, Suspended/erased/unverified capability enforcement) moves from `Confirmed Critical` to `Fixed`, with the fix commit cited.

**Success criteria:** none of TR-176/178/179/186/236/163/187/235/177/166/165's original reproduction steps still succeed; the admin control plane is unreachable without a genuine 2FA-completed session; account existence/admin-flag is not distinguishable from any error response.

**Cross-ref:** `E2E_TEST_PLAN.md` §18 (quarantine gate), §11.1 (OWASP web/API risks), WF-19 (Admin security and governance) — currently `Fail`, this cluster is most of why.

---

## Phase 2 — Wallet/financial data-integrity

Only start this phase once Phase 1 is verified — every check in this phase is performed *as an admin*, and that claim is worthless until Phase 1 lands.

### Cluster F2a — Wallet-type enum-casing mismatch (5 confirmed instances)

| TR | Severity | Location |
|---|---|---|
| TR-181 | Critical | `GET /user/profile` — wallet-type portion (the `$auth.<field>` portion of this same TR belongs to Cluster F2b below; this row has two independent bugs) |
| TR-191 | High | Admin "Adjust Wallet" — `adminAdjustWallet()` sends `currency`, backend requires `wallet_type` |
| TR-227 | High | `GET wallets/me/{currency}` — uppercase input, `wallets.type` stored lowercase |
| TR-232 | Medium | `GET /profile` wallet-summary branch — same casing mismatch, 4th instance |
| TR-240 | Critical | `admin/wallets/adjust_POST.xs` — enum declared uppercase-only, live data lowercase; **compounded** by the same `currency`-vs-`wallet_type` field-name bug as TR-191 |
| TR-190 | High | Admin "Award Points" — separate field, same file family: sends `type:'Constitutional'`, backend requires lowercase `provision_type` |

**Root cause:** `wallets.type` is stored lowercase (`inr`/`token`/`points`) in the live database. At least 5 independent call sites compare against or accept uppercase literals (`INR`/`VGC_TOKEN`/`VGC_POINTS`), and 2 of those (TR-191/TR-240, both admin wallet tools) additionally send the wrong parameter name entirely (`currency` instead of `wallet_type`). This is confirmed the single most-repeated defect *pattern* on the current active register.

**Fix approach:** normalize every comparison against `wallets.type` server-side with an explicit `|lower` filter on the incoming value, rather than requiring every caller to send a specific case — this is the more robust fix since it tolerates both the FE's current uppercase callers and any future caller without a second breaking-contract change. Fix `FrontEnd/src/api/admin.ts:105` (`adminAdjustWallet`) to send `wallet_type`, and its sibling `adminAwardPoints` (`api/admin.ts:121`) to send lowercase `provision_type` values (`constitutional`/`promotional`).

**Required checks:**
- Direct-API and live-UI test of `admin/wallets/adjust` and Award Points against a disposable member with a real nonzero balance; confirm the balance actually changes by the exact amount.
- `GET wallets/me/{currency}` and `GET /profile` both return the disposable member's real, current balance (not `0.00`) for all 3 currencies.
- **Use the now-working `admin/wallets/adjust` to correct the Phase-0-flagged `VGC53` wallet residue** (points short 11.73 / tokens over-credited 11.73) and update `E2E_FIXTURE_LEDGER.md`'s residue row to reflect the correction, with before/after balances as evidence.

**Cross-ref:** the "Wallet type and response-shape consistency" quarantine-gate row in `E2E_EXECUTION_LOG.md` (already documents all 5 instances) — flip to `Fixed`. `E2E_COVERAGE_LEDGER.md` `UI-029` (`/profile/edit`), WF-19.

### Cluster F2b — `$auth.<field>` beyond `.id` resolves null or 500

| TR | Severity | Files |
|---|---|---|
| TR-204 | Critical | Declaration verify/reject, token-surrender complete, marketplace admin orders fulfil/list, `GET /user/profile` — 6 files total, confirmed live in all 6 |
| TR-181 | Critical | `GET /user/profile` — the null-field portion (shares a file with TR-204) |
| TR-232 | Medium | `GET /profile` — shares `profile_GET.xs` with TR-204's 6th file |

**Root cause:** XanoScript's `$auth` object only reliably resolves `.id`. Every other field (`.role`, `.email`, etc.) must be re-fetched from the `user` table keyed by `$auth.id` — the correct pattern is already used elsewhere in the codebase (e.g. inside `enforce_role`'s working half). At least 6 endpoints instead read `$auth.role`/`$auth.email`/etc. directly, which resolves `null`, or throws a hard `500 "Unable to locate auth: role"` when referenced inside a `precondition`.

**Fix approach:** rather than patching each of the 6 files independently (which is exactly how this bug reached 6 copies in the first place — and is the same shape as the 5-instance wallet-casing bug and the 4-instance `amount_inr` bug below), **extract a single reusable Xano function** (e.g. `get_current_user`) that does the correct `$db.user.get_by_id:$auth.id` lookup once, and have all 6 affected endpoints call it instead of referencing `$auth.<field>` directly. This is a deliberate, in-scope architectural fix, not scope creep — the register shows this exact "same bug, N independent copies" shape three separate times (this cluster, the wallet-casing cluster, and the `amount_inr` cluster below), and a shared helper is the only fix that actually stops a 7th copy from being written next feature.

**⚠️ Hard sequencing constraint — read before touching this cluster:**

TR-205 (Critical, not yet listed above) is currently **invisible** because TR-204 throws a 500 before TR-205's logic ever runs: `complete_PATCH.xs`'s `$tokens = tokens_to_surrender ?? vgc_token_amount` always resolves to `0` because `tokens_to_surrender` defaults to `0` (not `null`) and is never set by the creation path — so completing a token surrender debits **zero tokens** while marking it completed. The moment TR-204's `500` is fixed on the token-surrender-complete endpoint, TR-205 stops being a dead code path behind a crash and becomes a **live, unlimited free-token exploit** for anyone who can complete a surrender.

**Do not fix TR-204 on the token-surrender-complete endpoint without fixing TR-205 in the exact same commit.** If these ship separately, there is a real window — however short — where a completed surrender debits nothing. Also fix TR-206 (Admin Token Surrenders list always shows "0 tokens") in the same change; it's the identical always-zero expression on the read side and would otherwise keep masking TR-205's real amount even after the write side is fixed.

**Required checks:**
- All 6 TR-204 repro cases (declaration verify, declaration reject, token-surrender complete, `GET admin/orders`, `PATCH admin/orders/{id}/fulfill`, `GET/user/profile`) now return a real business response, not `500`.
- Token-surrender complete: create a disposable surrender for a known token amount, complete it, and confirm the member's token wallet is debited by that **exact** amount (not zero) — this is the specific proof TR-205 is actually fixed, not just that TR-204's crash is gone.
- Admin Token Surrenders list shows the real surrendered amount, not "0 tokens" (TR-206).

**Cross-ref:** WF-19; `UI-029`; the same quarantine-gate row as Cluster F2a (TR-181 appears in both).

### Cluster F2c — Admin-action audit logging and transaction safety

| TR | Severity | Defect |
|---|---|---|
| TR-209 | Critical | 7 admin endpoints call `log_admin_action` with wrong parameter names — every one always 400s on that call, **after** the real mutation has already committed |
| TR-208 | Critical | `reserve_assets_PATCH.xs` commits the `pts_components` singleton mutation before the throwing audit-log call, no transaction wrapper — proven live to silently corrupt global PTS state on a "failed" call |
| TR-237 | Medium | PTS Bootstrap silently resets `theta` to the hardcoded default on every re-run, unlike `reserve_inr`/`hard_assets_inr` which correctly preserve existing values |

**Root cause:** two compounding backend defects across the same 7 endpoints (PTS reserve/theta/bootstrap, course payout/list/amendment-decision, DPDP erasure): the audit-log call itself is broken (wrong parameter names, always 400s), and none of the 7 wrap their real mutation + audit call in a transaction — so the user-facing mutation silently succeeds while the caller sees a failure, and nothing gets audited, ever, for any of these 7 actions.

**Fix approach:** fix `log_admin_action` call sites to the correct parameter shape (`actor_admin_id`/`action`/`target_type`/`target_id`) in all 7 files; wrap each endpoint's mutation + audit-log call in a single transaction so a genuine downstream failure rolls back instead of silently committing. Separately, add the same `($current|get:"theta") ?? 5.0E-5`-style preserve-existing fallback already correct for `reserve_inr`/`hard_assets_inr` to `theta` in `bootstrap_POST.xs`.

**Required checks:**
- Trigger each of the 7 actions once as a 2FA-verified admin: confirm a real success response (not 400) and a real audit-log row.
- **New verification the E2E pass could not safely perform**: deliberately trigger one of the 7 with an input designed to fail deeper validation, and confirm the transaction rolls back — i.e., the underlying data (e.g. `pts_components`) is genuinely unchanged, not just "the error looked clean." This is the actual proof TR-208's root cause is closed, not just its symptom.
- Re-run Bootstrap after adjusting `theta` via "Adjust θ" and confirm the adjustment survives (TR-237).

**Cross-ref:** WF-19. This fix is also the prerequisite for ever safely testing DPDP account erasure on a disposable fixture — the erasure endpoint is one of the 7, and until its mutation is transaction-safe, invoking it risks an unaudited, un-rollback-able PII-anonymization commit. Flag this explicitly to the owner once Phase 2 lands: erasure testing becomes safe to schedule, it still wasn't done in the E2E pass, and someone should decide whether to do it now.

---

## Phase 3 — Broken-forever creation flows and app-crashing frontend bugs

These fixes unblock re-verification of large parts of `E2E_COVERAGE_LEDGER.md` that are currently `Fail`/`Blocked` purely because the screen never worked or crashes on load — do this before the long tail of individual defects in Phase 4, or Phase 4's own verification work will keep tripping over these.

### Cluster F3a — `amount` vs `amount_inr` field-name mismatch (4 confirmed open instances)

| TR | Severity | Screen/function | Extra bug bundled in this TR |
|---|---|---|---|
| TR-200 | Critical | `/financial/investments/new`, `createInvestment()` (`FrontEnd/src/api/financial.ts:24`) | Wrong enum values (`'A'`/`'B'` vs `A_10pct_lumpsum`/`B_8pct_quarterly`) **and** missing required `start_date` — 3 independent blockers total |
| TR-201 | Critical | Loan request, `requestLoan()` (`FrontEnd/src/api/loans.ts:6`) | Missing `upi_id` field — no UI control for it exists at all, needs a new form field, not just a rename |
| TR-202 | Critical | `/expenses/new`, `logExpense()` (`FrontEnd/src/api/expenses.ts:6`) | `payment_mode` enum casing (`Title_Case_With_Underscores` vs the dropdown's space-separated labels) |
| TR-223 | Critical | `/financial/sponsorships/new`, `createSponsorship()` (`FrontEnd/src/api/financial.ts:58`) | None — clean field-rename fix |

**Root cause:** each of these 4 creation-mutation functions sends `amount`; each backend endpoint requires `amount_inr`. This is the single most-repeated exact defect shape across the project's full history (earlier sessions already fixed the same pattern on declarations 3 times over — see `TEST_REGISTER.md`'s Resolved Issues for the precedent). None of these 4 forms has **ever** successfully created a record through the live UI.

**Fix approach:** rename the payload field in all 4 functions. TR-223 is then done. TR-200/201/202 each need one additional independent fix per the table above — do not consider any of the three done after only the rename; re-run the *whole* creation flow, not just confirm the first blocking error is gone.

**Recurrence check (do this regardless of whether it finds anything):** grep `FrontEnd/src/api/` for every mutation function sending a bare `amount:` key, and cross-check each target endpoint's actual declared input name. This pattern has recurred 4 times on this active register alone (and more historically) — confirm there isn't a 5th sibling nobody's hit yet before calling this cluster closed.

**Required checks:** create one real disposable investment, loan, expense, and sponsorship end-to-end through the live UI as a disposable persona; confirm each appears correctly in its respective list/admin-review screen afterward, not just that the POST returns 200.

**Cross-ref:** `E2E_TEST_PLAN.md` WF-14 (Financial donation/investment/sponsorship), WF-15 (Loan lifecycle), WF-16 (Expenses) — all currently blocked/fail specifically because these forms have never worked; flip to `Pass` once verified end-to-end.

### Cluster F3b — Paginated-envelope-vs-bare-array crash family (+ missing app-level ErrorBoundary)

| TR | Severity | Screen(s) |
|---|---|---|
| TR-184 | Critical | `/profile/guardian-approvals` — also has an independent action-body-shape bug (`{approve}` vs `{decision}`), fix both in the same change |
| TR-195 | Critical | `/market/propose` — blocks Education course creation entirely, since it depends on this screen |
| TR-196 | Critical | 7 screens in one TR: `/wallet/declarations`, `/wallet/surrenders`, `/pts` (History tab), `/points/activities`, `/admin/proposals`, plus 2 more sharing the identical bug shape — 5 different envelope wrapper keys across them (`items`, `data`, `declarations`, or none) |

**Root cause:** these FE query hooks type their list response as a bare array and call `.map()`/`.length` with no defensive check; the live endpoints return one of several paginated-envelope shapes instead. **No root-level React ErrorBoundary exists anywhere in the app**, so any one of these 9 screens crashing takes down the *entire* SPA to a blank white page, not just that screen.

**Fix approach — both parts required:**
1. **Immediate, unblocks everything else in this cluster and any future undiscovered 10th instance**: add a root-level `ErrorBoundary` around the app shell, rendering a friendly "something went wrong, try again" fallback instead of a blank crash. This also directly closes `E2E_TEST_PLAN.md` §9's separately-listed "missing app-level error boundary" hypothesis — one fix, two register/plan items closed.
2. **Root-cause, per screen**: fix each of the 9 screens' response typing/unwrapping to match its endpoint's *actual* verified envelope shape — verify each one live via a direct API call first; do not assume all 9 share one wrapper key, the register explicitly documents 5 different shapes. A backend-side standardization of envelope shape would be the "real" long-term fix but is a wider breaking API change — flag it as a follow-up recommendation to the owner, out of scope for this pass.
3. Fix TR-184's bundled action-body bug (`{approve}` → `{decision}`) in the same change, since Guardian Approvals isn't actually usable until both are fixed.

**Required checks:**
- Navigate to all 9 screens with real backing data as a disposable persona; confirm each renders its list instead of crashing.
- Prove the ErrorBoundary itself works: force one deliberately-bad response (or a controlled synthetic throw) after the 9 known cases are fixed, and confirm a friendly fallback renders instead of a blank page — this is the regression insurance for every future instance of this bug class.
- Guardian Approvals: complete one real Approve action end-to-end (not just render the list) — this also reopens WF-02, currently entirely blocked by this exact defect plus TR-185 (Phase 4).

**Cross-ref:** `E2E_COVERAGE_LEDGER.md` route rows for all 9 screens (currently `Fail`); WF-02 (Guardian lifecycle); `E2E_TEST_PLAN.md` §9 (missing app-level error boundary hypothesis).

---

## Phase 4 — Remaining individual defects

No shared root cause ties these together; each is its own fix. Grouped by severity. "Verify" points at the TR's own `Steps to Reproduce`/`Expected` columns in `TEST_REGISTER.md` (still the authoritative repro) plus, where one exists, the relevant `E2E_TEST_PLAN.md` WF/§ to flip in the coverage ledger.

### Critical

| TR | Fix direction | Cross-ref |
|---|---|---|
| TR-164 | Add server-side minor-DOB rejection to `signup_POST.xs` requiring the guardian flow below a real age threshold; also block future-dated DOB. | WF-01, WF-02, SRS §2.1/§2.4 minor-safeguarding |
| TR-185 | `guardian_approvals/id/respond_POST.xs` approve branch must generate a real, non-empty, non-colliding `member_id` (reuse the UUID-workaround pattern already correct in `signup_POST.xs`) before `db.add user`. | WF-02 — currently fully blocked end-to-end by this + TR-184 |
| TR-189 | `create_declaration.xs`/`submit_POST.xs`: fix the status-transition contract so `submit` actually sets a status `create_declaration` can produce — the whole INR declaration pipeline has never reached admin review. | WF-04 |
| TR-199 | Add the missing `game_id` field/selector to `PioneerCandidacyScreen.tsx`; also blocked on at least one real game existing (`FX-014` disposable game already exists as of this session, usable for verification). | WF-12 |
| TR-207 | `admin/admin/items_GET.xs`: fix the join alias mismatch (`$db.seller.*` not `$db.user.*`) that breaks `/admin/market` outright. | WF-19 |
| TR-213 | Build (or fix) the admin-wide loans-list endpoint — currently queries only the logged-in admin's own loans, no cross-member admin view exists at all; this is new API surface, not a one-line fix, scope accordingly. | WF-19, WF-15 |
| TR-214 | `dispute-messages` GET/POST: replace the hardcoded `$auth.id == system_config.admin_member_id` check with the platform's real role-based admin check. | WF-19, `UI-083` |
| TR-234 | `profile_PATCH.xs` throws `500` whenever `dob` is omitted despite being declared optional — fix the runtime behavior to actually honor `date dob?`; this is why **no profile save has ever succeeded** from the real UI. | WF-01, WF-03, `UI-029` |

### High

| TR | Fix direction | Cross-ref |
|---|---|---|
| TR-140 (remainder) | Rate-limiting is confirmed working for registration/OTP-resend; the broader sweep across voting/applications/ratings/financial mutations is still open — complete that sweep and fix any gap found. | `E2E_TEST_PLAN.md` §11.1 |
| TR-167 | Audit every `GET` handler in the affected families (reset request, guardian expiry, education/session lifecycle, elections, seasons, groups, loans, orders, transfers, wallet creation) and move any real mutation to the correct verb, or make the lazy-read idempotent by design if the mutation is a legitimate lazy-evaluation side effect (several of these may be intentional lazy-expiry patterns already proven correct elsewhere — confirm which before "fixing" a working pattern). | §10.6 (time-dependent lazy evaluation) |
| TR-172 | Move the `vgc_blog` Cloudinary preset to signed uploads or add server-side format/size/dimension/ownership validation. | §17.6 |
| TR-180 | `SessionExpiredModal` must call `queryClient.clear()` (not just `setToken()`) on identity switch; scope every `*-me` query key by the authenticated user id. | Cross-account cache isolation quarantine-gate row |
| TR-182 | Either accept the public `VGC<n>` format in `guardian_registration_POST.xs`, or surface the raw internal id somewhere reachable — the field's own label already promises `VGC<n>` format, make the backend match its own UI copy. | WF-02 |
| TR-183 | Fix or replace `util.send_email` call in `guardian_registration_POST.xs` — confirmed the in-app notification fires but the email never arrives. | WF-02, §17.5 (Email) |
| TR-190 | See Cluster F2a (Phase 2) — bundled there since it's the same admin-wallet-tools file family. | — |
| TR-203 | `adminListMembers()` unwraps `{items:[...]}`; live endpoint returns `{members:[...], count:N}` — fix the unwrap key. | WF-19 |
| TR-210 | Market/Activity/Education admin-report tabs never send their own `from`/`to` date-range state to the API — wire the screen's existing date state through. | WF-19 |
| TR-212 | Admin Config screen's own placeholder JSON advertises `surrender_rate`; real schema is a numerator/denominator fraction — fix the placeholder/caption to match the real input contract. | WF-19 |
| TR-215 | Notification Preferences: reconcile the FE's expected per-event-toggle-list shape against the BE's actual single global object — this needs a shape decision (which side changes), not just a mechanical fix; make the call, document it, then fix both sides to match. | §16.2, WF-18 |
| TR-224 | `EventDetailScreen.tsx` calls a `gaming-seasons` sub-resource that was never built — either build the missing `GET /events/{id}` route, or point the screen at whatever the real intended data source is; confirm which with the owner if unclear before spending backend effort. | WF-12 |
| TR-226 | **Corrected 2026-07-21 — not a plan blocker.** Xano's native `storage.create_attachment` genuinely is unavailable on the current plan, but nothing actually needs it: both call sites (`CreatePostScreen.tsx` group-post images, `DeclarationFormScreen.tsx` declaration proof `image/*,.pdf`) only consume the returned `.url`, and the Xano-side `deleteFile()` counterpart is dead code, never called. `uploadToCloudinary()` already exists in `FrontEnd/src/api/system.ts` and already works live for blog images. Fix: point both call sites at Cloudinary instead (generalize `uploadToCloudinary` to accept `resource_type=auto` so the declaration-proof PDF case works, not just images); leave the Xano `files/upload`/`files/{id}` endpoints as unused/dead rather than fixing them. | §17.6 |
| TR-228 | `archive_POST.xs` writes `status:"archived"`, which the live `blogs.status` enum rejects — either add the enum value or change what the endpoint writes to match the real enum; confirm the intended status name first. | WF-11 |
| TR-229 | `games/id/groups_GET.xs` never computes/returns `is_member`; add it so the FE's existing `group.is_member` check (already correctly written) has real data to read. | — |
| TR-231 | `getItems()` sends `?category={id}`; endpoint declares `category_id` — rename the query param. | — |
| TR-235 | See Cluster F1 (Phase 1). | — |
| TR-238 | `groups/id/delete_POST.xs:49-50`: replace raw `now + 86400000` arithmetic with the `add_secs_to_timestamp` filter already used correctly elsewhere (e.g. `admin/2_fa/setup_POST.xs`) — fixes the `500 "Not numeric."` for any group past its founding member. | — |

### Medium

| TR | Fix direction |
|---|---|
| TR-132 | Point the `contract_disputed` admin notification's deep link at `/admin/contracts`, not `/contracts`. |
| TR-145 | Add City/State/Country fields somewhere reachable (signup or, matching Mobile's precedent, editable later from profile) per SRS §2.1.1. |
| TR-174 | Wrap `resend-verification_POST.xs`'s token invalidation in a proper read-then-write transaction (TOCTOU fix); separately fix `VerifyEmailScreen.tsx`'s `useState`→`useRef` StrictMode double-fire artifact. |
| TR-175 | Render the member's own `VGC<n>` ID somewhere on Profile/Home/Wallet — currently only incidentally visible on Declaration/Surrender forms. |
| TR-188 | Change `VerifyEmailScreen.tsx`'s code field from a 6-digit numeric keyboard to a field that can actually hold the real 36-character UUID token. |
| TR-192 | Add an `emit_notification`/email call to `points_transfer_POST.xs` for the recipient. |
| TR-193 | Fix `ItemDetailScreen.tsx` to call `formatAmount()` with the item's real currency, not a hardcoded token; fix `formatAmount()` to append a unit for every currency, not just INR. |
| TR-198 | `AdminBlogScreen.tsx` (list view) reads `author_name`/`author_id`; real field is `author_member_id` — the detail screen already gets this right, mirror its fix. |
| TR-206 | See Cluster F2b (Phase 2) — same always-zero expression as TR-205's write-side bug. |
| TR-211 | Fix the Audit Log "to" filter to include the full end day (end-of-day, not midnight-start) rather than excluding same-day entries. |
| TR-216 | Add an `auth` requirement to `send_welcome_email_POST.xs`, or remove it entirely if genuinely dead scaffolding — confirm which via a call-site grep first. |
| TR-222 | Add a membership check before rendering `/groups/{id}/post/new`'s full compose UI for non-members — currently UX-only since the backend already correctly blocks submission. |
| TR-225 | Add `isError` handling to `EditBlogScreen` — currently renders nothing at all on a 403/404 fetch failure. |
| TR-230 | Make `/verify-email`'s "a code has been sent" copy conditional on whether one actually was (signup-flow arrival vs. direct URL visit). |
| TR-232 | See Cluster F2a (Phase 2). |
| TR-233 | Add real `display_name`/`bio` columns and wire `profile_PATCH.xs` to accept them, **or** remove the fields from `EditProfileScreen.tsx` if they're not meant to exist — this is a scope decision (build vs. remove), not a mechanical fix; **note: the "build" option is a schema change and needs explicit user confirmation before the table-alter tool call.** |
| TR-237 | See Cluster F2c (Phase 2). |

### Low (accessibility/copy, batch these together — see Phase 5)

TR-218, TR-219, TR-220, TR-221 — all small, independent a11y/UX papercuts on the auth screens (missing `main` landmark, errors not announced via `aria-live`, focus not moved to first invalid field, form state lost on policy-link navigation). Fix as one small batch since they're all in the same 2 screens (`LoginScreen`/`SignupScreen`) and none depends on any other phase.

---

## Phase 5 — UX/accessibility/polish

Everything here was found during the E2E test plan's explicit WCAG/keyboard-accessibility hypothesis sweep (`E2E_TEST_PLAN.md` §9, executed as RUN-111/RUN-112 — see `E2E_EXECUTION_LOG.md`). Each is a single shared-component or single-file fix that resolves many screens at once — that's exactly why the E2E pass flagged them as hypotheses rather than one-off findings.

| TR | Fix | Screens resolved by one fix |
|---|---|---|
| TR-247 | Add `tabIndex={0}`, `role="button"`, Enter/Space `onKeyDown` to the shared `Card` component (`FrontEnd/src/components/Card.tsx`) when it receives `onClick`. | 62 files |
| TR-248 | Add roving tabindex + `role="tabpanel"`/`aria-controls`/`aria-labelledby` to the shared `Tabs` component (`FrontEnd/src/components/Tabs.tsx`). | Every screen using `Tabs` |
| TR-249 | Build one shared accessible confirm-dialog primitive (focus trap, `role="dialog"`, `aria-modal`, initial focus, focus return) and migrate `GroupDetailScreen.tsx`'s Transfer Admin/Remove Member dialogs onto it — or replace them with `window.confirm()`, already proven correct for the Delete-group case; cheaper, consider it first. | At minimum 2 dialogs; grep for the same `group-confirm-overlay` pattern elsewhere before considering this closed |
| TR-245 | Add alias custom properties in `tokens.css` mapping the ~26 undefined names (`--pos`/`--neg`, `--violet-primary`, `--warn`/`--error`, `--font-body`/`--text-sm`/`--body-sm`, `--radius-*`, `--surface-*`) to the real canonical tokens — one file, lower regression risk than touching ~15 component files. | ~15+ screens |
| TR-251 | Give `ScreenHeader.tsx:22`'s default back handler a real fallback: check whether real in-app history exists before calling `navigate(-1)`; route to a sensible default (e.g. `/home`) when it doesn't. | 51 of 52 screens using the shared header |
| TR-250 | Fix the scroll listener in `AdminBlogReviewScreen.tsx:34-50` to target the actual `.vgc-screen.vgc-scroll` ancestor instead of `document.documentElement`. | 1 screen, but a governance-integrity issue (admins can approve/reject/takedown without reading) |
| TR-246 | Scope `draftStorageKey()` (`WriteBlogScreen.tsx:27`) by member id: `vgc.blogDraft.${memberId}.${draftKey}`. | 1 screen, cross-account leak on shared browsers |

**Also in this phase (viewport clipping, `E2E_TEST_PLAN.md` §9.5):**

| TR | Fix |
|---|---|
| TR-244 | `AdminFinancialScreen.tsx`'s tab strip: change `overflow-x:visible` to the scrollable `.vgc-tabs` pattern already correct elsewhere — this one is functional (tab genuinely unreachable at 320px), not cosmetic. |
| TR-241, TR-243 | Add wrap/ellipsis to the ~4 affected long-text/label elements at 320px (`/admin` card subtitles + Sign Out button, `/profile` email, `/home` Surrender button, `/market/orders/:id` status badge). Cosmetic, batch together. |

**Required checks:** re-run each TR's own live reproduction exactly as documented (all 7 accessibility items and all 3 viewport items already have concrete repro steps from RUN-110/111/112 — reuse them, don't re-derive). For TR-247/248/249/245/251 specifically, spot-check at least 3 of the affected screens each, not just the one screen the original finding cited — the whole point of a shared-component fix is that it's supposed to work everywhere, prove that, don't assume it.

**Cross-ref:** `E2E_TEST_PLAN.md` §9 (UI/UX and accessibility standard), specifically the explicit hypothesis list; `E2E_COVERAGE_LEDGER.md` RUN-110/111/112 rows.

---

## Phase 6 — Pre-launch security hardening gate

**Explicitly gated: do not skip this phase before any public/production launch**, matching the owner's own standing decision on TR-142. Nothing here is an active exploit against real users today (all require either an attacker already having some access, or are disclosure/hardening gaps rather than live harm), which is why this phase is last — but "last" does not mean "optional."

| TR | Severity | Fix |
|---|---|---|
| TR-142 | High | `blog_dislikes` raw CRUD (GET/POST/PATCH/DELETE) has zero auth/ACL and is confirmed to accept unauthenticated writes with empty bodies. Remove the raw table-CRUD endpoints entirely (the properly-guarded `POST /blog/{id}/dislike` vote endpoint is the only intended write path) or add auth+ownership checks if the raw endpoints are needed for something else — confirm which before fixing. |
| TR-168 | Medium | Add CSP, `X-Frame-Options`, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy to the production deployment (HSTS already present). |
| TR-169 | Medium | Return real HTTP 404 for unknown paths and a real `robots.txt`, instead of the SPA shell at 200. |
| TR-170 | Medium | Show anonymous-appropriate nav on `/terms`/`/privacy` when logged out; preserve signup form state through an auth redirect triggered by a protected link. |
| TR-171 | Medium | Remove the gateway-Required flag from documented-optional params on `/contracts` filters and backup-admin `requester_member_id`, using the trailing-`?` syntax fix already proven correct in the TR-147 precedent. |
| TR-217 | High | Add an ownership/relationship check to `contracts/{id}_GET.xs` before returning the `applications[]` array — currently any authenticated caller can read every applicant's private bid regardless of relationship to the contract. |
| TR-216 | Medium | See Phase 4 Medium table — listed there, cross-referenced here since it's also a pre-launch security item. |
| TR-173 | High (parked) | Xano Metadata API token rotation — the owner has explicitly deprioritized this; re-raise it specifically at the pre-launch gate rather than fixing it opportunistically now. |

---

## 7. Explicitly out of scope for this plan (owner-deferred, unchanged)

These already carry an explicit owner decision in `TEST_REGISTER.md` and should not be picked up without a fresh, explicit go-ahead:

- **TR-137** — email-verification-at-login gap accepted as a free-plan trade-off (BG-7); revisit once email delivery is fixed (paid plan/SendGrid). *(Note: TR-236, fixed in Phase 1, closes the specific "login doesn't check verification at all" bug; TR-137's broader "browse/post/wallet activity should also be gated" scope is still deferred separately — don't conflate the two.)*
- **TR-138** — Terms/Privacy real policy content; deferred pending content authoring, not an engineering task.
- **TR-139** — SRS §2.5 Account Closure (30-day grace, wallet freeze, asset reversion) is an unbuilt feature, not a bug; deferred pending a build decision.
- **TR-141** — Notification quiet-hours; unbuilt feature, deferred.
- **TR-143** — orphaned pre-redesign dispute endpoint/table; deferred pending a reachability confirmation and a removal decision.
- **TR-144** — cross-document staleness (API_REFERENCE.md/development_plan.md/SRS); housekeeping, no functional impact, deferred.
- **DPDP account erasure** — untested end-to-end all session, deliberately, since it's a one-way irreversible mutation against a real record shape. Phase 2 (Cluster F2c) makes it safe to test for the first time; still requires an explicit owner go-ahead to actually exercise, even on a disposable fixture.
- **Hardware-dependent verification** — camera/QR check-in, full automated WCAG 2.2 AA audit tooling, true offline/PWA installability, dedicated Lighthouse/performance profiling. Not defects, just untested; needs hardware/tooling this environment doesn't have, unchanged from the E2E close-out.

---

## 8. Sync cadence across the three repositories

Fix work touches `FrontEnd/` and `XANO/` (product code) as well as the root repo (this plan, `TEST_REGISTER.md`, `E2E_COVERAGE_LEDGER.md` updates). Apply this cadence, not "push whenever it feels done":

- **Commit after every individual fix** (or every tightly-coupled TR pair, per §2.3's TR-204/205 constraint) — small, atomic, revertible. Never let more than one fix accumulate uncommitted.
- **Push at the end of every cluster**, at minimum — not just at the end of a session. A cluster is typically 1–6 TRs; that bounds how much work is ever at risk of being lost to a crashed session or a lost connection.
- **Push all three repos together whenever any of them has new commits**, so the root repo's `TEST_REGISTER.md`/coverage-ledger updates never drift out of sync with the `FrontEnd`/`XANO` commits that actually implement the fix they describe. Verify with `git status -sb` (and the two sub-repo equivalents) that all three read `ahead 0 / behind 0` before ending any work block.
- **Never batch an entire phase's worth of fixes into one push.** If a phase takes multiple sessions, each session still ends synced, not "I'll push it all at the end of the phase."
- Before any push: confirm `npm run typecheck && npm run test && npm run build` are clean in `FrontEnd` (if touched), and that the specific fix's live re-verification (Definition of Done step 5) actually happened — a push is not a substitute for verification, it's what happens after it.

---

## 9. How to know the whole plan is done

- `TEST_REGISTER.md`'s Active Issues table contains only the §7 owner-deferred rows (or fewer, if the owner later un-defers one) — every other row has moved to Resolved Issues with a real Fix Summary and Files Changed.
- Every `E2E_COVERAGE_LEDGER.md` row that ever cited a now-fixed TR-ID reads `Pass`, not `Fail`/`Partial`/`Blocked`, with a fix-commit citation.
- A fresh, full re-run of the relevant `E2E_TEST_PLAN.md` §18 quarantine gate and the affected WF-suites (§14) — not just the individual TR repro steps — comes back clean. Fixing 99 individual bugs is not the same claim as "the platform is sound"; the quarantine gate and workflow suites are what actually tests that.
- All three repos synced (`ahead 0 / behind 0`), and `FIX_SESSION_PROMPT.md`'s own resume checkpoint says there's nothing left to pick up.
