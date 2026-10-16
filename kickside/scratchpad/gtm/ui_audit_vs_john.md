# UI audit against John’s interface specification

Read-only audit of the live app’s source and existing screenshots under
`kickside/scratchpad/gtm/e2e-shots/`. The running instance is mounted at `:8085`,
but the audit uses the source surfaces requested by the recon brief rather than
browser interaction. Findings only; no fixes are proposed here.

John’s six primary views are taken from `scratchpad/gtm/digest.md §1.3`, with
requirements 29–35 treated as acceptance criteria.

## Overall result

The current app is a registry-driven KickSide shell with generic module pages.
It has partial building blocks for all six areas, but it does not present John’s
GTM operating interface. The largest gaps are:

- Dashboard is an installed-surface launcher, not spine status plus daily stats.
- Inbox is a generic priority/recency queue, not one urgency-ranked GTM approval
  queue with the four required categories and a regenerate/send flow.
- Workflows are a generic workflow inventory, not per-spine operational rows.
- Agents are prompt/model/capability editors, not trigger/input/output/approval
  configurations with prompt history and run logs.
- Connections show auth/component state, not call health and dependent-agent
  blast radius.
- Knowledge has KB CRUD and engine management, not an upload/organize/version
  workspace.
- The shell has substantial extra navigation beyond the six primary views.

## 1. Navigation and shell

**Status: partial / deviates.**

The live screenshot `scratchpad/gtm/e2e-shots/uisweep-01-home.png` shows 13
top-level items: Dashboard, Agents, CRM, Inbox, Knowledge, Automations,
Connections, Research, Workflows, MCP, Uploads, Skills, and System. The shell is
assembled from registry nav entries in `kickside/app/frontend/applications/main/
src/app/app.vue` and `composables/useSurfaces.ts`; platform/wapp/CRM
`ui.nav_item` entries feed it, with the app’s System item added separately.

This is more surface area than John’s six primary views and leaves several
competing entry points for the same operating concepts: Inbox versus
Automations versus Workflows, plus separate Research/Briefs/Acquisition pages.
The extra surfaces are visible clutter relative to a GTM command-center nav.

## 2. Dashboard — spine status and daily stats

**Status: missing.**

`wapps/dashboard/ui/src/app/dashboard.vue:43-56` fetches
`/api/v1/dashboard/overview`, but the view treats the response as a list of
installed surfaces. Its rendered content at `:81-122` is “Welcome to KickSide,”
an installed-surface count, and a grid of module cards. The screenshot
`uisweep-01-home.png` matches this implementation.

There is no spine model, spine status/phase display, daily activity summary,
run health, output count, or cross-spine KPI surface in the Dashboard source.

## 3. Approval Queue — one urgency-sorted queue and two-click review

**Status: partial at the generic inbox layer; missing as John’s queue.**

### What exists

`kickside/platform/inbox/ui/src/app/inbox.vue` provides one Inbox surface with
Pending, Resolved, and All tabs, a list/detail layout, and the generic item host
`InboxItem.vue`. The screenshot `uisweep-08-inbox.png` shows “Inbox 0 pending,”
the three tabs, and a generic “New notice” action.

The backend is priority then recency ordered:

- `platform/inbox/src/api/list_inbox.lua:1-3` documents “priority then recency.”
- `platform/inbox/src/persist/reader.lua:54-58,114` sorts by generic priority rank
  and `created_at`.

Pre-call briefs have a richer custom card in
`wapps/precall/ui/src/app/BriefReview.vue`. It supports `Approve`, `Edit &
approve`, and `Reject` (`:200-218`), with inline edit/reject panels
(`:193-196`, `:185-190`). Its item declaration is in
`wapps/precall/src/_index.yaml` and includes custom actions and priority mapping.

### Deviations and missing requirements

- The queue is not categorized or sorted as imminent-meeting briefs, high-intent
  follow-ups, comments, then SOWs. Generic priority values do not implement
  those four urgency classes.
- The host action vocabulary in `InboxItem.vue:44-50` is only Approve, Reject,
  and Dismiss. There is no generic Review → Edit / Approve&Send / Regenerate /
  Reject flow.
- The custom brief card says Approve, not Approve&Send; its downstream send/draft
  behavior is represented by separate mapper/catalog paths, not a queue-level
  send action.
- No Regenerate action was found in the inbox host or `BriefReview.vue`.
- There is no evidence of an explicit “no sends outside this queue” guard in the
  UI. Approval is an inbox action, while manual sink/catalog surfaces remain
  separately reachable.
- Review weight is only partially represented by item priority and timeout/
  escalation metadata. There is no variable-weight review tier that distinguishes
  quick glance from mandatory full edit. This is the row-30 gap.
- The screenshot has an empty generic queue, so the <15-minute/day operating
  target and urgency effectiveness are not represented by the current surface.

## 4. Per-spine workflow views

**Status: partial generic workflow inventory; per-spine view missing.**

The current Workflows screenshot `uisweep-13-workflows-list.png` shows a generic
workflow page with search, All/Partials/Templates filters, a count, and rows. The
source table at `kickside/platform/workflows/ui/src/app/list/WorkflowTable.vue:
104-114` renders Name, Labels, Location, Status, Last run, Updated, and actions.

John’s row requires name, phase, status, last run, output count, and a
run-manually-for-testing action. The current row has no phase, output count, or
run button. Row actions are label editing, export/share/delete; the builder has
`RunWithInputDialog.vue`, but that is an in-builder interaction and is not the
per-row manual test action John specified.

