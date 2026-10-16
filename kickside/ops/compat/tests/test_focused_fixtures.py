import os
from pathlib import Path
import shutil
import tempfile
import unittest
import subprocess
from unittest.mock import patch

import yaml

from ops.compat.integration.test_run_as_upgrade import make_runtime, remove_test_entries


class FocusedFixtureTests(unittest.TestCase):
    def test_tracked_harness_materializes_source_files_and_excludes_module_mounts(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            harness = root / 'module/test'
            harness.mkdir(parents=True)
            production = root / 'module/src'
            production.mkdir()
            (root / 'module/wippy.yaml').write_text('directories: {src: src}\n')
            (production / 'implementation.lua').write_text('return {run = function() end}\n')
            (harness / 'selected.lua').symlink_to('../src/implementation.lua')
            (harness / 'src_link').symlink_to('../src', target_is_directory=True)
            (harness / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'proof', 'entries': [
                {'name': 'selected', 'kind': 'library.lua', 'source': 'file://selected.lua'}]}))
            (harness / '.wippy.yaml').write_text('vars: {}\n')
            integration = root / 'ops/compat/integration'
            integration.mkdir(parents=True)
            (integration / 'proof.lua').write_text('return {}\n')
            shutil.copy(Path(__file__).resolve().parents[1] / 'integration/http_readiness.lua',
                        integration / 'http_readiness.lua')
            subprocess.run(['git', 'init', '-q', str(root)], check=True)
            subprocess.run(['git', '-C', str(root), 'add', '.'], check=True)
            (harness / 'untracked.lua').write_text('error("scratch source")\n')
            with patch('ops.compat.integration.test_run_as_upgrade.ROOT', root), patch(
                    'ops.compat.integration.test_run_as_upgrade.discover',
                    return_value={'example/module': {'directory': root / 'module'}}):
                _, source, _ = make_runtime(root, Path('module/test'), Path('module/test'),
                                            'proof.lua', 'proof-runtime', {'selected': 'proof:selected'}, [])
            self.assertEqual((source / 'selected.lua').read_text(),
                             (production / 'implementation.lua').read_text())
            self.assertFalse((source / 'selected.lua').is_symlink())
            self.assertFalse((source / 'src_link').exists())
            self.assertFalse((source / 'untracked.lua').exists())

    def test_selected_proof_retains_declared_dynamic_call_targets(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            dependencies = ('app:credential_actions', 'app:echo_tool')
            _, source, _ = make_runtime(
                Path(directory), Path('platform/mcp/test-bot-accounts/src'),
                Path('platform/mcp/test-bot-accounts'), 'run_as_mcp_upgrade.lua',
                'credential-proof', {}, ['sql'], depends_on=dependencies,
            )
            entries = yaml.safe_load((source / '_index.yaml').read_text())['entries']
            self.assertTrue({'credential_actions', 'echo_tool'} <= {row['name'] for row in entries})
            proof = next(row for row in entries if row['name'] == 'run_as_upgrade')
            self.assertEqual(proof['meta']['depends_on'], list(dependencies))
            self.assertNotIn('bot_accounts_test', {row['name'] for row in entries})

    def test_published_dispatch_proof_retains_dynamic_factory_and_job_dependencies(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            _, source, _ = make_runtime(
                Path(directory), Path('platform/automation/test/src'), Path('platform/automation/test'),
                'run_as_automation_upgrade.lua', 'automation-proof',
                {'round_harness': 'kickside.automation:round_harness'}, ['sql'],
            )
            identities = {document['namespace'] + ':' + row['name']
                          for index in source.rglob('*.yaml')
                          for document in [yaml.safe_load(index.read_text())]
                          for row in document.get('entries', [])}
            self.assertTrue({'kickside.automation:round_single_worker_pool',
                             'kickside.automation:round_live_probe'} <= identities)
            self.assertNotIn('kickside.automation:automation_test_engine', identities)

    def test_host_process_factories_remain_available_without_auto_start(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            index = source / '_index.yaml'
            factory = {'name': 'worker', 'kind': 'process.lua', 'method': 'main',
                       'imports': {'helper': 'app:factory_helper'}}
            helper = {'name': 'factory_helper', 'kind': 'library.lua'}
            index.write_text(yaml.safe_dump({'namespace': 'app', 'entries': [factory, helper]}))
            remove_test_entries(source, roots=[])
            self.assertEqual(yaml.safe_load(index.read_text())['entries'], [factory, helper])

    def test_selected_proof_keeps_functions_bound_by_runtime_configuration(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            index = source / '_index.yaml'
            database = {'name': 'db', 'kind': 'db.sql.sqlite', 'file': ':memory:'}
            configured = {'name': 'configured', 'kind': 'function.lua', 'method': 'check'}
            variable = {'name': 'variable', 'kind': 'library.lua'}
            unused = {'name': 'unused', 'kind': 'function.lua', 'method': 'check'}
            index.write_text(yaml.safe_dump({'namespace': 'app', 'entries': [
                database, configured, variable, unused]}))
            remove_test_entries(source, roots={
                'override': {'module:endpoint:imports.check': 'app:configured'},
                'vars': {'nested': {'resolver': 'app:variable'}},
            })
            self.assertEqual(yaml.safe_load(index.read_text())['entries'],
                             [database, configured, variable])

    def test_selected_proof_keeps_transitive_fixtures_and_excludes_unused_current_helpers(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            index = source / '_index.yaml'
            host = {'name': 'db', 'kind': 'db.sql.sqlite', 'file': ':memory:'}
            binding = {'name': 'binding', 'kind': 'contract.binding',
                       'methods': {'check': 'proof:bound_helper'}}
            helper = {'name': 'helper', 'kind': 'library.lua',
                      'imports': {'nested': 'nested:selected'},
                      'meta': {'depends_on': ['proof:configuration']}}
            configuration = {'name': 'configuration', 'kind': 'registry.entry',
                             'meta': {'test_fixture': True}, 'value': 'retained'}
            bound = {'name': 'bound_helper', 'kind': 'function.lua', 'method': 'check'}
            unused = {'name': 'unused_engine', 'kind': 'library.lua',
                      'imports': {'current_only': 'published:unavailable'}}
            case = {'name': 'suite_case', 'kind': 'function.lua', 'meta': {'type': 'test'}}
            index.write_text(yaml.safe_dump({'namespace': 'proof', 'entries': [
                host, binding, helper, configuration, bound, unused, case]}))
            nested = source / 'nested'
            nested.mkdir()
            selected = {'name': 'selected', 'kind': 'library.lua', 'meta': {'test_fixture': True}}
            nested_index = nested / '_index.yaml'
            nested_index.write_text(yaml.safe_dump({'namespace': 'nested', 'entries': [selected]}))
            remove_test_entries(source, roots=['proof:helper'])
            self.assertEqual(yaml.safe_load(index.read_text())['entries'],
                             [host, binding, helper, configuration, bound])
            self.assertEqual(yaml.safe_load(nested_index.read_text())['entries'], [selected])
            remove_test_entries(source, roots=['proof:helper'])
            self.assertEqual(yaml.safe_load(index.read_text())['entries'],
                             [host, binding, helper, configuration, bound])

    def test_published_automation_host_does_not_mount_current_module_source(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            _, source, _ = make_runtime(
                Path(directory), Path('platform/automation/test/src'), Path('platform/automation/test'),
                'run_as_automation_upgrade.lua', 'automation-proof', {}, ['sql'],
            )
            self.assertFalse((source / 'src_link').exists())
            self.assertTrue((source / 'suites/round/harness.lua').is_file())
            document = yaml.safe_load((source / '_index.yaml').read_text())
            dependencies = {row.get('component') for row in document['entries'] if row['kind'] == 'ns.dependency'}
            self.assertIn('kickside/automation', dependencies)
            for index in source.rglob('*.yaml'):
                for entry in (yaml.safe_load(index.read_text()) or {}).get('entries', []):
                    location = entry.get('source', '')
                    if location.startswith('file://'):
                        self.assertTrue((index.parent / location[7:]).is_file(), (index, entry['name']))

    def test_users_upgrade_host_does_not_mount_the_bot_installation_suite(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            _, source, _ = make_runtime(
                Path(directory), Path('platform/users/test'), Path('platform/users/test'),
                'run_as_users_upgrade.lua', 'users-proof', {}, ['sql'],
            )
            entries = yaml.safe_load((source / '_index.yaml').read_text())['entries']
            names = {entry['name'] for entry in entries}
            self.assertTrue({'db', 'processes', 'api', 'gateway', 'run_as_upgrade'} <= names)
            self.assertTrue({'prepared_bot_task', 'bot_install_prepare', 'bot_install_probe'}.isdisjoint(names))

    def test_focused_proof_excludes_declared_suite_fixtures_and_keeps_host_entries(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            index = source / '_index.yaml'
            rows = [
                {'name': 'suite_case', 'kind': 'function.lua', 'meta': {'type': 'test'}},
                {'name': 'selected_binding', 'kind': 'contract.binding',
                 'meta': {'type': 'example.component', 'test_fixture': True},
                 'contracts': [{'contract': 'example:new_contract'}]},
                {'name': 'selected_helper', 'kind': 'function.lua',
                 'meta': {'test_fixture': True}},
                {'name': 'process_probe', 'kind': 'process.lua',
                 'meta': {'test_fixture': True}},
                {'name': 'database', 'kind': 'db.sql.sqlite', 'file': ':memory:'},
                {'name': 'host_binding', 'kind': 'contract.binding',
                 'meta': {'test_fixture': False}},
                {'name': 'host_helper', 'kind': 'library.lua'},
            ]
            index.write_text(yaml.safe_dump({'namespace': 'app', 'entries': rows}))
            remove_test_entries(source)
            self.assertEqual(yaml.safe_load(index.read_text())['entries'], rows[4:])
            remove_test_entries(source)
            self.assertEqual(yaml.safe_load(index.read_text())['entries'], rows[4:])

    def test_fixture_selection_covers_nested_namespaces_without_rewriting_metadata(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            source = Path(directory)
            nested = source / 'resources'
            nested.mkdir()
            index = nested / '_index.yaml'
            host = {'name': 'guard', 'kind': 'contract.binding',
                    'meta': {'type': 'credential.guard'}, 'contracts': []}
            index.write_text(yaml.safe_dump({'namespace': 'host', 'entries': [host,
                {'name': 'stub', 'kind': 'registry.entry', 'meta': {'test_fixture': True}}]}))
            remove_test_entries(source)
            self.assertEqual(yaml.safe_load(index.read_text()), {'namespace': 'host', 'entries': [host]})
