# VGC Reinventing — API Requirements

**Source SRS:** `SRS/VGC_Reinventing_SRS_v2.md` v2.2 (2026)
**Existing baseline:** `XANO/API_REFERENCE.md` (261 documents, 33 completed gaps — current as of 2026-05-25)
**Generated:** 2026-05-30 (rev 4)
**Purpose:** Comprehensive catalog of XANO APIs required to fully satisfy SRS v2.2. Both already-built and pending endpoints are listed so the team can see complete scope at a glance.

> **Rev 4 changes:**
> 1. **Education module fully rewritten** to the SRS v2.2 §12 *course-ticket* model (no appointed teachers, no duties, no chapters, no permission/verification fees). ⚠️ The already-built GAP-017/018 backend (`edu-teachers` duties + `edu-sessions` student-submissions/review-sessions) is **out of spec** and is superseded by §14 below.
> 2. **Free-plan architecture made primary:** no feature depends on a XANO scheduled task. All time-dependent behaviour is lazy-evaluated on read, with an optional free external cron for push-only notifications. See "Time-Dependent Behaviour" below.
> 3. **Added missing surfaces:** Marketplace Cart (§9), Token buy/surrender rate-change announcement (§25), Monthly minting budget (§8), Blog likes/comments (§21), expanded Groups (§20), full Contract dispute/escalation/force-close (§24), Sponsorship dispute window (§16), public overdue-investment count (§17), session amendments + cancelled-session refunds (§14), activity-table versioning (§8).

---

## Legend

- **[NEW]** — endpoint to be created
- **[EXISTS]** — already in `API_REFERENCE.md`, no work required
- **[EXTEND]** — already exists but needs additional inputs/outputs/logic
- **[REWORK]** — already built but **out of spec vs v2.2**; must be reworked
- **Auth:** `member` = any authenticated user · `admin` = VGC Admin only · `public` = unauthenticated
- All write endpoints are transactional; wallet mutations are atomic (XANO `db.transaction` + row-level locking) per SRS §17.

---

## Free-Plan Architecture (binding)

Per SRS §1.4.1 (v2.2): **No endpoint or feature depends on a XANO scheduled/background task** (a paid feature). Implementation rules:

| Concern | Free-plan approach |
|---|---|
| **Time-dependent state** | **Lazy evaluation on read.** State is resolved when the relevant endpoint is called (see "Time-Dependent Behaviour" table). |
| **Push-only triggers** (notify when nobody is online) | **Optional free external cron** (cron-job.org / GitHub Actions) calls a protected admin endpoint. Listed as `[CRON-OPTIONAL]`. |
| **In-app notifications** | **Client polling** of `GET /notifications`. XANO Realtime (WebSockets) is paid. |
| **Email** | Sent **inline** at the triggering event. External provider (Resend/Brevo free tier) via External API Request if XANO email caps are hit. No dispatcher task. |
| **Media** | Cloudinary (free tier) for video/large files; XANO storage for small images/PDFs. |
| **PTS rate** | Computed on demand; 10-second debounce via a single cache row (`pts_rate_cache`: value + computed_at). `L_invest` computed as `min(1.1·X, (1.1·X/365)·days_elapsed)` — no nightly batch. |

---

## Group Plan

| Phase | # | API Group | Canonical | Status | Notes |
|---|---|---|---|---|---|
| 1–3 | 1 | *Authentication* | `L9PANOan` | done | — |
| 1–3 | 2 | *User_Profile* | `_CJw8MFH` | done | — |
| 1–3 | 3 | *Wallets* | `wallets` | done | — |
| 3–5 | 4 | *Points Transfer* | `points-transfer` | 1 amend | 10-min window (lazy expiry) |
| 3–5 | 5 | *Token Surrenders* | `token-surrender` | as-is | — |
| 3–5 | 6 | *Declarations* | `declarations` | 1 amend + 1 new | Draft + delete |
| 3–5 | 7 | **Point Token Scheme** | `pts` | new | Live formula |
| 4 | 8 | **Activity Rewards** | `activity-rewards` | new | Catalog + budget + versioning |
| 6 | 9 | *Marketplace* | `EiCwBjsO` | amend + cart + new | Escrow, cart, POD, disputes, settle |
| 6 | 10 | **Marketplace Proposals** | `proposals` | new | Member → Admin proposal |
| 7 | 11 | **Gaming — Community** | `gaming-community` | new | Games, groups |
| 7 | 12 | **Gaming — Elections** | `gaming-elections` | new | Paid voting, tie-break |
| 7 | 13 | **Gaming — Seasons** | `gaming-seasons` | new | Funding, distribution records |
| 8 | 14 | **Education** | `education` | **rework** | **Course-ticket model (v2.2)** |
| 9 | 15 | **Financial — Donors** | `fin-donor` | new | Donor Page |
| 9 | 16 | **Financial — Sponsors** | `fin-sponsor` | new | Conditions, dispute, refund, recognition |
| 9 | 17 | **Financial — Investments** | `fin-invest` | new | Option A/B, overdue + public count |
| 10 | 18 | **Notifications** | `notifications` | new | 14 events, quiet hours, polling |
| 10A | 19 | **Search** | `search` | new | Cross-module |
| 11 | 20 | **Groups** | `groups` | new | Roles, posts, moderation, appeals |
| 12 | 21 | **Blog** | `blog` | new | Review, likes/comments, Revenue Generator |
| 13 | 22 | **Loan to Members** | `loans` | new | 3-phase repayment |
| 14 | 23 | **Expense Tracker** | `expenses` | new | Personal + Platform Outflow |
| 15 | 24 | **Contract** | `contracts` | new | Escrow, escalation, penalty cascade, force-close |
| 20 | 25 | *Admin* | `EOOlx4pf` | amend + new | Members, disputes, rates, security |
| 20 | 26 | **Admin — Reports** | `admin-reports` | new | Analytics |
| N/A | 27 | *Event Logs* | `7KKtC-3r` | as-is | Audit surface |
| N/A | 28 | *System / Files* | `KVaxK9ev` | done | — |

---

## 1. Authentication (group `L9PANOan`) — DONE

