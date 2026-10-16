"""Published registry contracts inspect product delivery sources."""
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[3]
TEST_WORK = Path(os.environ['TMPDIR']) / 'published-registry-contract'
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'ops' / 'smoke'))
from ops.compat.inventory import discover
from scenarios_published_registry_contract import product_repositories
import scenarios_published_registry_contract as guard
from harness import Failure


class PublishedRegistryContractTests(unittest.TestCase):
    def setUp(self):
        TEST_WORK.mkdir(parents=True, exist_ok=True)

    def temporary_directory(self):
        return tempfile.TemporaryDirectory(dir=TEST_WORK)

    def declared_repository(self, root, name, modules):
        repository = root / name
        (repository / '.github').mkdir(parents=True)
        (repository / '.github' / 'modules.json').write_text(json.dumps({'modules': modules}))
        for relative, module in modules.items():
            path = repository / module.get('path', relative)
            path.mkdir(parents=True)
            (path / 'wippy.yaml').write_text(
                'organization: ' + module['organization'] + '\nmodule: ' + module['module'] + '\n')
        return repository

    def test_excludes_nested_undeclared_test_host(self):
        with self.temporary_directory() as directory:
            root = Path(directory)
            repository = self.declared_repository(root, 'product', {
                'core': {'organization': 'kickside', 'module': 'core', 'path': 'core', 'embed': []},
            })
            readonly = repository / 'test-host'
            readonly.mkdir()
            (readonly / 'wippy.yaml').write_text('organization: keeper\nmodule: keeper-test\n')

            repositories = product_repositories({
                'kickside/core': str(repository / 'core'),
                'keeper/keeper-test': str(readonly),
            })

            self.assertEqual(repositories, [repository])

    def test_excludes_test_host_nested_below_a_standalone_delivery_root(self):
        with self.temporary_directory() as directory:
            root = Path(directory)
            product = root / 'keeper'
            product.mkdir()
            (product / 'wippy.yaml').write_text('organization: keeper\nmodule: keeper\n')
            test_host = product / 'test'
            test_host.mkdir()
            (test_host / 'wippy.yaml').write_text('organization: keeper\nmodule: keeper-test\n')

            self.assertEqual(product_repositories({
                'keeper/keeper-test': str(test_host),
            }), [])

    def test_keeps_standalone_product_manifest_without_delivery_inventory(self):
        with self.temporary_directory() as directory:
            standalone = Path(directory) / 'standalone'
            standalone.mkdir()
            (standalone / 'wippy.yaml').write_text(
                'organization: kickside\nmodule: standalone-product\nembed: []\n')

            self.assertEqual(product_repositories({
                'kickside/standalone-product': str(standalone),
            }), [standalone])

    def test_uses_manifest_identity_when_delivery_plan_uses_older_schema(self):
        with self.temporary_directory() as directory:
            root = Path(directory)
            repository = self.declared_repository(root, 'product', {
                'core': {'organization': 'kickside', 'module': 'core', 'embed': []},
            })

            self.assertEqual(product_repositories({
                'kickside/core': str(repository / 'core'),
            }), [repository])

    def test_keeps_each_repository_with_a_declared_product_replacement(self):
        with self.temporary_directory() as directory:
            root = Path(directory)
            first = self.declared_repository(root, 'first', {
                'core': {'organization': 'kickside', 'module': 'core', 'path': 'core', 'embed': []},
                'security': {'organization': 'kickside', 'module': 'security', 'path': 'security', 'embed': []},
            })
            second = self.declared_repository(root, 'second', {
                'component': {'organization': 'kickside', 'module': 'component', 'path': 'component', 'embed': []},
            })

            repositories = product_repositories({
                'kickside/core': str(first / 'core'),
                'kickside/component': str(second / 'component'),
            })

            self.assertEqual(repositories, [first, second])
            self.assertEqual(set(discover(repositories)), {
                'kickside/core', 'kickside/security', 'kickside/component',
            })


