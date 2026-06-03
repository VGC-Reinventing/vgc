# VGC Xano API Reference

## Setup Status

**Updated:** 2026-06-03 (393 documents, 257 endpoints, **100% of API_REQUIREMENTS.md rev 4 / SRS v2.2**)

> This document describes the **deployed state** as of 2026-06-03. All SRS v2.2 requirements (GAP-100 through GAP-142, including all rev-5 gaps) are implemented. Free-plan lazy-evaluation replaces all cron tasks (D9). Fresh pull confirmed 2026-06-03.

### Xano Installation
- **CLI:** `@xano/cli` v1.0.2 at `/opt/homebrew/bin/xano` · profile `vgc` (`~/.xano/credentials.yaml`)
- **Workspace:** 161992 · **Branch:** v1 · **Plan:** Free Instance (171)
- **Instance:** `x8ki-letl-twmt.n7.xano.io`
- **Local Workspace:** `/Users/boss/Desktop/VGC/XANO/` (393 documents, pulled 2026-06-03)
- **Auth Realm:** `839577`

### Quick Start
```bash
xano workspace pull -w 161992 -b v1 -d /Users/boss/Desktop/VGC/XANO
```

---

## Endpoint Configuration

**Base URL Pattern:** `https://x8ki-letl-twmt.n7.xano.io/api:<canonical>`

**Authentication:** Bearer token in `Authorization` header. Issued by `POST /login` or `POST /signup`. TTL: 86400s (24h).

**Response Format:** JSON

**Standard Errors:**
| Code | Meaning |
|---|---|
| 400 | Input validation error |
| 401 | Unauthorized / invalid token |
| 403 | Access denied |
| 404 | Not found |
| 500 | Server error |

---

## Summary

| # | Group | Canonical | Base URL | Endpoints |
|---|---|---|---|---|
| 1 | system | `KVaxK9ev` | `/api:KVaxK9ev` | 3 |
| 2 | Authentication | `L9PANOan` | `/api:L9PANOan` | 14 |
| 3 | User_Profile | `_CJw8MFH` | `/api:_CJw8MFH` | 6 |
| 4 | Wallets | `wallets` | `/api:wallets` | 3 |
| 5 | Points Transfer | `points-transfer` | `/api:points-transfer` | 6 |
| 6 | Token Surrenders | `token-surrender` | `/api:token-surrender` | 3 |
| 7 | INR Forms | `declarations` | `/api:declarations` | 6 |
| 8 | Point Token Scheme | `pts` | `/api:pts` | 5 |
| 9 | Activity Rewards | `activity-rewards` | `/api:activity-rewards` | 4 |
| 10 | Notifications | `dID-7x7G` | `/api:dID-7x7G` | 5 |
| 11 | Marketplace | `EiCwBjsO` | `/api:EiCwBjsO` | 18 |
| 12 | Cart | `O-OY5IE_` | `/api:O-OY5IE_` | 4 |
| 13 | Proposals | `proposals` | `/api:proposals` | 5 |
| 14 | Financial Donors | `fin-donor` | `/api:fin-donor` | 2 |
| 15 | Financial Investments | `fin-invest` | `/api:fin-invest` | 5 |
| 16 | Financial Sponsors | `fin-sponsor` | `/api:fin-sponsor` | 4 |
| 17 | Loans | `ZR6bC4we` | `/api:ZR6bC4we` | 3 |
| 18 | Expenses | `XcifSN8G` | `/api:XcifSN8G` | 4 |
| 19 | Contracts | `sXgmF9KL` | `/api:sXgmF9KL` | 13 |
| 20 | Gaming Community | `gaming-community` | `/api:gaming-community` | 6 |
| 21 | Gaming Elections | `gaming-elections` | `/api:gaming-elections` | 7 |
| 22 | Gaming Seasons | `gaming-seasons` | `/api:gaming-seasons` | 10 |
| 23 | Groups | `BiZZDMxu` | `/api:BiZZDMxu` | 17 |
| 24 | Blog | `blog` | `/api:blog` | 10 |
| 25 | Education | `education` | `/api:education` | 15 |
| 26 | Event Logs | `7KKtC-3r` | `/api:7KKtC-3r` | 1 |
| 27 | Admin | `EOOlx4pf` | `/api:EOOlx4pf` | 71 |
| 28 | Admin Reports | `admin-reports` | `/api:admin-reports` | 6 |
| 29 | Search | `search` | `/api:search` | 1 |

