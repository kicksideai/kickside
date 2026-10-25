"""Original restricted MCP credentials survive a published profile Hub update."""
import hashlib
import json

from harness import Scenario, require
from mcp_client import MCPClient
from mcp_contracts import READER, denied, listed_ids, read_config, sync_fixtures
from scenarios_hot_update_work import database_rows
from scenarios_runtime_batch_root import registry_entry
from scenarios_published_run_as import REGISTRY as PUBLISHED, browser_published_human_automation_update, install_source_through_hub_ui


def browser_published_mcp_credential_hub_ui_update(ctx):
    state = {}
    def capture_authority(fixture, phase):
        inst = fixture.inst
        policies, offset = {}, 0
        while True:
            page = inst.request('GET', '/api/v1/keeper/registry/entries?kind=security.policy&limit=200&offset=' + str(offset))
            for row in page['entries']:
                if '.scopes.metadata:' in row['id']:
                    policies[row['id']] = registry_entry(inst, row['id'], 'published-authority-' + phase)
            if not page['has_more']:
                break
            require(page['count'] > 0, 'Published authority inventory makes no progress')
            offset += page['count']
        inst.evidence.save('published-authority-' + phase, {'metadata': policies,
            'epochs': database_rows(inst, 'SELECT user_id,generation FROM app_user_delegation_epochs ORDER BY user_id')})

    def install(fixture, inst, **arguments):
        try:
            return install_source_through_hub_ui(fixture, inst, **arguments)
        finally:
            capture_authority(fixture, 'hub-return')
    def observe(fixture, phase):
        inst = fixture.inst
        if phase == 'before_restart':
            return
        if phase == 'baseline':
            parameters = [{'name': name, 'value': value} for name, value in {
                'kickside.mcp:api_router': 'app:api', 'kickside.mcp:public_router': 'app:api.public',
                'kickside.mcp:target_db': 'app:db', 'kickside.mcp:ui_server': 'app:gateway',
                'kickside.mcp.security:user_security_scope': 'app.security:user'}.items()]
            inst.install('kickside/mcp', parameters=parameters)
            original = inst.request('GET', '/api/v1/automations')['automations']
            require(len(original) == 1 and original[0]['type'] == 'kickside.sync:sync',
                    'Published MCP profile has no unique existing human Sync')
            aid = original[0]['id']
            declaration = inst.request('GET', '/api/v1/automations/' + aid + '/config')['config']
            outside = sync_fixtures(fixture, ['Outside the existing MCP scope'])[0]
            large = sync_fixtures(fixture, ['Existing larger MCP configuration'],
                expression=json.dumps({'title': 'Existing larger read', 'content': 'x' * 2200}))[0]
            actor = inst.request('GET', '/api/v1/user/me')['user']['id']
            credential = inst.request('POST', '/api/v1/mcp/credentials', {
                'label': 'Existing restricted automation reader', 'whitelist_component_ids': sorted([aid, large['id']]),
                'allowed_trait_ids': [READER], 'default_active_trait_ids': [READER],
                'allowed_tool_ids': []})['credential']
            inst.redactor.add(credential['token'])
            state.update(credential=credential, actor=actor, outside=outside,
                         rows=[{'id': aid, 'expression': declaration['transform']['expr']}, large])
            state['query'] = "SELECT credential_id,token_hash,token_prefix,actor_id,whitelist_json,policy_json,context_json,status,expires_at,created_at,revoked_at,revoked_by,execution_identity_json FROM kickside_mcp_credentials WHERE credential_id='" + credential['credential_id'] + "'"
            state['stored'] = database_rows(inst, state['query'])
            capture_authority(fixture, 'baseline')
            require(len(state['stored']) == 1 and state['stored'][0]['actor_id'] == actor,
                    'Published MCP credential does not retain its original human owner')
        credential = state['credential']
        client = MCPClient(inst, credential['token'], '/api/public/mcp', stateful=False)
        client.initialize()
        tools = sorted(client.tools())
        info = client.call('session_info', {})
        require(info['identity'] == state['actor'] and info['actor'] == state['actor']
                and info['whitelist_component_ids'] == sorted(row['id'] for row in state['rows']) and info['scoped'] is True,
                'Existing MCP token changes its human identity or component restriction')
        require('AutomationsRead' in tools and 'AutomationsManage' not in tools,
                'Existing reader credential acquires write capabilities or loses read access')
        require(listed_ids(client) == {row['id'] for row in state['rows']},
                'Existing MCP reader exposes an outside automation or loses its original scope')
        config = {row['id']: read_config(client, row)['config'] for row in state['rows']}
        require(len(json.dumps(config[state['rows'][1]['id']]).encode()) > 4096,
                'Published larger configuration fixture does not exercise the response boundary')
        denied(client, 'AutomationsRead', {'action': 'read_config', 'id': state['outside']['id']})
        denied(client, 'AutomationsManage', {'action': 'pause', 'id': state['rows'][0]['id']})
        stored = database_rows(inst, state['query'])
        require(stored == state['stored'], 'Hub update rewrites the original MCP hash, owner, scope, context or identity')
        if phase == 'baseline':
            state.update(tools=tools, info=info, config=config)
        inst.evidence.save('published-existing-mcp-comparison-' + phase, {
            'baseline': {key: state[key] for key in ('tools', 'info', 'config')},
            'current': {'tools': tools, 'info': info, 'config': config}})
        require(tools == state['tools'] and info == state['info'] and config == state['config'],
                'Existing MCP tool catalog, authority or allowed configuration changes after update')
        inst.evidence.save('published-existing-mcp-' + phase, {
            'credential_id': credential['credential_id'], 'token_digest': hashlib.sha256(credential['token'].encode()).hexdigest(),
            'stored': stored, 'tools': tools, 'info': info, 'config': config,
            'outside_component_denied': True, 'write_tool_denied': True,
            'transports': sorted(client.transports)})

    browser_published_human_automation_update(ctx, installer=install,
        observe=observe, modules=('kickside/mcp',), controller_source='keeper/keeper')


REGISTRY = [Scenario('browser_published_mcp_credential_hub_ui_update', 'regression',
    browser_published_mcp_credential_hub_ui_update, ('boot',), instance_setup=True,
    issues=PUBLISHED[0].issues + ('RA-B16', 'RA-C08', 'BOT-PUBLISHED-MCP-CREDENTIAL-CONTINUITY',
                               'SECURITY-POLICY-EXPANSION-FENCE', 'USERS-UNCHANGED-AUTHORITY-DELEGATION-REVOCATION',
                               'AUTOMATION-PUBLISHED-CONFIG-PAYLOAD'))]
