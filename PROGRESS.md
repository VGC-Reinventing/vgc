# VGC XANO — Development Progress

**Spec:** [XANO_IMPLEMENTATION_PLAN.md](XANO_IMPLEMENTATION_PLAN.md) · **Requirements:** [API_REQUIREMENTS.md](API_REQUIREMENTS.md) · **Current state:** [API_REFERENCE.md](API_REFERENCE.md) · **Log:** [SESSION_LOG.md](SESSION_LOG.md)

> **Cursor file.** Update after every gap. Status: `[ ]` not started · `[~]` in-flight · `[x]` done · `[!]` blocked · `[obsolete]` superseded. Always work the lowest GAP-ID within the highest priority tier that still has open work.

> **✅ REV 5 (2026-06-02) — start here.** The entire **rev-4 backlog (GAP-100→140) is DONE and deployed** (255 endpoints / 28 groups). A line-by-line reconciliation of [API_REQUIREMENTS.md](API_REQUIREMENTS.md) (rev 4) against the live [API_REFERENCE.md](API_REFERENCE.md) + the `XANO/` pull found **four remaining gaps** to reach 100%. **Active work is the "Rev 5 Backlog" section below** — detailed with build steps in [PENDING_TASKS.md](PENDING_TASKS.md) and [XANO_IMPLEMENTATION_PLAN.md §5.1](XANO_IMPLEMENTATION_PLAN.md). **Work GAP-150 first.** The old cron gaps (GAP-009, GAP-026.02–07) remain obsolete — replaced by lazy evaluation (GAP-130, decision D9).

## Legend
- **P0** = blocks other work or fixes a production-correctness issue. Do these first.
- **P1** = required for the SRS phase to be functionally complete.
- **P2** = polish, cleanup, or later-phase features.

---

## P0 — Critical (do first)

| Status | ID | Title | Files touched | Sub-step | Notes |
|---|---|---|---|---|---|
| [x] | GAP-002 | Points Transfer: `GET /pending` must hide `pending_window` from receiver | `XANO/api/points_transfer/pending_GET.xs` | 2026-05-24 | Privacy/SRS §5.4 violation — FIXED. |
| [x] | GAP-003 | `POST /declarations` extend (payment_type, additional_details, anonymous flow) | `XANO/api/inr_forms/declarations_POST.xs`, `XANO/table/declarations.xs` | 2026-05-24 | Authenticated endpoint. Schema: draft status, nullable member_id, additional_details, contact_email/mobile. Status "draft" → submit separately. |
| [x] | GAP-005 | PTS group (rate / quote / convert / history) | `XANO/api/pts/*` | 2026-05-24 | 5 endpoints live: rate GET, quote POST, convert POST (idempotent, 4-leg wallet), history GET, admin rate PATCH. |
| [x] | GAP-006 | Replace `pts_rate_cache` with `pts_rate_current` + `pts_rate_history` | `XANO/table/pts_rate_current.xs`, `XANO/table/pts_rate_history.xs`, delete `XANO/table/pts_rate_cache.xs` | 2026-05-24 | Tables pushed previously; pts_rate_cache deleted via meta API (HTTP 200, 404 confirmed). |
| [!] | GAP-009 | Scheduled task `pts_transfer_window_expire` | `XANO/task/pts_transfer_window_expire.xs` | BLOCKED | Push rejected: "Please upgrade to access tasks." Xano plan must include scheduled tasks. File is validated and ready; unblock by upgrading the workspace plan. |
| [x] | GAP-010 | Marketplace `items` POST — lock to admin, add revenue share, buyer_info_schema, category_path | `XANO/api/marketplace/marketplace/items_POST.xs`, `XANO/table/marketplace_items.xs` | 2026-05-24 | SRS §6.3. |
| [x] | GAP-011 | Marketplace `orders` POST — convert immediate settlement → token hold | `XANO/api/marketplace/marketplace/orders_POST.xs`, `XANO/table/orders.xs` | 2026-05-24 | Q5 resolved — two-phase escrow with buyer `mark-received` early-release endpoint (see GAP-012). |

## P1 — Phase-complete features

