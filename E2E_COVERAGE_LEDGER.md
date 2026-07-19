# VGC E2E Coverage Ledger

**Run:** `E2E-20260719-01`
**Baseline date:** 2026-07-19 Australia/Melbourne
**Plan:** `E2E_TEST_PLAN.md`
**Status rule:** no inventory row may be removed; every row must end in Pass, Fail, Blocked, Not implemented, Dead, Unreachable, Duplicate normalisation artifact, or evidence-backed N/A.

## Coverage dashboard

| Inventory | Total | Pass | Fail | Blocked | Other terminal | Pending |
|---|---:|---:|---:|---:|---:|---:|
| Router entries | 87 | 0 | 0 | 0 | 0 | 87 |
| Control placeholders | 87 | 0 | 0 | 0 | 0 | 87 |
| Frontend API functions | 318 | 0 | 0 | 0 | 0 | 318 |
| Canonical Xano endpoints | 295 | 0 | 0 | 0 | 0 | 295 |
| Reusable Xano functions | 15 | 0 | 0 | 0 | 0 | 15 |
| Xano tables | 93 | 0 | 0 | 0 | 0 | 93 |
| End-to-end workflows | 20 | 0 | 0 | 0 | 0 | 20 |

Counts are updated at each checkpoint from the terminal statuses below. A route is not a Pass merely because it renders.

## 1. Routes

| Route ID | Route/screen | Required page/state/control coverage | SRS | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
| UI-001 | `/admin/login` — `AdminLoginScreen` | Email/password submit; invalid email; unknown email; wrong password; three-strike lockout; challenge creation; OTP blank/wrong/expired/reused/correct; email-OTP versus recovery-code toggle; used/invalid recovery code; duplicate submit; admin/non-admin account; redirect to `/admin`; no member-token privilege leakage | §15.2, §17 | Pending | — | — |
| UI-002 | `/login` — `LoginScreen` | Email/password fields; disabled/enabled submit; unknown email and wrong password must not enumerate accounts; valid/suspended/unverified users; preserved destination; Enter submit; Forgot Password and Create Account links; refresh/session token behaviour | §2.4 | In progress | RUN-002–005 | Login parity passes; valid/suspended/unverified/session cases remain |
| UI-003 | `/signup` — `SignupScreen` | Every registration field and consent link; adult/minor DOB boundary; password rules; duplicate email; City/State/Country/mobile SRS reconciliation; guardian field appearance; invalid/unknown/unverified guardian; consent unchecked; device/IP rate limits; successful adult and minor paths; three wallets/member ID only at correct point | §2.1–2.4, §17 DPDP | In progress | RUN-009–014 | Future DOB accepted; direct backend bypass and success/duplicate/rate-limit cases remain |
| UI-004 | `/forgot-password` — `ForgotPasswordScreen` | Blank/invalid/unknown/known email; generic anti-enumeration response; repeat and rate limit; email content/link/expiry; link once-only; Back-to-login navigation; input preservation on network failure | §2.4, §17 | In progress | RUN-006–008 | Account enumeration confirmed (TR-163); mail/link/repeat/rate-limit cases remain |
| UI-005 | `/reset` — `ResetPasswordScreen` | Missing/malformed/expired/used magic token and email; magic-link exchange; password/confirmation rules; mismatch; old-password rejection after success; new-password login; Back/refresh; token cannot be reused | §2.4, §17 | Pending | — | — |
| UI-006 | `/verify-email` — `VerifyEmailScreen` | Token from link/manual entry as implemented; missing/wrong/expired/used token; resend control and cooldown; five-per-hour limit; successful verification; repeated verification; login gate before/after; clear success and recovery copy | §2.4 | Pending | — | — |
| UI-007 | `/signup/guardian-sent` — `GuardianSentScreen` | Direct access and post-submission access; correct safe summary; no password leakage; guardian instruction; navigation onward; responsive long email/name; expired/rejected context if supported | §2.1.2 | Pending | — | — |
| UI-008 | `/terms` — placeholder/content route | Reach from signup without losing data; actual Terms content, version/effective date and return path; keyboard/readability; direct access. Current placeholder must be reconfirmed against TR-138 | §17 DPDP | Pending | — | — |
| UI-009 | `/privacy` — placeholder/content route | Reach from signup without losing data; actual Privacy content, purposes/rights/contact/version and return path; keyboard/readability; direct access. Current placeholder must be reconfirmed against TR-138 | §17 DPDP | Pending | — | — |
| UI-010 | `/home` — `HomeScreen` | Greeting/identity; balances and rate summaries; every quick-action/module card; verification/mobile capability notices; notification/search icons; pull/refresh behaviour; zero/large/missing wallet data; session-expiry overlay preserving page | §2–§5, §16 | Pending | — | — |
| UI-011 | `/wallet` — `WalletScreen` | All wallet cards and balances; selected wallet/activity views; declaration, surrender, transfer, passbook, rewards and PTS navigation; rate notice/current/pending rates; empty/error/loading; correct currencies, precision, signs and public Member ID | §3–§5 | Pending | — | — |
| UI-012 | `/explore` — `MarketplaceScreen` | Search input; every category/root/subcategory chip; clear filter; item cards; pagination/empty/error; cart, orders/sales and propose actions; inactive/sold-out filtering; eight-level category path; long titles/prices/currencies | §6 | Pending | — | — |
| UI-013 | `/community` — `CommunityScreen` | Every Gaming, Education, Financial, Groups, Blog, Loans, Expenses and Contracts entry card/link shown by the component; role/status badges; empty sector data; correct destination and Back return | §7–§14 | Pending | — | — |
| UI-014 | `/profile` — `ProfileScreen` | Avatar/name/public ID/roles/verification/contact state; edit, password, guardian approvals, notifications, erasure and any admin link; logout confirmation/action; mobile-gating copy; missing avatar; long role set; session clear and protected-route redirect | §2, §15–§17 | Pending | — | — |
| UI-015 | `/wallet/declare` — `DeclarationFormScreen` | Every payment type; amount/description/contact/additional fields; conditional requirements for Donation/Grant/Sponsorship/Investment/Token Purchase; synthetic proof upload; public Member ID; draft versus submit if exposed; validation, duplicate submit and mobile/auth gates; resulting declaration | §3.3, §3.5, §13.1 | Pending | — | — |
| UI-016 | `/wallet/declarations` — `DeclarationsListScreen` | Empty/list; every status; record expansion/action; draft delete/submit; submitted delete blocked; rejection reason; verified wallet effect; ordering; refresh and stale row | §3.3, §3.7 | Pending | — | — |
| UI-017 | `/wallet/surrender` — `TokenSurrenderFormScreen` | Token amount, displayed conversion rate/INR preview and payment details; zero/fraction/too-large/insufficient balance; rate change between render/submit; mobile gate; public Member ID; duplicate submit; pending request and no premature debit | §3.4, §3.6 | Pending | — | — |
| UI-018 | `/wallet/surrenders` — `TokenSurrendersListScreen` | Empty/list/detail affordances; pending/completed/rejected if supported; correct rate snapshot and amounts; ordering; admin completion reflected once | §3.4, §3.7 | Pending | — | — |
| UI-019 | `/points/send` — `TransferFormScreen` | Member lookup/search/selection; self, unknown and unrelated internal/public ID; amount/remark; zero/fraction/insufficient balance; mobile gate; instant confirmation; rapid/double submit; idempotency; sender/receiver balances/passbooks/notifications | §5.5–§5.6 | Pending | — | — |
| UI-020 | `/points/pending` — `PendingTransfersScreen` | Verify immediate history-replacing redirect to `/points/passbook`, direct/reload/Back behaviour and absence of dangling navigation/copy. Test the legacy Pending/Accept/Cancel/Dispute APIs directly because the route intentionally has no UI | §5.5 | Pending | — | — |
| UI-021 | `/points/passbook` — `PointsPassbookScreen` | Empty and every entry type; debit/credit signs; counterpart name/public ID; remark; timestamp; pagination/refresh; large history; linked blog/contract references if shown; totals reconcile | §5.6 | Pending | — | — |
| UI-022 | `/points/activities` — `ActivityRewardsScreen` | Catalog/history/changelog tabs and all controls; active/inactive activities; version/effective date; member activity history; automatic/manual award visibility; empty/error states; values match Appendix A/current catalog | §5.2–§5.4, Appendix A | Pending | — | — |
| UI-023 | `/pts` — `PtsDashboardScreen` | Rate/components/history/convert tabs; direction toggle; amount; quote; confirm/cancel; stale quote/rate; both directions; tax and rounding; insufficient balances/admin liquidity/P_net/floor guards; theta hidden; cache/t_idle; rapid conversion; ledger and audit | §4 | Pending | — | — |
| UI-024 | `/market/item/:id` — `ItemDetailScreen` | Admin/member/blog-ticket item variants; seller/category/description/price/currency/stock/revenue split/buyer schema; quantity; Add to Cart and Buy Now; own item; sold out/inactive; insufficient balance; duplicate RG purchase; every dynamic buyer field. Prove that Add to Cart cannot bypass required buyer information and that captured data survives checkout/order | §6.3–§6.9, §8.5 | Pending | — | — |
| UI-025 | `/cart` — `CartScreen` | Empty; one/multiple vendor carts; quantity/line totals/subtotals; remove each item; checkout each cart; cancel/confirm; stale/inactive/price/stock changes; insufficient balance; concurrent checkout; blog ticket constraint; cart clears exactly once. The current screen has no dynamic buyer-information step: explicitly test and classify required buyer-schema bypass/data loss | §6.6–§6.7 | Pending | — | — |
| UI-026 | `/market/orders` — `OrdersScreen` | Buyer Orders and Seller Sales tabs; empty/populated/error; all statuses; item/order links use correct ID type; quantities, totals, currency and counts; pagination/order; refresh after mutation | §6.7–§6.8 | Pending | — | — |
| UI-027 | `/market/orders/:id` — `OrderDetailScreen` | Buyer/seller/admin visibility; pending POD, POD submitted/delivered, received, disputed, settled, cancelled/refunded; Cancel, Submit POD, Mark Received, Dispute and settlement actions wherever exposed; proof links; deadlines; revenue split; lazy transitions; IDOR | §6.7–§6.9 | Pending | — | — |
| UI-028 | `/market/propose` — `ProposeItemScreen` | Every item/category/sector/type/price/revenue-share/buyer-schema/attachment field; category depth; invalid totals and currency; draft/submit if supported; successful submission; edit/withdraw path discoverability; rejection/change-request recovery; duplicate submit | §6.3–§6.5 | Pending | — | — |
| UI-029 | `/profile/edit` — `EditProfileScreen` | Name/mobile/DOB/location/avatar fields actually present; add/change/remove mobile; location mandatory rules; invalid DOB/mobile; image upload; save/cancel/Back; server-side mass-assignment attempt; verification reset behaviour; refresh | §2.1, §2.4 | Pending | — | — |
| UI-030 | `/profile/password` — `ChangePasswordScreen` | Current/new/confirm fields; show/hide if present; wrong current; weak/reused/mismatch; successful change; double submit; old/new login and existing-session behaviour | §2.4, §17 | Pending | — | — |
| UI-031 | `/profile/guardian-approvals` — `GuardianApprovalsScreen` | Empty; multiple pending; minor details; Approve/Reject plus rejection reason; expired request; other guardian IDOR; duplicate response/race; notification and account/wallet creation only on approval | §2.1.2 | Pending | — | — |
| UI-032 | `/profile/erasure` — `ErasureScreen` | Status states; reason field; warning/consent/submit/cancel; duplicate pending request; admin-processed result on disposable user; distinction from Account Closure; inaccessible/anonymised profile and retained non-reversible ledger | §2.5, §17 DPDP | Pending | — | — |
| UI-033 | `/notifications` — `NotificationsScreen` | Empty; unread/read; every notification event/deep link; mark one/read all; pagination/poll update; missing target; member versus admin deep link; timestamps; duplicate notification prevention; TR-132 recheck | §16 | Pending | — | — |
| UI-034 | `/notifications/preferences` — `NotifPreferencesScreen` | Global channel toggles and every per-category toggle; save/reload; critical security/financial controls immutable; quiet-hours UI and validation if present; default row absence; preference effect on in-app/email delivery | §16.2 | Pending | — | — |
| UI-035 | `/gaming/games/:id` — `GameDetailScreen` | Game information, groups, seasons/election links; join/leave/create-group controls if present; first-time versus mature game; no seasons; role badges; access rules and errors | §11.1–§11.5, §11.14 | Pending | — | — |
| UI-036 | `/gaming/seasons` — `SeasonsListScreen` | Empty and active/closed/archived seasons; filters/tabs/cards; game/election navigation; status/date/funding/Pioneer display; pagination and long history | §11.10–§11.14 | Pending | — | — |
| UI-037 | `/gaming/seasons/:id` — `SeasonDetailScreen` | Proposed/invited/deposit-pending/active/completed/archived states; Independent/Secure funding; deposit, committee, event, ledger/distribution and close/archive controls by role; totals/80% rule; departure effects | §11.7–§11.13 | Pending | — | — |
| UI-038 | `/gaming/events/:id` — `EventDetailScreen` | Event details/status/deadline; submission form/file; own/other submission; edit prohibition; results entry/view; distribution records; before/at/after deadlines; duplicate and IDOR | §11.10–§11.12 | Pending | — | — |
| UI-039 | `/gaming/elections/:id` — `ElectionDetailScreen` | Registration/review/published/voting/closed/tied states; candidate cards; voting-rights purchase, selection and vote; self/candidate voting rules; one vote; unpaid vote; countdown; admin tie-break/public log; results | §11.6 | Pending | — | — |
| UI-040 | `/gaming/pioneer-candidacy` — `PioneerCandidacyScreen` | All three submission sets and both candidacy item/funding variants; required fields/files; preview; immutable-after-submit rule; existing pioneership/candidacy limits; admin review status; withdraw/edit only where permitted | §11.2–§11.6 | Pending | — | — |
| UI-041 | `/education` — `EducationScreen` | Course search/filter/cards; available/hidden/full/cancelled/completed; Teacher dashboard entry; ratings links; empty/error; ticket visibility around dates | §12.1–§12.4 | Pending | — | — |
| UI-042 | `/education/courses/:id` — `CourseDetailScreen` | Course/session/ticket/revenue/teacher details; buy/enrol; own course; insufficient balance; duplicate/full/hidden ticket; amendment notice/acceptance if exposed; session and ratings navigation | §12.2–§12.5 | Pending | — | — |
| UI-043 | `/education/teacher` — `TeacherDashboardScreen` | Non-teacher/teacher; course/session lists; create proposal/amendment controls; QR generation; attendance verification; payout; student rating actions; empty and all session states | §12.5–§12.10 | Pending | — | — |
| UI-044 | `/education/sessions/:id` — `SessionDetailScreen` | Student/teacher/unrelated roles; scheduled/in-progress/auto-ended/completed/cancelled; in-person/online; QR view/join/check-in/verify; roster; amendments; rate actions; payout status | §12.5–§12.10 | Pending | — | — |
| UI-045 | `/education/sessions/:id/checkin` — `StudentCheckinScreen` | QR scanner plus backend-token validation; camera permission allow/deny/unavailable; valid/wrong-session/expired/reused token; unenrolled/student/teacher; offline retry; successful checked-in state and teacher verification. The UI currently appears to promise manual verification without a manual-token input: classify that path `Not implemented` if confirmed. Scan the generated QR on a real device in live and non-live session states | §12.6 | Pending | — | — |
| UI-046 | `/education/teachers/:memberId/ratings` — `TeacherRatingsScreen` | No ratings; multiple ratings; average/count/math; testimonies/author/date; pagination; erased/deleted rater; public/direct access behaviour consistent with route guard | §12.7 | Pending | — | — |
| UI-047 | `/financial` — `FinancialScreen` | Donation/grant/sponsorship/investment sections and every tab/card/CTA; donor wall; overdue count; empty/error; declarations integration; correct visibility and currency | §13 | Pending | — | — |
| UI-048 | `/financial/donors/:id` — `DonorDetailScreen` | Public donor information; multiple declarations/recognitions; privacy fields absent; erased/anonymous donor; missing ID; Back/share/link controls if present | §13.1, §13.5 | Pending | — | — |
| UI-049 | `/financial/investments/new` — `CreateInvestmentScreen` | Option A/B; amount/contact/declaration fields; terms/payout preview; zero/boundary/large amount; mobile/contact gate; submit/double submit; resulting schedule/liability/notification | §13.2 | Pending | — | — |
| UI-050 | `/financial/investments/:id` — `InvestmentDetailScreen` | Owner/admin/unrelated; option A/B; pending/active/due/overdue/paid; schedule and no-compound math; overdue-request control before/at/after 30 days; repeat request; payout updates | §13.2, §13.5 | Pending | — | — |
| UI-051 | `/financial/sponsorships/new` — `CreateSponsorshipScreen` | Recipient lookup; amount/conditions/UPI; full/partial fulfilment criteria; self/unknown recipient; invalid/large amount; consent; submit/double submit; notification/record | §13.3–§13.4 | Pending | — | — |
| UI-052 | `/financial/sponsorships/:id` — `SponsorshipDetailScreen` | Sponsor/recipient/admin/unrelated; pending/recognised/partial/fulfilled/disputed/refunded; progress and evidence; dispute window/action; amounts; admin updates reflected | §13.3–§13.5 | Pending | — | — |
| UI-053 | `/groups` — `GroupsScreen` | Discover/My Groups/invites if present; public/private cards; search/filter; join/request/respond controls; empty/error; visibility for logged-out/non-member; removed member state | §7.1–§7.4 | Pending | — | — |
| UI-054 | `/groups/new` — `CreateGroupScreen` | Name/description/type/sector and every field; validation/duplicates/long text; create/double submit; creator membership/admin role; new group navigation | §7.3–§7.5 | Pending | — | — |
| UI-055 | `/groups/:id` — `GroupDetailScreen` | Outsider/member/removed/admin/co-admin; public/private; Overview/Posts/Members/Manage tabs; Join/Leave/Invite/Approve/Reject/Promote/Transfer/Remove/Appeal/Delete; comments/reactions/polls; 24-hour hold; sole-admin rules; notifications | §7.5–§7.11 | Pending | — | — |
| UI-056 | `/groups/:id/post/new` — `CreatePostScreen` | Text, media, link and poll post types; all type tabs; editor/file/URL/poll options; blank/hostile/large content; member/outsider/removed permissions; submit/double submit; post visibility | §7.8–§7.10 | Pending | — | — |
| UI-057 | `/blog` — `BlogFeedScreen` | Public/My Blogs/Bookmarks or implemented tabs; sector/tag/search filters; article cards; locked RG state; draft/review/rejected statuses where shown; create action; empty/error/pagination | §8.1–§8.2, §8.6 | Pending | — | — |
| UI-058 | `/blog/new` — `CreateBlogScreen` | Title, sector, tags, comments, revenue-generator/ticket price and full rich editor; Save Draft/Submit/Self-publish/abandon paths as exposed; upload/embed; validation; unsaved navigation; duplicate submit | §8.3–§8.5, §8.7 | Pending | — | — |
| UI-059 | `/blog/:id` — `BlogDetailScreen` | Author/reader/non-purchaser/admin; draft/in-review/published/rejected/abandoned/taken-down; free/locked RG; buy ticket; like/dislike/switch/self-vote; comment; bookmark; edit/delete/submit/publish/abandon; image lightbox; moderation | §8.2–§8.10 | Pending | — | — |
| UI-060 | `/blog/:id/edit` — `EditBlogScreen` | Draft and rejected edit; published/in-review/other-author blocked; all editor fields prefilled; rejected reason; save/submit; XSS sanitisation; unsaved change; RG ticket field immutability and reload fidelity | §8.3–§8.7 | Pending | — | — |
| UI-061 | `/loans` — `LoansScreen` | Request form fields; amount/purpose/term/collateral; list/detail presentation; pending/approved/active/repaid/written-off; repayment amount and confirmation; insufficient tokens; phase/debit schedule; multiple loans | §9 | Pending | — | — |
| UI-062 | `/expenses` — `ExpensesScreen` | Dashboard totals/category summaries; search/date/category/status filters; clear controls; pending/settled lists; settle confirmation; add and platform-ledger links; empty/error/pagination; totals reconcile | §10 | Pending | — | — |
| UI-063 | `/expenses/new` — `AddExpenseScreen` | Personal/Platform Outflow entry type and role restriction; description/amount/category/specific category/payment mode/receipt/platform reference/reason visibility; dependent fields; submit/double submit | §10.2–§10.5 | Pending | — | — |
| UI-064 | `/expenses/ledger` — `PlatformLedgerScreen` | Public/member/admin visibility per SRS; date/category/search/pagination; only authorised Platform Outflow entries; per-entry reason/remark visibility; totals and privacy; empty/error | §10.3–§10.6 | Pending | — | — |
| UI-065 | `/contracts` — `ContractsScreen` | Browse/My Contracts tabs and every sub-group; Secure/Independent filter, sector filter and cards; Create; open/closed/expired/cancelled/completed/disputed states; applicant/assigned counts; required-filter gateway behaviour; empty/error | §14 | Pending | — | — |
| UI-066 | `/contracts/new` — `CreateContractScreen` | Title/requirements/budget/type/sector/application deadline/completion date/conditions/notes; Secure versus Independent disclosure; caps; invalid date/amount; mobile and balance gate; submit/double submit | §14.1–§14.2 | Pending | — | — |
| UI-067 | `/contracts/:id` — `ContractDetailScreen` | Giver/applicant/assigned Taker/unrelated/admin; all contract/application states; Apply with optional counter-offer/date; edit/cancel/close applications; Request Detail; rich proposal; Appoint; submit/verify work; dispute; rate; chat; caps/deadlines/payment/fees | §14.2–§14.10 | Pending | — | — |
| UI-068 | `/contracts/:id/chat/:appId` — `ContractChatScreen` | Giver and matching applicant only; third-party/other applicant IDOR; empty/thread; send/rapid send; long/hostile content; notification; read-only timing per current SRS versus implementation; terminal/deleted states | §14.11 | Pending | — | — |
| UI-069 | `/members/:memberId/reputation` — `MemberReputationScreen` | No/one/many ratings; average/count; Giver/Taker roles; testimony; linked contract/rater; erased member; public/internal ID handling; pagination and direct access | §14.9 | Pending | — | — |
| UI-070 | `/search` — `SearchScreen` | Blank/minimum/long/Unicode query; debounce; every sector/category filter; Marketplace/Groups/Blog result sections; clear; result links; empty/error/offline; private group and locked RG visibility; stale/deleted record | §17 Search | Pending | — | — |
| UI-071 | `/admin` — `AdminScreen` | Every dashboard tile/link; admin identity; backup/vacation/security indicators if present; empty/error; no member-only shell confusion; logout/session expiry | §15 | Pending | — | — |
| UI-072 | `/admin/2fa/setup` — `AdminSetup2faScreen` | Initiate; QR/secret; recovery codes; copy controls; verification blank/wrong/expired/correct; setup repeat; recovery-code storage warning; no secret leakage in logs/navigation | §15.2, §17 | Pending | — | — |
| UI-073 | `/admin/members` — `AdminMembersScreen` | Search/pagination/member rows; role/suspend controls; impersonate; process erasure; every modal confirm/cancel; self/owner protection; invalid member; audit; stale row and mass-assignment protection | §2, §15, §17 | Pending | — | — |
| UI-074 | `/admin/declarations` — `AdminDeclarationsScreen` | Declaration and Token Surrender tabs; all statuses; verify/reject/complete controls and reasons; proof links; duplicate/concurrent action; member wallet/ledger/notification; admin can see all—not only own | §3, §13, §15 | Pending | — | — |
| UI-075 | `/admin/proposals` — `AdminProposalsScreen` | Pending/change-requested/accepted/rejected; detail; Accept/Request Changes/Reject and reasons; category/revenue split fields; duplicate decision; item creation and notification | §6.3, §15 | Pending | — | — |
| UI-076 | `/admin/loans` — `AdminLoansScreen` | Pending/approved/active/due/written-off; Approve with terms, Reject with reason, Write Off; validation; repeated/conflicting decision; wallet/debit schedule/audit/notification | §9, §15 | Pending | — | — |
| UI-077 | `/admin/financial` — `AdminFinancialScreen` | Investments, due payouts, donations and sponsorship controls/tabs; mark payout paid; publish donor; recognise/progress/refund sponsorship; filters; duplicate action; liabilities, audit and notifications | §13, §15 | Pending | — | — |
| UI-078 | `/admin/wallets` — `AdminWalletsScreen` | Member lookup; view all wallets/history; adjust credit/debit/reason; mint; points award provision type; budget create/raise/lower; insufficient admin balance; confirmations; reconciliation and audit | §3–§5, §15 | Pending | — | — |
| UI-079 | `/admin/pts` — `AdminPtsScreen` | Components; reserve update; theta adjustment; bootstrap; rate change announcement; audit log; secret theta not exposed publicly; invalid/duplicate values; rate/cache effects; rollback test window | §4, §15 | Pending | — | — |
| UI-080 | `/admin/market` — `AdminMarketScreen` | Orders/items/categories and every implemented tab; fulfil/settle/auto-settle/dispute resolution; create/edit/delete item/category; stale/concurrent state; stock/escrow/revenue reconciliation and audit | §6, §15 | Pending | — | — |
| UI-081 | `/admin/blog` — `AdminBlogScreen` | Status/sector filters; pagination; review links; empty/error; unpublished content access restricted; counts/order; stale item | §8.4, §8.9, §15 | Pending | — | — |
| UI-082 | `/admin/blog/:id` — `AdminBlogReviewScreen` | Full draft/review rendering; Approve + points; Reject + reason; Takedown + reason; RG ticket creation/split; duplicate/concurrent review; author notification/wallet/catalog/audit; hostile rich HTML | §8.4–§8.10 | Pending | — | — |
| UI-083 | `/admin/contracts` — `AdminContractsScreen` | Disputed applications; both party/admin message threads; send message; evidence attachment; resolution choice/amount/reason; deep-link from notification; no unrelated access; escrow/wallet/audit; duplicate resolve | §14.8, §15 | Pending | — | — |
| UI-084 | `/admin/reports` — `AdminReportsScreen` | Every report tab (activity, education, financial, gaming, marketplace, wallet or current source set); from/to filters; invalid ranges; empty/large results; pagination/export if present; totals reconcile and access/privacy | §15, §17 | Pending | — | — |
| UI-085 | `/admin/config` — `AdminConfigScreen` | Load/edit/save configuration; every exposed key and JSON validation; current/pending rate config; audit log; vacation/backup controls if exposed; unknown/protected key; concurrent edit; confirm/rollback | §15, §17 | Pending | — | — |
| UI-086 | `/` | Logged out redirects to `/login` through `/home` auth gate without loop; logged in lands on `/home`; history replacement works |  | Pending | — | — |
| UI-087 | `*` | Unknown shallow/deep routes, malformed casing, trailing slash and encoded path redirect intentionally; no open redirect; logged-out handling; consider whether a real 404 would be better UX |  | Pending | — | — |

