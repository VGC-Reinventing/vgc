# VGC Reinventing — Master Testing Plan

**Version:** 1.0 · 2026-06-10
**Reference:** SRS v2.2 (`C:\Users\VGC-ADMIN\Documents\VGC\SRS\VGC_Reinventing_SRS_v2.md`)
**App URL:** https://frontend-kappa-mocha-30.vercel.app
**Bug tracker:** `C:\Users\VGC-ADMIN\Documents\VGC\TEST_REGISTER.md`

---

## How to Use This Plan

1. Work through modules in order — later modules depend on data created by earlier ones.
2. Mark each test **Pass / Fail / Skip** in the Status column.
3. If a test **Fails**, log it immediately in `TEST_REGISTER.md` (next TR-ID) before continuing.
4. Tests marked **[ADMIN]** require you to be logged in as VGC Admin.
5. Tests marked **[MEMBER]** require a regular test member account.
6. Tests marked **[BOTH]** require two browser windows / devices simultaneously.

---

## Known Limitations (read before testing)

| ID | Limitation | Impact on Testing |
|---|---|---|
| BG-7 | XANO free plan only delivers email to `seekingj01@gmail.com`. OTP emails to regular test accounts will NOT arrive. | Email verification OTP for new members won't work. Work around: use the Admin panel to manually verify email, OR test only with the admin account where OTP does arrive. |
| DOC-3 | Points transfers are **escrow + 10-min accept window** in the live backend (not instant as SRS §5.5 says). | Sender sends → receiver must explicitly Accept within 10 min. Test both accept and expire paths. |
| Admin OTP | Admin 2FA OTP is a 36-char UUID sent to `seekingj01@gmail.com`. | Check Gmail inbox for each admin login during testing. |

---

## Test Accounts

| Account | Email | Password | Member ID | Role |
|---|---|---|---|---|
| Admin | seekingj01+vgcadmin@gmail.com | VgcAdmin#2026 | VGC37 | Admin |
| Test Member A | seekingj01+vgc01@gmail.com | (set during signup) | — | Member |
| Test Member B | seekingj01+vgc02@gmail.com | (set during signup) | — | Member |
| Test Member C | seekingj01+vgc03@gmail.com | (set during signup) | — | Member |

> **Tip:** Gmail plus-addressing means all OTP emails land in `seekingj01@gmail.com`.
> Regular member OTPs for vgc01/02/03 will also arrive there — just look for the right subject line.

---

## Module Overview

| Module | Test IDs | SRS Section |
|---|---|---|
| A. Authentication & Member Management | T-MM-001 → T-MM-020 | §2 |
| B. Wallet System | T-WS-001 → T-WS-015 | §3 |
| C. Point Token Scheme | T-PTS-001 → T-PTS-012 | §4 |
| D. VGC Points Economy | T-PE-001 → T-PE-014 | §5 |
| E. VGC Marketplace | T-MP-001 → T-MP-022 | §6 |
| F. Groups | T-GR-001 → T-GR-016 | §7 |
| G. Blog | T-BL-001 → T-BL-014 | §8 |
| H. Loans | T-LN-001 → T-LN-010 | §9 |
| I. Expense Tracker | T-ET-001 → T-ET-010 | §10 |
| J. Gaming Sector | T-GM-001 → T-GM-018 | §11 |
| K. Education Sector | T-ED-001 → T-ED-016 | §12 |
| L. Financial Sector | T-FS-001 → T-FS-014 | §13 |
| M. Contracts | T-CT-001 → T-CT-018 | §14 |
| N. Admin Panel | T-AP-001 → T-AP-015 | §15 |
| O. Notifications | T-NF-001 → T-NF-008 | §16 |
| P. Search | T-SR-001 → T-SR-006 | §17 |

---

## A. Authentication & Member Management (SRS §2)

