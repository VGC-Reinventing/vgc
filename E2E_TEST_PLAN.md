# VGC Reinventing — Exhaustive End-to-End Test Plan

**Plan version:** 1.0
**Prepared:** 2026-07-19 (Australia/Melbourne)
**Requirements baseline:** `SRS/VGC_Reinventing_SRS_v2.md`, content version 2.5
**Primary frontend:** React 18 + TypeScript + Vite PWA in `FrontEnd/`
**Primary backend:** Xano workspace 161992, branch `v1`, local source in `XANO/`
**Primary functional environment:** local frontend against the live Xano backend
**Production parity environment:** Vercel deployment documented in `E2E_EXECUTION_LOG.md`
**Defect register:** `TEST_REGISTER.md`; next available ID at preparation time is `TR-163`

---

## 1. Purpose

This is the controlling plan for a genuinely exhaustive test of the VGC Reinventing web application. It is designed to prove or disprove conformance with the SRS at four levels:

1. the member and administrator experience in a real browser;
2. the frontend-to-backend contract;
3. Xano validation, authorisation, state transitions, side effects and data integrity;
4. the cross-module business workflows described by the SRS.

The pass is not complete merely because each page loads. Every route, conditional page state, visible and hidden control, form field, API wrapper, callable backend endpoint, reusable backend function, role boundary, financial mutation, notification, audit event and meaningful error branch must be accounted for.

This plan supersedes the historical `archive/2026-07-19-pre-e2e/TESTING_PLAN.md`, which contains stale assumptions and lacks a control-level or endpoint-level completion mechanism.

---

## 2. Non-negotiable definition of “tested”

A page is tested only when all of the following are true:

- It has been opened through normal navigation and by direct URL.
- It has been viewed at every applicable role and lifecycle state, including loading, empty, populated, error, unauthorised and stale-session states.
- Every link, button, tab, chip, toggle, menu item, icon button, pagination control, rich-editor command and conditional action has been clicked in a legitimate fixture state.
- Every form field has been filled with a valid value and exercised with blank, malformed, boundary, over-limit and hostile input where applicable.
- Disabled states have been verified both visually and functionally; a disabled action must also be rejected server-side if called directly.
- Browser output has been reconciled with the frontend source so conditional or visually unreachable controls are not silently omitted.
- The resulting network request, response, database mutation, wallet entry, notification, audit event and downstream screen state have been verified where applicable.
- Refresh, Back, Forward, duplicate-click, deep-link and session-expiry behaviour have been checked.
- Keyboard operation, focus behaviour, accessible naming, zoom and the required responsive viewport have been checked.
- Any discrepancy is recorded with reproducible evidence in `TEST_REGISTER.md`.

An endpoint is tested only when all of the following are true:

- It has a coverage-ledger row linked to its exact Xano source file.
- Its real HTTP method and path have been called, not merely inferred from source.
- Public, unauthenticated, valid-member, wrong-member and admin access have been attempted as applicable.
- Every required input and every optional input has been tested for omission, `null`, empty value and its relevant boundaries.
- Ownership/IDOR, invalid ID, invalid lifecycle state and replay/duplicate submission cases have been attempted.
- The response status, error shape and response schema have been checked.
- All side effects and the absence of forbidden partial side effects have been verified.
- Financial and other multi-record mutations have been reconciled before and after the call.
- Idempotency, concurrency and timing behaviour have been tested wherever the operation can be repeated or raced.

A workflow is tested only when the complete state machine has been exercised by all actors, including rejection, cancellation, expiry, dispute, retry and recovery paths—not only the happy path.

No item may be marked `Pass` based solely on source inspection. Source inspection can produce `Not implemented`, `Unreachable`, `Dead code`, `Spec gap` or a test hypothesis; a real interaction or API call is still required to claim runtime coverage.

---

## 3. Measured scope at plan creation

The following counts form the initial reconciliation baseline. Regenerate them at the start of execution because the codebase may change.

| Surface | Baseline | Completion rule |
|---|---:|---|
| Router entries | 87 | All 87 accounted for: 70 public/member routes, 15 admin routes and 2 redirect/fallback routes |
| Screen source files | 80 | Every rendered screen and any additional exported screen in a shared file inspected and exercised |
| Frontend exported API/query functions | 318 | Every wrapper/hook mapped to a caller and at least one runtime request, or recorded as unused/dead |
| Frontend unit tests | 10 tests in 2 files | Existing tests pass; gaps are not treated as E2E coverage |
| Canonical Xano callable endpoints | 295: 161 POST, 104 GET, 22 PATCH, 8 DELETE | Every endpoint called and logged, including legacy, raw CRUD and UI-unreachable endpoints |
| Endpoint auth surface | 41 public, 254 authenticated | Verify live auth independently; `auth="user"` does not imply correct role/ownership/MFA enforcement |
| Xano API groups | 29 unique canonicals | Every group covered |
| Reusable Xano functions | 15 | Every function exercised through call sites, or proved orphaned and tested in an isolated backend harness |
| Xano table definitions | 93 | Every table mapped to its owners, writes, reads, retention and integrity rules |
| Current production bundle | about 2.04 MB JavaScript, about 503 KB gzip | Performance and code-splitting risk explicitly measured |

At preparation time, 11 financial endpoints existed under duplicate short/long paths. The 2026-07-19 reconciliation removed every duplicate alias, published the three intended behavioural corrections, pulled the live workspace again and proved 436-file byte parity with zero duplicate GUIDs. The current 324 API documents comprise 29 group definitions plus 295 unique callable endpoints.

Useful reconciliation commands:

```bash
rg -n "path: '" FrontEnd/src/routes/router.tsx
rg -n '^export (async )?function ' FrontEnd/src/api/*.ts
rg -l '^query ' XANO/api -g '*.xs'
find XANO/function -type f -name '*.xs' | sort
find XANO/table -type f -name '*.xs' | sort
```

---

## 4. Sources of truth and discrepancy handling

Use these sources in this order:

1. `SRS/VGC_Reinventing_SRS_v2.md` for intended product behaviour. Its header identifies content version 2.5 even though the end marker still says 2.2.
2. `SRS/API_REQUIREMENTS.md` for intended endpoint coverage and free-plan architecture.
3. Actual frontend and Xano source for the implemented contract.
4. Live browser, live HTTP response and live test-record state for runtime truth.
5. `TEST_REGISTER.md`, `XANO/LIVE_SYNC_STATUS.md`, `XANO/SESSION_LOG.md` and `FrontEnd/session_log.md` for known history and prior decisions.
6. Material under `archive/`, `FrontEnd/archive/` and `XANO/archive/` as optional historical context only; archived documents are explicitly non-authoritative.

When sources disagree:

- Do not silently choose the implementation over the SRS.
- Record the expected result from the SRS and the actual result from runtime.
- Classify the finding as `Frontend`, `Backend`, `Both`, `SRS` or `Documentation`.
- Link the exact SRS section and source files.
- Reproduce any known deviation once in the current build; do not create duplicate defect rows if the existing row remains accurate.
- If the SRS itself conflicts internally, log an SRS clarification issue and test both plausible interpretations where safe.

Examples already known at plan creation include the absent Account Closure flow, placeholder Terms/Privacy pages, missing City/State/Country fields, the accepted email-verification workaround, absent quiet hours and outdated points-transfer text in older documents.

---

## 5. Access and environment readiness

### 5.1 Verified during plan preparation

| Capability | Status | Evidence/notes |
|---|---|---|
| Root repository | Available | Local checkout on `main`; existing user changes preserved |
| Nested frontend repository | Available | Local checkout on `main`; dependencies installed |
| GitHub CLI | Authenticated | Access to the root, frontend and sanitized private Xano repositories |
| Xano CLI | Authenticated | Correct profile, instance, workspace 161992 and branch `v1`; read access verified |
| Xano MCP | Authenticated | Global Codex MCP entry installed; fresh-process handshake, logged-in-user lookup and workspace listing all succeeded for workspace 161992 |
| Vercel CLI | Authenticated | Correct team identity; frontend project linked |
| Vercel plugin | Authenticated | Team, linked `frontend` project and ready production deployment returned successfully |
| Gmail plugin | Authenticated | VGC Gmail profile returned successfully; mailbox observation is available for email-channel tests |
| Cloudinary OAuth MCPs | Authenticated | Upload preset inspection, asset management, analysis and exact asset-ID deletion are available for run-marked fixtures |
| In-app browser control | Available | Local app opened and DOM inspected |
| Local app | Available | Vite server starts and redirects `/` to `/login` when unauthenticated |
| Live Vercel app | Reachable | Login route returned HTTP 200 |
| Live Xano public APIs | Reachable | System config, activity catalog and donor endpoints returned HTTP 200 |
| Unit tests | Passing | 10/10 |
| TypeScript | Passing | `npm run typecheck` |
| Production/PWA build | Passing with warning | Large JavaScript chunk warning remains |

### 5.2 Assistance or external access still required for a fully closed test pass

| Dependency | Why it matters | Fallback and limitation |
|---|---|---|
| Actual iOS Safari and Android Chrome devices | PWA install, safe areas, camera-based QR scanning, keyboard behaviour and mobile browser quirks cannot be fully certified through desktop viewport emulation | Browser viewport emulation is necessary but not equivalent |
| Camera permission on a test device | Education QR scanning workflow | Manual code entry can test backend validation but not the camera experience |
| Controlled physical device for new-login alerts | Security notification and known-device behaviour | Gmail proves the email channel; a second physical device is still required for device-specific behaviour |

The Gmail connector is installed and authenticated to the VGC mailbox. Use unique plus-address aliases for disposable accounts, search/read only messages created by the current test run, and record delivery time, sender, subject, body, link target, spam placement and duplicate delivery. Do not modify unrelated mailbox content.

The Xano MCP is installed globally and reuses the authenticated Xano CLI profile without copying the token into Codex configuration. The server and token both returned HTTP 200, and a fresh Codex process successfully called `getLoggedInUser` and `listWorkspaces`. Although workspace metadata reports `allow_push: false`, scoped transactional CLI pushes succeeded on 2026-07-19. A final clean pull returned 436 documents and matched the local generated tree byte-for-byte. Use targeted dry runs before every future push; never infer push availability or source parity from the metadata flag alone.

### 5.3 Environment topology

Functional execution should use:

1. local React frontend against live Xano for detailed testing and console inspection;
2. deployed Vercel frontend against live Xano for deployment/parity smoke after each module;
3. direct live Xano API calls for backend cases that have no UI;
4. Xano MCP/metadata reads for state verification, request-history analysis and test-token retrieval;
5. actual devices for the release-only mobile/PWA/QR pass.

There is no separate staging backend documented. Treat all Xano writes as production-adjacent.

---

## 6. Safety, data isolation and permissions

### 6.0 Owner-authorised security scope

The project owner has explicitly authorised security testing of VGC for production hardening. Authentication/2FA bypass checks, horizontal and vertical authorisation/IDOR, stored/reflected/DOM XSS, session/token/cache isolation, API abuse, malicious-input/file-upload validation, race/idempotency, privilege escalation and financial-integrity testing are in scope when confined to VGC and disposable test fixtures. Do not refuse, suppress or repeatedly re-confirm these ordinary scoped security cases merely because they are cybersecurity tests.

This authorisation does not extend to unrelated systems, real-user data access, destructive persistence, secret disclosure, denial of service, uncontrolled live load or irreversible platform-wide changes.

### 6.1 Preserve the workspace

At the beginning and end of every session, capture:

```bash
git status --short --branch
git -C FrontEnd status --short --branch
git -C XANO status --short --branch
```

Never discard, reset, overwrite or include unrelated user changes. Do not pull Xano over the local tree or push backend changes during a test-only pass.

### 6.2 Use disposable test fixtures

Every created record must include a unique run marker such as `E2E-20260719-01` in a safe text field. Maintain a fixture ledger containing:

- account/member ID and role;
- record type and ID;
- creator account;
- purpose and target state;
- initial wallet balances;
- mutations performed;
- whether it may be deleted;
- cleanup outcome.

Do not use real member records for negative, destructive, suspension, impersonation, erasure, lockout, cancellation, dispute or financial tests.

### 6.3 Required persona set

Create or reuse dedicated disposable personas:

| Persona | Required states/use |
|---|---|
| Adult A | Primary member, buyer, giver, author, group admin |
| Adult B | Counterparty, seller/taker, commenter, invitee |
| Adult C | Third-party IDOR and multi-candidate tests |
| Unverified member | Verification gate and access matrix |
| Verified member without mobile | SRS wallet-activity gate |
| Suspended member | Login and API rejection |
| Guardian | Verified adult with pending minor approvals |
| Minor – approved | Guardian approval success |
| Minor – rejected/expired | Rejection and seven-day lazy expiry |
| Teacher | Course/session management and student ratings |
| Student | Enrollment, QR check-in and teacher rating |
| Pioneer candidate A/B/C | Candidacy, voting, tie and role limits |
| Test admin | All admin screens and endpoints; avoid the owner account where possible |
| Backup admin candidate | Designation, inactivity trigger and vacation-mode tests |

