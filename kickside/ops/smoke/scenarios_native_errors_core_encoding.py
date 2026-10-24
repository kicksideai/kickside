"""Encoding migration query and validation failures stay native."""
from harness import Scenario
from module_harness import run_focused_module_test

def encoding(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'encoding_native_test')

REGISTRY = [Scenario('native_errors_core_encoding_migration', 'regression', encoding, issues=('NE-74',), parallel=('native-root:kickside/core',))]
