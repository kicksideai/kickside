from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path
from typing import Any

import yaml

SCRIPT = Path(__file__).resolve().parents[1] / "app" / "scripts" / "check_dependency_pins.py"
SPEC = importlib.util.spec_from_file_location("check_dependency_pins", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
PINS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PINS)


class DependencyPinTest(unittest.TestCase):
    def test_stage_build_keeps_facade_forward_resolvable_and_uses_github_gates(self):
        root = SCRIPT.parents[2]
        components = PINS.dependency_components(root / "app/src/app/deps/_index.yaml")
        self.assertEqual(components["wippy/facade"], "*")
        self.assert_allowed(components["wippy/facade"])
        self.assertFalse((root / ".gitlab/stages/build.yml").exists())
        workflow = yaml.safe_load((root / ".github/workflows/ci.yml").read_text())
        self.assertTrue(workflow["jobs"])

    def test_application_facade_keeps_the_cloud_stage_dependency_forward_resolvable(self):
        index = SCRIPT.parents[1] / "src/app/deps/_index.yaml"
        components = PINS.dependency_components(index)
        self.assert_allowed(components["wippy/facade"])

    def check_version(self, version: Any) -> list[str]:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        dependencies = [
            {"name": "sso", "kind": "ns.dependency", "component": "kickside/sso", "version": "*"},
            {"name": "sso_google", "kind": "ns.dependency", "component": "kickside/sso-google", "version": "*"},
            {"name": "pdf2image", "kind": "ns.dependency", "component": "kickside/pdf2image", "version": "*"},
            {"name": "facade", "kind": "ns.dependency", "component": "wippy/facade", "version": version},
        ]
        index = root / "deps.yaml"
        index.write_text(yaml.safe_dump({"entries": dependencies}, sort_keys=False))
        environment = root / "env.yaml"
        environment.write_text("entries: []\n")
        return PINS.check(index, root / "wippy.lock", environment)

    def test_explicit_build_metadata_is_not_a_runtime_root(self):
        with tempfile.TemporaryDirectory() as directory:
            index = Path(directory) / "deps.yaml"
            index.write_text(yaml.safe_dump({"entries": [
                {"name": "build", "kind": "ns.build_dependency", "component": "kickside/ui-kit", "version": "*"},
                {"name": "runtime", "kind": "ns.dependency", "component": "kickside/sso", "version": "*"},
            ]}))
            self.assertEqual(PINS.dependency_components(index), {"kickside/sso": "*"})

    def test_bind_false_does_not_exempt_a_runtime_dependency_from_version_validation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            index = root / "deps.yaml"
            environment = root / "env.yaml"
            environment.write_text("entries: []\n")
            index.write_text(yaml.safe_dump({"entries": [
                {"name": "runtime", "kind": "ns.dependency", "component": "kickside/ui-kit",
                 "version": "1.2.3", "bind": False},
            ]}))
            self.assertIn("root dependency must not use a concrete version: kickside/ui-kit has '1.2.3'",
                          PINS.check(index, root / "wippy.lock", environment))

    def test_knowledge_requires_first_agent_composition(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            index, lock, environment = root / "deps.yaml", root / "wippy.lock", root / "env.yaml"
            environment.write_text("entries: []\n")
            entries = [{"name": component.split("/")[-1], "kind": "ns.dependency", "component": component, "version": "*"} for component in ("kickside/sso", "kickside/sso-google", "kickside/pdf2image", "kickside/knowledge")]
            index.write_text(yaml.safe_dump({"entries": entries}))
            lock.write_text(yaml.safe_dump({"modules": [{"name": entry["component"]} for entry in entries]}))
            self.assertTrue(any("kickside/knowledge" in error for error in PINS.check(index, lock, environment)))
            entries.append({"name": "agent_onboarding", "kind": "ns.dependency", "component": "kickside/agent-onboarding", "version": "*"})
            index.write_text(yaml.safe_dump({"entries": entries}))
            lock.write_text(yaml.safe_dump({"modules": [{"name": entry["component"]} for entry in entries]}))
            self.assertEqual(PINS.check(index, lock, environment), [])
            entries.append({"name": "kb10", "kind": "ns.dependency", "component": "kickside/kb10", "version": "*"})
            index.write_text(yaml.safe_dump({"entries": entries}))
            self.assertTrue(any("kickside/kb10" in error for error in PINS.check(index, lock, environment)))

    def assert_allowed(self, version: str) -> None:
        self.assertFalse(
            [error for error in self.check_version(version) if "root dependency" in error],
            version,
        )

    def assert_rejected(self, version: Any) -> None:
        self.assertTrue(
            [error for error in self.check_version(version) if "root dependency" in error],
            repr(version),
        )

    def test_compatible_ranges_are_allowed(self):
        for version in ("*", "^0.6.34", "~0.6.34", ">=0.6.34 <0.7.0", "0.6.x"):
            with self.subTest(version=version):
                self.assert_allowed(version)

    def test_exact_semantic_versions_are_rejected(self):
        for version in ("0.6.34", "v0.6.34", "0.6.34-alpha.1", "0.6.34+build.5"):
            with self.subTest(version=version):
                self.assert_rejected(version)

    def test_missing_and_non_string_versions_are_rejected(self):
        for version in (None, "", 1):
            with self.subTest(version=version):
                self.assert_rejected(version)


if __name__ == "__main__":
    unittest.main()
