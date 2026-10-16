# Canonical principal picker — source handoff

Date: 2026-07-11

Status: implemented and built, uncommitted. No app restart or live browser QA.

## Ownership and composition

- `wc-principal-picker` is owned by `platform/users`, beside the principal directory and
  `/api/v1/principals/search|resolve` endpoints.
- `users/ui/src/principals.ts` is the one typed frontend contract used by both the picker
  and Share label resolution.
- Share embeds the ordinary `PrincipalPicker.vue`; its copied query/debounce/result menu
  and associated CSS were removed.
- The picker reuses widgets' `AnchoredPanel` and `pickerValue` primitives. It does not copy
  the widget shell or Inbox UI.

## Behavior

- Single principal; searchable people/groups with schema or attribute `kinds` filtering.
- Resolves a stored scalar id through `/principals/resolve` before showing its label.
- Debounced search, loading/error/initial/empty states, Arrow Up/Down + Enter + Escape,
  focused search on open and trigger focus restored after select/clear, bounded 260px
  minimum / 320px maximum anchored panel, and compact <=360px treatment. The combobox
  exposes its listbox and active option through ARIA rather than relying on visual state.
- Stored-id hydration and live search have independent request generations: opening and
  searching while a saved label resolves cannot cancel or strand that resolution.
- Structured API failures remain errors. They are never rendered as an empty directory or
  as a deleted principal. Resolving a user/group id uses one batched resolve request.
- Schema field name is reflected in the emitted object, while stable `id` and
  `principal_id` aliases support WcMount/SchemaForm conventions.
- The WC adapter emits only `config-changed`. WcMount listens to both historical events,
  so emitting both would duplicate a workflow config write.
- A visible directed clear action is declared by schema. Inbox calls it **Use workflow
  runner** and clearing emits `assignee: ''` exactly once.

## Inbox and assist

Inbox review `assignee` now declares:

- `picker: wc-principal-picker`
- `kinds: user`
- `empty_label: Use workflow runner`
- human copy explaining that empty assigns the review to the workflow runner

Because the field is picker-backed, server config assist excludes it. ConfigAssist also
preserves picker-owned identity defensively through Accept/Undo even if an unexpected model
response contains a replacement id.

## Verification

- Users UI: full suite 6 files / 24 tests green after final hardening (including
  concurrent hydrate/search and structured-error regressions).
- Users backend: 90/90 green, including registry declaration.
- Inbox backend: 29/29 green, including picker/kinds/clear declaration.
- Widgets UI: 21 files / 120 tests green. The SchemaForm integration mounts the real custom
  element seam and proves select + clear each produce exactly one scalar config update.
- Workflows UI: 66 files / 537 tests green, including picker identity Accept/Undo.
- Users build: green, 44 modules; `principal_picker.js` and shared component chunk emitted.
- Workflows build: green, 248 modules (a concurrent ConfigAssist test extension landed after
  that build; the integration owner should perform the final aggregate rebuild before restart).
- Focused `git diff --check`: green.

## App wiring required

The app still resolves packaged `kickside/users 0.1.10` and `kickside/inbox 0.1.12`.
Serving this source therefore requires these two ordinary local replacements in
`app/wippy.lock` followed by one coordinated restart:

```yaml
  - from: kickside/users
    to: ../platform/users
  - from: kickside/inbox
    to: ../platform/inbox
```

This lane deliberately did not edit the contested lock or restart the shared app.

Happy DOM prints its known aborted-fetch teardown noise in users/widgets/workflows suites;
all commands exited 0 and all test files passed.

## Attributable files

Users:

- `platform/users/ui/src/principals.ts`
- `platform/users/ui/src/app/PrincipalPicker.vue`
- `platform/users/ui/src/app/PrincipalPickerElement.vue`
- `platform/users/ui/src/app/PrincipalPicker.spec.ts`
- `platform/users/ui/src/app/PrincipalPickerElement.spec.ts`
- `platform/users/ui/src/principal-picker.ts`
- `platform/users/ui/src/principal-picker.css`
- `platform/users/ui/src/app/share.vue`
- `platform/users/ui/src/app/share.spec.ts`
- `platform/users/ui/src/share.css`
- `platform/users/ui/vite.config.ts`
- `platform/users/src/_index.yaml`
- `platform/users/src/principal_picker_test.lua`
- refreshed `platform/users/static/*`

Consumers/guardrails:

- `platform/inbox/src/workflow/_index.yaml`
- `platform/inbox/src/workflow/workflow_node_test.lua`
- `platform/widgets/ui/src/multiselect/app/schema_form.principal.spec.ts`
- `platform/workflows/ui/src/app/panels/ConfigAssist.vue`
- `platform/workflows/ui/src/app/panels/ConfigAssist.test.ts`
