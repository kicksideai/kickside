KickSide is a modular application platform for building AI-enabled business
systems. It combines identity and access, durable data and workflows, agents,
knowledge, integrations, automation, and module-owned user interfaces in one
registry-driven host. The core works without an AI provider; install CRM,
knowledge bases, visual workflows, research, connectors, and reusable business
Blocks only when the workspace needs them.

## Quick Start

Run from an empty directory. No checkout, no build, no configuration:

```sh
mkdir kickside && cd kickside
wippy run kickside/kickside -c --profile quickstart
```

Open <http://localhost:8085> and sign in:

- **Email:** `admin@kickside.local`
- **Password:** `kickside-admin`

These defaults exist only in the `quickstart` profile and apply only on the
first boot of a fresh directory. Change the password after signing in
(System → Users), or start with your own credentials instead:

```sh
wippy run kickside/kickside -c --profile quickstart \
  --set vars.quickstart_admin_email=you@example.com \
  --set vars.quickstart_admin_password=<your-password>
```

`quickstart` is an explicit local-evaluation profile, not the default profile.
The base configuration already uses SQLite for both application data and
registry history; `quickstart` additionally selects the local address and the
documented development credentials. Without it, no fixed admin credentials are
injected.

To use another port:

```sh
wippy run kickside/kickside -c --profile quickstart \
  --set vars.local_port=9090 \
  --set vars.local_public_api_url=http://localhost:9090
```

## Restart an Existing Instance

The first command above resolves the published application and creates
`wippy.lock`. After that, restart from the same directory using the lock:

```sh
wippy run -c --profile quickstart
```

This does not resolve new package versions. Use the module command for initial
installation and the update controls when you intentionally want to change the
locked application graph.

## Where Your Data Lives

Everything is stored under `./.wippy/` in the directory you ran from — that
directory IS your instance:

- `./.wippy/app.db` — application data (SQLite by default).
- `./.wippy/registry.db` — the registry history: every configuration change and module
  install is a recorded changeset, replayed on each start. This is why modules
  you install survive restarts.
- `./.wippy/.env` — the auto-generated `ENCRYPTION_KEY` (created on first boot when you
  do not supply one). Tokens are signed with it; keep it stable for the life of
  the instance.

Keep the directory to keep the instance. Delete the directory for a clean
install. Never edit the files under `./.wippy/` by hand.

## Production Configuration

For deployment-managed environments, supply credentials and the key through the
environment instead of the quickstart defaults:

```sh
export ENCRYPTION_KEY=<64-hex-character-key>          # openssl rand -hex 32
export KICKSIDE_USERS_DEFAULT_ADMIN_EMAIL=admin@example.com
export KICKSIDE_USERS_DEFAULT_ADMIN_PASSWORD=<initial-admin-password>
wippy run kickside/kickside -c   # first boot
wippy run -c                     # later boots from the same directory
```

Bootstrap credentials are read only on the first boot of a fresh database.
`PUBLIC_API_URL` must match the address users reach the app on — set it in the
environment or via the `local` profile vars when running behind a proxy.

## Postgres

The packed profiles work identically in a direct Hub run and in a source
checkout. Switch storage with the `postgres` profile:

```sh
wippy run kickside/kickside -c \
  --profile bootstrap_admin --profile local --profile postgres \
  --set vars.local_port=8085 \
  --set vars.local_public_api_url=https://app.example.com \
  --set vars.bootstrap_admin_email=admin@example.com \
  --set vars.bootstrap_admin_password=<initial-admin-password> \
  --set vars.postgres_host=db.example.com \
  --set vars.postgres_port=5432 \
  --set vars.postgres_database=kickside \
  --set vars.postgres_username=kickside \
  --set vars.postgres_password="<database-password>" \
  --set vars.postgres_history_dsn="host=db.example.com port=5432 dbname=kickside user=kickside password=<database-password> sslmode=require" \
  --set vars.postgres_sslmode=require
```

Postgres values may also come from the environment (`KICKSIDE_PG_HOST`,
`KICKSIDE_PG_PORT`, `KICKSIDE_PG_DATABASE`, `KICKSIDE_PG_USERNAME`,
`KICKSIDE_PG_PASSWORD`). With Postgres, the registry history moves into the
database as well (`wippy_registry` schema), so instances survive on the
database alone. Supply the correctly escaped libpq DSN separately in
`vars.postgres_history_dsn`; the profile does not derive it from application
connection fields. For PostgreSQL without TLS, set `vars.postgres_sslmode=disable`
and `sslmode=disable` in the history DSN.

Profile tiers for larger installs: `postgres_large` (bigger pool and lease
limits) and `postgres_enterprise` (highest limits).

## Capability Bundles

During onboarding (or later from System → Modules) an administrator picks
starter bundles: **Knowledge base**, **Workspace & Graphs**, **Automations**,
**Visual Workflows**, **Web Research**, or hand-picked modules via **Choose
your own**. Bundles are optional package roots resolved against the live Hub
catalog at install time; the app stays lean until you install one.

## Documentation

Published documentation is one `registry.entry` per page with
`meta.type: wippy.documentation.page`; agents can discover pages directly by
that type or use `app:documentation` for list/read convenience.

- [KickSide Development Handbook](https://github.com/kicksideai/docs/blob/main/building-modules/index.md) -
  canonical vocabulary, architecture, Blocks, Flows, components, contracts,
  ports, events, frontend, testing, live development, and publishing guidance.
- [Discovery, Addressing, And Context](https://github.com/kicksideai/docs/blob/main/building-modules/discovery-addressing-and-context.md) -
  exact registry ids, typed search, components versus declarations, public
  tool/Block catalogs, and actor-safe invocation.
- [KickSide Module Template](https://github.com/kicksideai/module) -
  GitHub template with initialization, backend, API,
  migration, contract, port, web component, SQLite/Postgres harness, CI,
  Wiki, and agent instructions.
- [Frontend Documentation](https://github.com/kicksideai/docs/blob/main/building-modules/frontend.md) - host
  and module-owned web component conventions.