There is also no spine grouping or spine-specific workflow route. The registry
provides a generic Workflows nav item (`kickside/platform/workflows/src/_index.yaml`)
and wapps add separate module surfaces such as Pre-call Briefs and Acquisition,
but no five-spine operational view with a consistent row schema.

## 5. Per-agent Config

**Status: partial for prompt/model/capabilities; missing most of John’s agent contract.**

`kickside/platform/agents/ui/src/app/AgentForm.vue:80-91` defines the editable
form as title, description, icon, prompt, model, temperature, max tokens,
thinking effort, traits, trait contexts, tools, delegates, and memory target/
provider. The tabs at `:319` and rendered sections around `:420` cover Prompt,
Model, Capabilities, and Routing.

The matching API contract in `kickside/platform/agents/src/_index.yaml:239-273`
contains the same general user-agent fields. The source has no agent-config
fields or panels for:

- trigger definition;
- workflow input contract or input bindings;
- output type or output routing;
- approval-required toggle, including the required default ON for sending;
- KB attachments as a first-class attachment list;
- prompt version history/diff/restore;
- recent run logs.

Memory target/provider is not equivalent to KB attachment. Traits and tools are
configurable capabilities, but they are not a user-visible trigger/output/
approval configuration. The Skills surface has version-like history behavior in
its own domain, but that does not provide agent prompt history.

## 6. Connections grid — health and blast radius

**Status: partial connection catalog/auth UI; health and dependency grid missing.**

The screenshot `uisweep-12-connections.png` shows a Connections page with search,
“Connect app,” and provider cards (GitHub, Atlassian, Google, Discord, Fireflies,
HubSpot, PhantomBuster, Slack). Empty-state content does not show health or
dependent agents.

`kickside/platform/connection/ui/src/app/connections.vue:20-33` defines the
connection row fields as component id, name/provider/icon, connection state,
expiry/refresh timestamps, token refresh, scopes, and OAuth flag. The page loads
`/api/v1/connections` and provider discovery (`:79-111`) and supports reconnect,
share, remove, and provider configuration. It does not model or render
`last_successful_call` or dependent agents.

The runtime contract does expose a provider `test_connection` operation:
`kickside/platform/connection/src/_index.yaml:181-196,323`. The current page does
not present its result as last successful call/health history, and no dependent-
agent or blast-radius projection is present in the row type or source.

The unhealthy-connection requirement is also absent from the visible behavior:
no current UI or general enforcement path was found that prevents a dependent
agent from running when a required connection is unhealthy. This is the row-33
gap.

## 7. Knowledge base upload, organization, and version UI

**Status: partial KB management; upload/organize/version workspace missing.**

The screenshot `uisweep-09-knowledge-list.png` shows KB cards, search, counts,
and “New knowledge base.” `kickside/platform/knowledge/ui/src/app/knowledge.vue`
provides KB list/detail/create/edit/delete/share and engine-owned management;
`KbDialog.vue` handles name, description, type, engine, model, and engine config.

The backend has ingestion/upload APIs, including
`platform/knowledge/src/api/ingest_upload.lua`, and content metadata includes
upload/version lineage. The inspected UI source does not expose a user workflow
for uploading files into a KB, organizing files/folders/tags as a first-class
workspace, browsing version history, diffing/restoring versions, or assigning a
version to an agent. The existing KB list/detail and engine management therefore
do not satisfy John’s upload/organize/version requirement.

## Requirement-row crosswalk

| John requirement | Audit result | Evidence / exact deviation |
|---|---|---|
| 29. One approval queue, urgency-sorted | **Partial / not met** | Generic Inbox exists; backend is priority/recency, not the four required GTM urgency categories. |
| 30. Variable-weight review | **Missing** | Item priority and escalation exist, but no quick-glance versus full-edit review tier in `InboxItem.vue` or the queue. |
| 31. Tune prompt/inputs/output routing without code | **Partial** | Agent prompt/model/traits/tools are editable; trigger, workflow inputs, output type/routing are absent. |
| 32. Integration health/auth/last call/dependents | **Partial / not met** | Auth/state/scopes and reconnect exist; last successful call and dependent-agent blast radius do not. |
| 33. Prevent agent when required connection unhealthy | **Missing** | `test_connection` exists as a runtime operation, but no visible dependent-agent guard was found. |
| 34. Shared company-voice KB | **Partial** | KBs exist and agents have memory fields; first-class KB attachment/company-voice assignment is absent in `AgentForm.vue`. |
| 35. Upload/organize/version KB files | **Missing** | KB CRUD/list/detail exists; file lifecycle/version UI is absent. |

## Six-view verdict

| John view | Exists? | Current surface | Audit finding |
|---|---|---|---|
| Dashboard | Partial shell only | `wapps/dashboard/ui/src/app/dashboard.vue` | Installed-surface launcher; no spine status or daily stats |
| Approval Queue | Partial generic inbox | `platform/inbox/ui`, `wapps/precall/ui/BriefReview.vue` | One inbox exists, but urgency taxonomy, send/regenerate actions, review tiers, and queue-only send policy are absent |
| Per-spine workflows | Missing as specified | `platform/workflows/ui` | Generic workflow table lacks phase/output count/manual row run and spine grouping |
| Per-agent Config | Partial | `platform/agents/ui/AgentForm.vue` | Prompt/model/capabilities only; no trigger/input/output/approval/KB/history/log contract |
| Connections grid | Partial | `platform/connection/ui/connections.vue` | Auth/state/provider catalog only; no last-call/dependency/blast-radius view or run guard |
| KB upload/organize/version | Partial list/detail | `platform/knowledge/ui` | KB CRUD/engine surface exists; requested file lifecycle UI is absent |

