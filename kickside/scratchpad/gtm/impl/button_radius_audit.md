# Button border-radius audit

Read-only audit. No code changed.

## 1. The canon

There is no shared CSS custom property for button radius anywhere in the
monorepo — `theme-config.css` (the vendored `@wippy-fe/theme` package used by
every module) defines exactly one radius token,
`--p-content-border-radius: 6px`
(`kickside/sso/ui/node_modules/@wippy-fe/theme/theme-config.css:127`), and it
is not consumed by any application code (`grep` for it across
platform/sso/app/providers/crm/chestor/wapps returns zero hits). The button
radius convention is a **hand-maintained fixed literal, 8px**, established by
consistent repetition across every reference web-component surface:

- `kickside/platform/settings/ui/src/styles.css:51,190,198,241,245,265,289` — all buttons/icon-buttons `8px`
- `kickside/platform/mcp/ui/src/styles.css:97,127,138,186,211` — `.kx-icon-btn`, `.kx-btn`, inputs, all `8px`
- `kickside/sso/ui/src/admin.css:34,58,74` and `card.css:27,54` — `8px`
- `providers/kb10/ui/src/styles.css:122,174,208,303,328,351,416,428,433,486` and `document.css:113,120,162` — `8px`
- `kickside/platform/widgets/ui/src/**/styles.css` (channel-picker:34, component-picker:36/66, connection-picker:13/34, model-picker:31/39, multiselect:52/76/96/141, app/settings-chrome.css:24/30/62, app/pickerselect.css:8) — `8px` throughout

This is also the explicit, pre-existing project memory
(`canonical-web-component-styling.md`): "RADII: cards/lists 14px; inputs/buttons/icon-buttons 8px; chips/tags 6px; count-pills + switches 999px; icon tiles ~11px; alert/message boxes 10px."

**Canon: buttons / inputs / icon-buttons = `8px`.**

Sanctioned variants (not violations), all evidenced in the same reference files:
| Variant | Radius | Example |
|---|---|---|
| Cards / list containers | `14px` | `mcp/ui/src/styles.css:63,77,156,407`; `settings/ui/src/styles.css:106,259` |
| Chips / tags / badges | `6px` | `mcp/ui/src/styles.css:105,245,293,399`; `settings/ui/src/styles.css:124,128` |
| Count-pills / switches | `999px` | `mcp/ui/src/styles.css:367`; `settings/ui/src/styles.css:102,163` |
| Icon tiles (decorative, non-interactive) | `~11px` | `mcp/ui/src/styles.css:30,85,171`; `settings-chrome.css:90` |
| Alert / message boxes | `10px` | `mcp/ui/src/styles.css:52`; `settings-chrome.css` `.st-msg` (8px is the outlier here, see below) |

Circles (`50%`) for avatars/dots and true toggle switches (`999px`, native
`role=switch`) are excluded from this audit — they're a different control
class, not "buttons."

## 2. Violations

| File:line | Selector / component | Current | Should be | Visibility |
|---|---|---|---|---|
| `kickside/app/frontend/applications/main/src/styles.css:79` (`--r-btn: var(--r10)`), consumed at lines 256,273,285-287,294,322,396 | `.e-cta`, `.icon-btn`, `.ghost-action`, `.lt-input`, and **every** `.p-button` app-wide via `border-radius: var(--r-btn) !important` | `10px` | `8px` | **Highest** — the main SPA shell (core/core UI), forces every embedded PrimeVue button in every mounted module to 10px |
| `kickside/app/frontend/applications/main/src/app/app.vue:441,444,447,591,594,597` | Account/profile dropdown `<button role="menuitem">` (Profile, dynamic account items, Sign out) | no radius class/rule at all → `0` | `8px` (`var(--r8)`, already defined in the same file) | **Highest** — every logged-in user's profile menu, both horizontal and vertical nav layouts |
| `kickside/app/frontend/applications/main/src/app/app.vue:636-646` (`.brand-mark-btn`) | Collapsed-rail logo/re-open button | hardcoded `10px` | `8px` | Medium — sidebar-collapsed state only |
| `kickside/app/frontend/applications/main/src/app/SplashHost.vue:451` (`.sp-btn`), also 356/367/407/432/445 (`var(--r10)`) | Onboarding-wizard Back/Skip/Continue buttons | `var(--r-btn)` = `10px` | `8px` | High — first-run onboarding, seen by every new user |
| `kickside/platform/knowledge/ui/src/styles.css:425` (`.kn-btn`) | Knowledge-source onboarding footer button | hardcoded `10px` | `8px` | Medium — KB onboarding wizard |
| `kickside/platform/connection/ui/src/styles.css:387` (`.oc-btn`) | Connection onboarding footer button | hardcoded `10px` | `8px` | Medium — new-connection wizard |
| `kickside/platform/models/ui/src/styles.css:1402` (`.ob-btn`) | Model-provider onboarding footer button | hardcoded `10px` | `8px` | Medium — new-model-provider wizard |
| `chestor/workspace/ui/src/styles.css:1410` (`.ob-btn`) | Workspace onboarding footer button | hardcoded `10px` | `8px` | Medium — workspace onboarding wizard |
| `kickside/platform/pim/ui/src/styles.css:157-164` (`.pm-btn`, `.pm-btn.primary`, `.pm-btn.ghost`) | PIM record editor Save/Discard (floating save bar) and Cancel/Create (new-product dialog) — used at `app/products-workbench.vue:400,401,419,420` | `999px` (full pill) | `8px` | High — every PIM product edit/create action |
| `chestor/graph/ui/src/styles.css:73-78` (`.kg-btn, .kg-crumb, .kg-icon-btn, .kg-mini, .kg-sel`) | Knowledge-graph explorer toolbar (buttons, breadcrumbs, icon buttons, select) | `6px` | `8px` | Medium — KB graph view toolbar |
| `chestor/graph/ui/src/styles.css:95` (`.kg-mini`) | Graph explorer mini icon-buttons | hardcoded `5px` (further override, matches nothing) | `8px` | Medium |
| `chestor/db-schema/ui/src/styles.css:29` (`.de-btn`) | DB-schema explorer toolbar buttons | `6px` | `8px` | Medium — schema/DB explorer toolbar |

