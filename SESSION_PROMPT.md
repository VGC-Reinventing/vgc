# VGC Reinventing — Master Session Prompt

**How to use:** Paste this entire file as your first message when starting a new Claude Code session from the VGC root directory (`C:\Users\VGC-ADMIN\Documents\VGC\`). The session will orient itself, read current state, and be ready to work on testing/bug-fixes.

**Current working directory on this machine:** `C:\Users\VGC-ADMIN\Documents\VGC\`

---

## Project Status Summary (as of 2026-06-29)

Both backend and frontend are **fully built and deployed**.

| Layer | Status | Location |
|---|---|---|
| XANO Backend | ✅ 431 docs, 29 groups live | Workspace 161992, branch `v1`, instance `x8ki-letl-twmt.n7.xano.io` |
| Vercel Frontend | ✅ All 14 phases complete (FE-P0…FE-P13) + all contract flows complete through TR-124 | https://frontend-kappa-mocha-30.vercel.app |
| GitHub Repo | ✅ Private repo | VGC-Reinventing/frontend |
| SRS | v2.2 — final | `C:\Users\VGC-ADMIN\Documents\VGC\SRS\VGC_Reinventing_SRS_v2.md` |

**The next phase is TESTING & BUG FIXING.** We are primarily fixing bugs and logging test results, but new features can be added when requested (e.g. TR-047 rich group posts added 2026-06-13).

---

## READ FIRST (in this order)

1. `C:\Users\VGC-ADMIN\Documents\VGC\TEST_REGISTER.md` — **THE BUG TRACKER.** Read the existing entries. The user will describe new bugs to log and fix.
2. `C:\Users\VGC-ADMIN\Documents\VGC\FrontEnd\development_plan.md` — Frontend spec, phase status, BACKEND-GAP register (§6), open decisions. The `§6 BACKEND-GAPs` section lists all known backend contract issues found during build.
3. `C:\Users\VGC-ADMIN\Documents\VGC\FrontEnd\session_log.md` — Most recent FE session log. Last entry = most recent FE state.
4. `C:\Users\VGC-ADMIN\Documents\VGC\XANO\SESSION_LOG.md` — Most recent XANO session log. Last entry = most recent backend state.
5. `C:\Users\VGC-ADMIN\Documents\VGC\API_REFERENCE.md` — The live backend contract (all groups, endpoints, auth). Pull a fresh copy if more than a few days stale: `xano workspace pull -w 161992 -b v1 -d C:\Users\VGC-ADMIN\Documents\VGC\XANO`
6. `C:\Users\VGC-ADMIN\Documents\VGC\SRS\VGC_Reinventing_SRS_v2.md` — SRS v2.2. Reference when you need requirement detail to verify correct behaviour.

---

## Architecture at a Glance

### Backend — XANO

- **Workspace:** 161992 ("VGC's Workspace") · Branch `v1`
- **Instance:** `https://x8ki-letl-twmt.n7.xano.io`
- **Plan:** FREE — no scheduled/background tasks. All time-based behaviour is lazy-evaluated on read (Decision D9).
- **Local pull:** `C:\Users\VGC-ADMIN\Documents\VGC\XANO\`
- **CLI:** `xano` (@xano/cli v1.0.2), profile `vgc` (default). Verify auth: `xano profile me`
- **Auth pattern:** Bearer token (24h TTL). Member token from `POST /api:<canonical>/login`. Admin token from 2FA flow `POST /admin/2fa/login` → `POST /admin/2fa/verify`.
- **XanoScript rules (past-error checklist — always follow):**
  - Reserved vars (never bind): `$response,$output,$input,$auth,$env,$db,$this,$result,$index`
  - Types: `text,int,bool,decimal,json,timestamp,date,email,password,enum,file,attachment,uuid,vector` — NEVER `string/integer/boolean/float/array/object`. Arrays = `type[]`. Free-form object = `json`.
  - Every `query` needs `input { }` (even empty). Every `function.run` needs `as <var>`.
  - `elseif` not `else if`. `~` for concat. `params` not `body` in api.request.
  - Object literals use `:` and commas; block properties use `=` and newlines.
  - Wallet mutations ONLY via `function.run mutate_wallet` — never `db.edit wallets` directly.
  - Admin endpoints ONLY via `function.run require_admin { input = { auth_context: $auth } } as $ok`.
  - `var` OK in `each as` scope but NOT inside `conditional if` blocks — use `var.update` only inside conditionals.
  - `|push:(inline_expr)` with complex filter chains fails — use intermediate var.

### Frontend — Vercel / React PWA

- **Deployed URL:** https://frontend-kappa-mocha-30.vercel.app
- **Local working dir:** `C:\Users\VGC-ADMIN\Documents\VGC\FrontEnd\`
- **Stack:** Vite + React 18 + TypeScript + React Router + TanStack Query + CSS-variables + vite-plugin-pwa + lucide-react
- **Dev server:** `cd C:\Users\VGC-ADMIN\Documents\VGC\FrontEnd && npm run dev` → http://localhost:5173
- **Build:** `npm run build` — must stay green (tsc + vite, SW generated) before any commit
- **Deploy:** push to `main` on GitHub → Vercel auto-deploys
- **API client:** `src/api/client.ts` — Bearer injection, 29 group canonicals, 400/401/403/404/500 mapping
- **Design:** dark "electric violet" — tokens in `src/styles/tokens.css`. Do NOT invent new colours/spacing.
- **Notifications:** TanStack Query `refetchInterval` (~30–60s), pauses when tab hidden (no WebSockets on free plan).

### SRS

- **File:** `C:\Users\VGC-ADMIN\Documents\VGC\SRS\VGC_Reinventing_SRS_v2.md`
- **Version:** 2.2 (final). Any feature change that contradicts SRS must be explicitly discussed — do not silently deviate.
- **If the SRS needs updating** (e.g. a requirement turns out impractical or wrong): edit the file and add an entry to the Document Revision History table at the top. Bump the minor version (e.g. 2.2 → 2.3) and note the date and summary.

---

## Known Credentials

| Account | Email | Password | Notes |
|---|---|---|---|
| Admin | seekingj01+vgcadmin@gmail.com | VgcAdmin#2026 | Member ID VGC37, id=37. Admin 2FA: OTP sent to this email on `POST /admin/2fa/login`. OTP is a 36-char UUID (stored in admin_mfa_challenges). |
| Regular test user | (create during testing as needed) | — | Use `seekingj01+vgcXX@gmail.com` pattern for Gmail plus-addressing |

---

## Known Open Issues (as of last session, 2026-06-30)

These were unresolved at end of last session. Check `TEST_REGISTER.md` first for the latest status.

**Session 2026-06-28 (AM):** TR-091–TR-096 fixed. Contract full lifecycle complete including: Withdraw, Application Chat, Update Interest, Request Detailed Proposal, and assignment flow. 420 XANO docs.
**Session 2026-06-28 (PM):** UX — "Ask for Detailed Proposal" embedded in ContractChatScreen. Build green (1,992 KB), commit b7ae38d.
**Session 2026-06-28 (PM-2):** TR-097 — Proposal save bug fixed + full redesign to Giver-initiated Taker appointment. Two new XANO endpoints (request-correction, appoint). Removed Taker-initiated flow. 422 XANO docs. Build green (1,993 KB), commit 07a2750, pushed → Vercel deployed.
**Session 2026-06-28 (PM-3):** TR-098 — "Save Proposal" was returning "Missing param: application_text". Root cause: XANO update_PATCH endpoint retains Required UI flag for application_text from TR-094 creation (independent of the XanoScript text? declaration). Fix: FE now sends application_text: myApp.message ?? '' in the Save Proposal body. Build green (1,993 KB), commit f2adeaa, pushed → Vercel deployed.
**Session 2026-06-28 (PM-4):** TR-099 — Removed "Mark for Correction" button (redundant with chat). TR-100 — Appoint as Taker: balance gate (button disabled for Independent contracts when Giver VGC Points < agreed price), confirm dialog shows cost + balance, useContract polls every 20s (anti-trick). TR-101 — Fixed appoint_POST.xs: contract now stays "listed" on appointment (was incorrectly setting "active"), other applications no longer rejected (multi-taker support), Taker cap fixed to count assigned applications. Build green (1,992 KB), commits 1f0f09a / 131b9b6 / 5acb0ca, all pushed → Vercel deployed. XANO 409 docs pushed confirmed.
**Session 2026-06-28 (PM-5):** TR-102 — Withdraw confirm dialog now contract-type-aware (Independent vs Secure wording). TR-103 — Chat buttons disabled on cancelled/expired/force-closed contracts (`contractClosed` flag). TR-104 — Candidate view on cancelled contract: red withdrawal banner shown, Edit Proposal and Update Interest buttons hidden. TR-105 — Withdraw button hidden once any Taker assigned (`hasAssignedTaker`); Appoint confirm dialog rewritten (names candidate, "a Taker"/"an additional Taker", cost as balance-requirement not deduction, chat-closure warning, first-appointment-only withdrawal warning); `var(--neg)` token typo fixed → `var(--negative)`. TR-106 — Appointed Taker sees green banner; all chat buttons disabled with `(closed)` label when application is assigned; Giver's appoint dialog and Taker's proposal notices both warn that chat closes permanently on appointment. No XANO changes. Build green (2,002 KB), all commits pushed → Vercel deployed.
**Session 2026-06-28 (PM-6):** TR-108 — Removed "Update Interest" button and form from candidate view after EOI submission (button appeared immediately after submitting interest, implying application was incomplete; chat is the correct negotiation channel). UX — Hairline divider + teal accent chips added between Browse/As Giver/As Taker/Applied main tabs and the Secure/Independent type sub-filter; "Type:" label prefix added. Visible violet scrollbar added to main tab strip via `.contracts-main-tabs` CSS class. No XANO changes. Build green (2,007 KB), all commits pushed → Vercel deployed.
**Session 2026-06-28 (PM-7):** TR-109 — Independent contract completion flow. After appointment, Taker sees "Mark Work Complete" button (deadline-gated: active only while Date.now() ≤ proposed_completion_date + 86400s). On click, Giver sees "Verify & Complete" + "Raise Dispute". On verify: atomic VGC Points debit (Giver) + credit (Taker) for `proposed_price_points ?? budget_points`. Taker can also raise a dispute if Giver does not verify; Giver can raise a dispute if work is unsatisfactory. Both cases set status `"disputed"` and notify the other party. Missing deadline = no pay (no escrow on Independent contracts). Multi-taker: each Taker has their own independent completion flow. XANO: `contract_applications` status enum +`work_submitted`, `completed`, `disputed`; `notifications` +`contract_work_submitted`; 3 new endpoints (`submit-completion`, `verify-completion`, `raise-dispute`). 426 docs confirmed. Build green (2,006 KB), commit 5b98230, pushed → Vercel deployed.
**Session 2026-06-28 (PM-8):** TR-110 — Contract payment invisible in Passbook/Recent Activity. Root cause: `verify_completion_POST.xs` called `mutate_wallet` without `operation_type` — `mutate_wallet` only writes `wallet_transactions` (the passbook source) when `operation_type != null`. Fix: added `operation_type: "contract_payment"` + `operation_id: $application.id` to both calls; split `ref_type` into `"contract_payment_sent"` (Giver debit) and `"contract_payment_received"` (Taker credit). Added matching description branches to `activity_GET.xs`. No FE changes. 426 docs confirmed.
**Session 2026-06-28 (PM-9):** TR-111 — Contract payment passbook entries had no contract context (title, counterparty). `activity_GET.xs` enriched: for contract_payment_sent/received, looks up contract_applications → contracts → counterparty user; adds `contract_title`, `counterparty_name`, `counterparty_code` to each item; description now "Contract payment sent/received — [title]". FE: `WalletTransaction` type extended; `PassbookList` shows "Taker/Giver: name · code" sub-line; `PointsPassbookScreen` renamed "Points history" and merges contract payments (from wallet activity) with peer-to-peer transfers in one time-sorted list. 426 docs confirmed. Build green (2,007 KB), commit 4355fbc, pushed → Vercel deployed.
**Session 2026-06-29 (PM-1):** TR-112 — Chat re-opened post-appointment. `chatLocked` replaces `isPostAssignment` — only `completed`/`disputed`/`contractClosed` lock chat. Backend: messages_POST allows `assigned`+`work_submitted`; messages_GET is_read_only only for terminal statuses. All chat-closure copy removed from UI. 426 docs confirmed. Build green (2,007 KB), commit b9d3449, pushed → Vercel deployed.
**Session 2026-06-29 (PM-2):** TR-113 — Rating and testimony system. `contract_ratings` table rewritten per-application; `notifications` +`contract_rated`; new `rate_POST` + `reputation_GET` endpoints; `id_GET` extended with `has_rated` per application (optional-auth pattern). FE: `StarPicker` + `StarDisplay` components; rating form inlined on ContractDetailScreen for both parties post-completion; new `MemberReputationScreen` at `/members/:id/reputation`; giver/applicant names clickable to reputation pages; ProfileScreen "Contract reputation" row. 447 docs confirmed. Build green (2,020 KB), commit 796b6ca, pushed → Vercel deployed.
**Session 2026-06-29 (PM-3):** TR-114 — Lazy contract expiry. Expired contracts with past `application_deadline` were still appearing in the public Browse tab as "listed". Added lazy expiry block to `contracts_GET.xs` (runs before the main paginated query; marks expired + refunds escrow for vgc_administrated contracts) and `contracts/me_GET.xs` (per-contract lazy check inside the giver foreach using `$g_status` pattern). Comparison: `application_deadline < now` — matches `id_GET.xs` pattern, avoids negative-int crash from TR-087. No FE changes needed. 2 docs pushed (scoped). Next TR-ID: TR-115.
**Session 2026-06-29 (PM-4):** TR-116 — Verify & Complete UI not refreshing after Giver confirmed the dialog. Root cause: `verifyCompletionM.onSuccess` used `invalidateQueries` which triggers a background refetch; the `window.confirm()` dialog briefly sets `document.hidden=true` in some browsers, suppressing that refetch. Fix: replaced with direct `contract.refetch()` + `wallets.refetch()` in `onSuccess`. No XANO changes. Build green (2,014 KB), commit 93a98f4, pushed → Vercel deployed. Next TR-ID: TR-117.
**Session 2026-06-29 (PM-5):** TR-121 — As Giver contract organisation. As Giver tab reorganised into 4 collapsible sections (Needs Attention / In Progress / Accepting Applications / Done collapsed). Tab badge turns red when attention needed. New "Close Applications" action on listed contracts sets `applications_closed=true` (new XANO bool field + endpoint); Browse shows closed badge; Apply hidden on detail screen with notice. XANO: contracts +applications_closed; me_GET.xs enriched with assigned/work_submitted/disputed counts; new close_applications_POST.xs; apply_POST.xs +guard; contracts_GET + id_GET +field. 429 docs confirmed. Build green (2,020 KB), commit 0e93738, pushed → Vercel deployed.
**Session 2026-06-29 (PM-6):** TR-122 — Secure contract escrow moved from posting to appointment time. `contracts_POST.xs` stripped of all wallet actions (both types just `db.add`, no upfront deduction). `contract_applications.xs` +`escrow_amount_points decimal?`. `appoint_POST.xs`: for Secure — computes listing_fee (5%) + total_debit; balance precondition; fetches `system_config.admin_member_id`; `db.transaction` debits Giver escrow+fee, credits admin total; stores `agreed_price` to `application.escrow_amount_points`. For Independent — balance precondition only. `verify_completion_POST.xs`: for Secure — releases `escrow_amount_points ?? agreed_price` from admin wallet → Taker (Giver NOT debited). For Independent — Giver balance check + debit Giver → credit Taker. `cancel_POST.xs` — removed all escrow refund logic; added assigned_apps guard for listed cancel. FE: `CreateContractScreen` removed balance gate at post time; type subtext updated; informational cost hint on budget field. `ContractDetailScreen` appoint step shows cost breakdown (escrow + fee + balance); cancel dialog unified; verify-completion shows "from escrow" vs "from your wallet". 429 docs confirmed. Build green (2,020 KB), commit 679a14d, pushed → Vercel deployed.
**Session 2026-06-29 (PM-7):** TR-117 — Constitutional VGC Points reward for rating. `rate_POST.xs`: after rating creation, computes `reward = min(20, floor(agreed_price × 2 / 100))`; if > 1, debits admin VGC Points + credits rater via `mutate_wallet` (`operation_type: "constitutional_points"`, `ref_type: "contract_rating_reward"`); response extended to `{rating, reward_points}`. `activity_GET.xs`: new `contract_rating_reward` branch resolves contract title via rating → application → contract chain. FE: `rateApplication()` return type updated; toast shows earned points when > 0; `PointsPassbookScreen` gains `reward` Entry kind with green `+N` badge and contract title sub-line. 428 docs confirmed. Build green (2,015 KB), commit e7e36cc, pushed → Vercel deployed.
**Session 2026-06-29 (PM-8):** TR-118/119/120 — Reputation visibility + shareability. TR-118: Browse contract cards show Giver star rating (`★ avg · N ratings`) below giver name; hidden when 0 ratings. `contracts_GET.xs` gains contract_ratings aggregation loop per giver. TR-119: Contract detail Giver application list shows each applicant's inline star rating. `id_GET.xs` gains same aggregation loop per applicant. TR-120: `MemberReputationScreen` gains pill "Copy link" button (Link → Check icon, 2s Copied! label). 2 XANO docs pushed (scoped), 428 confirmed. Build green (2,016 KB), commit 5d76284, pushed → Vercel deployed.
**Session 2026-06-29 (PM-9):** TR-123 — Contract withdrawal dialog copy fix. Changed "removed from the marketplace" → "removed from the Classified section" in the Withdraw Contract confirmation dialog (Marketplace = VGC Token economy; Contracts = VGC Points economy). Build green (2,026 KB), commit 618519a, pushed → Vercel deployed.
**Session 2026-06-30:** TR-125 — Contract lazy expiry fired too early. `application_deadline < now` was comparing midnight-UTC date to current time, expiring contracts at the start of the deadline day. Fixed to `application_deadline|add_secs_to_timestamp:(86400|to_int) <= now` in `contracts_GET.xs`, `me_GET.xs`, `id_GET.xs`. 3 docs pushed, 431 confirmed.
**Session 2026-06-30 (PM):** TR-126 — Independent contract creation blocked with "Missing param: conditions/notes" when those fields were left blank. Root cause: XANO UI Required checkbox was checked for both fields on POST /contracts. Fix: user unchecked Required for `conditions` and `notes` in XANO UI → Contracts API group → POST /contracts → Inputs. No code push. TR-127 — Blog image lightbox not working (clicking images did nothing). Root cause: lightbox overlay used `position:fixed` but rendered inside `.vgc-screen` `overflow-y:auto` container — on iOS Safari, fixed elements inside scroll containers don't escape to the viewport. Fix: moved overlay to `createPortal(..., document.body)`. Build green (2,026 KB), commit cc7a173, pushed → Vercel deployed.
**Session 2026-06-30 (PM-2):** TR-128 — Design clarification: contracts should never auto-expire. `application_deadline` only disables the Express Interest button after the deadline day passes; `requested_completion_date` only gates Submit for Verification. Removed all lazy-expiry blocks from `contracts_GET.xs`, `me_GET.xs`, `id_GET.xs`. Fixed `apply_POST.xs` deadline precondition to give full calendar day. FE: added `applicationDeadlinePassed` flag + notice in `ContractDetailScreen.tsx`. 4 XANO docs pushed scoped. Build green (2,027 KB), commit 8af7a2c, pushed → Vercel deployed.
**Session 2026-06-30 (PM-3):** TR-129 — Contract "Private Notes" field never shown to Giver on detail screen. Notes were saved to backend on create but never rendered. Fix: added Giver-only block (`isGiver && c.notes`) in `ContractDetailScreen.tsx` after the Conditions section, styled with `var(--surface-2)` background + lock label. No backend changes. Build green (2,027 KB), commit 577d93e, pushed → Vercel deployed. TR-130 — Contract notifications not tappable / no deep-link. All contract notifications (`contract_applied`, `contract_assigned`, `contract_message`, etc.) marked read on tap but never navigated. Fix: added `getNotifRoute()` in `NotificationsScreen.tsx` mapping `ref_type=contract` + `ref_id` → `/contracts/:id`; `ref_type=contract_application` → `/contracts`; tap now marks read AND navigates; `→ View` hint in timestamp. Added `ref_type`/`ref_id` to `Notification` type. TR-131 — As Giver tab badge blind to new applicants. Badge only turned red for disputes/work-submitted; pending applicants were invisible at tab level. Fix: computed `totalNewApplicants` (sum of `pending_applicant_count` across listed non-closed giver contracts — already returned by backend, no XANO change); extended `tabBadge()` with `'urgent'`/`'new'`/`'default'` tone (red/teal/violet); As Giver tab now shows teal badge when pending applicants exist and no urgent action needed. Build green (2,027 KB), commit 81ccb74, pushed → Vercel deployed. Next TR-ID: TR-132.
**Session 2026-06-29 (PM-10):** TR-124 — Contract dispute admin visibility fix (full-stack). **XANO** (4 files, 431 docs confirmed): (1) `raise_dispute_POST.xs` extended — adds `dispute_reason` + `disputed_at` to `db.edit contract_applications`; also runs `db.edit contracts` to set `status: "disputed"` (enforce_hidden_fields=false, full field set); fetches `system_config.admin_member_id` and conditionally emits `"contract_disputed"` notification to admin. (2) `contract_applications.xs` table: added `text? dispute_reason?` and `timestamp? disputed_at?` fields. (3) New `GET /admin/contracts/disputes`: admin-only; queries all applications `status == "disputed"`; foreach enriches with contract title/type/sector, giver/taker names, agreed price, escrow amount, dispute reason, disputed_at; returns `{disputes, total}`. (4) New `POST /admin/contracts/applications/{app_id}/resolve`: admin-only; inputs: `decision` (enum), `taker_pct?`, `notes?`; VGC: releases escrow from admin wallet proportionally; non-VGC: conditions_met = Giver → Taker, penalty_cascade = 150%; after resolution sets both `application.status` and `contracts.status` to `"completed"`; notifies Giver + Taker; calls `log_admin_action`. **FE** (build green 2,026 KB, commit 72fe208, pushed → Vercel deployed): (1) `admin.ts`: `DisputedApplication` interface + `adminGetDisputedContracts()` + `ContractDisputeDecision` type + `adminResolveContractApp()`. (2) New `AdminContractsScreen.tsx` at `/admin/contracts`: dispute list with contract title, type badge, Giver/Taker info, financials, dispute reason callout; inline `ResolvePanel` with decision dropdown (filtered by contract type), taker_pct% input (split only), notes textarea; auto-refetches every 30s. (3) `AdminScreen.tsx`: "Contracts" tile added (icon: Scale). (4) `router.tsx`: `/admin/contracts` route wired. Next TR-ID: TR-125.

| ID | Area | Issue | Status |
|---|---|---|---|
| BG-7 | Email | XANO free plan email sandbox only delivers to workspace owner (`seekingj01@gmail.com`). OTP emails for regular members don't arrive. External provider (SendGrid key obtained: `SG.Rf5Q…`) deferred until XANO plan upgrade. | Deferred |
| Admin OTP | Admin 2FA | Admin OTP is a 36-char UUID — clunky to copy from email. Candidate to shorten to 6-digit code. | Deferred |
| Lazy Expiry | Contracts | Implemented in TR-114 (2026-06-29): lazy expiry in contracts_GET.xs + me_GET.xs using application_deadline < now comparison (avoids negative int crash). | Resolved |

---

## Workflow for This Phase (Testing & Bug Fixes)

### When the user reports a bug:

1. **Log it** in `TEST_REGISTER.md` — assign next available ID (TR-001, TR-002, …), fill all columns.
2. **Diagnose** — identify whether it is:
   - **Frontend bug** → fix in `C:\Users\VGC-ADMIN\Documents\VGC\FrontEnd\src\`
   - **Backend bug** → fix in `C:\Users\VGC-ADMIN\Documents\VGC\XANO\api\` or `table\`, validate with `xano_validate_xanoscript`, then push
   - **SRS ambiguity** → clarify with user, then update SRS + implement the clarified behaviour
   - **Doc discrepancy** → update `API_REFERENCE.md` and/or `FrontEnd\development_plan.md §6`
3. **Fix it** — follow the GUARDRAILS below.
4. **Verify** — test the fix against the live backend / dev server. Note the verification result.
5. **Update TEST_REGISTER.md** — mark status Fixed, note what was changed and in which files.
6. **Update session logs:**
   - If FE changed: append one line to `FrontEnd\session_log.md`
   - If XANO changed: append one line to `XANO\SESSION_LOG.md`
   - If SRS changed: update SRS revision history table

### GUARDRAILS

- Reuse the extracted design tokens in `src/styles/tokens.css` — do NOT invent new colors/spacing/type.
- Respect the SRS. If a fix contradicts the SRS, raise it as a decision rather than silently diverging.
- For XANO changes: validate every `.xs` file with `xano_validate_xanoscript` before push. Zero errors; resolve/justify warnings.
- For XANO push: `xano workspace push -w 161992 -b v1 -d C:\Users\VGC-ADMIN\Documents\VGC\XANO --dry-run` first, then without `--dry-run`. Re-pull and diff to confirm.
- After every XANO pull: delete the duplicate dirs that Xano pull restores before pushing. Known duplicates (2026-06-27): `api/financial_donors/`, `api/financial_investments/`, `api/financial_sponsors/`, `api/point_token_scheme/`, `api/admin_reports/`, `api/blog/blog/bookmarks_GET.xs`, `api/groups/groups/invites_me_GET.xs`, `api/admin/admin/2_fa/`. Run the PowerShell scanner from XANO/SESSION_LOG to catch new ones.
- Never use `--no-verify`, `--force`, or `--delete` on XANO push without explicit user confirmation.
- For FE changes: `npm run build` must stay green (tsc + vite) before committing. Then `git push origin main` to trigger Vercel auto-deploy.
- For budget-linked SRS sections (wallet math, PTS formula, loan phases, contract escrow): triple-check against SRS before implementing. Ask if any ambiguity.

### STOP CONDITIONS (ask, don't guess)

- A bug fix changes a money/permission flow in a way that conflicts with the SRS.
- A XANO push fails with an error you don't understand.
- The same bug seems to have multiple root causes and you need to confirm the right one.
- Context running low — summarise open TEST_REGISTER entries, commit what's done, and end cleanly.

---

## End-of-Session Ritual

1. Ensure all worked-on TEST_REGISTER.md entries have their Status, Fix Summary, and Files Changed filled in.
2. If FE changed: `npm run build` green → `git add . && git commit -m "<short message>" && git push origin main` → confirm Vercel deployed.
3. If XANO changed: re-pull → confirm doc count → regenerate affected section of `API_REFERENCE.md`.
4. If SRS changed: bump minor version + update revision history table.
5. Append session summary lines to `FrontEnd\session_log.md` and/or `XANO\SESSION_LOG.md`.
6. Summarise: bugs fixed, bugs still open, next priorities.
