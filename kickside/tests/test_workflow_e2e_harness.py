#!/usr/bin/env python3
"""Fast contract tests for the published Workflow E2E harness itself."""

from __future__ import annotations

import importlib.util
import re
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock


MODULE_PATH = Path(__file__).parent / "workflow-e2e" / "workflow_e2e.py"
SPEC = importlib.util.spec_from_file_location("workflow_e2e", MODULE_PATH)
assert SPEC and SPEC.loader
workflow_e2e = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = workflow_e2e
SPEC.loader.exec_module(workflow_e2e)


class VocabularyContractTests(unittest.TestCase):
    def test_selectors_match_canonical_workflow_accessible_names(self) -> None:
        root = Path(__file__).resolve().parents[1]
        table = (root / "platform/workflows/ui/src/app/list/WorkflowTable.vue").read_text()
        toolbar = (root / "platform/workflows/ui/src/app/canvas/CanvasToolbar.vue").read_text()
        harness = MODULE_PATH.read_text()
        self.assertIn('role="table" aria-label="Workflows"', table)
        self.assertIn('aria-label="More workflow actions"', toolbar)
        self.assertIn('get_by_role("table", name="Workflows")', harness)
        self.assertIn('get_by_role("button", name="More workflow actions")', harness)
        self.assertIn('get_by_role("button", name="New Workflow", exact=True)', harness)
        self.assertIn('get_by_label("Workflow name", exact=True)', harness)
        self.assertIn('matching[0]["title"] == "Connect a Trigger"', harness)
        self.assertNotIn('get_by_role("table", name="Flows")', harness)
        self.assertNotIn('get_by_role("button", name="More flow actions")', harness)
        self.assertNotIn('name="New flow"', harness)
        self.assertNotIn('get_by_label("Flow name"', harness)
        self.assertNotIn('Run a Flow creation surface', harness)


class PayloadShapeTests(unittest.TestCase):
    def test_records_reads_direct_and_wrapped_api_arrays(self) -> None:
        self.assertEqual(workflow_e2e.records({"items": [{"id": "a"}]}, "items"), [{"id": "a"}])
        self.assertEqual(
            workflow_e2e.records({"data": {"items": [{"id": "b"}]}}, "items"),
            [{"id": "b"}],
        )

    def test_entry_detail_combines_identity_with_registry_data(self) -> None:
        self.assertEqual(
            workflow_e2e.entry_data(
                {
                    "id": "app.composition:onboarding_profile.automation",
                    "meta": {"type": "kickside.hub:onboarding_profile"},
                    "data": {"profile": "automation", "packages": [{"component": "kickside/workflows"}]},
                }
            ),
            {
                "id": "app.composition:onboarding_profile.automation",
                "meta": {"type": "kickside.hub:onboarding_profile"},
                "data": {"profile": "automation", "packages": [{"component": "kickside/workflows"}]},
                "profile": "automation",
                "packages": [{"component": "kickside/workflows"}],
            },
        )


class PresetOrderTests(unittest.TestCase):
    @staticmethod
    def gate(packages: list[dict[str, object]]) -> object:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.profile_packages = Mock(return_value=packages)
        gate.install_package = Mock()
        gate.root_dependency = Mock(return_value={"component": "kickside/workflows"})
        return gate

    def test_installs_visual_workflows_then_deduplicated_automation_profiles(self) -> None:
        workflows = [
            {"component": "kickside/code-execution", "parameters": []},
            {"component": "kickside/blocks", "parameters": []},
            {"component": "kickside/workflows", "parameters": []},
        ]
        automation = [
            {"component": "kickside/code-execution", "parameters": []},
            {"component": "kickside/webhooks", "parameters": []},
        ]
        gate = self.gate(workflows)
        gate.profile_packages = Mock(side_effect=lambda name: workflows if name == "workflows" else automation)
        roots = {
            component: {"id": f"app.deps:{component.rsplit('/', 1)[-1].replace('-', '_')}", "component": component, "version": "0.1.0"}
            for component in {row["component"] for row in workflows + automation}
        }
        gate.root_dependency = Mock(side_effect=lambda component: roots.get(component))
        gate.installed_dependencies = Mock(return_value={"dependencies": list(roots.values())})
        gate.assert_single_creation_surface = Mock()
        gate.assert_block_catalog = Mock()
        gate.install_workflow_profiles()
        self.assertEqual([call.args[0] for call in gate.install_package.call_args_list], workflows + automation)
        self.assertEqual(
            gate.assert_block_catalog.call_args_list,
            [unittest.mock.call(expect_code_execution=True), unittest.mock.call(expect_code_execution=True)],
        )

    def test_rejects_a_reversed_workflows_profile(self) -> None:
        gate = self.gate([
            {"component": "kickside/code-execution"},
            {"component": "kickside/workflows"},
            {"component": "kickside/blocks"},
        ])
        with self.assertRaisesRegex(workflow_e2e.GateFailure, "canonical order"):
            gate.install_workflow_profiles()

    def test_rejects_opt_in_recipes_in_the_automation_profile(self) -> None:
        workflows = [
            {"component": "kickside/code-execution", "parameters": []},
            {"component": "kickside/blocks", "parameters": []},
            {"component": "kickside/workflows", "parameters": []},
        ]
        automation_with_recipes = [
            {"component": "kickside/code-execution", "parameters": []},
            {"component": "kickside/webhooks", "parameters": []},
            {"component": "kickside/recipes", "parameters": []},
        ]
        gate = self.gate(workflows)
        gate.profile_packages = Mock(
            side_effect=lambda name: workflows if name == "workflows" else automation_with_recipes
        )
        gate.root_dependency = Mock(
            side_effect=lambda component: {"component": component}
        )
        gate.assert_single_creation_surface = Mock()
        gate.assert_block_catalog = Mock()
        with self.assertRaisesRegex(workflow_e2e.GateFailure, "only Code Execution and Webhooks"):
            gate.install_workflow_profiles()


