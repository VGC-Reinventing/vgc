# VGC XANO — Session Opener Prompt

**How to use:** start a new Claude Code session in `/Users/boss/Desktop/VGC/`, clear context, and paste everything inside the code block below as the first message. The session will read the project state, pick the next gap, and follow the validated-push workflow.

---

````markdown
Continue VGC XANO development (rev 5 / SRS v2.2). The rev-4 backlog is DONE — 255 endpoints / 28 groups deployed. Only FOUR gaps remain to reach 100% of API_REQUIREMENTS.md: GAP-150, GAP-151, GAP-141, GAP-142.

PROJECT
- Xano workspace 161992 ("VGC's Workspace"), branch v1, instance x8ki-letl-twmt.n7.xano.io.
- Plan: FREE — no scheduled/background tasks. Do NOT push task/*.xs (see "Free plan" below).
- Local pull at /Users/boss/Desktop/VGC/XANO/.
- CLI: `xano` (@xano/cli v1.0.2) at /opt/homebrew/bin/xano, profile `vgc` (default).
  Verify auth: `xano profile me`. If missing, recreate from XANO/.env token:
  `xano profile create vgc -i "https://x8ki-letl-twmt.n7.xano.io" -t "$(grep ^XANO_TOKEN= XANO/.env | cut -d= -f2)" -w 161992 -b v1 --default`
- Xano MCP "Xano Developer": load deferred tools via ToolSearch when needed
  (`xano_validate_xanoscript`, `xano_xanoscript_docs`, `xano_cli_docs`).

READ FIRST (in this order, before any work)
1. /Users/boss/Desktop/VGC/PENDING_TASKS.md       — CURSOR. The 4 remaining gaps (GAP-150/151/141/142) with build steps + acceptance. Start GAP-150.
2. /Users/boss/Desktop/VGC/SESSION_LOG.md          — last entry = most recent state (rev-5 reconciliation).
3. /Users/boss/Desktop/VGC/XANO_IMPLEMENTATION_PLAN.md — spec: §5.1 open gaps + §5.2 closed, §8 decisions (D1–D11), Appendix A tables (incl. PROPOSED season_distribution_records), Appendix B lazy playbook.
4. /Users/boss/Desktop/VGC/API_REQUIREMENTS.md     — source of truth (rev 4, SRS v2.2).
5. /Users/boss/Desktop/VGC/API_REFERENCE.md        — current deployed state. Re-pull if stale:
   `xano workspace pull -w 161992 -b v1 -d /Users/boss/Desktop/VGC/XANO`
6. /Users/boss/Desktop/VGC/SRS/VGC_Reinventing_SRS_v2.md — the SRS (v2.2) when you need requirement detail.
   (PROGRESS.md reflects GAP-100→132 closed; the remaining work is tracked in PENDING_TASKS.md + plan §5.1, not PROGRESS's old backlog.)

THE 4 REMAINING GAPS (full detail in PENDING_TASKS.md)
- GAP-150 (P1) Search §19 — new `search` group, one `GET /search` → {marketplace, groups, blog}, visibility-filtered (reuse each module's existing predicate). No new tables.
- GAP-151 (P1) Season distribution-records §13.11 — new table `season_distribution_records` (PROPOSED schema in plan Appendix A.5) + `POST /seasons/{id}/distribution-records` (pioneer-only); amend `close-and-settle` to sum records for distribution_pct / 80% target_met.
- GAP-141 (P2) Education v1 cleanup — delete legacy `POST /admin/student-submissions/{id}/review` + orphan v1 edu tables; purge duplicate normalization dirs.
- GAP-142 (P2) Deviations — category tree 2-level → ≤8 (max_depth, recurse); tighten `GET /pts/rate` to `auth="user"` (DECIDED member-only).

BINDING DECISIONS (still apply — D9–D11)
- D9 FREE PLAN, NO CRON: every time-based rule is lazy-evaluated on read (Appendix B.0 maps each to its endpoint). Push NO task files. Push-only notifications may use an external cron hitting a protected admin endpoint ([CRON-OPTIONAL]).
- D10 EDUCATION = course-ticket model (DEPLOYED): courses/sessions/enrollments/session_ratings/course_amendments. The v1 edu-teachers/edu-sessions are retired; GAP-141 removes the last legacy remnant. Do not recreate v1.
- D11 PTS = live formula (DEPLOYED): rate computed from platform state (r_eq=(I+R+A−L_invest−10·T_net)/P_net, time-drift θ, floor/threshold, R_user=10/r_published). Admin manages inputs (R,A,θ)+bootstrap, never the rate. θ NEVER exposed. Legacy pts_rate_current is rollback-only.

WORKFLOW — one gap at a time
1. Pick the lowest open gap in the highest open tier in PENDING_TASKS.md (GAP-150 first). Mark it in-flight in PROGRESS.md.
2. Read its block in PENDING_TASKS.md + plan §5.1. Confirm/add tables (Appendix A has the PROPOSED schema for GAP-151).
3. Write/edit .xs files. Reuse helpers: require_admin, mutate_wallet / mutate_wallet_unchecked, idempotency_lookup/store,
   log_admin_action, emit_notification, create_declaration, pts_compute_rate, check_rate_limit.
4. Validate EVERY changed file via xano_validate_xanoscript. Zero errors; resolve/justify warnings. NO push until clean.
5. Preview: `xano workspace push -w 161992 -b v1 -d /Users/boss/Desktop/VGC/XANO --dry-run`. Then push without --dry-run.
   After every pull, delete the duplicate normalization dirs (financial_*, point_token_scheme, admin_reports/admin) before pushing.
   Never use --no-verify / force / --delete without explicit confirmation.
6. Re-pull and diff to confirm what landed.
7. Run the gap's verification steps (plan §7 — open-gap table).
8. Mark progress in PROGRESS.md. Append one line to SESSION_LOG.md. Regenerate the affected API_REFERENCE.md section when a gap closes.

XANOSCRIPT RULES — past-error checklist
- Reserved vars (never bind): $response,$output,$input,$auth,$env,$db,$this,$result,$index.
- Types: text,int,bool,decimal,json,timestamp,date,email,password,enum,file,attachment,uuid,vector. NEVER string/integer/boolean/float/array/object. Arrays = type[]. Free-form object = json.
- Every `query` needs `input { }` (even empty). Every `function.run` needs `as <var>`.
- `elseif` not `else if`. `~` for concat (wrap filter chains in parens). `params` not `body` in api.request.
- Object literals use `:` and commas; block properties use `=` and newlines.
- Wallet mutations ONLY via `function.run mutate_wallet` — never `db.edit wallets` directly.
- Admin endpoints ONLY via `function.run require_admin { input = { auth_context: $auth } } as $ok`.
- Time-based state: resolve lazily on read, idempotently, inside db.transaction if it moves wallets (D9).
- Let Xano assign GUIDs for new files; match neighboring .xs style. After pull, watch for duplicate normalization dirs and remove them.

STOP CONDITIONS (ask the user, don't guess)
- A requirement conflicts with a built endpoint in a way not already resolved by D1–D11.
- Push fails with an error you don't understand.
- Acceptance criteria are ambiguous or contradict the SRS.
- Context running low — finish the current gap cleanly, do the end-of-session ritual, summarize.

END-OF-SESSION RITUAL
1. Save PROGRESS.md (current sub-step or [x]).
2. Append a SESSION_LOG.md entry: `YYYY-MM-DD HH:MM — GAP-NNN done` (or `blocked: <reason>`).
3. Summarize: gaps completed, gap in-flight, next gap, any new open questions.

Start by reading PENDING_TASKS.md and SESSION_LOG.md, then tell me which gap you'll work on and why (expected: GAP-150), and whether a re-pull is needed first.
````
