# VGC Reinventing — API Reference

**Last updated:** 2026-06-13  
**Source:** XANO workspace 161992, branch `v1`, 403 documents  
**Instance:** `https://x8ki-letl-twmt.n7.xano.io`  
**Base URL pattern:** `https://x8ki-letl-twmt.n7.xano.io/api:<canonical>/<path>`

---

## Auth Pattern

| Token type | How to obtain | TTL | Header |
|---|---|---|---|
| Member Bearer | `POST /api:L9PANOan/login` → `{token}` | 24h | `Authorization: Bearer <token>` |
| Admin Bearer | `POST /api:EOOlx4pf/admin/2fa/login` → challenge, then `POST /admin/2fa/verify` → `{token}` | 24h | `Authorization: Bearer <token>` |

Auth column legend: **public** = no token required · **member** = member Bearer · **admin** = admin Bearer

---

## Groups (29 total)

| # | Group | Canonical | Base URL |
|---|---|---|---|
| 1 | Authentication | `L9PANOan` | `.../api:L9PANOan` |
| 2 | User_Profile | `_CJw8MFH` | `.../api:_CJw8MFH` |
| 3 | System | `KVaxK9ev` | `.../api:KVaxK9ev` |
| 4 | Wallets | `wallets` | `.../api:wallets` |
| 5 | INR Forms (Declarations) | `declarations` | `.../api:declarations` |
| 6 | Token Surrenders | `token-surrender` | `.../api:token-surrender` |
| 7 | Points Transfer | `points-transfer` | `.../api:points-transfer` |
| 8 | Activity Rewards | `activity-rewards` | `.../api:activity-rewards` |
| 9 | Blog | `blog` | `.../api:blog` |
| 10 | Notifications | `dID-7x7G` | `.../api:dID-7x7G` |
| 11 | Search | `search` | `.../api:search` |
| 12 | Marketplace | `EiCwBjsO` | `.../api:EiCwBjsO` |
| 13 | Cart | `O-OY5IE_` | `.../api:O-OY5IE_` |
| 14 | Proposals | `proposals` | `.../api:proposals` |
| 15 | Groups | `BiZZDMxu` | `.../api:BiZZDMxu` |
| 16 | Gaming Community | `gaming-community` | `.../api:gaming-community` |
| 17 | Gaming Elections | `gaming-elections` | `.../api:gaming-elections` |
| 18 | Gaming Seasons | `gaming-seasons` | `.../api:gaming-seasons` |
| 19 | Education | `education` | `.../api:education` |
| 20 | Financial Donors | `fin-donor` | `.../api:fin-donor` |
| 21 | Financial Investments | `fin-invest` | `.../api:fin-invest` |
| 22 | Financial Sponsors | `fin-sponsor` | `.../api:fin-sponsor` |
| 23 | Contracts | `sXgmF9KL` | `.../api:sXgmF9KL` |
| 24 | Loans | `ZR6bC4we` | `.../api:ZR6bC4we` |
| 25 | Expenses | `XcifSN8G` | `.../api:XcifSN8G` |
| 26 | Admin | `EOOlx4pf` | `.../api:EOOlx4pf` |
| 27 | Admin Reports | `admin-reports` | `.../api:admin-reports` |
| 28 | Event Logs | `7KKtC-3r` | `.../api:7KKtC-3r` |

---

## 1 — Authentication
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:L9PANOan`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /signup | public | name, email, password, consent_given, dob?, device_fingerprint?, client_ip? | Creates account; auto-creates 3 wallets (inr/token/points); generates VGC\<id\> member_id |
| POST | /login | public | email, password | Returns `{token}` (24h Bearer) |
| GET | /me | member | — | Current user; strips password fields; role_flags nested (`is_admin`, `is_pioneer`) |
| POST | /verify-email | public | token | Validates email OTP token; sets email_verified_at |
| POST | /resend-verification | public | email | Resends email OTP; rate-limited 5/hour |
| POST | /verify-mobile | member | otp | Verifies mobile OTP |
| POST | /change-password | member | current_password, new_password | Updates password |
| GET | /reset/request-reset-link | public | email | Generates password reset magic link (emailed) |
| POST | /reset/magic-link-login | public | magic_token, email | Exchanges magic token for auth token |
| POST | /reset/update-password | member | password, confirm_password | Sets new password in reset flow |
| POST | /guardian-registration | public | name, dob, email, mobile?, guardian_member_id, consent_given, device_fingerprint?, client_ip? | Register minor; requires guardian approval within 7 days |
| GET | /guardian-approvals/me | member | — | List pending guardian approvals for this guardian |
| POST | /guardian-approvals/{id}/respond | member | id, decision (approve/reject), rejection_reason? | Guardian approves/rejects; auto-creates account on approval |
| POST | /message/send-welcome-email | public | user_id | Send welcome email to user |

---

## 2 — User Profile
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:_CJw8MFH`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /profile | member | — | Full profile + wallet balances |
| PATCH | /profile | member | name?, mobile?, city?, state?, country?, dob?, avatar_file_id? | Update profile; changing mobile clears mobile_verified_at |
| GET | /lookup | member | query (min 3 chars) | Search members by member_id / name / email. Returns `[{id, member_id, name, city, avatar_url}]` up to 20 results. `id` is the numeric row id (use as `to_member_id` in points transfer). |
| GET | /roles | member | — | Returns roles and restrictions |
| GET | /erasure-request | member | — | DPDP 2023: check erasure status |
| POST | /erasure-request | member | request_reason? | DPDP 2023: request personal data erasure (ledger retained) |

