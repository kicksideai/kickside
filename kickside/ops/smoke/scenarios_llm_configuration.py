"""Installed sync LLM settings reach the native generation owner."""
from harness import Scenario
from module_harness import run_focused_module_test


def llm_configuration(ctx):
    run_focused_module_test(ctx, 'kickside/sync', 'sync_kind_test')
    run_focused_module_test(ctx, 'kickside/transform', 'tsplit_strategy_test_llm_strategy', lint=True)


REGISTRY = [Scenario('sync_llm_configuration', 'regression', llm_configuration,
                     issues=('DESIGN-LLM-INERT-CONFIGURATION', 'TRANSFORM-GENERATION-PROMPT-TYPE'))]
