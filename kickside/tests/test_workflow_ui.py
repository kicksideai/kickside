import pathlib
import unittest
import yaml

ROOT = pathlib.Path(__file__).resolve().parents[1]

class WorkflowSinkUiTest(unittest.TestCase):
    def test_run_sink_uses_shared_picker_for_exact_published_reference(self):
        entries = yaml.safe_load((ROOT / "platform/workflows/src/_index.yaml").read_text())["entries"]
        sink = next(entry for entry in entries if entry["name"] == "run_sink")
        field = sink["config_schema"]["flow_ref"]
        self.assertEqual(field.get("picker"), "wc-component-picker")
        self.assertEqual(field.get("source"), "/api/v1/workflows/published")
        self.assertEqual(field.get("value_field"), "flow_ref")
        self.assertTrue(field["required"])
        self.assertNotRegex(sink["meta"]["comment"], r"design|§|v5")
