from contextlib import nullcontext
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import yaml

from harness import Failure
from scenarios_selected_install import _prepare, NS, TYPE
import scenarios_selected_install as selected


class SharedSourceFixtureTests(unittest.TestCase):
    def fixture(self, root):
        source = root / 'source'
        probe = source / 'platform/users/test/suites/bot_install_probe.lua'
        probe.parent.mkdir(parents=True)
        probe.write_text('return { prepare = function() return {} end }')
        app = root / 'app'
        (app / 'src').mkdir(parents=True)
        inst = SimpleNamespace(app=app, config={'source': str(source)}, install=Mock())
        return inst, probe

    def test_distinct_consumers_refresh_one_shared_runtime_source_fixture(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as scratch:
            inst, probe = self.fixture(Path(scratch))
            first = SimpleNamespace(inst=inst, paused=Mock(side_effect=nullcontext))
            second = SimpleNamespace(inst=inst, paused=Mock(side_effect=nullcontext))
            _prepare(first)
            probe.write_text('return { prepare = function() return { updated = true } end }')
            _prepare(second)
            directory = inst.app / 'src/selected-install-smoke'
            self.assertEqual((directory / 'prepare.lua').read_text(), probe.read_text())
            declaration = yaml.safe_load((directory / '_index.yaml').read_text())
            self.assertEqual(declaration['namespace'], NS)
            binding = next(entry for entry in declaration['entries'] if entry['name'] == TYPE.split(':')[1])
            self.assertEqual(binding['contracts'], [
                {'contract': 'kickside.contract:installable', 'methods': {'install': NS + ':prepare'}},
                {'contract': 'kickside.automation:prepared_installable', 'methods': {'prepare_install': NS + ':prepare'}},
            ])
            first.paused.assert_called_once_with()
            second.paused.assert_called_once_with()
            self.assertEqual(inst.install.call_count, 2)

    def test_a_file_at_the_fixture_directory_remains_an_error(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as scratch:
            inst, _ = self.fixture(Path(scratch))
            collision = inst.app / 'src/selected-install-smoke'
            collision.write_text('existing source file')
            context = SimpleNamespace(inst=inst, paused=Mock(side_effect=nullcontext))
            with self.assertRaises(FileExistsError):
                _prepare(context)
            self.assertEqual(collision.read_text(), 'existing source file')


class SelectedInstallAllocationTests(unittest.TestCase):
    tables = (
        'kickside_components', 'kickside_component_access', 'kickside_execution_identity_audit',
        'kickside_automation_drive', 'kickside_automation_op', 'kickside_automation_command',
    )

    def test_refused_root_has_no_component_access_audit_drive_operation_or_command(self):
        inst = object()
        with patch.object(selected, 'database_rows', return_value=[]) as rows:
            selected.assert_unallocated_root(inst, 'refused-root')
        observed = []
        for call in rows.call_args_list:
            self.assertIs(call.args[0], inst)
            self.assertIn("='refused-root'", call.args[1])
            observed.append(call.args[1].split(' FROM ', 1)[1].split(' WHERE ', 1)[0])
        self.assertCountEqual(observed, self.tables)

    def test_each_residual_table_refuses_the_no_allocation_proof(self):
        for table in self.tables:
            with self.subTest(table=table):
                def rows(inst, query):
                    return [{'retained': True}] if ' FROM ' + table + ' WHERE ' in query else []

                with patch.object(selected, 'database_rows', side_effect=rows):
                    with self.assertRaisesRegex(Failure, table):
                        selected.assert_unallocated_root(object(), 'refused-root')

    def test_database_failure_cannot_become_an_empty_allocation_proof(self):
        with patch.object(selected, 'database_rows', side_effect=RuntimeError('allocation query fails')):
            with self.assertRaisesRegex(RuntimeError, 'allocation query fails'):
                selected.assert_unallocated_root(object(), 'refused-root')