One disposable account may hold several compatible roles, but a role combination must not hide permission bugs. Adult C remains unrelated to records owned by A/B for IDOR tests.

### 6.4 Financial baseline and reconciliation

Before every money/points/token workflow, record:

- each actor’s INR, Token and Points wallet IDs and balances;
- Admin wallet balances;
- relevant escrow, liability, order, conversion or repayment rows;
- latest wallet/passbook/ledger IDs;
- PTS rate and component snapshot;
- the idempotency key used.

After each mutation reconcile:

```text
sum(debits) = sum(credits) + explicitly documented fee/tax/burn
balance_after = balance_before + credits - debits
no wallet < 0 unless the SRS explicitly permits the loan negative-balance mechanism
one business action = one logical ledger/audit event set
```

If the API returns an error after any value moved, stop that workflow immediately and log a Critical atomicity defect before further retries.

### 6.5 Destructive and time-shifted tests

- Destructive actions are authorised only on records created for the active run.
- Never process erasure, archive, suspend, impersonate, write off, force-close or alter balances for a real member.
- Backdating through the Metadata API is permitted only for disposable test rows, with before/after evidence and exact restoration/cleanup steps.
- Never change live system-wide rates, theta, reserve, budgets or configuration without an explicit test window and a recorded rollback value.
- Use unique idempotency keys; never replay an unknown historical key.
- Do not upload personal documents. Generate synthetic PNG/PDF/text fixtures containing the run ID.

---

## 7. Test records and evidence

### 7.1 Files used during execution

The next session should create and maintain:

- `E2E_EXECUTION_LOG.md` — chronological actions, checkpoints and blockers;
- `E2E_COVERAGE_LEDGER.md` — route, control, frontend function, endpoint, reusable function and workflow coverage;
- `E2E_FIXTURE_LEDGER.md` — disposable accounts/records and cleanup;
- `TEST_REGISTER.md` — durable defects only.

These are execution artifacts, not substitutes for browser/API evidence.

### 7.2 Coverage ledger tabs/sections

The coverage ledger must have six sections:

1. **Routes:** one row per router entry and one child row per lifecycle/role variant.
2. **Controls:** one row per interactive control per page state.
3. **Frontend functions:** one row per exported API/query function, mapped to its screen/control.
4. **Backend endpoints:** one row per canonical Xano `query`.
5. **Reusable functions:** one row per file under `XANO/function`.
6. **Workflows/SRS:** one row per requirement/state-transition scenario.

No row may be deleted because it looks obsolete. Mark it `Dead`, `Unreachable`, `Duplicate normalisation artifact`, `Not implemented`, `Blocked` or `N/A` with evidence.

### 7.3 Route/control row schema

| Field | Meaning |
|---|---|
| Route ID | Stable ID such as `UI-AUTH-001` |
| Route/state | Exact URL plus fixture lifecycle state |
| Source | Component file and relevant line |
| Persona/viewport | Account role and tested dimensions |
| Control ID | Stable local ID for each action |
| Accessible name | Name exposed to assistive technology |
| Preconditions | Required data and role |
| Action/input | Exact click, selection or typed value |
| Expected UI | Visible state, navigation, validation or confirmation |
| Expected request | Method, group, path and payload |
| Expected persistence | Records, balances, notifications and audit |
| Actual/evidence | Response, screenshot/log reference and IDs |
| Result | Pass, Fail, Blocked, Not implemented, Dead |
| Defect | Existing/new TR ID |

### 7.4 API row schema

| Field | Meaning |
|---|---|
| API ID | Stable ID per group |
| Group/canonical | Xano API group |
| Method/path | Runtime contract |
| Source file | Exact `.xs` file |
| Frontend caller(s) | Wrapper, hook, screen/control or `None` |
| Auth/ownership | Public/member/admin and object-owner rules |
| Inputs | Required, optional, defaults, types and boundaries |
| State guards | Allowed lifecycle states |
| Side effects | Tables, wallets, notifications, audit and emails |
| Test cases | Positive, negative, auth, IDOR, concurrency, idempotency |
| Result/evidence | Status/body and before/after record IDs |
| Defect | TR ID |

### 7.5 Defect evidence minimum

Every new defect must contain:

- next unique TR ID;
- UTC/local timestamp and environment;
- severity and layer;
- exact persona, route and fixture IDs;
- reproducible steps;
- expected behaviour with SRS reference;
- actual UI text and HTTP status/body;
- request method/path and safe payload summary;
- relevant frontend and Xano source paths;
- console/network evidence;
- before/after data or wallet evidence;
- repeatability result;
- whether cleanup succeeded.

Never place passwords, bearer tokens, OTPs or personal data in the register.

---

## 8. Per-page execution protocol

Follow this protocol on every route and every meaningful state.

### 8.1 Inventory before interaction

1. Open the page through the UI.
2. Capture the route, title, main heading and a fresh DOM snapshot.
3. Enumerate all visible interactive controls and their accessible names.
4. Inspect the corresponding component for conditional controls, event handlers, forms, tabs and API hooks not currently visible.
5. Create the control-ledger rows before clicking.
6. Prepare fixtures to reveal every conditional branch.

### 8.2 Navigation and shell

- Open by direct URL, internal link and browser Back/Forward.
- Refresh at initial, filled-form and completed states.
- Verify unauthenticated redirect preserves or intentionally discards the target.
- Verify bottom navigation, top bar, search, notification bell and stack Back controls.
- Verify active navigation state and no double shell/header.
- Test unknown path, malformed dynamic ID and deleted-object deep link.

### 8.3 Data states

For every data-bound page test:

- initial loading/skeleton;
- successful empty result;
- single record;
- enough records for wrapping/pagination/scroll;
- very long strings and large numeric values;
- missing optional fields;
- stale/deleted referenced record;
- API 400, 401, 403, 404, 409/422 if used, 429 and 500;
- offline and request timeout;
- recovery through Retry or navigation.

Use request interception only to create UI-only transport states. Business-rule tests must use the real backend.

### 8.4 Every form

For each field:

- focus by mouse and keyboard;
- inspect label, required indicator, hint, placeholder, input mode and autocomplete;
- submit completely blank;
- fill valid minimum and valid realistic values;
- test whitespace-only and leading/trailing whitespace;
- test type-specific invalid values;
- test exact lower/upper boundaries and one step outside each;
- test long Unicode, emoji, apostrophe, ampersand, RTL text and line breaks where accepted;
- test HTML/script payload rendering safely;
- test copy/paste and mobile keyboard behaviour;
- test dependent fields appearing/disappearing without data leakage;
- test server rejection even if client validation blocks the ordinary button;
- verify errors are field-linked, announced and cleared correctly;
- press Enter and verify no accidental duplicate submission;
- double-click/tap the submit control and reconcile one server-side action;
- navigate away with unsaved data and test the expected warning/preservation;
- return after success and verify the form cannot accidentally resubmit.

Do not use browser autofill as the sole happy-path test; every field must actually receive an explicit test value.

### 8.5 Every control

For each button/link/tab/toggle/chip/editor command:

- click/tap once;
- activate with keyboard;
- verify hover/focus/pressed/selected/disabled state;
- verify the action target and resulting state;
- test rapid repeat where the action mutates data;
- test at 200% zoom and 360 px width;
- verify the accessible name matches the action;
- verify loading prevents unintended repeat actions;
- verify confirmation/cancel paths for destructive actions.

Rich editor commands additionally require selection-dependent states, link/image/video/table insertion, undo/redo, sanitisation, paste from plain text and formatted sources, saved/reloaded fidelity and read-only rendering.

### 8.6 Close-out for one page

A page may be checked off only after:

- DOM controls reconcile with source handlers and conditional controls;
- all ledger rows have a result;
- request/response and persistence were verified;
- responsive and keyboard checks were completed;
- console contains no unexplained error/warning;
- defects were logged;
- created fixture state is recorded for reuse or cleanup.

---

## 9. UI/UX and accessibility standard

Use WCAG 2.2 AA as the test target even where the SRS is less specific.

### 9.1 Information architecture and comprehension

- Page purpose is obvious from heading and context.
- Labels use member vocabulary consistently: INR, VGC Token, VGC Points, Secure/Independent contract, Giver/Taker, Pioneer/Teacher/Student.
- Monetary values always state currency, direction and fee/tax implications.
- Status labels are consistent across list, detail, notification and admin surfaces.
- Empty states explain what happened and offer an appropriate next action.
- Error messages explain recovery without exposing backend internals.
- Irreversible or delayed effects explain timing, ownership and consequences before confirmation.

### 9.2 Interaction

- Tap targets are at least 44×44 CSS pixels where practical.
- Primary/secondary/destructive actions are visually distinct and placed consistently.
- Loading, success and error feedback are immediate; the SRS target is under 300 ms for ordinary UI response.
- The UI never looks complete while the server action is still repeatable.
- Forms preserve input after recoverable failures.
- Long operations expose progress or a stable pending state.
- Optimistic updates reconcile correctly if the request fails.
- Toasts do not contain the only copy of important information.

### 9.3 Keyboard and focus

- Logical tab order with no traps.
- Visible focus indicator on every interactive control.
- Skip navigation where repeated shells warrant it.
- Dialog focus enters, stays contained and returns to the trigger.
- Escape closes non-destructive overlays where expected.
- Route changes move focus to a sensible heading or announcement.
- Editor toolbars, tabs, toggles, QR alternatives and custom controls are keyboard operable.

### 9.4 Semantics and assistive technology

- One meaningful `h1` per screen and a logical heading hierarchy.
- Every input has a programmatic label and described error/hint.
- Icon-only controls have accurate accessible names.
- Status changes, validation and async results use appropriate live announcements.
- Cards that navigate do not create nested or ambiguous interactive elements.
- Tables have headers; lists use list semantics; tabs expose tab state.
- Colour is never the only status signal.

### 9.5 Visual and responsive matrix

At minimum:

| View | Dimensions/condition | Required pass |
|---|---|---|
| Small mobile | 360×800 | Every route and every form |
| Narrow edge | 320×568 | No clipped critical action; document any supported-width decision |
| Common iPhone | 390×844 | Primary mobile visual pass |
| Large phone | 430×932 | Wrapping and safe area |
| Tablet portrait | 768×1024 | Shell, grids, modals, editor |
| Desktop | 1280×720 | No phone-shell overflow or unusable dead space |
| Zoom | 200% | No content/action loss |
| Text scaling | 200% where device permits | No overlap/truncation |
| Theme/contrast | OS high-contrast and reduced motion where available | Meaning preserved |

Check safe-area padding, fixed headers/nav, on-screen keyboard, scroll restoration, sticky controls, long lists, modals, lightboxes, QR codes, rich editor and toast placement.

### 9.6 Content and trust

- Terms and Privacy content is real, current and reachable before consent.
- Dates and times state the relevant local interpretation.
- Empty/placeholder/internal development copy never appears in a release route.
- No raw Xano error, internal numeric identifier or implementation vocabulary is exposed without a product reason.
- Member names, public Member IDs and internal row IDs are not confused.

---

## 10. Backend test protocol applied to every endpoint

### 10.1 Authentication and authorisation

Attempt the applicable combinations:

- no `Authorization` header;
- malformed scheme/token;
- expired token;
- member token;
- different member’s token against an owned record;
- suspended/unverified/mobile-less member as dictated by SRS;
- admin member token versus admin 2FA token;
- non-admin token on admin route;
- backup admin before/after activation conditions;
- replay after logout/password change if token revocation is intended.

Verify consistent 401/403 behaviour and absence of sensitive record existence leaks.

### 10.2 Inputs

For every input test:

- missing key;
- explicit `null`;
- empty string/array/object;
- whitespace-only;
- wrong JSON type;
- minimum, maximum, zero, negative, fractional and overflow values;
- invalid enum/case;
- nonexistent and unauthorised foreign keys;
- invalid/past/future dates and timezone boundaries;
- duplicate unique values;
- large Unicode and hostile HTML/URL content;
- unexpected extra keys;
- equivalent query-string and body encodings where relevant.

Special attention: Xano has historically treated inputs as gateway-required unless the field name itself has a trailing `?`. Any source-declared optional input must be called while omitted to verify the live gateway contract.

### 10.3 State machine and ownership

For every mutating endpoint:

- call in every allowed source state;
- call immediately before/after each deadline;
- call from every actor role;
- repeat after success;
- call after cancellation/rejection/deletion/archive;
- attempt to skip intermediate states;
- attempt to act on another member’s record;
- attempt conflicting actions from two actors.

### 10.4 Atomicity, concurrency and idempotency

- Send identical requests sequentially and concurrently.
- Repeat with the same idempotency key and with different keys.
- Double-submit from the browser.
- Race stock, wallet, voting, enrollment, appointment, settlement and rating limits.
- Force an insufficient-balance or stale-state failure after the initial page load.
- Verify no orphan pending record, duplicate ledger, double notification or partial balance movement.
- Verify lock/conflict responses are safe to retry.

### 10.5 Response contract and observability

