# VGC E2E Defect Log

**Run:** `E2E-20260719-01`
**Started:** 2026-07-19 (Australia/Melbourne)
**Purpose:** sanitized defects confirmed during the exhaustive E2E run. This file is the run-scoped source of truth until each row is reconciled into `TEST_REGISTER.md`.

No passwords, bearer tokens, OTPs, API secrets or reset links belong in this file.

| ID | Severity | Layer | Area | Confirmed result | Evidence | Status |
|---|---|---|---|---|---|---|
| TR-163 | High | Backend | Password reset | Unknown email returns `No user found for that email.` while a known email returns success, allowing account enumeration. | RUN-007–008; API-096 / FE-069 | Open |
| TR-164 | Critical | Both | Registration / safeguarding | UI accepts a future DOB as a negative-age minor. More importantly, direct public `POST /signup` accepted a 14-year-old DOB, issued a valid auth token and created a normal member plus three wallets without guardian approval. Fixture and wallets were fully deleted. | RUN-012, RUN-015–016; CL-002 | Open |
| TR-165 | High | Backend | CORS | Xano reflects an arbitrary hostile Origin while enabling credentials and advertising write methods/headers. Bearer-only authentication reduces some cookie-CSRF exploitability but the origin policy is still unsafe. | EX-015; read-only OPTIONS/GET probes | Open |
| TR-166 | High | Backend | Backup admin | Anonymous backup-status response exposes operational security state including backup-admin identity, primary-login timing and vacation/activation state. | EX-014; anonymous read-only probe | Open |
| TR-167 | High | Backend | HTTP method safety | Multiple GET handlers can perform lifecycle, financial or notification mutations. Confirmed source families include reset request, guardian expiry, education/session lifecycle, elections, seasons, groups, loans, orders, transfers and wallet creation. | Static endpoint review; no valid production IDs used | Open |
| TR-168 | Medium | Frontend | Production headers | Production frontend HTML/JS lacks CSP, frame protection, MIME-sniff protection, Referrer Policy and Permissions Policy. HSTS is present. | EX-015 | Open |
| TR-169 | Medium | Frontend | Routing / operations | Unknown paths and `/robots.txt` return the SPA shell with HTTP 200, producing soft-404 and crawler/monitoring ambiguity. | EX-013 | Open |
| TR-170 | Medium | Frontend | Public legal/guardian routes | Anonymous Terms and Privacy placeholders render authenticated-style Home/Wallet/Explore/Community/Profile navigation. Protected links redirect guests and discard signup context. | RUN-013–014 | Open |
| TR-171 | Medium | Backend | API contract integrity | Parameters documented and sourced as optional remain gateway-required. Confirmed on `/contracts` filters and backup-admin `requester_member_id`. | EX-014 | Open; expand via endpoint sweep |
| TR-172 | High | Both | Cloudinary uploads | `vgc_blog` is unsigned with no explicit format, byte/dimension, folder, moderation, access-control or transformation restrictions. App callers validate only via `accept="image/*"`, retain only URLs and have no ownership/deletion path, creating abuse, performance and orphan-asset risk. | EX-020; source caller inventory | Open |
| TR-173 | High | DevOps | Credential hygiene | Legacy local Xano Git history contains a Metadata API token. The current `.env` is ignored and was tightened from mode `0666` to `0600`; the new private `VGC-Reinventing/xano` remote was seeded from secret-scanned, history-free commit `8310fc0`, so the legacy credential is not in that remote. No token value was reproduced. | Local Git/filesystem audit; EX-032–033 | Partially remediated; token rotation parked by user as low priority |

## Existing defects reconfirmed

| Existing ID | Regression evidence |
|---|---|
| TR-138 | Terms and Privacy remain generic placeholders; opening them from a populated signup form loses all entered state. |
| TR-142 | Anonymous `GET /blog_dislikes` returned raw member-vote records. No mutation was attempted. |
| TR-146 | Login enumeration fix passes: unknown-email and known-email/wrong-password attempts show identical generic errors. |

## Accessibility and UX observations awaiting consolidation

- Login and signup have no `main` landmark.
- Login/reset errors and reset success are not exposed through `role="alert"`, `role="status"` or `aria-live`.
- Blank signup submission leaves focus on the submit button instead of the first invalid field.
- Required policy links replace the signup form in the same tab without preserving state.