## 2. Interactive controls

Each placeholder must be replaced or supplemented with one row per visible, hidden-by-role, disabled, responsive-only, menu, tab, link, button, form control and keyboard action before that route is exercised.

| Control ID | Route ID | Route/state | Accessible name/action and required variants | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
| CTRL-UI-001-000 | UI-001 | `/admin/login` — `AdminLoginScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-002-001 | UI-002 | `/login` — default | Email textbox: blank, whitespace, malformed, Unicode/case, unknown, unverified, suspended and valid disposable addresses; autocomplete/input-mode/accessibility | In progress | RUN-003–004: blank and malformed blocked; unknown/known wrong-password parity confirmed | — |
| CTRL-UI-002-002 | UI-002 | `/login` — default | Password textbox: blank, wrong, valid, long, Unicode/special characters; masking, autocomplete, paste and Enter submit | In progress | RUN-003–004: blank/wrong-password cases exercised; valid/long/Unicode/paste remain | — |
| CTRL-UI-002-003 | UI-002 | `/login` — default/pending/error | Sign in button: disabled matrix, enabled state, keyboard submit, duplicate prevention, pending label, generic error parity, verified/unverified/suspended success gates and preserved destination | In progress | RUN-003–005: blank disabled; generic parity passes; error lacks live-region semantics | — |
| CTRL-UI-002-004 | UI-002 | `/login` — default | `Forgot password?` link: mouse/keyboard activation, route, back navigation and retained/no leaked form state | Pending | Browser DOM baseline: exact href `/forgot-password` | — |
| CTRL-UI-002-005 | UI-002 | `/login` — default | `Create an account` link: mouse/keyboard activation, route, back navigation and retained/no leaked form state | Pending | Browser DOM baseline: exact href `/signup` | — |
| CTRL-UI-002-006 | UI-002 | `/login` — verification error only | Conditional `Verify your email` link: appears only for verification-class response, carries intended email state, route and no account enumeration | Pending | Source: `FrontEnd/src/features/auth/LoginScreen.tsx`; conditional on `/verif/i` in backend error text | — |
| CTRL-UI-003-001 | UI-003 | `/signup` — adult/minor form | `Full name`: blank/whitespace, Unicode, long/boundary, markup; autocomplete and accessible error association | In progress | Browser DOM baseline: accessible name `Full name`, placeholder `Your name` | — |
| CTRL-UI-003-002 | UI-003 | `/signup` — adult/minor form | `Email`: blank/malformed/case/whitespace/duplicate/plus alias; input mode/autocomplete; anti-enumeration | In progress | Browser DOM baseline: accessible name `Email`, type email | — |
| CTRL-UI-003-003 | UI-003 | `/signup` — adult/minor form | `Password`: blank, 7/8/boundary/long/Unicode/special; masking/autocomplete; strength and no leakage | In progress | Browser DOM baseline: accessible name `Password`, new-password autocomplete in source | — |
| CTRL-UI-003-004 | UI-003 | `/signup` — adult/minor form | `Date of birth`: blank/invalid/future/leap-day; exact under/over-18 boundary; age hint and lifecycle branch | Fail | RUN-010–012, RUN-015: boundary works, but future DOB is accepted and a 14-year-old DOB succeeds directly against `/signup` | TR-164 |
| CTRL-UI-003-005 | UI-003 | `/signup` — minor only | Conditional `Parent / guardian VGC Member ID`: appearance/disappearance, blank/unknown/unverified/valid/self; whitespace and format | In progress | RUN-011–012, RUN-015: client-only guardian branch is bypassable; live direct signup created authenticated `VGC48` without guardian linkage | TR-164 |
| CTRL-UI-003-006 | UI-003 | `/signup` — adult/minor form | DPDP consent checkbox: unchecked/checked, label activation, keyboard, error association and submitted boolean | In progress | RUN-010: unchecked submission blocked with visible consent message; checked/keyboard/request payload remain | — |
| CTRL-UI-003-007 | UI-003 | `/signup` — form | `Terms` link: real policy content, mouse/keyboard, return path and preservation of every entered field | Fail | RUN-013: same-tab placeholder route; populated registration state was not preserved on return | TR-138 |
| CTRL-UI-003-008 | UI-003 | `/signup` — form | `Privacy Policy` link: real policy content, mouse/keyboard, return path and preservation of every entered field | Fail | RUN-014: placeholder route exposes authenticated-style bottom navigation to guest | TR-138 |
| CTRL-UI-003-009 | UI-003 | `/signup` — adult/minor/pending/error | Submit: all local validations, native email validity, correct adult/minor label, duplicate prevention, API request, success destination and wallet/account side effects | In progress | RUN-010, RUN-015–016: local validation chain confirmed; direct minor call created auth + three wallets and cleanup proved zero residue; normal adult/minor UI success paths remain | TR-164 |
| CTRL-UI-003-010 | UI-003 | `/signup` — form | `Sign in` link: mouse/keyboard navigation and no accidental account creation | Pending | Browser DOM baseline: exact href `/login` | — |
| CTRL-UI-004-001 | UI-004 | `/forgot-password` — request form | Email textbox: blank, malformed, unknown, known, Unicode/case/whitespace; autocomplete/accessibility; retain value on recoverable error | In progress | RUN-006–008: blank/malformed/unknown/known exercised; unknown and known responses enumerate account status | TR-163 |
| CTRL-UI-004-002 | UI-004 | `/forgot-password` — request form/pending | `Send reset link`: disabled/enabled matrix, Enter submit, duplicate prevention, pending label, repeat/rate limit and generic anti-enumeration result | In progress | RUN-006–008: blank disabled and Enter no-op; known request accepted; anti-enumeration failed; repeat/rate-limit remain | TR-163 |
| CTRL-UI-004-003 | UI-004 | `/forgot-password` — request form | `Back to sign in`: mouse/keyboard route and back-history behaviour | In progress | Browser mouse navigation returned to `/login`; keyboard/history variant remains | — |
| CTRL-UI-004-004 | UI-004 | `/forgot-password` — success | Success-state `Back to sign in` button/link; no resend control; safe reflected address; screen-reader announcement and repeated request path | In progress | RUN-008: success rendered and reflected address safely; no `role=status`/`aria-live`; remaining controls/link lifecycle pending | — |
| CTRL-UI-005-000 | UI-005 | `/reset` — `ResetPasswordScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-006-000 | UI-006 | `/verify-email` — `VerifyEmailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-007-000 | UI-007 | `/signup/guardian-sent` — `GuardianSentScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-008-000 | UI-008 | `/terms` — placeholder/content route | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-009-000 | UI-009 | `/privacy` — placeholder/content route | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-010-000 | UI-010 | `/home` — `HomeScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-011-000 | UI-011 | `/wallet` — `WalletScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-012-000 | UI-012 | `/explore` — `MarketplaceScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-013-000 | UI-013 | `/community` — `CommunityScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-014-000 | UI-014 | `/profile` — `ProfileScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-015-000 | UI-015 | `/wallet/declare` — `DeclarationFormScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-016-000 | UI-016 | `/wallet/declarations` — `DeclarationsListScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-017-000 | UI-017 | `/wallet/surrender` — `TokenSurrenderFormScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-018-000 | UI-018 | `/wallet/surrenders` — `TokenSurrendersListScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-019-000 | UI-019 | `/points/send` — `TransferFormScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-020-000 | UI-020 | `/points/pending` — `PendingTransfersScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-021-000 | UI-021 | `/points/passbook` — `PointsPassbookScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-022-000 | UI-022 | `/points/activities` — `ActivityRewardsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-023-000 | UI-023 | `/pts` — `PtsDashboardScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-024-000 | UI-024 | `/market/item/:id` — `ItemDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-025-000 | UI-025 | `/cart` — `CartScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-026-000 | UI-026 | `/market/orders` — `OrdersScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-027-000 | UI-027 | `/market/orders/:id` — `OrderDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-028-000 | UI-028 | `/market/propose` — `ProposeItemScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-029-000 | UI-029 | `/profile/edit` — `EditProfileScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-030-000 | UI-030 | `/profile/password` — `ChangePasswordScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-031-000 | UI-031 | `/profile/guardian-approvals` — `GuardianApprovalsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-032-000 | UI-032 | `/profile/erasure` — `ErasureScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-033-000 | UI-033 | `/notifications` — `NotificationsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-034-000 | UI-034 | `/notifications/preferences` — `NotifPreferencesScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-035-000 | UI-035 | `/gaming/games/:id` — `GameDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-036-000 | UI-036 | `/gaming/seasons` — `SeasonsListScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-037-000 | UI-037 | `/gaming/seasons/:id` — `SeasonDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-038-000 | UI-038 | `/gaming/events/:id` — `EventDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-039-000 | UI-039 | `/gaming/elections/:id` — `ElectionDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-040-000 | UI-040 | `/gaming/pioneer-candidacy` — `PioneerCandidacyScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-041-000 | UI-041 | `/education` — `EducationScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-042-000 | UI-042 | `/education/courses/:id` — `CourseDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-043-000 | UI-043 | `/education/teacher` — `TeacherDashboardScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-044-000 | UI-044 | `/education/sessions/:id` — `SessionDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-045-000 | UI-045 | `/education/sessions/:id/checkin` — `StudentCheckinScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-046-000 | UI-046 | `/education/teachers/:memberId/ratings` — `TeacherRatingsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-047-000 | UI-047 | `/financial` — `FinancialScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-048-000 | UI-048 | `/financial/donors/:id` — `DonorDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-049-000 | UI-049 | `/financial/investments/new` — `CreateInvestmentScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-050-000 | UI-050 | `/financial/investments/:id` — `InvestmentDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-051-000 | UI-051 | `/financial/sponsorships/new` — `CreateSponsorshipScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-052-000 | UI-052 | `/financial/sponsorships/:id` — `SponsorshipDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-053-000 | UI-053 | `/groups` — `GroupsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-054-000 | UI-054 | `/groups/new` — `CreateGroupScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-055-000 | UI-055 | `/groups/:id` — `GroupDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-056-000 | UI-056 | `/groups/:id/post/new` — `CreatePostScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-057-000 | UI-057 | `/blog` — `BlogFeedScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-058-000 | UI-058 | `/blog/new` — `CreateBlogScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-059-000 | UI-059 | `/blog/:id` — `BlogDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-060-000 | UI-060 | `/blog/:id/edit` — `EditBlogScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-061-000 | UI-061 | `/loans` — `LoansScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-062-000 | UI-062 | `/expenses` — `ExpensesScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-063-000 | UI-063 | `/expenses/new` — `AddExpenseScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-064-000 | UI-064 | `/expenses/ledger` — `PlatformLedgerScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-065-000 | UI-065 | `/contracts` — `ContractsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-066-000 | UI-066 | `/contracts/new` — `CreateContractScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-067-000 | UI-067 | `/contracts/:id` — `ContractDetailScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-068-000 | UI-068 | `/contracts/:id/chat/:appId` — `ContractChatScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-069-000 | UI-069 | `/members/:memberId/reputation` — `MemberReputationScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-070-000 | UI-070 | `/search` — `SearchScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-071-000 | UI-071 | `/admin` — `AdminScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-072-000 | UI-072 | `/admin/2fa/setup` — `AdminSetup2faScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-073-000 | UI-073 | `/admin/members` — `AdminMembersScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-074-000 | UI-074 | `/admin/declarations` — `AdminDeclarationsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-075-000 | UI-075 | `/admin/proposals` — `AdminProposalsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-076-000 | UI-076 | `/admin/loans` — `AdminLoansScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-077-000 | UI-077 | `/admin/financial` — `AdminFinancialScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-078-000 | UI-078 | `/admin/wallets` — `AdminWalletsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-079-000 | UI-079 | `/admin/pts` — `AdminPtsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-080-000 | UI-080 | `/admin/market` — `AdminMarketScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-081-000 | UI-081 | `/admin/blog` — `AdminBlogScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-082-000 | UI-082 | `/admin/blog/:id` — `AdminBlogReviewScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-083-000 | UI-083 | `/admin/contracts` — `AdminContractsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-084-000 | UI-084 | `/admin/reports` — `AdminReportsScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-085-000 | UI-085 | `/admin/config` — `AdminConfigScreen` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-086-000 | UI-086 | `/` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |
| CTRL-UI-087-000 | UI-087 | `*` | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |

## 3. Frontend API/query functions

| Function ID | Source | Export | Screen/control caller(s) | Observed request/cache behaviour | Result | Evidence | Defect |
|---|---|---|---|---|---|---|---|
| FE-001 | `FrontEnd/src/api/activityRewards.ts` | `getActivityCatalog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-002 | `FrontEnd/src/api/activityRewards.ts` | `getActivityChangelog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-003 | `FrontEnd/src/api/activityRewards.ts` | `logActivity` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-004 | `FrontEnd/src/api/activityRewards.ts` | `getMyActivities` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-005 | `FrontEnd/src/api/admin.ts` | `adminLogin` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-006 | `FrontEnd/src/api/admin.ts` | `adminVerifyOtp` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-007 | `FrontEnd/src/api/admin.ts` | `adminRecoverOtp` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-008 | `FrontEnd/src/api/admin.ts` | `adminSetup2fa` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-009 | `FrontEnd/src/api/admin.ts` | `adminVerifySetup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-010 | `FrontEnd/src/api/admin.ts` | `adminListMembers` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-011 | `FrontEnd/src/api/admin.ts` | `adminUpdateMember` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-012 | `FrontEnd/src/api/admin.ts` | `adminImpersonate` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-013 | `FrontEnd/src/api/admin.ts` | `adminProcessErasure` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-014 | `FrontEnd/src/api/admin.ts` | `adminGetMemberWallets` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-015 | `FrontEnd/src/api/admin.ts` | `adminAdjustWallet` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-016 | `FrontEnd/src/api/admin.ts` | `adminMintPoints` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-017 | `FrontEnd/src/api/admin.ts` | `adminAwardPoints` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-018 | `FrontEnd/src/api/admin.ts` | `adminSetBudget` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-019 | `FrontEnd/src/api/admin.ts` | `adminGetBudget` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-020 | `FrontEnd/src/api/admin.ts` | `adminGetPtsComponents` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-021 | `FrontEnd/src/api/admin.ts` | `adminUpdateReserveAssets` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-022 | `FrontEnd/src/api/admin.ts` | `adminThetaAdjust` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-023 | `FrontEnd/src/api/admin.ts` | `adminBootstrapPts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-024 | `FrontEnd/src/api/admin.ts` | `adminGetPtsAuditLog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-025 | `FrontEnd/src/api/admin.ts` | `adminUpdateSystemConfig` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-026 | `FrontEnd/src/api/admin.ts` | `adminGetAuditLog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-027 | `FrontEnd/src/api/admin.ts` | `adminProposalDecision` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-028 | `FrontEnd/src/api/admin.ts` | `adminListMarketItems` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-029 | `FrontEnd/src/api/admin.ts` | `adminModerateItem` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-030 | `FrontEnd/src/api/admin.ts` | `adminAutoSettleOrders` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-031 | `FrontEnd/src/api/admin.ts` | `adminResolveDispute` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-032 | `FrontEnd/src/api/admin.ts` | `adminSettleOrder` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-033 | `FrontEnd/src/api/admin.ts` | `adminGetDeclarations` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-034 | `FrontEnd/src/api/admin.ts` | `adminGetTokenSurrenders` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-035 | `FrontEnd/src/api/admin.ts` | `adminVerifyDeclaration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-036 | `FrontEnd/src/api/admin.ts` | `adminRejectDeclaration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-037 | `FrontEnd/src/api/admin.ts` | `adminCompleteTokenSurrender` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-038 | `FrontEnd/src/api/admin.ts` | `adminGetBlogs` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-039 | `FrontEnd/src/api/admin.ts` | `adminApproveBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-040 | `FrontEnd/src/api/admin.ts` | `adminRejectBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-041 | `FrontEnd/src/api/admin.ts` | `adminTakedownBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-042 | `FrontEnd/src/api/admin.ts` | `adminResolveContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-043 | `FrontEnd/src/api/admin.ts` | `adminApproveLoan` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-044 | `FrontEnd/src/api/admin.ts` | `adminRejectLoan` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-045 | `FrontEnd/src/api/admin.ts` | `adminWriteOffLoan` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-046 | `FrontEnd/src/api/admin.ts` | `adminPublishDonation` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-047 | `FrontEnd/src/api/admin.ts` | `adminUpdateSponsorshipProgress` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-048 | `FrontEnd/src/api/admin.ts` | `adminRefundSponsorship` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-049 | `FrontEnd/src/api/admin.ts` | `adminListInvestments` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-050 | `FrontEnd/src/api/admin.ts` | `adminMarkPayoutPaid` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-051 | `FrontEnd/src/api/admin.ts` | `adminListCourse` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-052 | `FrontEnd/src/api/admin.ts` | `adminAmendmentDecision` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-053 | `FrontEnd/src/api/admin.ts` | `adminCoursePayout` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-054 | `FrontEnd/src/api/admin.ts` | `adminReportFinancial` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-055 | `FrontEnd/src/api/admin.ts` | `adminReportWalletBalances` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-056 | `FrontEnd/src/api/admin.ts` | `adminReportActivity` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-057 | `FrontEnd/src/api/admin.ts` | `adminReportMarketplace` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-058 | `FrontEnd/src/api/admin.ts` | `adminReportGaming` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-059 | `FrontEnd/src/api/admin.ts` | `adminReportEducation` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-060 | `FrontEnd/src/api/admin.ts` | `adminGetDisputedContracts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-061 | `FrontEnd/src/api/admin.ts` | `adminResolveContractApp` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-062 | `FrontEnd/src/api/auth.ts` | `login` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-063 | `FrontEnd/src/api/auth.ts` | `signup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-064 | `FrontEnd/src/api/auth.ts` | `getMe` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-065 | `FrontEnd/src/api/auth.ts` | `verifyEmail` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-066 | `FrontEnd/src/api/auth.ts` | `resendVerification` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-067 | `FrontEnd/src/api/auth.ts` | `verifyMobile` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-068 | `FrontEnd/src/api/auth.ts` | `changePassword` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-069 | `FrontEnd/src/api/auth.ts` | `requestResetLink` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-070 | `FrontEnd/src/api/auth.ts` | `magicLinkLogin` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-071 | `FrontEnd/src/api/auth.ts` | `updatePasswordPostReset` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-072 | `FrontEnd/src/api/auth.ts` | `guardianRegistration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-073 | `FrontEnd/src/api/auth.ts` | `getGuardianApprovals` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-074 | `FrontEnd/src/api/auth.ts` | `respondGuardianApproval` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-075 | `FrontEnd/src/api/blog.ts` | `getPublicBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-076 | `FrontEnd/src/api/blog.ts` | `getMyBlogs` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-077 | `FrontEnd/src/api/blog.ts` | `getBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-078 | `FrontEnd/src/api/blog.ts` | `createBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-079 | `FrontEnd/src/api/blog.ts` | `editBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-080 | `FrontEnd/src/api/blog.ts` | `deleteBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-081 | `FrontEnd/src/api/blog.ts` | `submitBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-082 | `FrontEnd/src/api/blog.ts` | `publishBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-083 | `FrontEnd/src/api/blog.ts` | `archiveBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-084 | `FrontEnd/src/api/blog.ts` | `abandonBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-085 | `FrontEnd/src/api/blog.ts` | `likeBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-086 | `FrontEnd/src/api/blog.ts` | `dislikeBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-087 | `FrontEnd/src/api/blog.ts` | `commentBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-088 | `FrontEnd/src/api/blog.ts` | `toggleBookmark` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-089 | `FrontEnd/src/api/blog.ts` | `getMyBookmarks` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-090 | `FrontEnd/src/api/cart.ts` | `addToCart` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-091 | `FrontEnd/src/api/cart.ts` | `getCarts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-092 | `FrontEnd/src/api/cart.ts` | `removeCartItem` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-093 | `FrontEnd/src/api/cart.ts` | `checkout` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-094 | `FrontEnd/src/api/client.ts` | `request` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-095 | `FrontEnd/src/api/contracts.ts` | `createContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-096 | `FrontEnd/src/api/contracts.ts` | `listContracts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-097 | `FrontEnd/src/api/contracts.ts` | `getContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-098 | `FrontEnd/src/api/contracts.ts` | `editContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-099 | `FrontEnd/src/api/contracts.ts` | `applyContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-100 | `FrontEnd/src/api/contracts.ts` | `assignContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-101 | `FrontEnd/src/api/contracts.ts` | `markCompleteContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-102 | `FrontEnd/src/api/contracts.ts` | `releaseContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-103 | `FrontEnd/src/api/contracts.ts` | `disputeContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-104 | `FrontEnd/src/api/contracts.ts` | `escalateContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-105 | `FrontEnd/src/api/contracts.ts` | `cancelContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-106 | `FrontEnd/src/api/contracts.ts` | `forceCloseRequest` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-107 | `FrontEnd/src/api/contracts.ts` | `rateContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-108 | `FrontEnd/src/api/contracts.ts` | `requestDetailedProposal` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-109 | `FrontEnd/src/api/contracts.ts` | `updateApplication` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-110 | `FrontEnd/src/api/contracts.ts` | `confirmAssignment` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-111 | `FrontEnd/src/api/contracts.ts` | `appointCandidate` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-112 | `FrontEnd/src/api/contracts.ts` | `submitCompletion` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-113 | `FrontEnd/src/api/contracts.ts` | `verifyCompletion` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-114 | `FrontEnd/src/api/contracts.ts` | `raiseApplicationDispute` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-115 | `FrontEnd/src/api/contracts.ts` | `getMyContracts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-116 | `FrontEnd/src/api/contracts.ts` | `getContractMessages` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-117 | `FrontEnd/src/api/contracts.ts` | `sendContractMessage` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-118 | `FrontEnd/src/api/contracts.ts` | `rateApplication` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-119 | `FrontEnd/src/api/contracts.ts` | `getMemberReputation` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-120 | `FrontEnd/src/api/contracts.ts` | `closeApplications` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-121 | `FrontEnd/src/api/contracts.ts` | `getDisputeMessages` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-122 | `FrontEnd/src/api/contracts.ts` | `sendDisputeMessage` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-123 | `FrontEnd/src/api/declarations.ts` | `createDeclaration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-124 | `FrontEnd/src/api/declarations.ts` | `submitDeclaration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-125 | `FrontEnd/src/api/declarations.ts` | `listDeclarations` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-126 | `FrontEnd/src/api/declarations.ts` | `getDeclaration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-127 | `FrontEnd/src/api/declarations.ts` | `deleteDeclaration` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-128 | `FrontEnd/src/api/education.ts` | `createCourse` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-129 | `FrontEnd/src/api/education.ts` | `getMyCourses` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-130 | `FrontEnd/src/api/education.ts` | `getCourse` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-131 | `FrontEnd/src/api/education.ts` | `proposeAmendment` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-132 | `FrontEnd/src/api/education.ts` | `requestPayout` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-133 | `FrontEnd/src/api/education.ts` | `getMyEnrollments` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-134 | `FrontEnd/src/api/education.ts` | `startSession` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-135 | `FrontEnd/src/api/education.ts` | `endSession` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-136 | `FrontEnd/src/api/education.ts` | `cancelSession` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-137 | `FrontEnd/src/api/education.ts` | `checkinSession` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-138 | `FrontEnd/src/api/education.ts` | `verifyAttendance` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-139 | `FrontEnd/src/api/education.ts` | `getSessionAttendance` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-140 | `FrontEnd/src/api/education.ts` | `rateTeacher` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-141 | `FrontEnd/src/api/education.ts` | `rateStudent` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-142 | `FrontEnd/src/api/education.ts` | `getTeacherRatings` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-143 | `FrontEnd/src/api/expenses.ts` | `logExpense` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-144 | `FrontEnd/src/api/expenses.ts` | `getMyExpenses` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-145 | `FrontEnd/src/api/expenses.ts` | `settleExpense` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-146 | `FrontEnd/src/api/expenses.ts` | `getPlatformLedger` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-147 | `FrontEnd/src/api/financial.ts` | `getDonors` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-148 | `FrontEnd/src/api/financial.ts` | `getDonor` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-149 | `FrontEnd/src/api/financial.ts` | `createInvestment` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-150 | `FrontEnd/src/api/financial.ts` | `getMyInvestments` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-151 | `FrontEnd/src/api/financial.ts` | `getOverdueCount` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-152 | `FrontEnd/src/api/financial.ts` | `getInvestment` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-153 | `FrontEnd/src/api/financial.ts` | `fileOverdueRequest` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-154 | `FrontEnd/src/api/financial.ts` | `createSponsorship` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-155 | `FrontEnd/src/api/financial.ts` | `getSponsorships` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-156 | `FrontEnd/src/api/financial.ts` | `getSponsorship` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-157 | `FrontEnd/src/api/financial.ts` | `disputeSponsorship` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-158 | `FrontEnd/src/api/gamingCommunity.ts` | `getGames` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-159 | `FrontEnd/src/api/gamingCommunity.ts` | `getGame` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-160 | `FrontEnd/src/api/gamingCommunity.ts` | `createGameGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-161 | `FrontEnd/src/api/gamingCommunity.ts` | `getGameGroups` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-162 | `FrontEnd/src/api/gamingCommunity.ts` | `joinGameGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-163 | `FrontEnd/src/api/gamingCommunity.ts` | `leaveGameGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-164 | `FrontEnd/src/api/gamingElections.ts` | `registerPioneerCandidate` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-165 | `FrontEnd/src/api/gamingElections.ts` | `getPioneerCandidates` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-166 | `FrontEnd/src/api/gamingElections.ts` | `updatePioneerCandidate` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-167 | `FrontEnd/src/api/gamingElections.ts` | `getElection` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-168 | `FrontEnd/src/api/gamingElections.ts` | `getElectionEligibility` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-169 | `FrontEnd/src/api/gamingElections.ts` | `castVote` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-170 | `FrontEnd/src/api/gamingSeasons.ts` | `getSeasons` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-171 | `FrontEnd/src/api/gamingSeasons.ts` | `getSeason` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-172 | `FrontEnd/src/api/gamingSeasons.ts` | `joinSeasonCommittee` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-173 | `FrontEnd/src/api/gamingSeasons.ts` | `getSeasonEvents` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-174 | `FrontEnd/src/api/gamingSeasons.ts` | `submitEventEntry` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-175 | `FrontEnd/src/api/gamingSeasons.ts` | `getEventSubmissions` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-176 | `FrontEnd/src/api/gamingSeasons.ts` | `postEventResults` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-177 | `FrontEnd/src/api/gamingSeasons.ts` | `depositSecureFunding` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-178 | `FrontEnd/src/api/gamingSeasons.ts` | `getSeasonLedger` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-179 | `FrontEnd/src/api/gamingSeasons.ts` | `createDistributionRecord` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-180 | `FrontEnd/src/api/groups.ts` | `listGroups` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-181 | `FrontEnd/src/api/groups.ts` | `getGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-182 | `FrontEnd/src/api/groups.ts` | `createGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-183 | `FrontEnd/src/api/groups.ts` | `joinGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-184 | `FrontEnd/src/api/groups.ts` | `leaveGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-185 | `FrontEnd/src/api/groups.ts` | `inviteMember` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-186 | `FrontEnd/src/api/groups.ts` | `respondInvite` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-187 | `FrontEnd/src/api/groups.ts` | `getMyGroupInvites` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-188 | `FrontEnd/src/api/groups.ts` | `decideJoinRequest` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-189 | `FrontEnd/src/api/groups.ts` | `promoteCoadmin` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-190 | `FrontEnd/src/api/groups.ts` | `transferAdmin` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-191 | `FrontEnd/src/api/groups.ts` | `removeMember` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-192 | `FrontEnd/src/api/groups.ts` | `appealRemoval` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-193 | `FrontEnd/src/api/groups.ts` | `deleteGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-194 | `FrontEnd/src/api/groups.ts` | `getGroupMembers` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-195 | `FrontEnd/src/api/groups.ts` | `getGroupJoinRequests` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-196 | `FrontEnd/src/api/groups.ts` | `getGroupPendingInvites` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-197 | `FrontEnd/src/api/groups.ts` | `listGroupPosts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-198 | `FrontEnd/src/api/groups.ts` | `createPost` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-199 | `FrontEnd/src/api/groups.ts` | `commentOnPost` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-200 | `FrontEnd/src/api/groups.ts` | `getPostComments` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-201 | `FrontEnd/src/api/groups.ts` | `reactToPost` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-202 | `FrontEnd/src/api/groups.ts` | `voteOnPoll` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-203 | `FrontEnd/src/api/groups.ts` | `deletePost` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-204 | `FrontEnd/src/api/loans.ts` | `requestLoan` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-205 | `FrontEnd/src/api/loans.ts` | `getMyLoans` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-206 | `FrontEnd/src/api/loans.ts` | `repayLoan` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-207 | `FrontEnd/src/api/marketplace.ts` | `getCategories` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-208 | `FrontEnd/src/api/marketplace.ts` | `getCategoryTree` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-209 | `FrontEnd/src/api/marketplace.ts` | `getItems` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-210 | `FrontEnd/src/api/marketplace.ts` | `getItem` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-211 | `FrontEnd/src/api/marketplace.ts` | `placeOrder` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-212 | `FrontEnd/src/api/marketplace.ts` | `getOrders` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-213 | `FrontEnd/src/api/marketplace.ts` | `getOrder` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-214 | `FrontEnd/src/api/marketplace.ts` | `getSales` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-215 | `FrontEnd/src/api/marketplace.ts` | `submitProofOfDelivery` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-216 | `FrontEnd/src/api/marketplace.ts` | `markReceived` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-217 | `FrontEnd/src/api/marketplace.ts` | `disputeOrder` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-218 | `FrontEnd/src/api/marketplace.ts` | `requestSettle` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-219 | `FrontEnd/src/api/marketplace.ts` | `cancelOrder` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-220 | `FrontEnd/src/api/notifications.ts` | `getNotifications` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-221 | `FrontEnd/src/api/notifications.ts` | `markNotificationRead` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-222 | `FrontEnd/src/api/notifications.ts` | `markAllNotificationsRead` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-223 | `FrontEnd/src/api/notifications.ts` | `getNotificationPreferences` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-224 | `FrontEnd/src/api/notifications.ts` | `updateNotificationPreferences` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-225 | `FrontEnd/src/api/pointsTransfer.ts` | `initiateTransfer` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-226 | `FrontEnd/src/api/pointsTransfer.ts` | `getTransferPassbook` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-227 | `FrontEnd/src/api/profile.ts` | `getProfile` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-228 | `FrontEnd/src/api/profile.ts` | `updateProfile` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-229 | `FrontEnd/src/api/profile.ts` | `getRoles` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-230 | `FrontEnd/src/api/profile.ts` | `lookupMembers` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-231 | `FrontEnd/src/api/profile.ts` | `getErasureRequest` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-232 | `FrontEnd/src/api/profile.ts` | `createErasureRequest` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-233 | `FrontEnd/src/api/proposals.ts` | `submitProposal` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-234 | `FrontEnd/src/api/proposals.ts` | `getProposals` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-235 | `FrontEnd/src/api/proposals.ts` | `getProposal` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-236 | `FrontEnd/src/api/proposals.ts` | `editProposal` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-237 | `FrontEnd/src/api/proposals.ts` | `withdrawProposal` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-238 | `FrontEnd/src/api/pts.ts` | `getPtsRate` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-239 | `FrontEnd/src/api/pts.ts` | `quoteConversion` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-240 | `FrontEnd/src/api/pts.ts` | `convert` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-241 | `FrontEnd/src/api/pts.ts` | `getPtsHistory` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-242 | `FrontEnd/src/api/queries.ts` | `useMe` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-243 | `FrontEnd/src/api/queries.ts` | `usePlatformConfig` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-244 | `FrontEnd/src/api/queries.ts` | `useProfile` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-245 | `FrontEnd/src/api/queries.ts` | `useRoles` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-246 | `FrontEnd/src/api/queries.ts` | `useGuardianApprovals` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-247 | `FrontEnd/src/api/queries.ts` | `useErasureRequest` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-248 | `FrontEnd/src/api/queries.ts` | `useWallets` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-249 | `FrontEnd/src/api/queries.ts` | `useWalletActivity` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-250 | `FrontEnd/src/api/queries.ts` | `useDeclarations` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-251 | `FrontEnd/src/api/queries.ts` | `useSurrenders` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-252 | `FrontEnd/src/api/queries.ts` | `useTransferPassbook` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-253 | `FrontEnd/src/api/queries.ts` | `useActivityCatalog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-254 | `FrontEnd/src/api/queries.ts` | `useMyActivities` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-255 | `FrontEnd/src/api/queries.ts` | `usePtsRate` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-256 | `FrontEnd/src/api/queries.ts` | `usePtsHistory` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-257 | `FrontEnd/src/api/queries.ts` | `useCategoryTree` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-258 | `FrontEnd/src/api/queries.ts` | `useMarketItems` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-259 | `FrontEnd/src/api/queries.ts` | `useMarketItem` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-260 | `FrontEnd/src/api/queries.ts` | `useOrders` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-261 | `FrontEnd/src/api/queries.ts` | `useOrder` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-262 | `FrontEnd/src/api/queries.ts` | `useSales` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-263 | `FrontEnd/src/api/queries.ts` | `useCarts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-264 | `FrontEnd/src/api/queries.ts` | `useProposals` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-265 | `FrontEnd/src/api/queries.ts` | `useNotifications` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-266 | `FrontEnd/src/api/queries.ts` | `useUnreadCount` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-267 | `FrontEnd/src/api/queries.ts` | `useNotificationPreferences` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-268 | `FrontEnd/src/api/queries.ts` | `useGames` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-269 | `FrontEnd/src/api/queries.ts` | `useGame` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-270 | `FrontEnd/src/api/queries.ts` | `useGameGroups` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-271 | `FrontEnd/src/api/queries.ts` | `usePioneerCandidates` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-272 | `FrontEnd/src/api/queries.ts` | `useElection` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-273 | `FrontEnd/src/api/queries.ts` | `useElectionEligibility` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-274 | `FrontEnd/src/api/queries.ts` | `useSeasons` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-275 | `FrontEnd/src/api/queries.ts` | `useSeason` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-276 | `FrontEnd/src/api/queries.ts` | `useSeasonEvents` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-277 | `FrontEnd/src/api/queries.ts` | `useSeasonLedger` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-278 | `FrontEnd/src/api/queries.ts` | `useMyCourses` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-279 | `FrontEnd/src/api/queries.ts` | `useCourse` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-280 | `FrontEnd/src/api/queries.ts` | `useMyEnrollments` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-281 | `FrontEnd/src/api/queries.ts` | `useSessionAttendance` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-282 | `FrontEnd/src/api/queries.ts` | `useTeacherRatings` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-283 | `FrontEnd/src/api/queries.ts` | `useDonors` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-284 | `FrontEnd/src/api/queries.ts` | `useOverdueCount` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-285 | `FrontEnd/src/api/queries.ts` | `useMyInvestments` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-286 | `FrontEnd/src/api/queries.ts` | `useInvestment` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-287 | `FrontEnd/src/api/queries.ts` | `useSponsorships` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-288 | `FrontEnd/src/api/queries.ts` | `useSponsorship` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-289 | `FrontEnd/src/api/queries.ts` | `useGroups` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-290 | `FrontEnd/src/api/queries.ts` | `useGroup` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-291 | `FrontEnd/src/api/queries.ts` | `useGroupPosts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-292 | `FrontEnd/src/api/queries.ts` | `useGroupMembers` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-293 | `FrontEnd/src/api/queries.ts` | `useGroupJoinRequests` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-294 | `FrontEnd/src/api/queries.ts` | `useGroupPendingInvites` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-295 | `FrontEnd/src/api/queries.ts` | `useMyGroupInvites` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-296 | `FrontEnd/src/api/queries.ts` | `usePublicBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-297 | `FrontEnd/src/api/queries.ts` | `useMyBlogs` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-298 | `FrontEnd/src/api/queries.ts` | `useMyBookmarks` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-299 | `FrontEnd/src/api/queries.ts` | `useBlog` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-300 | `FrontEnd/src/api/queries.ts` | `useMyLoans` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-301 | `FrontEnd/src/api/queries.ts` | `useMyExpenses` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-302 | `FrontEnd/src/api/queries.ts` | `usePlatformLedger` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-303 | `FrontEnd/src/api/queries.ts` | `useContracts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-304 | `FrontEnd/src/api/queries.ts` | `useMyContracts` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-305 | `FrontEnd/src/api/queries.ts` | `useContract` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-306 | `FrontEnd/src/api/queries.ts` | `useContractMessages` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-307 | `FrontEnd/src/api/queries.ts` | `useMemberReputation` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-308 | `FrontEnd/src/api/search.ts` | `searchAll` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-309 | `FrontEnd/src/api/system.ts` | `getConfig` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-310 | `FrontEnd/src/api/system.ts` | `uploadFile` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-311 | `FrontEnd/src/api/system.ts` | `deleteFile` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-312 | `FrontEnd/src/api/system.ts` | `uploadToCloudinary` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-313 | `FrontEnd/src/api/tokenSurrender.ts` | `createSurrender` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-314 | `FrontEnd/src/api/tokenSurrender.ts` | `listSurrenders` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-315 | `FrontEnd/src/api/tokenSurrender.ts` | `getSurrender` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-316 | `FrontEnd/src/api/wallets.ts` | `getWallets` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-317 | `FrontEnd/src/api/wallets.ts` | `getWallet` | Pending caller mapping | Pending request observation | Pending | — | — |
| FE-318 | `FrontEnd/src/api/wallets.ts` | `getWalletActivity` | Pending caller mapping | Pending request observation | Pending | — | — |

## 4. Canonical Xano endpoints

Every endpoint expands into the mandatory suffix cases in §15.3 of the plan. This inventory row closes only after all applicable child cases are terminal.

| API ID | Group | Method/path | Declared auth | Source | Inputs | Static table effects | Reusable functions | Static flags | Result | Evidence | Defect |
|---|---|---|---|---|---|---|---|---|---|---|---|
| API-001 | Activity Rewards | GET `/activities/me` | member | `XANO/api/activity_rewards/activities/me_GET.xs` | enum status?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:activities | None | None | Pending | — | — |
| API-002 | Activity Rewards | POST `/activities` | member | `XANO/api/activity_rewards/activities_POST.xs` | text activity_code filters=trim; text entity_ref filters=trim; json metadata? | query:activity_catalog; add:activities; query:points_minting_budget; query:points_minting_log; edit:activities; add:points_minting_log | mutate_wallet | None | Pending | — | — |
| API-003 | Activity Rewards | GET `/catalog` | public | `XANO/api/activity_rewards/catalog_GET.xs` | None | query:activity_catalog; query:activity_catalog_changelog | None | None | Pending | — | — |
| API-004 | Activity Rewards | GET `/changelog` | member | `XANO/api/activity_rewards/changelog_GET.xs` | int page?; int per_page? | query:activity_catalog_changelog | None | None | Pending | — | — |
| API-005 | Admin Reports | GET `/admin/reports/activity` | member | `XANO/api/admin_reports/admin/reports/activity_GET.xs` | timestamp from; timestamp to; text sector? filters=trim | query:activities | Quick Start/enforce_role | None | Pending | — | — |
| API-006 | Admin Reports | GET `/admin/reports/education` | member | `XANO/api/admin_reports/admin/reports/education_GET.xs` | timestamp from; timestamp to | query:courses; query:enrollments; query:sessions; query:session_ratings | Quick Start/enforce_role | None | Pending | — | — |
| API-007 | Admin Reports | GET `/admin/reports/financial-summary` | member | `XANO/api/admin_reports/admin/reports/financial_summary_GET.xs` | timestamp from; timestamp to | query:ledger; query:declarations | Quick Start/enforce_role | None | Pending | — | — |
| API-008 | Admin Reports | GET `/admin/reports/gaming` | member | `XANO/api/admin_reports/admin/reports/gaming_GET.xs` | int season_id? | get:seasons; query:events; query:event_submissions; query:event_results; query:season_funding; query:seasons | Quick Start/enforce_role | None | Pending | — | — |
| API-009 | Admin Reports | GET `/admin/reports/marketplace` | member | `XANO/api/admin_reports/admin/reports/marketplace_GET.xs` | timestamp from; timestamp to | query:orders; query:marketplace_order_disputes | Quick Start/enforce_role | None | Pending | — | — |
| API-010 | Admin Reports | GET `/admin/reports/wallet-balances` | member | `XANO/api/admin_reports/admin/reports/wallet_balances_GET.xs` | enum currency?; int top_n?=20 | query:wallets | Quick Start/enforce_role | None | Pending | — | — |
| API-011 | Admin | POST `/admin/2fa/login` | public | `XANO/api/admin/admin/2_fa/login_POST.xs` | email email filters=trim\|lower; text password; text? device_fingerprint?; text? ip?; text? user_agent? | query:user; query:admin_totp; add:admin_login_events; edit:admin_totp; add:admin_totp; add:admin_mfa_challenges | None | email | Pending | — | — |
| API-012 | Admin | POST `/admin/2fa/recover` | public | `XANO/api/admin/admin/2_fa/recover_POST.xs` | text challenge_token; text recovery_code | query:admin_mfa_challenges; query:admin_totp; add:admin_login_events; edit:admin_totp; edit:admin_mfa_challenges | None | tx; token | Pending | — | — |
| API-013 | Admin | POST `/admin/2fa/setup` | member | `XANO/api/admin/admin/2_fa/setup_POST.xs` | None | get:user; query:admin_totp; add:admin_totp; edit:admin_totp; add:admin_mfa_challenges | Quick Start/enforce_role; log_admin_action | email; audit | Pending | — | — |
| API-014 | Admin | POST `/admin/2fa/verify-setup` | member | `XANO/api/admin/admin/2_fa/verify_setup_POST.xs` | text challenge_token; text otp_code | query:admin_mfa_challenges; query:admin_totp; edit:admin_totp; edit:admin_mfa_challenges | Quick Start/enforce_role; log_admin_action | tx; audit | Pending | — | — |
| API-015 | Admin | POST `/admin/2fa/verify` | public | `XANO/api/admin/admin/2_fa/verify_POST.xs` | text challenge_token; text otp_code | query:admin_mfa_challenges; add:admin_login_events; query:admin_totp; edit:admin_mfa_challenges; edit:admin_totp; add:admin_totp | None | tx; token | Pending | — | — |
| API-016 | Admin | DELETE `/admin/activity-rewards/catalog/{id}` | member | `XANO/api/admin/admin/activity_rewards/catalog/id_DELETE.xs` | int id | get:activity_catalog; edit:activity_catalog; query:activity_catalog_changelog; add:activity_catalog_changelog | Quick Start/enforce_role | None | Pending | — | — |
| API-017 | Admin | PATCH `/admin/activity-rewards/catalog/{id}` | member | `XANO/api/admin/admin/activity_rewards/catalog/id_PATCH.xs` | int id; text label?; enum provision_type?; int default_reward? filters=min:0; bool auto_award?; bool active? | get:activity_catalog; edit:activity_catalog; query:activity_catalog_changelog; add:activity_catalog_changelog | Quick Start/enforce_role | None | Pending | — | — |
| API-018 | Admin | POST `/admin/activity-rewards/catalog` | member | `XANO/api/admin/admin/activity_rewards/catalog_POST.xs` | text activity_code filters=trim; text label filters=trim; enum provision_type; int default_reward filters=min:0; bool auto_award?; bool active?=true | add:activity_catalog; query:activity_catalog_changelog; add:activity_catalog_changelog | Quick Start/enforce_role | None | Pending | — | — |
| API-019 | Admin | GET `/admin/audit-log` | member | `XANO/api/admin/admin/audit_log_GET.xs` | timestamp? from?; timestamp? to?; text? action_type?; int? page?=1; int? per_page?=20 | query:admin_audit_log | Quick Start/enforce_role | audit | Pending | — | — |
| API-020 | Admin | POST `/admin/backup-admin/designate` | member | `XANO/api/admin/admin/backup_admin/designate_POST.xs` | int backup_member_id | get:user; get:system_config; edit:system_config | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-021 | Admin | GET `/admin/backup-admin/status` | public | `XANO/api/admin/admin/backup_admin/status_GET.xs` | int? requester_member_id?=0 | get:system_config; query:admin_totp | None | None | Pending | — | — |
| API-022 | Admin | POST `/admin/blog/{id}/approve` | member | `XANO/api/admin/admin/blog/id/approve_POST.xs` | int id; decimal points_awarded filters=min:0 | get:blogs; get:system_config; edit:blogs; add:points_minting_log; query:categories; add:categories; add:marketplace_items | Quick Start/enforce_role; mutate_wallet; emit_notification; log_admin_action | tx; notify; audit | Pending | — | — |
| API-023 | Admin | POST `/admin/blog/{id}/reject` | member | `XANO/api/admin/admin/blog/id/reject_POST.xs` | int id; text reason? | get:blogs; edit:blogs | Quick Start/enforce_role; emit_notification; log_admin_action | notify; audit | Pending | — | — |
| API-024 | Admin | POST `/admin/blog/{id}/takedown` | member | `XANO/api/admin/admin/blog/id/takedown_POST.xs` | int id; text reason? | get:blogs; edit:blogs; edit:marketplace_items | Quick Start/enforce_role; emit_notification; log_admin_action | tx; notify; audit | Pending | — | — |
| API-025 | Admin | GET `/admin/blog` | member | `XANO/api/admin/admin/blog_GET.xs` | text status?="in_review"; text sector?; int page?=1 filters=min:1; int per_page?=20 filters=min:1\|max:100 | query:blogs | Quick Start/enforce_role | None | Pending | — | — |
| API-026 | Admin | POST `/admin/contracts/{id}/resolve` | member | `XANO/api/admin/admin/contracts/id/resolve_POST.xs` | int id; enum decision; decimal? taker_pct?=0; text? notes | get:contracts; get:system_config; edit:contracts; query:wallets | Quick Start/enforce_role; mutate_wallet; emit_notification; pts_compute_rate; mutate_wallet_unchecked; log_admin_action | notify; audit | Pending | — | — |
| API-027 | Admin | POST `/admin/contracts/applications/{app_id}/resolve` | member | `XANO/api/admin/admin/contracts/applications/app_id/resolve_POST.xs` | int app_id; enum decision; decimal? taker_pct?=0; text? notes | get:contract_applications; get:contracts; get:system_config; query:wallets; edit:contract_applications; edit:contracts | Quick Start/enforce_role; mutate_wallet; pts_compute_rate; mutate_wallet_unchecked; emit_notification; log_admin_action | tx; notify; audit | Pending | — | — |
| API-028 | Admin | GET `/admin/contracts/disputes` | member | `XANO/api/admin/admin/contracts/disputes_GET.xs` | None | query:contract_applications; get:contracts; get:user | Quick Start/enforce_role | None | Pending | — | — |
| API-029 | Admin | POST `/admin/courses/{id}/payout` | member | `XANO/api/admin/admin/courses/id/payout_POST.xs` | int id | get:courses; get:system_config; query:orders; edit:courses | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-030 | Admin | POST `/admin/courses/{proposal_id}/list` | member | `XANO/api/admin/admin/courses/proposal_id/list_POST.xs` | int proposal_id; decimal revenue_split_teacher_pct?=90; decimal revenue_split_admin_pct?=10 | get:marketplace_proposals; query:courses; get:system_config; add:marketplace_items; edit:marketplace_proposals; edit:courses; query:sessions; edit:sessions | Quick Start/enforce_role; log_admin_action | tx; audit | Pending | — | — |
| API-031 | Admin | POST `/admin/courses/amendments/{id}/decision` | member | `XANO/api/admin/admin/courses/amendments/id/decision_POST.xs` | int id; enum decision; text notes? | get:course_amendments; edit:sessions; add:sessions; edit:course_amendments | Quick Start/enforce_role; log_admin_action | tx; audit | Pending | — | — |
| API-032 | Admin | GET `/admin/declarations` | member | `XANO/api/admin/admin/declarations_GET.xs` | None | query:declarations; get:user | Quick Start/enforce_role | None | Pending | — | — |
| API-033 | Admin | POST `/admin/donations/{declaration_id}/publish` | member | `XANO/api/admin/admin/donations/declaration_id/publish_POST.xs` | int declaration_id; enum display_name_choice; text display_name? filters=trim; bool keep_reason_private? | get:declarations; query:donors; add:donors | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-034 | Admin | PATCH `/admin/donors/{id}` | member | `XANO/api/admin/admin/donors/id_PATCH.xs` | int id; enum display_name_choice?; text display_name? filters=trim; bool keep_reason_private? | get:donors; edit:donors | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-035 | Admin | POST `/admin/elections/{id}/cast-tiebreak` | member | `XANO/api/admin/admin/elections/id/cast_tiebreak_POST.xs` | int id; int candidate_id | get:elections; get:pioneer_candidates; edit:elections; edit:pioneer_candidates | Quick Start/enforce_role; log_admin_action | tx; audit | Pending | — | — |
| API-036 | Admin | POST `/admin/elections/{id}/close` | member | `XANO/api/admin/admin/elections/id/close_POST.xs` | int id; int tie_break_candidate_id? | get:elections; query:pioneer_candidates; edit:elections; edit:pioneer_candidates | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-037 | Admin | POST `/admin/elections/{id}/voting-rights-price` | member | `XANO/api/admin/admin/elections/id/voting_rights_price_POST.xs` | int id; int price_tokens | get:elections; edit:marketplace_items | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-038 | Admin | PATCH `/admin/games/{id}` | member | `XANO/api/admin/admin/games/id_PATCH.xs` | int id; text name? filters=trim; text icon_url? filters=trim; text description? filters=trim; enum status? | get:games; edit:games | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-039 | Admin | POST `/admin/games` | member | `XANO/api/admin/admin/games_POST.xs` | text name filters=trim; text icon_url? filters=trim; text description? filters=trim; enum status? | add:games | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-040 | Admin | POST `/admin/groups/{id}/moderate` | member | `XANO/api/admin/admin/groups/id/moderate_POST.xs` | int id; enum action; int? post_id?=0; int? target_member_id?=0; text? reason | get:member_groups; get:group_posts; query:member_group_members; edit:member_group_members; edit:member_groups | Quick Start/enforce_role; log_admin_action | tx; audit | Pending | — | — |
| API-041 | Admin | POST `/admin/investments/{id}/payouts/{payout_id}/mark-paid` | member | `XANO/api/admin/admin/investments/id/payouts/payout_id/mark_paid_POST.xs` | int id; int payout_id; text upi_txn_id filters=trim; timestamp paid_at | get:investments; get:investment_payouts; edit:investment_payouts; query:investment_payouts; edit:investments | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-042 | Admin | GET `/admin/investments/due` | member | `XANO/api/admin/admin/investments/due_GET.xs` | timestamp from?; timestamp to?; int page?=1; int per_page?=20 | query:investment_payouts | Quick Start/enforce_role | None | Pending | — | — |
| API-043 | Admin | GET `/admin/investments` | member | `XANO/api/admin/admin/investments_GET.xs` | enum status?; int due_within_days?; int page?=1; int per_page?=20 | query:investments | Quick Start/enforce_role | None | Pending | — | — |
| API-044 | Admin | POST `/admin/loans/{id}/approve` | member | `XANO/api/admin/admin/loans/id/approve_POST.xs` | int id; decimal amount_disbursed; text transfer_ref filters=trim | get:loans; get:system_config; add:loan_debits; edit:loans | Quick Start/enforce_role; mutate_wallet_unchecked; mutate_wallet; log_admin_action; emit_notification | tx; notify; audit | Pending | — | — |
| API-045 | Admin | POST `/admin/loans/{id}/reject` | member | `XANO/api/admin/admin/loans/id/reject_POST.xs` | int id; text reason? filters=trim | get:loans; edit:loans | Quick Start/enforce_role; log_admin_action; emit_notification | notify; audit | Pending | — | — |
| API-046 | Admin | POST `/admin/loans/{id}/write-off` | member | `XANO/api/admin/admin/loans/id/write_off_POST.xs` | int id; text reason filters=trim | get:loans; edit:loans | Quick Start/enforce_role; log_admin_action; emit_notification | notify; audit | Pending | — | — |
| API-047 | Admin | DELETE `/admin/marketplace/categories/{id}` | member | `XANO/api/admin/admin/marketplace/categories/id_DELETE.xs` | int id | get:categories; query:marketplace_items; edit:categories | Quick Start/enforce_role | None | Pending | — | — |
| API-048 | Admin | PATCH `/admin/marketplace/categories/{id}` | member | `XANO/api/admin/admin/marketplace/categories/id_PATCH.xs` | int id; text name?; text description?; int parent_id?; text sector?; enum status? | get:categories; edit:categories | Quick Start/enforce_role | None | Pending | — | — |
| API-049 | Admin | GET `/admin/marketplace/categories` | member | `XANO/api/admin/admin/marketplace/categories_GET.xs` | text search?; int page?=1; int per_page?=50 | query:categories | Quick Start/enforce_role | None | Pending | — | — |
| API-050 | Admin | POST `/admin/marketplace/categories` | member | `XANO/api/admin/admin/marketplace/categories_POST.xs` | text name; text description? | add:categories | Quick Start/enforce_role | None | Pending | — | — |
| API-051 | Admin | PATCH `/admin/marketplace/items/{id}` | member | `XANO/api/admin/admin/marketplace/items/id_PATCH.xs` | int id; enum status | edit:marketplace_items | Quick Start/enforce_role | None | Pending | — | — |
| API-052 | Admin | GET `/admin/marketplace/items` | member | `XANO/api/admin/admin/marketplace/items_GET.xs` | text search?; int category_id?; text status?; int page?=1; int per_page?=50 | query:marketplace_items | Quick Start/enforce_role | None | Pending | — | — |
| API-053 | Admin | POST `/admin/marketplace/orders/{id}/resolve-dispute` | member | `XANO/api/admin/admin/marketplace/orders/id/resolve_dispute_POST.xs` | int id; enum resolution; decimal partial_amount_tokens? filters=min:0.00000001; text resolution_notes? filters=trim | get:orders; query:marketplace_order_disputes; get:marketplace_items; get:system_config; edit:orders; edit:marketplace_order_disputes; add:marketplace_settlements | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-054 | Admin | POST `/admin/marketplace/orders/{id}/settle` | member | `XANO/api/admin/admin/marketplace/orders/id/settle_POST.xs` | int id; text notes? filters=trim | get:orders; get:marketplace_items; get:system_config; add:marketplace_settlements; edit:orders | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-055 | Admin | POST `/admin/marketplace/orders/auto-settle` | member | `XANO/api/admin/admin/marketplace/orders/auto_settle_POST.xs` | None | get:system_config; query:orders; get:marketplace_items; add:marketplace_settlements; edit:orders | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-056 | Admin | POST `/admin/members/{id}/impersonate` | member | `XANO/api/admin/admin/members/id/impersonate_POST.xs` | int id; text reason filters=trim | get:user | Quick Start/enforce_role; log_admin_action | token; audit | Pending | — | — |
| API-057 | Admin | POST `/admin/members/{id}/process-erasure` | member | `XANO/api/admin/admin/members/id/process_erasure_POST.xs` | int id; text admin_notes? | get:user; query:data_erasure_requests; edit:user; edit:data_erasure_requests | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-058 | Admin | PATCH `/admin/members/{id}` | member | `XANO/api/admin/admin/members/id_PATCH.xs` | int id; text name?; email email?; text mobile?; text city?; text state?; text country?; bool suspended? | get:user | Quick Start/enforce_role | None | Pending | — | — |
| API-059 | Admin | GET `/admin/members` | member | `XANO/api/admin/admin/members_GET.xs` | text search? | query:user | Quick Start/enforce_role | None | Pending | — | — |
| API-060 | Admin | POST `/admin/proposals/{id}/decision` | member | `XANO/api/admin/admin/proposals/id/decision_POST.xs` | int id; enum decision; text notes?; int stock?; decimal revenue_share_proposer_pct?; decimal revenue_share_admin_pct? | get:marketplace_proposals; add:marketplace_items; edit:blogs; query:blog_likes; query:blog_comments; add:blog_readers; edit:marketplace_proposals | Quick Start/enforce_role; emit_notification | notify | Pending | — | — |
| API-061 | Admin | POST `/admin/pts/bootstrap` | member | `XANO/api/admin/admin/pts/bootstrap_POST.xs` | decimal initial_inr?; decimal initial_reserve? | get:pts_components | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-062 | Admin | GET `/admin/pts/components` | member | `XANO/api/admin/admin/pts/components_GET.xs` | None | get:pts_components | Quick Start/enforce_role | None | Pending | — | — |
| API-063 | Admin | PATCH `/admin/pts/reserve-assets` | member | `XANO/api/admin/admin/pts/reserve_assets_PATCH.xs` | decimal reserve_inr?; decimal hard_assets_inr?; json assets_breakdown?; text reason? | get:pts_components | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-064 | Admin | POST `/admin/pts/theta-adjust` | member | `XANO/api/admin/admin/pts/theta_adjust_POST.xs` | decimal theta filters=min:0; text reason? | get:pts_components | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-065 | Admin | POST `/admin/rates/announce-change` | member | `XANO/api/admin/admin/rates/announce_change_POST.xs` | decimal? inr_to_token_rate?=0; decimal? token_surrender_inr_rate?=0; int? effective_in_days?=0 | add:rate_announcements; query:user | Quick Start/enforce_role; emit_notification; log_admin_action | notify; audit | Pending | — | — |
| API-066 | Admin | POST `/admin/seasons/{id}/archive` | member | `XANO/api/admin/admin/seasons/id/archive_POST.xs` | int id | get:seasons; edit:seasons | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-067 | Admin | POST `/admin/seasons/{id}/close-and-settle` | member | `XANO/api/admin/admin/seasons/id/close_and_settle_POST.xs` | int id | get:seasons; query:season_committee; query:season_distribution_records; edit:seasons | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-068 | Admin | POST `/admin/seasons/{id}/start` | member | `XANO/api/admin/admin/seasons/id/start_POST.xs` | int id | get:seasons; edit:seasons | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-069 | Admin | POST `/admin/sponsorships/{id}/progress` | member | `XANO/api/admin/admin/sponsorships/id/progress_POST.xs` | int id; int conditions_met_pct; text notes? filters=trim | get:sponsorships; edit:sponsorships | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-070 | Admin | POST `/admin/sponsorships/{id}/recognize` | member | `XANO/api/admin/admin/sponsorships/id/recognize_POST.xs` | int id; bool badge?; bool page_publish?; text sector_display_text? filters=trim | get:sponsorships; query:sponsorship_recognitions; add:sponsorship_recognitions; edit:sponsorship_recognitions | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-071 | Admin | POST `/admin/sponsorships/{id}/refund` | member | `XANO/api/admin/admin/sponsorships/id/refund_POST.xs` | int id; decimal amount_inr; text reason filters=trim; text upi_txn_id filters=trim | get:sponsorships; add:sponsorship_refunds; edit:sponsorships | Quick Start/enforce_role; log_admin_action | tx; audit | Pending | — | — |
| API-072 | Admin | POST `/admin/student-submissions/{id}/review` | member | `XANO/api/admin/admin/student_submissions/id/review_POST.xs` | int id | No table operation found statically | Quick Start/enforce_role | None | Pending | — | — |
| API-073 | Admin | PATCH `/admin/system/config` | member | `XANO/api/admin/admin/system/config_PATCH.xs` | decimal inr_per_token?; int tokens_per_inr_surrender_numerator?; int tokens_per_inr_surrender_denominator?; decimal pts_tax_pct?; int marketplace_max_category_depth?; int points_transfer_window_minutes?; int marketplace_dispute_window_days?; int blog_like_author_pts?; int blog_dislike_author_pts?; int blog_vote_voter_pts?; decimal blog_ticket_author_pct?; decimal blog_ticket_admin_pct?; int extra_review_ticket_price_tokens?; int blog_in_review_default_limit?; int admin_member_id? | No table operation found statically | Quick Start/enforce_role | None | Pending | — | — |
| API-074 | Admin | GET `/admin/token-surrenders` | member | `XANO/api/admin/admin/token_surrenders_GET.xs` | None | query:token_surrenders; get:user | Quick Start/enforce_role | None | Pending | — | — |
| API-075 | Admin | POST `/admin/vacation-mode` | member | `XANO/api/admin/admin/vacation_mode_POST.xs` | timestamp end_date | get:system_config; edit:system_config | Quick Start/enforce_role; emit_notification; log_admin_action | notify; audit | Pending | — | — |
| API-076 | Admin | GET `/admin/wallets/{member_id}` | member | `XANO/api/admin/admin/wallets/member_id_GET.xs` | int member_id | get:user; query:wallets | Quick Start/enforce_role | None | Pending | — | — |
| API-077 | Admin | POST `/admin/wallets/adjust` | member | `XANO/api/admin/admin/wallets/adjust_POST.xs` | int member_id; enum wallet_type; decimal amount; text reason? | query:wallets; edit:wallets | Quick Start/enforce_role | tx | Pending | — | — |
| API-078 | Admin | POST `/admin/wallets/mint` | member | `XANO/api/admin/admin/wallets/mint_POST.xs` | int member_id; int amount; text reason filters=trim; enum provision_type | No table operation found statically | Quick Start/enforce_role; mutate_wallet; log_admin_action | audit | Pending | — | — |
| API-079 | Admin | PATCH `/declarations/{id}/reject` | member | `XANO/api/admin/declarations/id/reject_PATCH.xs` | int id; text reason? | get:declarations; edit:declarations; add:event_log | None | tx | Pending | — | — |
| API-080 | Admin | PATCH `/declarations/{id}/verify` | member | `XANO/api/admin/declarations/id/verify_PATCH.xs` | int id | get:declarations; edit:declarations; query:wallets; edit:wallets; add:wallets; add:event_log | None | tx | Pending | — | — |
| API-081 | Admin | POST `/points/award` | member | `XANO/api/admin/points/award_POST.xs` | int member_id; decimal amount filters=min:0.01; enum provision_type; text reason filters=trim; text activity_ref? | get:system_config; query:points_minting_budget; query:points_minting_log; add:points_minting_log | Quick Start/enforce_role; mutate_wallet | None | Pending | — | — |
| API-082 | Admin | GET `/points/budget` | member | `XANO/api/admin/points/budget_GET.xs` | text month? | query:points_minting_budget; query:points_minting_log | Quick Start/enforce_role | None | Pending | — | — |
| API-083 | Admin | POST `/points/budget` | member | `XANO/api/admin/points/budget_POST.xs` | text month filters=trim; decimal budget_points filters=min:0 | query:points_minting_budget; query:points_minting_log; edit:points_minting_budget; add:points_minting_budget | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-084 | Admin | POST `/points/transfer/{id}/resolve-dispute` | member | `XANO/api/admin/points/transfer/id/resolve_dispute_POST.xs` | int id; enum resolution; text notes? filters=trim | get:points_transfers; get:transfer_disputes; edit:points_transfers; edit:transfer_disputes | Quick Start/enforce_role; mutate_wallet; log_admin_action | tx; audit | Pending | — | — |
| API-085 | Admin | GET `/pts/audit-log` | member | `XANO/api/admin/pts/audit_log_GET.xs` | int page?; int per_page? | query:admin_audit_log | Quick Start/enforce_role | audit | Pending | — | — |
| API-086 | Admin | PATCH `/token-surrenders/{id}/complete` | member | `XANO/api/admin/token_surrenders/id/complete_PATCH.xs` | int id; text admin_notes? | get:token_surrenders; query:wallets; edit:wallets; edit:token_surrenders; add:event_log | None | tx | Pending | — | — |
| API-087 | Authentication | POST `/change-password` | member | `XANO/api/authentication/change_password_POST.xs` | password current_password; password new_password filters=min:8\|minAlpha:1\|minDigit:1 | get:user; edit:user | None | None | Pending | — | — |
| API-088 | Authentication | POST `/guardian-approvals/{id}/respond` | member | `XANO/api/authentication/guardian_approvals/id/respond_POST.xs` | int id; enum decision; text rejection_reason? | get:guardian_approvals; add:user; add:wallets; add:email_verification_tokens; edit:guardian_approvals | emit_notification | email; notify | Pending | — | — |
| API-089 | Authentication | GET `/guardian-approvals/me` | member | `XANO/api/authentication/guardian_approvals/me_GET.xs` | None | query:guardian_approvals; edit:guardian_approvals | None | None | Pending | — | — |
| API-090 | Authentication | POST `/guardian-registration` | public | `XANO/api/authentication/guardian_registration_POST.xs` | text name filters=trim; date dob; email email filters=trim\|lower; text mobile?; int guardian_member_id; text device_fingerprint?; text client_ip?; bool consent_given | has:user; query:guardian_approvals; get:user; add:guardian_approvals | check_rate_limit; emit_notification | email; notify | Pending | — | — |
| API-091 | Authentication | POST `/login` | public | `XANO/api/authentication/login_POST.xs` | email email filters=trim\|lower; text password | get:user | None | token | Pending | — | — |
| API-092 | Authentication | GET `/me` | member | `XANO/api/authentication/me_GET.xs` | None | get:user | None | None | Pending | — | — |
| API-093 | Authentication | POST `/message/send_welcome_email` | public | `XANO/api/authentication/message/send_welcome_email_POST.xs` | int user_id | get:user | Quick Start/log_event | email | Pending | — | — |
| API-094 | Authentication | POST `/resend-verification` | public | `XANO/api/authentication/resend_verification_POST.xs` | email email filters=trim\|lower | get:user; query:email_verification_tokens; edit:email_verification_tokens; add:email_verification_tokens | check_rate_limit | email | Pending | — | — |
| API-095 | Authentication | POST `/reset/magic-link-login` | public | `XANO/api/authentication/reset/magic_link_login_POST.xs` | text magic_token? filters=trim; text email? filters=trim | get:user; edit:user | Quick Start/log_event | token | Pending | — | — |
| API-096 | Authentication | GET `/reset/request-reset-link` | public | `XANO/api/authentication/reset/request_reset_link_GET.xs` | email email? | No table operation found statically | Quick Start/generate_magic_link | email | Pending | — | — |
| API-097 | Authentication | POST `/reset/update_password` | member | `XANO/api/authentication/reset/update_password_POST.xs` | text password? filters=trim\|min:8; text confirm_password? filters=trim | get:user; edit:user | Quick Start/log_event | None | Pending | — | — |
| API-098 | Authentication | POST `/signup` | public | `XANO/api/authentication/signup_POST.xs` | text name filters=trim; email email filters=trim\|lower; password password filters=min:8\|minAlpha:1\|minDigit:1; bool consent_given; date dob?; text device_fingerprint?; text client_ip? | has:user; add:user; edit:user; add:wallets | check_rate_limit | token | Pending | — | — |
| API-099 | Authentication | POST `/verify-email` | public | `XANO/api/authentication/verify_email_POST.xs` | text token | query:email_verification_tokens; edit:user; edit:email_verification_tokens | None | None | Pending | — | — |
| API-100 | Authentication | POST `/verify-mobile` | member | `XANO/api/authentication/verify_mobile_POST.xs` | text otp filters=digitOk\|min:6\|max:6 | query:mobile_otps; edit:user; edit:mobile_otps | None | None | Pending | — | — |
| API-101 | Blog | DELETE `/blog_dislikes/{blog_dislikes_id}` | public | `XANO/api/blog/blog_dislikes/blog_dislikes_id_DELETE.xs` | int blog_dislikes_id? filters=min:1 | No table operation found statically | None | None | Pending | — | — |
| API-102 | Blog | GET `/blog_dislikes/{blog_dislikes_id}` | public | `XANO/api/blog/blog_dislikes/blog_dislikes_id_GET.xs` | int blog_dislikes_id? filters=min:1 | get:blog_dislikes | None | None | Pending | — | — |
| API-103 | Blog | PATCH `/blog_dislikes/{blog_dislikes_id}` | public | `XANO/api/blog/blog_dislikes/blog_dislikes_id_PATCH.xs` | int blog_dislikes_id? filters=min:1 | No table operation found statically | None | None | Pending | — | — |
| API-104 | Blog | GET `/blog_dislikes` | public | `XANO/api/blog/blog_dislikes_GET.xs` | None | query:blog_dislikes | None | None | Pending | — | — |
| API-105 | Blog | POST `/blog_dislikes` | public | `XANO/api/blog/blog_dislikes_POST.xs` | None | add:blog_dislikes | None | None | Pending | — | — |
| API-106 | Blog | POST `/blog/{id}/abandon` | member | `XANO/api/blog/blog/id/abandon_POST.xs` | int id; bool allow_monetisation | get:blogs; edit:blogs | None | None | Pending | — | — |
| API-107 | Blog | POST `/blog/{id}/archive` | member | `XANO/api/blog/blog/id/archive_POST.xs` | int id | get:blogs; edit:blogs | None | None | Pending | — | — |
| API-108 | Blog | POST `/blog/{id}/bookmark` | member | `XANO/api/blog/blog/id/bookmark_POST.xs` | int id | get:blogs; query:blog_bookmarks; add:blog_bookmarks | None | None | Pending | — | — |
| API-109 | Blog | POST `/blog/{id}/comments` | member | `XANO/api/blog/blog/id/comments_POST.xs` | int id; text content filters=trim | get:blogs; query:blog_readers; query:orders; add:blog_comments | emit_notification | notify | Pending | — | — |
| API-110 | Blog | POST `/blog/{id}/dislike` | member | `XANO/api/blog/blog/id/dislike_POST.xs` | int id | get:blogs; query:blog_readers; query:orders; query:blog_dislikes; query:blog_likes; add:blog_dislikes; get:system_config | mutate_wallet | None | Pending | — | — |
| API-111 | Blog | POST `/blog/{id}/like` | member | `XANO/api/blog/blog/id/like_POST.xs` | int id | get:blogs; query:blog_readers; query:orders; query:blog_likes; query:blog_dislikes; add:blog_likes; get:system_config | mutate_wallet | None | Pending | — | — |
| API-112 | Blog | POST `/blog/{id}/publish` | member | `XANO/api/blog/blog/id/publish_POST.xs` | int id | get:blogs; edit:blogs; get:system_config; query:categories; add:categories; add:marketplace_items | None | tx | Pending | — | — |
| API-113 | Blog | POST `/blog/{id}/submit` | member | `XANO/api/blog/blog/id/submit_POST.xs` | int id | get:blogs; get:system_config; query:blogs; edit:blogs | None | None | Pending | — | — |
| API-114 | Blog | DELETE `/blog/{id}` | member | `XANO/api/blog/blog/id_DELETE.xs` | int id | get:blogs | None | None | Pending | — | — |
| API-115 | Blog | GET `/blog/{id}` | member | `XANO/api/blog/blog/id_GET.xs` | int id | get:blogs; get:user; query:orders; query:blog_readers; query:blog_likes; query:blog_dislikes; query:blog_comments | None | None | Pending | — | — |
| API-116 | Blog | PATCH `/blog/{id}` | member | `XANO/api/blog/blog/id_PATCH.xs` | int id; text title? filters=trim; text content?; text sector? filters=trim; json tags?; bool comments_enabled?; bool revenue_generator?; decimal ticket_price_tokens? filters=min:0 | get:blogs; edit:blogs | None | None | Pending | — | — |
| API-117 | Blog | GET `/blog/bookmarks/me` | member | `XANO/api/blog/blog/bookmarks/me_GET.xs` | None | query:blog_bookmarks; get:blogs; get:user; query:blog_likes; query:blog_comments | None | None | Pending | — | — |
| API-118 | Blog | GET `/blog/me` | member | `XANO/api/blog/blog/me_GET.xs` | text status?; int page?=1 filters=min:1; int per_page?=20 filters=min:1\|max:100 | query:blogs | None | None | Pending | — | — |
| API-119 | Blog | GET `/blog/public` | public | `XANO/api/blog/blog/public_GET.xs` | text sector?; text tag? | query:blogs; get:user; query:blog_likes; query:blog_comments | None | None | Pending | — | — |
| API-120 | Blog | POST `/blog` | member | `XANO/api/blog/blog_POST.xs` | text title filters=trim; text content; text sector? filters=trim; json tags?; bool comments_enabled?; bool revenue_generator?; decimal ticket_price_tokens? filters=min:0 | add:blogs | None | None | Pending | — | — |
| API-121 | Cart | POST `/cart/checkout` | member | `XANO/api/cart/cart/checkout_POST.xs` | int cart_id; json buyer_info? | get:carts; query:cart_items; get:marketplace_items; edit:cart_items; query:wallets; add:orders; edit:marketplace_items; edit:carts | mutate_wallet | tx | Pending | — | — |
| API-122 | Cart | DELETE `/cart/items/{id}` | member | `XANO/api/cart/cart/items/id_DELETE.xs` | int id | get:cart_items; get:carts | None | None | Pending | — | — |
| API-123 | Cart | POST `/cart/items` | member | `XANO/api/cart/cart/items_POST.xs` | int item_id; int quantity filters=min:1 | get:marketplace_items; query:orders; query:carts; add:carts; query:cart_items; edit:cart_items; add:cart_items | None | None | Pending | — | — |
| API-124 | Cart | GET `/cart` | member | `XANO/api/cart/cart_GET.xs` | None | query:carts; query:cart_items; get:marketplace_items | None | None | Pending | — | — |
| API-125 | Contracts | POST `/contracts/{id}/apply` | member | `XANO/api/contracts/contracts/id/apply_POST.xs` | int id; text application_text; int? proposed_price_points?; date? proposed_completion_date? | get:contracts; query:contract_applications; add:contract_applications | emit_notification | notify | Pending | — | — |
| API-126 | Contracts | POST `/contracts/{id}/assign` | member | `XANO/api/contracts/contracts/id/assign_POST.xs` | int id; int taker_member_id | get:contracts; query:contract_applications; query:contracts; edit:contracts; edit:contract_applications | emit_notification | tx; notify | Pending | — | — |
| API-127 | Contracts | POST `/contracts/{id}/cancel` | member | `XANO/api/contracts/contracts/id/cancel_POST.xs` | int id; text? reason | get:contracts; query:contract_applications; edit:contracts | emit_notification | notify | Pending | — | — |
| API-128 | Contracts | POST `/contracts/{id}/close-applications` | member | `XANO/api/contracts/contracts/id/close_applications_POST.xs` | int id | get:contracts; edit:contracts | None | None | Pending | — | — |
| API-129 | Contracts | POST `/contracts/{id}/dispute` | member | `XANO/api/contracts/contracts/id/dispute_POST.xs` | int id; text reason | get:contracts; add:contract_disputes; edit:contracts | emit_notification | tx; notify | Pending | — | — |
| API-130 | Contracts | POST `/contracts/{id}/escalate` | member | `XANO/api/contracts/contracts/id/escalate_POST.xs` | int id | get:contracts; edit:contracts | emit_notification | notify | Pending | — | — |
| API-131 | Contracts | POST `/contracts/{id}/force-close-request` | member | `XANO/api/contracts/contracts/id/force_close_request_POST.xs` | int id | get:contracts; edit:contracts | None | None | Pending | — | — |
| API-132 | Contracts | POST `/contracts/{id}/mark-complete` | member | `XANO/api/contracts/contracts/id/mark_complete_POST.xs` | int id | get:contracts; edit:contracts | emit_notification | notify | Pending | — | — |
| API-133 | Contracts | POST `/contracts/{id}/rate` | member | `XANO/api/contracts/contracts/id/rate_POST.xs` | int id; int stars; text review | get:contracts; query:contract_ratings; add:contract_ratings | None | None | Pending | — | — |
| API-134 | Contracts | POST `/contracts/{id}/release` | member | `XANO/api/contracts/contracts/id/release_POST.xs` | int id | get:contracts; get:system_config; edit:contracts | mutate_wallet; emit_notification | tx; notify | Pending | — | — |
| API-135 | Contracts | GET `/contracts/{id}` | member | `XANO/api/contracts/contracts/id_GET.xs` | int id | get:contracts; get:user; query:contract_applications; query:contract_ratings; query:contract_application_messages | None | None | Pending | — | — |
| API-136 | Contracts | PATCH `/contracts/{id}` | member | `XANO/api/contracts/contracts/id_PATCH.xs` | int id; text? title; text? requirements; date? application_deadline; date? requested_completion_date; text? conditions; text? notes | get:contracts; edit:contracts | None | None | Pending | — | — |
| API-137 | Contracts | POST `/contracts/applications/{app_id}/appoint` | member | `XANO/api/contracts/contracts/applications/app_id/appoint_POST.xs` | int app_id | get:contract_applications; get:contracts; query:contract_applications; query:wallets; get:system_config; edit:contract_applications | mutate_wallet; emit_notification | tx; notify | Pending | — | — |
| API-138 | Contracts | POST `/contracts/applications/{app_id}/confirm-assignment` | member | `XANO/api/contracts/contracts/applications/app_id/confirm_assignment_POST.xs` | int app_id | get:contract_applications; get:contracts; query:contracts; edit:contracts; edit:contract_applications; query:contract_applications | emit_notification | tx; notify | Pending | — | — |
| API-139 | Contracts | GET `/contracts/applications/{app_id}/dispute-messages` | member | `XANO/api/contracts/contracts/applications/app_id/dispute_messages_GET.xs` | int app_id | get:contract_applications; get:contracts; get:system_config; query:dispute_messages; get:user | None | None | Pending | — | — |
| API-140 | Contracts | POST `/contracts/applications/{app_id}/dispute-messages` | member | `XANO/api/contracts/contracts/applications/app_id/dispute_messages_POST.xs` | int app_id; text? message_text?; text? attachment_url?; text? thread? | get:contract_applications; get:contracts; get:system_config; add:dispute_messages | emit_notification | notify | Pending | — | — |
| API-141 | Contracts | GET `/contracts/applications/{app_id}/messages` | member | `XANO/api/contracts/contracts/applications/app_id/messages_GET.xs` | int app_id | get:contract_applications; get:contracts; query:contract_application_messages; get:user | None | None | Pending | — | — |
| API-142 | Contracts | POST `/contracts/applications/{app_id}/messages` | member | `XANO/api/contracts/contracts/applications/app_id/messages_POST.xs` | int app_id; text message_text | get:contract_applications; get:contracts; add:contract_application_messages | emit_notification | notify | Pending | — | — |
| API-143 | Contracts | POST `/contracts/applications/{app_id}/raise-dispute` | member | `XANO/api/contracts/contracts/applications/app_id/raise_dispute_POST.xs` | int app_id; text reason? | get:contract_applications; get:contracts; edit:contract_applications; edit:contracts; get:system_config | emit_notification | notify | Pending | — | — |
| API-144 | Contracts | POST `/contracts/applications/{app_id}/rate` | member | `XANO/api/contracts/contracts/applications/app_id/rate_POST.xs` | int app_id; int stars; text? testimony | get:contract_applications; get:contracts; query:contract_ratings; add:contract_ratings; get:user; get:system_config | emit_notification; mutate_wallet | notify | Pending | — | — |
| API-145 | Contracts | POST `/contracts/applications/{app_id}/request-correction` | member | `XANO/api/contracts/contracts/applications/app_id/request_correction_POST.xs` | int app_id | get:contract_applications; get:contracts; edit:contract_applications | emit_notification | notify | Pending | — | — |
| API-146 | Contracts | POST `/contracts/applications/{app_id}/request-detail` | member | `XANO/api/contracts/contracts/applications/app_id/request_detail_POST.xs` | int app_id | get:contract_applications; get:contracts; edit:contract_applications | emit_notification | notify | Pending | — | — |
| API-147 | Contracts | POST `/contracts/applications/{app_id}/submit-completion` | member | `XANO/api/contracts/contracts/applications/app_id/submit_completion_POST.xs` | int app_id | get:contract_applications; get:contracts; edit:contract_applications; get:user | emit_notification | notify | Pending | — | — |
| API-148 | Contracts | PATCH `/contracts/applications/{app_id}/update` | member | `XANO/api/contracts/contracts/applications/app_id/update_PATCH.xs` | int app_id; text? application_text?; int? proposed_price_points?; date? proposed_completion_date?; text? detailed_proposal? | get:contract_applications; get:contracts; query:contract_application_messages; edit:contract_applications | None | None | Pending | — | — |
| API-149 | Contracts | POST `/contracts/applications/{app_id}/verify-completion` | member | `XANO/api/contracts/contracts/applications/app_id/verify_completion_POST.xs` | int app_id | get:contract_applications; get:contracts; get:system_config; edit:contract_applications; query:wallets | mutate_wallet; emit_notification | tx; notify | Pending | — | — |
| API-150 | Contracts | GET `/contracts/me` | member | `XANO/api/contracts/contracts/me_GET.xs` | None | query:contracts; query:contract_applications; get:contracts; get:user | None | None | Pending | — | — |
| API-151 | Contracts | GET `/contracts` | public | `XANO/api/contracts/contracts_GET.xs` | text? contract_type; text? status; text? sector; int? page?=0; int? per_page?=0 | query:contracts; get:user; query:contract_ratings | None | None | Pending | — | — |
| API-152 | Contracts | POST `/contracts` | member | `XANO/api/contracts/contracts_POST.xs` | text title; text requirements; date application_deadline; date requested_completion_date; decimal budget_points; enum contract_type; text sector; text? conditions?; text? notes? | query:contracts; add:contracts | None | None | Pending | — | — |
| API-153 | Contracts | GET `/members/{member_id}/reputation` | public | `XANO/api/contracts/members/member_id/reputation_GET.xs` | int member_id | get:user; query:contract_ratings; get:contract_applications; get:contracts | None | None | Pending | — | — |
| API-154 | Education | POST `/courses/{id}/amendments` | member | `XANO/api/education/courses/id/amendments_POST.xs` | int id; json changes | get:courses; get:sessions; add:course_amendments | None | None | Pending | — | — |
| API-155 | Education | POST `/courses/{id}/payout-request` | member | `XANO/api/education/courses/id/payout_request_POST.xs` | int id | get:courses; query:sessions; query:orders; edit:courses | None | None | Pending | — | — |
| API-156 | Education | GET `/courses/{id}` | public | `XANO/api/education/courses/id_GET.xs` | int id | get:courses; query:sessions; query:course_amendments; edit:sessions; edit:course_amendments; edit:courses; query:session_ratings | None | None | Pending | — | — |
| API-157 | Education | GET `/courses/me` | member | `XANO/api/education/courses/me_GET.xs` | text status?; int page?=1; int per_page?=20 | query:courses; query:sessions; query:enrollments | None | None | Pending | — | — |
| API-158 | Education | POST `/courses` | member | `XANO/api/education/courses_POST.xs` | text course_name; text description; json images?; decimal price_per_student filters=min:0.01; int total_seats filters=min:1; json buyer_info_schema?; json sessions | add:marketplace_proposals; add:courses; add:sessions; query:sessions | None | tx | Pending | — | — |
| API-159 | Education | GET `/enrollments/me` | member | `XANO/api/education/enrollments/me_GET.xs` | text status?; int page?=1; int per_page?=20 | query:enrollments; get:sessions; get:courses | None | None | Pending | — | — |
| API-160 | Education | GET `/sessions/{id}/attendance` | member | `XANO/api/education/sessions/id/attendance_GET.xs` | int id | get:sessions; get:courses; query:enrollments; edit:enrollments; edit:sessions | None | tx | Pending | — | — |
| API-161 | Education | POST `/sessions/{id}/cancel` | member | `XANO/api/education/sessions/id/cancel_POST.xs` | int id; text reason? | get:sessions; get:courses; query:sessions; query:enrollments; edit:sessions; edit:enrollments | mutate_wallet | tx | Pending | — | — |
| API-162 | Education | POST `/sessions/{id}/checkin` | member | `XANO/api/education/sessions/id/checkin_POST.xs` | int id; text qr_token? | get:sessions; query:enrollments; edit:enrollments; edit:sessions; get:courses | None | tx | Pending | — | — |
| API-163 | Education | POST `/sessions/{id}/end` | member | `XANO/api/education/sessions/id/end_POST.xs` | int id | get:sessions; get:courses; query:enrollments; edit:enrollments; edit:sessions | None | tx | Pending | — | — |
| API-164 | Education | POST `/sessions/{id}/rate-student/{enrollment_id}` | member | `XANO/api/education/sessions/id/rate_student/enrollment_id_POST.xs` | int id; int enrollment_id; int stars filters=min:1\|max:5 | get:sessions; get:courses; get:enrollments; query:session_ratings; add:session_ratings; edit:session_ratings | mutate_wallet | tx | Pending | — | — |
| API-165 | Education | POST `/sessions/{id}/rate-teacher` | member | `XANO/api/education/sessions/id/rate_teacher_POST.xs` | int id; int stars filters=min:1\|max:5; text testimony? | get:sessions; query:enrollments; query:session_ratings; get:courses; add:session_ratings; edit:session_ratings | mutate_wallet | tx | Pending | — | — |
| API-166 | Education | POST `/sessions/{id}/start` | member | `XANO/api/education/sessions/id/start_POST.xs` | int id | get:sessions; get:courses; edit:sessions | None | None | Pending | — | — |
| API-167 | Education | POST `/sessions/{id}/verify/{enrollment_id}` | member | `XANO/api/education/sessions/id/verify/enrollment_id_POST.xs` | int id; int enrollment_id | get:sessions; get:courses; get:enrollments; edit:enrollments | None | None | Pending | — | — |
| API-168 | Education | GET `/teachers/{member_id}/ratings` | public | `XANO/api/education/teachers/member_id/ratings_GET.xs` | int member_id; int page?=1; int per_page?=20 | query:session_ratings | None | None | Pending | — | — |
| API-169 | Event Logs | GET `/logs/user/my_events` | member | `XANO/api/event_logs/logs/user/my_events_GET.xs` | None | query:event_log | None | None | Pending | — | — |
| API-170 | Expenses | POST `/expenses/{id}/settle` | member | `XANO/api/expenses/expenses/id/settle_POST.xs` | int id; bool confirmed | get:expenses; edit:expenses | None | None | Pending | — | — |
| API-171 | Expenses | GET `/expenses/me` | member | `XANO/api/expenses/expenses/me_GET.xs` | text? main_category?; text? settlement_status?; timestamp? from?; timestamp? to?; text? q?; int? page?=0 filters=min:1; int? per_page?=0 filters=min:1\|max:100 | query:expenses | None | None | Pending | — | — |
| API-172 | Expenses | POST `/expenses` | member | `XANO/api/expenses/expenses_POST.xs` | date date; decimal amount_inr; enum payment_mode; json? platform_ref; text main_category filters=trim; text specific_category filters=trim; text? reason; enum? entry_type; enum? remark_visibility | get:system_config; add:expenses | Quick Start/enforce_role; mutate_wallet | tx | Pending | — | — |
| API-173 | Expenses | GET `/platform-financial-ledger` | member | `XANO/api/expenses/platform_financial_ledger_GET.xs` | int? page?=1 filters=min:1; int? per_page?=20 filters=min:1\|max:100 | query:expenses | None | None | Pending | — | — |
| API-174 | Financial Donors | GET `/donors/{id}` | public | `XANO/api/financial_donors/donors/id_GET.xs` | int id | get:donors | None | None | Pending | — | — |
| API-175 | Financial Donors | GET `/donors` | public | `XANO/api/financial_donors/donors_GET.xs` | int page?=1; int per_page?=20 | query:donors | None | None | Pending | — | — |
| API-176 | Financial Investments | POST `/investments/{id}/overdue-request` | member | `XANO/api/financial_investments/investments/id/overdue_request_POST.xs` | int id; text message? filters=trim | get:investments; query:investment_payouts; query:investment_overdue_requests; add:investment_overdue_requests | None | None | Pending | — | — |
| API-177 | Financial Investments | GET `/investments/{id}` | member | `XANO/api/financial_investments/investments/id_GET.xs` | int id | get:investments; query:investment_payouts | None | None | Pending | — | — |
| API-178 | Financial Investments | GET `/investments/me` | member | `XANO/api/financial_investments/investments/me_GET.xs` | int page?=1; int per_page?=20 | query:investments | None | None | Pending | — | — |
| API-179 | Financial Investments | GET `/investments/overdue-count` | public | `XANO/api/financial_investments/investments/overdue_count_GET.xs` | None | query:investment_payouts | None | None | Pending | — | — |
| API-180 | Financial Investments | POST `/investments` | member | `XANO/api/financial_investments/investments_POST.xs` | enum option; decimal principal_inr; timestamp start_date; text investor_display_name?; email investor_email?; text investor_mobile? | add:investments; add:investment_payouts; query:investment_payouts | create_declaration | tx | Pending | — | — |
| API-181 | Financial Sponsors | POST `/sponsorships/{id}/dispute` | public | `XANO/api/financial_sponsors/sponsorships/id/dispute_POST.xs` | int id; text reason filters=trim; json evidence_file_ids?; email sponsor_email? | get:sponsorships; query:sponsorship_disputes; add:sponsorship_disputes | None | None | Pending | — | — |
| API-182 | Financial Sponsors | GET `/sponsorships/{id}` | public | `XANO/api/financial_sponsors/sponsorships/id_GET.xs` | int id | get:sponsorships; query:sponsorship_recognitions | None | None | Pending | — | — |
| API-183 | Financial Sponsors | GET `/sponsorships` | public | `XANO/api/financial_sponsors/sponsorships_GET.xs` | enum status?; int page?=1; int per_page?=20 | query:sponsorships | None | None | Pending | — | — |
| API-184 | Financial Sponsors | POST `/sponsorships` | member | `XANO/api/financial_sponsors/sponsorships_POST.xs` | text conditions filters=trim; text sector? filters=trim; text upi_id filters=trim; decimal amount_inr; json attachment_ids?; text sponsor_display_name?; email sponsor_email?; text idempotency_key? filters=trim | add:sponsorships | create_declaration | tx; idem | Pending | — | — |
| API-185 | Gaming Community | GET `/games/{id}/groups` | public | `XANO/api/gaming_community/games/id/groups_GET.xs` | int id; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | get:games; query:game_groups | None | None | Pending | — | — |
| API-186 | Gaming Community | POST `/games/{id}/groups` | member | `XANO/api/gaming_community/games/id/groups_POST.xs` | int id; text name filters=trim; text description? filters=trim | get:games; add:game_groups; add:game_group_members | None | tx | Pending | — | — |
| API-187 | Gaming Community | GET `/games/{id}` | public | `XANO/api/gaming_community/games/id_GET.xs` | int id | get:games | None | None | Pending | — | — |
| API-188 | Gaming Community | GET `/games` | public | `XANO/api/gaming_community/games_GET.xs` | text q? filters=trim; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:games | None | None | Pending | — | — |
| API-189 | Gaming Community | POST `/groups/{id}/join` | member | `XANO/api/gaming_community/groups/id/join_POST.xs` | int id | get:game_groups; query:game_group_members; add:game_group_members; edit:game_groups | None | tx | Pending | — | — |
| API-190 | Gaming Community | POST `/groups/{id}/leave` | member | `XANO/api/gaming_community/groups/id/leave_POST.xs` | int id | get:game_groups; query:game_group_members; edit:game_groups | None | tx | Pending | — | — |
| API-191 | Gaming Elections | POST `/elections/{id}/vote` | member | `XANO/api/gaming_elections/elections/id/vote_POST.xs` | int id; int candidate_id; int voting_right_ref? | get:elections; get:pioneer_candidates; query:orders; query:votes; add:votes; edit:pioneer_candidates | None | tx | Pending | — | — |
| API-192 | Gaming Elections | GET `/elections/{id}` | public | `XANO/api/gaming_elections/elections/id_GET.xs` | int id | get:elections; query:pioneer_candidates; edit:elections; edit:pioneer_candidates | mutate_wallet | tx | Pending | — | — |
| API-193 | Gaming Elections | GET `/elections/me/eligibility` | member | `XANO/api/gaming_elections/elections/me/eligibility_GET.xs` | int election_id | get:elections; query:orders; query:votes | None | None | Pending | — | — |
| API-194 | Gaming Elections | POST `/elections` | member | `XANO/api/gaming_elections/elections_POST.xs` | int game_id; timestamp voting_start; timestamp voting_end; int voting_rights_marketplace_item_id? | get:games; add:elections; query:pioneer_candidates; edit:pioneer_candidates | Quick Start/enforce_role | None | Pending | — | — |
| API-195 | Gaming Elections | PATCH `/pioneer-candidates/{id}` | member | `XANO/api/gaming_elections/pioneer_candidates/id_PATCH.xs` | int id; text season_name? filters=trim; timestamp start_date?; timestamp end_date?; int season_icon_file_id?; int num_events? filters=min:1; text funding_model? filters=trim; decimal total_points_budget? filters=min:0.01; json events? | get:pioneer_candidates; query:elections | None | None | Pending | — | — |
| API-196 | Gaming Elections | GET `/pioneer-candidates` | public | `XANO/api/gaming_elections/pioneer_candidates_GET.xs` | int game_id?; int election_id?; enum status?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:pioneer_candidates; get:elections | None | None | Pending | — | — |
| API-197 | Gaming Elections | POST `/pioneer-candidates` | member | `XANO/api/gaming_elections/pioneer_candidates_POST.xs` | int game_id; text season_name filters=trim; timestamp start_date; timestamp end_date; int season_icon_file_id?; int num_events filters=min:1; text funding_model? filters=trim; decimal total_points_budget filters=min:0.01; json events? | get:games; query:pioneer_candidates; add:pioneer_candidates | mutate_wallet | tx | Pending | — | — |
| API-198 | Gaming Seasons | POST `/events/{id}/results` | member | `XANO/api/gaming_seasons/events/id/results_POST.xs` | int id; json entries | get:events; get:seasons; add:event_results; edit:event_submissions; edit:events | mutate_wallet | None | Pending | — | — |
| API-199 | Gaming Seasons | GET `/events/{id}/submissions` | member | `XANO/api/gaming_seasons/events/id/submissions_GET.xs` | int id; int participant_id?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | get:events; get:seasons; query:event_submissions | None | None | Pending | — | — |
| API-200 | Gaming Seasons | POST `/events/{id}/submissions` | member | `XANO/api/gaming_seasons/events/id/submissions_POST.xs` | int id; json fields?; json file_ids? | get:events; add:event_submissions | None | None | Pending | — | — |
| API-201 | Gaming Seasons | POST `/seasons/{id}/committee` | member | `XANO/api/gaming_seasons/seasons/id/committee_POST.xs` | int id; int manager_member_id?; int treasurer_member_id? | get:seasons; query:season_committee; add:season_committee; edit:season_committee | None | None | Pending | — | — |
| API-202 | Gaming Seasons | POST `/seasons/{id}/distribution-records` | member | `XANO/api/gaming_seasons/seasons/id/distribution_records_POST.xs` | int id; decimal amount filters=min:0; int member_id; int event_ref_id? | get:seasons; add:season_distribution_records | None | None | Pending | — | — |
| API-203 | Gaming Seasons | GET `/seasons/{id}/events` | public | `XANO/api/gaming_seasons/seasons/id/events_GET.xs` | int id | get:seasons; query:events | None | None | Pending | — | — |
| API-204 | Gaming Seasons | GET `/seasons/{id}/ledger` | member | `XANO/api/gaming_seasons/seasons/id/ledger_GET.xs` | int id | get:seasons; query:season_funding; query:events; query:event_results | None | None | Pending | — | — |
| API-205 | Gaming Seasons | POST `/seasons/{id}/secure-funding/deposit` | member | `XANO/api/gaming_seasons/seasons/id/secure_funding/deposit_POST.xs` | int id; decimal tokens filters=min:1 | get:seasons; get:system_config; get:pts_rate_current; add:season_funding; edit:seasons | mutate_wallet | tx | Pending | — | — |
| API-206 | Gaming Seasons | GET `/seasons/{id}` | public | `XANO/api/gaming_seasons/seasons/id_GET.xs` | int id | get:seasons; edit:seasons; query:events; query:season_committee; query:season_funding | None | None | Pending | — | — |
| API-207 | Gaming Seasons | GET `/seasons` | public | `XANO/api/gaming_seasons/seasons_GET.xs` | int game_id?; enum status?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:seasons; edit:seasons | None | None | Pending | — | — |
| API-208 | Groups | POST `/groups/{id}/appeal-removal` | member | `XANO/api/groups/groups/id/appeal_removal_POST.xs` | int id; text reason? filters=trim | get:member_groups; query:member_group_members; get:system_config | emit_notification | notify | Pending | — | — |
| API-209 | Groups | POST `/groups/{id}/delete` | member | `XANO/api/groups/groups/id/delete_POST.xs` | int id | get:member_groups; query:member_group_members; edit:member_groups | None | None | Pending | — | — |
| API-210 | Groups | POST `/groups/{id}/invite` | member | `XANO/api/groups/groups/id/invite_POST.xs` | int id; int member_id | get:member_groups; query:member_group_members; get:user; query:group_invites; add:group_invites | emit_notification | notify | Pending | — | — |
| API-211 | Groups | POST `/groups/{id}/invites/{inv_id}/respond` | member | `XANO/api/groups/groups/id/invites/inv_id/respond_POST.xs` | int id; int inv_id; bool accept | get:member_groups; get:group_invites; edit:group_invites; query:member_group_members; edit:member_group_members; add:member_group_members; edit:member_groups | None | tx | Pending | — | — |
| API-212 | Groups | POST `/groups/{id}/join-requests/{req_id}/decision` | member | `XANO/api/groups/groups/id/join_requests/req_id/decision_POST.xs` | int id; int req_id; enum decision | get:member_groups; query:member_group_members; get:member_group_members; edit:member_group_members; edit:member_groups | emit_notification | tx; notify | Pending | — | — |
| API-213 | Groups | GET `/groups/{id}/join-requests` | member | `XANO/api/groups/groups/id/join_requests_GET.xs` | int id | get:member_groups; query:member_group_members; get:user | None | None | Pending | — | — |
| API-214 | Groups | POST `/groups/{id}/join` | member | `XANO/api/groups/groups/id/join_POST.xs` | int id | get:member_groups; query:member_group_members; edit:member_group_members; add:member_group_members; edit:member_groups | emit_notification | tx; notify | Pending | — | — |
| API-215 | Groups | POST `/groups/{id}/leave` | member | `XANO/api/groups/groups/id/leave_POST.xs` | int id | get:member_groups; query:member_group_members; edit:member_groups | None | tx | Pending | — | — |
| API-216 | Groups | GET `/groups/{id}/members` | member | `XANO/api/groups/groups/id/members_GET.xs` | int id | get:member_groups; query:member_group_members; get:user | None | None | Pending | — | — |
| API-217 | Groups | GET `/groups/{id}/pending-invites` | member | `XANO/api/groups/groups/id/pending_invites_GET.xs` | int id | get:member_groups; query:member_group_members; query:group_invites; get:user | None | None | Pending | — | — |
| API-218 | Groups | GET `/groups/{id}/posts` | member | `XANO/api/groups/groups/id/posts_GET.xs` | int id; int page?=1 filters=min:1; int per_page?=20 filters=min:1\|max:50 | get:member_groups; edit:member_groups; query:member_group_members; query:group_posts; get:user; query:group_post_reactions; query:group_post_comments; query:group_post_poll_votes | None | None | Pending | — | — |
| API-219 | Groups | POST `/groups/{id}/posts` | member | `XANO/api/groups/groups/id/posts_POST.xs` | int id; enum post_type; text content? filters=trim; json media?; json poll? | get:member_groups; query:member_group_members; add:group_posts | None | None | Pending | — | — |
| API-220 | Groups | POST `/groups/{id}/promote-coadmin` | member | `XANO/api/groups/groups/id/promote_coadmin_POST.xs` | int id; int member_id | get:member_groups; query:member_group_members; edit:member_group_members | None | None | Pending | — | — |
| API-221 | Groups | POST `/groups/{id}/remove-member` | member | `XANO/api/groups/groups/id/remove_member_POST.xs` | int id; int member_id | get:member_groups; query:member_group_members; edit:member_group_members; edit:member_groups | None | tx | Pending | — | — |
| API-222 | Groups | POST `/groups/{id}/transfer-admin` | member | `XANO/api/groups/groups/id/transfer_admin_POST.xs` | int id; int member_id | get:member_groups; query:member_group_members; edit:with; edit:member_group_members; edit:member_groups | None | tx | Pending | — | — |
| API-223 | Groups | GET `/groups/{id}` | member | `XANO/api/groups/groups/id_GET.xs` | int id | get:member_groups; edit:member_groups; query:member_group_members | None | None | Pending | — | — |
| API-224 | Groups | GET `/groups/invites/me` | member | `XANO/api/groups/groups/invites/me_GET.xs` | None | query:group_invites; get:member_groups; get:user | None | None | Pending | — | — |
| API-225 | Groups | GET `/groups` | member | `XANO/api/groups/groups_GET.xs` | text sector?; text search?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:member_groups | None | None | Pending | — | — |
| API-226 | Groups | POST `/groups` | member | `XANO/api/groups/groups_POST.xs` | text name filters=trim; text description? filters=trim; text sector? filters=trim; enum group_type; int icon_file_id? | add:member_groups; add:member_group_members | None | tx | Pending | — | — |
| API-227 | Groups | GET `/posts/{id}/comments` | member | `XANO/api/groups/posts/id/comments_GET.xs` | int id; int page?=1 filters=min:1; int per_page?=100 filters=min:1\|max:200 | get:group_posts; get:member_groups; query:member_group_members; query:group_post_comments; get:user | None | None | Pending | — | — |
| API-228 | Groups | POST `/posts/{id}/comments` | member | `XANO/api/groups/posts/id/comments_POST.xs` | int id; text content filters=trim | get:group_posts; get:member_groups; query:member_group_members; add:group_post_comments | emit_notification | notify | Pending | — | — |
| API-229 | Groups | POST `/posts/{id}/delete` | member | `XANO/api/groups/posts/id/delete_POST.xs` | int id | get:group_posts; get:member_groups; query:member_group_members; query:group_post_poll_votes; query:group_post_reactions; query:group_post_comments | None | None | Pending | — | — |
| API-230 | Groups | POST `/posts/{id}/react` | member | `XANO/api/groups/posts/id/react_POST.xs` | int id; text reaction filters=trim | get:group_posts; get:member_groups; query:member_group_members; query:group_post_reactions; edit:group_post_reactions; add:group_post_reactions | None | None | Pending | — | — |
| API-231 | Groups | POST `/posts/{id}/vote` | member | `XANO/api/groups/posts/id/vote_POST.xs` | int id; int option_index filters=min:0 | get:group_posts; get:member_groups; query:member_group_members; query:group_post_poll_votes; edit:group_post_poll_votes; add:group_post_poll_votes | None | None | Pending | — | — |
| API-232 | INR Forms | POST `/{id}/submit` | member | `XANO/api/inr_forms/id/submit_POST.xs` | int id | get:declarations | None | None | Pending | — | — |
| API-233 | INR Forms | DELETE `/declarations/{id}` | member | `XANO/api/inr_forms/declarations/id_DELETE.xs` | int id | get:declarations | None | None | Pending | — | — |
| API-234 | INR Forms | GET `/declarations/{id}` | member | `XANO/api/inr_forms/declarations/id_GET.xs` | int id | get:declarations | None | None | Pending | — | — |
| API-235 | INR Forms | POST `/declarations/public` | public | `XANO/api/inr_forms/declarations/public_POST.xs` | decimal amount filters=min:0; enum payment_type; text description?; text file_url?; json additional_details?; email contact_email; text contact_mobile? | No table operation found statically | create_declaration | None | Pending | — | — |
| API-236 | INR Forms | POST `/declarations` | member | `XANO/api/inr_forms/declarations_POST.xs` | decimal amount filters=min:0; enum payment_type; text description?; text file_url?; json additional_details?; email contact_email?; text contact_mobile? | No table operation found statically | create_declaration | None | Pending | — | — |
| API-237 | INR Forms | GET `/list` | member | `XANO/api/inr_forms/list_GET.xs` | None | query:declarations | None | None | Pending | — | — |
| API-238 | Loans | POST `/loans/{id}/repay` | member | `XANO/api/loans/loans/id/repay_POST.xs` | int id; decimal amount_tokens | get:loans; get:system_config; add:loan_repayments; edit:loans | mutate_wallet; emit_notification | tx; notify | Pending | — | — |
| API-239 | Loans | GET `/loans/me` | member | `XANO/api/loans/loans/me_GET.xs` | None | query:loans; query:loan_debits; add:loan_debits; edit:loans; query:loan_repayments | mutate_wallet_unchecked; emit_notification | tx; notify | Pending | — | — |
| API-240 | Loans | POST `/loans/request` | member | `XANO/api/loans/loans/request_POST.xs` | decimal amount_inr; text upi_id filters=trim; timestamp planned_return_date?; text purpose filters=trim; int document_file_id? | add:loans; get:system_config | emit_notification | notify | Pending | — | — |
| API-241 | Marketplace | PATCH `/admin/orders/{id}/fulfill` | member | `XANO/api/marketplace/admin/orders/id/fulfill_PATCH.xs` | int id | get:orders; edit:orders; add:event_log | None | tx | Pending | — | — |
| API-242 | Marketplace | GET `/admin/orders` | member | `XANO/api/marketplace/admin/orders_GET.xs` | enum status?; int page?=1 filters=min:1; int per_page?=50 filters=min:1\|max:100 | query:orders | None | None | Pending | — | — |
| API-243 | Marketplace | GET `/marketplace/categories/tree` | public | `XANO/api/marketplace/marketplace/categories/tree_GET.xs` | int root_id?; int max_depth?=8 | get:system_config; query:categories | None | None | Pending | — | — |
| API-244 | Marketplace | GET `/marketplace/categories` | public | `XANO/api/marketplace/marketplace/categories_GET.xs` | None | query:categories | None | None | Pending | — | — |
| API-245 | Marketplace | DELETE `/marketplace/items/{id}` | member | `XANO/api/marketplace/marketplace/items/id_DELETE.xs` | int id | get:marketplace_items | None | None | Pending | — | — |
| API-246 | Marketplace | GET `/marketplace/items/{id}` | member | `XANO/api/marketplace/marketplace/items/id_GET.xs` | int id | get:marketplace_items | None | None | Pending | — | — |
| API-247 | Marketplace | PATCH `/marketplace/items/{id}` | member | `XANO/api/marketplace/marketplace/items/id_PATCH.xs` | int id; text title?; text description?; decimal price?; int stock?; enum status? | get:marketplace_items | None | None | Pending | — | — |
| API-248 | Marketplace | GET `/marketplace/items` | member | `XANO/api/marketplace/marketplace/items_GET.xs` | int category_id?; text search? | query:marketplace_items | None | None | Pending | — | — |
| API-249 | Marketplace | POST `/marketplace/items` | member | `XANO/api/marketplace/marketplace/items_POST.xs` | text title; text description; decimal price; enum currency; int stock; int proposing_member_id?; decimal revenue_share_proposer_pct filters=min:0\|max:100; decimal revenue_share_admin_pct filters=min:0\|max:100; json buyer_info_schema | get:categories; add:marketplace_items | Quick Start/enforce_role; log_admin_action | audit | Pending | — | — |
| API-250 | Marketplace | POST `/marketplace/orders/{id}/cancel` | member | `XANO/api/marketplace/marketplace/orders/id/cancel_POST.xs` | int id; text reason? | get:orders; get:marketplace_items; edit:marketplace_items; edit:orders | mutate_wallet | None | Pending | — | — |
| API-251 | Marketplace | POST `/marketplace/orders/{id}/dispute` | member | `XANO/api/marketplace/marketplace/orders/id/dispute_POST.xs` | int id; text reason | get:orders; add:marketplace_order_disputes; edit:orders | None | None | Pending | — | — |
| API-252 | Marketplace | POST `/marketplace/orders/{id}/mark-received` | member | `XANO/api/marketplace/marketplace/orders/id/mark_received_POST.xs` | int id; text idempotency_key? | get:orders; get:marketplace_items; get:system_config; add:marketplace_settlements; edit:orders | idempotency_lookup; mutate_wallet; idempotency_store | tx; idem | Pending | — | — |
| API-253 | Marketplace | POST `/marketplace/orders/{id}/proof-of-delivery` | member | `XANO/api/marketplace/marketplace/orders/id/proof_of_delivery_POST.xs` | int id; text note? | get:orders; get:marketplace_items; get:system_config; add:marketplace_pod; edit:orders | None | None | Pending | — | — |
| API-254 | Marketplace | POST `/marketplace/orders/{id}/settle-request` | member | `XANO/api/marketplace/marketplace/orders/id/settle_request_POST.xs` | int id | get:orders; get:marketplace_items | None | None | Pending | — | — |
| API-255 | Marketplace | GET `/marketplace/orders/{id}` | member | `XANO/api/marketplace/marketplace/orders/id_GET.xs` | int id | get:orders; get:marketplace_pod; get:marketplace_items; get:system_config; add:marketplace_settlements; edit:orders | mutate_wallet | tx | Pending | — | — |
| API-256 | Marketplace | GET `/marketplace/orders` | member | `XANO/api/marketplace/marketplace/orders_GET.xs` | None | query:orders; get:marketplace_items | None | None | Pending | — | — |
| API-257 | Marketplace | POST `/marketplace/orders` | member | `XANO/api/marketplace/marketplace/orders_POST.xs` | int item_id; int quantity filters=min:1; json buyer_info; text idempotency_key? | get:marketplace_items; query:orders; query:wallets; get:system_config; add:orders; edit:marketplace_items; query:courses; query:sessions; query:enrollments; add:enrollments | idempotency_lookup; mutate_wallet; idempotency_store | tx; idem | Pending | — | — |
| API-258 | Marketplace | GET `/marketplace/sales` | member | `XANO/api/marketplace/marketplace/sales_GET.xs` | None | query:marketplace_items; query:orders | None | None | Pending | — | — |
| API-259 | Notifications | POST `/notifications/{id}/read` | member | `XANO/api/notifications/notifications/id/read_POST.xs` | int id | get:notifications; edit:notifications | None | None | Pending | — | — |
| API-260 | Notifications | GET `/notifications/preferences` | member | `XANO/api/notifications/notifications/preferences_GET.xs` | None | query:notification_preferences | None | None | Pending | — | — |
| API-261 | Notifications | PATCH `/notifications/preferences` | member | `XANO/api/notifications/notifications/preferences_PATCH.xs` | bool email?; bool in_app?; json per_event? | query:notification_preferences; add:notification_preferences; edit:notification_preferences | None | None | Pending | — | — |
| API-262 | Notifications | POST `/notifications/read-all` | member | `XANO/api/notifications/notifications/read_all_POST.xs` | None | query:notifications; edit:notifications | None | None | Pending | — | — |
| API-263 | Notifications | GET `/notifications` | member | `XANO/api/notifications/notifications_GET.xs` | bool unread_only?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:notifications | None | None | Pending | — | — |
| API-264 | Point Token Scheme | PATCH `/admin/pts/rate` | member | `XANO/api/point_token_scheme/admin/pts/rate_PATCH.xs` | decimal rate filters=min:0.00000001; text note? | get:pts_rate_current; add:pts_rate_history | Quick Start/enforce_role | tx | Pending | — | — |
| API-265 | Point Token Scheme | POST `/convert` | member | `XANO/api/point_token_scheme/convert_POST.xs` | enum direction; decimal amount filters=min:0.00000001; text idempotency_key? | get:system_config; query:wallets; add:pts_conversions | idempotency_lookup; pts_compute_rate; mutate_wallet; idempotency_store | tx; idem | Pending | — | — |
| API-266 | Point Token Scheme | GET `/history` | member | `XANO/api/point_token_scheme/history_GET.xs` | int page?; int per_page? | query:pts_conversions | None | None | Pending | — | — |
| API-267 | Point Token Scheme | POST `/quote` | member | `XANO/api/point_token_scheme/quote_POST.xs` | enum direction; decimal amount filters=min:0.00000001 | get:system_config; query:wallets | pts_compute_rate | None | Pending | — | — |
| API-268 | Point Token Scheme | GET `/rate` | member | `XANO/api/point_token_scheme/rate_GET.xs` | None | No table operation found statically | pts_compute_rate | None | Pending | — | — |
| API-269 | Points Transfer | POST `/{id}/accept` | member | `XANO/api/points_transfer/id/accept_POST.xs` | int id | get:points_transfers; edit:points_transfers | mutate_wallet | tx | Pending | — | — |
| API-270 | Points Transfer | POST `/{id}/cancel` | member | `XANO/api/points_transfer/id/cancel_POST.xs` | int id | get:points_transfers; edit:points_transfers | mutate_wallet | tx | Pending | — | — |
| API-271 | Points Transfer | POST `/{id}/dispute` | member | `XANO/api/points_transfer/id/dispute_POST.xs` | int id; text reason filters=trim | get:points_transfers; add:transfer_disputes; edit:points_transfers | None | tx | Pending | — | — |
| API-272 | Points Transfer | GET `/passbook` | member | `XANO/api/points_transfer/passbook_GET.xs` | int page?=1 filters=min:1; int per_page?=50 filters=min:1\|max:100 | query:points_ledger; get:user | None | None | Pending | — | — |
| API-273 | Points Transfer | GET `/pending` | member | `XANO/api/points_transfer/pending_GET.xs` | enum direction? | query:points_transfers; edit:points_transfers; get:user | None | None | Pending | — | — |
| API-274 | Points Transfer | POST `/points-transfer` | member | `XANO/api/points_transfer/points_transfer_POST.xs` | int to_member_id; decimal amount filters=min:1; text remark? filters=max:280; text idempotency_key? | get:user; add:points_transfers; add:points_ledger | idempotency_lookup; mutate_wallet; idempotency_store | tx; idem | Pending | — | — |
| API-275 | Proposals | POST `/proposals/{id}/withdraw` | member | `XANO/api/proposals/proposals/id/withdraw_POST.xs` | int id | get:marketplace_proposals; edit:marketplace_proposals | None | None | Pending | — | — |
| API-276 | Proposals | GET `/proposals/{id}` | member | `XANO/api/proposals/proposals/id_GET.xs` | int id | get:marketplace_proposals | None | None | Pending | — | — |
| API-277 | Proposals | PATCH `/proposals/{id}` | member | `XANO/api/proposals/proposals/id_PATCH.xs` | int id; text item_name?; text description?; text sector?; json suggested_category_path?; text item_type?; decimal suggested_price_tokens? filters=min:0; decimal proposed_revenue_share_pct? filters=min:0\|max:100; json buyer_info_schema?; json attachments? | get:marketplace_proposals; edit:marketplace_proposals | None | None | Pending | — | — |
| API-278 | Proposals | GET `/proposals` | member | `XANO/api/proposals/proposals_GET.xs` | enum status?; int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:marketplace_proposals | None | None | Pending | — | — |
| API-279 | Proposals | POST `/proposals` | member | `XANO/api/proposals/proposals_POST.xs` | text item_name filters=trim; text description filters=trim; text sector filters=trim; json suggested_category_path; text item_type filters=trim; decimal suggested_price_tokens filters=min:0; decimal proposed_revenue_share_pct filters=min:0\|max:100; json buyer_info_schema; json attachments?; int ref_blog_id? | add:marketplace_proposals | None | None | Pending | — | — |
| API-280 | Search | GET `/search` | member | `XANO/api/search/search_GET.xs` | text q; text sector?; int category?; int limit?=20 filters=min:1\|max:100 | query:categories; query:marketplace_items; query:member_groups; query:member_group_members; query:blogs; query:blog_readers; query:orders | None | None | Pending | — | — |
| API-281 | system | GET `/config` | public | `XANO/api/system/config_GET.xs` | None | get:system_config; get:pts_rate_current | None | None | Pending | — | — |
| API-282 | system | DELETE `/files/{id}` | member | `XANO/api/system/files/id_DELETE.xs` | int id | get:files; get:user | None | None | Pending | — | — |
| API-283 | system | POST `/files/upload` | member | `XANO/api/system/files/upload_POST.xs` | file? file; enum purpose | add:files | None | None | Pending | — | — |
| API-284 | Token Surrenders | GET `/{id}` | member | `XANO/api/token_surrenders/id_GET.xs` | int id | get:token_surrenders | None | None | Pending | — | — |
| API-285 | Token Surrenders | POST `/create` | member | `XANO/api/token_surrenders/create_POST.xs` | decimal vgc_token_amount; decimal conversion_rate | query:wallets; add:token_surrenders | None | None | Pending | — | — |
| API-286 | Token Surrenders | GET `/list` | member | `XANO/api/token_surrenders/list_GET.xs` | int skip? filters=min:0; int limit?=10 filters=min:1\|max:100 | query:token_surrenders | None | None | Pending | — | — |
| API-287 | User_Profile | GET `/erasure-request` | member | `XANO/api/user_profile/erasure_request_GET.xs` | None | query:data_erasure_requests | None | None | Pending | — | — |
| API-288 | User_Profile | POST `/erasure-request` | member | `XANO/api/user_profile/erasure_request_POST.xs` | text request_reason? | query:data_erasure_requests; add:data_erasure_requests | None | None | Pending | — | — |
| API-289 | User_Profile | GET `/lookup` | member | `XANO/api/user_profile/lookup_GET.xs` | text query filters=trim\|min:3 | query:user | None | None | Pending | — | — |
| API-290 | User_Profile | GET `/profile` | member | `XANO/api/user_profile/profile_GET.xs` | None | query:wallets | None | None | Pending | — | — |
| API-291 | User_Profile | PATCH `/profile` | member | `XANO/api/user_profile/profile_PATCH.xs` | text name? filters=trim; text mobile? filters=digitOk; text city? filters=trim; text state? filters=trim; text country? filters=trim; date dob?; int avatar_file_id? | get:user; get:files | None | None | Pending | — | — |
| API-292 | User_Profile | GET `/roles` | member | `XANO/api/user_profile/roles_GET.xs` | None | get:user | None | None | Pending | — | — |
| API-293 | Wallets | GET `/me/{currency}` | member | `XANO/api/wallets/me/currency_GET.xs` | enum currency | query:wallets | None | None | Pending | — | — |
| API-294 | Wallets | GET `/me/activity` | member | `XANO/api/wallets/me/activity_GET.xs` | int page?=1 filters=min:1; int per_page?=25 filters=min:1\|max:100 | query:wallet_transactions; get:ledger; get:blogs; get:contract_applications; get:contracts; get:user; get:contract_ratings | None | None | Pending | — | — |
| API-295 | Wallets | GET `/me` | member | `XANO/api/wallets/me_GET.xs` | None | query:wallets; add:wallets | None | None | Pending | — | — |

## 5. Reusable Xano functions

| Function ID | Source | Required caller/state coverage | Result | Evidence | Defect |
|---|---|---|---|---|---|
| FN-01 | `XANO/function/admin_audit.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-02 | `XANO/function/check_rate_limit.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-03 | `XANO/function/create_declaration.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-04 | `XANO/function/emit_notification.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-05 | `XANO/function/idempotency_lookup.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-06 | `XANO/function/idempotency_store.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-07 | `XANO/function/log_admin_action.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-08 | `XANO/function/mutate_wallet.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-09 | `XANO/function/mutate_wallet_unchecked.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-10 | `XANO/function/pts_compute_rate.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-11 | `XANO/function/quick_start/enforce_role.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-12 | `XANO/function/quick_start/generate_magic_link.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-13 | `XANO/function/quick_start/log_event.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-14 | `XANO/function/require_admin.xs` | Pending call-site/state mapping | Pending | — | — |
| FN-15 | `XANO/function/wallet_mutate.xs` | Pending call-site/state mapping | Pending | — | — |