class SecretHandlingTests(unittest.TestCase):
    def test_runtime_argv_contains_no_credentials_and_all_text_artifacts_are_redacted(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.args = type("Args", (), {
            "published_app": "kickside/kickside",
            "hub_token_env": "KICKSIDE_E2E_HUB_TOKEN",
        })()
        gate.wippy = Path("/tmp/wippy")
        gate.port = 18085
        gate.base_url = "http://127.0.0.1:18085"
        gate.db_path = Path("/tmp/app.db")
        gate.email = "admin@example.test"
        gate.password = "top-secret-password"
        gate.encryption_key = "top-secret-key"
        gate.token = "top-secret-token"
        gate.secret_values = {gate.password, gate.encryption_key, gate.token}
        with tempfile.TemporaryDirectory() as directory:
            gate.log_path = Path(directory) / "runtime.log"
            gate.browser_log_path = Path(directory) / "browser.json"
            gate.snapshots = Path(directory) / "snapshots"
            gate.snapshots.mkdir()
            snapshot = gate.snapshots / "install.json"
            report_path = Path(directory) / "report.json"
            gate.report = type("ReportStub", (), {"path": report_path})()
            gate.log_path.write_text("top-secret-password top-secret-key top-secret-token")
            gate.browser_log_path.write_text("top-secret-token")
            snapshot.write_text('{"parameter":"top-secret-token"}')
            report_path.write_text('{"error":"top-secret-password"}')
            command = gate.runtime_command()
            joined = " ".join(command)
            self.assertNotIn(gate.email, joined)
            self.assertNotIn(gate.password, joined)
            self.assertNotIn(gate.encryption_key, joined)
            gate.redact_artifacts()
            self.assertNotIn("top-secret", gate.log_path.read_text())
            self.assertNotIn("top-secret", gate.browser_log_path.read_text())
            self.assertNotIn("top-secret", snapshot.read_text())
            self.assertNotIn("top-secret", report_path.read_text())


class WorkflowsLifecycleTests(unittest.TestCase):
    @staticmethod
    def block_catalog_gate(blocks: list[dict[str, object]]) -> object:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.request = Mock(return_value={"blocks": blocks})
        return gate

    @staticmethod
    def inbox_review_block(block_id: str | None = None) -> dict[str, object]:
        return {
            "id": block_id or workflow_e2e.WorkflowGate.REVIEW_BLOCK_ID,
            "kind": "block",
            "label": "Inbox review",
            "public": True,
            "waits": True,
            "config_schema": {
                "type": "object",
                "required": ["prompt"],
                "properties": {
                    "prompt": {"type": "string"},
                    "approve_label": {"type": "string"},
                    "reject_label": {"type": "string"},
                    "priority": {"type": "string"},
                },
            },
            "output_schema": {
                "type": "object",
                "properties": {"outcome": {"enum": ["approve", "reject"]}},
            },
            "ports": [{"id": "then"}, {"id": "else"}, {"id": "failed"}],
        }

    @staticmethod
    def run_code_block() -> dict[str, object]:
        return {
            "id": workflow_e2e.WorkflowGate.RUN_CODE_BLOCK_ID,
            "kind": "block",
            "label": "Run Code",
            "public": True,
            "config_wc": "kickside-code-body",
            "input_schema": {"type": "object", "additionalProperties": True},
            "config_schema": {
                "type": "object",
                "additionalProperties": False,
                "required": ["code"],
                "properties": {
                    "code": {"type": "string", "format": "textarea"},
                    "tool_ids": {"type": "array", "items": {"type": "string"}},
                    "method": {"type": "string"},
                },
            },
            "output_schema": {
                "type": "object",
                "additionalProperties": False,
                "required": ["ok"],
                "properties": {
                    "ok": {"type": "boolean"},
                    "result": {},
                    "error": {"type": "object"},
                },
            },
            "ports": [{"id": "result"}, {"id": "error"}],
        }

    def test_block_catalog_reads_the_canonical_endpoint_and_exact_inbox_ref(self) -> None:
        gate = self.block_catalog_gate([self.inbox_review_block()])
        self.assertEqual(gate.assert_block_catalog(expect_code_execution=False)["id"], gate.REVIEW_BLOCK_ID)
        gate.request.assert_called_once_with("GET", "/api/v1/workflows/blocks")

    def test_block_catalog_rejects_a_noncanonical_inbox_ref(self) -> None:
        gate = self.block_catalog_gate([self.inbox_review_block("kickside.inbox:block.legacy")])
        with self.assertRaisesRegex(workflow_e2e.GateFailure, "expected one public Inbox review Block"):
            gate.assert_block_catalog(expect_code_execution=False)

    def test_block_catalog_accepts_the_single_canonical_run_code_block(self) -> None:
        gate = self.block_catalog_gate([
            self.inbox_review_block(),
            self.run_code_block(),
        ])
        self.assertEqual(
            gate.assert_block_catalog(expect_code_execution=True)["id"],
            gate.REVIEW_BLOCK_ID,
        )

    def test_block_catalog_rejects_retired_code_and_action_blocks(self) -> None:
        gate = self.block_catalog_gate([
            self.inbox_review_block(),
            {"id": "kickside.code_execution:block.code"},
            {"id": "kickside.code_execution:block.action"},
        ])
        with self.assertRaisesRegex(workflow_e2e.GateFailure, "only the canonical Run Code Block"):
            gate.assert_block_catalog(expect_code_execution=True)

    def test_review_graph_uses_the_canonical_layout_command(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.workflow_id = "workflow-1"
        gate.request = Mock(return_value={"success": True})
        gate.state = Mock(side_effect=[
            {"nodes": [{"id": "start", "kind": "start"}, {"id": "finish", "kind": "finish"}]},
            {
                "nodes": [
                    {"id": "start", "kind": "start"},
                    {"id": "finish", "kind": "finish"},
                    {
                        "id": "e2e-inbox-review",
                        "kind": "block",
                        "ref": workflow_e2e.WorkflowGate.REVIEW_BLOCK_ID,
                    },
                    {"id": "error", "kind": "error"},
                ],
                "edges": [{"id": "a"}, {"id": "b"}, {"id": "c"}],
            },
        ])
        with tempfile.TemporaryDirectory() as directory:
            gate.snapshots = Path(directory)
            gate.assemble_review_graph()

        commands = gate.request.call_args.args[2]["commands"]
        layout_types = [command["type"] for command in commands if command["type"].startswith("layout.")]
        self.assertEqual(layout_types, ["layout.set-position", "layout.set-position"])

    def test_completed_run_reads_the_finish_result_from_the_dataflow_output_envelope(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.workflow_id = "workflow-1"
        gate.run_id = "run-1"
        gate.run_detail = Mock(return_value={
            "run": {
                "status": "completed",
                "flow_ref": {"kind": "flow", "id": "workflow-1", "version": 1},
                "output": {"result": {"outcome": "approve", "form": []}},
            },
            "nodes": [{"def_node_id": "e2e-inbox-review", "status": "completed"}],
        })
        gate.request = Mock(return_value={"events": [{"type": "run.finished"}]})
        with tempfile.TemporaryDirectory() as directory:
            gate.snapshots = Path(directory)
            snapshot = gate.assert_completed_run()

        self.assertEqual(snapshot["detail"]["run"]["output"]["result"]["outcome"], "approve")
        gate.request.assert_called_once_with(
            "GET",
            "/api/v1/workflows/workflow-1/runs/run-1/events?limit=200&offset=0",
        )

    def test_completed_run_rejects_a_flattened_finish_payload(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.workflow_id = "workflow-1"
        gate.run_id = "run-1"
        gate.run_detail = Mock(return_value={
            "run": {
                "status": "completed",
                "flow_ref": {"kind": "flow", "id": "workflow-1", "version": 1},
                "output": {"outcome": "approve"},
            },
        })
        with self.assertRaisesRegex(workflow_e2e.GateFailure, "Finish output lost decision"):
            gate.assert_completed_run()

    def test_launch_pins_the_published_workflow_version_explicitly(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.workflow_id = "workflow-1"
        gate.request = Mock(return_value={"success": True, "run_id": "run-1"})
        gate.launch()
        self.assertEqual(gate.run_id, "run-1")
        gate.request.assert_called_once_with(
            "POST",
            "/api/v1/workflows/workflow-1/run",
            {"version": 1, "input": {}},
        )

    @staticmethod
    def editor_gate() -> object:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.base_url = "http://127.0.0.1:8085"
        gate.workflow_id = "workflow-1"
        return gate

    def test_editor_frame_reuses_the_normalized_current_route(self) -> None:
        gate = self.editor_gate()
        page = Mock()
        page.url = "http://127.0.0.1:8085/c/app.views:main/workflows/workflow-1/#canvas"
        frame = object()
        gate.frame_with = Mock(return_value=frame)

        self.assertIs(gate.editor_frame(page), frame)

        page.goto.assert_not_called()
        gate.frame_with.assert_called_once_with(page, "kickside-workflow-builder", timeout=60)

    def test_editor_frame_navigates_once_from_another_route(self) -> None:
        gate = self.editor_gate()
        page = Mock()
        page.url = "http://127.0.0.1:8085/c/app.views:main/workflows"
        frame = object()
        gate.frame_with = Mock(return_value=frame)

        self.assertIs(gate.editor_frame(page), frame)

        page.goto.assert_called_once_with(
            "http://127.0.0.1:8085/c/app.views:main/workflows/workflow-1",
            wait_until="domcontentloaded",
        )

    def test_config_view_reuses_rendered_palette_and_preserves_toggle_aria(self) -> None:
        gate = self.editor_gate()
        page = Mock()
        page.url = gate.editor_url()
        frame = Mock()
        gate.frame_with = Mock(return_value=frame)

        toggle = Mock()
        toggle.count.return_value = 1
        toggle.is_visible.return_value = True
        toggle.get_attribute.side_effect = ["true", "true", "false"]
        search = Mock()
        search.is_visible.return_value = True
        choice = Mock()
        choice.count.return_value = 1
        choice.is_visible.return_value = True
        node = Mock()
        node.count.return_value = 1
        nodes = Mock()
        nodes.filter.return_value = node
        title = Mock()
        title.count.return_value = 1
        title.is_visible.return_value = True
        title.input_value.return_value = "Inbox review"

        frame.locator.side_effect = lambda selector: toggle if selector == '[data-testid="palette-toggle"]' else nodes
        frame.get_by_label.side_effect = lambda label: search if label == "Search steps" else title

        def role(_role: str, *, name: object, **_kwargs: object) -> object:
            if name == "Hide steps":
                return toggle
            if isinstance(name, re.Pattern):
                return choice
            return Mock(count=Mock(return_value=0))

        frame.get_by_role.side_effect = role

        self.assertIs(gate.open_config_view(page), frame)

        page.goto.assert_not_called()
        self.assertEqual([call.args[0] for call in search.fill.call_args_list], ["Inbox review", ""])
        toggle.click.assert_called_once_with()
        self.assertEqual(
            search.wait_for.call_args_list,
            [
                unittest.mock.call(state="visible", timeout=30_000),
                unittest.mock.call(state="hidden", timeout=30_000),
            ],
        )
        self.assertEqual(frame.evaluate.call_count, 2)

    def test_palette_rejects_rendered_and_aria_state_disagreement(self) -> None:
        gate = self.editor_gate()
        frame = Mock()
        gate.editor_frame = Mock(return_value=frame)
        toggle = Mock()
        toggle.count.return_value = 1
        toggle.get_attribute.return_value = "true"
        search = Mock()
        search.is_visible.return_value = False
        frame.locator.return_value = toggle
        frame.get_by_label.return_value = search

        with self.assertRaisesRegex(workflow_e2e.GateFailure, "visibility disagrees with aria-expanded"):
            gate.open_palette_view(Mock())

        toggle.click.assert_not_called()

    def test_dependency_fingerprint_is_stable_and_excludes_private_parameters(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.installed_dependencies = Mock(return_value={
            "dependencies": [{
                "id": "app.deps:workflows",
                "component": "kickside/workflows",
                "version": "0.1.21",
                "parameters": [{"name": "private", "value": "must-not-leak"}],
                "migrations": [{"id": "m2", "status": "applied"}, {"id": "m1", "status": "applied"}],
            }],
            "modules": [{
                "name": "kickside/workflows",
                "version": "0.1.21",
                "is_root": True,
                "transitive": False,
                "used_by": [],
            }],
        })
        fingerprint = gate.dependency_fingerprint()
        self.assertNotIn("must-not-leak", repr(fingerprint))
        self.assertEqual(fingerprint["roots"][0][3], (("m1", "applied"), ("m2", "applied")))

    def test_uninstall_preview_uses_the_canonical_payload_without_mutating(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.args = type("Args", (), {"install_timeout": 300.0})()
        gate.root_dependency = Mock(return_value={
            "id": "app.deps:workflows",
            "component": "kickside/workflows",
            "version": "0.1.21",
        })
        gate.request = Mock(return_value={"success": True, "dry_run": True, "preview": {}})
        gate.eventually = Mock()
        with tempfile.TemporaryDirectory() as directory:
            gate.snapshots = Path(directory)
            result = gate.uninstall_package("kickside/workflows", dry_run=True)
        self.assertTrue(result["dry_run"])
        gate.request.assert_called_once_with(
            "POST",
            "/api/v1/keeper/hub/dependencies/uninstall",
            {
                "id": "app.deps:workflows",
                "component": "kickside/workflows",
                "migration_policy": "down",
                "dry_run": True,
            },
            timeout=300.0,
        )
        gate.eventually.assert_not_called()

    def test_uninstall_requires_a_successful_execution_ledger(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        gate.args = type("Args", (), {"install_timeout": 300.0})()
        gate.root_dependency = Mock(return_value={"id": "app.deps:workflows"})
        gate.request = Mock(return_value={
            "success": True,
            "payload": {"execution": [{"step": "remove.entries", "status": "ok"}]},
        })
        gate.eventually = Mock()
        with tempfile.TemporaryDirectory() as directory:
            gate.snapshots = Path(directory)
            gate.uninstall_package("kickside/workflows")
        gate.eventually.assert_called_once()

    def test_full_lifecycle_preserves_explicit_code_execution_root_and_reuses_profile_package(self) -> None:
        gate = object.__new__(workflow_e2e.WorkflowGate)
        workflows = {"component": "kickside/workflows", "parameters": [{"name": "p", "value": "v"}]}
        roots = {
            "kickside/code-execution": {"id": "app.deps:code_execution", "version": "0.1.8"},
            "kickside/blocks": {"id": "app.deps:blocks", "version": "0.1.0"},
            "kickside/workflows": {"id": "app.deps:workflows", "version": "0.1.21"},
        }
        gate.root_dependency = Mock(side_effect=lambda component: roots.get(component))
        gate.uninstall_package = Mock()
        gate.dependency_fingerprint = Mock(return_value={"roots": [("app.deps:workflows",)]})
        gate.matching_creation_surfaces = Mock(return_value=[])
        gate.assert_single_creation_surface = Mock(return_value={"id": gate.AUTOMATION_SURFACE_ID})
        gate.install_package = Mock()
        gate.assert_block_catalog = Mock()

        def eventually(description: str, predicate: object) -> None:
            if "removal" in description:
                roots.pop("kickside/workflows", None)
                gate.matching_creation_surfaces.return_value = []
            else:
                roots["kickside/workflows"] = {"id": "app.deps:workflows", "version": "0.1.21"}
                gate.matching_creation_surfaces.return_value = [{"id": gate.AUTOMATION_SURFACE_ID}]
            self.assertTrue(predicate())

        gate.eventually = Mock(side_effect=eventually)
        gate.assert_workflows_lifecycle([
            {"component": "kickside/code-execution", "parameters": []},
            {"component": "kickside/blocks", "parameters": []},
            workflows,
        ])
        self.assertEqual(
            gate.uninstall_package.call_args_list,
            [
                unittest.mock.call("kickside/workflows", dry_run=True),
                unittest.mock.call("kickside/workflows"),
            ],
        )
        gate.install_package.assert_called_once_with(workflows)
        gate.assert_block_catalog.assert_called_once_with(expect_code_execution=True)


if __name__ == "__main__":
    unittest.main()