| Status | ID | Title | Files touched | Sub-step | Notes |
|---|---|---|---|---|---|
| [x] | GAP-001 | Wallets: implement `/me/activity` and `/me/{currency}` | `XANO/api/wallets/me/activity_GET.xs`, `XANO/api/wallets/me/currency_GET.xs` | 2026-05-24 | Switch from public stub → `auth = "user"`. currency_GET: single wallet by type. activity_GET: paginated wallet_transactions joined with ledger, sorted newest first. |
| [x] | GAP-004 | `DELETE /declarations/{id}` for drafts | `XANO/api/inr_forms/declarations/id_DELETE.xs` | 2026-05-24 | Owner-only, draft-only delete. 404/403/400 guards. |
| [x] | GAP-007 | Activity Rewards group + catalog | `XANO/api/activity_rewards/*`, `XANO/table/activity_catalog.xs`, `XANO/table/activities.xs` | 2026-05-24 | 2 tables + 6 endpoints: public catalog GET, member activities POST (auto_award flow) + me GET, admin catalog POST/PATCH/DELETE. |
| [x] | GAP-012 | Marketplace new endpoints (categories tree, POD, **mark-received**, dispute, settle-request, cancel) | `XANO/api/marketplace/*` + 4 new tables | 2026-05-24 | 3 new tables (pod, disputes, settlements). Extended categories with parent_id/sector/icon/status. 9 new endpoints: tree GET, category PATCH/DELETE (admin), POD POST, mark-received POST (D5 full settlement), dispute POST, settle-request POST, cancel POST. |
| [x] | GAP-013 | Marketplace Proposals group | `XANO/api/proposals/*`, `XANO/table/marketplace_proposals.xs` | 2026-05-24 | 1 table + 6 endpoints: POST/GET (own), GET+PATCH+withdraw/{id} (member), admin decision (accept→creates item, request_changes, reject). |
| [x] | GAP-022 | Notifications group + tables | `XANO/api/notifications/*`, 2 new tables | 2026-05-25 | 2 tables (notifications 14-event enum, notification_preferences email=true/in_app=true defaults). emit_notification function. 5 endpoints: GET (unread_only filter), POST {id}/read, POST read-all, GET+PATCH preferences. |
| [x] | GAP-023 | `POST /admin/points/award` — un-hardcode admin_id | `XANO/api/admin/points/award_POST.xs`, `XANO/table/system_config.xs` | 2026-05-25 | Added admin_member_id to system_config. award endpoint reads cfg.admin_member_id ?? 1. Fixed require_admin call syntax. activity_ref stored (ref_id=0 fallback; no text→int filter in XanoScript). |
| [x] | GAP-024.02 | `POST /admin/points/transfer/{id}/resolve-dispute` | `XANO/api/admin/points/transfer/id/resolve_dispute_POST.xs`, `XANO/table/points_transfers.xs` | 2026-05-24 | Admin chooses refund_sender (credit escrow back) or release_to_receiver (debit sender + credit receiver). Added admin_refunded + admin_released to status enum. Calls log_admin_action. |
| [x] | GAP-024.03 | `POST /admin/marketplace/orders/{id}/resolve-dispute` | `XANO/api/admin/admin/marketplace/orders/id/resolve_dispute_POST.xs` | 2026-05-24 | full_refund (buyer credit), partial_refund (split buyer + proposer/admin), vendor_favour (full to proposer/admin). Writes settlement row for non-refund cases. Calls log_admin_action. |
| [x] | GAP-024.04 | `POST /admin/marketplace/orders/{id}/settle` | `XANO/api/admin/admin/marketplace/orders/id/settle_POST.xs` | 2026-05-24 | Admin manually settles pod_submitted or disputed order. Mirrors mark_received logic. Writes settlement row, calls log_admin_action. |
| [x] | GAP-024.05 | `POST /admin/marketplace/orders/auto-settle` | `XANO/api/admin/admin/marketplace/orders/auto_settle_POST.xs` | 2026-05-24 | Batch settle: queries all pod_submitted orders with expired dispute_window_ends_at, settles each via mutate_wallet + settlement row. Returns settled_ids[]. Calls log_admin_action. |
| [!] | GAP-026.02 | Scheduled task `marketplace_auto_settle` | `XANO/task/marketplace_auto_settle.xs` | BLOCKED | Plan upgrade needed (same as GAP-009). Logic complete; push will fail until Xano plan includes scheduled tasks. |
| [!] | GAP-026.03 | Scheduled task `investment_payouts_due_notifier` | `XANO/task/investment_payouts_due_notifier.xs` | BLOCKED | Plan upgrade needed. |
| [!] | GAP-026.04 | Scheduled task `season_archive` | `XANO/task/season_archive.xs` | BLOCKED | Plan upgrade needed. |