Exists: `POST /login`, `POST /signup`, `GET /me`, `POST /change-password`, `POST /verify-email`, `POST /verify-mobile`, `POST /message/send_welcome_email`, `GET /reset/request-reset-link`, `POST /reset/magic-link-login`, `POST /reset/update_password`.

> ⚠️ **v2.2 gaps to verify/extend later** (Phase 1 scope, not blocking): under-18 guardian-approval flow (§2.1.2), DPDP consent capture at signup (§17), device-fingerprint + rate-limit counters (§2.4). Flagged here; detailed in §25 / future revision.

---

## 2. User_Profile (group `_CJw8MFH`) — DONE

Exists: `GET /profile`, `PATCH /profile`, `GET /roles`, `GET /lookup`.

---

## 3. Wallets (group `wallets`) — DONE

Exists: `GET /me`, `GET /me/{currency}`, `GET /me/activity`.

> Wallet page must also surface current + announced-future INR↔Token rates (§25.x rate-change). Read via `GET /config` or a dedicated rates endpoint.

---

## 4. Points Transfer (group `points-transfer`) — 1 AMEND

Exists: `POST /points-transfer`, `GET /passbook`, `GET /pending`, `POST /{id}/cancel`, `POST /{id}/accept`, `POST /{id}/dispute`.

| # | [Status] Endpoint | Auth | Inputs | Response | Notes |
|---|---|---|---|---|---|
| 4.1 | **[EXTEND]** `POST /points-transfer` | member | `to_member_id`, `amount` (>0), `remark?` | `{transfer_id, status:'pending_window', window_ends_at}` | 10-min window (SRS §5.5). Debit sender + escrow immediately. **Lazy expiry:** `/pending` and `/accept` flip status when read past `window_ends_at`. Pending/cancelled transfers hidden from receiver. |

---

## 5. Token Surrenders (group `token-surrender`) — AS-IS

Exists: `GET /list`, `POST /create`, `GET /{id}`.

---

## 6. Declarations (group `declarations`) — 1 AMEND + 1 NEW

Exists: `POST /declarations`, `POST /{id}/submit`, `GET /declarations/{id}`, `GET /list`.

| # | [Status] Endpoint | Auth | Inputs | Response | Notes |
|---|---|---|---|---|---|
| 6.1 | **[EXTEND]** `POST /declarations` | member or public | §3.5 fields; `payment_type` ∈ Donation/Grant/Sponsorship/Investment/Token Purchase; `additional_details` (JSON) | declaration | **v2.2 §13.1:** Donations/Grants have **no anonymous option** (identity always recorded). Anonymity only governs *public display* of donations, decided by Admin at publish (§15.3). |
| 6.2 | **[NEW]** `DELETE /declarations/{id}` | member (owner, draft only) | path | `{deleted:true}` | Draft cleanup. |

---

## 7. Point Token Scheme (group `pts`) — LIVE FORMULA

Implements SRS §4. Rate computed live from platform state — **not** admin-set.

### 7.1 Formula components
`I` (Admin operational INR), `R` (Reserve), `A` (Hard Assets), `T_member`, `T_admin` (Admin tokens + Marketplace Escrow), `P_member` (member points + contract escrow points), `P_admin` (Admin points − contract escrow), `L_invest` (Σ pending liability), `t_idle` (min since last conversion, cap 43,200), `θ` (decay, default 0.00005/min).

### 7.2 Computation
```
T_net = T_member − T_admin ; P_net = P_member − P_admin
guard: P_net ≤ 0 → conversions suspended
r_eq = (I + R + A − L_invest − 10·T_net) / P_net      (coefficient 10 = ₹/token at launch)
r_published = r_eq × (1 + θ·t_idle)                    (resets to r_eq on conversion)
floor: r_published < 0.0001 → 0.0001
threshold: r_published < 0.00011 → conversions disabled (display-only)
R_user = 10 / r_published                              (member-facing: Points per Token)
```
**Free-plan:** computed on demand; 10s debounce via `pts_rate_cache` row; `L_invest` = `min(1.1X,(1.1X/365)·days_elapsed)` per active investment. No cron.

### 7.3 Tax
Flat 2.5% on the currency **given**; remainder (97.5%) converted; tax → Admin's matching wallet. No exemptions.

### 7.4 Endpoints

| # | [Status] Endpoint | Auth | Inputs | Response | Notes |
|---|---|---|---|---|---|
| 7.1 | **[NEW]** `GET /pts/rate` | member (logged-in) | — | `{r_published, R_user, r_eq, t_idle, components:{I,R,A,T_net,P_net,L_invest}, status}` | Public rate dashboard. **θ NOT exposed.** |
| 7.2 | **[NEW]** `POST /pts/quote` | member | `direction` ∈ points_to_tokens/tokens_to_points, `amount` | `{gross, tax_pct:2.5, tax_amount, net, rate_used, receive_amount, member_balance_ok, admin_wallet_ok}` | §4.3 checks. |
| 7.3 | **[NEW]** `POST /pts/convert` | member | `direction`, `amount`, `idempotency_key?` | `{conversion_id, debit, credit, tax_to_admin, rate_used, r_published_snapshot, R_user_snapshot}` | Atomic; resets t_idle; passbook records snapshot (§4.10). |
| 7.4 | **[NEW]** `GET /pts/history` | member | `page?`, `per_page?` | paginated conversions | — |
| 7.5 | **[NEW]** `GET /admin/pts/components` | admin | — | full component values incl. θ | — |
| 7.6 | **[NEW]** `POST /admin/pts/theta-adjust` | admin | `new_theta`, `reason` (req) | `{old_theta,new_theta}` | Logged (§4.10). |
| 7.7 | **[NEW]** `PATCH /admin/pts/reserve-assets` | admin | `reserve_inr?`, `hard_assets[]?` | updated R / A registry | Manage R and A (SRS §15.1 PTS module). |
| 7.8 | **[NEW]** `POST /admin/pts/bootstrap` | admin | `i_seed_inr` (₹50k), `seed_points_member_id`, `seed_points_amount`, `reason` | confirmed | One-time; seeds I and awards Vishal Gorana Constitutional points so P_net>0 (§4.9). |
| 7.9 | **[NEW]** `GET /admin/pts/audit-log` | admin | `from?`, `to?` | θ-change trail | §4.10. |

