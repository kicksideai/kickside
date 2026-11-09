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

Delivery history records sink deliveries, the first failure or wait, and the final
resolved or dead result with its attempt count. Intermediate retries overwrite
mutable ledger state. A repeated unchanged snapshot writes no history or ledger
row and makes no sink call once its receipt records the delivered identity.
Receipts retain one current destination mapping per item and slot.

`retention.history` defines the hot evidence window, which defaults to seven
days. It is separate from `retention.ledger_resolved`, the deduplication window
for terminal ledger tombstones, which defaults to 30 days. A complete policy
override from an earlier release that omits `history` uses the same seven-day
history default. In-flight ledger rows retain their retry deadline,
attempts, payload and last failure; first-attempt successes and skips create no
ledger row. Resolved payloads are released. A live drive retains prepared output
regardless of age. Orphaned output expires under the existing settled-proof rule.
Replay refuses a new transform when retained evidence cannot prove it safe.

History listing uses keyset pagination within the hot window. Maintenance deletes
aged rows in bounded pages through the existing chronological index, using
`round_at` uniformly for rows written under earlier expiry policies. Expired
space becomes reusable in place. Appends write batches of at most 50 events and
do not read or trim retained history. No history table rebuild, copy, rewrite or
new index runs during the update.

The unresolved ledger population is bounded by `round.max_unresolved` (1,000 by
default). A partial index supplies record fronts and bounds eligibility scans;
identity lookups use an index that also supports prepared-output settlement.
Another partial index lets existing terminal rows without expiry age out through
bounded maintenance. No database triggers maintain derived eligibility state.
Mutable refusal counts and an event reference let replay check one history
primary key instead of enumerating prior attempts. Missing or aged evidence
refuses an unsafe replay.

Interval polling schedules the next completed pass after its durable commit.
Cron and timer schedules preserve one occurrence that becomes due during a round.
Idle drives run no rounds between their scheduled pass or a real event.

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
