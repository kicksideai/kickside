"""Assert release packs and live source modules contain only product entries."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[2]
TEST_ID = re.compile(r"(?:^|[.:_-])(?:tests|fixture|fixtures|test_support|test_helper)(?:$|[.:_-])")


def command(args, cwd):
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(f"{' '.join(map(str, args))}:\n{result.stdout}{result.stderr}")
    return result.stdout


def forbidden(entries, application=False):
    errors = []
    for entry in entries:
        identity = entry["id"]
        namespace = identity.split(":", 1)[0]
        meta = entry.get("meta") or {}
        data = entry.get("data") or {}
        component = data.get("component", "")
        support_dependency = component == "wippy/test" or "test-support" in component
        fixture_filesystem = entry["kind"] in {"fs.directory", "fs.embed"} and bool(set(Path(data.get("directory", "")).parts) & {"test", "tests", "fixtures", "test-support"})
        if not application and (namespace == "app" or namespace.startswith("app.")):
            errors.append(identity)
        elif support_dependency or fixture_filesystem or TEST_ID.search(identity) or re.search(r"(?:^|[.])test(?:$|[._])", namespace) or namespace.endswith("_test") or identity.endswith(("_test", ":test")) or meta.get("type") in {"test", "test_helper", "test_support"} or meta.get("test_only"):
            errors.append(identity)
    return errors


def source_boundaries(directory, application=False):
    manifest = yaml.safe_load((directory / "wippy.yaml").read_text())
    excludes = set(manifest.get("exclude", []))
    errors = []
    if not application:
        for pattern in ("app:**", "app.**:**"):
            if pattern not in excludes:
                errors.append(f"{directory}: missing entry exclusion {pattern}")
    for child in ("test", "tests", "test-support", "eval", "bench", "local", "live-test", "lint-harness"):
        if (directory / child).is_dir() and child + "/**" not in excludes:
            errors.append(f"{directory}: missing source exclusion {child}/**")
    types = set(manifest.get("exclude_meta", {}).get("type", []))
    if not {"test", "test_helper", "test_support"} <= types:
        errors.append(f"{directory}: missing test metadata exclusions")
    return errors


def pack_entries(directory, module, scratch, embed=False):
    identity = module["organization"] + "/" + module["module"]
    version = json.loads((ROOT / ".release-please-manifest.json").read_text())[module["path"]]
    source = scratch / "source"
    source.mkdir()
    (source / "empty").mkdir()
    (source / "wippy.lock").write_text(yaml.safe_dump({
        "directories": {"src": "empty", "modules": "vendor"},
        "modules": [{"name": identity, "version": version}],
    }))
    (source / ".wippy.yaml").write_text(yaml.safe_dump({
        "version": "1.0", "workspace": {"replacements": {identity: str(directory)}},
    }))
    pack = scratch / "module.wapp"
    args = ["wippy", "pack", "--module", identity]
    if embed:
        for entry in module["embed"]:
            args += ["--embed", entry]
    command([*args, str(pack)], source)
    if not pack.is_file() or not pack.stat().st_size:
        raise AssertionError(f"{identity}: pack is empty")
    packed = scratch / "packed"
    packed.mkdir()
    (packed / "wippy.lock").write_text(yaml.safe_dump({
        "directories": {"src": str(pack), "modules": "vendor"}, "modules": [],
    }))
    (packed / ".wippy.yaml").write_text("version: '1.0'\n")
    entries = json.loads(command(["wippy", "registry", "list", "--json"], packed))
    for index, entry in enumerate(entries):
        if entry["kind"] in {"ns.dependency", "fs.directory", "fs.embed"}:
            entries[index] = json.loads(command(["wippy", "registry", "show", entry["id"], "--json"], packed))
    if not entries or not any(row["kind"] == "ns.definition" for row in entries):
        raise AssertionError(f"{identity}: pack has no product definition")
    return entries, pack


def check_module(module, embed=False):
    directory = (ROOT / module["path"]).resolve()
    application = module["type"] == "application"
    errors = source_boundaries(directory, application)
    with tempfile.TemporaryDirectory(prefix="packaging-", dir=ROOT / ".github") as temporary:
        scratch = Path(temporary)
        entries, _ = pack_entries(directory, module, scratch, embed)
        errors += [f"{module['path']}: shipped test entry {entry}" for entry in forbidden(entries, application)]
        print(f"{module['organization']}/{module['module']}: {len(entries)} packed entries", flush=True)
    if errors:
        raise AssertionError("\n".join(errors))


class PackagingTest(unittest.TestCase):
    def test_rejects_application_descendants_and_untagged_support(self):
        rows = [{"id": "app.http_errors_test:contract", "kind": "ns.dependency"},
                {"id": "example.test_support:resolver", "kind": "function.lua"},
                {"id": "example:helper", "kind": "function.lua", "meta": {"type": "test_helper"}}]
        self.assertEqual(forbidden(rows), [row["id"] for row in rows])

    def test_rejects_test_dependencies_and_fixture_filesystems_with_product_ids(self):
        rows = [{"id": "example:runner", "kind": "ns.dependency", "data": {"component": "wippy/test"}},
                {"id": "example:assets", "kind": "fs.directory", "data": {"directory": "./test/fixtures"}}]
        self.assertEqual(forbidden(rows), [row["id"] for row in rows])

    def test_preserves_product_connection_and_model_diagnostics(self):
        rows = [{"id": "example.connection:test_connection", "kind": "function.lua"},
                {"id": "example.api.admin:test_profile.endpoint", "kind": "http.endpoint"}]
        self.assertEqual(forbidden(rows), [])

    def test_preserves_host_application_entries(self):
        self.assertEqual(forbidden([{"id": "app:definition", "kind": "ns.definition"}], True), [])
        self.assertEqual(forbidden([{"id": "app.http_errors_test:contract", "kind": "ns.dependency"}], True), ["app.http_errors_test:contract"])

    def test_all_release_packs_exclude_tests(self):
        modules = json.loads((ROOT / ".github/modules.json").read_text())["modules"]
        for module in modules.values():
            with self.subTest(module=module["path"]):
                check_module(module)

    def test_packs_install_together(self):
        plan = json.loads((ROOT / ".github/modules.json").read_text())
        with tempfile.TemporaryDirectory(prefix="composition-", dir=ROOT / ".github") as temporary:
            scratch = Path(temporary)
            installed = scratch / "installed"
            (installed / "empty").mkdir(parents=True)
            versions = json.loads((ROOT / ".release-please-manifest.json").read_text())
            selected = []
            expected = set()
            seen = set()
            for index, module in enumerate(plan["modules"].values()):
                target = scratch / str(index)
                target.mkdir()
                entries, pack = pack_entries((ROOT / module["path"]).resolve(), module, target)
                self.assertEqual(forbidden(entries, module["type"] == "application"), [])
                ids = {row["id"] for row in entries}
                self.assertFalse(seen & ids, f"package ownership conflicts: {sorted(seen & ids)}")
                seen |= ids
                expected |= {row["id"] for row in entries if row["kind"] == "ns.definition"}
                identity = module["organization"] + "/" + module["module"]
                version = versions[module["path"]]
                destination = installed / "vendor" / module["organization"] / (module["module"] + "-" + version + ".wapp")
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(pack.read_bytes())
                import hashlib
                selected.append({"name": identity, "version": version, "hash": hashlib.sha256(pack.read_bytes()).hexdigest()})
            (installed / ".wippy.yaml").write_text("version: '1.0'\n")
            (installed / "wippy.lock").write_text(yaml.safe_dump({
                "directories": {"src": "empty", "modules": "vendor"},
                "modules": selected, "options": {"unpack_modules": False},
            }))
            command(["wippy", "install"], installed)
            rows = json.loads(command(["wippy", "registry", "list", "--json"], installed))
            self.assertEqual({row["id"] for row in rows if row["kind"] == "ns.definition"}, expected)
            self.assertEqual(forbidden(rows, any(module["type"] == "application" for module in plan["modules"].values())), [])
            command(["wippy", "pack", str(installed / "combined.wapp")], installed)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--module")
    parser.add_argument("--embed", action="store_true")
    args, remaining = parser.parse_known_args()
    if args.module:
        check_module(json.loads((ROOT / ".github/modules.json").read_text())["modules"][args.module], args.embed)
    else:
        unittest.main(argv=[__file__, *remaining])
