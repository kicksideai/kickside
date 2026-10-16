# KickSide Blocks

The source implements one closed `kickside.block/v1` declaration contract:

- `contract.lua` validates declarations and instance config.
- `lower.lua` maps one Block to one native function, Agent, or durable wait node.
- `blocks.lua` exposes discovery, exact resolution, description, and headless planning.
- `tool_adapter.lua` projects visible public registry tools into that same catalog without
  a wrapper or an Agents/Workflows dependency.
- `await.lua` is the native durable wait node; `resume.lua` resumes it under the Flow's
  frozen execution identity.

There is no runtime declaration lookup, wrapper execution tool, graph-builder return
value, compatibility alias, or alternate Block dialect.
