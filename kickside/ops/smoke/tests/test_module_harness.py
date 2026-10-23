import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


class Evidence:
    def __init__(self):
        self.saved = []

    def save(self, name, value):
        self.saved.append((name, value))


def declare_tests(root):
    (root / '_index.yaml').write_text(
        'namespace: kickside.core\nentries:\n' + ''.join(
            '  - name: ' + name + '\n    kind: function.lua\n    meta: {type: test}\n'
            for name in ('guard_test', 'sweeper_upgrade_test', 'sweeper_test')))


class Instance:
    def __init__(self, root, source):
        self.root = root
        self.engine = 'postgres'
        self.env = {'PATH': os.environ['PATH']}
        self.config = {
            'binary': '/bin/wippy',
            'source': str(source),
            'replace': {'kickside/core': str(source / 'core' / 'core')},
            'pg': {'host': '127.0.0.1', 'port': '5433', 'user': 'kickside', 'password': 'kickside'},
        }
        self.evidence = Evidence()
        self.redactor = type('Redactor', (), {'text': staticmethod(str)})()
        self.sql = []

    def pg(self, statement):
        self.sql.append(statement)


class Context:
    def __init__(self, inst):
        self.inst = inst


class Completed:
    returncode = 0
    stdout = 'PASSED 1 tests\n'
    stderr = ''


class TestTypeHarnessTests(unittest.TestCase):
    def test_type_checks_use_the_fresh_isolated_harness(self):
        from types import SimpleNamespace
        from unittest.mock import Mock
        import scenarios_test_types as guards

        ctx = SimpleNamespace(inst=Mock(config={
            'replace': {'module/fixture': '/unused/source'}, 'binary': '/bin/wippy'}))
        with patch.object(guards, 'run_focused_module_test') as focused, \
             patch('subprocess.run', return_value=Completed()) as direct:
            guards.checked_test_types(ctx, 'module/fixture', ('first', 'second'))
        self.assertFalse(direct.called, 'Type lint must use the refreshed harness copy')
        self.assertEqual([call.args[2] for call in focused.call_args_list], ['first', 'second'])
        self.assertEqual(sum(call.kwargs.get('lint', False)
                             for call in focused.call_args_list), 1)


def command_harness(command, kwargs):
    cwd = Path(kwargs['cwd'])
    return cwd / 'test' if command[0] == 'make' else cwd


class LoadedTestCatalogTests(unittest.TestCase):
    def test_catalog_uses_the_resolved_registry_and_matching_database_profile(self):
        from types import SimpleNamespace
        from module_harness import _loaded_test_ids
        result = SimpleNamespace(returncode=0, stderr='',
            stdout='[{"id":"fixture:case","meta":{"type":"test"}}]')
        for engine in ('sqlite', 'postgres'):
            with self.subTest(engine=engine):
                inst = SimpleNamespace(config={'binary': '/bin/wippy'}, engine=engine,
                    evidence=Evidence(), redactor=SimpleNamespace(text=str))
                with patch('module_harness.subprocess.run', return_value=result) as invoke:
                    loaded = _loaded_test_ids(inst, Path('/owned/harness'), {}, 900, 'fixture')
                self.assertEqual(loaded, {'fixture:case'})
                command = invoke.call_args.args[0]
                self.assertEqual(command[:5], ['/bin/wippy', '--config', '.wippy.yaml', 'registry', 'list'])
                self.assertEqual('--profile' in command, engine == 'postgres')
                self.assertEqual(inst.evidence.saved[0][0], 'focused-fixture-test-catalog')

    def test_catalog_failure_cannot_fall_back_to_unresolved_source_declarations(self):
        from types import SimpleNamespace
        from module_harness import _loaded_test_ids
        inst = SimpleNamespace(config={'binary': '/bin/wippy'}, engine='sqlite',
            evidence=Evidence(), redactor=SimpleNamespace(text=str))
        result = SimpleNamespace(returncode=1, stdout='', stderr='registry could not load')
        with patch('module_harness.subprocess.run', return_value=result):
            with self.assertRaisesRegex(RuntimeError, 'registry could not load'):
                _loaded_test_ids(inst, Path('/owned/harness'), {}, 900, 'fixture')