---

## 8. Activity Rewards (group `activity-rewards`)

SRS §5.2–§5.4 + Appendix A. Provisions, monthly minting budget, version-controlled activity table.

| # | [Status] Endpoint | Auth | Inputs | Response | Notes |
|---|---|---|---|---|---|
| 8.1 | **[NEW]** `GET /activity-rewards/catalog` | member | — | `{version, effective_from, activities:[{activity_code,label,provision_type,points,auto_award}]}` | Public-to-members; current version (§5.4). |
| 8.2 | **[NEW]** `GET /activity-rewards/changelog` | member | — | version history | §5.4 change log. |
| 8.3 | **[NEW]** `POST /activities` | member | `activity_code`, `entity_ref`, `metadata?` | `{activity_id, status, points_awarded?}` | Auto-award or pending review. |
| 8.4 | **[NEW]** `GET /activities/me` | member | `page?`, `status?` | paginated | — |
| 8.5 | **[NEW]** `POST /admin/activity-rewards/catalog` | admin | `activity_code,label,provision_type,points,auto_award?,active?` | row (new table version) | PATCH/DELETE same path; bumps version + changelog. |
| 8.6 | **[NEW]** `POST /admin/points/budget` | admin | `month` (YYYY-MM), `budget_points` | `{month, budget, minted_so_far, remaining}` | §5.3 set/raise (no mid-month downward). Promotional blocked when exceeded. |
| 8.7 | **[NEW]** `GET /admin/points/budget` | admin | `month?` | budget + live minted total | Real-time remaining. |

---

## 9. Marketplace (group `EiCwBjsO`) — AMEND + CART + NEW

SRS §6. Items, **cart (same-vendor)**, orders, escrow, POD, disputes, settlement.

| # | [Status] Endpoint | Auth | Inputs | Response | SRS |
|---|---|---|---|---|---|
| 9.1 | **[EXTEND]** `POST /marketplace/items` | admin | `proposing_member_id?`, `revenue_share_proposer_pct`, `revenue_share_admin_pct`, `buyer_info_schema` (≤8), `category_path_ids` (≤8), `quantity?` | item | §6.3–6.5 |
| 9.2 | **[EXISTS/EXTEND]** `GET /marketplace/items` + `GET /marketplace/items/{id}` | public | filters | items / detail incl. buyer_info_schema | §6.4 |
| 9.3 | **[NEW]** `POST /cart/items` | member | `item_id`, `quantity` | cart state | **Same-proposing-member constraint**; mixed-vendor → prompt to start new cart (§6.6). |
| 9.4 | **[NEW]** `GET /cart` | member | — | carts grouped by proposing member | §6.6 |
| 9.5 | **[NEW]** `DELETE /cart/items/{id}` | member | path | updated cart | — |
| 9.6 | **[NEW]** `POST /cart/checkout` | member | `cart_id`, `buyer_info` per item | `{order_ids:[…]}` | **Stale-cart auto-removal** (inactive/0-qty items dropped + recalculated), atomic balance re-check, one Order ID per item (§6.6). |
| 9.7 | **[EXTEND]** `POST /marketplace/orders` | member | `item_id`, `quantity`, `buyer_info` | order (escrow ref) | Single-item path; escrow for member-proposed, direct for Admin-owned (§3.8). |
| 9.8 | **[NEW]** `GET /marketplace/categories/tree` | public | `root_id?`, `max_depth?` | nested ≤8 levels | §6.2 |
| 9.9 | **[NEW]** `POST /marketplace/categories` | admin | `name`, `parent_id?`, `sector`, `icon_file_id?` | category | — |
| 9.10 | **[NEW]** `PATCH /marketplace/categories/{id}` | admin | mutable | category | — |
| 9.11 | **[NEW]** `DELETE /marketplace/categories/{id}` | admin | path | `{deleted}` | Only if no active items. |
| 9.12 | **[NEW]** `POST /marketplace/orders/{id}/proof-of-delivery` | member (proposing) | `proof_file_ids[]`, `note?` | `{proof_id, dispute_window_ends_at}` | Within 14 days (§6.8). |
| 9.13 | **[NEW]** `POST /marketplace/orders/{id}/dispute` | member (buyer) | `reason`, `evidence_file_ids?` | `{dispute_id}` | 7-day window. |
| 9.14 | **[NEW]** `POST /marketplace/orders/{id}/mark-received` | member (buyer) | — | `{status:'settled', split}` | Early settle. |
| 9.15 | **[NEW]** `POST /marketplace/orders/{id}/settle-request` | member (proposing) | — | `{settlement_request_id}` | §6.8 |
| 9.16 | **[NEW]** `POST /marketplace/orders/{id}/cancel` | member (buyer, pre-fulfillment) | `reason?` | `{refunded_tokens}` | — |
| 9.17 | **[NEW]** `GET /marketplace/orders/me` | member | `role` ∈ buyer/proposing, `status?` | orders | — |

**Lazy/cron:** auto-settle after 7 days resolved on order read; batch helper `[CRON-OPTIONAL]` in §25.

---

## 10. Marketplace Proposals (group `proposals`)

SRS §6.3. Members propose; Admin lists. (Course tickets §14 and Revenue Generator blog tickets §21 also use this flow.)

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 10.1 | **[NEW]** `POST /proposals` | member | `item_name, description, sector, suggested_category_path, item_type, suggested_price_tokens, proposed_revenue_share_pct, buyer_info_schema (≤8), attachments?` | proposal |
| 10.2 | **[NEW]** `GET /proposals` | member | `status?` | own proposals |
| 10.3 | **[NEW]** `GET /proposals/{id}` | member or admin | path | proposal + admin notes |
| 10.4 | **[NEW]** `PATCH /proposals/{id}` | member (owner, draft/changes_requested) | mutable | proposal |
| 10.5 | **[NEW]** `POST /proposals/{id}/withdraw` | member (owner) | path | `{status:'withdrawn'}` |
| 10.6 | **[NEW]** `POST /admin/proposals/{id}/decision` | admin | `decision` ∈ accept/request_changes/reject, `notes?`, listing payload on accept | proposal + `item_id` |

---