### Setup requirement
Create **Member A** (Test Member A) before this module. Use it throughout.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-MM-001 | **Signup — adult (18+)** | Not logged in | 1. Go to app → Sign Up. 2. Enter full name, `seekingj01+vgc01@gmail.com`, password `TestPass#01`, DOB = 01/01/1990, city/state/country. 3. Submit. | Account created. Success screen / redirect to verify-email. Member ID assigned (VGC##). | | |
| T-MM-002 | **Signup — duplicate email** | T-MM-001 done | 1. Attempt signup with same email `seekingj01+vgc01@gmail.com`. | Error: email already registered. No new account created. | | |
| T-MM-003 | **Email verification OTP** | T-MM-001 done | 1. Check `seekingj01@gmail.com` inbox for OTP email sent to vgc01. 2. Enter the OTP on the verify-email screen. | Email marked verified. Member can now log in. | | |
| T-MM-004 | **Login — correct credentials** | T-MM-001 done, email verified | 1. Log in with `seekingj01+vgc01@gmail.com` / `TestPass#01`. | Redirected to Home screen. Member ID and name visible. | | |
| T-MM-005 | **Login — wrong password** | Member A account exists | 1. Try login with correct email, wrong password. | Error message shown. Not logged in. | | |
| T-MM-006 | **Login — Admin 2FA flow** | Not logged in as admin | 1. Go to `/admin/login`. 2. Enter admin email + password. 3. Check Gmail for OTP (36-char UUID). 4. Enter OTP on step-2 screen. | Admin dashboard accessible. Roles show `admin + member`. | | |
| T-MM-007 | **Profile view** | Logged in as Member A | 1. Go to Profile tab. | Full name, email, Member ID, city/state/country shown. | | |
| T-MM-008 | **Profile edit** | Logged in as Member A | 1. Go to Edit Profile. 2. Change city to "Mumbai". 3. Save. | City updated immediately on profile. | | |
| T-MM-009 | **Change password** | Logged in as Member A | 1. Profile → Change Password. 2. Enter current password, new password `TestPass#01b`, confirm. 3. Save. 4. Log out and log in with new password. | Password changed. Login with new password succeeds. | | |
| T-MM-010 | **Forgot password — request reset link** | Not logged in | 1. Login screen → Forgot Password. 2. Enter `seekingj01+vgc01@gmail.com`. 3. Submit. | Success message. Email with reset link sent (check Gmail). | | |
| T-MM-011 | **Password reset via magic link** | T-MM-010 done | 1. Open reset link from email. 2. Enter new password `TestPass#01c`. 3. Submit. 4. Log in with new password. | Password reset successful. Login works with new password. | | |
| T-MM-012 | **OTP resend rate limit** | Logged in (or OTP screen) | 1. On VerifyEmail screen, click Resend 5 times within 1 hour. 6th request should be blocked. | 6th resend shows rate-limit error (max 5 per hour per §2.4). | | |
| T-MM-013 | **Minor registration (under-18)** | Member A exists (to be guardian) | 1. Start signup with DOB = 01/01/2015 (under 18). 2. System should show guardian-approval field. 3. Enter Member A's Member ID. 4. Submit. | Registration paused. Guardian (Member A) notified by email/in-app to approve. | | |
| T-MM-014 | **Guardian approves minor** | T-MM-013 done | 1. Log in as Member A. 2. Go to Profile → Guardian Approvals. 3. Approve the pending request. | Minor's registration completes. Minor can now log in. Minor's account links Member A as guardian. | | |
| T-MM-015 | **Guardian rejects minor** | Another minor pending approval for Member A | 1. Log in as Member A → Guardian Approvals. 2. Reject the request. | Minor's registration discarded. Minor cannot log in. | | |
| T-MM-016 | **Signup rate limit per device** | — | 1. Attempt 4 signups with different emails from the same browser within 24 hours. | 4th signup should be blocked (max 3 per device per 24 hours per §2.4). | | |
| T-MM-017 | **Data Erasure Request** | Logged in as Member A | 1. Profile → Erasure Request. 2. Submit request. | Request logged. Admin notified. Member can see request status as Pending. | | |
| T-MM-018 | **[ADMIN] Process erasure** | T-MM-017 done | 1. Admin → Members. 2. Find Member A. 3. Process Erasure. | Name/email/mobile/DOB anonymised. Transaction ledger retained anonymised. | | |
| T-MM-019 | **[ADMIN] Suspend member** | Member A exists | 1. Admin → Members → find Member A → Suspend. | Member A cannot log in. Shows suspended message. | | |
| T-MM-020 | **Logout** | Logged in as any user | 1. Profile → Logout. | Session cleared. Redirected to Login screen. Token no longer valid. | | |

---

## B. Wallet System (SRS §3)

### Pre-conditions
Member A logged in. Admin has set rates: `inr_per_token = 10`, `surrender_rate = 8.5`.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-WS-001 | **Three wallets created on registration** | Member A logged in | 1. Go to Wallet tab. | INR Receipt Ledger, VGC Token Wallet, VGC Points Wallet all visible — each showing balance (likely 0). | | |
| T-WS-002 | **INR Declaration Form — Token Purchase** | Logged in as Member A | 1. Wallet → Declare. 2. Fill form: Payment Type = Token Purchase, Amount = ₹1000, Mode = UPI, UPI Tx ID = TEST001, date = today. 3. Submit. | Declaration submitted (status = pending). Admin notified. Member sees the declaration in their list. | | |
| T-WS-003 | **[ADMIN] Verify declaration — credits tokens** | T-WS-002 done | 1. Admin → Declarations → find Member A's declaration. 2. Verify it. | Member A's VGC Token Wallet credited with 100 tokens (₹1000 / ₹10). Admin INR Receipt Ledger credited ₹1000. | | |
| T-WS-004 | **[ADMIN] Reject declaration** | New declaration submitted | 1. Admin → Declarations → find new declaration. 2. Reject it. | Declaration marked Rejected. No wallet change. Member notified. | | |
| T-WS-005 | **Wallet passbook — activity shown** | T-WS-003 done | 1. Wallet → Passbook. | Token Purchase entry visible: +100 VGC Tokens, dated today, reference to declaration. | | |
| T-WS-006 | **Token Surrender Request Form** | Member A has ≥ 2 tokens | 1. Wallet → Token Surrender. 2. Fill: tokens to surrender = 2, UPI ID = test@upi. 3. Submit. | Request submitted. Equivalent INR auto-calculated (2 × ₹8.50 = ₹17) shown before submit. Admin notified. | | |
| T-WS-007 | **[ADMIN] Complete token surrender** | T-WS-006 done | 1. Admin → Token Surrenders → find request. 2. Mark Completed (after INR sent manually). | Member A's token wallet debited 2 tokens. Member's INR Receipt Ledger credited ₹17. | | |
| T-WS-008 | **Current rates displayed** | Logged in | 1. Wallet screen → Rate Notice (or Wallet page). | Buy rate: ₹10/token, Surrender rate: ₹17 for 2 tokens (₹8.50/token) displayed. | | |
| T-WS-009 | **[ADMIN] Announce rate change (30-day notice)** | Logged in as admin | 1. Admin → Config → Announce Rate Change. 2. Set new buy rate (e.g. ₹12/token), effective_from = today + 30 days. 3. Submit. | All members notified platform-wide. New rate and effective date shown on wallet page. Current rate unchanged until effective date. | | |
| T-WS-010 | **Declaration list** | Member A has ≥ 1 declaration | 1. Wallet → My Declarations. | All declarations shown with status (Pending / Verified / Rejected). | | |
| T-WS-011 | **Token surrender list** | Member A has ≥ 1 surrender request | 1. Wallet → My Token Surrenders. | All surrender requests shown with status (Pending / Completed). | | |
| T-WS-012 | **INR Receipt Ledger — credits only** | Member A has received INR credit | 1. Wallet → INR Ledger. | Only credit entries visible. No debit option available to member. | | |
| T-WS-013 | **Declaration delete (draft only)** | Member A has an unsubmitted/draft declaration | 1. Declarations list → find draft. 2. Delete. | Draft deleted. No submitted declaration can be deleted by member. | | |
| T-WS-014 | **Wallet balance does not allow negative** | Member A has 0 tokens | 1. Submit token surrender for more tokens than balance. | Error: insufficient balance. Surrender blocked. | | |
| T-WS-015 | **[ADMIN] Admin wallet management — adjust balance** | Logged in as admin | 1. Admin → Wallet Tools → find Member A → Adjust. 2. Credit 50 tokens. | Member A's token wallet shows +50 tokens. Transaction recorded in ledger. | | |

---

## C. Point Token Scheme (SRS §4)

### Pre-conditions
Member A has VGC Tokens and VGC Points (seed some via Admin awards if needed).
Admin has bootstrapped PTS (bootstrap endpoint called, or check if current rate is valid).

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-PTS-001 | **PTS rate dashboard visible** | Logged in as Member A | 1. Navigate to PTS / Wallet → PTS. | Rate dashboard shows: r_published, R_user (Points per Token), all components (I, R, A, T_net, P_net, L_invest, t_idle). θ (theta) is NOT shown. | | |
| T-PTS-002 | **Rate formula components visible** | T-PTS-001 | 1. On PTS dashboard, click any component (e.g. A). | Sub-breakdown shown (e.g. A = marketplace inventory + sponsorship + cash equivalents). | | |
| T-PTS-003 | **Convert Points to Tokens — happy path** | Member A has ≥ 1000 VGC Points; P_net > 0; r_published ≥ 0.00011 | 1. PTS → Convert tab. 2. Direction: Points → Tokens. 3. Amount: 1000 Points. 4. Get quote. 5. Confirm conversion. | Wallet debited 1000 Points. 2.5% tax (25 Points) goes to Admin Points Wallet. Remaining 975 Points converted at r_published rate. Tokens credited to member wallet. Transaction recorded in passbook with rate snapshot. | | |
| T-PTS-004 | **Convert Tokens to Points — happy path** | Member A has ≥ 10 VGC Tokens; conditions same as above | 1. PTS → Convert. 2. Direction: Tokens → Points. 3. Amount: 10 tokens. 4. Get quote. 5. Confirm. | Wallet debited 10 tokens. 2.5% tax (0.25 tokens) to Admin Token Wallet. 9.75 tokens converted at R_user rate. Points credited. Passbook entry with rate snapshot. | | |
| T-PTS-005 | **Insufficient balance blocks conversion** | Member A has 100 Points | 1. Try to convert 500 Points. | Error: insufficient balance. Conversion blocked. | | |
| T-PTS-006 | **P_net ≤ 0 suspends conversions** | *(Observe existing state or admin manipulates)* | 1. PTS dashboard. 2. If P_net ≤ 0, check conversion UI. | Convert button disabled. Message: "Conversion temporarily unavailable — insufficient Points in circulation." | | |
| T-PTS-007 | **Rate threshold disables conversion** | r_published < 0.00011 (rare; observe or simulate) | 1. PTS dashboard with low rate. | Rate displayed but conversion disabled. Same suspension message. | | |
| T-PTS-008 | **Rate snapshot in passbook** | T-PTS-003 or T-PTS-004 done | 1. PTS → History tab (or Points Passbook). | Conversion entry shows: amount given, tax, amount received, r_published at time of conversion, R_user at time. | | |
| T-PTS-009 | **t_idle shown on dashboard** | Logged in, no recent conversion | 1. PTS dashboard → check t_idle. | t_idle shows minutes since last platform-wide conversion. Value increases each visit if no conversion has occurred. | | |
| T-PTS-010 | **[ADMIN] Adjust theta** | Logged in as admin | 1. Admin → PTS → Theta Adjust. 2. Enter new θ value and reason. 3. Save. | θ updated. Change logged in admin audit trail with old value, new value, reason, timestamp. θ NOT shown on public dashboard. | | |
| T-PTS-011 | **[ADMIN] Update Reserve (R) and Hard Assets (A)** | Logged in as admin | 1. Admin → PTS → Reserve Assets. 2. Update R and A values. 3. Save. | Values updated. PTS rate recomputes reflecting new R/A. Components visible on public dashboard. | | |
| T-PTS-012 | **[ADMIN] PTS audit log** | Admin has made PTS adjustments | 1. Admin → PTS → Audit Log. | All θ adjustments, reserve updates, and bootstrap events listed with timestamp, old/new value, reason. | | |

---

## D. VGC Points Economy (SRS §5)

### Pre-conditions
Admin logged in for minting tests. Member A for transfer tests.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-PE-001 | **[ADMIN] Constitutional Provision award** | Admin logged in | 1. Admin → Points Awards → Select Member A → Constitutional Provision → Amount: 12000 → Reason: "Test award". 2. Confirm. | Member A receives 12,000 Points. Admin's Points Wallet credited +30% = +3,600 Points. Transaction recorded with provision type and reason. | | |
| T-PE-002 | **[ADMIN] Promotional Provision award — sufficient admin balance** | Admin Points Wallet has ≥ 25% of award | 1. Admin → Points Awards → Select Member A → Promotional Provision → Amount: 1000. 2. Confirm. | Member A receives 1,000 Points. Admin's Points Wallet debited -250 (25%). | | |
| T-PE-003 | **[ADMIN] Promotional Provision blocked — insufficient admin balance** | Admin Points Wallet balance < 25% of award | 1. Admin → Points Awards → Promotional Provision → Amount large enough to fail check. 2. Confirm. | Error: insufficient admin balance. Award blocked. Prompt to use Constitutional Provision instead. | | |
| T-PE-004 | **[ADMIN] Set monthly minting budget** | Logged in as admin | 1. Admin → Points Budget → Set budget for current month: 1,000,000 Points. | Budget set. Remaining budget shown in real time. | | |
| T-PE-005 | **Monthly budget enforcement — Promotional blocked at limit** | Budget set (T-PE-004); total Promotional awards near budget | 1. Award enough Promotional Points to exceed budget. 2. Try one more Promotional Provision. | Blocked: monthly budget exceeded. Only Constitutional Provision available. | | |
| T-PE-006 | **[ADMIN] Raise budget mid-month** | Budget set and partially used | 1. Admin → Points Budget → raise budget upward. | Budget increased. New remaining shown. | | |
| T-PE-007 | **Cannot lower budget mid-month** | Budget set and partially used | 1. Admin → Points Budget → try to set a lower value. | Error: downward revision not permitted mid-month. | | |
| T-PE-008 | **Activity reward — Like a blog** | Member A has a published blog; Member B exists | 1. Log in as Member B. 2. Navigate to Member A's blog. 3. Like it. | Member B receives 600 Points (Promotional Provision) automatically. Admin's Points Wallet debited accordingly. | | |
| T-PE-009 | **Activity Rewards catalog visible** | Logged in as any member | 1. Navigate to Activity Rewards / PTS page → Catalog tab. | Standard Activity Table (Appendix A) shown: all activities, provision types, point values. Version number and effective date visible. | | |
| T-PE-010 | **[ADMIN] Update activity catalog** | Logged in as admin | 1. Admin → Points → Catalog → Edit an activity point value. 2. Save. | Catalog version incremented. Changelog entry added. Old activities still earn old rates; new rate applies to future activities. | | |
| T-PE-011 | **Points transfer — send** [Note: DOC-3 — live backend uses escrow + 10-min window] | Member A has ≥ 100 Points; Member B exists | 1. Logged in as Member A. 2. Wallet → Points → Send. 3. Enter Member B's Member ID, amount = 100, remark = "Test transfer". 4. Submit. | Transfer initiated. Member A debited 100 Points. Member B receives a pending transfer (10-min accept window). Both notified. | | |
| T-PE-012 | **Points transfer — receiver accepts** | T-PE-011 done (within 10-min window) | 1. Log in as Member B. 2. Wallet → Points → Pending. 3. Accept the transfer. | Member B credited 100 Points. Transfer marked complete. Passbook shows sent/received entries. | | |
| T-PE-013 | **Points transfer — receiver cancels** | New pending transfer exists | 1. Log in as Member B. 2. Pending → Cancel the transfer. | Transfer cancelled. Points returned to Member A. | | |
| T-PE-014 | **Points passbook entries** | T-PE-012 done | 1. Wallet → Points Passbook. | All entries shown: activity rewards, admin awards, received transfer, sent transfer — each with correct debit/credit, counterparty, remark, date. | | |

---

## E. VGC Marketplace (SRS §6)

### Pre-conditions
At least one marketplace item must exist. Use Admin to list a test item if none exist.
Member A has ≥ enough tokens to purchase.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-MP-001 | **Browse marketplace** | Logged in as any member | 1. Go to Explore tab. | Items listed. Category chips visible. Search bar present. | | |
| T-MP-002 | **Category tree navigation** | Items exist in categories | 1. Tap a category chip (e.g. Gaming). | Items filtered to that category. Sub-categories shown if available (up to 8 levels per §6.2). | | |
| T-MP-003 | **Item detail page** | Item exists | 1. Tap any item. | Item detail page shows: name, description, price (in tokens), proposing member, revenue split, buyer information fields, quantity available. | | |
| T-MP-004 | **Add to cart** | Logged in as Member A; item exists | 1. Item detail → Add to Cart. | Item added to cart. Cart icon shows count = 1. | | |
| T-MP-005 | **Cart — same-vendor constraint** | Member A has item from Vendor X in cart | 1. Try to add item from a different vendor/proposing member to cart. | Prompt: "Your cart contains items from [Name]. Start a new cart for this item?" Separate cart created on accept. | | |
| T-MP-006 | **Cart — checkout and purchase** | Items in cart; Member A has sufficient tokens | 1. Cart → Review cart. 2. Fill buyer info fields. 3. Confirm checkout. | Tokens atomically debited from Member A's wallet. For member-proposed items: tokens go to Marketplace Escrow. Order(s) created. Admin and proposing member notified. | | |
| T-MP-007 | **Insufficient balance blocks checkout** | Items in cart; Member A has fewer tokens than cart total | 1. Cart → Confirm checkout. | Order rejected. Error: insufficient balance. Member's updated balance shown. | | |
| T-MP-008 | **Buy Now (single item purchase)** | Logged in as Member A; item exists | 1. Item detail → Buy Now. 2. Fill buyer info. 3. Confirm. | Same as T-MP-006 for a single item. | | |
| T-MP-009 | **Order list — buyer view** | T-MP-006 done | 1. Marketplace → My Orders. | Order(s) listed with status (pending_pod). Order ID, item, date, token amount visible. | | |
| T-MP-010 | **[ADMIN/VENDOR] Submit Proof of Delivery** | Order in pending_pod status | 1. Log in as proposing member (or admin). 2. My Sales → Order → Submit Proof of Delivery. 3. Upload proof. | POD submitted. Dispute window opens (7 days). Buyer notified. Order status → pod_submitted. | | |
| T-MP-011 | **Buyer marks order received — triggers settlement** | POD submitted (T-MP-010 done) | 1. Log in as Member A (buyer). 2. My Orders → Order → Mark Received. | Order status → settled. Tokens released from escrow per revenue split. Proposing member credited their %. Admin credited their %. Both notified. | | |
| T-MP-012 | **Buyer raises dispute within 7 days** | POD submitted; within 7-day window | 1. My Orders → Order → Dispute. 2. Enter reason. | Dispute raised. Admin notified. Order status → disputed. | | |
| T-MP-013 | **[ADMIN] Resolve dispute** | T-MP-012 done | 1. Admin → Marketplace → Orders → Disputed. 2. Choose resolution: full refund / partial / vendor favour. | Tokens distributed per resolution. Both buyer and proposing member notified. Order closed. | | |
| T-MP-014 | **Auto-settlement (7 days after POD, no dispute)** | Order in pod_submitted > 7 days | 1. Wait (or simulate by checking the order after 7 days). 2. Load the order detail page (lazy evaluation). | Order auto-settles on read. Tokens split per revenue share. Status → settled. | | |
| T-MP-015 | **Buyer cancels order (pre-POD)** | Order in pending_pod | 1. My Orders → Order → Cancel. | Order cancelled. Tokens refunded to buyer. Proposing member notified. | | |
| T-MP-016 | **[ADMIN] List new marketplace item** | Logged in as admin | 1. Admin → Marketplace → Items → New Item. 2. Fill: name, description, sector, category, type, price (10 tokens), stock (5), revenue split (100% admin). 3. Save. | Item listed as Active. Visible on marketplace. | | |
| T-MP-017 | **Member proposes marketplace item** | Logged in as Member A | 1. Marketplace → Propose Item. 2. Fill proposal fields: name, description, price, buyer info fields. 3. Submit. | Proposal submitted. Admin notified. Status: pending admin decision. | | |
| T-MP-018 | **[ADMIN] Approve proposal → creates listing** | T-MP-017 done | 1. Admin → Proposals → find Member A's proposal. 2. Accept. 3. Set revenue split (e.g. 90% member / 10% admin). | Item listed on marketplace with revenue split. Member A notified. | | |
| T-MP-019 | **[ADMIN] Reject proposal** | A proposal exists | 1. Admin → Proposals → Reject. 2. Enter reason. | Proposal rejected. Member notified. No item listed. | | |
| T-MP-020 | **Stale cart item — removed on checkout** | Item in cart becomes Inactive before checkout | 1. Admin marks the item Inactive. 2. Member A goes to checkout. | Stale item removed from cart automatically. Member notified. Cart total recalculated. | | |
| T-MP-021 | **No proof in 30 days → auto-refund** | Order in pending_pod > 30 days | 1. Load order (lazy evaluation). | Order auto-refunded. Status → cancelled. Buyer's tokens returned. Admin notified. | | |
| T-MP-022 | **[ADMIN] Manage categories** | Logged in as admin | 1. Admin → Marketplace → Categories. 2. Create a new category (Level 1). 3. Create sub-category under it (Level 2). | Category tree updated. Items can be assigned to new categories. | | |

---

## F. Groups (SRS §7)

### Pre-conditions
Member A (creator), Member B (joiner). Both accounts exist.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-GR-001 | **Create a public group** | Logged in as Member A | 1. Community → Groups → Create Group. 2. Fill: name = "Test Public Group", sector = General, type = Public. 3. Create. | Group created. Member A auto-assigned as Group Admin. Group visible to all logged-in members. | | |
| T-GR-002 | **Join a public group** | T-GR-001 done; logged in as Member B | 1. Find "Test Public Group". 2. Click Join. | Member B directly added (no approval needed). Group member count incremented. | | |
| T-GR-003 | **Create a post** | Member B joined T-GR-001 | 1. Open the group. 2. Create a new post (text: "Hello group!"). | Post visible to all group members. Author name shown. Member A (Group Admin) notified. | | |
| T-GR-004 | **Comment on a post** | T-GR-003 done | 1. Member A comments on Member B's post. | Comment appears. Post author (Member B) notified. | | |
| T-GR-005 | **React to a post** | T-GR-003 done | 1. Any member reacts to the post. | Reaction count updated. | | |
| T-GR-006 | **Create a private group** | Logged in as Member A | 1. Create Group → type = Private. | Group created. Visible in list (name/description shown to all) but posts hidden from non-members. | | |
| T-GR-007 | **Private group — join request flow** | T-GR-006 done; Member B not a member | 1. Member B → finds private group → Send Join Request. 2. Member A → Group → Approve request. | Member B added after approval. If rejected: Member B not added. | | |
| T-GR-008 | **Invite to private group** | T-GR-006 done; Member A is Group Admin | 1. Member A → Group → Invite → enter Member B's ID. | Invite notification sent to Member B. Member B accepts → becomes member. | | |
| T-GR-009 | **Promote Co-Admin** | Member B is group member | 1. Member A → Group → Members → Member B → Promote Co-Admin. | Member B becomes Co-Admin. Permissions: approve requests, invite, remove posts/members. Cannot delete or transfer admin. | | |
| T-GR-010 | **Remove a member** | Member B is group member | 1. Member A → Group → Members → Member B → Remove. | Member B removed immediately. Cannot rejoin on their own. Member B notified. | | |
| T-GR-011 | **Admin cannot leave without transferring** | Member A is only admin | 1. Try to leave the group as Member A. | Error: must transfer admin first. | | |
| T-GR-012 | **Transfer admin status** | Member B is group member | 1. Member A → Group → Transfer Admin → Member B. | Member B becomes Group Admin. Member A becomes regular member. Both notified. | | |
| T-GR-013 | **Delete group — 24-hour hold** | Member A is Group Admin; group has > 1 member | 1. Member A → Group → Delete. | 24-hour hold applied. All members notified (group deletes in 24 hours). After 24 hours, group and all posts removed. | | |
| T-GR-014 | **Delete group immediately — sole member** | Member A is Group Admin and only member | 1. Delete group. | Group deleted immediately (no 24-hour hold). | | |
| T-GR-015 | **[ADMIN] Moderate group — remove post** | Any group post exists | 1. Admin → Groups → find post → Remove. | Post removed. Recorded in audit log. | | |
| T-GR-016 | **Private group posts hidden from non-members** | T-GR-006 done; Member B NOT a member | 1. Member B views the private group page. | Group name/description visible. Posts NOT visible to Member B. | | |

---

## G. Blog (SRS §8)

### Pre-conditions
Member A logged in.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-BL-001 | **Write and save a blog (Draft)** | Logged in as Member A | 1. Blog → New Blog. 2. Enter title, content, sector = General, tags. 3. Save (not submit). | Blog saved as Draft. Only Member A can see it. | | |
| T-BL-002 | **Submit blog for review** | T-BL-001 done | 1. My Blogs → Blog → Submit for Review. | Status changes to In Review. Admin notified. Blog still private. | | |
| T-BL-003 | **[ADMIN] Approve blog** | T-BL-002 done | 1. Admin → Blog → find blog → Approve. 2. Set Constitutional Provision points: 6000. 3. Confirm. | Blog status → Published. Member A receives 6,000 Points (constitutional provision). Blog visible to all members. | | |
| T-BL-004 | **[ADMIN] Reject blog** | Another blog in review | 1. Admin → Blog → find blog → Reject. 2. Set points: 0. 3. Add reason. | Blog status → Rejected. Member A receives 0 Points. Member A can edit and resubmit. | | |
| T-BL-005 | **Resubmit after rejection** | T-BL-004 done | 1. My Blogs → rejected blog → Edit → resubmit. | Blog returns to In Review. Admin notified again. | | |
| T-BL-006 | **Like a blog (activity reward)** | T-BL-003 done; logged in as Member B | 1. Member B finds Member A's blog. 2. Click Like. | Member B receives 600 Points (Promotional). Admin's Points Wallet debited 25% (150 Points). Like count incremented. | | |
| T-BL-007 | **Comment on a blog** | T-BL-003 done | 1. Member B → blog → add comment. | Comment visible. Member A (author) notified. | | |
| T-BL-008 | **Author disables comments** | T-BL-003 done | 1. Member A → My Blogs → Toggle Comments Off. | Comment input hidden on blog. Existing comments remain. | | |
| T-BL-009 | **Blog deletion — never published, 0 points** | Draft blog with 0 points | 1. My Blogs → find draft → Delete. | Blog permanently deleted. | | |
| T-BL-010 | **Blog abandonment — published** | T-BL-003 done | 1. My Blogs → published blog → Abandon. 2. Choose: No monetisation consent. | Blog status → Abandoned. Member A's ownership removed. Blog under Admin control. Monetisation NOT permitted without consent. | | |
| T-BL-011 | **Revenue Generator — propose ticket** | Blog is Published; Member A is author | 1. My Blogs → blog → Propose Revenue Generator Ticket. 2. Fill proposal fields. | Proposal submitted to Admin for review. | | |
| T-BL-012 | **[ADMIN] Approve RG ticket — blog goes paywalled** | T-BL-011 done | 1. Admin → Proposals → accept RG ticket. 2. Set revenue split (90/10). | Blog becomes Revenue Generator. Only ticket buyers can read it. Prior readers (who liked/commented) are grandfathered — retain access. | | |
| T-BL-013 | **Grandfathered reader access** | T-BL-012 done; Member B had liked the blog before conversion | 1. Log in as Member B (who liked before RG). 2. Navigate to blog. | Member B can still read the blog without purchasing ticket (grandfathered). | | |
| T-BL-014 | **[ADMIN] Take down a blog** | Any published blog | 1. Admin → Blog → Take Down. | Blog no longer visible to others. If RG blog: ticket closed, all buyers refunded in full. Author notified. | | |

---

## H. Loans (SRS §9)

### Pre-conditions
Member A logged in. Admin approves loans.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-LN-001 | **Submit loan request** | Logged in as Member A | 1. Loans → Request Loan. 2. Fill: amount = ₹1000, UPI = test@upi, return date = +30 days, purpose = "Test loan". 3. Submit. | Loan created with unique Loan ID. Status = Pending. Admin notified. | | |
| T-LN-002 | **[ADMIN] Reject loan** | Another loan request pending | 1. Admin → Loans → Reject. 2. Add reason. | Status = Rejected. Member notified. No INR transferred. No token debit. | | |
| T-LN-003 | **[ADMIN] Approve loan — Year 1 debit** | T-LN-001 done | 1. Admin → Loans → Approve. 2. Enter actual INR transferred = ₹1000. 3. Confirm. | Loan status = Active. System debits tokens from Member A: ₹1000 / ₹10 = 100 tokens. Wallet may go negative. Member's INR Receipt Ledger credited ₹1000. Member notified. | | |
| T-LN-004 | **Loan detail view** | T-LN-003 done | 1. Loans → find Loan ID → Detail. | Shows: Loan ID, status, INR approved, approval date, outstanding balance (tokens), annual debit history, repayment history, planned return date. | | |
| T-LN-005 | **Member repays loan — partial** | T-LN-003 done; Member A has tokens | 1. Loans → Loan ID → Repay. 2. Amount = 20 tokens. | 20 tokens debited from Member A. Credited to Admin Token Wallet. Outstanding balance reduced to 80 tokens. Both notified. | | |
| T-LN-006 | **Member repays loan — full settlement** | Outstanding = 20 tokens; Member A has ≥ 20 | 1. Repay remaining 20 tokens. | Outstanding = 0. Status = Settled. Member and Admin notified. | | |
| T-LN-007 | **Negative balance — new token purchase offsets debt** | Member A has negative token balance (e.g. -50) | 1. Submit declaration for 100 tokens (₹1000). 2. Admin verifies. | Purchased 100 tokens. First 50 tokens clear the debt (shown as offset in ledger). Remaining 50 tokens credited as spendable balance. | | |
| T-LN-008 | **[ADMIN] Write off loan** | Active loan with outstanding balance | 1. Admin → Loans → Write Off. 2. Enter reason. | Outstanding balance set to zero. Status = Written Off. Member notified. No further annual debits. | | |
| T-LN-009 | **Consolidated debit schedule (multiple loans)** | Member A has 2+ active loans | 1. Loans dashboard. | Consolidated Annual Debit Schedule shows all loans, next debit dates, estimated amounts, listed in Loan ID order. | | |
| T-LN-010 | **Negative balance restriction** | Member A has negative VGC Token balance | 1. Member A tries to: (a) create marketplace listing, (b) open new contract as Giver, (c) accept new contract as Taker, (d) transfer VGC Points. | All four actions blocked with appropriate error. Restrictions lift when balance returns to ≥ 0. | | |

---

## I. Expense Tracker (SRS §10)

### Pre-conditions
Member A logged in for personal expenses. Admin logged in for Platform Outflow.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-ET-001 | **Log personal expense** | Logged in as Member A | 1. Expenses → Add Expense. 2. Date = today, amount = ₹500, mode = UPI → Google Pay, main category = Food & Dining → Groceries, remark = "Supermarket". 3. Save. | Expense entry created. Status = Pending. Only Member A can see it (private). No wallet affected. | | |
| T-ET-002 | **Expense dashboard** | T-ET-001 done | 1. Expenses → Dashboard. | Total expenses, pending vs settled breakdown, by-category chart, by-payment-mode breakdown all visible. | | |
| T-ET-003 | **Filter and search expenses** | Multiple expenses logged | 1. Filter by date range, category, payment mode. 2. Search by remark text. | Only matching entries shown. | | |
| T-ET-004 | **Settle an expense — confirmation dialog** | T-ET-001 done | 1. Expenses → find entry → Settle. 2. Confirm dialog: "Once marked Settled, this entry cannot be edited or deleted. Confirm?" 3. Confirm. | Entry permanently locked. Status = Settled. No edit or delete option available. | | |
| T-ET-005 | **Cannot edit/delete settled expense** | T-ET-004 done | 1. Find settled expense. 2. Try to edit or delete. | Edit and delete options unavailable/disabled. | | |
| T-ET-006 | **[ADMIN] Log Platform Outflow** | Logged in as admin | 1. Admin → Expense Tracker → Add Expense. 2. Entry Type = Platform Outflow. 3. Amount = ₹5000, category = Financial & Insurance → Loan EMI, remark = "Loan disbursement to Member A". 4. Remark Visibility = Public. 5. Save. | Platform Outflow entry created. Admin INR Receipt Ledger debited ₹5000. Entry visible on public Platform Financial Ledger page. | | |
| T-ET-007 | **[ADMIN] Platform Outflow — Private remark** | Logged in as admin | 1. Add Platform Outflow with Remark Visibility = Private. | Date, amount, category visible publicly. Remark field hidden from public view (only visible in Admin interface). | | |
| T-ET-008 | **Platform Financial Ledger — public visibility** | T-ET-006 done | 1. Log in as Member B. 2. Navigate to Platform Financial Ledger page. | All Admin Platform Outflow entries visible (read-only). Private remarks hidden. Personal member expenses NOT visible. | | |
| T-ET-009 | **Entry Type dropdown — admin only** | Logged in as regular member | 1. Add Expense form. | Entry Type dropdown (Personal / Platform Outflow) is NOT visible. All member expenses default to Personal. | | |
| T-ET-010 | **[ADMIN] View all members' expense summaries** | Logged in as admin | 1. Admin → Expense Tracker → view any member's expenses. | Admin can see all members' expense entries (members' personal expenses are accessible to admin for oversight). | | |