**Total:** 257 endpoints across 29 groups.

> **Retired groups (not deployed):** `edu-teachers` / `edu-sessions` (v1 Education model, replaced by `education` course-ticket model per GAP-140).

---

## system

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:KVaxK9ev`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/config` | public | Platform configuration (rates, limits, dispute window) |
| POST | `/files/upload` | user | Upload a file; returns `{url, access_url, path, name, type, size}` |
| DELETE | `/files/{id}` | user | Delete own file |

---

## Authentication

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:L9PANOan`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | public | Register (consent_given required; dob for <18 triggers guardian flow; device rate-limited 3/24h) |
| POST | `/login` | public | Login; returns authToken |
| POST | `/verify-email` | public | Verify email OTP |
| POST | `/verify-mobile` | user | Verify mobile OTP |
| POST | `/change-password` | user | Change password |
| GET | `/reset/request-reset-link` | public | Request password reset |
| POST | `/reset/magic-link-login` | public | Login via magic link |
| POST | `/reset/update_password` | user | Set new password post-reset |
| POST | `/resend-verification` | public | Resend email OTP (rate-limited 5/hr) |
| GET | `/me` | user | Current member profile |
| POST | `/message/send_welcome_email` | public | Internal: send welcome email |
| POST | `/guardian-registration` | public | Register minor with guardian email |
| GET | `/guardian-approvals/me` | user | Guardian: list pending approvals (lazy 7-day expiry) |
| POST | `/guardian-approvals/{id}/respond` | user | Guardian: approve (creates account) or reject |

---

## User_Profile

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:_CJw8MFH`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/profile` | user | Own profile |
| PATCH | `/profile` | user | Update display fields |
| GET | `/roles` | user | Member roles (is_admin, is_pioneer, etc.) |
| GET | `/lookup` | user | Lookup member by email/phone |
| POST | `/erasure-request` | user | DPDP §17 data erasure request |
| GET | `/erasure-request` | user | Check erasure request status |

---

## Wallets

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:wallets`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | user | All wallets for current member |
| GET | `/me/{currency}` | user | Single wallet by currency type |
| GET | `/me/activity` | user | Paginated wallet transaction history |

---

## Points Transfer

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:points-transfer`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/points-transfer` | user | Initiate transfer; sender debited to escrow; 10-min accept window (lazy-expired on read) |
| GET | `/pending` | user | Pending transfers for current member (lazy window expiry on read) |
| GET | `/passbook` | user | Transfer history |
| POST | `/{id}/accept` | user | Accept incoming transfer; credits receiver |
| POST | `/{id}/cancel` | user | Cancel outgoing transfer; returns escrow |
| POST | `/{id}/dispute` | user | Dispute a transfer |

---

## Token Surrenders

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:token-surrender`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/create` | user | Surrender tokens for INR |
| GET | `/list` | user | Own surrender history |
| GET | `/{id}` | user | Surrender detail |

---

## INR Forms

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:declarations`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/declarations` | user | Create declaration as draft (Donation/Grant/Sponsorship/Investment) |
| POST | `/declarations/public` | public | Public declaration (Donation/Grant/Sponsorship); contact_email required |
| GET | `/declarations/{id}` | user | View own declaration |
| DELETE | `/declarations/{id}` | user | Delete draft declaration |
| POST | `/{id}/submit` | user | Submit draft → pending |
| GET | `/list` | user | Own declarations list |

---

