import ast
from pathlib import Path
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from module_harness import test_entries
from tests.test_endpoint_policy_components import module_repositories, module_sources


class NativeGuardSelectionTests(unittest.TestCase):
    def test_crm_idempotency_guard_selects_each_registered_split_assertion(self):
        import scenarios_workflow_native_recovery as guards

        crm = module_sources(module_repositories())['kickside/crm']
        entries = test_entries(crm / 'test')
        expected = {
            'crm_sink_receipt_test': ('file://crm_sink_receipt_test.lua', 'run'),
            'crm_sink_receipts_test': ('file://crm_sink_crm_sink_test.lua', 'run_receipts'),
            'crm_sink_references_test': ('file://crm_sink_crm_sink_test.lua', 'run_references'),
            'crm_sink_reconciliation_test': ('file://crm_sink_contract_test.lua', 'run_reconciliation'),
            'crm_sink_conditional_test': ('file://crm_sink_contract_test.lua', 'run_conditional'),
        }
        self.assertEqual(tuple(guards.CRM_IDEMPOTENCY_TESTS), tuple(expected))
        registered = {row['name']: (row['source'], row['method']) for row in entries.values()}
        self.assertEqual({name: registered.get(name) for name in guards.CRM_IDEMPOTENCY_TESTS}, expected)

    def test_pure_native_guards_claim_each_focused_module_root(self):
        import scenarios_native_errors_component_command_causes as component
        import scenarios_native_errors_core_retention_notifier as core
        import scenarios_native_errors_execution as shared_runtime
        import scenarios_native_errors_jobs_harness_dependency as looped
        def claims(module):
            scenario, = module.REGISTRY
            return scenario.parallel

        self.assertEqual(claims(core), ('native-root:kickside/core',))
        self.assertEqual(claims(component), ('native-root:kickside/component',
                                             'native-root:kickside/contract'))
        self.assertEqual(claims(looped), ('native-root:kickside/component',
                                          'native-root:kickside/core',
                                          'native-root:kickside/jobs'))
        # This guard pauses and changes the common runtime after its native
        # checks, so it must retain the scheduler's exclusive default.
        self.assertEqual(claims(shared_runtime), ())

    def test_native_root_claims_are_declared_only_for_strict_focused_guards(self):
        """A native-root claim may only cover direct, runtime-free harness calls."""
        root = Path(__file__).resolve().parents[1]
        failures, declared = [], 0

        def roots_for(function, constants):
            loops, calls = {}, []
            for statement in function.body:
                if (isinstance(statement, ast.Expr) and isinstance(statement.value, ast.Constant)
                        and isinstance(statement.value.value, str)):
                    continue
                statements = [statement]
                if (isinstance(statement, ast.For) and isinstance(statement.target, ast.Name)
                        and isinstance(statement.iter, (ast.Tuple, ast.List)) and all(
                            isinstance(value, ast.Constant) and isinstance(value.value, str)
                            for value in statement.iter.elts)):
                    if statement.orelse:
                        return None
                    loops[statement.target.id] = tuple(value.value for value in statement.iter.elts)
                    statements = statement.body
                for item in statements:
                    call = item.value if isinstance(item, ast.Expr) and isinstance(item.value, ast.Call) else None
                    if not (call and isinstance(call.func, ast.Name)
                            and call.func.id == 'run_focused_module_test' and len(call.args) >= 3):
                        return None
                    if any(isinstance(node, ast.Call) for value in (*call.args, *(keyword.value for keyword in call.keywords))
                           for node in ast.walk(value)):
                        return None
                    calls.append(call)
            if not calls:
                return None
            roots = []
            for call in calls:
                component = call.args[1]
                if isinstance(component, ast.Constant) and isinstance(component.value, str):
                    values = (component.value,)
                elif isinstance(component, ast.Name) and component.id in constants:
                    values = (constants[component.id],)
                elif isinstance(component, ast.Name) and component.id in loops:
                    values = loops[component.id]
                else:
                    return None
                if not all(value.startswith('kickside/') for value in values):
                    return None
                roots.extend(values)
            return tuple('native-root:' + value for value in sorted(set(roots)))

        for path in sorted(root.glob('scenarios_native_errors*.py')):
            tree = ast.parse(path.read_text())
            constants = {statement.targets[0].id: statement.value.value for statement in tree.body
                         if isinstance(statement, ast.Assign) and len(statement.targets) == 1
                         and isinstance(statement.targets[0], ast.Name)
                         and isinstance(statement.value, ast.Constant)
                         and isinstance(statement.value.value, str)}
            functions = {statement.name: statement for statement in tree.body
                         if isinstance(statement, ast.FunctionDef)}
            for scenario in (node for node in ast.walk(tree) if isinstance(node, ast.Call)
                             and isinstance(node.func, ast.Name) and node.func.id == 'Scenario'):
                run = scenario.args[2] if len(scenario.args) >= 3 else None
                function = functions.get(run.id) if isinstance(run, ast.Name) else None
                expected = roots_for(function, constants) if function else None
                parallel = next((keyword.value for keyword in scenario.keywords
                                 if keyword.arg == 'parallel'), None)
                actual = tuple(value.value for value in parallel.elts) if isinstance(parallel, ast.Tuple) and all(
                    isinstance(value, ast.Constant) and isinstance(value.value, str) for value in parallel.elts) else ()
                native = tuple(value for value in actual if value.startswith('native-root:'))
                if expected:
                    declared += 1
                    if actual != expected:
                        failures.append(f'{path.name}:{scenario.lineno}: expected {expected}, got {actual}')
                elif native:
                    failures.append(f'{path.name}:{scenario.lineno}: runtime-touching guard claims {native}')
        self.assertGreater(declared, 0)
        self.assertEqual(failures, [], '\n'.join(failures))

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
