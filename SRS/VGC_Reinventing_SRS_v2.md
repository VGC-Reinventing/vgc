# VGC Reinventing — Software Requirements Specification

> **Version 2.5 · 2026 · Confidential**

---

## Document Revision History

| Version | Date | Summary |
| --- | --- | --- |
| 1.0 | 2025 | Initial release |
| 2.0 | 2026 | Design review incorporated: free-plan tech constraints; under-18 registration; marketplace escrow wallet; manual session verification replacing timed OTP; universal paid voting; revised contract penalty; admin security; DPDP compliance; logic fixes across all sections |
| 2.1 | 2026 | Second review pass: mobile number made optional at registration; guardian email-only verification; minor account guardian link made historically inert at age 18; active marketplace orders addressed in account closure; auto-settlement escrow split trigger corrected; Entry Type field wording clarified; Platform Outflow Reason/Remark visibility made per-entry toggle; hardcoded formula coefficient (10) documented; public group post visibility restricted to logged-in members; stale cart rule added; two Pioneer Candidacy items formalised; multi-way election tie resolution clarified; session auto-end (4 hours past scheduled end) added; contract budget field locked post-listing; force-close escrow disposition rule added; Backup Admin trigger defined (login inactivity + Vacation Mode); contract applicants notified on deadline expiry; ticket re-visibility after post-auto-hide amendment |
| 2.2 | 2026 | Free-plan implementation strategy formalised (no functional changes): §1.4.1 extended with the architectural rule that **no feature depends on a XANO scheduled/background task** — all time-dependent behaviour is achieved via lazy evaluation on read, with an optional free external cron for push-only notifications; in-app notifications delivered via client polling (XANO Realtime is paid); email sent inline with optional external provider for volume; Cloudinary for heavy media. §4.7 and §17 updated to specify on-demand computation of L_invest and amortised values instead of a nightly batch. |
| 2.3 | 2026-06-11 | §8.7 simplified: removed monetisation consent step at abandonment. Abandoned blog records are retained in the backend for audit purposes; VGC Admin has full discretion over abandoned content without requiring prior member consent. Member is shown a plain disclaimer before confirming abandonment. |
| 2.4 | 2026-06-27 | §14.3 extended: contract applicants may optionally submit a proposed price (counter-offer in VGC Points) and a proposed completion date alongside their pitch. These are visible to the Giver when reviewing applications. Both fields are optional — omitting either means the applicant accepts the Giver's posted budget or requested date. |
| 2.5 | 2026-06-28 | §14.11 added: Contract Application Chat. Private 1-to-1 messaging between a Giver and each individual Applicant, accessible before assignment to clarify requirements and negotiate terms. Chat thread becomes read-only once the application is assigned or rejected. |

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the complete functional and non-functional requirements for the VGC Reinventing digital ecosystem. It serves as the primary reference for design, development, testing and deployment of the platform using XANO as the backend and WeWeb as the frontend.

### 1.2 Project Overview

VGC Reinventing is a comprehensive digital ecosystem that integrates gaming, education, financial services and other sectors under one unified platform. The ecosystem operates on a unique tri-currency economy comprising INR (Indian Rupees), VGC Tokens and VGC Points. Every registered member receives a unique ID and has access to all three wallets, a marketplace, sector-specific features and a community-driven governance model.

### 1.3 Scope

The platform covers the following major functional areas:

- Member registration, login and unique ID management (with guardian-approval flow for under-18 members)
- Three-wallet economy: INR Receipt Ledger, VGC Token Wallet, VGC Points Wallet
- VGC Marketplace with 8-level category hierarchy and same-vendor cart checkout
- Gaming Sector: Community Games, Pioneers, Seasons, Events, Elections (universal paid voting)
- Education Sector: Teachers, Students, QR check-in with Teacher manual verification, post-session ratings and testimonies
- Financial Sector: Donations, Grants, Sponsorships, Investments
- Point Token Scheme: Dynamic currency conversion
- VGC Points economy: Minting, transferring, activity rewards, monthly minting budget
- Admin panel for complete ecosystem governance
- Groups: Community spaces for members to create, join and interact
- Blog: Member content publishing with VGC Admin review, VGC Points rewards and optional Revenue Generator monetisation
- Loan to Members: INR loan facility repaid in VGC Tokens, interest-free for the first year
- Expense Tracker: Personal expense ledger for members; official INR outflow ledger for VGC Admin with public Platform Outflow visibility
- Contract: Member-to-member work agreements. Two types — VGC Administrated (escrow-based) and Non-VGC Administrated (trust-based). Hard cap of 2 simultaneously active contracts as Taker per member. Hard cap of 10 simultaneously listed or active VGC Administrated contracts as Giver per member.

### 1.4 Technology Stack

| Layer | Tool / Platform | Purpose |
| --- | --- | --- |
| Frontend | WeWeb | Visual page builder for all member-facing screens |
| Backend & Database | XANO | API, business logic, database and workflow automation. Computes the Point Token Scheme rate live from platform state (see §4). |
| File Storage | XANO File Storage / Cloudinary | Uploaded images, PDFs, videos, documents |
| Notifications | XANO Email | In-app and email notifications to members. Email is the sole OTP delivery channel at launch. |
| QR Code Generation | WeWeb (client-side JS library) | QR codes for session attendance are generated in the member's browser using a JavaScript QR library embedded in WeWeb. XANO stores the encrypted token data; WeWeb renders it as a QR image. No external API or paid service required. |

#### 1.4.1 Platform Design Philosophy — Free Plan First

The VGC ecosystem is designed to operate on free-tier plans of XANO and WeWeb wherever possible. The following design choices reflect this constraint:

| Function | Approach | Rationale |
| --- | --- | --- |
| Payment collection | Manual UPI payment → Declaration Form → VGC Admin manual verification | Eliminates need for a payment gateway |
| INR outflow recording | Admin Expense Tracker — manual Platform Outflow entries by VGC Admin | Replaces automated bank reconciliation |
| OTP delivery | Email OTP via XANO's built-in email function | XANO free plan includes email sending. SMS OTP is not implemented at launch. |
| Session attendance | QR check-in (client-side generation) + Teacher manual verification from dashboard | QR generation is free (client-side JS). Manual verification replaces timed OTP entirely. |
| Mobile verification | Mobile number collected as contact information only. Not OTP-verified at launch. | SMS gateway requires a paid plan. |
| Time-based processing (window expiry, auto-settlement, season archival, election close, liability accrual, audit sweeps) | **Lazy evaluation on read.** No XANO scheduled tasks (a paid feature). Each time-dependent state is computed on demand when the relevant endpoint is called — e.g. a points-transfer window is marked expired the moment `/pending` or `/accept` reads it past `window_ends_at`; an order auto-settles when read 7 days past proof of delivery; investment liability `L_invest` is computed as `min(1.1·X, (1.1·X / 365) · days_elapsed)` at request time rather than accrued nightly. Where a true wall-clock trigger is unavoidable (e.g. dispatching due-payout notifications when no member is online), a **free external cron** (e.g. cron-job.org or GitHub Actions) calls a protected admin endpoint on a schedule. | XANO free plan excludes scheduled/background tasks. Lazy evaluation makes the platform fully time-correct without them; external cron covers the few push-only cases. |
| In-app notifications | **Client polling** of the notifications endpoint on an interval. | XANO Realtime (WebSockets) is a paid feature. Polling delivers the same in-app alerts on the free plan. |
| Email volume (OTP + notifications) | XANO built-in email for low volume; **external provider (e.g. Resend/Brevo free tier) via External API Request** if XANO free email caps are reached. Emails are sent **inline at the triggering event** (no queue/dispatcher task). | XANO free email has volume caps; inline send avoids needing a scheduled dispatcher. |
| Media storage (images, video, large files) | **Cloudinary (free tier)** for video and large media; XANO file storage for small images and PDFs. | XANO free storage is limited; Cloudinary offloads heavy media. |

SMS-based OTP and payment gateway integration are future enhancements for when the platform moves to a paid plan.

**Architectural rule (Free-plan first):** No feature in this SRS depends on a XANO scheduled/background task. Every time-dependent behaviour is specified to be achievable by lazy evaluation on read, with an optional external cron acting only as a convenience trigger for push-only notifications. When the platform moves to a paid plan, the same logic can be promoted to native scheduled tasks with no change to the data model or API contracts.

---

## 2. Member Management

**Intent —** Every transaction, contribution and reward in the ecosystem is tied to a real, verifiable person. A clean registration and unique Member ID system is the foundation on which every other feature depends.

### 2.1 Registration

Any individual aged 18 or above can register directly. Members below 18 may register subject to the guardian-approval process in §2.1.2. Upon successful registration the system assigns a unique Member ID and automatically creates three wallets.

#### 2.1.1 Registration Fields

| Field | Type | Mandatory |
| --- | --- | --- |
| Full Name | Text | Yes |
| Email Address | Email | Yes |
| Mobile Number | Number | Recommended |
| Password | Password | Yes |
| Date of Birth | Date | Yes |
| City | Text | Yes |
| State | Text | Yes |
| Country | Text | Yes |

Note on Mobile Number: Providing a mobile number at registration is strongly recommended but not mandatory. Members who skip it may still register and browse, but wallet activity (token purchases, point transfers, marketplace purchases, contract escrow) requires a mobile number to be on file as a contact point. Members can add their mobile number from their profile settings at any time.

#### 2.1.2 Minor Registration (Under 18)

If the Date of Birth indicates the applicant is under 18, the following additional process applies:

| Step | Detail |
| --- | --- |
| 1. Registration paused | Form cannot be submitted until a Parent/Guardian Member ID is provided. |
| 2. Guardian Member ID | Applicant must enter the Member ID of a parent or guardian who is already a registered VGC member with a verified email address. Email verification is the only requirement; mobile number on file is not required for the guardian to be eligible. |
| 3. Approval notification | System sends a notification to the guardian's registered email requesting approval. The notification shows the minor's submitted Name, DOB and Email. |
| 4. Guardian reviews | Guardian logs in and views the pending approval request. |
| 5a. Approved | Guardian approves. Minor's registration completes. Member ID is assigned. Guardian's Member ID is permanently linked to the minor's account as Approving Guardian. |
| 5b. Rejected or no response in 7 days | Registration request expires and all entered data is discarded. Minor may re-apply with a different guardian's Member ID. |

Notes: A guardian may approve multiple minor registrations. The guardian assumes responsibility for the minor's platform activity by approving. VGC Admin may review and override any minor registration at sole discretion. When the member reaches the age of 18, the guardian link is not removed from the system — it remains as a permanent historical record of the original registration. From that point onwards the link has no operational effect; the member acts fully independently. No action is required from either party.

### 2.2 Unique Member ID

Every registered member receives a system-generated unique Member ID. This ID is permanent, non-transferable and used across all ecosystem activities including wallet identification, marketplace orders, election voting, season participation and transaction ledgers.

### 2.3 Member Roles

A single member can hold multiple roles simultaneously across different sectors, subject to the restrictions listed below.

| Role | Description | Restriction |
| --- | --- | --- |
| General Member | Default role upon registration | None |
| Pioneer | Leads a game season | Only one active pioneership at a time |
| Manager | Manages participant queries in a season | Can be same person as Pioneer |
| Treasurer | Manages VGC Points funding in a season | Can be same person as Pioneer |
| Teacher | Member who proposes and conducts courses on the marketplace | Can simultaneously be a Student |
| Student | Learner who purchases course tickets | Can simultaneously be a Teacher |
| VGC Admin | Ecosystem administrator | Single super-admin role |

Note: Marketplace item proposal is available to any member by default and is not a distinguishing role. See §6.3.

**Pioneer holding all three committee roles:** If a Pioneer simultaneously holds the Manager and Treasurer roles, VGC Admin assumes passive oversight for that season. Participant complaints addressed to the Manager are automatically CC'd to VGC Admin. VGC Admin may intervene if a pattern of unresolved complaints is detected.

### 2.4 Account Verification and Anti-Fraud Measures

| Mechanism | Detail |
| --- | --- |
| Email Verification | OTP sent to registered email at sign-up. Email must be verified before login is enabled. |
| Mobile Number | Collected as contact information. Not OTP-verified at launch (SMS gateway unavailable on free plan). VGC Admin may contact members via registered mobile for account matters. |
| Device Fingerprinting | Platform records device identifiers and IP addresses. Multiple accounts from the same device or IP are flagged for VGC Admin review. |
| Rate Limiting | Enforced on registration (max 3 per device per 24 hours), OTP requests (max 5 per email per hour), transfers, voting, contract applications and rating submissions. |
| Single Account Per Person | One account per individual. Members found operating multiple accounts may have all linked accounts suspended at VGC Admin's discretion. |

**Member capability by verification state:**

| Verification State | Can Login | Can Browse | Can Post / Blog / Group | Wallet Activity |
| --- | --- | --- | --- | --- |
| Email unverified | No | No | No | No |
| Email verified, mobile not yet provided | Yes | Yes | Yes | No |
| Email verified, mobile number on file | Yes | Yes | Yes | Yes |

Wallet activity (token purchases, point transfers, marketplace purchases, contract escrow) requires at minimum a mobile number to be on file as contact information.

### 2.5 Account Closure

A member may request to close their account at any time.

| Aspect | Detail |
| --- | --- |
| Request | Member submits an Account Closure Request from their profile page. Before confirming, the system shows a summary of outstanding items: active Taker contracts, active loans, group admin status, Revenue Generator blogs. |
| 30-day grace period | Account marked as Pending Closure for 30 days. Member may cancel and resume normal use. Wallet balances frozen; no new transactions, contracts or marketplace activity. |
| VGC Token Wallet | Remaining tokens are transferred directly to VGC Admin's VGC Token Wallet at end of grace period. Tokens are not surrendered for INR — they are an asset that becomes VGC Admin's property. |
| VGC Points Wallet | Remaining points transferred directly to VGC Admin's VGC Points Wallet. |
| INR Receipt Ledger | Preserved as settled historical record. |
| Active loans | Outstanding balance must be settled before closure finalises. If unresolved, referred to VGC Admin who may write off, restructure, or extend grace period. |
| Active contracts (as Giver) | Member must cancel all Giver contracts. VGC Administrated escrow returned per normal cancellation rules (5% listing fee non-refundable). |
| Active contracts (as Taker) | Member cannot unilaterally exit as Taker. VGC Admin force-closes the contract. Giver is notified. Escrowed budget returned per normal cancellation rules. Closing member bears no financial penalty for this admin-mediated exit, but closure is recorded in profile history. |
| Active marketplace orders | As buyer: existing orders in escrow continue normally through the grace period. If settled before closure finalises, escrowed tokens flow per the normal split rules. If the order results in an auto-refund (Proposing Member fails to submit proof within 30 days), the refunded tokens return to the closing member's frozen wallet and are subsequently transferred to VGC Admin on finalisation. As Proposing Member / Vendor: the closing member may still fulfil pending orders and submit proof of delivery during the 30-day grace period. On finalisation, any escrowed tokens for orders where the closing member is the Proposing Member and proof was not submitted are refunded to the respective buyers. Any remaining escrow balance attributable to the closing member's unfulfilled orders reverts to VGC Admin. |
| Group ownership | Admin status must be transferred to another member or group is deleted on finalisation. |
| Blog ownership | Published blogs marked Abandoned. Author identity anonymised; content remains under VGC Admin control. |
| Revenue Generator blogs | All associated marketplace tickets remain active. Revenue from ticket sales from this point onwards goes entirely to VGC Admin's VGC Token Wallet. |
| All other assets | All remaining assets (marketplace proposals, active listings, etc.) become VGC Admin's property. |
| Final state | After 30 days the account is permanently archived. Profile inaccessible. Anonymised transaction ledger entries retained for audit and regulatory compliance. |

---

## 3. Wallet System

**Intent —** The tri-currency model separates three distinct kinds of value: real-world money (INR), platform-earned reputation (VGC Points), and tradable utility (VGC Tokens). Each currency has its own rules for who can hold it, who can move it, and how it interacts with the others.

Every member has three wallets automatically created upon registration. All balances stored in XANO and updated in real time.

VGC Admin holds a parallel set of three wallets (Admin INR Receipt Ledger, Admin VGC Token Wallet, Admin VGC Points Wallet). Admin wallets receive all platform-level inflows and are debited only via the rules defined in §3.7 and the Expense Tracker (§10).

### 3.1 Wallet Overview