## 11. Gaming — Community (group `gaming-community`)

SRS §11.1, §11.14.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 11.1 | **[NEW]** `GET /games` | public | `q?, page?, per_page?` | game list |
| 11.2 | **[NEW]** `GET /games/{id}` | public | path | full record |
| 11.3 | **[NEW]** `POST /games/{id}/groups` | member | `name, description?` | group |
| 11.4 | **[NEW]** `GET /games/{id}/groups` | public | path | groups |
| 11.5 | **[NEW]** `POST /groups/{id}/join` | member | path | `{member_count}` |
| 11.6 | **[NEW]** `POST /groups/{id}/leave` | member | path | `{member_count}` |

Game creation: §25.

---

## 12. Gaming — Elections (group `gaming-elections`)

SRS §11.2, §11.6. Two candidacy items (New Game Proposal 50-token; Election Candidacy 10-token deposit). Universal **paid** voting. Tie-break by Admin (logged publicly).

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 12.1 | **[NEW]** `POST /pioneer-candidates` | member | `game_id`, season fields, `funding_model`, `total_points_budget`, `events[]` | candidate (debits 10-token deposit; 50-token setup for new game) |
| 12.2 | **[NEW]** `GET /pioneer-candidates` | public | `game_id?, election_id?, status?` | list |
| 12.3 | **[NEW]** `PATCH /pioneer-candidates/{id}` | member (owner, before voting) | season fields | candidate (locked once voting opens) |
| 12.4 | **[NEW]** `POST /elections` | admin | `game_id, voting_start, voting_end, voting_rights_marketplace_item_id?` | election |
| 12.5 | **[NEW]** `GET /elections/{id}` | public | path | election + candidates + tallies |
| 12.6 | **[NEW]** `GET /elections/me/eligibility` | member | `election_id` | `{eligible, reason, voting_right_required, owned}` |
| 12.7 | **[NEW]** `POST /elections/{id}/vote` | member | `candidate_id`, `voting_right_ref?` | `{vote_id}` |
| 12.8 | **[NEW]** `POST /admin/elections/{id}/close` | admin | `tie_break_candidate_id?` | `{winner, deposit_refunds}` (≥3 votes refunded) |
| 12.9 | **[NEW]** `POST /admin/elections/{id}/cast-tiebreak` | admin | `candidate_id`, `rationale` | `{winner}` (2-way deciding vote OR 3+-way direct selection; rationale public §11.6.3) |

**Lazy:** election may close on read past `voting_end`, or via §12.8 / `[CRON-OPTIONAL]`.

---

## 13. Gaming — Seasons (group `gaming-seasons`)

SRS §11.3–§11.13.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 13.1 | **[NEW]** `GET /seasons` | public | `game_id?, status?` | list |
| 13.2 | **[NEW]** `GET /seasons/{id}` | public | path | season + events + committee + funding |
| 13.3 | **[NEW]** `POST /seasons/{id}/committee` | member (pioneer) | `manager_member_id?, treasurer_member_id?` | committee |
| 13.4 | **[NEW]** `POST /seasons/{id}/start` | admin | path | `{started_at}` (locks data) |
| 13.5 | **[NEW]** `POST /seasons/{id}/archive` | admin | path | `{archived_at}` |
| 13.6 | **[NEW]** `GET /seasons/{id}/events` | public | path | events |
| 13.7 | **[NEW]** `POST /events/{id}/submissions` | member | `fields`, `files?` | submission |
| 13.8 | **[NEW]** `GET /events/{id}/submissions` | member (pioneer/admin) | `participant_id?` | list |
| 13.9 | **[NEW]** `POST /events/{id}/results` | member (pioneer) | `entries:[{participant_id, points_awarded, notes?}]` | results + credits |
| 13.10 | **[NEW]** `POST /seasons/{id}/secure-funding/deposit` | member (pioneer) | `tokens` | `{points_received, admin_share}` (50/50, 2.5% PTS tax disclosed §11.7.2) |
| 13.11 | **[NEW]** `POST /seasons/{id}/distribution-records` | member (pioneer) | `amount, member_id, event_ref_id` | record (counts toward 80% target §11.11) |
| 13.12 | **[NEW]** `POST /seasons/{id}/close-and-settle` | admin | path | `{distribution_pct, target_met, splits:{pioneer 10%, manager 8%, treasurer 8%}, deposit_returned}` |
| 13.13 | **[NEW]** `GET /seasons/{id}/ledger` | member | path | per-season points in/out |

**Lazy:** archival resolved on read past `end_date` (or `[CRON-OPTIONAL]`).

---

## 14. Education (group `education`) — REWORK (v2.2 §12 course-ticket model)

> ⚠️ **Supersedes built GAP-017/018.** v2.2 §12 has **no appointed teachers, no duties, no chapters, no permission/verification fees, no student-submissions, no review-sessions.** A *Teacher* is any member who proposes a **course ticket** (a marketplace item with attached sessions). Course tickets are listed via the standard Proposals flow (§10). Education-specific surface = sessions, enrollment, QR attendance, ratings, amendments, payout.

### Course ticket lifecycle

| # | [Status] Endpoint | Auth | Inputs | Response | SRS |
|---|---|---|---|---|---|
| 14.1 | **[NEW]** `POST /courses` | member (teacher) | `course_name, description, images[], price_per_student, total_seats, sessions:[{date,start_time,end_time,venue_or_platform}], buyer_info_schema (≤8)` | course proposal (creates a §10 proposal of type `course_ticket` + draft sessions) | §12.1–12.2 |
| 14.2 | **[NEW]** `GET /courses/me` | member (teacher) | `status?` | my courses + per-session status + sales | §12.9 |
| 14.3 | **[NEW]** `GET /courses/{id}` | public | path | course detail + sessions (auto-hidden after last session passes §12.4) | §12.4 |
| 14.4 | **[NEW]** `POST /admin/courses/{proposal_id}/list` | admin | `revenue_split_teacher_pct` (default 90), `revenue_split_admin_pct` (default 10) | lists item + activates sessions | §12.3 |

### Session amendments (§12.5)

