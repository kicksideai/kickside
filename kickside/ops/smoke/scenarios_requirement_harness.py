"""Harnesses bind the host requirements of transitive dependencies."""
from harness import Scenario
from module_harness import run_focused_module_test


def research_host_bindings(ctx):
    run_focused_module_test(ctx, 'kickside/research', 'host_bindings_test')


REGISTRY = [
    Scenario('research_host_bindings', 'regression', research_host_bindings,
             issues=('HARNESS-TRANSITIVE-HOST-BINDINGS',)),
]
