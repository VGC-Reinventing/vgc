# Change Plan — 2026-08-15 · Contract Feature SRS v1.0

The owner supplied `VGC_Contract_Feature_SRS_v1.0` on 2026-08-14. It respecifies
the contract feature as a two-stage process — an **Opportunity** that attracts
Candidates, and a **Contract** created only when the Giver accepts a Detailed
Proposal that they had to explicitly request first.

This plan states what the review found, what is being built, and — as
importantly — what is deliberately *not* being built and why, so a later reader
does not "fix" a gap that was a decision.

**Decision: Option A [owner, 2026-08-15].** Deliver every behaviour v1.0
requires on the existing two-table model, rather than splitting into the
fourteen entities of v1.0 §42. §42 itself says "the exact schema and
relationships should be designed separately from this functional SRS", so this
is a licensed reading of the document, not a departure from it. §46's twenty-two
success criteria are all in scope.

**Status: steps 1–2 of §11 shipped.**

- **Step 1, 2026-08-15** — XANO `b1dfc4f`, FrontEnd `299163c`, bundle
  `index-CHsAMiRt.js`. Defects 1, 2, 5 and 8 of §5 and the rating-reward
  removal of §6.3.
- **Step 2, 2026-08-16** — XANO `023ac73`, FrontEnd `65e6839`, bundle
  `index-D-zhtqJD.js`. `contract_completion_submissions` created;
  `submit-completion` carries statement, deliverables, evidence and notes;
  `contracts/{id}` and `admin/contracts/disputes` both return it. Verified by
  walking a whole contract twice on one listing, one settled cleanly and one
  taken to VGC.
  - **Also fixed, same family as defect 1:** the Taker's completion screen
    refused to submit once the proposed delivery date had passed — "no payment
    is owed" — enforcing a rule the backend dropped in August. The escrow is
    already held by then, so refusing the submission saved the Giver nothing
    and stranded it. It is now a warning, and the Giver decides.

Steps 3–9 not started.

---

## 0. What the review found

Of v1.0 §44's twenty-eight Critical Business Rules, **twenty-one are already
implemented and live** — the money model in particular matches almost exactly.
Escrow at acceptance, the 5%-of-escrow dispute fee whichever side wins, the 95%
Taker ceiling, contract independence, ratings gated on settlement, the
permission matrix: all built on 2026-08-12 and verified.

The gap is the **negotiation stage**. v1.0 puts a gated, versioned, revisable
proposal between the application and the contract. The 2026-08-12 rewrite
collapsed all of that into a single row that is simultaneously the application,
the proposal, the active contract, the escrow, the completion submission and the
dispute.

Live volume: **9 contracts, 13 applications, 10 chat messages, 10 ratings.**
Every migration below is small.

---

## 1. The status model

This is the whole change in one table. Everything else follows from it.

### 1.1 `contract_applications.status`

Today the pre-assignment stage is one value, `pending`. v1.0 §35 and §36 need
four, because the Giver now gates the proposal and can send it back.

| status | meaning | who moves it |
|---|---|---|
| `interest` | "I'm Interested" submitted. No terms, no price, no escrow. Chat is open. | Candidate, via `apply` |
| `proposal_requested` | Giver has authorised a Detailed Proposal (v1.0 §13) | Giver, via `request-detail` |
| `proposed` | Detailed Proposal submitted or resubmitted | Candidate, via `update` |
| `changes_requested` | Giver wants revisions, with a stated note | Giver, via `request-changes` |
| `assigned` | Accepted. Escrow taken. **Every field frozen.** | Giver, via `appoint` |
| `under_review` | Taker says the work is done | Taker, via `submit-completion` |
| `vgc_review` | Giver asked VGC to decide the payout | Giver, via `request-intervention` |
| `settled` | Escrow disbursed; ratings open | `verify-completion` or admin `resolve` |
| `rejected` | Giver declined it | Giver, via `reject` |
| `withdrawn` | Candidate pulled out | Candidate, via `withdraw` |

