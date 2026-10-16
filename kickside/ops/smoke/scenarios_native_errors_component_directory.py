"""Sharing directory failures retain native dependency metadata."""
from harness import Scenario
from module_harness import run_focused_module_test

def directory(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'directory_native_test')
    run_focused_module_test(ctx, 'kickside/component', 'share_subject_test')
    run_focused_module_test(ctx, 'kickside/component', 'share_subject_native_test')

REGISTRY = [Scenario('native_errors_component_directory', 'regression', directory, issues=('NE-69',))]