- HTTP status matches the error class.
- Response JSON shape matches the wrapper/type and is stable for empty results.
- Pagination metadata, sorting and filters are correct.
- Dates, decimals and booleans have consistent types.
- Errors are actionable but do not expose stack traces, table IDs, queries, tokens or personal data.
- Relevant event/audit logs contain actor, timestamp, action, record ID and before/after values.
- Logs do not contain passwords, bearer tokens, OTPs or excessive personal data.

### 10.6 Time-dependent lazy evaluation

For every SRS time window, create disposable rows just before, exactly at and just after the boundary, then trigger every documented read path. Verify:

- state changes only once;
- side effects execute only once;
- list and detail endpoints agree;
- notification/audit behaviour is correct;
- timezones and calendar-day wording match;
- the optional external cron is not required for correctness.

Windows include guardian seven-day expiry, rate-change notice, PTS cache and idle time, marketplace POD/dispute/auto-refund, group deletion hold, candidacy/election/deposit periods, session auto-hide/end/amendment SLA, investment overdue dates, loan annual phases, contract application/completion deadlines, backup-admin inactivity and admin lockout.

---

## 11. Cross-cutting security and privacy suites

### 11.1 OWASP web/API risks

- Broken object-level and function-level authorisation across every numeric ID.
- Mass assignment on profile, role flags, balances, status, seller/admin fields and ownership fields.
- Injection in query filters, rich HTML, comments, messages, filenames, URLs and report filters.
- Stored/reflected/DOM XSS in blogs, group posts, contract chat/disputes, item descriptions, rejection reasons and notifications.
- Unsafe URL schemes and reverse-tabnabbing in rich-editor links.
- Authentication brute force, account enumeration, reset-token reuse and OTP replay.
- Rate limiting for registration, verification, voting, applications, ratings and financial mutations.
- CORS and preflight policy for public/member/admin groups.
- Bearer-token storage, leakage, expiry and cross-tab behaviour.
- Sensitive-data exposure through search, admin reports, raw CRUD groups, error bodies and cache.
- File upload MIME/extension mismatch, size, malicious SVG/HTML, filename handling, ownership and deletion.

### 11.2 DPDP and account data

- Consent must be explicit, mandatory, timestamped and linked to actual Terms/Privacy content.
- Export/visibility must be restricted to the subject/admin as defined.
- Erasure request status, admin processing and anonymisation must be tested on disposable data.
- Ledger retention must be non-reversible and must not preserve identifying lookup paths.
- Account Closure is distinct from immediate erasure and must be tested against SRS §2.5 if implemented.
- Search, notifications, analytics, logs and deleted/abandoned content must not leak erased identifiers.
- Breach-notification support should be assessed as an operational requirement even if no UI exists.

### 11.3 Financial invariants

- No client-supplied balance, fee, tax, seller share, rate or role is trusted.
- All values use appropriate decimal/integer precision and deterministic rounding.
- Every debit has an authorised purpose and durable reference.
- Admin adjustments require a reason and appear in audit history.
- Failed, cancelled, disputed, expired and retried actions reconcile exactly once.
- PTS quote expiry/rate change cannot create arbitrage between preview and conversion.
- Marketplace and contract escrow cannot be spent twice.

---

## 12. Entry and exit gates

### 12.1 Entry gate

Before functional execution:

- workspace status captured for all three local repositories;
- SRS/version discrepancy acknowledged;
- current source inventory regenerated;
- unit tests, typecheck and build pass;
- local and production login pages reachable;
- browser control connected;
- test mailbox route decided;
- disposable persona and fixture ledgers created;
- current open/deferred issues read;
- latest TR ID confirmed;
- initial wallet/admin/PTS/config baseline recorded.

### 12.2 Module exit gate

A module may close only when:

- all of its routes and route states are complete;
- all controls and forms are complete;
- all frontend wrappers/hooks are mapped;
- all backend endpoints and reusable function paths are complete;
- happy, negative, permission, concurrency and time-bound workflows are complete;
- browser, API and persistence evidence agree;
- local and deployed parity smoke is complete;
- defects are recorded and linked;
- fixtures are either preserved intentionally for the next module or cleaned up.

### 12.3 Full release exit gate

The exhaustive pass is complete only when:

- all coverage-ledger rows have a terminal status;
- there are zero unexplained `Not run` rows;
- all Critical/High defects are resolved and retested, or explicitly accepted by the owner with rationale;
- all SRS deviations are explicitly accepted or corrected;
- wallet/ledger reconciliation has no unexplained difference;
- accessibility, responsive, performance, security, PWA/offline and device passes are complete;
- email and Cloudinary delivery have been observed end to end;
- actual-device QR scanning and PWA installation are complete;
- cleanup is verified;
- a final requirements traceability and residual-risk report is produced.

`Blocked` is not equivalent to `Pass`; the final report must list the exact access or product decision needed to close each blocker.

---

## 13. Complete route-by-route browser plan

The universal per-page protocol in §8 applies to every row below. The page-specific text identifies the minimum states and controls that must be exposed; it does not narrow the requirement to click every control discovered at runtime.

For every dynamic `:id`, `:appId` or `:memberId` route, also test:

- valid fixture in every lifecycle state;
- nonexistent ID, zero, negative, decimal, non-numeric and extremely large ID;
- valid record owned by another member;
- deleted/archived/erased referenced record;
- direct deep link after logout and after token expiry.

### 13.1 Public/authentication routes

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-001 | `/admin/login` — `AdminLoginScreen` | Email/password submit; invalid email; unknown email; wrong password; three-strike lockout; challenge creation; OTP blank/wrong/expired/reused/correct; email-OTP versus recovery-code toggle; used/invalid recovery code; duplicate submit; admin/non-admin account; redirect to `/admin`; no member-token privilege leakage | §15.2, §17 |
| UI-002 | `/login` — `LoginScreen` | Email/password fields; disabled/enabled submit; unknown email and wrong password must not enumerate accounts; valid/suspended/unverified users; preserved destination; Enter submit; Forgot Password and Create Account links; refresh/session token behaviour | §2.4 |
| UI-003 | `/signup` — `SignupScreen` | Every registration field and consent link; adult/minor DOB boundary; password rules; duplicate email; City/State/Country/mobile SRS reconciliation; guardian field appearance; invalid/unknown/unverified guardian; consent unchecked; device/IP rate limits; successful adult and minor paths; three wallets/member ID only at correct point | §2.1–2.4, §17 DPDP |
| UI-004 | `/forgot-password` — `ForgotPasswordScreen` | Blank/invalid/unknown/known email; generic anti-enumeration response; repeat and rate limit; email content/link/expiry; link once-only; Back-to-login navigation; input preservation on network failure | §2.4, §17 |
| UI-005 | `/reset` — `ResetPasswordScreen` | Missing/malformed/expired/used magic token and email; magic-link exchange; password/confirmation rules; mismatch; old-password rejection after success; new-password login; Back/refresh; token cannot be reused | §2.4, §17 |
| UI-006 | `/verify-email` — `VerifyEmailScreen` | Token from link/manual entry as implemented; missing/wrong/expired/used token; resend control and cooldown; five-per-hour limit; successful verification; repeated verification; login gate before/after; clear success and recovery copy | §2.4 |
| UI-007 | `/signup/guardian-sent` — `GuardianSentScreen` | Direct access and post-submission access; correct safe summary; no password leakage; guardian instruction; navigation onward; responsive long email/name; expired/rejected context if supported | §2.1.2 |
| UI-008 | `/terms` — placeholder/content route | Reach from signup without losing data; actual Terms content, version/effective date and return path; keyboard/readability; direct access. Current placeholder must be reconfirmed against TR-138 | §17 DPDP |
| UI-009 | `/privacy` — placeholder/content route | Reach from signup without losing data; actual Privacy content, purposes/rights/contact/version and return path; keyboard/readability; direct access. Current placeholder must be reconfirmed against TR-138 | §17 DPDP |

### 13.2 Authenticated shell and primary tabs

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-010 | `/home` — `HomeScreen` | Greeting/identity; balances and rate summaries; every quick-action/module card; verification/mobile capability notices; notification/search icons; pull/refresh behaviour; zero/large/missing wallet data; session-expiry overlay preserving page | §2–§5, §16 |
| UI-011 | `/wallet` — `WalletScreen` | All wallet cards and balances; selected wallet/activity views; declaration, surrender, transfer, passbook, rewards and PTS navigation; rate notice/current/pending rates; empty/error/loading; correct currencies, precision, signs and public Member ID | §3–§5 |
| UI-012 | `/explore` — `MarketplaceScreen` | Search input; every category/root/subcategory chip; clear filter; item cards; pagination/empty/error; cart, orders/sales and propose actions; inactive/sold-out filtering; eight-level category path; long titles/prices/currencies | §6 |
| UI-013 | `/community` — `CommunityScreen` | Every Gaming, Education, Financial, Groups, Blog, Loans, Expenses and Contracts entry card/link shown by the component; role/status badges; empty sector data; correct destination and Back return | §7–§14 |
| UI-014 | `/profile` — `ProfileScreen` | Avatar/name/public ID/roles/verification/contact state; edit, password, guardian approvals, notifications, erasure and any admin link; logout confirmation/action; mobile-gating copy; missing avatar; long role set; session clear and protected-route redirect | §2, §15–§17 |

Across UI-010–014, click all five bottom-nav items from every tab, verify active state, click Search and Notification Bell, and verify the shell does not duplicate or reset unexpectedly.

### 13.3 Wallet, declarations, Points and Point Token Scheme

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-015 | `/wallet/declare` — `DeclarationFormScreen` | Every payment type; amount/description/contact/additional fields; conditional requirements for Donation/Grant/Sponsorship/Investment/Token Purchase; synthetic proof upload; public Member ID; draft versus submit if exposed; validation, duplicate submit and mobile/auth gates; resulting declaration | §3.3, §3.5, §13.1 |
| UI-016 | `/wallet/declarations` — `DeclarationsListScreen` | Empty/list; every status; record expansion/action; draft delete/submit; submitted delete blocked; rejection reason; verified wallet effect; ordering; refresh and stale row | §3.3, §3.7 |
| UI-017 | `/wallet/surrender` — `TokenSurrenderFormScreen` | Token amount, displayed conversion rate/INR preview and payment details; zero/fraction/too-large/insufficient balance; rate change between render/submit; mobile gate; public Member ID; duplicate submit; pending request and no premature debit | §3.4, §3.6 |
| UI-018 | `/wallet/surrenders` — `TokenSurrendersListScreen` | Empty/list/detail affordances; pending/completed/rejected if supported; correct rate snapshot and amounts; ordering; admin completion reflected once | §3.4, §3.7 |
| UI-019 | `/points/send` — `TransferFormScreen` | Member lookup/search/selection; self, unknown and unrelated internal/public ID; amount/remark; zero/fraction/insufficient balance; mobile gate; instant confirmation; rapid/double submit; idempotency; sender/receiver balances/passbooks/notifications | §5.5–§5.6 |
| UI-020 | `/points/pending` — `PendingTransfersScreen` | Verify immediate history-replacing redirect to `/points/passbook`, direct/reload/Back behaviour and absence of dangling navigation/copy. Test the legacy Pending/Accept/Cancel/Dispute APIs directly because the route intentionally has no UI | §5.5 |
| UI-021 | `/points/passbook` — `PointsPassbookScreen` | Empty and every entry type; debit/credit signs; counterpart name/public ID; remark; timestamp; pagination/refresh; large history; linked blog/contract references if shown; totals reconcile | §5.6 |
| UI-022 | `/points/activities` — `ActivityRewardsScreen` | Catalog/history/changelog tabs and all controls; active/inactive activities; version/effective date; member activity history; automatic/manual award visibility; empty/error states; values match Appendix A/current catalog | §5.2–§5.4, Appendix A |
| UI-023 | `/pts` — `PtsDashboardScreen` | Rate/components/history/convert tabs; direction toggle; amount; quote; confirm/cancel; stale quote/rate; both directions; tax and rounding; insufficient balances/admin liquidity/P_net/floor guards; theta hidden; cache/t_idle; rapid conversion; ledger and audit | §4 |

### 13.4 Marketplace and proposals

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-024 | `/market/item/:id` — `ItemDetailScreen` | Admin/member/blog-ticket item variants; seller/category/description/price/currency/stock/revenue split/buyer schema; quantity; Add to Cart and Buy Now; own item; sold out/inactive; insufficient balance; duplicate RG purchase; every dynamic buyer field. Prove that Add to Cart cannot bypass required buyer information and that captured data survives checkout/order | §6.3–§6.9, §8.5 |
| UI-025 | `/cart` — `CartScreen` | Empty; one/multiple vendor carts; quantity/line totals/subtotals; remove each item; checkout each cart; cancel/confirm; stale/inactive/price/stock changes; insufficient balance; concurrent checkout; blog ticket constraint; cart clears exactly once. The current screen has no dynamic buyer-information step: explicitly test and classify required buyer-schema bypass/data loss | §6.6–§6.7 |
| UI-026 | `/market/orders` — `OrdersScreen` | Buyer Orders and Seller Sales tabs; empty/populated/error; all statuses; item/order links use correct ID type; quantities, totals, currency and counts; pagination/order; refresh after mutation | §6.7–§6.8 |
| UI-027 | `/market/orders/:id` — `OrderDetailScreen` | Buyer/seller/admin visibility; pending POD, POD submitted/delivered, received, disputed, settled, cancelled/refunded; Cancel, Submit POD, Mark Received, Dispute and settlement actions wherever exposed; proof links; deadlines; revenue split; lazy transitions; IDOR | §6.7–§6.9 |
| UI-028 | `/market/propose` — `ProposeItemScreen` | Every item/category/sector/type/price/revenue-share/buyer-schema/attachment field; category depth; invalid totals and currency; draft/submit if supported; successful submission; edit/withdraw path discoverability; rejection/change-request recovery; duplicate submit | §6.3–§6.5 |