## 6. Xano data tables and invariants

| Table ID | Source | Owner/CRUD mapping | Constraints/status/retention tests | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
| DB-001 | `XANO/table/activities.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-002 | `XANO/table/activity_catalog.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-003 | `XANO/table/activity_catalog_changelog.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-004 | `XANO/table/admin_audit_log.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-005 | `XANO/table/admin_login_events.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-006 | `XANO/table/admin_mfa_challenges.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-007 | `XANO/table/admin_totp.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-008 | `XANO/table/blog_bookmarks.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-009 | `XANO/table/blog_comments.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-010 | `XANO/table/blog_dislikes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-011 | `XANO/table/blog_likes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-012 | `XANO/table/blog_readers.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-013 | `XANO/table/blogs.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-014 | `XANO/table/cart_items.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-015 | `XANO/table/carts.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-016 | `XANO/table/categories.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-017 | `XANO/table/contract_application_messages.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-018 | `XANO/table/contract_applications.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-019 | `XANO/table/contract_disputes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-020 | `XANO/table/contract_ratings.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-021 | `XANO/table/contracts.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-022 | `XANO/table/course_amendments.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-023 | `XANO/table/courses.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-024 | `XANO/table/data_erasure_requests.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-025 | `XANO/table/declarations.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-026 | `XANO/table/dispute_messages.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-027 | `XANO/table/donors.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-028 | `XANO/table/elections.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-029 | `XANO/table/email_verification_tokens.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-030 | `XANO/table/enrollments.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-031 | `XANO/table/event_log.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-032 | `XANO/table/event_results.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-033 | `XANO/table/event_submissions.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-034 | `XANO/table/events.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-035 | `XANO/table/expenses.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-036 | `XANO/table/files.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-037 | `XANO/table/game_group_members.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-038 | `XANO/table/game_groups.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-039 | `XANO/table/games.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-040 | `XANO/table/group_invites.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-041 | `XANO/table/group_post_comments.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-042 | `XANO/table/group_post_poll_votes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-043 | `XANO/table/group_post_reactions.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-044 | `XANO/table/group_posts.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-045 | `XANO/table/guardian_approvals.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-046 | `XANO/table/idempotency_keys.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-047 | `XANO/table/investment_overdue_requests.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-048 | `XANO/table/investment_payouts.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-049 | `XANO/table/investments.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-050 | `XANO/table/ledger.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-051 | `XANO/table/loan_debits.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-052 | `XANO/table/loan_repayments.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-053 | `XANO/table/loans.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-054 | `XANO/table/marketplace_items.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-055 | `XANO/table/marketplace_order_disputes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-056 | `XANO/table/marketplace_pod.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-057 | `XANO/table/marketplace_proposals.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-058 | `XANO/table/marketplace_settlements.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-059 | `XANO/table/member_group_members.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-060 | `XANO/table/member_groups.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-061 | `XANO/table/mobile_otps.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-062 | `XANO/table/notification_preferences.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-063 | `XANO/table/notifications.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-064 | `XANO/table/orders.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-065 | `XANO/table/pioneer_candidates.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-066 | `XANO/table/points_ledger.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-067 | `XANO/table/points_minting_budget.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-068 | `XANO/table/points_minting_log.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-069 | `XANO/table/points_transfers.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-070 | `XANO/table/pts_components.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-071 | `XANO/table/pts_conversions.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-072 | `XANO/table/pts_rate_cache.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-073 | `XANO/table/pts_rate_current.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-074 | `XANO/table/pts_rate_history.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-075 | `XANO/table/rate_announcements.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-076 | `XANO/table/rate_limit_counters.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-077 | `XANO/table/season_committee.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-078 | `XANO/table/season_distribution_records.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-079 | `XANO/table/season_funding.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-080 | `XANO/table/seasons.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-081 | `XANO/table/session_ratings.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-082 | `XANO/table/sessions.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-083 | `XANO/table/sponsorship_disputes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-084 | `XANO/table/sponsorship_recognitions.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-085 | `XANO/table/sponsorship_refunds.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-086 | `XANO/table/sponsorships.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-087 | `XANO/table/system_config.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-088 | `XANO/table/token_surrenders.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-089 | `XANO/table/transfer_disputes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-090 | `XANO/table/user.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-091 | `XANO/table/votes.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-092 | `XANO/table/wallet_transactions.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |
| DB-093 | `XANO/table/wallets.xs` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |

