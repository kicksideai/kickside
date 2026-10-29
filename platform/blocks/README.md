# kickside/blocks

Typed reusable capabilities for agents, automations, and Dataflow.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/blocks
wippy install
```

Apply host bindings and migrations through the application install plan.
Review the manifest and registry requirements before enabling the module.
Host resources and security groups bind through the install plan.


## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

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

## Use

Discover exact Block declarations through `kickside.blocks:blocks`. A Block lowers to one native function, agent, or wait node; the composing caller owns edges and the graph. Public tools appear as virtual Blocks from their authoritative schemas. Headless composition does not require visual Workflows.

### External wait arms (`arm_id`)

A wait Block can declare `execution.arm_id`, the function invoked after
`kickside.blocks:await` durably parks through Dataflow's `n:park`. The arm receives
`dataflow_id`, `node_id`, `signal_id`, `input`, `config`, and opaque `run_context`,
plus Dataflow's stable `idempotency_key`. Arm side effects must be idempotent.

An arm is also callable directly. Before writing an external request, call
`kickside.blocks:authorize_arm` through `funcs.call` under the current actor:

```lua
local authorization, err = funcs.call("kickside.blocks:authorize_arm", {
    dataflow_id = args.dataflow_id,
    signal_id = args.signal_id,
})
if err then return nil, err end
```

Input is `{dataflow_id: string, signal_id: string}` with non-empty identifiers.
Success is `{authorized: true, dataflow_id: string, signal_id: string, node_id:
string}`. Blocks verifies that the Flow exists, its actor ID matches the current
security actor, and the signal belongs to an Await node's committed, unresolved
signal wait. A declaration alone does not authorize arming. A durable yield
result closes the wait even before the node finishes. Caller-supplied actor or
node IDs do not select authority. This check does not reserve the wait; use the
arm's idempotency key for repeated delivery.

Failures return `nil, error`, as native Wippy errors:

| Kind | `err:details().code` | Meaning |
| --- | --- | --- |
| `INVALID` | `BLOCK_DATAFLOW_ID_REQUIRED`, `BLOCK_SIGNAL_ID_REQUIRED` | Missing or non-string identifier |
| `PERMISSION_DENIED` | `BLOCK_ARM_IDENTITY_REQUIRED`, `BLOCK_ARM_FORBIDDEN` | Missing actor/scope or another actor's Flow |
| `NOT_FOUND` | `BLOCK_FLOW_NOT_FOUND`, `BLOCK_SIGNAL_NOT_FOUND` | Flow absent, or signal absent, unparked, resolved, or terminal |
| Dependency kind | `BLOCK_FLOW_LOOKUP_FAILED`, `BLOCK_SIGNAL_LOOKUP_FAILED` | Storage/read failure; native kind and retryability survive |
| Decode kind / `INTERNAL` | `BLOCK_FLOW_METADATA_INVALID`, `BLOCK_SIGNAL_STATE_INVALID` | Invalid persisted state |

Locally classified validation, permission, and absence errors are not retryable.
An existing dependency detail code is retained; `details.blocks_code` identifies
the Blocks operation and `details.cause` retains the original native fields.
Legacy Dataflow read/delivery errors that arrive as strings become retryable
`UNAVAILABLE` errors; Blocks never classifies them by message text. Arm owners
do not need to import Dataflow persistence.

### Delivering a result

Call `kickside.blocks:resume` with `{dataflow_id, signal_id, payload}`; the legacy
`data` alias for `payload` is also accepted. Success retains
`{ok: true, dataflow_id, signal_id, commit_id}`. Resume reconstructs the Flow's
identity or delegates to its recorded resume handler. `resume_under_identity`
uses the already reconstructed actor and scope.

Both resume functions return native errors. Missing Flows use `NOT_FOUND` with
`BLOCK_FLOW_NOT_FOUND`; absent or closed waits use `NOT_FOUND` with
`BLOCK_SIGNAL_NOT_FOUND`. Invalid identity uses `PERMISSION_DENIED` with
`BLOCK_FLOW_IDENTITY_INVALID`, `BLOCK_SIGNAL_IDENTITY_REQUIRED`, or
`BLOCK_SIGNAL_IDENTITY_MISMATCH`. Native Dataflow, handler, and transport errors
retain their kinds, retryability, and detail codes. Delivery failures without a
dependency code use `BLOCK_SIGNAL_FAILED`; legacy string delivery failures are
retryable `UNAVAILABLE`. A durable result owner can release a result only for
confirmed destination absence: `BLOCK_FLOW_NOT_FOUND` or
`BLOCK_SIGNAL_NOT_FOUND`. A dependency `NOT_FOUND` from identity reconstruction
or a recorded resume handler does not prove the destination is closed; retain
the undelivered result and handle the dependency failure by kind/code without
matching messages.

Blocks requires Dataflow >=0.7.31 and uses its public `userspace.dataflow:inspection` library for flow and
parked-wait inspection. Dataflow owns SQL, metadata decoding and yield-episode
ordering; Blocks owns actor authorization and its public error codes. The new
private adapter is `kickside.blocks.internal:signal_destination`.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`list_blocks`](src/_index.yaml) | `limit`, `cursor` |
| [`get_block`](src/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.blocks:process_host`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/blocks)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

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
the initial interval, unlimited attempts (`maximum_attempts = 0`), and no excluded
error kinds. Attempts include the first call. Cancellation and errors explicitly
marked non-retryable stop retries. The per-attempt timeout limits each call; the
total window includes attempts and backoff.

`plan` and `plan_descriptor` accept the same three optional fields on the instance,
beside `config`. Each instance field replaces its declaration independently; a
`retry_policy` replaces the whole object. Tool descriptors also lower these fields
to native function configuration. Agent and wait instances reject overrides.