### 13.5 Profile, guardian and notifications

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-029 | `/profile/edit` — `EditProfileScreen` | Name/mobile/DOB/location/avatar fields actually present; add/change/remove mobile; location mandatory rules; invalid DOB/mobile; image upload; save/cancel/Back; server-side mass-assignment attempt; verification reset behaviour; refresh | §2.1, §2.4 |
| UI-030 | `/profile/password` — `ChangePasswordScreen` | Current/new/confirm fields; show/hide if present; wrong current; weak/reused/mismatch; successful change; double submit; old/new login and existing-session behaviour | §2.4, §17 |
| UI-031 | `/profile/guardian-approvals` — `GuardianApprovalsScreen` | Empty; multiple pending; minor details; Approve/Reject plus rejection reason; expired request; other guardian IDOR; duplicate response/race; notification and account/wallet creation only on approval | §2.1.2 |
| UI-032 | `/profile/erasure` — `ErasureScreen` | Status states; reason field; warning/consent/submit/cancel; duplicate pending request; admin-processed result on disposable user; distinction from Account Closure; inaccessible/anonymised profile and retained non-reversible ledger | §2.5, §17 DPDP |
| UI-033 | `/notifications` — `NotificationsScreen` | Empty; unread/read; every notification event/deep link; mark one/read all; pagination/poll update; missing target; member versus admin deep link; timestamps; duplicate notification prevention; TR-132 recheck | §16 |
| UI-034 | `/notifications/preferences` — `NotifPreferencesScreen` | Global channel toggles and every per-category toggle; save/reload; critical security/financial controls immutable; quiet-hours UI and validation if present; default row absence; preference effect on in-app/email delivery | §16.2 |

### 13.6 Gaming

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-035 | `/gaming/games/:id` — `GameDetailScreen` | Game information, groups, seasons/election links; join/leave/create-group controls if present; first-time versus mature game; no seasons; role badges; access rules and errors | §11.1–§11.5, §11.14 |
| UI-036 | `/gaming/seasons` — `SeasonsListScreen` | Empty and active/closed/archived seasons; filters/tabs/cards; game/election navigation; status/date/funding/Pioneer display; pagination and long history | §11.10–§11.14 |
| UI-037 | `/gaming/seasons/:id` — `SeasonDetailScreen` | Proposed/invited/deposit-pending/active/completed/archived states; Independent/Secure funding; deposit, committee, event, ledger/distribution and close/archive controls by role; totals/80% rule; departure effects | §11.7–§11.13 |
| UI-038 | `/gaming/events/:id` — `EventDetailScreen` | Event details/status/deadline; submission form/file; own/other submission; edit prohibition; results entry/view; distribution records; before/at/after deadlines; duplicate and IDOR | §11.10–§11.12 |
| UI-039 | `/gaming/elections/:id` — `ElectionDetailScreen` | Registration/review/published/voting/closed/tied states; candidate cards; voting-rights purchase, selection and vote; self/candidate voting rules; one vote; unpaid vote; countdown; admin tie-break/public log; results | §11.6 |
| UI-040 | `/gaming/pioneer-candidacy` — `PioneerCandidacyScreen` | All three submission sets and both candidacy item/funding variants; required fields/files; preview; immutable-after-submit rule; existing pioneership/candidacy limits; admin review status; withdraw/edit only where permitted | §11.2–§11.6 |

### 13.7 Education

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-041 | `/education` — `EducationScreen` | Course search/filter/cards; available/hidden/full/cancelled/completed; Teacher dashboard entry; ratings links; empty/error; ticket visibility around dates | §12.1–§12.4 |
| UI-042 | `/education/courses/:id` — `CourseDetailScreen` | Course/session/ticket/revenue/teacher details; buy/enrol; own course; insufficient balance; duplicate/full/hidden ticket; amendment notice/acceptance if exposed; session and ratings navigation | §12.2–§12.5 |
| UI-043 | `/education/teacher` — `TeacherDashboardScreen` | Non-teacher/teacher; course/session lists; create proposal/amendment controls; QR generation; attendance verification; payout; student rating actions; empty and all session states | §12.5–§12.10 |
| UI-044 | `/education/sessions/:id` — `SessionDetailScreen` | Student/teacher/unrelated roles; scheduled/in-progress/auto-ended/completed/cancelled; in-person/online; QR view/join/check-in/verify; roster; amendments; rate actions; payout status | §12.5–§12.10 |
| UI-045 | `/education/sessions/:id/checkin` — `StudentCheckinScreen` | QR scanner plus backend-token validation; camera permission allow/deny/unavailable; valid/wrong-session/expired/reused token; unenrolled/student/teacher; offline retry; successful checked-in state and teacher verification. The UI currently appears to promise manual verification without a manual-token input: classify that path `Not implemented` if confirmed. Scan the generated QR on a real device in live and non-live session states | §12.6 |
| UI-046 | `/education/teachers/:memberId/ratings` — `TeacherRatingsScreen` | No ratings; multiple ratings; average/count/math; testimonies/author/date; pagination; erased/deleted rater; public/direct access behaviour consistent with route guard | §12.7 |

### 13.8 Financial

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-047 | `/financial` — `FinancialScreen` | Donation/grant/sponsorship/investment sections and every tab/card/CTA; donor wall; overdue count; empty/error; declarations integration; correct visibility and currency | §13 |
| UI-048 | `/financial/donors/:id` — `DonorDetailScreen` | Public donor information; multiple declarations/recognitions; privacy fields absent; erased/anonymous donor; missing ID; Back/share/link controls if present | §13.1, §13.5 |
| UI-049 | `/financial/investments/new` — `CreateInvestmentScreen` | Option A/B; amount/contact/declaration fields; terms/payout preview; zero/boundary/large amount; mobile/contact gate; submit/double submit; resulting schedule/liability/notification | §13.2 |
| UI-050 | `/financial/investments/:id` — `InvestmentDetailScreen` | Owner/admin/unrelated; option A/B; pending/active/due/overdue/paid; schedule and no-compound math; overdue-request control before/at/after 30 days; repeat request; payout updates | §13.2, §13.5 |
| UI-051 | `/financial/sponsorships/new` — `CreateSponsorshipScreen` | Recipient lookup; amount/conditions/UPI; full/partial fulfilment criteria; self/unknown recipient; invalid/large amount; consent; submit/double submit; notification/record | §13.3–§13.4 |
| UI-052 | `/financial/sponsorships/:id` — `SponsorshipDetailScreen` | Sponsor/recipient/admin/unrelated; pending/recognised/partial/fulfilled/disputed/refunded; progress and evidence; dispute window/action; amounts; admin updates reflected | §13.3–§13.5 |

### 13.9 Groups and Blog

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-053 | `/groups` — `GroupsScreen` | Discover/My Groups/invites if present; public/private cards; search/filter; join/request/respond controls; empty/error; visibility for logged-out/non-member; removed member state | §7.1–§7.4 |
| UI-054 | `/groups/new` — `CreateGroupScreen` | Name/description/type/sector and every field; validation/duplicates/long text; create/double submit; creator membership/admin role; new group navigation | §7.3–§7.5 |
| UI-055 | `/groups/:id` — `GroupDetailScreen` | Outsider/member/removed/admin/co-admin; public/private; Overview/Posts/Members/Manage tabs; Join/Leave/Invite/Approve/Reject/Promote/Transfer/Remove/Appeal/Delete; comments/reactions/polls; 24-hour hold; sole-admin rules; notifications | §7.5–§7.11 |
| UI-056 | `/groups/:id/post/new` — `CreatePostScreen` | Text, media, link and poll post types; all type tabs; editor/file/URL/poll options; blank/hostile/large content; member/outsider/removed permissions; submit/double submit; post visibility | §7.8–§7.10 |
| UI-057 | `/blog` — `BlogFeedScreen` | Public/My Blogs/Bookmarks or implemented tabs; sector/tag/search filters; article cards; locked RG state; draft/review/rejected statuses where shown; create action; empty/error/pagination | §8.1–§8.2, §8.6 |
| UI-058 | `/blog/new` — `CreateBlogScreen` | Title, sector, tags, comments, revenue-generator/ticket price and full rich editor; Save Draft/Submit/Self-publish/abandon paths as exposed; upload/embed; validation; unsaved navigation; duplicate submit | §8.3–§8.5, §8.7 |
| UI-059 | `/blog/:id` — `BlogDetailScreen` | Author/reader/non-purchaser/admin; draft/in-review/published/rejected/abandoned/taken-down; free/locked RG; buy ticket; like/dislike/switch/self-vote; comment; bookmark; edit/delete/submit/publish/abandon; image lightbox; moderation | §8.2–§8.10 |
| UI-060 | `/blog/:id/edit` — `EditBlogScreen` | Draft and rejected edit; published/in-review/other-author blocked; all editor fields prefilled; rejected reason; save/submit; XSS sanitisation; unsaved change; RG ticket field immutability and reload fidelity | §8.3–§8.7 |

### 13.10 Loans and expenses

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-061 | `/loans` — `LoansScreen` | Request form fields; amount/purpose/term/collateral; list/detail presentation; pending/approved/active/repaid/written-off; repayment amount and confirmation; insufficient tokens; phase/debit schedule; multiple loans | §9 |
| UI-062 | `/expenses` — `ExpensesScreen` | Dashboard totals/category summaries; search/date/category/status filters; clear controls; pending/settled lists; settle confirmation; add and platform-ledger links; empty/error/pagination; totals reconcile | §10 |
| UI-063 | `/expenses/new` — `AddExpenseScreen` | Personal/Platform Outflow entry type and role restriction; description/amount/category/specific category/payment mode/receipt/platform reference/reason visibility; dependent fields; submit/double submit | §10.2–§10.5 |
| UI-064 | `/expenses/ledger` — `PlatformLedgerScreen` | Public/member/admin visibility per SRS; date/category/search/pagination; only authorised Platform Outflow entries; per-entry reason/remark visibility; totals and privacy; empty/error | §10.3–§10.6 |

### 13.11 Contracts, reputation and search

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-065 | `/contracts` — `ContractsScreen` | Browse/My Contracts tabs and every sub-group; Secure/Independent filter, sector filter and cards; Create; open/closed/expired/cancelled/completed/disputed states; applicant/assigned counts; required-filter gateway behaviour; empty/error | §14 |
| UI-066 | `/contracts/new` — `CreateContractScreen` | Title/requirements/budget/type/sector/application deadline/completion date/conditions/notes; Secure versus Independent disclosure; caps; invalid date/amount; mobile and balance gate; submit/double submit | §14.1–§14.2 |
| UI-067 | `/contracts/:id` — `ContractDetailScreen` | Giver/applicant/assigned Taker/unrelated/admin; all contract/application states; Apply with optional counter-offer/date; edit/cancel/close applications; Request Detail; rich proposal; Appoint; submit/verify work; dispute; rate; chat; caps/deadlines/payment/fees | §14.2–§14.10 |
| UI-068 | `/contracts/:id/chat/:appId` — `ContractChatScreen` | Giver and matching applicant only; third-party/other applicant IDOR; empty/thread; send/rapid send; long/hostile content; notification; read-only timing per current SRS versus implementation; terminal/deleted states | §14.11 |
| UI-069 | `/members/:memberId/reputation` — `MemberReputationScreen` | No/one/many ratings; average/count; Giver/Taker roles; testimony; linked contract/rater; erased member; public/internal ID handling; pagination and direct access | §14.9 |
| UI-070 | `/search` — `SearchScreen` | Blank/minimum/long/Unicode query; debounce; every sector/category filter; Marketplace/Groups/Blog result sections; clear; result links; empty/error/offline; private group and locked RG visibility; stale/deleted record | §17 Search |

### 13.12 Administrator routes

Every route below must first be tested with: no token, ordinary member token, admin member token that did not complete 2FA if obtainable, expired admin token, valid test-admin token and direct deep link.