| 14.5 | **[NEW]** `POST /courses/{id}/amendments` | member (teacher) | `changes:[{session_id?, new_date,new_start,new_end,venue?} \| {add_session}]` | `{amendment_id, urgent:bool}` | Urgent if <48h to session. |
| 14.6 | **[NEW]** `POST /admin/courses/amendments/{id}/decision` | admin | `decision` ∈ approve/reject, `notes?` | updated sessions + visibility | 48h SLA; urgent 6h then **auto-approve** (lazy on read / `[CRON-OPTIONAL]`). |

### Session lifecycle & attendance (§12.6)

| 14.7 | **[NEW]** `POST /sessions/{id}/start` | member (teacher) | path | `{status:'Live'}` | Opens check-in / activates online link. |
| 14.8 | **[NEW]** `POST /sessions/{id}/end` | member (teacher) | path | `{status:'Completed'}` | Unlocks ratings. |
| 14.9 | **[NEW]** `POST /sessions/{id}/checkin` | member (student) | `qr_token` (in-person) | `{enrollment_status}` | In-person → `Checked-in` (validate authenticity, payment, session match, **duplicate block**). Online join → **auto `Verified`** (§12.6.3). |
| 14.10 | **[NEW]** `POST /sessions/{id}/verify/{enrollment_id}` | member (teacher) | path | `{status:'Verified', timestamp}` | Manual gate (in-person, §12.6.2). |
| 14.11 | **[NEW]** `POST /sessions/{id}/cancel` | member (teacher) | `reason?` | `{cancelled, refunds:[…]}` | Proportional token refund to buyers; excluded from payout (§12.8). |
| 14.12 | **[NEW]** `GET /sessions/{id}/attendance` | member (teacher) | path | counts {Purchased, Checked-in, Verified} + flagged invalid/duplicate scans | §12.9 |
| 14.13 | **[NEW]** `GET /enrollments/me` | member (student) | `status?` | my tickets + encrypted QR token per session | QR rendered client-side. |

**Session auto-end (§12.6.1):** if Live >4h past scheduled end, resolved on read → `Completed`, remaining `Checked-in` → `Verified`. **Zero-attendance** session auto-`Completed` on read past scheduled date (no-show); does not block payout (§12.8).

### Ratings (§12.7)

| 14.14 | **[NEW]** `POST /sessions/{id}/rate-teacher` | member (student, Verified) | `stars` (1–5), `testimony` | rating | Auto-credit Constitutional Points (Appendix A: 2,400). On teacher profile + listing. |
| 14.15 | **[NEW]** `POST /sessions/{id}/rate-student/{enrollment_id}` | member (teacher) | `stars` (1–5) | rating | Auto-credit teacher Constitutional Points (1,200/student). On student profile. |
| 14.16 | **[NEW]** `GET /teachers/{member_id}/ratings` | public | path | ratings + testimonies | §12.7.1 |

### Payout (§12.8)

| 14.17 | **[NEW]** `POST /courses/{id}/payout-request` | member (teacher) | path | `{eligible:bool, amount_tokens}` | All sessions Completed (cancelled excluded; zero-attendance counts as Completed). |
| 14.18 | **[NEW]** `POST /admin/courses/{id}/payout` | admin | path | `{credited_tokens}` | Credits teacher per split from escrow. |

---

## 15. Financial — Donors (group `fin-donor`)

SRS §13.1, §13.5. **Identity always recorded & published** (no anonymous donations/grants). Grant *reason* private.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 15.1 | **[NEW]** `GET /donors` | public | `page?, per_page?` | `[{display_name, amount, date, type}]` |
| 15.2 | **[NEW]** `GET /donors/{id}` | public | path | donor profile |
| 15.3 | **[NEW]** `POST /admin/donations/{declaration_id}/publish` | admin | type-aware; grants: `keep_reason_private:true` | donor record (name + amount published) |
| 15.4 | **[NEW]** `PATCH /admin/donors/{id}` | admin | display fields | donor record |

---

## 16. Financial — Sponsorships (group `fin-sponsor`)

SRS §13.1, §13.3–§13.4. Conditions, partial-fulfilment refund, **7-day dispute window**, recognition.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 16.1 | **[NEW]** `POST /sponsorships` | public or member | sponsor info, `conditions`, `sector`, `upi_id`, `amount_inr`, `attachments?` | sponsorship (auto-creates declaration) |
| 16.2 | **[NEW]** `GET /sponsorships` | public | `status?` | list |
| 16.3 | **[NEW]** `GET /sponsorships/{id}` | public | path | sponsorship + completion % |
| 16.4 | **[NEW]** `POST /admin/sponsorships/{id}/progress` | admin | `conditions_met_pct`, `notes?`, `documentation_file_ids?` | sponsorship (shares assessment) |
| 16.5 | **[NEW]** `POST /sponsorships/{id}/dispute` | sponsor (member) or public-with-token | `reason`, `evidence?` | dispute (within 7 days of documentation §13.4) |
| 16.6 | **[NEW]** `POST /admin/sponsorships/{id}/refund` | admin | `amount_inr`, `reason`, `upi_txn_id` | refund (= amount × (1 − met%)) |
| 16.7 | **[NEW]** `POST /admin/sponsorships/{id}/recognize` | admin | `badge?, page_publish?, sector_display_text?` | recognition (§13.3) |

---

## 17. Financial — Investments (group `fin-invest`)

SRS §13.2. Option A (10% lumpsum) / Option B (8% quarterly). No-compound overdue accrual. **Public overdue count.**

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 17.1 | **[NEW]** `POST /investments` | public or member | `declaration_id, option, principal_inr, start_date` | investment + auto payout schedule |
| 17.2 | **[NEW]** `GET /investments/me` | member | — | own |
| 17.3 | **[NEW]** `GET /investments/{id}` | member or admin | path | investment + schedule |
| 17.4 | **[NEW]** `GET /investments/overdue-count` | public | — | `{overdue_count}` | Transparency page (§13.2.1) — count only, no names/amounts. |
| 17.5 | **[NEW]** `POST /investments/{id}/overdue-request` | member (investor, overdue >30d) | path | request (Admin responds ≤7d) |
| 17.6 | **[NEW]** `GET /admin/investments` | admin | `status?, due_within_days?` | filtered |
| 17.7 | **[NEW]** `POST /admin/investments/{id}/payouts/{payout_id}/mark-paid` | admin | `upi_txn_id, paid_at` | payout (auto-settles when all paid) |
| 17.8 | **[NEW]** `GET /admin/investments/due` | admin | `from?, to?` | upcoming payouts |

