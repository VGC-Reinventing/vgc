# E2E Coverage Ledger — Run `E2E-20260723-01`

Route / control / API / table / workflow / security coverage for the fresh run.
Status vocab: `Pass`, `Pass w/risk`, `Fail`, `Partial`, `Blocked`, `Dead`, `N/A`,
`Not run`. A row is `Pass` only on a real runtime execution.

Because this run follows the fix phase, the **Regression** column notes whether a
row confirms a specific fixed TR (e.g. "confirms TR-234").

---

## A. Security / integrity quarantine gate (§18)

| ID | Hypothesis | Method | Result | Evidence | Regression |
|---|---|---|---|---|---|
| G1 | Admin MFA provenance / privilege | Ordinary member token (VGC80) → 5 admin GET endpoints + `admin/wallets/adjust` mutation | **Not reproduced (secure)** | All admin GETs → `403`; `admin/wallets/adjust` (valid body) → `403`, no-token → `401`; no wallet mutation occurred | Confirms TR-176/204/207/213/240 fixes |
| G2 | Role split-brain (`role` vs `role_flags`) | Member has `role:""`, `role_flags.is_member:true`; check own-profile read vs admin action | **Not reproduced (secure)** | `/me` works; admin action correctly `403` — enforcement uses role_flags, not the empty `role` string | Confirms TR-178 |
| G3 | Suspended/unverified access | Unverified VGC80 (`email_verified_at:0`) `/login` | **Known deferral, not a new defect** | Login returns `200` + token for an unverified member — this is the documented owner-deferred TR-137/TR-236 free-plan trade-off (email-verification-at-login coded but disabled), not a regression | — |
| G4 | Cross-account query cache | Load A, re-auth as B without full reset | **Pending (browser)** | To run in browser (TR-180 fix = SessionExpiredModal now clears the cache; queued for the browser pass) | TR-180 |
| G5 | Wallet enum/shape | `wallets/me/{currency}` + profile wallets | **Correct** | `wallets/me/VGC_TOKEN` → 200 real wallet; profile returns `{inr, vgc_token, vgc_points}` with real balances (lowercase resolution correct). The endpoint's `currency` input is the order-currency enum (`INR`/`VGC_TOKEN`/`VGC_POINTS`); the FE `AdminWalletsScreen`/`getWalletBalance` send exactly those values | Confirms TR-181/227/232 |
| G6 | PTS quote arithmetic | `GET /pts/rate`, `POST /pts/quote` (read-only) | **Correct + regression pass** | `pts/rate` → `200` with a valid rate object (no more `"Not numeric."` crash) and `conversion_suspended:true`; `quote` correctly returns `400 "temporarily unavailable"` while suspended | **Confirms TR-259** (the crash fix) |
| G7 | Public/raw exposure | Unauth reads: `backup-admin/status`, public sponsorships | **Not reproduced (secure)** | `backup-admin/status` is intentionally public (SRS §15.2) but now leaks **no** `backup_admin_id`/`last_primary_login` to an anonymous caller (only boolean trigger state) — TR-166 fix confirmed; public sponsorships list is intended | Confirms TR-166 |
| G8 | Contracts optional gateway fields | `contracts` list without / with filters | **Required-params by design** | `contract_type` and `status` are required inputs (400 "Missing param" when omitted); the FE always sends them (`listContracts` sends `contract_type` + `status='listed'`). Not a leak/defect | TR-171 |
| G9 | Stored-XSS iframe sandbox | Embed iframe sandbox attribute | **Pending (browser)** | TR-197 fix (`sandbox="allow-scripts"`, no `allow-same-origin`) is in the built bundle; to confirm rendered attribute in the browser pass | TR-197 |
| G10 | Deployment security headers | Response headers | **Config fixed, deploy-pending** | `vercel.json` now sets CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy (TR-168), applied on the next Vercel deploy; the local dev server does not serve them, and prod is still on the pre-fix deploy | TR-168 |

## B. Workflow suites (§14)

| WF | Suite | Personas | Status | Evidence | TRs |
|---|---|---|---|---|---|
| WF-03 | Password/profile/account data | VGC75 | Pass | `/profile/edit` loads real Full name/Mobile + City/State/Country (Mumbai/Maharashtra/India), no display_name/bio fields; clicking Save persists and navigates home, 0 console errors | Confirms TR-234, TR-145, TR-233 |
| WF-04 | INR declaration → token purchase | VGC75 | Partial | `/wallet/declarations` renders the real "Donation ₹500 · Pending" record (draft→pending pipeline reached admin review). Admin verify/credit step needs an admin session (blocker). | Confirms TR-189, TR-196 |
| WF-14 | Financial donation/investment/sponsorship | VGC75 | **Fail** | `/financial/investments/new` renders correctly (Option A/B, Amount, Start Date — TR-200 fix), but submitting as a **logged-in member** dead-ends: "investor_email is required for unauthenticated submissions" (**TR-257**, escalated to Critical — the form has no email field for authed users). Sponsorship form shares the same TR-257 issue. | TR-200 (form ✓), **TR-257** |
| WF-15 | Loan lifecycle | VGC75 | **Fail** | Request Loan form has the UPI ID field (TR-201 ✓) and renders correctly; but the "My Loans" tab shows "No loans" while `GET /loans/me` returns the real loan — **TR-260** (envelope-key mismatch, member can never see their loans). Admin approval still gated (TR-213 needs admin session). | TR-201 (form ✓), **TR-260** |
| WF-08 | Point Token Scheme | VGC75 | Pass w/risk | `/pts` loads with 0 console errors (TR-259 rate-crash fixed); Convert correctly shows suspended, History renders. Live convert not exercised (conversion suspended platform-wide, a legitimate computed state). | Confirms TR-259 |

## C. Route browser coverage (§13)

| Route | Screen | Status | Width(s) | Evidence | TRs |
|---|---|---|---|---|---|
| /home | HomeScreen | Pass | 360 (default) | Renders, 0 errors; wallet cards show "0 Tokens"/"0 Points" units (TR-193) | TR-193 |
| /profile/edit | EditProfileScreen | Pass | default | Real data loads incl. city/state/country; Save persists (nav home) | TR-234/145/233 |
| /wallet/declarations | DeclarationsListScreen | Pass | default | Renders real Pending declaration, no crash | TR-196/189 |
| /pts | PtsDashboardScreen | Pass | default | 0 console errors (was pts/rate 500) | TR-259 |
| /market/propose | ProposeItemScreen | Pass | default | Renders, 0 errors | TR-195 |
| /profile/guardian-approvals | GuardianApprovalsScreen | Pass | default | Renders, 0 errors | TR-184 |
| /points/activities | ActivityRewardsScreen | Pass | default | Renders, 0 errors | TR-196 |
| /financial/investments/new | CreateInvestmentScreen | Pass w/risk | default | Form renders (TR-200); submit blocked by TR-257 (backend) | TR-200/257 |
| /loans | LoansScreen | Partial | default | Request form OK (TR-201); My Loans list empty (TR-260) | TR-201/260 |

## D. API endpoint coverage (§15.2)

| Endpoint | Group | Status | Evidence | TRs |
|---|---|---|---|---|
