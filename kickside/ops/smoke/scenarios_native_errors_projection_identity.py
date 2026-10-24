"""Projection registration preserves execution-identity validation metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_identity_native_errors(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'registration_identity_test')
    run_focused_module_test(ctx, 'kickside/core', 'slot_test')


REGISTRY = [
    Scenario('native_errors_projection_identity', 'regression', projection_identity_native_errors,
             issues=('NE-21',), parallel=('native-root:kickside/core',)),
]
