from __future__ import annotations

import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import yaml


SCRIPT = (
    Path(__file__).resolve().parents[1]
    / "app"
    / "scripts"
    / "check_dependency_parameter_ownership.py"
)
SPEC = importlib.util.spec_from_file_location("check_dependency_parameter_ownership", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
OWNERSHIP = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(OWNERSHIP)


class DependencyParameterOwnershipTest(unittest.TestCase):
    def test_transitive_host_binding_moves_to_its_declaring_root(self):
        parameter = {"name": "wippy.bootloader:env_storage", "value": "app.env:store"}
        owners = {parameter["name"]: "wippy/bootloader"}
        misplaced = OWNERSHIP.check_roots([
            ("app:keeper", "keeper/keeper", [parameter]),
            ("app:bootloader", "wippy/bootloader", []),
        ], owners)
        self.assertEqual(len(misplaced), 1)
        self.assertIn("declared by wippy/bootloader", misplaced[0])
        self.assertEqual(OWNERSHIP.check_roots([
            ("app:keeper", "keeper/keeper", []),
            ("app:bootloader", "wippy/bootloader", [parameter]),
        ], owners), [])

    def test_application_binds_the_automation_composition_host(self):
        root = Path(__file__).resolve().parents[1]
        roots = {component: parameters for _, component, parameters in OWNERSHIP.dependency_roots(
            root / "app/src/app/deps/_index.yaml")}
        parameters = {item["name"]: item["value"] for item in roots["kickside/automation"]}
        self.assertEqual(parameters["kickside.automation.engine:process_host"], "app:processes")
        document = yaml.safe_load((root / "platform/automation/src/engine/_index.yaml").read_text())
        host = next(entry for entry in document["entries"] if entry["name"] == "process_host")
        self.assertNotIn("default", host)
        self.assertEqual(host["targets"][0]["path"], ".host")

    def test_all_application_runtime_dependencies_float(self):
        root = Path(__file__).resolve().parents[1]
        found = set()
        for path in (root / "app/src").rglob("*.yaml"):
            document = yaml.safe_load(path.read_text())
            for entry in document.get("entries", []) if isinstance(document, dict) else []:
                if entry.get("kind") == "ns.dependency":
                    found.add(entry["component"])
                    version = entry.get("version")
                    self.assertIsInstance(version, str)
                    self.assertTrue(version == "*" or version.startswith((">=", "^", "~")),
                                    f"{path}: {entry['name']} requires a forward-resolvable range")
        self.assertIn("kickside/automation", found)
        self.assertIn("wippy/agent", found)

    @mock.patch.object(OWNERSHIP.subprocess, "run")
    def test_requirement_authority_uses_the_current_registry_owner(self, run):
        run.return_value = subprocess.CompletedProcess(args=[], returncode=0, stderr="",
            stdout=yaml.safe_dump([{
                "id": "kickside.users:target_db",
                "registry": {"owner": "kickside/users"},
                "provenance": {"module": "unrelated/module"},
            }]))
        owners = OWNERSHIP.requirement_owners(Path("/app"), Path("/app/wippy.lock"), "wippy")
        self.assertEqual(owners, {"kickside.users:target_db": "kickside/users"})
        self.assertNotIn("--provenance", run.call_args.args[0])
        self.assertEqual([], OWNERSHIP.check_roots([
            ("app", "kickside/users", [{"name": "kickside.users:target_db"}])], owners))

    def test_current_app_roots_do_not_supply_removed_transitive_parameters(self):
        index = Path(__file__).resolve().parents[1] / "app" / "src" / "app" / "deps" / "_index.yaml"
        roots = {
            component: parameters
            for _, component, parameters in OWNERSHIP.dependency_roots(index)
        }
        supplied = {
            component: {
                parameter["name"]
                for parameter in parameters
                if isinstance(parameter, dict) and isinstance(parameter.get("name"), str)
            }
            for component, parameters in roots.items()
        }
        self.assertNotIn("wippy.bootloader:env_storage", supplied["keeper/keeper"])
        self.assertNotIn("wippy.migration:app_db", supplied["keeper/keeper"])
        self.assertNotIn("userspace.dataflow:target_db", supplied["keeper/keeper"])
        self.assertNotIn("wippy/migration", supplied)
        self.assertNotIn("kickside.uploads:process_host", supplied.get("kickside/uploads", set()))

    def test_accepts_parameters_declared_by_the_root(self):
        roots = [("deps.yaml:users", "kickside/users", [{"name": "kickside.users:target_db"}])]
        self.assertEqual(
            OWNERSHIP.check_roots(roots, {"kickside.users:target_db": "kickside/users"}),
            [],
        )

    def test_rejects_transitive_and_unknown_qualified_parameters(self):
        roots = [
            (
                "deps.yaml:keeper",
                "keeper/keeper",
                [
                    {"name": "wippy.migration:app_db"},
                    {"name": "missing.module:target"},
                ],
            )
        ]
        errors = OWNERSHIP.check_roots(
            roots, {"wippy.migration:app_db": "wippy/migration"}
        )
        self.assertEqual(len(errors), 2)
        self.assertIn("declared by wippy/migration", errors[0])
        self.assertIn("unknown qualified requirement", errors[1])

    def test_leaves_unqualified_parameters_to_the_registry(self):
        roots = [("deps.yaml:llm", "wippy/llm", [{"name": "process_host"}])]
        self.assertEqual(OWNERSHIP.check_roots(roots, {}), [])

    def test_reads_only_dependency_roots(self):
        with tempfile.TemporaryDirectory() as directory:
            index = Path(directory) / "_index.yaml"
            index.write_text(
                yaml.safe_dump(
                    {
                        "entries": [
                            {"name": "ignored", "kind": "library.lua"},
                            {
                                "name": "users",
                                "kind": "ns.dependency",
                                "component": "kickside/users",
                                "parameters": [{"name": "kickside.users:target_db"}],
                            },
                        ]
                    },
                    sort_keys=False,
                )
            )
            self.assertEqual(
                list(OWNERSHIP.dependency_roots(index)),
                [
                    (
                        f"{index}:users",
                        "kickside/users",
                        [{"name": "kickside.users:target_db"}],
                    )
                ],
            )

    @mock.patch.object(OWNERSHIP.subprocess, "run")
    def test_uses_registry_owned_metadata_as_authority(self, run):
        run.return_value = subprocess.CompletedProcess(
            args=[],
            returncode=0,
            stdout=yaml.safe_dump(
                [
                    {
                        "id": "kickside.users:target_db",
                        "registry": {"owner": "kickside/users"},
                    }
                ]
            ),
            stderr="",
        )
        owners = OWNERSHIP.requirement_owners(Path("/app"), Path("/app/wippy.lock"), "wippy")
        self.assertEqual(owners, {"kickside.users:target_db": "kickside/users"})
        command = run.call_args.args[0]
        self.assertIn("--kind", command)
        self.assertIn("ns.requirement", command)
        self.assertIn("--registry-meta", command)

    @mock.patch.object(OWNERSHIP.subprocess, "run")
    def test_rejects_registry_output_without_owned_metadata(self, run):
        run.return_value = subprocess.CompletedProcess(
            args=[],
            returncode=0,
            stdout=yaml.safe_dump([{"id": "kickside.users:target_db"}]),
            stderr="",
        )
        with self.assertRaisesRegex(RuntimeError, "omitted owned metadata"):
            OWNERSHIP.requirement_owners(Path("/app"), Path("/app/wippy.lock"), "wippy")


if __name__ == "__main__":
    unittest.main()
