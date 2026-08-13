# Change Plan — 2026-08-12

Four changes requested by the owner, analysed against the live workspace
(`161992`) and the tracked trees. Each section states what was found, what the
new rule is, and what has to move.

Decisions taken by the owner are marked **[owner]**.

**Status: all four shipped and verified.** Items 2 (INR wallet), 3 (contracts)
and 4 (PTS rate) on 2026-08-12; item 1 (sector home screen) on 2026-08-12,
deployed as `cf1a56c`. The plan below is kept as written for the record —
where the built thing differs from the plan, a **Built as** note says so rather
than the prose being edited to match.

---

## 1. Sector home screen — DONE

> **Built as.** Three departures from the plan below, all decided while
> building:
>
> 1. **Community gave up its tab slot to Home; the tab count stayed at four.**
>    The plan said only that Home becomes the landing tab. `tabs.test.ts`
>    asserts exactly four tabs, and Community is a *Gaming* feature — an
>    Education member had a permanent tab for a section their Home
>    deliberately does not surface. Wallet, Market and Profile are core, so
>    they are the right three to be sector-independent. `/community` keeps its
>    route and moved into the stack layout, giving up the greeting, the
>    member-name heading and the install banner along with the landing slot.
> 2. **Events, Elections and Sessions have no row.** None of the three has an
>    index route — they live inside a Season, a Game and a Course
>    respectively. Their parent row names what it contains instead. SRS §2.6.2.
> 3. **`lib/sectors.ts` holds one list carrying both vocabularies**, flagged
>    per entry, rather than a bare sector array: the content tag also has
>    Financial and General, which no member can hold as an interest. SRS
>    §2.6.5.
>
> Specified in SRS §2.6. The non-enforcement rule is §2.6.3 and is written as
> a functional requirement, because a reader who assumes a sector filter is a
> permission check would build a server-side gate the platform does not have.

### What exists

There is no home screen. `FrontEnd/src/routes/tabs.ts` documents its removal on
2026-07-31 — every destination on it already existed elsewhere, so deleting it
removed a tab without removing a destination. The landing route is
`/community`.

`sector` already exists as a free-text field on `contracts`, `blogs`,
`marketplace_items` and `sponsorships`, and as a filter on Blog, Search and
Admin Blog. The vocabulary is inconsistent and hardcoded in five places:

| file | values |
|---|---|
| `features/blog/BlogFeedScreen.tsx` | `'' Gaming Education Financial General` |
| `features/blog/WriteBlogScreen.tsx` | `Gaming Education Financial General` |
| `features/search/SearchScreen.tsx` | `'' Gaming Education Financial General` |
| `features/admin/AdminBlogScreen.tsx` | `'' Gaming Education Financial General` |
| `features/market/ProposeItemScreen.tsx` | `Gaming Education Financial General` |

There is no `Farming`, and `user` has no interest column.

### New rule **[owner: filter, not lock]**

A member picks exactly one interest — Gaming, Education or Farming — stored on
their profile and changeable at any time from Profile. Home shows the core
features to everybody and only the chosen sector's features below them. Routes
outside the chosen sector still resolve if deep-linked; they are simply not
surfaced. No server-side enforcement.

**Farming [owner]:** selectable now, core features plus a "coming soon" card
naming what is planned. No new backend.

Feature assignment:

| tier | features |
|---|---|
| Core (always) | Blogs, Groups, Contracts, Wallet, Market, Search, Loans, Expenses, Points transfer, Profile |
| Gaming | Community, Games, Seasons, Events, Pioneer Candidacy, Elections |
| Education | Courses, Learning, Course Proposal, Teacher Dashboard, Sessions |
| Farming | — (placeholder) |

### Work