---

## 3 — System (Config & Files)
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:KVaxK9ev`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /config | public | — | `{inr_per_token, surrender_rate, tax_pct, max_category_depth, dispute_window_days, pts_rate}` |
| POST | /files/upload | member | file (field name `file`), purpose | purpose enum: `declaration_proof`, `pod`, `kyc`, `avatar`, `event_submission`, `blog_attachment`, `cv`, `icon`. Returns `{file_id, url, mime, size_bytes}` |
| DELETE | /files/{id} | member | id | Delete file; owner or admin only |

---

## 4 — Wallets
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:wallets`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /me | member | — | All 3 wallets; auto-creates if empty. Currency values: `inr`, `token`, `points` (lowercase in DB, map to INR/VGC_TOKEN/VGC_POINTS in FE) |
| GET | /me/{currency} | member | currency | Single wallet: `INR`, `VGC_TOKEN`, or `VGC_POINTS` |
| GET | /me/activity | member | page?=1, per_page?=25 | Paginated transaction history. Returns `{items, itemsTotal, curPage, nextPage}`. Each item has top-level: `currency`, `side`, `amount`, `balance_after`, `description`, `ref_type`, `blog_id?`, `blog_title?` |

---

## 5 — INR Forms (Declarations)
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:declarations`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /declarations | public/member | amount, payment_type (Donation/Grant/Sponsorship/Investment/Token Purchase), description?, file_url?, contact_email?, contact_mobile?, additional_details? | Investment & Token Purchase require member auth |
| GET | /list | member | — | List member's declarations |
| GET | /declarations/{id} | member | id | Get declaration |
| POST | /declarations/{id}/submit | member | id | Submit for admin review |
| DELETE | /declarations/{id} | member | id | Delete draft |
| PATCH | /declarations/{id}/verify | admin | id | Verify declaration |
| PATCH | /declarations/{id}/reject | admin | id | Reject declaration |

---

## 6 — Token Surrenders
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:token-surrender`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /create | member | vgc_token_amount, conversion_rate | Create surrender; checks token balance |
| GET | /list | member | — | List member's surrenders |
| GET | /{id} | member | id | Get surrender details |
| PATCH | /{id}/complete | admin | id | Admin: mark complete (transfers INR) |

---

## 7 — Points Transfer
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:points-transfer`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /points-transfer | member | to_member_id (int row id), amount, remark?, idempotency_key? | **Instant, atomic.** Single transaction: debits sender, credits receiver, writes passbook entries for both. Returns `{transfer_id, status:"completed", amount}`. |
| GET | /passbook | member | page?=1, per_page?=50 | Paginated passbook. Returns `{items:[{id, timestamp, entry_type, amount, debit_credit, related_member_id, remark, related_member:{full_name,member_id_code}}], itemsTotal, curPage, nextPage}`. |
| GET | /pending | member | direction? | Legacy endpoint — returns empty list (no transfers are ever in pending state). |
| POST | /{id}/accept | member | id | Legacy — not used. |
| POST | /{id}/cancel | member | id | Legacy — not used. |
| POST | /{id}/dispute | member | id | Legacy — not used. |
| POST | /admin/points/transfer/{id}/resolve-dispute | admin | id | Admin: resolve dispute (legacy). |

---

## 8 — Activity Rewards
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:activity-rewards`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /catalog | public | — | Active reward catalog; `{version, effective_from, activities:[]}` |
| GET | /changelog | public | — | Catalog change history |
| POST | /activities | member | activity_code, entity_ref, metadata? | Log activity; auto-awards points if budget available |
| GET | /activities/me | member | — | Member's activity log |
| POST | /admin/catalog | admin | activity_code, default_reward, provision_type, auto_award, active | Create catalog entry |
| PATCH | /admin/catalog/{id} | admin | id, ... | Update entry |
| DELETE | /admin/catalog/{id} | admin | id | Delete entry |

