#!/usr/bin/env python3
"""Published-app black-box gate for KickSide Workflows and Inbox review."""

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

try:
    from playwright.sync_api import Browser, BrowserContext, Frame, Page, Playwright, sync_playwright
except ImportError:  # pragma: no cover - exercised by the runtime preflight
    sync_playwright = None


class GateFailure(RuntimeError):
    pass


class APIError(GateFailure):
    def __init__(self, method: str, path: str, status: int, payload: Any):
        self.method = method
        self.path = path
        self.status = status
        self.payload = payload
        message = payload.get("error") if isinstance(payload, dict) else str(payload)
        super().__init__(f"{method} {path} returned {status}: {message}")


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


def normalized_page_route(value: str) -> tuple[str, str, str, str]:
    """Compare browser routes without treating a trailing slash as navigation."""
    parsed = urllib.parse.urlsplit(value)
    path = parsed.path.rstrip("/") or "/"
    return parsed.scheme.lower(), parsed.netloc.lower(), path, parsed.query


def settle_frame_layout(frame: Frame) -> None:
    """Let Vue rendering, ResizeObserver, and responsive rail state share one stable layout."""
    frame.evaluate(
        "() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
    )


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def json_bytes(data: bytes) -> Any:
    if not data:
        return {}
    try:
        return json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return {"raw": data.decode("utf-8", errors="replace")[:2000]}


def records(payload: Any, *keys: str) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    if not isinstance(payload, dict):
        return []
    candidates: list[Any] = [payload]
    if isinstance(payload.get("data"), dict):
        candidates.append(payload["data"])
    for candidate in candidates:
        for key in keys:
            rows = candidate.get(key)
            if isinstance(rows, list):
                return [row for row in rows if isinstance(row, dict)]
    return []


def entry_data(raw: dict[str, Any]) -> dict[str, Any]:
    value = dict(raw.get("data") or {}) if isinstance(raw.get("data"), dict) else {}
    value.update(raw)
    return value