- `XANO/table/user.xs` — add `enum interest_sector? { values = ["Gaming","Education","Farming"] }`. Additive, nullable, no migration.
- `XANO/api/user_profile/profile_PATCH.xs` — accept and persist it. Declared as a plain `enum`, so an omitted value arrives as `""` (practices §2) and must be gated on `!= ""` rather than `?? existing`.
- `XANO/api/user_profile/profile_GET.xs` — return it.
- `FrontEnd/src/lib/sectors.ts` — **new**. One exported `SECTORS` list and one feature→sector map. The five hardcoded arrays above import from it instead of restating it.
- `FrontEnd/src/features/home/HomeScreen.tsx` — **new**.
- `FrontEnd/src/features/home/InterestPickerScreen.tsx` — **new**; shown when `interest_sector` is unset.
- `FrontEnd/src/routes/tabs.ts` — Home becomes the landing tab; `DEFAULT_ROUTE` moves with it (`tabs.test.ts` asserts the two stay together — that test must keep passing, not be edited around).
- `FrontEnd/src/routes/router.tsx` — register `/home`, `/onboarding/interest`.

**Note for the reader:** this reverses the 2026-07-31 decision to delete Home.
It is not the same screen. The old one was a duplicate hub; this one carries
information nothing else does — which slice of the platform the member is here
for. The comment in `tabs.ts` gets rewritten to say so, rather than silently
contradicted.

---

## 2. INR Wallet credit rules

### What exists — and the defect

`XANO/api/admin/declarations/id/verify_PATCH.xs` credits **the declaring
member's own wallet** for every payment type:

```
payment_type == "Token Purchase"  -> member VGC_TOKEN wallet  (correct)
everything else                   -> member INR wallet        (WRONG)
```

So a member who donates ₹10,000 has ₹10,000 credited to their own INR Receipt
Ledger. Same for Grant, Sponsorship and Investment. This contradicts SRS §3.7,
which lists exactly four member INR credits (surrender settled, investment
payout, sponsorship refund, loan disbursement) and puts declaration inflows on
the **admin** ledger.

Confirmed against live data — verified declarations total ₹55,050 Donation and
₹45,000 Grant, and the donor accounts (members 10 and 19) carry ₹105,000 each.

Two further defects in the same family:

- **The admin INR ledger is never credited by anything.** Grepping every
  `currency: "inr"` mutation in the tree returns exactly two sites —
  `expenses_POST` (debit) and `loans/{id}/approve` (credit to member). The
  ledger that §3.7 describes as the platform's inflow record has only ever been
  debited. It reads ₹987,650 purely from direct admin adjustments made while
  seeding test data.
- **Token surrender pays nothing.** `admin/token-surrenders/{id}/complete`
  debits the member's token wallet, writes an event log, and marks the request
  completed — but never credits the member's INR wallet with the
  `inr_equivalent` the create endpoint carefully computed at the server rate,
  and never debits admin INR. SRS §3.4 requires both. Every surrender ever
  completed took the member's tokens and recorded no payout.

### New rule

Member INR Receipt Ledger is credited **only** by:

1. Loan disbursement (already correct)
2. Token surrender settled, at the platform surrender rate (₹8.5/token today)
3. Investment payout
4. Sponsorship refund

Admin INR Receipt Ledger is credited by every verified declaration and debited
only by Expense Tracker Platform Outflow entries.

### Work

- `admin/declarations/{id}/verify` — Token Purchase credits the member's token wallet **and** admin INR; every other type credits **admin INR only**.
- `admin/token-surrenders/{id}/complete` — credit member INR by `inr_equivalent`, debit admin INR by the same, inside the existing transaction.
- `admin/investments/{id}/payouts/{payout_id}/mark-paid` — credit member INR, debit admin INR.
- `admin/sponsorships/{id}/refund` — credit sponsor INR, debit admin INR.
- Use `mutate_wallet`, not a hand-rolled `db.edit wallets`. The verify endpoint currently hand-rolls it and so writes no ledger row.

### Backfill **[owner: recompute from legitimate sources]**

Every member INR wallet is zeroed and rebuilt as the sum of the four legitimate
credits above. Admin INR is rebuilt as verified declaration inflows minus
Platform Outflow expenses. This destroys the seeded test balances; the owner
chose it knowingly. A snapshot of the pre-change rows is written to
`XANO/archive/inr_backfill_snapshot_2026-08-12.json` regardless, because it
costs one file.

---

## 3. Contract system

### What exists

Two contract types (`vgc_administrated` / `non_vgc`) with divergent money
paths, and **two parallel lifecycles** — one on `contracts` (assign,
mark-complete, release, dispute, escalate, force-close-request, admin resolve)
and a newer one on `contract_applications` (request-detail, update, appoint,
submit-completion, verify-completion, raise-dispute, admin resolve, rate). The
frontend drives the application-level flow. The contract-level endpoints are
dead weight that still compile and still mutate wallets.

