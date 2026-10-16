"""Natural-key migration query and schema refusals remain native."""
from harness import Scenario
from module_harness import run_focused_module_test

def schema(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'schema_native_test')
    run_focused_module_test(ctx, 'kickside/core', 'natural_key_integrity_test')

REGISTRY = [Scenario('native_errors_core_schema_migration', 'regression', schema, issues=('NE-76',))]