---

## 9 — Blog
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:blog`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /blog/public | public | sector?, tag? | Published blogs; enriched with `author_name`, `is_rg`, `published_at`, `like_count`, `comment_count`. `sector` and `tag` are server-side exact filters. Text search (title/author/tags) is applied client-side — no `search` param accepted. |
| GET | /blog/me | member | status?, page?=1, per_page?=20 | Author's own blogs (all statuses except abandoned) |
| POST | /blog | member | title, content, sector?, tags?, comments_enabled?, revenue_generator?, ticket_price_tokens? | Create draft |
| GET | /blog/{id} | member | id | Full blog; returns `is_locked`, `is_author`, `is_admin`, `user_vote`, `like_count`, `dislike_count`, `comments[]` (enriched with `member_name`). RG lock logic: locked if `revenue_generator=true` AND (`marketplace_item_id=null` OR no settled order/blog_readers entry) |
| PATCH | /blog/{id} | member | id, title?, content?, sector?, tags?, comments_enabled?, revenue_generator?, ticket_price_tokens? | Edit (draft or rejected only) |
| DELETE | /blog/{id} | member | id | Delete (never-published, 0 points only) |
| POST | /blog/{id}/publish | member | id | Self-publish; if RG + ticket_price_tokens > 0: auto-creates `marketplace_items` row under "Blog Tickets" category, sets `blog.marketplace_item_id`. Atomic transaction. Returns `{status, ticket_item_id}` |
| POST | /blog/{id}/submit | member | id | Submit for admin review; enforces 1-in-review slot limit (config: `blog_in_review_default_limit`) |
| POST | /blog/{id}/abandon | member | id, allow_monetisation | Transfer blog to VGC Admin control; removed from feed |
| POST | /blog/{id}/like | member | id | Like; first vote awards `blog_vote_voter_pts` to voter + `blog_like_author_pts` to author; vote switch: no points; self-vote blocked (400) |
| POST | /blog/{id}/dislike | member | id | Dislike; same points logic as like; self-vote blocked |
| POST | /blog/{id}/comments | member | id, content | Post comment on published, unlocked blog |
| POST | /blog/{id}/bookmark | member | id | Toggle bookmark — adds row if not bookmarked, deletes if already saved; returns `{bookmarked: bool}` |
| GET | /blog/bookmarks/me | member | — | Current member's bookmarked blogs (newest first); enriched with `author_name`, `like_count`, `comment_count`, `is_rg`, `published_at`; published-only (drafts/taken-down skipped) |
| GET | /admin/blog | admin | status?, sector?, page?, per_page? | Admin: list blogs by status and optional sector (Gaming/Education/Financial/General) |
| POST | /admin/blog/{id}/approve | admin | id, points_awarded | Approve blog → published; awards Constitutional points to author (+ 30% to admin); if RG + ticket_price_tokens > 0: auto-creates marketplace ticket under "Blog Tickets" category. Returns `{status, points_awarded, ticket_item_id}` |
| POST | /admin/blog/{id}/reject | admin | id, reject_reason | Reject blog; returns to draft with reason |
| POST | /admin/blog/{id}/takedown | admin | id, takedown_reason | Take down published blog |

---

## 10 — Notifications
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:dID-7x7G`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /notifications | member | unread_only?, page?, per_page? | Paginated inbox; newest first |
| POST | /notifications/{id}/read | member | id | Mark single notification read |
| POST | /notifications/read-all | member | — | Mark all unread read; returns count |
| GET | /notifications/preferences | member | — | Per-event in_app + email preferences |
| PATCH | /notifications/preferences | member | email?, in_app?, per_event? | Update preferences |

---

