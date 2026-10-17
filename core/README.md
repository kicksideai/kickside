# KickSide Core

Foundation modules for resource ownership, durable events, and execution.

Each package installs independently; its README describes requirements,
configuration, and development.

| Module | Package | Purpose |
|---|---|---|
| [component](component/README.md) | `kickside/component` | Owned resources, component hierarchy, metadata, and access grants. |
| [contract](contract/README.md) | `kickside/contract` | Shared contracts for components, providers, and data capabilities. |
| [core](core/README.md) | `kickside/core` | Durable threads, events, projections, retention, and lifecycle cleanup. |
| [execution](execution/README.md) | `kickside/execution` | Principal encoding, delegation, actor context, and execution tracing. |
| [jobs](jobs/README.md) | `kickside/jobs` | Durable job slots, leases, worker supervision, and persisted wake demand. |
| [realtime-dispatch](realtime-dispatch/README.md) | `kickside/realtime-dispatch` | Bounded audience dispatch through the selected realtime owner. |

[KickSide](https://kickside.ai) · [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
