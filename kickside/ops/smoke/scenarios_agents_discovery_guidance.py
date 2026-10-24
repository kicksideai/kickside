"""Capability discovery maps user requests to searchable catalog operations."""
import sys

from harness import Scenario
from module_harness import _command, public_source_overlay, selected_module_overrides


def discovery_guidance(ctx):
    tests = 'tests.test_agent_management_schemas.AgentManagementSchemas.'
    with public_source_overlay(ctx, ('tests/test_agent_management_schemas.py',), module_overrides=
                               selected_module_overrides(ctx, (
                                   ('platform/automation', 'kickside/automation'),
                                   ('platform/agents', 'kickside/agents'),
                               ))) as root:
        _command(ctx.inst, 'agents-discovery-guidance', [sys.executable, '-m', 'unittest',
            tests + 'test_scheduling_is_discoverable_before_activation',
            tests + 'test_discovery_guides_plain_recurring_requests_to_capabilities'],
            root, ctx.inst.env, 60)


REGISTRY = [Scenario('agents_discovery_request_guidance', 'regression', discovery_guidance,
    issues=('AGENTS-CAPABILITY-REQUEST-KEYWORDS',))]
