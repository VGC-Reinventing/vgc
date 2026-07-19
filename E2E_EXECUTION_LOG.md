# VGC E2E Execution Log

**Run:** `E2E-20260719-01`
**Started:** 2026-07-19 (Australia/Melbourne)
**Scope:** exhaustive SRS-traceable frontend, backend, data, integration, UI/UX, accessibility and owner-authorised security testing
**Primary plan:** `E2E_TEST_PLAN.md`
**Coverage:** `E2E_COVERAGE_LEDGER.md`
**Fixtures:** `E2E_FIXTURE_LEDGER.md`

## Baseline

| Layer | Revision/environment | Initial result |
|---|---|---|
| Root repository | `main` at `6dcd681` before the PM-4 cleanup commit | Cleanup is documentation/structure only; final handoff requires local `main == origin/main` |
| Frontend repository | `main` at `172c8ac` | Remote synchronized; product revision remains `ce7e994`; PM-3/PM-4 commits are documentation/archive only |
| Xano | Workspace 161992, branch `v1`, 436 documents; sanitized Git commit `8310fc0` | Private `VGC-Reinventing/xano` `main` is synchronized; CLI/MCP and live/local generated parity verified |
| Browser | In-app browser; local Vite and deployed Vercel targets | Connected during runtime testing; local server stopped cleanly at closeout |
| Mailbox | Authenticated Gmail plugin for VGC mailbox | Available; use test-run messages only |
| Deployment | Authenticated Vercel plugin and linked `frontend` project | Production deployment `dpl_CiXSwZ9Dcbkja6MJxjtgPPCRNXzU` for `172c8ac` reports Ready |

## Access and tooling evidence

