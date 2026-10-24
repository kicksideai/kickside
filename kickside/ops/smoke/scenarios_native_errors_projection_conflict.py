"""Projection uniqueness failures carry native conflict metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_conflict_native_errors(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'projection_conflict_test')
    run_focused_module_test(ctx, 'kickside/core', 'slot_test')


REGISTRY = [
    Scenario('native_errors_projection_conflict', 'regression', projection_conflict_native_errors,
             issues=('NE-22',), parallel=('native-root:kickside/core',)),
]