## P2 — Polish / later phases

| Status | ID | Title | Files touched | Sub-step | Notes |
|---|---|---|---|---|---|
| [x] | GAP-008 | `system_config` cleanup — remove `google_sheet_csv_url` | `XANO/table/system_config.xs`, `XANO/api/admin/admin/system/config_PATCH.xs` | 2026-05-24 | Removed field + input + conditional block. Also fixed require_admin call syntax in config_PATCH (was missing auth_context input). |
| [x] | GAP-014 | Gaming — Community | `XANO/api/gaming_community/*` + 3 new tables | 2026-05-24 | Phase 7. Tables: games, game_groups, game_group_members. api_group + 6 endpoints: GET /games, GET /games/{id}, POST/GET /games/{id}/groups, POST /groups/{id}/join (idempotent), POST /groups/{id}/leave (idempotent). |
| [x] | GAP-015 | Gaming — Elections | `XANO/api/gaming_elections/*` + 3 new tables | 2026-05-24 | Phase 7. Tables: pioneer_candidates, elections, votes. api_group + 9 endpoints: POST/GET pioneer-candidates, PATCH pioneer-candidates/{id} (locked on voting open), POST elections (admin), GET elections/{id} (with candidates+tallies), GET elections/me/eligibility, POST elections/{id}/vote (voting-rights check), admin POST close (refunds ≥3 votes) + cast-tiebreak. |
| [x] | GAP-016 | Gaming — Seasons & Events | `XANO/api/gaming_seasons/*` + 6 new tables | 2026-05-24 | Phase 7. Tables: seasons, season_committee, events, event_submissions, event_results, season_funding. api_group + 12 endpoints: GET/GET {id} seasons, POST committee (pioneer only, upsert), POST results (credits VGC Points per entry), POST submissions, GET submissions (pioneer/admin), GET events, POST deposit (50/50 split + pts_rate conversion), GET ledger, admin POST start (lock), archive, close-and-settle (10/8/8 split). |
| [x] | GAP-017 | Education — Teachers | `XANO/api/edu_teachers/*` + 6 new tables | 2026-05-24 | Phase 8. 6 tables + api_group + 10 endpoints: applications POST/GET, me/chapters GET, duties POST (appointed, upsert), duties GET, independent tickets POST (50-token fee), payout_request POST (90%), admin decision POST, admin verify POST (60 tokens if all 6 duties). |
| [x] | GAP-018 | Education — Sessions & Reviews | `XANO/api/edu_sessions/*` + 5 new tables | 2026-05-24 | Phase 8. 5 tables (student_submissions, review_sessions, review_session_submissions, review_session_qa, review_session_participants) + api_group + 7 endpoints: POST/GET(me) student-submissions, admin POST review (tokens 0–20), admin POST review-sessions (with submission_ids list), POST {id}/qa (host, auto-credit per entry + 20% pool cap host share), POST {id}/participants (idempotent, +1 token), GET {id} (public, session+qa+count). |
| [x] | GAP-019 | Financial — Donors | `XANO/api/fin_donor/*`, `XANO/table/donors.xs` | 2026-05-24 | Phase 9. 1 table (donors) + api_group + 4 endpoints: GET /donors (feed, anonymous=Anonymous), GET /donors/{id} (named only), admin POST donations/{declaration_id}/publish (verified Donation/Grant declarations only, idempotent check), admin PATCH donors/{id} (display fields). |
| [x] | GAP-020 | Financial — Sponsorships | `XANO/api/fin_sponsor/*` + 3 new tables | 2026-05-24 | Phase 9. 3 tables (sponsorships, sponsorship_refunds, sponsorship_recognitions) + api_group + 6 endpoints: POST/GET sponsorships, GET {id} (with conditions_met_pct + recognition), admin POST progress (auto-complete at 100%), admin POST refund (refund record + status=refunded in tx), admin POST recognize (upsert). |
| [x] | GAP-021 | Financial — Investments | `XANO/api/fin_invest/*` + 2 new tables | 2026-05-25 | Phase 9. 2 tables (investments, investment_payouts) + api_group + 6 endpoints: POST /investments (auto-generates payout schedule: Option A=1 lumpsum at 365d×1.1, Option B=4 quarterly at 90/180/270/365d), GET /investments/me, GET /investments/{id} (owner or admin), admin GET /investments (status+due_within_days filters), admin POST mark-paid (auto-completes investment when all payouts paid), admin GET /investments/due (pending payouts by date range). |
| [x] | GAP-024.06 | `POST /admin/games` | `XANO/api/admin/admin/games/create_POST.xs` | 2026-05-25 | Admin creates game record with name, icon_url, description, status. |
| [x] | GAP-024.07 | `PATCH /admin/games/{id}` | `XANO/api/admin/admin/games/id/update_PATCH.xs` | 2026-05-25 | Admin updates game fields via null-coalesce. |
| [x] | GAP-024.08 | `POST /admin/teachers/appointed/{id}/duty-rate` | `XANO/api/admin/admin/teachers/appointed/id/duty_rate_POST.xs`, `XANO/table/teachers.xs` | 2026-05-25 | Added tokens_per_chapter int? to teachers table. Endpoint validates appointed type, updates field. verify endpoint uses ?? 60. |
| [x] | GAP-024.09 | `POST /admin/wallets/mint` | `XANO/api/admin/admin/wallets/mint_POST.xs` | 2026-05-25 | Credits points to member via mutate_wallet, audit-logged with provision_type + reason. |
| [x] | GAP-024.10 | `POST /admin/elections/{id}/voting-rights-price` | `XANO/api/admin/admin/elections/id/voting_rights_price_POST.xs` | 2026-05-25 | Updates price_tokens on the linked marketplace_items row. Guards: election exists, has voting_rights_marketplace_item_id. |
| [x] | GAP-024.11 | `POST /admin/members/{id}/impersonate` | `XANO/api/admin/admin/members/id/impersonate_POST.xs` | 2026-05-25 | 24h TTL (user decision). require_admin + member 404 guard + security.create_auth_token + log_admin_action audit trail. |
| [x] | GAP-025 | Admin Reports group | `XANO/api/admin_reports/*` | 2026-05-25 | Phase 10. api_group 'Admin Reports' (canonical=admin-reports) + 6 endpoints: financial-summary (ledger aggregation by currency/side in date range), wallet-balances (top N by balance, currency filter), activity (counts by type via foreach), marketplace (GMV + dispute rate), gaming (season-scoped participation + rewards), education (chapters verified, tickets sold, review tokens). All aggregation via foreach — no raw SQL needed. |
| [!] | GAP-026.05 | Scheduled task `election_close_when_window_ends` | `XANO/task/election_close_when_window_ends.xs` | BLOCKED | Plan upgrade needed. |
| [!] | GAP-026.06 | Scheduled task `notification_email_dispatcher` | `XANO/task/notification_email_dispatcher.xs` | BLOCKED | Plan upgrade needed + RESEND_API_KEY env var required. |
| [!] | GAP-026.07 | Scheduled task `independent_teacher_active_ticket_audit` | `XANO/task/independent_teacher_active_ticket_audit.xs` | BLOCKED | Plan upgrade needed. |

