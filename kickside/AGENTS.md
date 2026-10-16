# Agent Documentation

KickSide's canonical development documentation is published as registry entries,
not as `app:definition.wiki` metadata.

In a running KickSide environment, discover pages directly:

```lua
registry.find({
  [".kind"] = "registry.entry",
  ["meta.type"] = "wippy.documentation.page",
})
```

Each result has `data.path`, `data.title`, `data.document_kind`, `data.status`,
and `data.content`. Start with `app:documentation.developer-handbook` and
`app:documentation.discovery-addressing-context`. The
`app:documentation.navigation` entry defines the human-facing Hub tree.

For a repository checkout, source Markdown is under `app/src/app/docs/`; the
entry declarations and navigation are in `app/src/app/_index.yaml`.

Frontend documentation is the exception: repository frontend pages are
source-of-truth directives, not local copies of Wippy implementation guidance.
Before frontend work, query the `wippy.frontend` KB through MCP and verify
drift-sensitive details against the current official Wippy docs linked from
`app/src/app/docs/kickside-development/07-frontend-and-web-components.md`.

## Frontend runtime experiments

- In Wippy repositories, the Makefile is the only build-command source of
  truth. On Windows invoke the checked-in `make.bat` wrapper, which delegates to
  `make.ps1`. Never run `npm`, `pnpm`, `yarn`, or Vite build commands directly,
  and never invent a generic static-server deployment path.
- The facade owns the focus ring's *values* — the `--p-focus-ring-*` tokens and
  `--p-focus-ring-shadow`. A component owns *which of its elements* takes a
  ring, because the theme cannot know whether a given class draws a border at
  rest, and guessing wrong yields a doubled ring. So a module may declare its
  own `:focus-visible` rule; what it may not do is hardcode the values.
  `focus-canon.test.ts` fails on a literal colour or length inside a focus
  rule, not on the rule itself — an earlier version failed on any module focus
  rule at all, which forced a global class-name exception list into the theme;
  do not reintroduce that. Read `app/facade-src/README.md` "Focus canon" before
  touching any `:focus` CSS.
- Never downgrade Wippy, facade, Web Host, webcomponent, PrimeVue, or other
  dependencies as a diagnostic tactic. Do not edit backend dependency versions
  or `app/wippy.lock` during frontend work.
- Local Wippy replacements may expose fresher frontend code only for modules
  actively being audited. Publishing those modules requires separate user
  authorization after the frontend work is complete.
- Build the relevant frontend package into its served `static/` directory before
  browser verification, and confirm that the expected emitted file exists.
  Tests do not refresh served bundles.
- Keep the experimental backend healthy during frontend work. Before browser
  verification, confirm that the configured port is listening. For any 5xx,
  inspect backend logs first and distinguish service-down, route-handler, and
  missing-asset failures.
- Use visible Playwright MCP and inspect browser console errors after navigation
  and after every material interaction.
- The local `favicon.ico` 500 and `/@wippy-fe/loading.js` load/MIME failure are
  known non-blocking development noise. Any other recurring console or network
  error blocks browser readiness. In particular, a served frontend entry such
  as `/kickside-dashboard/index.js` returning 404 is a real ownership/build
  failure. Prove the request's registry entry, module, filesystem mount, build
  owner, and emitted file before rebuilding anything. Never rebuild an adjacent
  package merely because its name or role looks related.
- The local facade currently has a deferred backend deep-link bug. Do not open
  `/c/app.views:main/...` directly for frontend verification. Navigate to
  `http://localhost:8085/`, wait for the shell, then navigate through the SPA
  with a UI action or `history.pushState` followed by `popstate`.
- PrimeVue overlays may live inside a web component shadow root. Inspect the top
  document, iframe documents, and recursively discovered shadow roots before
  concluding that a Drawer or Dialog is absent.
- When an experiment fails, stop before adding another workaround. State the
  failed assumption, record a reusable rule through the failure-reporting
  process when appropriate, and resume from the smallest verified runtime
  state. Verify the intended postcondition rather than trusting exit status.