| Wallet | Currency | Transferable | Primary Use |
| --- | --- | --- | --- |
| INR Receipt Ledger | Indian Rupees (INR) | No (Admin managed) | Admin: inflow ledger (declarations and token purchases); all outflows logged in Expense Tracker. Member: credits-only record of INR received from VGC Admin. The name "Receipt Ledger" reflects that this is a record of INR received, not a spendable balance. |
| VGC Token Wallet | VGC Tokens | No (Non-transferable between members; flows to VGC Admin only via designated platform mechanisms) | VGC Marketplace purchases, loan repayments, Point Token Scheme conversions |
| VGC Points Wallet | VGC Points | Yes (Member to Member) | Rewards, payments, ecosystem activities |

### 3.2 Currency Exchange Rates

| Conversion | Direction | Rate | Notes |
| --- | --- | --- | --- |
| INR to VGC Token | Member buys tokens | ₹10 = 1 VGC Token | Configurable by VGC Admin with 30-day member notice |
| VGC Token to INR | Member surrenders tokens | 2 VGC Tokens = ₹17 | Configurable by VGC Admin with 30-day member notice |
| VGC Token to VGC Points | Point Token Scheme | Dynamic | Computed live by platform — see §4 |
| VGC Points to VGC Token | Point Token Scheme | Dynamic | Same live-computed rate applies |

**Rate update mechanism:** VGC Admin may revise the INR-to-Token buy rate and the Token-to-INR surrender rate from the Admin Panel. Any change takes effect 30 days after announcement. All members are notified via platform-wide notification on the day of announcement. Current rates and any announced future rates are displayed on the wallet page. Existing token balances are not retroactively revalued.

### 3.3 INR to VGC Token Purchase Flow

Member makes INR payment via UPI to the single authorised VGC UPI ID or pays cash to VGC Admin. Member then fills the INR to VGC Declaration Form on the VGC website. VGC Admin verifies the declaration and upon verification the member's VGC Token Wallet is immediately credited with the equivalent tokens at the current buy rate.

### 3.4 VGC Token Surrender Flow

Member submits a VGC Token Surrender Request Form specifying the number of tokens and their UPI ID. VGC Admin reviews the request and sends the INR equivalent to the member's UPI ID at the current surrender rate. VGC Admin marks the request as Completed. Member's VGC Token Wallet is debited and Member's INR Receipt Ledger is credited. VGC Admin logs the outgoing INR payment as a Platform Outflow entry in the Expense Tracker.

### 3.5 INR to VGC Declaration Form Fields

| Field | Type | Notes |
| --- | --- | --- |
| Full Name | Text | Payer's full name |
| Contact Number | Number | Phone number |
| Email Address | Email | For communication |
| Member ID | Text | If payer is a VGC member |
| Payment Type | Dropdown | Donation / Grant / Sponsorship / Investment / Token Purchase |
| Amount Paid (INR) | Number | Amount transferred |
| Payment Mode | Dropdown | UPI or Cash |
| UPI Transaction ID | Text | If paid via UPI |
| Date and Time of Payment | DateTime | When payment was made |
| Additional Details | Text | Reason / Conditions / Investment option |
| Supporting Document | File Upload | Screenshot of UPI payment or receipt |

### 3.6 VGC Token Surrender Request Form Fields

| Field | Type | Notes |
| --- | --- | --- |
| Member ID | Text | Unique VGC Member ID |
| Full Name | Text | Member's full name |
| VGC Tokens to Surrender | Number | Amount to convert |
| Equivalent INR | Number | Auto-calculated at current surrender rate |
| Member UPI ID | Text | Where INR will be sent |
| Date of Request | Date | Auto-filled by system |

### 3.7 INR Receipt Ledger — Credit and Debit Rules

VGC Admin INR Receipt Ledger:

| Direction | Event | Detail |
| --- | --- | --- |
| Credit | INR Declaration verified | Admin verifies a Donation, Grant, Sponsorship or Investment declaration. INR received is credited. |
| Credit | Token purchase confirmed | Admin confirms receipt of INR from a member purchasing tokens. INR credited. |
| Debit | Expense Tracker Platform Outflow entry | Admin logs any outgoing INR payment as a Platform Outflow. This is the sole debit mechanism. Covers Token Surrender payouts, Loan disbursements, Investment returns, Sponsorship refunds, marketplace fulfilment costs, utility bills and all other real-world expenses. |

Member INR Receipt Ledger:

| Direction | Event | Detail |
| --- | --- | --- |
| Credit | Token Surrender settled | INR transferred to member's UPI ID. Member's ledger credited. |
| Credit | Investment payout | Admin makes investment return payment. Investor's ledger credited. |
| Credit | Sponsorship refund | Admin refunds sponsorship amount. Sponsor's ledger credited. |
| Credit | Loan disbursement | Admin approves loan and transfers INR. Member's ledger credited. |
| Debit | Not available | Member INR Receipt Ledger has no debit facility. |

### 3.8 Marketplace Escrow Wallet

To prevent marketplace token flows from distorting the Point Token Scheme rate, a dedicated Marketplace Escrow Wallet is maintained by the platform.

| Rule | Detail |
| --- | --- |
| Applies to | All marketplace purchases of items proposed by a member (Proposing Member ≠ VGC Admin). |
| VGC Admin-owned items | Items listed directly by VGC Admin with no proposing member — tokens from purchases go directly to VGC Admin's VGC Token Wallet. |
| On purchase | When a buyer purchases a member-proposed item, the token amount is debited from the buyer's VGC Token Wallet and credited to the Marketplace Escrow Wallet — not to VGC Admin's wallet directly. |
| Escrow in PTS formula | Marketplace Escrow tokens are counted as part of T_admin in the Point Token Scheme formula. They represent tokens under Admin's control pending settlement. |
| On settlement | When VGC Admin manually marks an order as Settled, OR when the system auto-settles an order (7 days after proof of delivery with no dispute, per §6.8), the escrowed tokens for that order are automatically split per the agreed revenue sharing percentage. Proposing Member's share credited to their VGC Token Wallet. VGC Admin's share credited to VGC Admin's VGC Token Wallet. |
| On refund | Escrowed tokens are returned to the buyer's VGC Token Wallet in full. |

---

## 4. Point Token Scheme

**Intent —** Members need a controlled bridge between the soft economy (VGC Points, earned through participation) and the hard economy (VGC Tokens, used for purchases). The bridge is governed by a dynamic exchange rate computed from the platform's own real-time economic state. A flat 2.5% tax on every conversion sustains the platform.

### 4.1 The Dynamic Rate Formula

The rate is computed live by the platform from the following real-time inputs:

| Symbol | Meaning |
| --- | --- |
| I | VGC Admin's operational INR Receipt Ledger balance |
| R | VGC Reserve — funds held outside the ecosystem in FDs, Bonds, money market (still owned by VGC Admin) |
| A | Hard assets — listed marketplace inventory (at INR equivalent), signed time-bound sponsorship commitments (amortised over commitment period), and cash equivalents |
| T_member | Sum of all member VGC Token Wallet balances |
| T_admin | VGC Admin's VGC Token Wallet balance **plus** Marketplace Escrow Wallet balance (see §3.8) |
| P_member | Sum of all member VGC Points Wallet balances **plus** Contract escrow Points held by VGC Admin (belong to Giver until release) |
| P_admin | VGC Admin's VGC Points Wallet balance **minus** Contract escrow Points held by VGC Admin |
| L_invest | Pending investment liability — see §4.7 |
| t_idle | Minutes since the most recent Point Token Scheme conversion event. Capped at 43,200 minutes (30 days). |
| θ (theta) | Time-decay coefficient. Default 0.00005 per minute (0.005%/min). VGC Admin may adjust θ after any transaction; every change is logged (§4.10). θ is an internal governance parameter and is not displayed on the public rate dashboard. |

**Step 1 — Compute net obligations:**

> T_net = T_member − T_admin
>
> P_net = P_member − P_admin

**Step 2 — Guard checks:**

> If P_net ≤ 0 → Point Token Scheme is suspended. Rate dashboard displays: "Conversion temporarily unavailable — insufficient Points in circulation." Conversions re-enable automatically when P_net returns to > 0.
>
> Note on T_net: If T_admin > T_member, T_net will be negative. This is intentional — Admin holding more tokens than all members combined reverses the net obligation and increases the equilibrium rate. This behaviour is by design and is not capped or corrected.

**Step 3 — Compute the equilibrium rate (INR per VGC Point):**

> r_eq = ( I + R + A − L_invest − 10·T_net ) / P_net

> Note: The coefficient 10 in the formula represents the INR value of one VGC Token at the platform's launch buy rate of ₹10 per token. This coefficient is not automatically updated if VGC Admin revises the INR-to-Token buy rate (§3.2). Any revision to this coefficient requires a formal SRS amendment.

**Step 4 — Apply the time drift:**

> r_published = r_eq × ( 1 + θ · t_idle )

When any Point Token Scheme conversion executes, t_idle resets to 0 and r_published snaps back to r_eq. Between conversions, r_published drifts gradually in favour of VGC Points.

**Step 5 — Apply floor and conversion threshold (see §4.9):**

> If r_published < 0.0001 → r_published = 0.0001 (floor)
>
> If r_published < 0.00011 → conversions are disabled (rate is display-only)

**Step 6 — Member-facing rate (VGC Points per VGC Token):**

> R_user = 10 / r_published

This is the figure shown to members on the Point Token Scheme page.

### 4.2 Tax

- Flat 2.5% tax on the currency being given by the member
- If member is giving VGC Points: 2.5% deducted from the gross VGC Points amount before conversion
- If member is giving VGC Tokens: 2.5% deducted from the gross VGC Tokens amount before conversion
- Conversion happens on the remaining 97.5% after tax deduction
- Tax is credited to VGC Admin's corresponding wallet
- The 2.5% tax applies to all Point Token Scheme conversions regardless of who initiates them. There are no tax-exempt conversions.

### 4.3 Pre-Conversion Checks

| Check | Rule | If Failed |
| --- | --- | --- |
| P_net guard | P_net must be > 0 | Conversions suspended platform-wide |
| Member wallet balance | Must be ≥ gross amount specified | Cannot proceed |
| Admin wallet balance | Admin VGC Token Wallet must not go negative (when member gives Points); Admin VGC Points Wallet must not go negative (when member gives Tokens) | Message shown to reduce amount |
| Rate threshold | r_published must be ≥ 0.00011 | Conversions disabled platform-wide; rate displayed only |

### 4.4 Wallet Effects on Conversion

| Wallet | Points to Tokens | Tokens to Points |
| --- | --- | --- |
| Member VGC Points Wallet | Debited (gross amount specified — includes 2.5% tax routed to Admin plus 97.5% used for conversion) | Credited (97.5% of tokens given × R_user) |
| Member VGC Token Wallet | Credited (97.5% of points given ÷ R_user) | Debited (gross amount specified — includes 2.5% tax routed to Admin plus 97.5% used for conversion) |
| Admin VGC Points Wallet | Credited (2.5% tax of points given) | Debited (converted amount delivered to member) |
| Admin VGC Token Wallet | Debited (converted amount delivered to member) | Credited (2.5% tax of tokens given) |

### 4.5 Example Calculations

Assume r_published = 0.00222 INR per Point, i.e. R_user = 4,500 Points per Token.

#### Points to Tokens Example

Member specifies 1,000 VGC Points. Wallet debited 1,000 (gross). Tax: 25 Points → Admin's Points Wallet. Remaining: 975 Points. Tokens received: 975 / 4,500 = 0.2167 VGC Tokens.

#### Tokens to Points Example

Member specifies 10 VGC Tokens. Wallet debited 10 (gross). Tax: 0.25 Tokens → Admin's Token Wallet. Remaining: 9.75 Tokens. Points received: 9.75 × 4,500 = 43,875 VGC Points.

### 4.6 Income Split Rules

| Income Head | → I (Operational) | → R (Reserve) | Rationale |
| --- | --- | --- | --- |
| Donation | 80% | 20% | Reserve grows as a strategic emergency fund |
| Grant | 80% | 20% | Same as Donation |
| Sponsorship | 100% | 0% | Direct benefit to members; no buffer needed |
| Investment | 50% | 50% | Reserve half generates returns funding the investor's payout obligation |
| Token Purchase | 100% | 0% | 1:1 backed by Tokens issued; reserve not required |

### 4.7 Investment Liability Mechanics

| Stage | Mechanics |
| --- | --- |
| Investment received | Investment of amount X split per §4.6. A pending liability tracker L_invest_i initialised at zero. |
| Daily accrual | Conceptually L_invest_i increases by (1.1 · X) / 365 each day. **Free-plan implementation:** rather than a nightly scheduled task, L_invest_i is computed on demand at rate-request time as `min(1.1·X, (1.1·X / 365) · days_since_start)`, which is mathematically identical to the daily accrual and requires no background job (see §1.4.1). |
| Cap | L_invest_i caps at 1.1·X on or after Day 365. |
| Mid-investment overstating | For Option B, L_invest_i does not reduce after each quarterly interest payment — it continues accruing until the final payment. This deliberately overstates the liability mid-investment, acting as a conservative rate stabiliser. The small upward tick at final settlement (~0.02X released) corrects for this over-reservation. |
| Settlement | When investment is fully paid out, L_invest_i resets to zero. |
| Aggregate | L_invest in the formula is the sum of all L_invest_i across currently-active investments. |

### 4.8 Time Decay

| Aspect | Rule |
| --- | --- |
| Trigger | Any Point Token Scheme conversion. |
| Reset | On conversion, t_idle resets to 0 and r_published snaps to r_eq. |
| Drift direction | r_published grows above r_eq between conversions — each VGC Point becomes slightly more valuable per minute of inactivity. |
| Default rate | θ = 0.00005 per minute (≈ 0.005%/min, ≈ 7.4%/day if completely idle). |
| Cap on t_idle | t_idle is capped at 43,200 minutes (30 days). Beyond 30 days the drift multiplier does not increase further. If t_idle exceeds 10,080 minutes (7 days), VGC Admin receives an alert to assess platform activity. |
| Admin adjustment | VGC Admin may revise θ after any transaction. Each change is logged with timestamp, old value, new value and reason (see §4.10). θ is an internal governance tool — adjustments are not notified to members. |

### 4.9 Bootstrap Rules and Floor

| Rule | Detail |
| --- | --- |
| Initial seed — INR | VGC Admin seeds ₹50,000 into the operational INR Receipt Ledger (I) before public sign-ups open. |
| Initial seed — VGC Points | Before the Point Token Scheme goes live, VGC Admin issues a Constitutional Provision award to Vishal Gorana (the member whose foundational efforts created this ecosystem) with an appropriate remark. This ensures P_net > 0 before the first conversion, preventing the division-by-zero condition. The points amount and remark are permanently recorded in the Constitutional Provision log. |
| Floor on r_published | If the formula computes r_published below 0.0001, r_published defaults to 0.0001. |
| Conversion threshold | If r_published is below 0.00011, conversions are disabled platform-wide. Rate still displayed. |
| Re-enablement | Conversions automatically re-enable when r_published rises back to ≥ 0.00011. |

### 4.10 Transparency and Audit

| Element | Rule |
| --- | --- |
| Rate snapshot in transaction record | Every Point Token Scheme conversion entry in the member's Passbook records the exact r_published and R_user values used at the moment of conversion. |
| Public rate dashboard | A page accessible to every logged-in member displays: current r_published and R_user, all input components (I, R, A, T_net, P_net, L_invest, t_idle), a 24-hour rate chart with major events marked, and the formula itself. |
| θ-adjustment audit log | Every change to θ by VGC Admin is logged with timestamp, old value, new value and reason. The log is accessible in the Admin Panel audit trail. θ values and adjustments are not displayed on the public rate dashboard. |
| Component drill-down | Members may click any component on the dashboard to see its sub-composition (e.g. A breaks down into listed inventory + sponsorship + cash equivalents; L_invest breaks down per active investment). |

---

## 5. VGC Points Economy

**Intent —** VGC Points are the social and reputational currency of the ecosystem. They are minted when admin recognises member contributions, transferred peer-to-peer, and earned through everyday platform activity.

### 5.1 Nature of VGC Points

- VGC Points are a measure of effort and meaningful contribution
- General benchmark: 1 hour of effective effort = 12,000 VGC Points (not a fixed standard)
- VGC Points are transferable between members
- VGC Points are freshly minted by VGC Admin
- VGC Admin has their own VGC Points Wallet

### 5.2 Minting Provisions

| Provision | When Used | Effect on Member | Effect on Admin Wallet |
| --- | --- | --- | --- |
| Constitutional Provision | Activity reviewed by Admin / Admin motivational award | Receives VGC Points | Credited +30% of points given |
| Promotional Provision | Member joins Admin in reviewing / Admin motivational award | Receives VGC Points | Debited -25% of points given |

**Promotional Provision wallet check:** Before executing a Promotional Provision award, the system checks that VGC Admin's VGC Points Wallet holds at least 25% of the award amount. If the check fails, the Promotional Provision is blocked and Admin is prompted to use a Constitutional Provision instead or seed their own wallet first.

