"""Provider user paths and local-service contracts on disposable Hub deployments."""
import base64
import json
from pathlib import Path
import re
import uuid
from urllib.parse import parse_qs, urlsplit

from browser import Browser
from chat_transport import api_command
from harness import Scenario, require
from runtime import Instance
from scenarios import Context, nav
from scenarios_ai import function_messages
from mcp_limits_contracts import mcp_limits
from mcp_client import MCPClient
from hubspot_engagement_contracts import hubspot_engagements
from google_refresh_contracts import google_oauth_refresh
from discord_responder_contracts import discord_gateway_responder

HERE = Path(__file__).resolve().parent
NS = 'app.smoke.providers'
REPORTER_JQL = 'project = EE2 AND creator = currentUser() ORDER BY created DESC'


def feature(component, category, key):
    return 'kickside/' + component + '|' + category + '|' + key


def load_fixture(ctx):
    inst = ctx.inst
    ctx.restart()
    inst.manifest()
    inst.install("kickside/mcp")


def configure_provider_endpoints(ctx, endpoints):
    import yaml
    path = ctx.inst.app / '.wippy.yaml'
    config = yaml.safe_load(path.read_text())
    variables = config.setdefault('vars', {})
    overrides = config.setdefault('profiles', {}).setdefault('quickstart', {}).setdefault('override', {})
    for requirement, value in endpoints.items():
        declaration = ctx.inst.request('GET', '/api/v1/keeper/registry/entry?id=' + requirement,
                                       label='configured-' + requirement)['entry']['data']
        require(declaration.get('targets'), 'Endpoint requirement declares no targets: ' + requirement)
        variable = 'provider_' + re.sub(r'[^a-zA-Z0-9_]', '_', requirement)
        variables[variable] = value
        overrides[requirement + ':default'] = '${' + variable + '}'
        for target in declaration['targets']:
            overrides[target['entry'] + ':' + target['path'].lstrip('.')] = '${' + variable + '}'
    path.write_text(yaml.safe_dump(config, sort_keys=False))


def providers_boot(ctx: Context):
    inst: Instance = ctx.inst
    Browser.release(ctx)
    ctx.state['provider_bases'] = {}
    inst.cleanup.add('provider fixtures', ctx.fixtures.stop)
    for name in ('jira', 'confluence', 'simplefin', 'mcp', 'oidc', 'webscout', 'google', 'github', 'slack', 'discord', 'hubspot', 'telegram', 'fireflies', 'phantombuster', 'microsoft'):
        ctx.state['provider_bases'][name] = ctx.fixtures.start(name)
    install_probe(ctx)


def install_probe(ctx):
    inst = ctx.inst
    import yaml
    fixture = inst.app / 'src' / 'provider-smoke'
    fixture.mkdir(exist_ok=True)
    (fixture / 'probe.lua').write_text((HERE / 'mocks/providers_probe.lua').read_text())
    entries = [
        {'name': 'probe', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'handler', 'modules': ['funcs','contract','registry','json'], 'imports': {'component':'kickside.component:component'}, 'meta': {'type':'tool', 'public':True, 'llm_alias':'NorthwindProviderProbe', 'title':'Northwind provider contract probe', 'input_schema': {'type':'object','properties': {'connection_id':{'type':'string'},'write':{'type':'boolean'},'tool':{'type':'string'},'trait':{'type':'string'},'port':{'type':'string'},'context':{'type':'object'},'arguments':{'type':'object'}},'required':['arguments']}}}
    ]
    resources = [base + '/*' for base in ctx.state.get('provider_bases', {}).values()] + ctx.state.get('probe_http_resources', [])
    if resources:
        entries.insert(0, {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
            'policy': {'resources': resources, 'actions': ['http_client.request'], 'effect': 'allow'}})
    if ctx.state.get('provider_bases'):
        entries.insert(0, {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
            'policy': {'resources': ['127.0.0.1'], 'actions': ['http_client.private_ip'], 'effect': 'allow'}})
    (fixture / '_index.yaml').write_text(yaml.safe_dump({'version':'1.0','namespace':NS,'entries':entries},sort_keys=False))
    load_fixture(ctx)
    minted = inst.request('POST','/api/v1/mcp/credentials',{'label':'Northwind provider smoke','allowed_tool_ids':[NS+':probe']},label='probe-credential')['credential']
    ctx.state['provider_probe_token'] = minted['token']
    ctx.state['provider_probe_client'] = MCPClient(inst, minted['token'], '/api/public/mcp', stateful=False)
    inst.redactor.add(minted['token'])
    inst.cleanup.add('provider probe credential',lambda: inst.request('DELETE','/api/v1/mcp/credentials/'+minted['credential_id']))
    inst.wait(lambda: 'NorthwindProviderProbe' in ctx.state['provider_probe_client'].tools(),
              'Provider probe is advertised to its credential')


JSON_TOOLS = frozenset({
    'kickside.mcp_client:build_tools',
    'kickside.mcp_client:invoke_tool',
    'kickside.webscout.traits:links',
    'kickside.webscout.traits:search',
})

def decode_provider_value(tool, value):
    if isinstance(value, str) and tool in JSON_TOOLS:
        return json.loads(value)
    return value


def probe_value(ctx, *, tool=None, trait=None, port=None, connection=None, write=False, context=None, arguments=None, label='provider-probe', expect_error=False):
    args = {'arguments':arguments or {}, 'context':context or {}, 'write':write}
    for key,value in [('tool',tool),('trait',trait),('port',port),('connection_id',connection)]:
        if value:
            args[key] = value
    client = ctx.state['provider_probe_client']
    result = client.request('tools/call', {'name': 'NorthwindProviderProbe', 'arguments': args}, label)
    require('error' not in result, 'Provider MCP protocol fails: ' + str(result))
    require(bool(result.get('result', {}).get('isError')) == expect_error,
            'Provider MCP tool verdict differs from its expectation: ' + str(result))
    text = client.text(result['result'])
    if expect_error:
        return result['result']
    envelope = client.decode_text(text)
    require('value' in envelope, 'Probe lacks the product result: '+str(envelope))
    value = decode_provider_value(tool, envelope['value'])
    return value


def probe(ctx, **kwargs):
    value = probe_value(ctx, **kwargs)
    require(not (isinstance(value,dict) and value.get('success') is False), 'Provider operation fails: '+str(value))
    require(not (isinstance(value,str) and value.startswith('Error:')), value)
    return value


def wait_for_provider(inst, impl, *, auth=None):
    def visible():
        response = inst.request('GET', '/api/v1/connections/providers/discover', auth=auth,
                                label='provider-discovery-readiness')
        require(response.get('success') is True, 'Provider discovery does not succeed')
        return next((row for row in response['providers'] if row['impl_id'] == impl), None)
    return inst.wait(visible, 'Installed provider is visible to the configuring user')


def connect(ctx, provider, impl, private, *, scope='instance'):
    result = ctx.inst.request('POST','/api/v1/connections',{'impl_id':impl,'name':'Northwind '+provider,'private_context':private,'validate':True},label=provider+'-connect')
    cid = result['component_id']
    require(cid, 'Connection has no durable id')
    ctx.state[provider+'_connection'] = cid
    ctx.inst.cleanup.add(provider+' connection',lambda:ctx.inst.request('DELETE','/api/v1/connections/'+cid), scope=scope)
    rows = ctx.inst.request('GET','/api/v1/connections',label=provider+'-persisted')
    require(cid in json.dumps(rows) and 'Northwind '+provider in json.dumps(rows), 'Connection identity/name do not persist')
    return cid


def atlassian_connect(ctx):
    ctx.inst.install('kickside/atlassian')
    for name in ('jira','confluence'):
        cid = connect(ctx,name,'kickside.atlassian.connection:atlassian_connection',{'site_url':ctx.state['provider_bases'][name],'deployment':'cloud','email':'northwind@example.invalid','api_token':'fictional-jira-token'})
        resources = ctx.inst.request('POST','/api/v1/connections/'+cid+'/discover_resources',{},label=name+'-resources')['resources']
        require('Northwind' in json.dumps(resources), name+' has no fictional resources')
    bad = ctx.inst.request('POST','/api/v1/connections',{'impl_id':'kickside.atlassian.connection:atlassian_connection','name':'Northwind rejected credential','validate':True,'private_context':{'site_url':ctx.state['provider_bases']['jira'],'deployment':'cloud','email':'northwind@example.invalid','api_token':'wrong'}},expect=(400,),label='jira-rejected-auth')
    require(bad.get('success') is False and bad.get('error'), 'Invalid credential lacks an observable rejection')


def jira_tools(ctx):
    cid = ctx.state['jira_connection']
    read = lambda args,trait='jira_reader',label='jira-read': probe(ctx,tool='kickside.atlassian.jira.traits:jira_get',trait='kickside.atlassian.jira.traits:'+trait,connection=cid,context={'project_key':'NW'},arguments=args,label=label)
    write = lambda args,trait='jira_writer',label='jira-write': probe(ctx,tool='kickside.atlassian.jira.traits:jira_write',trait='kickside.atlassian.jira.traits:'+trait,connection=cid,write=True,context={'project_key':'NW'},arguments=args,label=label)
    require(read({'action':'get_issue','issue_key':'NW-1'})['issue']['fields']['summary'] == 'Check Northwind order','Jira issue content differs')
    created = write({'action':'create_issue','summary':'Northwind autumn shipment','description':'Pack 24 fictional orders'})
    key = created['issue_key']
    write({'action':'update_issue','issue_key':key,'fields':{'summary':'Northwind autumn shipment packed'}},trait='jira_developer',label='jira-developer-update')
    require(read({'action':'get_issue','issue_key':key},trait='jira_developer',label='jira-developer-read')['issue']['fields']['summary']=='Northwind autumn shipment packed','Jira write-back loses summary')
    write({'action':'delete_issue','issue_key':key},label='jira-delete')


def regression_atlassian_native_pages(ctx):
    from module_harness import run_focused_module_test
    for entry in ('jira_api_test', 'confluence_api_test', 'jira_traits_test', 'confluence_traits_test'):
        run_focused_module_test(ctx, 'kickside/atlassian', entry)


def regression_jira_native_search_page(ctx):
    rows, token = [], None
    before = ctx.inst.request('GET', '/api/v1/uploads/list?limit=100', label='jira-native-uploads-before')
    for number in range(3):
        arguments = {'action': 'search_issues', 'jql': 'project = NW ORDER BY updated ASC', 'max_results': 1}
        if token is not None:
            arguments['next_page_token'] = token
        page = probe(ctx, tool='kickside.atlassian.jira.traits:jira_get',
                     connection=ctx.state['jira_connection'], arguments=arguments,
                     label='jira-native-page-' + str(number))
        require(page.get('success') is True and len(page.get('issues', [])) == 1,
                'Jira search does not return one native issue record')
        row = page['issues'][0]
        require(isinstance(row.get('key'), str) and isinstance(row.get('fields', {}).get('summary'), str)
                and 'description' not in row.get('fields', {}) and 'description_text' not in row
                and 'continuation' not in page and 'truncated' not in page,
                'Jira search does not return a compact native issue page')
        rows.extend(page['issues'])
        next_token = page.get('next_page_token')
        if number < 2:
            require(isinstance(next_token, str) and next_token and next_token != token,
                    'Jira search loses its native next-page token')
        else:
            require(next_token is None and page.get('is_last') is True,
                    'Jira final search page is not terminal')
        token = next_token
    require([row['key'] for row in rows] == ['NW-1', 'NW-2', 'NW-3'], 'Jira pagination loses or duplicates issues')
    after = ctx.inst.request('GET', '/api/v1/uploads/list?limit=100', label='jira-native-uploads-after')
    require(before == after, 'Jira search writes an Uploads snapshot')


def _allow_model_fixture(ctx, base):
    """Give the disposable smoke app access to its deterministic model endpoint."""
    import yaml
    index = ctx.inst.app / 'src' / 'provider-smoke' / '_index.yaml'
    document = yaml.safe_load(index.read_text())
    egress = next(entry for entry in document['entries'] if entry['name'] == 'egress')
    resource = base + '/*'
    if resource not in egress['policy']['resources']:
        egress['policy']['resources'].append(resource)
        index.write_text(yaml.safe_dump(document, sort_keys=False))
        load_fixture(ctx)


def _model_request_fits(record, context_window, output_reservation):
    body = record['body']
    messages = body.get('messages')
    require(isinstance(messages, list) and messages, 'Model fixture records no prompt messages')
    from mocks.context_model import prompt_tokens
    size = prompt_tokens(body)
    from mocks.chat_completion import completion_usage
    usage = completion_usage(record['response'])
    require(usage.get('prompt_tokens') == size,
            'Deterministic model request size omits prompt-bearing fields: ' + str(usage))
    requested = body.get('max_tokens', body.get('max_completion_tokens', output_reservation))
    require(isinstance(requested, int) and 0 < requested <= output_reservation,
            'Model request omits or exceeds its declared output reservation: ' + str(body))
    require(size + requested <= context_window,
            'Recorded model request exceeds its context window after output reservation: ' + str({
                'prompt_tokens': size, 'requested_output': requested,
                'context_window': context_window}))
    return {'prompt_tokens': size, 'requested_output': requested,
            'context_window': context_window}


def _direct_result_messages(transcript):
    calls = function_messages(transcript, 'JiraRead')
    require(calls, 'Chat does not call JiraRead')
    require(not function_messages(transcript, 'ReadToolResult'), 'Chat invokes removed continuation tool')
    for call in calls:
        _direct_jira_rows(call)
    return calls


def _direct_jira_rows(call):
    page = call.get('metadata', {}).get('result')
    require(isinstance(page, dict) and not any(key in page for key in (
        'continuation', 'content_offset', 'next_offset', 'partial', 'total_size', 'content')),
        'JiraRead returns a result-window envelope: ' + str(page))
    issues = page.get('issues') if isinstance(page, dict) else None
    require(isinstance(issues, list) and page.get('count') == len(issues),
            'JiraRead direct content is not a complete issue page: ' + str(page))
    rows = [(issue.get('key'), issue.get('fields', {}).get('summary')) for issue in issues if isinstance(issue, dict)]
    require(len(rows) == len(issues) and all(isinstance(key, str) and key and isinstance(summary, str) and summary
                                              for key, summary in rows),
            'JiraRead issue page lacks compact key/title rows: ' + str(page))
    return rows


def _reply_from_native_jira_result(body):
    tool_messages = [message for message in body['messages'] if message.get('role') == 'tool']
    if not tool_messages:
        return 'Direct result context confirmation.'
    page = json.loads(tool_messages[-1]['content'])
    return '\n'.join(issue['key'] + ' ' + issue['fields']['summary'] for issue in page['issues'])


