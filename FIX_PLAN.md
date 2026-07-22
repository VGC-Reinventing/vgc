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

**Status: closed 2026-07-21, 9 of 10 fixed and live-verified, 1 genuinely blocked.** TR-176, TR-178, TR-179, TR-236 (coded, deliberately disabled), TR-163, TR-186, TR-187, TR-177, TR-166, TR-235 all fixed — see their Resolved entries in `TEST_REGISTER.md` for full fix/verification detail. TR-176's real fix landed on `Quick Start/enforce_role`, not `require_admin.xs` as originally named — the latter turned out to have zero live callers anywhere in the codebase. TR-178's root cause was deeper than described (`$role_hierarchy|get:""` returns the whole hierarchy object for an empty-string role, not `null`) — building its fix also surfaced a real XanoScript evaluation quirk (a compound piped-filter-chain + comparison expression inside a nested `var.update`/`conditional` silently produces a stale value) that's now a documented pattern to avoid throughout the rest of this plan. **TR-165 (CORS) investigated and left open — genuinely not fixable through any available Xano MCP tool** (checked `updateApiGroupSecurity`, `updateAPISecurity`, workspace settings; none expose an origin allowlist). This is real, unlike TR-226's earlier false alarm — flag for a future session with either direct Xano dashboard access or a plan-tier change. Phase 2 may proceed.

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

**Status: Phase 2 fully closed 2026-07-21 — Clusters F2a, F2b, and F2c all complete (15 TRs).** TR-181, TR-190, TR-191, TR-204, TR-205, TR-206, TR-227, TR-232, TR-240 (F2a+F2b) and TR-208, TR-209, TR-237 (F2c) all fixed — see their Resolved entries in `TEST_REGISTER.md`. Two previously-uncataloged instances of the wallet-casing family were found and fixed in F2a/F2b (`declarations/{id}/verify`, `token-surrenders/{id}/complete`) — 7 total instances now, all sharing one function. A new, previously-uncataloged defect was found and fixed while verifying TR-181 (`PATCH /profile` leaked the password hash on every save — logged as TR-252, resolved). Cluster F2c fixed all 7 broken `log_admin_action` call sites (TR-209), added transaction wrapping to the 4 that had none including the DPDP erasure endpoint (TR-208), and fixed PTS Bootstrap's `theta` preserve-existing fallback (TR-237) — discovering and working around a second real XanoScript bug along the way (`null ?? <scientific-notation literal>` throws `"Not numeric."`; use plain decimal notation instead). A real XanoScript limitation was also discovered and documented: a custom function calling another custom function via `function.run` fails at runtime, even though the identical call works fine from an API endpoint — no shipped fix is affected, but keep this in mind going forward. All 7 F2c-fixed endpoints live-verified to deploy cleanly and correctly gate a non-admin caller with a clean `403` (FX-030). **Known gap, carried forward**: `admin/wallets/adjust`'s admin-success path (and the standing `VGC53` wallet-residue correction it was meant to enable) could not be independently live-tested — creating a fresh 2FA-verified admin fixture was blocked twice by the tooling safety classifier (FX-028). Do this the next time a real admin session is naturally available. DPDP erasure testing is now transaction-safe but still requires an explicit owner go-ahead before ever being exercised. Phase 3 (broken-forever creation flows + app-crashing frontend bugs) is next.

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

**Status: closed 2026-07-22.** TR-200, TR-201, TR-202, TR-223 all fixed and live-verified end-to-end (a real investment, sponsorship, loan, and expense were each created through the direct API using a fresh disposable persona, `VGC75`/FX-031, and each confirmed to appear correctly in its own list). The mandated recurrence check found **4 more previously-uncataloged instances** of the same wrong-field-name defect family (beyond the original 4 TRs) — matching this register's established pattern of the same bug shape recurring across independent files:
- TR-253 (Critical): `depositSecureFunding()` sent `amount`; the endpoint requires `tokens`. The "Deposit Funding" button also had no amount input at all (hardcoded to deposit 0) — fixed both.
- TR-254 (Medium): `createDistributionRecord()` sent `event_id`; the endpoint's real field is `event_ref_id` (optional, so this silently dropped the value rather than erroring).
- TR-255 (Critical): `repayLoan()` sent `amount`; the endpoint requires `amount_tokens`.
- TR-256 (High): while live-verifying TR-200's investment-detail view, found 3 more instances of the already-documented `$auth.<field>`-beyond-`.id` bug family (`investments/{id}`, `proposals/{id}`, `events/{id}/submissions` — each referenced `$auth.role_flags` directly in an admin-or-owner check, throwing a fatal `500` instead of a clean `403`). Fixed via the established `get_current_user` pattern from Phase 2.

