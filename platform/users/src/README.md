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

Sessions compose native group policies with the source policy IDs selected by
custom scopes. The native subject lookup resolves current memberships and live
DB selections on validation; users without custom selections add no query, and
all held custom selections share one query by scope primary key. Original
membership labels remain in actor metadata for ACL checks. Live authority uses
actual memberships; a session-mint default does not add authority to an account
with no memberships.

Login time, IP address and user agent live in the reserved `actor.meta.session`
block. Password login derives these facts from the request and ignores client
metadata. Trusted provisioning metadata still retains its non-reserved fields.
Subject lookup preserves valid session context, and the profile response keeps
its existing `session` fields. Missing or non-object context supplies no login
facts; readers do not borrow the former top-level fields. Existing token payloads
expire normally. The application requires Relay 0.3.20 or newer to keep these
per-login facts out of authority comparison while retaining other actor metadata
and authority epochs.

Custom-scope writes ask the existing Security writer to fence the affected groups,
including composed memberships, before changing their DB selections. The writer
calls `kickside.users.persist:delegation_fencer`; Users locks those accounts and
advances their delegation epochs transactionally. This path uses no policy-body
coverage proof. Saved sessions retain their bearer tokens, ownership rows and
authentication generation while live validation reflects the current selection.

`kickside.users.persist:session_revoker` retains user, token and group revocation.
Omitting `preserve_sessions` revokes group sessions and delegation authority.
The published `preserve_sessions = true` request retains its fencing behavior;
new callers use the explicit delegation operation. The published
`session_index.invalidate_groups` option retains the same dispatch at the
revocation boundary.

The explicit `session_index.invalidate_groups` API retains its `allow_only`
coverage behavior for native group invalidation. Custom-scope writes use the
separate delegation fence and do not use that session-invalidation option.

## Runtime compatibility

Live selected-policy authority requires Runtime 0.3.54a or newer. Upgrade Runtime
before updating Users to this source-policy resolver. The Security API stage
retains the old materialization contract for installations still using older Users.

The source-policy resolver requires Security >=0.2.13 and Execution >=0.2.7.
Both are minimum versions, so existing locks must advance to implementations
that provide the public resolver and preserve selected policies during run-as.
Security retains its native named-scope and materialization APIs for older
consumers; this Users client does not depend on its persistence or generated IDs.

Native compatibility projection also retains its post-projection reduction
fence. It closes the window in which an older native-scope consumer could
capture the previous grants after the source pre-write fence but before the
registry update. Authentication generations and token records remain unchanged.
