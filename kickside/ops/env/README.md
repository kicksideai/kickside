# Env Files

Keep real environment files outside Git. This directory only documents expected variables and safe examples.

Recommended local pattern:

```sh
cp env/app.env.example ../app/.env
```

Operational scripts read:

- `KICKSIDE_ROOT` - workspace root, defaults to this repo's parent.
- `WIPPY_BIN` - runtime binary path, defaults to `$HOME/wippy/wippy/dist/wippy-linux-amd64`, then `wippy`.
- `ENCRYPTION_KEY` - app encryption key; `scripts/app/restart.sh` also reads it from `app/.env`.
- `PUBLISH_DRY_RUN` - defaults to `1`; set to `0` for real publish.