## Point Token Scheme (PTS)

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:pts`

Live formula (D11): `r_eq = (I + R + A − L_invest − 10·T_net) / P_net`, time-drift θ, floor 0.0001, conversion suspended when P_net ≤ 0 or r_published < 0.00011.

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/rate` | user | Computed rate (r_eq, r_published, r_user, conversion_suspended, p_net) — θ never exposed; member-only per §7.1 |
| POST | `/quote` | user | Quote conversion; returns receive_amount before fee |
| POST | `/convert` | user | Execute conversion (idempotency_key); resets time-idle counter |
| GET | `/history` | user | Own conversion history |
| PATCH | `/admin/pts/rate` | admin | Legacy rate override (deprecated by D11; kept for rollback) |

---

## Activity Rewards

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:activity-rewards`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/catalog` | public | Active activity catalog with version/effective_from |
| GET | `/changelog` | user | Catalog version history (paginated) |
| POST | `/activities` | user | Log activity; auto-awards points if catalog entry has auto_award=true and budget allows |
| GET | `/activities/me` | user | Own activity log |

---

## Notifications

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:dID-7x7G`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | user | List notifications (unread_only? filter, paginated) |
| POST | `/notifications/{id}/read` | user | Mark one notification read |
| POST | `/notifications/read-all` | user | Mark all unread read |
| GET | `/notifications/preferences` | user | Per-event preferences (defaults: in_app=true, email=true) |
| PATCH | `/notifications/preferences` | user | Update per-event preferences |

---

## Marketplace

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:EiCwBjsO`

Two-phase escrow (D5): buyer debited on order → POD → settle or dispute.

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/marketplace/categories` | public | Category list |
| GET | `/marketplace/categories/tree` | public | Nested category tree up to 8 levels (`max_depth?=8`, `root_id?`) |
| GET | `/marketplace/items` | user | Item listing (filters: category, search) |
| POST | `/marketplace/items` | admin | Create item (admin only; revenue_share, buyer_info_schema) |
| GET | `/marketplace/items/{id}` | user | Item detail |
| PATCH | `/marketplace/items/{id}` | admin | Update item |
| DELETE | `/marketplace/items/{id}` | admin | Remove item |
| POST | `/marketplace/orders` | user | Place order (buyer debited to escrow; idempotency_key) |
| GET | `/marketplace/orders` | user | Own orders |
| GET | `/marketplace/orders/{id}` | user | Order detail (lazy auto-settle on read if dispute window expired) |
| POST | `/marketplace/orders/{id}/proof-of-delivery` | user | Proposer submits POD; opens dispute window |
| POST | `/marketplace/orders/{id}/mark-received` | user | Buyer confirms receipt; immediate settle |
| POST | `/marketplace/orders/{id}/dispute` | user | Buyer disputes within window |
| POST | `/marketplace/orders/{id}/settle-request` | user | Proposer requests early settle |
| POST | `/marketplace/orders/{id}/cancel` | user | Cancel pre-POD; refunds buyer + restores stock |
| GET | `/marketplace/sales` | user | Proposer's sales history |
| GET | `/admin/orders` | admin | All orders (admin view) |
| PATCH | `/admin/orders/{id}/fulfill` | admin | Mark order fulfilled |

---

## Cart

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:O-OY5IE_`