def regression_EE2_2572_direct_result_chat(ctx):
    """Native Jira pages reach chat directly on both small and 262k model cards."""
    from browser import CHAT_STATE
    from runtime_fixtures import complete_splashes
    from scenarios_hot_update_work import database_rows
    complete_splashes(ctx, 'welcome', 'first_agent')
    token = uuid.uuid4().hex
    ctx.inst.redactor.add(token)
    reporter_call = {'name': 'JiraRead', 'arguments': {
        'action': 'search_issues', 'jql': REPORTER_JQL, 'max_results': 50}}
    fixture = ctx.fixtures.start('openai-tools', tool_names=['JiraRead'], token=token,
        tool_call_plans={
            'reporter': [reporter_call],
            'multi': [reporter_call, reporter_call],
            'long': [],
        }, final_content=_reply_from_native_jira_result)
    _allow_model_fixture(ctx, fixture)
    def save_model_fixture():
        ctx.inst.evidence.save('direct-result-provider-ledger', ctx.fixtures.requests('openai-tools'))
        ctx.fixtures.stop('openai-tools')
    ctx.inst.cleanup.add('direct result model fixture', save_model_fixture, scope='scenario')
    profile = ctx.inst.request('POST', '/api/v1/models/provider-profiles', {
        'name': 'Direct native Jira result fixture',
        'provider_id': 'kickside.models:openai_compat_plain.provider',
        'config': {'base_url': fixture + '/v1', 'timeout': 60}, 'api_key': token}, expect=(201,),
        label='direct-result-model-profile')['profile']['id']
    ctx.inst.cleanup.add('direct result model profile', lambda: ctx.inst.request(
        'DELETE', '/api/v1/models/provider-profiles/' + profile), scope='scenario')
    cards = {}
    for label, window, output in (('small', 32768, 1024), ('large', 262144, 8000)):
        for phase in ('reporter', 'multi', 'long'):
            name = 'direct-result-' + label + '-' + phase + '-' + uuid.uuid4().hex[:8]
            ctx.inst.request('PUT', '/api/v1/models/cards', {
                'name': name, 'title': 'Direct result ' + label + ' ' + phase,
                'provider_id': 'kickside.models:openai_compat_plain.provider', 'provider_profile_id': profile,
                'provider_model': phase, 'capabilities': ['generate', 'tool_use'],
                'max_tokens': window, 'output_tokens': output, 'enabled': True}, label='direct-result-model-card')
            health = ctx.inst.request('POST', '/api/v1/models/cards/test', {'name': name},
                                      label='direct-result-model-health', timeout=120)
            require(health.get('success') is True,
                    'Deterministic chat model card is not runnable: ' + str(health))
            cards[label, phase] = (name, window, output)
            ctx.inst.cleanup.add('direct result model card', lambda name=name: ctx.inst.request(
                'DELETE', '/api/v1/models/cards?name=' + name), scope='scenario')
    trait = 'kickside.atlassian.jira.traits:jira_reader'
    expected_rows = [('EE2-' + str(number),
                      'Northwind reporter ticket ' + str(number) + ': confirm the fictional dispatch and returns record')
                     for number in range(90, 40, -1)]
    for label in ('small', 'large'):
        for phase in ('reporter', 'multi', 'long'):
            model, window, output = cards[label, phase]
            agent = ctx.inst.request('POST', '/api/v1/user-agents', {
                'title': 'Direct Jira ' + label + ' ' + phase, 'description': 'Native result chat guard',
                'model': model, 'max_tokens': output, 'traits': [trait], 'trait_contexts': {trait: {
                    'connection_id': ctx.state['jira_connection']}},
                'prompt': 'Use JiraRead for the requested list, then answer with the returned key and title.'},
                label='direct-result-agent')['component_id']
            ctx.inst.cleanup.add('direct result agent', lambda agent=agent: ctx.inst.request(
                'DELETE', '/api/v1/user-agents/' + agent), scope='scenario')
            before_uploads = ctx.inst.request('GET', '/api/v1/uploads/list?limit=100', label='direct-result-uploads-before')
            start = len(ctx.fixtures.requests('openai-tools'))
            usage_query = "SELECT usage_id, context_id FROM token_usage WHERE model_id = '" + model.replace("'", "''") + "'"
            previous_usage = {row['usage_id'] for row in database_rows(ctx.inst, usage_query)}
            if phase == 'long':
                session_id = None
                for turn in range(12):
                    reply, transcript, session_id = api_command(ctx,
                        'Give a short confirmation for this fictional dispatch note, turn ' + str(turn) + ': ' + ('Northwind ' * 80),
                        agent_id=agent, session_id=session_id)
            else:
                prompt = 'Дай мне список всех тикетов в проекте EE2 которые я завела - дай номер и тайтл' if phase == 'reporter' else \
                    'Use JiraRead twice in this turn and list the returned EE2 ticket keys and titles.'
                reply, transcript, session_id = api_command(ctx, prompt, agent_id=agent)
            if phase == 'long':
                require(reply == 'Direct result context confirmation.',
                        'Long chat does not return its visible direct response: ' + reply)
            else:
                require(all(key + ' ' + summary in reply for key, summary in expected_rows),
                        'Visible chat answer omits rows from the native Jira key/title list: ' + reply)
            calls = _direct_result_messages(transcript) if phase != 'long' else []
            if phase == 'long':
                require(not function_messages(transcript, 'ReadToolResult'),
                        'Long chat invokes removed continuation tool')
            if phase == 'reporter':
                arguments = [json.loads(call['data']) for call in calls]
                require(arguments == [reporter_call['arguments']],
                        'Reporter chat does not send the exact Jira request: ' + str(arguments))
                require(_direct_jira_rows(calls[0]) == expected_rows,
                        'Reporter chat does not receive the direct native Jira page')
                browser = ctx.browser_check()
                ctx.inst.cleanup.add('direct result browser', lambda: Browser.release(ctx), scope='scenario')
                browser.login()
                browser.frame.locator('.sidebar').wait_for(timeout=30000)
                browser.open_chat(agent, session_id=session_id)
                def visible_answer():
                    state = browser.frame.locator('wippy-chat').evaluate(CHAT_STATE)
                    return state if state['enabled'] and not state['busy'] and all(
                        key in state['text'] and summary in state['text'] for key, summary in expected_rows) else None
                state = ctx.inst.wait(visible_answer, 'Reporter key/title answer reaches rendered chat',
                                      seconds=30, pump=browser.page.wait_for_timeout)
                ctx.inst.evidence.save('direct-result-' + label + '-visible-chat', state)
                browser.screenshot('direct-result-' + label + '-reporter-chat')
            if phase == 'multi':
                require(len(calls) == 2, 'Multi-call chat does not complete both native Jira reads')
                require(all(_direct_jira_rows(call) == expected_rows for call in calls),
                        'Multi-call chat does not receive both complete native Jira pages')
            after_uploads = ctx.inst.request('GET', '/api/v1/uploads/list?limit=100', label='direct-result-uploads-after')
            require(after_uploads == before_uploads, 'Direct native chat writes an Uploads snapshot')
            requests = [row for row in ctx.fixtures.requests('openai-tools')[start:]
                        if row['path'] == '/v1/chat/completions']
            require(requests, 'Chat sends no request to the deterministic model provider')
            usage = [row for row in database_rows(ctx.inst, usage_query) if row['usage_id'] not in previous_usage]
            require(len(usage) == len(requests), 'Chat usage does not account for every completed model request')
            require(all(row['context_id'] == session_id for row in usage),
                    'Chat usage does not retain the session context identifier')
            ctx.inst.evidence.save('direct-result-' + label + '-' + phase + '-usage', usage)
            if phase == 'reporter':
                require(len(requests) == 2, 'Reporter chat does not finish in one tool step and one answer step')
            sizes = [_model_request_fits(row, window, output) for row in requests]
            ctx.inst.evidence.save('direct-result-' + label + '-' + phase, {
                'model_window': window, 'output_reservation': output, 'request_sizes': sizes,
                'session_messages': transcript, 'model_requests': requests})


def jira_comment_text(ctx):
    cid = ctx.state['jira_connection']
    created = probe(ctx,tool='kickside.atlassian.jira.traits:jira_write',connection=cid,write=True,arguments={'action':'add_comment','issue_key':'NW-1','comment':'Northwind packing desk confirms 24 cartons'},label='jira-comment')
    rows = probe(ctx,tool='kickside.atlassian.jira.traits:jira_get',connection=cid,arguments={'action':'get_comments','issue_key':'NW-1'},label='jira-comment-read')
    require(created.get('comment_id') and any(row['id'] == created['comment_id'] for row in rows['comments']),
            'Jira comment list omits the created comment: '+str(rows))
    summary = next(row for row in rows['comments'] if row['id'] == created['comment_id'])
    require('body' not in summary and 'body_text' not in summary, 'Jira comment list includes a body')
    comment = probe(ctx,tool='kickside.atlassian.jira.traits:jira_get',connection=cid,
                    arguments={'action':'get_comment','issue_key':'NW-1','comment_id':created['comment_id']},
                    label='jira-comment-detail')['comment']
    require('Northwind packing desk confirms 24 cartons' in comment.get('body_text',''),
            'Jira Cloud comment detail text is unreadable: '+str(comment))


def confluence_tools(ctx):
    cid = ctx.state['confluence_connection']
    def call(write,args,trait,label):
        return probe(ctx,tool='kickside.atlassian.confluence.traits:confluence_'+('write' if write else 'get'),trait='kickside.atlassian.confluence.traits:'+trait,connection=cid,write=write,context={'space_key':'NW'},arguments=args,label=label)
    page = call(False,{'action':'read_page','page_id':'731'},'confluence_reader','confluence-read')
    require('NORTHWIND-CONFLUENCE-731' in json.dumps(page),'Confluence loses page content')
    created = call(True,{'action':'create_page','title':'Northwind autumn packing checklist','body':'<p>Northwind cartons are ready.</p>'},'confluence_writer','confluence-create')
    pid = created['page_id']
    call(True,{'action':'update_page','page_id':pid,'title':'Northwind packed checklist','body':'<p>NORTHWIND-WRITE-731: All 24 cartons are packed.</p>'},'confluence_editor','confluence-update')
    reread = call(False,{'action':'read_page','page_id':pid},'confluence_editor','confluence-read-back')
    require('NORTHWIND-WRITE-731' in json.dumps(reread) and 'Northwind packed checklist' in json.dumps(reread),'Confluence write-back loses text/title')


PULL_CONNECTION_FIXTURES = {
    'kickside.atlassian.jira.source:issues': 'jira',
    'kickside.atlassian.confluence.source:content': 'confluence',
}


PULL_FIXTURES = {
    'kickside.atlassian.jira.source:issues': ({'project_key': 'NW'}, 'Check Northwind order'),
    'kickside.atlassian.confluence.source:content': ({'space_key': 'NW', 'content_type': 'page'}, 'NORTHWIND-CONFLUENCE-731'),
    'kickside.github.source:repo_items': ({'owner': 'northwind', 'repo': 'orders'}, 'Northwind order packing'),
    'kickside.discord.source:channel_messages': ({'channel_id': 'NW'}, 'Northwind order packing'),
    'kickside.hubspot.source:crm': ({'object_type': 'contacts'}, 'Northwind Operator'),
    'kickside.fireflies.source:transcripts': ({}, 'Northwind packing meeting'),
    'kickside.fireflies.source:meetings': ({}, 'Northwind packing meeting'),
    'kickside.google.source:calendar_meetings': ({'calendar_id': 'primary'}, 'Northwind'),
    **{'kickside.simplefin.source:' + shape: ({'backfill_since': '2026-10-01T00:00:00Z'}, marker)
       for shape, marker in [('transactions', 'Northwind packing materials'), ('balances', '18425.50'), ('holdings', 'NWF')]},
}


def pull_port(ctx, port, connection, config=None, marker=None, label='provider-source'):
    if config is None:
        config, marker = PULL_FIXTURES[port]
    value = probe(ctx,port=port,connection=connection,arguments={'limit':100,'config':config},label=label)
    require(value.get('items') and marker in json.dumps(value['items']), 'Source has no asserted fictional rows: '+str(value))
    return value


def jira_source(ctx):
    pull_port(ctx,'kickside.atlassian.jira.source:issues',ctx.state['jira_connection'],label='jira-source')


def jira_source_pagination(ctx):
    cursor = None
    keys = set()
    for number in range(4):
        args = {'limit':1,'config':{'project_key':'NW'}}
        if cursor is not None:
            args['cursor'] = cursor
        page = probe(ctx,port='kickside.atlassian.jira.source:issues',connection=ctx.state['jira_connection'],arguments=args,label='jira-page-'+str(number))
        keys.update(item['item_key'] for item in page.get('items',[]))
        if not page.get('has_more'):
            break
        cursor = page['next_cursor']
    require(len(keys)==3,'Jira enhanced Cloud pagination loses issues: '+str(sorted(keys)))


def confluence_source(ctx):
    pull_port(ctx,'kickside.atlassian.confluence.source:content',ctx.state['confluence_connection'],label='confluence-source')


def atlassian_sink(ctx,provider):
    cid = ctx.state[provider+'_connection']
    port = 'kickside.atlassian.'+provider+'.sink:'+('issues' if provider=='jira' else 'content')
    config = {'connection_id':cid, 'project_key':'NW'} if provider=='jira' else {'connection_id':cid,'space_key':'NW','content_type':'page'}
    value = probe(ctx,port=port,connection=cid,write=True,arguments={'sink_op':'create','identity_key':'northwind-sink-'+provider,'idempotency_key':uuid.uuid4().hex,'config':config,'input':{'summary':'Northwind sink delivery','title':'Northwind sink delivery','content':'NORTHWIND-SINK-731: The fictional delivery persists.'}},label=provider+'-sink-create')
    require(value.get('success') is True and value.get('dest_ref'), 'Sink has no destination reference: '+str(value))
    ref = value['dest_ref']
    args = {'action':'get_issue','issue_key':ref['issue_key']} if provider=='jira' else {'action':'read_page','page_id':ref['content_id']}
    result = probe(ctx,tool='kickside.atlassian.'+provider+'.traits:'+('jira_get' if provider=='jira' else 'confluence_get'),connection=cid,arguments=args,label=provider+'-sink-read-back')
    require('Northwind sink delivery' in json.dumps(result),'Sink read-back loses title: '+str(result))
    config['content_type'] = 'page'
    source_port = 'kickside.atlassian.'+provider+'.source:'+('issues' if provider=='jira' else 'content')
    source = probe(ctx,port=source_port,connection=cid,arguments={'limit':100,'config':config},label=provider+'-sink-content-read-back')
    require('NORTHWIND-SINK-731' in json.dumps(source.get('items',[])),'Sink write-back loses content: '+str(source))


