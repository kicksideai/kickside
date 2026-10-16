# KickSide Users

The user-management surface for KickSide: login, token storage, user/group
persistence, directory lookup, a CRUD API, and a self-served admin web component.

## What it provides

- **HTTP API** (`api_router`, firewalled): `GET/POST /users`, `PUT/DELETE
  /users/{id}`, `GET/PUT /users/{id}/groups`. Handlers are thin — they delegate
  persistence to the kickside user repos.
- **Auth API** (`public_router`): `POST /user/token` issues tokens with the
  selected security scope recorded in actor metadata for durable work.
- **Persistence** — `app_users`, `app_user_groups`, and `kickside_user_auth_tokens`
  migrations are owned here.
- **Admin UI** — the `kickside-users` web component (a `view.component`),
  self-served from this module's `http.static`, mounted by tag.

## Requirements

- `env_storage` (ns.requirement, default `kickside.users.env:envs`) — auth/user
  env configuration. OS variables use the KickSide-owned `KICKSIDE_USERS_*`
  namespace.
- `public_router` (required `ns.requirement`) — unauthenticated
  router for login.
- `api_router` (required `ns.requirement`) — a firewalled router the
  endpoints attach to. Handlers do no auth of their own.
- `ui_server` (required `ns.requirement`) — the HTTP server the UI
  static mount attaches to.

## Boundary

Permission-agnostic: authorization is enforced by the host router and app-owned
security scopes. This module owns user storage, token-store configuration, and
repository libraries; other KickSide modules consume `kickside.users.persist:*`
rather than depending on kickside auth internals.

Group-policy fences call `kickside.users.persist:delegation_fencer` with
`group_ids` and optional `previous_group_rules`. Security compares the member's
combined policy coverage; Users locks the accounts and advances delegation
epochs transactionally. Missing historical rules require conservative coverage.
Saved credentials retain their payloads, session index and authentication
generation. Validation resolves current groups and policies.

`kickside.users.persist:session_revoker` retains user, token and group revocation.
Omitting `preserve_sessions` revokes group sessions and delegation authority.
The published `preserve_sessions = true` request retains its fencing behavior;
new callers use the explicit delegation operation. The published
`session_index.invalidate_groups` option retains the same dispatch at the
revocation boundary.
