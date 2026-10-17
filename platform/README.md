# KickSide Platform

Application capabilities built on the KickSide foundation modules.

Each package installs independently; its README describes requirements,
configuration, and development.

| Module | Package | Purpose |
|---|---|---|
| [agents](agents/README.md) | `kickside/agents` | Agent definitions, chat surfaces, capabilities, and execution. |
| [automation](automation/README.md) | `kickside/automation` | Durable source-to-destination execution with drives, rounds, and delivery receipts. |
| [blocks](blocks/README.md) | `kickside/blocks` | Typed reusable capabilities for agents, automations, and Dataflow. |
| [channel](channel/README.md) | `kickside/channel` | Shared external channels and agent conversations. |
| [connection](connection/README.md) | `kickside/connection` | Provider connections, credentials, and reply targets. |
| [dm](dm/README.md) | `kickside/dm` | Private agent conversations reached through external direct messages. |
| [hub](hub/README.md) | `kickside/hub` | Module discovery, install plans, requirements, and lifecycle management. |
| [identity](identity/README.md) | `kickside/identity` | Links between external provider accounts and KickSide users. |
| [inbox](inbox/README.md) | `kickside/inbox` | Review and approval items with declared renderers and realtime updates. |
| [knowledge](knowledge/README.md) | `kickside/knowledge` | Knowledge-base management, ingestion, retrieval, and provider bindings. |
| [mcp](mcp/README.md) | `kickside/mcp` | MCP server endpoints that expose application capabilities. |
| [models](models/README.md) | `kickside/models` | Model catalog, provider profiles, model classes, and resolver bindings. |
| [oauth](oauth/README.md) | `kickside/oauth` | OAuth connections with PKCE, encrypted token storage, and refresh. |
| [realtime](realtime/README.md) | `kickside/realtime` | Shared topic broadcasts and user-targeted UI notifications. |
| [renderers](renderers/README.md) | `kickside/renderers` | Isolated content viewers for Markdown, PDF, and images. |
| [security](security/README.md) | `kickside/security` | Administration of application roles, scopes, and policies. |
| [self-reflection](self-reflection/README.md) | `kickside/self-reflection` | Optional read-only registry and application introspection for agents. |
| [sessions](sessions/README.md) | `kickside/sessions` | Chat-session listing, preview, rename, resume, and deletion. |
| [settings](settings/README.md) | `kickside/settings` | Typed registry defaults and database-backed administration overrides. |
| [skills](skills/README.md) | `kickside/skills` | Versioned reusable agent procedures and skill capabilities. |
| [sync](sync/README.md) | `kickside/sync` | Data synchronization implemented as an automation kind. |
| [transfer](transfer/README.md) | `kickside/transfer` | User-owned component export, archive packaging, and import. |
| [transform](transform/README.md) | `kickside/transform` | Shared expression, LLM, code, and function item transforms. |
| [ui](ui/README.md) | `kickside/ui` | Navigation discovery and appearance administration. |
| [ui-kit](ui-kit/README.md) | `kickside/ui-kit` | Shared frontend CSS vocabulary packaged as a build-time artifact. |
| [uploads](uploads/README.md) | `kickside/uploads` | Upload storage, artifact processing, previews, and file capabilities. |
| [users](users/README.md) | `kickside/users` | Authentication, user and group persistence, profiles, and administration. |
| [webhooks](webhooks/README.md) | `kickside/webhooks` | Secret-protected, schema-validated incoming event endpoints. |
| [widgets](widgets/README.md) | `kickside/widgets` | Reusable model, icon, schedule, and selection web components. |
| [workflows](workflows/README.md) | `kickside/workflows` | Optional visual authoring, versioning, and execution of Block-based Flows. |

[KickSide](https://kickside.ai) · [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