---

## J. Gaming Sector (SRS §11)

### Pre-conditions
Admin account ready. At least one game must exist or be created in this module.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-GM-001 | **Browse Community Games** | Logged in as any member | 1. Community tab → Games list. | All listed community games shown with logo and name. | | |
| T-GM-002 | **Game detail page** | At least 1 game exists | 1. Tap a game. | Shows: logo, name, genre, preface, link to seasons, link to election, list of associated members. | | |
| T-GM-003 | **Join a game group** | Game exists; Member A not yet a member | 1. Game detail → join/create group. 2. Join existing group. | Member A added to game group. Group member count incremented. | | |
| T-GM-004 | **Pioneer Candidacy — purchase item** | Pioneer Candidacy marketplace item exists (Admin must create); Member A has ≥ 50 tokens | 1. Marketplace → find "New Game Proposal Candidacy" item. 2. Purchase (50 tokens). | Purchase confirmed. Member A can now access the three-set submission form. 50 tokens non-refundable. | | |
| T-GM-005 | **Submit Pioneer Candidacy — 3 sets** | T-GM-004 done | 1. Pioneer Candidacy form → submit Set 1 (Game Setup), Set 2 (Season Details), Set 3 (Marketplace Item Proposal). | All three sets submitted. Submission locked (no further edits allowed per §11.4). Admin notified. | | |
| T-GM-006 | **No editing after submission** | T-GM-005 done | 1. Try to edit any submitted field. | Edit blocked. Error: no modifications permitted after submission. | | |
| T-GM-007 | **[ADMIN] Approve pioneer proposal** | T-GM-005 done | 1. Admin → Gaming → Proposals → Approve. 2. Send letter of invitation to pioneer. | Game listed as Community Game. Season and events set up. Pioneer receives invitation. | | |
| T-GM-008 | **[ADMIN] Create a game** | Logged in as admin | 1. Admin → Gaming → Create Game. 2. Fill name, genre, logo, preface. | Game added to community games list. | | |
| T-GM-009 | **Season page elements** | Active season exists | 1. Game → Seasons → active season. | Shows: season name, image, pioneer preface, points budget, funding model, events list, committee members. | | |
| T-GM-010 | **Event page and submission** | Active season with an open event | 1. Season → Event → fill participant submission form. 2. Submit entry. | Entry recorded. Pioneer/admin notified. | | |
| T-GM-011 | **[ADMIN] Post event results** | Event has submissions | 1. Admin → Gaming → Event → Post Results. 2. Award Points to each top performer. | Results visible on event page. Winners credited VGC Points. | | |
| T-GM-012 | **Election candidacy registration** | Election Candidacy item exists; voting_open status; Member B has ≥ 10 tokens | 1. Marketplace → purchase Election Candidacy (10 tokens). 2. Submit Set 2 + Set 3. | Candidacy registered. Admin reviews and publishes candidacy. | | |
| T-GM-013 | **[ADMIN] Publish candidate list** | T-GM-012 done | 1. Admin → Elections → Publish candidates. | Candidate list visible on election page: name, season preface, events summary, funding type. | | |
| T-GM-014 | **Vote in election — requires voting rights ticket** | Election is live; member has NOT purchased voting rights ticket | 1. Try to vote directly. | Error: voting rights ticket required. Redirect to purchase the ticket. | | |
| T-GM-015 | **Vote after purchasing voting rights** | Member A purchased voting rights ticket | 1. Election page → cast vote for a candidate. | Vote recorded. Cannot vote again (1 per member). | | |
| T-GM-016 | **[ADMIN] Close election — winner declared** | Voting period ended | 1. Admin → Elections → Close. | Winner = candidate with most votes. If tie: Admin casts deciding vote (logged publicly with rationale). Deposit returned to candidates with ≥ 3 votes. Forfeited for < 3 votes. | | |
| T-GM-017 | **Pioneer Distribution Record** | Active season; Pioneer logged in | 1. Season → Distribution Records → Add. 2. Fill: member, amount, event reference. | Record saved. Counts toward 80% distribution target. | | |
| T-GM-018 | **80% distribution target at season close** | Season closing; pioneer has Distribution Records | 1. Admin closes season. 2. Admin checks distribution rate. | If ≥ 80%: deposit returned + 26% reward (Pioneer 10%, Manager 8%, Treasurer 8%). If < 80%: deposit returned only, no reward. | | |