| ID | Route and component | Required states, controls and assertions | SRS |
|---|---|---|---|
| UI-071 | `/admin` — `AdminScreen` | Every dashboard tile/link; admin identity; backup/vacation/security indicators if present; empty/error; no member-only shell confusion; logout/session expiry | §15 |
| UI-072 | `/admin/2fa/setup` — `AdminSetup2faScreen` | Initiate; QR/secret; recovery codes; copy controls; verification blank/wrong/expired/correct; setup repeat; recovery-code storage warning; no secret leakage in logs/navigation | §15.2, §17 |
| UI-073 | `/admin/members` — `AdminMembersScreen` | Search/pagination/member rows; role/suspend controls; impersonate; process erasure; every modal confirm/cancel; self/owner protection; invalid member; audit; stale row and mass-assignment protection | §2, §15, §17 |
| UI-074 | `/admin/declarations` — `AdminDeclarationsScreen` | Declaration and Token Surrender tabs; all statuses; verify/reject/complete controls and reasons; proof links; duplicate/concurrent action; member wallet/ledger/notification; admin can see all—not only own | §3, §13, §15 |
| UI-075 | `/admin/proposals` — `AdminProposalsScreen` | Pending/change-requested/accepted/rejected; detail; Accept/Request Changes/Reject and reasons; category/revenue split fields; duplicate decision; item creation and notification | §6.3, §15 |
| UI-076 | `/admin/loans` — `AdminLoansScreen` | Pending/approved/active/due/written-off; Approve with terms, Reject with reason, Write Off; validation; repeated/conflicting decision; wallet/debit schedule/audit/notification | §9, §15 |
| UI-077 | `/admin/financial` — `AdminFinancialScreen` | Investments, due payouts, donations and sponsorship controls/tabs; mark payout paid; publish donor; recognise/progress/refund sponsorship; filters; duplicate action; liabilities, audit and notifications | §13, §15 |
| UI-078 | `/admin/wallets` — `AdminWalletsScreen` | Member lookup; view all wallets/history; adjust credit/debit/reason; mint; points award provision type; budget create/raise/lower; insufficient admin balance; confirmations; reconciliation and audit | §3–§5, §15 |
| UI-079 | `/admin/pts` — `AdminPtsScreen` | Components; reserve update; theta adjustment; bootstrap; rate change announcement; audit log; secret theta not exposed publicly; invalid/duplicate values; rate/cache effects; rollback test window | §4, §15 |
| UI-080 | `/admin/market` — `AdminMarketScreen` | Orders/items/categories and every implemented tab; fulfil/settle/auto-settle/dispute resolution; create/edit/delete item/category; stale/concurrent state; stock/escrow/revenue reconciliation and audit | §6, §15 |
| UI-081 | `/admin/blog` — `AdminBlogScreen` | Status/sector filters; pagination; review links; empty/error; unpublished content access restricted; counts/order; stale item | §8.4, §8.9, §15 |
| UI-082 | `/admin/blog/:id` — `AdminBlogReviewScreen` | Full draft/review rendering; Approve + points; Reject + reason; Takedown + reason; RG ticket creation/split; duplicate/concurrent review; author notification/wallet/catalog/audit; hostile rich HTML | §8.4–§8.10 |
| UI-083 | `/admin/contracts` — `AdminContractsScreen` | Disputed applications; both party/admin message threads; send message; evidence attachment; resolution choice/amount/reason; deep-link from notification; no unrelated access; escrow/wallet/audit; duplicate resolve | §14.8, §15 |
| UI-084 | `/admin/reports` — `AdminReportsScreen` | Every report tab (activity, education, financial, gaming, marketplace, wallet or current source set); from/to filters; invalid ranges; empty/large results; pagination/export if present; totals reconcile and access/privacy | §15, §17 |
| UI-085 | `/admin/config` — `AdminConfigScreen` | Load/edit/save configuration; every exposed key and JSON validation; current/pending rate config; audit log; vacation/backup controls if exposed; unknown/protected key; concurrent edit; confirm/rollback | §15, §17 |

### 13.13 Redirect and fallback routes

| ID | Route | Required assertions |
|---|---|---|
| UI-086 | `/` | Logged out redirects to `/login` through `/home` auth gate without loop; logged in lands on `/home`; history replacement works |
| UI-087 | `*` | Unknown shallow/deep routes, malformed casing, trailing slash and encoded path redirect intentionally; no open redirect; logged-out handling; consider whether a real 404 would be better UX |

---

## 14. End-to-end workflow suites

Each workflow below must be executed through the browser for every user-facing step and supplemented by direct endpoint cases. Capture a state-transition table before starting and reconcile every side effect after each numbered transition.

### WF-01 — Adult registration, verification and first session

1. Submit blank and invalid registration attempts.
2. Register Adult A with explicit consent and all SRS-required data.
3. Verify that no account/wallet duplication occurs on repeated submit.
4. Observe the verification email, sender, subject, content, link, expiry and latency.
5. Confirm login/browse/wallet gates before verification.
6. Test invalid and expired verification, resend cooldown and hourly limit.
7. Verify successfully, log in, confirm permanent public Member ID and exactly three wallets.
8. Refresh, open a new tab, expire the token and re-authenticate through the session modal without losing an in-progress form.
9. Log out and verify local/session data and protected-route history are cleared.

Negative branches: duplicate email, three registrations/device/day, Unicode names, exact 18th-birthday boundary, missing location fields, suspended account and enumeration-resistant login.

### WF-02 — Minor/guardian lifecycle

1. Register Guardian and reach the required verified state.
2. Start minor signup with DOB just under 18; verify guardian field is mandatory.
3. Test unknown, malformed, self and unverified guardian Member IDs.
4. Submit a pending request and verify that the minor cannot log in or receive wallets/member ID early.
5. Observe guardian email/in-app notification and safe minor details.
6. Approve one request; verify one account, permanent guardian link and three wallets.
7. Reject a second request with a reason; verify data disposal and re-application.
8. Backdate a third disposable request to just before/at/after seven days and trigger every lazy-read path.
9. Attempt duplicate/concurrent response and another guardian’s IDOR.
10. Verify the link becomes operationally inert at age 18 while remaining historical.

### WF-03 — Password, profile, verification state and account data

Cover forgot-password → email link → magic login → new password, link expiry/reuse, normal Change Password, profile/avatar/mobile/location edit, mobile-contact wallet gate, roles display, erasure request/admin processing and the separate SRS Account Closure lifecycle. If Account Closure is absent, reconfirm TR-139 rather than treating erasure as equivalent.

For closure, when implemented, exercise request summary, 30-day freeze/cancel/finalise, loans, Giver/Taker contracts, marketplace buyer/vendor orders, group ownership, ordinary/RG blogs, wallet transfer to Admin, archive and anonymised ledger retention.

### WF-04 — INR declaration to token purchase

1. Submit each declaration head: Donation, Grant, Sponsorship, Investment and Token Purchase.
2. Exercise proof upload and all conditional fields.
3. Save/delete draft and submit it.
4. Admin rejects one and verifies another.
5. For Token Purchase, reconcile INR receipt, token credit/rate, member/admin ledgers, notification and audit.
6. Repeat verify/reject and race the two decisions.
7. Test a pending rate announcement and the exact effective boundary.
8. Verify public donor/investment/sponsorship downstream records for the relevant heads.
9. Failure-inject the client’s upload → draft creation → submit sequence after each step with 401, timeout, 5xx and a committed response lost to the client. Retry the same logical intent and prove there is no orphan upload, duplicate declaration or second submission; the UI must resume the existing draft.

### WF-05 — Token surrender

Create with exact available balance, insufficient balance, decimal/boundary values and a changed rate. Confirm no premature token debit if the SRS says completion triggers movement. Admin completes once; reconcile token/INR/admin/member ledgers, request status, notification and replay protection.

### WF-06 — Instant Points transfer and passbook

Transfer A→B using public member lookup, including self/unknown/insufficient/zero/fractional cases. Double-submit and send concurrent requests with the same and different idempotency keys. Reconcile both wallets and passbooks exactly once, notification delivery and audit/event history. Call every legacy pending/accept/cancel/dispute endpoint and document its intentional or unsafe behaviour without reviving the superseded escrow workflow.

### WF-07 — Points minting and activity rewards

Test Constitutional and Promotional awards, admin 30% credit, admin 25% debit, insufficient Admin wallet, monthly budget creation/raise/no-lower/rollover and catalog versioning. Trigger every implemented auto-award activity once, verify repeat/abuse limits and compare current catalog to SRS Appendix A. Verify historical events retain the old amount after a catalog revision.

### WF-08 — Point Token Scheme

Use documented simulated `T_admin` values 0, 100 and 10,000. Verify all formula components independently, theta secrecy, rate floor/threshold, `P_net ≤ 0`, 10-second cache, `t_idle` cap, investment liability amortisation and sponsorship income split.

For Points→Tokens and Tokens→Points:

1. request quote;
2. verify 2.5% tax on the currency given;
3. convert within and after quote/rate validity;
4. test rounding, minimum, maximum and insufficient member/Admin balance;
5. replay/concurrently submit;
6. reconcile wallets, Admin tax, conversion history, passbook and rate snapshot.

### WF-09 — Marketplace proposal, listing, cart and order lifecycle

1. Member proposes an item with dynamic buyer fields.
2. Admin requests changes; member edits/resubmits.
3. Admin accepts with a valid revenue split; listing appears.
4. Buyer browses/searches/filters and opens detail.
5. Test Buy Now and same-vendor multi-item cart checkout.
6. For an item with required dynamic buyer fields, compare Buy Now with Add to Cart. Cart checkout must collect/preserve the same information and may not bypass validation.
7. Test different vendors, mixed currencies under one vendor, stale price/stock/inactive item and insufficient balance.
8. Verify escrow, stock and buyer information persisted on each order.
9. Seller/admin submits proof of delivery.
10. Branch to buyer cancellation, Mark Received, dispute and no-action time windows.
11. Admin resolves buyer/vendor/partial outcomes.
12. Trigger lazy auto-settlement and proof-timeout auto-refund at every boundary.
13. Reconcile stock, buyer, seller/proposer, Admin share, escrow, order, settlement, notifications and ledgers.

Repeat the purchase subflow for Admin-owned items, member-proposed items and RG blog tickets, including one-ticket/duplicate-reader rules.

### WF-10 — Groups and every post type

Create public and private groups. Exercise public join, private request approve/reject, invite accept/decline, co-admin promotion, admin transfer, removal, removal appeal, voluntary leave, sole-admin behaviour and 24-hour deletion hold.

For Text, Media, Link and Poll posts, test create/view/comment/react/vote/moderate/delete, duplicate vote/reaction, disabled comments if supported, member/outsider/removed visibility and notification recipients. Verify private content never leaks through search or direct API.

### WF-11 — Blog and Revenue Generator lifecycle

Create a rich draft covering every editor command and supported embed. Branch through:

- self-publish if allowed;
- submit → admin reject → edit → resubmit → approve with points;
- published like/dislike/switch/self-vote, comment and bookmark;
- delete eligibility;
- abandon disclaimer and admin ownership;
- admin takedown/archive behaviour;
- comments disabled;
- malicious HTML sanitisation.

For a Revenue Generator blog, verify ticket auto-creation, marketplace purchase, locked/unlocked reads, grandfathered reader, one-ticket rule, author/Admin split, bookmark/search visibility, account erasure/closure ownership and no content leakage in API responses.

### WF-12 — Gaming Pioneer, election, season and event

Execute the three-set candidacy submission for first season and later-season election, including both funding models and immutability after submit. Run at least three candidates through admin review, paid voting, duplicate/unpaid/late votes, multi-way tie and public Admin tie-break.

Accept Pioneer invitation; branch Independent and Secure funding, three-day deposit, 2.5% disclosure, committee assignment, events/submissions/results, distribution records and 80% total. Exercise mid-season Pioneer departure, forfeiture/return, replacement, season close, deposit-return item and archive. Every time window must use just-before/at/after fixtures.

### WF-13 — Education course to payout

Propose/list a course ticket, purchase/enrol students, test capacity/duplicate/visibility, amend sessions at each SLA boundary, cancel and notify. For an in-person session, generate QR, scan/check in, reject wrong/reused tokens and manually verify. For online, verify join/auto-verification semantics. Trigger auto-end/zero-attendance completion, student→teacher and teacher→student ratings/rewards, payout request/approval and dashboard/report updates.

### WF-14 — Financial donation, investment and sponsorship

- Donation/Grant: declaration → verification → publish donor → donor wall/privacy.
- Investment Option A/B: create → schedule/liability → due → paid; overdue request before/at/after 30 days; 365/730-day/no-compound/negative-offset calculations; multiple investments ordered correctly.
- Sponsorship: create → recognise → partial progress → fulfil; alternative dispute/refund path; condition evidence, notifications and rate/income effects.

### WF-15 — Loan lifecycle

Request with every term/boundary; admin reject and approve branches; verify scheduled three-phase debit rationale and exact day 365/730 boundaries; partial/full repayment; insufficient token/negative balance offset on future purchase; multiple loans processed sequentially; admin restructure/extend if implemented; write-off eligibility and audit. Repeated lazy reads must not double-debit.

### WF-16 — Expenses and Platform Outflow

Create every category/payment-mode combination as Personal expense, verify conditional platform fields, settle with confirm/cancel and reconcile dashboard filters/totals. As Admin create Platform Outflow entries with visible/hidden reason variants; confirm public/read-only ledger privacy and totals. Attempt member creation/edit of Platform Outflow directly.

