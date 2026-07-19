#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import ts from "../FrontEnd/node_modules/typescript/lib/typescript.js";

const root = path.resolve(import.meta.dirname, "..");
const planPath = path.join(root, "E2E_TEST_PLAN.md");
const endpointInventoryPath =
  process.env.E2E_ENDPOINT_INVENTORY ??
  "/tmp/xano_unique_endpoint_inventory.json";
const runId = process.env.E2E_RUN_ID ?? "E2E-20260719-01";

const plan = fs.readFileSync(planPath, "utf8");

function cell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|")
    .trim();
}

function writeNew(filename, content) {
  const target = path.join(root, filename);
  if (fs.existsSync(target)) {
    throw new Error(`${filename} already exists; refusing to overwrite live evidence.`);
  }
  fs.writeFileSync(target, `${content.trimEnd()}\n`);
}

function extractPlanRows(prefix) {
  return plan
    .split(/\r?\n/)
    .filter((line) => line.startsWith(`| ${prefix}`))
    .map((line) => line.split("|").slice(1, -1).map((part) => part.trim()));
}

function exportedFrontendFunctions() {
  const apiRoot = path.join(root, "FrontEnd/src/api");
  const rows = [];
  for (const filename of fs.readdirSync(apiRoot).filter((name) => name.endsWith(".ts")).sort()) {
    const sourcePath = path.join(apiRoot, filename);
    const source = ts.createSourceFile(
      sourcePath,
      fs.readFileSync(sourcePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );

    for (const statement of source.statements) {
      const exported = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );
      if (!exported) continue;

      if (ts.isFunctionDeclaration(statement) && statement.name) {
        rows.push({ file: filename, name: statement.name.text });
      }

      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (
            ts.isIdentifier(declaration.name) &&
            (ts.isArrowFunction(declaration.initializer) ||
              ts.isFunctionExpression(declaration.initializer))
          ) {
            rows.push({ file: filename, name: declaration.name.text });
          }
        }
      }
    }
  }
  return rows;
}

function xsFiles(directory) {
  const output = [];
  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      if (entry.isFile() && entry.name.endsWith(".xs")) {
        output.push(path.relative(root, full));
      }
    }
  }
  visit(directory);
  return output.sort();
}

const routeRows = extractPlanRows("UI-");
const workflowRows = [...plan.matchAll(/^### (WF-\d{2}) — (.+)$/gm)].map((match) => ({
  id: match[1],
  name: match[2],
}));
const frontendRows = exportedFrontendFunctions();
const endpoints = JSON.parse(fs.readFileSync(endpointInventoryPath, "utf8"))
  .sort((a, b) =>
    `${a.group}|${a.route}|${a.method}`.localeCompare(`${b.group}|${b.route}|${b.method}`),
  );
const functions = xsFiles(path.join(root, "XANO/function"));
const tables = xsFiles(path.join(root, "XANO/table"));

if (routeRows.length !== 87) throw new Error(`Expected 87 routes, found ${routeRows.length}.`);
if (workflowRows.length !== 20) throw new Error(`Expected 20 workflows, found ${workflowRows.length}.`);
if (frontendRows.length !== 318) {
  throw new Error(`Expected 318 frontend API functions, found ${frontendRows.length}.`);
}
if (endpoints.length !== 295) throw new Error(`Expected 295 endpoints, found ${endpoints.length}.`);
if (functions.length !== 15) throw new Error(`Expected 15 functions, found ${functions.length}.`);
if (tables.length !== 93) throw new Error(`Expected 93 tables, found ${tables.length}.`);

const routeTable = routeRows
  .map(([id, route, coverage, srs]) =>
    `| ${cell(id)} | ${cell(route)} | ${cell(coverage)} | ${cell(srs)} | Pending | — | — |`,
  )
  .join("\n");

const controlTable = routeRows
  .map(([id, route]) =>
    `| CTRL-${cell(id)}-000 | ${cell(id)} | ${cell(route)} | Inventory placeholder: replace with one row per rendered or conditional interactive control before interacting with this route | Pending | — | — |`,
  )
  .join("\n");

const frontendTable = frontendRows
  .map(
    (row, index) =>
      `| FE-${String(index + 1).padStart(3, "0")} | \`FrontEnd/src/api/${cell(row.file)}\` | \`${cell(row.name)}\` | Pending caller mapping | Pending request observation | Pending | — | — |`,
  )
  .join("\n");

