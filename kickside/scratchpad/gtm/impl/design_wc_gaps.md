# Design + Web-Component Gap Audit

Live + source, read-only. App live at http://localhost:8085 (admin@wippy.local).
Screenshots: `/tmp/claude-1000/-home-wolfy-j-kickside/3fc3674e-309e-47a5-a3d8-89305debb90f/scratchpad/design_gaps/`.
Canon: `app/frontend/docs/best-practices.md` (radius table, one-WC, tokens-only, W13, honesty),
`platform/workflows/ui/CONVENTIONS.md`. Prior context: `button_radius_audit.md`, `radius_fix.md`.

## Headline

The shell radius fix is **live**: the served bundle `app/static/app/main/style-CL8zG2BZ.css`
ships `.p-button/.e-cta/.icon-btn/.ghost-action/.brand-mark-btn/.acct-item = var(--r8) = 8px`.
Every top-level surface a user hits (Dashboard, Workspace, Agents, CRM, GTM, Inbox, Knowledge,
Automations, Connections, Research, Statistical Analysis, Workflows list + builder, MCP, Uploads,
Skills, System) renders **canon-clean**: 14px cards, 6px chips, 999px switches, 8px buttons,
directed empty states. The New agent, New knowledge base, and Connect wizards are high quality.

"Rounded buttons / bare elements" resolves to a small, specific set below — **not** a systemic
regression. Most of it is either pack-frozen (source already fixed, waiting on a pack release) or a
handful of native `<select>`/checkbox controls that a sibling module already styles correctly.

### Reachability model (who can fix what, from `app/wippy.lock`)

- **Source-loaded (fixable now, lands on rebuild):** app shell/core, `platform/automation`,
  `platform/recipes`, `platform/hub`, `platform/workflows`, `crm`, `providers/hubspot`, `sso`,
  `wapps/{contacts,gtm_core,precall,research}`.
- **Pack-frozen (hash-pinned in lock, source fix ships next pack):** everything else —
  `uploads`, `dashboard`, `knowledge`, `connection`, `models`, `agents`, `settings`, `security`,
  `users`, `channel`, `sync`, `skills`, `inbox`, `webhooks`, `mcp`, `pim`, `chestor/*`, most providers.

---

## 1. Live findings

| # | Surface | Element | What's wrong | Canon rule | Screenshot | Class | Fix owner |
|---|---|---|---|---|---|---|---|
| L1 | Dashboard (home) | Red banner "Request failed with status code 500" | Raw axios message rendered as a dead-end: no what-happened / what-next, no retry. Terminal state with no directed action. | W13 error/empty rules (best-practices.md:79-81) | `home_after_login.png` | **NEW** | pack-frozen — `wapps/dashboard/ui/src/app/dashboard.vue:52,94` (`kickside/dashboard` is hash-pinned, not replaced) → next dashboard pack |
| L2 | Uploads | "All status" filter is a native `<select>` showing OS chrome (double-arrow) | `.kx-select` sets border/radius but **no `appearance:none`**, so OS dropdown chrome renders next to the styled Upload button/search. Bare element. | tokens/one-system styling; sibling modules drop the OS chevron | `nav_uploads.png` | **NEW** | pack-frozen — `platform/uploads/ui/src/styles.css:56`, `uploads.vue:561` → next uploads pack |
| L3 | System / Hub | "Top downloads" sort + "All installed" filter native `<select>` OS chrome | `.hub-sort` — same defect, **no `appearance:none`** (0 in file), while sibling `automation` explicitly `appearance:none`'s its selects "drop the OS chevron". Bare. | same | `nav_system.png` | **NEW** | **fixable now** — `platform/hub/ui/src/styles.css:285`, `modules.vue:276,457,559`, `InstallDialog.vue:136,366` (hub is source-replaced) |
| L4 | Knowledge → New KB dialog | Query-driver native `<select class=cx-input>` (below fold) sits among styled `wc-model-picker` dropdowns | Lone native select in an otherwise fully-styled config; inconsistent chrome. | one-system styling | `dlg_new_kb.png` | **NEW** | pack-frozen — `platform/knowledge/ui/src/app/KbCreateConfig.vue:292` → next knowledge pack |
| L5 | All surfaces (shell nav/tabs) | Top-nav tab buttons compute `border-radius: 6.5px` | Shell has two radius systems: fixed `--r8`(8px) CSS vars (now correct) **and** Tailwind `rounded-lg` which resolves to 6.5px at the shell's 13px root font. Nav uses the Tailwind one → 6.5px, off the 8px button canon. Minor (less rounded, not "too round"). | radius canon: buttons = 8px | every `nav_*.png` | **NEW** | **fixable now** — shell/core (`app/frontend/applications/main`) |
| — | Login → Home | Shell action buttons | 8px, correct (radius fix is live) | — | `home_after_login.png` | verified clean | — |
| — | CRM / Agents / Workspace / Connections / MCP / Automations / Inbox / GTM / Stat-Analysis / Workflows list+builder / New-agent / Connect-Discord | cards/chips/switches/buttons/empty-states | canon; directed empty states; styled pickers with custom chevrons; accent-color checkboxes | — | respective `nav_*` / `dlg_*` / `wf_*` png | verified clean | — |

### Known pack-frozen radius items (from `radius_fix.md`) — still render wrong live, **not** re-reported as new