| Entry | Local time | Action | Result | Evidence summary |
|---|---|---|---|---|
| EX-001 | 2026-07-19 | Gmail connector profile lookup | Pass | Authenticated VGC mailbox profile returned |
| EX-002 | 2026-07-19 | Vercel team/project lookup | Pass | Linked Vite `frontend` project and Ready production deployment returned |
| EX-003 | 2026-07-19 | Xano Metadata API and SSE probes | Pass | Both endpoints returned HTTP 200 without exposing the token |
| EX-004 | 2026-07-19 | Install global Xano MCP | Pass | Global `xano` entry enabled; wrapper reuses `xano profile token` at runtime |
| EX-005 | 2026-07-19 | Fresh-process Xano MCP handshake | Pass | `getLoggedInUser` and `listWorkspaces` both succeeded for workspace 161992 |
| EX-006 | 2026-07-19 | Fetch root/frontend/Xano Git remotes | Pass | Root and frontend 0 ahead/0 behind; Xano has no configured upstream |
| EX-007 | 2026-07-19 | Commit and push plan artifacts | Pass | Root commit `2b7a2c1` pushed to `origin/main`; only the two plan artifacts were staged |
| EX-008 | 2026-07-19 21:14 | Frontend unit test baseline | Pass | Vitest: 2 files, 10/10 tests passed in 184 ms |
| EX-009 | 2026-07-19 21:14 | TypeScript baseline | Pass | `npm run typecheck` exited 0 |
| EX-010 | 2026-07-19 21:14 | Production/PWA build baseline | Pass with warning | 1,921 modules; main JS 2,041.47 kB/503.43 kB gzip; 13 PWA precache entries/2,047.43 KiB; chunk-size warning retained |
| EX-011 | 2026-07-19 21:15 | Start local Vite frontend | Pass | `http://127.0.0.1:5173/`; process session 75029 |
| EX-012 | 2026-07-19 21:15 | Connect in-app browser and open local login | Pass | Title `VGC Reinventing`; URL `/login`; DOM snapshot captured |
| EX-013 | 2026-07-19 21:20 | Production frontend transport sweep | Pass with scope limit | All 86 concrete routes returned the same 200 SPA shell; this proves routing transport only, not rendered-route functionality |
| EX-014 | 2026-07-19 21:21 | Public production API read-only smoke | Fail | Confirmed anonymous raw blog-dislike data (TR-142), backup-admin operational metadata, contract parameter contract drift and public GET handlers with mutation logic; no valid mutating identifiers were used |
| EX-015 | 2026-07-19 21:22 | Production response-header and CORS probes | Fail | Frontend lacks common hardening headers; Xano reflected an arbitrary origin while allowing credentials and write methods |
| EX-016 | 2026-07-19 21:48 | Install Cloudinary OAuth MCP suite | Pass | Official remote Asset Management, Environment Config, Structured Metadata and Analysis servers added globally with OAuth; no static Cloudinary secret stored in Codex config |
| EX-017 | 2026-07-19 21:50 | Fresh-process Cloudinary MCP handshake | Pass | Asset search, structured-metadata listing and all four tool catalogs discovered; no assets or settings mutated |
| EX-018 | 2026-07-19 21:59 | Cloudinary environment-config read-only call | Pass | Upload-preset listing succeeded and returned a sanitized count of two; configured preset detail review remains before upload |
| EX-019 | 2026-07-19 21:56 | GitHub plugin install/profile check | Partial | Plugin authenticated as the VGC account, but the GitHub App has zero repository installations; local Git push authentication remains operational |
| EX-020 | 2026-07-19 22:04 | Cloudinary `vgc_blog` preset inspection | Fail hardening gate | Preset is unsigned and has no explicit format, byte/dimension ceiling, folder, moderation, access-control or transformation settings; exact asset-ID search/deletion capability is available |
| EX-021 | 2026-07-19 22:14 | GitHub repository-scope refresh | Pending sync | User completed installation update; connector changed from empty installation lists to a temporary internal error. Retry after indexing window |
| EX-022 | 2026-07-19 22:32 | Testing-document closeout push | Pass | Root testing artifacts pushed at commit `48d1194`; frontend product commit remained `ce7e994` |
| EX-023 | 2026-07-19 22:53 | Isolated Xano live pull and provenance comparison | Pass | Pulled 436 live documents; all shared generated files matched; identified 14 duplicate-GUID local aliases and three newer documented behaviours requiring reconciliation |
| EX-024 | 2026-07-19 23:18 | Scoped Xano correction pushes | Pass | Dry-run-first transactional pushes updated public investment/sponsorship creation and the overdue dedupe predicate; no records, env, deletes, truncation or force |
| EX-025 | 2026-07-19 23:19 | Xano MCP/readback/runtime verification | Pass | Both POSTs read back public; supported overdue predicate persisted; anonymous invalid POSTs reached validation rather than auth and public count returned HTTP 200 |
| EX-026 | 2026-07-19 23:20 | Final Xano pull and target no-op dry run | Pass | Fresh pull returned 436 documents and matched local generated source byte-for-byte; targeted dry run over all three reconciled endpoints returned `No changes to push` |
| EX-027 | 2026-07-19 23:22 | Root/frontend Git remote refresh | Pass | Both existing remotes were 0 ahead/0 behind before closeout documentation commits; Xano confirmed to have no remote |
| EX-028 | 2026-07-19 23:31 | Commit synchronized Xano snapshot locally | Pass | Commit `5431123` records the verified 436-document canonical tree, removes duplicate aliases, and stops tracking `.env`/`.DS_Store`; no remote exists, so no Xano Git push occurred |
| EX-029 | 2026-07-19 23:32 | Frontend closeout-log push | Pass | Documentation-only commit `d5579eb` pushed to `VGC-Reinventing/frontend` `main`; product source remains at `ce7e994` |
| EX-030 | 2026-07-19 23:34 | Pre-push credential scan and current-doc redaction | Partial remediation | Removed the real admin password from all current root documentation and verified zero remaining strong secret-pattern matches; historical Git exposure remains and the credential still requires rotation |
| EX-031 | 2026-07-19 23:36 | Vercel post-push deployment verification | Pass | Production deployment for frontend commit `d5579eb` is `READY`; production alias returned HTTP 200 and the prior-hour production error/fatal query returned no logs |
| EX-032 | 2026-07-19 23:52 | Publish sanitized Xano repository | Pass | Created private `VGC-Reinventing/xano` from new root commit `8310fc0`: 445 files, including the exact 436 generated documents; zero duplicate GUIDs/symlinks and no high-confidence secret patterns; legacy token-bearing history was not published |
| EX-033 | 2026-07-19 23:53 | Reconcile local Xano checkout with new remote | Pass | Local `XANO/main` now tracks `origin/main` at `8310fc0` with 0 ahead/0 behind; retired history is isolated as `legacy-local-do-not-push` plus a local stash, and the remote push refspec is restricted to `main` |
| EX-034 | 2026-07-19 23:57 | Archive superseded frontend material and verify | Pass | Moved stale plans/reference/prompt/prototype under `FrontEnd/archive/`; redacted current-branch admin-password markers; Vitest 10/10, typecheck and production/PWA build passed; commit `172c8ac` pushed |
| EX-035 | 2026-07-19 23:58 | GitHub connector repository verification | Pass | Connected GitHub app returned admin/push access for public `VGC-Reinventing/vgc` and private `VGC-Reinventing/frontend`/`xano`; all default branches are `main` |
| EX-036 | 2026-07-19 23:59 | Final frontend deployment verification | Pass | Vercel production deployment `dpl_CiXSwZ9Dcbkja6MJxjtgPPCRNXzU` for `172c8ac` is `READY`; production alias returned HTTP 200 and the prior-hour runtime-error query returned none |
| EX-037 | 2026-07-20 00:01 | Xano CLI/MCP post-migration access check | Pass | CLI profile resolves to instance 171, workspace 161992 and branch `v1`; MCP identity, workspace listing and full workspace context with XanoScript access all succeeded |
| EX-038 | 2026-07-20 00:02 | Root documentation/workspace cleanup | Pass | Active root reduced to the E2E prompt/plan/ledgers, test register, current SRS, source checkouts and scripts; stale tracked documents moved under `archive/`, machine-specific/sensitive notes under ignored `.local-archive/`, and nested repositories/machine-local settings removed from root tracking |

