"""Published result-window identities are absent from the installed registry."""
from urllib.parse import quote

from harness import Scenario, require


RETIRED_IDS = (
    'kickside.agents:read_tool_result',
    'kickside.agents.result_window:executor',
    'kickside.agents.result_window:apply',
    'kickside.agents.result_window:wrapper',
    'kickside.agents.result_window:bounded_results',
    'kickside.contract:tool_result_window',
    'kickside.contract:result_window',
    'kickside.uploads:result_window_binding',
    'kickside.uploads:bound_tool_result',
    'kickside.uploads:read_tool_result',
    'kickside.uploads:inspect_tool_result',
    'kickside.mcp_client:result_bounds',
)


def retired_result_window_registry_entries(ctx):
    inst = ctx.inst
    for module in ('kickside/agents', 'kickside/contract', 'kickside/uploads', 'kickside/mcp-client'):
        inst.install(module)
    absent = []
    for identity in RETIRED_IDS:
        response = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(identity, safe=''),
                                label='retired-result-window-registry-entry', expect=(404,))
        message = str(response.get('error') or response.get('message') or '')
        require(not response.get('entry') and message, 'Retired registry identity remains available: ' + identity)
        absent.append({'id': identity, 'message': message})
    inst.evidence.save('retired-result-window-registry-identities', absent)


REGISTRY = [Scenario('retired_result_window_registry_entries', 'regression', retired_result_window_registry_entries,
                     ('boot',), issues=('EE2-2572', 'NE-06', 'NE-78', 'NE-80', 'NE-199', 'R4-I8', 'R4-I10'),
                     instance_setup=True)]