`proposed → changes_requested → proposed` is the negotiation loop (§15, §36).
It has no iteration limit; each pass writes a version row (§4 below).

**`rejected` and `withdrawn` already exist in the enum and nothing has ever
written either one.** A Giver has never been able to decline a proposal and a
Candidate has never been able to pull one. That is fixed here rather than
carried forward.

### 1.2 `contracts.status`

| status | meaning |
|---|---|
| `draft` | **new.** Created but not published; not visible to anyone but its Giver (§6, §34) |
| `listed` | Accepting applications |
| `delisted` | Giver stopped new applications by hand (§8.1) |
| `expired` | Application Closing Date passed (§8.2) |
| `cancelled` | Giver withdrew the listing |

`expired` is in the enum today and **nothing writes it.** The header comments on
`contracts_GET.xs` and `contracts/id_GET.xs` both claim the listing "lazily
expires past `application_deadline`"; there is no such code in either file. The
*behaviour* is right — `apply_POST` refuses late proposals — but the listing
reads `listed` forever and v1.0 §8.2's automatic closure never happens.

### 1.3 The rule that must not be broken

**Escrow exists only from `assigned` onwards.** None of the four new statuses is
an escrow-holding state, which is why `pts_compute_rate.xs` needs no change
(§8). Any future status added *after* `assigned` must be added to that function
in the same commit.

---

## 2. Schema

### 2.1 Three new tables

**`contract_proposal_versions`** — v1.0 §27 lists "Proposal revision history"
among the things Admin reviews when deciding a dispute. Today `update_PATCH`
overwrites in place and keeps nothing, so that evidence does not exist.

```
int id
timestamp created_at?=now
int application_id            -> contract_applications
int version_no
int edited_by_member_id       -> user
text? application_text
text? detailed_proposal
decimal? proposed_price_points
date? proposed_start_date
date? proposed_completion_date
text? giver_note              // the changes_requested note this version answers
```

One row per submission *and* per resubmission. The version current at assignment
is the contractual one (§16) and is never deleted.

**`contract_completion_submissions`** — v1.0 §22 requires a completion
statement, deliverables, files/links and supporting evidence. `submit-completion`
takes **no input at all** today; it flips a status and notifies. So §27's
"Completion submission / Uploaded evidence" is empty for every dispute that has
ever been raised, and the admin screen has nothing to show.

```
int id
timestamp created_at?=now
int application_id            -> contract_applications
int submitted_by_member_id    -> user
text statement
text? deliverables
text[]? evidence_urls         // Cloudinary secure_url, as everywhere else
text? notes
```

**`contract_audit_log`** — v1.0 §41 names twenty-one events. Only one is logged
today (`contract_intervention_resolve`, via `log_admin_action`). Named to match
the existing `admin_audit_log` rather than v1.0's `contract_audit_logs`.

```
int id
timestamp created_at?=now
int? contract_id              -> contracts
int? application_id           -> contract_applications
int actor_member_id           -> user
text action
json? detail
```

Written by a new `function/contract_audit.xs` so no endpoint hand-rolls it.

### 2.2 Changes to existing tables

`contracts`
- `status` gains `draft`

`contract_applications`
- `status`: `pending` is **replaced** by `interest | proposal_requested | proposed | changes_requested`
- add `timestamp? detail_requested_at`, `timestamp? proposed_at`, `timestamp? rejected_at`, `timestamp? withdrawn_at`
- add `text? changes_requested_note`
- add `date? proposed_start_date` — v1.0 §14 lists Proposed Start Date, and it is the only one of that field list with behaviour attached
- add `int? proposal_version?=0`

> **Both are enum changes and need explicit owner confirmation before the tool
> call**, per the standing database rule. A snapshot of all 9 contracts and 13
> applications goes to `XANO/archive/contracts_snapshot_2026-08-15.json` first,
> because it costs one file.

