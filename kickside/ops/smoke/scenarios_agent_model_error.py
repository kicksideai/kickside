# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""A stored agent without a model returns an actionable native error."""
from harness import Scenario
from module_harness import run_focused_module_test


def agent_model_configuration_error(ctx):
    run_focused_module_test(ctx, 'kickside/agents', 'agent_resolver_test')


REGISTRY = [
    Scenario('agent_model_configuration_error', 'regression', agent_model_configuration_error,
             issues=('AI-AGENT-MODEL-ERROR',)),
]