def simplefin_connect(ctx):
    ctx.inst.install('kickside/simplefin')
    token = base64.b64encode((ctx.state['provider_bases']['simplefin']+'/simplefin/claim/northwind').encode()).decode()
    cid = connect(ctx,'simplefin','kickside.simplefin.connection:simplefin_connection',{'setup_token':token})
    resources = ctx.inst.request('POST','/api/v1/connections/'+cid+'/discover_resources',{},label='simplefin-resources')['resources']
    require(any(row['id']=='nw-checking' for row in resources),'SimpleFIN omits Northwind account')
    require(any(row['path']=='/simplefin/claim/northwind' for row in ctx.fixtures.requests('simplefin')),'SimpleFIN never claims setup token')


def simplefin_read(ctx):
    cid = ctx.state['simplefin_connection']
    def read(action):
        return probe(ctx,tool='kickside.simplefin.traits:read_tool',trait='kickside.simplefin.traits:reader',connection=cid,arguments={'action':action,'days':365},label='simplefin-'+action)
    accounts = read('list_accounts')
    require(accounts['count']==1 and accounts['accounts'][0]['balance_minor']==1842550,'SimpleFIN balance precision differs')
    txs = read('list_transactions')['transactions']
    require(any(row['amount_minor']==-4869 for row in txs),'SimpleFIN transaction loses cents')
    holdings = read('list_holdings')
    require(holdings['count']==1 and holdings['holdings'][0]['symbol']=='NWF','SimpleFIN holdings differ')
    summary = read('summarize')
    require(isinstance(summary.get('total'),dict),'SimpleFIN summarize loses aggregate totals: '+str(summary))
    require(summary['total']['net_minor']==120131,'SimpleFIN cash flow differs: '+str(summary))


def simplefin_source(ctx,shape):
    pull_port(ctx,'kickside.simplefin.source:'+shape,ctx.state['simplefin_connection'],label='simplefin-'+shape+'-source')


def simplefin_rotate(ctx):
    cid = ctx.state['simplefin_connection']
    token = base64.b64encode((ctx.state['provider_bases']['simplefin']+'/simplefin/claim/rotated').encode()).decode()
    value = ctx.inst.request('PUT','/api/v1/simplefin/connections/'+cid,{'setup_token':token,'name':'Northwind simplefin renewed'},label='simplefin-rotate')
    require(value.get('account_count')==1,'Rotation does not validate its replacement feed: '+str(value))
    require(any(row['path']=='/simplefin/claim/rotated' for row in ctx.fixtures.requests('simplefin')),'Rotation does not claim new credential')
    accounts = probe(ctx,tool='kickside.simplefin.traits:read_tool',connection=cid,arguments={'action':'list_accounts'},label='simplefin-rotated-read')
    require(accounts['accounts'][0]['balance_minor']==1842550,'Rotated feed loses balance')


def mcp_connect(ctx):
    ctx.inst.install('kickside/mcp-client')
    private = {'endpoint_url':ctx.state['provider_bases']['mcp']+'/mcp','auth_type':'none'}
    cid = connect(ctx,'mcp','kickside.mcp_client:remote_connection',private)
    value = ctx.inst.request('POST','/api/v1/connections/'+cid+'/discover_resources',{},label='remote-mcp-discover')
    require('northwind_order' in json.dumps(value),'Remote MCP discovery lacks the Northwind tool')


def mcp_tools(ctx):
    cid = ctx.state['mcp_connection']
    context = {'remote_tool_name':'northwind_order','selected_tools':['northwind_order'],'tool_prefix':'Northwind'}
    built = probe(ctx,tool='kickside.mcp_client:build_tools',trait='kickside.mcp_client:tools_trait',connection=cid,context=context,arguments={},label='remote-mcp-trait-build')
    require('northwind_order' in json.dumps(built),'MCP trait omits selected remote tool')
    written = probe(ctx,tool='kickside.mcp_client:invoke_tool',connection=cid,write=True,context=context,arguments={'note':'NORTHWIND-MCP-731: Shipment is packed'},label='remote-mcp-write')
    require('NORTHWIND-MCP-731' in json.dumps(written),'Remote MCP write returns wrong note')
    read = probe(ctx,tool='kickside.mcp_client:invoke_tool',connection=cid,context=context,arguments={},label='remote-mcp-read-back')
    require('NORTHWIND-MCP-731' in json.dumps(read),'Remote MCP write does not persist')


def mcp_reconnect(ctx):
    cid = ctx.state['mcp_connection']
    result = ctx.inst.request('PUT','/api/v1/mcp-client/connections/'+cid,{'private_context':{'endpoint_url':ctx.state['provider_bases']['mcp']+'/mcp','auth_type':'none'},'name':'Northwind remote order desk'},label='remote-mcp-reconnect')
    require(result.get('tool_count')==1,'MCP reconnect loses tool catalog')


def webscout_pages(ctx):
    ctx.inst.install('kickside/webscout')
    url = ctx.state['provider_bases']['webscout']+'/northwind'
    read = probe(ctx,tool='kickside.webscout.traits:read',trait='kickside.webscout.traits:web_researcher',arguments={'url':url},label='webscout-read')
    require('NORTHWIND-PAGE-731' in read and '24 orders' in read,'Webscout loses page text')
    links = probe(ctx,tool='kickside.webscout.traits:links',trait='kickside.webscout.traits:web_researcher',arguments={'url':url},label='webscout-links')
    require(links['total_links']==2 and set(links['links'])=={ctx.state['provider_bases']['webscout']+'/orders',ctx.state['provider_bases']['webscout']+'/suppliers'},'Webscout links lose resolution/dedup: '+str(links))


def webscout_catalog(ctx):
    ctx.inst.install('kickside/webscout')
    providers = ctx.inst.request('GET','/api/v1/webscout/providers',label='webscout-provider-options')
    require(providers.get('providers'), 'Webscout provider options are empty')


def provider_browser(ctx):
    if ctx.browser is None:
        ctx.browser_check(viewport={'width':1600,'height':1000},device_scale_factor=2,color_scheme='light')
        for splash in ('welcome','first_agent'):
            result = ctx.inst.request('POST','/api/v1/ui/splash/'+splash+'/seen',{},label='provider-'+splash+'-seen')
            require(result.get('success'), 'Product splash completion does not persist')
        ctx.browser.login()
        ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)
    return ctx.browser


def rendered_icon_signature(icon):
    return (icon.get_attribute('class'), icon.get_attribute('viewBox'), icon.inner_html())


def assert_connection_icon_parity(connection_icon, provider_icon, title):
    require(rendered_icon_signature(connection_icon) == rendered_icon_signature(provider_icon),
            'Connection card icon differs from its available-service icon: ' + title)


def provider_connections_ui(ctx):
    browser = provider_browser(ctx)
    nav(ctx,'Connections')
    page = browser.frame.locator('kickside-connections')
    for title in ('Northwind jira','Northwind confluence','Northwind simplefin renewed'):
        page.get_by_text(title,exact=True).wait_for(timeout=30000)
    connections = ctx.inst.request('GET', '/api/v1/connections?limit=100&offset=0', label='connection-icon-cards')['connections']
    catalogs = []
    for path, label in (('/api/v1/oauth/providers/discover', 'connection-icon-oauth-providers'),
                        ('/api/v1/connections/providers/discover', 'connection-icon-credential-providers')):
        catalogs.extend(ctx.inst.request('GET', path, label=label)['providers'])
    providers = {}
    for provider in catalogs:
        key = provider.get('provider')
        if key:
            providers[key] = {**provider, **providers.get(key, {})}
    candidates = [(connection, providers[connection['provider']]) for connection in connections
                  if isinstance(connection.get('provider'), str) and connection['provider'] in providers
                  and isinstance(connection.get('icon'), str) and connection['icon']
                  and isinstance(providers[connection['provider']].get('icon'), str)
                  and providers[connection['provider']]['icon']]
    require(candidates, 'Installed provider fixtures expose no connection/provider icon pair')
    connection, provider = candidates[0]
    connection_title = connection.get('name') or connection['provider']
    provider_title = provider.get('title') or provider.get('name') or provider.get('oauth_provider') or 'Provider'
    connection_card = page.locator('.live-card').filter(has_text=connection_title)
    provider_card = page.locator('.setup-card').filter(has_text=provider_title)
    require(connection_card.count() == 1, 'Connection icon fixture does not identify one visible card: ' + connection_title)
    require(provider_card.count() == 1, 'Provider icon fixture does not identify one available-service card: ' + provider_title)
    connection_icon = connection_card.locator('.lc-ico svg')
    provider_icon = provider_card.locator('.setup-ico svg')
    connection_icon.wait_for(timeout=30000)
    provider_icon.wait_for(timeout=30000)
    assert_connection_icon_parity(connection_icon, provider_icon, connection_title)
    browser.screenshot('northwind-connections-light', full_page=False, mask_color='#e2e8f0')
    browser.page.emulate_media(color_scheme='dark')
    browser.screenshot('northwind-connections-dark', full_page=False, mask_color='#e2e8f0')
    browser.page.emulate_media(color_scheme='light')


def open_settings(ctx):
    nav(ctx,'System')
    ctx.browser.frame.get_by_role('tab',name='Settings',exact=True).click()


def sso_settings(ctx,provider,title):
    ctx.inst.install('kickside/sso-'+provider)
    browser = provider_browser(ctx)
    open_settings(ctx)
    settings = browser.frame.locator('kickside-settings')
    settings.locator('.ks-nav-section').filter(has_text='Single sign-on').get_by_role('button',name=title,exact=True).click()
    card = browser.frame.locator('kickside-sso-admin')
    card.get_by_text(title,exact=True).first.wait_for(timeout=30000)
    card.locator('input[type="text"]').first.wait_for(state='visible',timeout=30000)
    card.locator('input[type="password"]').first.wait_for(state='visible',timeout=30000)
    browser.screenshot('northwind-sso-'+provider, full_page=False, mask_color='#e2e8f0')


def configure_oidc_security(ctx):
    Browser.release(ctx)
    import yaml
    path = ctx.inst.app / '.wippy.yaml'
    config = yaml.safe_load(path.read_text())
    overrides = config.setdefault('override',{})
    for fid in ('kickside.sso.api:start','kickside.sso.api:callback'):
        entry = ctx.inst.request('GET','/api/v1/keeper/registry/entry?id='+fid,label='oidc-security-read')['entry']
        overrides[fid+':data.security.policies'] = entry['data']['security']['policies'] + [NS+':egress',NS+':loopback']
    path.write_text(yaml.safe_dump(config,sort_keys=False))
    ctx.restart()
    ctx.inst.manifest()


def sso_oidc_setup(ctx):
    ctx.inst.install('kickside/sso-oidc')
    for key,value in [('issuer',ctx.state['provider_bases']['oidc']),('client_id','northwind-client'),('client_secret','fictional-oidc-secret'),('enabled',True)]:
        saved = ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.sso.providers.oidc','key':key,'value':value},label='oidc-setting-'+key)
        require(saved.get('success'), 'OIDC setting does not persist')
    configure_oidc_security(ctx)
    ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.sso','key':'enabled','value':True},label='sso-enable')
    ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.sso','key':'auto_provision','value':True},label='sso-provision')
    for key,value in [('allowed_email_domains',['northwind.example.invalid']),('default_group','app.security:user')]:
        saved = ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.sso','key':key,'value':value},label='sso-'+key)
        require(saved.get('success'),'SSO provisioning setting does not persist')
    public = ctx.inst.request('GET','/api/public/sso/providers',label='sso-public-catalog')
    require('oidc' in json.dumps(public),'Enabled OIDC is absent from login options')
    admin = ctx.inst.request('GET','/api/v1/sso/providers',label='sso-admin-catalog')
    require('oidc' in json.dumps(admin) and 'fictional-oidc-secret' not in json.dumps(admin),'SSO provider configuration is missing or exposes its secret')


def sso_oidc_login(ctx, *, restore_login=True):
    browser = provider_browser(ctx)
    browser.settle()
    browser.page.goto(ctx.inst.base+'/login',wait_until='domcontentloaded')
    browser.page.evaluate('document.fonts.ready')
    with browser.document_navigation(
            '/', stylesheet_cleanup=(ctx.inst.base + '/api/public/facade/variables.css',),
            asset_cleanup=(ctx.inst.base + '/app/kickside-icon.svg',)):
        with browser.page.expect_response(lambda response: urlsplit(response.url).path == '/api/public/sso/oidc/callback') as response:
            browser.page.get_by_role('link',name='Continue with Generic OIDC',exact=True).click()
        callback = response.value
        outcome = parse_qs(urlsplit(callback.header_value('location') or '').fragment)
        token = outcome.get('sso_token', [''])[0]
        if token:
            ctx.inst.redactor.add(token)
        error = outcome.get('sso_error', [''])[0]
        ctx.inst.evidence.save('oidc-callback', {'status': callback.status, 'session_minted': bool(token), 'error': error})
        require(callback.status == 302 and token, 'OIDC callback does not mint a session: ' + error)
        profile = ctx.inst.request('GET', '/api/v1/user/me', auth=token, label='oidc-session-profile')['user']
        require(profile['email'] == 'operator@northwind.example.invalid' and profile['metadata']['auth_method'] == 'sso',
                'OIDC callback session has no authenticated provider identity')
        browser.page.wait_for_url(ctx.inst.base+'/**',timeout=30000)
        browser.page.locator('iframe[name="wippy:page:app.views:main"]').wait_for(timeout=30000)
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
    require(any(row['path']=='/token' and row['status']==200 for row in ctx.fixtures.requests('oidc')),'OIDC login never exchanges its code')
    require(any(row['path']=='/jwks' and row['status']==200 for row in ctx.fixtures.requests('oidc')),'OIDC login never fetches signing keys')
    browser.screenshot('northwind-oidc-login', full_page=False, mask_color='#e2e8f0')
    if restore_login:
        browser.login()
    return {'token': token, 'user': profile}