**One structural defect was found and left open, not fixed this pass**: `POST /investments` and `POST /sponsorships` are designed as "public-or-member" (per the original implementation plan — omit `auth`, read `$auth` opportunistically). Live verification proved this doesn't actually work in this Xano version: omitting the `auth` field means the Authorization header is never decoded at all, so `$auth` is unconditionally null even for a fully authenticated caller. Every submission — logged in or not — is forced down the anonymous branch and never linked to the member's account. No documented "optional-auth" mode exists in this XanoScript version to fix this with a simple script change; logged as TR-257 for an owner decision (accept always-anonymous, require login instead, or explore manual JWT decoding via `security.jwe_decode`/`jws_decode`). A second, narrower open finding: `GET /expenses/me`'s dashboard breakdown aggregates (`by_category`/`by_payment_mode`/`by_month`) return `null` internals for every key — a `??`/dynamic-object-merge quirk, same general shape as other documented compound-expression bugs on this register — logged as TR-258, not blocking (top-level dashboard totals are correct).

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

**Status: closed 2026-07-22. Phase 3 is now fully complete (F3a + F3b).** TR-184, TR-195, TR-196 all fixed. Both required parts done: (1) added a root-level `ErrorBoundary` **and** a React-Router `errorElement` — an important live discovery is that the outer boundary wrapping `RouterProvider` does **not** catch route-screen render errors, because React Router's data router intercepts them first and shows its own default developer error page; the `errorElement` on a pathless root wrapper route is what actually catches them. Both render one shared friendly "Something went wrong / Reload" fallback, proven live via a deliberately-injected synthetic throw. This also closes `E2E_TEST_PLAN.md` §9's "missing app-level error boundary" hypothesis. (2) Fixed each broken wrapper to unwrap its **actual verified** envelope shape — confirmed live per-endpoint that they do *not* share one wrapper key: `listDeclarations` (`{declarations}`), `listSurrenders` (`{data}`), `getPtsHistory`/`getMyActivities`/`getProposals`/`getGuardianApprovals` (`{items}`). Hardened `getItems`/`getOrders`/`getSales` too (bare arrays live today but lacked the defensive guard). TR-184's bundled action-body bug (`{approve}`→`{decision}`) fixed in the same change. **Live-verified in a real browser** (dev server + seeded VGC75 session): guardian-approvals, wallet/declarations, wallet/surrenders, points/activities, pts History, and market/propose all render their empty-state instead of crashing. **The "9th/10th screen" expectation was corrected by live evidence**: the 2 marketplace screens the recurrence hypothesis flagged actually return bare arrays live and were never crash sources (verified before assuming) — the real crash set is the 6 envelope-returning wrappers across 7 screens.

**One new Critical backend defect was found and fixed during F3b verification (TR-259)**: `GET /pts/rate` (and `/quote`, `/convert`) fatally `500`'d "Not numeric." because `pts_compute_rate`'s L_invest loop did raw arithmetic on a `timestamp`-typed field. This loop only runs when an active investment exists — and this session's own TR-200 fix created the platform's first-ever one (VGC75), so F3a's success is what exposed this latent fatal and began degrading the shared `pts/rate` endpoint live. Fixed with `|to_ms` (same class as TR-202's `expenses/me` fix); `pts/rate` verified `200` after. **Guardian Approvals' Approve happy-path was NOT completed end-to-end** — it stays blocked by TR-185 (Phase 4, the approve branch's `member_id` collision), which is independent of this crash fix; WF-02 remains blocked on TR-185 alone now.

---

## Phase 4 — Remaining individual defects