const endpointTable = endpoints
  .map((endpoint, index) => {
    const inputs = endpoint.inputs?.join("; ") || "None";
    const sideEffects = endpoint.tables?.join("; ") || "No table operation found statically";
    const reusable = endpoint.funcs?.join("; ") || "None";
    const flags = endpoint.flags?.join("; ") || "None";
    return `| API-${String(index + 1).padStart(3, "0")} | ${cell(endpoint.group)} | ${cell(endpoint.method)} \`${cell(endpoint.route)}\` | ${cell(endpoint.auth)} | \`${cell(endpoint.path)}\` | ${cell(inputs)} | ${cell(sideEffects)} | ${cell(reusable)} | ${cell(flags)} | Pending | — | — |`;
  })
  .join("\n");

const functionTable = functions
  .map(
    (source, index) =>
      `| FN-${String(index + 1).padStart(2, "0")} | \`${cell(source)}\` | Pending call-site/state mapping | Pending | — | — |`,
  )
  .join("\n");

const tableTable = tables
  .map(
    (source, index) =>
      `| DB-${String(index + 1).padStart(3, "0")} | \`${cell(source)}\` | Pending endpoint/owner mapping | Pending constraints/transition review | Pending | — | — |`,
  )
  .join("\n");

const workflowTable = workflowRows
  .map(
    ({ id, name }) =>
      `| ${cell(id)} | ${cell(name)} | Pending SRS atomic-rule mapping | Pending personas/fixtures | Pending | — | — |`,
  )
  .join("\n");

const coverage = `# VGC E2E Coverage Ledger

**Run:** \`${runId}\`
**Baseline date:** 2026-07-19 Australia/Melbourne
**Plan:** \`E2E_TEST_PLAN.md\`
**Status rule:** no inventory row may be removed; every row must end in Pass, Fail, Blocked, Not implemented, Dead, Unreachable, Duplicate normalisation artifact, or evidence-backed N/A.

## Coverage dashboard

| Inventory | Total | Pass | Fail | Blocked | Other terminal | Pending |
|---|---:|---:|---:|---:|---:|---:|
| Router entries | 87 | 0 | 0 | 0 | 0 | 87 |
| Control placeholders | 87 | 0 | 0 | 0 | 0 | 87 |
| Frontend API functions | 318 | 0 | 0 | 0 | 0 | 318 |
| Canonical Xano endpoints | 295 | 0 | 0 | 0 | 0 | 295 |
| Reusable Xano functions | 15 | 0 | 0 | 0 | 0 | 15 |
| Xano tables | 93 | 0 | 0 | 0 | 0 | 93 |
| End-to-end workflows | 20 | 0 | 0 | 0 | 0 | 20 |

Counts are updated at each checkpoint from the terminal statuses below. A route is not a Pass merely because it renders.

## 1. Routes

| Route ID | Route/screen | Required page/state/control coverage | SRS | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
${routeTable}

## 2. Interactive controls

Each placeholder must be replaced or supplemented with one row per visible, hidden-by-role, disabled, responsive-only, menu, tab, link, button, form control and keyboard action before that route is exercised.

| Control ID | Route ID | Route/state | Accessible name/action and required variants | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
${controlTable}

## 3. Frontend API/query functions

| Function ID | Source | Export | Screen/control caller(s) | Observed request/cache behaviour | Result | Evidence | Defect |
|---|---|---|---|---|---|---|---|
${frontendTable}

## 4. Canonical Xano endpoints

Every endpoint expands into the mandatory suffix cases in §15.3 of the plan. This inventory row closes only after all applicable child cases are terminal.

| API ID | Group | Method/path | Declared auth | Source | Inputs | Static table effects | Reusable functions | Static flags | Result | Evidence | Defect |
|---|---|---|---|---|---|---|---|---|---|---|---|
${endpointTable}

## 5. Reusable Xano functions

| Function ID | Source | Required caller/state coverage | Result | Evidence | Defect |
|---|---|---|---|---|---|
${functionTable}

## 6. Xano data tables and invariants

| Table ID | Source | Owner/CRUD mapping | Constraints/status/retention tests | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
${tableTable}

## 7. Workflows and SRS traceability

Expected results must keep separate columns in child cases for SRS Expected, Approved Deviation and Actual Observed.

| Workflow ID | Workflow | Atomic SRS rules | Personas/fixtures | Result | Evidence | Defect |
|---|---|---|---|---|---|---|
${workflowTable}

## Checkpoint history

| Checkpoint | Local time | Build/commit | Counts reconciled | Notes |
|---|---|---|---|---|
| CP-001 | 2026-07-19 | Root \`2b7a2c1\`; frontend \`ce7e994\` | 87/318/295/15/93/20 | Initial source-derived inventory seeded; no functional row has been credited yet |
`;

