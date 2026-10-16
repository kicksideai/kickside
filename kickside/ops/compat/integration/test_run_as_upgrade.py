"""Published Users and Automation installations retain human-run state after Hub updates."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import uuid
import copy
from contextlib import contextmanager

import yaml

from ops.compat.fetch_baselines import Hub
from ops.compat.inventory import ROOT, discover
from ops.compat.migrations import command


BASELINE_MODULES = (
    "kickside/users",
    "kickside/automation",
    "kickside/execution",
)


def remove_test_entries(source, roots=None):
    """Keep host resources and the declared dependencies of a focused proof."""
    documents = {}
    entries = {}
    for index in source.rglob("*.yaml"):
        document = yaml.safe_load(index.read_text())
        if not isinstance(document, dict) or not isinstance(document.get("entries"), list):
            continue
        documents[index] = document
        for entry in document["entries"]:
            identity = document.get("namespace", "") + ":" + entry["name"]
            if identity in entries:
                raise ValueError("Duplicate focused harness entry: " + identity)
            entries[identity] = entry

    def test_entry(entry):
        return entry.get("kind") == "function.lua" and (
            (entry.get("meta") or {}).get("type") == "test"
            or entry["name"].endswith("_test")
            or str(entry.get("source", "")).endswith("_test.lua"))

    def fixture(entry):
        return (entry.get("meta") or {}).get("test_fixture") is True

    if roots is None:
        selected = {identity for identity, entry in entries.items()
                    if not test_entry(entry) and not fixture(entry)}
    else:
        selected = set()
        def references(value):
            if isinstance(value, str):
                yield value
            elif isinstance(value, dict):
                for item in value.values():
                    yield from references(item)
            elif isinstance(value, (list, tuple)):
                for item in value:
                    yield from references(item)

        pending = list(references(roots))
        pending.extend(identity for identity, entry in entries.items()
                       if not test_entry(entry) and not fixture(entry)
                       and (entry.get("kind", "").split(".")[0] not in ("function", "library")
                            or (entry.get("lifecycle") or {}).get("auto_start") is True))
        while pending:
            identity = pending.pop()
            if identity not in entries or identity in selected:
                continue
            entry = entries[identity]
            if test_entry(entry):
                raise ValueError("Focused proof depends on another test suite: " + identity)
            selected.add(identity)
            pending.extend(references(entry))

    for index, document in documents.items():
        namespace = document.get("namespace", "")
        document["entries"] = [entry for entry in document["entries"]
                               if namespace + ":" + entry["name"] in selected]
        index.write_text(yaml.safe_dump(document, sort_keys=False))


def write_published_entries(work, entries):
    """Materialize a Hub archive without erasing migration entry metadata."""
    grouped = {}
    for identity, row in sorted(entries.items()):
        namespace, name = identity.split(":", 1)
        data = copy.deepcopy(row.get("Data") or {})
        source = data.get("source")
        if source:
            filename = identity.replace(":", "__").replace("/", "_") + ".lua"
            (work / filename).write_text(source)
            data["source"] = "file://" + filename
        grouped.setdefault(namespace, []).append({
            "name": name, "kind": row["Kind"], "meta": copy.deepcopy(row.get("Meta") or {}), **data,
        })
    for number, (namespace, rows) in enumerate(sorted(grouped.items())):
        (work / f"entries-{number}.yaml").write_text(yaml.safe_dump({
            "version": "1.0", "namespace": namespace, "entries": rows,
        }, sort_keys=False))


def materialize_published_modules(work, modules):
    published = work / "published"
    published.mkdir()
    downloads = work / "downloads"
    downloads.mkdir()
    hub = Hub()
    baselines = {}
    for module in modules:
        archive = hub.fetch(module, downloads)
        baselines[module] = {key: archive[key] for key in ("version", "sha256")}
        package = published / module.replace("/", "_")
        (package / "src").mkdir(parents=True)
        (package / "wippy.yaml").write_text(yaml.safe_dump({
            "organization": module.split("/")[0], "module": module.split("/")[1], "type": "plugin",
            "directories": {"src": "src"},
        }, sort_keys=False))
        entries = dict(archive["entries"])
        for entry_id, entry in archive["entries"].items():
            if entry["Kind"] == "fs.embed":
                entries[entry_id] = {
                    "Kind": "fs.directory", "Meta": entry.get("Meta", {}),
                    "Data": {"directory": str(work / "native-embedded" / entry_id.replace(":", "_")),
                             "auto_init": True},
                }
        write_published_entries(package / "src", entries)

    (work / "published-baselines.json").write_text(json.dumps(baselines, indent=2) + "\n")
    return {module: str(published / module.replace("/", "_")) for module in modules}


def attach_http_readiness(source, index, suite):
    index["entries"].append({
        "name": "http_readiness",
        "kind": "library.lua",
        "source": "file://http_readiness.lua",
        "modules": ["system", "time"],
    })
    suite["imports"]["readiness"] = "app:http_readiness"
    shutil.copy(ROOT / "ops/compat/integration/http_readiness.lua", source / "http_readiness.lua")


def make_runtime(work, harness, config_source, suite, suite_name, imports, entries, *, depends_on=()):
    runtime = work / suite_name
    source = runtime / "src"
    module_sources = []
    for module in discover([ROOT, ROOT.parent / "components"]).values():
        manifest = yaml.safe_load((module['directory'] / 'wippy.yaml').read_text())
        module_sources.append((module['directory'] / manifest.get('directories', {}).get('src', 'src')).resolve())

    harness_config = yaml.safe_load((ROOT / config_source / ".wippy.yaml").read_text())
    source.mkdir(parents=True)
    harness_root = (ROOT / harness).resolve()
    repository = Path(subprocess.check_output(['git', '-C', str(harness_root), 'rev-parse', '--show-toplevel'], text=True).strip())
    tracked = subprocess.check_output(['git', '-C', str(repository), 'ls-files', '-z', '--', str(harness_root)])
    for relative in tracked.decode().split('\0'):
        if not relative:
            continue
        original = repository / relative
        # Directory mounts load the current module beside its published baseline;
        # individual file links are harness fixtures and need materializing.
        if original.is_symlink() and original.is_dir() and any(
                original.resolve().is_relative_to(root) for root in module_sources):
            continue
        target = source / original.relative_to(harness_root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(original, target)
    remove_test_entries(source, roots=[imports, depends_on, harness_config.get("override", {}), harness_config.get("vars", {})])
    index = yaml.safe_load((source / "_index.yaml").read_text())
    index["entries"].append({
        "name": "compat_plan",
        "kind": "library.lua",
        "source": "file://compat_plan.lua",
        "modules": ["json"],
    })
    suite_imports = {"test": "wippy.test:test", "plan": "app:compat_plan", **imports}
    suite_entry = {
        "name": "run_as_upgrade",
        "kind": "function.lua",
        "source": "file://run_as_upgrade.lua",
        "method": "run",
        "meta": {"type": "test", "suite": "run_as_upgrade", "timeout": "300s", "depends_on": list(depends_on)},
        "modules": entries,
        "imports": suite_imports,
    }
    attach_http_readiness(source, index, suite_entry)
    index["entries"].append(suite_entry)
    (source / "_index.yaml").write_text(yaml.safe_dump(index, sort_keys=False))
    shutil.copy(ROOT / "ops/compat/integration" / suite, source / "run_as_upgrade.lua")
    (source / "compat_plan.lua").write_text("return {}\n")
    (runtime / "wippy.yaml").write_text(yaml.safe_dump({
        "organization": "kickside", "module": suite_name, "type": "application",
        "directories": {"src": "src", "modules": ".wippy"},
    }, sort_keys=False))
    return runtime, source, {
        "override": harness_config.get("override", {}),
        "vars": harness_config.get("vars", {}),
    }


def runtime_config(replacements, overrides, harness_config):
    merged_overrides = dict(harness_config["override"])
    merged_overrides.update(overrides)
    return {
        "version": "1.0", "workspace": {"replacements": replacements},
        "registry": {"enable_history": True, "history_type": "memory", "dispatch_internal_kinds": [
            "registry.entry", "ns.requirement", "ns.dependency", "ns.definition", "security.scope",
        ]},
        "override": merged_overrides,
        "vars": harness_config["vars"],
    }


@contextmanager
def evidence_directory(lane_tmp):
    with tempfile.TemporaryDirectory(prefix="run-as-upgrade-", dir=lane_tmp) as directory:
        try:
            yield directory
        finally:
            destination = lane_tmp / (Path(directory).name + "-evidence")
            destination.mkdir()
            for log in list(Path(directory).glob("*.log")) + list(Path(directory).glob("*.json")):
                shutil.copy2(log, destination / log.name)


class RunAsUpgradeTests(unittest.TestCase):
    def test_published_human_sessions_and_automations_survive_update_restart_on_both_engines(self):
        lane_tmp = Path(os.environ["TMPDIR"])
        with evidence_directory(lane_tmp) as directory:
            work = Path(directory)
            published = materialize_published_modules(work, BASELINE_MODULES)

            users_runtime, users_source, users_harness = make_runtime(
                work, Path("platform/users/test"), Path("platform/users/test"), "run_as_users_upgrade.lua", "run-as-users-upgrade",
                {"session": "kickside.users:session", "session_index": "kickside.users.persist:session_index",
                 "user_repo": "kickside.users.persist:user_repo",
                 "user_groups_repo": "kickside.users.persist:user_groups_repo", "migration_runner": "wippy.migration:runner"},
                ["sql", "json", "security", "time", "channel"],
            )
            users_index = yaml.safe_load((users_source / "_index.yaml").read_text())
            users_index["entries"].append({"name": "compat_admin", "kind": "security.policy",
                "groups": ["app.security:admin"],
                "policy": {"actions": "*", "resources": "*", "effect": "allow"}})
            (users_source / "_index.yaml").write_text(yaml.safe_dump(users_index, sort_keys=False))
            automation_runtime, automation_source, automation_harness = make_runtime(
                work, Path("platform/automation/test/src"), Path("platform/automation/test"), "run_as_automation_upgrade.lua", "run-as-automation-upgrade",
                {"round_harness": "kickside.automation:round_harness", "drive": "kickside.automation:drive",
                 "slot": "kickside.automation:slot", "round_write": "kickside.automation:round_write"},
                ["sql", "json", "time", "contract", "security"],
            )
            runtimes = (("users", users_runtime, users_source, users_harness),
                        ("automation", automation_runtime, automation_source, automation_harness))
            current = {name: str(module["directory"]) for name, module in discover([ROOT]).items()}
            baseline = dict(published)
            env = dict(os.environ, ENCRYPTION_KEY="12" * 32, KICKSIDE_USERS_ADMIN_INIT_ENABLED="false",
                       PGHOST="127.0.0.1", PGPORT="5433", PGUSER="kickside", PGPASSWORD="kickside")
            for label, runtime, source, harness in runtimes:
                (runtime / ".wippy.yaml").write_text(yaml.safe_dump(runtime_config(baseline, {
                    "kickside.core.jobs.service:worker.service:lifecycle.auto_start": False,
                    "kickside.core.retention.service:sweeper.service:lifecycle.auto_start": False,
                }, harness), sort_keys=False))
                command(["wippy", "init", "--src-dir", "src", "--modules-dir", ".wippy"], runtime, work / (label + "-init.log"), env)
                command(["wippy", "update"], runtime, work / (label + "-initial-update.log"), env)

            for engine in ("sqlite", "postgres"):
                with self.subTest(engine=engine):
                    database = "identitydef_compat_ra_" + uuid.uuid4().hex[:20]
                    for label, runtime, source, harness in runtimes:
                        overrides = {"app:db:file": str(runtime / (engine + ".sqlite"))}
                        if engine == "postgres":
                            overrides.update({"app:db:kind": "db.sql.postgres", "app:db:host": env["PGHOST"],
                                "app:db:port": int(env["PGPORT"]), "app:db:database": database + "_" + label,
                                "app:db:username": env["PGUSER"], "app:db:password": env["PGPASSWORD"],
                                "app:db:options.sslmode": "disable"})
                            command(["createdb", database + "_" + label], runtime, work / (label + "-createdb.log"), env)
                        try:
                            for phase in ("baseline", "update", "restart"):
                                replacements = baseline if phase == "baseline" else current
                                (runtime / ".wippy.yaml").write_text(yaml.safe_dump(runtime_config(replacements, overrides, harness), sort_keys=False))
                                (source / "compat_plan.lua").write_text(
                                    "return require('json').decode([=[" + json.dumps({"phase": phase}) + "]=])\n")
                                command(["wippy", "update"], runtime, work / (label + "-" + engine + "-" + phase + "-update.log"), env)
                                output = work / (label + "-" + engine + "-" + phase + ".log")
                                command(["wippy", "test"], runtime, output, env)
                                result = output.read_text()
                                self.assertIn("PASSED", result, result[-5000:])
                                self.assertNotIn("FAILED", result, result[-5000:])
                        finally:
                            if engine == "postgres":
                                command(["dropdb", "--force", database + "_" + label], runtime, work / (label + "-dropdb.log"), env)