## 11 — Search
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:search`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /search | member | q, sector?, category?, limit?=20 | Cross-module: marketplace items (active), discoverable groups, published blogs. Respects visibility rules |

---

## 12 — Marketplace
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:EiCwBjsO`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /marketplace/categories | public | — | Flat list of active categories |
| GET | /marketplace/categories/tree | public | root_id?, max_depth?=8 | Nested tree (max 8 levels) |
| GET | /marketplace/items | member | category_id?, search?, page?, per_page? | Active items; use `title` field for display name |
| POST | /marketplace/items | admin | seller_id, category_path_ids[], title, description, price, currency, stock, item_type?, proposing_member_id?, revenue_share_proposer_pct, revenue_share_admin_pct, buyer_info_schema? | Admin: create item directly |
| GET | /marketplace/items/{id} | member | id | Item detail; `title` is the display name |
| PATCH | /marketplace/items/{id} | member | id, title?, description?, price?, stock?, status? | Seller update |
| DELETE | /marketplace/items/{id} | member | id | Seller delete |
| GET | /marketplace/orders | member | — | Buyer's orders |
| POST | /marketplace/orders | member | item_id, quantity, buyer_info, idempotency_key? | Place order; debit buyer (escrow). For `blog_rg_ticket`: quantity must be 1; 400 if member has an existing active order for the same item. |
| GET | /marketplace/orders/{id} | member | id | Order detail; lazy auto-settle if dispute window expired |
| GET | /marketplace/sales | member | — | Seller's sales with order counts |
| POST | /marketplace/orders/{id}/cancel | member | id | Cancel pending order; reverses hold |
| POST | /marketplace/orders/{id}/proof-of-delivery | member | id, proof_url?, notes? | Submit proof of delivery |
| POST | /marketplace/orders/{id}/mark-received | member | id | Mark received; starts dispute window |
| POST | /marketplace/orders/{id}/dispute | member | id, reason | Dispute delivered order |
| POST | /marketplace/orders/{id}/settle-request | member | id | Request settlement after window |
| GET | /admin/marketplace/orders | admin | — | Admin: all orders |
| PATCH | /admin/marketplace/orders/{id}/fulfill | admin | id | Admin: fulfill order |
| POST | /admin/marketplace/orders/{id}/resolve-dispute | admin | id | Admin: resolve dispute |
| POST | /admin/marketplace/orders/{id}/settle | admin | id | Admin: force settle |
| POST | /admin/marketplace/orders/auto-settle | admin | — | Admin: batch settle all past-window orders |
| GET | /admin/marketplace/items | admin | — | Admin: all items |
| PATCH | /admin/marketplace/items/{id} | admin | id, ... | Admin: update any item |
| GET | /admin/marketplace/categories | admin | — | Admin: list categories |
| POST | /admin/marketplace/categories | admin | name, description?, parent_id?, sector?, active?, status? | Admin: create category |
| PATCH | /admin/marketplace/categories/{id} | admin | id, ... | Admin: update category |
| DELETE | /admin/marketplace/categories/{id} | admin | id | Admin: delete category |

---

## 13 — Cart
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:O-OY5IE_`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /cart | member | — | Carts grouped by vendor; includes enriched items and totals |
| POST | /cart/items | member | item_id, quantity | Add to cart; one cart per vendor; upserts if item already in cart. For `blog_rg_ticket`: quantity must be 1; 400 if member has an existing active order for the same item. |
| DELETE | /cart/items/{id} | member | id | Remove from cart |
| POST | /cart/checkout | member | cart_id, buyer_info? | Atomic checkout; removes stale items, re-checks balance, creates orders |

---

## 14 — Proposals
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:proposals`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /proposals | member | status?, page?, per_page? | Member's proposals (draft/submitted/changes_requested/accepted/rejected/withdrawn) |
| POST | /proposals | member | item_name, description, sector, suggested_category_path, item_type, suggested_price_tokens, proposed_revenue_share_pct, buyer_info_schema, attachments?, ref_blog_id? | Submit proposal; status set to `submitted` automatically |
| GET | /proposals/{id} | member | id | Get proposal |
| PATCH | /proposals/{id} | member | id, ... | Update draft/rejected proposal |
| POST | /proposals/{id}/withdraw | member | id | Withdraw submitted proposal |
| POST | /admin/proposals/{id}/decision | admin | id, decision (accept/request_changes/reject), reason?, category_path_ids?, revenue_share_proposer_pct?, revenue_share_admin_pct? | Admin: action proposal; `accept` creates marketplace item and notifies proposer |

---

