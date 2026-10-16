"""A restricted human MCP caller launches the saved task without borrowing authority."""
import json
import uuid

from harness import Scenario, require
from mcp_client import MCPClient, KICKSIDE_META_TOOLS
from mcp_contracts import denied
from scenarios_bot_root_isolation import _state
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import _fixture, _grant, _effects, _drive, _proof
from scenarios_selected_install import _identity


def bot_human_mcp_fixed_task(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    bot = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Restricted MCP task bot',
        'groups': ['app.security:admin']}, expect=(201,))['user']['user_id']
    inst.cleanup.add('restricted MCP task bot',
        lambda: inst.request('DELETE', '/api/v1/users/' + bot, expect=(202,)))
    fixture = _fixture(ctx, bot_id=bot)
    _grant(inst, fixture)
    root = fixture['root']
    _, generation = _identity(inst, root)
    selected = inst.request('POST', '/api/v1/automations/' + root + '/identity',
        {'principal': {'kind': 'user', 'id': bot}, 'request_id': uuid.uuid4().hex,
         'expected_identity_generation': generation}, auth=fixture['token'])
    require(selected['state'] == 'succeeded', 'The configuring human cannot select the fixed task bot')
    canonical = _identity(inst, root)
    human = inst.request('GET', '/api/v1/user/me')['user']['id']
    require(len({human, bot, fixture['member']['user_id']}) == 3,
            'MCP caller, recorded authorizer and executor are not distinct')
    outside = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.manual:task',
        'input': {'title': 'Outside MCP task', 'target': {'kind': 'action', 'port': fixture['port'],
            'input': {'text': 'outside declaration'}}}})['id']
    inst.cleanup.add('outside MCP task', lambda: inst.request('DELETE', '/api/v1/automations/' + outside))
    credential = inst.request('POST', '/api/v1/mcp/credentials', {
        'label': 'Restricted human fixed task', 'whitelist_component_ids': [root],
        'allowed_trait_ids': [], 'default_active_trait_ids': [],
        'allowed_tool_ids': ['kickside.automation.agent:automations_manage']})['credential']
    token, cid = credential['token'], credential['credential_id']
    inst.redactor.add(token)
    inst.cleanup.add('restricted human MCP credential',
        lambda: inst.request('DELETE', '/api/v1/mcp/credentials/' + cid))
    query = "SELECT actor_id,execution_identity_json,whitelist_json,policy_json,token_hash,status FROM kickside_mcp_credentials WHERE credential_id='" + cid + "'"
    stored = database_rows(inst, query)
    require(len(stored) == 1 and stored[0]['actor_id'] == human, 'Fixed-task token belongs to its bot executor')
    token_identity = json.loads(stored[0]['execution_identity_json'])
    require(token_identity['principal'] == token_identity['authorized_by'] == {'kind': 'user', 'id': human},
            'Human token carries the selected bot or configuring authorizer')
    client = MCPClient(inst, token, '/api/public/mcp', stateful=False)
    client.initialize()
    require(client.tools() == KICKSIDE_META_TOOLS | {'AutomationsManage'}, 'Restricted fixed-task tool grant leaks')
    info = client.call('session_info', {})
    require(info['actor'] == info['identity'] == human and info['whitelist_component_ids'] == [root]
            and info['scoped'] is True, 'Restricted session replaces its human or root ceiling')
    def protected():
        return {**_state(inst, [fixture])[0], 'identity': _identity(inst, root),
            'outside_drive': _drive(inst, outside), 'credential': database_rows(inst, query)}
    baseline = protected()
    refusals = []
    attempts = [
        ('AutomationsManage', {'action': 'run', 'id': outside}),
        ('AutomationsRead', {'action': 'list'}),
        ('RecurringTasks', {'action': 'list'}),
        ('call_tool', {'id': 'AutomationsManage', 'arguments': {'action': 'run', 'id': outside}}),
        ('AutomationsManage', {'action': 'set_execution_identity', 'id': root,
            'principal': {'kind': 'user', 'id': human}, 'request_id': uuid.uuid4().hex,
            'expected_identity_generation': canonical[1]}),
    ]
    attempts.append(('AutomationsManage', {'action': 'set_execution_identity', 'id': root,
        'principal': {'kind': 'user', 'id': bot}, 'request_id': uuid.uuid4().hex,
        'expected_identity_generation': canonical[1]}))
    for name, arguments in attempts:
        refusals.append({'tool': name, 'arguments': arguments, 'reason': denied(client, name, arguments)})
        require(protected() == baseline, 'Refused MCP call mutates protected identity, declaration, audit, source, effect or token')
    for name in ('AutomationsRead', 'RecurringTasks'):
        result = client.tool_result('call_tool', {'id': name, 'arguments': {'action': 'list'}})
        require(result.get('isError') is True and client.text(result) == 'error: tool not active: ' + name,
                'MCP call_tool activates or invokes an ungranted capability')
        require(protected() == baseline, 'Indirect ungranted-tool call changes protected state')
        refusals.append({'indirect_tool': name, 'result': result})
    reconfigure = client.tool_result('AutomationsManage', {'action': 'reconfigure', 'id': root, 'input': {
        'title': 'Forged MCP declaration', 'target': {'kind': 'action', 'port': fixture['port'],
            'input': {'text': 'forged declaration'}}}})
    require(reconfigure.get('isError') is True
            and client.text(reconfigure) == 'tool error: automation type does not support reconfigure',
            'Fixed manual task permits reconfiguration or reports an unrelated failure')
    require(protected() == baseline, 'Refused fixed-task reconfiguration changes protected state')
    refusals.append({'action': 'reconfigure', 'result': reconfigure})
    for field, value in (
            ('principal', {'kind': 'user', 'id': human}),
            ('authorized_by', {'kind': 'user', 'id': human}),
            ('input', {'text': 'forged input'}),
            ('target', {'kind': 'action', 'port': fixture['port'], 'input': {'text': 'forged target'}})):
        result = client.tool_result('AutomationsManage', {'action': 'run', 'id': root, field: value})
        require(result.get('isError') is True and client.text(result), 'Fixed MCP run accepts substituted ' + field)
        require(protected() == baseline, 'Invalid fixed-task arguments mutate protected state')
        refusals.append({'field': field, 'result': result})
    forged = {'execution_identity': {'version': 2, 'principal': {'kind': 'user', 'id': bot},
        'authorized_by': {'kind': 'user', 'id': human}, 'component_id': outside},
        'actor': bot, 'groups': ['app.security:admin']}
    outside_result = client.rpc('tools/call', {'name': 'AutomationsManage',
        'arguments': {'action': 'run', 'id': outside}, '_meta': forged}, 'mcp-outside-run-forged-metadata')
    require(outside_result.get('isError') is True and client.text(outside_result),
            'Forged MCP transport metadata escapes the permitted component subtree')
    require(protected() == baseline, 'Forged outside-root transport call changes protected state')
    refusals.append({'outside_transport_forgery': outside_result})
    result = client.rpc('tools/call', {'name': 'AutomationsManage',
        'arguments': {'action': 'run', 'id': root}, '_meta': forged}, 'mcp-fixed-run-forged-metadata')
    require(not result.get('isError'), 'Permitted fixed command cannot run through the actual human MCP token')
    launched = client.decode_text(client.text(result))
    require(launched['success'] is True and launched['id'] == root and launched['method'] == 'run_now'
            and launched['result']['state'] == 'succeeded', 'MCP fixed task returns no successful native receipt')
    rows = inst.wait(lambda: _effects(inst, fixture) if len(_effects(inst, fixture)) == 1
        and _drive(inst, root)['last_committed_occurrence_seq'] == 1 else None,
        'Restricted human MCP command produces one fixed bot effect', seconds=60)
    identity = _proof(inst, fixture, rows)
    require(identity == canonical[0] and _identity(inst, root) == canonical
            and protected()['component'] == baseline['component'] and protected()['audit'] == baseline['audit']
            and _drive(inst, outside) == baseline['outside_drive'] and database_rows(inst, query) == stored,
            'Human MCP command or forged transport metadata changes executor, authorizer, declaration, audit, scope or token')
    revocation = inst.request('POST', '/api/v1/mcp/credentials/' + cid + '/revoke')
    require(revocation.get('success') is True, 'Restricted MCP credential revocation fails')
    credential_rows = database_rows(inst, query)
    require(len(credential_rows) == 1 and credential_rows[0] == {**stored[0], 'status': 'revoked'},
            'Credential revocation changes owner, original identity, restrictions or token bytes')
    revoked = inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 999,
        'method': 'tools/call', 'params': {'name': 'AutomationsManage',
            'arguments': {'action': 'run', 'id': root}}}, auth=token, expect=(401,))
    require(revoked.get('error'), 'Revoked restricted MCP credential has no authentication refusal')
    require(_effects(inst, fixture) == rows and _identity(inst, root) == canonical
            and protected()['component'] == baseline['component'] and protected()['audit'] == baseline['audit']
            and _drive(inst, outside) == baseline['outside_drive'],
            'Revoked nonempty credential performs another bot effect or changes protected state')
    inst.evidence.save('bot-human-mcp-fixed-task', {'human': human, 'authorizer': fixture['member']['user_id'],
        'bot': bot, 'root': root, 'outside': outside, 'token_identity': token_identity,
        'session': info, 'identity': canonical, 'refusals': refusals,
        'forged_transport_metadata': forged, 'receipt': launched, 'effects': rows, 'revoked_refusal': revoked})


REGISTRY = [Scenario('bot_human_mcp_fixed_task', 'regression', bot_human_mcp_fixed_task,
    ('boot',), instance_setup=True, issues=('BOT-HUMAN-MCP-FIXED-TASK', 'BOT-NONEMPTY-RESTRICTION-CARRIER', 'RA-H21', 'RA-H52', 'RA-H50', 'RA-H51'))]