**Lazy:** overdue status + interest accrual computed on read; `investment_payouts_due_notifier` is `[CRON-OPTIONAL]`.

---

## 18. Notifications (group `notifications`)

SRS §16. 14 events, quiet hours (critical alerts bypass), per-category email toggle. **In-app via polling.**

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 18.1 | **[NEW]** `GET /notifications` | member | `unread_only?, page?, per_page?` | list (client polls this) |
| 18.2 | **[NEW]** `POST /notifications/{id}/read` | member | path | `{read_at}` |
| 18.3 | **[NEW]** `POST /notifications/read-all` | member | — | `{count}` |
| 18.4 | **[NEW]** `GET /notifications/preferences` | member | — | `{email, in_app, quiet_hours:{start,end}, per_category:{…}}` |
| 18.5 | **[NEW]** `PATCH /notifications/preferences` | member | partial | updated prefs |

> Emit-on-event helper writes notification rows + sends email inline (respecting prefs; critical/financial bypass disable & quiet hours). Transactional in-app alerts cannot be disabled (§16.2).

---

## 19. Search (group `search`)

SRS §17.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 19.1 | **[NEW]** `GET /search` | member | `q, sector?, category?, limit?` | `{marketplace:[], groups:[], blog:[]}` (visibility-filtered) |

---

## 20. Groups (group `groups`)

SRS §7. Public/Private, roles (Admin/Co-Admin/Member), posts (text/image/gif/video/poll/file/link), moderation, **removed-member appeal**, 24h deletion hold.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 20.1 | **[NEW]** `POST /groups` | member | `name, description, sector, group_type, icon_file_id?` | group (creator = Admin) |
| 20.2 | **[NEW]** `GET /groups` | member | `sector?, search?` | discoverable list |
| 20.3 | **[NEW]** `GET /groups/{id}` | member | path | detail (private: name/desc/sector only to non-members) |
| 20.4 | **[NEW]** `POST /groups/{id}/join` | member | path | public → joined; private → request pending |
| 20.5 | **[NEW]** `POST /groups/{id}/leave` | member | path | `{left}` (Admin must transfer first) |
| 20.6 | **[NEW]** `POST /groups/{id}/join-requests/{req_id}/decision` | member (admin/co-admin) | `decision` ∈ approve/reject | `{status}` |
| 20.7 | **[NEW]** `POST /groups/{id}/invite` | member (admin/co-admin) | `member_id` | invite |
| 20.8 | **[NEW]** `POST /groups/{id}/invites/{inv_id}/respond` | member (invitee) | `accept:bool` | `{status}` |
| 20.9 | **[NEW]** `POST /groups/{id}/promote-coadmin` | member (admin) | `member_id` | `{role:'co_admin'}` |
| 20.10 | **[NEW]** `POST /groups/{id}/transfer-admin` | member (admin) | `member_id` | `{new_admin}` |
| 20.11 | **[NEW]** `POST /groups/{id}/remove-member` | member (admin/co-admin) | `member_id` | `{removed}` (blocked; re-invite only by Admin) |
| 20.12 | **[NEW]** `POST /groups/{id}/delete` | member (admin) | — | 24h hold (or immediate if sole member) |
| 20.13 | **[NEW]** `POST /groups/{id}/appeal-removal` | member (removed) | `reason?` | appeal to VGC Admin (override §7.7) |
| 20.14 | **[NEW]** `POST /groups/{id}/posts` | member | `content, type, media?, poll?` | post |
| 20.15 | **[NEW]** `GET /groups/{id}/posts` | member | `page?` | posts (private → members only §7.9) |
| 20.16 | **[NEW]** `POST /posts/{id}/comments` | member | `content` | comment (notifies author) |
| 20.17 | **[NEW]** `POST /posts/{id}/react` | member | `reaction` | reaction |

**Lazy:** 24h deletion finalised on read (or `[CRON-OPTIONAL]`).

---

## 21. Blog (group `blog`)

SRS §8. Write → review (Constitutional Points) → publish; **likes/comments** (likes = Promotional activity reward); Revenue Generator tickets via Proposals; grandfathering; abandonment consent.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 21.1 | **[NEW]** `POST /blog` | member | `title, content, sector, tags[], comments_enabled?` | blog (draft) |
| 21.2 | **[NEW]** `PATCH /blog/{id}` | member (author, draft/rejected) | mutable | blog |
| 21.3 | **[NEW]** `GET /blog/me` | member | `status?` | own blogs |
| 21.4 | **[NEW]** `POST /blog/{id}/submit` | member (author) | path | `{status:'in_review'}` |
| 21.5 | **[NEW]** `POST /admin/blog/{id}/approve` | admin | `points_awarded` (≥0) | `{status:'published'}` (Constitutional credit) |
| 21.6 | **[NEW]** `POST /admin/blog/{id}/reject` | admin | `points_awarded` (≥0), `reason?` | `{status:'rejected'}` |
| 21.7 | **[NEW]** `POST /admin/blog/{id}/takedown` | admin | `reason?` | `{status:'taken_down'}` (Revenue Generator → close ticket + refund buyers §8.9) |
| 21.8 | **[NEW]** `POST /blog/{id}/abandon` | member (author) | `allow_monetisation:bool` | `{status:'abandoned'}` (consent recorded §8.7) |
| 21.9 | **[NEW]** `DELETE /blog/{id}` | member (author, never-published & 0 pts) | path | `{deleted}` |
| 21.10 | **[NEW]** `GET /blog/public` | member | `sector?, tag?, search?` | published (Revenue Generator hidden unless purchased/grandfathered §8.6) |
| 21.11 | **[NEW]** `GET /blog/{id}` | member | path | blog (visibility-checked) |
| 21.12 | **[NEW]** `POST /blog/{id}/like` | member | path | `{liked}` (Promotional reward 600 — Appendix A) |
| 21.13 | **[NEW]** `POST /blog/{id}/comments` | member | `content` | comment (notifies author §8.10) |