## 15 — Groups
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:BiZZDMxu`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /groups | member | — | Discoverable groups |
| POST | /groups | member | name, description, group_type (public/private), sector? | Create group |
| GET | /groups/{id} | member | id | Group details |
| POST | /groups/{id}/join | member | id | Join public group or send join request (private) |
| POST | /groups/{id}/leave | member | id | Leave group. Returns `{left:true, group_deleted:bool}`. Sole admin → group auto-deleted (`group_deleted:true`). Admin with other members → 400. |
| POST | /groups/{id}/invite | member | id, member_id | Invite to private group (admin/co-admin only) |
| POST | /groups/{id}/invites/{inv_id}/respond | member | inv_id, decision (accept/decline) | Respond to invite |
| POST | /groups/{id}/join-requests/{req_id}/decision | member | req_id, decision (approve/reject) | Group admin: action join request |
| POST | /groups/{id}/promote-coadmin | member | id, member_id | Promote to co-admin |
| POST | /groups/{id}/transfer-admin | member | id, member_id | Transfer group admin |
| POST | /groups/{id}/remove-member | member | id, member_id | Remove member |
| POST | /groups/{id}/appeal-removal | member | id | Appeal removal |
| POST | /groups/{id}/delete | member | id | Delete group (24h hold) |
| GET | /groups/{id}/members | member | id | Active members with roles + names (admin/co-admin only). Returns `{members:[{id,member_id,name,member_id_str,role,joined_at}]}` |
| GET | /groups/{id}/join-requests | member | id | Pending join requests with names (admin/co-admin only). Returns `{requests:[{id,member_id,name,member_id_str,requested_at}]}` |
| GET | /groups/{id}/pending-invites | member | id | Pending invites with invitee + inviter names (admin/co-admin only). Returns `{invites:[{id,invitee_member_id,invitee_name,invitee_member_id_str,invited_by_name,created_at}]}` |
| GET | /groups/invites/me | member | — | All pending group invitations addressed to the caller. Returns `{invites:[{id,group_id,group_name,group_type,invited_by_name,created_at}]}` |
| GET | /groups/{id}/posts | member | id | List posts |
| POST | /groups/{id}/posts | member | id, content | Post in group |
| GET  | /groups/posts/{id}/comments | member | id, page?, per_page? | List all comments (enriched, oldest-first) |
| POST | /groups/posts/{id}/comments | member | id, content | Comment on post |
| POST | /groups/posts/{id}/react | member | id, reaction | React to post |
| POST | /groups/posts/{id}/vote | member | id, option_index | Cast or change poll vote; returns `{post_id, my_vote_index, vote_counts:[{option_index}], total_votes}` |
| POST | /admin/groups/{id}/moderate | admin | id, action | Admin: moderate group |

---

## 16 — Gaming Community
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:gaming-community`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /games | member | — | Games catalogue |
| GET | /games/{id} | member | id | Game details |
| GET | /games/{id}/groups | member | id | Groups for this game |
| POST | /games/{id}/groups | member | id, group_name | Create gaming group |
| POST | /groups/{id}/join | member | id | Join gaming group |
| POST | /groups/{id}/leave | member | id | Leave gaming group |
| POST | /admin/games | admin | title, description, icon_file_id?, rules? | Admin: create game |
| PATCH | /admin/games/{id} | admin | id, ... | Admin: update game |

---

## 17 — Gaming Elections
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:gaming-elections`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /pioneer-candidates | member | — | List pioneer candidates |
| POST | /pioneer-candidates | member | candidate_name, platform, avatar_file_id? | Register as pioneer candidate |
| PATCH | /pioneer-candidates/{id} | member | id, ... | Edit candidacy |
| GET | /elections/{id} | member | id | Election details + candidates |
| GET | /elections/me/eligibility | member | — | Check if member can vote |
| POST | /elections/{id}/vote | member | id, candidate_id | Cast vote |
| POST | /admin/elections | admin | title, description, start_date, end_date | Admin: create election |
| POST | /admin/elections/{id}/cast-tiebreak | admin | id, candidate_id | Admin: tiebreaker vote |
| POST | /admin/elections/{id}/close | admin | id | Admin: close election |
| POST | /admin/elections/{id}/voting-rights-price | admin | id, price_in_points | Admin: set voting rights price |

---

## 18 — Gaming Seasons
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:gaming-seasons`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /seasons | member | — | All seasons |
| GET | /seasons/{id} | member | id | Season detail |
| GET | /seasons/{id}/events | member | id | Season events |
| GET | /seasons/{id}/ledger | member | id | Season ledger |
| POST | /seasons/{id}/committee | member | id | Join season committee (Pioneer) |
| POST | /seasons/{id}/distribution-records | member | id, records[] | Log distribution (Pioneer) |
| POST | /seasons/{id}/secure-funding/deposit | member | id, amount | Deposit secure funding |
| GET | /events/{id}/submissions | member | id | List event submissions |
| POST | /events/{id}/submissions | member | id, submission_content, file_ids? | Submit entry |
| POST | /events/{id}/results | member | id, results[] | Post results (Pioneer) |
| POST | /admin/seasons/{id}/start | admin | id | Admin: start season |
| POST | /admin/seasons/{id}/close-and-settle | admin | id | Admin: close + settle |
| POST | /admin/seasons/{id}/archive | admin | id | Admin: archive |
| POST | /admin/student-submissions/{id}/review | admin | id | Admin: review submission |