### 5.3 Monthly Minting Budget

To prevent unchecked VGC Points inflation (which would suppress the PTS exchange rate):

| Rule | Detail |
| --- | --- |
| Budget setting | VGC Admin sets a monthly VGC Points minting budget in the Admin Panel at the start of each month. |
| Budget tracking | System tracks total Points minted in the current month across both provision types. Admin Panel shows remaining monthly budget in real time. |
| Budget exceeded | Once the monthly budget is reached, only Constitutional Provision awards are permitted for the remainder of the month. Promotional Provisions are blocked. |
| Budget revision | Admin may revise the budget upward mid-month with a logged reason. Downward revision is not permitted mid-month. |
| No budget set | If Admin has not set a budget for the current month, all provisions proceed without restriction. A reminder notification is sent to Admin at the start of each month. |

### 5.4 Activity Rewards — Standard Table

VGC Admin maintains a Standard Activity Table (see Appendix A) defining VGC Points awarded for each activity. The table is version-controlled — any revision applies only to activities completed after the revision date. The current version is publicly visible to all logged-in members on the VGC Points Economy page. A change log of all revisions is maintained.

| Activity | Provision Type |
| --- | --- |
| Writing and publishing a blog | Constitutional Provision |
| Sharing own YouTube channel or video link | Constitutional Provision |
| Liking a blog or video | Promotional Provision |
| Blog or video reviewed by VGC Admin | Constitutional Provision |
| Joining VGC Admin in reviewing blog or video | Promotional Provision |
| Rating a session as a student (stars + testimony) | Constitutional Provision |
| Teacher rating a student after a session (per student rated) | Constitutional Provision |
| VGC Admin motivational award | Constitutional or Promotional |

Exact point values for each activity are defined in Appendix A.

### 5.5 VGC Points Transfer — Member to Member

Members can transfer VGC Points directly to other members. Transfers are instant and atomic. Every transfer is permanently recorded.

#### 5.5.1 Transfer Rules

| Aspect | Rule |
| --- | --- |
| Debit and credit timing | Instantaneous and atomic — sender debited and receiver credited in a single transaction |
| Balance check | Transfer amount must be ≤ sender's available balance. Insufficient balance blocks the transfer. |
| Reversibility | Transfers are final. The sender cannot reverse a transfer once submitted. |
| Dispute path | VGC Admin does not have the technical ability to reverse a completed VGC Points transfer. Mediation means Admin may facilitate a voluntary return transfer from the receiver to the sender if the receiver agrees. Admin cannot compel a reversal. |
| Notification | Both sender and receiver notified immediately. |
| Remark | Sender may optionally add a remark (visible to both parties in the ledger). |

### 5.6 Member Passbook — Transaction Entry Types

| Entry Type | Debit / Credit | Details Recorded |
| --- | --- | --- |
| Activity reward | Credit | Activity type, points, date |
| Admin award | Credit | Provision type, points, date, reason |
| Received transfer | Credit | Sender, amount, remark, date |
| Sent transfer | Debit | Receiver, amount, remark, date |
| Point Token Scheme (giving Points) | Debit | Points given (gross), tax, tokens received, rate, date |
| Point Token Scheme (giving Tokens) | Credit | Tokens given (gross), tax, points received, rate, date |
| Gaming season reward | Credit | Season, event, points, date |
| Education reward | Credit | Subject, chapter, points, date |

---

## 6. VGC Marketplace

**Intent —** A unified storefront for the entire ecosystem. Any member can propose items, VGC Admin curates and lists everything, and a same-vendor cart allows efficient checkout.

### 6.1 Overview

The VGC Marketplace is a unified platform where members can purchase items using VGC Tokens. It operates across all sectors.

### 6.2 Category Structure

| Level | Example |
| --- | --- |
| Level 1 | Education |
| Level 2 | Teachers |
| Level 3 | Online Sessions |
| Level 4 | Science |
| Level 5 | 9th Standard |
| Level 6 | Uzair's Sessions |
| Level 7 | English and Science Bundle |
| Level 8 | Final Item / Ticket |

### 6.3 Item Listing

- Only VGC Admin can list items on the marketplace
- Any member can propose marketplace items to VGC Admin
- VGC Admin discusses and agrees on all item details and revenue sharing before listing
- VGC Admin can also list items directly for VGC-owned items (no proposing member)
- Revenue sharing percentage is fixed at time of listing and cannot be changed

### 6.4 Standard Item Listing Table Fields

| Field | Description |
| --- | --- |
| Item ID | System-generated unique identifier |
| Item Name | Name of the item |
| Item Description | Detailed description |
| Sector | Gaming / Education / Financial / General |
| Category Path | Full folder path from Level 1 to final item |
| Item Type | Physical / Digital / License / Ticket / Session / Real World |
| Listed By | VGC Admin |
| Proposing Member | Member who proposed the item. Blank for VGC Admin-owned items. |
| Price | In VGC Tokens |
| Quantity Available | If applicable |
| Revenue Sharing % | Proposing Member % and VGC Admin % clearly stated. 100% VGC Admin for Admin-owned items. |
| Delivery Type | Digital / Physical / Real World payment |
| Buyer Information Fields | Up to 8 custom fields defined by proposing member |
| Date of Listing | When item was listed |
| Status | Active / Inactive / Closed |

### 6.5 Buyer Information Fields

| Input Type | Example Use |
| --- | --- |
| Text | Name, address, free-form answer |
| Number | Quantity, mobile number, PIN code |
| Dropdown | Operator selection, state, plan |
| File Upload | Document submission, photo proof |
| Date Picker | Preferred delivery date, session date |
| Yes / No Checkbox | Consent, confirmation |

### 6.6 Cart

Members may add multiple items to a cart before checking out.

| Rule | Detail |
| --- | --- |
| Same proposing member constraint | All items in a single cart checkout must have the same Proposing Member. VGC Admin-owned items form their own cart grouping. |
| Adding items | Members add items to cart from individual item pages. Cart icon shows current count. |
| Mixed cart attempt | If a member tries to add an item from a different proposing member to an existing cart, the system prompts: "Your cart contains items from [Proposing Member Name]. Start a new cart for this item?" Accepting creates a separate cart. |
| Checkout | Member reviews cart, fills buyer information fields for each item, confirms, and places the order. Token balance must cover the full cart total. |
| Token balance check | Balance is re-verified atomically at the moment of confirmation — not at cart entry. If balance is insufficient at confirmation, the order is rejected and the member sees their updated balance. |
| Order creation | Each item in the cart generates a separate Order ID for independent fulfillment tracking. |
| Stale cart item | If an item in the cart becomes Inactive or its available quantity reaches zero before the member confirms checkout, the system automatically removes it from the cart, notifies the member, and recalculates the cart total before presenting the confirmation screen. |

### 6.7 Purchase Flow

- Member browses marketplace and adds items to cart (all from the same proposing member or Admin-owned)
- System performs atomic balance check at order confirmation
- If insufficient, order is rejected
- If sufficient, VGC Tokens are immediately debited from the buyer's wallet
- For member-proposed items: tokens credited to the Marketplace Escrow Wallet (see §3.8)
- For VGC Admin-owned items: tokens credited directly to VGC Admin's VGC Token Wallet
- VGC Admin and Proposing Member are both notified of the order

### 6.8 Order Fulfillment and Settlement

| Stage | Action | Responsible |
| --- | --- | --- |
| Fulfillment | Ensure successful delivery | 100% Proposing Member / Vendor |
| Proof of Delivery | Submit proof to VGC Admin and buyer within 14 days of order placement | Proposing Member |
| Dispute Window | 7 days from proof of delivery receipt | Buyer |
| Dispute Resolution | Full refund / Partial refund / Vendor favour | VGC Admin (sole discretion) |
| Settlement Request | Mark order as settled and request payout | Proposing Member |
| Payout | Release tokens from Marketplace Escrow per agreed % | VGC Admin |
| Auto-settlement | System marks settled if no dispute after 7 days from proof of delivery | System |
| No proof submitted | If no proof submitted within 14 days, VGC Admin is notified. Admin may follow up, mark as Disputed, or issue a full refund. After 30 days of no action by the Proposing Member, system auto-refunds the buyer and marks the order Cancelled. VGC Admin may extend this deadline for items with agreed lead times. |

### 6.9 Real World Items

Some marketplace items such as mobile recharges require VGC Admin to make an actual INR payment to fulfil the order. The member pays the fixed VGC Token price. The actual INR cost may vary. VGC Admin logs this outgoing INR payment as a Platform Outflow entry in the Expense Tracker (§10).

---

## 7. Groups

**Intent —** Members need spaces to self-organise around shared interests, projects, or sectors.

### 7.1 Overview

The Groups feature is available to all logged-in members. Members can create groups, join existing groups, and interact through group posts. Groups are tied to a single sector.

### 7.2 Group Types

| Group Type | Description |
| --- | --- |
| Public | Visible and joinable by any logged-in member. Posts readable by all logged-in members, including members who have not joined the group. Public group content is not accessible to unauthenticated visitors. |
| Private | Visible to all logged-in members (name, description and sector shown) but posts readable only by group members. Joining requires approval. |

### 7.3 Group Discovery and Default View

All groups are discoverable by all logged-in members. Default view filtered by the member's sector of interest. Members can change filter to any sector or all sectors.

### 7.4 Group Creation

| Field | Type | Notes |
| --- | --- | --- |
| Group Name | Text | Unique and descriptive |
| Group Description | Text | Purpose of the group |
| Sector | Dropdown | Gaming, Education, Financial or General |
| Group Type | Dropdown | Public or Private |
| Group Icon / Cover Image | File Upload | Optional |

### 7.5 Group Roles and Permissions

| Role | How Assigned | Key Permissions |
| --- | --- | --- |
| Group Admin | Creator automatically becomes Group Admin | All permissions: manage members, approve join requests, invite members, promote Co-Admins, transfer admin status, delete group |
| Co-Admin | Promoted by Group Admin | Approve join requests, invite members, remove posts, remove members (cannot delete group or transfer admin) |
| Member | Joins via request or invitation | Create posts, comment, react, view group content |

#### 7.5.1 Group Admin Rules

| Situation | Rule |
| --- | --- |
| Admin wants to leave | Must transfer admin status to another group member first. Cannot leave without transferring. |
| Admin wants to delete | Initiates deletion. A 24-hour deletion hold is applied. All group members are notified via in-app and email that the group will be deleted in 24 hours. Members may save their own content during the hold. After 24 hours all posts and member records are permanently removed. |
| Admin wants to transfer admin status | Can transfer to any current member. Receiving member becomes new Group Admin; previous admin becomes regular member. |
| Admin is the only member | May delete the group directly without the 24-hour hold. |

### 7.6 Joining a Group

| Group Type | Method | Approval Required |
| --- | --- | --- |
| Public | Member clicks Join — directly added | No |
| Private (request) | Member sends a join request | Yes — Group Admin or Co-Admin approves or rejects |
| Private (invite) | Group Admin or Co-Admin sends an invite | Member accepts or declines |

### 7.7 Member Removal

| Aspect | Rule |
| --- | --- |
| Effect of removal | Removed member immediately loses access to the group and its posts |
| Rejoining after removal | Cannot rejoin on their own — blocked from the group |
| Re-entry via Group Admin | Only the Group Admin can re-invite a removed member |
| Co-Admin limitation | Co-Admins cannot re-invite removed members |
| Appeal to VGC Admin | A removed member may submit a reinstatement appeal to VGC Admin. Admin reviews and may reinstate the member if removal was in error. A VGC Admin reinstatement overrides the Group Admin or Co-Admin's decision. |

### 7.8 Post Content

| Content Type | Description |
| --- | --- |
| Text | Plain text. Composed in a `<textarea>`, so the author's line breaks and blank lines are the formatting, and the post preserves them exactly as typed. A body longer than five lines is collapsed behind a **See more** control. Posts stored as HTML by earlier revisions still render as formatted text |
| Images | Photo or image uploads |
| GIFs | Animated GIFs from upload |
| Videos | Video file uploads or video links |
| Polls | Multiple choice polls |
| File Attachments | Documents, PDFs and other files |
| Link Previews | Shared URLs with auto-generated preview thumbnails |

### 7.9 Post Visibility

| Group Type | Who Can Read Posts |
| --- | --- |
| Public | All logged-in members |
| Private | Group members only |

### 7.10 Moderation

| Moderator | Moderation Powers |
| --- | --- |
| Group Admin and Co-Admins | Remove posts, remove members, approve or reject join requests |
| VGC Admin | Remove posts, remove members from any group, delete any group that violates platform rules |

### 7.11 Notifications

| Event | Notified Parties |
| --- | --- |
| New post in a group | All members of the group |
| New comment on a post | Post author |
| Reply to a comment | Original commenter |
| Join request received (Private group) | Group Admin and Co-Admins |
| Join request approved or rejected | Requesting member |
| Invite sent to a member | Invited member |
| Member removed from group | Removed member |
| Admin status transferred | New Group Admin and previous Group Admin |
| Group deletion announced (24-hour hold) | All group members |

---

## 8. Blog

**Intent —** Long-form member content is valuable to the ecosystem. The Blog feature rewards effort with VGC Points, gives writers a Revenue Generator monetisation path, and keeps editorial oversight in VGC Admin's hands.

### 8.1 Overview

The Blog feature is available to all logged-in members. Any member can write and store blogs. A blog is private until published. Blogs support rich media and are tagged to one sector and multiple descriptive tags.

### 8.2 Blog Statuses

| Status | Description |
| --- | --- |
| Draft | Written and saved. Visible only to author. |
| In Review | Submitted for VGC Admin review. Visible only to author. |
| Published | Approved by VGC Admin. Visible per visibility rules. |
| Rejected | Reviewed but not approved. Visible only to author. Member may edit and resubmit. |
| Abandoned | Member has relinquished ownership. Blog slot freed. Blog remains under VGC Admin control. |
| Taken Down | Removed by VGC Admin. No longer visible to others. |

### 8.3 Writing a Blog

| Field | Type | Notes |
| --- | --- | --- |
| Blog Title | Text | Title of the blog post |
| Blog Content | Rich Content | Supports text, images, videos, GIFs, embedded links and file attachments |
| Sector | Dropdown | One sector — mandatory |
| Tags | Multi-select | Multiple tags for discovery |
| Comments Enabled | Toggle | Can be changed after publishing |

There is no cap on the number of blogs a member may write or hold.

### 8.4 Review and Approval Flow

| Step | Detail |
| --- | --- |
| 1. Member submits for review | Blog status changes to In Review. VGC Admin notified. |
| 2. VGC Admin reviews | Admin reads the blog and decides to approve or reject. |
| 3. Admin specifies Constitutional Provision points | Mandatory for both approval and rejection. Points can be 0 to any amount. |
| 4a. Approved | Blog status changes to Published. Member receives specified VGC Points. |
| 4b. Rejected | Blog status remains Rejected. Member receives specified VGC Points (may be 0). Member may edit and resubmit. |

### 8.5 Revenue Generator Blogs

| Aspect | Rule |
| --- | --- |
| Eligibility | Any member with a Published blog. No subscription required. |
| Prerequisite | Blog must already be approved and published before a Revenue Generator ticket can be proposed. |
| Marketplace item proposal | Author proposes a view ticket to VGC Admin via the standard marketplace proposal process (§6.3). |
| Listing | VGC Admin reviews and lists the ticket. Revenue sharing agreed and fixed at listing. Typically 90% to author, 10% to VGC Admin. |
| Blog visibility after conversion | Blog becomes visible only to members who have purchased the view ticket. |
| Grandfathering | Members who had already liked or commented on the blog before it became a Revenue Generator retain read access at no charge. All new readers require a ticket. |

### 8.6 Blog Visibility

| Blog State | Visible To |
| --- | --- |
| Draft | Author only |
| In Review | Author only |
| Rejected | Author only |
| Published (standard) | All logged-in members |
| Published (Revenue Generator) | Members who have purchased the view ticket + grandfathered prior readers |
| Abandoned | Under VGC Admin control |
| Taken Down | Not visible to others. Author can see it in their blog list. |

### 8.7 Blog Deletion and Abandonment

| VGC Points Earned | Blog State | Member Action Available | Outcome |
| --- | --- | --- | --- |
| 0 points | Draft or Rejected (never published) | Delete permanently | Blog permanently removed |
| 0 points | Published | Abandon only | Blog remains under VGC Admin control |
| More than 0 points | Any | Abandon only | Blog slot freed; blog remains under VGC Admin control |

A Published blog — regardless of points awarded — cannot be permanently deleted by the member. This protects content the community has already engaged with.

