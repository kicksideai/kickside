"""Published recurring inputs retain server validation and catalog guidance."""
import sys

from harness import Scenario
from module_harness import (_command, public_source_overlay, run_focused_module_test,
                            selected_module_overrides)


def recurring_contract(ctx):
    tests = 'tests.test_agent_management_schemas.AgentManagementSchemas.'
    with public_source_overlay(ctx, (
        'tests/test_agent_management_schemas.py',
        'tests/fixtures/automation-0.1.126-recurring-tool.json',
        'ops/compat/compare.py',
    ), module_overrides=selected_module_overrides(ctx, (
        ('platform/automation', 'kickside/automation'),
    ))) as root:
        _command(ctx.inst, 'recurring-input-contract', [sys.executable, '-m', 'unittest',
            tests + 'test_recurring_tasks_preserve_the_published_input_contract',
            tests + 'test_recurring_tasks_require_the_target_contract_for_each_kind',
            tests + 'test_recurring_tasks_preserve_ignored_published_fields',
            tests + 'test_recurring_action_guidance_distinguishes_configuration_from_input'],
            root, ctx.inst.env, 60)
    run_focused_module_test(ctx, 'kickside/automation', 'kickside_automation_recurring')


REGISTRY = [Scenario('automation_recurring_published_contract', 'regression', recurring_contract,
    issues=('AUTOMATION-PUBLISHED-TOOL-SCHEMA-COMPATIBILITY', 'AUTOMATION-RECURRING-ACTION-GUIDANCE',
            'AUTOMATION-RECURRING-PARTIAL-INPUT-PRESERVATION',
            'SMOKE-RECURRING-VALIDATION-BOUNDARY', 'AUTOMATION-ACTION-REQUESTED-FIELDS'))]
