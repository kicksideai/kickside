#!/usr/bin/env python3
"""Validate linked Wippy HTTP endpoint route patterns before runtime boot."""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any



@dataclass(frozen=True)
class EndpointDecl:
    id: str
    method: str
    path: str
    source: Path


@dataclass(frozen=True)
class Route:
    endpoint_id: str
    router_id: str
    method: str
    path: str
    source: Path


def registry_json(app_dir: Path, lock_file: Path, wippy: str, *args: str) -> Any:
    command = [wippy, "registry", *args, "--json", "--lock-file", os.path.relpath(lock_file, app_dir)]
    proc = subprocess.run(command, cwd=app_dir, text=True, capture_output=True, check=False)
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr or proc.stdout)
        raise SystemExit(proc.returncode)
    return json.loads(proc.stdout)


def resolved_declarations(
    app_dir: Path, lock_file: Path, wippy: str,
) -> tuple[dict[str, EndpointDecl], dict[str, str], dict[str, str]]:
    entries = registry_json(app_dir, lock_file, wippy, "list", "--kind", "http.endpoint")
    linked: dict[str, str] = {}
    for entry in entries:
        router = (entry.get("meta") or {}).get("router")
        if isinstance(entry.get("id"), str) and isinstance(router, str):
            linked[entry["id"]] = router

    ids = sorted(set(linked) | set(linked.values()))
    def read(entry_id: str) -> Any:
        return registry_json(app_dir, lock_file, wippy, "show", entry_id)

    endpoints: dict[str, EndpointDecl] = {}
    prefixes: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        for entry_id, entry in zip(ids, pool.map(read, ids)):
            data = entry.get("data") or {}
            if entry_id in linked:
                path = data.get("path")
                method = str(data.get("method") or "GET").upper()
                if entry.get("kind") != "http.endpoint" or not isinstance(path, str) or not path:
                    raise ValueError(f"{entry_id} has no endpoint path")
                endpoints[entry_id] = EndpointDecl(entry_id, method, path, lock_file)
            else:
                if entry.get("kind") != "http.router":
                    raise ValueError(f"{entry_id} is not an HTTP router")
                prefix = data.get("prefix", "")
                if not isinstance(prefix, str):
                    raise ValueError(f"{entry_id} has an invalid router prefix")
                prefixes[entry_id] = prefix
    return endpoints, prefixes, linked


def split_route(path: str) -> list[str]:
    return [part for part in path.strip("/").split("/") if part]


def is_param(segment: str) -> bool:
    if segment == "{$}":
        return False
    return (segment.startswith("{") and segment.endswith("}")) or segment.startswith(":")


def patterns_conflict(left: str, right: str) -> bool:
    left_parts = split_route(left)
    right_parts = split_route(right)
    if len(left_parts) != len(right_parts):
        return False
    left_more_specific = False
    right_more_specific = False
    same_shape = True
    for left_part, right_part in zip(left_parts, right_parts):
        if left_part == right_part:
            continue
        left_param = is_param(left_part)
        right_param = is_param(right_part)
        if left_param and right_param:
            continue
        if left_param and not right_param:
            same_shape = False
            right_more_specific = True
            continue
        if right_param and not left_param:
            same_shape = False
            left_more_specific = True
            continue
        return False
    return same_shape or (left_more_specific and right_more_specific)


def join_paths(prefix: str, path: str) -> str:
    joined = "/".join([prefix.strip("/"), path.strip("/")])
    return "/" + joined.strip("/")


def route_methods(method: str) -> set[str]:
    return {method.upper()}


def build_routes(
    declarations: dict[str, EndpointDecl],
    routers: dict[str, str],
    linked: dict[str, str],
) -> tuple[list[Route], list[str]]:
    routes: list[Route] = []
    missing: list[str] = []
    options_by_path: dict[tuple[str, str], Route] = {}

    for endpoint_id, router_id in sorted(linked.items()):
        decl = declarations.get(endpoint_id)
        if not decl:
            missing.append(endpoint_id)
            continue
        prefix = routers.get(router_id, "")
        full_path = join_paths(prefix, decl.path)
        for method in route_methods(decl.method):
            routes.append(Route(endpoint_id, router_id, method, full_path, decl.source))
        if decl.method.upper() != "OPTIONS":
            options_by_path.setdefault(
                (router_id, full_path),
                Route(endpoint_id, router_id, "OPTIONS", full_path, decl.source),
            )
    routes.extend(options_by_path.values())
    return routes, missing


def find_conflicts(routes: list[Route]) -> list[tuple[Route, Route]]:
    conflicts: list[tuple[Route, Route]] = []
    by_router_method: dict[tuple[str, str], list[Route]] = {}
    for route in routes:
        by_router_method.setdefault((route.router_id, route.method), []).append(route)

    for candidates in by_router_method.values():
        for index, left in enumerate(candidates):
            for right in candidates[index + 1 :]:
                if left.endpoint_id == right.endpoint_id:
                    continue
                if patterns_conflict(left.path, right.path):
                    conflicts.append((left, right))
    return conflicts


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-dir", default=".", help="Wippy app directory")
    parser.add_argument("--lock-file", default="wippy.lock", help="lock file path relative to app dir")
    parser.add_argument("--wippy", default=os.environ.get("WIPPY", "wippy"))
    args = parser.parse_args()

    app_dir = Path(args.app_dir).resolve()
    lock_file = (app_dir / args.lock_file).resolve()

    declarations, routers, linked = resolved_declarations(app_dir, lock_file, args.wippy)
    routes, missing = build_routes(declarations, routers, linked)
    conflicts = find_conflicts(routes)

    if missing:
        print("endpoint declarations not found for linked entries:", file=sys.stderr)
        for endpoint_id in missing:
            print(f"  {endpoint_id}", file=sys.stderr)
        return 1

    if conflicts:
        print("route pattern conflicts detected:")
        for left, right in conflicts:
            print(
                f"  {left.method} {left.path}: {left.endpoint_id} "
                f"conflicts with {right.endpoint_id}"
            )
            print(f"    {left.source}")
            print(f"    {right.source}")
        return 1

    print(f"route pattern validation passed ({len(routes)} effective routes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