Much of the target design is already built: per-application escrow, a
giver↔taker chat, an admin dispute chat with image attachments, and per-role
ratings.

### New rule **[owner]**

One contract type. Ten steps:

| step | rule |
|---|---|
| 1 | Giver lists a contract. Guidance only, nothing locked. Payment in VGC Points only. |
| 2 | Takers submit a **detailed** proposal. **[owner: the request-detail gate is dropped]** |
| 3 | Many proposals, each independent. The **giver** chooses to keep collecting until the deadline or delist. *(The brief says "taker" here; read as giver — a taker has no listing to delist.)* |
| 4 | Chat opens as soon as a proposal exists. |
| 5 | Giver assigns → escrow taken, **all fields locked**. Before assignment the taker may edit freely. **[owner: many proposals on one contract may be assigned]** |
| 6 | Taker marks for review. |
| 7 | Giver marks completed, or requests VGC intervention (5% fee). |
| 8 | Completed → escrow to taker, marked settled. |
| 9 | Intervention → admin chats both sides, sees the locked proposal, decides. Taker gets at most 95% of escrow. No further penalty. |
| 10 | Both rate and comment after settled. |

**The 5% fee [owner: only on intervention].** Assignment escrows exactly the
proposal amount. A clean settlement costs the giver nothing beyond it. Today's
up-front 5% listing fee is removed.

### Work — schema

`contracts`
- drop `contract_type`, `taker_member_id`, `escrow_amount_points`, `listing_fee_points`, `force_close_requested_at`, `force_close_requester_id`, `escalated_at`, `released_at` — all belong to the retired contract-level lifecycle
- `status` becomes `listed | delisted | expired | cancelled`

`contract_applications`
- `status` becomes `pending | assigned | under_review | settled | rejected | withdrawn | vgc_review`
- add `assigned_at`, `review_requested_at`, `settled_at`, `settlement_amount_points`, `vgc_fee_points`, `intervention_requested_at`

Both are destructive column changes. Live volume is 5 contracts and 5
applications, so the migration is: snapshot → map statuses → drop columns.

### Work — endpoints

Retire (contract-level duplicates): `contracts/{id}/assign`,
`mark-complete`, `release`, `dispute`, `escalate`, `force-close-request`,
`admin/contracts/{id}/resolve`.

Rewrite:
- `contracts POST` — drop `contract_type`, drop the VGC-only conditions rule and the 10-contract giver cap that only applied to one type
- `contracts/{id}/apply` — proposal is detailed on submission
- `contracts/applications/{app_id}/update` — editable while `pending`; drop the "cannot update after the giver has messaged" rule, which contradicts step 5
- `contracts/applications/{app_id}/appoint` → escrow the proposal amount only, no listing fee, lock the row, allow a second assignment on the same contract
- `submit-completion` → `under_review`
- `verify-completion` → single path: escrow to taker, `settled`
- **new** `request-intervention` → `vgc_review`
- `admin/contracts/applications/{app_id}/resolve` → one decision shape: `taker_award_points` between 0 and 95% of escrow, remainder to giver, 5% to VGC
- `rate` — gate on `settled`

Retire `contracts/{id}/close-applications`? No — it *is* step 3's delist. Keep
it, rename the status it writes to `delisted`.

### Work — frontend

`api/contracts.ts` and all six screens in `features/contracts/` lose the
type switch. `CreateContractScreen` loses the Secure/Independent picker.
`ContractsScreen` (858 lines) currently tabs by contract type — that becomes
tabs by role (Open / My listings / My proposals).

---

## 4. PTS rate formula

### What exists

`XANO/function/pts_compute_rate.xs`, implementing SRS §4.1:

```
r_eq        = ( I + R + A − L_invest − 10·T_net ) / P_net
r_published = r_eq × (1 + θ·t_idle)     floor 0.0001
R_user      = 10 / r_published
```

where `I` is the admin INR wallet balance, `R` and `A` are manually maintained
reserve and hard-asset figures on `pts_components`, and `L_invest` accrues
investment liability over a year.

