# KickSide Ops

Scripts for running local KickSide environments.

Do not commit real `.env` files, tokens, database files, app uploads, or local runtime logs.

## Layout

- `smoke/` - maintained published/source smoke testing on SQLite and PostgreSQL.
- `env/` - example environment files and notes.
- `scripts/app/` - local app lifecycle helpers.

## Common Environment

```sh
export KICKSIDE_ROOT=/path/to/kickside
export WIPPY_BIN=/path/to/wippy
```

If `WIPPY_BIN` is unset, scripts try `$HOME/wippy/wippy/dist/wippy-linux-amd64`, then `wippy` from `PATH`.

## Context Guard

```sh
scripts/context/guard.sh
```

Run this before broad agent scans, prompt-map sweeps, or commits. It fails on PDFs, zips, logs, databases, generated bundles/maps, images, videos, and unexpected large files so they do not get pulled into model context by accident.

The guard uses `rg --files`, so repo `.rgignore` files remain the canonical policy for what normal agent searches can see. Intentional large files that must remain searchable are listed in `context-allowlist.txt`.

## App Restart

```sh
scripts/app/restart.sh
```

This starts the app from `KICKSIDE_ROOT/app`. It reads `ENCRYPTION_KEY` from `app/.env` if the variable is not already set.

## Smoke testing

See [smoke/README.md](smoke/README.md) for setup and environment configuration.
`make -C ops/smoke quick`, `full`, and `list` use the shared smoke CLI.

## Native backend gate

`ops/scripts/backend.py` runs the existing tower backend gate from a prepared lane directory. The lane contains `worktrees/<repository>`, `modules.json`, and the existing `evidence/harness-inventory.json`, `refresh-results.json`, and `backend-initial-results.json` inputs. Refresh each module through its native lockrefresh target before running the gate. The initial results supply measured suite costs.

Run the script with the smoke Python environment while the lane directory is the working directory. SQLite and Postgres run concurrently, with up to four balanced harnesses per engine. Each harness owns its module copy, module artifact directory, temporary directory, and databases. Behavior suites run once per engine; every harness retains its ordered `00_` initialization suites. Database creation follows every declared profile binding, including database-name suffixes. Creation receipts remain until cleanup succeeds.

The gate checks the complete suite partition and successful nonempty runner output. It removes its harness copies and scratch databases after each run. The runtime remains the official v0.3.47a binary.