Same-vendor constraint. Stale items excluded at checkout.

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/cart/items` | user | Add item (find-or-create cart per vendor; idempotent qty increment) |
| GET | `/cart` | user | All active carts with enriched items and line totals |
| DELETE | `/cart/items/{id}` | user | Remove cart item |
| POST | `/cart/checkout` | user | Atomic checkout (stale-item exclusion, balance check, escrow per valid item) |

---

## Proposals

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:proposals`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/proposals` | user | Submit proposal (ref_blog_id optional for RG ticket) |
| GET | `/proposals` | user | Own proposals |
| GET | `/proposals/{id}` | user | Proposal detail |
| PATCH | `/proposals/{id}` | user | Edit pending proposal |
| POST | `/proposals/{id}/withdraw` | user | Withdraw proposal |

---

## Financial Donors

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:fin-donor`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/donors` | public | Donor feed (anonymous → "Anonymous"; paginated with total_count) |
| GET | `/donors/{id}` | public | Named donor detail (404 if anonymous) |

---

## Financial Investments

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:fin-invest`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/investments` | user/public | Invest (Option A: 1×1.10 lumpsum at 365d; Option B: 4 quarterly Q1-Q3×0.02/Q4×1.02); unauthenticated requires investor_email |
| GET | `/investments/me` | user | Own investments with lazy Y2/Y3+ debit schedule |
| GET | `/investments/overdue-count` | public | Count of distinct investments with ≥1 overdue payout (lazy) |
| GET | `/investments/{id}` | user | Investment + payout schedule (owner or admin) |
| POST | `/investments/{id}/overdue-request` | user | File overdue-payout request (>30 days past due) |

---

## Financial Sponsors

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:fin-sponsor`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/sponsorships` | user/public | Create sponsorship + linked declaration; unauthenticated requires sponsor_email |
| GET | `/sponsorships` | public | Sponsorship feed |
| GET | `/sponsorships/{id}` | public | Detail with conditions_met_pct and recognition |
| POST | `/sponsorships/{id}/dispute` | public | Dispute (7-day window from documented_at; member or email-verified sponsor) |

---

## Loans

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:ZR6bC4we`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/loans/request` | user | Request loan (pending admin approval) |
| GET | `/loans/me` | user | Own loans with lazy Y2 consequence + Y3–Y7 debit schedule |
| POST | `/loans/{id}/repay` | user | Repay tokens (auto-settles when outstanding reaches 0) |

---

## Expenses

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:XcifSN8G`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/expenses` | user | Log expense (Personal or admin Platform_Outflow; Platform_Outflow debits Admin INR wallet) |
| GET | `/expenses/me` | user | Own expenses (filters + dashboard aggregates: totals, by_category, by_month) |
| POST | `/expenses/{id}/settle` | user | Permanently settle-lock an expense |
| GET | `/platform-financial-ledger` | user | Platform Outflow entries (admin-only Private remarks masked) |

---

## Contracts

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:sXgmF9KL`

