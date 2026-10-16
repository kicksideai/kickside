"""Check memory binding through the Platform capability and the agent read API."""
import json
from harness import Failure, require


def check_memory_binding(ctx, rpc, agent_id):
    from scenarios_ai import kb_create, tool_value
    memory = kb_create(ctx, 'document', 'Northwind memory binding')
    reader = kb_create(ctx, 'document', 'Northwind searchable handbook')
    contexts = {'kickside.knowledge.traits:kb_reader': {'kb_ids': [reader]}}
    ctx.inst.request('PUT', '/api/v1/user-agents/' + agent_id, {
        'traits': ['kickside.knowledge.traits:kb_reader'], 'trait_contexts': contexts,
    }, label='platform-reader-scope')
    def current():
        return ctx.inst.request('GET', '/api/v1/user-agents/' + agent_id, label='platform-memory-state')['agent']
    attached = json.loads(tool_value(rpc, 'Platform', {
        'action': 'attach_kb', 'component_id': agent_id, 'kb_id': memory,
    }, 'platform-memory-attach'))
    require(attached['attached'], 'Platform memory attachment supplies no receipt')
    require(current()['memory_target_id'] == memory, 'Memory attachment does not persist')
    try:
        tool_value(rpc, 'Platform', {
            'action': 'detach_kb', 'component_id': agent_id, 'kb_id': reader,
        }, 'platform-memory-wrong-detach')
    except Failure as error:
        require("is not this agent's memory KB" in str(error), 'Wrong memory detach returns another failure: ' + str(error))
    else:
        raise Failure('Platform detaches an unrelated memory KB')
    require(current()['memory_target_id'] == memory, 'Wrong detach clears the memory binding')
    detached = json.loads(tool_value(rpc, 'Platform', {
        'action': 'detach_kb', 'component_id': agent_id, 'kb_id': memory,
    }, 'platform-memory-detach'))
    require(detached['detached'], 'Platform memory detach supplies no receipt')
    agent = current()
    require(agent['memory_target_id'] == '', 'Matching memory detach retains its binding')
    require(agent['trait_contexts'] == contexts, 'Memory binding changes the reader trait KBs')
