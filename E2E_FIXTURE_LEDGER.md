# VGC E2E Fixture and Cleanup Ledger

**Run:** `E2E-20260719-01`
**Rule:** only disposable records bearing this run marker may be used for destructive, security, concurrency, financial, erasure, suspension, impersonation or cleanup tests.

## Test-account personas

Use Gmail plus-address aliases unique to this run. Store credentials only in the approved local secret mechanism; never place passwords, OTPs, magic tokens or bearer tokens in this file.

| Persona ID | Persona | Purpose | Account/member ID | Email alias label | Initial roles/states | Initial wallet IDs/balances | Status |
|---|---|---|---|---|---|---|---|
| P-001 | Adult A | Primary member/buyer/giver/author/group admin | Pending reconciliation/creation | — | — | — | Not started |
| P-002 | Adult B | Counterparty/seller/taker/commenter/invitee | Pending reconciliation/creation | — | — | — | Not started |
| P-003 | Adult C | Unrelated third party for IDOR | Pending reconciliation/creation | — | — | — | Not started |
| P-004 | Unverified member | Verification and capability matrix | Pending reconciliation/creation | — | — | — | Not started |
| P-005 | Verified without mobile | Mobile-gated wallet activity | Pending reconciliation/creation | — | — | — | Not started |
| P-006 | Suspended member | Login/API enforcement | Pending reconciliation/creation | — | — | — | Not started |
| P-007 | Guardian | Minor approval workflow | Pending reconciliation/creation | — | — | — | Not started |
| P-008 | Minor approved | Approved-minor workflow | Pending reconciliation/creation | — | — | — | Not started |
| P-009 | Minor rejected/expired | Rejection and lazy expiry | Pending reconciliation/creation | — | — | — | Not started |
| P-010 | Teacher | Course/session management | Pending reconciliation/creation | — | — | — | Not started |
| P-011 | Student | Enrollment/check-in/rating | Pending reconciliation/creation | — | — | — | Not started |
| P-012 | Pioneer candidate A | Election candidate/voter | Pending reconciliation/creation | — | — | — | Not started |
| P-013 | Pioneer candidate B | Election candidate/voter | Pending reconciliation/creation | — | — | — | Not started |
| P-014 | Pioneer candidate C | Election tie/limits | Pending reconciliation/creation | — | — | — | Not started |
| P-015 | Test admin | Admin UI/API; never substitute owner for destructive cases | Pending reconciliation/creation | — | — | — | Not started |
| P-016 | Backup admin candidate | Designation/vacation/inactivity | Pending reconciliation/creation | — | — | — | Not started |
| P-017 | Direct minor-bypass probe | Prove server-side guardian-flow enforcement | User 48 / `VGC48` (deleted) | Run-marked `@example.com` alias | DOB age 14; unverified; backend returned `is_minor:false`; no guardian link | Wallet rows 75–77, all zero (deleted) | Completed and cleaned |

## Created domain records

| Fixture ID | Type | Runtime record ID | Creator persona | Marker/title | Purpose/target state | Mutations performed | Deletable | Cleanup status/evidence |
|---|---|---|---|---|---|---|---|---|
| FX-001 | Minor-bypass user | User 48 / `VGC48` | P-017 | `E2E-20260719-01 Minor Bypass` | Direct `/signup` with under-18 DOB | Created user + INR/token/points wallets; no other dependent rows | Yes | User and wallet rows deleted; exact re-query zero |

## Financial snapshots

| Snapshot ID | Workflow/case | Persona/admin wallet IDs and balances | PTS rate/components | Latest ledger/passbook IDs | Idempotency key label | Before/after reconciliation | Result |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | No financial mutation performed | Not started |

## System-wide configuration snapshots

| Setting | Before value/evidence | Temporary value | Authorised window | Restored value/evidence | Status |
|---|---|---|---|---|---|
| PTS rate/theta/reserve/budgets | Not read yet | No change authorised | — | — | Untouched |
| Vacation mode | Not read yet | No change authorised | — | — | Untouched |
| Cloudinary preset | `vgc_blog`: unsigned; overwrite false; no explicit format/size/dimension/folder/moderation/access/transform restrictions | No change authorised | — | — | Read-only snapshot complete; hardening defect logged |

## Synthetic file fixtures

| File ID | Type/size | Safe contents | Created | Uploaded record IDs | Cleanup |
|---|---|---|---|---|---|
| FILE-001 | PNG, valid small | Visible `E2E-20260719-01` marker | Pending | — | — |
| FILE-002 | PDF, valid small | Synthetic text and `E2E-20260719-01` marker | Pending | — | — |
| FILE-003 | TXT renamed as image | Synthetic invalid-MIME case | Pending | — | — |
| FILE-004 | Oversize boundary fixture | Repeated synthetic bytes only | Pending | — | — |

## Cleanup checkpoints

| Checkpoint | Local time | Active fixture count | Deleted | Retained with reason | Orphans/financial residue | Result |
|---|---|---:|---:|---|---|---|
| CL-001 | 2026-07-19 | 0 | 0 | None | None created | Pass |
| CL-002 | 2026-07-19 22:15 | 4 rows | 4 | None | No email token, notification, guardian approval or rate counter; exact user/wallet re-query zero | Pass |
