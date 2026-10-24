"""Workspace provisioning retains native failures through process results."""
from harness import Scenario
from module_harness import run_focused_module_test


def workspace_native_errors(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'workspace_plugin_native_test')
    run_focused_module_test(ctx, 'kickside/core', 'workspace_plugin_test')


REGISTRY = [
    Scenario('native_errors_workspace_plugin', 'regression', workspace_native_errors,
             issues=('NE-18',), parallel=('native-root:kickside/core',)),
]
