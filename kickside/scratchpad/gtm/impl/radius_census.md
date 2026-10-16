# Border-radius census — UI codebase

Grep-complete census of every `border-radius` (and `rounded-*` utility) in source CSS/Vue/TS
across: platform/{workflows,widgets,recipes,automation,hub,connection,knowledge,models,uploads}/ui,
providers/kb10/ui, app/frontend (shell). Built statics, Lua, and app/wippy.lock excluded.

Canon: app/frontend/docs/best-practices.md "Radius canon" — 8px controls · 6px chips/badges ·
999px pills/switches/round dots · 14px cards/menus/list-containers · 10px alerts · 11px icon
tiles · 50% circles · 2px/4px small structural (focus rings, grips).

## Totals

571 `border-radius` declarations. No Tailwind `rounded-*` violations (shell pins `rounded-lg`→8px
in tailwind.config.ts; `rounded-xl`/`rounded-full` only on chrome menus/avatars, canon).

| Package | declarations | violations fixed |
| --- | --- | --- |
| workflows | 103 | 3 |
| widgets | 59 | 0 (clean) |
| recipes | 6 | 1 |
| automation | 32 | 0 |
| hub | 70 | 3 |
| connection | 34 | 3 |
| knowledge | 35 | 0 |
| models | 49 | 1 |
| uploads | 17 | 0 |
| kb10 | 123 | 13 |
| app (shell) | 43 | 5 |
| **total** | **571** | **29** |

## Resolved-value distribution (after fixes)

`8px` 239 · `6px` 71 · `14px` 70 · `999px` 57 · `10px` 55 · `50%` 31 · `11px` 27 · `4px` 3 ·
`2px` 3 · multi-corner canon combos 6 (`14px 0 8px 0`, `0 0 8px 8px`, `2px 2px 0 0`,
`0 999px 999px 0`) · `!important` canon 3 · derived `calc()` on canon tokens 3 · decorative marks
`16px` 4. Every declaration now resolves to a sanctioned value or a documented ALLOW exception.

## Alias map (resolves-to)

| alias | value | canon role |
| --- | --- | --- |
| `--wf-radius` | 14px | card |
| `--wf-radius-sm` | 8px | control |
| `--km-radius` | 10px | alert/default (models) |
| `--km-radius-sm` | 8px | control |
| `--km-radius-pill` | 6px | chip (mis-named; value = chip canon) |
| `--doc-radius` (kb10) | 14px | card |
| `--kb-r` | 8px | control |
| `--kb-r-card` | 14px (was 12px) | card — FIXED |
| `--kb-r-sm` | 6px | chip |
| `--r8/--r10/--r6/--r4` (hub, shell) | 8/10/6/4px | scale |
| `--r-badge` | 6px | chip/badge |
| `--r-btn` (hub) | 10px | control (module-local, deliberate) |
| `--r-card` (connection, shell) | 14px (new) | card — added by fix |
| `--r14` (shell) | 14px (new) | card — added by fix |
| `--r12` (connection) | removed (was 12px) | replaced by `--r-card` |

## Violations fixed (itemized)

