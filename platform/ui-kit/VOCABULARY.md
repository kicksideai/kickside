# The KickSide FE vocabulary

Reference for everything `@kickside/ui-kit` ships: what each class is for, what
it deliberately does not do, and what adopting it costs you.

Written to be read cold. If you are about to add a control, a card, a badge or a
colour to a KickSide module, the answer is probably here, and if it is not, the
last section tells you where it should live instead.

The module mechanics — how the package is published, materialized and wired into
a consumer — are in [README.md](README.md). This file is about the vocabulary.

---

## The one rule that catches everyone

A CSS `@import` must precede every other rule in a stylesheet. So a ui-kit sheet
always lands **first**, and a module's own rule with the same selector wins at
equal specificity.

**Adopting means DELETING the local rule.** Importing without deleting changes
nothing, silently. If you adopt a sheet and the surface looks unchanged, that is
the symptom.

```css
/* module styles.css */
@import "@wippy-fe/theme/theme-config.css";
@import "@kickside/ui-kit/kx-tokens.css";   /* first, always */
@import "@kickside/ui-kit/kx-card.css";

@tailwind base;                              /* after the imports */

.kx-card { border-radius: 18px; }            /* deliberate override: the delta only */
```

An override should state **only what differs**. Restating the whole body means
the next change to the shared rule silently does not reach you.

### The second thing that catches everyone

**The theme's PrimeVue CSS is appended to the shadow root after yours.** The
module's stylesheet goes in via `injectInlineCss`; the theme's arrives later via
`loadHostCss`, which does `createElement('style')` + `shadow.appendChild`
(`@wippy-fe/webcomponent-core`). Both are `<style>` elements, so **document
order decides** — and the theme is second. Against a PrimeVue component class,
your rule loses at equal specificity even though it is "later in the file".

(`adoptedStyleSheets` is used only for the facade's custom CSS, not for the
theme. Reaching for an adopted sheet to win this fight does not help.)

That is why `kx-tag.css` writes every selector twice — bare, and qualified with
`.p-tag`. If you are styling a PrimeVue component from a module and nothing
happens, this is why.

The same trap bites a `<Dialog>` styled through pass-through classes. If you
pass `header: { class: 'kx-modal-head' }` / `footer: { class: 'kx-modal-foot' }`,
those classes land *on* `.p-dialog-header` / `.p-dialog-footer`, so a bare
`.kx-modal-foot { padding: … }` is silently overridden — the footer keeps
PrimeVue's `padding-top: 0` and the buttons sit flush against your divider.
Scope it under the dialog root instead, which is what the three modules taking
this route do:

```css
.kx-modal > .kx-modal-foot { … }   /* workflows, connection */
.kx-dialog > .kx-modal-foot { … }  /* knowledge */
```

A module that renders its own `<div class="kx-modal-foot">` inside the dialog
body — agents does — is unaffected; there is no PrimeVue class on it to lose to.

---

## Sheets

### `kx-tokens.css` — derived design tokens

Import this **first**; the other sheets read from it.

| Group | Tokens |
|---|---|
| Surfaces | `--kx-surface-1` … `--kx-surface-4` |
| Overlays | `--kx-overlay-hover`, `--kx-overlay-subtle` |
| Borders | `--kx-border-strong`, `--kx-border-stronger` |
| Text | `--kx-text-faint`, `--kx-text-fainter` |
| Washes | `--kx-wash-primary`, `-success`, `-info`, `-warn`, `-danger`, `-help` |
| Type | `--kx-font-heading`, `--kx-font-body` |
| Shape | `--kx-radius-4/6/8/10/14/16`, `--kx-radius-tag`, `--kx-control-height` |
| Elevation | `--kx-shadow-sm`, `--kx-shadow-md`, `--kx-shadow-lg` |

**Surfaces vs overlays.** A surface is opaque — it mixes text colour into the
content background, so it only looks right *on* the page background. An overlay
is transparent, so it works on a card as well as the page. Row hover wants an
overlay; a sunken well on the page wants a surface.