### 2.3 One table to retire

`contract_disputes` has **zero writers and zero readers** — it was orphaned by
the 2026-08-12 deletion of the contract-level dispute endpoints and holds one
stale row. Dropping it is destructive and needs the same confirmation; the
snapshot above covers it.

---

## 3. Endpoints

### 3.1 New — six

| endpoint | who | rule |
|---|---|---|
| `POST /contracts/{id}/publish` | Giver | `draft → listed` (§6) |
| `POST /contracts/applications/{app_id}/request-detail` | Giver | `interest → proposal_requested` (§13). Reachable from the application **and** from chat (§12) |
| `POST /contracts/applications/{app_id}/request-changes` | Giver | `proposed → changes_requested`, `note` required (§15) |
| `POST /contracts/applications/{app_id}/reject` | Giver | any pre-assignment status → `rejected` (§35) |
| `POST /contracts/applications/{app_id}/withdraw` | Candidate | any pre-assignment status → `withdrawn` (§35) |
| `function/contract_expire_if_due` | — | lazy expiry, called from every contract read path (§8.2) |

`contract_expire_if_due` uses the **same 24-hour grace** as `apply_POST`'s
existing deadline gate. If the two disagree, a contract either expires while
still accepting proposals or accepts proposals while showing expired. Timestamp
arithmetic goes through `add_secs_to_timestamp` / `to_ms` — never `now + n`, and
never `now|to_int` inside an expression (practices §2).

### 3.2 Rewritten — nine

- **`contracts/{id}/apply`** — loses `detailed_proposal`, `proposed_price_points`
  and `proposed_completion_date`; takes `application_text` only. Writes
  `interest`. This is the reversal: see §6.1.
- **`contracts/applications/{app_id}/update`** — becomes the proposal editor.
  Allowed in `proposal_requested | proposed | changes_requested`; refused in
  `interest` (no proposal has been requested). Writes a
  `contract_proposal_versions` row, increments `proposal_version`, sets
  `proposed`. Keeps its `text`-not-`date` input declarations and its
  start-from-stored-value pattern — both exist because of TR-302 and the fatal
  optional-`date` read (practices §2), and both still apply.
- **`contracts/applications/{app_id}/appoint`** — precondition moves from
  `pending` to `proposed`. A proposal cannot be assigned from
  `changes_requested`: the Giver asked for changes and has not seen them yet.
- **`contracts/applications/{app_id}/submit-completion`** — gains
  `statement` (required), `deliverables?`, `evidence_urls?`, `notes?`, and
  writes the submission row.
- **`contracts/applications/{app_id}/messages` GET and POST** — admin read
  access. §21 says the Contract Chat "must remain available to VGC Admin for
  dispute review" and §27 lists chat history among the evidence; today
  `messages_GET.xs:33` allows only the Giver and the applicant, so an admin
  resolving a dispute gets `accessdenied`. Admin gets **read** only — the
  admin-to-party channel is `dispute-messages` and stays separate.
  Read-only rule extends to the new terminal statuses.
- **`contracts/{id}` GET** and **`contracts/me` GET** — drop
  `giver_requested_detail` and `proposal_needs_correction`, which name columns
  that no longer exist and have been returning `false` unconditionally since
  2026-08-12. Add the new statuses to the Giver's counts, and a `drafts` group.
- **`admin/contracts/disputes` GET** — return the completion submission and the
  proposal version history alongside what it already returns.

Unchanged: `verify-completion`, `request-intervention`, `admin/.../resolve`,
`rate`, `cancel`, `close-applications`, `reputation`. They gate on
`assigned | under_review | vgc_review | settled`, none of which move.

---

## 4. Frontend

