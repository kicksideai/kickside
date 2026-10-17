# KickSide Agents

User agents for KickSide: the agent and tool registries, user-created agent
components, the agent resolver and runner, a capability library, and a user-facing
CRUD API.

## What it provides

- **Registries** — `kickside.agents:agents` and `kickside.agents:tools`
  contract definitions (default bindings in `kickside.agents.registry`).
- **User agents as components** — the `user_agent` binding implements
  `kickside.contract:component` (status) and `kickside.contract:deletable`
  (cleanup); agents are stored as rows in the shared `components` table via
  `kickside.component`.
- **Resolver** — `agent_resolver` binds `wippy.agent:resolver` (default) so the
  runtime can load any user or built-in agent.
- **Runner** — projection worker that runs an agent turn and writes the reply
  back through `kickside.connection`.
- **Traits** — reusable agent capabilities (thread read/write, connection
  read/manage/admin, workspace, workflow runner, agent switch, attachments,
  inbox request, navigation, rich artifacts).
- **Registry discovery** — built-in agent entries can be contributed by the app
  or any installed module via `agent.gen1` registry entries.
- **HTTP API** — `/user-agents` CRUD + `/agents/{list,traits,tools}` discovery.

## Requirements

- `api_router` (required `ns.requirement`) — a firewalled router the
  endpoints attach to. The handlers do no auth of their own.
- `kickside.component` — persistence and access-control service for user-owned
  agent components.

## Boundary

Permission-agnostic: all authorization is enforced by the host router
(token_auth + endpoint_firewall) and by the component service. Optional modules
publish their own traits and tools instead of becoming dependencies of Agents.
Automation is one such optional consumer: Agents exposes agent discovery and
invocation contracts without depending on the Automation package.

## Creation defaults

The registry create path and `POST /api/v1/user-agents` use the agents-owned
`DEFAULT_MODEL` when `model` is omitted. An explicit model overrides it.


New user agents receive the public `Artifacts` and `File Manager` capabilities
by default. Existing agents keep their persisted capability list, and an explicit
empty `traits` array is an opt-out. File Manager reads attached uploads through
`ViewFiles`, using the attachment ID and the caller's upload permissions. It reads
converted document text before answering questions about an attachment.

Artifacts owns the `CreateArtifact` member tool and
its live, bounded component/page catalog; the tool is not independently public
because direct assignment would omit that catalog and can duplicate the same
LLM tool alias.

`CreateArtifact` accepts exactly one server-validated content mode: bounded
Markdown/HTML text that declares its `content_type`, an approved auto-registered component tag, or an approved
registry component/page reference. Component props must match the live declared
schema; undeclared, event-handler, and host-control attributes are rejected.
Text is rendered only by a Web Host release that sanitizes artifact markup to a
fixed non-executable subset. The tool emits the session contract's canonical
`display_type` (`standalone` or `inline`); artifact `type` remains the
session-owned content kind. The session runtime owns persistence and inline-token
generation.

Session owns standalone artifact persistence and chat messages, while Web Host
owns rendering. Use current compatible releases and verify the result in chat
or the gallery under the intended user. A successful creation response does not
prove the client renders an artifact.