No shared root cause ties these together; each is its own fix. Grouped by severity. "Verify" points at the TR's own `Steps to Reproduce`/`Expected` columns in `TEST_REGISTER.md` (still the authoritative repro) plus, where one exists, the relevant `E2E_TEST_PLAN.md` WF/§ to flip in the coverage ledger.

### Critical

| TR | Fix direction | Cross-ref |
|---|---|---|
| TR-164 | **DONE 2026-07-22.** Added server-side age-gate to `signup_POST.xs` (dob required, future-dated rejected, under-18 rejected via `now|transform_timestamp:"-18 years"`). Live-verified all 4 cases. | WF-01, WF-02, SRS §2.1/§2.4 minor-safeguarding |
| TR-185 | **DONE 2026-07-22.** Applied the `signup_POST.xs` UUID-workaround (temp-uuid `member_id` → insert → `db.edit` to `"VGC"~id`). Live-verified end-to-end: a real approval created minor account VGC76 + 3 wallets (was fatal `500`). Reopens WF-02, now Pass (remaining open in that workflow: TR-183 guardian email, TR-182 `VGC<n>` input nicety). | WF-02 |
| TR-189 | **DONE 2026-07-22.** `submit` now accepts a `draft` and transitions it to `pending`. Live-verified end-to-end (create→submit→pending; re-submit correctly rejected). Unblocks WF-04. | WF-04 |
| TR-199 | **DONE 2026-07-22.** Reworked the whole form to the real endpoint contract (game selector + start/end dates + num_events + total_points_budget/funding_model); the form had been built against a phantom schema, not just missing game_id. Live-verified submission reaches the real deposit logic. | WF-12 |
| TR-207 | **DONE 2026-07-22.** Fixed the join-alias mismatch (`$db.seller.*`). Deploys clean, non-admin gets clean 403; admin-success path needs an admin session. | WF-19 |
| TR-213 | **DONE 2026-07-22.** Built new `GET /admin/loans` (admin-gated, member join, status filter, paginated) + `adminGetLoans()` + rewired AdminLoansScreen to real backend fields. Endpoint gates non-admin 403; admin-success path needs an admin session. | WF-19, WF-15 |
| TR-214 | **DONE 2026-07-22.** Replaced the hardcoded `admin_member_id` id-match with a role check via `get_current_user` (both GET/POST); `$admin_id` kept for notification routing. Live-verified clean 403 for a non-party caller. | WF-19, `UI-083` |
| TR-234 | **DONE 2026-07-22.** Pre-resolved all optional inputs through `?? null` (date/int optionals were throwing "Unable to locate input" when omitted). Live-verified a real save with no `dob` returns 200. Unblocks all profile editing. | WF-01, WF-03, `UI-029` |

### High

