#!/usr/bin/env python3
"""Regression tests for the Workflow architecture source guard."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "check-workflow-architecture.py"
SPEC = importlib.util.spec_from_file_location("check_workflow_architecture", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
ARCHITECTURE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ARCHITECTURE)


AUTOMATION_INDEX = """\
version: "1.0"
namespace: kickside.automation
entries:
  - name: definition
    kind: ns.definition
  - name: binding_config_view
    kind: registry.entry
    meta:
      type: view.component
      title: Connect a Trigger
      announced: true
      auto_register: true
      tag_name: kickside-automation-binding-config
"""

WORKFLOWS_INDEX = """\
version: "1.0"
namespace: kickside.workflows
entries:
  - name: definition
    kind: ns.definition
  - name: dep.kickside.automation
    kind: ns.dependency
    component: kickside/automation
  - name: dep.kickside.blocks
    kind: ns.dependency
    component: kickside/blocks
  - name: workflow_kind
    kind: contract.binding
    meta:
      class: flow
    contracts:
      - contract: kickside.contract:component
      - contract: kickside.contract:deletable
"""

BLOCKS_INDEX = """\
version: "1.0"
namespace: kickside.blocks
entries:
  - name: proof_block
    kind: registry.entry
    meta:
      type: kickside.block
"""


class WorkflowArchitectureTest(unittest.TestCase):
    def fixture(self) -> Path:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        for module, index in (
            ("blocks", BLOCKS_INDEX),
            ("automation", AUTOMATION_INDEX),
            ("workflows", WORKFLOWS_INDEX),
        ):
            source = root / "platform" / module / "src"
            source.mkdir(parents=True)
            (source / "_index.yaml").write_text(index)
        sync_source = root / "platform" / "sync" / "src"
        sync_source.mkdir(parents=True)
        (sync_source / "destination_map.lua").write_text("return {}\n")
        return root

    @staticmethod
    def add_canonical_workflow_ui(root: Path) -> None:
        for relative in (
            "canvas/WorkflowCanvas.vue",
            "panels/NodeConfigPanel.vue",
        ):
            path = root / "platform" / "workflows" / "ui" / "src" / "app" / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("<template />\n")

    def errors(self, root: Path) -> str:
        return "\n".join(ARCHITECTURE.check(root))

    def test_canonical_one_way_composition_passes(self):
        self.assertEqual([], ARCHITECTURE.check(self.fixture()))

    def test_canonical_workflow_ui_owners_pass(self):
        root = self.fixture()
        self.add_canonical_workflow_ui(root)
        self.assertEqual([], ARCHITECTURE.check(root))

    def test_stale_top_level_workflow_ui_owners_are_rejected(self):
        root = self.fixture()
        self.add_canonical_workflow_ui(root)
        app = root / "platform" / "workflows" / "ui" / "src" / "app"
        (app / "WorkflowCanvas.vue").write_text("<template />\n")
        (app / "NodeConfigPanel.vue").write_text("<template />\n")

        errors = self.errors(root)
        self.assertIn(
            "platform/workflows/ui/src/app/WorkflowCanvas.vue: stale duplicate "
            "Workflow canvas owner; keep only canonical "
            "platform/workflows/ui/src/app/canvas/WorkflowCanvas.vue",
            errors,
        )
        self.assertIn(
            "platform/workflows/ui/src/app/NodeConfigPanel.vue: stale duplicate "
            "Node configuration panel owner; keep only canonical "
            "platform/workflows/ui/src/app/panels/NodeConfigPanel.vue",
            errors,
        )

    def test_noncanonical_workflow_ui_owner_is_rejected_even_without_canonical_copy(self):
        root = self.fixture()
        app = root / "platform" / "workflows" / "ui" / "src" / "app"
        app.mkdir(parents=True)
        (app / "WorkflowCanvas.vue").write_text("<template />\n")

        self.assertIn(
            "non-canonical Workflow canvas owner; move it to "
            "platform/workflows/ui/src/app/canvas/WorkflowCanvas.vue",
            self.errors(root),
        )

    def test_retired_parallel_packages_are_rejected(self):
        root = self.fixture()
        (root / "platform" / "execution").mkdir()
        errors = self.errors(root)
        self.assertIn("platform/execution: retired parallel engine", errors)

    def test_automation_cannot_reference_workflows(self):
        root = self.fixture()
        (root / "platform" / "automation" / "src" / "leak.lua").write_text(
            'local workflows = require("kickside.workflows:store")\n'
        )
        self.assertIn(
            "Automation must not reference the Workflow package",
            self.errors(root),
        )

    def test_live_harness_wiring_is_not_production_source(self):
        root = self.fixture()
        module = root / "platform" / "automation"
        source = 'return "kickside.workflows:run_sink"\n'
        harness = module / "live-test" / "src" / "fixture.lua"
        harness.parent.mkdir(parents=True)
        harness.write_text(source)
        self.assertEqual([], ARCHITECTURE.check(root))

        (module / "src" / "fixture.lua").write_text(source)
        self.assertIn(
            "platform/automation/src/fixture.lua:1: Automation must not reference the Workflow package",
            self.errors(root),
        )

    def test_core_blocks_and_sync_cannot_reference_workflows(self):
        root = self.fixture()
        leaks = (
            ("core/component/src/leak.lua", "Core"),
            ("platform/blocks/src/leak.lua", "Blocks"),
            ("platform/sync/src/leak.lua", "Data Sync"),
        )
        for relative, _ in leaks:
            path = root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('return "kickside.workflows:optional_cleanup"\n')

        errors = self.errors(root)
        for _, title in leaks:
            self.assertIn(
                f"{title} must not reference the Workflow package",
                errors,
            )

    def test_retired_wire_vocabulary_is_rejected_outside_platform(self):
        root = self.fixture()
        app_source = root / "app" / "src" / "legacy.lua"
        app_source.parent.mkdir(parents=True)
        app_source.write_text('return { workflow_ref = { kind = "workflow_definition" } }\n')
        core_source = root / "core" / "component" / "src" / "legacy.lua"
        core_source.parent.mkdir(parents=True, exist_ok=True)
        core_source.write_text('return { workflow_ref = {} }\n')

        errors = self.errors(root)
        self.assertIn("app/src/legacy.lua: retired Flow vocabulary 'workflow_ref'", errors)
        self.assertIn("app/src/legacy.lua: retired Flow vocabulary 'workflow_definition'", errors)
        self.assertIn("core/component/src/legacy.lua: retired Flow vocabulary 'workflow_ref'", errors)

    def test_workflows_must_explicitly_depend_on_automation(self):
        root = self.fixture()
        index = root / "platform" / "workflows" / "src" / "_index.yaml"
        index.write_text(index.read_text().replace("    component: kickside/automation\n", ""))
        self.assertIn("Workflows -> Automation dependency; found 0", self.errors(root))

    def test_workflows_cannot_own_an_automation_creation_surface(self):
        root = self.fixture()
        index = root / "platform" / "workflows" / "src" / "_index.yaml"
        index.write_text(index.read_text() + """\
  - name: run_workflow_automation
    kind: registry.entry
    meta:
      type: kickside.automation
      announced: true
      title: Run a Workflow
