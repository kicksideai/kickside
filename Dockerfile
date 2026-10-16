# syntax=docker/dockerfile:1.6
#
# Build with the kickside repo as the context:
#   DOCKER_BUILDKIT=1 docker build --platform linux/amd64 -t wippy-kickside:dev .
#
# The image ships app/ at the current git SHA using the published versions in
# the application's single app/wippy.lock.

# The web-build stage mirrors the repo layout: the main app aliases
# @widgets to ../../../../platform/widgets/ui/src (vite.config), so that
# subtree must sit at the same relative position as in the monorepo.
FROM docker.io/node:22-bookworm-slim AS web-build
WORKDIR /src
COPY app/frontend/applications/main/package.json app/frontend/applications/main/package-lock.json ./app/frontend/applications/main/
# app-main consumes @kickside/ui-kit through a `./.wippy/npm/@*/*` workspaces
# glob, and its lockfile pins that workspace, so the package has to be in place
# before `npm ci` can link it. `make ui-kit` materializes it from the published
# .wapp; here the identical tree is copied straight out of the monorepo, which
# keeps the web build free of a hub token.
COPY platform/ui-kit/package/ ./app/frontend/applications/main/.wippy/npm/@kickside/ui-kit/
RUN --mount=type=cache,target=/root/.npm \
    cd app/frontend/applications/main && npm ci
COPY app/frontend/ ./app/frontend/
COPY platform/widgets/ui/ ./platform/widgets/ui/
RUN cd app/frontend/applications/main \
    && npm run build -- --outDir /src/static-dist --emptyOutDir

FROM docker.io/ubuntu:24.04 AS wippy-dl
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends ca-certificates curl jq \
    && rm -rf /var/lib/apt/lists/*
# 0.3.29a is the floor: `wippy artifacts materialize` does not exist before it,
# and kickside/ui-kit ships its package as a build-time artifact. 0.3.26a would
# still boot - older runtimes ignore `meta.artifact` rather than rejecting it -
# but nothing in an image or pipeline could materialize the package.
# The sha256 is fetched from the release metadata below, so only this changes.
ARG WIPPY_VERSION=0.3.30a
ARG WIPPY_CHANNEL=stable
ARG WIPPY_HUB_URL=https://hub.prod.wippy.cloud
RUN meta=$(curl --proto '=https' --tlsv1.2 -fsSL --retry 3 "$WIPPY_HUB_URL/api/v1/releases/$WIPPY_VERSION?channel=$WIPPY_CHANNEL") \
    && expected=$(printf '%s' "$meta" | jq -r '.assets[] | select(.platform=="linux" and .arch=="amd64") | .sha256' | head -n1) \
    && test -n "$expected" \
    && curl --proto '=https' --tlsv1.2 -fsSL --retry 3 -o /usr/local/bin/wippy \
        "$WIPPY_HUB_URL/api/v1/releases/$WIPPY_VERSION/download/linux/amd64?channel=$WIPPY_CHANNEL" \
    && actual=$(sha256sum /usr/local/bin/wippy | cut -d' ' -f1) \
    && test "$actual" = "$expected" \
    && chmod +x /usr/local/bin/wippy

FROM docker.io/ubuntu:24.04 AS app-install
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends ca-certificates python3 python3-yaml \
    && rm -rf /var/lib/apt/lists/*
COPY --from=wippy-dl /usr/local/bin/wippy /usr/local/bin/wippy
WORKDIR /app
COPY app/ ./
# The kickside/* hub modules are private: wippy install authenticates with a
# hub token passed as a BuildKit secret (never written to a layer; login and
# logout happen inside a single RUN).
# wippy.lock is not committed, and 0.3.26a's `install` bootstraps the missing
# lock with empty directories and then rejects the file it just wrote
# ("directories.modules cannot be empty"). `init` writes the correct defaults,
# and `update` performs the resolve `install` would have done. That resolve also
# materializes build-time artifacts under /app/.wippy/npm, which the web-build
# stage owns and the runtime image has no use for; leaving it behind also blocks
# artifact activation, whose rename cannot replace a directory baked into a lower
# image layer.
RUN --mount=type=secret,id=wippy_token \
    python3 scripts/check_dependency_pins.py --app-dir . \
    && wippy auth login --token "$(cat /run/secrets/wippy_token)" \
    && wippy init \
    && wippy update \
    && wippy auth logout \
    && mkdir -p /app/.wippy/uploads \
    && rm -rf /app/.wippy/npm

FROM docker.io/ubuntu:24.04
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=wippy-dl /usr/local/bin/wippy /usr/local/bin/wippy
RUN useradd -m -u 10001 kickside \
    && mkdir -p /data \
    && chown kickside:kickside /data
WORKDIR /app
COPY --from=app-install --chown=kickside:kickside /app ./
COPY --from=web-build --chown=kickside:kickside /src/static-dist ./static/app/main
USER kickside
ENV HOME=/home/kickside
VOLUME ["/data"]
EXPOSE 8085
ENTRYPOINT ["wippy"]
CMD ["run", "-c", "--profile", "postgres", "--set", "vars.instance_data_dir=/data"]