const execution = `# VGC E2E Execution Log

**Run:** \`${runId}\`
**Started:** 2026-07-19 (Australia/Melbourne)
**Scope:** exhaustive SRS-traceable frontend, backend, data, integration, UI/UX, accessibility and owner-authorised security testing
**Primary plan:** \`E2E_TEST_PLAN.md\`
**Coverage:** \`E2E_COVERAGE_LEDGER.md\`
**Fixtures:** \`E2E_FIXTURE_LEDGER.md\`

## Baseline

| Layer | Revision/environment | Initial result |
|---|---|---|
| Root repository | \`main\` at \`2b7a2c1\` after plan push | Remote synchronized; unrelated local modifications preserved |
| Frontend repository | \`main\` at \`ce7e994\` | Remote synchronized; existing \`session_log.md\` modification preserved |
| Xano | Workspace 161992, branch \`v1\` | CLI and MCP authenticated; workspace reports \`allow_push: false\` |
| Browser | In-app browser; local Vite and deployed Vercel targets | Connection/test startup pending |
| Mailbox | Authenticated Gmail plugin for VGC mailbox | Available; use test-run messages only |
| Deployment | Authenticated Vercel plugin and linked \`frontend\` project | Latest production deployment reports Ready |

## Access and tooling evidence

| Entry | Local time | Action | Result | Evidence summary |
|---|---|---|---|---|
| EX-001 | 2026-07-19 | Gmail connector profile lookup | Pass | Authenticated VGC mailbox profile returned |
| EX-002 | 2026-07-19 | Vercel team/project lookup | Pass | Linked Vite \`frontend\` project and Ready production deployment returned |
| EX-003 | 2026-07-19 | Xano Metadata API and SSE probes | Pass | Both endpoints returned HTTP 200 without exposing the token |
| EX-004 | 2026-07-19 | Install global Xano MCP | Pass | Global \`xano\` entry enabled; wrapper reuses \`xano profile token\` at runtime |
| EX-005 | 2026-07-19 | Fresh-process Xano MCP handshake | Pass | \`getLoggedInUser\` and \`listWorkspaces\` both succeeded for workspace 161992 |
| EX-006 | 2026-07-19 | Fetch root/frontend/Xano Git remotes | Pass | Root and frontend 0 ahead/0 behind; Xano has no configured upstream |
| EX-007 | 2026-07-19 | Commit and push plan artifacts | Pass | Root commit \`2b7a2c1\` pushed to \`origin/main\`; only the two plan artifacts were staged |

## Current blockers and limitations

| Blocker | Affected tests | Status/owner | Workaround |
|---|---|---|---|
| Cloudinary dashboard or confirmed disposable preset not yet verified | Full media retention/transformation/admin-cleanup certification | User/access check pending | Exercise configured upload route with synthetic fixture only after preset safety is confirmed |
| Physical iOS/Android device and camera not connected | Final PWA install, mobile keyboard/safe-area and QR camera certification | User/device later | Desktop responsive checks do not close these rows |
| Disposable role-rich account set not yet reconciled | Authenticated workflows, IDOR, destructive and financial tests | Test setup pending | Do not use real-member records |
| Xano workspace \`allow_push: false\` | Future backend product-code fixes only | User/Xano setting if fixes are authorised | Does not block MCP reads, API calls or test evidence |

## Chronological execution

| Entry | Local time | Case/route/API | Persona/fixture | Action | Expected | Actual | Result | Evidence/defect |
|---|---|---|---|---|---|---|---|---|
| RUN-001 | 2026-07-19 | Preparation | — | Seed source-derived route, function, endpoint, table and workflow inventories | Exact totals match the reviewed baseline | 87 routes, 318 frontend functions, 295 endpoints, 15 reusable functions, 93 tables and 20 workflows seeded | Pass | \`E2E_COVERAGE_LEDGER.md\` CP-001 |

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

**Next exact action:** connect the in-app browser, start the local frontend, capture build/console/network baseline, enumerate every control on \`/login\`, and execute unauthenticated authentication cases before creating disposable accounts.
`;

