# W20 frontend gap fixes — 2026-07-10

## Scope

Only the requested frontend packages were changed:

- `platform/workflows/ui`
- `platform/automation/ui`

`platform/recipes/ui` was inspected and built, but needed no source change. No Lua source or
`app/wippy.lock` was modified.

## Fixed gaps

### Add-trigger empty mount

The workflow builder previously rendered `kickside-recipe-config` as a bare foreign tag. Unlike
the Automations page, it never called `loadByTagName`, so a builder bundle that had not already
loaded Recipes left the tag inert and its body empty.

`AddTriggerPanel` now loads `kickside-recipe-config` before rendering it and shows an explicit
load failure instead of an empty panel. Its custom-element attributes are deliberately
`workflow-id="<workflow id>"` and `mode="create"`: Wippy turns the former into the recipe
component's `workflowId` prop. The builder intentionally does **not** send `embedded="true"`;
that flag hides Recipe Config's own Create button and only belongs to the Automations popup,
which supplies a replacement footer.

The loaded Recipe element continues to use its own authenticated proxy client and relative
`GET /api/v1/automations/trigger-points`, the same request path used successfully from the
Automations mount. The new mount test asserts both loader invocation and exact host attributes.

### Sharing

Workflow list row actions and the builder header now mount the platform `kickside-share` element
by tag. Both pass the workflow component id through the existing component access/share cascade:

```text
/api/v1/component-access/grants/{workflowId}
/api/v1/component-access/share/{workflowId}
```

No workflow-specific sharing state or endpoint was added.

### Copy

- The Automation picker translates the old Workflow type implementation description into:
  “Build a workflow once, then choose when it runs with an automation.”
- Imports now post a cloned portable spec with a user-facing title such as `Copy of Qualify lead`.
  When an export lacks a real title, its portable key is humanized first rather than displayed.

## Verification

Baseline Vitest before changes:

| Package | Result |
| --- | --- |
| workflows UI | 49 files / 467 tests passed |
| recipes UI | 3 files / 31 tests passed |
| automation UI | 9 files / 94 tests passed |

Final Vitest:

| Package | Result |
| --- | --- |
| workflows UI | 50 files / 470 tests passed |
| recipes UI | 3 files / 31 tests passed |
| automation UI | 10 files / 96 tests passed |

Added coverage: Add-trigger loader/attribute contract, share tag/configuration contract, clone-title
derivation, and Automation type copy. `vue-tsc --noEmit` passed for workflows and automation.
`npm run build` passed for workflows, recipes, and automation UI.

### Deferred live check

The local app at `http://localhost:8085` was reachable, but the supplied isolated Chrome harness
could not launch in this environment (`crashpad ... setsockopt: Operation not permitted`), so no
browser claim is made. In the next verification wave:

1. Hard-refresh an existing workflow builder and click **Add trigger**.
2. Confirm `kickside-recipe-config` has `workflow-id`, `mode="create"`, and no `embedded`
   attribute; its shadow content must show **Runs**, **When**, the trigger picker, and the
   **Create automation** footer.
3. In Network, confirm `GET /api/v1/automations/trigger-points` returns 200 with the normal
   authenticated request headers. Confirm the console has no custom-element or proxy errors.
4. Open both a list-row **Share** action and the builder-header **Share** action; each must open
   `kickside-share` for the current workflow and use the component access cascade.