---

## K. Education Sector (SRS §12)

### Pre-conditions
A course ticket marketplace item must exist (Teacher proposes; Admin lists). Member A = Teacher, Member B = Student.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-ED-001 | **Teacher proposes course ticket** | Logged in as Member A | 1. Marketplace → Propose Item (Education type). 2. Fill: course name, description, price (5 tokens), seats (10), session dates (future), buyer info fields. 3. Submit. | Proposal submitted. Admin notified. | | |
| T-ED-002 | **[ADMIN] List course ticket** | T-ED-001 done | 1. Admin → Education → Proposals → Approve. 2. Set revenue split: 90% teacher / 10% admin. | Course ticket listed on marketplace. Teacher notified. | | |
| T-ED-003 | **Student purchases course ticket** | T-ED-002 done; Member B has ≥ 5 tokens | 1. Member B → Marketplace → find course → Purchase. | Tokens debited. Enrollment created (status = Purchased). QR token generated. Teacher and Admin notified. | | |
| T-ED-004 | **Student views QR code** | T-ED-003 done | 1. Member B → My Courses → session → view QR. | Unique encrypted QR code displayed on screen (for teacher to scan). | | |
| T-ED-005 | **Teacher starts session** | T-ED-002 done; session date is today | 1. Member A → Teacher Dashboard → My Tickets → Start Session. | Session status → Live. All enrolled students notified. | | |
| T-ED-006 | **QR scan — student checked in** | T-ED-005 done; Member B has QR visible | 1. Member A opens attendance scanner on Teacher Dashboard. 2. Scans Member B's QR code. | Scan validated (correct session, paid enrollment, no duplicate). Member B's enrollment → Checked-in. Member B appears in Checked-in list on dashboard. | | |
| T-ED-007 | **Teacher manually verifies student** | T-ED-006 done | 1. Teacher Dashboard → Checked-in list → Member B → Verify. | Member B's enrollment → Verified. Timestamp recorded. | | |
| T-ED-008 | **Duplicate scan blocked** | T-ED-006 done (QR already scanned) | 1. Try to scan Member B's QR again. | Scan rejected. Duplicate scan flagged in dashboard. | | |
| T-ED-009 | **Teacher ends session** | T-ED-006 done; some students verified | 1. Teacher Dashboard → End Session. | Session status → Completed. All Verified students notified (ratings unlocked). Teacher notified (ratings unlocked). | | |
| T-ED-010 | **Student rates teacher (post-session)** | T-ED-009 done | 1. Member B → Course → Rate Teacher. 2. Give 5 stars + testimony text. 3. Submit. | Rating submitted. Member B auto-credited 2,400 Points (Constitutional Provision). Rating visible on teacher's profile and course page. Teacher notified. | | |
| T-ED-011 | **Teacher rates student** | T-ED-009 done | 1. Teacher Dashboard → Student Ratings → rate Member B. 2. Give 4 stars. | Rating submitted. Teacher auto-credited 1,200 Points (Constitutional Provision). Rating visible on Member B's profile. Member B notified. | | |
| T-ED-012 | **Teacher requests payout (all sessions completed)** | All sessions under ticket are Completed | 1. Teacher Dashboard → Payout → Request Payout. | Payout request created. Admin notified. | | |
| T-ED-013 | **[ADMIN] Process payout** | T-ED-012 done | 1. Admin → Education → Payouts → find request → Process. | Teacher's VGC Token Wallet credited per agreed revenue split (90% of total sales). | | |
| T-ED-014 | **Session auto-hide past scheduled time** | Session's end time has passed; ticket not hidden yet | 1. Check marketplace listing for expired session ticket. | Single-session ticket automatically hidden from marketplace. Multi-session ticket hidden after last session's time. | | |
| T-ED-015 | **Session amendment — urgent (within 48h of session)** | Session starting in < 48 hours | 1. Teacher Dashboard → Propose Amendment (reschedule). | Amendment flagged as Urgent. Admin must process in 6 hours. If not processed in time, auto-approved. Ticket re-visible after approval if it was auto-hidden. | | |
| T-ED-016 | **Session auto-end (4h past scheduled end, still Live)** | Session is Live; 4 hours past scheduled end | 1. Wait or simulate. 2. Check session status on lazy read. | Session auto-marked Completed. Any students in Checked-in status auto-promoted to Verified. Teacher notified. | | |