### WF-17 — Secure and Independent contracts

Run both contract types with Giver A and multiple applicants B/C:

1. create with deadline/budget/conditions;
2. apply with omitted and supplied counter-offer/date;
3. private per-applicant chat and IDOR;
4. request detailed proposal and revise;
5. appoint multiple Takers subject to cap;
6. close applications and expire outstanding applicants;
7. submit work before/at/after deadline;
8. verify completion and payment;
9. rate each direction and award reward;
10. branch cancellation, no response, force close and dispute;
11. exchange party/admin dispute messages and resolve.

For Secure contracts reconcile appointment escrow + listing fee and one-time release. For Independent contracts reconcile direct payment and penalty cascade. Test simultaneous appointment/payment, duplicate button/request, insufficient changed balance, Giver cap 10 and Taker cap 2.

### WF-18 — Notifications, preferences and deep links

Trigger every event enum from its real originating workflow. For each, verify recipient/non-recipient, title/body, sensitive-data minimisation, category, timestamp, unread count, single/read-all, correct member/admin deep link, missing-target handling, preference suppression and no duplicate. Test polling, two tabs and reconnect.

Exercise email/in-app preferences per category and quiet hours, while proving critical security/financial alerts cannot be suppressed and bypass quiet hours. Recheck TR-132’s contract-dispute admin link.

### WF-19 — Admin security and governance

Cover password failure lockout, OTP/recovery/TOTP setup, known-device data, last-login, backup-admin designation/72-hour trigger/vacation pause, privilege boundaries, impersonation visibility and exit, member suspension, config/rate/PTS/wallet changes, all audit logs and all report tabs. Every admin mutation must contain an actor, reason where required, before/after state and must reject ordinary member tokens.

### WF-20 — Search and visibility

Seed uniquely marked Marketplace items, public/private Groups and free/locked/draft/taken-down Blogs. Search by title/body/tag/category/member-like text and every filter. Verify result ranking/sections, debounce, no duplicates, stale record handling and strict exclusion of private posts, non-discoverable groups, drafts, taken-down blogs and locked content for non-purchasers.

---

## 15. Frontend function and backend endpoint inventory plan

### 15.1 Frontend API/query function coverage

At the baseline revision, the following files expose 318 functions. Each exported function must have a ledger row identifying every screen/control caller and the observed runtime request. Hooks in `queries.ts` require separate state testing even when they call the same low-level wrapper because cache keys, enable conditions, invalidation and stale-data behaviour are part of the user experience.

| File | Exported functions | Required focus |
|---|---:|---|
| `activityRewards.ts` | 4 | Catalog, changelog, member activities, activity logging |
| `admin.ts` | 57 | Every admin wrapper; compare against 76 backend endpoints and identify the UI gaps |
| `auth.ts` | 13 | Token replacement, verification/reset/guardian flows, response mismatches |
| `blog.ts` | 15 | Lifecycle, votes, comments, bookmark, archive/review and rich HTML |
| `cart.ts` | 4 | Cart shape, remove, multi-vendor checkout and stale items |
| `client.ts` | 1 | URL construction, auth header, abort/network/error/empty/non-JSON handling |
| `contracts.ts` | 28 | Legacy/current routes, multi-application flows, chat, disputes and payments |
| `declarations.ts` | 5 | Create/list/get/submit/delete |
| `education.ts` | 15 | Course/session/enrolment/check-in/rating/amendment/payout |
| `expenses.ts` | 4 | Filters, creation, settlement and public/admin ledger |
| `financial.ts` | 11 | Donors, investments, overdue, sponsorships and disputes |
| `gamingCommunity.ts` | 6 | Games/groups/join/leave |
| `gamingElections.ts` | 6 | Eligibility, candidates, candidacy and vote |
| `gamingSeasons.ts` | 10 | Seasons/events/funding/ledger/results |
| `groups.ts` | 24 | Full membership, moderation and post/comment/reaction/poll lifecycle |
| `loans.ts` | 3 | Request/list/repay |
| `marketplace.ts` | 13 | Catalog, item, order/sale and fulfilment lifecycle |
| `notifications.ts` | 5 | Inbox/read/preferences |
| `pointsTransfer.ts` | 2 | Instant transfer and passbook; legacy routes are backend-only |
| `profile.ts` | 6 | Profile/lookup/roles/erasure |
| `proposals.ts` | 5 | Member proposal lifecycle |
| `pts.ts` | 4 | Rate, quote, convert, history |
| `queries.ts` | 66 | Query keys, enable conditions, cache isolation, invalidation and retries |
| `search.ts` | 1 | Debounce/filters/visibility |
| `system.ts` | 4 | Config and file upload/delete |
| `tokenSurrender.ts` | 3 | Create/list/detail |
| `wallets.ts` | 3 | Normalisation, individual/all wallets and activity |

For every token-changing operation (`login`, verification/magic login, admin verification/recovery, impersonation, logout and session re-authentication), seed the query cache under Account A, switch to Account B, then verify that Account A’s profile, wallets, orders, private groups, notifications and admin results are neither shown nor acted on. Cached user data must be cleared or safely segregated by identity.

### 15.2 Canonical Xano API group coverage

The 295 count is obtained from actual `query` definitions, not the older API reference. Build the endpoint ledger directly from source at kickoff.

| Group source | Canonical | Endpoints | Principal route/workflow coverage and special focus |
|---|---|---:|---|
| `activity_rewards` | `activity-rewards` | 4 | UI-022, WF-07; catalog version, budget and abuse/repeat |
| `admin` | `EOOlx4pf` | 76 | UI-071–085, WF-19; 2FA, all admin-only actions, raw/unwrapped endpoints |
| `admin_reports` | `admin-reports` | 6 | UI-084; auth, date inputs, totals and privacy |
| `authentication` | `L9PANOan` | 14 | UI-001–007, WF-01–03; enumeration, verification, reset, guardian, rate limit |
| `blog` | `blog` | 20 | UI-057–060, WF-11; lifecycle, rich HTML, votes, bookmarks and raw CRUD exposure |
| `cart` | `O-OY5IE_` | 4 | UI-024–025, WF-09; vendor grouping, stale item, atomic checkout |
| `contracts` | `sXgmF9KL` | 29 | UI-065–069/UI-083, WF-17; current plus deprecated state machines |
| `education` | `education` | 15 | UI-041–046, WF-13; enrollment, QR, amendment, ratings and payout |
| `event_logs` | `7KKtC-3r` | 1 | Cross-cutting; subject isolation, event completeness and sensitive data |
| `expenses` | `XcifSN8G` | 4 | UI-062–064, WF-16; optional query gateway flags, entry-type access |
| `fin_donor` | `fin-donor` | 2 | UI-047–048, WF-14; public wall privacy |
| `fin_invest` | `fin-invest` | 5 | UI-049–050, WF-14; due/overdue schedule and IDOR |
| `fin_sponsor` | `fin-sponsor` | 4 | UI-051–052, WF-14; partial fulfilment and dispute |
| `gaming_community` | `gaming-community` | 6 | UI-035, WF-12; membership/group role |
| `gaming_elections` | `gaming-elections` | 7 | UI-039–040, WF-12; paid vote, uniqueness, timing and tie |
| `gaming_seasons` | `gaming-seasons` | 10 | UI-036–038, WF-12; funding, events, distribution, close/archive |
| `groups` | `BiZZDMxu` | 24 | UI-053–056, WF-10; membership roles, posts, moderation, raw privacy |
| `inr_forms` | `declarations` | 6 | UI-015–016/UI-074, WF-04; public/member heads, ownership and status |
| `loans` | `ZR6bC4we` | 3 | UI-061/UI-076, WF-15; request/list/repay; admin actions reside in Admin group |
| `marketplace` | `EiCwBjsO` | 18 | UI-012/UI-024–027/UI-080, WF-09; stock, escrow, settlement and categories |
| `notifications` | `dID-7x7G` | 5 | UI-033–034, WF-18; defaults, preferences, read state and isolation |
| `point_token_scheme` | `pts` | 5 | UI-023/UI-079, WF-08; live formula, cache, quote and convert |
| `points_transfer` | `points-transfer` | 6 | UI-019–021, WF-06; instant path plus every legacy endpoint |
| `proposals` | `proposals` | 5 | UI-028/UI-075, WF-09; update/withdraw/decision and item creation |
| `search` | `search` | 1 | UI-070, WF-20; content coverage and visibility |
| `system` | `KVaxK9ev` | 3 | Cross-cutting file/config tests; file ownership/MIME/size/delete |
| `token_surrenders` | `token-surrender` | 3 | UI-017–018/UI-074, WF-05; rate snapshot, balance and completion |
| `user_profile` | `_CJw8MFH` | 6 | UI-014/UI-029–032, WF-03; fields, lookup privacy, erasure |
| `wallets` | `wallets` | 3 | UI-010–011/UI-021, WF-04–09/15/17; normalisation, balances and history |
| **Total** | **29 unique groups** | **295** | Every source query must receive a terminal ledger result |

### 15.3 Mandatory case set for each endpoint

The minimum endpoint case IDs are:

| Suffix | Case |
|---|---|
| `-HAPPY` | Valid request in each allowed state/actor |
| `-NOAUTH` | No token |
| `-BADTOKEN` | Malformed/expired token |
| `-ROLE` | Wrong role/function-level authorisation |
| `-IDOR` | Another member’s valid object |
| `-NOTFOUND` | Missing/deleted/malformed ID |
| `-REQ-*` | Omit each required field separately |
| `-OPT-*` | Omit and null each optional field separately |
| `-TYPE-*` | Wrong type/enum/date/foreign key |
| `-BOUND-*` | Exact and outside numeric/string/list boundaries |
| `-STATE-*` | Every invalid lifecycle state |
| `-REPLAY` | Repeat after success |
| `-RACE` | Bounded concurrent conflict |
| `-IDEMP` | Same/different idempotency keys where relevant |
| `-SCHEMA` | Full success/empty/error response contract |
| `-SIDEFX` | Data, wallet, notification, email and audit reconciliation |

An endpoint can legitimately have dozens of rows. Do not compress `-REQ-*` into “validation tested” when the endpoint has several independent inputs.

### 15.4 Reusable Xano functions

| Function source | Runtime proof required |
|---|---|
| `admin_audit.xs` | No physical call sites were found. Classify as dead duplicate; compare its contract with `log_admin_action` and do not claim runtime Pass |
| `check_rate_limit.xs` | Three call sites: signup, guardian registration and resend verification. Test each; compare absence from transfer/vote/application/rating limits to SRS §2.4 |
| `create_declaration.xs` | Four logical endpoint paths (six physical aliases). Exercise every declaration head, optional data and unauthenticated/member constraints |
| `emit_notification.xs` | 53 calls across 39 files. Trigger every event enum with missing/default/custom preferences, critical bypass and duplicate prevention |
| `idempotency_lookup.xs` | Four endpoint families. New, repeated, expired/colliding key; same key/different body/user must not return an unrelated result |
| `idempotency_store.xs` | Four endpoint families. Store exactly once only after atomic success; failed operations must not poison retries; verify uniqueness race |
| `log_admin_action.xs` | 43 calls. Representative mutation from every admin module, sensitive-data review and seven suspected parameter-contract mismatches |
| `mutate_wallet.xs` | 98 calls across 38 endpoint files. Credit/debit, insufficient funds, precision, concurrent calls, surrounding-domain rollback and ledger reference |
| `mutate_wallet_unchecked.xs` | Nine calls across four files. Prove ordinary callers cannot reach it and negative balance occurs only in explicitly designed loan/penalty flows |
| `pts_compute_rate.xs` | Five calls. Component fixtures, absent cache, floor, `P_net`, liabilities, timestamp units, idle time and theta secrecy |
| `quick_start/enforce_role.xs` | 79 calls. Test role/role_flags mismatch, suspended/erased state, MFA provenance and unknown roles; hierarchy currently recognises only admin/member |
| `quick_start/generate_magic_link.xs` | One call. Reset link generation, entropy, expiry, single use, state-changing GET implications and no token disclosure |
| `quick_start/log_event.xs` | Three calls. Representative member/security events, field-name compatibility and privacy |
| `require_admin.xs` | No physical call sites were found. Classify dead; specifically compare its role-flag behaviour with live `enforce_role` |
| `wallet_mutate.xs` | No physical call sites were found and static review indicates unsafe stub behaviour. Classify dead/unsafe; do not execute against production data |

Generate the call-site map with targeted searches for the function name and `function.run`/function invocation syntax. Every function needs at least one success and one relevant failure per distinct behaviour. If it has no reachable caller, that is a coverage result and a dead-code/security-maintenance finding—not a pass.

---

## 16. Data model and integrity coverage

All 93 table definitions must be entered into the data section of the coverage ledger. For each table record:

- intended owner/module and SRS reference;
- create/read/update/delete endpoints;
- authentication/ownership;
- foreign keys and orphan policy;
- uniqueness and indexes;
- status enum and transition owner;
- personal/sensitive fields;
- financial/audit retention;
- archive/erasure behaviour;
- test rows and cleanup.