def sso_oidc_link(ctx):
    browser = provider_browser(ctx)
    response = browser.context.request.post(ctx.inst.base+'/api/v1/sso/oidc/link',headers={'Authorization':'Bearer '+ctx.inst.token},data={})
    value = response.json()
    ctx.inst.evidence.save('oidc-link-start',value)
    require(response.status==200 and value.get('url','').startswith(ctx.state['provider_bases']['oidc']+'/authorize?'),'OIDC account linking has no local authorization redirect')
    browser.settle()
    browser.page.goto(value['url'],wait_until='domcontentloaded')
    browser.page.wait_for_url(ctx.inst.base+'/**',timeout=30000)
    rows = ctx.inst.request('GET','/api/v1/sso/connections',label='oidc-linked-identities')['connections']
    require(any(row['provider']=='oidc' and row['email']=='operator@northwind.example.invalid' for row in rows),'OIDC linked identity does not persist')
    ctx.inst.request('DELETE','/api/v1/sso/oidc/link',label='oidc-unlink')
    require(not any(row['provider']=='oidc' for row in ctx.inst.request('GET','/api/v1/sso/connections',label='oidc-unlinked-identities')['connections']),'OIDC unlink retains identity')


def provider_evidence(ctx):
    rows = ctx.fixtures.requests()
    ctx.inst.evidence.save('local-provider-requests',rows)
    require(rows and all(urlsplit(base).hostname=='127.0.0.1' for base in ctx.state['provider_bases'].values()),'Fixtures do not remain on loopback')


REGISTRY = [
    Scenario('regression_atlassian_native_pages', 'regression', regression_atlassian_native_pages,
             issues=('EE2-2572',)),
    Scenario('providers_boot','full',providers_boot, instance_setup=True),
    Scenario('providers_atlassian_connect','full',atlassian_connect,('providers_boot',),features=(feature('atlassian','connection_provider','kickside.atlassian.connection:atlassian_connection'),feature('atlassian','workspace_kind','kickside.atlassian.connection:atlassian_connection')), instance_setup=True),
    Scenario('providers_jira_tools','full',jira_tools,('providers_atlassian_connect',),features=tuple(feature('atlassian','capability','kickside.atlassian.jira.traits:'+name) for name in ('jira_reader','jira_writer','jira_developer'))+tuple(feature('atlassian','mcp_tool','kickside.atlassian.jira.traits:'+name) for name in ('jira_get','jira_write'))),
    Scenario('regression_EE2_2572_direct_result_chat', 'full', regression_EE2_2572_direct_result_chat,
             ('providers_atlassian_connect',), issues=('EE2-2572', 'SMOKE-CHAT-RELAY-WELCOME-HANDSHAKE', 'UPSTREAM-SESSION-PREDISPATCH-INVALIDATE', 'SMOKE-MODEL-STREAM-RESPONSE', 'SMOKE-NATIVE-TOOL-TRANSCRIPT', 'SMOKE-MODEL-TOKEN-ACCOUNTING', 'UPSTREAM-USAGE-CONTEXT-CORRELATION'),
             features=(feature('atlassian', 'capability', 'kickside.atlassian.jira.traits:jira_reader'),
                       feature('atlassian', 'mcp_tool', 'kickside.atlassian.jira.traits:jira_get'))),
    Scenario('regression_jira_native_search_page', 'full', regression_jira_native_search_page, ('providers_atlassian_connect',), issues=('EE2-2572',), features=(feature('atlassian', 'mcp_tool', 'kickside.atlassian.jira.traits:jira_get'),)),
    Scenario('providers_jira_comment_text','full',jira_comment_text,('providers_atlassian_connect',),features=(feature('atlassian','mcp_tool','kickside.atlassian.jira.traits:jira_get'),feature('atlassian','mcp_tool','kickside.atlassian.jira.traits:jira_write'))),
    Scenario('providers_confluence_tools','full',confluence_tools,('providers_atlassian_connect',),features=tuple(feature('atlassian','capability','kickside.atlassian.confluence.traits:'+name) for name in ('confluence_reader','confluence_writer','confluence_editor'))+tuple(feature('atlassian','mcp_tool','kickside.atlassian.confluence.traits:'+name) for name in ('confluence_get','confluence_write'))),
    Scenario('providers_jira_source','full',jira_source,('providers_atlassian_connect',),features=(feature('atlassian','source','kickside.atlassian.jira.source:issues'),feature('atlassian','workspace_kind','kickside.atlassian.jira.source:issues_source'))),
    Scenario('providers_jira_pagination','full',jira_source_pagination,('providers_atlassian_connect',),features=(feature('atlassian','source','kickside.atlassian.jira.source:issues'),)),
    Scenario('providers_confluence_source','full',confluence_source,('providers_atlassian_connect',),features=(feature('atlassian','source','kickside.atlassian.confluence.source:content'),feature('atlassian','workspace_kind','kickside.atlassian.confluence.source:content_source'))),
    Scenario('providers_jira_sink','full',lambda ctx:atlassian_sink(ctx,'jira'),('providers_atlassian_connect',),features=(feature('atlassian','sink','kickside.atlassian.jira.sink:issues'),)),
    Scenario('providers_confluence_sink','full',lambda ctx:atlassian_sink(ctx,'confluence'),('providers_atlassian_connect',),features=(feature('atlassian','sink','kickside.atlassian.confluence.sink:content'),)),
    Scenario('providers_simplefin_connect','full',simplefin_connect,('providers_boot',),features=(feature('simplefin','connection_provider','kickside.simplefin.connection:simplefin_connection'),feature('simplefin','workspace_kind','kickside.simplefin.connection:simplefin_connection')), instance_setup=True),
    Scenario('providers_simplefin_read','full',simplefin_read,('providers_simplefin_connect',),features=(feature('simplefin','capability','kickside.simplefin.traits:reader'),feature('simplefin','mcp_tool','kickside.simplefin.traits:read_tool'))),
    *[Scenario('providers_simplefin_'+shape,'full',lambda ctx,s=shape:simplefin_source(ctx,s),('providers_simplefin_connect',),features=(feature('simplefin','source','kickside.simplefin.source:'+shape),feature('simplefin','workspace_kind','kickside.simplefin.source:'+shape+'_source'))) for shape in ('transactions', 'balances', 'holdings')],
    Scenario('providers_simplefin_rotate','full',simplefin_rotate,('providers_simplefin_connect',),features=(feature('simplefin','http','PUT /api/v1/simplefin/connections/{id}'),)),
    Scenario('providers_mcp_connect','full',mcp_connect,('providers_boot',),features=(feature('mcp-client','connection_provider','kickside.mcp_client:remote_connection'),feature('mcp-client','workspace_kind','kickside.mcp_client:remote_connection')), instance_setup=True),
    Scenario('providers_mcp_tools','full',mcp_tools,('providers_mcp_connect',),features=(feature('mcp-client','capability','kickside.mcp_client:tools_trait'),feature('mcp-client','mcp_tool','kickside.mcp_client:invoke_tool'))),
    Scenario('providers_mcp_limits','full',mcp_limits,('providers_mcp_connect',),issues=('B06', 'R4-I9'), features=(feature('mcp-client','capability','kickside.mcp_client:tools_trait'),feature('mcp-client','mcp_tool','kickside.mcp_client:invoke_tool'))),
    Scenario('providers_mcp_reconnect','full',mcp_reconnect,('providers_mcp_connect',),issues=('MCP-RECONNECT-PAGED-TOOL-COUNT',),features=(feature('mcp-client','http','PUT /api/v1/mcp-client/connections/{id}'),)),
    Scenario('providers_webscout_pages','full',webscout_pages,('providers_boot',),features=(feature('webscout','capability','kickside.webscout.traits:web_researcher'),feature('webscout','mcp_tool','kickside.webscout.traits:read'),feature('webscout','mcp_tool','kickside.webscout.traits:links')), instance_setup=True),
    Scenario('providers_oidc_setup','full',sso_oidc_setup,('providers_boot',),features=(feature('sso','http','GET /api/public/sso/providers'),feature('sso','http','GET /api/v1/sso/providers')), instance_setup=True),
    Scenario('providers_connections_ui','full',provider_connections_ui,('providers_atlassian_connect','providers_simplefin_rotate','providers_mcp_reconnect'), issues=('CONNECTION-PROVIDER-ICON-BINDING-SELECTION', 'CONNECTION-PROVIDER-SOURCE-ICON-FALLBACK', 'PROVIDER-DECLARED-BRAND-ICONS')),
    *[Scenario('providers_sso_'+provider+'_settings','full',lambda ctx,p=provider,t=title:sso_settings(ctx,p,t),('providers_boot',),features=(feature('sso-'+provider,'navigation','kickside.sso.providers.'+provider+':block.sso_provider'),), instance_setup=True) for provider,title in [('github','GitHub'),('google','Google'),('microsoft','Microsoft'),('oidc','Generic OIDC')]],
    Scenario('providers_oidc_link','full',sso_oidc_link,('providers_oidc_setup',),features=tuple(feature('sso','http',key) for key in ('POST /api/v1/sso/{provider}/link','GET /api/v1/sso/connections','DELETE /api/v1/sso/{provider}/link'))+(feature('sso-oidc','connection_provider','kickside.sso.providers.oidc:provider'),)),
    Scenario('providers_oidc_login','full',sso_oidc_login,('providers_oidc_setup',),issues=('R4-I3', 'R4-I4'),features=(feature('sso','http','GET /api/public/sso/{provider}/start'),feature('sso','http','GET /api/public/sso/{provider}/callback'),feature('sso-oidc','connection_provider','kickside.sso.providers.oidc:provider'))),
    Scenario('providers_fixture_evidence','full',provider_evidence,('providers_boot',)),
]


def integration_settings(ctx,provider,title):
    ctx.inst.install('kickside/'+provider)
    browser = provider_browser(ctx)
    open_settings(ctx)
    settings = browser.frame.locator('kickside-settings')
    settings.locator('.ks-nav-section').filter(has_text='Integrations').get_by_role('button',name=title,exact=True).click()
    card = settings.locator('kickside-settings-provider')
    card.get_by_text(title,exact=True).first.wait_for(timeout=30000)
    require(card.locator('input').count()>=2,'Provider settings lack client credential fields')
    browser.screenshot('northwind-'+provider+'-settings', full_page=False, mask_color='#e2e8f0')


REGISTRY.extend([
    Scenario('providers_'+provider+'_settings','full',lambda ctx,p=provider,t=title:integration_settings(ctx,p,t),('providers_boot',),issues=('R4-I4',),features=(feature(provider,'navigation','kickside.'+provider+':settings_block'),), instance_setup=True)
    for provider,title in [('atlassian','Atlassian'),('google','Google'),('github','GitHub')]])


def sso_global_settings(ctx):
    browser = provider_browser(ctx)
    open_settings(ctx)
    browser.frame.locator('kickside-settings').get_by_role('button',name='Single sign-on',exact=True).click()
    card = browser.frame.locator('kickside-sso-admin')
    card.get_by_text('Provisioning',exact=True).wait_for(timeout=30000)
    require(card.locator('input').count()>=2,'SSO provisioning controls are missing')
    require(any(field.input_value()=='northwind.example.invalid' for field in card.locator('input').all()),'SSO domain allowlist is missing from provisioning controls')
    browser.screenshot('northwind-sso-provisioning', full_page=False, mask_color='#e2e8f0')


REGISTRY.extend([
    Scenario('providers_webscout_catalog','full',webscout_catalog,('providers_boot',),features=(feature('webscout','http','GET /api/v1/webscout/providers'),), instance_setup=True),
    Scenario('providers_sso_global_settings','full',sso_global_settings,('providers_oidc_setup',),issues=('R4-I4',),features=(feature('sso','navigation','kickside.sso:block.sso'),)),
])


def simplefin_connect_ui(ctx):
    browser = provider_browser(ctx)
    nav(ctx,'Connections')
    browser.frame.locator('kickside-connections').locator('.setup-card').filter(has_text='SimpleFIN').click()
    dialog = browser.frame.get_by_role('dialog')
    form = dialog.locator('kickside-simplefin-connect')
    form.get_by_label('Connection name',exact=True).fill('Northwind treasury desk')
    token = base64.b64encode((ctx.state['provider_bases']['simplefin']+'/simplefin/claim/northwind').encode()).decode()
    ctx.inst.redactor.add(token)
    form.locator('input[type="password"]').fill(token)
    with browser.page.expect_response(lambda response: '/api/v1/connections' in response.url and response.request.method=='POST' and response.url.endswith('/connections')) as response:
        form.get_by_role('button',name='Claim and connect',exact=True).click()
    result = response.value.json()
    ctx.inst.evidence.save('simplefin-ui-connection',result)
    require(result.get('component_id'),'SimpleFIN user flow has no durable connection')
    cid = result['component_id']
    ctx.inst.cleanup.add('SimpleFIN UI connection',lambda:ctx.inst.request('DELETE','/api/v1/connections/'+cid))
    form.get_by_text('Northwind operating account',exact=True).wait_for(timeout=30000)
    form.get_by_text('18,425.50 USD',exact=True).wait_for(timeout=30000)
    browser.screenshot('northwind-treasury-connected', full_page=False, mask_color='#e2e8f0')
    form.get_by_role('button',name='Done',exact=True).click()
    browser.frame.locator('kickside-connections').get_by_text('Northwind treasury desk',exact=True).wait_for(timeout=30000)
    accounts = probe(ctx,tool='kickside.simplefin.traits:read_tool',trait='kickside.simplefin.traits:reader',connection=cid,arguments={'action':'list_accounts'},label='simplefin-ui-read')
    require(accounts['accounts'][0]['balance_minor']==1842550,'UI-created connection loses its account balance')
    browser.screenshot('northwind-treasury-connections', full_page=False, mask_color='#e2e8f0')


REGISTRY.append(Scenario('providers_simplefin_connect_ui','full',simplefin_connect_ui,('providers_simplefin_connect',),issues=('R4-I4',),features=(
    feature('simplefin','connection_provider','kickside.simplefin.connection:simplefin_connection'),
    feature('simplefin','workspace_kind','kickside.simplefin.connection:simplefin_connection'),
    feature('simplefin','capability','kickside.simplefin.traits:reader'),
    feature('simplefin','mcp_tool','kickside.simplefin.traits:read_tool'),
)))


def webscout_settings_ui(ctx):
    ctx.inst.install('kickside/webscout')
    browser = provider_browser(ctx)
    open_settings(ctx)
    browser.frame.locator('kickside-settings').get_by_role('button',name='WebScout',exact=True).click()
    card = browser.frame.locator('kickside-webscout-settings')
    card.get_by_text('Search provider',exact=True).wait_for(timeout=30000)
    browser.settle()
    require(any('Google' in label for label in card.locator('select option').all_text_contents()),'WebScout settings omit the installed search provider')
    browser.screenshot('northwind-webscout-settings', full_page=False, mask_color='#e2e8f0')