**Washes** are a 12% tint of a severity for the fill behind a badge or banner.
Pair one with `--p-<severity>-700` for the text on it. The severity itself
always comes from the theme, never from here.

**What is deliberately NOT here.** Anything the theme already publishes. There
is no `--kx-text-color`, no `--kx-border-color`, no `--kx-primary`. Read
`--p-text-color`, `--p-content-border-color`, `--p-primary-color` directly. A
local alias for a token the host already names is the habit this sheet exists to
end — three modules carried 67 such aliases, 23 of them read by nobody.

There is also no focus token: the ring is the facade's
`--p-focus-ring-{width,style,color,offset}` / `--p-focus-ring-shadow` contract,
and `focus-canon.test.ts` fails a build that hardcodes one.

### `kx-tag.css` — the two tag scales

| Class | Shape | For |
|---|---|---|
| `.kx-tag-sm` | 10.5px, weight 600, mixed case | a label: status, count, metadata |
| `.kx-tag-caps` | 9px, weight 700, uppercase, letter-spaced | a stamp: INSTALLED, PRIVATE, TOOLS |

**Sizing only** — no colour, no background, no border. A tag is painted by
whatever already paints it: a PrimeVue `<Tag severity>`, a decorative tone, or a
`color-mix` off `currentColor`. That split is what lets one class serve a
hand-rolled `<span>` and a `<Tag>` at once.

The two are different devices, not two sizes. A stamp names a *class of thing*;
a label reports a *state*. Do not use caps to make a status badge smaller.

### `kx-tone.css` — decorative colour

`.kx-tone-blue`, `.kx-tone-violet`, `.kx-tone-amber`, `.kx-tone-neutral`, over
`--kx-tone-blue` / `-violet` / `-amber`.

A tone carries **identity, not state** — a capability category, a knowledge-base
type. Rotate every hue one step and the UI still works; that is the test.

**Severity does not live here, and `.kx-tone-danger` must never be added.**
Success, warning, danger and info come from PrimeVue's `severity` prop, the
theme's `--p-*-500/600/700` ramps, the `--kx-wash-*` tints, or Tailwind's
semantic utilities. The reverse mistake matters just as much: a category that
happens to be red must not read `--p-danger-500`, because it is not an error.

The hues are literals because the theme publishes only semantic ramps —
`surface`, `primary`, and the four severities. There is no decorative palette to
borrow, and borrowing a severity ramp is the mistake this sheet prevents.

### `kx-card.css` — the hoverable content card

`.kx-card`, `.kx-card-head`, `.kx-card-id`, `.kx-card-name`, `.kx-card-desc`,
`.kx-card-meta`, `.kx-card-actions`.

The card lifts on hover. The theme gives every button the same lift, so a button
inside a card would travel twice — the sheet cancels the inner one. Card actions
pass `size="small"`; the sheet does not size them for you.

### `kx-head.css` — the surface header row

`.kx-head`, `.kx-head-icon`, `.kx-head-text`, `.kx-title`, `.kx-head-sub`,
`.kx-head-actions`. The icon-tile-plus-title-plus-subtitle row at the top of a
surface, with actions pushed right.

### `kx-modal-head.css` — the dialog header

`.kx-modal-head-icon`, `.kx-modal-head-text`, `.kx-modal-head-title`,
`.kx-modal-head-sub`. The same idea one level in, for a `<Dialog>`'s `#header`
slot. Separate from `kx-head` because a dialog header is tighter and has no
actions area — the close affordance is the component's.

### `kx-state.css` — what a surface shows when it has nothing

`.kx-empty` and friends (`-ico`, `-title`, `-sub`, `-actions`), `.kx-loading`,
`.kx-err` (plus `.kx-err.inline`).

Three answers: nothing to show, fetching, failed. `.kx-err` carries a positional
margin because seven modules place it identically; if that ever needs to move,
that is a sign the rule should carry appearance only.