---

## 19 — Education (Courses & Sessions)
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:education`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /courses | member | — | All courses |
| POST | /courses | member | title, description, sector, course_type, item_id | Create course (links to marketplace item) |
| GET | /courses/{id} | member | id | Course detail + sessions + ratings |
| GET | /courses/me | member | — | Teacher's own courses |
| POST | /courses/{id}/amendments | member | id, amendment_title, amendment_content | Request course amendment |
| POST | /courses/{id}/payout-request | member | id | Teacher: request payout |
| GET | /enrollments/me | member | — | Student's enrollments |
| GET | /sessions/{id}/attendance | member | id | Session attendance |
| POST | /sessions/{id}/start | member | id | Teacher: start session |
| POST | /sessions/{id}/end | member | id | Teacher: end session |
| POST | /sessions/{id}/cancel | member | id | Teacher: cancel session |
| POST | /sessions/{id}/checkin | member | id, qr_token | Student: check in with QR token |
| POST | /sessions/{id}/verify/{enrollment_id} | member | enrollment_id | Teacher: verify attendance manually |
| POST | /sessions/{id}/rate-teacher | member | id, rating, comments? | Student: rate teacher |
| POST | /sessions/{id}/rate-student/{enrollment_id} | member | enrollment_id, rating, comments? | Teacher: rate student |
| GET | /teachers/{member_id}/ratings | public | member_id | Public teacher ratings |
| POST | /admin/courses/{id}/payout | admin | id | Admin: approve payout |
| POST | /admin/courses/amendments/{id}/decision | admin | id, decision, reason? | Admin: action amendment |
| POST | /admin/courses/{proposal_id}/list | admin | proposal_id | Admin: list course |

---

## 20 — Financial Donors
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:fin-donor`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /donors | public | — | Public donor wall |
| GET | /donors/{id} | public | id | Donor profile |
| PATCH | /admin/donors/{id} | admin | id, ... | Admin: update donor |

---

## 21 — Financial Investments
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:fin-invest`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /investments | member | investment_type (Option A/B), amount, email? | Create investment |
| GET | /investments/me | member | — | Member's investments |
| GET | /investments/{id} | member | id | Investment detail + payout schedule |
| GET | /investments/overdue-count | public | — | Platform overdue count (transparency) |
| POST | /investments/{id}/overdue-request | member | id | Request overdue payment (after 30 days) |
| GET | /admin/investments | admin | — | Admin: all investments |
| GET | /admin/investments/due | admin | — | Admin: due investments |
| POST | /admin/investments/{id}/payouts/{payout_id}/mark-paid | admin | payout_id | Admin: mark payout paid |

---

## 22 — Financial Sponsors
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:fin-sponsor`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /sponsorships | member | — | Active sponsorships |
| POST | /sponsorships | member | recipient_member_id, amount, conditions?, upi_id | Create sponsorship |
| GET | /sponsorships/{id} | member | id | Sponsorship detail |
| POST | /sponsorships/{id}/dispute | member | id | Dispute (within 7-day window) |
| POST | /admin/sponsorships/{id}/recognize | admin | id | Admin: recognize sponsorship |
| POST | /admin/sponsorships/{id}/progress | admin | id | Admin: update progress |
| POST | /admin/sponsorships/{id}/refund | admin | id | Admin: refund |

---

