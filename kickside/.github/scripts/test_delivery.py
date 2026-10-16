import importlib.util
import json
import os
import subprocess
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import yaml

SCRIPT = Path(__file__).with_name('delivery.py')
SPEC = importlib.util.spec_from_file_location('delivery', SCRIPT)
DELIVERY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DELIVERY)

class PublicationTest(unittest.TestCase):
    def test_release_inventory_covers_declared_backend_harnesses(self):
        for path, module in DELIVERY.plan()['modules'].items():
            if (DELIVERY.ROOT / path / 'test/wippy.yaml').is_file():
                with self.subTest(module=path):
                    self.assertEqual(module['harness'], 'test')
                    self.assertIn('postgres', module['profiles'])
                    config = yaml.safe_load((DELIVERY.ROOT / path / 'test/.wippy.yaml').read_text())
                    self.assertEqual(bool(module['pg_database']), 'pg_database' in config.get('vars', {}))

    def module(self):
        return {'path': 'platform/inbox', 'type': 'plugin', 'visibility': 'public',
                'embed': ['kickside.inbox:ui_fs']}

    def test_app_refresh_uses_published_dependencies(self):
        with patch.object(DELIVERY, 'run') as run, \
             patch.object(DELIVERY, 'make'), \
             patch.object(DELIVERY, 'write_app_lock_receipt'):
            DELIVERY.refresh_app()
        command = run.call_args.args[0]
        self.assertEqual(command[:2], ['wippy', 'update'])
        config = yaml.safe_load((DELIVERY.ROOT / 'app/.wippy.yaml').read_text())
        self.assertEqual(set(command[3::2]), {
            'workspace.replacements.' + name + '='
            for name in config['workspace']['replacements']})
        self.assertEqual(command[2::2], ['--set'] * len(config['workspace']['replacements']))
        self.assertEqual(run.call_args.args[1], DELIVERY.ROOT / 'app')

    def test_dry_run_has_exact_version_and_metadata(self):
        args = DELIVERY.publish_command(self.module(), '0.2.1', True)
        self.assertEqual(args, ['wippy', 'publish', '--config', 'platform/inbox',
            '--version', '0.2.1', '--create', '--module-visibility', 'public',
            '--module-type', 'plugin', '--embed', 'kickside.inbox:ui_fs', '--dry-run'])

    def test_real_publish_requires_token(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, 'WIPPY_TOKEN'):
                DELIVERY.publish_command(self.module(), '0.2.1', False)

    def test_verified_unchanged_content_skips_release_publication(self):
        for dry_run in (True, False):
            with self.subTest(dry_run=dry_run), patch.object(DELIVERY, 'build'), \
                 patch.object(DELIVERY, 'plan', return_value={'repository': 'kickside'}), \
                 patch.object(DELIVERY, 'unchanged_content', return_value=True, create=True) as compare, \
                 patch.object(DELIVERY, 'run') as run, \
                 patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
                DELIVERY.publish(self.module(), '0.2.1', dry_run)
                self.assertEqual(run.call_args_list[0].args, (['make', 'compat'],))
                compare.assert_called_once_with(self.module(), '0.2.1')
                self.assertFalse(any(call.args[0][:2] == ['wippy', 'publish']
                                     for call in run.call_args_list))

    def test_explicit_unchanged_publication_retains_gates_and_dry_run(self):
        for dry_run in (True, False):
            with self.subTest(dry_run=dry_run), patch.object(DELIVERY, 'build') as build, \
                 patch.object(DELIVERY, 'plan', return_value={'repository': 'kickside'}), \
                 patch.object(DELIVERY, 'unchanged_content', return_value=True) as compare, \
                 patch.object(DELIVERY, 'run') as run, \
                 patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
                DELIVERY.publish(self.module(), '0.2.1', dry_run, publish_unchanged=True)
                commands = [call.args[0] for call in run.call_args_list]
                self.assertEqual(commands[0], ['make', 'compat'])
                build.assert_called_once_with(self.module())
                compare.assert_called_once_with(self.module(), '0.2.1')
                publications = [command for command in commands if command[:2] == ['wippy', 'publish']]
                expected = [DELIVERY.publish_command(self.module(), '0.2.1', True)]
                if not dry_run:
                    expected.append(DELIVERY.publish_command(self.module(), '0.2.1', False))
                self.assertEqual(publications, expected)

    def test_explicit_unchanged_publication_propagates_comparison_failure(self):
        failure = RuntimeError('Hub artifact digest mismatch')
        with patch.object(DELIVERY, 'build'), \
             patch.object(DELIVERY, 'plan', return_value={'repository': 'kickside'}), \
             patch.object(DELIVERY, 'unchanged_content', side_effect=failure), \
             patch.object(DELIVERY, 'run') as run, \
             patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
            with self.assertRaises(RuntimeError) as caught:
                DELIVERY.publish(self.module(), '0.2.1', False, publish_unchanged=True)
            self.assertIs(caught.exception, failure)
            self.assertFalse(any(call.args[0][:2] == ['wippy', 'publish']
                                 for call in run.call_args_list))

    def test_explicit_unchanged_publication_retains_compatibility_and_app_receipt(self):
        failure = RuntimeError('release gate fails')
        for gate in ('compatibility', 'app receipt'):
            module = self.module() | {'path': 'app'}
            with self.subTest(gate=gate), patch.object(DELIVERY, 'build') as build, \
                 patch.object(DELIVERY, 'unchanged_content') as compare, \
                 patch.object(DELIVERY, 'run', side_effect=failure if gate=='compatibility' else None) as run, \
                 patch.object(DELIVERY, 'check_app_lock_receipt', side_effect=failure), \
                 patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
                with self.assertRaises(RuntimeError) as caught:
                    DELIVERY.publish(module, '0.2.1', False, publish_unchanged=True)
                self.assertIs(caught.exception, failure)
                run.assert_called_once_with(['make', 'compat'])
                build.assert_not_called()
                compare.assert_not_called()

    def test_cli_passes_explicit_unchanged_publication(self):
        for extra, expected in [([], False), (['--publish-unchanged'], True)]:
            with self.subTest(extra=extra), patch.object(DELIVERY, 'plan', return_value={
                 'modules': {'platform/inbox': self.module()}}), \
                 patch.object(DELIVERY, 'publish') as publish, \
                 patch('sys.argv', ['delivery.py', 'publish', '--module', 'platform/inbox',
                                    '--version', '0.2.1', *extra]):
                DELIVERY.main()
                publish.assert_called_once_with(self.module(), '0.2.1', False,
                                                publish_unchanged=expected)

    def test_compatibility_failure_stops_build_comparison_and_publication(self):
        failure = subprocess.CalledProcessError(2, ['make', 'compat'])
        for dry_run in (True, False):
            with self.subTest(dry_run=dry_run), patch.object(DELIVERY, 'build') as build, \
                 patch.object(DELIVERY, 'unchanged_content') as compare, \
                 patch.object(DELIVERY, 'run', side_effect=failure) as run, \
                 patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
                with self.assertRaises(subprocess.CalledProcessError) as caught:
                    DELIVERY.publish(self.module(), '0.2.1', dry_run)
                self.assertIs(caught.exception, failure)
                run.assert_called_once_with(['make', 'compat'])
                build.assert_not_called()
                compare.assert_not_called()

    def test_hub_content_comparison_failure_stops_publication(self):
        failure = RuntimeError('Hub artifact digest mismatch')
        with patch.object(DELIVERY, 'build'), \
             patch.object(DELIVERY, 'plan', return_value={'repository': 'kickside'}), \
             patch.object(DELIVERY, 'unchanged_content', side_effect=failure, create=True), \
             patch.object(DELIVERY, 'run') as run, \
             patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
            with self.assertRaises(RuntimeError) as caught:
                DELIVERY.publish(self.module(), '0.2.1', False)
            self.assertIs(caught.exception, failure)
            self.assertFalse(any(call.args[0][:2] == ['wippy', 'publish']
                                 for call in run.call_args_list))

    def test_changed_content_keeps_explicit_release_version_and_publication_gates(self):
        with patch.object(DELIVERY, 'build'), \
             patch.object(DELIVERY, 'plan', return_value={'repository': 'kickside'}), \
             patch.object(DELIVERY, 'unchanged_content', return_value=False, create=True), \
             patch.object(DELIVERY, 'run') as run, \
             patch.dict(os.environ, {'WIPPY_TOKEN': 'fixture-token'}):
            DELIVERY.publish(self.module(), '0.2.1', False)
            commands = [call.args[0] for call in run.call_args_list]
            self.assertEqual(commands[-2:], [DELIVERY.publish_command(self.module(), '0.2.1', True),
                                             DELIVERY.publish_command(self.module(), '0.2.1', False)])

    def test_unchanged_content_keeps_release_version_and_token_validation(self):
        with patch.object(DELIVERY, 'build'), \
             patch.object(DELIVERY, 'plan', return_value={'repository': 'kickside'}), \
             patch.object(DELIVERY, 'unchanged_content', return_value=True), \
             patch.object(DELIVERY, 'run'), patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, 'explicit release version'):
                DELIVERY.publish(self.module(), 'latest', True)
            with self.assertRaisesRegex(ValueError, 'WIPPY_TOKEN'):
                DELIVERY.publish(self.module(), '0.2.1', False)

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