### `focus.css` — the two focus treatments

`.kx-focus-halo` (element draws a border at rest: border goes ring-coloured,
plus the halo, no outline) and `.kx-focus-outline` (element draws nothing: an
offset outline, no halo). Never both.

Only for the cases where the facade default is the wrong one — the facade owns
the default. See `app/facade-src/README.md`, "Focus canon".

### `spin.css` — the rotation

`.spin` and the `kx-spin` keyframes, with the reduced-motion clause. One
rotation for the whole product; no module should declare its own keyframe.

---

## Choosing where a rule belongs

| The thing you are styling | Where it goes |
|---|---|
| A PrimeVue component's default look | the facade (`app/facade-src/custom/`) — every module gets it |
| A colour that means success / warning / danger / info | PrimeVue `severity`, or the `--p-*` ramp |
| A colour that means *which kind of thing* | `kx-tone.css` |
| A derived value the theme does not publish (a wash, a surface tier) | `kx-tokens.css` |
| A control vocabulary two or more modules already copy | a ui-kit sheet |
| One module's own layout, or a domain concept only it has | that module's `styles.css` |
| Focus | the facade, never a module |

If two modules have copied it, it belongs here. If one module has it and it
names a domain concept, it belongs to that module.

## Adding to this package

1. Prove the duplication first — the sheets here came from measuring clones, not
   from taste.
2. Split sizing from painting. Every sheet here does exactly one of the two, and
   that is what makes them composable.
3. Say what you deliberately left out, in the sheet's own comment. Most of the
   value of these files is in what they refuse to own.
4. Bump `package/package.json` and publish the module at the **same version**;
   `wippy publish` refuses a mismatch. Then repin `build-inputs`.
5. Update this file. A vocabulary nobody can read is a vocabulary nobody adopts.

## Library chrome

The chrome sheets style native markup. They do not replace PrimeVue defaults;
keep PrimeVue-specific overrides in the facade. Import tokens first, then the
sheets required below, and delete adopted local rules. Do not apply native
confirm parts as PrimeVue pass-through classes: use `kx-modal-head.css` for
PrimeVue header slots and qualify dialog footer overrides under the dialog root
as described above.

### Geometry additions

| Token | Default | Why it exists |
|---|---|---|
| `--kx-control-height-sm` | 30px | Compact controls need a second shared height; the existing 34px control height stays unchanged. |
| `--kx-rail-width` | 264px | Navigation column width, including a resizer's inline override; the theme has no rail geometry. |
| `--kx-reading-measure` | 880px | Maximum reading-column width; the theme has no prose measure. |
| `--kx-row-height` | 32px | Navigation rows align across library views independently of control heights. |

The chrome reuses `--kx-control-height`, `--kx-radius-6/8/14` and
`--kx-surface-1/2`. Background, border, text, primary and severity colors read
`--p-*` directly. The quieter text, transparent border and primary tint use
`color-mix` directly where their proportions differ from an existing derived
token; they do not introduce aliases. Focus reads `--p-focus-ring-color` and
`--p-focus-ring-shadow`. Pills use 999px corners, chips 6px, controls 8px and
surface/icon tiles 14px.

### `kx-shell.css` — borderless navigation and reading area

This sheet owns the rail/main split, with a capped rail above the main area at
760px and below. It does not set the host height, choose a navigation model,
resize the rail or supply application-specific rows.