## 23 — Contracts
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:sXgmF9KL`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /contracts | public | contract_type? (vgc_administrated\|non_vgc), status?, sector?, page?, per_page? | List contracts. Response: `{items, curPage, nextPage}`. Each item enriched with `giver_name`. Lazy-expires listed contracts past `application_deadline` (VGC: escrow refund). |
| POST | /contracts | member | title, requirements, budget_points, contract_type (vgc_administrated\|non_vgc), sector, application_deadline, requested_completion_date, conditions? (required for VGC), notes? | Create contract. VGC: debits 105% (100% escrow + 5% fee). Cap: Giver ≤10 active VGC. |
| GET | /contracts/{id} | public | id | Contract detail. Returns flat object: all contract fields + `giver_name`, `taker_name`, `applications[]` (each with `member_id`, `member_name`, `message`, `proposed_price_points`, `proposed_completion_date`, `status`, `giver_message_count`), `applicant_count`. Lazy-expires if listed and past deadline. |
| PATCH | /contracts/{id} | member | id, title?, requirements?, budget_points?, deadline_days? | Update contract |
| POST | /contracts/{id}/apply | member | id, application_text, proposed_price_points? (int), proposed_completion_date? (date) | Apply for contract. Candidate may optionally propose a counter-price and/or alternative completion date. Both visible to Giver on application review. |
| POST | /contracts/{id}/assign | member | id, taker_member_id | Giver: assign taker. `taker_member_id` must be the user.id of an applicant with status=pending. |
| POST | /contracts/{id}/mark-complete | member | id | Assignee: mark complete |
| POST | /contracts/{id}/release | member | id | Proposer: release escrow to assignee |
| POST | /contracts/{id}/dispute | member | id, dispute_reason | File dispute |
| POST | /contracts/{id}/escalate | member | id | Escalate to admin |
| POST | /contracts/{id}/force-close-request | member | id | Request force close |
| POST | /contracts/{id}/rate | member | id, rating, comments? | Rate other party |
| POST | /contracts/{id}/cancel | member | id | Cancel contract |
| GET | /contracts/applications/{app_id}/messages | member | app_id | Fetch private chat thread for an application. Only the Giver and the specific Applicant have access. Response: `{messages[], is_read_only, other_member_name, contract_title, application_status}`. Each message: `{id, sender_member_id, sender_name, message_text, created_at}`. `is_read_only=true` once application is assigned or rejected. |
| POST | /contracts/applications/{app_id}/messages | member | app_id, message_text | Send a message in the private chat thread. Blocked when `application.status != "pending"` (read-only state). Emits `contract_message` notification to the other party. |
| PATCH | /contracts/applications/{app_id}/update | member | app_id, application_text?, proposed_price_points?, proposed_completion_date? | Update a pending application (Update Interest). Applicant only. Blocked when `application.status != "pending"` or when Giver has already sent any message (`giver_message_count > 0`). |
| POST | /admin/contracts/{id}/resolve | admin | id | Admin: resolve dispute |

---

## 24 — Loans
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:ZR6bC4we`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /loans/request | member | amount, purpose, term_months, collateral_description? | Request loan |
| GET | /loans/me | member | — | Member's loans |
| POST | /loans/{id}/repay | member | id, amount | Repay loan |
| POST | /admin/loans/{id}/approve | admin | id, approved_amount?, interest_rate? | Admin: approve |
| POST | /admin/loans/{id}/reject | admin | id, reason? | Admin: reject |
| POST | /admin/loans/{id}/write-off | admin | id | Admin: write off |

---

## 25 — Expenses
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:XcifSN8G`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /expenses/me | member | main_category?, settlement_status?, from?, to?, q?, page?=1, per_page?=50 | Member's expenses. **Note:** `main_category` must NOT be marked Required in XANO UI (fix BG-6) |
| POST | /expenses | member | description, amount, main_category, specific_category?, payment_mode, receipt_file_id?, platform_reference? | Log expense |
| POST | /expenses/{id}/settle | member | id | Settle expense |
| GET | /platform-financial-ledger | admin | page?=1 | Admin: platform outflow ledger |

---

## 26 — Admin
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:EOOlx4pf`

### Admin Auth
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /admin/2fa/login | public | email, password | Returns `{challenge_token}`; sends OTP (36-char UUID) to admin email |
| POST | /admin/2fa/verify | public | challenge_token, otp | Returns admin Bearer token |
| POST | /admin/2fa/setup | admin | — | Initiate TOTP setup; returns secret + otpauth URI + 8 recovery codes |
| POST | /admin/2fa/verify-setup | admin | verification_code | Confirm TOTP setup |
| POST | /admin/2fa/recover | public | recovery_code | Login with recovery code |

### Members
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /admin/members | admin | search?, page?, per_page? | All members |
| PATCH | /admin/members/{id} | admin | id, role?, is_suspended?, ... | Update member |
| POST | /admin/members/{id}/impersonate | admin | id | Impersonate member |
| POST | /admin/members/{id}/process-erasure | admin | id | Execute DPDP erasure |

### Wallets & Points
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /admin/wallets/{member_id} | admin | member_id | View member wallet |
| POST | /admin/wallets/adjust | admin | member_id, currency, amount, reason | Adjust balance |
| POST | /admin/wallets/mint | admin | amount, currency, description | Mint new points/tokens |
| POST | /admin/points/award | admin | member_id, amount, reason | Award points to member |
| GET | /admin/points/budget | admin | — | Points budget summary |
| POST | /admin/points/budget | admin | provision_type, amount, period | Create budget entry |

