# VGC Reinventing — Master Session Prompt

**How to use:** Paste this entire file as your first message when starting a new Claude Code session from the VGC root directory (`C:\Users\VGC-ADMIN\Documents\VGC\`). The session will orient itself, read current state, and be ready to work on testing/bug-fixes.

**Current working directory on this machine:** `C:\Users\VGC-ADMIN\Documents\VGC\`

---

## Project Status Summary (as of 2026-06-28)

Both backend and frontend are **fully built and deployed**.

| Layer | Status | Location |
|---|---|---|
| XANO Backend | ✅ 422 docs, 29 groups live | Workspace 161992, branch `v1`, instance `x8ki-letl-twmt.n7.xano.io` |
| Vercel Frontend | ✅ All 14 phases complete (FE-P0…FE-P13) + all contract flows complete through TR-096 | https://frontend-kappa-mocha-30.vercel.app |
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

## Known Open Issues (as of last session, 2026-06-28)

These were unresolved at end of last session. Check `TEST_REGISTER.md` first for the latest status.

**Session 2026-06-28 (AM):** TR-091–TR-096 fixed. Contract full lifecycle complete including: Withdraw, Application Chat, Update Interest, Request Detailed Proposal, and assignment flow. 420 XANO docs.
**Session 2026-06-28 (PM):** UX — "Ask for Detailed Proposal" embedded in ContractChatScreen. Build green (1,992 KB), commit b7ae38d.
**Session 2026-06-28 (PM-2):** TR-097 — Proposal save bug fixed + full redesign to Giver-initiated Taker appointment. Two new XANO endpoints (request-correction, appoint). Removed Taker-initiated flow. 422 XANO docs. Build green (1,993 KB), commit 07a2750, pushed → Vercel deployed.
**Session 2026-06-28 (PM-3):** TR-098 — "Save Proposal" was returning "Missing param: application_text". Root cause: XANO update_PATCH endpoint retains Required UI flag for application_text from TR-094 creation (independent of the XanoScript text? declaration). Fix: FE now sends application_text: myApp.message ?? '' in the Save Proposal body. Build green (1,993 KB), commit f2adeaa, pushed → Vercel deployed.
**Session 2026-06-28 (PM-4):** TR-099 — Removed "Mark for Correction" button (redundant with chat). TR-100 — Appoint as Taker: balance gate (button disabled for Independent contracts when Giver VGC Points < agreed price), confirm dialog shows cost + balance, useContract polls every 20s (anti-trick). TR-101 — Fixed appoint_POST.xs: contract now stays "listed" on appointment (was incorrectly setting "active"), other applications no longer rejected (multi-taker support), Taker cap fixed to count assigned applications. Build green (1,992 KB), commits 1f0f09a / 131b9b6 / 5acb0ca, all pushed → Vercel deployed. XANO 409 docs pushed confirmed.

| ID | Area | Issue | Status |
|---|---|---|---|
| BG-7 | Email | XANO free plan email sandbox only delivers to workspace owner (`seekingj01@gmail.com`). OTP emails for regular members don't arrive. External provider (SendGrid key obtained: `SG.Rf5Q…`) deferred until XANO plan upgrade. | Deferred |
| Admin OTP | Admin 2FA | Admin OTP is a 36-char UUID — clunky to copy from email. Candidate to shorten to 6-digit code. | Deferred |
| Lazy Expiry | Contracts | Lazy contract expiry (marking "listed" contracts with past deadline as "expired") was removed to fix TR-087 runtime crash. Needs proper implementation: compute cutoff WITHOUT negative integers in `add_secs_to_timestamp`. | Deferred |

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