| file | change |
|---|---|
| `api/contracts.ts` | six new calls; `applyContract` loses three fields; `submitCompletion` gains a body |
| `api/types.ts` | `ContractApplicationStatus` gains four values, loses `pending`; new fields |
| `features/contracts/ContractDetailScreen.tsx` (1,106 L) | the bulk of it — the apply form becomes interest-only; the proposal editor is gated on `proposal_requested`/`changes_requested` and shows the Giver's note; Giver gains Request Detail / Request Changes / Reject; Candidate gains Withdraw; completion gains the evidence form |
| `features/contracts/ContractChatScreen.tsx` | the Request Detailed Proposal button returns — the explanatory banner that replaced it is still sitting at `:41` |
| `features/contracts/ContractsScreen.tsx` | tab counts and Giver grouping for the new statuses; a Drafts section |
| `features/contracts/CreateContractScreen.tsx` | Save as draft, alongside Publish |
| `features/admin/AdminContractsScreen.tsx` | completion submission, evidence images, revision history |
| `features/contracts/contractStatus.ts` | **new.** The status → permitted-actions map, extracted as a pure module |

That last file exists so the lifecycle can be tested. `vitest.config.ts` runs
`src/**/*.test.ts` in a node environment, so nothing that renders a screen can
be pinned — but a pure map can, and the two-stage lifecycle is exactly the kind
of thing that rots silently when a status is added.

---

## 5. Defects folded in

Found during the review; independent of v1.0, fixed here because the same files
are open.

| # | defect | fix |
|---|---|---|
| 1 | The **Taker** is shown "Raise Dispute" on `under_review`; the backend refuses it — `request-intervention` is Giver-only. It has 403'd every time. | `ContractDetailScreen.tsx:420` — remove it |
| 2 | Admin cannot read the Giver↔Taker chat | §3.2 |
| 3 | `contract_disputes` orphaned | §2.3 |
| 4 | Comments describe a lazy expiry that is not in the code | §3.1 |
| 5 | `giver_requested_detail` / `proposal_needs_correction` returned for dropped columns | §3.2 |
| 6 | `rate_POST.xs` pays a "constitutional points" reward of `min(20, 2% of price)` out of the admin wallet on every rating. It appears in **neither** SRS. | **Removed [owner]** — see §6.3 |
| 7 | Applications 1, 2 and 4 are `settled` with `escrow_amount_points = null` — pre-rewrite rows that fail v1.0 §39 auditability | Moot: the contract test data is discarded, §7 |
| 8 | `chatEnabled = giver_message_count > 0` — a Candidate cannot open chat until the Giver speaks first. v1.0 §45's Candidate journey goes straight from application to chat. | Drop the gate; chat opens with the application (§12) |

---

## 6. Deliberately not built

Written down so it reads as a decision rather than an omission.

### 6.1 The entity split (v1.0 §1.1, §42)

v1.0 models Opportunity → Application → Proposal → Active Contract as four
records and recommends fourteen tables. This plan keeps two: `contracts` is the
Opportunity, `contract_applications` carries the application, the proposal and
the contract.

Every behavioural rule in §44 survives that collapse — the parts of the split
that carry real behaviour are proposal versions, completion submissions and the
audit trail, and all three are built as their own tables in §2.1. What the full
split would additionally buy is queryable per-contract records; what it would
cost is a rewrite of every contract endpoint, a re-point of the PTS escrow term,
and a genuine data migration. §42 explicitly leaves the schema to this phase.

**If a later requirement needs a Contract to exist independently of the proposal
that created it** — a contract transferred to a different Taker, say, or two
contracts from one proposal — that is the trigger to revisit this, and it is a
schema change rather than a behaviour change.

### 6.2 Binary dispute outcomes (v1.0 §28)

v1.0 frames the Admin decision as *Taker Wins* / *Giver Wins*. The implemented
form is a continuous award of 0–95% of escrow, which is strictly more expressive
and is what main-SRS §14.1 step 9 already specifies. The endpoint keeps the
continuous form; the admin panel gains **two preset buttons** that fill in the
two v1.0 outcomes, so the documented cases are one click.

