# VGC XANO — Remaining Work to 100% (rev 5)

**Status as of:** 2026-06-02 (rev 5 reconciliation)
**Workspace:** 161992 ("VGC's Workspace") · Branch `v1` · Instance `x8ki-letl-twmt.n7.xano.io` · **Free plan**
**Deployed:** 255 endpoints / 28 groups (API_REFERENCE.md, 2026-06-02). **The entire rev-4 backlog (GAP-100→140) is live.**

> This file used to track the cron-task retirement (GAP-130) and the v1 Education retirement (GAP-140 Part 1). **Both are done.** It has been repurposed as the punch-list of the **four remaining gaps** that take XANO from its current state to **100% of API_REQUIREMENTS.md (rev 4 / SRS v2.2)**. The detailed cron→lazy logic reference now lives only in `XANO_IMPLEMENTATION_PLAN.md` Appendix B; the closed-gap history is in `SESSION_LOG.md` and `PROGRESS.md`.

How these were found: a line-by-line diff of **API_REQUIREMENTS.md** (the spec) against **API_REFERENCE.md** + a fresh `XANO/` pull. Two are genuine misses; two are cleanup/deviations. Full spec blocks are in `XANO_IMPLEMENTATION_PLAN.md` §5.1; proposed schema in Appendix A.

| Gap | Tier | Title | API_REQ ref | Verified against pull |
|---|---|---|---|---|
| GAP-150 | P1 | Search module (`GET /search`) | §19 | no `search` group exists |
| GAP-151 | P1 | Season distribution-records | §13.11 | endpoint absent in `gaming-seasons` |
| GAP-141 | P2 | Education v1 cleanup | §14 / D10 | `student-submissions/review` still ships |
| GAP-142 | P2 | Spec deviations (tree depth, pts/rate auth) | §6.2, §7.1 | tree 2-level; `/pts/rate` public |

---

## GAP-150 — Search module  **(P1)**

- **Requirement:** SRS §17 + API_REQUIREMENTS §19. `GET /search` (auth = member) with inputs `q, sector?, category?, limit?` → `{ marketplace:[], groups:[], blog:[] }`.
- **Why it's open:** no `search` group exists in the pull (confirmed 2026-06-02). It was never assigned a GAP ID in the rev-4 backlog — a true miss, not a regression.
- **Build:**
  1. New api_group `search` (canonical `search`), one endpoint `GET /search`.
  2. For each of the three result arrays, query the owning table and **reuse that module's existing visibility predicate** — do not invent new rules:
     - **marketplace:** active `marketplace_items` matching `name/description includes $q` (and `category_path_ids`/`sector` when provided).
     - **groups:** discoverable `member_groups` (public, or private the caller belongs to via `member_group_members`).
     - **blog:** `blogs` with `status == "published"`, applying the same RG-gating used by `GET /blog/public` (RG hidden unless purchased/grandfathered in `blog_readers`).
  3. Use null-safe `==?` for the optional `sector`/`category` filters; cap each array by `limit` (default e.g. 20).
- **No new tables.** Reuses existing module tables.
- **Acceptance:** a private group the caller isn't in never appears; an RG blog the caller hasn't purchased/grandfathered never appears; `limit` caps each array; results are visibility-correct for the caller.
- **Validate** every `.xs` with `xano_validate_xanoscript` before push.

## GAP-151 — Season distribution-records  **(P1)**

