import hashlib
import os
from pathlib import Path
import subprocess
import sys
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


class PublicSourceOverlayTests(unittest.TestCase):
    def setUp(self):
        self.scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        self.scratch.mkdir(exist_ok=True)

    def _context(self, workspace, source):
        return Context(Instance(workspace / 'run', source))

    @staticmethod
    def _materialized_tree(root):
        """Return the source files the overlay is expected to copy."""
        from module_harness import SOURCE_COPY_IGNORED

        files = []
        for directory, directories, names in os.walk(root, followlinks=False):
            directories[:] = sorted(name for name in directories if name not in SOURCE_COPY_IGNORED)
            directory = Path(directory)
            for name in sorted(names):
                if name in SOURCE_COPY_IGNORED:
                    continue
                path = directory / name
                relative = path.relative_to(root).as_posix()
                if path.is_symlink():
                    files.append((relative, 'symlink', os.readlink(path)))
                else:
                    files.append((relative, 'file', hashlib.sha256(path.read_bytes()).hexdigest()))
        return files

    def test_selected_build_sources_materialize_only_the_requested_tree(self):
        """Exercise the real overlay with the source pair selected by the smoke run."""
        from module_harness import public_source_overlay

        source_value = os.environ.get('KICKSIDE_SOURCE_ROOT')
        component_value = os.environ.get('KICKSIDE_COMPONENT_SOURCE')
        if not source_value or not component_value:
            raise unittest.SkipTest('selected source inputs are provided by the smoke source-layout guard')
        source = Path(source_value).resolve()
        component = Path(component_value).resolve()
        private_root = Path(__file__).resolve().parents[3]
        destination = Path('.smoke/selected-html2pdf')
        self.assertTrue((source / 'app').is_dir(), 'selected product source has no application tree')
        self.assertTrue((component / 'wippy.yaml').is_file(), 'selected component source has no manifest')
        self.assertNotEqual(source, private_root)
        self.assertNotEqual(component, private_root)
        self.assertFalse((source / destination).exists(), 'selected destination must be an overlay-only path')
        source_before = self._materialized_tree(source)
        component_before = self._materialized_tree(component)
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            with public_source_overlay(self._context(workspace, source), (), owner=private_root,
                                       module_overrides={str(destination): component}) as overlay:
                self.assertEqual(self._materialized_tree(overlay / destination), component_before)
                copied_source = [entry for entry in self._materialized_tree(overlay)
                                 if not Path(entry[0]).is_relative_to(destination)]
                self.assertEqual(copied_source, source_before)
                self.assertTrue((overlay / 'app').is_dir())
        self.assertEqual(self._materialized_tree(source), source_before)
        self.assertEqual(self._materialized_tree(component), component_before)

    def test_upgrade_commands_load_from_their_staged_private_tooling(self):
        from module_harness import public_source_overlay
        from scenarios_bot_accounts import COMPAT_UPGRADE_TOOLING
        environment = {key: value for key, value in os.environ.items() if key != 'PYTHONPATH'}
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            source.mkdir()
            with public_source_overlay(self._context(workspace, source), COMPAT_UPGRADE_TOOLING) as overlay:
                for module in ('test_sso_bot_accounts_upgrade', 'test_mcp_bot_accounts_upgrade',
                               'test_identity_bot_accounts_upgrade', 'test_migration_repeat'):
                    with self.subTest(module=module):
                        result = subprocess.run(
                            [sys.executable, '-m', 'ops.compat.integration.' + module, '--help'],
                            cwd=overlay, env=environment, capture_output=True, text=True, timeout=20)
                        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_selected_module_ignores_external_links_in_excluded_caches(self):
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source, selected, private = (workspace / name for name in ('public', 'selected', 'private'))
            source.mkdir()
            selected.mkdir()
            private.mkdir()
            (selected / 'component.lua').write_text('selected implementation')
            outside = workspace / 'outside'
            outside.mkdir()
            for name in ('.git', '.wippy', 'node_modules', '__pycache__'):
                cache = selected / name
                cache.mkdir()
                (cache / 'external').symlink_to(outside, target_is_directory=True)
            with public_source_overlay(self._context(workspace, source), (), owner=private,
                                       module_overrides={'platform/agents': selected}) as overlay:
                copied = overlay / 'platform/agents'
                self.assertEqual((copied / 'component.lua').read_text(), 'selected implementation')
                self.assertTrue(all(not (copied / name).exists() for name in
                                    ('.git', '.wippy', 'node_modules', '__pycache__')))

    def test_refuses_external_base_source_links_before_running_any_private_check(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source, private, outside = (workspace / name for name in ('public', 'private', 'outside'))
            source.mkdir()
            private.mkdir()
            outside.write_text('outside implementation')
            (source / 'component.lua').symlink_to(outside)
            with self.assertRaisesRegex(Failure, 'Public source source symlink escapes its owned tree'):
                with public_source_overlay(self._context(workspace, source), (), owner=private):
                    self.fail('external source link reached an executable overlay')

    def test_stages_named_private_checks_without_changing_public_source(self):
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            public_component = source / 'platform/agents/ui/src/app/AgentBlockConfig.vue'
            public_component.parent.mkdir(parents=True)
            public_component.write_text('public component\n')
            check = private / 'tests/check_agent.py'
            check.parent.mkdir(parents=True)
            check.write_text('private check\n')
            original = public_component.read_bytes()
            with public_source_overlay(self._context(workspace, source), ('tests/check_agent.py',), owner=private) as overlay:
                self.assertEqual((overlay / 'tests/check_agent.py').read_text(), 'private check\n')
                self.assertEqual((overlay / public_component.relative_to(source)).read_bytes(), original)
                (overlay / public_component.relative_to(source)).write_text('overlay-only change\n')
            self.assertEqual(public_component.read_bytes(), original)
            self.assertFalse((source / 'tests/check_agent.py').exists())

    def test_selected_module_overlay_uses_selected_bytes_and_private_checks(self):
        from module_harness import selected_module_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            selected = workspace / 'selected-kb10'
            private = workspace / 'private'
            source.mkdir()
            styles = selected / 'ui/src/styles.css'
            styles.parent.mkdir(parents=True)
            styles.write_text('selected styles\n')
            check = private / 'checks/layout.py'
            check.parent.mkdir(parents=True)
            check.write_text('private layout check\n')
            ctx = self._context(workspace, source)
            ctx.inst.config['replace']['kickside/kb10'] = str(selected)
            with selected_module_overlay(ctx, 'kickside/kb10',
                                         (('checks/layout.py', 'ui/tests/layout.py'),), owner=private) as overlay:
                self.assertEqual((overlay / 'ui/src/styles.css').read_text(), 'selected styles\n')
                self.assertEqual((overlay / 'ui/tests/layout.py').read_text(), 'private layout check\n')
                (overlay / 'ui/src/styles.css').write_text('overlay only\n')
            self.assertEqual(styles.read_text(), 'selected styles\n')
            self.assertFalse((selected / 'ui/tests/layout.py').exists())

    def test_requires_each_named_private_fixture_before_copying(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            private.mkdir()
            with self.assertRaisesRegex(Failure, 'fixture is absent'):
                with public_source_overlay(self._context(workspace, source), ('tests/missing.py',), owner=private):
                    pass
            self.assertEqual(list(source.iterdir()), [])

    def test_refuses_absolute_and_traversing_private_fixture_names(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            private.mkdir()
            for name in ('/tmp/not-a-fixture', '../outside.py'):
                with self.subTest(name=name), self.assertRaisesRegex(Failure, 'relative non-traversing'):
                    with public_source_overlay(self._context(workspace, source), (name,), owner=private):
                        pass

    def test_refuses_private_fixtures_that_would_replace_public_code(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            private.mkdir()
            (source / 'Makefile').write_text('public gate\n')
            (private / 'Makefile').write_text('private gate\n')
            with self.assertRaisesRegex(Failure, 'would replace public source'):
                with public_source_overlay(self._context(workspace, source), ('Makefile',), owner=private):
                    pass
            self.assertEqual((source / 'Makefile').read_text(), 'public gate\n')

    def test_refuses_private_fixture_collision_with_a_dangling_public_symlink(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            private.mkdir()
            product_link = source / 'product-entry.py'
            product_link.symlink_to('missing-product-entry.py')
            fixture = private / 'product-entry.py'
            fixture.write_text('private fixture\n')
            with self.assertRaisesRegex(Failure, 'would replace public source'):
                with public_source_overlay(self._context(workspace, source), ('product-entry.py',), owner=private):
                    pass
            self.assertTrue(product_link.is_symlink())
            self.assertEqual(os.readlink(product_link), 'missing-product-entry.py')
            self.assertFalse((source / 'missing-product-entry.py').exists())

    def test_preserves_a_safe_public_symlink_beside_private_tooling(self):
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            private.mkdir()
            (source / 'product-entry.py').write_text('public product\n')
            (source / 'product-link.py').symlink_to('product-entry.py')
            (private / 'checks/check.py').parent.mkdir(parents=True)
            (private / 'checks/check.py').write_text('private fixture\n')
            with public_source_overlay(self._context(workspace, source), ('checks/check.py',), owner=private) as overlay:
                copied_link = overlay / 'product-link.py'
                self.assertTrue(copied_link.is_symlink())
                self.assertEqual(copied_link.read_text(), 'public product\n')
                self.assertEqual((overlay / 'checks/check.py').read_text(), 'private fixture\n')

    def test_stages_private_tooling_at_a_distinct_smoke_only_destination(self):
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            private.mkdir()
            (source / 'Makefile').write_text('public gate\n')
            (private / 'Makefile').write_text('private gate\n')
            with public_source_overlay(self._context(workspace, source),
                                       (('Makefile', '.smoke/private-gate.mk'),), owner=private) as overlay:
                self.assertEqual((overlay / 'Makefile').read_text(), 'public gate\n')
                self.assertEqual((overlay / '.smoke/private-gate.mk').read_text(), 'private gate\n')

    def test_refuses_a_public_source_symlink_that_escapes_the_overlay(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            outside = workspace / 'outside'
            source.mkdir()
            private.mkdir()
            outside.mkdir()
            (source / 'linked').symlink_to(outside, target_is_directory=True)
            fixture = private / 'linked/check.py'
            fixture.parent.mkdir()
            fixture.write_text('private check\n')
            with self.assertRaisesRegex(Failure, 'source symlink escapes its owned tree'):
                with public_source_overlay(self._context(workspace, source), ('linked/check.py',), owner=private):
                    pass
            self.assertFalse((outside / 'check.py').exists())

    def test_preserves_a_named_private_fixture_symlink(self):
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            fixture = private / 'checks/check.py'
            fixture.parent.mkdir(parents=True)
            fixture.write_text('private check\n')
            link = private / 'checks/check-link.py'
            link.symlink_to('check.py')
            with public_source_overlay(self._context(workspace, source),
                                       ('checks/check.py', 'checks/check-link.py'), owner=private) as overlay:
                staged = overlay / 'checks/check-link.py'
                self.assertTrue(staged.is_symlink())
                self.assertEqual(os.readlink(staged), 'check.py')

    def test_refuses_private_symlinks_that_escape_after_destination_remapping(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            source.mkdir()
            (private / 'safe.py').parent.mkdir(parents=True)
            (private / 'safe.py').write_text('private check\n')
            link = private / 'deep/nested/check.py'
            link.parent.mkdir(parents=True)
            link.symlink_to('../../safe.py')
            with self.assertRaisesRegex(Failure, 'symlink escapes the disposable source'):
                with public_source_overlay(self._context(workspace, source),
                                           (('deep/nested/check.py', '.smoke/check.py'),), owner=private):
                    pass

    def test_refuses_selected_module_symlinks_to_external_sources(self):
        from harness import Failure
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            selected = workspace / 'selected-agents'
            outside = workspace / 'outside.lua'
            source.mkdir()
            private.mkdir()
            (selected / 'src').mkdir(parents=True)
            outside.write_text('outside\n')
            (selected / 'src/external.lua').symlink_to(outside)
            with self.assertRaisesRegex(Failure, 'module source symlink escapes its owned tree'):
                with public_source_overlay(self._context(workspace, source), (), owner=private,
                                           module_overrides={'platform/agents': selected}):
                    pass

    def test_uses_selected_module_bytes_without_changing_any_source(self):
        from module_harness import public_source_overlay
        with tempfile.TemporaryDirectory(dir=self.scratch) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            private = workspace / 'private'
            selected = workspace / 'selected-agents'
            base_file = source / 'platform/agents/src/entry.lua'
            selected_file = selected / 'src/entry.lua'
            base_file.parent.mkdir(parents=True)
            selected_file.parent.mkdir(parents=True)
            private.mkdir()
            base_file.write_text('base module\n')
            selected_file.write_text('selected module\n')
            with public_source_overlay(self._context(workspace, source), (), owner=private,
                                       module_overrides={'platform/agents': selected}) as overlay:
                self.assertEqual((overlay / 'platform/agents/src/entry.lua').read_text(), 'selected module\n')
            self.assertEqual(base_file.read_text(), 'base module\n')
            self.assertEqual(selected_file.read_text(), 'selected module\n')


class FrontendTestToolingTests(unittest.TestCase):
    def test_hub_overlay_includes_every_declared_vitest_setup_file(self):
        import re
        from scenarios_automation_task_forms import frontend_specs
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            for name in ('modules.vue', 'InstallDialog.vue'):
                component = source / 'platform/hub/ui/src/app' / name
                component.parent.mkdir(parents=True, exist_ok=True)
                component.write_text('selected public component')
            ctx = Context(Instance(workspace / 'run', source))

            def verify_setup(command, **kwargs):
                ui = Path(kwargs['cwd']) / 'platform/hub/ui'
                config = (ui / 'vitest.config.ts').read_text()
                setup = re.search(r'setupFiles:\s*\[([^]]+)\]', config).group(1)
                paths = re.findall(r"['\"]([^'\"]+)['\"]", setup)
                self.assertTrue(paths, 'Hub Vitest config must declare its setup files')
                for path in paths:
                    self.assertTrue((ui / path).is_file(), 'Missing Hub setup file: ' + path)
                return Completed()

            with patch('subprocess.run', side_effect=verify_setup) as invoke:
                frontend_specs(ctx, 'hub', ('src/app/modules_updates_and_planning.spec.ts',), 'hub')
            self.assertEqual(invoke.call_count, 2)

    def test_hub_ai_review_overlay_uses_the_selected_install_dialog(self):
        from scenarios_automation_task_forms import frontend_specs
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            selected = workspace / 'selected-hub'
            for root, marker in ((source / 'platform/hub', 'base'), (selected, 'selected')):
                for name in ('modules.vue', 'InstallDialog.vue'):
                    component = root / 'ui/src/app' / name
                    component.parent.mkdir(parents=True, exist_ok=True)
                    component.write_text(marker + ' ' + name)
            ctx = Context(Instance(workspace / 'run', source))
            ctx.inst.config['replace']['kickside/hub'] = str(selected)

            def verify_selected(command, **kwargs):
                ui = Path(kwargs['cwd']) / 'platform/hub/ui/src/app'
                self.assertEqual((ui / 'InstallDialog.vue').read_text(), 'selected InstallDialog.vue')
                self.assertEqual((ui / 'modules.vue').read_text(), 'selected modules.vue')
                return Completed()

            with patch('subprocess.run', side_effect=verify_selected) as invoke:
                result = frontend_specs(ctx, 'hub', ('src/app/InstallDialog_ai_review.spec.ts',),
                                        'hub-ai-frontend-guards')
            self.assertEqual(result.returncode, 0)
            self.assertEqual(invoke.call_count, 2)
            self.assertEqual(invoke.call_args_list[-1].args[0][:4],
                             ['make', '-f', '.smoke/private-frontend-tests.mk', 'test'])

    def test_model_picker_overlay_uses_the_selected_widgets_component(self):
        from scenarios_automation_task_forms import frontend_specs
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            selected = workspace / 'selected-widgets'
            for root, marker in ((source / 'platform/widgets', 'base'), (selected, 'selected')):
                for relative in ('src/model-picker/app/ModelPicker.vue',
                                 'src/component-picker/app/ComponentPicker.vue'):
                    component = root / 'ui' / relative
                    component.parent.mkdir(parents=True, exist_ok=True)
                    component.write_text(marker + ' ' + component.name)
            ctx = Context(Instance(workspace / 'run', source))
            ctx.inst.config['replace']['kickside/widgets'] = str(selected)

            def verify_selected(command, **kwargs):
                ui = Path(kwargs['cwd']) / 'platform/widgets/ui'
                self.assertEqual((ui / 'src/model-picker/app/ModelPicker.vue').read_text(),
                                 'selected ModelPicker.vue')
                self.assertEqual((ui / 'src/component-picker/app/ComponentPicker.vue').read_text(),
                                 'selected ComponentPicker.vue')
                self.assertTrue((ui / 'vitest.config.ts').is_file())
                self.assertTrue((ui / 'src/test-setup.ts').is_file())
                return Completed()

            with patch('subprocess.run', side_effect=verify_selected) as invoke:
                result = frontend_specs(ctx, 'widgets',
                                        ('src/model-picker/app/model-picker-capabilities.spec.ts',),
                                        'model-picker-capabilities')
            self.assertEqual(result.returncode, 0)
            self.assertEqual(invoke.call_count, 2)
            self.assertEqual(invoke.call_args_list[-1].args[0][:4],
                             ['make', '-f', '.smoke/private-frontend-tests.mk', 'test'])

    def test_app_ui_contracts_stage_private_specs_against_public_app_source(self):
        from types import SimpleNamespace
        from scenarios_slop_uploads_ui_users import APP_MAIN_PUBLIC_FILES, app_ui_contracts
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            source = workspace / 'public'
            for relative in APP_MAIN_PUBLIC_FILES:
                public = source / relative
                public.parent.mkdir(parents=True, exist_ok=True)
                public.write_text('selected ' + relative)
            ctx = Context(Instance(workspace / 'run', source))

            def verify_staged(command, **kwargs):
                root = Path(kwargs['cwd'])
                self.assertEqual(command[:4], ['make', '-f', '.smoke/private-frontend-tests.mk', 'test'])
                self.assertIn('FE_TEST_COMMAND=./node_modules/.bin/vitest run', command)
                for relative in APP_MAIN_PUBLIC_FILES:
                    self.assertEqual((root / relative).read_text(), 'selected ' + relative)
                for relative in ('app/frontend/applications/main/src/facade-preauth.test.ts',
                                 'app/frontend/applications/main/src/login-route-contract.test.ts',
                                 'app/frontend/applications/main/src/theme-vocabulary.test.ts'):
                    self.assertTrue((root / relative).is_file(), 'private app spec is staged: ' + relative)
                return SimpleNamespace(returncode=0, stdout='Tests 3 passed (3)\n', stderr='')

            with patch('subprocess.run', side_effect=verify_staged) as invoke:
                app_ui_contracts(ctx)
            self.assertEqual(invoke.call_count, 1)

    def test_public_component_map_covers_every_frontend_spec_caller(self):
        import ast
        import scenarios_automation_task_forms as forms
        from scenarios_paging import PAGING_FRONTEND_SPECS
        callers = set()
        for scenario in Path(forms.__file__).parent.glob('scenarios_*.py'):
            for node in ast.walk(ast.parse(scenario.read_text())):
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                        and node.func.id == 'frontend_specs' and len(node.args) > 1
                        and isinstance(node.args[1], ast.Constant) and isinstance(node.args[1].value, str)):
                    callers.add(node.args[1].value)
        callers.update(module for module, _ in PAGING_FRONTEND_SPECS)
        self.assertSetEqual(callers, set(forms.PUBLIC_COMPONENTS))
        self.assertEqual(forms.PUBLIC_COMPONENTS['settings'], ('platform/settings/ui/src/app/SettingsForm.vue',))
        self.assertEqual(forms.PUBLIC_COMPONENTS['hub'], (
            'platform/hub/ui/src/app/modules.vue',
            'platform/hub/ui/src/app/InstallDialog.vue',
        ))
        self.assertEqual(forms.PUBLIC_COMPONENTS['widgets'], (
            'platform/widgets/ui/src/model-picker/app/ModelPicker.vue',
            'platform/widgets/ui/src/component-picker/app/ComponentPicker.vue',
        ))
        self.assertEqual(forms.PUBLIC_COMPONENTS['webhooks'], (
            'platform/webhooks/ui/src/api.ts',
        ))
        self.assertEqual(forms.PUBLIC_COMPONENTS['workflows'], (
            'platform/workflows/ui/src/app/embed/WorkflowPicker.vue',
            'platform/workflows/ui/src/app/embed/EmbedWorkflow.vue',
            'platform/workflows/ui/src/app/api/api.ts',
        ))

    def test_automation_test_packages_use_the_tracked_private_fixture(self):
        from scenarios_automation_task_forms import PRIVATE_FRONTEND_TEST_TOOLING_LOCK, pinned_test_packages
        self.assertEqual(pinned_test_packages(PRIVATE_FRONTEND_TEST_TOOLING_LOCK), 'js-yaml@5.5.0 ajv@8.20.0')

    def test_automation_test_packages_are_pinned_by_the_private_lockfile(self):
        from scenarios_automation_task_forms import pinned_test_packages
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            lock = Path(directory) / 'package-lock.json'
            lock.write_text('{"packages":{"node_modules/js-yaml":{"version":"5.5.0"},'
                            '"node_modules/ajv":{"version":"8.20.0"}}}')
            self.assertEqual(pinned_test_packages(lock), 'js-yaml@5.5.0 ajv@8.20.0')

    def test_automation_test_packages_require_every_lockfile_pin(self):
        from harness import Failure
        from scenarios_automation_task_forms import pinned_test_packages
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            lock = Path(directory) / 'package-lock.json'
            lock.write_text('{"packages":{"node_modules/js-yaml":{"version":"5.5.0"}}}')
            with self.assertRaisesRegex(Failure, 'must pin ajv'):
                pinned_test_packages(lock)

    def test_automation_test_packages_require_the_private_lockfile(self):
        from harness import Failure
        from scenarios_automation_task_forms import pinned_test_packages
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            with self.assertRaisesRegex(Failure, 'tooling lockfile is absent'):
                pinned_test_packages(Path(directory) / 'package-lock.json')


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
    return cwd / 'test' if command[0] == 'make' or (command[0] == '/bin/wippy' and command[3] == 'update' and (cwd / 'test' / '.wippy.yaml').exists()) else cwd


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

    def test_source_profile_allows_only_owned_declared_fixture_aliases(self):
        import yaml
        from harness import Failure
        from module_harness import _verify_focused_source_profile

        scratch = Path(os.environ['TMPDIR']) / 'module-harness-tests'
        scratch.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            workspace = Path(directory)
            copied_repository = workspace / 'copy' / 'chestor'
            focused_root = copied_repository / 'workspace' / 'test'
            selected_workspace = workspace / 'selected-workspace'
            fixture_support = copied_repository / 'test' / 'support'
            fixture_other = copied_repository / 'test' / 'other'
            fixture_mirror = focused_root / 'module-mirror'
            fixture_outside_focus = copied_repository / 'fixtures' / 'mirror'
            outside = workspace / 'copy' / 'outside'
            for path in (focused_root, selected_workspace, fixture_support, fixture_other,
                         fixture_mirror, fixture_outside_focus, outside):
                path.mkdir(parents=True, exist_ok=True)
            expected = {'chestor/workspace': str(selected_workspace)}
            config_path = workspace / '.wippy.yaml'
            declared = yaml.safe_dump({'workspace': {'replacements': {
                'chestor/test-support': '../../test/support',
            }}})

            def write(replacements):
                config_path.write_text(yaml.safe_dump({'workspace': {'replacements': replacements}}))

            # Captured R5 shape: all selected mappings plus a local fixture alias
            # rebased into the disposable repository copy.
            write({**expected, 'chestor/test-support': str(fixture_support)})
            evidence = _verify_focused_source_profile(config_path, expected, copied_repository,
                                                       focused_root, declared)
            self.assertEqual(evidence['owned_fixture_aliases'], ['chestor/test-support'])
            self.assertEqual(evidence['owned_selected_fixture_remaps'], [])

            # Captured CRM shape: native lockrefresh creates an owned mirror
            # declared by the focused test configuration.
            remap_declared = yaml.safe_dump({'workspace': {'replacements': {
                'chestor/workspace': './module-mirror',
                'chestor/test-support': '../../test/support',
            }}})
            write({'chestor/workspace': str(fixture_mirror),
                   'chestor/test-support': str(fixture_support)})
            evidence = _verify_focused_source_profile(config_path, expected, copied_repository,
                                                       focused_root, remap_declared)
            self.assertEqual(evidence['owned_selected_fixture_remaps'], ['chestor/workspace'])

            for declaration, replacement in (
                    ({'chestor/test-support': '../../test/support'}, fixture_mirror),
                    ({'chestor/workspace': str(fixture_mirror)}, fixture_mirror),
                    ({'chestor/workspace': '../../fixtures/mirror'}, fixture_outside_focus)):
                with self.subTest(declaration=declaration):
                    write({'chestor/workspace': str(replacement),
                           'chestor/test-support': str(fixture_support)})
                    with self.assertRaisesRegex(Failure, 'changed selected mappings: chestor/workspace'):
                        _verify_focused_source_profile(config_path, expected, copied_repository,
                                                       focused_root, yaml.safe_dump({'workspace': {
                                                           'replacements': declaration}}))

            write({'chestor/test-support': str(fixture_support)})
            with self.assertRaisesRegex(Failure, 'missing selected mappings: chestor/workspace'):
                _verify_focused_source_profile(config_path, expected, copied_repository,
                                                focused_root, declared)

            write({'chestor/workspace': str(fixture_support)})
            with self.assertRaisesRegex(Failure, 'changed selected mappings: chestor/workspace'):
                _verify_focused_source_profile(config_path, expected, copied_repository,
                                                focused_root, declared)

            write({**expected, 'chestor/test-support': str(fixture_support)})
            with self.assertRaisesRegex(Failure, 'fixture alias is not declared locally: chestor/test-support'):
                _verify_focused_source_profile(config_path, expected, copied_repository,
                                                focused_root, yaml.safe_dump({'workspace': {'replacements': {}}}))

            wrong_declared = yaml.safe_dump({'workspace': {'replacements': {
                'chestor/test-support': '../../test/other',
            }}})
            with self.assertRaisesRegex(Failure, 'fixture alias does not match its declared path: chestor/test-support'):
                _verify_focused_source_profile(config_path, expected, copied_repository,
                                                focused_root, wrong_declared)

            outside_declared = yaml.safe_dump({'workspace': {'replacements': {
                'chestor/test-support': '../../../outside',
            }}})
            write({**expected, 'chestor/test-support': str(outside)})
            with self.assertRaisesRegex(Failure, 'fixture alias escapes the owned copy: chestor/test-support'):
                _verify_focused_source_profile(config_path, expected, copied_repository,
                                                focused_root, outside_declared)

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
