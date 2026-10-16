# Docker

The application repository supplies a multi-stage [Dockerfile](https://github.com/kicksideai/kickside/blob/main/Dockerfile). Build from the repository root so the app and shared widget sources are in the build context.

The image builds the main frontend, downloads and verifies a Wippy runtime, resolves application dependencies, and runs as the `kickside` user with UID 10001. It exposes port 8085. Its default command is `wippy run -c --profile postgres`.

The dependency stage reads a Hub token from a BuildKit secret:

```sh
DOCKER_BUILDKIT=1 docker build --platform linux/amd64 \
  --secret id=wippy_token,src=./hub-token \
  -t kickside-local .
```

Keep `hub-token` outside tracked files. The build uses the secret during authenticated dependency resolution.

To select the runtime supplied by your deployment configuration, pass `--build-arg WIPPY_VERSION="$WIPPY_VERSION"` to the build. Inspect the Dockerfile’s default runtime when updating the application source.

For PostgreSQL, provide the application connection variables, stable encryption key, initial bootstrap credentials, and registry history DSN. Override the image command to pass the required history configuration:

```sh
docker run --name kickside --env-file ./kickside.env \
  -p 8085:8085 \
  --mount type=volume,src=kickside-state,dst=/app/.wippy \
  kickside-local run -c --profile postgres \
  --set vars.postgres_history_dsn="$KICKSIDE_HISTORY_DSN"
```

The shell that runs this command supplies `KICKSIDE_HISTORY_DSN`; the environment file supplies `KICKSIDE_PG_*`, `PUBLIC_API_URL`, `ENCRYPTION_KEY`, and bootstrap credentials. Prepare the volume with ownership that permits UID 10001 to write. The runtime also needs its resolved module packs: retain or initialize the image’s `.wippy` contents in the state volume before starting.

Keep the database, uploads, and encryption key across container replacement. Build and test the image in your target architecture before deploying it. See [storage](storage.md) and [backups](backups.md).
