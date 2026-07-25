# VGC Documentation Archive Manifest

This directory contains superseded, non-authoritative project material moved out of the active workspace.

**As of 2026-07-25, the exhaustive E2E test-and-fix effort (started 2026-07-19) is complete.** All of its working documents — the test plan, fix plan, session-resumption prompts, the cumulative defect register, and every E2E ledger — have been moved to [`2026-07-25-e2e-testing-complete/`](2026-07-25-e2e-testing-complete/) below. There is currently no "active testing entry point" document; the active requirements remain under [`../SRS/`](../SRS/). If a future session resumes structured E2E testing (e.g. after a production rollout), start by reading that folder's defect register for full history, then create a fresh plan/register at root rather than reopening the archived ones in place.

## `2026-07-25-e2e-testing-complete/`

| Original path | Reason archived | Safe deletion condition |
|---|---|---|
| `TEST_REGISTER.md` | Cumulative defect register (TR-001 through TR-279). Every Active/Deferred item as of archiving is still genuinely open — see its own "Active Issues" and "Deferred / Won't Fix" tables for the current punch list. | Do not delete — this is the permanent historical record of every defect found and fixed across the entire test-and-fix effort. |
| `E2E_TEST_PLAN.md` | The 20-workflow-suite (WF-01–WF-20) test plan this whole effort executed against. Fully executed; see `TEST_REGISTER.md` and `E2E_COVERAGE_LEDGER.md` for results. | Delete once a future test effort supersedes it with a newer plan. |
| `E2E_EXECUTION_LOG.md` | Checkpoint-by-checkpoint (CP-01–CP-19) log of every session segment in the most recent E2E run. | Historical record; keep. |
| `E2E_COVERAGE_LEDGER.md` | Per-workflow-suite pass/fail/partial results and evidence for the most recent E2E run. | Historical record; keep. |
| `E2E_FIXTURE_LEDGER.md` | Every disposable test fixture (member, order, course, etc.) created during the most recent E2E run, with cleanup verification. | Historical record; keep. |
| `E2E_DEFECT_LOG.md` | Earlier-format defect log, superseded in-run by `TEST_REGISTER.md`'s Active/Resolved tables. | Historical record; keep. |
| `FIX_PLAN.md` | The phased (Phase 0–5) remediation plan for defects found before and during E2E testing. Fully executed. | Delete once a future fix effort supersedes it with a newer plan. |
| `E2E_TEST_SESSION_PROMPT.md` | Session-resumption instructions for the (now complete) E2E test effort. | Delete once superseded by a new session-resumption doc, if testing resumes. |
| `FIX_SESSION_PROMPT.md` | Session-resumption instructions for the (now complete) fix effort. | Delete once superseded by a new session-resumption doc, if fixing resumes. |

## `2026-07-23-e2e-run1-pre/`

Superseded mid-run snapshots of the E2E ledgers (`E2E_COVERAGE_LEDGER.md`, `E2E_DEFECT_LOG.md`, `E2E_EXECUTION_LOG.md`, `E2E_FIXTURE_LEDGER.md`) from before the 2026-07-23 fix pass, moved aside when that run's ledgers were reset. Referenced for historical Fail/Partial results during the 2026-07-25 coverage sweep (see `TEST_REGISTER.md`'s TR-228/TR-274 entries). Historical record; keep.

## `2026-07-19-pre-e2e/`

| Original path | Reason archived | Safe deletion condition |
|---|---|---|
| `API_REFERENCE.md` | Stale 426-document backend reference; live/generated Xano source and `XANO/LIVE_SYNC_STATUS.md` are authoritative. | Delete after the current E2E run has completed endpoint traceability without relying on it. |
| `TESTING_PLAN.md` | Superseded June/SRS-v2.2 plan with shallower coverage than `E2E_TEST_PLAN.md`. | Delete after the current E2E plan and ledgers are accepted as the sole test framework. |
| `SESSION_PROMPT.md` | Superseded Windows/Claude-era session opener; current state is consolidated into `E2E_TEST_SESSION_PROMPT.md`. | Delete after a clean session has successfully resumed from the E2E prompt alone. |
| `.claude/XANO_SETUP_VERIFIED.md` | Obsolete 262-document setup note with old paths and workflow. | Delete after Xano access is reverified from the current E2E prompt. |
| `.claude/launch.json` | Obsolete Windows launch configuration. | Delete once no Windows checkout depends on it. |
| `SRS/VGC_Reinventing_SRS.docx` | Historical v1/WeWeb specification; current Markdown SRS content is version 2.5. | Delete after the owner confirms the v1 Word artifact has no archival/legal requirement. |

Archived files are history only. Do not treat them as implementation or requirement truth.
