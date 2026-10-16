"""Capability discovery maps user requests to searchable catalog operations."""
from pathlib import Path
import sys

from harness import Scenario
from module_harness import _command


def discovery_guidance(ctx):
    tests = 'tests.test_agent_management_schemas.AgentManagementSchemas.'
    _command(ctx.inst, 'agents-discovery-guidance', [sys.executable, '-m', 'unittest',
        tests + 'test_scheduling_is_discoverable_before_activation',
        tests + 'test_discovery_guides_plain_recurring_requests_to_capabilities'],
        Path(ctx.inst.config['source']), ctx.inst.env, 60)


REGISTRY = [Scenario('agents_discovery_request_guidance', 'regression', discovery_guidance,
    issues=('AGENTS-CAPABILITY-REQUEST-KEYWORDS',))]