Before confirming abandonment the member is shown a plain disclaimer: ownership will be permanently transferred to VGC Admin, the blog will be removed from the public feed, and the record is retained in the backend for audit purposes. VGC Admin has full discretion over the abandoned content.

### 8.8 Engagement

| Feature | Detail |
| --- | --- |
| Likes | Any logged-in member who can view the blog may like it. |
| Comments | Any logged-in member who can view the blog may comment. Author can enable or disable comments at any time. |
| Default sector view | Members see blogs matching their sector of interest by default. Filter can be changed. |
| Search and discovery | Blogs are searchable by sector tag and descriptive tags. |

### 8.9 Moderation

| Moderator | Powers |
| --- | --- |
| VGC Admin | Can take down any published blog. When a Revenue Generator blog is taken down, its ticket is automatically closed and all ticket purchasers receive a full VGC Token refund. Can permanently delete any Abandoned blog. |
| Blog Author | Can delete their blog (if never published and 0 points earned) or abandon it. Can enable or disable comments at any time. |

### 8.10 Notifications

| Event | Notified Parties |
| --- | --- |
| Blog submitted for review | VGC Admin |
| Blog approved and published | Blog author |
| Blog rejected | Blog author |
| Blog taken down by VGC Admin | Blog author |
| Revenue Generator blog taken down — ticket closed and refunded | All members who purchased the view ticket |
| Revenue Generator ticket listed on marketplace | Blog author |
| Revenue Generator ticket purchased | VGC Admin and Blog author |
| New comment on a blog | Blog author |

---

## 9. Loan to Members

**Intent —** VGC Admin extends short-term INR assistance to members in need with no collateral. The facility is interest-free for the first year, and charges interest only after that. This keeps it what it is meant to be — a short-term welfare bridge — without turning a late repayment into a penalty the member cannot climb out of.

> **Revised 2026-08-01.** §9.5–§9.6 previously specified a three-phase mechanism (help at ₹10/token, a Year-2 rebase at the ₹8.50 surrender rate, then 10% p.a. from Year 3). That structure was replaced by the owner and this section now describes what is built. See §9.5.

### 9.1 Overview

Any logged-in member may submit a loan request to VGC Admin. Approved loans are tracked by a unique Loan ID. Repayment is in VGC Tokens. A member may hold multiple active loans simultaneously.

### 9.2 Loan Request Form

| Field | Type | Notes |
| --- | --- | --- |
| Member ID | Text | Auto-filled from session |
| Full Name | Text | Auto-filled from profile |
| Mobile Number | Number | Auto-filled from profile |
| INR Amount Requested | Number | Amount needed |
| UPI ID | Text | For INR transfer on approval. The disbursement is sent here, so it is required. |
| Repayment Period | Select | **Minimum 12 months.** Longer terms are offered (12/18/24/36/48/60); shorter ones are not. The Planned Return Date is derived from this. |
| Planned Return Date | Date | Derived from the repayment period. Not merely informational — it can end the interest-free window early (§9.5). Enforced server-side at ≥ 12 months from today. |
| Purpose / Reason | Text | Member states the reason |
| Supporting Document | File Upload | Optional. Stored as a Cloudinary URL — Xano file storage is unavailable on the current plan. |
| Date of Request | DateTime | Auto-filled by system |

**Confirmation before submission.** The member is shown every field back — amount, term, return date, UPI ID, purpose, document, the tokens they will owe, and the interest terms — and nothing reaches VGC Admin until they confirm it.

### 9.3 Loan States

| State | Description | Triggered By |
| --- | --- | --- |
| Pending | Awaiting VGC Admin review | Member submits form |
| Rejected | Admin declined the request | VGC Admin marks Rejected |
| Approved | Admin approved and transferred INR | VGC Admin marks Approved |
| Active | Loan live with outstanding balance | Set alongside Approved |
| Settled | Member fully repaid | System marks when balance = 0 |
| Written Off | Admin forgiven the balance | VGC Admin marks Written Off |

### 9.4 Loan Approval Flow

| Step | Detail |
| --- | --- |
| 1. Member submits request | Loan ID generated. Status: Pending. VGC Admin notified. |
| 2. VGC Admin reviews | Admin views purpose, amount, UPI ID and document. |
| 3a. Rejected | Status: Rejected. Member notified. No INR transferred. |
| 3b. Approved | Admin transfers INR to member's UPI ID. Admin records the actual INR transferred and the transfer reference, and marks Approved. |
| 4. Loan becomes Active | The token principal owed is established and the interest-free window is fixed. Status: Active. **The member's token wallet is not debited** — see §9.5. |

### 9.5 Interest Mechanism

**The debt is the loan's outstanding balance, and nothing else.** Approval records what the member owes in VGC Tokens; it does not touch their wallet. Tokens move exactly once, when the member repays (§9.7).

> This replaced an earlier design in which approval debited the token wallet *and* set the loan's outstanding balance to the same figure, while repayment debited the wallet again. That charged the same debt twice: a member with a ₹25,250 loan held a wallet at −2,525 tokens against an outstanding of 2,525, and reaching Settled would have cost 2,525 tokens to return the wallet to zero plus 2,525 more to hand over. The approval-day debit also had no matching credit anywhere, so the tokens were destroyed rather than transferred.

**Principal.** On approval, the member owes:

```
principal_tokens = INR actually disbursed / buy rate   (₹10 per token by default)
```

**Interest-free window.** No interest accrues until:

```
interest_free_until = the EARLIER of
    approval date + 365 days
    the member's Planned Return Date
```

This is fixed at approval and stored on the loan, so a later edit to the Planned Return Date cannot move a member's terms retroactively. Because the minimum term is 12 months (§9.2), in practice the window is a full year unless the member chose exactly 12 months and approval was delayed.

**After the window.** 10% per annum, **simple**, accrued per whole day on the **unpaid principal only** — never on unpaid interest:

```
daily interest = principal outstanding × 0.10 / 365
```

Whole days rather than fractions, so a member checking twice in one day sees the same figure both times; the remainder carries forward rather than being lost. Settling one month late costs roughly 0.83%, not a full year's interest.

**When it is charged.** Accrual is lazy — computed on read rather than by a nightly job, because scheduled tasks are a paid Xano feature not available on the current plan. It is idempotent: charging depends only on the elapsed time since interest was last settled, so reading twice charges once. Read-only screens (the admin list) project the same figure arithmetically from the stored row without writing.

**A written-off or settled loan stops accruing permanently.**

| Period | Method | Notes |
| --- | --- | --- |
| Approval | `principal = INR disbursed / ₹10` | Recorded as the loan's opening balance. Wallet untouched. |
| Approval → interest-free date | No interest | The member owes exactly the principal. |
| After the interest-free date | `+ principal × 10% / 365` per day | Simple, on unpaid principal. Continues until Settled or Written Off — there is no year at which it stops. |

### 9.6 Worked Example

A ₹18,000 loan taken over a 24-month term, approved 1 Aug 2026. The interest-free window is one year — the 24-month term does not extend it.

| Event | Calculation | Principal | Interest | Outstanding |
| --- | --- | --- | --- | --- |
| 1 Aug 2026 — Approval | ₹18,000 / ₹10 | 1,800.00 | 0.00 | 1,800.00 |
| 1 Oct 2026 — Member repays 500 tokens | Inside the free window, all of it clears principal | 1,300.00 | 0.00 | 1,300.00 |
| 1 Aug 2027 — Interest-free window ends | Nothing charged on the day itself | 1,300.00 | 0.00 | 1,300.00 |
| 5 Sep 2027 — 35 days later | 1,300 × 10% × 35/365 = 12.47 | 1,300.00 | 12.47 | 1,312.47 |
| 5 Sep 2027 — Member repays 100 tokens | Interest first (12.47), then principal (87.53) | 1,212.47 | 0.00 | 1,212.47 |
| 4 Sep 2028 — 365 days later | 1,212.47 × 10% × 365/365 = 121.25 | 1,212.47 | 121.25 | 1,333.71 |

Had the member settled the full 1,800 before 1 Aug 2027, the loan would have cost them nothing beyond the principal.

### 9.7 Member Repayment

| Aspect | Rule |
| --- | --- |
| Payment method | Member initiates payment from the Loan details view. Tokens are debited from the member's wallet and credited to VGC Admin's VGC Token Wallet. The member must hold the tokens — this debit is balance-checked. |
| Allocation | Accrued interest is cleared first, then principal. Each payment records the split so the member can see it rather than infer it. |
| Installments | Any number of installments of any amount at any time. |
| Full settlement | A "settle in full" action exists as its own control rather than an amount to type: accrued interest carries more decimal places than a member can enter, so no typed figure lands exactly on zero. |
| Overpayment | Refused. A payment may not exceed the current outstanding balance. |
| Settled loans | Accept no further repayments and accrue no further interest. |
| Multiple active loans | Each Loan ID is tracked independently, and interest accrues per loan. Loans are processed in Loan ID order. |
| Consolidated position | Members with more than one active loan see the combined outstanding — split into principal and interest — above the list, plus a per-loan schedule showing the interest-free date, days remaining, and what interest will cost once it starts. |

### 9.8 Loan ID Details View

| Information | Detail |
| --- | --- |
| Loan ID | Unique system identifier |
| Status | Current state |
| INR Amount Requested / Approved | What was asked for, and what VGC Admin actually transferred |
| UPI ID | Where the disbursement was sent |
| Transfer Reference | Admin's UPI/bank reference for the transfer |
| Repayment Period | Term in months, as chosen |
| Planned Return Date | Member's stated date at application |
| Date of Approval | When the loan became Active |
| Interest-Free Until | The date after which 10% p.a. begins (§9.5) |
| Principal Owed at Approval | Opening token balance |
| Current Outstanding Balance | VGC Tokens currently owed, split into principal and accrued interest |
| Charge History | Opening balance and any interest charged, with date and calculation |
| Repayment History | All repayments with date, tokens paid, and the interest/principal split |
| Supporting Document | Link to the member's uploaded document, if any |
| Reason | Rejection reason or write-off reason, where applicable |

The same information — plus the member's name, member ID, email and mobile — is available to VGC Admin from the Loan Management screen, since approving a loan means transferring real money to the UPI ID shown.

### 9.9 Written Off

VGC Admin may write off a loan when one or more of the following applies: (a) outstanding balance is below the minimum threshold set by Admin in the Admin Panel; (b) member has documented hardship; (c) loan has been Active for more than 5 years with no repayment activity. Write-off decisions are logged with a stated reason in the Admin Panel audit trail.

| Action | Effect |
| --- | --- |
| VGC Admin marks Written Off | Interest is brought up to date first, so the audit trail records the real figure being forgiven. Outstanding balance, principal and accrued interest all set to zero. No further interest. Loan ID closed. Member notified of the amount cleared. |

### 9.10 Notifications