| Class | Purpose | Does not do | Adoption cost |
|---|---|---|---|
| `.kx-shell` | Grid with a rail and flexible main column | Set host height | Replace the two-column root rule; keep its flex ancestors sized |
| `.kx-rail` | Vertical rail with a quiet surface and divider | Render navigation | Apply to the shell's first child; delete rail chrome |
| `.kx-rail-body` | Scrollable, padded rail content | Select rows | Replace the rail scroll container rule |
| `.kx-main` | Flexible main column with clipped overflow | Scroll its content | Apply to the shell's second child |
| `.kx-main-scroll` | Reader gutter, vertical spacing and scrolling | Limit prose width | Replace the reader scroll rule; use the measure token for prose |
| `.kx-railhead` | Title/actions row with divider | Supply actions | Replace the header row rule |
| `.kx-railhead-title` | Uppercase label with tabular count in `b` | Count items | Rename the label and delete its typography rule |
| `.kx-railhead-acts` | Tight icon-action row | Size icons | Rename the action container |
| `.kx-railsec` | Divider between adjacent foldable groups | Own open state | Replace the group class; toggle `closed` from application state |
| `.kx-railsec-h` | Full-width section toggle | Bind keyboard/click events | Apply to a button with `aria-expanded` |
| `.kx-railsec-chev` | Rotating disclosure glyph | Toggle the group | Apply to the glyph; `closed` controls rotation |
| `.kx-railsec-ic` | Optional section glyph size | Pick an icon | Rename the icon class |
| `.kx-railsec-t` | Ellipsized section title | Supply a label | Rename the title class |
| `.kx-railsec-b` | Section body spacing | Hide collapsed content | Replace padding rule; retain controlled visibility |

The optional `.count` inside `.kx-railsec-h` aligns its numeric label at the end;
it has no styling outside that header.

### `kx-controls.css` — native library controls

This sheet owns the geometry and paint of native buttons, search fields and
labels. It does not own events, validation, accessible names or loading logic.
It does not style `.p-button` or `.p-inputtext`.

| Class | Purpose | Does not do | Adoption cost |
|---|---|---|---|
| `.kx-iconbtn` | 28px square glyph button | Supply a label | Rename the native button; retain `aria-label`; delete local rules |
| `.kx-iconbtn.sm`, `.kx-iconbtn.lg` | 30px and 34px footprints | Change glyph size | Keep size modifiers on the same button |
| `.kx-iconbtn.bordered` | Quiet bordered resting state | Change action semantics | Keep the modifier and remove local paint |
| `.kx-iconbtn.on` | Selected primary tint | Manage selection | Keep the controlled modifier |
| `.kx-iconbtn.danger` | Danger hover/selected tint | Confirm destructive work | Keep the modifier; retain confirmation behavior |
| `.kx-btn` | Shared text-button size, spacing and disabled state | Choose a variant | Apply base plus a variant; delete local button rules |
| `.kx-btn.sm` | Compact height and padding | Shorten the label | Keep the size modifier |
| `.kx-btn-primary` | Filled primary action | Submit automatically | Apply with base and an explicit native type |
| `.kx-btn-ghost` | Transparent bordered action | Remove its border | Apply with base |
| `.kx-btn-soft` | Tinted primary action | Represent severity | Apply with base |
| `.kx-btn-danger` | Filled danger action | Confirm an operation | Apply with base; retain confirmation behavior |
| `.kx-search` | Relative field wrapper | Execute searches | Replace the wrapper rule |
| `.kx-search-ico` | Leading search glyph | Provide an input label | Rename the icon class |
| `.kx-search-input` | Sized text input and theme focus halo | Debounce or validate | Rename the input; retain its accessible label and events |
| `.kx-search-clear` | Positioned clear button | Clear the value | Rename the button; retain its label and click behavior |
| `.kx-chip` | Uppercase kind label with 6px corners | Encode status | Rename the label; delete its paint and sizing |
| `.kx-count` | Compact tinted numeric pill | Calculate a count | Rename the pill; retain the value |

### `kx-overlay.css` — notices and secondary surfaces

This sheet owns appearance and transitions. It does not mount a portal, trap or
restore focus, bind Escape, dismiss a surface, or set dialog semantics. Retain
those behaviors in the consuming component. Transition names are `kx-modal`
and `kx-drawer` for Vue's standard enter/leave class generation.