Live at the time of writing: `r_eq 5.561`, `r_published 17.574`,
`r_user 0.569`, `p_net 203663`.

`r_user 0.569` means one VGC Token costs 0.57 VGC Points. That is the visible
symptom: `I` is dominated by ₹987,650 of INR that was never really received,
so the numerator is enormous relative to the points in circulation.

Two further gaps against the SRS as written:

- SRS §4.1 defines `P_member` as member points **plus contract escrow held by admin**, and `P_admin` as admin points **minus** that escrow. The implementation reads raw wallet balances, so escrowed points are counted on the wrong side of the subtraction — twice over, since they are subtracted from `P_member` *and* added to `P_admin`.
- `T_admin` is defined as the admin token wallet **plus** the Marketplace Escrow Wallet. The implementation reads only the admin wallet.

### New rule **[owner]**

```
R = 10 · ( P_member − P_admin ) / D

D =   I_net_sponsor
    + I_token_purchase
    + 0.1 · I_invest
    + 0.7 · I_grant
    + 0.5 · I_donation
    − I_expense
    − I_loan
    + 10 · T_admin
    − 10 · T_member
```

`R` is the member-facing points-per-token figure — the same quantity the
current code calls `R_user`. Note `10·T_admin − 10·T_member` is exactly the
existing `−10·T_net`, so that half is unchanged. What changes is that the
opaque `I + R + A − L_invest` is replaced by an itemised INR position with a
haircut per source: investment money is 90% a liability, grant money 30%,
donation money 50%.

`P_member` includes contract escrow, per SRS §4.1 — which the new contract
design makes cleaner, since escrow is now a per-application amount on a row
rather than an untracked lump in the admin wallet.

### Term sources **[owner: sum live, cached]**

| term | source |
|---|---|
| `I_net_sponsor` | `SUM(sponsorships.amount_inr WHERE status='completed') − SUM(sponsorship_refunds.amount_inr)` **[owner]** |
| `I_token_purchase` | `SUM(declarations.amount)` where verified, `payment_type='Token Purchase'` |
| `I_invest` | same, `'Investment'` |
| `I_grant` | same, `'Grant'` |
| `I_donation` | same, `'Donation'` |
| `I_expense` | `SUM(expenses.amount_inr WHERE entry_type='Platform_Outflow')` |
| `I_loan` | `SUM(loans.amount_disbursed_inr)` where the loan was actually disbursed |

Each declaration term uses `amount_paid` when it is greater than zero, else
`amount` — the TR-273 rule, because `amount_paid` defaults to 0 rather than
null and `??` will not fire on it.

Retained from the current implementation: θ time-drift, the 0.0001 floor and
the 0.00011 conversion threshold, and the `P_net ≤ 0` suspension guard.

**New guard.** `D ≤ 0` has no meaning as a divisor and the old formula could
not produce it (`P_net` was the divisor and was already guarded). Conversion
suspends when `D ≤ 0`, with its own reason string so it is distinguishable
from the `P_net` case on the dashboard.

`reserve_inr`, `hard_assets_inr` and the `L_invest` accrual leave the formula.
The columns stay on `pts_components` — dropping them would lose the admin's
recorded reserve position for no gain — but nothing reads them into the rate.
`admin/pts/reserve-assets PATCH` keeps working and is relabelled in the admin
UI as a recorded figure that no longer feeds the rate.

---

## Order of work

1. PTS rate — self-contained, one function plus its callers. **Done.**
2. INR wallet rules + backfill. **Done.**
3. Contracts — the large one; depends on (1) for the escrow term. **Done**, and
   now superseded in part: the owner supplied `VGC_Contract_Feature_SRS_v1.0`
   on 2026-08-14, which reinstates the Request-Detailed-Proposal gate that
   step 2 of §3 had dropped, and splits today's single `contracts` record into
   an Opportunity and a per-proposal Contract. Tracked separately.
4. Sector home screen. **Done** — `cf1a56c`, SRS §2.6.
5. Test, sync, docs. **Done.**

Verification for each follows `ENGINEERING_PRACTICES.md`: `npm run build` with
the exit code checked, `npm test`, endpoint exercised through the real payload
from `api/*.ts`, and a control run proving each new check can fail.