class FocusedModuleHarnessTests(unittest.TestCase):
    def setUp(self):
        from module_harness import test_entries, replacement_test_entries
        import yaml

        def catalog(inst, root, environment, timeout, label):
            config = yaml.safe_load((root / '.wippy.yaml').read_text())
            return test_entries(root).keys() | replacement_test_entries(root, config).keys()

        patcher = patch('module_harness._loaded_test_ids', side_effect=catalog)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_isolates_declared_sqlite_files_and_http_ports_for_every_focused_run(self):
        import yaml
        from module_harness import _write_config
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            configuration = {'version': '1.0', 'vars': {'sqlite_path': ':memory:', 'http_port': 19115}}
            for engine in ('sqlite', 'postgres'):
                with self.subTest(engine=engine):
                    (root / '.wippy.yaml').write_text(yaml.safe_dump(configuration))
                    instance = Instance(root / 'run', root / 'source')
                    instance.engine = engine
                    path, _ = _write_config(instance, root, 'owned_database')
                    configured = yaml.safe_load(path.read_text())
                    self.assertEqual(configured['vars']['sqlite_path'], str(root / 'run/temp/owned_database.sqlite'))
                    self.assertIsInstance(configured['vars']['http_port'], int)
                    self.assertGreater(configured['vars']['http_port'], 0)
                    self.assertNotEqual(configured['vars']['http_port'], 19115)

    def test_generated_postgres_profile_has_a_concrete_runtime_configuration(self):
        import yaml
        from module_harness import _write_config
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            instance = Instance(root / 'run', root / 'source')
            path, original = _write_config(instance, root, 'owned_database')
            config = yaml.safe_load(path.read_text())
            self.assertIsNone(original)
            self.assertEqual(config['profiles']['postgres']['vars']['pg_database'], 'owned_database')
            self.assertNotIn('override', config['profiles']['postgres'])

    def test_keeps_a_database_free_postgres_profile_free_of_sql_overrides(self):
        from module_harness import _write_config
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            (root / '.wippy.yaml').write_text('version: "1.0"\nprofiles:\n  postgres:\n    vars:\n      native_pg_gate: true\n')
            instance = Instance(root / 'run', root / 'source')
            path, _ = _write_config(instance, root, 'run_database')
            config = __import__('yaml').safe_load(path.read_text())
            self.assertEqual(config['profiles']['postgres']['vars'], {'native_pg_gate': True})
            self.assertNotIn('override', config['profiles']['postgres'])

    def test_keeps_fresh_outer_sources_for_relative_harness_replacements_but_honors_absolute_ones(self):
        import yaml
        from module_harness import _write_config

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            workspace = Path(directory)
            root = workspace / 'harness'
            root.mkdir()
            outer = workspace / 'outer-core'
            absolute = workspace / 'materialized-core'
            relative = workspace / 'relative-core'
            for path in (outer, absolute, relative):
                path.mkdir()
            instance = Instance(workspace / 'run', workspace / 'source')
            instance.config['replace']['kickside/core'] = str(outer)
            cases = ((str(absolute), absolute), ('../relative-core', outer))
            for replacement, expected in cases:
                with self.subTest(replacement=replacement):
                    (root / '.wippy.yaml').write_text(yaml.safe_dump({
                        'workspace': {'replacements': {'kickside/core': replacement}},
                    }))
                    path, _ = _write_config(instance, root, 'owned_database')
                    configured = yaml.safe_load(path.read_text())
                    self.assertEqual(configured['workspace']['replacements']['kickside/core'], str(expected))

    def test_refreshes_a_replaced_module_on_a_published_application(self):
        from module_harness import _refresh_command

        instance = type('Instance', (), {'config': {'source': None}})()
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            (root / 'wippy.lock').write_text('directories:\n  src: .\n')
            command = _refresh_command(instance, root, root / '.wippy.yaml', root.parent)
        self.assertEqual(command, ['make', 'lockrefresh', 'WIPPY_UPDATE_ARGS=--src-dir .'])

    def test_refreshes_a_focused_harness_with_its_native_target(self):
        from module_harness import _refresh_command

        instance = type('Instance', (), {'config': {'source': None}})()
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            module = Path(directory)
            root = module / 'test'
            root.mkdir()
            (module / 'Makefile').write_text('lockrefresh:\n\ttrue\nlockrefresh-test:\n\ttrue\n')
            command = _refresh_command(instance, root, root / '.wippy.yaml', module)
        self.assertEqual(command, ['make', 'lockrefresh-test', 'WIPPY_UPDATE_ARGS=--src-dir .'])

    def test_channel_focused_refresh_prepares_its_policy_fixture_first(self):
        repository = Path(__file__).resolve().parents[3]
        output = __import__('subprocess').check_output(
            ['make', '-n', 'lockrefresh-test', 'WIPPY_UPDATE_ARGS=--src-dir .'],
            cwd=repository / 'platform' / 'channel', text=True)
        commands = output.splitlines()
        prepare = next(index for index, command in enumerate(commands)
                       if command.startswith('cp src/security/module_access/_index.yaml'))
        refresh = next(index for index, command in enumerate(commands)
                       if command.startswith('cd test && wippy update --src-dir .'))
        self.assertLess(prepare, refresh)

    def test_refresh_uses_manifest_source_instead_of_stale_lock_source(self):
        from module_harness import _refresh_command
        instance = type('Instance', (), {'config': {'source': None}})()
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            (root / 'wippy.lock').write_text('directories:\n  src: stale\n')
            (root / 'wippy.yaml').write_text('directories:\n  src: .\n')
            command = _refresh_command(instance, root, root / '.wippy.yaml', root.parent)
            self.assertIn('WIPPY_UPDATE_ARGS=--src-dir .', command)

    def test_runs_only_the_named_test_with_fresh_lock_and_owned_postgres_databases(self):
        from module_harness import run_focused_module_test

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            test_root = source / 'core' / 'core' / 'test'
            test_root.mkdir(parents=True)
            declare_tests(test_root)
            (source / 'core' / 'core' / 'Makefile').write_text('lockrefresh:\n\ttrue\n')
            fixture = test_root / 'fixture'
            fixture.mkdir()
            (test_root / '.wippy.yaml').write_text('version: "1.0"\nworkspace:\n  replacements:\n    kickside/core: ./fixture\n')
            (test_root / 'wippy.lock').write_text('directories:\n  src: .\n')
            sibling = test_root.parent / 'lint-harness' / '.wippy.yaml'
            sibling.parent.mkdir()
            sibling_original = 'version: "1.0"\nworkspace:\n  replacements:\n    kickside/core: ../stale\n'
            sibling.write_text(sibling_original)
            instance = Instance(root / 'run', source)
            calls = []
            observed_replacements = []
            observed_configurations = []

            def invoke(command, **kwargs):
                calls.append((command, kwargs))
                copied_sibling = command_harness(command, kwargs).parent / 'lint-harness' / '.wippy.yaml'
                self.assertEqual(copied_sibling.read_text(), sibling_original)
                sibling_config = __import__('yaml').safe_load(sibling.read_text())
                self.assertEqual(sibling_config['workspace']['replacements']['kickside/core'], '../stale')
                configuration = __import__('yaml').safe_load((command_harness(command, kwargs) / '.wippy.yaml').read_text())
                observed_configurations.append(configuration)
                observed_replacements.append(configuration['workspace']['replacements'])
                return Completed()

            with patch('module_harness.subprocess.run', side_effect=invoke), \
                 patch('module_harness.drop_database') as drop:
                result = run_focused_module_test(Context(instance), 'kickside/core', 'sweeper_upgrade_test')

            self.assertEqual(result.returncode, 0)
            self.assertEqual(calls[0][0][:2], ['make', 'lockrefresh'])
            self.assertEqual(calls[0][1]['cwd'].parts[-3:], (source.name, 'core', 'core'))
            self.assertNotEqual(calls[0][1]['cwd'], source / 'core' / 'core')
            self.assertIn('WIPPY_UPDATE_ARGS=--src-dir .', calls[0][0])
            self.assertEqual(calls[1][0], ['/bin/wippy', '--config', '.wippy.yaml', 'test', '--profile', 'postgres',
                                           '--set', 'vars.pg_database=' + calls[1][0][-1].split('=', 1)[1]])
            database = calls[1][0][-1].split('=', 1)[1]
            self.assertTrue(database.startswith('smoke_focused_kickside_core_'))
            self.assertIn('CREATE DATABASE "' + database + '" TEMPLATE template0', instance.sql)
            self.assertIn('CREATE DATABASE "' + database + '_mig" TEMPLATE template0', instance.sql)
            self.assertEqual(drop.call_args_list[0].args[0], database + '_mig')
            self.assertEqual(drop.call_args_list[1].args[0], database)
            self.assertIsInstance(observed_configurations[0]['vars']['pg_port'], int)
            self.assertEqual(observed_configurations[0]['vars']['pg_port'], 5433)
            self.assertEqual(observed_replacements[0]['kickside/core'], str(calls[0][1]['cwd'] / 'test/fixture'))
            self.assertEqual((test_root / '.wippy.yaml').read_text(), 'version: "1.0"\nworkspace:\n  replacements:\n    kickside/core: ./fixture\n')
            self.assertEqual(len(instance.evidence.saved), 2)
            self.assertEqual(sibling.read_text(), sibling_original)

    def test_generates_configuration_only_in_the_disposable_copy(self):
        from module_harness import run_focused_app_test

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            workspace = Path(directory)
            repository = workspace / 'repository'
            repository.mkdir()
            self.assertFalse(repository.is_relative_to(Path(__file__).resolve().parents[3]),
                             'Harness fixtures must stay outside copied repository sources')
            declare_tests(repository)
            instance = Instance(workspace / 'run', workspace / 'source')
            commands = []

            def invoke(command, **kwargs):
                commands.append(command)
                return Completed()

            with patch('module_harness.subprocess.run', side_effect=invoke), \
                 patch('module_harness.drop_database'):
                run_focused_app_test(Context(instance), repository, 'guard_test')

            self.assertEqual(commands[0][:4], ['/bin/wippy', '--config', '.wippy.yaml', 'update'])
            self.assertEqual(len(commands), 2)
            self.assertEqual(commands[-1][:4], ['/bin/wippy', '--config', '.wippy.yaml', 'test'])
            self.assertFalse((repository / '.wippy.yaml').exists())

    def test_runs_application_harness_preparation_in_the_disposable_copy_before_refresh(self):
        from module_harness import run_focused_app_test
        import subprocess

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            workspace = Path(directory)
            repository = workspace / 'repository'
            repository.mkdir()
            declare_tests(repository)
            (repository / 'prepare.sh').write_text('#!/usr/bin/env bash\nprintf generated > generated.lua\n')
            instance = Instance(workspace / 'run', workspace / 'source')
            commands = []
            native_run = subprocess.run

            def invoke(command, **kwargs):
                commands.append(command)
                if command == ['bash', 'prepare.sh']:
                    return native_run(command, **kwargs)
                self.assertEqual((Path(kwargs['cwd']) / 'generated.lua').read_text(), 'generated')
                return Completed()

            with patch('module_harness.subprocess.run', side_effect=invoke), \
                 patch('module_harness.drop_database'):
                run_focused_app_test(Context(instance), repository, 'guard_test')

            self.assertEqual(commands[0], ['bash', 'prepare.sh'])
            self.assertEqual(commands[1][:4], ['/bin/wippy', '--config', '.wippy.yaml', 'update'])
            self.assertFalse((repository / 'generated.lua').exists())

    def test_keeps_requested_replacements_for_the_disposable_run(self):
        from module_harness import run_focused_module_test

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            test_root = source / 'core' / 'core' / 'test'
            test_root.mkdir(parents=True)
            declare_tests(test_root)
            (source / 'core' / 'core' / 'Makefile').write_text('lockrefresh:\n\ttrue\n')
            original = 'version: "1.0"\nworkspace:\n  replacements:\n    kickside/core: ./fixture\n'
            (test_root / '.wippy.yaml').write_text(original)
            (test_root / 'wippy.lock').write_text('directories:\n  src: .\n')
            fixture = test_root / 'fixture'
            fixture.mkdir()
            instance = Instance(root / 'run', source)
            instance.config['replace']['kickside/other'] = str(source / 'other')
            configurations = []

            def invoke(command, **kwargs):
                configurations.append(__import__('yaml').safe_load((command_harness(command, kwargs) / '.wippy.yaml').read_text()))
                return Completed()

            with patch('module_harness.subprocess.run', side_effect=invoke), \
                 patch('module_harness.drop_database'):
                run_focused_module_test(Context(instance), 'kickside/core', 'guard_test')

            self.assertEqual(len(configurations), 2)
            self.assertEqual(configurations[0]['workspace']['replacements']['kickside/other'], str(source / 'other'))
            self.assertEqual(configurations[-1]['workspace']['replacements']['kickside/other'], str(source / 'other'))
            self.assertEqual((test_root / '.wippy.yaml').read_text(), original)

    def test_native_refresh_discards_stale_absolute_replacement_locks(self):
        from module_harness import run_focused_module_test

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            module = source / 'core' / 'core'
            test_root = module / 'test'
            test_root.mkdir(parents=True)
            declare_tests(test_root)
            (module / 'Makefile').write_text('lockrefresh:\n\ttrue\n')
            (test_root / '.wippy.yaml').write_text('version: "1.0"\n')
            lock = test_root / 'wippy.lock'
            stale = ('workspace:\n  replacements:\n'
                     '    kickside/example: /missing/prior-source/example\n')
            lock.write_text(stale)
            instance = Instance(root / 'run', source)
            refreshes = []

            def invoke(command, **kwargs):
                if command[:2] == ['make', 'lockrefresh']:
                    copied_lock = command_harness(command, kwargs) / 'wippy.lock'
                    self.assertFalse(copied_lock.exists())
                    self.assertEqual(lock.read_text(), stale)
                    refreshes.append(command)
                    copied_lock.write_text('directories:\n  src: .\n')
                return Completed()

            with patch('module_harness.subprocess.run', side_effect=invoke), \
                 patch('module_harness.drop_database'):
                run_focused_module_test(Context(instance), 'kickside/core', 'guard_test')

            self.assertEqual(len(refreshes), 1)
            self.assertEqual(lock.read_text(), stale)

    def test_isolates_every_declared_database_and_profile_variable(self):
        from module_harness import run_focused_module_test
        import yaml
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            test_root = source / 'core' / 'core' / 'test'
            test_root.mkdir(parents=True)
            declare_tests(test_root)
            configuration = {
                'version': '1.0',
                'vars': {'pg_secondary_database': 'shared_secondary', 'pg_archive_database': 'shared_archive'},
                'profiles': {'postgres': {
                    'vars': {'pg_secondary_database': 'profile_shared_secondary'},
                    'override': {
                        'app:db:database': '${pg_database}',
                        'app:derived:database': '${pg_database}_mig',
                        'app:secondary:database': '${pg_secondary_database}',
                        'app:secondary_alias:database': '${pg_secondary_database}',
                        'app:archive:database': '${pg_archive_database}_ledger',
                    },
                }},
            }
            original = yaml.safe_dump(configuration)
            (test_root / '.wippy.yaml').write_text(original)
            instance = Instance(root / 'run', source)
            targets = []

            def invoke(command, **kwargs):
                configured = yaml.safe_load((command_harness(command, kwargs) / '.wippy.yaml').read_text())
                if 'pg_database' not in configured.get('vars', {}):
                    self.assertEqual(configured, configuration)
                    return Completed()
                variables = dict(configured['vars'], **configured['profiles']['postgres'].get('vars', {}))
                overrides = configured['profiles']['postgres']['override']
                resolved = {key: __import__('re').sub(r'\$\{([A-Za-z_][A-Za-z0-9_]*)\}',
                    lambda match: str(variables[match[1]]), value)
                    for key, value in overrides.items() if key.endswith(':database')}
                for name in resolved.values():
                    self.assertTrue(name.startswith('smoke_focused_'))
                    self.assertIn('CREATE DATABASE "' + name + '" TEMPLATE template0', instance.sql)
                self.assertEqual(resolved['app:secondary:database'], resolved['app:secondary_alias:database'])
                targets.extend(resolved.values())
                return Completed()

            with patch('module_harness.subprocess.run', side_effect=invoke), patch('module_harness.drop_database') as drop:
                run_focused_module_test(Context(instance), 'kickside/core', 'guard_test')
            created = [statement.split('"')[1] for statement in instance.sql]
            self.assertEqual(len(created), len(set(created)))
            self.assertEqual(set(created), set(targets))
            self.assertEqual([call.args[0] for call in drop.call_args_list], list(reversed(created)))
            self.assertEqual((test_root / '.wippy.yaml').read_text(), original)

    def test_rejects_unisolated_database_declarations_before_creation(self):
        from harness import Failure
        from module_harness import run_focused_module_test
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        for value in ('existing_shared', '${undeclared_database}'):
            with self.subTest(value=value), tempfile.TemporaryDirectory(dir=scratch) as directory:
                root = Path(directory)
                source = root / 'source'
                test_root = source / 'core' / 'core' / 'test'
                test_root.mkdir(parents=True)
                declare_tests(test_root)
                original = 'profiles:\n  postgres:\n    override:\n      "app:extra:database": "' + value + '"\n'
                (test_root / '.wippy.yaml').write_text(original)
                instance = Instance(root / 'run', source)
                with patch('module_harness.subprocess.run') as invoke, patch('module_harness.drop_database') as drop:
                    with self.assertRaises(Failure):
                        run_focused_module_test(Context(instance), 'kickside/core', 'guard_test')
                invoke.assert_not_called()
                drop.assert_not_called()
                self.assertEqual(instance.sql, [])
                self.assertEqual((test_root / '.wippy.yaml').read_text(), original)

    def test_lint_failure_stops_execution_and_restores_owned_resources(self):
        from harness import Failure
        from module_harness import run_focused_module_test
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            harness = source / 'core/core/test'
            harness.mkdir(parents=True)
            declare_tests(harness)
            original = 'version: "1.0"\n'
            (harness / '.wippy.yaml').write_text(original)
            (harness / 'wippy.lock').write_text('directories:\n  src: .\n')
            instance = Instance(root / 'run', source)
            failed = type('Failed', (), {'returncode': 1, 'stdout': 'fixture lint fails', 'stderr': ''})()
            with patch('module_harness.subprocess.run', side_effect=[Completed(), failed]) as invoke, \
                 patch('module_harness.drop_database') as drop:
                with self.assertRaisesRegex(Failure, "fixture lint fails"):
                    run_focused_module_test(Context(instance), 'kickside/core', 'guard_test', lint=True)
            self.assertEqual(invoke.call_count, 2)
            self.assertIn('lint', invoke.call_args_list[1].args[0])
            self.assertEqual(drop.call_count, 2)
            self.assertEqual((harness / '.wippy.yaml').read_text(), original)

    def test_uses_the_repository_gate_for_a_named_suite_and_preserves_engine_selection(self):
        from module_harness import run_focused_module_suite
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            module = source / 'core' / 'core'
            test_root = module / 'test'
            test_root.mkdir(parents=True)
            declare_tests(test_root)
            (module / 'Makefile').write_text('lockrefresh:\n\ttrue\ntest:\n\ttrue\n')
            (test_root / 'wippy.lock').write_text('directories:\n  src: .\n')
            instance = Instance(root / 'run', source)
            with patch('module_harness.subprocess.run', return_value=Completed()) as invoke, \
                 patch('module_harness.drop_database') as drop:
                run_focused_module_suite(Context(instance), 'kickside/core', 'kickside.core:sweeper_test')
            command = invoke.call_args_list[1].args[0]
            self.assertEqual(command[:3], ['make', 'test', 'SUITES=kickside.core:sweeper_test'])
            self.assertTrue(command[3].startswith('WIPPY_TEST_ARGS=--profile postgres --set vars.pg_database=smoke_focused_'))
            self.assertEqual(invoke.call_args_list[1].kwargs['cwd'].parts[-3:], (source.name, 'core', 'core'))
            self.assertNotEqual(invoke.call_args_list[1].kwargs['cwd'], module)
            self.assertEqual(invoke.call_args_list[1].kwargs['timeout'], 900)
            self.assertEqual(drop.call_count, 2)

    def test_repository_gate_runs_a_suite_declared_in_module_source(self):
        from module_harness import run_focused_module_suite
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            module = source / 'core' / 'core'
            test_root = module / 'test'
            test_root.mkdir(parents=True)
            (module / 'Makefile').write_text('lockrefresh:\n\ttrue\ntest:\n\ttrue\n')
            (test_root / 'wippy.lock').write_text('directories:\n  src: .\n')
            instance = Instance(root / 'run', source)
            with patch('module_harness.subprocess.run', return_value=Completed()) as invoke, \
                 patch('module_harness.drop_database'):
                run_focused_module_suite(Context(instance), 'kickside/core', 'kickside.core:declared_in_source_test')
            self.assertEqual(invoke.call_args_list[1].args[0][:3],
                             ['make', 'test', 'SUITES=kickside.core:declared_in_source_test'])

    def test_repository_gate_resolves_the_module_under_test_from_its_isolated_copy(self):
        import yaml
        from module_harness import run_focused_module_suite
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            root = Path(directory)
            source = root / 'source'
            module = source / 'core' / 'core'
            test_root = module / 'test'
            test_root.mkdir(parents=True)
            (module / 'Makefile').write_text('lockrefresh:\n\ttrue\ntest:\n\ttrue\n')
            (test_root / 'wippy.lock').write_text('directories:\n  src: .\n')
            instance = Instance(root / 'run', source)
            seen = []
            def invoke(command, **kwargs):
                if command[:2] == ['make', 'test']:
                    configured = yaml.safe_load((kwargs['cwd'] / 'test/.wippy.yaml').read_text())
                    seen.append((configured['workspace']['replacements']['kickside/core'], str(kwargs['cwd'])))
                return Completed()
            with patch('module_harness.subprocess.run', side_effect=invoke), patch('module_harness.drop_database'):
                run_focused_module_suite(Context(instance), 'kickside/core', 'kickside.core:declared_in_source_test')
            self.assertEqual(len(seen), 1)
            self.assertEqual(seen[0][0], seen[0][1])
            self.assertNotEqual(seen[0][0], str(module))

    def test_rejects_an_empty_filter_even_when_the_runner_exits_successfully(self):
        from harness import Failure
        from module_harness import _command

        instance = type('Instance', (), {
            'evidence': Evidence(),
            'redactor': type('Redactor', (), {'text': staticmethod(str)})(),
        })()
        completed = type('Completed', (), {
            'returncode': 0, 'stdout': 'PASSED 0 tests\nNo tests match filter\n', 'stderr': '',
        })()
        with patch('module_harness.subprocess.run', return_value=completed):
            with self.assertRaisesRegex(Failure, 'does not run'):
                _command(instance, 'empty', ['wippy', 'test'], Path('.'), {}, 10, require_tests=True)

    def test_focused_commands_keep_replacement_sources_and_locks_unchanged(self):
        from module_harness import run_focused_module_test
        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'source'
            harness = source / 'core/core/test'
            harness.mkdir(parents=True)
            declare_tests(harness)
            original = 'version: "1.0"\n'
            (harness / '.wippy.yaml').write_text(original)
            (harness / 'wippy.lock').write_text('directories:\n  src: .\n')
            instance = Instance(workspace / 'run', source)
            instance.engine = 'sqlite'
            def invoke(command, **kwargs):
                self.assertEqual((harness / '.wippy.yaml').read_text(), original)
                self.assertEqual((harness / 'wippy.lock').read_text(), 'directories:\n  src: .\n')
                self.assertNotEqual(kwargs['cwd'], harness)
                return Completed()
            with patch('module_harness.subprocess.run', side_effect=invoke):
                run_focused_module_test(Context(instance), 'kickside/core', 'guard_test')


if __name__ == '__main__':
    unittest.main()
