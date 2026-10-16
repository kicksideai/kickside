from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "validate-package.py"
SPEC = importlib.util.spec_from_file_location("validate_package", SCRIPT)
assert SPEC and SPEC.loader
validate_package = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validate_package)


class ValidatePackageTest(unittest.TestCase):
    def fixture(self, *, title="Workspace", announced="true", dependency=">=0.1.0", asset=True):
        temp = tempfile.TemporaryDirectory()
        root = Path(temp.name)
        (root / "src").mkdir()
        (root / "static").mkdir()
        (root / "wippy.yaml").write_text(
            "organization: example\nmodule: workspace\ntype: plugin\nembed:\n  - example.workspace:ui_fs\n",
            encoding="utf-8",
        )
        (root / "src" / "_index.yaml").write_text(
            f'''version: "1.0"
namespace: example.workspace
entries:
  - name: definition
    kind: ns.definition
  - name: dep
    kind: ns.dependency
    version: "{dependency}"
    component: example/dep
  - name: ui_fs
    kind: fs.directory
    directory: ./static
  - name: ui_static
    kind: http.static
    fs: example.workspace:ui_fs
    path: /example-workspace
  - name: create_view
    kind: registry.entry
    meta:
      type: view.component
      tag_name: example-entry-create
      base_path: example-workspace
      entry_point: entry_create.js
      announced: {announced}
  - name: nav
    kind: registry.entry
    meta:
      type: ui.nav_item
      title: {title!r}
''',
            encoding="utf-8",
        )
        if asset:
            (root / "static" / "entry_create.js").write_text("export {}\n", encoding="utf-8")
        return temp, root

    def test_accepts_complete_package(self):
        temp, root = self.fixture()
        self.addCleanup(temp.cleanup)
        self.assertEqual([], validate_package.validate(root))

    def test_rejects_missing_renderer_asset_and_announcement(self):
        temp, root = self.fixture(announced="false", asset=False)
        self.addCleanup(temp.cleanup)
        errors = validate_package.validate(root)
        self.assertTrue(any("announced" in error for error in errors))
        self.assertTrue(any("renderer asset is missing" in error for error in errors))

    def test_rejects_legacy_blank_nav_and_concrete_dependency(self):
        temp, root = self.fixture(title="", dependency="0.1.2")
        self.addCleanup(temp.cleanup)
        errors = validate_package.validate(root)
        self.assertTrue(any("meta.title" in error for error in errors))
        self.assertTrue(any("concrete dependency version" in error for error in errors))

    def test_rejects_test_support_in_production_dependencies(self):
        temp, root = self.fixture()
        self.addCleanup(temp.cleanup)
        index = root / "src/_index.yaml"
        index.write_text(index.read_text().replace("component: example/dep", "component: chestor/test-support"))
        self.assertTrue(any("test-only" in error for error in validate_package.validate(root)))

    def test_rejects_test_support_imports_in_production(self):
        temp, root = self.fixture()
        self.addCleanup(temp.cleanup)
        index = root / "src/_index.yaml"
        index.write_text(index.read_text() + "  - name: resolver\n    kind: function.lua\n    imports:\n      resolver: chestor.test_support:scope_resolver\n")
        self.assertTrue(any("test-only" in error for error in validate_package.validate(root)))

    def test_support_stays_outside_release_inventory_and_production_sources(self):
        import json
        repository = Path(__file__).parents[2]
        plan = json.loads((repository / ".github/modules.json").read_text())
        self.assertNotIn("test-support", plan["modules"])
        for module in plan["modules"].values():
            self.assertNotEqual(module["path"], "test-support")
            self.assertEqual([], validate_package.validate(repository / module["path"]))

    def test_every_harness_has_a_complete_local_support_replacement(self):
        import yaml
        repository = Path(__file__).parents[2]
        for module in ("graph", "db-schema", "roadmap", "workspace"):
            harness = repository / module / "test"
            config = yaml.safe_load((harness / ".wippy.yaml").read_text())
            replacement = config["workspace"]["replacements"].get("chestor/test-support")
            self.assertEqual("../../test/support", replacement)
            support = (harness / replacement).resolve()
            self.assertTrue((support / "wippy.yaml").is_file())
            self.assertTrue((support / "src/scope_resolver.lua").is_file())

    def test_current_chestor_modules_are_publishable(self):
        repository = Path(__file__).parents[2]
        for module in ("db-schema", "graph", "journal", "roadmap", "workspace"):
            with self.subTest(module=module):
                self.assertEqual([], validate_package.validate(repository / module))


if __name__ == "__main__":
    unittest.main()
