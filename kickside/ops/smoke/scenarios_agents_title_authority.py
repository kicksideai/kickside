"""Preserve title reads for callers with independent query-method restrictions."""
from harness import Scenario
from module_harness import run_focused_module_test


def title_query_authority(ctx):
    run_focused_module_test(ctx, 'kickside/agents', 'agents_title_contract_authority_test')


REGISTRY = [Scenario('agents_title_query_authority_compatibility', 'regression', title_query_authority,
                     issues=('AGENTS-TITLE-QUERY-AUTHORITY-COMPATIBILITY',))]