---

## Open Questions — RESOLVED 2026-05-24

All eight questions decided. Implementation rules below are binding for the gaps listed.

| Q | Decision | Affects |
|---|---|---|
| Q1 | **Add `draft` to the `declarations.status` enum.** New values: `["draft", "pending", "verified", "rejected"]`. `POST /declarations` creates rows as `draft`; `POST /{id}/submit` flips to `pending`. Existing rows remain valid (already past draft). | GAP-003, GAP-004 |
| Q2 | **Yes — anonymous donors must provide `contact_email`.** Stored on the declaration; never shown publicly; used for receipts and refund coordination. | GAP-003 |
| Q3 | **Confirmed:** rate is admin-managed and dynamic. Semantics: `pts_rate_current.rate` = VGC Points per 1 VGC Token. Quote math: `points_to_tokens` → `receive = net / rate`; `tokens_to_points` → `receive = net * rate`. | GAP-005 |
| Q4 | **Add `admin_member_id int? { table = "user" }` to `system_config`.** Read in every wallet-counter-entry as `$cfg.admin_member_id ?? 1`. Seed with the actual admin's user.id after first deploy. | GAP-023, all admin counter-entries |
| Q5 | **Two-phase escrow with buyer-initiated early release.** Order placed → buyer debited to escrow (status `pending_pod`). Proposer submits POD → status `pod_submitted`, dispute window opens. Buyer can `POST /orders/{id}/mark-received` for immediate settle. Buyer can `POST /orders/{id}/dispute` within window. Cron auto-settles after window expires with no action. Window length stays configurable via `system_config.marketplace_dispute_window_days`. | GAP-011, GAP-012 |
| Q6 | **Switch idempotency to an input field, not a header.** All new POSTs that need idempotency take `idempotency_key text?` in `input { }`. Existing `idempotency_lookup` / `idempotency_store` functions unchanged. Existing `points-transfer` keeps its header pattern (works); migrate later in a P2 cleanup. | GAP-005, GAP-011, GAP-015, GAP-020, GAP-021, others |
| Q7 | **Notification defaults: in-app ON and email ON for all 14 events.** Users can opt out per-event via `notification_preferences.per_event`. | GAP-022 |
| Q8 | **One-time fee, 50 VGC Tokens per active ticket** (per SRS §8.4). No recurring charge. Member can have N active tickets by paying N × 50. Payout: 90% of total sales per ticket; 10% admin share; payout eligible only once all sessions under that ticket are completed. | GAP-017 |

