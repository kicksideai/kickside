import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/check-contract-surface.py'
spec = importlib.util.spec_from_file_location('contract_surface', SCRIPT)
surface = importlib.util.module_from_spec(spec)
spec.loader.exec_module(surface)


class ContractSurfaceTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR', Path(__file__).parent))
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.write('core/example/src/_index.yaml', '''namespace: kickside.example
entries:
  - name: service
    kind: contract.definition
    methods: [{name: run}, {name: stop}]
  - name: worker
    kind: library.lua
    source: file://worker.lua
  - name: target_db
    kind: ns.requirement
''')
        self.write('core/example/src/worker.lua', 'local service = contract.get("kickside.example:service")\nservice:run()\nservice:stop()\n')
        self.write('app/src/app/deps/_index.yaml', '''namespace: app.deps
entries:
  - name: example
    kind: ns.dependency
    component: kickside/example
    parameters: [{name: target_db, value: app:db}]
''')

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)

    def errors(self):
        return surface.check(self.root)[0]

    def test_production_surface_and_module_relative_requirement(self):
        self.assertEqual(self.errors(), [])

    def test_unregistered_or_test_only_literals_do_not_count(self):
        self.write('core/example/src/worker.lua', '-- contract.get("kickside.example:service")\n')
        self.write('core/example/src/orphan.lua', 'contract.get("kickside.example:service")')
        self.write('core/example/test/src/worker.lua', 'contract.get("kickside.example:service")')
        self.assertEqual(sum('no production invocation' in e for e in self.errors()), 2)

    def test_bindings_are_not_required(self):
        self.assertEqual(self.errors(), [])

    def test_long_comments_do_not_declare_consumers(self):
        self.write('core/example/src/worker.lua', '--[=[\n"kickside.example:service"\n]=]\n')
        self.assertEqual(sum('no production invocation' in e for e in self.errors()), 2)

    def test_defaults_satisfy_requirements_without_parameters(self):
        self.write('app/src/app/deps/_index.yaml', '''namespace: app.deps
entries:
  - name: example
    kind: ns.dependency
    component: kickside/example
''')
        index = self.root / 'core/example/src/_index.yaml'
        original = index.read_text()
        for default in ('""', 'false', '[]', '{}', 'app:db'):
            with self.subTest(default=default):
                index.write_text(original + '    default: ' + default + '\n')
                self.assertEqual(self.errors(), [])
        index.write_text(original + '    default: null\n')
        self.assertIn('unbound app requirement: kickside.example:target_db', self.errors())

    def test_onboarding_parameter_counts_at_original_composition_location(self):
        self.write('app/src/app/deps/_index.yaml', 'entries: []')
        self.write('app/src/app/composition/_index.yaml', '''namespace: app
entries:
  - name: profile
    kind: registry.entry
    packages:
      - component: kickside/example
        parameters: [{name: target_db, value: app:db}]
''')
        self.assertEqual(self.errors(), [])

    def test_undeclared_optional_module_requirements_are_not_app_responsibility(self):
        self.write('app/src/app/deps/_index.yaml', 'entries: []')
        errors, counts = surface.check(self.root)
        self.assertEqual(errors, [])
        self.assertEqual(counts['requirements'], 0)
        self.assertEqual(counts['contracts'], 1)
        self.write('core/example/src/worker.lua', '')
        self.assertEqual(sum('no production invocation' in e for e in self.errors()), 2)

    def test_declared_onboarding_module_without_parameter_fails(self):
        self.write('app/src/app/deps/_index.yaml', 'entries: []')
        self.write('app/src/app/composition/_index.yaml', '''namespace: app
entries:
  - name: profile
    kind: registry.entry
    packages: [{component: kickside/example}]
''')
        self.assertIn('unbound app requirement: kickside.example:target_db', self.errors())

    def test_test_metadata_does_not_declare_a_production_consumer(self):
        index = self.root / 'core/example/src/_index.yaml'
        index.write_text(index.read_text().replace('    source: file://worker.lua', '    meta: {type: test}\n    source: file://worker.lua'))
        self.assertEqual(sum('no production invocation' in e for e in self.errors()), 2)

    def test_generic_dispatch_declares_source_methods_and_reason(self):
        self.write('core/example/src/worker.lua', 'instance[method](instance, args)')
        dispatch = [{'source': 'core/example/src/worker.lua',
                     'contracts': {'kickside.example:service': ['run', 'stop']},
                     'reason': 'Existing generic engine dispatch.'}]
        def save():
            self.write('scripts/contract-dispatch.json', json.dumps(dispatch))
        save()
        self.assertEqual(self.errors(), [])
        # Formatting or refactoring the expression does not change the declaration.
        self.write('core/example/src/worker.lua', 'return instance[method](instance, args)')
        self.assertEqual(self.errors(), [])
        dispatch[0]['source'] = 'core/example/src/unregistered.lua'
        self.write(dispatch[0]['source'], 'instance[method](instance, args)')
        save()
        self.assertTrue(any('invalid generic dispatch' in e for e in self.errors()))
        dispatch[0]['source'] = 'core/example/src/worker.lua'
        dispatch[0]['reason'] = ''
        save()
        self.assertTrue(any('invalid generic dispatch' in e for e in self.errors()))
        dispatch[0]['reason'] = 'Existing generic engine dispatch.'
        for method in ('unknown', '*'):
            dispatch[0]['contracts']['kickside.example:service'] = [method]
            save()
            self.assertTrue(any('unknown dispatched method' in e for e in self.errors()))
        dispatch[0]['contracts']['kickside.example:service'] = ['run']
        save()
        self.assertEqual(self.errors(), ['no production invocation: kickside.example:service.stop'])

    def test_external_invoker_declaration_covers_only_explicit_methods(self):
        self.write('core/example/src/worker.lua', '')
        declaration = [{'module': 'external/consumer', 'source': 'consumer/src/push/worker.lua',
                        'contracts': {'kickside.example:service': ['run', 'stop']},
                        'reason': 'Registered external push worker invokes these methods.'}]
        def save():
            self.write('scripts/contract-dispatch.json', json.dumps(declaration))
        save()
        self.assertEqual(self.errors(), [])
        declaration[0]['contracts']['kickside.example:service'] = ['run']
        save()
        self.assertEqual(self.errors(), ['no production invocation: kickside.example:service.stop'])
        declaration[0]['contracts']['kickside.example:service'] = ['unknown', '*']
        save()
        self.assertEqual(sum('unknown dispatched method' in e for e in self.errors()), 2)
        declaration[0]['reason'] = ''
        save()
        self.assertTrue(any('invalid generic dispatch' in e for e in self.errors()))

    def test_null_or_wrong_dependency_parameter_does_not_bind(self):
        self.write('app/src/app/deps/_index.yaml', '''namespace: app.deps
entries:
  - name: example
    kind: ns.dependency
    component: kickside/example
    parameters: [{name: target_db, value: null}]
''')
        self.assertIn('unbound app requirement: kickside.example:target_db', self.errors())

    def test_jobs_cannot_depend_on_or_import_core(self):
        jobs_index = '''namespace: kickside.core.jobs
entries:
  - name: dep.kickside.core
    kind: ns.dependency
    component: kickside/core
'''
        self.write('core/jobs/src/_index.yaml', jobs_index)
        errors = self.errors()
        self.assertIn('Jobs must not declare a dependency on Core', errors)

        self.write('core/jobs/src/_index.yaml', '''namespace: kickside.core.jobs
entries:
  - name: thread_output
    kind: library.lua
    source: file://worker.lua
    imports:
      threads_writer: kickside.core.threads.persist:writer
''')
        self.write('core/jobs/src/worker.lua', 'return true\n')
        errors = self.errors()
        self.assertIn('Jobs must not import Core: kickside.core.threads.persist:writer', errors)

        self.write('core/jobs/src/_index.yaml', '''namespace: kickside.core.jobs
entries:
  - name: worker
    kind: library.lua
    imports:
      lifecycle: kickside.core.jobs.persist:lifecycle
      jobs: kickside.core.jobs:jobs
''')
        self.write('core/jobs/test/src/_index.yaml', jobs_index)
        self.assertEqual(self.errors(), [])

        # Migrations ship with Jobs too; contract-surface exclusions cannot
        # exempt their import declarations from module layering.
        self.write('core/jobs/src/migrations/_index.yaml', '''namespace: kickside.core.jobs.migrations
entries:
  - name: upgrade
    kind: function.lua
    imports:
      threads_writer: kickside.core.threads.persist:writer
''')
        self.assertIn('Jobs must not import Core: kickside.core.threads.persist:writer', self.errors())

if __name__ == '__main__': unittest.main()