### 6.3 The rating reward is removed **[owner]**

`rate_POST.xs` currently mints `min(20, 2% of the agreed price)` VGC Points from
the admin points wallet to whoever submits a rating, tagged
`constitutional_points`. It is in neither SRS: Appendix A's Standard Activity
Table rewards session ratings (2,400 and 1,200) and says nothing about contract
ratings, and §14.7 promises no payment for one.

The whole block goes — both `mutate_wallet` calls, the `reward_points` field on
the response, its type in `api/contracts.ts:161`, and the `pts > 0` branch of
the success toast at `ContractDetailScreen.tsx:168`. Leaving the field in place
returning a permanent 0 would be a slow way to mislead the next reader.

If contract ratings should be incentivised later, the mechanism already exists
and is the right one: an entry in the activity catalog, which is auditable,
admin-editable and shows up in the member's passbook — not a hardcoded formula
inside an endpoint.

### 6.4 Structured application and proposal fields (v1.0 §7, §14, §20)

v1.0 enumerates roughly eight application fields and twelve proposal fields.
Only Proposed Start Date has behaviour attached, and it becomes a column (§2.2).
The rest stay as prompt text above the existing free-text and rich-text fields:
making them columns would let us *store* them but nothing would *read* them, and
a locked contractual document is better served by one preserved rich-text
version (§2.1) than by twelve columns that can each drift.

---

## 7. Migration — discard and reseed **[owner: legacy contract data is disposable]**

The platform is pre-launch and every contract row is test data the owner has
said carries no value. So there is no status mapping and no version backfill:
the contract tables are emptied and repopulated through the real flow.

| table | action |
|---|---|
| `contract_applications` (13) | truncate |
| `contracts` (9) | truncate |
| `contract_application_messages` (10) | truncate |
| `contract_ratings` (10) | truncate |
| `dispute_messages` (1) | truncate |
| `contract_disputes` (1) | snapshot, then drop the table entirely (§2.3) |

Snapshot everything to `XANO/archive/contracts_snapshot_2026-08-15.json` first
anyway. It costs one file, and it is the only record that the four unreconcilable
pre-rewrite rows ever existed.

Reseeding is `.local-archive/tools/test_contract_flow.py`, extended per §12 —
which means the fixture data is produced by the same walk that verifies the
feature, through real endpoints, rather than written into tables directly
(practices §5).

**Three consequences, all checked:**

1. **No wallet is touched and no escrow moves.** Nothing in flight exists —
   twelve of thirteen applications are `settled` and the thirteenth holds no
   escrow. Points already paid out stay paid out; the ledger keeps its history
   of transfers whose contract rows are gone.
2. **`p_escrow` in the PTS formula is 0 before and after.** Verified against the
   live rows, and re-asserted by the §8 control run rather than assumed.
3. **Member reputation resets.** Ten ratings across the test members disappear
   with their applications, so the reputation pages read "No ratings yet" until
   the reseed completes. Acceptable on test data; it would not be on live data,
   and this route is not available again after launch.

---

## 8. The PTS coupling

`function/pts_compute_rate.xs:122` sums contract escrow by querying
`contract_applications` for `assigned | under_review | vgc_review` (plus the two
pre-2026-08-12 names) and moves it from `P_admin` to `P_member`, per SRS §4.1.

**None of the four new statuses is an escrow-holding state**, so the query is
correct unchanged — but it is correct by accident of naming, and a wrong answer
here does not error, it just publishes a different exchange rate. So:

- the escrow status list gets a comment naming §1.3's rule
- verification includes a control run: read the rate, assign a proposal, read it
  again and assert `p_escrow` moved by exactly the proposal price; settle, and
  assert it moved back

---

## 9. Decisions taken — 2026-08-15

