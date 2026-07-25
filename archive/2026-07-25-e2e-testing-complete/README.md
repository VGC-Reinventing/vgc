# E2E Test-and-Fix Effort — Complete (archived 2026-07-25)

This folder holds the working documents from the exhaustive end-to-end test-and-fix
effort that ran from 2026-07-19 through 2026-07-25. That effort is now complete:
every workflow suite in `E2E_TEST_PLAN.md` (WF-01–WF-20) has real Pass/Resolved
evidence, and `TEST_REGISTER.md` runs through TR-279.

See `../ARCHIVE_MANIFEST.md` for what each file is and why it's here.

## Still-open items

`TEST_REGISTER.md`'s Active Issues table has 17 rows still Open or Deferred as
of archiving (TR-137 through TR-145, TR-165, TR-167, TR-171–173, TR-183,
TR-258, TR-270) — mostly infra/product decisions parked by the owner (email
deliverability, Cloudinary signed uploads, rate-limit sweep scope, Terms/
Privacy content, Account Closure flow) rather than things left unfixed by
oversight. See that table for full context on each.

## If a future session resumes structured E2E testing

Read `TEST_REGISTER.md` here first for full defect history, then start a fresh
plan and register at the project root rather than reopening these in place —
they're a closed historical record of this run, not a living document.