| Class | Purpose | Does not do | Adoption cost |
|---|---|---|---|
| `.kx-notice` | Icon/text banner | Announce live updates | Rename the banner; retain appropriate ARIA behavior |
| `.kx-notice.info`, `.warn`, `.error`, `.help` | Informational, warning, error and help paint | Infer severity | Keep the tone modifier; delete local tone rules |
| `.kx-notice-action` | Small outlined banner action | Execute or retry work | Rename the native button; retain its handler |
| `.kx-modal-mask` | Centered confirm scrim | Dismiss on click | Replace the scrim rule and keep dismissal behavior |
| `.kx-modal` | 460px confirm surface with 14px corners | Implement a PrimeVue Dialog | Replace native surface chrome; retain dialog role and accessible name |
| `.kx-modal.danger` | Danger icon treatment | Require confirmation | Keep the modifier when appropriate |
| `.kx-modal-h` | Compact confirm header row | Add a close button | Rename the header container |
| `.kx-modal-h-ico` | 34px header icon tile | Select an icon | Rename the icon wrapper |
| `.kx-modal-h-text` | Flexible title/subtitle column | Supply text | Rename the text wrapper |
| `.kx-modal-h-title` | Confirm title typography | Label the dialog automatically | Rename the title; retain dialog naming |
| `.kx-modal-h-sub` | Ellipsized subtitle | Display full overflow text | Rename the subtitle |
| `.kx-modal-body` | Confirm message spacing and type | Scroll a long editor | Replace the native body rule |
| `.kx-modal-foot` | Divided, right-aligned action row | Order or bind buttons | Replace the native footer rule |
| `.kx-modal-enter-active`, `.kx-modal-leave-active` | Fade duration | Mount/unmount | Rename the Vue transition to `kx-modal` |
| `.kx-modal-enter-from`, `.kx-modal-leave-to` | Fade endpoints | Toggle visibility | Use the same transition name |
| `.kx-drawer-mask` | Right-docked scrim clipped to its viewport | Dismiss or portal | Replace the scrim rule; retain its click behavior |
| `.kx-drawer` | Full-height 560px panel with left divider | Manage focus | Replace panel chrome; retain dialog behavior |
| `.kx-drawer-h` | Fixed drawer header row | Supply a close action | Rename the header |
| `.kx-drawer-title` | Icon/title alignment and type | Name the dialog automatically | Rename the title; retain dialog naming |
| `.kx-drawer-b` | Padded, scrolling drawer body | Render its content | Rename the scroll container |
| `.kx-drawer-enter-active`, `.kx-drawer-leave-active` | Scrim fade and panel slide timing | Mount/unmount | Rename the Vue transition to `kx-drawer` |
| `.kx-drawer-enter-from`, `.kx-drawer-leave-to` | Transparent scrim and translated panel endpoints | Bind open state | Use the same transition name |

### `kx-state.css` — reader variants

These extend the existing state vocabulary; importing the sheet preserves its
original compact empty/loading defaults. There is no separate library state
family. The controls sheet paints the CTA.

| Class | Purpose | Does not do | Adoption cost |
|---|---|---|---|
| `.kx-empty.kx-empty-spacious` | Open-reader spacing and slightly smaller text in the existing title/sub/icon parts | Set host height | Replace the empty root; rename its children to `kx-empty-ico/title/sub` and delete local state rules |
| `.kx-empty-ico.primary` | Bordered primary medallion | Indicate success | Keep the explicit tone modifier |
| `.kx-empty-ico.muted` | Neutral medallion | Indicate failure | Keep the explicit tone modifier |
| `.kx-empty-cta` | CTA spacing inside an empty state | Paint a button | Apply with `kx-btn kx-btn-primary`; import controls |
| `.kx-loading.kx-loading-centered` | Fill and center a reader's loading state | Fetch data | Replace the loading root and delete local layout rules |
| `.kx-loading-inner` | Vertical glyph/label group | Animate the glyph | Rename the inner wrapper; use `spin.css` for rotation |