""")
        self.assertIn(
            "Automation owns the trigger-to-Flow creation surface",
            self.errors(root),
        )

    def test_automation_creation_surface_has_one_canonical_shape(self):
        root = self.fixture()
        index = root / "platform" / "automation" / "src" / "_index.yaml"
        index.write_text(index.read_text().replace("title: Connect a Trigger", "title: Connect"))
        self.assertIn(
            "single public 'Connect a Trigger' component",
            self.errors(root),
        )

    def test_flow_component_cannot_regain_automation_behavior(self):
        root = self.fixture()
        index = root / "platform" / "workflows" / "src" / "_index.yaml"
        text = index.read_text().replace(
            "    meta:\n      class: flow\n",
            "    meta:\n      class: flow\n      trigger_handler: trigger_apply\n",
        ).replace(
            "    contracts:\n      - contract: kickside.contract:component\n",
            "    contracts:\n      - contract: kickside.contract:component\n"
            "      - contract: kickside.data:writable\n",
        )
        index.write_text(text)
        errors = self.errors(root)
        self.assertIn("pure Flow authoring component", errors)
        self.assertIn("retired Automation behavior metadata", errors)

    def test_retired_run_flow_pseudo_destination_is_rejected(self):
        root = self.fixture()
        index = root / "platform" / "workflows" / "src" / "_index.yaml"
        index.write_text(index.read_text() + """\
  - name: run_flow_port
    kind: registry.entry
    meta:
      type: kickside.automation.port
""")
        self.assertIn("retired Flow component Automation behavior", self.errors(root))

    def test_published_launch_cannot_resolve_latest_implicitly(self):
        root = self.fixture()
        source = root / "platform" / "workflows" / "src" / "runs" / "launch.lua"
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text("local head = versions.head(workflow_id)\n")
        self.assertIn("must not substitute the latest Flow version", self.errors(root))

    def test_legacy_node_type_cannot_be_declared_by_production_packages(self):
        root = self.fixture()
        index = root / "platform" / "workflows" / "src" / "_index.yaml"
        index.write_text(index.read_text() + """\
  - name: retired_node
    kind: registry.entry
    meta:
      type: kickside.workflows.node_kind
""")
        errors = self.errors(root)
        self.assertIn("retired type must not remain", errors)

    def test_retired_flow_declaration_variants_are_rejected(self):
        root = self.fixture()
        index = root / "platform" / "workflows" / "src" / "_index.yaml"
        index.write_text(index.read_text() + """\
  - name: retired_template
    kind: registry.entry
    meta:
      type: flow_template
""")
        self.assertIn("retired type must not remain", self.errors(root))

    def test_retired_flow_reference_vocabulary_is_rejected(self):
        root = self.fixture()
        source = root / "platform" / "workflows" / "src" / "legacy.lua"
        source.write_text('return { workflow_ref = { kind = "workflow_definition" } }\n')
        errors = self.errors(root)
        self.assertIn("retired Flow vocabulary 'workflow_ref'", errors)
        self.assertIn("retired Flow vocabulary 'workflow_definition'", errors)

    def test_flow_assist_wire_rejects_node_kind_and_title(self):
        root = self.fixture()
        source = root / "platform" / "workflows" / "src" / "assist.lua"
        source.write_text(
            'return { node_kind = "review", node_title = "Review" }\n'
        )
        self.assertIn(
            "retired Flow-assist wire field; use block_id/block_title",
            self.errors(root),
        )

    def test_retired_slot_and_wait_mechanisms_are_rejected(self):
        root = self.fixture()
        source = root / "platform" / "workflows" / "src" / "legacy.yaml"
        source.write_text("""\
version: "1.0"
namespace: kickside.workflows.legacy
entries: []
value: "${slot:crm}"
ref:
  kind: slot
resume: kickside.workflows:resume
await: kickside.workflows.node.await
""")
        errors = self.errors(root)
        self.assertIn("retired untyped slot ref", errors)
        self.assertIn("canonical wait/resume Block contract", errors)
        self.assertIn("canonical wait Block", errors)


if __name__ == "__main__":
    unittest.main()
