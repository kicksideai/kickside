# Registry And Source Conventions

Wippy source files use `_index.yaml` to declare registry entries. A namespace
file begins with `version: "1.0"`, `namespace: <exact namespace>`, and an
`entries` list. The module root has one `ns.definition`; each nested source
folder declares its own namespace. A package's `organization/module` identity
does not determine any namespace. Use `registry.get("namespace:name")` for
known entries and typed `registry.find` for extension discovery. See
[Discovery, Addressing, And Context](19-discovery-addressing-and-context.md).

## Dependencies and host requirements

Declare every package dependency as `ns.dependency` with a compatibility range:

```yaml
- name: dep.kickside.contract
  kind: ns.dependency
  version: "*"
  component: kickside/contract
```

A module declares host-owned inputs with `ns.requirement` and exact rewrite
targets. It does not choose a host database or router in source:

```yaml
- name: target_db
  kind: ns.requirement
  meta:
    comment: SQL resource for Deals rows and migrations.
  targets:
    - entry: acme.deals:db_config
      path: .meta.db_id
    - entry: acme.deals.migrations:01_deals
      path: .meta.target_db
- name: db_config
  kind: registry.entry
  meta:
    comment: Database selected by the host.
```

This matches the `db_config` and `target_db` pattern in
`platform/webhooks/src/_index.yaml`. The host's `ns.dependency.parameters`
passes the concrete value, for example `{ name: acme.deals:target_db, value:
app:db }`. Requirements for authenticated `http.router`, `http.service`,
process host, and security group use the same mechanism. A group target can
append with `path: ".groups +="`; see
`platform/workflows/src/security/_index.yaml` and the template.

## Functions, bindings, and ports

A `function.lua` points at `source: file://...`, lists permitted `modules`
and registry `imports`, and selects an exported `method`. A
`contract.binding` maps each contract method to a function entry ID. A
`registry.entry` with `meta.type: kickside.automation.port` publishes a
source or destination for a builder. A writable binding must declare
`meta.delivery`, `meta.input_shape`, and `write`.
Port `binding`, `event`, `operations`, `config_schema`, and `input_schema`
are top-level fields, as in `platform/webhooks/src/_index.yaml` and
`platform/knowledge/src/sink/_index.yaml`. Details are in
[Contracts And Ports](02-contracts-and-ports.md) and
[Automations And Dataflows](21-automations-and-dataflows.md).

## Events, components, and security

An event type is `kind: registry.entry` with `meta.type:
kickside.core.threads.event` and a body `schema`. The owning component
kind is `kind: contract.binding` with a `kickside.contract:component`
contract, `meta.class`, and explicit `meta.events.input` and
`meta.events.output`. An output producer's `function.lua` names a
`security.policy` that allows `threads.output.publish` for each exact output
event ID. Public appenders send inputs under the user role. A component kind
may declare `meta.projections` with a `func://` or `proc://` worker reference;
its worker entry declares `meta.type: projection.worker` and has no custom
security frame. See [Threads, Events, And Projections](03-threads-events-projections.md).

Endpoint access is a module-owned `security.policy` with `groups: []`; the
host injects its authenticated group through a requirement. The endpoint's
`meta.router` also comes from a requirement. Domain handlers check component
access after router authentication. Give public callback endpoints a separate,
intentional public router and verify their signature or token before acting.
See `platform/webhooks/src/api` and
[Connections And Integrations](04-connections-and-integrations.md).

## Settings and environment

A setting definition is a `registry.entry` with
`meta.type: kickside.settings:definition`, `namespace`, `key`, `value_type`,
`default`, and scope/visibility/editability fields. A product default is
owned by the module; a host-owned resource ID is supplied by requirement.
`platform/settings/src` owns overrides and access. Credentials belong in
private component context, encrypted OAuth storage, or host runtime storage,
never in setting defaults or public meta.

An `env.variable` can expose an operator value. In the release uploads module,
`kickside.uploads.env:database_resource` declares `variable:
KICKSIDE_UPLOADS_DATABASE_RESOURCE` and `meta.private: true`; the
`database_resource` requirement rewrites its `.default` target. The source
declares no host-owned value. Read the installed entry to learn which storage
backend supplies it. Runtime knobs owned end-to-end by an engine can have a
module code default; an application resource cannot.

## HTTP and UI

An authenticated `http.endpoint` declares `method`, `path`, `func`, and a
router injected at `.meta.router`. Paths are relative to the router; the host
owns its `/api/v1` prefix and authentication chain. A module page uses
`fs.directory` for built `./static`, `http.static` for the served path,
`view.component` for tag/entry metadata, and `ui.nav_item` for a shell route.
The module Makefile builds the page and the artifact is committed. Follow the
[frontend directive](07-frontend-and-web-components.md).

## Useful entry kinds

- `ns.definition`, `ns.dependency`, `ns.requirement`: package identity and
  composition.
- `registry.entry`: typed documentation, event, view, nav, setting, agent,
  Block, and port declarations.
- `contract.definition`, `contract.binding`: published interface and concrete
  implementation.
- `function.lua`, `library.lua`, `process.lua`: executable entrypoints and
  shared code.
- `db.sql.sqlite`, `db.sql.postgres`, `env.variable`, `security.policy`,
  `http.endpoint`, `http.static`, `fs.directory`: host resources and surfaces.

## Contract surface gate

`scripts/check-contract-surface.py` runs from `scripts/local-wippy-gate.sh`.
Every method of every production `contract.definition` in `core/`, `platform/`,
and `sso/` needs a production invocation path in KickSide or an explicitly
declared external invoker. Production evidence
is registered executable Lua (`library.lua`, `function.lua`, `process.lua`) in
those modules or `app/src`; tests, fixtures, migrations, cache directories,
bundles, and entries with test metadata do not count. Bindings, whether local
or supplied by external providers, are outside this gate's scope.

A quoted literal contract ID in registered Lua, after removing comments,
provides invocation evidence for that proxy's methods. This checks static
surface coverage, not whether each method ran during a test. Dynamic dispatch
must be listed in `scripts/contract-dispatch.json` with a registered source
file, explicit contract-to-method lists, and a reason. An absent source, absent
method, wildcard, or missing reason fails. Source expressions are not matched.
An external invoker uses the same declaration with a `module` component ID
and its source file, exact methods, and reason. This is reviewed cross-module
invocation evidence; the gate does not load external sources or require them
to be registered in this repository. No provider snapshots are used.
The canonical kind installer, action dispatcher, and Meetings push worker are
declared there.

The requirement check covers only modules declared by the app in its
`ns.dependency` entries or onboarding composition packages. Requirements of
undeclared optional modules belong to the Hub install planner. Every production
`ns.requirement` in an app-declared module must have a non-null default or a
non-null app parameter. Empty strings, false, and empty collections are valid defaults.
App parameters are read from registered dependencies and onboarding package
composition under `app/src`, including `app/src/app/deps` and
`app/src/app/composition`. Fully qualified names match directly;
module-relative names resolve within the named component package. Only a
requirement with neither a default nor an app parameter fails. Unit tests are
in `tests/test_contract_surface.py`.