---

## Rev 4 Backlog (SRS v2.2 / API_REQUIREMENTS rev 4) — ✅ COMPLETE

All 15 rev-4 gaps deployed (2026-05-30 → 2026-06-01). Detail + acceptance criteria in [XANO_IMPLEMENTATION_PLAN.md §5.2](XANO_IMPLEMENTATION_PLAN.md). Retained below as the as-built record.

### P0 — structural rework (do first)

| Status | ID | Title | SRS / Req | Notes |
|---|---|---|---|---|
| [x] | GAP-100 | PTS **live-formula** rework + admin components/θ/reserve/bootstrap/audit | §4 / §7 | Both phases complete. Deployed: full formula (r_eq, r_published, R_user, time-drift, floor/threshold), GET /pts/rate + POST /quote/convert (live rate), L_invest on-demand, P_net guard, GET /admin/pts/audit-log. Conversion suspended when P_net ≤ 0 or r_published < 0.00011. last_conversion_at reset on each convert (time-idle counter). 270 docs deployed 2026-05-30. |
| [x] | GAP-140 | Education **course-ticket** rework (retire GAP-017/018) | §12 / §14 | Retired 11 tables + 2 API groups + 3 admin endpoints (v1 model). Built 5 new tables (courses, sessions, enrollments, session_ratings, course_amendments) + Education API group + 18 endpoints. Enrollment auto-created at order purchase for course_ticket items. Lazy: auto-hide, auto-end 4h, zero-attendance, urgent amendment 6h. 265 docs 2026-05-30. |

### P1 — new modules / onramps

