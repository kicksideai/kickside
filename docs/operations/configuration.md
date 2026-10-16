# Configuration

Wippy reads runtime configuration from `.wippy.yaml`. Profiles group related overrides; repeat `--profile` to apply them in order. `--set` supplies a merged configuration value for that invocation. Keep the same required profiles and values on restart.

| Profile | Purpose |
| --- | --- |
| `quickstart` | Local evaluation with SQLite and initial development credentials |
| `bootstrap_admin` | Initial administrator credentials from bootstrap variables |
| `local` | Listener port and public API URL from local variables |
| `sqlite` | Application database path from `local_sqlite_file` |
| `postgres` | PostgreSQL application data and registry history |
| `postgres_large` | Larger database pool and worker limits |
| `postgres_enterprise` | Highest predefined pool and worker limits |

The base configuration uses SQLite for application data and registry history. It supplies no fixed administrator password. For a deployment-managed first boot:

```sh
export ENCRYPTION_KEY="$(openssl rand -hex 32)"
export KICKSIDE_USERS_DEFAULT_ADMIN_EMAIL=admin@example.com
export KICKSIDE_USERS_DEFAULT_ADMIN_PASSWORD='replace-with-your-password'
export PUBLIC_API_URL=https://app.example.com
wippy run kickside/kickside -c
```

Persist the generated key in your deployment’s secret store and supply the same key on every restart. Bootstrap credentials apply only when the database is fresh. Later starts use `wippy run -c` from the instance directory.

`PUBLIC_API_URL` matches the address users reach through the proxy. Configure TLS at your deployment boundary and ensure the proxy forwards the application’s HTTP and realtime traffic.

The source configuration declares `vars.local_port`, `vars.local_public_api_url`, `vars.local_sqlite_file`, bootstrap credentials, PostgreSQL connection fields, `vars.postgres_history_dsn`, and `vars.postgres_history_schema`. Configuration examples for storage appear in [SQLite and PostgreSQL](storage.md).

See the [canonical runtime configuration](https://github.com/kicksideai/kickside/blob/main/app/.wippy.yaml) for the complete profile definitions. Profiles configure startup; module-owned settings appear in [System → Settings](https://github.com/kicksideai/docs/blob/main/using/settings.md).