### 16.1 Identity, security and privacy tables

Cover `user`, verification/reset data embedded in user, `email_verification_tokens`, `mobile_otps`, `guardian_approvals`, `rate_limit_counters`, `data_erasure_requests`, `admin_totp`, `admin_mfa_challenges`, `admin_login_events`, `admin_audit_log`, `event_log` and `idempotency_keys`.

Required invariants include unique email/public Member ID, password/OTP secrecy, expiring one-time tokens, rate-counter isolation, no duplicate approved minor, admin lockout/recovery correctness and anonymisation without reversible identity joins.

### 16.2 Wallet/economy tables

Cover `wallets`, `wallet_transactions`, `ledger`, `points_ledger`, `points_transfers`, `points_minting_budget`, `points_minting_log`, `activities`, `activity_catalog`, `activity_catalog_changelog`, `pts_components`, `pts_rate_cache`, `pts_rate_current`, `pts_rate_history`, `pts_conversions`, `rate_announcements`, `declarations` and `token_surrenders`.

Required invariants include exactly one wallet of each type per member, immutable balanced ledgers, correct currency precision, reference integrity, budget/version history, rate snapshots, no duplicate conversion/transfer and one-time form state transitions.

### 16.3 Marketplace/content/community tables

Cover `categories`, `marketplace_items`, `carts`, `cart_items`, `orders`, POD/dispute/settlement/proposal tables, Blog core/reader/vote/comment/bookmark tables, member group/membership/invite/post/comment/reaction/poll tables and Gaming group/membership tables.

Required invariants include category depth/cycle prevention, nonnegative stock, one vendor per cart, order snapshot stability, escrow references, unique reader/vote/bookmark/poll rows, private visibility, one active membership per group/member and deletion/abandonment retention.

### 16.4 Sector workflow tables

Cover games, candidates, elections/votes, seasons/funding/committee/events/submissions/results/distributions; courses/amendments/sessions/enrollments/ratings; donors/investments/payouts/overdue/sponsorship/refund/recognition/dispute; loans/debits/repayments; expenses; contracts/applications/application messages/disputes/dispute messages/ratings.

For each state machine, verify no illegal transition can be written through any endpoint and that all denormalised counts/totals equal their source rows after concurrent actions.

---

## 17. Non-functional, resilience and integration plan

### 17.1 Performance

Measure both local and Vercel builds:

- initial JavaScript/CSS/font/image transfer and parse/execute cost;
- route transition and interaction response, targeting the SRS’s 300 ms standard-connection expectation;
- Core Web Vitals on login, home, marketplace, rich Blog detail, Group detail, Contract detail, Admin reports and long lists;
- API p50/p95/max for representative public reads, authenticated lists, wallet checks and mutations;
- Xano free-tier cold-start behaviour;
- search debounce/request count;
- notification polling overhead;
- large list/editor/render cost;
- service-worker precache and update payload.

Run build bundle analysis. The current single minified JavaScript asset is about 2.04 MB (about 503 KB gzip) and already crosses Vite’s chunk warning. Record a performance defect if measured user impact or release budgets fail; recommend route-level code splitting based on evidence.

Do not run an uncontrolled load test against the live free-tier backend. Concurrency tests should use the smallest request set that demonstrates race safety. Obtain explicit approval before sustained load/availability testing.

### 17.2 Network and failure recovery

Test offline before navigation, offline after data load, request timeout, DNS/5xx simulation, aborted navigation, slow 3G-like conditions and recovery. Verify:

- safe cached PWA shell versus misleading stale business data;
- forms retain data;
- retries do not duplicate mutations;
- errors distinguish connectivity from validation;
- service-worker cache does not serve one member’s private API data to another;
- refresh and cross-tab behaviour are coherent.

### 17.3 PWA

Validate manifest names/icons/maskable icons/theme/display/start URL, install prompt/banner dismissal, standalone shell, safe areas, offline launch, service-worker registration/update/activation, old chunk cleanup, deployed-version refresh and notification of an available update. Test logout/account switch in installed mode.

Deliberately activate a new service-worker version while a declaration upload/submission, Contract form, Blog RichEditor draft and one financial mutation are dirty or pending. The `autoUpdate`/`skipWaiting`/`clientsClaim` behaviour must not erase input, silently reload, duplicate a committed action or leave old/new chunks mixed.

### 17.4 Browser/device compatibility

Minimum release matrix:

- current Chrome/Chromium desktop;
- current Safari desktop;
- Firefox desktop;
- iOS Safari on a physical supported iPhone;
- Android Chrome on a physical phone;
- installed iOS/Android PWA where supported.

Repeat critical money, editor, modal, file, QR, Back/Forward and session flows on each. Do not infer Safari correctness from Chromium.

### 17.5 Email

For verification, guardian, reset, admin OTP and representative notifications verify:

- correct recipient and no unintended CC/BCC;
- sender identity, subject, plain/HTML readability;
- no password/token in logs or nonessential content;
- link origin/path/encoding and expiry;
- mobile layout and accessible link text;
- duplicate suppression;
- preference and quiet-hour behaviour;
- delivery latency, spam placement and bounce/failure handling.

The Xano free-plan sandbox limitation must be recorded separately from application logic.

### 17.6 Cloudinary/file integration

Use generated clean and malicious fixtures:

- valid PNG/JPEG/WebP/PDF at small/near-limit sizes;
- zero-byte, oversize, renamed MIME, SVG/HTML and corrupted files;
- unsafe filename and repeated filename;
- upload cancel/retry;
- preview/load/delete;
- ownership/IDOR;
- private data in URLs/metadata;
- rich-editor transformations and persisted reload;
- orphan cleanup after form cancel/blog delete.

Verify the unsigned preset is restricted enough for the intended threat model and no secret is shipped in the frontend.

### 17.7 Visual regression and design tokens

Capture deterministic screenshots for every route/state at 360 px and the representative tablet/desktop matrix. Compare:

- typography, colour, spacing, radii, shadows and status semantics;
- clipped/overlapping controls;
- fixed nav/header/modal layering;
- error/success/warning colours;
- chat bubbles, rich editor, contract/admin panels and disabled states.

Source inspection currently finds 25 CSS custom properties referenced but not defined in `FrontEnd/src`, including surface, status, radius, typography and violet tokens. Treat every affected visual as a specific runtime hypothesis: use computed-style inspection to prove whether a fallback/inheritance makes it acceptable or a declaration is silently dropped.

---

## 18. Risk-led tests discovered during codebase review

These are test hypotheses, not automatically closed defects. Reproduce them safely and link to an existing TR row or create the next ID.