---

## L. Financial Sector (SRS §13)

### Pre-conditions
Admin ready to verify declarations. Member A for investments/sponsorships.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-FS-001 | **Submit Donation declaration** | Logged in as Member A | 1. Wallet → Declare. 2. Payment Type = Donation, amount = ₹2000, mode = UPI. 3. Submit. | Declaration submitted. Admin notified. | | |
| T-FS-002 | **[ADMIN] Verify Donation → publishes donor** | T-FS-001 done | 1. Admin → Declarations → Verify. | Member A's INR Ledger NOT directly credited (donation). Admin INR Receipt Ledger credited: ₹1,600 (80% → I, ₹400 → R Reserve). Member A published on Donor Page with name and amount. | | |
| T-FS-003 | **Donor Page visible** | T-FS-002 done | 1. Navigate to Donor Page (Financial section). | Member A listed with name and donation amount. No anonymous option — all donors named. | | |
| T-FS-004 | **Submit Investment declaration — Option A** | Logged in as Member A | 1. Declarations → Declare. 2. Payment Type = Investment, additional details = "Option A". 3. Submit. | Declaration submitted. Admin notified. | | |
| T-FS-005 | **[ADMIN] Verify Investment — creates payout schedule** | T-FS-004 done | 1. Admin → Declarations → Verify Investment. 2. Set amount = ₹10,000, Option A. | Investment recorded. Payout schedule created: single payout at year-end = ₹11,000 (principal + 10%). 50% → I Ledger, 50% → R Reserve. L_invest begins accruing in PTS formula. | | |
| T-FS-006 | **Investment payout — Option A (mark paid)** | Investment active; due date reached | 1. Admin → Financial → Investments → Overdue → find investment. 2. Mark payout paid. | Investor's INR Receipt Ledger credited. Investment marked Settled. L_invest resets to 0 in PTS formula. | | |
| T-FS-007 | **Option B — quarterly payouts** | *(Requires time simulation or existing Option B investment)* | 1. Admin → Financial → Investments → Option B investment. 2. Mark Q1 interest paid. | Q1 interest credited. Investment remains Active. L_invest continues (does not reduce after partial payout per §4.7). | | |
| T-FS-008 | **Overdue investment count — public transparency** | At least 1 investment is overdue (past due date) | 1. Navigate to public transparency/financial page (any logged-in member). | Count of overdue investments shown (not amounts or names). | | |
| T-FS-009 | **Submit Overdue Payout Request** | Investment payout overdue > 30 days | 1. My Investments → overdue investment → Submit Overdue Request. | Request submitted. Admin must respond within 7 days. | | |
| T-FS-010 | **Submit Sponsorship** | Logged in as Member A | 1. Financial → Create Sponsorship. 2. Amount = ₹5000, conditions = "Test conditions", UPI = test@upi. 3. Submit. | Sponsorship declaration submitted. Admin reviews. | | |
| T-FS-011 | **[ADMIN] Document sponsorship progress** | T-FS-010 verified | 1. Admin → Financial → Sponsorships → progress = 100%. | Sponsorship marked complete. Sponsor listed on Sponsor Page with deal details. Recognition awarded (badge if member, listing, announcement). | | |
| T-FS-012 | **Sponsorship partial refund** | Sponsorship partially fulfilled | 1. Admin → Sponsorship → document partial conditions met. 2. Calculate refund. 3. Share with sponsor. 4. Process refund. | Refund = amount × (1 − proportion met). Sponsor may dispute within 7 days. Admin decision final. | | |
| T-FS-013 | **Sponsor dispute within 7 days** | T-FS-012 done; within 7 days of documentation | 1. Sponsor submits dispute (as member or by email if non-member). | Dispute recorded. Admin reviews. Admin decision binding. | | |
| T-FS-014 | **Donor page — Grant (reason private)** | Grant declaration verified | 1. Navigate to Donor Page. | Grant giver listed with name and amount. Reason/cause NOT shown on public page (private between giver and Admin). | | |