- **Requirement:** SRS §11.11 + API_REQUIREMENTS §13.11. `POST /seasons/{id}/distribution-records` (auth = member, must be the season's **pioneer**) with `amount, member_id, event_ref_id` → record that counts toward the **80% distribution target** evaluated at `close-and-settle`.
- **Why it's open:** `gaming-seasons` deploys 9 endpoints; there is no distribution-records writer. `POST /admin/seasons/{id}/close-and-settle` is live but has nothing to measure the 80% target against.
- **Build:**
  1. New table `season_distribution_records` — **PROPOSED schema already drafted** in `XANO_IMPLEMENTATION_PLAN.md` Appendix A.5 (`season_id`, `member_id` recipient, `event_ref_id?`, `amount`, `logged_by` pioneer).
  2. New endpoint `POST /seasons/{id}/distribution-records` in the `gaming-seasons` group — guard that the caller is the season's pioneer and the season is `active`.
  3. **Amend** `POST /admin/seasons/{id}/close-and-settle` to sum these records and compute `distribution_pct` / `target_met` (≥80%) — confirm the existing endpoint currently hardcodes or omits this.
- **Acceptance:** pioneer can log distributions during an active season; non-pioneer → 403; `close-and-settle` returns `distribution_pct` derived from the summed records and `target_met` true only at ≥80%.

## GAP-141 — Education v1 cleanup  **(P2)**

- **Requirement:** API_REQUIREMENTS §14 / D10 — the v1 appointed-teacher surface must be fully retired.
- **Why it's open:** course-ticket model (GAP-140) is live, but a legacy `POST /admin/student-submissions/{id}/review` endpoint still ships (API_REFERENCE labels it "kept for historical records"), and orphan v1 artifacts may remain.
- **Action:**
  1. Confirm no WeWeb client calls `POST /admin/student-submissions/{id}/review`; then delete `api/admin/admin/student_submissions/...`.
  2. Drop orphan v1 tables holding no records worth keeping: `teacher_applications, teachers, subjects, chapters, teacher_duties, independent_tickets, student_submissions, review_sessions, review_session_qa, review_session_participants, review_session_submissions`. (Free dev — none expected to hold real data; verify with a quick `db.query … count` first.)
  3. Purge any remaining duplicate normalization dirs the pull keeps restoring: `api/financial_donors/`, `api/financial_investments/`, `api/financial_sponsors/`, `api/point_token_scheme/` (keep one canonical each: `fin_*`, `pts`).
- **Acceptance:** `POST /admin/student-submissions/{id}/review` → 404; no v1 edu tables remain in the pull; group count unchanged at 28.

## GAP-142 — Spec deviations  **(P2)**

- **Category tree depth (§6.2 / §9.8):** `GET /marketplace/categories/tree` is deployed but nests only **2 levels**; spec allows **up to 8**. Add `max_depth?` (default 8) and recurse the category parent chain instead of the hard 2-level cap.
- **`GET /pts/rate` auth (§7.1) — DECIDED 2026-06-02: tighten to member-only.** Change the endpoint from `public` to `auth = "user"`. θ stays unexposed (it already is). Confirm no public/unauthenticated client (e.g. a logged-out landing page) depends on it; if one does, surface that before flipping. The legacy `PATCH /admin/pts/rate` is unaffected.
- **Acceptance:** `GET /marketplace/categories/tree?max_depth=4` returns up to 4 levels; `GET /pts/rate` returns 401 when unauthenticated and 200 for a logged-in member.

---

## Workflow reminders (Free plan — binding)

1. **Pick the lowest open gap in the highest open tier** (GAP-150 first). Mark it in-flight in `PROGRESS.md`.
2. **No cron / no `task/*.xs`** (D9). Any clock-driven behaviour resolves **lazily on read**, idempotently, inside `db.transaction` when it moves wallets. Push-only notifications use an external cron hitting a protected admin endpoint (`[CRON-OPTIONAL]`).
3. **Reuse helpers:** `require_admin`, `mutate_wallet` / `mutate_wallet_unchecked`, `idempotency_lookup`/`store`, `log_admin_action`, `emit_notification`, `create_declaration`, `pts_compute_rate`, `check_rate_limit`.
4. **Validate every changed `.xs`** with `xano_validate_xanoscript` (zero errors; resolve/justify warnings) **before** push.
5. **Push:** `xano workspace push -w 161992 -b v1 -d /Users/boss/Desktop/VGC/XANO --dry-run` first, then without `--dry-run`. Re-pull and diff to confirm. After every pull, delete the duplicate normalization dirs listed in GAP-141 step 3 before pushing.
6. **Record:** update `PROGRESS.md`, append one line to `SESSION_LOG.md`, and when a gap closes, regenerate the affected section of `API_REFERENCE.md`.

**Definition of 100%:** GAP-150, GAP-151, GAP-141, GAP-142 all closed and verified → XANO fully satisfies API_REQUIREMENTS.md (rev 4 / SRS v2.2).