All by the owner, on this plan:

1. **Option A.** Deliver v1.0's behaviour on the two-table model; do not split
   into the fourteen entities of §42.
2. **The schema changes are authorised** — `contracts.status` gains `draft`,
   `contract_applications.status` is restructured per §1.1, and
   `contract_disputes` is dropped. Snapshot first regardless.
3. **The rating reward is removed**, not documented. §6.3.
4. **Legacy contract data is disposable** — discard and reseed rather than
   migrate. §7.

5. **Admin can see drafts, clearly marked as such.** A `draft` contract is
   invisible to other members and visible to its Giver and to admin. Every
   surface that shows one carries a `Draft` badge — an admin looking at a
   moderation queue must not mistake an unpublished listing for a live one.
   `contracts_GET` excludes drafts for everyone except an admin caller and the
   Giver themselves; `contracts/{id}` GET returns one to the same two.

---

## 10. Documentation

- **Main SRS §14 is rewritten** — it currently describes the 2026-08-12 system
  accurately, and that system is changing. Revision history entry **v2.7**.
- **Three places are stale already** and get fixed in the same pass, all
  describing the two-type system deleted on 2026-08-12:
  - **§1.3's scope line** — "Two types — VGC Administrated (escrow-based) and
    Non-VGC (trust-based)", plus the 2-active-as-Taker and 10-listed-as-Giver
    caps
  - **§18's Phase 15 row** — the 105% escrow lock at listing, the 7-day Giver
    response window, the Non-VGC 150% penalty cascade
  - **§19's Glossary entry** for "Non-VGC Administrated Contract"
- §6 of this plan is transcribed into §14 as a "what this deliberately does not
  do" note, for the same reason §2.6.3 carries one.
- `ENGINEERING_PRACTICES.md` gets an entry only if this work teaches something
  new. Nothing here is a candidate yet.

---

## 11. Order of work

1. **Defects 1, 2, 8 and 5, and the rating reward removal** (§6.3) —
   independent of everything else, and 1 and 2 are broken in production today.
   Ship first.
2. **Completion evidence** (§2.1, §3.2) — the largest functional hole, and it
   does not depend on the status model.
3. **Audit log** (§2.1) — wanted by every step after this one.
4. **Status model** (§1, §2.2) — schema, then the discard-and-reseed of §7,
   then endpoints. The reseed comes last of the three: reseeding before the
   endpoints are rewritten would produce rows in the old shape.
5. **The six new endpoints** (§3.1).
6. **Frontend** (§4).
7. **Admin panel** — evidence, revision history, the two §6.2 presets.
8. **Lazy expiry and drafts** (§1.2, §3.1).
9. **Docs** (§10), sync, and the final verification pass.

## 12. Verification

Per `ENGINEERING_PRACTICES.md`, and none of it optional:

- `npm run build > /tmp/build.log 2>&1; echo "EXIT: $?"` — the exit code, never
  a grep for a success string
- `npm test`, with the new `contractStatus.test.ts`
- Every endpoint exercised with the payload copied out of `api/contracts.ts`,
  not with what the endpoint looks like it wants (practices §5)
- `.local-archive/tools/test_contract_flow.py` **extended, not replaced** — it
  already walks steps 1–10 twice and asserts the money at every hop. It gains
  the gate (a proposal submitted without a request is refused), the negotiation
  loop, reject/withdraw, and the §8 escrow control run
- **A control run for each new check.** Every one of the new preconditions is a
  guard, and a guard that never fires looks exactly like a guard that is never
  needed — the `now|to_int` incident of 2026-08-01 left four of them silently
  inert for three days
- `xano workspace pull -d /tmp/xano-check` then
  `python3 .local-archive/tools/xano_drift.py /tmp/xano-check XANO`, with
  `--self-test` run first
- The last step is a browser on `baroda.app`, signed in as a real test member,
  after accepting the PWA update banner
