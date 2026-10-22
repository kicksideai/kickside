# kickside/connection

Provider connections and reply targets for the KickSide engine — modelled as
components.

## What it owns

- **Contracts** (`kickside.connection:*`)
  - `connection` / `reply_provider` — per-provider, implemented by plugins
    (discord, telegram, github, …). The plugin supplies credentials handling,
    resource discovery, and reply delivery.
  - `connections` / `reply_providers` — the global registries that
    create/find/list/delete those resources as components, with rollback
    metadata on reversible operations.
- **Registries** — the canonical bindings for the two registry contracts.
- **Shared helpers** — `reply_sender`, `attachment_ingest`, and `html_text`.
- **HTTP API** — list/create/update/delete connections and discover resources.

The module owns **no SQL tables**. Connection state lives in `components`.
Durable source configuration belongs to automation private state; timing
belongs to the automation drive and job deadline; emitted content belongs in threads. Per-source watermarks, when
needed, live with the automation/provider state that owns the source.

## Authorization

Handlers perform **no authentication or coarse authorization**. The host mounts
the endpoints on a router with `token_auth` + `endpoint_firewall`; the firewall
enforces `can("access", <endpoint>)` and returns 401/403. In-code checks use the
runtime primitives only: `component.open(id, ACCESS.*)` for per-resource domain
access, and `security.can(action, resource)` for coarse capabilities owned by
the host.

## Dependencies

- `kickside/component` — connections/reply targets are components.
- `kickside/uploads` — attachment ingestion.

## Requirements

- `api_router` — required firewall-protected HTTP router the admin
  endpoints attach to.

The module provisions no database of its own.

## Native HTTP provider adapters

`kickside.connection.client:driver` executes closed, provider-owned action definitions. `driver.new(config).run(action, params, connection_id, write, deadline)` validates the action schema before resolving a credential, verifies the provider and current actor's component access, and applies the connection capacity gate. Read and write actions are separate. Configuration supplies endpoints and routes; callers supply only action-specific data.

The client supports access tokens and the OAuth token-source contract, a single refresh after HTTP 401, JSON and RPC APIs, fixed GraphQL documents with variables, bounded binary transfers, and declared cursor/offset pagination. Network failures after writes are not replayed. A provider's own OAuth component advertises its authentication protocol and scopes. No shell or host SDK is required.

Provider-specific upload envelopes, headers, checksums, and pagination fields belong in the provider package. Its service can pass a typed native `Prepare` function as the third argument to `driver.new(config, dependencies, prepare)`. The preparer delegates schema validation, closed route construction, and bounded content decoding to `driver.prepare`, then applies its protocol format. Authentication, OAuth refresh, authorization, capacity limits, and response redaction remain in the shared driver. The default preparer rejects unknown wire modes before reading credentials.

When upgrading to the release that extracts the former built-in wire formats, update the Box, Dropbox, and Notion packages together with Connection. Their public component and trait IDs remain stable; the wire libraries live in each provider's child namespace. Existing credentials and component instances need no migration.
