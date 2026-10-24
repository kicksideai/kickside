"""Snippet reuse retains native failures and confirmed registry artifacts."""
from harness import Scenario
from module_harness import run_focused_module_test


def transform_snippet_errors(ctx):
    run_focused_module_test(ctx, 'kickside/transform', 'snippet_native_test')
    run_focused_module_test(ctx, 'kickside/transform', 'generator_test')
    run_focused_module_test(ctx, 'kickside/transform', 'generator_hint_test')


REGISTRY = [Scenario('native_errors_transform_snippets', 'regression', transform_snippet_errors,
                     issues=('NE-43', 'NE-44', 'NE-45', 'NE-46'), parallel=('native-root:kickside/transform',))]
