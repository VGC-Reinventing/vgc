# VGC XANO — Implementation Plan & Status

**Updated:** 2026-06-02 (rev 5 — reconciled against deployed reference)
**Source of truth (requirements):** [API_REQUIREMENTS.md](API_REQUIREMENTS.md) (rev 4, 2026-05-30 — aligned to SRS v2.2)
**SRS:** [SRS/VGC_Reinventing_SRS_v2.md](SRS/VGC_Reinventing_SRS_v2.md) (v2.2)
**Current state (baseline):** [API_REFERENCE.md](API_REFERENCE.md) (2026-06-02 — **255 endpoints across 28 groups**, regenerated from pull)
**Pulled workspace:** [/Users/boss/Desktop/VGC/XANO/](XANO/) (389 documents — re-pull anytime with the command in §1)

---

## Executive Summary

**The entire rev-4 backlog is now built and deployed.** The 2026-06-02 pull ([API_REFERENCE.md](API_REFERENCE.md)) shows **255 endpoints across 28 groups** (up from ~170/23 at rev 4). The two structural reworks (PTS live-formula, Education course-ticket model) and the full block of net-new scope (Cart, minting budget, public onramps, Groups, Blog, Loans, Expense Tracker, Contract, Admin additions, 2FA, Phase-1 hardening) have all landed. This revision reconciles the plan against that deployed reality and re-scopes the backlog to the **small residual set** the comparison surfaced.

**Reality check — the three rev-4 changes are DONE:**

1. **PTS live-formula — ✅ deployed (GAP-100).** `pts_compute_rate` implements `r_eq = (I + R + A − L_invest − 10·T_net) / P_net`, time-drift θ (never exposed), floor 0.0001, threshold 0.00011, `R_user = 10/r_published`. Admin manages inputs only (`/admin/pts/components`, `/theta-adjust`, `/reserve-assets`, `/bootstrap`, audit-log). The legacy `PATCH /admin/pts/rate` is retained only as a documented rollback path (D11).
2. **Education course-ticket model — ✅ deployed (GAP-140).** Group `education` (15 + 3 admin endpoints) implements course proposal → admin listing → sessions → QR check-in/manual verify → ratings (auto Constitutional Points) → payout. `edu-teachers`/`edu-sessions` and their tables are retired. ⚠️ **One cleanup remnant:** a legacy `POST /admin/student-submissions/{id}/review` endpoint still lingers (REFERENCE flags it "kept for historical records") — see GAP-141.
3. **Net-new modules — ✅ all deployed:** Cart (`O-OY5IE_`, 4), Groups (`BiZZDMxu`, 17), Blog (10), Loans (`ZR6bC4we`, 3 + admin), Expenses (`XcifSN8G`, 4), Contracts (`sXgmF9KL`, 13) — plus monthly minting budget, blog likes/comments, sponsorship 7-day dispute window, public overdue-investment count, and the rate-change announcement.

**Residual gaps surfaced by the rev-5 comparison (small):**

- **§19 Search — ❌ not built.** No `search` group exists in the pull. This requirement never received a GAP ID in the rev-4 backlog; it is now **GAP-150 (P1)**.
- **§13.11 `POST /seasons/{id}/distribution-records` — ❌ missing.** Gaming Seasons has 9 endpoints but no distribution-records writer; it feeds the 80% distribution target (§11.11) checked at `close-and-settle`. Now **GAP-151 (P1)**.
- **Cleanup/deviations (P2):** category tree deployed 2-level vs spec ≤8 (§6.2); lingering legacy Education review endpoint; `GET /pts/rate` deployed `public` vs spec member-only. See GAP-141/142.

**Free-plan architecture is binding (SRS v2.2 §1.4.1)** and is now reflected in the deployment: **XANO Free — no scheduled/background tasks**; every clock-driven rule resolves by **lazy evaluation on read** (REFERENCE confirms lazy expiry/settle/archive/close throughout). A few push-only notifications may use a **free external cron** hitting a protected admin endpoint. The old cron task files are NOT pushed (Appendix B is logic-reference only).

Sections 1–3 (environment, layout, XanoScript conventions) and Appendix A (table schemas) stay as durable reference. Section 4 is the rev-5 status matrix. Section 5 is the rev-5 gap backlog (rev-4 items marked closed; residual items GAP-150/151 added). Section 8 carries the binding decisions (D1–D11). Appendix B is the lazy-evaluation playbook that replaces scheduled tasks.

---

## Table of Contents

