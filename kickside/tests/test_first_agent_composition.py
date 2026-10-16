from pathlib import Path
import unittest

import yaml


APP = Path(__file__).resolve().parents[1] / "app"


class FirstAgentCompositionTest(unittest.TestCase):
    def test_first_agent_module_has_the_host_bindings(self):
        entries = yaml.safe_load((APP / "src/app/deps/_index.yaml").read_text())["entries"]
        dependencies = [entry for entry in entries if entry.get("component") == "kickside/agent-onboarding"]
        self.assertEqual(len(dependencies), 1)
        dependency = dependencies[0]
        self.assertEqual(dependency["kind"], "ns.dependency")
        self.assertEqual(dependency["version"], "*")
        self.assertEqual({parameter["name"]: parameter["value"] for entry in entries if entry.get("component") in {"kickside/agent-onboarding", "kickside/knowledge", "kickside/crm"} for parameter in entry.get("parameters", [])}, {
            "kickside.agent_onboarding:ui_server": "app:gateway",
        })

    def test_host_parameters_belong_to_their_dependency(self):
        entries = yaml.safe_load((APP / "src/app/deps/_index.yaml").read_text())["entries"]
        owners = {"kickside.agent_onboarding": "kickside/agent-onboarding", "kickside.knowledge": "kickside/knowledge", "kickside.knowledge.security": "kickside/knowledge", "kickside.crm.security": "kickside/crm"}
        for entry in entries:
            if entry.get("component") in set(owners.values()):
                for parameter in entry.get("parameters", []):
                    self.assertEqual(owners[parameter["name"].split(":")[0]], entry["component"])

    def test_preset_capabilities_remain_optional_hub_installs(self):
        optional = {'kickside/crm', 'kickside/webscout', 'kickside/knowledge'}
        lock = yaml.safe_load((APP / 'wippy.lock').read_text())
        self.assertFalse(optional & {module['name'] for module in lock['modules']})
        for path in (APP / 'src').rglob('*.yaml'):
            entries = yaml.safe_load(path.read_text()).get('entries', [])
            self.assertFalse(optional & {entry.get('component') for entry in entries if entry.get('kind') == 'ns.dependency'}, str(path))

    def test_onboarding_profiles_exclude_retired_cron(self):
        entries = yaml.safe_load((APP / "src/app/composition/_index.yaml").read_text())["entries"]
        profiles = [entry for entry in entries if entry.get("meta", {}).get("type") == "kickside.hub:onboarding_profile"]
        self.assertTrue(profiles)
        for profile in profiles:
            self.assertNotIn("kickside/cron", [package["component"] for package in profile.get("packages", [])])


if __name__ == "__main__":
    unittest.main()
