"""Unmatched engagements declare a transform skip with a reason."""
from harness import Scenario
from module_harness import run_focused_module_test


def meetings_engagement_skip(ctx):
    run_focused_module_test(ctx, 'spiralscout/meetings', 'crm_engagement_test')


def meetings_nested_library_injection(ctx):
    run_focused_module_test(ctx, 'spiralscout/meetings', 'inbox_resolve_test')


REGISTRY = [Scenario('regression_meetings_engagement_skip', 'regression',
                     meetings_engagement_skip, issues=('MEETINGS-EXPLICIT-SKIP',)),
            Scenario('regression_meetings_nested_library_injection', 'regression',
                     meetings_nested_library_injection,
                     issues=('MEETINGS-HARNESS-NESTED-INJECTION',))]
