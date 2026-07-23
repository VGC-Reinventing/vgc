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
| WF-14 | Financial donation/investment/sponsorship | VGC75 | **Fixed (re-verified)** | TR-257 fixed: both `POST /investments` and `POST /sponsorships` now `auth = "user"` with `member_id` from `$auth.id`. Live: no-token → 401; token + non-positive amount → the positive-amount precondition (the "investor_email required for unauthenticated submissions" dead-end is gone). Forms are `RequireAuth`-only so no functionality lost. Not exercised to a real created record (financial write held under the classifier gate); auth path proven negative-side. | TR-200 (form ✓), **TR-257 ✓** |
| WF-15 | Loan lifecycle | VGC75 | **Fixed (re-verified)** | TR-260 fixed: `getMyLoans` unwraps `.loans`; the "My Loans" tab now renders the real loan (₹2,000, Pending) in the browser. Repay button correctly gated to `status == "active"` with `outstanding_tokens > 0`. Admin approval still gated (TR-213 needs admin session). | TR-201 (form ✓), **TR-260 ✓** |
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
| /financial/investments/new | CreateInvestmentScreen | Pass | default | Form renders (TR-200); backend now `auth = "user"` (TR-257 fixed) — submit no longer dead-ends | TR-200/257 |
| /loans | LoansScreen | Pass | default | Request form OK (TR-201); My Loans now shows the ₹2,000 Pending loan (TR-260 fixed) | TR-201/260 |
| /expenses/new | AddExpenseScreen | Pass | default | Real expense created end-to-end via the form (payment-mode labels correct, TR-202); appears in list | TR-202 |
| /expenses | ExpensesScreen | Pass | default | Entries render real amounts ₹250 and ₹150.5 (was ₹0 — **TR-261 fixed**, reads `amount_inr`/`settlement_status`) | TR-261 |
| /explore | MarketplaceScreen | Pass | default | 11 items render with "X Tokens" prices; category chip "Blog Tickets" correctly filters to the 4 ticket items (**TR-231 confirmed in UI**) | TR-231/193 |
| /wallet | WalletScreen | Pass | default | Renders, 0 errors | — |
| /community | CommunityScreen | Pass | default | Renders, 0 errors | — |
| /blog | BlogListScreen | Pass | default | Renders, 0 errors | — |
| /contracts | ContractsScreen | Pass | default | Renders, 0 errors | — |
| /wallet/surrenders | TokenSurrendersListScreen | Pass | default | Renders, 0 errors | TR-196 |
| /notifications | NotificationsScreen | Pass | default | Renders, 0 errors | — |
| /profile | ProfileScreen | Pass | default | Shows public ID "VGC75" (TR-175), "Name, mobile, location" edit label (TR-233), Email verified badge | TR-175/233 |
| /financial | FinancialScreen | Pass | default | Renders, 0 errors | — |
| /education | EducationScreen | Pass | default | Renders, 0 errors | — |
| /gaming/seasons | SeasonsScreen | Pass | default | Renders, 0 errors | — |
| /groups | GroupsScreen | Pass | default | Renders, 0 errors | — |
| /points/passbook | PointsPassbookScreen | Pass | default | Renders, 0 errors | — |
| /points/pending | PendingTransfersScreen | Pass (by design) | default | Intentionally `<Navigate replace>` → `/points/passbook` (points transfer is instant post-TR-081; the pending screen is a deliberate stale-link redirect stub, not a dead route) | TR-081 |
| /points/send | SendPointsScreen | Pass | default | Renders, 0 errors | — |
| /cart | CartScreen | Pass | default | Renders, 0 errors | — |
| /market/orders | OrdersScreen | Pass | default | Renders, 0 errors | — |
| /wallet/declare | DeclarationFormScreen | Pass | default | Renders, 0 errors | — |
| /wallet/surrender | TokenSurrenderScreen | Pass | default | Renders, 0 errors | — |
| /expenses/ledger | ExpenseLedgerScreen | Pass | default | Renders, 0 errors | — |
| /search | SearchScreen | Pass | default | Renders, 0 errors | — |
| /profile/password | ChangePasswordScreen | Pass | default | Renders, 0 errors | — |
| /profile/erasure | ErasureScreen | Pass | default | Renders, 0 errors | — |
| /notifications/preferences | NotifPreferencesScreen | Pass | default | Renders, 0 errors (TR-215 global-model form) | TR-215 |
| /gaming/pioneer-candidacy | PioneerCandidacyScreen | Pass | default | Renders, 0 errors | — |
| /education/teacher | TeacherDashboardScreen | Pass | default | Renders, 0 errors | — |
| /financial/investments/1 | InvestmentDetailScreen | Pass (authz) | default | VGC75 (non-owner; `investments/me` is empty) correctly gets a `403 Access denied` from `GET /investments/1`, and the screen renders a graceful "Couldn't load this / Access denied / Retry" state (no crash). Confirms the F3a IDOR gate on `investments/{id}`. | TR-217-family |

## D. API endpoint coverage (§15.2)

| Endpoint | Group | Status | Evidence | TRs |
|---|---|---|---|---|
| `GET /profile` | userProfile | Pass | No-token → `401`; VGC75 token → `200` with `{status:"success", data:{member_id:"VGC75", email, ...}}` | — |
| `GET /wallets/me` | wallets | Pass | `200`, returns the wallets array incl. the real `inr` wallet (id 153, member_id 75) | TR-181/227 |
| `GET /pts/rate` | pts | Pass | `200` with a rate object (`r_published`, `r_user`, `conversion_suspended`); no `"Not numeric."` crash. Note: `r_eq` computes negative here (pool state), but `conversion_suspended` gates any use — behavioural, not a bug | TR-259 |
| `GET /pts/history` | pts | Pass | `200`, paginated `{items:[]}` (VGC75 has no PTS history) | — |
| `GET /investments/1` | finInvest | Pass (authz) | VGC75 (non-owner) → `403 Access denied`; `GET /investments/me` → `200 {items:[]}` (owns none) — correct IDOR gate | TR-217-family |
| `POST /investments` | finInvest | Pass | No-token → `401`; token + non-positive principal → `400 "principal_inr must be positive"` (auth + member_id resolve; email dead-end gone) | TR-257 |
| `POST /sponsorships` | finSponsor | Pass | No-token → `401`; token + non-positive amount → `400 "amount_inr must be positive"` | TR-257 |
| `GET /loans/me` | loans | Pass | `200` `{loans:[{id:1, amount_inr:2000, outstanding_tokens:0, status:"pending"}], consolidated_schedule, total_outstanding_tokens}` — confirms the `{loans}` envelope (TR-260) | TR-260 |
| `GET /expenses/me` | expenses | Pass | `page`/`per_page` are `min:1` (page=0 → `400`); with valid paging `200` `{items:[{amount_inr, settlement_status, ...}]}` — confirms `amount_inr` (TR-261). Dashboard breakdown nulls still open (TR-258) | TR-261/258 |
| `GET /notifications` | notifications | Pass | `200`, paginated `{items:[…]}` (1 real notification for VGC75) | — |