const personas = [
  ["P-001", "Adult A", "Primary member/buyer/giver/author/group admin"],
  ["P-002", "Adult B", "Counterparty/seller/taker/commenter/invitee"],
  ["P-003", "Adult C", "Unrelated third party for IDOR"],
  ["P-004", "Unverified member", "Verification and capability matrix"],
  ["P-005", "Verified without mobile", "Mobile-gated wallet activity"],
  ["P-006", "Suspended member", "Login/API enforcement"],
  ["P-007", "Guardian", "Minor approval workflow"],
  ["P-008", "Minor approved", "Approved-minor workflow"],
  ["P-009", "Minor rejected/expired", "Rejection and lazy expiry"],
  ["P-010", "Teacher", "Course/session management"],
  ["P-011", "Student", "Enrollment/check-in/rating"],
  ["P-012", "Pioneer candidate A", "Election candidate/voter"],
  ["P-013", "Pioneer candidate B", "Election candidate/voter"],
  ["P-014", "Pioneer candidate C", "Election tie/limits"],
  ["P-015", "Test admin", "Admin UI/API; never substitute owner for destructive cases"],
  ["P-016", "Backup admin candidate", "Designation/vacation/inactivity"],
];

const personaTable = personas
  .map(
    ([id, name, purpose]) =>
      `| ${id} | ${name} | ${purpose} | Pending reconciliation/creation | — | — | — | Not started |`,
  )
  .join("\n");

const fixtures = `# VGC E2E Fixture and Cleanup Ledger

**Run:** \`${runId}\`
**Rule:** only disposable records bearing this run marker may be used for destructive, security, concurrency, financial, erasure, suspension, impersonation or cleanup tests.

## Test-account personas

Use Gmail plus-address aliases unique to this run. Store credentials only in the approved local secret mechanism; never place passwords, OTPs, magic tokens or bearer tokens in this file.

| Persona ID | Persona | Purpose | Account/member ID | Email alias label | Initial roles/states | Initial wallet IDs/balances | Status |
|---|---|---|---|---|---|---|---|
${personaTable}

## Created domain records

| Fixture ID | Type | Runtime record ID | Creator persona | Marker/title | Purpose/target state | Mutations performed | Deletable | Cleanup status/evidence |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | No records created yet | — | — | Not started |

## Financial snapshots

| Snapshot ID | Workflow/case | Persona/admin wallet IDs and balances | PTS rate/components | Latest ledger/passbook IDs | Idempotency key label | Before/after reconciliation | Result |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | No financial mutation performed | Not started |

## System-wide configuration snapshots

| Setting | Before value/evidence | Temporary value | Authorised window | Restored value/evidence | Status |
|---|---|---|---|---|---|
| PTS rate/theta/reserve/budgets | Not read yet | No change authorised | — | — | Untouched |
| Vacation mode | Not read yet | No change authorised | — | — | Untouched |
| Cloudinary preset | Not verified | No change authorised | — | — | Untouched |

## Synthetic file fixtures

| File ID | Type/size | Safe contents | Created | Uploaded record IDs | Cleanup |
|---|---|---|---|---|---|
| FILE-001 | PNG, valid small | Visible \`${runId}\` marker | Pending | — | — |
| FILE-002 | PDF, valid small | Synthetic text and \`${runId}\` marker | Pending | — | — |
| FILE-003 | TXT renamed as image | Synthetic invalid-MIME case | Pending | — | — |
| FILE-004 | Oversize boundary fixture | Repeated synthetic bytes only | Pending | — | — |

## Cleanup checkpoints

| Checkpoint | Local time | Active fixture count | Deleted | Retained with reason | Orphans/financial residue | Result |
|---|---|---:|---:|---|---|---|
| CL-001 | 2026-07-19 | 0 | 0 | None | None created | Pass |
`;

writeNew("E2E_COVERAGE_LEDGER.md", coverage);
writeNew("E2E_EXECUTION_LOG.md", execution);
writeNew("E2E_FIXTURE_LEDGER.md", fixtures);

console.log(
  JSON.stringify(
    {
      runId,
      routes: routeRows.length,
      frontendFunctions: frontendRows.length,
      endpoints: endpoints.length,
      reusableFunctions: functions.length,
      tables: tables.length,
      workflows: workflowRows.length,
    },
    null,
    2,
  ),
);