## Current blockers and limitations

| Blocker | Affected tests | Status/owner | Workaround |
|---|---|---|---|
| Cloudinary preset lacks explicit hardening restrictions | Full media validation and production hardening | OAuth MCP access and exact asset-ID search/deletion are available; configuration weakness is recorded | Use only tiny run-marked fixtures, ledger every asset ID, delete exactly after testing and treat unrestricted preset settings as a hardening finding |
| Tracked Xano token discovered in local `XANO/.env` history | Credential assurance and continued Xano authentication | Parked by user as low priority | Never print the token; rotate later, then re-authenticate CLI/MCP and verify the old credential is rejected |
| Real admin password existed in tracked public-root documentation/history | Admin account assurance | Current files redacted at closeout; credential rotation still required | Rotate the admin password before production and assess Git-history purge; do not recover credentials from old docs during testing |
| Physical iOS/Android device and camera not connected | Final PWA install, mobile keyboard/safe-area and QR camera certification | User/device later | Desktop responsive checks do not close these rows |
| Disposable role-rich account set not yet reconciled | Authenticated workflows, IDOR, destructive and financial tests | Test setup pending | Do not use real-member records |

## Chronological execution

| Entry | Local time | Case/route/API | Persona/fixture | Action | Expected | Actual | Result | Evidence/defect |
|---|---|---|---|---|---|---|---|---|
| RUN-001 | 2026-07-19 | Preparation | — | Seed source-derived route, function, endpoint, table and workflow inventories | Exact totals match the reviewed baseline | 87 routes, 318 frontend functions, 295 endpoints, 15 reusable functions, 93 tables and 20 workflows seeded | Pass | `E2E_COVERAGE_LEDGER.md` CP-001 |
| RUN-002 | 2026-07-19 21:15 | UI-002 `/login` control inventory | Guest | Enumerate the initial DOM before interaction | Every interactive control has an accessible, stable inventory row | Email/password textboxes, disabled Sign in, Forgot password and Create account exposed; conditional verification link confirmed in source | Pass | `E2E_COVERAGE_LEDGER.md` CTRL-UI-002-001–006 |
| RUN-003 | 2026-07-19 21:17 | UI-002 `/login` blank and malformed submission | Guest | Click/press Enter with blank fields, then enter malformed email with a nonblank password | Blank submit remains unavailable; browser blocks malformed email without a request | Sign in remained disabled while blank; Enter did not submit; native email validity reported `typeMismatch` and blocked malformed input | Pass | CTRL-UI-002-001–003 |
| RUN-004 | 2026-07-19 21:18 | UI-002 `/login` account-enumeration regression | Guest; unknown address and disposable VGC45 address | Submit the same wrong password against unknown and known addresses | Byte-equivalent generic user-facing error | Both attempts rendered `Invalid email or password` | Pass | TR-146 remains fixed |
| RUN-005 | 2026-07-19 21:18 | UI-002 `/login` accessibility baseline | Guest | Inspect landmarks and error announcement semantics | One main landmark and programmatically announced errors | No `main` landmark; error is plain text without `role="alert"` or `aria-live` | Fail | New accessibility finding awaiting consolidated defect ID |
| RUN-006 | 2026-07-19 21:19 | UI-004 `/forgot-password` control inventory and local guards | Guest | Inventory controls; test blank, Enter and malformed email | Stable controls; no blank/malformed request | Email, Send reset link and Back to sign in exposed; blank button disabled; Enter did not submit; native email validation blocked malformed input | Pass | CTRL-UI-004-001–003 |
| RUN-007 | 2026-07-19 21:20 | UI-004 `/forgot-password` account-enumeration parity | Guest; unknown address and disposable VGC45 address | Request reset link for unknown then known address | Same generic response regardless of account existence | Unknown rendered `No user found for that email.`; known rendered success copy naming the address | Fail | TR-163 |
| RUN-008 | 2026-07-19 21:20 | UI-004 `/forgot-password` known-account request | Disposable VGC45 | Submit known email once | Reset request accepted without changing password; success announced accessibly | Request accepted and success screen shown; password unchanged; success container has no `role="status"`/`aria-live`; mail/link verification pending | Partial | API-096 / FE-069; TR-163 |
| RUN-009 | 2026-07-19 21:24 | UI-003 `/signup` control inventory | Guest | Enumerate default and conditional minor controls | Every control has a stable coverage row before mutation | Name, email, password, DOB, consent, Terms, Privacy, submit and Sign in exposed; guardian ID appears when computed age is under 18 | Pass | CTRL-UI-003-001–010 |
| RUN-010 | 2026-07-19 21:26 | UI-003 `/signup` local validation chain | Guest | Submit blank, 7-character password, missing DOB and unchecked consent | Each invalid state is blocked with useful, associated feedback | Correct messages rendered for all four states; blank error left focus on the submit button instead of moving to the first invalid field | Pass with UX issue | CTRL-UI-003-001–004, 006, 009 |
| RUN-011 | 2026-07-19 21:28 | UI-003 `/signup` adult/minor boundary | Guest | Test DOBs 2008-07-20 and 2008-07-19 on 2026-07-19 | First is 17/minor; second is 18/adult | Age 17 showed guardian field; exact 18th birthday hid it | Pass | CTRL-UI-003-004–005 |
| RUN-012 | 2026-07-19 21:29 | UI-003 `/signup` future DOB | Guest | Enter 2030-01-01 | Reject a future birth date before guardian or signup processing | UI displayed `Age -4 — guardian approval required` and exposed the guardian field; backend source has no corresponding DOB/age guard | Fail | Candidate TR-164; direct disposable API confirmation pending |
| RUN-013 | 2026-07-19 21:43 | UI-003/UI-008 Terms navigation | Guest; populated signup form | Click Terms from a populated registration form, inspect content, return to signup | Real policy text; safe return path preserving entered form state | Same-tab navigation opened a generic placeholder plus authenticated-style bottom nav; returning to signup produced a blank form | Fail | TR-138; state-loss/navigation finding awaiting consolidated defect ID |
| RUN-014 | 2026-07-19 21:45 | UI-003/UI-009 Privacy navigation | Guest | Click Privacy Policy and inspect route | Real privacy content without authenticated navigation chrome | Generic placeholder rendered with Home/Wallet/Explore/Community/Profile bottom nav for a guest | Fail | TR-138; navigation-chrome finding awaiting consolidated defect ID |
| RUN-015 | 2026-07-19 22:09 | API-102 `POST /signup` server-side minor bypass | Disposable direct-API minor probe | Submit DOB 2012-07-19 directly to adult signup without guardian fields | Backend rejects under-18 DOB or routes it into guardian approval without issuing auth | HTTP 200; valid auth token issued; user 48 / `VGC48` created with `is_minor:false`, no guardian link and unverified full-auth `/me` access | Fail | TR-164 Critical; exact fixture in `E2E_FIXTURE_LEDGER.md` |
| RUN-016 | 2026-07-19 22:15 | API-102 minor-bypass cleanup | User 48 / wallet rows 75–77 | Inventory all signup side effects; delete only zero-value run-marked rows; re-query exact identifiers | Exactly one user and three zero-balance wallets removed; no unexpected residue | Found exactly three zero-balance INR/token/points wallets and no email token, notification, guardian approval or rate counter; deleted wallets then user; exact user/email and wallet re-queries returned zero rows | Pass | CL-002; zero active fixture residue |

## Security/integrity quarantine gate

| Gate case | Status | Safe stopping rule | Evidence/defect |
|---|---|---|---|
| Admin MFA token provenance | Pending | Read-only admin call only; no bypass mutation | — |
| Suspended/erased/unverified capability enforcement | Pending | Disposable accounts only | — |
| Cross-account frontend cache isolation | Pending | Stop on any Account A data visible to Account B | — |
| Wallet type and response-shape consistency | Pending | Read-only inspection before any value movement | — |
| PTS rate/quote arithmetic | Pending | Quote/read only before conversion | — |
| Stored rich-content rendering/CSP | Pending | Synthetic payloads only | — |
| Public/raw CRUD exposure | Pending | Read-only/OPTIONS first; no modification of historical rows | — |

## Session checkpoint

**Next exact action:** on the next session, load `E2E_TEST_SESSION_PROMPT.md`, confirm the 436-document Xano checkpoint and Git state, then test guardian registration/approval contracts before building the authenticated adult/second-party/admin persona set.
