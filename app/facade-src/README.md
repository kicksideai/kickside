# Facade CSS sources

The facade (`app.deps:facade`, `wippy/facade`) serves theme CSS that the web-host
runtime injects into the SPA host document **and** every web-component shadow root.
Two payloads are plain CSS; keeping them as one big file each got unwieldy, so they
are authored here as small partials and **assembled** into the served files.

```
app/facade-src/
  custom/*.css     -> app/static/custom-css.facade.generated.css      (custom_css)
  children/*.css   -> app/static/children-custom-css.facade.generated.css  (children_custom_css)
```

Partials are concatenated in **filename order** (hence the `NN-` prefixes).

## Rebuild after editing a partial

On Windows, run `make.bat facade-css` from the repository root. On Unix and in
CI, run `make facade-css`.

The generated files are **committed** (like the module `static/` bundles). The
assembler's check mode fails if committed output drifts from these sources.

Do **not** hand-edit `app/static/*.facade.generated.css`, and do **not** try to
assemble with `@import`: the facade inlines the CSS text and the runtime injects it
into shadows as an adoptedStyleSheet, which strips `@import`. Concatenation is the
only assembly that reaches the shadows.

## Which file gets what

`custom_css` and `children_custom_css` are **delivery-equivalent**
(both reach the host document and every WC shadow). The split is organizational:

- `custom/` — PrimeVue `.p-*` component chrome (dialog, button, input, popover, …).
- `children/` — WC-internal base rules: the preflight border reset and
  `.p-hidden-accessible`.

Design tokens (`--p-*`) are separate: `app/static/css-variables.facade.json`
(`css_variables`), served compiled at `/api/public/facade/variables.css`.

## Focus canon

**The contract is a token set, not a stylesheet.** `--p-focus-ring-width`,
`-style`, `-color`, `-offset` and `--p-focus-ring-shadow` live in
`app/static/css-variables.facade.json`, and everything that draws a ring reads
them. Changing the ring anywhere in the app is a change to a token.

Two treatments, chosen by whether the element draws a box at rest:

| At rest | Treatment |
|---|---|
| **Draws a border** — input, textarea, select, `.p-button`, `.kx-card` | border goes `--p-focus-ring-color`, `--p-focus-ring-shadow` halo, **no outline** |
| **Draws nothing** — icon button, close affordance, nav rail row, link, tab, checkbox | `--p-focus-ring-width` outline at `--p-focus-ring-offset`, **no halo** |

Never both. An outline stacked on a halo is the doubled ring this exists to
prevent, and every regression so far has been one rule assuming the wrong row.

On a separate axis, two triggers:

- **Text entry rings on `:focus`** — you need to see where you are typing
  however you got there, including by click.
- **Everything else rings on `:focus-visible`** — so a clicked button stays clean
  and a ring means "the keyboard is here".

And a floor: **every focusable element gets a visible ring.** Nothing may fall
back to the browser default or to none.

### Who owns which rule

The theme does **not** carry a list of component class names. It cannot know
whether `.kx-btn-ghost` draws a border, so it would have to guess, and a wrong
guess is a doubled ring — which is exactly how `.kx-btn-ghost` (1px, guessed
borderless) and `div.kx-drop` (guessed borderless because it has `tabindex`)
regressed. The component knows. The component owns the rule.

- `children/20-focus-ring.css` — the baseline for bare HTML inside a shadow
  root, carrying no class names. It asserts the **bordered** treatment only for
  `input` / `textarea` / `select`, whose border is guaranteed by the element
  type. Everything else, `button` included, gets the **bare** treatment.

  `button` is in the bare row deliberately. A bare `<button>` is borderless far
  more often than not, and the bordered treatment on one paints a halo around an
  edge that does not exist while its `outline: none` suppresses the only ring it
  could have had.

- `custom/30-inputtext.css`, `custom/80-select.css`, `custom/40-button.css` —
  PrimeVue `.p-*` chrome, fed from the `--p-<component>-focus-ring-*` tokens.
  `.p-button` draws a border (transparent on filled variants), so it takes the
  bordered treatment and sets `outline: none` to out-specify the baseline.
- A module's own `ui/src/styles.css` — anything that draws a box and is not
  PrimeVue, e.g. `.kx-card` in agents, knowledge, mcp, skills and webhooks.
  Values come from the tokens; nothing is hardcoded.

Before writing that rule by hand, check whether a helper already says it.
`@kickside/ui-kit/focus.css` publishes both treatments as classes:

| Class | Treatment |
|---|---|
| `.kx-focus-halo` | bordered — border goes primary, halo, no outline |
| `.kx-focus-outline` | bare — offset outline, no halo |

Applied in markup (`class="kx-card kx-focus-halo"`), so a component that needs
the treatment does not restate its three declarations. That restating is how the
same rule ended up in twelve stylesheets, and how halos drifted to 18%, 22% and
45% before any of this existed. `platform/agents` is the worked example; see
`platform/ui-kit/README.md` for how a module adopts the package.

Buttons need a rule as well as tokens: the Web Host theme hardcodes its ring as
Tailwind utilities (`focus-visible:outline-1 outline-offset-2 outline-primary`)
instead of reading its own `--p-button-focus-ring-*`, so setting the tokens alone
moves the halo and nothing else. `40-button.css` out-specifies the utility and
feeds the tokens back in. Fixing that upstream would let the rule go.

### The guard

`app/frontend/applications/main/src/focus-canon.test.ts` scans this app, every
`platform/*/ui/src`, `app/replacements/*/ui/src` and **this directory**, and
fails on two things:

1. A **literal** — a hex, an `rgba()`, a `px` — on a ring property inside a
   `:focus`, `:focus-visible` or `:focus-within` rule.
2. A **custom property named after the ring** (`--*ring*`, `--*focus*`) whose
   value is a hand-written halo rather than a reference to
   `--p-focus-ring-*`. A local name for the ring is fine; it has to be an
   alias, not a copy. `--km-ring` sat at 22% behind `var()` for exactly this
   reason, invisible to a check that only read the rules.

It does not fail on a rule existing; a component owning its focus selector is
the documented model.

`:focus-within` is **not** exempt. It used to be, on the grounds that revealing
a row's actions is behaviour rather than a ring — but the canon itself now uses
it deliberately, wherever the focusable node is an inner input and the box that
shows focus is its wrapper. Behaviour rules still pass without a carve-out,
because only ring properties are checked and `opacity: 1` is not one.

An earlier version failed on any module focus rule at all, which is what forced
the class-name exception list into the theme. Do not reintroduce it, and do not
narrow the matcher to silence a finding.

### Known hole, not ours

The managed layout collapses a panel by setting its width to `0` and leaving
`overflow: visible`, so a shut panel's contents sit off-screen while staying
focusable and `aria-hidden="false"` — tabbing walks into them. `ArtifactCoordinator`
works around it with `inert`; the fix belongs in `@wippy-fe/layout`.