---

## M. Contracts (SRS §14)

### Pre-conditions
Member A = Giver, Member B = Taker. Both have VGC Points.

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-CT-001 | **Create VGC Administrated contract** | Member A has ≥ 1050 Points (105% of budget) | 1. Contracts → Create. 2. Type = VGC Administrated, budget = 1000 Points, title, requirements, application deadline = tomorrow, objectively verifiable conditions. 3. Submit. | System checks Member A has ≥ 1050 Points (1000 escrow + 50 listing fee). 1050 Points deducted immediately and held by Admin. Contract listed. | | |
| T-CT-002 | **Create Non-VGC Administrated contract** | Member A logged in | 1. Contracts → Create. 2. Type = Non-VGC, budget = 500 Points. 3. Submit. | Contract listed. No token deduction. No listing fee. | | |
| T-CT-003 | **Apply for a contract** | T-CT-001 or T-CT-002 done; Member B logged in | 1. Find the contract. 2. Apply → "I should be selected because…" | Application submitted. Giver (Member A) notified. | | |
| T-CT-004 | **Assign contract to Taker** | T-CT-003 done | 1. Member A → My Contracts → Applicants → Assign to Member B. | Member B becomes Taker. Status = Active. Member B notified of assignment. Other applicants notified of rejection. Listing removed from public view. | | |
| T-CT-005 | **Taker cap — max 2 active** | Member B has 2 active contracts as Taker | 1. Member B applies to a 3rd contract and gets assigned. | Assignment blocked. Error: maximum 2 active contracts as Taker. | | |
| T-CT-006 | **Giver cap — max 10 VGC Administrated** | Member A has 10 listed/active VGC Administrated contracts | 1. Member A tries to create an 11th VGC Administrated contract. | Error: max 10 VGC Administrated contracts as Giver. | | |
| T-CT-007 | **Taker marks contract complete** | T-CT-004 done | 1. Member B → My Contracts → Active → Mark Complete. | Giver (Member A) notified. 7-day window starts for Giver to release or dispute. | | |
| T-CT-008 | **VGC Administrated — Giver releases payment** | T-CT-007 done | 1. Member A → Contract → Release Payment. | 95% of escrow (950 Points) credited to Member B. 5% (50 Points) retained by Admin. Status = Completed. Both rate each other. | | |
| T-CT-009 | **VGC Administrated — Giver disputes** | T-CT-007 done (within 7-day window) | 1. Member A → Contract → Dispute. | Admin evaluates. If conditions met → 95% to Taker. If not met → budget returned to Giver minus 5% listing fee. | | |
| T-CT-010 | **Taker escalates after 7-day inaction** | T-CT-007 done; 7+ calendar days elapsed; Giver hasn't acted | 1. Member B → Contract → Escalate to Admin. | Admin reviews. Decides at sole discretion. | | |
| T-CT-011 | **Giver cancels before Taker assigned (VGC Administrated)** | T-CT-001 done; no Taker yet | 1. Member A → Contract → Cancel. | Escrowed budget (1000 Points) returned. 5% listing fee (50 Points) non-refundable. | | |
| T-CT-012 | **Giver cancels after Taker assigned** | T-CT-004 done | 1. Member A → Contract → Cancel. | Member B receives 95% (950 Points). Admin retains both 5% listing fee + 5% completion fee. Total cost to Member A = 105% of budget (1050 Points already deducted). | | |
| T-CT-013 | **Application deadline auto-deactivates listing** | Contract with application deadline set to past; no Taker | 1. Load the contract (lazy evaluation). | Contract auto-deactivates. If VGC Administrated: escrowed budget returned, 5% listing fee non-refundable. If no Taker was ever assigned: no rating generated. Giver notified. | | |
| T-CT-014 | **Force-close request (60 days past completion date)** | Contract 60+ days past Requested Completion Date | 1. Either party → Request Force-Close from Admin. | Admin reviews, decides at sole discretion: full to Taker, full to Giver, or proportional split. 5% listing fee always non-refundable. Both may rate after. | | |
| T-CT-015 | **Non-VGC — penalty cascade on dispute** | Non-VGC contract; dispute raised; bad faith proven | 1. Admin → Contract → Resolve Dispute → Giver false play. | Giver's Points debited 150% of budget. If insufficient, remaining from Token wallet at PTS rate (no tax). If still insufficient, balance goes negative. Taker receives amount recovered. Admin retains no spread. | | |
| T-CT-016 | **Contract ratings and reviews** | Contract completed (T-CT-008 done) | 1. Both Member A and Member B submit ratings. 2. View each other's profiles. | Ratings (1–5 stars + written review) visible on each member's public profile. | | |
| T-CT-017 | **Edit contract details (pre-Taker)** | T-CT-001 done; no Taker yet | 1. Member A → Contract → Edit. 2. Change title, requirements, deadline. 3. Try to change budget or contract type. | Allowed: title, requirements, application deadline, requested completion date, sector tag, notes. Blocked: budget, contract type. | | |
| T-CT-018 | **[ADMIN] Reject listing with non-verifiable conditions** | VGC Administrated contract with subjective conditions submitted | 1. Admin reviews contract. 2. Reject listing → conditions not verifiable. | Contract not listed. Giver notified. Escrowed funds returned. | | |

