# SQLite and PostgreSQL

## SQLite

SQLite is the base storage mode. An instance directory contains `.wippy/app.db` for application data and `.wippy/registry.db` for registry history. The quickstart profile selects local evaluation credentials and address settings.

```sh
wippy run kickside/kickside -c --profile quickstart
```

Use the same directory and profile on restart. A custom SQLite path uses `--set vars.local_sqlite_file=./.wippy/app.db` with a profile that applies it.

## PostgreSQL

PostgreSQL stores application data and registry history in the database. The default history schema is `wippy_registry`. Configure both the application connection and the registry history DSN; the profile requires the DSN even when all application connection fields are present.

Provision an empty database and a database user before the first run. Supply passwords through your deployment’s secret configuration. For example:

```sh
export KICKSIDE_PG_HOST=db.example.com
export KICKSIDE_PG_PORT=5432
export KICKSIDE_PG_DATABASE=kickside
export KICKSIDE_PG_USERNAME=kickside
export KICKSIDE_PG_PASSWORD='replace-with-your-database-password'
export KICKSIDE_HISTORY_DSN='postgres://kickside:URL_ENCODED_PASSWORD@db.example.com:5432/kickside?sslmode=require'
export ENCRYPTION_KEY="$(openssl rand -hex 32)"

wippy run kickside/kickside -c \
  --profile bootstrap_admin --profile local --profile postgres \
  --set vars.local_port=8085 \
  --set vars.local_public_api_url=https://app.example.com \
  --set vars.bootstrap_admin_email=admin@example.com \
  --set vars.bootstrap_admin_password='replace-with-your-password' \
  --set vars.postgres_history_dsn="$KICKSIDE_HISTORY_DSN" \
  --set vars.postgres_sslmode=require
```

The `KICKSIDE_PG_*` variables supply the application connection. The history DSN contains its own connection and TLS settings; URL-encode its password. `KICKSIDE_HISTORY_DSN` in this example is a shell variable passed explicitly through `--set`.

On later boots, use `wippy run -c` with the same profiles, variables, and secrets. Preserve the encryption key and upload storage even when both database resources use PostgreSQL.

For a local database without TLS, use `vars.postgres_sslmode=disable` and `sslmode=disable` in the history DSN. The larger PostgreSQL profiles adjust pool and worker limits; select them only with sufficient database capacity.

Selecting a storage profile does not migrate an existing SQLite instance’s data to PostgreSQL. Plan and verify data transfer separately. See [backups](backups.md).
