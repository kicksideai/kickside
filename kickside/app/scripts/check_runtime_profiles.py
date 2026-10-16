#!/usr/bin/env python3
"""Validate the public database profile contract packed with the app."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import yaml


POSTGRES_PROFILES = ("postgres", "postgres_large", "postgres_enterprise")
POSTGRES_FIELDS = {
    "host": "KICKSIDE_PG_HOST",
    "port": "KICKSIDE_PG_PORT",
    "database": "KICKSIDE_PG_DATABASE",
    "username": "KICKSIDE_PG_USERNAME",
    "password": "KICKSIDE_PG_PASSWORD",
}


def fail(message: str) -> None:
    print(f"runtime profile check failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def mapping(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        fail(f"{label} must be a mapping")
    return value


def main() -> None:
    app_dir = Path(__file__).resolve().parents[1]
    config_path = app_dir / ".wippy.yaml"
    config = mapping(yaml.safe_load(config_path.read_text()), str(config_path))
    variables = mapping(config.get("vars"), "vars")
    profiles = mapping(config.get("profiles"), "profiles")

    env_path = app_dir / "src" / "app" / "env" / "_index.yaml"
    env_index = mapping(yaml.safe_load(env_path.read_text()), str(env_path))
    entries = env_index.get("entries")
    if not isinstance(entries, list):
        fail(f"{env_path}.entries must be a list")
    file_entry = next(
        (entry for entry in entries if isinstance(entry, dict) and entry.get("name") == "file"),
        None,
    )
    file_storage = mapping(file_entry, "app.env:file")
    if file_storage.get("file_path") != "./.wippy/.env":
        fail("app.env:file must persist generated environment state in ./.wippy/.env")

    defaults_entry = next(
        (entry for entry in entries if isinstance(entry, dict) and entry.get("name") == "defaults"),
        None,
    )
    defaults = mapping(defaults_entry, "app.env:defaults")
    default_values = mapping(defaults.get("values"), "app.env:defaults.values")

    if not isinstance(variables.get("postgres_port"), int):
        fail("vars.postgres_port must be an integer")
    if variables.get("postgres_sslmode") != "require":
        fail("vars.postgres_sslmode must default to require")
    for env_name in POSTGRES_FIELDS.values():
        if default_values.get(env_name) != "":
            fail(f"app.env:defaults.{env_name} must be empty so it cannot shadow profile variables")

    for profile_name in POSTGRES_PROFILES:
        profile = mapping(profiles.get(profile_name), f"profiles.{profile_name}")
        overrides = mapping(profile.get("override"), f"profiles.{profile_name}.override")
        if overrides.get("app:db:kind") != "db.sql.postgres":
            fail(f"{profile_name} must select db.sql.postgres")

        for field, env_name in POSTGRES_FIELDS.items():
            variable_name = f"postgres_{field}"
            if overrides.get(f"app:db:{field}") != f"${{{variable_name}}}":
                fail(f"{profile_name} must map vars.{variable_name} to app:db:{field}")
            if overrides.get(f"app:db:{field}_env") != env_name:
                fail(f"{profile_name} must preserve {env_name} environment bindings")
            stale_key = f"app.env:defaults:values.{env_name}"
            if stale_key in overrides:
                fail(f"{profile_name} must not route typed database values through {stale_key}")

        if overrides.get("app:db:options.sslmode") != "${postgres_sslmode}":
            fail(f"{profile_name} must map vars.postgres_sslmode")

    registry = mapping(config.get("registry"), "registry")
    if registry.get("history_type") != "sqlite" or registry.get("history_path") != "./.wippy/registry.db":
        fail("base registry history must preserve the published SQLite store")
    if "postgres_history_dsn" not in variables:
        fail("history must accept the published explicit DSN variable")
    for profile_name in POSTGRES_PROFILES:
        history = mapping(profiles[profile_name].get("registry"), f"profiles.{profile_name}.registry")
        if history.get("history_type") != "postgres":
            fail(f"{profile_name} must select PostgreSQL history")
        if history.get("history_dsn") != "${postgres_history_dsn}":
            fail(f"{profile_name} must preserve the explicit history DSN")
        if history.get("history_schema") != "${postgres_history_schema}":
            fail(f"{profile_name} must map its history schema variable")

    print("runtime profile check passed")


if __name__ == "__main__":
    main()