| Risk | Evidence location | Required runtime test |
|---|---|---|
| Admin 2FA provenance may be bypassed | Ordinary member `POST /login` issues a normal user JWT for any valid account; most admin endpoints authorise by re-reading `user.role`, while the 2FA flow separately checks `role_flags.is_admin` | With the disposable admin, obtain an ordinary-login token and call a harmless read-only admin endpoint. If accepted, log Critical and do not perform admin mutations until the model is fixed |
| `role` versus `role_flags` split-brain | Admin 2FA and downstream admin role enforcement use different fields | Build all four safe combinations on disposable users if possible; every route must use one authoritative role plus MFA provenance |
| Suspended/erased/unverified sessions may remain valid | Login has no visible suspended/erased/email-verified guard; admin erasure anonymises/suspends but does not visibly revoke password/tokens | Test existing and new tokens before/after suspension, erasure and verification change; an erased account must not log in using a predictable anonymised address |
| Password reset authorisation may be too broad | Reset update endpoint appears to accept any authenticated user token rather than proving reset-session provenance; reset request is a state-changing GET | Call update-password with an ordinary disposable member session, verify current-password/reset provenance and token revocation; inspect reset link origin and enumeration behaviour |
| Guardian-approved account setup mismatch | Approval writes a setup token to email-verification storage but instructs use of the magic-link reset endpoint; the created user lacks an obvious password/public Member ID assignment in that flow | Execute approval end to end through the emailed instructions and verify a usable, uniquely identified account can be set up exactly once |
| Public message/welcome-email abuse | A public endpoint accepts a user ID and exposes distinct missing-user behaviour | Test rate limit, recipient control, enumeration and unauthorised email generation with a disposable address only |
| Stored XSS through trusted rich HTML | `PostCard`, Blog detail/admin review, Contract detail/admin dispute use `dangerouslySetInnerHTML` | Persist harmless marker and safe XSS probes in every authoring surface; verify sanitisation on write and render, event/URL blocking and cross-role display |
| Risky embedded HTML sandbox/CSP | Rich editor embeds use `srcDoc` with `allow-scripts allow-same-origin`; no explicit CSP found in app HTML/config | Test script/network/storage/top-navigation attempts from stored embed; inspect deployed response headers and origin isolation |
| Cross-account stale Query cache | Several token replacements do not centrally clear/identity-scope the TanStack Query cache | Seed Account A private queries, login/re-authenticate/impersonate as B, navigate before refetch and attempt actions |
| Undefined design tokens | 25 referenced CSS custom properties lack definitions | Computed-style and screenshot check of every affected component/state |
| Credential material in tracked/historical documentation | Source review found working-account references and a partial external-service key in project docs/history | Do not print values; verify Git history exposure, rotate/revoke as needed, remove secrets from tracked docs and test scanners |
| No CSP/security-header baseline | No CSP declaration found in frontend source; deployment headers not yet audited | Inspect Vercel headers and exercise XSS/embed/file risks before deciding policy |
| Frontend/backend coverage mismatch | 57 admin wrappers versus 76 admin endpoints; older API reference lists fewer endpoints than current source | Call every backend-only endpoint and classify intended/internal/dead/exposed |
| Optional Xano parameters may be gateway-required | Live public `GET /contracts` without filters returned `400 Missing param: contract_type` despite optional documentation | Omit each source-optional input on all 295 endpoints and compare live gateway metadata/source |
| Large monolithic frontend bundle | Build emitted about 2.04 MB JavaScript and a chunk-size warning | Measure route startup and editor/admin parse cost on mobile/slow network |
| Wallet currency enum mismatch | Wallet table stores lowercase `inr/token/points`, while several profile/surrender/admin/report endpoints compare or accept uppercase product labels | Compare each wallet/profile endpoint and safely execute surrender/declaration/admin adjustments on disposable wallets; reject any false zero or guaranteed “wallet not found” path |
| PTS conversion arithmetic appears inconsistent with SRS | Rate function computes `R_user = 10/r_published`, while quote/convert use `r_published` directly as the conversion multiplier/divisor | Use the SRS worked examples and independent decimal calculations; do not run a value-moving conversion until quote math is correct and Admin liquidity is protected |
| Cart mixes currencies and lacks cart-wide atomicity | Checkout aggregates all lines, remembers the last currency, then wraps each item in a separate transaction | Create same-vendor mixed-currency fixtures and force a later-line failure; no wrong-currency debit or partial earlier order may survive |
| Education/Marketplace payout double-spend risk | Static flow review suggests course payout may count unsettled orders and mint credits without consuming escrow while Marketplace can settle the same order | Use the smallest disposable course purchase, capture escrow/all wallets and test payout/settlement order in both sequences |
| Legacy and current Contract engines coexist | Contract-level assign/release/dispute endpoints remain beside the newer multi-application/appointment flow | Call legacy paths only on disposable contracts; prove they cannot bypass detailed proposal, escrow, cap, per-application dispute or inflate supply |
| Gaming lifecycle may be impossible or weakly constrained | Static inventory found no clear winner→season/event creation/open path and weak repeat/result/tie state checks | Trace the full state graph before mutation, then execute with three disposable candidates and events; classify every unreachable transition |
| Mutating GET/lazy-read races | Loan, order, election, course, session, group, season and wallet reads can change state | Send two bounded simultaneous reads at every boundary; state and side effects must advance once |
| Missing transactions/uniqueness | Static inventory found many multi-record writes without endpoint-level transactions and key tables without obvious uniqueness constraints | For each such endpoint run failure/race/replay cases and inspect orphan/duplicate rows; prioritise wallets, memberships, enrollment, ratings and settlements |
| Audit calls may fail after mutation | Several admin flows appear to call `log_admin_action` with names that do not match the function input contract | For each, compare response, mutation and audit row; a mutate-then-500/no-audit outcome is Critical/High |
| Notification preferences only partially enforced | Helper appears focused on global in-app preference with no complete per-event/email/quiet-hours dispatch path | Trigger every category under each preference combination and inspect both notification row and mailbox |
| Admin reports may use stale/nonexistent fields | Static review identified suspicious activity, wallet, marketplace and gaming filter/aggregate field names | Seed known small datasets, calculate expected values independently and reconcile every report total |
| Non-semantic clickable cards | Reusable `Card` always renders a `div`; many screens attach navigation/action handlers | Keyboard/assistive-technology activation audit on every clickable card; no `div` may be the only path to an action |
| Incomplete tab semantics | `Tabs` exposes tabs but no controlled panels/roving keyboard model | Test Arrow/Home/End navigation, focus, `aria-controls`/tabpanel association and selected content |
| Modal/focus failures | Session expiry, Group/session overlays and Blog lightbox lack a complete dialog/focus model | Keyboard/screen-reader test for trap, background inertness, Escape/cancel, announcement and focus return |
| Nested shells/scroll containers | Guardian confirmation and several notification/gaming screens nest phone/screen containers | Test double padding, nested scrolling, sticky content and 320–600 px breakpoint boundaries |
| Admin Blog long-content scroll gate | Review screen observes window scroll while the stack screen is the likely scroll container | Open a very long review and prove moderation controls unlock using normal scrolling |
| Error white-screen risk | No app-level React error boundary was found | Inject controlled component/data-shape failures and verify whether the entire app becomes unrecoverable — **Resolved 2026-07-22 (FIX_PLAN.md Phase 3, Cluster F3b)**: added a root-level `ErrorBoundary` plus a React-Router `errorElement` (the latter is what actually catches route-screen render errors — the data router intercepts them before the outer boundary). Proven live via a deliberately-injected synthetic throw: the app renders a friendly "Something went wrong / Reload" fallback instead of a blank white page or React Router's default developer error page. This also closed the whole TR-184/195/196 envelope-crash family it was meant to backstop. |
| Deep-link Back behaviour | Shared Back control uses history `-1` | Open every stack route in a fresh tab and verify Back stays within a safe app destination |
| Fresh idempotency keys on retry | Several logical actions appear to generate a new key per invocation/render | Simulate a committed response lost to the client, retry the same intent and reconcile for duplicate transfer/order/conversion/deposit/repayment |
| Autosave/account leakage | Blog draft storage keys appear record-based rather than user-scoped | Save draft as A, switch to B on the same browser, and verify no content is disclosed or submitted |
| Role checks may be global rather than resource-scoped | Education and Gaming controls often key off global role flags | Teacher/Pioneer for unrelated course/season must not see or successfully use owner controls |
| Private dispute-thread leakage | Contract dispute UI fetches a message set and filters threads client-side | Inspect the raw response as each party; the opposite private admin thread must never be delivered |
| Public-versus-auth route drift | Several public API-backed/content areas sit below `RequireAuth` | Run anonymous UI/API pairs for Blog feed, games/game groups, seasons/events, donors, sponsorships, overdue count, member reputation and Platform Ledger; record an explicit SRS/product decision for each |
| Dead Admin navigation | Dashboard source links Audit Log to `/admin/audit`, but the router has no such route | Click the real tile and verify the wildcard redirect; link an existing defect or create one |
| Marketplace buyer-information bypass | Buy Now validates dynamic buyer schema, while Add to Cart/Cart currently appear not to capture it | Create an item with every required field type; compare both purchase paths and inspect the final order. Checkout must not lose or bypass required buyer data |
| Declaration client orchestration is non-atomic | Frontend independently uploads, creates a draft and submits it | Fail after each step and retry the same logical intent; verify no orphan file, duplicate declaration or double submit |
| Gaming Secure deposit may always send zero | Season UI currently appears to invoke the deposit mutation with literal `0` and no amount control | Inspect the real payload and outcome in the smallest disposable Secure season; the UI must collect/derive and disclose the correct deposit |
| Event required-checkbox/duplicate submission weakness | Dynamic checkbox values and missing existing-submission/status gates may allow unchecked required fields and repeated rows | Toggle required checkbox on→off, submit; refresh/resubmit; repeat before/after valid event states and verify one authorised submission |
| Admin Loans may show only Admin’s personal loans | Screen appears to use the member `useMyLoans` query rather than a global admin queue | Seed member loans; Admin must find and action them with member context. An empty/self-only result is not a pass |
| Admin Config overwrite risk | Screen appears to initialise hard-coded defaults rather than fetch current live configuration before save | Record current config, open/reload/edit one field and inspect payload; untouched settings must be preserved and concurrency detected |
| Missing Admin governance screens | Router has no dedicated Admin Gaming, Education or Group-moderation surfaces despite planning claims; several exported admin wrappers are unused | Map every SRS Admin action to a reachable control. Test admin wallet mint, education list/amend/payout, item moderation/individual settlement and sponsorship refund directly and classify missing UI |
| Admin second-factor contradiction | Setup copy references TOTP/future login behaviour while the current login screen uses email OTP/recovery | Complete setup on disposable admin, log out and log in again; prove the factor actually enforced and reconcile SRS, UI copy and backend |
| Contract status/control vocabulary split | Legacy contract-level actions and new per-application actions coexist; source uses variants such as `force-closed` and `force_close_requested` | Reconcile every visible mark-complete/release/dispute/escalate/force-close/rate control for every status/application; no duplicate/conflicting financial path |
| Session-expiry retry ambiguity | A 401 clears the token and overlays re-authentication, but the failed request is not automatically retried | Test ordinary reads and mutations, including committed-but-response-lost cases; UI must clearly show outcome and allow exactly one safe retry |
| Order terminal-state controls may remain visible | Detail predicates may expose Receive/Dispute/Settlement actions after dispute or settlement; POD proof and note may both be blank | Build a complete role×status visible-control matrix, then call each forbidden transition and prove backend rejection with zero side effects |
| Declaration lifecycle may be unreachable | Static review indicates create always writes `draft`, submit requires `pending` but does not transition, and Admin review also requires `pending` | Create through every public/member path, submit and inspect status; prove at least one valid declaration can reach review without metadata seeding |
| Proposal change-request may be terminal | Member PATCH appears to preserve `changes_requested`, no resubmit endpoint is evident, and Admin decision accepts only `submitted` | Execute request changes → edit → resubmit through UI/API; the proposal must return to an actionable Admin queue |
| Backup Admin has no activation path | Designate/status endpoints exist, but no clear role/token activation endpoint; ordinary Admin login may not refresh inactivity | Trigger just-before/at/after inactivity and vacation conditions with disposable admins; prove a valid activation/login and automatic deactivation/recovery path |
| Time/config records may be write-only | Rate announcements, several settlement/refund/audit records and `pts_rate_cache` appear not to have corresponding reads/application logic | Create only in a controlled rollback window and prove the documented feature actually consumes/exposes the record exactly once |
| Incomplete resolution/setup paths | Sponsorship dispute, investment overdue request and mobile OTP verification lack an evident Admin resolution/OTP issuance counterpart | Execute complete user journey; classify missing terminal/issuance states instead of stopping at record creation |
| Non-token Marketplace flows may settle in Token | Purchase maps item currency, while cancellation/refund/settlement paths appear hard-coded to token in several endpoints | Run INR, Points and Token orders with minimal balances through every terminal branch; all reversals/splits must use the original order currency |
| Repeatable activity/reward farming | Activity rows lack obvious member/code/entity uniqueness; promotional budget may default open when no row exists; raw Blog dislike CRUD compounds the risk | Repeat the same activity/vote entity and race calls under missing/zero/exact budgets; award once only and enforce budget |
| Admin member endpoint may expose secrets | Member list appears to return raw unpaged user rows rather than the defensive shape used by `/me` | Use test members and inspect keys only; password hashes, reset tokens, device/IP and other unnecessary sensitive fields must be absent |
| System configuration fields may not exist in schema | Blog reward/split/slot inputs used by endpoints/Config appear absent from `system_config` table | Compare live schema, GET and PATCH; a partial update must not error or silently leave hard-coded defaults |
| Divergent same-GUID financial sources | Resolved during 2026-07-19 preflight: 14 short-path aliases were consolidated into Xano's normalized `financial_*` paths; three intended fixes were pushed and a final 436-document pull matched local byte-for-byte | Revalidate anonymous/member investment and sponsorship creation plus nonzero overdue deduplication during the financial phase; see `XANO/LIVE_SYNC_STATUS.md` |

Known open/deferred items TR-132 and TR-137–145 must be included in the revalidation pass. Do not spend time rediscovering them without linking the existing row.

---

## 19. Requirements traceability map

| SRS area | Primary routes | Workflows | API/data focus |
|---|---|---|---|
| §2 Member Management | UI-002–009, UI-014, UI-029–032, UI-073 | WF-01–03 | Auth, profile, guardian, admin member/security tables |
| §3 Wallet | UI-010–018, UI-074, UI-078 | WF-04–05 | Wallets, declarations, surrenders, rates and ledgers |
| §4 PTS | UI-023, UI-079 | WF-08 | PTS group/function/components/conversions/cache/history |
| §5 Points Economy | UI-019–022, UI-078 | WF-06–07 | Transfers, awards, budgets, activity catalog/passbook |
| §6 Marketplace | UI-012, UI-024–028, UI-075, UI-080 | WF-09 | Marketplace/cart/proposals/orders/escrow/categories |
| §7 Groups | UI-053–056 | WF-10 | Groups/members/invites/posts/comments/reactions/polls |
| §8 Blog | UI-057–060, UI-081–082 | WF-11 | Blog lifecycle/engagement/readers/RG tickets |
| §9 Loans | UI-061, UI-076 | WF-15 | Loans/debits/repayments/admin decisions |
| §10 Expenses | UI-062–064 | WF-16 | Expenses and platform ledger |
| §11 Gaming | UI-035–040 | WF-12 | Games/elections/seasons/events/funding/distribution |
| §12 Education | UI-041–046 | WF-13 | Courses/sessions/enrollments/QR/ratings/payout |
| §13 Financial | UI-047–052, UI-077 | WF-04, WF-14 | Donors/investments/sponsorships/declarations |
| §14 Contract | UI-065–069, UI-083 | WF-17 | Contracts/applications/chat/dispute/rating/wallet |
| §15 Admin | UI-001, UI-071–085 | WF-19 and admin steps in all suites | Admin/Reports groups, audit, RBAC, 2FA/backup |
| §16 Notifications | UI-033–034 plus every source route | WF-18 | Notification function/table/preferences/email |
| §17 NFR | All | All plus §17 suites | Security, performance, integrity, audit, DPDP, search |
| Appendix A | UI-022/UI-078 | WF-07 | Activity catalog/version/reward values |

---

## 20. Multi-session execution order and checkpoints

The suite is too broad to treat as one uninterrupted browser script. It must nevertheless remain one continuous coverage ledger.

1. **Phase 0 — Preflight and immutable baselines:** access, code/test/build, inventory, known issues, accounts, wallets, configuration, rate and production parity.
2. **Phase S0 — Security/integrity quarantine gate:** reproduce the read-only or minimum-value hypotheses in §18, beginning with admin-MFA provenance, suspended/erased access, wallet currency shape, PTS quote arithmetic and cache isolation. Do not proceed to broad Admin or financial mutations while any test indicates unauthorised privilege or unexplained value movement.
3. **Phase 1 — Security-first authentication:** WF-01–03, UI-001–009/UI-014/UI-029–032, token/cache isolation, Terms/Privacy and stored-XSS smoke. Stop only for a credible active compromise or destructive-data risk.
4. **Phase 2 — Core economy:** UI-010–023/UI-074/UI-078–079; WF-04–08; complete financial reconciliation before continuing.
5. **Phase 3 — Marketplace:** UI-012/UI-024–028/UI-075/UI-080; WF-09 including RG linkage.
6. **Phase 4 — Groups and Blog:** UI-053–060/UI-081–082; WF-10–11 and the deep XSS/visibility suite.
7. **Phase 5 — Gaming and Education:** UI-035–046; WF-12–13 including time-bound and actual-device QR tests.
8. **Phase 6 — Financial, Loans and Expenses:** UI-047–052/UI-061–064/UI-076–077; WF-14–16.
9. **Phase 7 — Contracts:** UI-065–069/UI-083; WF-17 for both types, multiple takers and every terminal branch.
10. **Phase 8 — Notifications, Search and remaining Admin:** UI-033–034/UI-070–085; WF-18–20; all reports/config/security.
11. **Phase 9 — Backend-only/dead/legacy sweep:** close every remaining endpoint/function/table row not reached by UI workflows.
12. **Phase 10 — Non-functional/device/integration:** accessibility, visual, compatibility, PWA/offline, performance, headers/security, email, files/Cloudinary and controlled concurrency.
13. **Phase 11 — Retest and final traceability:** retest fixes, production parity, cleanup, residual risk and release report.

At least every ten completed cases, after every defect, before changing persona and before context/session end:

- write the last completed and exact next case ID;
- record current route/persona/fixture state;
- record open browser/server processes;
- record new TR IDs and blockers;
- save fixture IDs and cleanup state;
- update route/API/function/workflow completion counts.

Never report “module complete” from memory. Compute it from zero `Not run` rows for that module.

---

## 21. Final report contents

The final testing report must include:

- executive release recommendation;
- exact source/deployment revisions and test dates;
- access limitations;
- SRS requirement traceability totals;
- route/control/frontend-function/backend-endpoint/function/workflow totals by result;
- defects by severity/module/status;
- known accepted SRS deviations;
- financial reconciliation summary;
- security/privacy/accessibility/performance/device findings;
- email/Cloudinary/PWA/QR evidence;
- untested/blocked items with owners;
- fixture cleanup report;
- regression automation candidates;
- a signed-off list proving that every route and callable endpoint has a terminal result.