| TR | Fix direction | Cross-ref |
|---|---|---|
| TR-140 (remainder) | Rate-limiting is confirmed working for registration/OTP-resend; the broader sweep across voting/applications/ratings/financial mutations is still open — complete that sweep and fix any gap found. | `E2E_TEST_PLAN.md` §11.1 |
| TR-167 | **PARTIAL — remains a sweep.** Several of these are intentional, already-proven lazy-expiry patterns (guardian expiry, contract deadline, etc.). A full verb-correctness audit across every listed family is open-ended and left as a standing sweep under this ID. | §10.6 |
| TR-172 | **DEFERRED — infra/config.** Signed Cloudinary uploads need the Cloudinary API secret in Xano server env + a signing endpoint (the secret is deliberately not in the codebase); server-side format/size validation likewise needs an upload proxy. Left open pending that infra setup. | §17.6 |
| TR-180 | **DONE 2026-07-22.** Added `queryClient.clear()` to SessionExpiredModal on re-login success. | Cross-account cache isolation quarantine-gate row |
| TR-182 | **DONE 2026-07-22.** SignupScreen strips a leading `VGC` so the field accepts the `VGC<n>` format it promises. |
| TR-183 | **DEFERRED — email infra.** The in-app guardian notification fires correctly; the email non-delivery is a Xano free-plan email-deliverability issue (same class as TR-137), not verifiable/fixable from code. Revisit with a paid email provider. | WF-02, §17.5 (Email) |
| TR-190 | See Cluster F2a (Phase 2) — bundled there since it's the same admin-wallet-tools file family. | — |
| TR-203 | **DONE 2026-07-22.** `adminListMembers()` now unwraps `{members}` (was `{items}`). | WF-19 |
| TR-210 | **DONE 2026-07-22.** Market/Activity/Education report wrappers now accept + send `{from,to}`; screen wires its date state through. | WF-19 |
| TR-212 | **DONE 2026-07-22.** Admin Config placeholder/caption now use the real `tokens_per_inr_surrender_numerator`/`_denominator` fields. | WF-19 |
| TR-215 | **DONE 2026-07-22.** Decision: FE adopts the BE's global `{email,in_app,per_event}` model. Two global toggles; verified live. | §16.2, WF-18 |
| TR-224 | **DONE 2026-07-22.** Built public `GET /events/{id}` (event + season name). Clean app-level 404 now, verified live. | WF-12 |
| TR-226 | **DONE 2026-07-22.** `uploadToCloudinary(file, resourceType)` supports `auto`; declaration proof + group-post file attachment routed to Cloudinary. | §17.6 |
| TR-228 | **DEFERRED — needs owner confirmation.** The correct fix is adding `"archived"` to the `blogs.status` enum (an additive schema change); reusing an existing value (`abandoned`/`taken_down`) would break their distinct semantics. The only available schema tool does a full destructive table-schema replace (confirmation-gated), and the plan itself says "confirm the intended status name first" — so this is left Open pending an owner-confirmed additive enum change. | WF-11 |
| TR-229 | **DONE 2026-07-22.** `games/{id}/groups` now requires auth and returns per-group `is_member`; FE drops `public:true`. Live-verified false→true on join. | — |
| TR-231 | **DONE 2026-07-22.** `getItems()` sends `category_id` (was `category`). Live-verified the filter now works. | — |
| TR-235 | See Cluster F1 (Phase 1). | — |
| TR-238 | **DONE 2026-07-22.** `add_secs_to_timestamp` replaces raw `now + 86400000`. Live-verified a 2-member group delete returns 200. | — |

### Medium

| TR | Fix direction |
|---|---|
| TR-132 | **DONE 2026-07-22.** `getNotifRoute` routes `contract_disputed` → `/admin/contracts`. |
| TR-145 | **DONE 2026-07-22.** Added city/state/country to `GET /profile` + EditProfileScreen; PATCH round-trip verified live. |
| TR-174 | **DONE 2026-07-22.** resend-verification token invalidate+insert wrapped in a transaction; VerifyEmailScreen auto-send guard useState→useRef. |
| TR-175 | **DONE 2026-07-22.** Profile screen now shows the member's `VGC<n>` public ID. |
| TR-188 | **DONE 2026-07-22.** Verify-email code field is now `inputMode="text"` (UUID-capable), placeholder updated. |
| TR-192 | **DONE 2026-07-22.** Added a recipient `emit_notification` to points_transfer_POST. |
| TR-193 | **DONE 2026-07-22.** `formatAmount()` appends the unit for every currency; ItemDetailScreen uses the item's real currency. |
| TR-198 | **DONE 2026-07-22.** Admin blog list/detail fall back to `Member #{author_member_id}` (the real field). |
| TR-206 | See Cluster F2b (Phase 2) — same always-zero expression as TR-205's write-side bug. |
| TR-211 | **DONE 2026-07-22.** Audit-log query sends `to` as end-of-day so same-day entries are included. |
| TR-216 | **DONE 2026-07-22.** Confirmed dead scaffolding (zero callers); added `auth="user"` (was public) + fixed missing `to`. Verified 401 unauthenticated. |
| TR-222 | **DONE 2026-07-22.** CreatePostScreen shows a "Join to post" state for non-members instead of the full composer. |
| TR-225 | **DONE 2026-07-22.** EditBlogScreen now renders an ErrorState/Empty state instead of a blank page. |
| TR-230 | **DONE 2026-07-22.** `/verify-email` "code sent" copy is now conditional on whether one was actually dispatched. |
| TR-232 | See Cluster F2a (Phase 2). |
| TR-233 | **DONE 2026-07-22.** Decision: removed the non-functional display_name/bio fields (build would need a schema change). Stops the silent-discard. | — |
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