VGC-Administrated: 105% escrow at listing. 95% to Taker + 5% retained on release. Giver cap ≤10. Non-VGC: direct transfer, Taker cap ≤2. Lazy listing auto-expire on read.

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/contracts` | user | Create contract listing |
| GET | `/contracts` | public | Browse contracts |
| GET | `/contracts/{id}` | public | Contract detail (lazy auto-expire + escrow refund on read if past deadline) |
| PATCH | `/contracts/{id}` | user | Edit pending contract |
| POST | `/contracts/{id}/apply` | user | Apply to contract (Taker) |
| POST | `/contracts/{id}/assign` | user | Assign application (Giver) |
| POST | `/contracts/{id}/mark-complete` | user | Taker marks work complete |
| POST | `/contracts/{id}/release` | user | Giver releases payment |
| POST | `/contracts/{id}/dispute` | user | Raise dispute |
| POST | `/contracts/{id}/escalate` | user | Escalate to admin |
| POST | `/contracts/{id}/cancel` | user | Cancel (refunds escrow if VGC) |
| POST | `/contracts/{id}/force-close-request` | user | Request admin force-close |
| POST | `/contracts/{id}/rate` | user | Rate counterparty |

---

## Gaming Community

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:gaming-community`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/games` | public | Game catalog |
| GET | `/games/{id}` | public | Game detail |
| POST | `/games/{id}/groups` | user | Create group for game (auto-joins creator) |
| GET | `/games/{id}/groups` | public | Groups for game |
| POST | `/groups/{id}/join` | user | Join group (idempotent) |
| POST | `/groups/{id}/leave` | user | Leave group (idempotent) |

---

## Gaming Elections

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:gaming-elections`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/pioneer-candidates` | user | Register as pioneer candidate |
| GET | `/pioneer-candidates` | public | List candidates |
| PATCH | `/pioneer-candidates/{id}` | user | Edit candidate profile (locked when voting open) |
| POST | `/elections` | admin | Create election (sets candidates in_election) |
| GET | `/elections/{id}` | public | Election detail with candidates + tallies (lazy close on read when window expires) |
| GET | `/elections/me/eligibility` | user | Check voting eligibility |
| POST | `/elections/{id}/vote` | user | Cast vote (voting-right guard, 1 per member) |

---

## Gaming Seasons

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:gaming-seasons`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/seasons` | public | Seasons list (lazy archive of past-end-date active seasons on read) |
| GET | `/seasons/{id}` | public | Season detail (lazy archive + re-fetch) |
| POST | `/seasons/{id}/committee` | user | Join committee (pioneer only, upsert) |
| GET | `/seasons/{id}/events` | public | Events for season |
| POST | `/events/{id}/submissions` | user | Submit event entry |
| GET | `/events/{id}/submissions` | user | View submissions (pioneer/admin) |
| POST | `/events/{id}/results` | user | Post results (credits points per entry, closes event) |
| POST | `/seasons/{id}/secure-funding/deposit` | user | Deposit 50% admin tokens + 50% points to pool |
| GET | `/seasons/{id}/ledger` | user | Season funding ledger |
| POST | `/seasons/{id}/distribution-records` | user | Pioneer logs a distribution record (counts toward 80% target at close-and-settle) |

---

## Search

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:search`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/search` | user | Cross-module search (inputs: `q`, `sector?`, `category?`, `limit?=20`). Returns `{marketplace:[], groups:[], blog:[]}`. Visibility-filtered: private groups excluded unless caller is member; RG blogs excluded unless caller has purchased or grandfathered access. |

---

## Groups

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:BiZZDMxu`

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/groups` | user | Create group |
| GET | `/groups` | user | List groups (public/private) |
| GET | `/groups/{id}` | user | Group detail (lazy 24h delete hold on read) |
| POST | `/groups/{id}/join` | user | Join group |
| POST | `/groups/{id}/leave` | user | Leave group |
| POST | `/groups/{id}/invite` | user | Invite member |
| POST | `/groups/{id}/invites/{inv_id}/respond` | user | Accept/reject invite |
| POST | `/groups/{id}/join-requests/{req_id}/decision` | user | Approve/reject join request |
| POST | `/groups/{id}/promote-coadmin` | user | Promote member to co-admin |
| POST | `/groups/{id}/transfer-admin` | user | Transfer admin role |
| POST | `/groups/{id}/remove-member` | user | Remove member |
| POST | `/groups/{id}/appeal-removal` | user | Appeal removal |
| POST | `/groups/{id}/delete` | user | Delete group |
| POST | `/groups/{id}/posts` | user | Create post |
| GET | `/groups/{id}/posts` | user | List posts (lazy 24h delete hold) |
| POST | `/posts/{id}/comments` | user | Comment on post |
| POST | `/posts/{id}/react` | user | React to post |

---

## Blog

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:blog`

Revenue Generator (RG) blogs gated by blog_readers entry or settled course_ticket order.

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/blog` | user | Create blog (draft) |
| GET | `/blog/public` | public | Published blogs feed (RG hidden for unauthenticated; filter: sector, tag, search) |
| GET | `/blog/me` | user | Own blogs (all statuses) |
| GET | `/blog/{id}` | user | Blog detail with like count + comments |
| PATCH | `/blog/{id}` | user | Edit own blog |
| DELETE | `/blog/{id}` | user | Delete own blog |
| POST | `/blog/{id}/submit` | user | Submit for review |
| POST | `/blog/{id}/abandon` | user | Abandon submission |
| POST | `/blog/{id}/like` | user | Like (Promotional 600pts auto-award via activity_catalog) |
| POST | `/blog/{id}/comments` | user | Comment |

---

## Education

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:education`

Course-ticket model (D10): any member proposes a course via Proposals; on admin approval the course is listed as a marketplace item. Enrollment auto-created on order purchase.

| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/courses` | user | Create course (links to approved proposal) |
| GET | `/courses/me` | user | Own courses (as teacher) |
| GET | `/courses/{id}` | public | Course detail + sessions (lazy: auto-hide after last session, auto-approve urgent amendments >6h) |
| POST | `/courses/{id}/amendments` | user | Propose course amendment |
| POST | `/courses/{id}/payout-request` | user | Request payout (all sessions Completed; default 90/10 split) |
| GET | `/enrollments/me` | user | Own enrollments (as student) |
| POST | `/sessions/{id}/start` | user | Teacher starts session → Live |
| POST | `/sessions/{id}/end` | user | Teacher ends session → Completed |
| POST | `/sessions/{id}/cancel` | user | Teacher cancels session |
| POST | `/sessions/{id}/checkin` | user | Student checks in (QR token) |
| POST | `/sessions/{id}/verify/{enrollment_id}` | user | Teacher manually verifies attendance |
| GET | `/sessions/{id}/attendance` | user | Session attendance (lazy auto-end 4h; lazy zero-attendance) |
| POST | `/sessions/{id}/rate-teacher` | user | Student rates teacher (2400 Constitutional Points auto-credit) |
| POST | `/sessions/{id}/rate-student/{enrollment_id}` | user | Teacher rates student (1200 Constitutional Points) |
| GET | `/teachers/{member_id}/ratings` | public | Teacher public ratings |

---

## Event Logs

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:7KKtC-3r`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/logs/user/my_events` | user | Own event log |

---

## Admin

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:EOOlx4pf`

All endpoints require `require_admin` guard (is_admin role flag). Audit-logged via `log_admin_action`.

### 2FA / Auth
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/2fa/setup` | admin | Generate TOTP secret + recovery codes + OTP challenge |
| POST | `/admin/2fa/verify-setup` | admin | Confirm OTP → enable TOTP |
| POST | `/admin/2fa/login` | public | Admin login step 1 (email+pw); issues OTP challenge (3-strike lockout) |
| POST | `/admin/2fa/verify` | public | Verify OTP → auth token |
| POST | `/admin/2fa/recover` | public | One-time recovery code → auth token |
| GET | `/admin/backup-admin/status` | public | Lazy 72h backup-admin eligibility check |

### PTS Management
| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/pts/components` | admin | View R, A, θ, last_conversion_at |
| PATCH | `/admin/pts/reserve-assets` | admin | Update R (reserve_inr) and A (hard_assets_inr) with audit |
| POST | `/admin/pts/theta-adjust` | admin | Adjust θ time-decay coefficient with audit |
| POST | `/admin/pts/bootstrap` | admin | Initialize pts_components singleton |
| GET | `/pts/audit-log` | admin | PTS admin action history |

### Activity Rewards Catalog
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/activity-rewards/catalog` | admin | Create catalog entry (writes changelog) |
| PATCH | `/admin/activity-rewards/catalog/{id}` | admin | Update catalog entry (writes changelog) |
| DELETE | `/admin/activity-rewards/catalog/{id}` | admin | Delete catalog entry (writes changelog) |

### Points / Wallets / Budget
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/points/award` | admin | Award points (Constitutional/Promotional; budget-checked for Promotional) |
| POST | `/admin/wallets/mint` | admin | Mint points to any member wallet |
| GET | `/admin/wallets/{member_id}` | admin | Get all 3 wallets for a member |
| POST | `/admin/wallets/adjust` | admin | Adjust wallet balance (atomic; any currency) |
| POST | `/points/budget` | admin | Set/raise monthly minting budget (no mid-month reduction) |
| GET | `/points/budget` | admin | Live budget remaining for any month |

### Rates & System
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/rates/announce-change` | admin | Announce rate change (30-day notice; broadcasts notifications) |
| POST | `/admin/vacation-mode` | admin | Set vacation_mode_end_date; notifies backup admin |
| POST | `/admin/backup-admin/designate` | admin | Set backup_admin_member_id in system_config |
| PATCH | `/admin/system/config` | admin | Update platform system configuration |
| GET | `/admin/audit-log` | admin | Platform-wide admin audit log (from/to/action_type filters) |

### Members
| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/members` | admin | List all members (search by name/email) |
| PATCH | `/admin/members/{id}` | admin | Update member details (name, email, mobile, suspended) |
| POST | `/admin/members/{id}/impersonate` | admin | Issue 24h auth token for any member |
| POST | `/admin/members/{id}/process-erasure` | admin | Anonymise member data (DPDP) |