REGISTRY.append(Scenario('providers_webscout_settings_ui','full',webscout_settings_ui,('providers_boot',),issues=('R4-I4',),features=(
    feature('webscout','navigation','kickside.webscout:settings_block'),
), instance_setup=True))


ORIGIN_ROUTES = {'kickside.google:endpoint_drive': ('google', '/drive/v3'), 'kickside.google:endpoint_sheets': ('google', '/v4/spreadsheets'), 'kickside.google:endpoint_analytics_admin': ('google', '/v1beta'), 'kickside.google:endpoint_analytics_data': ('google', '/v1beta'), 'kickside.google:endpoint_gmail': ('google', '/gmail/v1/users/me'), 'kickside.google:endpoint_contacts': ('google', '/v1'), 'kickside.google:endpoint_docs': ('google', '/v1'), 'kickside.google:endpoint_calendar': ('google', '/calendar/v3'), 'kickside.google:endpoint_slides': ('google', '/v1/presentations'), 'kickside.google:endpoint_authorization': ('google', '/authorize'), 'kickside.google:endpoint_token': ('google', '/token'), 'kickside.google:endpoint_userinfo': ('google', '/userinfo'), 'kickside.github:endpoint_api': ('github', ''), 'kickside.github:endpoint_authorization': ('github', '/login/oauth/authorize'), 'kickside.github:endpoint_token': ('github', '/login/oauth/access_token'), 'kickside.github:endpoint_userinfo': ('github', '/user'), 'kickside.slack:endpoint_api': ('slack', '/api'), 'kickside.slack:endpoint_socket': ('slack', '/api/apps.connections.open'), 'kickside.discord:endpoint_api': ('discord', '/api/v10'), 'kickside.hubspot:endpoint_api': ('hubspot', ''), 'kickside.telegram:endpoint_api': ('telegram', ''), 'kickside.fireflies:endpoint_api': ('fireflies', '/graphql'), 'kickside.phantombuster:endpoint_api': ('phantombuster', ''), 'kickside.webscout:endpoint_api': ('google', '/customsearch/v1'), 'kickside.sso.providers.github:endpoint_authorize': ('github', '/login/oauth/authorize'), 'kickside.sso.providers.github:endpoint_token': ('github', '/login/oauth/access_token'), 'kickside.sso.providers.github:endpoint_userinfo': ('github', '/user'), 'kickside.sso.providers.github:endpoint_emails': ('github', '/user/emails'), 'kickside.sso.providers.google:endpoint_issuer': ('google', ''), 'kickside.sso.providers.google:endpoint_authorize': ('google', '/authorize'), 'kickside.sso.providers.google:endpoint_token': ('google', '/token'), 'kickside.sso.providers.google:endpoint_userinfo': ('google', '/userinfo'), 'kickside.sso.providers.google:endpoint_jwks': ('google', '/jwks'), 'kickside.sso.providers.microsoft:endpoint_issuer_template': ('microsoft', ''), 'kickside.telegram:endpoint_file': ('telegram', '')}

def provider_origins_setup(ctx):
    Browser.release(ctx)
    for module in ('google','github','slack','discord','hubspot','telegram','fireflies','phantombuster','sso-github','sso-google','sso-microsoft','webscout'):
        ctx.inst.install('kickside/' + module)
    import yaml
    fixture = ctx.inst.app / 'src' / 'provider-smoke'
    (fixture / 'provider_bounds.lua').write_text((HERE / 'mocks/provider_bounds.lua').read_text())
    path = fixture / '_index.yaml'
    definition = yaml.safe_load(path.read_text())
    definition['entries'].append({'name':'bounds','kind':'function.lua','source':'file://provider_bounds.lua','method':'handler','imports':{'policy':'kickside.phantombuster.source:operation_policy'}})
    definition['entries'].append({'name':'web_bounds','kind':'function.lua','source':'file://provider_bounds.lua','method':'handler','imports':{'policy':'kickside.webscout.research:operation_policy'}})
    path.write_text(yaml.safe_dump(definition,sort_keys=False))
    endpoints = {requirement: ctx.state['provider_bases'][fixture] + path for requirement, (fixture, path) in ORIGIN_ROUTES.items()}
    configure_provider_endpoints(ctx, endpoints)
    ctx.restart()
    ctx.inst.manifest()
    for requirement, value in endpoints.items():
        entry = ctx.inst.request('GET','/api/v1/keeper/registry/entry?id='+requirement,label='endpoint-'+requirement)['entry']
        require(entry['data']['default'] == value, 'Instance endpoint differs from its profile var: '+requirement)


def credential_origin_connect(ctx, name):
    credentials = {
        'github': {'token':'fictional-github-token'},
        'slack': {'bot_token':'fictional-slack-token','app_token':'fictional-slack-app'},
        'discord': {'bot_token':'fictional-discord-token'},
        'hubspot': {'api_key':'fictional-hubspot-token'},
        'telegram': {'bot_token':'fictional-telegram-token','default_chat_id':'NW'},
        'fireflies': {'api_key':'fictional-fireflies-key'},
        'phantombuster': {'api_key':'fictional-phantombuster-key'},
    }
    return connect(ctx, name, 'kickside.'+name+'.connection:'+name+'_connection', credentials[name])


def oauth_origin_connect(ctx, name, connection_name=None, fixture_name=None):
    fixture_name = fixture_name or name
    connection_name = connection_name or "Northwind " + name + " OAuth"
    for key,value in (('client_id','northwind-client'),('client_secret','fictional-oidc-secret')):
        saved = ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.'+name,'key':key,'value':value},label=name+'-oauth-'+key)
        require(saved.get('success'), 'OAuth setting does not persist')
    result = ctx.inst.request('POST','/api/v1/oauth/providers/'+name+'/init',{'name':connection_name,'scopes':['repo'] if name=='github' else []},label=name+'-oauth-init')
    require(result['authorization_url'].startswith(ctx.state['provider_bases'][fixture_name]), 'OAuth authorization ignores its configured endpoint')
    browser = provider_browser(ctx)
    browser.settle()
    application_url = browser.page.url
    page = browser.open_page()
    try:
        page.goto(result['authorization_url'],wait_until='domcontentloaded')
        def registered():
            rows = ctx.inst.request('GET','/api/v1/connections',label=name+'-oauth-persisted')['connections']
            return next((r for r in rows if r['name']==connection_name),None)
        row = ctx.inst.wait(registered,name+' OAuth connection',pump=page.wait_for_timeout)
        cid = row['component_id']
        ctx.state[name+'_oauth_connection'] = cid
        ctx.inst.cleanup.add(name+' OAuth connection',lambda:ctx.inst.request('DELETE','/api/v1/connections/'+cid))
        require(any(r['method']=='POST' and r['status']==200 and 'token' in r['path'] for r in ctx.fixtures.requests(fixture_name)), 'OAuth callback never exchanges a token with the fixture')
    finally:
        page.close()
    require(browser.page.url == application_url, 'OAuth fixture navigates away from the application')
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    return cid


def origin_tool(ctx, name, tool, trait, arguments, write=False, context=None):
    return probe(ctx,tool='kickside.'+name+'.traits:'+tool,trait='kickside.'+name+'.traits:'+trait,connection=ctx.state[name+'_connection'],write=write,arguments=arguments,context=context,label=name+'-'+arguments['action'])


def github_origin_tools(ctx):
    read = lambda args,trait='reader': origin_tool(ctx,'github','read_tool',trait,args)
    write = lambda args,trait='writer': origin_tool(ctx,'github','write_tool',trait,args,True)
    require(read({'action':'viewer'})['name']=='Northwind Operator','GitHub identity differs')
    created=write({'action':'create_issue','owner':'northwind','repo':'orders','title':'Northwind write-back','body':'Pack 24 cartons'})
    number=str(created['number'])
    write({'action':'update_issue','owner':'northwind','repo':'orders','number':number,'title':'Northwind updated packing'},'manager')
    require(read({'action':'get_issue','owner':'northwind','repo':'orders','number':number},'manager')['title']=='Northwind updated packing','GitHub write-back loses its title')
    pull_port(ctx,'kickside.github.source:repo_items',ctx.state['github_connection'],config={'owner': 'northwind', 'repo': 'orders'},marker='Northwind updated packing',label='github-source')


def slack_origin_tools(ctx):
    require('northwind-orders' in json.dumps(origin_tool(ctx,'slack','slack_get','slack_reader',{'action':'list_channels'})),'Slack channel differs')
    sent=origin_tool(ctx,'slack','slack_write','slack_operator',{'action':'send_message','channel_id':'NW','text':'NORTHWIND-SLACK-731'},True)
    origin_tool(ctx,'slack','slack_write','slack_manager',{'action':'add_reaction','channel_id':'NW','message_ts':sent['message_ts'],'emoji':'package'},True)
    rows=origin_tool(ctx,'slack','slack_get','slack_manager',{'action':'get_messages','channel_id':'NW'})
    sent_rows=[row for row in rows['messages'] if row['ts'] == sent['message_ts']]
    require(sent_rows, 'Slack list loses the created message identity')
    require('text' not in sent_rows[0], 'Slack list includes full message text')
    message = origin_tool(ctx, 'slack', 'slack_get', 'slack_manager', {'action':'get_message', 'channel_id':'NW', 'message_ts':sent['message_ts']})['message']
    require(message['text'] == 'NORTHWIND-SLACK-731','Slack write-back loses message text')


def discord_origin_tools(ctx):
    require('Northwind' in json.dumps(origin_tool(ctx,'discord','discord_get','discord_reader',{'action':'list_guilds'})),'Discord guild differs')
    sent = origin_tool(ctx,'discord','discord_write','discord_operator',{'action':'send_message','channel_id':'NW','content':'NORTHWIND-DISCORD-731'},True)
    rows=origin_tool(ctx,'discord','discord_get','discord_manager',{'action':'get_messages','channel_id':'NW'})
    require(all('content' not in row for row in rows['messages']), 'Discord list includes full content')
    message = origin_tool(ctx, 'discord', 'discord_get', 'discord_manager', {'action':'get_message','channel_id':'NW','message_id':sent['message_id']})['message']
    require(message['content'] == 'NORTHWIND-DISCORD-731', 'Discord write-back loses message text')
    pull_port(ctx,'kickside.discord.source:channel_messages',ctx.state['discord_connection'],config={'channel_id': 'NW'},marker='NORTHWIND-DISCORD-731',label='discord-source')


def hubspot_origin_tools(ctx):
    rows=origin_tool(ctx,'hubspot','read_tool','reader',{'action':'list_objects','object_type':'contacts'})
    require(rows['results'], 'HubSpot contact list is empty')
    selected=rows['results'][0]['id']
    seeded=origin_tool(ctx,'hubspot','read_tool','reader',{'action':'get_object','object_type':'contacts','object_id':selected})
    require('Northwind' in seeded['properties']['firstname'],'HubSpot seeded contact differs')
    created=origin_tool(ctx,'hubspot','write_tool','writer',{'action':'create_object','object_type':'contacts','properties':{'firstname':'Northwind write-back','lastname':'Packing'}},True)
    oid=created['id']
    origin_tool(ctx,'hubspot','write_tool','writer',{'action':'update_object','object_type':'contacts','object_id':oid,'properties':{'firstname':'NORTHWIND-HUBSPOT-731'}},True)
    require(origin_tool(ctx,'hubspot','read_tool','reader',{'action':'get_object','object_type':'contacts','object_id':oid})['properties']['firstname'] == 'NORTHWIND-HUBSPOT-731','HubSpot write-back loses contact properties')
    pull_port(ctx,'kickside.hubspot.source:crm',ctx.state['hubspot_connection'],config={'object_type': 'contacts'},marker='NORTHWIND-HUBSPOT-731',label='hubspot-source')


def discord_sink(ctx):
    cid = ctx.state['discord_connection']
    config = {'connection_id': cid, 'channel_id': 'NW'}
    def write(op, content, ref=None):
        return probe(ctx, port='kickside.discord.sink:channel_message', connection=cid, write=True,
            arguments={'sink_op': op, 'identity_key': 'northwind-discord-sink', 'idempotency_key': uuid.uuid4().hex,
                'config': config, 'input': {'content': content}, 'dest_ref': ref}, label='discord-sink-' + op)
    created = write('upsert', 'NW-DISCORD-SINK-CREATE')
    ref = created['dest_ref']
    require(created['result'] == 'created' and ref['message_id'], 'Discord sink does not return a created message identity')
    updated = write('upsert', 'NW-DISCORD-SINK-UPDATE', ref)
    require(updated['result'] == 'updated' and updated['dest_ref'] == ref, 'Discord sink replaces its destination identity')
    rows = origin_tool(ctx, 'discord', 'discord_get', 'discord_reader', {'action': 'get_messages', 'channel_id': 'NW'})['messages']
    contents = [origin_tool(ctx, 'discord', 'discord_get', 'discord_reader', {'action': 'get_message', 'channel_id': 'NW', 'message_id': row['id']})['message']['content'] for row in rows]
    require('NW-DISCORD-SINK-UPDATE' in contents and 'NW-DISCORD-SINK-CREATE' not in contents, 'Discord sink update does not converge')
    require(write('delete', '', ref)['result'] == 'deleted', 'Discord sink deletion fails')
    rows = origin_tool(ctx, 'discord', 'discord_get', 'discord_reader', {'action': 'get_messages', 'channel_id': 'NW'})['messages']
    contents = [origin_tool(ctx, 'discord', 'discord_get', 'discord_reader', {'action': 'get_message', 'channel_id': 'NW', 'message_id': row['id']})['message']['content'] for row in rows]
    require('NW-DISCORD-SINK-UPDATE' not in contents, 'Deleted Discord sink message remains visible')


def hubspot_sink(ctx):
    cid = ctx.state['hubspot_connection']
    config = {'connection_id': cid, 'object_type': 'contacts'}
    def write(op, marker, ref=None):
        return probe(ctx, port='kickside.hubspot.sink:crm', connection=cid, write=True,
            arguments={'sink_op': op, 'identity_key': 'northwind-hubspot-sink', 'idempotency_key': uuid.uuid4().hex,
                'config': config, 'input': {'properties': {'firstname': marker}}, 'dest_ref': ref}, label='hubspot-sink-' + op)
    created = write('upsert', 'NW-HUBSPOT-SINK-CREATE')
    require(created['result'] == 'created', 'HubSpot sink does not create a contact')
    ref = created['dest_ref']
    updated = write('upsert', 'NW-HUBSPOT-SINK-UPDATE', ref)
    require(updated['result'] == 'updated' and updated['dest_ref'] == ref, 'HubSpot sink replaces its destination identity')
    def read():
        return origin_tool(ctx, 'hubspot', 'read_tool', 'reader', {'action': 'get_object', 'object_type': 'contacts', 'object_id': ref['object_id']})
    require(read()['properties']['firstname'] == 'NW-HUBSPOT-SINK-UPDATE', 'HubSpot sink does not persist updated properties')
    require(write('delete', '', ref)['result'] == 'deleted' and read()['archived'] is True, 'HubSpot sink does not archive its contact')


