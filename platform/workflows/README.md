# kickside/workflows

Optional visual authoring, versioning, and execution of Block-based Flows.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/workflows
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


Undo and redo history belongs to each workflow and is shared by its editors.
The definition writer commits each forward/inverse batch and its definition
events in one transaction. History retains the latest 50 edit batches across
module updates and process restarts; a new edit clears redo. Workflow access
gates history reads and edits, and workflow deletion removes its history.

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
Edit frontend source under `ui/` and run `make -C ../../ build MOD=workflows` from this directory;
commit regenerated tracked assets with the source.

## Use

Create a Workflow draft, add and connect Blocks, validate, and publish an immutable version. Launch or trigger that exact version and inspect its run history. A durable wait resumes under the run’s saved execution identity; the reviewer supplies a decision rather than becoming its executor.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`RunFlow`](src/agent/_index.yaml) | See the operation schema |
| [`WorkflowsRead`](src/agent/_index.yaml) | `limit`, `offset` |
| [`WorkflowsManage`](src/agent/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.workflows:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.workflows:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.workflows:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.workflows:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.workflows.security:user_security_scope`](src/security/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/workflows)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

Synchronous execution results and run detail responses expose optional `error_details` from Dataflow alongside the existing error message. Run detail reads these diagnostics from its existing engine snapshot and applies the same secret redaction. Stored run rows and routed Error output shapes remain unchanged.

## Retry policies and execution timeouts

Function Blocks accept optional `execution.retry_policy`,
`execution.start_to_close_timeout`, and `execution.schedule_to_close_timeout`.
Agent and wait executions reject these fields. Dataflow's shared retry library owns
validation and execution; without a policy a function makes one attempt.

```lua
execution = {
    kind = "function", function_id = "example:run",
    retry_policy = {
        initial_interval = "1s", backoff_coefficient = 2,
        maximum_interval = "30s", maximum_attempts = 3,
        non_retryable_error_types = { "Invalid" },
    },
    start_to_close_timeout = "10s",
    schedule_to_close_timeout = "2m",
}
```

Durations accept positive duration strings or milliseconds. With a policy, omitted
values default to a 1s initial interval, coefficient 2, a maximum interval 100 times
the initial interval, three attempts (including the first attempt), and no excluded
error kinds. Cancellation and errors explicitly
marked non-retryable stop retries. The per-attempt timeout limits each call; the
total window includes attempts and backoff. An explicit `maximum_attempts = 0`
removes the count limit only when a positive `schedule_to_close_timeout` bounds the
overall retry window.

Opting into retries can repeat external side effects after a lost response or
interrupted call. Retry-enabled function context includes `attempt` and a stable
`idempotency_key`; functions that write externally should use that key to deduplicate
repeated attempts. Calls without a retry policy retain their existing context.

A canvas `block` node carries these three optional fields at the top level, beside
`ref` and `config`. They never enter the Block's `config_schema`. Function and tool
steps support them; agent, wait, and structural steps reject retry configuration.
`node.add` and `node.update` carry the fields through WorkflowsManage and the HTTP
command API. In commands, `false` clears an override and restores the Block default;
omitting a field retains its current value. The stored document omits cleared fields.

The inspector's Retries section shows the Block defaults and lets authors override
or reset the policy and each timeout separately. Invalid policies refuse publication
with Dataflow's validation message attached to the node. Publication freezes the
policy and timeouts into the native commands; each run retains those values when
it assigns fresh node ids. Existing published versions remain unchanged. An
idempotent forward migration adds optional draft-node storage without rewriting
existing definitions, publications, events, or runs.