---

## N. Admin Panel (SRS §15)

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-AP-001 | **Admin login with 2FA** | Admin account exists | 1. `/admin/login`. 2. Email + password → step 2 → OTP from email. | Admin dashboard accessible. Login event logged (success, device fingerprint, IP). | | |
| T-AP-002 | **Failed login lockout** | Admin login screen | 1. Enter wrong password 3 times. | Account locked for 30 minutes. Lockout logged. | | |
| T-AP-003 | **Admin Audit Log** | Admin has performed actions | 1. Admin → Audit Log. | All admin actions listed (wallet credits, verifications, contract resolutions, θ adjustments, write-offs, blog approvals, rate changes, election votes). Filterable by date, action type, affected member. | | |
| T-AP-004 | **Member management — view member** | Admin logged in | 1. Admin → Members → search for Member A. | Member A's full profile, wallet balances, transaction history visible to admin. | | |
| T-AP-005 | **[ADMIN] Impersonate member** | Admin logged in | 1. Admin → Members → Member A → Impersonate. | Admin receives a Member A auth token (24h TTL). Can act as Member A. Action logged in audit trail. | | |
| T-AP-006 | **Admin wallet — award points** | Admin logged in | 1. Admin → Wallet Tools → Award Points to Member A → Constitutional Provision → 5000 Points. | Member A receives 5000 Points. Admin's Points Wallet credited +1500 (30%). Logged in audit trail. | | |
| T-AP-007 | **Backup Admin designation** | Admin logged in | 1. Admin → System Config → Designate Backup Admin → enter backup admin Member ID. | Backup admin stored. System monitors primary admin's last login time. | | |
| T-AP-008 | **Vacation Mode** | Admin logged in | 1. Admin → Vacation Mode → set end date. | Vacation mode active. 72-hour inactivity counter paused. Backup Admin notified admin is deliberately away. | | |
| T-AP-009 | **Admin reports — financial summary** | Admin logged in | 1. Admin → Reports → Financial Summary. 2. Set date range. | Report shows: INR ledger aggregation by currency/side, declaration counts. | | |
| T-AP-010 | **Admin reports — marketplace** | Admin logged in | 1. Admin → Reports → Marketplace. | GMV in tokens, order counts, dispute rate. | | |
| T-AP-011 | **Admin reports — gaming** | Admin logged in | 1. Admin → Reports → Gaming. | Season-scoped: submissions, results, points awarded, tokens deposited. | | |
| T-AP-012 | **Admin reports — education** | Admin logged in | 1. Admin → Reports → Education. | Chapters verified, tickets sold/payout, student submissions/reviews. | | |
| T-AP-013 | **Admin reports — wallet balances** | Admin logged in | 1. Admin → Reports → Wallet Balances. 2. Filter by currency. | Top N members by balance listed. | | |
| T-AP-014 | **Admin system config** | Admin logged in | 1. Admin → Config → view/edit system config. | JSON config editable: INR/token rates, backup admin, vacation mode, etc. | | |
| T-AP-015 | **2FA recovery codes** | Admin logged in | 1. Admin → 2FA Setup → view recovery codes. | Recovery codes available for offline storage. Can be used to login if OTP email unavailable. | | |