| Status | ID | Title | SRS / Req | Notes |
|---|---|---|---|---|
| [x] | GAP-110 | Marketplace **cart** (same-vendor, stale-item, atomic checkout) | §6.6 / §9.3–9.6 | 2 tables (carts, cart_items) + Cart api_group + 4 endpoints. 2026-05-31. |
| [x] | GAP-111 | Monthly **minting budget** + activity-table versioning | §5.3–5.4 / §8 | 3 tables (points_minting_budget, points_minting_log, activity_catalog_changelog) + 3 endpoints (GET /activity-rewards/changelog, POST/GET /admin/points/budget). Budget blocks promotional auto-award in activities_POST and award_POST. Admin catalog POST/PATCH/DELETE now write changelog entries. 2026-05-31. |
| [x] | GAP-112 | Public **donor/sponsor/investor** onramps | §13 / §6,§16,§17 | `create_declaration` fn + `POST /declarations/public` (truly-public, Donation/Grant/Sponsorship, contact_email required) + `POST /sponsorships` + `POST /investments` auth dropped (public-or-member). Tables: sponsorships +sponsor_display_name/sponsor_email; investments +investor_display_name/investor_email/investor_mobile. 280 docs 2026-05-31. |
| [x] | GAP-120 | **Groups** module | §7 / §20 | 6 tables (member_groups, member_group_members, group_posts, group_post_comments, group_post_reactions, group_invites) + Groups api_group + 17 endpoints. Lazy 24h delete. 304 docs 2026-05-31. |
| [x] | GAP-121 | **Blog** module (likes/comments, Revenue Generator) | §8 / §21 | 4 tables (blogs, blog_likes, blog_comments, blog_readers) + Blog api_group + 13 endpoints. Notifications +5 events. marketplace_proposals +ref_blog_id. Proposals decision extended for blog_rg_ticket activation + grandfathering snapshot. 322 docs 2026-05-31. |
| [x] | GAP-122 | **Loan to Members** (3-phase, lazy debits) | §9 / §22 | 3 tables (loans, loan_debits, loan_repayments) + mutate_wallet_unchecked fn + 6 endpoints. Lazy Y2/Y3+ debits on GET /loans/me. 333 docs 2026-05-31. |
| [x] | GAP-123 | **Expense Tracker** (personal + Platform Outflow) | §10 / §23 | 1 table (expenses) + Expenses api_group + 4 endpoints. Platform Outflow debits Admin INR ledger atomically. Dashboard aggregates on me GET. 339 docs 2026-05-31. |
| [x] | GAP-124 | **Contract** (escrow, escalation, penalty cascade, force-close) | §14 / §24 | 4 tables (contracts, contract_applications, contract_ratings, contract_disputes) + Contracts api_group + 13 endpoints. Lazy deadline auto-expire + VGC escrow refund. Caps Taker 2 / Giver 10. 357 docs 2026-05-31. |
| [x] | GAP-125 | Admin additions (rate-change, contract resolve, groups moderate, backup-admin, vacation-mode, audit-log) | §15 / §25 | 2026-06-01. 1 new table (rate_announcements), system_config +2 fields, notifications +2 event types, 6 new admin endpoints. 364 docs. |
| [x] | GAP-126 | Sponsorship dispute window + public overdue-investment count | §13.4,§13.2.1 / §16.5,§17.4 | 2026-06-01. 2 new tables (sponsorship_disputes, investment_overdue_requests) + sponsorships.documented_at field + progress endpoint sets documented_at. 3 new endpoints: POST /sponsorships/{id}/dispute (7-day window, member or email-verified public), GET /investments/overdue-count (public, lazy), POST /investments/{id}/overdue-request (>30d overdue, member). 369 docs. |

### P2 — hardening / cleanup