def google_draft_sink(ctx):
    cid = ctx.state['google_oauth_connection']
    config = {'connection_id': cid}
    key = uuid.uuid4().hex
    def write(op, body, ref=None):
        return probe(ctx, port='kickside.google.sink:gmail_draft', connection=cid, write=True,
            arguments={'sink_op': op, 'identity_key': key, 'idempotency_key': key if op == 'create' else uuid.uuid4().hex,
                'config': config, 'input': {'to': 'operator@northwind.example.invalid', 'subject': 'Northwind sink', 'body': body},
                'dest_ref': ref}, label='gmail-sink-' + op)
    created = write('create', 'NW-GMAIL-SINK-CREATE')
    ref = created['dest_ref']
    require(created['result'] == 'created' and ref['draft_id'], 'Gmail sink does not return a draft identity')
    replayed = write('create', 'NW-GMAIL-SINK-CREATE')
    require(replayed['result'] == 'replayed' and replayed['dest_ref'] == ref, 'Gmail sink duplicates a replayed delivery')
    updated = write('update', 'NW-GMAIL-SINK-UPDATE', ref)
    require(updated['result'] == 'updated' and updated['dest_ref'] == ref, 'Gmail sink changes identity on update')
    from urllib.request import Request, urlopen
    def drafts():
        with urlopen(Request(ctx.state['provider_bases']['google'] + '/gmail/v1/users/me/drafts',
            headers={'Authorization': 'Bearer fictional-google-access'}), timeout=5) as response:
            return json.load(response)['drafts']
    row = next(r for r in drafts() if r['id'] == ref['draft_id'])
    encoded = row['message']['raw']
    require('NW-GMAIL-SINK-UPDATE' in base64.urlsafe_b64decode(encoded + '=' * (-len(encoded) % 4)).decode(),
        'Gmail sink loses message body on the wire')
    require(write('delete', '', ref)['result'] == 'deleted' and not any(r['id'] == ref['draft_id'] for r in drafts()),
        'Gmail sink does not delete its draft')


def hubspot_associations(ctx):
    cid = ctx.state['hubspot_connection']
    page = probe(ctx, port='kickside.hubspot.source:crm_associations', connection=cid,
        arguments={'limit': 100, 'config': {'connection_id': cid, 'from_object_type': 'contacts', 'to_object_type': 'companies'}},
        label='hubspot-association-source')
    require(page['items'] and not page['has_more'], 'HubSpot association source returns no bounded fixture edges')
    edge = next(item['payload']['edge'] for item in page['items'] if item['payload']['edge']['from']['id'] == '731')
    require(edge['to'] == {'object_type': 'companies', 'id': 'company-731'} and edge['association_type']['type_id'] == 1,
        'HubSpot association source loses typed edge identity')


def telegram_origin_tools(ctx):
    require('Northwind' in json.dumps(origin_tool(ctx,'telegram','telegram_get','telegram_reader',{'action':'get_me'})),'Telegram bot identity differs')
    sent=origin_tool(ctx,'telegram','telegram_write','telegram_operator',{'action':'send_message','chat_id':'NW','text':'Northwind packing note'},True)
    origin_tool(ctx,'telegram','telegram_write','telegram_manager',{'action':'edit_message','chat_id':'NW','message_id':sent['message_id'],'text':'NORTHWIND-TELEGRAM-731'},True)
    from urllib.request import urlopen
    with urlopen(ctx.state['provider_bases']['telegram']+'/botfictional-telegram-token/getUpdates',timeout=5) as response:
        rows=json.load(response)['result']
    require(any(r['message']['text']=='NORTHWIND-TELEGRAM-731' for r in rows),'Telegram wire state loses the edited message')


def fireflies_origin_tools(ctx):
    rows=origin_tool(ctx,'fireflies','get_tool','reader',{'action':'list_transcripts'})
    require('Northwind packing meeting' in json.dumps(rows),'Fireflies transcript differs')
    text=origin_tool(ctx,'fireflies','get_tool','reader',{'action':'get_transcript_text','transcript_id':'731'})
    require('Pack 24 cartons' in json.dumps(text),'Fireflies transcript text differs')
    for port in ('transcripts','meetings'):
        pull_port(ctx,'kickside.fireflies.source:'+port,ctx.state['fireflies_connection'],label='fireflies-'+port)


def google_origin_tools(ctx):
    ctx.state['google_connection']=ctx.state['google_oauth_connection']
    read_actions={
        'gmail':{'action':'get_message','message_id':'731'},
        'drive':{'action':'list_files'},
        'calendar':{'action':'list_calendars'},
        'docs':{'action':'get_document','document_id':'731'},
        'sheets':{'action':'read_range','spreadsheet_id':'731','range':'Orders!A1:B2'},
        'slides':{'action':'get_presentation','presentation_id':'731'},
        'contacts':{'action':'list_contacts'},
        'analytics':{'action':'list_properties'},
    }
    for service,args in read_actions.items():
        value=origin_tool(ctx,'google',service+'_read_tool',service+'_reader',args)
        require('Northwind' in json.dumps(value),service+' loses seeded content')
    write_actions={
        'gmail':{'action':'create_draft','to':'operator@northwind.example.invalid','subject':'Northwind write-back','body':'NORTHWIND-GMAIL-731'},
        'drive':{'action':'create_folder','name':'Northwind write-back'},
        'calendar':{'action':'create_event','calendar_id':'primary','summary':'Northwind write-back','start_time':'2026-10-04T13:00:00Z','end_time':'2026-10-04T13:30:00Z'},
        'docs':{'action':'create_document','title':'Northwind write-back'},
        'sheets':{'action':'update_values','spreadsheet_id':'731','range':'Orders!A1:B2','values':[['NORTHWIND-SHEETS-731','24']]},
        'slides':{'action':'create_presentation','title':'Northwind write-back'},
    }
    for service,args in write_actions.items():
        value=origin_tool(ctx,'google',service+'_write_tool',service+'_writer',args,True)
        require(isinstance(value, dict) and value,service+' write fails')
    values=origin_tool(ctx,'google','sheets_read_tool','sheets_reader',{'action':'read_range','spreadsheet_id':'731','range':'Orders!A1:B2'})
    require('NORTHWIND-SHEETS-731' in json.dumps(values),'Google Sheets write-back loses cells')
    events=origin_tool(ctx,'google','calendar_read_tool','calendar_reader',{'action':'list_events','calendar_id':'primary'})
    require('Northwind write-back' in json.dumps(events),'Google Calendar write-back loses event')
    pull_port(ctx,'kickside.google.source:calendar_meetings',ctx.state['google_connection'],label='google-calendar-source')


def sso_origin_link(ctx, provider):
    for key,value in (('client_id','northwind-client'),('client_secret','fictional-oidc-secret'),('enabled',True)):
        saved=ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.sso.providers.'+provider,'key':key,'value':value},label=provider+'-sso-'+key)
        require(saved.get('success'),'SSO credential setting does not persist')
    configure_oidc_security(ctx)
    browser=provider_browser(ctx)
    response=browser.context.request.post(ctx.inst.base+'/api/v1/sso/'+provider+'/link',headers={'Authorization':'Bearer '+ctx.inst.token},data={})
    value=response.json();ctx.inst.evidence.save(provider+'-sso-link-start',value)
    require(response.status==200 and value.get('url','').startswith(ctx.state['provider_bases'][provider]),'SSO ignores the configured authorization endpoint')
    browser.settle()
    browser.page.goto(value['url'],wait_until='domcontentloaded')
    browser.page.wait_for_url(ctx.inst.base+'/**',timeout=30000)
    rows=ctx.inst.request('GET','/api/v1/sso/connections',label=provider+'-sso-identities')['connections']
    require(any(row['provider']==provider and row['email']=='operator@northwind.example.invalid' for row in rows),'SSO identity does not persist')
    ctx.inst.request('DELETE','/api/v1/sso/'+provider+'/link',label=provider+'-sso-unlink')
    require(not any(row['provider']==provider for row in ctx.inst.request('GET','/api/v1/sso/connections')['connections']),'SSO unlink retains the identity')


def webscout_origin_search(ctx):
    for key,value in (('google_search_api_key','fictional-google-key'),('google_search_engine_id','northwind-search')):
        saved=ctx.inst.request('PUT','/api/v1/settings',{'namespace':'kickside.webscout','key':key,'value':value},label='webscout-search-'+key)
        require(saved.get('success'),'Webscout search credential does not persist')
    value=probe(ctx,tool='kickside.webscout.traits:search',trait='kickside.webscout.traits:web_researcher',arguments={'query':'Northwind orders'},label='webscout-google-search')
    require('Northwind orders' in json.dumps(value),'Webscout Google search loses local results')


