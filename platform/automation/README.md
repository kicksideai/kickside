# kickside/automation

Durable source-to-destination execution with drives, rounds, and delivery receipts.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/automation
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

For repository validation, use the Wippy release pinned in
[CI](https://github.com/kicksideai/kickside/blob/main/.github/workflows/ci.yml). Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make -C ../../ build MOD=automation` from this directory;
commit regenerated tracked assets with the source.

## Use

Open **Automations** to install an available kind. The kind declares its inputs and supported controls; the shared engine owns drives, rounds, cursors, delivery history, and retries. **Runs as** is the saved executor and **Authorized by** is the configuring authorizer. Activity and identity changes require root ADMIN; triggering work does not replace either identity.

## Storage and retention

Delivery history retains at most 10,000 outcomes per drive and expires outcomes
after the configured retention window, which defaults to 30 days. Initial observations, state transitions, deliveries and retries
create history. Repeating an unchanged resolved observation creates no history.
Each append batch contains at most 50 rows and trims at most that many rows
through the drive's chronological index. The index walk is bounded by the fixed
retention window plus the batch; it does not traverse other drives or the full
table. Listing uses keyset pagination, and replay evidence uses indexed delivery
families with a bounded result size.

The item ledger owns the latest state of each `(owner_id, source_port, item_key,
identity_key)`, including initial skips and deliveries. Its size follows distinct
delivery identities, rather than rounds or uptime. An unchanged resolved
observation writes neither the ledger nor history. Initial observations continue to
allow filter reevaluation; resolving a retained failure continues to prevent
redelivery. Active terminal evidence has no age expiry because admission relies
on it. Owner removal reclaims evidence through bounded cleanup; age retention
reclaims eligible orphaned terminal rows after the retention window. Exact
deduplication requires retaining the identities it distinguishes: the ledger has
no independent count cap that silently forgets active delivery evidence.
`retention.ledger_resolved` controls history age and orphaned terminal evidence;
it no longer expires evidence belonging to active owners.

Each record's earliest unresolved delivery controls retry eligibility. Database
triggers maintain its indexed deadline when rounds, reservations, replay or
identity controls change the ledger. Retry reads seek this index and return at
most the round batch, preserving ordering within each record. Admission and
prior-state reads seek exact identities and indexed record fronts, independent
of retained versions and total ledger size.

The delivery-storage migration clears existing delivery history by dropping its
table before creating the empty replacement and its indexes. That migration
commits before the separate ledger-index migration starts, releasing history
space before the ledger needs it. Neither migration copies old history or builds
indexes on it. PostgreSQL releases the old relation's disk
space; SQLite makes its pages reusable within the database file. Ledger,
receipt, prepared-output and control evidence remains available. Missing or
incomplete historical evidence continues to refuse unsafe replay inference.
The migration runner applies the change once and preserves new history on later
updates and restarts.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.automation:owned_resource`](src/owner_contracts/_index.yaml) | `teardown_owner` |
| [`kickside.automation.recurring:configurable`](src/recurring/_index.yaml) | `reconfigure` |
| [`kickside.automation:prepared_installable`](src/runtime_contracts/_index.yaml) | `prepare_install` |

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`AutomationsRead`](src/agent/_index.yaml) | `limit`, `cursor`, `page_token`, `page_size` |
| [`AutomationsManage`](src/agent/_index.yaml) | See the operation schema |
| [`RecurringTasks`](src/agent/_index.yaml) | `limit`, `cursor` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.automation:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.automation:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.automation:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.automation.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/automation)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