class PublishedRetirementTests(unittest.TestCase):
    def run_guard(self, declarations, current=None):
        TEST_WORK.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=TEST_WORK) as directory:
            root = Path(directory)
            (root / 'ops/compat').mkdir(parents=True)
            (root / 'ops/compat/transitions.json').write_text(json.dumps(declarations))
            (root / 'proof.md').write_text('Owner-approved removal PR evidence')
            evidence = []
            context = SimpleNamespace(inst=SimpleNamespace(
                config={'replace': {}}, root=root,
                evidence=SimpleNamespace(save=lambda key, value: evidence.append(value))))
            published = {'sample.tools:reader': {'Kind': 'function.lua', 'Meta': {}, 'Data': {}}}
            baseline = {'version': '1.0.0', 'sha256': 'fixture', 'entries': published}
            with patch.object(guard, '__file__', str(root / 'ops/smoke/scenario.py')), \
                 patch.object(guard, 'product_repositories', return_value=[root]), \
                 patch('ops.compat.inventory.discover', return_value={'sample/tools': {'released': True}}), \
                 patch('ops.compat.inventory.local_entries', return_value=current or {}), \
                 patch('ops.compat.fetch_baselines.Hub') as hub:
                hub.return_value.baseline.return_value = baseline
                guard.published_registry_contract(context)
            return evidence[0]

    def declaration(self):
        return {'module': 'sample/tools', 'baseline': '1.0.0', 'id': 'sample.tools:reader',
                'code': 'removed_id', 'path': '', 'reason': 'Owner retires the tool',
                'proof': 'proof.md', 'owner_approval': '2026-10-14 owner: remove ReadToolResult/result window'}

    def test_owner_retirements_have_exact_identity_and_approval(self):
        declarations = json.loads((ROOT / 'ops/compat/transitions.json').read_text())
        retired = {
            'kickside/agents': ('0.1.63', ('kickside.agents:read_tool_result',
                'kickside.agents.result_window:executor', 'kickside.agents.result_window:apply',
                'kickside.agents.result_window:wrapper', 'kickside.agents.result_window:bounded_results')),
            'kickside/contract': ('0.2.4', ('kickside.contract:tool_result_window',
                'kickside.contract:result_window')),
            'kickside/mcp-client': ('0.1.15', ('kickside.mcp_client:result_bounds',)),
            'kickside/uploads': ('0.1.71', ('kickside.uploads:result_window_binding',
                'kickside.uploads:bound_tool_result', 'kickside.uploads:read_tool_result',
                'kickside.uploads:inspect_tool_result')),
        }
        for module, (baseline, identities) in retired.items():
            for identity in identities:
                with self.subTest(identity=identity):
                    matches = [row for row in declarations if row['module'] == module
                               and row['baseline'] == baseline and row['id'] == identity]
                    self.assertEqual(len(matches), 1)
                    row = matches[0]
                    self.assertEqual(row['code'], 'removed_id')
                    self.assertEqual(row['path'], '')
                    self.assertEqual(row['owner_approval'],
                                     '2026-10-14 owner: remove ReadToolResult/result window')
                    self.assertTrue((ROOT / row['proof']).is_file())

    def test_unrecorded_removal_fails(self):
        with self.assertRaisesRegex(Failure, 'removed_id'):
            self.run_guard([])

    def test_recorded_removal_passes_and_preserves_evidence(self):
        report = self.run_guard([self.declaration()])
        self.assertEqual(report['findings'][0]['status'], 'transition')
        self.assertEqual(report['findings'][0]['transition']['proof'], 'proof.md')

    def test_stale_record_fails(self):
        with self.assertRaisesRegex(ValueError, 'stale'):
            self.run_guard([self.declaration()], {
                'sample.tools:reader': {'Kind': 'function.lua', 'Meta': {}, 'Data': {}}})


if __name__ == '__main__':
    unittest.main()