class WorkflowGate:
    WORKFLOWS = "kickside/workflows"
    PROFILE_TYPE = "kickside.hub:onboarding_profile"
    AUTOMATION_SURFACE_ID = "kickside.automation:binding_config_view"
    RETIRED_AUTOMATION_TYPE_ID = "kickside.workflows:run_workflow_automation"
    AUTOMATION_TYPE = "kickside.automation"
    REVIEW_BLOCK_ID = "kickside.inbox:block.review"
    RUN_CODE_BLOCK_ID = "kickside.code_execution:block.run_code"
    WORKFLOW_PROFILE_COMPONENTS = (
        "kickside/code-execution",
        "kickside/blocks",
        WORKFLOWS,
    )
    AUTOMATION_PROFILE_COMPONENTS = (
        "kickside/code-execution",
        "kickside/webhooks",
    )

    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.repo = args.repo_root.resolve()
        self.artifacts = args.artifacts.resolve()
        self.artifacts.mkdir(parents=True, exist_ok=True)
        self.snapshots = self.artifacts / "snapshots"
        self.log_path = self.artifacts / "runtime.log"
        self.browser_log_path = self.artifacts / "browser.json"
        # This directory is the gate's output boundary. Reusing it must not append
        # old runtime logs or leave stale screenshots that look like current proof.
        for path in (self.log_path, self.browser_log_path, self.artifacts / "report.json"):
            path.unlink(missing_ok=True)
        for path in self.artifacts.glob("workflow-*.png"):
            path.unlink()
        if self.snapshots.is_symlink() or self.snapshots.is_file():
            self.snapshots.unlink()
        elif self.snapshots.is_dir():
            shutil.rmtree(self.snapshots)
        self.snapshots.mkdir()
        self.work_root = Path(tempfile.mkdtemp(prefix="kickside-workflow-e2e-", dir=args.temp_parent))
        self.app_dir = self.work_root / "app"
        self.app_dir.mkdir()
        self.db_path = self.work_root / "app.db"
        self.port = args.port or free_port()
        self.base_url = args.base_url.rstrip("/") if args.base_url else f"http://127.0.0.1:{self.port}"
        self.attach = bool(args.base_url)
        self.email = args.email or "admin@workflow-e2e.local"
        self.password = args.password or f"Kickside-E2E-{secrets.token_urlsafe(18)}"
        self.encryption_key = secrets.token_hex(32)
        self.secret_values: set[str] = {self.password, self.encryption_key}
        self.wippy = self.resolve_binary(args.wippy_bin)
        self.chrome = self.resolve_binary(args.chrome_bin)
        self.process: subprocess.Popen[str] | None = None
        self.start_count = 0
        self.token: str | None = None
        self.workflow_id = ""
        self.workflow_title = f"E2E approval {int(time.time())}-{secrets.token_hex(3)}"
        self.run_id = ""
        self.binding_id = ""
        self.webhook_id = ""
        self.webhook_secret = ""
        self.webhook_path = ""
        self.decision_id = ""
        self.install_versions: dict[str, str] = {}
        self.browser_diagnostics: list[dict[str, Any]] = []
        self.report = Report(
            self.artifacts / "report.json",
            {
                "mode": "attach" if self.attach else "published",
                "base_url": self.base_url,
                "published_app": None if self.attach else args.published_app,
                "repo_commit": self.git_commit(),
                "wippy_bin": str(self.wippy),
                "wippy_sha256": file_sha256(self.wippy),
                "chrome_bin": str(self.chrome),
            },
        )

    @staticmethod
    def resolve_binary(value: str) -> Path:
        path = Path(value).expanduser()
        if "/" not in value:
            found = shutil.which(value)
            path = Path(found) if found else path
        require(path.is_file(), f"binary not found: {value}")
        return path.resolve()

    def git_commit(self) -> str:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=self.repo, text=True, capture_output=True, check=False
        )
        return result.stdout.strip() if result.returncode == 0 else "unknown"

    def command_env(self) -> dict[str, str]:
        env = os.environ.copy()
        env["ENCRYPTION_KEY"] = self.encryption_key
        env["PUBLIC_API_URL"] = self.base_url
        env["KICKSIDE_USERS_DEFAULT_ADMIN_EMAIL"] = self.email
        env["KICKSIDE_USERS_DEFAULT_ADMIN_PASSWORD"] = self.password
        env["NO_COLOR"] = "1"
        return env

    def redact_artifacts(self) -> None:
        replacements = {secret: "<redacted-secret>" for secret in getattr(self, "secret_values", set())}
        replacements[self.password] = "<redacted-bootstrap-password>"
        replacements[self.encryption_key] = "<redacted-encryption-key>"
        hub_token = os.environ.get(self.args.hub_token_env) or os.environ.get("WIPPY_HUB_TOKEN")
        if hub_token:
            replacements[hub_token] = "<redacted-hub-token>"
        # Plans and execution ledgers can echo dependency parameters. Redact every
        # text artifact the gate owns, not only the runtime/browser logs, so a
        # future profile with a secret parameter cannot leak through a snapshot or
        # a failed-step report.
        text_artifacts = {
            self.log_path,
            self.browser_log_path,
            self.report.path,
            *self.snapshots.glob("*.json"),
        }
        for path in text_artifacts:
            if not path.is_file():
                continue
            text = path.read_text(errors="replace")
            for secret, marker in replacements.items():
                if secret:
                    text = text.replace(secret, marker)
            path.write_text(text)

    def runtime_command(self) -> list[str]:
        return [
            str(self.wippy),
            "run",
            self.args.published_app,
            "-c",
            "--profile",
            "local",
            "--profile",
            "sqlite",
            "--set",
            f"vars.local_port={self.port}",
            "--set",
            f"vars.local_public_api_url={self.base_url}",
            "--set",
            f"vars.local_sqlite_file={self.db_path}",
        ]

    def start(self) -> None:
        if self.attach:
            self.login_api()
            self.configure_hub_token()
            return
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
                self.login_api()
                self.configure_hub_token()
                return
            except (GateFailure, urllib.error.URLError) as exc:
                last_error = str(exc)
                time.sleep(0.3)
        raise GateFailure(f"runtime did not become ready: {last_error}; see {self.log_path}")

    def stop(self) -> None:
        if self.attach:
            self.token = None
            return
        process = self.process
        self.process = None
        self.token = None
        if process is None or process.poll() is not None:
            return
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            process.wait(timeout=1)
            return
        try:
            process.wait(timeout=20)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            process.wait(timeout=10)

    def restart(self) -> None:
        require(not self.attach, "restart persistence requires published mode, not --base-url attach mode")
        self.stop()
        self.start()

    def request(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
        *,
        authenticated: bool = True,
        timeout: float | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"Accept": "application/json"}
        if data is not None:
            headers["Content-Type"] = "application/json"
        if authenticated:
            require(self.token, f"authenticated request attempted before login: {path}")
            headers["Authorization"] = f"Bearer {self.token}"
        if extra_headers:
            headers.update(extra_headers)
        req = urllib.request.Request(self.base_url + path, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=timeout or self.args.request_timeout) as response:
                payload = json_bytes(response.read())
                return payload if isinstance(payload, dict) else {"value": payload}
        except urllib.error.HTTPError as exc:
            raise APIError(method, path, exc.code, json_bytes(exc.read())) from exc

    def login_api(self) -> None:
        payload = self.request(
            "POST",
            "/api/public/user/token",
            {"email": self.email, "password": self.password},
            authenticated=False,
        )
        require(payload.get("success") is not False, f"API login failed: {payload}")
        token = payload.get("token")
        require(isinstance(token, str) and token, "login response did not contain a token")
        self.token = token
        self.secret_values.add(token)
        scope = ((payload.get("security") or {}).get("scope") if isinstance(payload, dict) else None)
        require(scope == "app.security:admin", f"bootstrap user has unexpected scope: {scope!r}")

    def configure_hub_token(self) -> None:
        token = os.environ.get(self.args.hub_token_env) or os.environ.get("WIPPY_HUB_TOKEN")
        if not token:
            return
        self.secret_values.add(token)
        result = self.request("POST", "/api/v1/hub/auth", {"token": token})
        require(result.get("success") is not False, "application rejected the configured Hub token")

    def eventually(self, description: str, predicate: Callable[[], bool], timeout: float = 60.0) -> None:
        deadline = time.monotonic() + timeout
        last_error: Exception | None = None
        while time.monotonic() < deadline:
            try:
                if predicate():
                    return
            except Exception as exc:
                last_error = exc
            time.sleep(0.3)
        suffix = f": {last_error}" if last_error else ""
        raise GateFailure(f"timed out waiting for {description}{suffix}")

    def registry_entries(self, **query: str) -> list[dict[str, Any]]:
        encoded = urllib.parse.urlencode({**query, "limit": "1000"})
        payload = self.request("GET", f"/api/v1/keeper/registry/entries?{encoded}")
        return [entry_data(row) for row in records(payload, "entries", "items")]

    def registry_entry(self, identity: str) -> dict[str, Any]:
        encoded = urllib.parse.urlencode({"id": identity})
        payload = self.request("GET", f"/api/v1/keeper/registry/entry?{encoded}")
        row = payload.get("entry")
        require(isinstance(row, dict), f"registry entry detail is missing for {identity}: {payload}")
        return entry_data(row)

    def profile_packages(self, profile: str) -> list[dict[str, Any]]:
        # The HTTP listener and login become ready before Keeper's initial state
        # projection has necessarily indexed every registry entry. Treat discovery
        # readiness as its own boundary instead of racing the boot reconciler.
        matches: list[dict[str, Any]] = []
        deadline = time.monotonic() + self.args.discovery_timeout
        while time.monotonic() < deadline:
            summaries = self.registry_entries(kind="registry.entry", **{"meta.type": self.PROFILE_TYPE})
            entries = [self.registry_entry(str(row.get("id") or "")) for row in summaries if row.get("id")]
            matches = [row for row in entries if str(row.get("profile") or "") == profile]
            if matches:
                break
            time.sleep(0.3)
        require(len(matches) == 1, f"expected one onboarding profile {profile!r}, found {len(matches)}")
        packages = matches[0].get("packages")
        require(isinstance(packages, list) and packages, f"onboarding profile {profile!r} has no packages")
        return [row for row in packages if isinstance(row, dict)]

    def installed_dependencies(self) -> dict[str, Any]:
        return self.request("GET", "/api/v1/keeper/hub/dependencies?entries=0&migrations=1")

    def root_dependency(self, component: str) -> dict[str, Any] | None:
        payload = self.installed_dependencies()
        return next((row for row in records(payload, "dependencies") if row.get("component") == component), None)

    def dependency_fingerprint(self) -> dict[str, Any]:
        payload = self.installed_dependencies()
        roots = records(payload, "dependencies")
        modules = records(payload, "modules")
        return {
            "roots": sorted(
                (
                    str(row.get("id") or ""),
                    str(row.get("component") or ""),
                    str(row.get("version") or ""),
                    tuple(sorted(
                        (str(migration.get("id") or ""), str(migration.get("status") or ""))
                        for migration in row.get("migrations") or []
                        if isinstance(migration, dict)
                    )),
                )
                for row in roots
            ),
            "modules": sorted(
                (
                    str(row.get("name") or ""),
                    str(row.get("version") or ""),
                    bool(row.get("is_root")),
                    bool(row.get("transitive")),
                    tuple(sorted(str(owner) for owner in row.get("used_by") or [])),
                )
                for row in modules
            ),
        }

    @staticmethod
    def dependency_summary(row: dict[str, Any] | None) -> dict[str, str] | None:
        if not row:
            return None
        # Reports prove ownership and resolution without copying dependency
        # parameters, which may be host-private configuration.
        return {
            "id": str(row.get("id") or ""),
            "component": str(row.get("component") or ""),
            "version": str(row.get("version") or ""),
        }

    @staticmethod
    def assert_execution(result: dict[str, Any], operation: str) -> None:
        ledger = records(result, "execution")
        if not ledger and isinstance(result.get("payload"), dict):
            ledger = records(result["payload"], "execution")
        require(ledger, f"{operation} mutation returned no execution ledger")
        failed = [row for row in ledger if row.get("status") in {"failed", "rollback_failed"}]
        require(not failed, f"{operation} execution contains failures: {failed}")

    def install_package(self, package: dict[str, Any]) -> dict[str, Any]:
        component = str(package.get("component") or "").strip()
        require(component, f"invalid onboarding package: {package}")
        existing = self.root_dependency(component)
        if existing:
            self.install_versions[component] = str(existing.get("version") or "")
            return {"already_installed": True, "component": component, "version": existing.get("version")}
        supplied = [
            {"name": str(row.get("name") or ""), "value": str(row.get("value") or "")}
            for row in package.get("parameters") or []
            if isinstance(row, dict) and row.get("name") and str(row.get("value") or "").strip()
        ]
        plan = self.request(
            "POST",
            "/api/v1/keeper/hub/dependencies/plan",
            {"component": component, "run_migrations": True, "parameters": supplied},
            timeout=self.args.install_timeout,
        )
        unresolved = [
            str(req.get("parameter_name") or req.get("full_id") or req.get("name") or "<unnamed>")
            for req in records(plan, "requirements")
            if req.get("missing") or req.get("invalid")
        ]
        require(not unresolved, f"install plan has unresolved requirements: {', '.join(unresolved)}")
        canonical: dict[str, str] = {row["name"]: row["value"] for row in supplied}
        install_payload = plan.get("install_payload") if isinstance(plan.get("install_payload"), dict) else {}
        for row in install_payload.get("parameters") or []:
            if isinstance(row, dict) and row.get("name") and str(row.get("value") or "").strip():
                canonical[str(row["name"])] = str(row["value"])
        result = self.request(
            "POST",
            "/api/v1/keeper/hub/dependencies/install",
            {
                "component": component,
                "parameters": [{"name": name, "value": value} for name, value in sorted(canonical.items())],
                "migration_policy": "up",
                "run_migrations": True,
            },
            timeout=self.args.install_timeout,
        )
        require(result.get("success") is not False, f"install failed: {result}")
        self.assert_execution(result, "install")
        self.eventually(f"{component} root dependency", lambda: self.root_dependency(component) is not None)
        installed = self.root_dependency(component) or {}
        self.install_versions[component] = str(installed.get("version") or "")
        (self.snapshots / f"install-{component.replace('/', '-')}.json").write_text(
            json.dumps({"plan": plan, "result": result}, indent=2, sort_keys=True) + "\n"
        )
        return result

    def uninstall_package(self, component: str, *, dry_run: bool = False) -> dict[str, Any]:
        row = self.root_dependency(component)
        require(row, f"cannot uninstall missing root: {component}")
        body: dict[str, Any] = {
            "id": row.get("id"),
            "component": component,
            "migration_policy": "down",
        }
        if dry_run:
            body["dry_run"] = True
        result = self.request(
            "POST",
            "/api/v1/keeper/hub/dependencies/uninstall",
            body,
            timeout=self.args.install_timeout,
        )
        require(result.get("success") is not False, f"uninstall failed: {result}")
        if dry_run:
            require(result.get("dry_run") is True, "uninstall preview did not report dry_run")
        else:
            self.assert_execution(result, "uninstall")
            self.eventually(f"removal of {component} root dependency", lambda: self.root_dependency(component) is None)
        suffix = "preview" if dry_run else "result"
        (self.snapshots / f"uninstall-{component.replace('/', '-')}-{suffix}.json").write_text(
            json.dumps(result, indent=2, sort_keys=True) + "\n"
        )
        return result

    def install_workflow_profiles(self) -> list[dict[str, Any]]:
        workflow_packages = self.profile_packages("workflows")
        workflow_components = [str(row.get("component") or "") for row in workflow_packages]
        require(
            workflow_components == list(self.WORKFLOW_PROFILE_COMPONENTS),
            "workflows profile must install Code Execution, Blocks, and Workflows "
            f"in canonical order: {workflow_components}",
        )
        for package in workflow_packages:
            self.install_package(package)
        require(self.root_dependency(self.WORKFLOWS), "Workflows is not a managed root after preset installation")
        require(self.root_dependency("kickside/blocks"), "Blocks is not a managed root after Workflows preset installation")
        code_before_automation = self.root_dependency("kickside/code-execution")
        require(code_before_automation, "Code Execution is not a managed root after Workflows preset installation")
        code_identity = (
            str(code_before_automation.get("id") or ""),
            str(code_before_automation.get("version") or ""),
        )
        self.assert_single_creation_surface()
        self.assert_block_catalog(expect_code_execution=True)

        automation_packages = self.profile_packages("automation")
        automation_components = [str(row.get("component") or "") for row in automation_packages]
        require(
            automation_components == list(self.AUTOMATION_PROFILE_COMPONENTS),
            "automation profile must install only Code Execution and Webhooks "
            f"in canonical order: {automation_components}",
        )
        for package in automation_packages:
            self.install_package(package)
        code_roots_after_automation = [
            row
            for row in records(self.installed_dependencies(), "dependencies")
            if row.get("component") == "kickside/code-execution"
        ]
        require(
            len(code_roots_after_automation) == 1,
            f"Automation preset did not deduplicate the Code Execution root: {code_roots_after_automation}",
        )
        code_after_automation = code_roots_after_automation[0]
        require(
            (
                str(code_after_automation.get("id") or ""),
                str(code_after_automation.get("version") or ""),
            ) == code_identity,
            "Automation preset did not deduplicate the existing Code Execution root: "
            f"before={code_before_automation}, after={code_after_automation}",
        )
        self.assert_block_catalog(expect_code_execution=True)
        return workflow_packages + automation_packages

    @staticmethod
    def entry_identity(row: dict[str, Any]) -> str:
        identity = str(row.get("id") or row.get("entry_id") or "")
        namespace = str(row.get("namespace") or "")
        name = str(row.get("name") or "")
        if not identity and namespace and name:
            identity = f"{namespace}:{name}"
        return identity

    def matching_creation_surfaces(self) -> list[dict[str, Any]]:
        rows = self.registry_entries(kind="registry.entry", **{"meta.type": "view.component"})
        matching = []
        for row in rows:
            meta = row.get("meta") if isinstance(row.get("meta"), dict) else {}
            title = str(meta.get("title") or row.get("title") or "").strip()
            identity = self.entry_identity(row)
            if title == "Connect a Trigger" or identity == self.AUTOMATION_SURFACE_ID:
                matching.append({"id": identity, "title": title, "meta": meta})
        return matching

    def retired_creation_types(self) -> list[dict[str, str]]:
        rows = self.registry_entries(kind="registry.entry", **{"meta.type": self.AUTOMATION_TYPE})
        retired: list[dict[str, str]] = []
        for row in rows:
            meta = row.get("meta") if isinstance(row.get("meta"), dict) else {}
            title = str(meta.get("title") or row.get("title") or "").strip()
            identity = self.entry_identity(row)
            if title == "Run a Workflow" or identity == self.RETIRED_AUTOMATION_TYPE_ID:
                retired.append({"id": identity, "title": title})
        return retired

    def assert_single_creation_surface(self) -> dict[str, Any]:
        matching = self.matching_creation_surfaces()
        require(len(matching) == 1, f"expected exactly one generic trigger binding surface, found {matching}")
        require(matching[0]["id"] == self.AUTOMATION_SURFACE_ID, f"generic binding surface has wrong identity: {matching[0]}")
        require(matching[0]["title"] == "Connect a Trigger", f"generic binding surface has wrong title: {matching[0]}")
        require(not self.retired_creation_types(), f"retired Run a Workflow type is still registered: {self.retired_creation_types()}")
        return matching[0]

    def assert_workflows_lifecycle(self, packages: list[dict[str, Any]]) -> None:
        workflow_packages = [row for row in packages if str(row.get("component") or "") == self.WORKFLOWS]
        require(len(workflow_packages) == 1, f"profiles contain ambiguous Workflows packages: {workflow_packages}")
        code_before = self.root_dependency("kickside/code-execution")
        require(code_before, "code-execution is not an explicit root before Workflows uninstall")
        code_identity = (str(code_before.get("id") or ""), str(code_before.get("version") or ""))

        before_preview = self.dependency_fingerprint()
        self.uninstall_package(self.WORKFLOWS, dry_run=True)
        require(self.dependency_fingerprint() == before_preview, "Workflows uninstall preview changed dependency state")
        require(self.root_dependency(self.WORKFLOWS), "Workflows preview mutated the managed root")
        self.assert_single_creation_surface()

        self.uninstall_package(self.WORKFLOWS)
        self.eventually("generic Automation creation surface persistence", lambda: len(self.matching_creation_surfaces()) == 1)
        self.assert_single_creation_surface()
        code_after = self.root_dependency("kickside/code-execution")
        require(code_after, "Workflows uninstall pruned the explicit code-execution root")
        require(
            (str(code_after.get("id") or ""), str(code_after.get("version") or "")) == code_identity,
            f"Workflows uninstall rewrote the code-execution root: before={code_before}, after={code_after}",
        )

        # Reuse the profile-owned bindings, exactly as onboarding does. This proves
        # the public lifecycle without inventing host choices in the test.
        self.install_package(workflow_packages[0])
        self.eventually("generic Automation creation surface after Workflows reinstall", lambda: len(self.matching_creation_surfaces()) == 1)
        self.assert_single_creation_surface()
        self.assert_block_catalog(expect_code_execution=True)

    def assert_block_catalog(self, *, expect_code_execution: bool) -> dict[str, Any]:
        payload = self.request("GET", "/api/v1/workflows/blocks")
        blocks = records(payload, "blocks", "items")
        block_ids = {str(row.get("id") or "") for row in blocks}
        code_ids = {
            block_id
            for block_id in block_ids
            if block_id.startswith("kickside.code_execution:block.")
        }
        if expect_code_execution:
            require(
                code_ids == {self.RUN_CODE_BLOCK_ID},
                f"Code Execution must expose only the canonical Run Code Block: {sorted(code_ids)}",
            )
            run_code_rows = [row for row in blocks if str(row.get("id") or "") == self.RUN_CODE_BLOCK_ID]
            require(len(run_code_rows) == 1, f"expected one canonical Run Code Block, found {run_code_rows}")
            run_code = run_code_rows[0]
            require(run_code.get("kind") == "block", f"Run Code catalog entry is not a Block: {run_code}")
            require(run_code.get("label") == "Run Code", f"Run Code Block label is wrong: {run_code}")
            require(run_code.get("public") is True, f"Run Code Block is not public: {run_code}")
            require(
                run_code.get("config_wc") == "kickside-code-body",
                f"Run Code Block does not declare its canonical config component: {run_code}",
            )

            run_input = run_code.get("input_schema") if isinstance(run_code.get("input_schema"), dict) else {}
            require(
                run_input.get("type") == "object" and run_input.get("additionalProperties") is True,
                f"Run Code input schema is not the open object contract: {run_input}",
            )
            run_config = run_code.get("config_schema") if isinstance(run_code.get("config_schema"), dict) else {}
            run_config_properties = (
                run_config.get("properties") if isinstance(run_config.get("properties"), dict) else {}
            )
            code_field = run_config_properties.get("code") if isinstance(run_config_properties.get("code"), dict) else {}
            tools_field = (
                run_config_properties.get("tool_ids")
                if isinstance(run_config_properties.get("tool_ids"), dict)
                else {}
            )
            tool_items = tools_field.get("items") if isinstance(tools_field.get("items"), dict) else {}
            require(
                run_config.get("type") == "object" and run_config.get("additionalProperties") is False,
                f"Run Code config schema is not a closed object: {run_config}",
            )
            require(run_config.get("required") == ["code"], f"Run Code source requirement is wrong: {run_config}")
            require(
                {"code", "tool_ids", "method"}.issubset(run_config_properties),
                f"Run Code config schema is incomplete: {run_config}",
            )
            require(
                code_field.get("type") == "string" and code_field.get("format") == "textarea",
                f"Run Code source schema is incomplete: {code_field}",
            )
            require(
                tools_field.get("type") == "array" and tool_items.get("type") == "string",
                f"Run Code tool whitelist schema is incomplete: {tools_field}",
            )

            run_output = run_code.get("output_schema") if isinstance(run_code.get("output_schema"), dict) else {}
            run_output_properties = (
                run_output.get("properties") if isinstance(run_output.get("properties"), dict) else {}
            )
            ok_field = run_output_properties.get("ok") if isinstance(run_output_properties.get("ok"), dict) else {}
            require(
                run_output.get("type") == "object" and run_output.get("additionalProperties") is False,
                f"Run Code output schema is not a closed object: {run_output}",
            )
            require(run_output.get("required") == ["ok"], f"Run Code output requirement is wrong: {run_output}")
            require(
                ok_field.get("type") == "boolean"
                and "result" in run_output_properties
                and isinstance(run_output_properties.get("error"), dict),
                f"Run Code output schema is incomplete: {run_output}",
            )
            run_ports = run_code.get("ports") if isinstance(run_code.get("ports"), list) else []
            require(
                [str(port.get("id") or "") for port in run_ports if isinstance(port, dict)] == ["result", "error"],
                f"Run Code Block ports are wrong: {run_ports}",
            )
        else:
            require(not code_ids, f"Code Execution Blocks leaked into standalone Workflows: {sorted(code_ids)}")
        canonical = [row for row in blocks if str(row.get("id") or "") == self.REVIEW_BLOCK_ID]
        require(len(canonical) == 1, f"expected one public Inbox review Block, found {canonical}")
        row = canonical[0]
        require(str(row.get("kind") or "") == "block", f"Inbox review catalog entry is not a Block: {row}")
        require(str(row.get("label") or "") == "Inbox review", f"Inbox review Block label is wrong: {row}")
        require(row.get("public") is True, f"Inbox review Block is not public: {row}")
        require(row.get("waits") is True, f"Inbox review Block does not advertise durable wait behavior: {row}")

        config_schema = row.get("config_schema") if isinstance(row.get("config_schema"), dict) else {}
        config_properties = (
            config_schema.get("properties") if isinstance(config_schema.get("properties"), dict) else {}
        )
        require(config_schema.get("type") == "object", f"Inbox review config schema is not an object: {row}")
        require("prompt" in (config_schema.get("required") or []), f"Inbox review prompt is not required: {row}")
        require(
            {"prompt", "approve_label", "reject_label", "priority"}.issubset(config_properties),
            f"Inbox review config schema is incomplete: {config_schema}",
        )

        output_schema = row.get("output_schema") if isinstance(row.get("output_schema"), dict) else {}
        output_properties = (
            output_schema.get("properties") if isinstance(output_schema.get("properties"), dict) else {}
        )
        outcome = output_properties.get("outcome") if isinstance(output_properties.get("outcome"), dict) else {}
        require(output_schema.get("type") == "object", f"Inbox review output schema is not an object: {row}")
        require(outcome.get("enum") == ["approve", "reject"], f"Inbox review outcome schema is wrong: {row}")

        ports = row.get("ports") if isinstance(row.get("ports"), list) else []
        port_ids = [str(port.get("id") or "") for port in ports if isinstance(port, dict)]
        require(port_ids == ["then", "else", "failed"], f"Inbox review Block ports are wrong: {ports}")
        return row

    def list_workflows(self) -> list[dict[str, Any]]:
        payload = self.request("GET", "/api/v1/workflows")
        return records(payload, "workflows", "items", "components")

    def workflow_by_title(self) -> dict[str, Any] | None:
        rows = [row for row in self.list_workflows() if str(row.get("title") or row.get("name") or "") == self.workflow_title]
        require(len(rows) <= 1, f"browser create produced duplicate workflows: {rows}")
        return rows[0] if rows else None

    def state(self) -> dict[str, Any]:
        payload = self.request("GET", f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/state")
        state = payload.get("state")
        require(isinstance(state, dict), f"workflow state is missing: {payload}")
        return state

    def assemble_review_graph(self) -> None:
        state = self.state()
        nodes = state.get("nodes")
        rows = list(nodes.values()) if isinstance(nodes, dict) else (nodes if isinstance(nodes, list) else [])
        starts = [row for row in rows if isinstance(row, dict) and row.get("kind") == "start"]
        finishes = [row for row in rows if isinstance(row, dict) and row.get("kind") == "finish"]
        require(len(starts) == 1 and len(finishes) == 1, f"browser-created scaffold is invalid: {rows}")
        start_id = str(starts[0].get("id") or "")
        finish_id = str(finishes[0].get("id") or "")
        review_id = "e2e-inbox-review"
        error_id = "e2e-error"
        commands = [
            {
                "type": "node.add",
                "body": {
                    "id": review_id,
                    "kind": "block",
                    "ref": self.REVIEW_BLOCK_ID,
                    "title": "Inbox review",
                    "config": {
                        "prompt": "Approve the published Workflow E2E run",
                        "approve_label": "Approve",
                        "reject_label": "Reject",
                        "priority": "normal",
                    },
                },
            },
            {"type": "layout.set-position", "body": {"node_id": review_id, "x": 240, "y": 210}},
            {
                "type": "node.add",
                "body": {
                    "id": error_id,
                    "kind": "error",
                    "title": "Error",
                    "config": {
                        "error_schema": {
                            "type": "object",
                            "properties": {"outcome": {"type": "string"}, "form": {"type": "object"}},
                        }
                    },
                },
            },
            {"type": "layout.set-position", "body": {"node_id": error_id, "x": 500, "y": 340}},
            {"type": "edge.add", "body": {"id": "e2e-start-review", "source_id": start_id, "target_id": review_id}},
            {
                "type": "edge.add",
                "body": {
                    "id": "e2e-review-finish",
                    "source_id": review_id,
                    "source_port": "then",
                    "target_id": finish_id,
                },
            },
            {
                "type": "edge.add",
                "body": {
                    "id": "e2e-review-error",
                    "source_id": review_id,
                    "source_port": "else",
                    "target_id": error_id,
                },
            },
        ]
        payload = self.request(
            "POST",
            f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/apply",
            {"commands": commands},
        )
        require(payload.get("success") is not False, f"workflow graph apply failed: {payload}")
        after = self.state()
        after_nodes = after.get("nodes") or {}
        values = list(after_nodes.values()) if isinstance(after_nodes, dict) else list(after_nodes)
        kinds = sorted(str(row.get("kind") or "") for row in values if isinstance(row, dict))
        require(kinds == ["block", "error", "finish", "start"], f"assembled graph has wrong nodes: {kinds}")
        reviews = [
            row for row in values
            if isinstance(row, dict) and str(row.get("id") or "") == review_id
        ]
        require(len(reviews) == 1, f"assembled graph has no unique Inbox review Block node: {values}")
        require(
            reviews[0].get("kind") == "block" and reviews[0].get("ref") == self.REVIEW_BLOCK_ID,
            f"assembled Inbox review node lost its canonical Block identity: {reviews[0]}",
        )
        edges = after.get("edges") or {}
        require(len(edges) == 3, f"assembled graph has wrong edge count: {edges}")
        (self.snapshots / "workflow-state.json").write_text(json.dumps(after, indent=2, sort_keys=True) + "\n")

    def publish(self) -> int:
        payload = self.request("POST", f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/publish", {})
        require(payload.get("success") is not False, f"workflow publish failed: {payload}")
        version = int(payload.get("version") or 0)
        require(version == 1, f"fresh workflow published unexpected version: {payload}")
        self.assert_published_destination_and_binding(version)
        return version

    def assert_published_destination_and_binding(self, version: int) -> None:
        destination_payload = self.request("GET", "/api/v1/automations/destinations")
        require(destination_payload.get("success") is not False, f"destination catalog failed: {destination_payload}")
        destinations = records(destination_payload, "destinations")
        matches = []
        for row in destinations:
            flow_ref = row.get("flow_ref") if isinstance(row.get("flow_ref"), dict) else {}
            if flow_ref.get("id") == self.workflow_id:
                matches.append(row)
        require(len(matches) == 1, f"published Flow is not a unique Automation destination: {matches}")
        destination = matches[0]
        flow_ref = destination.get("flow_ref") if isinstance(destination.get("flow_ref"), dict) else {}
        require(
            flow_ref == {"kind": "flow", "id": self.workflow_id, "version": version},
            f"Automation destination lost the exact published Flow ref: {destination}",
        )
        require(str(destination.get("title") or "") == self.workflow_title, f"destination title drifted: {destination}")
        require(str(destination.get("group") or "") == "Workflows", f"destination group drifted: {destination}")

        trigger_payload = self.request("GET", "/api/v1/automations/triggers")
        require(trigger_payload.get("success") is not False, f"trigger catalog failed: {trigger_payload}")
        webhook_trigger_id = "kickside.webhooks:webhook_received"
        triggers = records(trigger_payload, "triggers")
        webhook_triggers = [row for row in triggers if str(row.get("id") or "") == webhook_trigger_id]
        require(len(webhook_triggers) == 1, f"Webhooks trigger is not uniquely declared: {webhook_triggers}")

        mint = self.request(
            "POST",
            "/api/v1/webhooks",
            {
                "label": f"Workflow E2E {self.workflow_id}",
                "schema": {"type": "object", "additionalProperties": True},
            },
        )
        require(mint.get("success") is not False, f"webhook mint failed: {mint}")
        webhook = mint.get("webhook") if isinstance(mint.get("webhook"), dict) else {}
        if isinstance(webhook.get("secret"), str) and webhook["secret"]:
            self.secret_values.add(webhook["secret"])
            self.webhook_secret = webhook["secret"]
        self.webhook_id = str(webhook.get("webhook_id") or webhook.get("thread_id") or "")
        require(self.webhook_id, f"webhook mint returned no component id: {mint}")
        self.webhook_path = urllib.parse.urlparse(str(webhook.get("url") or "")).path
        if not self.webhook_path:
            self.webhook_path = f"/api/public/hooks/{urllib.parse.quote(self.webhook_id, safe='')}"

        create = self.request(
            "POST",
            "/api/v1/automations/bindings",
            {
                "portable_key": f"workflow-e2e/webhook/{self.workflow_id}",
                "title": f"Webhook to {self.workflow_title}",
                "enabled": True,
                "trigger": {
                    "v": 2,
                    "source": webhook_trigger_id,
                    "config": {"thread_id": self.webhook_id},
                    "backfill": "none",
                },
                "flow_ref": {"kind": "flow", "id": self.workflow_id, "version": version},
                "mapping_spec": {},
            },
        )
        require(create.get("success") is not False, f"Automation binding create failed: {create}")
        binding = create.get("binding") if isinstance(create.get("binding"), dict) else {}
        self.binding_id = str(create.get("id") or binding.get("binding_id") or "")
        require(self.binding_id, f"Automation binding create returned no id: {create}")
        trigger = binding.get("trigger") if isinstance(binding.get("trigger"), dict) else {}
        require(trigger.get("source") == webhook_trigger_id, f"binding lost Webhooks trigger identity: {binding}")
        require((trigger.get("config") or {}).get("thread_id") == self.webhook_id, f"binding lost Webhooks source configuration: {binding}")
        require(binding.get("flow_ref") == flow_ref, f"binding lost destination identity: {binding}")
        require(binding.get("enabled") is True, f"proof binding was not enabled: {binding}")

        installed_payload = self.request("GET", "/api/v1/automations")
        require(installed_payload.get("success") is not False, f"Automation list failed: {installed_payload}")
        installed = records(installed_payload, "automations")
        installed_matches = [row for row in installed if str(row.get("id") or "") == self.binding_id]
        require(len(installed_matches) == 1, f"created binding was not persisted in Automations: {installed_matches}")
        require(
            (installed_matches[0].get("public_state") or {}).get("enabled") is True,
            f"persisted binding summary is not enabled: {installed_matches[0]}",
        )
        config_payload = self.request(
            "GET",
            f"/api/v1/automations/{urllib.parse.quote(self.binding_id, safe='')}/config",
        )
        config = config_payload.get("config") if isinstance(config_payload.get("config"), dict) else {}
        persisted_trigger = config.get("trigger") if isinstance(config.get("trigger"), dict) else {}
        require(persisted_trigger.get("source") == webhook_trigger_id, f"persisted binding lost its trigger: {config_payload}")
        require(config.get("flow_ref") == flow_ref, f"persisted binding lost its Flow ref: {config_payload}")

        (self.snapshots / "automation-destination-binding.json").write_text(
            json.dumps(
                {
                    "destination": destination,
                    "trigger": webhook_triggers[0],
                    "webhook_id": self.webhook_id,
                    "binding": binding,
                    "installed": installed_matches[0],
                    "config": config,
                },
                indent=2,
                sort_keys=True,
            ) + "\n"
        )

    def launch(self) -> None:
        payload = self.request(
            "POST",
            f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/run",
            {"version": 1, "input": {}},
        )
        require(payload.get("success") is not False, f"workflow launch failed: {payload}")
        self.run_id = str(payload.get("run_id") or "")
        require(self.run_id, f"workflow launch returned no run id: {payload}")

    def workflow_runs(self) -> list[dict[str, Any]]:
        payload = self.request(
            "GET",
            f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/runs?limit=200&offset=0",
        )
        require(payload.get("success") is not False, f"workflow run list failed: {payload}")
        return records(payload, "runs")

    def launch_from_webhook(self) -> None:
        require(self.binding_id and self.webhook_id and self.webhook_secret, "webhook binding proof is incomplete")
        baseline = {str(row.get("run_id") or row.get("id") or "") for row in self.workflow_runs()}
        proof_id = f"workflow-e2e-{secrets.token_hex(6)}"
        accepted = self.request(
            "POST",
            self.webhook_path,
            {"proof_id": proof_id},
            authenticated=False,
            extra_headers={"X-Webhook-Secret": self.webhook_secret},
        )
        require(
            accepted.get("success") is not False and accepted.get("accepted") is True,
            f"webhook ingress did not accept the event: {accepted}",
        )

        def launched() -> bool:
            for row in self.workflow_runs():
                run_id = str(row.get("run_id") or row.get("id") or "")
                automation_ref = row.get("automation_ref") if isinstance(row.get("automation_ref"), dict) else {}
                if run_id and run_id not in baseline and automation_ref.get("id") == self.binding_id:
                    self.run_id = run_id
                    return True
            return False

        self.eventually("Webhook-triggered Workflow run", launched, timeout=30)

    def assert_triggered_run_provenance(self) -> None:
        detail = self.run_detail()
        run = detail.get("run") if isinstance(detail.get("run"), dict) else {}
        automation_ref = run.get("automation_ref") if isinstance(run.get("automation_ref"), dict) else {}
        require(automation_ref.get("id") == self.binding_id, f"triggered run lost its Automation binding: {run}")
        require(run.get("trigger_kind") == "binding", f"triggered run has wrong trigger kind: {run}")
        require(
            run.get("trigger_id") == "kickside.webhooks:webhook_received",
            f"triggered run has wrong trigger identity: {run}",
        )

    def run_detail(self) -> dict[str, Any]:
        return self.request(
            "GET",
            f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/runs/{urllib.parse.quote(self.run_id, safe='')}",
        )

    def pending_decision(self) -> dict[str, Any] | None:
        payload = self.request("GET", "/api/v1/inbox?status=pending")
        matches = []
        for row in records(payload, "items"):
            meta = row.get("metadata") if isinstance(row.get("metadata"), dict) else {}
            if meta.get("workflow_id") == self.workflow_id and meta.get("run_id") == self.run_id:
                matches.append(row)
        require(len(matches) <= 1, f"run produced duplicate Inbox decisions: {matches}")
        return matches[0] if matches else None

    def assert_completed_run(self) -> dict[str, Any]:
        detail = self.run_detail()
        run = detail.get("run") if isinstance(detail.get("run"), dict) else {}
        require(run.get("status") == "completed", f"workflow run is not completed: {detail}")
        flow_ref = run.get("flow_ref") if isinstance(run.get("flow_ref"), dict) else {}
        require(
            flow_ref.get("kind") == "flow"
            and flow_ref.get("id") == self.workflow_id
            and int(flow_ref.get("version") or 0) == 1,
            f"run did not pin the published Flow reference: {run}",
        )
        output = run.get("output")
        result = output.get("result") if isinstance(output, dict) else None
        require(isinstance(result, dict) and result.get("outcome") == "approve", f"Finish output lost decision: {output}")
        nodes = records(detail, "nodes")
        by_def = {str(row.get("def_node_id") or ""): row for row in nodes}
        require("e2e-inbox-review" in by_def, f"debug detail omits Inbox review node: {nodes}")
        statuses = {str(row.get("status") or "") for row in nodes}
        require(any("completed" in status.lower() for status in statuses), f"debug detail has no completed nodes: {nodes}")
        timeline = self.request(
            "GET",
            f"/api/v1/workflows/{urllib.parse.quote(self.workflow_id, safe='')}/runs/{urllib.parse.quote(self.run_id, safe='')}/events?limit=200&offset=0",
        )
        inner = timeline.get("timeline") if isinstance(timeline.get("timeline"), dict) else timeline
        events = records(inner, "events")
        require(events, f"completed run has no debug timeline: {timeline}")
        snapshot = {"detail": detail, "timeline": timeline}
        (self.snapshots / "completed-run.json").write_text(json.dumps(snapshot, indent=2, sort_keys=True) + "\n")
        return snapshot

    def assert_restart_persistence(self) -> None:
        row = self.workflow_by_title()
        require(row and str(row.get("id") or row.get("component_id") or "") == self.workflow_id, "workflow vanished after restart")
        require(int(row.get("published_version") or 0) == 1, f"published version vanished after restart: {row}")
        self.assert_completed_run()
        payload = self.request("GET", "/api/v1/inbox?status=resolved")
        resolved = [row for row in records(payload, "items") if str(row.get("id") or "") == self.decision_id]
        require(len(resolved) == 1, f"resolved Inbox decision vanished after restart: {resolved}")
        require(str(resolved[0].get("status") or "") == "approved", f"decision status did not persist: {resolved[0]}")

    def frame_with(self, page: Page, selector: str, timeout: float = 30.0) -> Frame:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            for frame in page.frames:
                try:
                    if frame.locator(selector).count() > 0:
                        return frame
                except Exception:
                    pass
            page.wait_for_timeout(150)
        urls = [frame.url for frame in page.frames]
        raise GateFailure(f"browser did not render {selector}; frames={urls}")

    def browser_login(self, page: Page) -> None:
        page.goto(self.base_url + "/login", wait_until="domcontentloaded")
        page.locator("#email").fill(self.email)
        page.locator("#password").fill(self.password)
        page.locator("#submit-btn").click()
        page.wait_for_url(lambda url: "/login" not in url, timeout=30_000)
        require(page.evaluate("() => !!localStorage.getItem('@wippy_token_info')"), "browser login did not persist host token")

    def browser_create_workflow(self, page: Page) -> None:
        page.goto(self.base_url + "/c/app.views:main/workflows", wait_until="domcontentloaded")
        frame = self.frame_with(page, "kickside-workflow-builder", timeout=60)
        frame.locator("header.kx-head").get_by_role("button", name="New Workflow", exact=True).click()
        dialog = frame.get_by_role("dialog", name="New Workflow", exact=True)
        dialog.wait_for(state="visible", timeout=30_000)
        dialog.get_by_label("Workflow name", exact=True).fill(self.workflow_title)
        dialog.get_by_role("button", name="Create", exact=True).click()
        self.eventually("browser-created workflow", lambda: self.workflow_by_title() is not None, timeout=30)
        row = self.workflow_by_title() or {}
        self.workflow_id = str(row.get("id") or row.get("component_id") or "")
        require(self.workflow_id, f"browser create produced no workflow id: {row}")
        # Creation persists the component first and applies the Start/Finish
        # scaffold second. The list row can therefore appear before the document
        # is ready; wait on the actual graph contract rather than racing it.
        def scaffold_ready() -> bool:
            state = self.state()
            nodes = state.get("nodes")
            values = list(nodes.values()) if isinstance(nodes, dict) else (nodes if isinstance(nodes, list) else [])
            kinds = [str(node.get("kind") or "") for node in values if isinstance(node, dict)]
            return kinds.count("start") == 1 and kinds.count("finish") == 1

        self.eventually("browser-created Start/Finish scaffold", scaffold_ready, timeout=30)

    def assert_palette(self, page: Page) -> None:
        page.goto(
            self.base_url + f"/c/app.views:main/workflows/{urllib.parse.quote(self.workflow_id, safe='')}",
            wait_until="domcontentloaded",
        )
        frame = self.frame_with(page, "kickside-workflow-builder", timeout=60)
        search = frame.get_by_label("Search steps")
        search.wait_for(state="visible", timeout=30_000)
        search.fill("Inbox review")
        button = frame.get_by_role("button", name=re.compile(r"^Inbox review\b"))
        require(button.count() == 1, f"Workflow palette exposes {button.count()} Inbox review entries")
        require(button.is_visible(), "Inbox review is present but not visible in the Workflow palette")
        search.fill("")

    def approve_in_browser(self, page: Page) -> None:
        page.goto(self.base_url + "/c/app.views:main/inbox", wait_until="domcontentloaded")
        frame = self.frame_with(page, "kickside-inbox", timeout=60)
        prompt = "Approve the published Workflow E2E run"
        item = frame.locator("button.kx-item").filter(has=frame.get_by_text(prompt, exact=True))
        item.first.wait_for(state="visible", timeout=30_000)
        count = item.count()
        require(count == 1, f"expected one pending Inbox review item, found {count}")
        item.first.click()
        approve = frame.get_by_role("button", name="Approve", exact=True)
        approve.wait_for(state="visible", timeout=15_000)
        approve.click()

    def diagnostics_for(self, page: Page, label: str) -> dict[str, Any]:
        row: dict[str, Any] = {"label": label, "console_errors": [], "page_errors": [], "failed_responses": []}

        def on_console(message: Any) -> None:
            if message.type == "error":
                location = message.location or {}
                if urllib.parse.urlparse(str(location.get("url") or "")).path == "/favicon.ico":
                    return
                row["console_errors"].append(message.text[:1000])

        def on_page_error(error: Any) -> None:
            row["page_errors"].append(str(error)[:1000])

        def on_response(response: Any) -> None:
            if response.status < 400:
                return
            parsed = urllib.parse.urlparse(response.url)
            if parsed.path == "/favicon.ico":
                return
            row["failed_responses"].append({"status": response.status, "url": parsed.path})

        page.on("console", on_console)
        page.on("pageerror", on_page_error)
        page.on("response", on_response)
        self.browser_diagnostics.append(row)
        return row

    @staticmethod
    def visual_audit(frame: Frame) -> dict[str, Any]:
        return frame.evaluate(
            """
            () => {
              const roots = [document];
              const all = [];
              for (let i = 0; i < roots.length; i++) {
                const root = roots[i];
                for (const el of root.querySelectorAll('*')) {
                  all.push(el);
                  if (el.shadowRoot) roots.push(el.shadowRoot);
                }
              }
              const visible = (el) => {
                const s = getComputedStyle(el), r = el.getBoundingClientRect();
                return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) > 0 && r.width > 0 && r.height > 0;
              };
              const rgba = (value) => {
                const source = String(value || '');
                const rgb = source.match(/rgba?\\(\\s*([\\d.]+)[, ]+([\\d.]+)[, ]+([\\d.]+)(?:\\s*[,/]\\s*([\\d.]+))?/i);
                if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] == null ? 1 : Number(rgb[4])];
                const srgb = source.match(/color\\(srgb\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*\\/\\s*([\\d.]+))?\\)/i);
                return srgb ? [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] == null ? 1 : Number(srgb[4])] : null;
              };
              const luminance = (rgb) => {
                const c = rgb.slice(0, 3).map((v) => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
                return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
              };
              const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
              const parent = (el) => el.parentElement || (el.getRootNode() instanceof ShadowRoot ? el.getRootNode().host : null);
              const background = (el) => {
                let cur = el;
                while (cur) {
                  const raw = getComputedStyle(cur).backgroundColor;
                  const bg = rgba(raw);
                  if (bg && bg[3] >= .95) return { rgb: bg, css: raw };
                  cur = parent(cur);
                }
                const dark = matchMedia('(prefers-color-scheme: dark)').matches;
                return { rgb: dark ? [0, 0, 0, 1] : [255, 255, 255, 1], css: dark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)' };
              };
              const classNames = (el) => {
                const own = (el.getAttribute('class') || '').trim();
                if (own) return own.slice(0, 120);
                let cur = parent(el);
                while (cur) {
                  const c = (cur.getAttribute && cur.getAttribute('class') || '').trim();
                  if (c) return ('^ ' + c).slice(0, 120);
                  cur = parent(cur);
                }
                return '';
              };
              const contrast = [];
              for (const el of all) {
                if (!visible(el)) continue;
                const direct = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent || '').join(' ').trim();
                if (!direct) continue;
                const style = getComputedStyle(el), fg = rgba(style.color);
                if (!fg || fg[3] < .95) continue;
                const size = parseFloat(style.fontSize) || 16, weight = parseInt(style.fontWeight, 10) || 400;
                const threshold = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
                const bg = background(el);
                const value = ratio(fg, bg.rgb);
                if (value + .01 < threshold) {
                  contrast.push({
                    text: direct.slice(0, 100),
                    ratio: Number(value.toFixed(2)),
                    threshold,
                    tag: el.tagName.toLowerCase(),
                    classes: classNames(el),
                    color: style.color,
                    background: bg.css,
                  });
                }
                if (contrast.length >= 30) break;
              }
              const viewport = { width: window.innerWidth, height: window.innerHeight };
              const dialogs = all.filter((el) => visible(el) && el.getAttribute('role') === 'dialog').map((el) => {
                const r = el.getBoundingClientRect();
                return { label: el.getAttribute('aria-label') || '', left: r.left, top: r.top, right: r.right, bottom: r.bottom };
              }).filter((r) => r.left < -2 || r.top < -2 || r.right > viewport.width + 2 || r.bottom > viewport.height + 2);
              const rootsOverflow = roots
                .map((root) => (root instanceof Document ? root.documentElement : root.host))
                .filter((el) => visible(el))
                .map((el) => ({ tag: el.tagName.toLowerCase(), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
                .filter((r) => r.scrollWidth > r.clientWidth + 2);
              return {
                viewport,
                theme: {
                  prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
                  declared: document.documentElement.getAttribute('data-theme') || document.body?.getAttribute('data-theme') || '',
                  foreground: getComputedStyle(document.body || document.documentElement).color,
                  background: getComputedStyle(document.body || document.documentElement).backgroundColor,
                },
                documentOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
                rootsOverflow,
                offscreenDialogs: dialogs,
                contrast,
              };
            }
            """
        )

    def editor_url(self) -> str:
        workflow_id = urllib.parse.quote(self.workflow_id, safe="")
        return self.base_url + f"/c/app.views:main/workflows/{workflow_id}"

    def editor_frame(self, page: Page) -> Frame:
        target = self.editor_url()
        if normalized_page_route(page.url) != normalized_page_route(target):
            page.goto(target, wait_until="domcontentloaded")
        return self.frame_with(page, "kickside-workflow-builder", timeout=60)

    def open_debug_view(self, page: Page) -> Frame:
        frame = self.editor_frame(page)
        past = frame.get_by_role("button", name="Past runs")
        if not past.is_visible():
            frame.get_by_role("button", name="More workflow actions").click()
            frame.get_by_role("menuitem", name="Past runs").click()
        else:
            past.click()
        dialog = frame.get_by_role("dialog", name="Past runs")
        dialog.wait_for(state="visible", timeout=30_000)
        completed = dialog.get_by_role("button", name=re.compile(r"Completed"))
        completed.first.wait_for(state="visible", timeout=30_000)
        require(completed.count() >= 1, "Past runs UI does not show the completed run")
        completed.first.click()
        banner = frame.get_by_text(re.compile(r"Viewing run .* Completed"))
        banner.wait_for(state="visible", timeout=30_000)
        return frame

    def open_catalog_view(self, page: Page) -> Frame:
        page.goto(self.base_url + "/c/app.views:main/workflows", wait_until="domcontentloaded")
        frame = self.frame_with(page, "kickside-workflow-builder", timeout=60)
        frame.get_by_role("table", name="Workflows").wait_for(state="visible", timeout=30_000)
        frame.get_by_text(self.workflow_title, exact=True).wait_for(state="visible", timeout=30_000)
        return frame

    def open_palette_view(self, page: Page) -> Frame:
        frame = self.editor_frame(page)
        toggle = frame.locator('[data-testid="palette-toggle"]')
        require(toggle.count() == 1, "Workflow editor has no palette toggle")
        toggle.wait_for(state="visible", timeout=30_000)
        settle_frame_layout(frame)
        search = frame.get_by_label("Search steps")
        expanded = toggle.get_attribute("aria-expanded") == "true"
        if not expanded:
            require(not search.is_visible(), "Workflow palette is visible while aria-expanded=false")
            toggle.click()
        search.wait_for(state="visible", timeout=30_000)
        settle_frame_layout(frame)
        rendered = search.is_visible()
        expanded = toggle.get_attribute("aria-expanded") == "true"
        require(
            rendered and expanded,
            f"Workflow palette visibility disagrees with aria-expanded: visible={rendered}, expanded={expanded}",
        )
        search.fill("Inbox review")
        choice = frame.get_by_role("button", name=re.compile(r"^Inbox review\b"))
        require(choice.count() == 1 and choice.is_visible(), "Inbox review is not uniquely visible in the palette")
        return frame

    def open_config_view(self, page: Page) -> Frame:
        frame = self.open_palette_view(page)
        frame.get_by_label("Search steps").fill("")
        hide_palette = frame.get_by_role("button", name="Hide steps")
        if hide_palette.count() and hide_palette.is_visible():
            hide_palette.click()
            frame.get_by_label("Search steps").wait_for(state="hidden", timeout=30_000)
            palette_toggle = frame.locator('[data-testid="palette-toggle"]')
            require(palette_toggle.get_attribute("aria-expanded") == "false", "Workflow palette hid without aria-expanded=false")
        node = frame.locator(".vue-flow__node").filter(has_text=re.compile(r"Inbox review"))
        require(node.count() == 1, f"canvas has {node.count()} Inbox review nodes")
        node.click()
        title = frame.get_by_label("Step title")
        if title.count() == 0 or not title.is_visible():
            show = frame.get_by_role("button", name="Show inspector")
            if show.count() and show.is_visible():
                show.click()
        title.wait_for(state="visible", timeout=30_000)
        require(title.input_value() == "Inbox review", "selected node inspector is not the Inbox review configuration")
        return frame

    def capture_visual(
        self,
        page: Page,
        frame: Frame,
        diagnostic: dict[str, Any],
        label: str,
        expected_scheme: str,
    ) -> dict[str, Any]:
        page.evaluate("async () => { if (document.fonts) await document.fonts.ready }")
        frame.evaluate("async () => { if (document.fonts) await document.fonts.ready }")
        page.wait_for_timeout(500)
        screenshot = self.artifacts / f"{label}.png"
        page.screenshot(path=str(screenshot), full_page=False)
        audits = {"host": self.visual_audit(page.main_frame), "module": self.visual_audit(frame)}
        result = {"label": label, "screenshot": screenshot.name, "audit": audits}
        require(not diagnostic["console_errors"], f"{label} console errors: {diagnostic['console_errors']}")
        require(not diagnostic["page_errors"], f"{label} page errors: {diagnostic['page_errors']}")
        require(not diagnostic["failed_responses"], f"{label} failed responses: {diagnostic['failed_responses']}")
        for scope, audit in audits.items():
            require(
                bool(audit["theme"]["prefersDark"]) == (expected_scheme == "dark"),
                f"{label} {scope} did not receive the requested {expected_scheme} color scheme: {audit['theme']}",
            )
            require(not audit["documentOverflow"], f"{label} {scope} overflows the viewport: {audit}")
            require(not audit["rootsOverflow"], f"{label} {scope} has shadow-root overflow: {audit['rootsOverflow']}")
            require(not audit["offscreenDialogs"], f"{label} {scope} has off-screen dialogs: {audit['offscreenDialogs']}")
            require(not audit["contrast"], f"{label} {scope} has contrast failures: {audit['contrast']}")
        return result

    def run_visual_matrix(self, playwright: Playwright) -> list[dict[str, Any]]:
        browser: Browser = playwright.chromium.launch(
            headless=True,
            executable_path=str(self.chrome),
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        results: list[dict[str, Any]] = []
        try:
            for scheme in ("light", "dark"):
                for viewport_name, viewport in (
                    ("desktop", {"width": 1440, "height": 1000}),
                    ("mobile", {"width": 390, "height": 844}),
                ):
                    label = f"workflow-{scheme}-{viewport_name}"
                    context: BrowserContext = browser.new_context(viewport=viewport, color_scheme=scheme)
                    page = context.new_page()
                    diagnostic = self.diagnostics_for(page, label)
                    try:
                        self.browser_login(page)
                        for view_name, opener in (
                            ("catalog", self.open_catalog_view),
                            ("palette", self.open_palette_view),
                            ("config", self.open_config_view),
                            ("run", self.open_debug_view),
                        ):
                            frame = opener(page)
                            capture_label = f"workflow-{view_name}-{scheme}-{viewport_name}"
                            results.append(self.capture_visual(page, frame, diagnostic, capture_label, scheme))
                    finally:
                        context.close()
        finally:
            browser.close()
        return results

    def run_browser_flow(self, playwright: Playwright) -> None:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=str(self.chrome),
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, color_scheme="light")
        page = context.new_page()
        diagnostic = self.diagnostics_for(page, "create-palette-approve")
        try:
            self.browser_login(page)
            # The splash is a once-per-user app concern; mark the declared welcome
            # splash seen so this gate can exercise the installed surface itself.
            self.request("POST", "/api/v1/ui/splash/welcome/seen", {})
            self.browser_create_workflow(page)
            self.assemble_review_graph()
            self.assert_palette(page)
            self.publish()
            self.launch()
            try:
                self.eventually("pending Inbox decision", lambda: self.pending_decision() is not None, timeout=90)
            except GateFailure as exc:
                # A card that never arrives is almost always the run stopping
                # earlier, or a card whose correlation does not match, so the
                # gate reports the run's own state and every pending item. The
                # diagnosis must never replace the failure it explains.
                detail = ""
                with contextlib.suppress(Exception):
                    inbox = self.request("GET", "/api/v1/inbox?status=pending")
                    detail = (
                        f"; run detail: {json.dumps(self.run_detail())[:1200]}"
                        f"; pending inbox: {json.dumps(records(inbox, 'items'))[:1200]}"
                    )
                raise GateFailure(f"{exc}{detail}") from exc
            decision = self.pending_decision() or {}
            self.decision_id = str(decision.get("id") or "")
            require(self.decision_id, f"Inbox decision has no id: {decision}")
            self.approve_in_browser(page)
            self.eventually(
                "completed Workflow after Inbox approval",
                lambda: ((self.run_detail().get("run") or {}).get("status") == "completed"),
                timeout=90,
            )
            self.assert_completed_run()
            self.launch_from_webhook()
            self.eventually("Webhook-triggered Inbox decision", lambda: self.pending_decision() is not None, timeout=90)
            triggered_decision = self.pending_decision() or {}
            self.decision_id = str(triggered_decision.get("id") or "")
            require(self.decision_id, f"Webhook-triggered Inbox decision has no id: {triggered_decision}")
            self.approve_in_browser(page)
            self.eventually(
                "completed Webhook-triggered Workflow",
                lambda: ((self.run_detail().get("run") or {}).get("status") == "completed"),
                timeout=90,
            )
            self.assert_completed_run()
            self.assert_triggered_run_provenance()
            require(not diagnostic["console_errors"], f"browser flow console errors: {diagnostic['console_errors']}")
            require(not diagnostic["page_errors"], f"browser flow page errors: {diagnostic['page_errors']}")
            require(not diagnostic["failed_responses"], f"browser flow failed responses: {diagnostic['failed_responses']}")
        finally:
            # Closing a browser the flow already lost must not replace the
            # failure that lost it.
            with contextlib.suppress(Exception):
                context.close()
            with contextlib.suppress(Exception):
                browser.close()

    def run(self) -> None:
        require(
            sync_playwright is not None,
            "Python Playwright is required. Install it without downloading a browser; "
            "the gate launches the system Chrome executable.",
        )
        try:
            with self.report.step("fresh published application boot and admin login") as step:
                self.start()
                step.detail = {"start_count": self.start_count, "database": "fresh sqlite" if not self.attach else "external"}
            with self.report.step("install Visual Workflows, then deduplicated Automation capabilities through Keeper") as step:
                packages = self.install_workflow_profiles()
                step.detail = {"versions": self.install_versions}
            with self.report.step("preview, uninstall, and reinstall Workflows root") as step:
                self.assert_workflows_lifecycle(packages)
                step.detail = {
                    "workflows": self.dependency_summary(self.root_dependency(self.WORKFLOWS)),
                    "code_execution": self.dependency_summary(self.root_dependency("kickside/code-execution")),
                }
            with self.report.step("generic Automation binding surface and Inbox Block catalog") as step:
                surface = self.assert_single_creation_surface()
                block = self.assert_block_catalog(expect_code_execution=True)
                step.detail = {"creation_surface": surface, "block": block}
            with sync_playwright() as playwright:
                with self.report.step("browser create, palette, publish, run, and Inbox approval") as step:
                    self.run_browser_flow(playwright)
                    step.detail = {
                        "workflow_id": self.workflow_id,
                        "run_id": self.run_id,
                        "binding_id": self.binding_id,
                        "webhook_id": self.webhook_id,
                        "decision_id": self.decision_id,
                    }
                if not self.attach:
                    with self.report.step("runtime restart and durable state proof") as step:
                        self.restart()
                        self.assert_restart_persistence()
                        step.detail = {"start_count": self.start_count, "workflow_id": self.workflow_id, "run_id": self.run_id}
                with self.report.step("light/dark desktop/mobile visual and browser assertions") as step:
                    results = self.run_visual_matrix(playwright)
                    step.detail = {"captures": results}
            self.browser_log_path.write_text(json.dumps(self.browser_diagnostics, indent=2, sort_keys=True) + "\n")
            self.report.status = "passed"
        except Exception:
            self.report.status = "failed"
            raise
        finally:
            self.stop()
            self.report.write()
            self.browser_log_path.write_text(json.dumps(self.browser_diagnostics, indent=2, sort_keys=True) + "\n")
            self.redact_artifacts()
            if not self.args.keep_workdir:
                shutil.rmtree(self.work_root, ignore_errors=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--wippy-bin", default=os.environ.get("WIPPY_BIN", "wippy"))
    parser.add_argument("--chrome-bin", default=os.environ.get("CHROME_BIN", "google-chrome"))
    parser.add_argument("--published-app", default="kickside/kickside")
    parser.add_argument("--base-url", help="attach to an already-running disposable app instead of starting one")
    parser.add_argument("--email", default=os.environ.get("KICKSIDE_E2E_EMAIL"))
    parser.add_argument("--password", default=os.environ.get("KICKSIDE_E2E_PASSWORD"))
    parser.add_argument("--hub-token-env", default="KICKSIDE_E2E_HUB_TOKEN")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--startup-timeout", type=float, default=240.0)
    parser.add_argument("--request-timeout", type=float, default=120.0)
    parser.add_argument("--install-timeout", type=float, default=300.0)
    parser.add_argument("--discovery-timeout", type=float, default=120.0)
    parser.add_argument("--temp-parent", type=Path)
    parser.add_argument("--artifacts", type=Path, default=Path(tempfile.gettempdir()) / "kickside-workflow-e2e-proof")
    parser.add_argument("--keep-workdir", action="store_true")
    args = parser.parse_args()
    if args.base_url:
        require(
            bool(args.email and args.password),
            "--base-url attach mode requires KICKSIDE_E2E_EMAIL/KICKSIDE_E2E_PASSWORD or --email/--password",
        )
    return args


def main() -> int:
    args = parse_args()
    gate = WorkflowGate(args)
    try:
        gate.run()
    except Exception as exc:
        print(f"Workflow E2E gate FAILED: {exc}", file=sys.stderr)
        print(f"artifacts: {gate.artifacts}", file=sys.stderr)
        return 1
    print("Workflow E2E gate PASSED")
    print(f"artifacts: {gate.artifacts}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
