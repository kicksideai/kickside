import importlib.util
import json
import os
import re
import subprocess
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).with_name('delivery.py')
SPEC = importlib.util.spec_from_file_location('delivery', SCRIPT)
DELIVERY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DELIVERY)

class PublicationTest(unittest.TestCase):
    def test_database_manifest_declares_ownership_for_every_profile(self):
        for module in DELIVERY.plan()['modules'].values():
            if module['pg_database'] is None:
                continue
            with self.subTest(module=module['path']):
                self.assertIsInstance(module['pg_database'], dict)
                self.assertIn('pg_database', module['pg_database'])
                for variable, suffixes in module['pg_database'].items():
                    self.assertRegex(variable, r'^[A-Za-z_][A-Za-z0-9_]*$')
                    self.assertIsInstance(suffixes, list)
                    self.assertTrue(suffixes)
                    for suffix in suffixes:
                        self.assertIsInstance(suffix, str)
                        self.assertRegex(suffix, r'^[a-z0-9_]*$')

    def test_test_owned_databases_are_not_provisioned_by_the_driver(self):
        with tempfile.TemporaryDirectory(dir=DELIVERY.ROOT) as directory:
            harness = Path(directory)
            (harness / '.wippy.yaml').write_text(
                'profiles:\n  postgres:\n    override:\n'
                '      app:db:database: ${pg_database}\n'
                '      app:scratch:database: ${pg_database}_scratch\n')
            module = {'path': 'example', 'profiles': ['postgres'],
                      'pg_database': {'pg_database': ['']}}
            with patch.object(DELIVERY, 'prepare_harness'), patch.object(DELIVERY, 'run', return_value='3 tests PASSED') as run:
                DELIVERY.test_harness(module, harness, 'postgres')
            commands = [call.args[0] for call in run.call_args_list]
            created = [command[1] for command in commands if command[0] == 'createdb']
            dropped = [command[-1] for command in commands if command[0] == 'dropdb']
            self.assertEqual(len(created), 1)
            self.assertEqual(dropped, created)

    def test_database_creation_failure_drops_only_successful_creates(self):
        with tempfile.TemporaryDirectory(dir=DELIVERY.ROOT) as directory:
            harness = Path(directory)
            (harness / '.wippy.yaml').write_text(
                'vars:\n  pg_database: unused\nprofiles:\n  postgres:\n    override:\n'
                '      app:db:database: ${pg_database}\n'
                '      app:migration:database: ${pg_database}_mig\n')
            module = {'path': 'example', 'profiles': ['postgres'], 'pg_database': {'pg_database': ['', '_mig']}}
            failure = RuntimeError('database creation refused')
            def invoke(command, *args, **kwargs):
                if command[0] == 'createdb' and command[1].endswith('_mig'):
                    raise failure
                return '3 tests PASSED'
            with patch.object(DELIVERY, 'prepare_harness'), patch.object(DELIVERY, 'run', side_effect=invoke) as run:
                with self.assertRaises(RuntimeError) as caught:
                    DELIVERY.test_harness(module, harness, 'postgres')
            self.assertIs(caught.exception, failure)
            commands = [call.args[0] for call in run.call_args_list]
            primary = next(command[1] for command in commands if command[0] == 'createdb')
            self.assertEqual(commands[-1], ['dropdb', '--force', primary])
            self.assertFalse(any(command[:2] == ['wippy', 'lint'] for command in commands))


    def test_postgres_provisions_declared_auxiliary_databases(self):
        with tempfile.TemporaryDirectory(dir=DELIVERY.ROOT) as directory:
            harness = Path(directory)
            (harness / '.wippy.yaml').write_text(
                'vars:\n  pg_database: unused\n  pg_schema_database: unused_schema\n'
                'profiles:\n  postgres:\n    override:\n'
                '      app:db:database: ${pg_database}\n'
                '      app:migration:database: ${pg_database}_mig\n'
                '      app:isolated:database: ${pg_schema_database}\n')
            module = {'path': 'example', 'profiles': ['postgres'], 'pg_database': {'pg_database': ['', '_mig'], 'pg_schema_database': ['']}}
            with patch.object(DELIVERY, 'prepare_harness'), patch.object(DELIVERY, 'run', return_value='3 tests PASSED') as run:
                DELIVERY.test_harness(module, harness, 'postgres')
            commands = [call.args[0] for call in run.call_args_list]
            created = [command[1] for command in commands if command[0] == 'createdb']
            dropped = [command[-1] for command in commands if command[0] == 'dropdb']
            test = next(command for command in commands if command[:2] == ['wippy', 'test'])
            settings = dict(value.removeprefix('vars.').split('=', 1)
                            for value in test if value.startswith('vars.'))
            self.assertEqual(set(created), {settings['pg_database'],
                             settings['pg_database'] + '_mig', settings['pg_schema_database']})
            self.assertEqual(dropped, list(reversed(created)))
            self.assertNotIn('unused_schema', created)

    def test_primary_harness_uses_owning_lockrefresh_target(self):
        module = {'path': 'example', 'harness': 'test'}
        harness = DELIVERY.ROOT / 'example/test'
        with patch.object(DELIVERY, 'run') as run:
            DELIVERY.prepare_harness(module, harness)
        self.assertEqual([call.args[0] for call in run.call_args_list],
                         [['make', '-C', 'example', 'lockrefresh']])


    def test_component_source_selection_materializes_only_the_requested_tree(self):
        script = (DELIVERY.ROOT / 'html2pdf/component/build.sh').read_text()
        self.assertIsNone(re.search(r'\bgit(?:\s+-C\s+\S+)?\s+(?:checkout|switch|stash)(?:\s|$)', script))
        with tempfile.TemporaryDirectory() as directory:
            work = Path(directory)
            source = work / 'source'
            subprocess.run(['git', 'init', '-b', 'main', str(source)], check=True, capture_output=True)
            subprocess.run(['git', '-C', str(source), 'config', 'user.name', 'Build test'], check=True)
            subprocess.run(['git', '-C', str(source), 'config', 'user.email', 'build@test.local'], check=True)
            (source / 'selected').write_text('requested revision')
            subprocess.run(['git', '-C', str(source), 'add', '.'], check=True)
            subprocess.run(['git', '-C', str(source), 'commit', '-m', 'Declare requested source'], check=True, capture_output=True)
            revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
            (source / 'selected').unlink()
            (source / 'unselected').write_text('default branch')
            subprocess.run(['git', '-C', str(source), 'add', '-A'], check=True)
            subprocess.run(['git', '-C', str(source), 'commit', '-m', 'Declare later source'], check=True, capture_output=True)
            (work / 'third_party').mkdir()
            selection = script[script.index('if [ ! -d third_party/litehtml ]; then'):]
            selection = selection[:selection.index('git -C third_party/litehtml apply')] + 'fi\n'
            selection = selection.replace('https://github.com/litehtml/litehtml.git', str(source))
            subprocess.run(['bash', '-euo', 'pipefail', '-c', selection], cwd=work,
                           env=dict(os.environ, LITEHTML_COMMIT=revision), check=True, capture_output=True, text=True)
            tree = work / 'third_party/litehtml'
            self.assertEqual((tree / 'selected').read_text(), 'requested revision')
            self.assertFalse((tree / 'unselected').exists())

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
                    module = {'path': 'fixture', 'profiles': ['postgres'], 'pg_database': {'pg_database': ['']}}
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
            module = {'path': 'fixture', 'profiles': ['postgres'], 'pg_database': {'pg_database': ['']}}
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
