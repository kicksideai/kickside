import json
from pathlib import Path
import unittest

from harness import load_registry


class UserVisibleIssueGuards(unittest.TestCase):
    def test_every_visible_issue_has_a_registered_browser_guard(self):
        suite = Path(__file__).resolve().parents[1]
        ledger = json.loads((suite / 'coverage/issues.json').read_text())
        audit = json.loads((suite / 'coverage/issue_audit.json').read_text())['issues']
        registry = {s.name: s for s in load_registry(suite)}
        self.assertEqual(set(audit), set(ledger['issues']))
        for issue, row in audit.items():
            with self.subTest(issue=issue):
                self.assertIsInstance(row['user_visible'], bool)
                self.assertTrue(row['reason'].strip())
                registered = {s.name for s in registry.values() if issue in s.issues}
                self.assertEqual(set(row['guards']), registered)
                self.assertEqual(set(row['harness']), {
                    name for name, guard in ledger['harness_guards'].items() if issue in guard['issues']})
                browser_guards = []
                for name, guard in row['guards'].items():
                    self.assertTrue(set(guard['types']) <= {'browser-UI', 'API-smoke'})
                    if 'browser-UI' in guard['types']:
                        self.assertTrue(guard['assertions'], name)
                        browser_guards.append(name)
                if row['user_visible']:
                    self.assertTrue(browser_guards, 'User-visible issue lacks a browser guard')