## 3. Root-cause patterns

1. **No shared radius token.** Every module hand-writes the literal `8px` (or
   invents a private alias) instead of importing one canonical
   `--p-button-radius`-style custom property from `@wippy-fe/theme`. The
   framework's only real token, `--p-content-border-radius: 6px`, is unused.
   This is *why* drift happens — there is nothing to import, so each module
   re-derives the convention by eye/copy-paste.

2. **Parallel per-module token systems that have already drifted.** Multiple
   modules invented their own local radius scale instead of the shared 8px
   literal:
   - `--km-radius-sm` = `8px` in `platform/security/ui/src/styles.css:20`,
     `platform/models/ui/src/styles.css:20` — correct value, but `--km-radius-pill`
     is `6px` in both those files (`:21` each) while the same-named token is
     `7px` in `chestor/workspace/ui/src/styles.css:21` — **the identical
     variable name already resolves to two different values** in three
     independent copies of the same design system.
   - `--wf-radius-sm` (`platform/workflows/ui/src/styles.css:54`), `--sa-r-ctl`
     (`wapps/stat-analysis/ui/src/styles.css:12`), `--pm-r-ctl`
     (`platform/pim/ui/src/styles.css:10`), `--kb-r` (`providers/kb10/ui/src/styles.css:26`)
     all currently equal `8px` — correct today, but each is a private,
     independently-maintained duplicate of the same constant, one edit away
     from the same drift as `--km-radius-pill`.

3. **The app shell runs its own, internally-consistent but wrong, button
   system.** `app/frontend/applications/main/src/styles.css` explicitly
   documents (`/* Consistent control + badge radii, reused everywhere (no
   ad-hoc pills) */`, line 78) a full scale — `--r-btn: var(--r10)` — and
   applies it deliberately, including forcing all embedded PrimeVue
   `.p-button` instances via `!important`. This reads as a second, competing
   canon rather than a stray bug, but it directly contradicts the 8px
   convention every embedded module widget uses, and the app shell is the
   highest-traffic surface in the product (nav, command palette, splash,
   system page all render next to embedded module content).

4. **Copy-paste propagation.** The onboarding-wizard footer button
   (`padding: 11px 20px; border-radius: 10px; ...` with identical
   `font-size/weight/transition`) is byte-for-byte duplicated across
   `knowledge`, `connection`, `models`, and `chestor/workspace` — carrying the
   app shell's non-canonical `10px` into four platform modules that
   otherwise use `8px` for every other button in the same stylesheet
   (e.g. `connection/ui/src/styles.css` has both the correct `.kx-btn`
   at `var(--r8)` (line 73) and the wrong `.oc-btn` at `10px` (line 387) in
   the same file).

**Consolidation recommendation:** add one real token
(`--p-button-border-radius: 8px` or a kickside-prefixed equivalent) to
`@wippy-fe/theme/theme-config.css`, require every module to consume it
instead of a literal or a private alias, and delete the module-local
`--km-radius*`/`--wf-radius*`/`--sa-r-*`/`--pm-r-*`/`--kb-r*`/app-shell `--r-btn`
duplicates in favor of it. Retire the onboarding-footer-button copy-paste
into one shared component/class.

## 4. Count summary

| Module | Violations found |
|---|---|
| App shell (`app/frontend/applications/main`) | 4 (`--r-btn` system-wide, profile-menu 0-radius, brand-mark-btn, SplashHost onboarding) |
| `platform/knowledge/ui` | 1 |
| `platform/connection/ui` | 1 |
| `platform/models/ui` | 1 |
| `chestor/workspace/ui` | 1 |
| `platform/pim/ui` | 1 (2 button variants, 4 call sites) |
| `chestor/graph/ui` | 2 (`6px` toolbar family + `5px` mini override) |
| `chestor/db-schema/ui` | 1 |
| **Total discrete violations** | **12** |

Modules checked and found clean (button radius consistently `8px` or a
correct local alias): `settings`, `mcp`, `security`, `sso`, `widgets`
(all pickers), `agents`, `hub`, `users`, `workflows`, `stat-analysis`,
`kb10`, `crm`, `research`. Modules with no distinct local button class
detected during the sweep (spot-check recommended, not confirmed clean):
`providers/hubspot`, `providers/phantombuster`, `providers/memory`,
`providers/google`, `platform/transform`, `platform/recipes`,
`platform/uploads`, `platform/sessions`, `platform/execution`,
`platform/inbox`, `platform/webhooks`, `platform/sync`, `platform/skills`,
`platform/channel`, `platform/transfer`, `platform/identity`,
`platform/ui/ui`, `wapps/dashboard`, `wapps/gtm_core`, `wapps/precall`.