| file:selector | before | after | role | note |
| --- | --- | --- | --- | --- |
| workflows NodeConfigPanel.vue `Change {tool}…` / `Cancel` | `.wf-chip` (999px pill) | `.wf-ctl-sm` (8px) | control | the named defect — tool/func identity-swap buttons wore the pill, same as the just-fixed Change-agent; `.wf-ctl-sm` comment broadened |
| workflows styles.css:538 `.wf-new-menu` | 12px | `var(--wf-radius)` 14px | menu/card | |
| workflows styles.css:849 `.wf-panel-hdr-dot` | 3px | 999px | round dot | |
| recipes styles.css:88 `.ra-confirm` | 12px | 14px | card/panel | tinted "what-this-creates" panel holding a list → card |
| connection styles.css `.live-card`/`.setup-card`/`.oc-tile` | `var(--r12)` 12px | `var(--r-card)` 14px | card/tile | `--r12` removed, `--r-card:14px` added |
| hub styles.css:605 `.km-ov-icon` | `var(--r12)` 12px | 11px | icon tile | |
| hub styles.css:665-666 `.km-scan-bar` + fill | 3px | 999px | progress bar (pill) | |
| models styles.css:518 accent stripe | `0 3px 3px 0` | `0 999px 999px 0` | accent stripe (pill) | |
| kb10 styles.css:27 `--kb-r-card` (11 usages) | 12px | 14px | card/panel | consolidated with kb10's other card radius `--doc-radius:14px` |
| kb10 graph.css:192 / wiki.css:39 resizer grips | 3px | 999px | drag grip (pill) | |
| app styles.css:186 `.page-head-icon` | `var(--r12)` 12px | 11px | icon tile | |
| app styles.css:227 `.lt-card` | `var(--r12)` 12px | `var(--r-card)` 14px | card | canonical page panel; `--r14`/`--r-card` tokens added to the shell scale |
| app styles.css:236 `.lt-empty-hero` | `var(--r20)` 20px | `var(--r16)` 16px | decorative hero | normalized to the shared hero-mark radius |
| app app.vue:661 `.h-cat-menu` | `var(--r12)` 12px | `var(--r-card)` 14px | menu/card | |
| app app.vue:698 `.nav-dot` | 9999px | 999px | round dot | literal normalized |

## Sanctioned-variants (kept, not violations)

- **calc() radii derived from canon** (workflows `.wfn--selected::after` +3px, `.wfn-ring` +2px selection/focus
  rings around the 14px node card; `.wf-sed-view` −2px nested segment = 6px). ALLOW-listed in the guardrail.
- **Decorative brand/hero marks at 16px** (shell `.brand-mark`, `.sp-logo-prev`, `.sp-done-hero`, `.lt-empty-hero`) —
  oversized non-interactive marks (56–76px); proportional radius, not the ~11px icon-tile canon. ALLOW-listed.
- **hub `--r-btn: 10px`** on buttons/inputs/selects — a deliberate, module-consistent local control radius
  (10px is a canon value). Divergence from the 8px control row noted for owner awareness; not swept (value passes,
  module-wide restyle out of scope).
- **models `--km-radius: 10px`** module default; **`--km-radius-pill: 6px`** (mis-named, resolves to chip canon).
- 11px icon tiles, 10px alerts, 50% circles/avatars/dots, 2px/4px (focus rings, thin bars, inline `<code>`,
  skeletons), multi-corner canon combos — all canon per role.

## Guardrail

`src/radius-canon.test.ts` added to all 11 territory packages (workflows, widgets, recipes, automation, hub,
connection, knowledge, models, uploads, kb10, shell).
It walks the package's CSS/SFC sources, resolves `var()` chains against the package's own tokens, and fails on any
`border-radius` resolving outside `{0,2,4,6,8,10,11,14,999}px | 50%` unless matched by a per-package ALLOW entry
(reason-documented). Negative-tested: an injected 13px is caught with file+selector. Auto-discovered by each
package's vitest `include`, so it runs in the normal `vitest run`. Comment points at the canon doc; the rule is
"fix the element, never widen the set."

## Verification

- All 8 guardrail suites green; full workflows suite 420/420, shell suite 24/24.
- vue-tsc: every changed file (NodeConfigPanel.vue, 8 test files, all CSS) introduces zero type errors; hub and
  shell fully clean. Pre-existing unrelated errors remain in workflows(3), widgets(15), recipes(2), models(24),
  kb10(8) — untouched by this work.
- `vite build` green for all 7 packages with source changes.
- Built-static spot-check: workflows identity "Change" button ships `wf-ctl-sm` (8px), kb10 `--kb-r-card: 14px`,
  connection `--r-card: 14px`, shell `.lt-card` → `--r-card: var(--r14: 14px)`.
