#!/usr/bin/env python3
"""Black-box lifecycle gate for KickSide's Keeper-backed module manager."""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import os
import re
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterator

import yaml


class GateFailure(RuntimeError):
    pass


class APIError(GateFailure):
    def __init__(self, method: str, path: str, status: int, payload: Any):
        self.method = method
        self.path = path
        self.status = status
        self.payload = payload
        code = payload.get("code") if isinstance(payload, dict) else None
        message = payload.get("error") if isinstance(payload, dict) else str(payload)
        super().__init__(f"{method} {path} returned {status} {code or ''}: {message}")


@dataclass
class StepResult:
    name: str
    status: str = "running"
    started_at: float = field(default_factory=time.time)
    elapsed_seconds: float = 0.0
    detail: dict[str, Any] = field(default_factory=dict)
    error: str | None = None


class Report:
    def __init__(self, path: Path, metadata: dict[str, Any]):
        self.path = path
        self.metadata = metadata
        self.steps: list[StepResult] = []
        self.status = "running"
        self.started_at = time.time()

    @contextlib.contextmanager
    def step(self, name: str) -> Iterator[StepResult]:
        row = StepResult(name=name)
        self.steps.append(row)
        print(f"==> {name}", flush=True)
        try:
            yield row
        except Exception as exc:
            row.status = "failed"
            row.error = str(exc)
            raise
        else:
            row.status = "passed"
        finally:
            row.elapsed_seconds = round(time.time() - row.started_at, 3)
            self.write()

    def write(self) -> None:
        payload = {
            "status": self.status,
            "started_at_epoch": self.started_at,
            "elapsed_seconds": round(time.time() - self.started_at, 3),
            "metadata": self.metadata,
            "steps": [asdict(row) for row in self.steps],
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")


def require(condition: Any, message: str) -> None:
    if not condition:
        raise GateFailure(message)


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_json_bytes(data: bytes) -> Any:
    if not data:
        return {}
    try:
        return json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return {"raw": data.decode("utf-8", errors="replace")[:2000]}


def semver_key(value: str) -> tuple[int, int, int, int, str] | None:
    match = re.fullmatch(r"v?(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+.+)?", value.strip())
    if not match:
        return None
    prerelease = match.group(4)
    return (int(match.group(1)), int(match.group(2)), int(match.group(3)), 1 if prerelease is None else 0, prerelease or "")


def parse_parameters(values: list[str]) -> list[dict[str, str]]:
    parameters: list[dict[str, str]] = []
    for raw in values:
        name, separator, value = raw.partition("=")
        name = name.strip()
        value = value.strip()
        require(bool(separator) and bool(name) and bool(value), f"invalid --parameter {raw!r}; use name=value")
        parameters.append({"name": name, "value": value})
    return parameters


class KicksideGate:
    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.repo = args.repo_root.resolve()
        self.wippy = Path(args.wippy_bin).resolve() if "/" in args.wippy_bin else Path(shutil.which(args.wippy_bin) or "")
        require(self.wippy.is_file(), f"wippy binary not found: {args.wippy_bin}")

        self.artifacts = args.artifacts.resolve()
        self.artifacts.mkdir(parents=True, exist_ok=True)
        self.work_root = Path(tempfile.mkdtemp(prefix="kickside-module-lifecycle-", dir=args.temp_parent))
        self.runtime_dir = self.work_root / "runtime"
        self.runtime_dir.mkdir(parents=True)
        self.port = args.port or free_port()
        self.base_url = f"http://127.0.0.1:{self.port}"
        self.email = args.email
        self.password = args.password or f"Kickside-E2E-{secrets.token_urlsafe(18)}"
        self.encryption_key = secrets.token_hex(32)
        self.supplied_parameters = parse_parameters(args.parameter)
        self.onboarding_package_parameters: dict[str, list[dict[str, str]]] | None = None
        self.token: str | None = None
        self.process: subprocess.Popen[str] | None = None
        self.start_count = 0
        self.log_path = self.artifacts / "runtime.log"
        self.snapshot_dir = self.artifacts / "snapshots"
        self.snapshot_dir.mkdir(exist_ok=True)
        self.app_dir: Path
        self.report = Report(
            self.artifacts / "report.json",
            {
                "mode": args.mode,
                "wippy_bin": str(self.wippy),
                "wippy_sha256": sha256(self.wippy),
                "repo_commit": self.git_commit(),
                "cross_root": args.cross_root,
                "cross_root_type": args.cross_root_type,
                "cross_transitive": args.cross_transitive,
                "cross_transitive_type": args.cross_transitive_type,
                "versioned_root": args.versioned_root,
                "versioned_root_type": args.versioned_root_type,
                "versioned_prerequisites": args.versioned_prerequisite,
                "scenario": args.scenario,
                "supplied_parameter_names": [row["name"] for row in self.supplied_parameters],
                "published_app": args.published_app if args.mode == "published" else None,
            },
        )

    def git_commit(self) -> str:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=self.repo, text=True, capture_output=True, check=False
        )
        return result.stdout.strip() if result.returncode == 0 else "unknown"

    def command_env(self) -> dict[str, str]:
        env = os.environ.copy()
        env["ENCRYPTION_KEY"] = self.encryption_key
        env["NO_COLOR"] = "1"
        return env

    def run_command(self, name: str, command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(command, cwd=cwd, env=self.command_env(), text=True, capture_output=True, check=False)
        command_log = self.artifacts / f"command-{name}.log"
        command_log.write_text(
            f"exit_code={result.returncode}\n\nSTDOUT\n{result.stdout}\n\nSTDERR\n{result.stderr}\n"
        )
        if result.returncode != 0:
            raise GateFailure(f"{name} failed with exit {result.returncode}; see {command_log}")
        return result

    def prepare(self) -> None:
        if self.args.mode == "source":
            source = self.repo / "app"
            require((source / "wippy.lock").is_file(), f"source app lock not found under {source}")
            self.app_dir = self.runtime_dir / "app"

            def ignore(_directory: str, names: list[str]) -> set[str]:
                return {name for name in names if name in {".wippy", ".env", "node_modules"}}

            shutil.copytree(source, self.app_dir, ignore=ignore)
            before = sha256(self.app_dir / "wippy.lock")
            self.run_command("fresh-install", [str(self.wippy), "install"], self.app_dir)
            after = sha256(self.app_dir / "wippy.lock")
            require(before == after, "fresh wippy install changed the committed application lock")
            self.assert_lock_unique()
        else:
            self.app_dir = self.runtime_dir / "published"
            self.app_dir.mkdir()

    def runtime_command(self) -> list[str]:
        command = [str(self.wippy), "run"]
        if self.args.mode == "published":
            command.append(self.args.published_app)
        command.extend(
            [
                "-c",
                "--profile",
                "bootstrap_admin",
                "--profile",
                "local",
                "--profile",
                "sqlite",
                "--set",
                f"vars.local_port={self.port}",
                "--set",
                f"vars.local_public_api_url={self.base_url}",
                "--set",
                f"vars.local_sqlite_file={self.work_root / 'app.db'}",
                "--set",
                f"vars.bootstrap_admin_email={self.email}",
                "--set",
                f"vars.bootstrap_admin_password={self.password}",
            ]
        )
        return command

    def start(self) -> None:
        require(self.process is None, "runtime already started")
        self.start_count += 1
        log = self.log_path.open("a")
        log.write(f"\n===== START {self.start_count} =====\n")
        log.flush()
        self.process = subprocess.Popen(
            self.runtime_command(),
            cwd=self.app_dir,
            env=self.command_env(),
            text=True,
            stdout=log,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        log.close()
        deadline = time.monotonic() + self.args.startup_timeout
        last_error = "not ready"
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                raise GateFailure(f"runtime exited during startup with {self.process.returncode}; see {self.log_path}")
            try:
                self.request("GET", "/", authenticated=False)
                self.login()
                self.configure_hub_token()
                return
            except (GateFailure, urllib.error.URLError) as exc:
                last_error = str(exc)
                time.sleep(0.25)
        raise GateFailure(f"runtime did not become ready: {last_error}; see {self.log_path}")

    def stop(self) -> None:
        process = self.process
        self.process = None
        self.token = None
        if process is None or process.poll() is not None:
            return
        os.killpg(process.pid, signal.SIGTERM)
        try:
            process.wait(timeout=15)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=10)

    def restart(self) -> None:
        self.stop()
        self.start()

    def request(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
        *,
        authenticated: bool = True,
    ) -> dict[str, Any]:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"Accept": "application/json"}
        if data is not None:
            headers["Content-Type"] = "application/json"
        if authenticated:
            require(self.token, f"authenticated request attempted before login: {path}")
            headers["Authorization"] = f"Bearer {self.token}"
        request = urllib.request.Request(self.base_url + path, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=self.args.request_timeout) as response:
                payload = read_json_bytes(response.read())
                if isinstance(payload, dict):
                    return payload
                return {"value": payload}
        except urllib.error.HTTPError as exc:
            raise APIError(method, path, exc.code, read_json_bytes(exc.read())) from exc

    def login(self) -> None:
        payload = self.request(
            "POST",
            "/api/public/user/token",
            {"email": self.email, "password": self.password},
            authenticated=False,
        )
        token = payload.get("token")
        require(isinstance(token, str) and token, "login response did not contain a token")
        self.token = token
        scope = ((payload.get("security") or {}).get("scope") if isinstance(payload, dict) else None)
        require(scope == "app.security:admin", f"bootstrap user has unexpected scope: {scope!r}")

    def configure_hub_token(self) -> None:
        token = os.environ.get(self.args.hub_token_env) or os.environ.get("WIPPY_HUB_TOKEN")
        if not token:
            return
        payload = self.request("POST", "/api/v1/hub/auth", {"token": token})
        require(payload.get("success") is not False, "application rejected the configured Hub token")

    def dependencies(self) -> dict[str, Any]:
        return self.request("GET", "/api/v1/keeper/hub/dependencies?entries=0&migrations=1")

    def roots(self, payload: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        return list((payload or self.dependencies()).get("dependencies") or [])

    def inventory(self, payload: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        return list((payload or self.dependencies()).get("modules") or [])

    def root(self, component: str, payload: dict[str, Any] | None = None) -> dict[str, Any] | None:
        for row in self.roots(payload):
            if row.get("component") == component:
                return row
        return None

    def inventory_row(self, component: str, payload: dict[str, Any] | None = None) -> dict[str, Any] | None:
        for row in self.inventory(payload):
            if row.get("name") == component:
                return row
        return None

    def lock_data(self) -> dict[str, Any]:
        path = self.app_dir / "wippy.lock"
        require(path.is_file(), f"runtime did not expose a lock file at {path}")
        value = yaml.safe_load(path.read_text())
        require(isinstance(value, dict), f"invalid lock file: {path}")
        return value

    def assert_lock_unique(self) -> None:
        modules = self.lock_data().get("modules") or []
        names = [row.get("name") for row in modules if isinstance(row, dict)]
        require(len(names) == len(set(names)), f"duplicate modules in wippy.lock: {names}")

    def assert_unique(self) -> None:
        payload = self.dependencies()
        roots = [str(row.get("component")) for row in self.roots(payload)]
        modules = [str(row.get("name")) for row in self.inventory(payload)]
        require(len(roots) == len(set(roots)), f"duplicate root dependencies: {roots}")
        require(len(modules) == len(set(modules)), f"duplicate installed modules: {modules}")
        self.assert_lock_unique()

    def fingerprint(self) -> dict[str, Any]:
        payload = self.dependencies()
        lock_modules = self.lock_data().get("modules") or []
        return {
            "roots": sorted(
                (str(row.get("id")), str(row.get("component")), str(row.get("version")))
                for row in self.roots(payload)
            ),
            "inventory": sorted(
                (
                    str(row.get("name")),
                    str(row.get("version")),
                    bool(row.get("is_root")),
                    tuple(sorted(str(value) for value in (row.get("used_by") or []))),
                )
                for row in self.inventory(payload)
            ),
            "lock": sorted(
                (
                    str(row.get("name")),
                    str(row.get("version")),
                    str(row.get("hash") or ""),
                    bool(row.get("root")),
                )
                for row in lock_modules
                if isinstance(row, dict)
            ),
        }

    def save_snapshot(self, name: str, extra: dict[str, Any] | None = None) -> None:
        payload = {"fingerprint": self.fingerprint()}
        if extra:
            payload["extra"] = extra
        (self.snapshot_dir / f"{name}.json").write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")

    def eventually(self, description: str, predicate: Callable[[], bool], timeout: float = 30.0) -> None:
        deadline = time.monotonic() + timeout
        last_error: Exception | None = None
        while time.monotonic() < deadline:
            try:
                if predicate():
                    return
            except Exception as exc:
                last_error = exc
            time.sleep(0.25)
        suffix = f": {last_error}" if last_error else ""
        raise GateFailure(f"timed out waiting for {description}{suffix}")

    def catalog_item(self, component: str) -> dict[str, Any]:
        # Hub text search tokenizes module names, not the canonical org/name
        # reference. Search by the name and then enforce the full identity so a
        # same-named module from another organization cannot satisfy the gate.
        module_name = component.rsplit("/", 1)[-1]
        query = urllib.parse.urlencode({"q": module_name, "page_size": 100})
        payload = self.request("GET", f"/api/v1/keeper/hub/browse?{query}")
        items = payload.get("items") or payload.get("modules") or []
        for item in items:
            identity = item.get("component") or f"{item.get('org_name') or item.get('org')}/{item.get('name')}"
            if identity == component:
                return item
        raise GateFailure(f"module is not visible in the live Hub catalog: {component}")

    def versions(self, component: str) -> list[str]:
        query = urllib.parse.urlencode({"module": component, "page_size": 100})
        payload = self.request("GET", f"/api/v1/keeper/hub/versions?{query}")
        values: list[str] = []
        for item in payload.get("items") or []:
            value = item.get("version") if isinstance(item, dict) else item
            if isinstance(value, str) and semver_key(value) is not None:
                values.append(value)
        return sorted(set(values), key=lambda value: semver_key(value) or (0, 0, 0, 0, ""))

    def declared_install_parameters(self, component: str) -> list[dict[str, str]]:
        """Return host-owned bindings declared by the live app's onboarding profiles."""
        cached = getattr(self, "onboarding_package_parameters", None)
        if cached is None:
            query = urllib.parse.urlencode({
                "kind": "registry.entry",
                "meta.type": "kickside.hub:onboarding_profile",
                "limit": 100,
            })
            payload = self.request("GET", f"/api/v1/keeper/registry/entries?{query}")
            cached = {}
            for raw_entry in payload.get("entries") or []:
                if not isinstance(raw_entry, dict):
                    continue
                row = dict(raw_entry.get("data") or {})
                row.update(raw_entry)
                for package in row.get("packages") or []:
                    if not isinstance(package, dict):
                        continue
                    package_component = str(package.get("component") or "").strip()
                    if not package_component:
                        continue
                    values = cached.setdefault(package_component, [])
                    known = {str(item.get("name")): str(item.get("value")) for item in values}
                    for parameter in package.get("parameters") or []:
                        if not isinstance(parameter, dict):
                            continue
                        name = str(parameter.get("name") or "").strip()
                        value = str(parameter.get("value") or "").strip()
                        if not name or not value:
                            continue
                        previous = known.get(name)
                        require(
                            previous is None or previous == value,
                            f"onboarding profiles disagree on {name}: {previous!r} versus {value!r}",
                        )
                        if previous is None:
                            values.append({"name": name, "value": value})
                            known[name] = value
            self.onboarding_package_parameters = cached

        selected: dict[str, str] = {}
        for row in cached.get(component, []):
            selected[str(row["name"])] = str(row["value"])

        # A profile root may carry qualified values for mandatory requirements
        # owned by a new transitive module. Reuse those same app declarations if
        # the lifecycle gate later promotes that transitive module to a root.
        namespace = component.replace("/", ".").replace("-", "_")
        prefixes = (namespace + ":", namespace + ".")
        for values in cached.values():
            for row in values:
                name = str(row["name"])
                if name.startswith(prefixes):
                    selected.setdefault(name, str(row["value"]))

        for row in self.supplied_parameters:
            selected[str(row["name"])] = str(row["value"])
        return [{"name": name, "value": value} for name, value in sorted(selected.items())]

    def plan(self, component: str, version: str | None = None) -> tuple[dict[str, Any], list[dict[str, str]]]:
        declared_parameters = self.declared_install_parameters(component)
        body: dict[str, Any] = {
            "component": component,
            "run_migrations": True,
            "parameters": declared_parameters,
        }
        if version:
            body["version"] = version
        plan = self.request("POST", "/api/v1/keeper/hub/dependencies/plan", body)
        values: dict[str, str] = {
            str(row["name"]): str(row["value"])
            for row in declared_parameters
            if row.get("name") and str(row.get("value") or "").strip()
        }
        canonical_parameters = (plan.get("install_payload") or {}).get("parameters") or []
        for row in canonical_parameters:
            if isinstance(row, dict) and row.get("name") and str(row.get("value") or "").strip():
                values[str(row["name"])] = str(row["value"])
        unresolved: list[str] = []
        for req in plan.get("requirements") or []:
            if not isinstance(req, dict) or not (req.get("missing") or req.get("invalid")):
                continue
            key = str(req.get("parameter_name") or req.get("full_id") or req.get("name") or "")
            unresolved.append(key or "<unnamed>")
        require(not unresolved, f"install plan has unresolved requirements: {', '.join(unresolved)}")
        return plan, [{"name": name, "value": value} for name, value in sorted(values.items())]

    def install(
        self,
        component: str,
        *,
        version: str | None = None,
        dependency_id: str | None = None,
        dry_run: bool = False,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        plan, parameters = self.plan(component, version)
        body: dict[str, Any] = {
            "component": component,
            "parameters": parameters,
            "migration_policy": "up",
            "run_migrations": True,
        }
        if version:
            body["version"] = version
        if dependency_id:
            body["id"] = dependency_id
        if dry_run:
            body["dry_run"] = True
        result = self.request("POST", "/api/v1/keeper/hub/dependencies/install", body)
        if not dry_run:
            self.assert_execution(result)
        return result, plan

    def uninstall(self, component: str, *, dry_run: bool = False) -> dict[str, Any]:
        row = self.root(component)
        require(row, f"cannot uninstall missing root: {component}")
        body: dict[str, Any] = {
            "id": row.get("id"),
            "component": component,
            "migration_policy": "down",
        }
        if dry_run:
            body["dry_run"] = True
        result = self.request("POST", "/api/v1/keeper/hub/dependencies/uninstall", body)
        if not dry_run:
            self.assert_execution(result)
        return result

    @staticmethod
    def assert_execution(result: dict[str, Any]) -> None:
        rows = result.get("execution") or ((result.get("payload") or {}).get("execution")) or []
        require(rows, "lifecycle mutation returned no execution ledger")
        failed = [row for row in rows if row.get("status") in {"failed", "rollback_failed"}]
        require(not failed, f"lifecycle execution contains failures: {failed}")

    def catalog_classification(self, component: str) -> str:
        item = self.catalog_item(component)
        actual = item.get("module_type") or item.get("type")
        require(isinstance(actual, str) and actual, f"catalog type is missing for {component}")
        return actual

    def cross_dependency_lifecycle(self, baseline: dict[str, Any]) -> None:
        root = self.args.cross_root
        prerequisite = self.args.cross_transitive
        require(self.root(root) is None and self.root(prerequisite) is None, "cross-dependency fixtures are already roots")

        # Host-owned requirements belong to the package that declares them.
        # Install the prerequisite as its own managed root, exactly as the
        # application-owned onboarding profile does, rather than attempting to
        # inject its parameters through a transitive dependency edge.
        before = self.fingerprint()
        dry_prerequisite, _ = self.install(prerequisite, dry_run=True)
        require(dry_prerequisite.get("dry_run") is True, "prerequisite install preview did not report dry_run")
        require(self.fingerprint() == before, "prerequisite install preview mutated registry or lock state")
        self.install(prerequisite)
        self.eventually(f"{prerequisite} root installation", lambda: self.root(prerequisite) is not None)

        plan, _ = self.plan(root)
        graph = plan.get("graph") or []
        root_node = next((row for row in graph if row.get("module") == root), None)
        prerequisite_node = next((row for row in graph if row.get("module") == prerequisite), None)
        require(root_node and root_node.get("direct") is True, f"plan does not mark {root} as direct")
        require(prerequisite_node, f"plan does not expose required module {prerequisite}")

        before = self.fingerprint()
        dry, _ = self.install(root, dry_run=True)
        require(dry.get("dry_run") is True, "install preview did not report dry_run")
        require(self.fingerprint() == before, "install preview mutated registry or lock state")

        self.install(root)
        self.eventually(f"{root} root installation", lambda: self.root(root) is not None)
        require(self.root(prerequisite), f"prerequisite root disappeared: {prerequisite}")
        self.assert_unique()

        installed = self.root(root)
        require(installed, f"root disappeared after install: {root}")
        self.install(root, version=str(installed.get("version") or "") or None, dependency_id=str(installed.get("id")))
        self.assert_unique()

        self.restart()
        require(self.root(root), f"root did not survive restart: {root}")
        require(self.root(prerequisite), f"prerequisite root did not survive restart: {prerequisite}")

        before_blocked_delete = self.fingerprint()
        try:
            self.uninstall(prerequisite)
        except APIError as exc:
            require(exc.status == 409, f"required root uninstall returned {exc.status}, want 409")
        else:
            raise GateFailure(f"uninstall incorrectly removed {prerequisite} while {root} requires it")
        require(self.fingerprint() == before_blocked_delete, "blocked uninstall changed registry or lock state")

        self.uninstall(root)
        self.eventually(f"removal of {root}", lambda: self.root(root) is None)
        require(self.root(prerequisite), f"explicit prerequisite was pruned with {root}: {prerequisite}")
        self.uninstall(prerequisite)
        self.eventually(f"removal of {prerequisite}", lambda: self.root(prerequisite) is None)
        self.assert_unique()
        require(self.fingerprint() == baseline, "cross-dependency install/uninstall did not restore the baseline")

    def version_lifecycle(self, baseline: dict[str, Any]) -> None:
        component = self.args.versioned_root
        prerequisites = list(dict.fromkeys(self.args.versioned_prerequisite))
        for prerequisite in prerequisites:
            require(self.root(prerequisite) is None, f"version prerequisite is already a root: {prerequisite}")
            self.install(prerequisite)
            self.eventually(f"{prerequisite} version prerequisite installation", lambda p=prerequisite: self.root(p) is not None)
        component_baseline = self.fingerprint()

        values = self.versions(component)
        require(len(values) >= 2, f"need at least two published versions for update coverage: {component}")
        old_version, new_version = values[-2], values[-1]
        committed_lock_digest = sha256(self.app_dir / "wippy.lock")

        self.install(component, version=old_version)
        row = self.root(component)
        require(row and row.get("version") == old_version, f"old version did not install: {row}")
        dependency_id = str(row.get("id"))

        self.install(component, version=new_version, dependency_id=dependency_id)
        row = self.root(component)
        require(row and row.get("version") == new_version, f"update did not reach {new_version}: {row}")

        undo = self.request("POST", "/api/v1/keeper/sync/undo", {})
        require(undo.get("success") is True, f"governance undo failed: {undo}")
        self.eventually(
            "registry undo to previous module version",
            lambda: bool(self.root(component) and self.root(component).get("version") == old_version),
        )
        redo = self.request("POST", "/api/v1/keeper/sync/redo", {})
        require(redo.get("success") is True, f"governance redo failed: {redo}")
        self.eventually(
            "registry redo to updated module version",
            lambda: bool(self.root(component) and self.root(component).get("version") == new_version),
        )

        # Runtime-managed roots are durable registry declarations. The committed
        # application lock is an immutable deployment input and must not be
        # rewritten by live lifecycle operations.
        self.install(component, version=old_version, dependency_id=dependency_id)
        row = self.root(component)
        require(row and row.get("version") == old_version, "module rollback did not restore old version")
        require(sha256(self.app_dir / "wippy.lock") == committed_lock_digest, "module rollback rewrote the application lock")
        self.install(component, version=new_version, dependency_id=dependency_id)
        row = self.root(component)
        require(row and row.get("version") == new_version, "module redo did not restore new version")
        require(sha256(self.app_dir / "wippy.lock") == committed_lock_digest, "module redo rewrote the application lock")

        self.restart()
        require(self.root(component).get("version") == new_version, "updated module did not survive restart")

        before_failure = self.fingerprint()
        impossible = "999999.0.0"
        try:
            self.install(component, version=impossible, dependency_id=dependency_id)
        except APIError:
            pass
        else:
            raise GateFailure("install of a nonexistent version unexpectedly succeeded")
        require(self.fingerprint() == before_failure, "failed update changed registry or lock state")

        preview = self.uninstall(component, dry_run=True)
        require(preview.get("dry_run") is True, "uninstall preview did not report dry_run")
        require(self.fingerprint() == before_failure, "uninstall preview mutated registry or lock state")
        self.uninstall(component)
        self.eventually(f"removal of {component}", lambda: self.root(component) is None)
        self.assert_unique()
        require(self.fingerprint() == component_baseline, "update/rollback/delete lifecycle changed its explicit prerequisites")
        for prerequisite in reversed(prerequisites):
            self.uninstall(prerequisite)
            self.eventually(f"removal of {prerequisite} version prerequisite", lambda p=prerequisite: self.root(p) is None)
        require(self.fingerprint() == baseline, "version lifecycle did not restore the original baseline")

    def run(self) -> None:
        try:
            with self.report.step("fresh install from application lock"):
                self.prepare()
            with self.report.step("cold boot and admin login"):
                self.start()
                self.assert_unique()
            with self.report.step("catalog discovery") as step:
                classifications: dict[str, str] = {}
                if self.args.scenario in {"all", "cross"}:
                    classifications[self.args.cross_root] = self.catalog_classification(self.args.cross_root)
                    classifications[self.args.cross_transitive] = self.catalog_classification(self.args.cross_transitive)
                if self.args.scenario in {"all", "version"}:
                    classifications[self.args.versioned_root] = self.catalog_classification(self.args.versioned_root)
                step.detail = {"module_types": classifications}
            baseline = self.fingerprint()
            self.save_snapshot("baseline")
            if self.args.scenario in {"all", "cross"}:
                with self.report.step("composed dependency install, blocked delete, and cleanup"):
                    self.cross_dependency_lifecycle(baseline)
                    self.save_snapshot("cross-dependency-clean")
            if self.args.scenario in {"all", "version"}:
                with self.report.step("version update, governance undo-redo, module rollback-redo, and delete"):
                    self.version_lifecycle(baseline)
                    self.save_snapshot("version-lifecycle-clean")
            with self.report.step("final restart and baseline recovery"):
                self.restart()
                self.assert_unique()
                require(self.fingerprint() == baseline, "final restart did not recover exact baseline state")
                self.save_snapshot("final")
            self.report.status = "passed"
        except Exception:
            self.report.status = "failed"
            raise
        finally:
            self.stop()
            self.report.write()
            if not self.args.keep_workdir:
                shutil.rmtree(self.work_root, ignore_errors=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--wippy-bin", default=os.environ.get("WIPPY_BIN", "wippy"))
    parser.add_argument("--mode", choices=("source", "published"), default="source")
    parser.add_argument("--published-app", default="kickside/kickside")
    parser.add_argument("--cross-root", default="kickside/kb10")
    parser.add_argument("--cross-root-type", default="library")
    parser.add_argument("--cross-transitive", default="kickside/knowledge")
    parser.add_argument("--cross-transitive-type", default="library")
    parser.add_argument("--versioned-root", default="kickside/workflows")
    parser.add_argument("--versioned-root-type", default="library")
    parser.add_argument(
        "--versioned-prerequisite",
        action="append",
        default=["kickside/code-execution"],
        help="explicit app-owned prerequisite installed before the versioned root (repeatable)",
    )
    parser.add_argument("--scenario", choices=("all", "cross", "version"), default="all")
    parser.add_argument(
        "--parameter",
        action="append",
        default=[],
        help="explicit dependency parameter name=value; intended for diagnosing stale published packages",
    )
    parser.add_argument("--email", default="admin@module-e2e.local")
    parser.add_argument("--password")
    parser.add_argument("--hub-token-env", default="KICKSIDE_E2E_HUB_TOKEN")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--startup-timeout", type=float, default=180.0)
    parser.add_argument("--request-timeout", type=float, default=120.0)
    parser.add_argument("--temp-parent", type=Path)
    parser.add_argument("--artifacts", type=Path, default=Path(tempfile.gettempdir()) / "kickside-module-lifecycle-artifacts")
    parser.add_argument("--keep-workdir", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    gate = KicksideGate(args)
    try:
        gate.run()
    except Exception as exc:
        print(f"module lifecycle gate FAILED: {exc}", file=sys.stderr)
        print(f"artifacts: {gate.artifacts}", file=sys.stderr)
        return 1
    print("module lifecycle gate PASSED")
    print(f"artifacts: {gate.artifacts}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