Revenue Generator ticket proposed via §10 Proposals (author must already be published §8.5).

---

## 22. Loan to Members (group `loans`)

SRS §9. 3-phase repayment (Y1 help ₹10; Y2 consequence ₹8.50; Y3+ 10% p.a.). Annual debits **lazy** (computed on read from approval date; offset on new token purchase).

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 22.1 | **[NEW]** `POST /loans/request` | member | `amount_inr, upi_id, planned_return_date?, purpose, document?` | loan (pending) |
| 22.2 | **[NEW]** `GET /loans/me` | member | — | loans + outstanding (lazily recalculated) + consolidated debit schedule + history |
| 22.3 | **[NEW]** `POST /admin/loans/{id}/approve` | admin | `amount_disbursed, transfer_ref` | active (debits Y1 tokens; wallet may go negative §9.5) |
| 22.4 | **[NEW]** `POST /admin/loans/{id}/reject` | admin | `reason?` | rejected |
| 22.5 | **[NEW]** `POST /loans/{id}/repay` | member | `amount_tokens` | repayment (credits Admin token wallet) |
| 22.6 | **[NEW]** `POST /admin/loans/{id}/write-off` | admin | `reason` | written_off (§9.9) |

> Annual phase debits applied lazily when loan is read past each anniversary (or `[CRON-OPTIONAL]` sweep). Sequential by Loan ID for multi-loan members.

---

## 23. Expense Tracker (group `expenses`)

SRS §10. Personal (private) + Platform Outflow (Admin, public, per-entry remark toggle). 15 categories, conditional payment-mode fields, settle-lock.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 23.1 | **[NEW]** `POST /expenses` | member | `date, amount_inr, payment_mode, platform_ref?, main_category, specific_category, reason?, entry_type` (Admin: `Platform Outflow` + `remark_visibility`) | entry (Platform Outflow debits Admin INR ledger) |
| 23.2 | **[NEW]** `GET /expenses/me` | member | `category?, from?, to?, settlement_status?, q?` | own entries + dashboard aggregates |
| 23.3 | **[NEW]** `POST /expenses/{id}/settle` | member | confirmation | `{settled, locked}` (permanent) |
| 23.4 | **[NEW]** `GET /platform-financial-ledger` | member | `page?, per_page?` | public Platform Outflow entries (remark shown only if Public) |

---

## 24. Contract (group `contracts`)

SRS §14. VGC Administrated (105% escrow) vs Non-VGC (trust + 150% penalty cascade). Caps: Taker 2 active; Giver 10 VGC-administrated.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 24.1 | **[NEW]** `POST /contracts` | member | `title, requirements, application_deadline, requested_completion_date, budget_points, contract_type, sector, conditions (VGC only), notes?` | contract (VGC: lock 105%; reject non-verifiable conditions) |
| 24.2 | **[NEW]** `GET /contracts` | public | `contract_type?, status?, sector?` | list |
| 24.3 | **[NEW]** `GET /contracts/{id}` | public | path | detail |
| 24.4 | **[NEW]** `PATCH /contracts/{id}` | member (giver, pre-assignment) | editable fields only (NOT budget/type) | contract (§14.5) |
| 24.5 | **[NEW]** `POST /contracts/{id}/apply` | member | `application_text` | application |
| 24.6 | **[NEW]** `POST /contracts/{id}/assign` | member (giver) | `taker_member_id` | active (Taker cap check; others rejected-notified) |
| 24.7 | **[NEW]** `POST /contracts/{id}/mark-complete` | member (taker) | path | completed (giver notified) |
| 24.8 | **[NEW]** `POST /contracts/{id}/release` | member (giver) | path | VGC: 95% to Taker, 5% retained; Non-VGC: direct transfer |
| 24.9 | **[NEW]** `POST /contracts/{id}/dispute` | member (giver or taker) | `reason, evidence?` | dispute (Admin resolves §25) |
| 24.10 | **[NEW]** `POST /contracts/{id}/escalate` | member (taker) | path | escalation after 7d giver inaction (§14.6 3c) |
| 24.11 | **[NEW]** `POST /contracts/{id}/cancel` | member (giver pre-assign; either post-assign w/ penalty) | `reason?` | cancellation (§14.7 fee rules) |
| 24.12 | **[NEW]** `POST /contracts/{id}/force-close-request` | member (either, 60d past requested completion) | path | request (Admin disposes §14.7) |
| 24.13 | **[NEW]** `POST /contracts/{id}/rate` | member (giver/taker) | `stars, review` | rating (no rating if no Taker assigned §14.9) |

Admin resolution (release/withhold, penalty cascade, force-close disposition): §25.

**Lazy:** listing auto-deactivates on read past `application_deadline` (100% escrow returned, 5% fee retained).

---

## 25. Admin (group `EOOlx4pf`) — AMEND + NEW