### PTS (Points Token Scheme)
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /admin/pts/components | admin | — | View PTS rate components (r_eq, r_published, r_user, p_net; θ hidden) |
| PATCH | /admin/pts/reserve-assets | admin | reserve_amount | Update reserve |
| POST | /admin/pts/theta-adjust | admin | theta_value | Adjust θ |
| POST | /admin/pts/bootstrap | admin | initial_reserve | Bootstrap PTS |
| GET | /admin/pts/audit-log | admin | — | PTS audit log |
| POST | /admin/rates/announce-change | admin | new_rate, effective_date | Announce rate change |

### System & Config
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| PATCH | /admin/system/config | admin | inr_per_token?, surrender_rate?, blog_in_review_default_limit?, blog_ticket_author_pct?, blog_ticket_admin_pct?, ... | Update system config |
| GET | /admin/audit-log | admin | — | Platform-wide admin audit log |
| POST | /admin/vacation-mode | admin | member_id, enabled | Enable/disable vacation mode |
| GET | /admin/backup-admin/status | admin | — | Backup admin status |
| POST | /admin/backup-admin/designate | admin | member_id | Designate backup admin |

### Declarations & Surrenders (Admin)
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /admin/declarations/{id}/verify | admin | id | Verify declaration |
| GET | /admin/declarations/{id}/reject | admin | id | Reject declaration |
| PATCH | /admin/token-surrenders/{id}/complete | admin | id | Complete token surrender |

### Donations (via Financial Donors admin)
| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| POST | /admin/donations/{declaration_id}/publish | admin | declaration_id | Publish donation to donor wall |

---

## 27 — Admin Reports
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:admin-reports`

Admin-only reporting endpoints. Exact paths TBC from live API — endpoints are in this group's canonical. Typical inputs: `from` (date), `to` (date).

---

## 28 — Event Logs
**Base:** `https://x8ki-letl-twmt.n7.xano.io/api:7KKtC-3r`

| Method | Path | Auth | Key Inputs | Notes |
|---|---|---|---|---|
| GET | /logs/user/my-events | member | — | Member's event log (logins, actions) |

---

## Known Schema Notes

### `blogs` table
Key fields: `id`, `author_member_id` (FK→user), `title`, `content`, `sector`, `tags` (json), `status` (draft/in_review/published/rejected/abandoned/taken_down), `revenue_generator` (bool), `ticket_price_tokens` (decimal), `marketplace_item_id` (FK→marketplace_items), `points_awarded`, `reject_reason`, `takedown_reason`

### `marketplace_items` table
Key fields: `id`, `seller_id` (FK→user), `category_id` (FK→categories), `item_type`, `title`, `description`, `price` (decimal), `currency` (INR/VGC_TOKEN/VGC_POINTS), `stock`, `status` (active/sold_out/inactive), `proposing_member_id`, `revenue_share_proposer_pct`, `revenue_share_admin_pct`, `buyer_info_schema` (json), `category_path_ids` (json)

### `wallets` table
`type` field is **lowercase**: `inr`, `token`, `points` — frontend maps these to `INR`, `VGC_TOKEN`, `VGC_POINTS` via `normaliseWallet()` in `getWallets()`.

### RG Blog Ticket Auto-Creation (TR-037)
Triggered at `POST /blog/{id}/publish` (self-publish) and `POST /admin/blog/{id}/approve`. Conditions: `revenue_generator = true`, `marketplace_item_id = null`, `ticket_price_tokens > 0`. Creates item under "Blog Tickets" category (created on first use). `item_type = "blog_rg_ticket"`, `currency = VGC_TOKEN`, `stock = 999999`, revenue split from `system_config.blog_ticket_author_pct` (default 85%) / `blog_ticket_admin_pct` (default 15%).

---

## Known Issues / Deferred

| ID | Area | Issue |
|---|---|---|
| BG-7 | Email | XANO free plan sandbox only delivers to workspace owner (`seekingj01@gmail.com`). OTP/notification emails to regular members don't arrive. SendGrid key obtained but requires paid plan. |
| DOC-3 | Points Transfer | ~~Live transfer was escrow + 10-min accept window~~ — **Resolved TR-081 (2026-06-27)**. Backend rewritten to instant atomic model matching SRS §5.5. |
| Admin-OTP | Admin 2FA | Admin OTP is a 36-char UUID — candidate to replace with 6-digit numeric code. |