`.kn-btn` (knowledge onboarding), `.oc-btn` (connection onboarding), `.ob-btn` (models + chestor/workspace
onboarding, 10px), `.pm-btn` (pim save/create, **999px full pill**), `.kg-*` (chestor/graph toolbar, 6px/5px),
`.de-btn` (chestor/db-schema, 6px). All source-fixed already; each is hash-pinned → next pack. Their
onboarding-footer instances only surface in first-run/empty states, so they were not re-photographed here.

---

## 2. Source findings

### 2a. Native form controls not neutralizing OS chrome (`appearance:none` missing)

Platform has **no generic styled-select WC** — native `<select class=...>` *is* the pattern, so the
defect is failing to style it, not "should use a WC". `appearance:none` present (correct) in:
`agents, automation, execution, identity, models, recipes, security, sync, transfer, chestor/workspace`.
Missing (native chrome leaks):

| File:line | Control | Reachability |
|---|---|---|
| `platform/hub/ui/src/styles.css:285` (`.hub-sort`) + `modules.vue:276,457,559`, `InstallDialog.vue:136,366` | 5 native selects | **fixable now** |
| `platform/uploads/ui/src/styles.css:56` (`.kx-select`) + `uploads.vue:561` | status filter | pack-frozen |
| `platform/workflows/ui/src/styles.css:788` (`select.wf-input`, cursor only) + `NodeConfigPanel.vue:609,618,627,637,738` | node-config selects | **fixable now** (minor) |
| `platform/knowledge/ui/.../KbCreateConfig.vue:292` (`.cx-input`) | query driver | pack-frozen |
| `platform/{users,channel,skills,inbox,settings,transform,pim}` native selects | various | pack-frozen |

### 2b. Bare native checkboxes/radios (no styling class, no `accent-color`)

Workflows checkboxes are fine — `.wf-check-row input { accent-color: var(--wf-accent) }`. Bare ones:

| File:line | Control | Reachability |
|---|---|---|
| `platform/hub/ui/src/app/InstallDialog.vue:344` | `criticalConfirmed` checkbox | **fixable now** |
| `crm/ui/src/app/MergeReview.vue:98` | native radio in `.cm-radio` (radio unstyled) | **fixable now** (minor) |
| `wapps/gtm_core/ui/src/app/ProfileCreate.vue:263,295` | bare checkboxes | **fixable now** |
| `platform/automation/ui/src/app/automations.vue:1104` | `deleteChoices` bare checkbox | **fixable now** (module otherwise styles) |
| `platform/{channel,users,agents,inbox,connection}`, `providers/{github,memory,kb10}` bare checkboxes/radios | various | pack-frozen |

### 2c. Hex / brand color

No meaningful brand-color leaks in **source-loaded** modules — only `#fff`/`#000` contrast/mask
utilities and (workflows) the sanctioned per-kind canvas hues; not violations. Notable heavy hex is all
pack-frozen viz color: `chestor/db-schema` (32), `chestor/graph` (14 css + ~40 in `GraphApp/NodePanel/
EdgePanel/SchemaPanel.vue`), `chestor/workspace/Workspace.vue` (10). Borderline: `platform/ui/ui/src/app/
appearance.vue:61 DEFAULT_TONE='#22c55e'` — a default color *value* in the theming editor (pack-frozen).
`wapps/gtm_core/ui/src/surface.css:69` hardcodes `#1b1b1b` body fallback (source, trivial).

### 2d. Shared-WC reuse

Reuse is broadly correct — `wc-model-picker` (34), `kickside-share` (26), `wc-schema-form` (16),
`wc-multiselect` (9), `wc-component-picker` (5), `SchemaEditor` (5), `wc-icon-picker`/`IconField` (icon),
`wc-connection-picker`, `wc-channel-picker` all consumed by tag. `appearance.vue` correctly mounts the
shared `IconField` (promptmap's "hand-rolled" flag was a false positive). No hand-rolled duplicate picker
found in a source-loaded module.

**Known platform ticket (not new, not source-loaded):** `platform/models/ui/src/app/shared/` and
`platform/security/ui/src/app/shared/` each ship an **identical 18-file component library** (Button,
Drawer, EmptyState, SelectField, TextInput, Toggle, Pill, Notice, Avatar, ...) — a parallel
reimplementation of the same primitives (the known `.kx-*` chrome-duplication ticket). Both pack-frozen.

---

## 3. Ranked fix list — NEW + fixable-now only

1. **Hub native selects (L3)** — add `appearance:none` + styled chevron to `.hub-sort`, copying
   `platform/automation/ui/src/styles.css:187-189` (`select.kx-input`). Removes the bare OS dropdowns
   visible live on the System page (5 selects). `platform/hub/ui/src/styles.css:285`.
2. **Shell nav/tab radius (L5)** — reconcile the shell's Tailwind `rounded-lg` (6.5px) with the 8px
   button canon so nav tabs match `--r8`. Shell rebuild. (Low visual severity, high surface area.)
3. **Hub InstallDialog checkbox** — `accent-color`/style the `criticalConfirmed` checkbox
   (`InstallDialog.vue:344`).
4. **Workflows `wf-input` selects** — add `appearance:none` to `select.wf-input`
   (`platform/workflows/ui/src/styles.css:788`); minor consistency in the node-config panel.
5. **CRM merge radio + gtm_core profile checkboxes** — `accent-color`/style
   (`crm/ui/src/app/MergeReview.vue:98`, `wapps/gtm_core/ui/src/app/ProfileCreate.vue:263,295`).

NEW but **pack-frozen** (fix at source now, ships next pack): L1 dashboard raw-500 W13 dead-end
(`wapps/dashboard/ui/src/app/dashboard.vue:52,94`), L2 uploads select, L4 knowledge query-driver select.
