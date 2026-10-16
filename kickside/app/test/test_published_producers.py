import json
from pathlib import Path
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[2]

class PublishedProducers(unittest.TestCase):
    def test_published_event_capabilities_and_producers(self):
        baseline = json.loads(Path(__file__).with_name("published_producers.json").read_text())
        entries = {}
        for source in (ROOT / "platform").glob("*/src/**/*.yaml"):
            document = yaml.safe_load(source.read_text())
            if not isinstance(document, dict):
                continue
            for entry in document.get("entries", []) or []:
                entries[document["namespace"] + ":" + entry["name"]] = entry
        self.assertIn("kickside.inbox:dep.kickside.execution", entries)
        self.assertEqual(entries["kickside.inbox:dep.kickside.execution"]["component"], "kickside/execution")
        self.assertEqual(entries["kickside.inbox:dep.kickside.execution"]["version"], "*")
        for identity, policy in baseline["policies"].items():
            with self.subTest(policy=identity):
                self.assertIn(identity, entries)
                self.assertEqual(entries[identity]["kind"], "security.policy")
                self.assertEqual(entries[identity]["policy"], policy)
                self.assertIs(entries[identity].get("meta", {}).get("private"), True)
                self.assertIs(entries[identity].get("meta", {}).get("service_only"), True)
                self.assertFalse(entries[identity].get("groups"))
        for identity, policies in baseline["producers"].items():
            with self.subTest(producer=identity):
                self.assertIn(identity, entries)
                self.assertTrue(set(policies).issubset(entries[identity].get("security", {}).get("policies", []) or []))

if __name__ == "__main__":
    unittest.main()
