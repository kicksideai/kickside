import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).with_name('delivery.py')
SPEC = importlib.util.spec_from_file_location('delivery', SCRIPT)
DELIVERY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DELIVERY)

class PublicationTest(unittest.TestCase):
    def module(self):
        return {'path': 'platform/inbox', 'type': 'plugin', 'visibility': 'public',
                'embed': ['kickside.inbox:ui_fs']}

    def test_dry_run_has_exact_version_and_metadata(self):
        args = DELIVERY.publish_command(self.module(), '0.2.1', True)
        self.assertEqual(args, ['wippy', 'publish', '--config', 'platform/inbox',
            '--version', '0.2.1', '--create', '--module-visibility', 'public',
            '--module-type', 'plugin', '--embed', 'kickside.inbox:ui_fs', '--dry-run'])

    def test_real_publish_requires_token(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, 'WIPPY_TOKEN'):
                DELIVERY.publish_command(self.module(), '0.2.1', False)

    def test_missing_or_non_release_version_fails(self):
        for version in ['', 'latest', 'v0.2.1', '0.2']:
            with self.subTest(version=version), self.assertRaises(ValueError):
                DELIVERY.publish_command(self.module(), version, True)

    def test_released_paths_never_expand_to_unreleased_dependencies(self):
        modules = {'a': {'path': 'a'}, 'b': {'path': 'b'}}
        self.assertEqual(DELIVERY.released_modules(modules, ['b']), [modules['b']])
        with self.assertRaises(ValueError):
            DELIVERY.released_modules(modules, ['unknown'])
        with self.assertRaises(ValueError):
            DELIVERY.released_modules(modules, ['b', 'b'])

    def test_template_cannot_publish_placeholder(self):
        module = self.module() | {'organization': 'acme', 'module': 'starter'}
        with self.assertRaisesRegex(ValueError, 'placeholder'):
            DELIVERY.validate_identity(module)

    def test_app_lock_receipt_rejects_modified_lock_and_wrong_release(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'app').mkdir()
            (root / '.github').mkdir()
            lock = root / 'app/wippy.lock'
            lock.write_text('modules: []\n')
            DELIVERY.write_app_lock_receipt(root, '0.2.1')
            DELIVERY.check_app_lock_receipt(root, '0.2.1')
            with self.assertRaisesRegex(ValueError, 'version'):
                DELIVERY.check_app_lock_receipt(root, '0.2.2')
            lock.write_text('modules: [changed]\n')
            with self.assertRaisesRegex(ValueError, 'digest'):
                DELIVERY.check_app_lock_receipt(root, '0.2.1')

    def test_support_is_local_only_and_workspace_has_both_backends(self):
        root = Path(__file__).resolve().parents[2]
        plan = json.loads((root / '.github/modules.json').read_text())
        self.assertNotIn('test-support', plan['modules'])
        for module in plan['modules'].values():
            self.assertNotEqual(module['path'], 'test-support')
        workspace = plan['modules']['workspace']
        self.assertIn('postgres', workspace['profiles'])
        self.assertTrue(workspace['pg_database'])

    def test_missing_local_support_fails_before_dependency_install(self):
        with tempfile.TemporaryDirectory() as directory:
            harness = Path(directory) / 'graph/test'
            harness.mkdir(parents=True)
            (harness / '.wippy.yaml').write_text('workspace:\n  replacements:\n    chestor/test-support: ../../test-support\n')
            with patch.object(DELIVERY, 'run') as run:
                with self.assertRaisesRegex(ValueError, 'test-support'):
                    DELIVERY.prepare_harness({'path': 'graph'}, harness)
                run.assert_not_called()

    def test_failed_event_in_a_passing_test_name_is_not_a_failure_verdict(self):
        DELIVERY.check_test_output('appends a FAILED event from an error string\nPASSED\n35 tests')

    def test_runner_rejects_false_green_and_empty_suite(self):
        for output in ['No tests found', 'FAILED: assertion', 'boot only']:
            with self.subTest(output=output), self.assertRaises(ValueError):
                DELIVERY.check_test_output(output)
        DELIVERY.check_test_output('3 tests PASSED')


    def test_harness_lint_uses_the_test_engine_and_database(self):
        for engine in ['sqlite', 'postgres']:
            for runner in [None, 'crm']:
                with self.subTest(engine=engine, runner=runner), tempfile.TemporaryDirectory() as directory:
                    harness = Path(directory)
                    (harness / '.wippy.yaml').write_text('vars:\n  sqlite_path: ":memory:"\n')
                    module = {'path': 'fixture', 'profiles': ['postgres'], 'pg_database': 'fixture'}
                    if runner:
                        module['test_runner'] = runner
                    with patch.object(DELIVERY, 'prepare_harness'), patch.object(DELIVERY, 'run', return_value='3 tests PASSED') as run:
                        DELIVERY.test_harness(module, harness, engine)
                    calls = [call.args for call in run.call_args_list]
                    lint = next(call for call in calls if call[0][:2] == ['wippy', 'lint'])
                    test = next(call for call in calls if call[0][:2] in [['wippy', 'test'], ['bash', './run.sh']])
                    self.assertEqual(lint[0][2:], test[0][2:])
                    self.assertEqual(lint[1], harness)
                    self.assertLess(calls.index(lint), calls.index(test))
                    if engine == 'postgres':
                        self.assertIn('--profile', lint[0])
                        self.assertIn('postgres', lint[0])
                        database = next(call[0][1] for call in calls if call[0][0] == 'createdb')
                        self.assertIn('vars.pg_database=' + database, lint[0])
                    else:
                        self.assertTrue(any(arg.startswith('vars.sqlite_path=') for arg in lint[0]))

    def test_harness_lint_failure_stops_tests_and_drops_scratch_database(self):
        with tempfile.TemporaryDirectory() as directory:
            harness = Path(directory)
            (harness / '.wippy.yaml').write_text('vars: {}\n')
            module = {'path': 'fixture', 'profiles': ['postgres'], 'pg_database': 'fixture'}
            failure = RuntimeError('fixture lint error')
            def invoke(args, *positional, **keywords):
                if args[:2] == ['wippy', 'lint']:
                    raise failure
                return '3 tests PASSED'
            with patch.object(DELIVERY, 'prepare_harness'), patch.object(DELIVERY, 'run', side_effect=invoke) as run:
                with self.assertRaises(RuntimeError) as caught:
                    DELIVERY.test_harness(module, harness, 'postgres')
            self.assertIs(caught.exception, failure)
            commands = [call.args[0] for call in run.call_args_list]
            database = next(command[1] for command in commands if command[0] == 'createdb')
            self.assertEqual(commands[-1], ['dropdb', '--force', database])
            self.assertFalse(any(command[:2] == ['wippy', 'test'] for command in commands))

if __name__ == '__main__':
    unittest.main()
