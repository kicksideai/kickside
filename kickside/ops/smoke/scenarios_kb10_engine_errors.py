"""Guard KB engine configuration and failure reporting through native harnesses."""
from harness import Scenario
from module_harness import run_focused_module_test


def kb10_query_configuration(ctx):
    run_focused_module_test(ctx, 'kickside/kb10', 'engine_config_test')
    run_focused_module_test(ctx, 'kickside/kb10', 'retrieval_settings_test')


def kb10_resummarize_outcomes(ctx):
    run_focused_module_test(ctx, 'kickside/kb10', 'resummarize_test')


def kb10_delete_identity_errors(ctx):
    run_focused_module_test(ctx, 'kickside/kb10', 'producer_test')


REGISTRY = [
    Scenario('kb10_query_configuration', 'regression', kb10_query_configuration,
             issues=('KB10-QUERY-CONFIGURATION',)),
    Scenario('kb10_resummarize_outcomes', 'regression', kb10_resummarize_outcomes,
             issues=('KB10-RESUMMARIZE-OUTCOMES',)),
    Scenario('kb10_delete_identity_errors', 'regression', kb10_delete_identity_errors,
             issues=('KB10-DELETE-IDENTITY-ERRORS',)),
]
