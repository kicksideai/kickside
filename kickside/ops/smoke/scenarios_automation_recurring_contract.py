"""Published recurring inputs retain server validation and catalog guidance."""
from pathlib import Path
import sys

from harness import Scenario
from module_harness import _command, run_focused_module_test


def recurring_contract(ctx):
    root = Path(ctx.inst.config['source'])
    tests = 'tests.test_agent_management_schemas.AgentManagementSchemas.'
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