### Proposals
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/proposals/{id}/decision` | admin | Accept (creates marketplace item) / request_changes / reject |

### Marketplace
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/marketplace/orders/auto-settle` | admin | Batch settle pod_submitted orders past dispute window |
| POST | `/admin/marketplace/orders/{id}/resolve-dispute` | admin | Resolve dispute (full_refund / partial_refund / vendor_favour) |
| POST | `/admin/marketplace/orders/{id}/settle` | admin | Manually settle pod_submitted or disputed order |
| GET | `/admin/marketplace/items` | admin | All items |
| PATCH | `/admin/marketplace/items/{id}` | admin | Moderate item (update status/fields) |
| GET | `/admin/marketplace/categories` | admin | All categories |
| POST | `/admin/marketplace/categories` | admin | Create category |
| PATCH | `/admin/marketplace/categories/{id}` | admin | Update category |
| DELETE | `/admin/marketplace/categories/{id}` | admin | Delete category |

### Blog
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/blog/{id}/approve` | admin | Approve blog (Constitutional pts + 30% admin share) |
| POST | `/admin/blog/{id}/reject` | admin | Reject blog |
| POST | `/admin/blog/{id}/takedown` | admin | Takedown RG blog (close ticket + refund buyers) |

### Contracts
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/contracts/{id}/resolve` | admin | Resolve contract (conditions_met / conditions_not_met / split / penalty_cascade / no_action) |

### Groups
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/groups/{id}/moderate` | admin | Moderate group (remove_post / remove_member / delete_group) |

### Games
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/games` | admin | Create game |
| PATCH | `/admin/games/{id}` | admin | Update game |

### Seasons & Elections
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/seasons/{id}/start` | admin | Lock + activate season |
| POST | `/admin/seasons/{id}/archive` | admin | Archive season |
| POST | `/admin/seasons/{id}/close-and-settle` | admin | Close and distribute 10/8/8% committee split |
| POST | `/admin/elections/{id}/close` | admin | Close election (tally, refund ≥3-vote deposits) |
| POST | `/admin/elections/{id}/cast-tiebreak` | admin | Cast tiebreak vote |
| POST | `/admin/elections/{id}/voting-rights-price` | admin | Update voting rights price in linked marketplace item |

### Financial
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/donations/{declaration_id}/publish` | admin | Publish verified Donation/Grant to donor feed |
| PATCH | `/admin/donors/{id}` | admin | Update donor display fields |
| POST | `/admin/sponsorships/{id}/progress` | admin | Update sponsorship progress (auto-complete at 100%; sets documented_at) |
| POST | `/admin/sponsorships/{id}/refund` | admin | Refund sponsorship |
| POST | `/admin/sponsorships/{id}/recognize` | admin | Upsert recognition record |
| GET | `/admin/investments` | admin | All investments (status + due_within_days filters) |
| GET | `/admin/investments/due` | admin | Pending payouts by date range |
| POST | `/admin/investments/{id}/payouts/{payout_id}/mark-paid` | admin | Mark payout paid (auto-completes investment when all paid) |
| POST | `/admin/loans/{id}/approve` | admin | Approve loan (Y1 debit + INR credit) |
| POST | `/admin/loans/{id}/reject` | admin | Reject loan |
| POST | `/admin/loans/{id}/write-off` | admin | Write off loan |

### Education
| Verb | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/courses/{proposal_id}/list` | admin | List course from approved proposal |
| POST | `/admin/courses/amendments/{id}/decision` | admin | Approve/reject course amendment |
| POST | `/admin/courses/{id}/payout` | admin | Execute teacher payout |
| POST | `/admin/student-submissions/{id}/review` | admin | Review student submission (legacy; kept for historical records) |

### Declarations & Token Surrenders
| Verb | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/declarations/{id}/verify` | admin | Verify declaration; credits member wallet |
| PATCH | `/declarations/{id}/reject` | admin | Reject declaration |
| PATCH | `/token-surrenders/{id}/complete` | admin | Complete token surrender (debits member wallet) |

---

## Admin Reports