| Status | ID | Title | SRS / Req | Notes |
|---|---|---|---|---|
| [x] | GAP-130 | Lazy-evaluation sweep (replace all cron reliance) | §1.4.1 | 2026-06-01. Deleted `pts_transfer_window_expire.xs.pending`. 6 endpoints patched with lazy logic: `pending_GET` + `accept_POST` (pts window expire), `orders/id_GET` (marketplace auto-settle), `seasons_GET` + `seasons/id_GET` (season archive), `elections/id_GET` (election close + tally + deposit refunds). 369 docs. |
| [x] | GAP-131 | Admin 2FA TOTP + Backup-Admin trigger | §15.2 | 2026-06-01. 3 tables (admin_totp, admin_login_events, admin_mfa_challenges) + 6 endpoints: POST /admin/2fa/setup, verify-setup (auth admin), login (public, lockout, email OTP via security.create_uuid), verify, recover (public), GET /admin/backup-admin/status (lazy 72h). Syntax notes: security.create_uuid not uuid keyword; |add_secs_to_timestamp:(N|to_int) not transform_timestamp; no var inside conditionals; no filters in data={}; } else must be on separate line. 378 docs. |
| [x] | GAP-132 | Phase-1 hardening: under-18 guardian, DPDP consent, rate-limit, device fingerprint | §2.1.2,§2.4,§17 | 2026-06-01. 3 new tables (guardian_approvals, rate_limit_counters, data_erasure_requests) + user table +5 fields (consent_given_at, device_fingerprint, registration_ip, guardian_member_id, is_minor) + notifications +3 events. Function check_rate_limit. 7 new endpoints: guardian-registration POST, guardian-approvals/me GET, guardian-approvals/{id}/respond POST, resend-verification POST, erasure-request POST/GET, admin/members/{id}/process-erasure POST. signup_POST extended with consent + device_fingerprint + dob + rate-limit. 389 docs. |

---

## Rev 5 Backlog (reconciliation gaps → 100%) — ACTIVE WORK

Found by the rev-5 diff of API_REQUIREMENTS.md vs API_REFERENCE.md + `XANO/` pull (2026-06-02). Detail + build steps in [PENDING_TASKS.md](PENDING_TASKS.md); spec blocks in [XANO_IMPLEMENTATION_PLAN.md §5.1](XANO_IMPLEMENTATION_PLAN.md). Work lowest open ID in highest open tier. **Start: GAP-150.**

| Status | ID | Tier | Title | SRS / Req | Notes |
|---|---|---|---|---|---|
| [x] | GAP-150 | P1 | **Search** module — `GET /search` cross-module, visibility-filtered | §17 / §19 | Deployed 2026-06-03. New group `search` (canonical=search) + 1 endpoint → {marketplace, groups, blog}; visibility-filtered (private groups, RG blogs, inactive items excluded). No new tables. |
| [x] | GAP-151 | P1 | **Season distribution-records** — `POST /seasons/{id}/distribution-records` | §11.11 / §13.11 | Deployed 2026-06-03. New table `season_distribution_records` + pioneer-only endpoint + amended `close-and-settle` to sum records for `distribution_pct` / `target_met` (≥80%). |
| [x] | GAP-141 | P2 | **Education v1 cleanup** | §14 / D10 | Deployed 2026-06-03. Legacy `POST /admin/student-submissions/{id}/review` now returns 404 (`precondition (false)`). Orphan v1 edu tables already cleaned in GAP-140. Normalization duplicates (financial_*, admin_reports/admin, 2_fa) cleaned. |
| [x] | GAP-142 | P2 | **Spec deviations** | §6.2, §7.1 | Deployed 2026-06-03. (1) Category tree extended to 8 levels — `max_depth?=8` input now actually recurses. (2) `GET /pts/rate` tightened to `auth = "user"` (member-only). |

---

## Tally
- **Foundation (GAP-001..026):** 33 done. PTS + Education portions superseded by GAP-100 / GAP-140.
- **Obsolete:** GAP-009 + GAP-026.02–07 (cron) → folded into GAP-130 (lazy eval, decision D9). No Xano plan upgrade needed.
- **Rev 4 backlog:** ✅ COMPLETE (15/15). GAP-100, GAP-140, GAP-110, GAP-111, GAP-112, GAP-120, GAP-121, GAP-122, GAP-123, GAP-124, GAP-125, GAP-126, GAP-130, GAP-131, GAP-132.
- **Rev 5 backlog:** ✅ COMPLETE (4/4). GAP-150, GAP-151, GAP-141, GAP-142 all deployed 2026-06-03.
- **🎉 100% of API_REQUIREMENTS.md (rev 4 / SRS v2.2) — all 4 remaining gaps closed.**
- **Deployed now: 257 endpoints across 29 groups (393 docs).**