1. [Environment & Tooling](#1-environment--tooling)
2. [Workspace Layout (current pull)](#2-workspace-layout-current-pull)
3. [XanoScript Conventions (verified against MCP)](#3-xanoscript-conventions-verified-against-mcp)
4. [Requirements → Current State Matrix](#4-requirements--current-state-matrix)
5. [Gap Backlog (rev 5)](#5-gap-backlog-rev-5)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [Verification Plan](#7-verification-plan)
8. [Binding Decisions (D1–D11)](#8-binding-decisions-d1d8)
9. [Appendix A — New Tables (XanoScript)](#appendix-a--new-tables-xanoscript)
10. [Appendix B — Time-Dependent Behaviour (Lazy-Evaluation Playbook)](#appendix-b--time-dependent-behaviour-lazy-evaluation-playbook)

---

## 1. Environment & Tooling

| Item | Value |
|---|---|
| Workspace name | VGC's Workspace |
| Workspace ID | `161992` |
| Branch | `v1` |
| Instance host | `x8ki-letl-twmt.n7.xano.io` |
| API base URL pattern | `https://x8ki-letl-twmt.n7.xano.io/api:<canonical>` |
| Auth realm | `839577` |
| Local pull path | `/Users/boss/Desktop/VGC/XANO/` (389 documents) |
| Plan | **Free Instance (ID 171)** — no scheduled/background tasks (see Appendix B) |
| Xano CLI binary | `xano` (v1.0.2) installed at `/opt/homebrew/bin/xano` (global npm: `@xano/cli`) |
| Xano MCP server | "Xano Developer" — load tools via ToolSearch when needed (`xano_validate_xanoscript`, `xano_xanoscript_docs`, `xano_cli_docs`). MCP not required for pull/push; the CLI handles those. |
| Auth profile | Profile `vgc` (default), stored at `~/.xano/credentials.yaml`. Created from the token in `XANO/.env` via `xano profile create` (browser `xano auth` does not complete headless). Verify with `xano profile me`. |

### Re-pull the workspace

```bash
xano workspace pull -w 161992 -b v1 -d /Users/boss/Desktop/VGC/XANO
```

Optional flags: `--draft` (include drafts), `--env` (env vars), `--records` (table data — can be large).

### Push edits

```bash
xano workspace push --help            # confirm exact flags
xano workspace push -w 161992 -d /Users/boss/Desktop/VGC/XANO
```

> **Always validate before pushing.** For any new or amended `.xs` file, run the validator first to catch syntax errors locally — this is the difference between a fast iteration and a slow round-trip through Xano's web UI.

### Validate a file (or a whole directory)

```jsonc
// Via MCP — single file
mcp__xano__xano_validate_xanoscript({ file_path: "api/admin/admin/wallets/adjust_POST.xs" })

// Via MCP — entire directory
mcp__xano__xano_validate_xanoscript({ directory: "api", pattern: "**/*.xs" })
```

### Look up XanoScript syntax on demand

```jsonc
mcp__xano__xano_xanoscript_docs({ tier: "working" })                       // 12KB general reference
mcp__xano__xano_xanoscript_docs({ topic: "apis", mode: "full" })           // endpoint syntax
mcp__xano__xano_xanoscript_docs({ topic: "tables", mode: "full" })         // table/schema syntax
mcp__xano__xano_xanoscript_docs({ topic: "tasks", mode: "full" })          // scheduled task syntax
mcp__xano__xano_xanoscript_docs({ topic: "syntax", mode: "full" })         // filters, operators
mcp__xano__xano_xanoscript_docs({ topic: "database", mode: "full" })       // db.* operations
mcp__xano__xano_xanoscript_docs({ topic: "functions", mode: "full" })      // reusable functions
mcp__xano__xano_xanoscript_docs({ topic: "security", mode: "full" })       // auth patterns
mcp__xano__xano_xanoscript_docs({ topic: "essentials", mode: "full" })     // common mistakes
```

---

## 2. Workspace Layout (current pull)

```
XANO/
├── api/                           # 28 API groups, 255 deployed endpoints
│   ├── activity_rewards/          # canonical = "activity-rewards"      (4)
│   ├── admin/                     # canonical = "EOOlx4pf"             (71)
│   ├── blog/                      # canonical = "blog"                   (10)
│   ├── cart/                      # canonical = "O-OY5IE_"               (4)
│   ├── contracts/                 # canonical = "sXgmF9KL"              (13)
│   ├── education/                 # canonical = "education"             (15)  ← course-ticket model
│   ├── expenses/                  # canonical = "XcifSN8G"               (4)
│   ├── groups/                    # canonical = "BiZZDMxu"              (17)
│   ├── loans/                     # canonical = "ZR6bC4we"               (3 + admin)
│   ├── admin_reports/             # canonical = "admin-reports"          (6)
│   ├── authentication/            # canonical = "L9PANOan"               (10)
│   ├── event_logs/                # canonical = "7KKtC-3r"                (1)
│   ├── fin_donor/                 # canonical = "fin-donor"               (2)
│   ├── fin_invest/                # canonical = "fin-invest"              (5)
│   ├── fin_sponsor/               # canonical = "fin-sponsor"             (4)
│   ├── gaming_community/          # canonical = "gaming-community"        (6)
│   ├── gaming_elections/          # canonical = "gaming-elections"        (7)
│   ├── gaming_seasons/            # canonical = "gaming-seasons"          (9 — §13.11 distribution-records missing, GAP-151)
│   ├── inr_forms/                 # canonical = "declarations"            (6 — +public onramp)
│   ├── marketplace/               # canonical = "EiCwBjsO"                (18)
│   ├── notifications/             # canonical = "dID-7x7G"                (5)
│   ├── points_transfer/           # canonical = "points-transfer"         (6)
│   ├── proposals/                 # canonical = "proposals"               (5)
│   ├── pts/                       # canonical = "pts"                     (5 — live formula, D11)
│   ├── system/                    # canonical = "KVaxK9ev"                (3)
│   ├── token_surrenders/          # canonical = "token-surrender"         (3)
│   ├── user_profile/              # canonical = "_CJw8MFH"                (6 — +erasure)
│   └── wallets/                   # canonical = "wallets"                 (3)
│   # ❌ NOT deployed: search ("search", §19) — see GAP-150
│   # 🗑️ retired: edu_teachers / edu_sessions (v1 Education) — replaced by education/ (GAP-140)
├── table/                         # deployed tables — see API_REFERENCE.md "Key Tables" for the live list
├── function/                      # reusable functions
│   ├── admin_audit.xs
│   ├── idempotency_lookup.xs
│   ├── idempotency_store.xs
│   ├── log_admin_action.xs
│   ├── mutate_wallet.xs           # atomic wallet mutation — REUSE for all wallet writes
│   ├── require_admin.xs           # admin guard — REUSE for new admin endpoints
│   ├── wallet_mutate.xs           # earlier variant; prefer mutate_wallet
│   └── quick_start/               # legacy helpers including `enforce_role` (older pattern)
├── task/                          # NOT deployed on Free plan — Appendix B is logic-reference only (D9)
├── addon/                         # user.xs
├── ai/                            # agent/, tool/
└── workspace/                     # vg_cs_workspace.xs (workspace-level settings)
```

> **Group note.** The pull still contains alias directories that mirror a renamed canonical and share its base URL: `fin_donor`/`financial_donors`, `fin_invest`/`financial_investments`, `fin_sponsor`/`financial_sponsors`, and `pts`/`point_token_scheme`. The retired `edu_teachers`/`edu_sessions` (v1 Education) are **no longer deployed** — superseded by `education/` (GAP-140). Counts above reflect the canonical group as reported in API_REFERENCE.md, not the duplicated alias files.

---

## 3. XanoScript Conventions (verified against MCP)

These are the patterns the **existing workspace uses** — match them so new code blends in. Each was verified either against an existing `.xs` file in the pull or against `xano_validate_xanoscript`.

### 3.1 File rules

- **One construct per file.** A `.xs` file holds exactly one `query`, `function`, `table`, `task`, `agent`, `tool`, `addon`, or `api_group`.
- **Endpoint file path = URL path.** Files under `api/<group>/.../something_VERB.xs` correspond to `query "something" verb=VERB` blocks. Slashes in the query string nest naturally: `query "items/{id}/dispute" verb=POST { ... }` lives at `api/<group>/items/id/dispute_POST.xs`.
- **Every `query` needs `input { }`.** Even if empty. The validator rejects `query` blocks without an input clause.
- **Type names:** `text`, `int`, `bool`, `decimal`, `json`, `timestamp`, `date`, `email`, `password`, `enum`, `uuid`, `vector`, `attachment`, `file`. **Never** use `string`, `integer`, `boolean`, `float`, `array`, `object` as types. Arrays are `type[]`. Use `json` for free-form objects without a schema.
- **Reserved variable names** (never bind these as `var $foo`): `$response`, `$output`, `$input`, `$auth`, `$env`, `$db`, `$this`, `$result`, `$index`.

### 3.2 Auth

```xs
// Public endpoint — omit `auth` entirely
query "items" verb=GET { api_group = "Marketplace"  input {}  ... }

// Authenticated endpoint — references a table where auth = true (in VGC: the `user` table)
query "profile" verb=GET {
  api_group = "User_Profile"
  auth = "user"             // gives access to $auth.id
  input {}
  stack { db.get user { field_name = "id"  field_value = $auth.id } as $u }
  response = $u
}
```

### 3.3 Admin guard (REUSE the existing function)

`function/require_admin.xs` already exists. **All new admin endpoints must use it.** The current codebase has two parallel patterns; standardize on `require_admin` going forward.

```xs
// REQUIRED at top of every admin endpoint's stack
function.run require_admin {
  input = { auth_context: $auth }
} as $admin_ok
```

> **Note:** `function.run` always needs `as <var>` — even if you discard the result. The validator emits a warning otherwise.

### 3.4 Atomic wallet writes (REUSE `mutate_wallet`)

`function/mutate_wallet.xs` performs: row-level fetch, balance check (debit), write to `wallets`, append to `ledger`, append to `wallet_transactions` — all inside `db.transaction { stack { ... } }`. **Never mutate `wallets.balance` directly from a new endpoint.** Wrap with `mutate_wallet`:

```xs
function.run mutate_wallet {
  input = {
    member_id     : $auth.id,
    currency      : "points",                  // "inr" | "token" | "points"
    side          : "debit",                   // "credit" | "debit"
    amount        : $input.amount,
    ref_type      : "marketplace_order_hold",  // string identifier for the source
    ref_id        : $order.id,                 // numeric reference
    operation_type: "marketplace_order_hold",
    operation_id  : $order.id
  }
} as $mutation
```

### 3.5 Idempotency for write endpoints (input-field pattern — see D6)

```xs
input {
  // ... your other inputs ...
  text? idempotency_key                       // optional; client may omit for no-protection
}
stack {
  var $existing { value = null }
  conditional {
    if ($input.idempotency_key != null && $input.idempotency_key != "") {
      function.run idempotency_lookup {
        input = { endpoint_name: "<group>.<action>", key: $input.idempotency_key, caller_id: $auth.id }
      } as $lookup
      var.update $existing { value = $lookup }
    }
  }
  conditional {
    if ($existing == null) {
      // ... do the work, build response into $existing ...
      conditional {
        if ($input.idempotency_key != null && $input.idempotency_key != "") {
          function.run idempotency_store {
            input = { endpoint_name: "<group>.<action>", key: $input.idempotency_key, caller_id: $auth.id, response_json: $existing }
          } as $stored
        }
      }
    }
  }
}
response = $existing
```

### 3.6 Common syntax pitfalls (from MCP `essentials`)

| Wrong | Right |
|---|---|
| `else if (...)` | `elseif (...)` |
| `$cond ? a : b` outside parens in concat | wrap with `()` |
| `body = $payload` in `api.request` | `params = $payload` |
| `$x\|default:"y"` | `$x ?? "y"` or `$x\|first_notnull:"y"` |
| `var $response { ... }` (reserved) | `var $api_response { ... }` |
| `input { boolean active }` | `input { bool active }` |
| `var $d { value = { a = 1 } }` | `var $d { value = { a: 1 } }` (object literals use `:`) |
| `input { object data }` (no schema) | `input { json data }` |
| `while (true) {...}` at top level | wrap in `stack { while ... }` |
| `function.run mutate_wallet { input = {...} }` | append `as $foo` (warning otherwise) |

### 3.7 Operators worth remembering

- Null-safe comparisons: `==?`, `!=?`, `>=?`, `<=?` — the clause is skipped if the value is null. Use heavily in optional filters: `where = $db.product.category ==? $input.category`.
- Nullish coalescing: `$x ?? "fallback"`.
- String concat: `~` (not `+`). Wrap filter chains in parens before concatenating: `($n|to_text) ~ " items"`.
- Array contains: `$db.product.tags contains "featured"`.
- String includes: `$db.product.name includes "phone"`.

---

## 4. Requirements → Current State Matrix

> **Scope note (rev 5):** the table below is keyed to **[API_REQUIREMENTS.md](API_REQUIREMENTS.md) rev-4 section numbers** and reconciled line-by-line against the deployed **[API_REFERENCE.md](API_REFERENCE.md) (2026-06-02)** and a fresh `XANO/` pull. The two structural reworks (PTS §7, Education §14) and all net-new modules (§9 cart, §20–§24) are now **deployed** — the rev-4 backlog is closed in §5. Only the two ❌ rows below (§13.11, §19) and a handful of ⚠️ deviations remain open.

Status legend: ✅ Met · ⚠️ Partial / deviates · ❌ Missing · ➖ Not yet implementable.

| API_REQ § | Requirement | Deployed state (API_REFERENCE 2026-06-02) | Status |
|---|---|---|---|
| 1 | Authentication | 14 endpoints — incl. guardian-registration/approvals, resend-verification (rate-limited), signup consent + <18 + device limit | ✅ |
| 2 | User_Profile | 6 endpoints — incl. `erasure-request` GET/POST (DPDP) | ✅ |
| 3 | Wallets | 3 endpoints (`/me`, `/me/{currency}`, `/me/activity`) | ✅ |
| 4 | Points Transfer — 10-min lazy window, escrow, hide-pending | 6 endpoints; `POST /points-transfer` returns `pending_window` + `window_ends_at`; lazy expiry on `/pending` & `/accept` | ✅ |
| 5 | Token Surrenders | 3 endpoints + admin `PATCH /token-surrenders/{id}/complete` | ✅ |
| 6 | Declarations — draft, submit, **public onramp** | 6 endpoints incl. `POST /declarations/public` (contact_email) + `DELETE` draft | ✅ |
| 7 | **PTS LIVE formula** (GAP-100) — `r_eq`, θ-drift, floor/threshold, `R_user`, admin inputs, bootstrap, audit | `pts` group (5) + admin PTS Management (components/reserve-assets/theta-adjust/bootstrap/audit-log). `pts_compute_rate` implements D11. θ never exposed. Legacy `PATCH /admin/pts/rate` kept for rollback. | ✅ |
| 7.1 | `GET /pts/rate` auth = **member** (§7.1) | Deployed as **`public`** | ⚠️ GAP-142 — decided: tighten to `auth="user"` |
| 8 | Activity Rewards — catalog, changelog, log, admin CRUD, **monthly budget** | `activity-rewards` (4) + admin catalog CRUD + `POST/GET /points/budget` (GAP-111) | ✅ |
| 9 | Marketplace — items, orders, escrow (D5), POD, dispute, settle, cancel, **cart** | `EiCwBjsO` (18) + `Cart` group `O-OY5IE_` (4, GAP-110) + admin orders/categories | ✅ |
| 9.8 | Category tree **≤8 levels** (§6.2) | `GET /marketplace/categories/tree` present but **2-level** only | ⚠️ depth deviation — GAP-142 |
| 10 | Marketplace Proposals | 5 member endpoints + admin `decision` (RG ticket ref supported) | ✅ |
| 11 | Gaming — Community | 6 endpoints | ✅ |
| 12 | Gaming — Elections | 7 + admin close/cast-tiebreak/voting-rights-price; lazy close on read | ✅ |
| 13 | Gaming — Seasons | 9 + admin start/archive/close-and-settle; lazy archive on read | ✅ |
| 13.11 | `POST /seasons/{id}/distribution-records` (feeds 80% target §11.11) | **Not in pull** — no distribution-records writer | ❌ GAP-151 |
| 14 | **Education COURSE-TICKET model** (GAP-140) — courses, sessions, QR check-in/verify, amendments, ratings, payout | `education` group (15) + admin list/amendment-decision/payout. `edu-teachers`/`edu-sessions` retired. | ✅ |
| 14.x | Education cleanup | Legacy `POST /admin/student-submissions/{id}/review` still present ("kept for historical records") | ⚠️ cleanup — GAP-141 |
| 15 | Financial — Donors (v2.2: no anon option; anonymity governs display only) | `fin-donor` (2) + admin publish/update | ✅ |
| 16 | Financial — Sponsors — conditions, **7-day dispute**, refund, recognition | `fin-sponsor` (4, incl. `/dispute`) + admin progress/refund/recognize (GAP-126) | ✅ |
| 17 | Financial — Investments — Option A/B, overdue accrual, **public overdue-count** | `fin-invest` (5, incl. `/overdue-count`, `/overdue-request`) + admin (GAP-126) | ✅ |
| 18 | Notifications — list/read/read-all/preferences | `dID-7x7G` (5); email sent inline; lazy/poll model | ✅ |
| 19 | **Search** — `GET /search` cross-module | **No `search` group in pull** | ❌ GAP-150 |
| 20 | **Groups** — roles, posts, moderation, appeal, 24h hold | `BiZZDMxu` (17, GAP-120); lazy 24h delete on read | ✅ |
| 21 | **Blog** — review, likes/comments, RG ticket, abandon | `blog` (10, GAP-121) + admin approve/reject/takedown | ✅ |
| 22 | **Loans** — 3-phase lazy repayment | `ZR6bC4we` (3, GAP-122) + admin approve/reject/write-off; lazy Y2/Y3+ debits | ✅ |
| 23 | **Expense Tracker** — personal + Platform Outflow | `XcifSN8G` (4, GAP-123); Platform Outflow debits Admin INR | ✅ |
| 24 | **Contract** — 105% escrow, escalation, penalty cascade, force-close | `sXgmF9KL` (13, GAP-124) + admin `resolve`; lazy deadline auto-expire | ✅ |
| 25 | Admin — award, dispute resolves, settle, games, mint, rates announce, contract resolve, groups moderate, backup-admin, vacation-mode, impersonate, audit-log | `EOOlx4pf` (71, GAP-125). Note: `/admin/points/transfer/{id}/resolve-dispute` (§25.2) **exists in pull** though omitted from the REFERENCE listing. | ✅ |
| 26 | Admin Reports — 6 reports | `admin-reports` (6) | ✅ |
| 27 | Event Logs | `GET /logs/user/my_events` (1) | ✅ |
| 28 | System / Files | `GET /config`, `POST /files/upload`, `DELETE /files/{id}` (3) | ✅ |
| X-cut | Free-plan lazy evaluation (D9) — no cron | REFERENCE confirms lazy expiry/settle/archive/close throughout; tasks not deployed | ✅ |
| X-cut | Audit, atomicity, RBAC | `mutate_wallet` / `mutate_wallet_unchecked` / `log_admin_action` / `require_admin` present and reused | ✅ |
| X-cut | 2FA TOTP + Backup-Admin (GAP-131) | Admin 2FA group (setup/verify/login/recover) + `backup-admin/status` lazy 72h check | ✅ |
| X-cut | Phase-1 hardening (GAP-132) | Guardian flow, DPDP consent+erasure, rate-limit counters all present; device-fingerprint capture to confirm | ✅ (verify fingerprint) |

---

## 5. Gap Backlog (rev 5)

Priority key: **P0** = structural rework / blocks SRS v2.2 correctness · **P1** = net-new module or onramp required for phase completeness · **P2** = hardening / cleanup.

Gap IDs use the **GAP-1xx** series to avoid colliding with the closed GAP-001..026 in [PROGRESS.md](PROGRESS.md). Each gap names its SRS / API_REQUIREMENTS reference, target files, and acceptance criteria. Reuse the conventions in §3 and the table schemas in Appendix A.

### 5.1 Open backlog (rev 5) — work these

The rev-5 reconciliation against the 2026-06-02 pull found the rev-4 backlog **fully built**. Four items remain — two genuine misses and two cleanups:

| Tier | Gap | Title | API_REQ ref | Depends on |
|---|---|---|---|---|
| P1 | GAP-150 | **Search module** — `GET /search` cross-module (marketplace/groups/blog), visibility-filtered | §19 | — |
| P1 | GAP-151 | **Season distribution-records** — `POST /seasons/{id}/distribution-records` (feeds 80% target at close-and-settle) | §13.11 | — |
| P2 | GAP-141 | **Education cleanup** — retire lingering `POST /admin/student-submissions/{id}/review` + any orphan v1 tables/alias dirs | §14 | — |
| P2 | GAP-142 | **Spec deviations** — category tree depth (2-level → ≤8, §6.2); `GET /pts/rate` auth (public → member, §7.1) | §6.2, §7.1 | — |

### 5.2 Closed in rev 4–5 (deployed — see API_REFERENCE.md 2026-06-02)

All of the following are **live in the workspace**. The detailed spec blocks are retained below §5.2 as the **as-built reference** (acceptance criteria still valid for regression checks).

| Tier | Gap | Title | Status |
|---|---|---|---|
| P0 | GAP-100 | PTS live-formula rework (+ admin components/θ/reserve/bootstrap/audit) | ✅ deployed |
| P0 | GAP-140 | Education rework → course-ticket model (retire GAP-017/018) | ✅ deployed |
| P1 | GAP-110 | Marketplace cart (same-vendor, stale-item, atomic checkout) | ✅ deployed |
| P1 | GAP-111 | Monthly minting budget + activity-table versioning | ✅ deployed |
| P1 | GAP-112 | Public donor / sponsor / investor onramps (was GAP-B/C) | ✅ deployed |
| P1 | GAP-120 | Groups module | ✅ deployed |
| P1 | GAP-121 | Blog module (incl. likes/comments, Revenue Generator) | ✅ deployed |
| P1 | GAP-122 | Loan to Members (3-phase, lazy debits) | ✅ deployed |
| P1 | GAP-123 | Expense Tracker (personal + Platform Outflow) | ✅ deployed |
| P1 | GAP-124 | Contract (escrow, escalation, penalty cascade, force-close) | ✅ deployed |
| P1 | GAP-125 | Admin additions (rate-change, contract resolve, groups moderate, backup-admin, vacation-mode, audit-log) | ✅ deployed |
| P1 | GAP-126 | Sponsorship dispute window + public overdue-investment count | ✅ deployed |
| P2 | GAP-130 | Lazy-evaluation sweep (replace any cron reliance) | ✅ deployed |
| P2 | GAP-131 | Admin 2FA TOTP + Backup-Admin trigger | ✅ deployed |
| P2 | GAP-132 | Phase-1 hardening: under-18 guardian, DPDP consent, rate-limit, device fingerprint | ✅ deployed (verify device-fingerprint capture) |

---

### GAP-150 — Search module  **(P1, OPEN)**

- **Requirement:** SRS §17 + API_REQUIREMENTS §19. `GET /search` (member) with `q, sector?, category?, limit?` → `{marketplace:[], groups:[], blog:[]}`, **visibility-filtered** (private groups, RG blogs, inactive items excluded per the owning module's rules).
- **Current state:** No `search` group exists in the pull (confirmed 2026-06-02). This requirement never received a GAP ID in the rev-4 backlog — it is a true miss, not a regression.
- **Build:** new group `search` (canonical `search`), single endpoint. Query each module's table with `includes`/`contains` on name/title/tags, reusing each module's existing visibility predicate (don't duplicate the rules — call the same filters used by `GET /marketplace/items`, `GET /groups`, `GET /blog/public`).
- **Acceptance:** a private group the caller isn't a member of never appears; an RG blog the caller hasn't purchased/grandfathered never appears; results capped by `limit`; `sector`/`category` filters use null-safe `==?`.

### GAP-151 — Season distribution-records  **(P1, OPEN)**

- **Requirement:** SRS §11.11 + API_REQUIREMENTS §13.11. `POST /seasons/{id}/distribution-records` (member = pioneer) with `amount, member_id, event_ref_id` → record that **counts toward the 80% distribution target** evaluated at `close-and-settle`.
- **Current state:** `gaming-seasons` deploys 9 endpoints; no distribution-records writer exists in the pull. `POST /admin/seasons/{id}/close-and-settle` is deployed but currently has no per-record distribution input to measure the 80% target against.
- **Build:** new table `season_distribution_records` (season_id, member_id, event_ref_id, amount, created_at); endpoint restricted to the season's pioneer; `close-and-settle` must sum these records to compute `distribution_pct` / `target_met`.
- **Acceptance:** pioneer can log distributions during an active season; `close-and-settle` returns `distribution_pct` derived from the sum and `target_met` true only at ≥80%.

### GAP-141 — Education cleanup  **(P2, OPEN)**

- **Requirement:** API_REQUIREMENTS §14 / D10 — the v1 Education surface must be fully retired.
- **Current state:** the course-ticket model (GAP-140) is live, but a legacy `POST /admin/student-submissions/{id}/review` endpoint still ships (REFERENCE labels it "kept for historical records"), and orphan v1 artifacts may remain (`api/admin/admin/student_submissions/...`, alias dirs).
- **Action:** confirm no client calls the legacy review endpoint, then remove it and any orphan v1 tables/dirs (`teacher_*`, `chapters`, `subjects`, `independent_tickets`, `review_session*`, `student_submissions`) that hold no records worth retaining. If history must be kept, move it behind an explicit `GET` read-only export and drop the write path.

### GAP-142 — Spec deviations  **(P2, OPEN)**

- **Category tree depth (§6.2 / §9.8):** `GET /marketplace/categories/tree` is deployed but returns a **2-level** nesting; the spec allows **up to 8 levels**. Make depth configurable (`max_depth?`, default 8) and recurse the category parent chain rather than hard-capping at 2.
- **`GET /pts/rate` auth (§7.1) — DECIDED 2026-06-02: tighten to member-only.** Change the endpoint from `public` to `auth = "user"` (matches spec §7.1). θ remains unexposed. Verify no logged-out client depends on it before flipping; legacy `PATCH /admin/pts/rate` is unaffected.

---

### GAP-100 — PTS live-formula rework  ✅ **(P0 — DEPLOYED; as-built reference)**

- **Requirement:** SRS v2.2 §4 + API_REQUIREMENTS §7. Replace the legacy admin-managed rate with the live formula.
- **Retire:** `PATCH /admin/pts/rate` (legacy GAP-A) and direct reads of `pts_rate_current.rate` as the source of truth. Keep `pts_rate_current`/`pts_rate_history` only if useful for caching/history, or migrate to `pts_rate_cache`.
- **New tables (Appendix A.1 additions):**
  - `pts_components` (singleton id=1): `reserve_inr` (R), `hard_assets_inr` (A), `theta` (default 0.00005), `last_conversion_at` (drives t_idle), plus a registry for A breakdown. `I` is read live from Admin's INR ledger; `T_member/T_admin/P_member/P_admin` aggregated live from wallets + escrow.
  - `pts_rate_cache` (singleton id=1): `r_published`, `r_eq`, `R_user`, `computed_at` — 10-second debounce.
- **Compute function** `pts_compute_rate` (new reusable function): implements Steps 1–6 (§7.2), incl. P_net guard, floor 0.0001, threshold 0.00011, `L_invest = Σ min(1.1X,(1.1X/365)·days)` over active investments. Returns full component breakdown.
- **Endpoints (§7.x):** `GET /pts/rate` (rework to call compute; **never expose θ**), `POST /pts/quote`, `POST /pts/convert` (reset `last_conversion_at`, snapshot rate to passbook), `GET /pts/history`, `GET /admin/pts/components`, `POST /admin/pts/theta-adjust` (logged), `PATCH /admin/pts/reserve-assets`, `POST /admin/pts/bootstrap` (seed I + Vishal Gorana Constitutional points so P_net>0), `GET /admin/pts/audit-log`.
- **Acceptance:** with simulated T_admin at 0 / 100 / 10,000 tokens the rate computes correctly (SRS §18 Phase-5 test gate); P_net≤0 suspends conversions; convert applies 2.5% tax to the given side, credits Admin counter-wallet, records r_published + R_user snapshot; θ never appears in member responses.

---

### GAP-140 — Education rework → course-ticket model  ✅ **(P0 — DEPLOYED; as-built reference)**

- **Requirement:** SRS v2.2 §12 + API_REQUIREMENTS §14. See [PENDING_TASKS.md](PENDING_TASKS.md) for the retirement checklist.
- **Retire (out of spec):** groups `edu-teachers` (`edu_teachers`/`education_teachers`) and `edu-sessions` (`edu_sessions`/`education_sessions`); tables `teacher_applications, teachers, subjects, chapters, teacher_duties, independent_tickets, student_submissions, review_sessions, review_session_qa, review_session_participants, review_session_submissions`; admin endpoints for duties/duty-rate/review. Remove the duplicate normalization dirs at the same time.
- **Build (group `education`):** course ticket = marketplace item + sessions. Endpoints §14.1–14.18: `POST /courses` (→ proposal type `course_ticket` + draft sessions), `GET /courses/me`, `GET /courses/{id}`, `POST /admin/courses/{proposal_id}/list`, amendments (`POST /courses/{id}/amendments`, `POST /admin/courses/amendments/{id}/decision`, 48h/6h SLA lazy auto-approve), session lifecycle (`start`/`end`/`checkin`/`verify/{enrollment_id}`/`cancel`/`attendance`), `GET /enrollments/me`, ratings (`rate-teacher`, `rate-student/{enrollment_id}` → auto Constitutional Points), `GET /teachers/{id}/ratings`, payout (`payout-request`, `POST /admin/courses/{id}/payout`).
- **New tables:** `courses` (links proposal/item, revenue split, seats), `sessions` (course_id, date, start/end, venue, status Scheduled/Live/Completed/Cancelled), `enrollments` (course_id, session_id, member_id, status Purchased/Checked-in/Verified, qr_token), `session_ratings` (teacher↔student, stars, testimony). Enrollment created on marketplace purchase of the course item.
- **Lazy rules:** auto-hide after last session passes; session auto-end 4h past scheduled end (Checked-in→Verified); zero-attendance auto-Completed; urgent amendment 6h auto-approve.
- **Acceptance:** any member can list a course via Admin with no fee; in-person flow = scan→Checked-in→teacher Verify; online flow = join→Verified; ratings credit Constitutional Points; payout only when all (non-cancelled) sessions Completed, default 90/10 from escrow.

---

### GAP-110 — Marketplace cart  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §6.6 + API_REQUIREMENTS §9.3–9.6. **Same-proposing-member** constraint; mixed-vendor → separate cart; **stale-cart auto-removal** at checkout (inactive/0-qty dropped + total recalculated); atomic balance re-check at confirmation; one Order ID per item.
- **New tables:** `carts` (member_id, proposing_member_id grouping), `cart_items` (cart_id, item_id, quantity). 
- **Endpoints:** `POST /cart/items`, `GET /cart`, `DELETE /cart/items/{id}`, `POST /cart/checkout`. Checkout reuses the existing order-creation + `mutate_wallet` escrow path per item.
- **Acceptance:** adding a different-vendor item prompts a new cart; an item that went inactive before checkout is removed with notice; checkout debits the exact recalculated total atomically and emits N orders.

---

### GAP-111 — Monthly minting budget + activity-table versioning  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §5.3, §5.4 + API_REQUIREMENTS §8.2, §8.6, §8.7.
- **New table:** `points_minting_budget` (month YYYY-MM unique, budget_points, raised_log json). Track minted-this-month live by summing provision awards in range.
- **Endpoints:** `POST /admin/points/budget` (set/raise; no mid-month downward), `GET /admin/points/budget` (live remaining), `GET /activity-rewards/changelog`, and version the catalog (add `version`, `effective_from` to `activity_catalog` writes).
- **Enforce in** `POST /admin/points/award` + `POST /activities`: once budget exceeded, **block Promotional** provisions (Constitutional still allowed). No budget set → unrestricted.

---

### GAP-112 — Public donor / sponsor / investor onramps  ✅ **(P1 — DEPLOYED; as-built reference)**

- Merges legacy **GAP-B** and **GAP-C** (see detail retained below). Make `POST /declarations`, `POST /sponsorships`, `POST /investments` accept **public OR member** input; unauthenticated requires a contact email; `member_id`/`sponsor_member_id`/`investor_member_id` persisted null. Factor a shared `create_declaration` function. **v2.2 note:** Donations/Grants have **no anonymous option** (identity always recorded; anonymity only governs public *display* at publish — §15.3).

---

### GAP-120 — Groups module  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §7 + API_REQUIREMENTS §20 (group `groups`).
- **New tables:** `member_groups` (name, description, sector, type public/private, admin_member_id, status, delete_at), `member_group_members` (group_id, member_id, role admin/co_admin/member, status active/pending/removed), `group_posts` (group_id, author, type, content, media json, poll json), `group_post_comments`, `group_post_reactions`, `group_invites`.
- **Endpoints §20.1–20.17:** create/list/detail, join (public instant / private request), leave (admin must transfer first), join-request decision, invite + respond, promote-coadmin, transfer-admin, remove-member (blocks rejoin), delete (24h hold, lazy finalise), appeal-removal (to VGC Admin), posts list/create, comments, reactions.
- **Visibility:** private group posts → members only; public posts → logged-in members only (not anon).

---

### GAP-121 — Blog module  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §8 + API_REQUIREMENTS §21 (group `blog`).
- **New tables:** `blogs` (author, title, content, sector, tags json, status draft/in_review/published/rejected/abandoned/taken_down, points_awarded, revenue_generator bool, allow_monetisation bool), `blog_likes`, `blog_comments`, `blog_readers` (grandfathering + ticket access).
- **Endpoints §21.1–21.13:** CRUD + submit, admin approve/reject (Constitutional points on decision), takedown (Revenue Generator → close ticket + refund buyers), abandon (monetisation consent), delete (never-published & 0 pts only), public list/detail (Revenue Generator visibility + grandfathering), **like** (Promotional reward 600 via activity), **comment** (notifies author). Revenue Generator ticket proposed via §10 Proposals.

---

### GAP-122 — Loan to Members  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §9 + API_REQUIREMENTS §22 (group `loans`).
- **New tables:** `loans` (member, amount_inr, upi_id, purpose, status pending/rejected/active/settled/written_off, approved_at, outstanding_tokens, principal_tokens), `loan_debits` (loan_id, phase, calc, tokens, applied_at), `loan_repayments`.
- **3-phase repayment (lazy):** Y1 help (₹10/token), Y2 consequence (recalc at ₹8.50/token), Y3+ business (+10% p.a.). Annual phase debits computed/applied when the loan is read past each anniversary, sequential by Loan ID. Negative token balance allowed; offset on new token purchase (cross-cutting).
- **Endpoints:** request, me (with consolidated schedule + history), admin approve/reject (disburse + Y1 debit), repay, admin write-off.

---

### GAP-123 — Expense Tracker  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §10 + API_REQUIREMENTS §23 (group `expenses`).
- **New table:** `expenses` (member, date, amount_inr, payment_mode, platform_ref, main_category, specific_category, reason, entry_type Personal/Platform Outflow, remark_visibility Public/Private, settlement_status Pending/Settled, locked). Platform Outflow is Admin-only and **debits the Admin INR ledger** (sole debit mechanism).
- **Endpoints:** `POST /expenses`, `GET /expenses/me` (+ dashboard aggregates), `POST /expenses/{id}/settle` (permanent lock), `GET /platform-financial-ledger` (public; remark shown only if Public).

---

### GAP-124 — Contract  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §14 + API_REQUIREMENTS §24 (group `contracts`).
- **New tables:** `contracts` (giver, taker, title, requirements, application_deadline, requested_completion_date, budget_points, type vgc_administrated/non_vgc, sector, conditions, status listed/active/completed/cancelled/expired/disputed, escrow refs), `contract_applications`, `contract_ratings`, `contract_disputes`.
- **VGC Administrated:** lock 105% (100% escrow + 5% listing fee) at listing via `mutate_wallet`; release = 95% to Taker, 5% retained; reject non-verifiable conditions.
- **Non-VGC:** trust-based; 150% penalty cascade on upheld bad-faith (points → PTS-converted tokens no-tax → negative balance), Taker receives lesser of 150%/recovered, Admin keeps no spread.
- **Caps:** Taker 2 active (both types); Giver 10 VGC-administrated. **Lazy:** listing auto-deactivates past application_deadline (100% escrow returned, 5% fee retained).
- **Endpoints §24.1–24.13:** create/list/detail/edit, apply, assign, mark-complete, release, dispute, escalate (7-day giver inaction), cancel, force-close-request (60d), rate. Admin resolution in GAP-125.

---

### GAP-125 — Admin additions  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** API_REQUIREMENTS §25.11–25.16.
- **Endpoints:** `POST /admin/rates/announce-change` (INR↔Token, 30-day notice + platform notification; wallet shows current+future — SRS §3.2); `POST /admin/contracts/{id}/resolve` (release/withhold + 150% cascade + force-close disposition); `POST /admin/groups/{id}/moderate` (remove post/member, delete group); `POST /admin/backup-admin/designate`; `POST /admin/vacation-mode`; `GET /admin/audit-log` (filterable trail — most `log_admin_action` plumbing already exists).

---

### GAP-126 — Sponsorship dispute + public overdue-investment count  ✅ **(P1 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §13.4, §13.2.1 + API_REQUIREMENTS §16.5, §17.4.
- **Endpoints:** `POST /sponsorships/{id}/dispute` (within 7 days of documentation; Admin decision binding); `GET /investments/overdue-count` (public transparency — count only, computed lazily from due dates). Add `POST /investments/{id}/overdue-request` if not already covered.

---

### GAP-130 — Lazy-evaluation sweep  ✅ **(P2 — DEPLOYED; as-built reference)**

- **Requirement:** Free-plan rule (SRS §1.4.1) + the Time-Dependent Behaviour table in API_REQUIREMENTS. Ensure every clock-driven rule resolves on read (no scheduled task). Audit existing endpoints: points-transfer expiry (`/pending`,`/accept`), marketplace auto-settle (order read), season archive, election close. Where a push-only notification is genuinely needed, expose a protected admin endpoint and document the optional external-cron URL. Delete the staged `pts_transfer_window_expire.xs.pending` and any `task/*.xs` that assume cron.

---

### GAP-131 — Admin 2FA TOTP + Backup-Admin trigger  ✅ **(P2 — DEPLOYED; as-built reference)**

- **Requirement:** SRS §15.2. Implement TOTP with XANO crypto functions (no native helper); recovery codes; new-device email OTP; 3-fail 30-min lockout; login-event logging. Backup-Admin 72h-inactivity evaluated lazily on backup access attempt; Vacation Mode pauses it.

---

### GAP-132 — Phase-1 hardening  ✅ **(P2 — DEPLOYED; as-built reference — verify device-fingerprint capture)**

- **Requirement:** SRS §2.1.2, §2.4, §17. Under-18 guardian-approval flow (7-day expiry); DPDP consent capture at signup (timestamped) + erasure request endpoint + anonymisation on closure; rate-limit counters (3 regs/device/24h, 5 OTP/email/hr) via a counter table; device-fingerprint storage from the WeWeb client.

---

## 5b. Legacy gap notes (pre-rev-4)

> Retained for the detailed snippets. **GAP-A** is now folded into **GAP-100** (PTS rework). **GAP-B/GAP-C** are now **GAP-112** (public onramps) — the XanoScript skeletons below are still accurate. **GAP-D** (scheduled tasks) is **obsolete** — superseded by the lazy-evaluation playbook in Appendix B; do not deploy cron tasks on the Free plan.

---

### GAP-A — Admin PTS rate update endpoint

- **Priority:** P0 (without this, admin cannot tune the rate without direct DB access)
- **Requirement:** API_REQUIREMENTS.md §7.2 — `PATCH /admin/pts/rate` (admin only)
- **Affected:** create `XANO/api/pts/admin/rate_PATCH.xs` (or place under `XANO/api/admin/` if the admin grouping is preferred — see existing convention for split-canonical endpoints)
- **Acceptance:**
  1. Admin-only (calls `require_admin`).
  2. Validates `rate > 0` (decimal).
  3. Inside `db.transaction`: writes a row to `pts_rate_history` and updates the singleton row in `pts_rate_current`.
  4. Returns `{rate, effective_from, history_id}`.
- **Validated snippet** (also in §5/GAP-005 of the previous plan revision — confirmed via `xano_validate_xanoscript`):

```xs
// XANO/api/pts/admin/rate_PATCH.xs
query "admin/pts/rate" verb=PATCH {
  api_group = "Point Token Scheme"
  auth = "user"
  input {
    decimal rate filters=min:0.00000001
    text note?
  }
  stack {
    function.run require_admin { input = { auth_context: $auth } } as $admin_ok
    db.transaction {
      stack {
        db.get pts_rate_current { field_name = "id"  field_value = 1 } as $prev
        db.add pts_rate_history {
          data = {
            previous_rate       : ($prev|get:"rate"),
            new_rate            : $input.rate,
            updated_by_admin_id : $auth.id,
            note                : $input.note,
            created_at          : now
          }
        } as $hist
        db.add_or_edit pts_rate_current {
          field_name = "id"
          field_value = 1
          data = {
            id                  : 1,
            rate                : $input.rate,
            effective_from      : now,
            updated_by_admin_id : $auth.id,
            note                : $input.note,
            updated_at          : now
          }
        } as $current
      }
    }
  }
  response = { rate: $input.rate, effective_from: now, history_id: $hist.id }
}
```

---

### GAP-B — `POST /declarations` public / anonymous donor flow

- **Priority:** P1 (blocks Donor Page onramp for non-members per SRS §3.5, §9.1)
- **Requirement:** API_REQUIREMENTS.md §6.1 — endpoint must accept anonymous donors (no `member_id`) for `payment_type ∈ {Donation, Grant, Sponsorship}`. Investment / Token Purchase remain auth-only.
- **Current:** Endpoint exists and accepts all required fields (`payment_type`, `additional_details`, `contact_email`, `contact_mobile`), but is `auth: required`.
- **Affected:** [XANO/api/inr_forms/declarations_POST.xs](XANO/api/inr_forms/declarations_POST.xs); table [XANO/table/declarations.xs](XANO/table/declarations.xs) (ensure `member_id` is nullable).
- **Acceptance (per D1, D2):**
  1. Drop `auth = "user"` from the endpoint; treat auth as optional.
  2. Inside the stack: `var $member_id { value = ($auth ?? {})|get:"id" }`.
  3. When `$member_id == null`:
     - Precondition: `payment_type ∈ {Donation, Grant, Sponsorship}` else 403.
     - Precondition: `contact_email != null` else 400.
  4. When authenticated, `member_id` is set from `$auth.id` and `contact_email` is optional.
  5. Existing rows must remain valid — verify `declarations.member_id` is nullable in schema; if not, change to `int member_id? { table = "user" }` and re-pull.
- **Skeleton** — see prior plan revision (GAP-003) for the full XanoScript draft.

---

### GAP-C — Public sponsor / investor onramps

- **Priority:** P1 (parallel to GAP-B — required for non-member contribution flows)
- **Requirement:** API_REQUIREMENTS.md §17.1 (sponsorships) and §18.1 (investments) — both should accept **public or member** input. The auto-created declaration row must use the GAP-B public flow.
- **Current:** Both endpoints exist and persist correctly, but require auth.
- **Affected:**
  - [XANO/api/fin_sponsor/sponsorships_POST.xs](XANO/api/fin_sponsor/sponsorships_POST.xs)
  - [XANO/api/fin_invest/investments_POST.xs](XANO/api/fin_invest/investments_POST.xs)
- **Acceptance:**
  1. Drop `auth = "user"`. Treat auth as optional inside the stack.
  2. **Sponsorships (§17.1):** add public-only inputs `sponsor_display_name text?`, `sponsor_email email?`. When unauthenticated, require `sponsor_email`. Persist `sponsor_member_id = null`.
  3. **Investments (§18.1):** add public-only inputs `investor_display_name text?`, `investor_email email?`, `investor_mobile text?`. When unauthenticated, require `investor_email` (for payout coordination). Persist `investor_member_id = null`.
  4. The paired declaration row created by each endpoint must follow GAP-B rules — easiest path is to factor a `function "create_declaration"` and call it from both endpoints.
- **Dependency:** Land GAP-B first so the declaration-side validation is consistent.

---

### GAP-D — Verify scheduled tasks deployed

- **Priority:** P2 (correctness depends on cron being live)
- **Requirement:** API_REQUIREMENTS.md §Cross-Cutting lists 7 background jobs. Tasks are not visible in API_REFERENCE.md (which only catalogs endpoints), so deployment status must be verified directly against the workspace.
- **Action:**
  1. `ls /Users/boss/Desktop/VGC/XANO/task/` — confirm each of these files exists:
     - `pts_transfer_window_expire.xs` (`freq: 60`)
     - `marketplace_auto_settle.xs` (`freq: 86400`)
     - `investment_payouts_due_notifier.xs` (`freq: 86400`)
     - `season_archive.xs` (`freq: 86400`)
     - `election_close_when_window_ends.xs` (`freq: 300`)
     - `notification_email_dispatcher.xs` (`freq: 60`)
     - `independent_teacher_active_ticket_audit.xs` (`freq: 86400`)
  2. For each task file, open in Xano dashboard → confirm it is **active** (not paused) and last-run timestamp is recent.
  3. For any missing or paused task: use the validated snippets in [Appendix B](#appendix-b--scheduled-tasks-xanoscript) as the source of truth.

---

## 6. Cross-Cutting Concerns

### 6.1 Auth model

- All endpoints intended for members or admins: `auth = "user"`. Public endpoints (donors page, items list, categories tree, sponsorships page, donations form per GAP-B) omit `auth` entirely.
- Admin gating must use `require_admin`. Do **not** introduce a separate auth realm — the existing realm `839577` is sufficient; admin is a flag on the user row.

### 6.2 Atomicity & ledger

- Every wallet credit/debit goes through `function/mutate_wallet.xs`. Never `db.edit wallets` directly from a new endpoint — that bypasses the ledger and `wallet_transactions`.
- Endpoint stacks that touch multiple wallets must wrap the calls in `db.transaction { stack { ... } }`. `mutate_wallet` itself opens an inner transaction; Xano handles nesting safely, but the outer transaction guarantees all-or-nothing semantics for the larger workflow.

### 6.3 Idempotency (per D6)

- Every POST that mutates wallets or creates a billable resource accepts an **optional `idempotency_key text?` input field** (NOT a header) and uses the wrapper pattern in §3.5.
- Endpoints already using this: `POST /pts/convert`, `POST /marketplace/orders`, `POST /marketplace/orders/{id}/mark-received`, `POST /sponsorships`, `POST /investments`, `POST /seasons/{id}/secure-funding/deposit`.
- `POST /points-transfer` keeps its header-based pattern (works in production). A P2 cleanup will migrate it after the rest of the codebase converges on the input-field pattern.

### 6.4 Admin audit

- Every admin-only POST/PATCH should call `function.run log_admin_action { input = { ... } } as $audit` near the end of the stack. Without this, the admin reports in §21 will have gaps.

### 6.5 RBAC

- `user.role_flags` is a `json` column. Read with `$auth.role_flags|get:"is_admin"`. The SRS §2.3 multi-role rules (e.g. a Sponsor cannot also be a Pioneer in the same season) are enforced at the application layer inside the relevant POST handlers, not by `require_admin`.

### 6.6 Error contract

- Use the four documented error types: `inputerror` (400), `accessdenied` (403), `notfound` (404), `standard` (500). `precondition (...) { error_type = "..."  error = "..." }` is preferred over `throw` for guard clauses.

### 6.7 Time-dependent logic = lazy evaluation (per D9)

- **Never** rely on a scheduled task — the Free plan has none. Resolve clock-driven state when the relevant endpoint is read. Pattern: on read, check the timestamp condition (e.g. `window_ends_at <= now`, `dispute_window_ends_at <= now`, `end_date < now`); if met and the row is not yet in its post-deadline state, transition it (inside `db.transaction` if it moves wallets) before returning. Make transitions idempotent so repeated reads are safe.
- For state that affects aggregates rather than a single row read (e.g. `L_invest`), compute the value inline from elapsed time at the moment it's needed — store nothing nightly.
- Push-only notifications (due-payout reminders, deletion finalisation when nobody's online) may be backed by a protected admin endpoint that an **external** cron calls. Mark such endpoints `[CRON-OPTIONAL]`; the platform must remain correct without them.

---

## 7. Verification Plan

The bulk of the platform is already deployed. Use this section as a per-gap acceptance checklist plus a smoke-test pass for endpoints that landed recently.

### 7.1 Per-gap verification

**Open gaps (rev 5):**

| Gap | Verification steps |
|---|---|
| GAP-150 (Search) | `GET /search?q=…` returns `{marketplace, groups, blog}`. A private group the caller isn't in, and an RG blog they haven't purchased, never appear. `limit` caps each array. |
| GAP-151 (distribution-records) | Pioneer `POST /seasons/{id}/distribution-records` logs a record during an active season; `close-and-settle` returns `distribution_pct` from the summed records and `target_met` true only at ≥80%. Non-pioneer → 403. |
| GAP-141 (edu cleanup) | After removal, `POST /admin/student-submissions/{id}/review` → 404. No orphan v1 tables remain in the pull. |
| GAP-142 (deviations) | `GET /marketplace/categories/tree?max_depth=4` nests up to 4 levels (not capped at 2). `GET /pts/rate` returns 401 unauthenticated, 200 for a logged-in member (tightened to `auth="user"`). |

**Closed gaps (regression checks — already deployed):**

| Gap | Verification steps |
|---|---|
| GAP-100 (PTS) | `GET /pts/rate` returns `r_eq, r_published, r_user, conversion_suspended` and **no θ**. With `P_net ≤ 0`, conversions suspended. `POST /pts/convert` applies 2.5% tax to the given side and resets the idle counter. |
| GAP-112 (onramps) | Public `POST /declarations/public` with `payment_type=Donation` + `contact_email` → 200, `member_id=null`; without email → 400. Public `POST /sponsorships`/`/investments` with email persist null member-id. |
| GAP-140 (education) | Member proposes course → admin lists → enrollment auto-created on purchase. In-person scan→Checked-in→teacher Verify; online join→Verified. Payout only when all non-cancelled sessions Completed (default 90/10). |

### 7.2 Smoke tests for deployed surfaces (sanity check)

Run after any re-pull or push that touches these areas. These are not gaps but quick checks that high-traffic endpoints still behave correctly.

| Surface | Test |
|---|---|
| Wallets | `GET /me/INR` returns one wallet row for the authenticated user. `GET /me/activity?per_page=5` returns ≤ 5 transactions, newest first. |
| Points transfer escrow | User A transfers points to user B. Within 10 min, user B's `GET /pending?direction=incoming` does **not** include the transfer. After `window_ends_at`, the next read of `/pending` or `/accept` **lazily** flips it to acceptable (no cron). |
| PTS convert idempotency | `POST /pts/convert` twice with the same `idempotency_key` returns identical responses and writes only one `pts_conversions` row. |
| Marketplace order lifecycle | Place order → status `pending_pod`, buyer debited. Submit POD → status `pod_submitted`. Buyer `mark-received` → status `settled`, proposer + admin credited per revenue split, `marketplace_settlements` row created. |
| Auto-settle (lazy) | Backdate a POD's `dispute_window_ends_at`; the next `GET /marketplace/orders/{id}` read settles it on read. Admin batch `POST /admin/marketplace/orders/auto-settle` is `[CRON-OPTIONAL]`. |
| Activity auto-award | Catalog entry `blog_publish` with `auto_award=true, default_reward=10`. `POST /activities` increases caller's points wallet by 10 and writes a ledger entry. |
| Season settlement | `POST /seasons/{id}/secure-funding/deposit` with 100 tokens → 50 admin credit + 50 points to pool. `close-and-settle` with `target_met=true` distributes 26% across pioneer/manager/treasurer 10/8/8. |
| Education (course-ticket) | Member `POST /courses` → admin `POST /admin/courses/{proposal_id}/list`. Buying the listed item auto-creates an enrollment. Student rates teacher → 2,400 Constitutional Points credited. |
| Notifications | Emit `points_transfer_accepted` → row appears in receiver's `GET /notifications` with `read_at=null`. `POST /notifications/read-all` returns the count and marks all read. |

For every endpoint touched in a future change, also run `mcp__xano__xano_validate_xanoscript({ file_path: "<path>" })` before pushing.

---

## 8. Binding Decisions (D1–D11)

These were resolved 2026-05-24 (D1–D8) and 2026-05-30 (D9–D11) and remain binding. New work must follow these rules. D3 and D8 are superseded (see their entries).

### D1 — Declaration status enum
**Add `draft` to `declarations.status`.** Final enum: `["draft", "pending", "verified", "rejected"]`. `POST /declarations` creates rows as `draft`. `POST /{id}/submit` flips to `pending`. Existing `pending` rows remain valid (already past draft). Enum extension is non-breaking; no migration required.

### D2 — Anonymous donor email
**Anonymous donors must provide `contact_email`.** Stored on the declaration. Never shown publicly. Used for receipts and refund coordination. Mobile remains optional.

### D3 — PTS rate semantics  ⚠️ SUPERSEDED by D11
~~**Rate is admin-managed and dynamic.** `pts_rate_current.rate` = VGC Points per 1 VGC Token.~~ **Void.** SRS v2.2 §4 makes the rate **live-computed** from platform state, not admin-set. The legacy `pts_rate_current` row and `PATCH /admin/pts/rate` survive only as a documented rollback path. See **D11** and GAP-100 (deployed). Member-facing semantics are now `R_user = 10 / r_published` (Points per Token).

### D4 — Admin member_id location
**Add column `admin_member_id int? { table = "user" }` to `system_config`.** Read in every admin-counter-entry as `$cfg.admin_member_id ?? 1`. Seed with the production admin's `user.id` after first deploy. Single source of truth; one read per request; avoids scanning the `user` table per wallet write.

### D5 — Marketplace settlement timing (two-phase escrow + buyer-initiated early release)
1. **Order placed** → buyer wallet debited to escrow via `mutate_wallet` (ref_type `marketplace_order_hold`). Order status `pending_pod`. Seller wallet untouched.
2. **Proposer submits POD** → status `pod_submitted`. Dispute window opens; `dispute_window_ends_at = now + system_config.marketplace_dispute_window_days * 86400 s`.
3. **Buyer options during window:**
   - `POST /orders/{id}/mark-received` → immediate settle. Status → `settled`.
   - `POST /orders/{id}/dispute` → status `disputed`; admin resolves via `POST /admin/marketplace/orders/{id}/resolve-dispute`.
   - No action → settled **lazily on the next order read** after the window expires (D9; admin batch endpoint is `[CRON-OPTIONAL]`).
4. **Settlement** credits proposer + admin per `revenue_share_proposer_pct` / `revenue_share_admin_pct` and writes `marketplace_settlements`.

### D6 — Idempotency pattern
**Idempotency key is an INPUT FIELD, not a header.** All new POSTs that need idempotency declare `text? idempotency_key` in their `input { }` block and pass `$input.idempotency_key` to `function.run idempotency_lookup` / `idempotency_store`. Existing `POST /points-transfer` keeps its header pattern for now (works in production); migrate later in a P2 cleanup.

### D7 — Notification defaults
**In-app ON and email ON for all 14 events by default.** Users opt OUT per-event via `notification_preferences.per_event`. Schema: `{ "<event_type>": { in_app: false, email: false } }` — absence of a key means default (both on).

### D8 — Independent teacher fee  ⚠️ SUPERSEDED by D10
~~50 VGC Tokens, one-time per active ticket posted...~~ **Void.** SRS v2.2 §12.1 removes all teacher fees. Education is now the course-ticket model (see D10 / GAP-140).

### D9 — Free-plan, no scheduled tasks (lazy evaluation)
**Binding (SRS v2.2 §1.4.1).** The workspace is on XANO Free; scheduled/background tasks are unavailable. **No feature may depend on a cron task.** Every clock-driven rule is resolved by lazy evaluation when the relevant endpoint is read (see the Time-Dependent Behaviour table in API_REQUIREMENTS.md and Appendix B here). The only permitted "push" mechanism is an optional free **external** cron (cron-job.org / GitHub Actions) calling a protected admin endpoint — and only for notifications that must fire when no member is online. Do not push `task/*.xs` files.

### D10 — Education = course-ticket model
**Binding (SRS v2.2 §12).** Any member becomes a Teacher by proposing a **course ticket** (a marketplace item + sessions) via the Proposals flow — no appointment, no duties, no chapters, no permission/verification fees, no student-submissions, no review-sessions. The built `edu-teachers`/`edu-sessions` groups and their tables are **retired** (GAP-140). Education surface = sessions, enrollment, QR check-in + manual verify, ratings (auto Constitutional Points), amendments (48h/6h SLA), payout (default 90/10 when all sessions Completed).

### D11 — PTS rate is live-computed, not admin-set
**Binding (SRS v2.2 §4).** The rate is computed from platform state every read (10-second debounce cache): `r_eq = (I + R + A − L_invest − 10·T_net) / P_net`, time-drift `r_published = r_eq·(1+θ·t_idle)`, floor 0.0001, threshold 0.00011, member-facing `R_user = 10/r_published`. Admin manages **inputs** (R, A, θ) and bootstrap — never the rate directly. **θ is never exposed** to members. `L_invest` is computed on demand (`min(1.1X,(1.1X/365)·days)` per active investment). This supersedes legacy D3 (admin-managed rate) and GAP-A.

---

## Appendix A — New Tables (XanoScript)

> **As of rev 5, nearly all of these tables are DEPLOYED** — the authoritative schema is now the pull in `XANO/table/`, and API_REFERENCE.md "Key Tables" is the live index. The snippets here are kept as reference and were reconciled against the 2026-06-02 pull (PTS and Education subsections updated to the deployed shape). Snippets marked `— DEPLOYED (pull)` were copied verbatim from the workspace; treat the pulled `.xs` as canonical if they ever diverge. Add new fields to the **bottom** of any extended table (Xano best practice — preserves column order). None of these tables sets `auth = true` (only `user.xs` is the auth table).

### A.1 PTS

> **Live formula (D11 / GAP-100) tables.** `pts_components` (singleton id=1) holds the admin-managed inputs R/A/θ; `pts_rate_cache` (singleton id=1) is the 10-second debounce cache. `pts_conversions` is the passbook. `pts_rate_current`/`pts_rate_history` are **legacy** (admin-managed rate, D3) and survive only as the documented rollback path — they are **not** the source of truth for the published rate.

```xs
// XANO/table/pts_components.xs   — DEPLOYED (pull). Singleton id=1: admin-managed PTS inputs.
table pts_components {
  auth = false
  schema {
    int id                            // singleton: always 1
    decimal reserve_inr?              // R
    decimal hard_assets_inr?          // A
    json assets_breakdown?            // A registry (line items)
    decimal theta?                    // θ time-decay coefficient — NEVER exposed to members
    timestamp last_conversion_at?     // drives t_idle
    timestamp updated_at?=now
  }
  index = [{type: "primary", field: [{name: "id"}]}]
}
```

```xs
// XANO/table/pts_rate_cache.xs   — DEPLOYED (pull). Singleton id=1: 10-second debounce cache.
table pts_rate_cache {
  auth = false
  schema {
    int id                            // singleton: always 1
    decimal r_eq?
    decimal r_published?
    decimal r_user?                   // member-facing: Points per Token (= 10 / r_published)
    decimal theta_applied?
    decimal t_idle_minutes?
    json components?                  // {I, R, A, T_net, P_net, L_invest}
    timestamp computed_at?
    timestamp cached_until?           // computed_at + 10s
  }
  index = [{type: "primary", field: [{name: "id"}]}]
}
```

```xs
// XANO/table/pts_rate_current.xs   — LEGACY (D3, rollback only; not the live rate source)
table pts_rate_current {
  auth = false
  schema {
    int id                                       // singleton: always 1
    decimal rate filters=min:0
    timestamp effective_from?=now
    int updated_by_admin_id? { table = "user" }
    text note?
    timestamp updated_at?=now
  }
  index = [{type: "primary", field: [{name: "id"}]}]
}
```

```xs
// XANO/table/pts_rate_history.xs   — LEGACY (D3, rollback only)
table pts_rate_history {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    decimal previous_rate?
    decimal new_rate
    int updated_by_admin_id { table = "user" }
    text note?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
```

```xs
// XANO/table/pts_conversions.xs
table pts_conversions {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    enum direction { values = ["points_to_tokens", "tokens_to_points"] }
    decimal gross
    decimal tax_pct
    decimal tax_amount
    decimal net
    decimal rate
    decimal receive_amount
    text idempotency_key?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "member_id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree|unique", field: [{name: "idempotency_key"}]}
  ]
}
```

### A.2 Activity rewards

```xs
// XANO/table/activity_catalog.xs
table activity_catalog {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text activity_code filters=trim
    text label
    enum provision_type { values = ["constitutional", "promotional"] }
    int default_reward filters=min:0
    bool auto_award?=false
    bool active?=true
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "activity_code"}]}
    {type: "btree", field: [{name: "active"}]}
  ]
}
```

```xs
// XANO/table/activities.xs
table activities {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    text activity_code
    text entity_ref
    json metadata?
    enum status { values = ["pending_review", "auto_rewarded", "rewarded", "rejected"] }
    int points_awarded?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "member_id"}]}
    {type: "btree", field: [{name: "activity_code"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

### A.3 Marketplace (extensions + new)

```xs
// Extension columns added to XANO/table/marketplace_items.xs (append to schema bottom):
//   int proposing_member_id? { table = "user" }
//   decimal revenue_share_proposer_pct?
//   decimal revenue_share_admin_pct?
//   json buyer_info_schema?
//   json category_path_ids?
//   int parent_category_id? { table = "categories" }
```

```xs
// Extension columns for XANO/table/categories.xs:
//   int parent_id? { table = "categories" }
//   text sector?
//   int icon_file_id? { table = "files" }
//   enum status?=active { values = ["active", "inactive"] }
```

```xs
// XANO/table/marketplace_proposals.xs
table marketplace_proposals {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?=now
    int proposer_member_id { table = "user" }
    text item_name
    text description
    text sector
    json suggested_category_path
    text item_type
    decimal suggested_price_tokens
    decimal proposed_revenue_share_pct
    json buyer_info_schema
    json attachments?
    enum status { values = ["draft", "submitted", "changes_requested", "accepted", "rejected", "withdrawn"] }
    text admin_notes?
    int accepted_item_id? { table = "marketplace_items" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "proposer_member_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/marketplace_pod.xs
table marketplace_pod {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int order_id { table = "orders" }
    int[] proof_file_ids
    text note?
    timestamp dispute_window_ends_at
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "order_id"}]}
  ]
}
```

```xs
// XANO/table/marketplace_order_disputes.xs
table marketplace_order_disputes {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int order_id { table = "orders" }
    int raised_by_member_id { table = "user" }
    text reason
    int[] evidence_file_ids?
    enum status?=open { values = ["open", "resolved"] }
    enum resolution? { values = ["full_refund", "partial_refund", "vendor_favour"] }
    decimal partial_amount_tokens?
    text resolution_notes?
    timestamp resolved_at?
    int resolved_by? { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "order_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/marketplace_settlements.xs
table marketplace_settlements {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int order_id { table = "orders" }
    decimal proposer_credit_tokens
    decimal admin_credit_tokens
    int settled_by? { table = "user" }   // null if auto-settled
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "order_id"}]}
  ]
}
```

### A.4 Gaming

```xs
// XANO/table/games.xs
table games {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text name filters=trim
    text sector
    int icon_file_id? { table = "files" }
    text description?
    enum status?=active { values = ["active", "archived"] }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "name"}]}
  ]
}
```

```xs
// XANO/table/game_groups.xs
table game_groups {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int game_id { table = "games" }
    int created_by_member_id { table = "user" }
    text name filters=trim
    text description?
    int member_count?=1
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "game_id"}]}
  ]
}
```

```xs
// XANO/table/game_group_members.xs
table game_group_members {
  auth = false
  schema {
    int id
    timestamp joined_at?=now
    int group_id { table = "game_groups" }
    int member_id { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "group_id"}, {name: "member_id"}]}
  ]
}
```

```xs
// XANO/table/pioneer_candidates.xs
table pioneer_candidates {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    int game_id { table = "games" }
    int election_id? { table = "elections" }
    text season_name
    date start_date
    date end_date
    int season_icon_file_id? { table = "files" }
    int num_events filters=min:1
    enum funding_model { values = ["secure_funding", "open_funding"] }
    int total_points_budget?
    json events                       // array of {name, rules, reward_rules, icon_file_id}
    decimal deposit_tokens?=10
    decimal setup_fee_tokens?=0
    enum status?=submitted { values = ["submitted", "locked", "won", "lost", "refunded"] }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "game_id"}]}
    {type: "btree", field: [{name: "election_id"}]}
    {type: "btree", field: [{name: "member_id"}]}
  ]
}
```

```xs
// XANO/table/elections.xs
table elections {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int game_id { table = "games" }
    timestamp voting_start
    timestamp voting_end
    int voting_rights_marketplace_item_id? { table = "marketplace_items" }
    enum status?=upcoming { values = ["upcoming", "open", "closed", "tie_break_pending"] }
    int winner_candidate_id? { table = "pioneer_candidates" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "game_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/votes.xs
table votes {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int election_id { table = "elections" }
    int candidate_id { table = "pioneer_candidates" }
    int voter_member_id { table = "user" }
    int voting_right_order_id? { table = "orders" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "election_id"}, {name: "voter_member_id"}]}
  ]
}
```

### A.5 Seasons & events

```xs
// XANO/table/seasons.xs
table seasons {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int game_id { table = "games" }
    int pioneer_member_id { table = "user" }
    text name
    date start_date
    date end_date
    int icon_file_id? { table = "files" }
    enum status?=upcoming { values = ["upcoming", "active", "archived"] }
    bool is_locked?=false
    json funding?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "game_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/season_committee.xs
table season_committee {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int season_id { table = "seasons" }
    int manager_member_id? { table = "user" }
    int treasurer_member_id? { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "season_id"}]}
  ]
}
```

```xs
// XANO/table/events.xs
table events {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int season_id { table = "seasons" }
    text name
    text rules?
    json reward_rules?
    int icon_file_id? { table = "files" }
    json submission_schema?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "season_id"}]}
  ]
}
```

```xs
// XANO/table/event_submissions.xs
table event_submissions {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int event_id { table = "events" }
    int participant_member_id { table = "user" }
    json fields
    int[] file_ids?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "event_id"}]}
  ]
}
```

```xs
// XANO/table/event_results.xs
table event_results {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int event_id { table = "events" }
    int participant_member_id { table = "user" }
    decimal points_awarded
    text notes?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "event_id"}]}
  ]
}
```

```xs
// XANO/table/season_funding.xs
table season_funding {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int season_id { table = "seasons" }
    int member_id { table = "user" }
    decimal tokens
    decimal admin_share
    decimal points_for_events
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "season_id"}]}
  ]
}
```

```xs
// XANO/table/season_distribution_records.xs   — PROPOSED (GAP-151, not yet built)
// Pioneer-logged distributions that count toward the 80% target (§11.11), summed at close-and-settle.
table season_distribution_records {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int season_id { table = "seasons" }
    int member_id { table = "user" }          // recipient
    int event_ref_id? { table = "events" }
    decimal amount
    int logged_by { table = "user" }           // pioneer
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "season_id"}]}
    {type: "btree", field: [{name: "member_id"}]}
  ]
}
```

### A.6 Education

> **Deployed model (D10 / GAP-140) — course-ticket tables.** These five are the live Education schema, copied verbatim from the 2026-06-02 pull. The v1 appointed-teacher tables that follow are **RETIRED**.

```xs
// XANO/table/courses.xs   — DEPLOYED (pull)
table courses {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?=now
    int proposal_id { table = "marketplace_proposals" }
    int item_id? { table = "marketplace_items" }
    int teacher_member_id { table = "user" }
    text course_name
    text description
    json images?
    decimal price_per_student
    int total_seats
    decimal revenue_split_teacher_pct?=90
    decimal revenue_split_admin_pct?=10
    json buyer_info_schema?
    enum status?=proposed { values = ["proposed", "listed", "completed", "cancelled"] }
    bool payout_requested?
    bool payout_done?
    decimal payout_amount_tokens?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "teacher_member_id"}]}
    {type: "btree", field: [{name: "proposal_id"}]}
    {type: "btree", field: [{name: "item_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/sessions.xs   — DEPLOYED (pull)
table sessions {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?=now
    int course_id { table = "courses" }
    timestamp scheduled_start
    timestamp scheduled_end
    text venue_or_platform?
    bool online?
    enum status?=Draft { values = ["Draft", "Scheduled", "Live", "Completed", "Cancelled"] }
    timestamp started_at?
    timestamp ended_at?
    text cancelled_reason?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "course_id"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "scheduled_start"}]}
  ]
}
```

```xs
// XANO/table/enrollments.xs   — DEPLOYED (pull). One row per (member, session); enrollment auto-created on order purchase.
table enrollments {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int course_id { table = "courses" }
    int session_id { table = "sessions" }
    int member_id { table = "user" }
    int order_id? { table = "orders" }
    enum status?=Purchased { values = ["Purchased", "Checked-in", "Verified", "Refunded", "Cancelled"] }
    text qr_token
    timestamp checked_in_at?
    timestamp verified_at?
    int verified_by? { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "member_id"}]}
    {type: "btree", field: [{name: "session_id"}]}
    {type: "btree", field: [{name: "course_id"}]}
    {type: "btree", field: [{name: "qr_token"}]}
    {type: "btree", field: [{name: "order_id"}]}
  ]
}
```

```xs
// XANO/table/session_ratings.xs   — DEPLOYED (pull). Bidirectional; auto-credits Constitutional Points.
table session_ratings {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int session_id { table = "sessions" }
    int rater_member_id { table = "user" }
    int ratee_member_id { table = "user" }
    enum rating_type { values = ["student_rates_teacher", "teacher_rates_student"] }
    int enrollment_id? { table = "enrollments" }
    int stars filters=min:1|max:5
    text testimony?
    bool points_awarded?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "session_id"}]}
    {type: "btree", field: [{name: "rater_member_id"}]}
    {type: "btree", field: [{name: "ratee_member_id"}]}
    {type: "btree", field: [{name: "enrollment_id"}]}
  ]
}
```

```xs
// XANO/table/course_amendments.xs   — DEPLOYED (pull). 48h SLA / 6h urgent auto-approve (lazy on read).
table course_amendments {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int course_id { table = "courses" }
    int proposed_by { table = "user" }
    json changes
    bool urgent?
    enum status?=pending { values = ["pending", "approved", "rejected", "auto_approved"] }
    text admin_notes?
    timestamp decided_at?
    int decided_by? { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "course_id"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "proposed_by"}]}
  ]
}
```

> 🗑️ **RETIRED (v1 model — do NOT recreate).** Every table below (`teacher_applications`, `teachers`, `subjects`, `chapters`, `teacher_duties`, `independent_tickets`, `student_submissions`, `review_sessions`, `review_session_qa`, `review_session_participants`) belongs to the appointed-teacher model superseded by **D10 / GAP-140**. Kept only as historical reference for the retirement/migration (GAP-141).

```xs
// XANO/table/teacher_applications.xs   — RETIRED (v1)
table teacher_applications {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    enum type { values = ["appointed", "independent"] }
    json subjects                    // [{subject_id, level}, ...]
    text bio?
    int cv_file_id? { table = "files" }
    enum status?=submitted { values = ["submitted", "approved", "rejected"] }
    text admin_notes?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "member_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/teachers.xs
table teachers {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    enum type { values = ["appointed", "independent"] }
    json subjects
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "member_id"}]}
  ]
}
```

```xs
// XANO/table/subjects.xs
table subjects {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text name
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "name"}]}
  ]
}
```

```xs
// XANO/table/chapters.xs
table chapters {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int subject_id { table = "subjects" }
    text title
    int order_idx?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "subject_id"}]}
  ]
}
```

```xs
// XANO/table/teacher_duties.xs
table teacher_duties {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int teacher_id { table = "teachers" }
    int chapter_id { table = "chapters" }
    int duty_number filters=min:1|max:6
    text notes?
    int[] file_ids?
    bool admin_verified?=false
    timestamp verified_at?
    int verified_by? { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "teacher_id"}, {name: "chapter_id"}, {name: "duty_number"}]}
  ]
}
```

```xs
// XANO/table/independent_tickets.xs
table independent_tickets {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int teacher_id { table = "teachers" }
    int marketplace_item_id { table = "marketplace_items" }
    decimal fee_debited?=50
    enum status?=active { values = ["active", "closed", "refunded"] }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "teacher_id"}]}
    {type: "btree", field: [{name: "marketplace_item_id"}]}
  ]
}
```

```xs
// XANO/table/student_submissions.xs
table student_submissions {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    enum type { values = ["blog", "video"] }
    int subject_id? { table = "subjects" }
    int chapter_id? { table = "chapters" }
    text title
    text url_or_file_ref
    text summary?
    enum status?=pending { values = ["pending", "reviewed", "rejected"] }
    int tokens_awarded?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "member_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/review_sessions.xs
table review_sessions {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    text title
    int host_member_id { table = "user" }
    timestamp scheduled_at
    int[] submission_ids?
    decimal reward_pool_tokens
    enum status?=scheduled { values = ["scheduled", "completed"] }
    decimal host_share?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "scheduled_at", op: "desc"}]}
  ]
}
```

```xs
// XANO/table/review_session_qa.xs
table review_session_qa {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int session_id { table = "review_sessions" }
    text question
    text answer?
    int asked_by_member_id? { table = "user" }
    int answered_by_member_id? { table = "user" }
    decimal tokens_awarded?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "session_id"}]}
  ]
}
```

```xs
// XANO/table/review_session_participants.xs
table review_session_participants {
  auth = false
  schema {
    int id
    timestamp registered_at?=now
    int session_id { table = "review_sessions" }
    int member_id { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "session_id"}, {name: "member_id"}]}
  ]
}
```

### A.7 Financial

```xs
// XANO/table/donors.xs
table donors {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int declaration_id { table = "declarations" }
    int member_id? { table = "user" }       // null if anonymous
    text display_name?
    enum display_name_choice { values = ["named", "anonymous"] }
    enum type { values = ["donation", "grant"] }
    decimal amount
    bool keep_reason_private?=false
    text sector_display_text?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "type"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
```

```xs
// XANO/table/sponsorships.xs
table sponsorships {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int declaration_id? { table = "declarations" }
    int sponsor_member_id? { table = "user" }
    text sponsor_display_name?
    email sponsor_email?
    text conditions
    text sector
    text upi_id
    decimal amount_inr
    int[] attachment_file_ids?
    enum status?=submitted { values = ["submitted", "active", "completed", "refunded"] }
    decimal conditions_met_pct?=0
    bool badge?=false
    bool page_publish?=false
    text sector_display_text?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/sponsorship_refunds.xs
table sponsorship_refunds {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int sponsorship_id { table = "sponsorships" }
    decimal amount_inr
    text reason
    text upi_txn_id
    int refunded_by { table = "user" }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sponsorship_id"}]}
  ]
}
```

```xs
// XANO/table/investments.xs
table investments {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int declaration_id { table = "declarations" }
    int investor_member_id? { table = "user" }
    enum option { values = ["A_10pct_lumpsum", "B_8pct_quarterly"] }
    decimal principal_inr
    date start_date
    enum status?=active { values = ["active", "completed", "cancelled"] }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "investor_member_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

```xs
// XANO/table/investment_payouts.xs
table investment_payouts {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int investment_id { table = "investments" }
    date due_date
    decimal amount_inr
    enum status?=due { values = ["due", "paid"] }
    text upi_txn_id?
    timestamp paid_at?
    int paid_by? { table = "user" }
    bool notified?=false
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "investment_id"}]}
    {type: "btree", field: [{name: "due_date"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}
```

### A.8 Notifications

```xs
// XANO/table/notifications.xs   — VALIDATED
table notifications {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    enum event_type {
      values = [
        "points_transfer_pending",
        "points_transfer_accepted",
        "marketplace_order_placed",
        "marketplace_pod_submitted",
        "marketplace_order_disputed",
        "marketplace_order_settled",
        "pts_conversion_complete",
        "declaration_verified",
        "declaration_rejected",
        "season_started",
        "season_results_published",
        "investment_payout_due",
        "election_opened",
        "election_closed"
      ]
    }
    text title
    text body?
    json payload?
    text ref_type?
    int ref_id?
    timestamp read_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "member_id", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree", field: [{name: "read_at", op: "asc"}]}
  ]
}
```

```xs
// XANO/table/notification_preferences.xs
table notification_preferences {
  auth = false
  schema {
    int id
    timestamp created_at?=now
    int member_id { table = "user" }
    bool email?=false
    bool in_app?=true
    json per_event?     // { "<event_type>": { email: bool, in_app: bool }, ... }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "member_id"}]}
  ]
}
```

---

## Appendix B — Time-Dependent Behaviour (Lazy-Evaluation Playbook)

> ⚠️ **Rewritten at rev 4.** The XANO Free plan has **no scheduled tasks** — pushing `task/*.xs` is rejected ("Please upgrade to access tasks"). Per **D9**, do **not** deploy the cron tasks below. They are kept only as *logic references*: each one's behaviour must instead be implemented **lazily on read** at the endpoint indicated. Where a true push is unavoidable, wrap the same logic in a protected admin endpoint and trigger it with a **free external cron** (`[CRON-OPTIONAL]`).

### B.0 Lazy resolution map (this is the spec — implement these, not cron)

| Behaviour (old task) | Resolve lazily at | Notes |
|---|---|---|
| `pts_transfer_window_expire` | `GET /pending`, `POST /{id}/accept` | Flip `pending_window`→`acceptable` when `window_ends_at <= now`. |
| `marketplace_auto_settle` | `GET /marketplace/orders/{id}`, order reads, `mark-received` | Settle `pod_submitted` when `dispute_window_ends_at <= now`. Admin batch `POST /admin/marketplace/orders/auto-settle` is `[CRON-OPTIONAL]`. |
| `investment_payouts_due_notifier` | `GET /admin/investments/due`; `GET /investments/overdue-count` | Compute due/overdue on read. Reminder emails `[CRON-OPTIONAL]`. |
| `season_archive` | `GET /seasons/{id}`, `GET /seasons` | Archive when `end_date < now`. |
| `election_close_when_window_ends` | `GET /elections/{id}`; admin `close` | Close + tally + deposit refunds (≥3 votes) on read past `voting_end`. |
| `notification_email_dispatcher` | (none) | Send email **inline** when the notification is created. No queue. |
| `independent_teacher_active_ticket_audit` | n/a | Obsolete — independent-teacher model removed (D10). |
| course auto-hide / session 4h auto-end / zero-attendance / urgent-amendment 6h | course & session reads (GAP-140) | All lazy. |
| loan annual phase debits | `GET /loans/me`, loan reads (GAP-122) | Apply debits past each anniversary, sequential by Loan ID. |
| contract deadline auto-deactivate / 60-day force-close | contract reads (GAP-124) | Lazy. |
| group 24h deletion hold | group reads (GAP-120) | Finalise when `delete_at <= now`. |

### B.1 Reference cron snippets (DO NOT PUSH — logic only)

Place none of these in `XANO/task/`. They document the intended transition logic for the lazy implementations above. All schedules shown use UTC (+0000).

```xs
// XANO/task/pts_transfer_window_expire.xs   — VALIDATED
task "pts_transfer_window_expire" {
  description = "Flip points_transfers from pending_window to acceptable once window_ends_at has passed"
  stack {
    db.query points_transfers {
      where = $db.points_transfers.status == "pending_window"
            && $db.points_transfers.window_ends_at <= now
    } as $expired
    foreach ($expired) {
      each as $t {
        db.edit points_transfers {
          field_name = "id"
          field_value = $t.id
          data = { status: "acceptable" }
        }
      }
    }
  }
  schedule = [{starts_on: 2026-05-25 00:00:00+0000, freq: 60}]
}
```

```xs
// XANO/task/marketplace_auto_settle.xs   (sketch)
task "marketplace_auto_settle" {
  description = "Settle pod_submitted orders whose dispute window has passed"
  stack {
    db.query orders {
      where = $db.orders.status == "pod_submitted"
      sort = { id: "asc" }
    } as $candidates
    foreach ($candidates) {
      each as $o {
        db.get marketplace_pod { field_name = "order_id"  field_value = $o.id } as $pod
        conditional {
          if ($pod != null && $pod.dispute_window_ends_at <= now) {
            db.get marketplace_items { field_name = "id"  field_value = $o.item_id } as $item
            var $proposer_share { value = $o.total_amount * (($item.revenue_share_proposer_pct ?? 0) / 100) }
            var $admin_share    { value = $o.total_amount * (($item.revenue_share_admin_pct    ?? 0) / 100) }

            db.transaction {
              stack {
                var $proposer_id { value = ($item.proposing_member_id ?? $item.seller_id) }
                function.run mutate_wallet {
                  input = { member_id: $proposer_id, currency: "token", side: "credit",
                            amount: $proposer_share, ref_type: "marketplace_settlement",
                            ref_id: $o.id, operation_type: "marketplace_settle", operation_id: $o.id }
                } as $m1
                function.run mutate_wallet {
                  input = { member_id: 1, currency: "token", side: "credit",
                            amount: $admin_share, ref_type: "marketplace_settlement_admin",
                            ref_id: $o.id, operation_type: "marketplace_settle", operation_id: $o.id }
                } as $m2
                db.add marketplace_settlements {
                  data = { order_id: $o.id, proposer_credit_tokens: $proposer_share, admin_credit_tokens: $admin_share }
                } as $sett
                db.edit orders {
                  field_name = "id"  field_value = $o.id  data = { status: "settled" }
                }
              }
            }
          }
        }
      }
    }
  }
  schedule = [{starts_on: 2026-05-25 02:00:00+0000, freq: 86400}]
}
```

```xs
// XANO/task/investment_payouts_due_notifier.xs   (sketch)
task "investment_payouts_due_notifier" {
  description = "Emit notifications for investment payouts due within 7 days"
  stack {
    var $cutoff { value = now|transform_timestamp:"+7 days" }
    db.query investment_payouts {
      where = $db.investment_payouts.status == "due"
            && $db.investment_payouts.notified == false
            && $db.investment_payouts.due_date <= $cutoff
    } as $rows
    foreach ($rows) {
      each as $p {
        db.get investments { field_name = "id"  field_value = $p.investment_id } as $inv
        conditional {
          if ($inv != null && $inv.investor_member_id != null) {
            db.add notifications {
              data = {
                member_id  : $inv.investor_member_id,
                event_type : "investment_payout_due",
                title      : "Investment payout due soon",
                body       : ("₹" ~ ($p.amount_inr|to_text) ~ " is due on " ~ ($p.due_date|to_text)),
                ref_type   : "investment_payout",
                ref_id     : $p.id
              }
            } as $n
            db.edit investment_payouts {
              field_name = "id"  field_value = $p.id  data = { notified: true }
            }
          }
        }
      }
    }
  }
  schedule = [{starts_on: 2026-05-25 06:00:00+0000, freq: 86400}]
}
```

```xs
// XANO/task/season_archive.xs   (sketch)
task "season_archive" {
  description = "Move seasons to archived status once end_date has passed"
  stack {
    db.query seasons {
      where = $db.seasons.status == "active" && $db.seasons.end_date < now
    } as $ended
    foreach ($ended) {
      each as $s {
        db.edit seasons { field_name = "id"  field_value = $s.id  data = { status: "archived" } }
      }
    }
  }
  schedule = [{starts_on: 2026-05-25 03:00:00+0000, freq: 86400}]
}
```

```xs
// XANO/task/election_close_when_window_ends.xs   (sketch)
task "election_close_when_window_ends" {
  description = "Close elections whose voting window has ended; flag ties for admin"
  stack {
    db.query elections {
      where = $db.elections.status == "open" && $db.elections.voting_end <= now
    } as $rows
    // For each election: aggregate votes, set winner or tie_break_pending,
    // refund deposits for candidates with >= 3 votes.
  }
  schedule = [{starts_on: 2026-05-25 00:05:00+0000, freq: 300}]
}
```

```xs
// XANO/task/notification_email_dispatcher.xs   (sketch — depends on email provider env vars)
task "notification_email_dispatcher" {
  description = "Dispatch queued email notifications honoring user preferences"
  stack {
    db.query notifications {
      where = $db.notifications.read_at == null
      sort  = { created_at: "asc" }
      return = { type: "list", paging: { page: 1, per_page: 100 } }
    } as $page
    foreach ($page.items) {
      each as $n {
        db.get notification_preferences { field_name = "member_id"  field_value = $n.member_id } as $pref
        conditional {
          if ($pref != null && $pref.email == true) {
            db.get user { field_name = "id"  field_value = $n.member_id } as $u
            conditional {
              if ($u != null && $u.email != null) {
                util.send_email {
                  service_provider = "resend"
                  api_key          = $env.RESEND_API_KEY
                  to               = $u.email
                  from             = "noreply@vgc.example"
                  subject          = $n.title
                  message          = ($n.body ?? $n.title)
                }
              }
            }
          }
        }
      }
    }
  }
  schedule = [{starts_on: 2026-05-25 00:01:00+0000, freq: 60}]
}
```

```xs
// XANO/task/independent_teacher_active_ticket_audit.xs   (sketch)
task "independent_teacher_active_ticket_audit" {
  description = "Ensure each independent_tickets row maps to an active marketplace_items row"
  stack {
    db.query independent_tickets {
      where = $db.independent_tickets.status == "active"
    } as $tickets
    foreach ($tickets) {
      each as $t {
        db.get marketplace_items { field_name = "id"  field_value = $t.marketplace_item_id } as $item
        conditional {
          if ($item == null || $item.status != "active") {
            db.edit independent_tickets {
              field_name = "id"  field_value = $t.id  data = { status: "closed" }
            }
          }
        }
      }
    }
  }
  schedule = [{starts_on: 2026-05-25 04:00:00+0000, freq: 86400}]
}
```

---

*End of XANO_IMPLEMENTATION_PLAN.md*