**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:admin-reports`

| Verb | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/reports/financial-summary` | admin | Ledger aggregation by currency/side in date range + declaration counts |
| GET | `/admin/reports/wallet-balances` | admin | Top N wallets by balance (currency filter) |
| GET | `/admin/reports/activity` | admin | Activity counts by type |
| GET | `/admin/reports/marketplace` | admin | GMV tokens + order counts + dispute rate |
| GET | `/admin/reports/gaming` | admin | Season-scoped: submissions, results, points awarded, tokens deposited |
| GET | `/admin/reports/education` | admin | Sessions completed, enrollments, ratings |

---

## Functions (Internal)

Not callable via HTTP. Called by `function.run` inside endpoint stacks.

| Name | Description |
|---|---|
| `require_admin` | Guard: verifies is_admin role flag; throws 403 |
| `mutate_wallet` | Atomic wallet mutation + ledger write + transaction record |
| `mutate_wallet_unchecked` | Like mutate_wallet but allows negative balance (loan debits) |
| `emit_notification` | Insert notification respecting per-event preferences |
| `idempotency_lookup` | Check idempotency key; returns prior response if found |
| `idempotency_store` | Store idempotency key + response |
| `log_admin_action` | Append row to admin_audit_log |
| `pts_compute_rate` | Full PTS formula (r_eq, r_published, r_user, conversion_suspended) |
| `create_declaration` | Create declaration record (used by public onramp endpoints) |
| `check_rate_limit` | Rolling counter; returns blocked=true when max_hits exceeded |

---

## Key Tables

| Table | Purpose |
|---|---|
| `user` | Members (auth table) |
| `wallets` | One per member per currency (INR/token/points) |
| `ledger` | Immutable balance mutation log |
| `wallet_transactions` | Wallet operation log (links ledger + operation) |
| `system_config` | Singleton: rates, limits, admin_member_id, backup_admin, vacation_mode |
| `pts_components` | Singleton: R, A, θ, last_conversion_at |
| `declarations` | Donation/Grant/Sponsorship/Investment INR forms |
| `marketplace_items` | Items for sale (course tickets, blog RG tickets, etc.) |
| `orders` | Marketplace orders (two-phase escrow) |
| `marketplace_settlements` | Settlement records per settled order |
| `marketplace_proposals` / `proposals` | Member-submitted proposals |
| `notifications` / `notification_preferences` | Notification system |
| `activity_catalog` / `activities` | Activity reward catalog + member log |
| `points_minting_budget` / `points_minting_log` | Monthly minting budget enforcement |
| `activity_catalog_changelog` | Catalog version history |
| `investments` / `investment_payouts` | Investment records + payout schedule |
| `sponsorships` / `sponsorship_disputes` | Sponsor records + disputes |
| `loans` / `loan_debits` / `loan_repayments` | Loan lifecycle |
| `expenses` | Personal + platform outflow expense tracking |
| `contracts` / `contract_applications` / `contract_ratings` / `contract_disputes` | Contract lifecycle |
| `blogs` / `blog_likes` / `blog_comments` / `blog_readers` | Blog module |
| `courses` / `sessions` / `enrollments` / `session_ratings` / `course_amendments` | Education (course-ticket model) |
| `member_groups` / `group_posts` / `group_post_comments` / `group_post_reactions` / `group_invites` | Groups module |
| `carts` / `cart_items` | Shopping cart |
| `games` / `game_groups` / `game_group_members` | Gaming community |
| `elections` / `pioneer_candidates` / `votes` | Gaming elections |
| `seasons` / `season_committee` / `events` / `event_submissions` / `event_results` / `season_funding` | Gaming seasons |
| `donors` / `donor_recognitions` | Donor feed |
| `rate_announcements` | INR rate change announcements |
| `admin_totp` / `admin_login_events` / `admin_mfa_challenges` | Admin 2FA |
| `guardian_approvals` / `rate_limit_counters` / `data_erasure_requests` | Phase-1 hardening |
| `pts_rate_current` / `pts_rate_history` / `pts_conversions` | PTS passbook + rate history |
| `idempotency` | Idempotency key store |
| `admin_audit_log` | Admin action audit trail |
