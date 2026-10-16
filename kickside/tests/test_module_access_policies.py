"""Module access is selectable and admits only owned member endpoints."""
from pathlib import Path
import unittest
import yaml
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'ops/smoke'))
from scenarios_endpoint_access import pattern_conditions

class ModuleAccessPolicies(unittest.TestCase):
    def test_every_runtime_module_declares_one_selectable_policy(self):
        for category in ("core", "platform", ""):
            for module in sorted((ROOT / category).iterdir()):
                if not (module / "wippy.yaml").is_file() or module.name == "ui-kit":
                    continue
                if not category and yaml.safe_load((module / "wippy.yaml").read_text()).get("type") != "plugin":
                    continue
                with self.subTest(module=module.name):
                    selected = []
                    for source in (module / "src").rglob("*.yaml"):
                        document = yaml.safe_load(source.read_text())
                        if not isinstance(document, dict):
                            continue
                        selected.extend(entry for entry in document.get("entries", []) or []
                                        if entry.get("kind") == "security.policy"
                                        and entry.get("meta", {}).get("intent") == "module_access")
                    self.assertEqual(len(selected), 1)
                    policy = selected[0]
                    self.assertTrue(policy["meta"]["title"])
                    self.assertTrue(policy["meta"]["surface"])
                    self.assertFalse(policy["meta"].get("private", False))
                    self.assertNotIn("*", policy["policy"]["resources"])
                    self.assertEqual(list(pattern_conditions(policy["policy"].get("conditions", []))), [])
                    declarations = {}
                    for source in (module / "src").rglob("*.yaml"):
                        document = yaml.safe_load(source.read_text())
                        if not isinstance(document, dict):
                            continue
                        for entry in document.get("entries", []) or []:
                            declarations[document["namespace"] + ":" + entry["name"]] = entry
                    endpoints = {id for id, entry in declarations.items() if entry["kind"] == "http.endpoint"}
                    for entry in declarations.values():
                        if entry["kind"] != "security.policy":
                            continue
                        grant = entry["policy"]
                        actions = grant["actions"]
                        if isinstance(actions, str):
                            actions = [actions]
                        if "access" not in actions or grant["effect"] != "allow":
                            continue
                        resources = grant["resources"]
                        if isinstance(resources, str):
                            resources = [resources]
                        for resource in resources:
                            if resource in endpoints or ".api:" in resource:
                                self.assertNotIn("*", resource)
                                self.assertNotIn("conditions", grant)

if __name__ == "__main__":
    unittest.main()
