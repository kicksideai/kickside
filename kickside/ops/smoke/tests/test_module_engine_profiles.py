import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from scenarios_module_engine_profiles import module_engine_profiles, workflow_checkout_paths


class ModuleEngineProfiles(unittest.TestCase):
    def test_base_repository_is_checked_without_verification_replacements(self):
        receipts = []
        evidence = SimpleNamespace(save=lambda name, row: receipts.append(row))
        context = SimpleNamespace(inst=SimpleNamespace(config={'replace': {}}, evidence=evidence))
        module_engine_profiles(context)
        self.assertGreater(len(receipts[0]['checked']), 0)
        self.assertEqual(receipts[0]['findings'], [])

    def workflow_root(self, directory, workflow):
        root = Path(directory) / 'source'
        (root / '.github/workflows').mkdir(parents=True)
        (root / '.github/modules.json').write_text(json.dumps({'repository': 'kickside'}))
        (root / '.github/workflows/ci.yml').write_text(workflow)
        return root

    def test_root_checkout_is_valid_for_a_job_without_a_source_workspace(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self.workflow_root(directory, '''jobs:
  legal-check:
    steps:
      - uses: actions/checkout@pinned
  source-gate:
    steps:
      - uses: actions/checkout@pinned
        with:
          path: source
''')
            self.assertEqual(workflow_checkout_paths(root), [])

    def test_job_root_override_takes_precedence_over_the_workflow_workspace(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self.workflow_root(directory, '''defaults:
  run:
    working-directory: source
jobs:
  legal-check:
    defaults:
      run:
        working-directory: .
    steps:
      - uses: actions/checkout@pinned
''')
            self.assertEqual(workflow_checkout_paths(root), [])

    def test_implicit_checkout_requires_the_declared_workspace(self):
        workflows = {
            'workflow': '''defaults:
  run:
    working-directory: source
jobs:
  source-gate:
    steps:
      - uses: actions/checkout@pinned
''',
            'job': '''jobs:
  source-gate:
    defaults:
      run:
        working-directory: source
    steps:
      - uses: actions/checkout@pinned
''',
            'step': '''jobs:
  source-gate:
    steps:
      - uses: actions/checkout@pinned
      - run: make verify
        working-directory: source
''',
        }
        for scope, workflow in workflows.items():
            with self.subTest(scope=scope), tempfile.TemporaryDirectory() as directory:
                root = self.workflow_root(directory, workflow)
                self.assertEqual(workflow_checkout_paths(root), [{
                    'workflow': str(root / '.github/workflows/ci.yml'),
                    'job': 'source-gate', 'expected': 'source', 'actual': '',
                }])

    def test_source_workspace_checkout_remains_required_when_an_explicit_path_is_wrong(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self.workflow_root(directory, '''jobs:
  source-gate:
    steps:
      - uses: actions/checkout@pinned
        with:
          path: checkout
''')
            self.assertEqual(workflow_checkout_paths(root), [{
                'workflow': str(root / '.github/workflows/ci.yml'),
                'job': 'source-gate', 'expected': 'source', 'actual': 'checkout',
            }])
