# VGC Documentation Archive Manifest

This directory contains superseded, non-authoritative project material moved out of the active workspace on 2026-07-19 before exhaustive E2E testing.

The active testing entry point is [`../E2E_TEST_SESSION_PROMPT.md`](../E2E_TEST_SESSION_PROMPT.md). The active requirements are under [`../SRS/`](../SRS/), and the active execution records are the root `E2E_*.md` ledgers plus [`../TEST_REGISTER.md`](../TEST_REGISTER.md).

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
