import ast
from pathlib import Path
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from module_harness import test_entries
from tests.test_endpoint_policy_components import module_repositories, module_sources


class NativeGuardSelectionTests(unittest.TestCase):
    def test_literal_native_guards_select_registered_tests_or_suites(self):
        root = Path(__file__).resolve().parents[3]
        modules = {name: path/'test' for name,path in module_sources(module_repositories()).items()}
        cache = {}
        failures = []
        for path in sorted((root / 'ops/smoke').glob('scenarios*.py')):
            tree = ast.parse(path.read_text())
            constants = {statement.targets[0].id: statement.value.value
                         for statement in tree.body
                         if isinstance(statement, ast.Assign) and len(statement.targets) == 1
                         and isinstance(statement.targets[0], ast.Name)
                         and isinstance(statement.value, ast.Constant)
                         and isinstance(statement.value.value, str)}
            for call in ast.walk(tree):
                if not (isinstance(call, ast.Call) and isinstance(call.func, ast.Name)
                        and call.func.id == 'run_focused_module_test' and len(call.args) >= 3):
                    continue
                component, selection = call.args[1:3]
                name = (component.value if isinstance(component, ast.Constant)
                        else constants.get(component.id) if isinstance(component, ast.Name) else None)
                if not (isinstance(selection, ast.Constant) and isinstance(name, str)
                        and isinstance(selection.value, str) and name in modules):
                    continue
                if name not in cache:
                    cache[name] = test_entries(modules[name])
                entries = cache[name]
                if not any(selection.value in (identifier, row['name'], row.get('meta', {}).get('suite'))
                           for identifier, row in entries.items()):
                    failures.append(f'{path.name}:{call.lineno}: {name}/{selection.value}')
        self.assertEqual(failures, [], '\n'.join(failures))

    def test_native_page_tables_select_registered_tests_or_suites(self):
        from scenarios_native_tool_pages import NATIVE_SUITES, NATIVE_APPLICATION_SUITES
        modules=module_sources(module_repositories())
        failures=[]
        for name,(component,selections) in NATIVE_SUITES.items():
            self.assertIn(component,modules,'Native guard source is missing: '+component)
            entries=test_entries(modules[component]/'test')
            for selection in selections:
                if not any(selection in (identifier,row['name'],row.get('meta',{}).get('suite'))
                           for identifier,row in entries.items()):
                    failures.append(name+': '+component+'/'+selection)
        root=Path(__file__).resolve().parents[3]
        for name,(path,selection) in NATIVE_APPLICATION_SUITES.items():
            entries=test_entries(root/path)
            if not any(selection in (identifier,row['name'],row.get('meta',{}).get('suite'))
                       for identifier,row in entries.items()):failures.append(name+': '+path+'/'+selection)
        self.assertEqual(failures,[],'\n'.join(failures))

    def test_endpoint_guard_loops_select_registered_entries(self):
        import scenarios_endpoint_policy_components as guards
        modules=module_sources(module_repositories())
        failures=[]
        def record(ctx,component,selection,**kwargs):
            self.assertIn(component,modules)
            entries=test_entries(modules[component]/'test')
            if not any(selection in (identifier,row['name'],row.get('meta',{}).get('suite'))
                       for identifier,row in entries.items()):
                failures.append(component+'/'+selection)
        ctx=SimpleNamespace(inst=Mock())
        with patch.object(guards,'run_focused_module_test',side_effect=record):
            for guard in (guards.endpoint_policy_components, guards.endpoint_policy_consumers,
                          guards.jobs_endpoint_policy_component, guards.mcp_endpoint_policy_component,
                          guards.scoped_endpoint_policy_consumers):
                guard(ctx)
        self.assertEqual(failures,[],'\n'.join(failures))

    def test_app_guards_use_the_source_application(self):
        import scenarios_endpoint_policy_components as guards
        root=Path(__file__).resolve().parents[3]
        ctx=SimpleNamespace(inst=Mock(config={'source':str(root),'replace':{}}))
        with patch.object(guards,'run_focused_app_test') as run, \
             patch.object(guards,'run_focused_module_test'), \
             patch.object(guards,'endpoint_policy_architecture'):
            guards.core_endpoint_policy_baseline(ctx)
            guards.execution_baseline_identity_resolution(ctx)
            guards.execution_resolver_private_read(ctx)
        self.assertEqual([call.args[1] for call in run.call_args_list],[root/'app/test']*3)
        self.assertEqual([call.args[2] for call in run.call_args_list],
                         ['user_endpoint_policy_test','admin_boundary_policy_test','resolver_identity_capability_test'])

    def test_paging_factory_guards_select_registered_entries(self):
        import scenarios_paging as guards
        from module_harness import _focus_tests
        modules=module_sources(module_repositories())
        def record(ctx,component,selection):
            _focus_tests(modules[component]/'test',{},selection)
        with patch.object(guards,'run_focused_module_test',side_effect=record):
            for scenario in guards.REGISTRY:
                if scenario.run is not guards.frontend:
                    with self.subTest(scenario=scenario.name):scenario.run(None)