REGISTRY += [
    Scenario('providers_origins','full',provider_origins_setup,('providers_boot',), issues=('TS-PUBLISHED-PROVIDER-OVERRIDE','KEEPER-PLAN-VERSION-CONFLICT'), instance_setup=True),
    Scenario('providers_github_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'github'),('providers_origins',),features=('kickside/github|connection_provider|kickside.github.connection:github_connection', 'kickside/github|workspace_kind|kickside.github.connection:github_connection'), instance_setup=True),
    Scenario('providers_slack_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'slack'),('providers_origins',),features=('kickside/slack|connection_provider|kickside.slack.connection:slack_connection', 'kickside/slack|workspace_kind|kickside.slack.connection:slack_connection'), instance_setup=True),
    Scenario('providers_discord_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'discord'),('providers_origins',),features=('kickside/discord|connection_provider|kickside.discord.connection:discord_connection', 'kickside/discord|workspace_kind|kickside.discord.connection:discord_connection'), instance_setup=True),
    Scenario('providers_hubspot_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'hubspot'),('providers_origins',),features=('kickside/hubspot|connection_provider|kickside.hubspot.connection:hubspot_connection', 'kickside/hubspot|workspace_kind|kickside.hubspot.connection:hubspot_connection'), instance_setup=True),
    Scenario('providers_telegram_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'telegram'),('providers_origins',),features=('kickside/telegram|connection_provider|kickside.telegram.connection:telegram_connection', 'kickside/telegram|workspace_kind|kickside.telegram.connection:telegram_connection'), instance_setup=True),
    Scenario('providers_fireflies_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'fireflies'),('providers_origins',),features=('kickside/fireflies|connection_provider|kickside.fireflies.connection:fireflies_connection', 'kickside/fireflies|workspace_kind|kickside.fireflies.connection:fireflies_connection'), instance_setup=True),
    Scenario('providers_phantombuster_origin_connect','full',lambda ctx:credential_origin_connect(ctx,'phantombuster'),('providers_origins',),features=('kickside/phantombuster|connection_provider|kickside.phantombuster.connection:phantombuster_connection', 'kickside/phantombuster|workspace_kind|kickside.phantombuster.connection:phantombuster_connection'), instance_setup=True),
    Scenario('providers_google_origin_oauth','full',lambda ctx:oauth_origin_connect(ctx,'google'),('providers_origins',),features=('kickside/google|connection_provider|kickside.google:google',)),
    Scenario('providers_github_origin_oauth','full',lambda ctx:oauth_origin_connect(ctx,'github'),('providers_origins',),features=('kickside/github|connection_provider|kickside.github:github',)),
    Scenario('providers_github_origin_tools','full',github_origin_tools,('providers_github_origin_connect',),features=('kickside/github|capability|kickside.github.traits:reader', 'kickside/github|capability|kickside.github.traits:writer', 'kickside/github|capability|kickside.github.traits:manager', 'kickside/github|mcp_tool|kickside.github.traits:read_tool', 'kickside/github|mcp_tool|kickside.github.traits:write_tool', 'kickside/github|source|kickside.github.source:repo_items', 'kickside/github|workspace_kind|kickside.github.source:repo_items_source')),
    Scenario('providers_slack_origin_tools','full',slack_origin_tools,('providers_slack_origin_connect',),features=('kickside/slack|capability|kickside.slack.traits:slack_reader', 'kickside/slack|capability|kickside.slack.traits:slack_operator', 'kickside/slack|capability|kickside.slack.traits:slack_manager', 'kickside/slack|mcp_tool|kickside.slack.traits:slack_get', 'kickside/slack|mcp_tool|kickside.slack.traits:slack_write')),
    Scenario('providers_discord_origin_tools','full',discord_origin_tools,('providers_discord_origin_connect',),features=('kickside/discord|capability|kickside.discord.traits:discord_reader', 'kickside/discord|capability|kickside.discord.traits:discord_operator', 'kickside/discord|capability|kickside.discord.traits:discord_manager', 'kickside/discord|mcp_tool|kickside.discord.traits:discord_get', 'kickside/discord|mcp_tool|kickside.discord.traits:discord_write', 'kickside/discord|source|kickside.discord.source:channel_messages', 'kickside/discord|workspace_kind|kickside.discord.source:messages_source')),
    Scenario('providers_hubspot_origin_tools','full',hubspot_origin_tools,('providers_hubspot_origin_connect',),features=('kickside/hubspot|capability|kickside.hubspot.traits:reader', 'kickside/hubspot|capability|kickside.hubspot.traits:writer', 'kickside/hubspot|mcp_tool|kickside.hubspot.traits:read_tool', 'kickside/hubspot|mcp_tool|kickside.hubspot.traits:write_tool', 'kickside/hubspot|source|kickside.hubspot.source:crm', 'kickside/hubspot|workspace_kind|kickside.hubspot.source:crm_source')),
    Scenario('providers_telegram_origin_tools','full',telegram_origin_tools,('providers_telegram_origin_connect',),features=('kickside/telegram|capability|kickside.telegram.traits:telegram_reader', 'kickside/telegram|capability|kickside.telegram.traits:telegram_operator', 'kickside/telegram|capability|kickside.telegram.traits:telegram_manager', 'kickside/telegram|mcp_tool|kickside.telegram.traits:telegram_get', 'kickside/telegram|mcp_tool|kickside.telegram.traits:telegram_write')),
    Scenario('providers_fireflies_origin_tools','full',fireflies_origin_tools,('providers_fireflies_origin_connect',),features=('kickside/fireflies|capability|kickside.fireflies.traits:reader', 'kickside/fireflies|mcp_tool|kickside.fireflies.traits:get_tool', 'kickside/fireflies|source|kickside.fireflies.source:transcripts', 'kickside/fireflies|source|kickside.fireflies.source:meetings', 'kickside/fireflies|workspace_kind|kickside.fireflies.source:transcripts_source', 'kickside/fireflies|workspace_kind|kickside.fireflies.source:meetings_source')),
    Scenario('providers_google_origin_tools','full',google_origin_tools,('providers_google_origin_oauth',),features=('kickside/google|capability|kickside.google.traits:gmail_reader', 'kickside/google|capability|kickside.google.traits:gmail_writer', 'kickside/google|capability|kickside.google.traits:drive_reader', 'kickside/google|capability|kickside.google.traits:drive_writer', 'kickside/google|capability|kickside.google.traits:calendar_reader', 'kickside/google|capability|kickside.google.traits:calendar_writer', 'kickside/google|capability|kickside.google.traits:docs_reader', 'kickside/google|capability|kickside.google.traits:docs_writer', 'kickside/google|capability|kickside.google.traits:sheets_reader', 'kickside/google|capability|kickside.google.traits:sheets_writer', 'kickside/google|capability|kickside.google.traits:slides_reader', 'kickside/google|capability|kickside.google.traits:slides_writer', 'kickside/google|capability|kickside.google.traits:contacts_reader', 'kickside/google|capability|kickside.google.traits:analytics_reader', 'kickside/google|mcp_tool|kickside.google.traits:gmail_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:gmail_write_tool', 'kickside/google|mcp_tool|kickside.google.traits:drive_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:drive_write_tool', 'kickside/google|mcp_tool|kickside.google.traits:calendar_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:calendar_write_tool', 'kickside/google|mcp_tool|kickside.google.traits:docs_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:docs_write_tool', 'kickside/google|mcp_tool|kickside.google.traits:sheets_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:sheets_write_tool', 'kickside/google|mcp_tool|kickside.google.traits:slides_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:slides_write_tool', 'kickside/google|mcp_tool|kickside.google.traits:contacts_read_tool', 'kickside/google|mcp_tool|kickside.google.traits:analytics_read_tool', 'kickside/google|source|kickside.google.source:calendar_meetings', 'kickside/google|workspace_kind|kickside.google.source:calendar_meeting_source')),
    Scenario('providers_sso_github_origin_link','full',lambda ctx:sso_origin_link(ctx,'github'),('providers_origins','providers_sso_github_settings'),features=('kickside/sso-github|connection_provider|kickside.sso.providers.github:provider',)),
    Scenario('providers_sso_google_origin_link','full',lambda ctx:sso_origin_link(ctx,'google'),('providers_origins','providers_sso_google_settings'),features=('kickside/sso-google|connection_provider|kickside.sso.providers.google:provider',)),
    Scenario('providers_sso_microsoft_origin_link','full',lambda ctx:sso_origin_link(ctx,'microsoft'),('providers_origins','providers_sso_microsoft_settings'),features=('kickside/sso-microsoft|connection_provider|kickside.sso.providers.microsoft:provider',)),
    Scenario('providers_webscout_origin_search','full',webscout_origin_search,('providers_origins',),features=(feature('webscout','mcp_tool','kickside.webscout.traits:search'),))
]


def phantom_control(ctx, operation, connection, with_policy=False, *, owner_component_id=None):
    bounds = {
        'version':'SourceOperationControlBounds/v1','provider':'phantombuster','policy_ref':'northwind-control','revision':'v1','operation_id':operation,
        'limits':{'max_results':{'minimum':1,'maximum':100},'timeout_seconds':{'minimum':1,'maximum':60}},
        'lifecycle':{'stale_after_seconds':{'minimum':1,'maximum':86400}},
        'storage':{'limit_chars':{'minimum':1,'maximum':100000},'retention':{'class':'source_specific','max_age_seconds':{'minimum':1,'maximum':2592000}}},
        'tool':{'list_limit':{'minimum':1,'maximum':100},'output_chars':{'minimum':1,'maximum':12000}},
    }
    args={'bounds':bounds}
    if with_policy:
        args['policy']={'version':'SourceOperationPolicy/v1','policy_id':'northwind-snapshot','revision':'v1','source_binding_id':'kickside.phantombuster.source:'+('candidate_source' if operation=='candidate_snapshot' else 'activity_source'),'operation_id':operation,'limits':{'max_results':100,'timeout_seconds':30},'lifecycle':{'stale_after_seconds':86400,'stale_action':'unresolved','not_found_action':'unresolved'},'storage':{'mode':'bounded','limit_chars':100000,'retention':{'class':'source_specific','max_age_seconds':2592000}},'ownership':{'owner_component_id':owner_component_id or connection,'connection_id':connection}}
    return probe(ctx,tool=NS+':bounds',arguments=args,label='phantombuster-control-'+operation)


def phantombuster_origin_tools(ctx):
    cid=ctx.state['phantombuster_connection']
    control=phantom_control(ctx,'candidate_snapshot',cid)['bounds']
    context={'control_bounds':control}
    rows=origin_tool(ctx,'phantombuster','get_tool','reader',{'action':'list_agents','limit':10},context=context)
    require('Northwind candidate export' in json.dumps(rows),'PhantomBuster agent differs')
    launch=origin_tool(ctx,'phantombuster','write_tool','operator',{'action':'launch_agent','agent_id':'731'},True,context)
    require(launch.get('containerId'),'PhantomBuster launch has no container')
    containers=origin_tool(ctx,'phantombuster','get_tool','manager',{'action':'list_containers','agent_id':'731','limit':10},context=context)
    require(launch['containerId'] in json.dumps(containers),'PhantomBuster launch does not persist')
    for port,operation in (('candidates','candidate_snapshot'),('activities','activity_snapshot')):
        resolved=phantom_control(ctx,operation,cid,True)
        config={'connection_id':cid,'actor_id':'731','query':'Northwind packing','max_rows_per_pull':100,'owner_component_id':cid,'control_bounds':resolved['bounds'],'operation_policy':resolved['policy']}
        pull_port(ctx,'kickside.phantombuster.source:'+port,cid,config,'Northwind','phantombuster-'+port)


REGISTRY += [Scenario('providers_phantombuster_origin_tools','full',phantombuster_origin_tools,('providers_phantombuster_origin_connect',),features=tuple(feature('phantombuster','capability','kickside.phantombuster.traits:'+name) for name in ('reader','operator','manager'))+tuple(feature('phantombuster','mcp_tool','kickside.phantombuster.traits:'+name) for name in ('get_tool','write_tool'))+tuple(feature('phantombuster','source','kickside.phantombuster.source:'+name) for name in ('candidates','activities')))]

REGISTRY += [
    Scenario('providers_discord_sink', 'full', discord_sink, ('providers_discord_origin_connect',),
        features=(feature('discord', 'sink', 'kickside.discord.sink:channel_message'),)),
    Scenario('providers_hubspot_sink', 'full', hubspot_sink, ('providers_hubspot_origin_connect',),
        features=(feature('hubspot', 'sink', 'kickside.hubspot.sink:crm'),)),
    Scenario('providers_hubspot_associations', 'full', hubspot_associations, ('providers_hubspot_origin_connect',),
        features=(feature('hubspot', 'source', 'kickside.hubspot.source:crm_associations'),)),
    Scenario('providers_google_draft_sink', 'full', google_draft_sink, ('providers_google_origin_oauth',),
        features=(feature('google', 'sink', 'kickside.google.sink:gmail_draft'),)),
]


def provider_connection_lifecycle(ctx):
    inst = ctx.inst
    catalog = inst.request('GET','/api/v1/connections/providers/discover',label='origin-provider-discovery')['providers']
    require(any(row['impl_id']=='kickside.github.connection:github_connection' for row in catalog),'GitHub credential provider is absent')
    badges = inst.request('GET','/api/v1/connections/providers/badges',label='origin-provider-badges')['providers']
    require(any(row['provider']=='github' and row['title'] for row in badges),'GitHub presentation badge is absent')
    cid = connect(ctx,'github lifecycle','kickside.github.connection:github_connection',{'token':'fictional-github-token'})
    updated = inst.request('PUT','/api/v1/connections/'+cid,{'name':'Northwind renamed endpoint connection'},label='origin-connection-rename')
    require(updated.get('success'),'Connection rename fails')
    rows = inst.request('GET','/api/v1/connections',label='origin-connection-read-back')['connections']
    require(any(row['component_id']==cid and row['name']=='Northwind renamed endpoint connection' for row in rows),'Connection rename does not persist')
    resources = inst.request('POST','/api/v1/connections/'+cid+'/discover_resources',{},label='origin-connection-resources')['resources']
    require('northwind/orders' in json.dumps(resources),'Configured GitHub API loses resource discovery')
    callback = inst.cleanup.callbacks[-1][1]
    callback()
    inst.cleanup.callbacks = [(name, cleanup) for name,cleanup in inst.cleanup.callbacks if cleanup != callback]
    rows = inst.request('GET','/api/v1/connections',label='origin-connection-deleted')['connections']
    require(not any(row['component_id']==cid for row in rows),'Deleted connection remains in the list')


REGISTRY.append(Scenario('providers_connection_lifecycle','full',provider_connection_lifecycle,('providers_github_origin_connect',),features=tuple(feature('connection','http',path) for path in (
    'GET /api/v1/connections/providers/discover', 'GET /api/v1/connections/providers/badges',
    'POST /api/v1/connections', 'GET /api/v1/connections', 'PUT /api/v1/connections/{id}',
    'POST /api/v1/connections/{id}/discover_resources', 'DELETE /api/v1/connections/{id}',
))))

REGISTRY += [Scenario('providers_hubspot_engagements','full',hubspot_engagements,('providers_hubspot_origin_connect',),features=(feature('hubspot','source','kickside.hubspot.source:crm'),feature('hubspot','workspace_kind','kickside.hubspot.source:crm_source'),feature('hubspot','mcp_tool','kickside.hubspot.traits:write_tool')))]

REGISTRY.append(Scenario('providers_google_oauth_refresh', 'full', google_oauth_refresh,
    ('providers_origins',), features=(
        feature('google', 'connection_provider', 'kickside.google:google'),
        feature('google', 'mcp_tool', 'kickside.google.traits:drive_read_tool'),
        feature('oauth', 'http', 'POST /api/v1/oauth/providers/{provider_name}/init'),
        feature('oauth', 'http', 'GET /api/v1/oauth/connections/{component_id}'),
        feature('connection', 'http', 'GET /api/v1/connections'),
    )))

REGISTRY.append(Scenario('providers_discord_gateway_responder', 'full', discord_gateway_responder,
    ('providers_origins',), model=True, instance_setup=True, issues=('DISCORD-GATEWAY-WAKE', 'R4-I12', 'CHANNEL-PAUSED-WITNESS-PUBLICATION-IDENTITY'), features=(
        feature('discord', 'connection_provider', 'kickside.discord.connection:discord_connection'),
        feature('channel', 'automation', 'kickside.channel.responder:channel_responder'),
        feature('automation', 'http', 'POST /api/v1/automations'),
        feature('automation', 'http', 'GET /api/v1/automations/{id}/state'),
        feature('automation', 'http', 'POST /api/v1/automations/{id}/actions/{method}'),
        feature('agents', 'http', 'POST /api/v1/user-agents'),
    )))


def channel_sink(ctx):
    ctx.inst.install('kickside/channel')
    cid = ctx.state['discord_connection']
    marker = 'NW-CHANNEL-SINK-' + uuid.uuid4().hex[:8]
    result = probe(ctx, port='kickside.channel.sink:channel_post', connection=cid, write=True,
        arguments={'origin': NS + ':probe', 'sink_op': 'upsert', 'identity_key': marker,
            'idempotency_key': marker, 'config': {'connection_id': cid, 'channel_id': 'NW'},
            'input': {'content': marker + ': 48 fictional crates'}}, label='channel-sink-write')
    require(result['result'] == 'created' and result['dest_ref']['connection_id'] == cid
        and result['dest_ref']['channel_id'] == 'NW', 'Channel sink loses its destination receipt: ' + str(result))
    rows = origin_tool(ctx, 'discord', 'discord_get', 'discord_reader', {'action': 'get_messages', 'channel_id': 'NW'})
    require(rows['messages'], 'Channel sink does not list the delivered message')
    detail = origin_tool(ctx, 'discord', 'discord_get', 'discord_reader', {
        'action': 'get_message', 'channel_id': 'NW', 'message_id': result['dest_ref']['message_ref']})
    require(marker in detail['message'].get('content', ''), 'Channel sink does not deliver provider content')


def research_workflow_fixture(ctx, provider, config):
    from cleanup_evidence import delete_workflow
    ctx.inst.install('kickside/workflows')
    wid = ctx.inst.request('POST', '/api/v1/workflows',
        {'title': 'Northwind ' + provider + ' research block'}, label=provider + '-research-create')['flow_id']
    base = '/api/v1/workflows/' + wid
    ctx.inst.cleanup.add(provider + ' research workflow', lambda: delete_workflow(ctx, wid), scope='scenario')
    if callable(config):
        config = config(wid)
    ref = 'kickside.' + provider + '.research:block.source'
    schema = ctx.inst.request('GET', '/api/v1/keeper/registry/entry?id=' + ref)['entry']['data']['block']['input']
    ctx.inst.request('POST', base + '/apply', {'commands': [
        {'type': 'node.add', 'body': {'id': 'start', 'kind': 'start', 'title': 'Northwind research input', 'config': {'input_schema': schema}}},
        {'type': 'node.add', 'body': {'id': 'receipt', 'kind': 'block', 'title': 'Verify dispatch record', 'ref': ref, 'config': config}},
        {'type': 'node.add', 'body': {'id': 'finish', 'kind': 'finish', 'title': 'Northwind research output', 'config': {'output_schema': {'type': 'object', 'additionalProperties': True}}}},
        {'type': 'edge.add', 'body': {'id': 'start-receipt', 'source_id': 'start', 'source_port': 'out', 'target_id': 'receipt', 'target_port': 'in'}},
        {'type': 'edge.add', 'body': {'id': 'receipt-finish', 'source_id': 'receipt', 'source_port': 'result', 'target_id': 'finish', 'target_port': 'in'}},
    ]}, label=provider + '-research-definition')
    version = ctx.inst.request('POST', base + '/publish', {}, label=provider + '-research-publish')['version']
    return wid, version


def research_workflow(ctx, provider, config, data):
    from scenarios_automation import flow_detail
    wid, version = research_workflow_fixture(ctx, provider, config)
    base = '/api/v1/workflows/' + wid
    run = ctx.inst.request('POST', base + '/run', {'version': version, 'input': data}, label=provider + '-research-run')['run_id']
    result = ctx.inst.wait(lambda: flow_detail(ctx.inst, wid, run), provider + ' Research source completes', seconds=120)
    output = result['run']['output']['result']
    require(output['source_id'] == 'kickside.' + provider + '.research:source' and output['operation'] == data['operation'],
        'Research block loses source operation identity: ' + str(output))
    require(output['artifacts'] and all(a['subject_refs'] == [data['subject']] for a in output['artifacts']),
        'Research block has no attributable artifacts: ' + str(output))
    return output


def phantombuster_research_case(ctx, operation):
    cid = ctx.state['phantombuster_connection']
    resolved = {}

    def config(owner_component_id):
        resolved.update(phantom_control(ctx, operation, cid, True, owner_component_id=owner_component_id))
        return {'connection_id': cid, 'actor_id': '731', 'actor_scope': 'Northwind packing',
            'max_rows_per_pull': 100, 'owner_component_id': owner_component_id, 'control_bounds': resolved['bounds'],
            'operation_policy': resolved['policy']}

    data = {'case_id': 'northwind-research', 'operation': operation, 'capability': 'social.candidate.discovery' if operation == 'candidate_snapshot' else 'social.activity.read',
        'subject': {'kind': 'person', 'ref': 'northwind-operator'}, 'query': 'Northwind packing', 'limits': {'max_results': 100}}
    return config, data, resolved


def phantombuster_research_block(ctx):
    before = len(ctx.fixtures.requests('phantombuster'))
    for operation in ('candidate_snapshot', 'activity_snapshot'):
        config, data, resolved = phantombuster_research_case(ctx, operation)
        output = research_workflow(ctx, 'phantombuster', config, data)
        require('Northwind' in json.dumps(output['artifacts']) and output['receipt']['complete'] is True,
            'PhantomBuster research does not preserve its completed snapshot: ' + str(output))
        require(output['receipt']['control_digest'] == resolved['bounds']['digest'], 'PhantomBuster research loses bounds receipt')
    require(not any(r['path'].endswith('/launch') for r in ctx.fixtures.requests('phantombuster')[before:]),
        'PhantomBuster Research source launches an actor')


def webscout_research_block(ctx):
    operation = 'company_discovery'
    bounds = {'version': 'SourceOperationControlBounds/v1', 'policy_ref': 'northwind-web-control', 'revision': 'v1',
        'operation_id': operation, 'limits': {'max_results': {'minimum': 1, 'maximum': 10}, 'timeout_seconds': {'minimum': 1, 'maximum': 60}},
        'catalog': {key: {'minimum': 1, 'maximum': 10} for key in ('page_size', 'max_provider_calls', 'max_provider_pages')},
        'lifecycle': {'stale_after_seconds': {'minimum': 1, 'maximum': 3600}},
        'storage': {'limit_chars': {'minimum': 1, 'maximum': 100000}, 'retention': {'max_age_seconds': {'minimum': 1, 'maximum': 86400}}},
        'controls': {'response_body_bytes': {'minimum': 1, 'maximum': 1000000}}}
    policy = {'version': 'SourceOperationPolicy/v1', 'policy_id': 'northwind-web-policy', 'revision': 'v1',
        'source_binding_id': 'kickside.webscout.research:source', 'operation_id': operation,
        'limits': {'max_results': 3, 'timeout_seconds': 10},
        'storage': {'mode': 'bounded', 'limit_chars': 30000, 'retention': {'class': 'source_specific', 'max_age_seconds': 3600}},
        'controls': {'response_body_bytes': 50000}}
    resolved = probe(ctx, tool=NS + ':web_bounds', arguments={'bounds': bounds}, label='webscout-research-policy')
    output = research_workflow(ctx, 'webscout', {'control_bounds': resolved['bounds'], 'operation_policy': policy},
        {'case_id': 'northwind-web-research', 'idempotency_key': uuid.uuid4().hex, 'operation': operation,
            'capability': 'market.company.discovery', 'subject': {'kind': 'market', 'ref': 'northwind-dispatch'},
            'input': {'query': 'Northwind packing', 'user_agent': 'Kickside-Smoke/1'}, 'limits': {'max_results': 3, 'timeout_seconds': 10}})
    require(output['retrieval']['status'] == 'succeeded' and 'Northwind' in json.dumps(output['artifacts']),
        'WebScout Research source loses search evidence: ' + str(output))
    require(output['receipt']['policy_receipt']['bounds_policy_digest'] == resolved['bounds']['digest'] and output['receipt']['policy_receipt']['policy_id'] == policy['policy_id'], 'WebScout Research loses policy receipt')


REGISTRY += [
    Scenario('providers_channel_sink', 'full', channel_sink, ('providers_discord_origin_connect',),
        features=(feature('channel', 'sink', 'kickside.channel.sink:channel_post'),)),
    Scenario('providers_phantombuster_research_block', 'full', phantombuster_research_block, ('providers_phantombuster_origin_connect',),
        issues=('R4-I5',),
        features=(feature('phantombuster', 'workflow_block', 'kickside.phantombuster.research:block.source'),)),
    Scenario('providers_webscout_research_block', 'full', webscout_research_block, ('providers_webscout_origin_search',),
        issues=('R4-I5',),
        features=(feature('webscout', 'workflow_block', 'kickside.webscout.research:block.source'),)),
]


def atlassian_oauth_setup(ctx):
    import yaml
    ctx.inst.install('kickside/atlassian')
    path = ctx.inst.app / '.wippy.yaml'
    config = yaml.safe_load(path.read_text())
    overrides = config.setdefault('profiles', {}).setdefault('quickstart', {}).setdefault('override', {})
    base = ctx.state['provider_bases']['google']
    for name, route in (('authorization', '/authorize'), ('token', '/token'), ('userinfo', '/userinfo')):
        overrides['kickside.atlassian:atlassian:connector_contract.context_values.oauth_' + name + '_endpoint'] = base + route
    path.write_text(yaml.safe_dump(config, sort_keys=False))
    ctx.restart()
    ctx.inst.manifest()


def atlassian_oauth(ctx):
    cid = oauth_origin_connect(ctx, 'atlassian', fixture_name='google')
    records = ctx.fixtures.requests('google')
    ctx.inst.evidence.save('atlassian-oauth-wire', records)
    consent = next(r for r in records if r['path'] == '/authorize' and r['query'].get('audience') == ['api.atlassian.com'])
    require(consent['query']['prompt'] == ['consent'] and 'read:me' in consent['query']['scope'][0]
        and 'offline_access' in consent['query']['scope'][0], 'Atlassian OAuth consent loses required provider parameters')
    connection = ctx.inst.request('GET', '/api/v1/oauth/connections/' + cid, label='atlassian-oauth-details')
    require(any(r['method'] == 'GET' and r['path'] == '/userinfo' and r['status'] == 200 for r in records),
        'Atlassian OAuth does not retrieve its provider identity')
    row = connection['connection']
    require(row['component_id'] == cid and row['provider'] == 'atlassian' and row['connection_state'] == 'connected',
        'Atlassian OAuth does not persist its connected provider identity: ' + str(connection))
    require(row['user_email'] == '' and row['user_display_name'] == '' and 'operator@northwind.example.invalid' not in json.dumps(connection),
        'OAuth management details expose the provider-private profile')


REGISTRY += [
    Scenario('providers_atlassian_oauth_setup', 'full', atlassian_oauth_setup, ('providers_origins',), instance_setup=True),
    Scenario('providers_atlassian_oauth', 'full', atlassian_oauth, ('providers_atlassian_oauth_setup',),
        issues=('R5-T06',), features=(feature('atlassian', 'connection_provider', 'kickside.atlassian:atlassian'),)),
]


def regression_phantombuster_ui(ctx):
    from playwright.sync_api import expect
    from scenarios_automation import open_workflow
    config, data, _ = phantombuster_research_case(ctx, 'candidate_snapshot')
    wid, _ = research_workflow_fixture(ctx, 'phantombuster', config)
    browser = provider_browser(ctx)
    open_workflow(ctx, 'Northwind phantombuster research block')
    browser.frame.get_by_role('button', name='Run', exact=True).click()
    dialog = browser.frame.get_by_role('dialog', name='Run with input', exact=True)
    dialog.get_by_role('textbox', name='JSON value', exact=True).fill(json.dumps(data))
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/workflows/' + wid + '/simulate')) as response:
        dialog.get_by_role('button', name='Run', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('run_id'), 'PhantomBuster UI run does not launch')
    rid = response.value.json()['run_id']
    ctx.inst.wait(lambda: ctx.inst.request('GET', '/api/v1/workflows/' + wid + '/runs/' + rid)['run']['status'] in ('completed', 'failed'),
        'PhantomBuster browser run reaches a verdict', seconds=120, pump=browser.page.wait_for_timeout)
    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    row = browser.frame.get_by_role('dialog', name='Runs', exact=True).locator('.wf-runs-row').filter(has_text=rid[:8])
    browser.screenshot('phantombuster-workflow-verdict')
    expect(row).to_contain_text('Completed', timeout=30000)
    row.click()
    browser.frame.locator('.vue-flow__node').filter(has_text='Verify dispatch record').click()
    expect(browser.frame.locator('.wf-panel--run')).to_contain_text('Northwind', timeout=30000)
    browser.screenshot('phantombuster-workflow-output')


def providers_chat_setup(ctx):
    from model_fixture import live_profile
    _, cards = live_profile(ctx, 'Northwind provider chat', scope='instance')
    selected = next(card for card in cards if card.get('provider_model') == ctx.inst.config['model']['llm'])
    ctx.state['model'] = selected['name']
    ctx.inst.install('kickside/mcp-client')
    Browser.release(ctx)
    provider_browser(ctx)


from workflow_teardown import visible_workflow_teardown

REGISTRY.append(Scenario('regression_visible_workflow_teardown', 'regression', visible_workflow_teardown,
    ('providers_phantombuster_origin_connect',), model=True, issues=('SMOKE-VISIBLE-WORKFLOW-TEARDOWN',)))


def regression_mcp_error_chat(ctx):
    from scenarios_ai import create_agent
    cid = connect(ctx, 'mcp-chat-error', 'kickside.mcp_client:remote_connection', {
        'endpoint_url': ctx.state['provider_bases']['mcp'] + '/mcp/limits', 'auth_type': 'none'}, scope='scenario')
    trait = 'kickside.mcp_client:tools_trait'
    aid = create_agent(ctx, 'Northwind remote error assistant', (trait,), {trait: {
        'connection_id': cid, 'selected_tools': ['remote_error'], 'tool_prefix': 'Northwind'}},
        prompt='Call the requested tool once. Show its actual error, then end the turn. Never retry.')
    ctx.inst.cleanup.add('remote error agent', lambda: ctx.inst.request('DELETE', '/api/v1/user-agents/' + aid), scope='scenario')
    browser = ctx.browser_check()
    browser.open_chat(aid)
    browser.tool_error('Call Northwind_remote_error exactly once with an empty object. Show the actual error and finish without retrying.',
        'Northwind packing station is unavailable', 'mcp-remote-error')
    requests = ctx.fixtures.requests('mcp')
    require(any(row['body'].get('method') == 'tools/call' and row['body']['params']['name'] == 'remote_error' for row in requests),
        'Chat does not invoke the remote MCP provider')


def regression_mcp_unavailable_chat(ctx):
    from scenarios_ai import create_agent
    from scenarios_automation import mint
    reader = 'kickside.automation.traits:reader'
    credential = mint(ctx.inst, traits=(reader,), active=(reader,))
    ctx.inst.cleanup.add('unavailable chat credential', lambda: ctx.inst.request('POST',
        '/api/v1/mcp/credentials/' + credential['credential_id'] + '/revoke', {}), scope='scenario')
    cid = connect(ctx, 'live-mcp-guidance', 'kickside.mcp_client:remote_connection', {
        'endpoint_url': ctx.inst.base + '/api/public/mcp', 'auth_type': 'bearer',
        'bearer_token': credential['token']}, scope='scenario')
    trait = 'kickside.mcp_client:tools_trait'
    aid = create_agent(ctx, 'Northwind unavailable tool assistant', (trait,), {trait: {
        'connection_id': cid, 'selected_tools': ['drop_trait', 'AutomationsRead'], 'tool_prefix': 'Northwind'}},
        prompt='Execute the two requested tools sequentially, exactly once each. Show the actual error and end the turn. Never retry.')
    ctx.inst.cleanup.add('unavailable chat agent', lambda: ctx.inst.request('DELETE',
        '/api/v1/user-agents/' + aid), scope='scenario')
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.open_chat(aid)
    chat = browser.tool_error('First call Northwind_drop_trait with id ' + reader + '. After it completes, '
        'call Northwind_AutomationsRead with action list once. Quote the actual failure.',
        'Tool ID is required or tool is not allowed', 'mcp-unavailable-chat')
    text = chat.evaluate('el => el.shadowRoot.textContent')
    require('AutomationsRead' in text, 'Unavailable-tool chat omits its rejected tool name')


REGISTRY += [
    Scenario('regression_phantombuster_ui', 'full', regression_phantombuster_ui, ('providers_phantombuster_origin_connect',),
        issues=('PHANTOMBUSTER-WORKFLOW', 'R4-I5'), features=(feature('phantombuster', 'workflow_block', 'kickside.phantombuster.research:block.source'),)),
    Scenario('providers_chat_setup', 'full', providers_chat_setup, ('providers_boot',), model=True, instance_setup=True),
    Scenario('regression_mcp_error_chat', 'full', regression_mcp_error_chat, ('providers_chat_setup',), model=True,
        issues=('B06', 'B14'), features=(feature('mcp-client', 'mcp_tool', 'kickside.mcp_client:invoke_tool'),)),
    Scenario('regression_mcp_unavailable_chat', 'full', regression_mcp_unavailable_chat, ('providers_chat_setup',), model=True,
        issues=('MCP-UNAVAILABLE-TOOLS', 'SMOKE-REVOKED-TOOL-CHAT-CONTRACT'), features=(feature('mcp', 'http', 'POST /api/public/mcp'),)),
]

from channel_hot_update_contract import channel_hot_update
REGISTRY.append(Scenario('hot_update_channel_conversation', 'regression', channel_hot_update,
    ('providers_boot',), model=True, instance_setup=True, issues=('HOT-UPDATE-CHANNEL-UPGRADE', 'R5-T05', 'R5-T09')))
