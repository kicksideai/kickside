"""Projection controls preserve native persistence and rollback failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_control_native_errors(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'control_error_test')
    run_focused_module_test(ctx, 'kickside/core', 'slot_test')


REGISTRY = [
    Scenario('native_errors_projection_controls', 'regression', projection_control_native_errors,
             issues=('NE-24', 'NE-25')),
]
