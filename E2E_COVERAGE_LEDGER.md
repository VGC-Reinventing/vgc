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
| WF-14 | Financial donation/investment/sponsorship | VGC75, VGC81 (dummy) | **Pass — fully completed with real dummy data** | TR-257 confirmed end-to-end: a real Option-A ₹1,500 and Option-B ₹4,000 investment, and two real sponsorships (₹2,000/₹3,000, one via direct API, one via the actual UI form), all correctly linked to the submitting member (not anonymous/`member_id: 0`). The UI-submitted investment surfaced **TR-269** (create response wrapped, `data.id` undefined → redirected to `/investments/undefined`) and the detail pages surfaced **TR-268** (₹0 everywhere, wrong Option-A/B description, dead overdue-detection) — both found only because this pass went past the API boundary into the real UI, and both fixed + re-verified live (Option B's 4-payout schedule renders with mathematically correct amounts: ₹80×3 + ₹4,080). | TR-200 (form ✓), **TR-257 ✓, TR-268 ✓, TR-269 ✓** |
| WF-15 | Loan lifecycle | VGC75 | **Fixed (re-verified)** | TR-260 fixed: `getMyLoans` unwraps `.loans`; the "My Loans" tab now renders the real loan (₹2,000, Pending) in the browser. Repay button correctly gated to `status == "active"` with `outstanding_tokens > 0`. Admin approval still gated (TR-213 needs admin session). | TR-201 (form ✓), **TR-260 ✓** |
| WF-05 | Token surrender | VGC75 | **Fixed (boundary-verified)** | Correctly-shaped creation requests were completely blocked by three stacked bugs: TR-263 (FE field-name mismatch), TR-265 (backend wallet-casing), and TR-266 (rate preview/computation from nonexistent config keys) — all fixed; request reaches the real business-logic precondition, browser shows a correct ₹85.00-for-10-tokens preview. **TR-264** (UPI persistence gap) also fixed: added a nullable `upi_id` column to `token_surrenders` (user-confirmed schema change), wired through create + the admin list/screen so an admin can see the payout destination. Not exercised to a real created record (VGC75 has 0 tokens, and this session doesn't execute real-value writes regardless) — verified via a before/after schema diff and the `upi_id`-now-required boundary check. | **TR-263 ✓, TR-264 ✓, TR-265 ✓, TR-266 ✓** |
| WF-09 | Marketplace proposal, cart, checkout | VGC81 (dummy) | **Fail (propose step)** | Add-to-cart and cart rendering both work correctly with real data (₹22.91 INR item, correct enrichment). **Marketplace item proposal (SRS §6.3) is completely broken** — see TR-267 (open): the form is missing 5 of 6 required backend fields entirely (no category picker, no revenue-share input, no buyer-info-field builder), so no real proposal has ever been submittable via the UI. Checkout itself not exercised (needs real balance). | Cart/add-to-cart ✓; **TR-267 (open)** |
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
| /blog/73 | BlogDetailScreen | Pass | default | Renders real blog content (title/body), 0 errors | — |
| /groups/11 | GroupDetailScreen | Pass | default | Renders, 0 errors | — |
| /market/item/11 | ItemDetailScreen | Pass | default | Renders real item (bergamot jaboticaba, ₹22.91 INR — correct currency), Add-to-cart/Buy-now controls, QUANTITY/TOTAL. **Cross-check exposed TR-262** (list mislabeled currencies). | TR-262 |
| /gaming/games/1 | GameDetailScreen | Pass | default | Renders real game (E2E-20260719-01 Test Game) with Seasons/Candidates/Groups tabs, 0 errors | — |
| /explore (post-TR-262) | MarketplaceScreen | Pass | default | After the TR-262 fix, list prices render per real currency: ₹22.91 (INR), 71.75 Tokens (VGC_TOKEN), 57.01 Points (VGC_POINTS) | TR-262 |
| /contracts/31 | ContractDetailScreen | Pass | default | Renders a real listed contract (title/status "listed"/"Secure Contract"/sector "Creative & Design Services"/requirements/budget 200) with an "Express Interest" CTA for a non-party viewer (VGC75). No applications shown to the non-party — re-confirms the TR-217 IDOR gate. 0 errors. | TR-217 |
| /members/75/reputation | ReputationScreen | Pass | default | Renders "Contract Reputation" with the member's real name/public ID (VGC75) + "Copy link" and "No ratings yet" empty state. 0 errors. | — |

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
| `GET /games` | gamingCommunity | Pass | `200` standard `{items}` envelope | — |
| `GET /groups` | groups | Pass | `200` standard `{items}` envelope; FE renders (ids 11/10/7) | — |
| `GET /blog/public` | blog | Pass | `200` `{items, total}`; FE `getPublicBlogs` handles it | — |
| `GET /marketplace/items` | marketplace | Pass | `200` bare **array** (not `{items}`); FE `getMarketItems` handles both — no envelope bug. Real catalog is a currency mix (INR×2, VGC_TOKEN×5, VGC_POINTS×4) — see TR-262 | TR-262 |
| `GET /marketplace/items/11` | marketplace | Pass | `200`, `{price:22.91, currency:"INR", …}` — detail reads currency correctly | TR-262 |
| `GET /proposals` | proposals | Pass | `200` standard `{items}` envelope | — |

### D.1 Envelope-key family sweep (TR-260 class)

Swept the member list endpoints for the custom-envelope mismatch that caused TR-260. Result: `/loans/me` (`{loans}`) was the sole outlier (now fixed); `games`, `groups`, `proposals`, `expenses/me`, `pts/history`, `notifications`, `investments/me` all use the standard `{items}` envelope, `blog/public` uses `{items,total}`, and `marketplace/items` returns a bare array — **all of which the corresponding FE unwrappers already handle**. No further envelope-key defects found.

## E. Responsive / visual matrix (§13 widths)

| Screen | Width | Result | Evidence |
|---|---|---|---|
| /home | 320 | Pass | `scrollWidth == clientWidth == 320`, no element wider than viewport (no horizontal overflow) |
| /explore | 320 | Pass | No horizontal overflow; currency labels render (post-TR-262) |
| /expenses/ledger | 320 | Pass | No horizontal overflow (a table-dense screen — clean) |
| /pts | 320 | Pass | No horizontal overflow |
| /points/passbook | 320 | Pass | No horizontal overflow (passbook table clean) |

Method: at 320×720, checked `documentElement.scrollWidth` vs `clientWidth` and scanned every element's bounding box for `right > viewport`. No offenders on any screen tested — the global `overflow-wrap: anywhere` rule (TR-241/243) and the scrollable `.vgc-tabs` (TR-244) hold up on member screens. Full member-screen ×320 sweep + a11y (focus-trap/landmark) matrix remains to be completed.

## F. Write-flow validation-boundary testing (§14, negative-path only)

Per this session's standing rule, no test step here executes an action that moves real financial value (wallet debit/credit, loan disbursement, a completed points transfer) in any environment — this project's Xano workspace is the same live backend that would run in production even though the project itself is pre-launch. Every row below was proven using only inputs designed to be **rejected** (bad auth, invalid amounts, ownership violations, or fixture accounts with a genuine zero balance that architecturally cannot succeed) — never a valid combination that would complete a transaction.

| Flow | Endpoint | Test | Result | TRs |
|---|---|---|---|---|
| Points transfer (WF-06) | `POST /points-transfer` | No-token; self-transfer; zero/negative amount; unknown recipient | All correctly rejected: `401`; `400 "Cannot transfer to yourself"`; `400` min-value; `404 "Receiver member not found"` | — |
| Token surrender (WF-05) | `POST /token-surrender/create` | Correct-shape request from a real (0-balance) member | **Found and fixed four stacked defects blocking this feature end-to-end**: TR-263 (FE field-name mismatch), TR-265 (backend wallet-casing bug), TR-266 (rate-preview computed from nonexistent config keys), and TR-264 (member's UPI ID had no column to persist to — fixed via a user-confirmed schema addition). All four fixed; the corrected request now reaches the real "insufficient balance" precondition (VGC75 has 0 tokens, so this can never succeed), `upi_id` is now a required input (400s if omitted), and the browser shows a correct ₹85.00 preview for 10 tokens (matching the SRS's ₹8.50/token exactly). | **TR-263 ✓, TR-264 ✓, TR-265 ✓, TR-266 ✓** |
| Loan repayment (WF-15) | `POST /loans/{id}/repay` | No-token; zero/negative amount; nonexistent loan id | All correctly rejected: `401`; `400 "amount_tokens must be positive"` (×2); `404 "Loan not found"` | — |
| Marketplace checkout (WF-09) | `POST /cart/checkout` | No-token (with/without `cart_id`); nonexistent `cart_id`; a cart not owned by the caller | `cart_id` missing → `400` (gateway checks required-param completeness before auth — consistent with the already-documented TR-171 gateway-ordering quirk, not a new defect: supplying `cart_id` alone with no token correctly returns `401`); nonexistent cart → `404`; non-owned cart → `403 "You do not have permission to checkout this cart"` (correct IDOR gate) | — |
| Marketplace add-to-cart | `POST /cart/items` | Nonexistent `item_id`; negative quantity | `404 "Marketplace item not found"`; `400` min-value on quantity | — |

**Net result: this boundary-only pass found and fixed two Critical defects (TR-263, TR-265) that together made the entire token-surrender feature 100% non-functional for every real member, and surfaced one further Open finding (TR-264) needing a product decision.** Every other write-flow's validation/authz boundary (points transfer, loan repayment, checkout, add-to-cart) was confirmed correct with no new defects.