## 7. Workflows and SRS traceability

Expected results must keep separate columns in child cases for SRS Expected, Approved Deviation and Actual Observed.

| Workflow ID | Workflow | Atomic SRS rules | Personas/fixtures | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
| WF-01 | Adult registration, verification and first session | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-02 | Minor/guardian lifecycle | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-03 | Password, profile, verification state and account data | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-04 | INR declaration to token purchase | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-05 | Token surrender | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-06 | Instant Points transfer and passbook | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-07 | Points minting and activity rewards | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-08 | Point Token Scheme | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-09 | Marketplace proposal, listing, cart and order lifecycle | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-10 | Groups and every post type | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-11 | Blog and Revenue Generator lifecycle | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-12 | Gaming Pioneer, election, season and event | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-13 | Education course to payout | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-14 | Financial donation, investment and sponsorship | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-15 | Loan lifecycle | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-16 | Expenses and Platform Outflow | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-17 | Secure and Independent contracts | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-18 | Notifications, preferences and deep links | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-19 | Admin security and governance | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |
| WF-20 | Search and visibility | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |

## Checkpoint history

| Checkpoint | Local time | Build/commit | Counts reconciled | Notes |
|---|---|---|---|---|
| CP-001 | 2026-07-19 | Root `2b7a2c1`; frontend `ce7e994` | 87/318/295/15/93/20 | Initial source-derived inventory seeded; no functional row has been credited yet |