---

## O. Notifications (SRS §16)

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-NF-001 | **Unread notification badge** | An action that triggers notification occurred (e.g. points transfer received) | 1. Check bell icon in top bar. | Badge shows unread count (up to 99+). | | |
| T-NF-002 | **Notifications list — all and unread filter** | T-NF-001 done | 1. Tap bell → Notifications. 2. Toggle All / Unread. | Correct notifications shown. Unread highlighted. | | |
| T-NF-003 | **Mark single notification read** | Unread notification exists | 1. Tap an unread notification. | Notification marked read. Badge count decremented. | | |
| T-NF-004 | **Mark all read** | Multiple unread notifications | 1. Notifications → Read All. | All notifications marked read. Badge disappears. | | |
| T-NF-005 | **Notification preferences — toggle email** | Logged in as Member A | 1. Notifications → Settings (gear). 2. Toggle email off for Marketplace category. | Preference saved. Email notifications for Marketplace events suppressed. In-app still received. | | |
| T-NF-006 | **Critical notifications cannot be disabled** | Logged in as Member A | 1. Notifications → Settings. 2. Try to disable wallet debits or login alert notifications. | These categories are not toggleable. Fixed as always-on. | | |
| T-NF-007 | **Polling — new notification appears automatically** | Two browser tabs open as Member A | 1. In Tab 1, trigger an action that creates a notification. 2. Wait up to 60 seconds in Tab 2 (polling interval). | Notification appears in Tab 2 automatically without page refresh. | | |
| T-NF-008 | **Platform-wide notification — rate change** | Admin announces rate change | 1. Admin → Config → Announce Rate Change. | All members receive in-app + email notification about the rate change announcement. | | |

---

## P. Search (SRS §17)

| ID | Description | Pre-condition | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|
| T-SR-001 | **Global search — marketplace results** | Items exist with searchable text | 1. Search icon (top bar) → type "test". | Marketplace items matching "test" in name/description shown. | | |
| T-SR-002 | **Global search — groups results** | Public groups exist | 1. Search "group". | Matching public groups shown. Private groups shown (name/description only). Private group posts NOT shown. | | |
| T-SR-003 | **Global search — blog results** | Published blogs exist | 1. Search a word in a blog title. | Matching published blogs shown. Revenue Generator blogs only shown to ticket holders (visibility enforced). | | |
| T-SR-004 | **Sector filter on search** | Multiple sectors have content | 1. Search "test" → filter by Gaming sector. | Only Gaming-sector results shown. | | |
| T-SR-005 | **Search minimum characters** | On search screen | 1. Type 1 character. 2. Type 2 characters. | 1 character: no search fired (debounce, min 2 chars). 2 characters: search fires. | | |
| T-SR-006 | **RG blog hidden from non-purchaser in search** | Revenue Generator blog exists; Member B has not purchased ticket | 1. Member B searches for the RG blog's title. | Blog NOT shown in results (or shown as locked/unavailable). | | |

---

## End-of-Testing Checklist

When all modules are tested:

- [ ] All `Fail` entries have been logged in `TEST_REGISTER.md`
- [ ] All `Pass` entries confirmed in browser (not just API)
- [ ] TEST_REGISTER.md updated with status for each bug logged
- [ ] BG-7 workaround documented for any email-OTP tests that were skipped
- [ ] DOC-3 noted on all points transfer tests (escrow + 10-min window, not instant)
- [ ] Any SRS deviations flagged as `[SRS DEVIATION]` in TEST_REGISTER.md

---

## Appendix — Test Data Cheat Sheet

| Item | Value |
|---|---|
| App URL | https://frontend-kappa-mocha-30.vercel.app |
| Admin email | seekingj01+vgcadmin@gmail.com |
| Admin password | VgcAdmin#2026 |
| Admin Member ID | VGC37 |
| Admin OTP inbox | seekingj01@gmail.com (36-char UUID) |
| Test Member pattern | seekingj01+vgcNN@gmail.com (NN = 01, 02, 03...) |
| XANO instance | https://x8ki-letl-twmt.n7.xano.io |
| Buy rate | ₹10 / VGC Token |
| Surrender rate | ₹8.50 / VGC Token (2 tokens = ₹17) |
| PTS 2.5% tax | Applied to currency GIVEN in every conversion |
| Constitutional Provision | Member receives X points; Admin credited +30% |
| Promotional Provision | Member receives X points; Admin debited -25% |
| Points transfer window | 10 minutes (escrow — receiver must Accept) |
| Marketplace escrow split | Revenue sharing % agreed at listing; on settlement |
| VGC Administrated contract | 5% listing fee + 5% completion fee = 10% total |
| Taker active contract cap | 2 simultaneously |
| Giver VGC Administrated cap | 10 simultaneously listed/active |

---

*Generated 2026-06-10 · Covers SRS v2.2 §2–§17 + Appendix A · All 16 modules · ~130 test cases*
