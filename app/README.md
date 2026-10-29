# kickside/kickside

KickSide is a modular application platform for building AI-enabled business
systems. It combines identity and access, durable data and workflows, agents,
knowledge, integrations, automation, and module-owned user interfaces in one
registry-driven host. The core works without an AI provider; install CRM,
knowledge bases, visual workflows, research, connectors, and reusable business
Blocks only when the workspace needs them.

## Quick start

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
  --set vars.quickstart_admin_password="<your-password>"
```

`quickstart` is an explicit local-evaluation profile, not the default profile.
The base configuration uses SQLite for application data and durable SQLite
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

## Update an installation

Use **System → Modules → Update all**, review and apply the plan, then restart
from the same directory. Module migrations update existing data. Keep the lock,
databases, uploads, and encryption key together; updates do not require manual
data conversion.

## Where Your Data Lives

Everything is stored under `./.wippy/` in the directory you ran from — that
directory IS your instance:

- `./.wippy/app.db` — application data (SQLite by default).
- `./.wippy/.env` — the auto-generated `ENCRYPTION_KEY` (created on first boot when you
  do not supply one). Tokens are signed with it; keep it stable for the life of
  the instance.

Registry history is durable SQLite at `./.wippy/registry.db` by default.
The `postgres` profile selects PostgreSQL history instead. Preserve the
deployment lock, configuration, and registry history with the application data.

Keep the directory to keep the instance. Delete the directory for a clean
install. Never edit the files under `./.wippy/` by hand.

## Production Configuration

For deployment-managed environments, supply credentials and the key through the
environment instead of the quickstart defaults:

```sh
export ENCRYPTION_KEY="<64-hex-character-key>"          # openssl rand -hex 32
export KICKSIDE_USERS_DEFAULT_ADMIN_EMAIL=admin@example.com
export KICKSIDE_USERS_DEFAULT_ADMIN_PASSWORD="<initial-admin-password>"
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
  --set vars.bootstrap_admin_password="<initial-admin-password>" \
  --set vars.postgres_host=db.example.com \
  --set vars.postgres_port=5432 \
  --set vars.postgres_database=kickside \
  --set vars.postgres_username=kickside \
  --set vars.postgres_password="<database-password>" \
  --set vars.postgres_history_dsn="host=db.example.com port=5432 dbname=kickside user=kickside password=<database-password> sslmode=require" \
  --set vars.postgres_sslmode=require
```

The application connection uses `postgres_host`, `postgres_port`,
`postgres_database`, `postgres_username`, `postgres_password`, and
`postgres_sslmode`. Registry history requires its own libpq DSN in
`vars.postgres_history_dsn`; the profile does not derive it from those fields.
Use the same database or another database intended for registry history.
`vars.postgres_history_schema` defaults to `wippy_registry`.
Supply a correctly escaped libpq DSN when values contain special characters.
For a PostgreSQL server without TLS, set `vars.postgres_sslmode=disable` and
`sslmode=disable` in the history DSN. Preserve uploads and the encryption key.

For larger installs, apply `--profile postgres --profile postgres_large`
(bigger pool and lease limits) or `--profile postgres --profile postgres_enterprise`
(highest limits). These tuning profiles retain the PostgreSQL history DSN and schema settings.

## Capability Bundles

During onboarding (or later from System → Modules) an administrator picks
starter bundles: **Knowledge base**, **Workspace & Graphs**, **Automations**,
**Visual Workflows**, **Web Research**, or hand-picked modules via **Choose
your own**. Bundles are optional package roots resolved against the live Hub
catalog at install time; the app stays lean until you install one.

## Development

Run from `kickside/app`:

```sh
make build      # build frontend/applications/main into static/app/main
make dev        # Vite dev mode for the main app
make lint       # type-check the main app
make run        # build and run the app
```

Source development starts with `make refresh-deps`. Each module's README lists
its test targets.

## Frontend Boundary

The app package owns the host-rendered shell declared by `app.views:main`:

```yaml
kind: registry.entry
meta:
  type: view.page
  title: KickSide
  url: /app
  base_path: app/main
  entry_point: app.html
proxy:
  enabled: true
```

The main Vue app lives in `frontend/applications/main` and handles host-level
navigation, authentication shell, web component mounting, branding, and global
proxy bootstrap.

Feature surfaces are not added directly to this host app. Platform modules
declare their own web components through `view.component` plus `http.static`, and
the host mounts them by registry declaration.

## Static Assets

- `static/app/main` is generated by `make build` and embedded on publish.
- `static/login.html` and similar direct static files are outside the host app.
- Module UI bundles live with their modules under `platform/<module>/static`.

Do not edit generated bundles by hand. Change source, rebuild, and commit source
and generated static output together when the static output is part of the
published package.

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
  and the development handbook.
- [Frontend Documentation](https://github.com/kicksideai/docs/blob/main/building-modules/frontend.md) -
  host and module-owned web component conventions.

## Requirements

Wippy 0.3.x; repository validation uses the latest stable Wippy release. Use current Hub dependencies
for the contracts declared by the module.
SQLite or PostgreSQL supplies application persistence. Frontend builds use
Node.js 22, npm, and Make.

## Reference

- [Module reference](src/app/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`read_kickside_documentation`](src/app/registry/documentation/_index.yaml) | `page`, `limit`, `cursor` |


## License

[KickSide Community License 1.0](LICENSE).

[KickSide](https://kickside.ai) · [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