| Event | Notified Parties |
| --- | --- |
| Loan request submitted | VGC Admin (with amount, term and UPI ID) |
| Loan request approved | Member (with amount, UPI ID, tokens owed and the interest terms) |
| Loan request rejected | Member (with the admin's stated reason — a reason is required) |
| Repayment made | VGC Admin and Member (member's notice carries the interest/principal split) |
| Loan fully settled | Member and VGC Admin |
| Loan written off | Member (with the amount cleared) |

Interest accrues continuously rather than as discrete annual events, so there is no "annual debit applied" notification. The member sees the running interest figure and a countdown to the interest-free date on the Loans screen instead.

---

## 10. Expense Tracker

**Intent —** Every member gets a personal expense ledger. For VGC Admin, this module is the sole mechanism through which the Admin INR Receipt Ledger is debited. Admin's Platform Outflow entries are publicly visible to all logged-in members, supporting ecosystem transparency.

### 10.1 Overview

The Expense Tracker is available to all logged-in members. Members record real-world expenses privately. For VGC Admin, every outgoing INR payment must be logged as a Platform Outflow entry — this is the sole debit mechanism for the Admin INR Receipt Ledger. Platform Outflow entries are visible (read-only) to all logged-in members on the Platform Financial Ledger page. All other entries are strictly private.

### 10.2 Expense Entry Form

| Field | Type | Notes |
| --- | --- | --- |
| Entry ID | Auto | System-generated |
| Date of Payment | Date | Date of expense |
| Amount (INR) | Number | Amount in INR |
| Payment Mode | Dropdown | Cash, UPI, Debit Card, Credit Card, Net Banking, Cheque, Mobile Wallet, EMI, BNPL, Other |
| Platform / Reference | Conditional | Additional fields based on Payment Mode (see §10.3) |
| Main Category | Dropdown | 15 main categories (see §10.4) |
| Specific Category | Dropdown | Dependent on Main Category |
| Reason / Remark | Text | Free-form note or informal IOU detail |
| Entry Type | Dropdown | **Personal** (default for all members — does not affect any wallet) / **Platform Outflow** (VGC Admin only — debits the Admin INR Receipt Ledger). The Entry Type dropdown is available only in the Admin's expense entry form; general members do not see this field. Platform Outflow entries created by Admin are publicly visible on the Platform Financial Ledger page (see §10.1); all other entries remain private. |
| Remark Visibility | Toggle | **VGC Admin only, applies to Platform Outflow entries only.** Admin may set the Reason / Remark field for each Platform Outflow entry to **Public** (the remark is shown on the Platform Financial Ledger page) or **Private** (the remark is visible only in the Admin interface). Default is Private. All other Platform Outflow fields (date, amount, main category, specific category, payment mode) are always visible on the public Platform Financial Ledger page regardless of this setting. |
| Settlement Status | Toggle | Pending (default) or Settled |
| Date of Entry | Auto | System timestamp |

**Settlement confirmation:** Marking an entry as Settled requires the member to confirm via a dialog: *"Once marked Settled, this entry cannot be edited or deleted. Confirm?"* After confirmation, the entry is permanently locked. There is no undo window.

### 10.3 Payment Mode and Platform Details

| Payment Mode | Platform / Bank Field | Reference / Additional Field |
| --- | --- | --- |
| Cash | None | None |
| UPI | Dropdown: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, Cred, WhatsApp Pay, Other | UPI Transaction ID (optional) |
| Debit Card | Dropdown of major banks: SBI, HDFC, ICICI, Axis, Kotak, PNB, Bank of Baroda, Canara, Yes Bank, IndusInd, Other | Transaction Reference (optional) |
| Credit Card | Dropdown: HDFC, ICICI, SBI, Axis, Kotak, Amex, Citibank, IDFC First, Yes Bank, IndusInd, Other | Transaction Reference (optional) |
| Net Banking | Free text — member enters bank name | UTR Number (optional) |
| Cheque | Free text — member enters bank name | Cheque Number (optional) |
| Mobile Wallet | Dropdown: Paytm Wallet, Amazon Pay Balance, Mobikwik, Freecharge, JioMoney, Other | Transaction Reference (optional) |
| EMI | Free text — member enters lender or platform name | EMI Reference (optional) |
| Buy Now Pay Later (BNPL) | Dropdown: Simpl, LazyPay, ZestMoney, Amazon Pay Later, Flipkart Pay Later, Other | Order Reference (optional) |
| Other | Free text — member describes the payment method | Reference (optional) |

### 10.4 Main Categories and Specific Categories

| Main Category | Specific Categories |
| --- | --- |
| Household | Rent / Mortgage, Electricity, Water, Gas / LPG Cylinder, Internet / Broadband, Cable / DTH, Society / Maintenance Charges, Home Repairs / Renovation, Domestic Help, Furniture / Fixtures, Home Appliances, Pest Control, Home Security |
| Food & Dining | Groceries / Vegetables, Restaurant / Cafe / Dhaba, Food Delivery, Snacks / Street Food, Beverages, Bakery / Sweets / Mithai |
| Transportation | Petrol / Diesel / CNG, Vehicle Servicing / Repair, Auto / Rickshaw / E-Rickshaw, Cab / Taxi, Bus / Metro / Local Train, Toll / Parking, Vehicle Insurance, Vehicle EMI, Air Travel, Rail Travel, Road Trip / Interstate Travel |
| Healthcare & Medical | Doctor / Consultation Fee, Medicines / Pharmacy, Diagnostic / Lab Tests, Hospitalisation / Surgery, Dental Treatment, Eye Care / Optician, Mental Health / Therapy, Health Insurance Premium, Gym / Fitness / Yoga |
| Education | School / College Fees, Tuition / Coaching Classes, Books / Stationery, Online Courses / Certifications, Examination / Application Fees, Uniforms / School Supplies, School Events / Trips |
| Shopping & Lifestyle | Clothing / Apparel, Footwear, Electronics / Gadgets, Mobile / Accessories, Personal Care / Grooming / Salon, Jewellery / Watches, Home Decor, Gifts / Presents, Toys / Games, Sports Equipment |
| Entertainment & Leisure | Movies / Cinema, OTT / Streaming Subscriptions, Gaming, Sports / Fitness Activities, Concerts / Shows / Events, Books / Magazines, Hobbies / Crafts / Art, Amusement / Theme Parks |
| Travel & Holidays | Hotel / Accommodation, Flight Tickets, Train / Bus Tickets, Sightseeing / Entry Tickets, Travel Insurance, Foreign Exchange / Forex, Travel Accessories / Luggage, Holiday Shopping |
| Financial & Insurance | Loan EMI Repayment, Credit Card Bill Payment, Life Insurance Premium, Vehicle Insurance Premium, Home Insurance Premium, Mutual Fund / SIP, Fixed Deposit / RD, Taxes / Government Fees, Professional Fees |
| Office & Business | Office Supplies / Stationery, Business Travel / Conveyance, Client Entertainment, Courier / Delivery / Logistics, Software / Tools Subscription, Equipment / Machinery, Marketing / Advertising, Printing / Photocopying, Business Registration / Legal, Employee Salaries / Wages |
| Utilities & Subscriptions | Mobile Recharge / Postpaid Bill, Landline / Broadband Bill, Streaming Platforms, Software / App Subscriptions, Cloud Storage / Hosting, Domain / Website |
| Social & Occasions | Wedding / Reception, Birthday / Anniversary, Religious Ceremony / Pooja / Festival, Donations / Charity, Gifts to Others, Party / Celebration |
| Pets | Veterinary / Medical, Pet Food / Treats, Grooming, Pet Accessories, Pet Medicines |
| Remittance & Transfers | Family Support / Sent to Family, Paid on Behalf of Someone, Rent Paid to Landlord, Friend / Colleague Reimbursement Given |
| Miscellaneous | Unclassified Expense, Other |

### 10.5 Entry States and Edit / Delete Rules

| Status | Description | Edit / Delete Allowed |
| --- | --- | --- |
| Pending | Default status. Expense unresolved. | Yes |
| Settled | Member confirmed expense fully resolved. Permanently locked after confirmation dialog. | No |

### 10.6 Dashboard and Summary View

| Dashboard Element | Detail |
| --- | --- |
| Total Expenses Recorded | Sum of all entries (Pending and Settled) in INR |
| Pending vs Settled Breakdown | Count and INR value of each |
| Spending by Main Category | Chart and table |
| Monthly Spending Summary | Total INR per month |
| Spending by Payment Mode | Breakdown by payment method |
| Recent Entries | Most recent entries with quick access |
| Filter and Search | Filter by date range, category, payment mode, settlement status. Full text search on Reason / Remark. |

---

## 11. Gaming Sector

**Intent —** Passionate members lead game-specific communities as Pioneers, running seasons of events, managing participants, and earning from their leadership. VGC Admin holds funds and adjudicates disputes, so Pioneers can focus on delivering great experiences while the ecosystem stays financially safe.

### 11.1 Community Games

Any game can become a Community Game in the VGC ecosystem. A game is formally listed only after VGC Admin reviews and approves a complete proposal submitted by the prospective Pioneer.

### 11.2 Becoming a Pioneer — Overview

To become a Pioneer, a member must purchase a designated Pioneer Candidacy marketplace item listed by VGC Admin. This purchase is the mechanism through which the non-refundable proposal fee is paid.

| Aspect | Rule |
| --- | --- |
| Proposal fee | 50 VGC Tokens — paid via the **New Game Proposal Candidacy** marketplace item listed by VGC Admin. This is a distinct item from the Election Candidacy item used in §11.6.1. |
| Refundability | Non-refundable regardless of outcome |
| What it unlocks | Access to submit all three sets of information (§11.3) |
| Simultaneous pioneerships | Maximum one active pioneership per member at any time |
| Role overlap | Pioneer can also be Manager and Treasurer of the same season |

### 11.3 Three-Set Information Structure

Every pioneer candidate must submit three distinct sets of information. All three are reviewed together by VGC Admin before any decision.

#### 11.3.1 Set 1 — Community Game Setup

| Field | Type | Notes |
| --- | --- | --- |
| Game Name | Text | Official name of the game |
| Game Logo | File Upload | Official logo |
| Game Genre | Text | e.g. Strategy, Battle Royale, Sports, Card Game |
| Game Preface | Rich Text | How this game should exist in the VGC ecosystem. Rendered as plain text today, and no screen writes it — see the implementation note in §11.3.3 |

#### 11.3.2 Set 2 — Season Details

| Field | Type | Notes |
| --- | --- | --- |
| Season Name | Text | Title of the proposed season |
| Season Image | File Upload | One image representing the season |
| Funding Type | Dropdown | Independent Funding or Secure Funding |
| Overall VGC Points Budget | Number | Total VGC Points Pioneer commits to distribute across all events |
| Starting Date | Date | Proposed season start date |
| Ending Date | Date | Proposed season end date (2 to 4 months duration) |
| Number of Events | Number | Total events planned |
| Event Details (per event) | Repeating block | For each event: Name, Image, Rules and Details, Rewarding Rules, Participant Information Fields (each with Label and Input Type: Text, Number, Dropdown, File Upload, Date Picker, Yes/No Checkbox) |
| Committee Members | Repeating block | For each member: Name, Image, Role (Manager / Treasurer) |

#### 11.3.3 Set 3 — Marketplace Item Proposal

| Field | Type | Notes |
| --- | --- | --- |
| Item Name | Text | Name of the marketplace item |
| Item Image(s) | File Upload | One or more images |
| Unit Price | Number | Price in VGC Tokens |
| Item Stock | Number | Number of units available |
| Item Description | Rich Text | Full description |
| Buyer Information Fields | Repeating block | Fields required from buyer — each with Label and Input Type |

> **Implementation note (2026-08-05).** Three fields this SRS types as **Rich
> Text** are built as plain text: Item Description (above), Game Preface
> (§11.3.1) and Course Description (§12.2). Their compose control is a plain
> `<textarea>`, not the rich editor used for blogs, contract requirements and
> detailed proposals — so the author's line breaks are the only formatting they
> carry, and the read screens now preserve those (`.text-block`). Game Preface
> has no compose screen at all; it is seeded.
>
> Whether these fields should gain the rich editor to match this specification,
> or the specification should be corrected to plain text, is **undecided** —
> recorded here rather than silently resolved in either direction.

### 11.4 Submission Rules — No Modifications Permitted

| Rule | Detail |
| --- | --- |
| No editing after submission | Once all three sets are submitted, no modifications are permitted under any circumstances. |
| Error or omission | Pioneer must purchase a new Pioneer Candidacy item and submit a completely fresh candidacy. The new submission supersedes the previous one for review purposes. The original 50-token fee is non-refundable. |
| Rationale | The submission represents a formal commitment to the community. Mistakes are not acceptable from a Pioneer. |

### 11.5 First-Time Community Game Listing (Season 1)

| Step | Detail |
| --- | --- |
| 1. Member purchases Pioneer Candidacy item | Access to all three submission sets unlocked |
| 2. Member submits all three sets | Community Game Setup, Season Details and Marketplace Item Proposal |
| 3. VGC Admin reviews | Admin evaluates all three sets together |
| 4a. Approved | Game listed as Community Game. Season and events set up. VGC Admin sends letter of invitation to Pioneer (see §11.7). |
| 4b. Rejected | Proposal declined at sole discretion of VGC Admin. The 50-token fee is non-refundable. |

### 11.6 Pioneer Elections (Season 2 Onwards)

#### 11.6.1 Candidacy Registration Window

| Aspect | Rule |
| --- | --- |
| Registration opens | Any time during the ongoing season |
| Registration closes | 15 days before the ongoing season ends |
| How to register | Candidate purchases the **Election Candidacy** marketplace item (a separate item from the New Game Proposal Candidacy item used in §11.2) and submits Set 2 and Set 3. Set 1 not required — game already listed. VGC Admin lists one Election Candidacy item per game per election cycle. |
| Candidacy deposit | 10 VGC Tokens per candidate — the price of the Election Candidacy item |
| Deposit return rule | Returned only if the candidate receives at least 3 votes. Forfeited if fewer than 3 votes — absolute rule regardless of whether the candidate wins. |
| Minimum candidates | At least 1 candidate must be registered for an election to be held |

#### 11.6.2 VGC Admin Candidate Review and Publishing

After registration window closes, VGC Admin reviews all submitted candidacies and publishes the official candidate list.

| Information Published | Detail |
| --- | --- |
| Candidate Name | Name of the contesting member |
| Proposed Season Preface | Candidate's vision |
| Events Summary | Overview of planned events |
| Funding Type | Independent or Secure |

#### 11.6.3 Election Timing and Voting

| Aspect | Rule |
| --- | --- |
| Election held | When 3 days are remaining in the ongoing season |
| Voting rights | All voters — including game group members — must purchase a voting rights ticket from the VGC Marketplace. There is no free voting for anyone. |
| Voting rights ticket price | Set by VGC Admin |
| Result | Candidate with maximum votes wins |
| Tie resolution | If two candidates are tied on maximum votes, VGC Admin casts the deciding vote. If three or more candidates are tied on the same maximum vote count, VGC Admin selects the winner directly. In all tie cases the selection and rationale are recorded publicly and visible to all members in the Election Results section for that game. |

### 11.7 Pioneer Invitation and Season Commencement

After election result or first-time pioneer selection, VGC Admin sends a formal letter of invitation to the new Pioneer.

#### 11.7.1 Independent Funding — Commencement

| Step | Rule |
| --- | --- |
| Pioneer accepts immediately | Pioneer confirms readiness. Season begins. Marketplace items go live. |
| Pioneer requests a grace period | Pioneer nominates a specific start date. VGC Admin reviews and either approves the delay or terminates the invitation. |

#### 11.7.2 Secure Funding — Commencement

| Step | Rule |
| --- | --- |
| Token deposit deadline | Pioneer must deposit agreed VGC Tokens with VGC Admin within 3 days of receiving the invitation |
| Deposit mechanism | VGC Admin lists a Secure Funding Deposit marketplace item priced at the deposit amount. Pioneer purchases it. |
| Tax on conversion | VGC Admin converts deposited tokens to VGC Points via the Point Token Scheme. The standard 2.5% tax applies to this conversion. The resulting VGC Points are 2.5% less than they would be at a tax-free rate. Pioneers selecting Secure Funding must account for this when estimating their VGC Points budget. The exact post-tax Points are shown to both Admin and Pioneer before the conversion is confirmed. |
| System auto-generates return item | Upon deposit confirmation, the system automatically creates a Deposit Return marketplace item in the pioneer's name. Price locked to exact deposit amount, visible only to VGC Admin, purchasable once, non-editable. |
| Points distribution | Pioneer receives 50% of the VGC Points obtained by VGC Admin from the conversion. VGC Admin retains the remaining 50%. |
| Season begins | Season goes live on the stated start date |
| Failure to deposit or start | If Pioneer does not deposit within 3 days or fails to start on the stated date, VGC Admin takes over management until a new Pioneer is elected. Admin may also terminate the game entirely. |

#### 11.7.3 Deposit Return at Season End (Secure Funding)

| Outcome | Rule |
| --- | --- |
| 80% distribution target met | VGC Admin purchases the auto-generated Deposit Return item — deposit returned to Pioneer's VGC Token Wallet. VGC Admin also distributes the 26% reward in VGC Points via Constitutional Provision: Pioneer 10%, Manager 8%, Treasurer 8% of total VGC Points distributed to participants. |
| 80% distribution target not met | VGC Admin purchases the Deposit Return item — deposit returned. No 26% reward paid. |

### 11.8 Mid-Season Pioneer Departure

If a Pioneer leaves or becomes unable to continue during an active season:

| Scenario | Rule |
| --- | --- |
| Committee member willing to take over | VGC Admin designates a willing committee member (Manager or Treasurer) as acting Pioneer. Season continues. All existing marketplace items and their agreed revenue splits remain unchanged for the remainder of the season. The original Pioneer forfeits all season-related marketplace revenue and rewards regardless of reason for departure. |
| Acting Pioneer completes the season | All season-end benefits (deposit return via Deposit Return item if applicable, 26% reward if target met, marketplace payout) accrue to the acting Pioneer and revised committee structure — not to the original Pioneer. |
| Season has Secure Funding and is terminated | If no committee member is willing and VGC Admin terminates the season, the original Pioneer's deposit is forfeited to VGC Admin. VGC Admin may compensate participants at sole discretion. |
| Season has Secure Funding and is completed by acting Pioneer | The Deposit Return item is purchased by VGC Admin at season end (deposit returned to the original Pioneer's VGC Token Wallet as it was their own money deposited). However, the original Pioneer receives no marketplace revenue and no 26% reward. |
| Season has Independent Funding | Original Pioneer forfeits all marketplace revenue for the remainder of the season to VGC Admin. |

### 11.9 Season Committee Roles

| Role | Responsibility |
| --- | --- |
| Pioneer | Proposing, managing events, overall season leadership |
| Manager | Handling queries, issues and participant problem solving |
| Treasurer | Managing all VGC Points funding for the season |

### 11.10 Season

- Duration: 2 to 4 months
- A season is a collection of events
- Pioneer sets rules and rewarding rules for each event at the time of candidacy submission
- All season data and results are archived at season end — viewable but not modifiable

### 11.11 VGC Points Distribution Records

For the 80% distribution target to be auditable, the Pioneer must formally record each reward given to participants. A Distribution Record captures:

| Field | Detail |
| --- | --- |
| Amount of VGC Points | The number of VGC Points being awarded |
| Member | The recipient member (Member ID and name) |
| Event Reference | The specific event for which this reward is being given |

The actual transfer of VGC Points happens via the member-to-member transfer mechanism. However, only transfers that have a corresponding Distribution Record with a valid event reference count toward the 80% distribution target.

**Example:** Pioneer has a budget of 1,000 VGC Points. An event awards 10 Points to every member who submits a screenshot of their in-game character. 50 members submit. Pioneer creates 50 Distribution Records (10 Points each, with the event reference) and transfers the Points. Total counted: 50 × 10 = 500 Points. Distribution rate: 500 / 1,000 × 100 = 50%. During the season the Pioneer also transfers 300 Points to a member for an activity outside event rules — no Distribution Record with an event reference is created for this transfer. Those 300 Points are not counted. Final rate remains 50%, below the 80% threshold, so the 26% reward is not paid.

VGC Admin verifies the distribution rate at season end by reviewing the Pioneer's Distribution Records against their outbound transfer ledger.

### 11.12 Season Page and Event Page

#### 11.12.1 Season Page

| Element | Detail |
| --- | --- |
| Season Name | Name of the season |
| Season Image | Visual identity |
| Pioneer Preface | Welcome message and vision |
| VGC Points Budget | Total Points committed for distribution |
| Funding Model Type | Independent or Secure |
| List of Events | All events — each clickable to its Event Page |
| Committee Members | Name, image and role of each member |

#### 11.12.2 Event Page

| Element | Detail |
| --- | --- |
| Event Name | Name of the event |
| Event Image | Visual for the event |
| Event Rules | Full rules and rewarding rules set by Pioneer |
| Participant Submission Form | All fields defined at setup |
| Processed Results | Scorecard-style presentation coordinated by VGC Admin and Pioneer — rankings, top performers, breakdowns |

### 11.13 Funding Models

#### 11.13.1 Independent Funding

| Aspect | Rule |
| --- | --- |
| Source of VGC Points | Pioneer's own VGC Points |
| Pioneer deposits tokens with Admin | No |
| Pioneer can post marketplace items | Yes |
| Commission on pioneer's marketplace sales | 10% to VGC Admin |
| Pioneer receives | 90% of marketplace item sales at season end |
| 26% reward | Not applicable |

#### 11.13.2 Secure Funding

| Aspect | Rule |
| --- | --- |
| Pioneer deposits VGC Tokens with Admin | Yes — via Secure Funding Deposit marketplace item |
| Tax on deposit conversion | 2.5% PTS tax applies when Admin converts the deposit to VGC Points (see §11.7.2) |
| VGC Points received by pioneer | 50% of VGC Points obtained after PTS conversion of deposit |
| Pioneer can post marketplace items | No |
| VGC Admin posts participation items | Yes — 100% of sales go to VGC Admin |
| Minimum distribution target | At least 80% of allocated VGC Points must be distributed to participants via formal Distribution Records (see §11.11) |
| If target met | Deposit returned via Deposit Return item + 26% reward in VGC Points (Pioneer 10%, Manager 8%, Treasurer 8%) |
| If target not met | Deposit returned via Deposit Return item. No 26% reward. |

### 11.14 Community Game Page Structure

#### 11.14.1 Community Games List Page

Each game shown with Game Logo and Game Name.

#### 11.14.2 Individual Game Page

| Element | Detail |
| --- | --- |
| Game Logo | Official logo |
| Game Name | Official name |
| Game Genre | Genre |
| Game Preface | Written by Pioneer |
| Link to Seasons | Navigates to Seasons area |
| Link to Election | Navigates to Election area |
| List of Members | All members associated with this game |

#### 11.14.3 Seasons Area

| Section | Element | Detail |
| --- | --- | --- |
| Active Season | Season Image, Name, Status | Live |
| Ended Seasons | Season Image, Name, Status | Ended |

#### 11.14.4 Season Page

As per §11.12.1.

#### 11.14.5 Event Page

As per §11.12.2.

#### 11.14.6 Election Window

| Element | Detail |
| --- | --- |
| Voting Rights Ticket | Link to purchase the voting rights ticket from VGC Marketplace. All voters must purchase this ticket regardless of group membership. |
| Past Election Results | Results of all previous elections |
| Candidates List | All registered candidates with Season Image, Season Name, Season Preface, VGC Points Budget, and Funding Model Type |
| Voting (when live) | When voting is open, member casts vote to a candidate |

---

## 12. Education Sector

**Intent —** Teaching is a first-class economic activity in the VGC ecosystem. Any member can propose a course ticket for VGC Admin to list. Students purchase tickets, attend sessions verified by QR check-in with Teacher manual verification, and rate their experience after each session.

### 12.1 Teacher

Any logged-in member can become a Teacher by proposing a course ticket to VGC Admin for listing on the VGC Marketplace. No interview, appointment, or permission fee is required. A Teacher and a Student are not mutually exclusive.

### 12.2 Course Ticket — Proposal Fields

| Field | Type | Notes |
| --- | --- | --- |
| Course Name | Text | Name of the course |
| Description | Rich Text | Topics, learning outcomes, prerequisites — see the implementation note in §11.3.3 |
| Course Image(s) | File Upload | One or more images |
| Price per Student | Number | In VGC Tokens |
| Total Seats | Number | Maximum students who can purchase |
| Sessions | Repeating block | For each session: Date (required), Start Time (required), End Time (required), Venue or Platform |
| Buyer Information Fields | Repeating block | Up to 8 custom fields — each with Label and Input Type |

### 12.3 Listing and Revenue Split

| Aspect | Rule |
| --- | --- |
| Review | VGC Admin reviews the proposal and lists if approved |
| Revenue split | Agreed on a case-by-case basis at listing. No minimum or maximum defined — entirely at VGC Admin's discretion. Default is 90% to Teacher, 10% to VGC Admin. Fixed at listing and cannot be changed after. |
| Payout eligibility | All sessions under that ticket must be Completed before Teacher can request payout |
| Payout request | Teacher initiates from Teacher Dashboard once all sessions are Completed |
| Payout processing | VGC Admin credits VGC Tokens to Teacher's wallet per agreed split |

### 12.4 Ticket Visibility Rules

| Ticket Type | Visibility Rule |
| --- | --- |
| Single-session ticket | Automatically hidden from marketplace after session's date and time passes |
| Multi-session ticket | Automatically hidden after the last session's date and time passes |

### 12.5 Session Amendments After Listing

After listing, the Teacher may propose amendments (rescheduling sessions or adding new sessions) by submitting a request to VGC Admin.

| Aspect | Rule |
| --- | --- |
| Standard review | VGC Admin must process amendment requests within 48 hours of submission. |
| Urgent amendments | If the amendment request is submitted within 48 hours of the session's scheduled start time, it is flagged as Urgent. Admin must process within 6 hours. If Admin fails to process an Urgent amendment in time, it is auto-approved. |
| On approval | Session dates and times updated. Ticket visibility window updates automatically. If the ticket was previously auto-hidden because the original session date had passed, it is made visible again on the marketplace for the period between the amendment approval date and the new session date. Ticket price and revenue split cannot be changed. |

### 12.6 QR Check-In and Teacher Manual Verification

Every session uses a QR check-in system followed by Teacher manual verification. Payment and attendance are tracked separately.

#### 12.6.1 Session and Enrollment Statuses

**Session statuses:**

| Status | Description |
| --- | --- |
| Scheduled | Session date is in the future. Ticket visible and purchasable. |
| Live | Teacher has started the session from their dashboard. Check-in is open. |
| Completed | Teacher has ended the session. Attendance finalised. Ratings unlock. |

**Enrollment statuses (per student per session):**

| Status | Description |
| --- | --- |
| Purchased | Student has bought the ticket. Not yet checked in. |
| Checked-in | Student's QR code has been scanned and validated by the system. Awaiting Teacher manual verification. |
| Verified | Teacher has manually marked the student as present. Attendance recorded. |

**Session auto-end rule:** If a session remains in Live status for more than 4 hours past its scheduled end time, the system automatically marks it as Completed. The Teacher is notified. Any students still in Checked-in status at that point are automatically promoted to Verified status — the Teacher had sufficient opportunity to manually verify during the session window. Invalid and duplicate scan log entries are not affected.

#### 12.6.2 In-Person Session Attendance Flow

| Step | Actor | Action |
| --- | --- | --- |
| 1 | Teacher | Starts the session from Teacher Dashboard. Session status changes to Live. |
| 2 | Student | Opens purchased ticket on their device. A unique encrypted QR code is displayed. |
| 3 | Teacher | Opens attendance scanner on their device. Scans the student's QR code. |
| 4 | System | Validates: ticket authenticity, payment status, correct session match, and duplicate scan prevention. Rejects if any check fails. |
| 5 | System | On successful validation: enrollment status moves to Checked-in. Student's name and details appear in the Checked-in list on Teacher's dashboard. No OTP is generated or sent. |
| 6 | Teacher | Reviews the Checked-in list on dashboard. Manually marks each student as Verified by tapping the Verify button next to their name. |
| 7 | System | Enrollment status set to Verified. Timestamp and verification details recorded. |
| 8 | Teacher | Dashboard shows real-time counts: Purchased, Checked-in, and Verified. Invalid and duplicate scan attempts are flagged separately. |

#### 12.6.3 Online Session Attendance Flow

| Step | Actor | Action |
| --- | --- | --- |
| 1 | Teacher | Starts the session from Teacher Dashboard. Session status changes to Live. Meeting link becomes active. |
| 2 | Student | Attempts to join the session via the VGC platform. |
| 3 | System | Validates ticket authenticity and payment status before granting access. |
| 4 | System | On successful validation: student is granted entry to the meeting link. Enrollment status is automatically set to Verified (online join confirmation is sufficient for attendance). |

#### 12.6.4 Fraud Prevention

| Mechanism | Detail |
| --- | --- |
| Unique QR per enrollment | Each QR code is tied to a specific student and specific ticket. Cannot be used by another member. |
| Duplicate scan blocking | A QR code already scanned for a session cannot be scanned again. |
| Invalid ticket rejection | Unpaid, cancelled, or wrong-session tickets are rejected immediately at scan. |
| Teacher manual gate | For in-person sessions, a scanned QR alone is not sufficient — the Teacher must manually verify each student from their dashboard. |

### 12.7 Post-Session Ratings

After each session is marked Completed, ratings unlock for both students and Teacher.

#### 12.7.1 Student Rating of Teacher

| Aspect | Rule |
| --- | --- |
| Who can rate | Any student with a Verified enrollment for that session |
| Format | 1–5 star rating with a written testimony |
| VGC Points | Auto-credited immediately upon submission via Constitutional Provision |
| Visibility | On Teacher's public profile and on the course ticket listing page |

#### 12.7.2 Teacher Rating of Students

| Aspect | Rule |
| --- | --- |
| Who rates | The Teacher, rating each student individually |
| Format | 1–5 star rating per student |
| VGC Points | Auto-credited to the Teacher immediately upon each student rating submitted, via Constitutional Provision |
| Visibility | On the rated student's public profile |

### 12.8 Payout

| Aspect | Rule |
| --- | --- |
| Eligibility trigger | All sessions under the ticket must have status Completed |
| Cancelled session | If a session is cancelled by the Teacher, it is marked Cancelled and excluded from payout calculations. Buyers receive a proportional VGC Token refund for that cancelled session. |
| Zero-attendance session | If a session reaches its scheduled date with zero Verified attendees, it is auto-marked Completed (no-show session) and does not block payout. |
| Request | Teacher initiates payout request from Teacher Dashboard |
| Amount | Per agreed revenue split applied to total ticket sales |
| Processing | VGC Admin reviews and credits VGC Tokens to Teacher's VGC Token Wallet |

### 12.9 Teacher Dashboard

| Dashboard Element | Detail |
| --- | --- |
| My Tickets | All listed course tickets with current status |
| Session Controls | Start session (→ Live); End session (→ Completed) |
| Attendance View | Real-time per-session counts: Purchased, Checked-in, Verified. Flagged log of invalid and duplicate scans. |
| Attendance Scanner | QR code scanning interface for in-person sessions |
| Manual Verification Panel | List of Checked-in students with Verify button for each (in-person sessions) |
| Ratings Received | All star ratings and student testimonies |
| Student Ratings Given | Record of all ratings Teacher has given |
| Payout Status | Per ticket: total sales, revenue split, payout request status, payout confirmation |

### 12.10 Notifications

| Event | Notified Parties |
| --- | --- |
| Course ticket listed | Teacher |
| Course ticket purchased | Teacher and VGC Admin |
| Session started (Live) | All students enrolled on that ticket |
| Attendance Verified | Student (confirmation) |
| Session Completed | All Verified students (ratings unlocked) and Teacher (ratings unlocked) |
| Student submits rating and testimony | Teacher |
| Teacher submits rating for a student | Rated student |
| All sessions Completed — payout available | Teacher |
| Payout processed | Teacher |
| Session amendment approved | Teacher |

---

## 13. Financial Sector

**Intent —** Formalise the inflow of real-world INR through four well-defined heads — Donation, Grant, Sponsorship, Investment — each with its own refundability, recognition and return rules.

### 13.1 INR Acceptance — 4 Heads

VGC accepts INR under four heads from members and non-members alike. All payments are made via UPI to the single authorised VGC UPI ID or in cash to VGC Admin. A declaration form must be submitted after every payment. Verified inflows are split between the operational INR Receipt Ledger and the VGC Reserve per §4.6.

| Head | Who Can Give | Refundable | Key Feature |
| --- | --- | --- | --- |
| Donation | Anyone — member or non-member | Never | Donor name and amount published on Donor Page. Identity is always recorded and published; no anonymous option. |
| Grant | Anyone — member or non-member | Never | Giver states reason or cause. Reason is private between giver and Admin. Giver identity recorded and published on Donor Page. |
| Sponsorship | Any person or company | Yes (full or partial) | Sponsor states conditions. Requires UPI ID for refunds. Listed on Sponsor Page if conditions met. |
| Investment | Anyone | No (returns guaranteed) | Fixed return. Option A: 10% p.a., lump sum. Option B: 8% p.a., quarterly interest. |

### 13.2 Investment Options

| Option | Rate | Duration | Payment Structure |
| --- | --- | --- | --- |
| Option A | 10% per annum | 1 full year | Single payout at year end: Principal + Interest |
| Option B | 8% per annum | 1 full year | 4 payments: Q1 interest, Q2 interest, Q3 interest, Q4 Principal + Interest |

#### 13.2.1 Investment Payout Default

If VGC Admin is unable to make a payout on the agreed date, the obligation does not lapse.

| Scenario | Rule |
| --- | --- |
| Payout missed | Payout becomes overdue. Interest continues to accrue at the contracted rate on the original principal only (not compounding on missed payments). |
| Option B partial payment missed | The missed payment is tracked as an additional obligation. Interest accrues only on the original principal. All outstanding amounts (principal + accrued and missed interest) must be settled before the investment is marked Settled. No automatic write-off. |
| Overdue request mechanism | If a payout is overdue by more than 30 days, the investor may submit a formal Overdue Payout Request via the platform. VGC Admin must provide a written response within 7 days with an updated payout commitment date. |
| Transparency | All overdue investments are flagged in the Admin Panel Financial Management module. VGC Admin must publicly disclose the count of overdue investments (not amounts or names) on the platform's public transparency page. |
| Settlement | VGC Admin manually marks investment as Settled once full principal + all accrued interest is paid. Member's INR Receipt Ledger is credited. |

### 13.3 Sponsorship Recognition

Upon successful completion of a sponsorship deal VGC provides the following recognition:

- Sponsor Badge visible on their VGC profile if they are a member
- Listed on dedicated Sponsor Page with deal details
- Formal ecosystem-wide announcement acknowledging the sponsor
- Name or logo displayed in the funded sector permanently
- Partial deal sponsors listed with partial completion noted

### 13.4 Sponsorship Partial Fulfilment

If sponsorship conditions are partially met:

| Aspect | Rule |
| --- | --- |
| Refund calculation | Refund = Sponsorship Amount × (1 − proportion of conditions met). VGC Admin documents which conditions were met and which were not. |
| Documentation shared | Documentation shared with Sponsor before refund is processed. |
| Sponsor dispute window | Sponsor may dispute Admin's assessment within 7 days of documentation being shared. |
| Final decision | VGC Admin's decision after reviewing the dispute is binding. |

### 13.5 Post-Verification Actions

| Transaction Type | Immediate Action After VGC Admin Verification |
| --- | --- |
| Member buys VGC Tokens | Member's VGC Token Wallet credited immediately |
| Donation | Donor name and amount published on Donor Page |
| Grant | Giver name and amount published on Donor Page (reason stays private) |
| Sponsorship | Conditions reviewed, deal process initiated, UPI ID noted for refunds |
| Investment | Calculations completed, investment recorded, payout schedule created |

---

## 14. Contract

**Intent —** Members frequently need to hire each other for one-off work. The Contract feature gives them a choice between a trust-based flow (Non-VGC Administrated) and an escrowed flow (VGC Administrated) for higher-stakes engagements.

### 14.1 Contract Types

| Attribute | VGC Administrated | Non-VGC Administrated |
| --- | --- | --- |
| VGC Role | Middleman — holds payment in escrow, verifies fulfillment | No involvement — operates entirely on trust |
| Payment Currency | VGC Points (held in escrow by VGC Admin) | VGC Points (transferred directly) |
| Listing Fee | 5% of contract budget paid by Giver at listing | None |
| Completion Fee | 5% of contract budget deducted from Taker's payout | None |
| Total VGC Fee | 10% of contract budget | 0% |
| Fulfillment Check | VGC Admin independently verifies stated conditions were met | Not applicable — Giver decides voluntarily |
| Dispute Resolution | VGC Admin mediates at sole discretion | VGC Admin mediates at sole discretion only if sufficient evidence provided |
| Ratings & Reviews | Both parties rate each other on completion or expiry | Both parties rate each other on completion or expiry |

### 14.2 Contract Listing

Any logged-in member can create a contract and become the Contract Giver.

| Field | Details |
| --- | --- |
| Contract Title | Short descriptive title |
| Requirements | Detailed description of what the Taker must deliver |
| Application Deadline | Date after which no new applicants are accepted. Listing auto-deactivates at this date. The Application Deadline is the sole enforced date — it governs when the listing closes to new applicants only. |
| Requested Completion Date | Informational only — the date by which the Giver hopes work is done. Not enforced by the platform. Visible to applicants to set expectations. Once a Taker is assigned, the platform does not auto-close on this date. |
| Budget | Amount in VGC Points |
| Contract Type | VGC Administrated or Non-VGC Administrated (selected at listing, cannot be changed) |
| Sector Tag | Gaming, Education, Financial or General |
| Purpose / Notes | Optional additional context |
| Conditions (VGC Administrated only) | Objectively verifiable conditions for fulfillment. Subjective conditions not permitted. VGC Admin may reject a listing whose conditions cannot be independently verified. |
| VGC Administrated — Balance Lock | At listing, system verifies Giver's wallet holds at least 105% of budget (100% escrow + 5% listing fee). Entire amount immediately deducted and held by VGC Admin. If insufficient, listing rejected. |
| Giver cap | A member may have a maximum of 10 simultaneously listed or Active VGC Administrated contracts as Giver. No limit for Non-VGC Administrated contracts. |

### 14.3 Application and Assignment

**Application fields (all submitted by the candidate):**

| Field | Required | Details |
| --- | --- | --- |
| Pitch / Qualifications | Yes | Free-text statement of why the candidate should be selected, including relevant experience and qualifications |
| Proposed Price | No | Counter-offer in VGC Points. If omitted, the candidate accepts the Giver's posted budget. Visible to the Giver on the application card alongside the posted budget for comparison. |
| Proposed Completion Date | No | The date by which the candidate estimates they can deliver. If omitted, the candidate accepts the Giver's requested completion date. Visible to the Giver on the application card. |

**Flow:**

| Step | Actor | Action |
| --- | --- | --- |
| 1 | Any Member | Submits application with pitch, and optionally a proposed price and/or proposed completion date |
| 2 | Contract Giver | Reviews applicants — sees each candidate's pitch, proposed price (vs posted budget), and proposed completion date |
| 3 | Contract Giver | Assigns contract to one applicant. That member becomes Contract Taker. Status: Active. |
| 4 | System | Taker notified of assignment. All other applicants notified of rejection. Listing removed from public view. |

### 14.4 Rules After Assignment

| Rule | Detail |
| --- | --- |
| No modifications to listed terms | Contract details frozen on assignment. Neither party can alter them. |
| Working past the Requested Completion Date | Contract remains Active. Platform does not auto-close. |
| Extension or scope changes | Any off-platform agreement on extensions or scope changes must be retained as proof by the party relying on it. |
| Failure to prove | If a party cites an agreed extension or scope change but cannot provide proof, VGC Admin will not uphold the claim. |
| Negative balance restriction | A member with a negative VGC Token balance (from any cause) is restricted from: opening new contracts as Giver, accepting new contracts as Taker, creating Marketplace listings, and transferring VGC Points. Restrictions lift automatically when balance returns to zero or above. |

### 14.5 Pre-Assignment Actions by Giver

| Action | Allowed? | Consequence |
| --- | --- | --- |
| Edit contract details | Yes — for the following fields only: Contract Title, Requirements, Application Deadline, Requested Completion Date, Sector Tag, Purpose / Notes | Changes immediately visible to viewing members and applicants. Budget and Contract Type are locked after listing and cannot be changed under any circumstances. |
| Close / Withdraw | Yes | VGC Administrated: escrowed budget returned to Giver; 5% listing fee non-refundable. Non-VGC: no fees, no consequence. |
| Reject all applicants | Yes | No consequence. Listing remains active until Application Deadline. |

### 14.6 Completion and Payment Flow

| Step | VGC Administrated | Non-VGC Administrated |
| --- | --- | --- |
| 1 | Taker marks contract as Complete. Giver notified. | Taker marks contract as Complete. Giver notified. |
| 2 | Giver reviews and chooses: (a) Release payment, or (b) Raise dispute. | Giver chooses: (a) Voluntarily transfer VGC Points to Taker, or (b) Raise dispute. |
| 3a — Release by Giver | VGC Admin releases 95% of escrowed budget to Taker. 5% retained by Admin. Status: Completed. | Giver transfers Points directly to Taker. Status: Completed. |
| 3b — Dispute by Giver | VGC Admin evaluates work against stated conditions. Conditions met → 95% released to Taker. Conditions not met → budget returned to Giver minus 5% listing fee. | VGC Admin reviews at sole discretion. See §14.8 for Non-VGC penalty cascade. |
| 3c — Taker escalation | If Giver has not acted within 7 calendar days of Step 1, Taker may escalate to VGC Admin. Admin reviews and decides at sole discretion. | Same 7-day window applies before Taker may escalate. |
| 4 | Both parties rate and review each other. | Both parties rate and review each other. |

### 14.7 Cancellation Rules

| Scenario | VGC Administrated | Non-VGC Administrated |
| --- | --- | --- |
| Giver cancels before Taker assigned | Allowed. Escrowed budget returned. 5% listing fee non-refundable. | Allowed. No fees. |
| Giver cancels after Taker assigned | Allowed but penalised. Taker receives 95% of escrowed budget. Admin retains 5% listing fee and 5% completion fee. Total cost to Giver: 105% of budget. | Giver may choose not to pay. No automatic penalty unless Taker raises dispute upheld under §14.8. |
| Application Deadline passes — no Taker assigned | Listing auto-deactivates. 100% escrowed budget returned to Giver. 5% listing fee non-refundable. | Listing auto-deactivates. No payment obligation. |
| Long-running contract (60 days past Requested Completion Date, no completion) | Either party may request VGC Admin to force-close. Admin reviews work completed to date and, at sole discretion, releases escrowed funds in full to the Taker, returns them in full to the Giver, or splits them proportionally. The 5% listing fee is always non-refundable regardless of the outcome. The decision and rationale are logged in the Admin Audit Log. Both parties may leave ratings after force-close. | Either party may walk away. Both may leave ratings. |

### 14.8 Non-VGC Administrated — Dispute Resolution (Penalty Cascade)

This applies exclusively to Non-VGC Administrated contracts where the Taker claims the Giver acted in bad faith.

| Step | Action |
| --- | --- |
| Trigger | Either party raises a dispute and submits evidence. VGC Admin decides entirely at sole discretion. No defined minimum evidence threshold. |
| Step 1 — Penalty (if Giver false play proven) | Giver's VGC Points Wallet is debited 150% of the original contract budget. If wallet balance insufficient, debited to zero. |
| Step 2 | If 150% mark not reached from VGC Points alone, remaining shortfall is converted at the prevailing Point Token Scheme rate. No 2.5% tax applies — this is a forced penalty conversion. Giver's VGC Token Wallet debited accordingly. If insufficient, debited to zero. |
| Step 3 | If both wallets depleted and 150% not yet reached, Giver's VGC Token balance is marked negative (debt) until 150% is fully recovered. Giver is subject to negative balance restrictions in §14.4. |
| Taker receives | The lesser of: (a) 150% of original budget, OR (b) total amount recovered across Steps 1–3. VGC Admin does not retain any spread from this penalty. |
| No proof / Not upheld | No penalty applied, no compensation awarded. VGC Admin's decision is final. |

### 14.9 Ratings and Reviews

| Attribute | Detail |
| --- | --- |
| Who rates | Both Contract Giver and Contract Taker may rate each other. Rating unlocks when contract is marked Completed OR when the Application Deadline passes and no Taker was ever assigned — in the latter case, no rating is generated as there is no counterparty to rate. |
| Rating scale | 1–5 stars with a written review |
| Visibility | Ratings visible on each member's public profile |
| Non-VGC purpose | In Non-VGC Administrated contracts, ratings are the primary accountability mechanism |
| Manipulation | False or malicious reviews may be reported to VGC Admin who can remove them at sole discretion |

### 14.11 Contract Application Chat

Each contract application has a private, 1-to-1 message thread between the Giver and that specific Applicant. Threads are completely isolated — no applicant can see the Giver's conversation with any other applicant.

| Attribute | Detail |
| --- | --- |
| Participants | The Giver and the specific Applicant only. No other member has access to the thread. |
| Purpose | Allow both parties to discuss requirements, negotiate terms, and remove ambiguity before the Giver makes an assignment decision. |
| Access trigger | The thread is available as soon as an application is submitted. The Giver sees a "Chat" button on each application card. The Applicant sees a "Chat with Giver" button on the contract detail screen. |
| Write access | Both parties may send messages while the application status is `pending`. |
| Read-only state | Once the application moves to `assigned` or `rejected`, the thread becomes read-only. Existing messages remain visible so both parties can reference prior discussions (e.g. agreed scope, price, or timeline). |
| Notifications | The receiving party is notified via an in-app notification when a new message is sent. |
| Persistence | Chat history is retained indefinitely for reference and dispute evidence. |

---

### 14.10 Active Contract Limit

| Attribute | Detail |
| --- | --- |
| Hard limit (Taker) | Maximum 2 simultaneously Active contracts as Contract Taker. Hard cap — cannot be increased. |
| Applies to | Both VGC Administrated and Non-VGC Administrated combined. Applied, Completed, Cancelled or Expired contracts do not count. |
| Giver limit | Maximum 10 simultaneously listed or Active VGC Administrated contracts as Giver. No limit for Non-VGC Administrated. |
| Profile indicator | A Taker's public profile displays their current active contract count. |

---

## 15. Admin Panel

**Intent —** All governance, moderation and financial control is concentrated in a single super-admin interface. There is exactly one VGC Admin in the ecosystem.

### 15.1 Admin Panel Modules

| Module | Key Functions |
| --- | --- |
| Member Management | View, edit, suspend members. View member wallets and transaction history. |
| Wallet Management | Credit or debit any wallet. Mint VGC Points via Constitutional or Promotional Provision. |
| Declaration Management | View submitted INR declarations. Verify or reject. |
| Token Surrender Management | View surrender requests. Mark as Completed after INR transfer. |
| Marketplace Management | List items, manage categories, manage orders, resolve disputes, process settlements. Update INR-to-Token buy rate and Token-to-INR surrender rate (30-day notice required). |
| Gaming Management | Review and approve or reject proposals. Manage Pioneer invitations, elections and candidacy lists. Manage candidacy deposit returns. Manage seasons, events and participant submissions. Handle mid-season pioneer departures. Purchase Deposit Return items at season end. Manage marketplace items linked to gaming. |
| Education Management | Review and approve course ticket proposals. Approve session amendment requests. Monitor active sessions. Process Teacher payout requests. View all ratings and testimonies. |
| Financial Management | Track investments, manage payout schedules, flag overdue investments, manage donors and sponsors. |
| Point Token Scheme | Monitor live rate and component values. Adjust θ after any transaction with logged reason. View conversion history and rate audit trail. Manage Reserve allocation and Hard Assets registry. |
| VGC Points Awards | Award points via Constitutional or Promotional Provision. Set and manage monthly minting budget. |
| Donor and Sponsor Pages | Publish and manage donor and sponsor recognition records. |
| Reports and Analytics | Financial summaries, wallet balances, ecosystem activity reports. |
| Election Management | Publish candidate lists. Manage election timing. Manage voting rights tickets. Resolve ties by casting deciding vote (logged publicly with rationale). |
| Groups Management | View all groups. Remove posts or members. Delete groups violating platform rules. |
| Blog Management | Review and approve or reject blog submissions. Specify Constitutional Provision points on each review. Approve Revenue Generator ticket proposals. Take down published blogs. Manage Abandoned blogs. |
| Loan Management | View all loan requests with the member's UPI ID, contact details, term, return date and supporting document. Approve (recording actual INR transferred and a transfer reference) or reject (a stated reason is required and is shown to the member). View active Loan IDs, outstanding balances split into principal and interest, charge history and repayment history. Write off loans. Set write-off threshold. Filter by any status. |
| Expense Tracker | Log all outgoing INR payments as Platform Outflow entries. Platform Outflow entries are publicly visible. Personal entries are private. |
| Contract Management | View all contract listings. Monitor Active, Completed, Expired and Cancelled contracts. Verify fulfillment for VGC Administrated contracts. Release or withhold escrowed VGC Points. Manage disputes. Reject listings with non-verifiable conditions. |
| Admin Audit Log | Read-only chronological record of all Admin actions: wallet credits/debits, declaration verifications, contract resolutions, θ adjustments, write-offs, blog approvals, rate changes, election votes. Filterable by date, action type and affected member. Accessible to VGC Admin only. Summary statistics of platform governance actions are visible publicly. |

### 15.2 Admin Account Security

| Requirement | Detail |
| --- | --- |
| Two-Factor Authentication | Admin account requires TOTP-based 2FA (e.g. Google Authenticator). Login from a new device requires an additional email OTP. |
| Recovery | Recovery codes generated at 2FA setup. Stored securely offline by VGC Admin. |
| Failed login lockout | Three consecutive failed login attempts lock the account for 30 minutes. |
| Login event logging | All Admin login events (success and failure) are logged with timestamp, device fingerprint and IP address. Logged in the Admin Audit Log. |
| Backup Admin | VGC Admin may designate one Backup Admin whose credentials are stored securely offline. If no successful Admin login is detected for 72 consecutive hours, the system notifies the Backup Admin and grants them temporary full admin access. All Backup Admin actions are logged separately and flagged for review when primary Admin resumes access. To prevent a false trigger during planned absence, VGC Admin may activate Vacation Mode from the Admin Panel, which pauses the 72-hour inactivity counter and sends the Backup Admin a notification that the primary Admin is deliberately away. Vacation Mode can only be set while logged in and expires at the date Admin specifies. |

---

## 16. Notifications

**Intent —** Every member is kept informed of events that affect them without having to manually check dashboards.

The system sends automated notifications via in-app alerts and email. For full notification details specific to Groups, Blog, Loan to Members and Contract refer to §7.11, §8.10, §9.10 and §14 respectively.

### 16.1 Core Notification Events

| Event | Notified Parties |
| --- | --- |
| New order placed on marketplace | VGC Admin and Proposing Member |
| Order settled | Buyer and Proposing Member |
| Dispute raised | VGC Admin and Proposing Member |
| Dispute resolved | Buyer and Proposing Member |
| VGC Points transfer sent | Sender (confirmation) and Receiver (incoming) |
| INR declaration submitted | VGC Admin |
| INR declaration verified | Submitting Member |
| Token surrender request received | VGC Admin |
| Token surrender request completed | Requesting Member |
| Election announced | All members (voting rights ticket available for purchase) |
| Season started | All registered participants |
| Season ended | Pioneer, Manager, Treasurer and all participants |
| Investment payout due | VGC Admin |
| Session Completed (all sessions on a ticket) | Teacher (payout now available) |
| Contract application received | Contract Giver |
| Contract assigned — Taker selected | Contract Taker (assigned) and other applicants (rejected) |
| Contract marked complete by Taker | Contract Giver |
| Dispute raised on contract | VGC Admin and the other party |
| Contract payment released | Contract Taker |
| Contract Application Deadline passed — no Taker assigned | Contract Giver, and all members who submitted an application for that contract |
| Token buy or surrender rate change announced (30-day notice) | All members (platform-wide) |
| Overdue investment — no response from Admin within 7 days | Escalation alert to Admin |

### 16.2 Notification Channels and Member Preferences

By default every member receives notifications via both in-app alerts and email.

| Channel | Default | Member Control |
| --- | --- | --- |
| In-app alerts | On | Cannot be disabled for transactional events (wallet activity, contract status changes, dispute outcomes, loan approval/repayment/settlement). Can be disabled for engagement events (new group posts, blog comments). |
| Email | On | Can be toggled per category (Marketplace, Gaming, Education, Financial, Groups, Blog, Contract, Loan). Critical security alerts (login from new device, password reset) and financial alerts (wallet debits, declaration verification) cannot be disabled. |
| Quiet hours | Off | Member may specify hours during which in-app push notifications and email are batched. Critical security and financial alerts bypass quiet hours entirely and are delivered immediately regardless of quiet hours settings. |

---

## 17. Non-Functional Requirements

| Requirement | Detail |
| --- | --- |
| Security | All member data encrypted in transit (TLS) and at rest. Passwords hashed using bcrypt or stronger. Role-based access control throughout. Admin account secured with TOTP 2FA (see §15.2). |
| Performance | Wallet balance checks and token debits must execute in real time upon order placement. UI interactions should respond within 300ms on a standard connection. |
| Availability | Platform should target 99% uptime during active seasons and election windows. |
| Scalability | Architecture on XANO and WeWeb must support a growing member base without architectural rewrites. |
| Data Integrity | All financial transactions must be atomic. No partial wallet updates allowed. XANO's transaction guarantees must be verified before development begins. If XANO does not natively support full ACID transactions across multiple tables, a compensating transaction pattern must be designed: write a pending record first, execute the operation, resolve the pending record. If the operation fails midway, the pending record triggers a rollback on the next system check. |
| Audit Trail | Every wallet transaction, marketplace order, points transfer, contract event, Point Token Scheme conversion, θ adjustment and admin action must be permanently logged with timestamp, actor and before/after state. |
| Live Rate Computation | The Point Token Scheme rate is recomputed on a maximum frequency of once per 10 seconds (debounced). Within a 10-second window, multiple triggering events are batched and a single recomputation runs. The last computed rate is cached and served to all member requests within the window. t_idle is still tracked per-minute — the cache refresh does not reset t_idle. **Free-plan implementation:** there is no nightly batch task; L_invest and amortised sponsorship values are computed on demand from elapsed time at each rate computation (see §1.4.1 and §4.7), so the published rate is always current without a scheduled job. The 10-second debounce cache is a row holding the last computed rate plus its timestamp; a request recomputes only if the cache is older than 10 seconds. |
| Mobile Responsiveness | All WeWeb pages must render correctly on mobile devices (responsive layouts down to 360px width). |
| Admin Exclusivity | Actions restricted to VGC Admin only: verify declarations, list items, resolve disputes, write off loans, release contract escrow, approve pioneer proposals, approve blog submissions. |
| Data Protection (DPDP Act 2023) | Platform complies with India's Digital Personal Data Protection Act 2023. Explicit consent collected at sign-up for personal data processing (privacy policy and terms of service shown with mandatory acknowledgement checkbox — consent recorded with timestamp). Upon account closure and archival: personal identifiers (Name, Email, Mobile, DOB, City, State, UPI IDs) are anonymised. Transaction ledger entries are retained in non-reversible anonymised form (one-way hash of Member ID — no reverse lookup). This satisfies both the right to erasure and the audit retention requirement. Data breach notification within 72 hours where applicable. Members can submit a data erasure request at any time from their profile. |
| Search | Platform-wide keyword search across Marketplace items (item name, description, category path), Groups (name and description), and Blog (title, content, tags). Keyword-based with filters by sector and category. Results respect visibility rules (private group posts hidden from non-members, Revenue Generator blogs hidden from non-purchasers). |

---

## 18. Recommended Development Phases

| Phase | Module | Description |
| --- | --- | --- |
| Phase 1 | Member Registration and Login | Registration, unique ID, login, member profile. Under-18 guardian approval flow. Email OTP verification. Device fingerprinting (record device ID and IP; max 3 registrations per device per 24 hours). Rate limiting on OTP requests (max 5 per email per hour). Privacy policy and terms of service shown at registration with mandatory acknowledgement (DPDP Act compliance — consent recorded with timestamp). Data erasure request flow in member profile. |
| Phase 2 | Wallet System | All three wallets, INR Receipt Ledger, Marketplace Escrow Wallet, declaration form, token surrender form, rate update mechanism (admin configurable with 30-day notice). |
| Phase 3 | Admin Panel Basics | Admin login with TOTP 2FA, Backup Admin setup, member management, wallet management, declaration verification, Admin Audit Log. |
| Phase 4 | VGC Points Economy | Minting provisions (Constitutional and Promotional) with Promotional wallet check, monthly minting budget, activity rewards, instant member-to-member transfer, passbook ledger. Standard Activity Table (Appendix A) loaded as version 1.0. |
| Phase 5 | Point Token Scheme | Live rate formula (I, R, A, T_net, P_net, L_invest, θ, t_idle), P_net ≤ 0 guard, 30-day t_idle cap, income split rules, investment liability amortisation, time decay, floor and threshold, public rate dashboard (θ values not displayed), conversion logic, 2.5% tax, admin wallet checks. Bootstrap with initial ₹50,000 seed and Vishal Gorana Constitutional Provision. Testing note: Phase 5 PTS must be tested with simulated T_admin values covering Admin wallet at 0, 100 and 10,000 tokens. Full end-to-end testing (with real marketplace purchases moving T_admin) is a mandatory gate before Phase 6 goes to production. |
| Phase 6 | VGC Marketplace | Category hierarchy, item listing (member-proposed vs Admin-owned), Marketplace Escrow Wallet integration, same-vendor cart checkout, purchase flow, atomic balance check, order management, 14-day proof deadline, 30-day auto-refund, dispute resolution, settlement, Vendor role in member profile. |
| Phase 7 | Gaming Sector | Pioneer Candidacy item, three-set submission, no-edit-after-submission rule, first-time listing approval, universal paid voting (voting rights ticket required for all voters), election timing (15-day registration window, 3-day voting trigger), public Admin tie-breaking vote log, candidate list publishing, pioneer invitation letter, Independent and Secure funding commencement flows, 3-day deposit deadline, 2.5% tax disclosure on Secure Funding conversion, auto-generated Deposit Return item, Distribution Record system (3 fields: amount, member, event), 80% distribution calculation, mid-season departure handling (forfeiture rules), season and event pages, VGC Points distribution, season archival. |
| Phase 8 | Education Sector | Course ticket proposal and listing, session date management, ticket auto-hide, QR code generation (client-side WeWeb JS library), QR scan validation, Checked-in status, Teacher manual verification from dashboard, online session auto-verification on join, session amendment flow with 48-hour / 6-hour SLA, post-session ratings with auto VGC Points credit, cancelled session handling, zero-attendance auto-Completed, Teacher Dashboard, Teacher payout request. |
| Phase 9 | Financial Sector | Donations, grants, sponsorships (partial fulfilment criteria), investments (Option A and B, overdue mechanism, no-compound rule), payout scheduling, donor and sponsor pages, overdue investment public count on transparency page. |
| Phase 10 | Notifications and Reporting | Full notification system with quiet hours (critical alerts bypass), platform-wide notification for rate changes, passbook, admin reports and analytics. |
| Phase 10A | Search | Platform-wide keyword search across Marketplace, Groups and Blog. Sector and category filters. Visibility rules enforced in results. |
| Phase 11 | Groups | Group creation, sector tagging, Public and Private join flows, 24-hour deletion hold, all post types, Group Admin and Co-Admin roles, moderation, comment notifications, removed member appeal mechanism. |
| Phase 12 | Blog | Blog writing, mandatory VGC Admin review flow, VGC Points on review (Constitutional Provision), Revenue Generator blogs via marketplace tickets, grandfathering of prior readers, deletion / abandonment rules, monetisation consent at abandonment. |
| Phase 13 | Loan to Members | Loan request flow with confirmation step and 12-month minimum term, VGC Admin approval recording actual INR disbursed, interest-free window, daily simple interest at 10% p.a. thereafter, member repayment with interest-first allocation, multi-loan tracking and consolidated position, write-off criteria and threshold. |
| Phase 14 | Expense Tracker | Personal expense entry, Entry Type field (Personal / Platform Outflow), 15 categories, payment mode conditional fields, Pending / Settled states with confirmation dialog, spending dashboard, Platform Financial Ledger page (public read-only view of Admin Platform Outflow entries). |
| Phase 15 | Contract | Contract listing with Application Deadline and Requested Completion Date as separate fields, Giver cap (10 VGC Administrated), VGC Administrated escrow lock at listing (105%), application and assignment flow, 7-day Giver response window, Giver release or dispute flow, Non-VGC penalty cascade (150%, no tax, no Admin spread), hard 2-contract Taker cap, ratings and reviews (no rating if no Taker ever assigned). |

---

## 19. Glossary

| Term | Definition |
| --- | --- |
| VGC Admin | The single super-administrator who governs the entire VGC ecosystem. Holds parallel INR Receipt Ledger, VGC Token and VGC Points wallets at the platform level. |
| Member ID | Unique system-generated identifier assigned to every registered member. Permanent and non-transferable. |
| INR Receipt Ledger | The wallet that records INR movements. For VGC Admin it is the ecosystem's inflow ledger; for members it is a credits-only record of INR received from VGC Admin. Named "Receipt Ledger" to reflect that it records receipts, not a spendable balance. |
| VGC Token Wallet | Wallet holding VGC Tokens. Non-transferable between members. Used for marketplace purchases, loan repayments and Point Token Scheme conversions. |
| VGC Points Wallet | Wallet holding VGC Points. Transferable between members instantly. Used for rewards, contract payments and ecosystem activities. |
| Marketplace Escrow Wallet | A platform-level wallet that holds VGC Tokens from purchases of member-proposed marketplace items until settlement. Counted as part of T_admin in the PTS formula. |
| Point Token Scheme | Feature allowing conversion between VGC Points and VGC Tokens at a dynamic rate computed live from real-time platform state. A 2.5% tax applies on the currency given. Tax applies to all conversions without exception. See §4 for the full formula. |
| VGC Reserve | Funds held by VGC Admin outside the operational ecosystem in FDs, Bonds and money market instruments — appearing as R in the rate formula. |
| Hard Assets (A) | Listed marketplace inventory (at INR equivalent), signed time-bound sponsorship commitments (amortised), and cash equivalents. |
| Investment Liability (L_invest) | Pending obligation tracker for active investments. Grows linearly at 1.1·X / 365 per day per investment, capped at 1.1·X, resets to zero on full settlement. |
| Time Drift (θ, t_idle) | Per-minute drift applied to the equilibrium rate between conversions. Default θ = 0.005%/min. t_idle capped at 43,200 minutes (30 days). Moves rate in favour of VGC Points to discourage stagnation. |
| Equilibrium Rate (r_eq) | The PTS rate computed purely from platform state before time drift: r_eq = (I + R + A − L_invest − 10·T_net) / P_net. |
| Published Rate (r_published) | The rate shown to members: r_published = r_eq × (1 + θ·t_idle), subject to floor (0.0001) and threshold (0.00011). |
| Net Token Position (T_net) | T_member − T_admin (including Marketplace Escrow). A negative T_net is intentional and increases the rate. |
| Net Point Position (P_net) | P_member − P_admin. Contract escrow Points counted in P_member. Must be > 0 for conversions to be enabled. |
| Constitutional Provision | Points minting where VGC Admin awards points to a member while Admin's VGC Points Wallet is credited +30% of the amount awarded. |
| Promotional Provision | Points minting where VGC Admin awards points to a member while Admin's VGC Points Wallet is debited -25% of the amount awarded. Blocked if Admin's wallet would go below zero. |
| Activity Reward | VGC Points awarded for completing predefined platform activities per the Standard Activity Table (Appendix A). |
| Pioneer | Member who leads a gaming season. Becomes Pioneer by purchasing the Pioneer Candidacy item, submitting three sets of information and receiving a formal invitation from VGC Admin. Maximum one active pioneership at a time. |
| Community Game | Any game formally listed by VGC Admin after approving a complete three-set pioneer proposal. |
| Distribution Record | A formal record created by a Pioneer for each VGC Points reward given to a participant. Contains: amount of VGC Points, recipient member, and event reference. Only transfers with a corresponding Distribution Record and valid event reference count toward the 80% distribution target. |
| Pioneer Candidacy Item | Two distinct marketplace items maintained by VGC Admin. (1) New Game Proposal Candidacy — listed once per new game; costs 50 VGC Tokens; non-refundable; unlocks the full three-set submission flow. (2) Election Candidacy — listed by Admin once per game per election cycle; costs 10 VGC Tokens (the candidacy deposit); deposit returned only if the candidate receives at least 3 votes. |
| Secure Funding Deposit Item | A marketplace item listed by VGC Admin for a specific pioneer, priced at the agreed deposit amount. |
| Deposit Return Item | A marketplace item auto-generated upon deposit confirmation. Price locked to the exact deposit amount, visible only to VGC Admin, purchasable once, non-editable. Purchased by VGC Admin at season end if the 80% distribution target is met. |
| Season | A 2 to 4 month collection of events within a community game, led by a Pioneer. |
| Independent Funding | Season funding model where Pioneer funds all rewards from their own VGC Points and may sell marketplace items (90% to Pioneer, 10% to Admin). |
| Secure Funding | Season funding model where Pioneer deposits VGC Tokens with VGC Admin. Pioneer receives 50% of resulting VGC Points (after 2.5% PTS tax) for participant distribution. Deposit always returned via Deposit Return item at season end. 26% VGC Points reward paid only if 80% distribution target is met. |
| Teacher | Any logged-in member who proposes a course ticket to VGC Admin for listing. No appointment or fee required. May simultaneously be a Student. |
| Course Ticket | Marketplace item proposed by a Teacher and listed by VGC Admin. Students purchase it to enrol in sessions. |
| Session | A single scheduled teaching event. Progresses through Scheduled → Live → Completed statuses. |
| QR Attendance | A QR-based check-in mechanism for sessions. Student displays their unique encrypted QR code; Teacher scans it; system validates and marks student Checked-in; Teacher manually marks Verified. No OTP involved. |
| Enrollment Status | Per student per session: Purchased (ticket bought, not checked in), Checked-in (QR scanned, validated), Verified (Teacher manually confirmed present). |
| Teacher Dashboard | Dedicated VGC platform interface for Teachers with ticket management, session controls, attendance scanner, manual verification panel, ratings and payout status. |
| Student | A member who has purchased a course ticket. May simultaneously be a Teacher. |
| Proposing Member | A member who has proposed a marketplace item to VGC Admin. Once the item is listed on the marketplace, they are referred to as a Vendor. |
| Vendor | A member whose proposed marketplace item has been approved and is actively listed on the VGC Marketplace. Revenue share from sales is credited to their VGC Token Wallet upon settlement from the Marketplace Escrow. |
| Proof of Delivery | Evidence submitted by the Proposing Member / Vendor confirming successful fulfilment of a marketplace order. Must be submitted within 14 days of order placement. |
| Declaration Form | Form submitted by the payer after making an INR payment to VGC under any of the four heads or for a Token Purchase. |
| Donor Page | Public page listing all verified donors and grant givers with name and amount. All identities are published; no anonymous option. |
| Sponsor Page | Public page listing all sponsors with deal details upon successful completion of sponsorship conditions. |
| Group Admin | Creator and primary manager of a VGC Group. Has all permissions. |
| Co-Admin | Group member promoted by Group Admin to assist in moderation. Cannot delete the group or transfer admin status. Cannot re-invite removed members. |
| Revenue Generator Blog | A published blog accessible only to members who have purchased a dedicated view ticket. Prior readers who liked or commented before conversion retain access (grandfathered). |
| Abandoned Blog | A blog relinquished by its author. Author's claim removed; blog remains under VGC Admin control. Monetisation requires separate consent at abandonment. |
| Loan ID | Unique system-generated identifier for each loan application. |
| Interest-Free Window | The period during which a loan accrues no interest: from approval until the earlier of one year later and the member's Planned Return Date. Fixed at approval. (Replaced the earlier "Three-Phase Loan" structure on 2026-08-01 — see §9.5.) |
| Expense Entry | A single real-world expense record. Can be Personal (private) or Platform Outflow (VGC Admin only, publicly visible). |
| Platform Outflow | An Expense Tracker entry type used exclusively by VGC Admin to log outgoing INR payments. This is the sole mechanism by which the Admin INR Receipt Ledger is debited. Platform Outflow entries are visible to all logged-in members on the Platform Financial Ledger page. |
| Contract Giver | A member who creates a contract listing, defines requirements, budget and deadlines, and assigns the work to a Contract Taker. |
| Contract Taker | A member who applies for and is assigned a contract. Limited to 2 simultaneously Active contracts. |
| Application Deadline | The date on which a contract listing auto-deactivates and no new applicants are accepted. The only enforced date in a contract listing. |
| Requested Completion Date | An informational field in a contract listing indicating when the Giver hopes the work is done. Not enforced by the platform. |
| VGC Administrated Contract | Contract type where VGC Admin holds the full budget + 5% listing fee in escrow at listing. 95% released to Taker upon verified fulfillment. |
| Non-VGC Administrated Contract | Contract type operating entirely on trust. No fees. Rating and review system is the primary accountability mechanism. |
| Listing Fee | 5% of contract budget paid by the Giver to VGC Admin at listing of a VGC Administrated contract. Non-refundable. |
| Completion Fee | 5% of contract budget retained by VGC Admin upon releasing payment to Taker in a VGC Administrated contract. |
| Sector Tag | A single sector label (Gaming, Education, Financial or General) applied for filtering and discovery. |
| Surrender Request | Form submitted by a member to convert VGC Tokens back to INR at the current surrender rate. |
| Standard Activity Table | Version-controlled document maintained by VGC Admin defining VGC Points awarded for each platform activity. See Appendix A. Current version publicly visible to all logged-in members. Changes apply only to activities completed after the revision date. |

---

## Appendix A — Standard Activity Table (Version 1.0)

**Effective from:** Platform launch date
**Maintained by:** VGC Admin
**Visibility:** Publicly visible to all logged-in members on the VGC Points Economy page

| Activity | Provision Type | VGC Points Awarded |
| --- | --- | --- |
| Writing and publishing a blog (per blog approved) | Constitutional Provision | 6,000 |
| Sharing own YouTube channel link (first time, per channel) | Constitutional Provision | 3,000 |
| Sharing own YouTube video link (per video) | Constitutional Provision | 2,400 |
| Liking a blog (per like) | Promotional Provision | 600 |
| Liking a video (per like) | Promotional Provision | 600 |
| Blog reviewed by VGC Admin — in addition to publishing reward (per review) | Constitutional Provision | 12,000 |
| Joining VGC Admin in reviewing a blog (per review participated) | Promotional Provision | 6,000 |
| Video reviewed by VGC Admin (per review) | Constitutional Provision | 12,000 |
| Joining VGC Admin in reviewing a video (per review participated) | Promotional Provision | 6,000 |
| Rating a session as a student — stars + testimony (per session rated) | Constitutional Provision | 2,400 |
| Teacher rating a student after a session (per student rated) | Constitutional Provision | 1,200 |
| VGC Admin motivational award | Constitutional or Promotional | As decided by Admin — logged with reason |

**Change log:**

| Version | Date | Changed By | Summary of Changes |
| --- | --- | --- | --- |
| 1.0 | Platform launch | VGC Admin | Initial table |

Note: VGC Admin may revise point values, add new activities, or remove activities at any time. All changes are recorded in the Change Log above and take effect only for activities completed after the revision date. Members are notified of any revision via platform-wide notification.

---

— End of Document —

*VGC Reinventing SRS v2.2*
