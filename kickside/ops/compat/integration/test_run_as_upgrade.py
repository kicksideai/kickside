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
import hashlib

import yaml

from ops.compat.fetch_baselines import Hub
from ops.compat.inventory import ROOT, discover, source_roots
from ops.compat.migrations import command


BASELINE_MODULES = (
    "kickside/users",
    "kickside/automation",
    "kickside/execution",
)

SOURCE_ENTRY_FILE_CACHE = {}


def module_source_roots():
    return source_roots()


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


def source_entry_files(modules):
    """Index source files by their declared entry identity."""
    cache_key = tuple(sorted((identity, str(Path(root).resolve()))
                             for identity, root in modules.items()))
    cached = SOURCE_ENTRY_FILE_CACHE.get(cache_key)
    if cached is not None:
        return cached
    entries = {}
    for identity, root in modules.items():
        for index in root.rglob('*.yaml'):
            document = yaml.safe_load(index.read_text()) or {}
            if not isinstance(document, dict) or not isinstance(document.get('namespace'), str):
                continue
            for entry in document.get('entries', []):
                if not isinstance(entry, dict) or not isinstance(entry.get('name'), str):
                    continue
                location = entry.get('source')
                if isinstance(location, str) and location.startswith('file://'):
                    candidate = (index.parent / location[7:]).resolve()
                    if candidate.is_file():
                        entries[candidate] = document['namespace'] + ':' + entry['name']
    SOURCE_ENTRY_FILE_CACHE[cache_key] = entries
    return entries


def materialize_published_entry_files(work):
    """Index source files from the exact published baselines under test."""
    entries = {}
    for index in (work / 'published').rglob('*.yaml'):
        document = yaml.safe_load(index.read_text()) or {}
        if not isinstance(document, dict) or not isinstance(document.get('namespace'), str):
            continue
        for entry in document.get('entries', []):
            if not isinstance(entry, dict) or not isinstance(entry.get('name'), str):
                continue
            location = entry.get('source')
            candidate = index.parent / location[7:] if isinstance(location, str) and location.startswith('file://') else None
            if candidate and candidate.is_file():
                entries[document['namespace'] + ':' + entry['name']] = candidate
    return entries


def materialize_published_linked_file_sources(work, source, harness_root, current_entries):
    """Use a published source file for an explicit fixture seam.

    Compatibility hosts must not retain a directory link to current module
    source.  Some test-only fixtures intentionally reference one production
    file through such a link, though.  The source must be the matching entry
    from the exact published baseline, never the current module file.
    """
    published_entries = materialize_published_entry_files(work)
    materialized = source / '.compat-sources'
    for index in source.rglob('*.yaml'):
        document = yaml.safe_load(index.read_text()) or {}
        if not isinstance(document, dict):
            continue
        changed = False
        for entry in document.get('entries', []):
            if not isinstance(entry, dict):
                continue
            location = entry.get('source')
            if not isinstance(location, str) or not location.startswith('file://'):
                continue
            relative = location[7:]
            copied = index.parent / relative
            if copied.is_file():
                continue
            original_index = harness_root / index.relative_to(source)
            original = (original_index.parent / relative).resolve()
            identity = current_entries.get(original)
            published = published_entries.get(identity)
            if published is None:
                continue
            digest = hashlib.sha256(identity.encode()).hexdigest()[:16]
            target = materialized / (digest + '-' + published.name)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(published, target)
            entry['source'] = 'file://' + os.path.relpath(target, index.parent)
            changed = True
        if changed:
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


def source_harness_path(relative, modules):
    """Resolve a private-suite harness into the corresponding current module.

    A source cohort maps modules individually, whereas compatibility harnesses
    use repository-relative paths (for example ``platform/mcp/test/...``).
    Match the longest module-directory suffix to retain the source-owned
    harness without guessing from the private checkout placeholders.
    """
    parts = Path(relative).parts
    matches = []
    for module in modules.values():
        directory = Path(module['directory']).resolve()
        for width in range(min(len(parts), len(directory.parts)), 0, -1):
            if directory.parts[-width:] == parts[:width]:
                candidate = directory / Path(*parts[width:])
                if candidate.exists():
                    matches.append((width, candidate))
                break
    if matches:
        return max(matches, key=lambda row: row[0])[1]
    return (ROOT / relative).resolve()


def tracked_harness_files(harness_root, module_sources):
    """Yield tracked harness files, or verified cohort files without Git data."""
    try:
        repository = Path(subprocess.check_output(
            ['git', '-C', str(harness_root), 'rev-parse', '--show-toplevel'], text=True).strip())
        tracked = subprocess.check_output(['git', '-C', str(repository), 'ls-files', '-z', '--', str(harness_root)])
        originals = (repository / relative for relative in tracked.decode().split('\0') if relative)
    except subprocess.CalledProcessError:
        # Immutable source cohorts deliberately have no .git metadata.  Their
        # contents were verified before mounting, so every regular file and
        # link beneath the resolved harness is source-owned.
        originals = (path for path in harness_root.rglob('*') if path.is_file() or path.is_symlink())
    for original in originals:
        if original.is_symlink() and original.is_dir() and any(
                original.resolve().is_relative_to(root) for root in module_sources.values()):
            continue
        yield original


def make_runtime(work, harness, config_source, suite, suite_name, imports, entries, *, depends_on=()):
    runtime = work / suite_name
    source = runtime / "src"
    module_sources = {}
    modules = discover(module_source_roots())
    for identity, module in modules.items():
        manifest = yaml.safe_load((module['directory'] / 'wippy.yaml').read_text())
        module_sources[identity] = (module['directory'] / manifest.get('directories', {}).get('src', 'src')).resolve()

    config_path = source_harness_path(config_source, modules) / ".wippy.yaml"
    # Test harnesses used to carry a local .wippy.yaml.  Current module
    # checkouts intentionally do not: their runtime defaults belong to the
    # generated proof.  Retain explicit legacy configuration when present,
    # but do not invent a source checkout from the private-suite placeholder.
    harness_config = yaml.safe_load(config_path.read_text()) if config_path.is_file() else {}
    if not isinstance(harness_config, dict):
        raise ValueError(f"{config_path}: expected a mapping")
    harness_config.setdefault("override", {})
    harness_config.setdefault("vars", {})
    source.mkdir(parents=True)
    harness_root = source_harness_path(harness, modules)
    for original in tracked_harness_files(harness_root, module_sources):
        target = source / original.relative_to(harness_root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(original, target)
    materialize_published_linked_file_sources(work, source, harness_root, source_entry_files(module_sources))
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
            current = {name: str(module["directory"])
                       for name, module in discover(module_source_roots()).items()}
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