| # | [Status] Endpoint | Auth | Inputs | Response | Notes |
|---|---|---|---|---|---|
| 25.1 | **[EXTEND]** `POST /admin/points/award` | admin | `member_id, amount, provision_type, reason, activity_ref?` | award | Constitutional +30% / Promotional −25%; budget-checked (§8.6). |
| 25.2 | **[NEW]** `POST /admin/points/transfer/{id}/resolve-dispute` | admin | `decision` ∈ refund_sender/release_to_receiver, `notes?` | resolution |
| 25.3 | **[NEW]** `POST /admin/marketplace/orders/{id}/resolve-dispute` | admin | `decision` ∈ full_refund/partial_refund/vendor_favour, `partial_amount_tokens?`, `notes?` | resolution + settlement |
| 25.4 | **[NEW]** `POST /admin/marketplace/orders/{id}/settle` | admin | path | `{proposer_credit, admin_credit}` |
| 25.5 | **[NEW]** `POST /admin/marketplace/orders/auto-settle` | admin | `as_of?` | `{settled_count}` | `[CRON-OPTIONAL]` (also lazy on read). |
| 25.6 | **[NEW]** `POST /admin/games` | admin | `name, sector, icon_file_id, description?` | game |
| 25.7 | **[NEW]** `PATCH /admin/games/{id}` | admin | mutable | game |
| 25.8 | **[NEW]** `POST /admin/wallets/mint` | admin | `member_id, currency:'points', amount, provision_type, reason` | mutation + audit |
| 25.9 | **[NEW]** `POST /admin/elections/{id}/voting-rights-price` | admin | `price_tokens` | updates item |
| 25.10 | **[NEW]** `POST /admin/members/{id}/impersonate` | admin | `reason` | short-lived token (24h, audit) |
| 25.11 | **[NEW]** `POST /admin/rates/announce-change` | admin | `inr_to_token_rate?, token_to_inr_rate?, effective_in_days:30` | `{effective_from}` | §3.2 — platform-wide notice; wallet shows current + future. |
| 25.12 | **[NEW]** `POST /admin/contracts/{id}/resolve` | admin | `decision`, penalty/force-close params, `notes?` | resolution | §14.6/14.7/14.8 incl. 150% cascade. |
| 25.13 | **[NEW]** `POST /admin/groups/{id}/moderate` | admin | `action` ∈ remove_post/remove_member/delete_group, refs | result | §7.10 |
| 25.14 | **[NEW]** `POST /admin/backup-admin/designate` | admin | `backup_member_id` | designation |
| 25.15 | **[NEW]** `POST /admin/vacation-mode` | admin | `end_date` | pauses 72h Backup-Admin trigger (§15.2) |
| 25.16 | **[NEW]** `GET /admin/audit-log` | admin | `from?, to?, action_type?, member_id?` | chronological trail (§15.1) |

> **Backup Admin 72h-inactivity** trigger: lazy (evaluated when Backup Admin attempts access vs primary's last-login timestamp) or `[CRON-OPTIONAL]`. **2FA TOTP** (§15.2): implemented with XANO crypto functions (no native helper) — Phase 3.

---

## 26. Admin — Reports (group `admin-reports`)

SRS §15.1.

| # | [Status] Endpoint | Auth | Inputs | Response |
|---|---|---|---|---|
| 26.1 | **[NEW]** `GET /admin/reports/financial-summary` | admin | `from, to` | INR in/out, tokens/points minted, tax |
| 26.2 | **[NEW]** `GET /admin/reports/wallet-balances` | admin | `currency?, top_n?` | top wallets |
| 26.3 | **[NEW]** `GET /admin/reports/activity` | admin | `from, to, sector?` | counts by type |
| 26.4 | **[NEW]** `GET /admin/reports/marketplace` | admin | `from, to` | GMV, disputes, settlement lag |
| 26.5 | **[NEW]** `GET /admin/reports/gaming` | admin | `season_id?` | participation, distribution % |
| 26.6 | **[NEW]** `GET /admin/reports/education` | admin | `from, to` | courses listed, tickets sold, payouts, ratings |

---

## 27. Event Logs (group `7KKtC-3r`) — AS-IS

`GET /logs/user/my_events`.

---

## 28. System / Files (group `KVaxK9ev`) — DONE

`GET /config`, `POST /files/upload`, `DELETE /files/{id}`. (Heavy media → Cloudinary per §1.4.1.)

---

## Time-Dependent Behaviour (Free-plan resolution)

Every clock-driven rule, and how it is satisfied **without a XANO scheduled task**:

| Behaviour | SRS | Resolution |
|---|---|---|
| Points-transfer 10-min window | §5.5 | Lazy on `/pending` & `/accept` |
| Marketplace 7-day auto-settle | §6.8 | Lazy on order read; `[CRON-OPTIONAL]` §25.5 |
| Marketplace 14-day no-proof → 30-day auto-refund | §6.8 | Lazy on order read |
| Investment liability `L_invest` accrual | §4.7 | Computed on demand `min(1.1X,(1.1X/365)·days)` |
| Investment payout due / overdue | §13.2.1 | Lazy on read; notify `[CRON-OPTIONAL]` |
| Season archival after end_date | §11.10 | Lazy on read; `[CRON-OPTIONAL]` |
| Election close at voting_end | §11.6 | Lazy on read OR admin §12.8; `[CRON-OPTIONAL]` |
| Course ticket auto-hide after last session | §12.4 | Lazy on listing read |
| Session auto-end 4h past scheduled end | §12.6.1 | Lazy on read |
| Zero-attendance auto-Completed | §12.8 | Lazy on read |
| Urgent amendment 6h auto-approve | §12.5 | Lazy on read; `[CRON-OPTIONAL]` |
| Loan annual phase debits | §9.5 | Lazy on loan read (sequential by Loan ID) |
| Contract listing auto-deactivate at deadline | §14.7 | Lazy on read |
| Group 24h deletion hold | §7.5.1 | Lazy on read; `[CRON-OPTIONAL]` |
| Backup Admin 72h inactivity | §15.2 | Lazy on backup access attempt; `[CRON-OPTIONAL]` |
| Notification email dispatch | §16 | Inline at event (no queue) |
| PTS rate 10s debounce | §17 | Cache row check on read |

---

## Cross-Cutting (SRS §17)

- **Atomicity:** every wallet mutation inside one `db.transaction`; immutable `ledger` + `wallet_transactions` rows; compensating-record fallback where multi-table atomicity is uncertain.
- **Wallet mutations only via `mutate_wallet`**; admin endpoints behind `require_admin`; all admin state-changes write `admin_audit_log`.
- **RBAC:** auth realm `839577`; `members.role_flags` JSON tracks simultaneous roles with documented restrictions enforced in app layer.
- **Negative-balance restrictions** (§14.4): block new contracts, marketplace listings, points transfers; offset on new token purchase.
- **DPDP 2023** (§17): consent at signup (timestamped); on closure anonymise identifiers (one-way Member-ID hash) while retaining ledger; erasure request endpoint.

---

## Build Sequence (Phases 1–15) — see SRS §18

P1–3 Foundation · P4 Points Economy (provisions, **budget**, activity table, transfers) · P5 **PTS live formula** · P6 Marketplace (**cart**, escrow, POD, disputes, settlement) + Proposals · P7 Gaming · **P8 Education (course-ticket model — rework)** · P9 Financial · P10 Notifications + Reports · P10A Search · P11 Groups · P12 Blog · P13 Loans · P14 Expense Tracker · P15 Contract.

---

*End of document.*
