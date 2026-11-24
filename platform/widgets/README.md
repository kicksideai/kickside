# kickside/widgets

Reusable model, icon, schedule, and selection web components.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/widgets
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
Host persistence uses SQLite or PostgreSQL. This module has no standalone SQL dialect matrix.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
wippy install
wippy lint
make -C ../.. install MOD=widgets
make test
```

Edit frontend source under `ui/` and run `make -C ../../ build MOD=widgets` from this directory;
commit regenerated tracked assets with the source.

## Use

Reuse declared picker, form, and creation widgets from the installed view catalog. Pass their declared configuration and handle their emitted events. The owning server validates resource selection and authorization again on submission.

### SPEC for schema form validation

`wc-schema-form` renders field help and validation messages below the control.
It emits `validity-changed` on mount and when field messages change. The event
detail has `valid` and an `errors` object keyed by schema property. An invalid
JSON or native input draft can change validity without emitting `config-changed`.

Call `reportValidity()` before submitting. It returns false while the form loads
or has field errors. It opens Advanced when needed and focuses the first invalid
control in render order. Set `field-errors` to a JSON object to associate server
messages with their fields. Clear those messages once they no longer apply.
Set `allow-unset` when missing overrides can inherit host settings.
Set `disabled` to disable every control.

### SPEC for schema form host choices

A field, or the `items` of an array field, can declare `x-choices: <name>`. The
host passes `choices` as a JSON object that maps each name to a list of
`{value, label}` entries. The form treats the listed values as the field's
`enum` and shows each `label`. It offers only values that pass the field's own
constraints, such as `pattern` or `not.enum`. When the host supplies no entries
for the name, the form says no choices are available.

### SPEC: Model picker field context

`wc-model-picker` accepts optional `label` and `description` text attributes.
The focused combobox uses them as its accessible name and help, including when
mounted inside a settings form across a shadow boundary. Without `label`, it
keeps the existing “Choose model” name.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.widgets:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.widgets:api_router`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/widgets)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
