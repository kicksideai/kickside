"""Opt-in real-model commands against the default onboarding agent."""
from contextlib import contextmanager
import json
import re
import time
import uuid

from browser import ASSISTANT_TEXT, CHAT_STATE
from playwright.sync_api import expect
from chat_transport import api_command, assert_persisted_reply, current_turn, reply_if_completed
from harness import Scenario, require
from scenarios import platform_onboarding, first_agent, member_identity, refresh_member_token, nav
from scenarios_ai import messages, function_messages


def unique(prefix):
    return prefix + ' ' + uuid.uuid4().hex[:12]


def chat_setup(ctx):
    require(ctx.inst.config['model'], 'Chat requires a configured real model')
    platform_onboarding(ctx, embedding_dimensions=None)
    first_agent(ctx)
    ctx.state['chat_admin'] = {'token': ctx.inst.token, 'email': ctx.inst.email, 'agent': ctx.state['agent']}
    capture_catalog(ctx)


def capture_catalog(ctx):
    inst = ctx.inst
    ctx.state['chat_catalog'] = inst.request('GET', '/api/v1/agents/traits')['traits']
    inst.evidence.save('capability-catalog', ctx.state['chat_catalog'])
    for name, path in [('tools', '/api/v1/agents/tools'), ('engines', '/api/v1/knowledge/engines'),
                       ('classes', '/api/v1/models/classes'), ('kb-models', '/api/v1/knowledge/models')]:
        inst.evidence.save(name, inst.request('GET', path))


def openai_reply_persistence(ctx):
    import os
    from urllib.parse import quote
    require(os.environ.get('OPENAI_API_KEY'), 'OpenAI reply proof requires OPENAI_API_KEY')
    inst = ctx.inst
    inst.redactor.add(os.environ['OPENAI_API_KEY'])
    name = 'openai-reply-proof/' + uuid.uuid4().hex[:12]
    inst.request('PUT', '/api/v1/models/cards', {
        'name': name, 'title': 'OpenAI short reply', 'provider_id': 'wippy.llm.openai:provider',
        'provider_model': 'gpt-4.1-nano', 'capabilities': ['generate'], 'enabled': True,
        'output_tokens': 64}, label='openai-model-card')
    own(ctx, '/api/v1/models/cards?name=' + quote(name, safe=''))
    cards = inst.request('GET', '/api/v1/models/admin', label='openai-model-catalog')['models']
    card = next(row for row in cards if row['name'] == name)
    require(card['provider_id'] == 'wippy.llm.openai:provider', 'Model card uses a different provider')
    aid = inst.request('POST', '/api/v1/user-agents', {
        'title': unique('Reply persistence'), 'description': 'Stream and storage equality',
        'model': card['name'], 'traits': [], 'tools': [],
        'prompt': 'Answer briefly. Do not use tools.'}, label='openai-agent-create')['component_id']
    own(ctx, '/api/v1/user-agents/' + aid)
    saved = inst.request('GET', '/api/v1/user-agents/' + aid, label='openai-agent-config')['agent']
    require(saved['model'] == card['name'], 'Agent does not retain the OpenAI model card')
    inst.evidence.save('openai-provider-proof', {'model': card['name'], 'provider_id': card['provider_id']})
    sid = None
    for index, expected in enumerate(('A quiet blue river.', 'The lantern rests beside the window.')):
        reply, transcript, sid = api_command(ctx, 'Reply with exactly: ' + expected, agent_id=aid, session_id=sid)
        inst.evidence.save('openai-persisted-reply-' + str(index), {
            'session_id': sid, 'expected_text': expected, 'streamed_text': reply, 'messages': transcript})
        require(reply == expected, 'OpenAI reply differs from the requested exact text: ' + repr(reply))


def member_setup(ctx):
    member = member_identity(ctx)
    refresh_member_token(ctx.inst, member, '/api/v1/agents/traits', lambda value: bool(value.get('traits')),
                         'chat-member-admission')
    with identity(ctx, member):
        ctx.browser_check().login(member['email'], ctx.inst.password)
        first_agent(ctx)
        member['agent'] = ctx.state['agent']
        capture_catalog(ctx)
    ctx.state['chat_member'] = member


@contextmanager
def identity(ctx, actor):
    inst = ctx.inst
    previous = inst.token, inst.email, inst.password, ctx.state.get('agent')
    ctx.close_browser()
    inst.token, inst.email = actor['token'], actor['email']
    inst.password = actor.get('password', inst.password)
    if actor.get('agent'):
        ctx.state['agent'] = actor['agent']
    try:
        yield
    finally:
        ctx.close_browser()
        inst.token, inst.email, inst.password, ctx.state['agent'] = previous


def for_role(role, run):
    def execute(ctx):
        with identity(ctx, ctx.state['chat_' + role]):
            try:
                run(ctx)
            finally:
                errors = ctx.inst.cleanup.run(scope='scenario')
                require(not errors, 'Chat object cleanup fails: ' + '\n'.join(errors))
    return execute


def stop_continuation(ctx):
    browser = ctx.browser_check()
    browser.login()
    browser.open_chat(ctx.state['agent'])
    sid = browser.current_session()

    first = 'WAVE3-DEFAULT-STREAM-' + uuid.uuid4().hex.upper()
    browser.stream('Give twelve numbered fictional Northwind dispatch checks, two sentences each. End with ' + first + '.',
                   first, 'release-default-first-stream')
    browser.reload()
    browser.open_chat(ctx.state['agent'], session_id=sid)
    ctx.inst.wait(lambda: first in browser.frame.locator('wippy-chat').evaluate(ASSISTANT_TEXT),
                  'Reload restores default-agent streamed history', seconds=30,
                  pump=browser.page.wait_for_timeout)

    chat = browser.frame.locator('wippy-chat')
    stop = chat.locator('.chat-input__stop-button')
    box = chat.get_by_placeholder('Type a message', exact=True)
    start = len(browser.frames)
    box.fill('Write 200 numbered fictional Northwind warehouse checks. Each check has three detailed sentences. ' \
             'Do not summarize and do not stop early.')
    box.press('Enter')
    expect(stop).to_be_visible(timeout=30000)
    stop.click()

    def stopped():
        state = chat.evaluate(CHAT_STATE)
        return state if state['enabled'] and not state['busy'] else None

    state = ctx.inst.wait(stopped, 'Stop returns chat to an enabled idle state', seconds=30,
                          pump=browser.page.wait_for_timeout)
    frames = browser.frames[start:]
    require(any(isinstance(row.get('data'), dict) and row['data'].get('type') == 'update'
                and row['data'].get('status') == 'idle' for row in frames),
            'Stop does not publish the durable idle state')
    require(not chat.locator('[role=alert]').all_text_contents(), 'Stop reports a chat error')

    followup = 'WAVE3-DEFAULT-AFTER-STOP-' + uuid.uuid4().hex.upper()
    browser.stream('Give twelve fictional Northwind handoff checks and end with ' + followup + '.',
                   followup, 'release-default-after-stop')
    stored = messages(ctx, sid)
    require(sum(row['type'] == 'user' for row in stored) == 3,
            'Default chat does not persist one user message for each send')
    require(any(row['type'] == 'assistant' and followup in str(row.get('data')) for row in stored),
            'Post-Stop reply does not persist its requested marker')
    ctx.inst.evidence.save('release-default-chat', {
        'session_id': sid,
        'stream_marker': first,
        'post_stop_marker': followup,
        'stop_state': state,
        'stop_frames': frames,
    })


def browser_command(ctx, prompt, *, session_id=None):
    browser = ctx.browser_check()
    if session_id is None:
        browser.login()
        browser.open_chat(ctx.state['agent'])
        session_id = browser.current_session()
        token = ctx.inst.token
        ctx.inst.cleanup.add('chat browser session ' + session_id, lambda: ctx.inst.request(
            'DELETE', '/api/v1/sessions/delete?session_id=' + session_id, auth=token,
            label='browser-session-delete'), scope='scenario')
    chat = browser.frame.locator('wippy-chat')
    box = chat.get_by_placeholder('Type a message', exact=True)
    start = len(browser.frames)
    label = 'command-' + uuid.uuid4().hex
    previous_users = {row['message_id'] for row in messages(ctx, session_id) if row['type'] == 'user'}
    box.fill(prompt)
    box.press('Enter')
    deadline = time.monotonic() + 180
    busy = False
    while time.monotonic() < deadline:
        browser.page.wait_for_timeout(100)
        state = chat.evaluate(CHAT_STATE)
        busy = busy or state['busy']
        if busy and not state['busy'] and state['enabled'] and state['text']:
            transcript = messages(ctx, session_id)
            user = next((row for row in reversed(transcript) if row['type'] == 'user'), None)
            if user is None or user['message_id'] in previous_users:
                continue
            reply = reply_if_completed(transcript)
            if reply is None:
                continue
            assert_persisted_reply(browser.frames[start:], session_id, transcript)
            ctx.inst.evidence.save(label + '-transcript', {'prompt': prompt, 'session_id': session_id,
                                                         'messages': transcript, 'reply': reply, 'visible_text': state['text']})
            ctx.inst.evidence.save(label + '-stream', browser.frames[start:])
            return reply, transcript, session_id
    ctx.inst.evidence.save(label + '-stream', browser.frames[start:])
    ctx.inst.evidence.save(label + '-transcript', {'prompt': prompt, 'session_id': session_id,
                                                'messages': messages(ctx, session_id)})
    require(False, 'Chat does not complete within 180 seconds')


def confirms(reply, name, outcomes):
    require(name.lower() in reply.lower() and any(word in reply.lower() for word in outcomes),
            'Reply does not confirm the owning API outcome: ' + reply)
    require(not re.search(r"\b(?:will create|would create|could create|plan to create|unable to|cannot create)\b", reply, re.I),
            'Reply reports a plan or inability instead of the completed effect: ' + reply)


def used(transcript, alias, action=None):
    calls = [row for row in function_messages(current_turn(transcript), alias) if row['metadata'].get('status') == 'success']
    if action:
        calls = [row for row in calls if json.loads(row['data']).get('action') == action]
    require(calls, 'Command has no successful ' + alias + ' ' + str(action or '') + ' tool call')
    return calls


def own(ctx, path):
    token = ctx.inst.token
    ctx.inst.cleanup.add('chat object ' + path, lambda: ctx.inst.request('DELETE', path, auth=token,
                         label='chat-object-delete'), scope='scenario')


def created_kb(ctx, name, reply):
    bases = ctx.inst.request('GET', '/api/v1/knowledge/list', label='kb-effect')['items']
    created = [row for row in bases if row.get('name') == name or row.get('title') == name
               or (row.get('meta') or {}).get('title') == name]
    require(len(created) == 1, 'Chat does not create exactly one KB: ' + reply)
    kid = created[0].get('id') or created[0]['component_id']
    own(ctx, '/api/v1/knowledge/' + kid)
    current = ctx.inst.request('GET', '/api/v1/knowledge/' + kid, label='kb-config-effect')
    require(current['embedding_model'] == 'class:embed', 'Chat chooses a generation model for embeddings')
    confirms(reply, name, ('created', 'ready'))
    return kid


def assert_grounded(reply, fact, results):
    require(fact in reply, 'Answer does not contain the document-only fact: ' + reply)
    evidence = '\n'.join(str(result) for result in results)
    require(fact in evidence, 'Retrieved passages do not contain the answer fact')
    sources = []
    for result in results:
        if isinstance(result, dict):
            sources.extend(row['id'] for row in result.get('results', [])
                           if isinstance(row, dict) and isinstance(row.get('id'), str) and row['id']
                           and fact in row.get('content', ''))
        elif isinstance(result, str):
            sources.extend(re.findall(r'^- ([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})(?:@[^ ]+)?\s*·', result, re.M))
    require(sources and any(source in reply for source in sources),
            'Answer does not cite an actual retrieved KB passage: ' + reply)


def empty_kb(ctx):
    name = unique('Home Files')
    reply, transcript, _ = api_command(ctx, 'create an empty knowledge base called ' + name)
    created_kb(ctx, name, reply)
    used(transcript, 'Knowledge', 'upsert_knowledge_base')


def indexed_chat_document(ctx):
    from upload_chat_contract import upload_in_chat
    name = unique('Home Files')
    reply, transcript, sid = browser_command(ctx, 'create a knowledge base called "' + name + '"')
    kid = created_kb(ctx, name, reply)
    code = 'ORCHID-' + uuid.uuid4().hex.upper()
    title = unique('Fictional Lantern Policy')
    path = ctx.inst.root / (title.replace(' ', '-') + '.txt')
    path.write_text('All details are fictional.\nThe Lantern emergency release code word is ' + code + '.\n')
    uploaded = upload_in_chat(ctx, ctx.browser.frame.locator('wippy-chat'), path)
    uid = uploaded['uuid']
    own(ctx, '/api/v1/uploads/' + uid)
    reply, transcript, _ = browser_command(ctx, 'Add the attached document to "' + name + '".', session_id=sid)
    user_messages = [row for row in transcript if row['type'] == 'user']
    require(uid in user_messages[-1].get('file_uuids', []), 'Chat does not persist its attachment')
    used(transcript, 'EmbedToKB')
    confirms(reply, name, ('added', 'queued', 'ingest', 'stored', 'uploaded'))
    base = '/api/v1/knowledge/' + kid
    def indexed():
        result = ctx.inst.request('POST', base + '/search', {'query': 'Lantern emergency release code word',
                                  'limit': 10}, label='document-index-effect')
        detail = ctx.inst.request('GET', base, label='document-stats-effect')
        chunks = [row for row in result['items'] if row.get('meta', {}).get('node_type') == 'chunk'
                  and row['meta'].get('metadata', {}).get('upload_id') == uid
                  and row['meta'].get('vector_rank') and code in row.get('content', '')]
        return {'search': result, 'knowledge': detail, 'upload_id': uid} if chunks and (
            detail['embedding_count'] > 0 and detail['chunk_count'] > 0 and detail['document_count'] == 1) else None
    evidence = ctx.inst.wait(indexed, 'Chat document is indexed', seconds=120,
                             pump=ctx.browser.page.wait_for_timeout)
    ctx.inst.evidence.save('indexed-document', evidence)
    return name, kid, code, sid


def knowledge_search(ctx):
    name, kid, code, _ = indexed_chat_document(ctx)
    reply, transcript, _ = api_command(ctx, 'Search the knowledge base called "' + name + '" for Lantern emergency release instructions. Cite the matching passage using its retrieved passage ID.')
    retrieval = [row for row in transcript if row['type'] == 'function' and row['metadata'].get('status') == 'success'
                 and row['metadata'].get('function_name') in ('SearchKB', 'QueryKB')]
    require(retrieval, 'Knowledge search performs no KB search')
    assert_grounded(reply, code, [row['metadata']['result'] for row in retrieval])
    require(any(json.loads(row['data']).get('kb_id') == kid for row in retrieval),
            'Search retrieves from a different KB')


def knowledge_answer(ctx):
    name, kid, code, _ = indexed_chat_document(ctx)
    # A new session removes attached bytes and previous replies from the answering context.
    reply, transcript, _ = api_command(ctx, 'Use the knowledge base called "' + name + '" to answer: what is the Lantern emergency release code word? Include a citation to its source document using the retrieved passage ID.')
    answer_effect(reply, transcript, kid, code)


def answer_effect(reply, transcript, kid, code):
    calls = [row for row in current_turn(transcript) if row['type'] == 'function' and row['metadata'].get('status') == 'success'
             and row['metadata'].get('function_name') in ('AskKB', 'SearchKB', 'QueryKB')]
    require(calls, 'Answer performs no knowledge base retrieval')
    require(any(json.loads(row['data']).get('kb_id') == kid for row in calls), 'Answer retrieves from a different KB')
    assert_grounded(reply, code, [row['metadata']['result'] for row in calls])


def headline(ctx):
    name, kid, code, sid = indexed_chat_document(ctx)
    reply, transcript, _ = browser_command(ctx, 'Use the knowledge base called "' + name + '" to answer: what is the Lantern emergency release code word? Include a citation to its source document using the retrieved passage ID.', session_id=sid)
    answer_effect(reply, transcript, kid, code)


def knowledge_page(ctx):
    from playwright.sync_api import expect
    ctx.browser_check().login()
    nav(ctx, 'Knowledge')
    name = unique('Page Home Files')
    frame = ctx.browser.frame
    frame.get_by_role('button', name=re.compile('Create|New knowledge', re.I)).first.click()
    form = frame.locator('kickside-knowledge')
    form.get_by_placeholder('e.g. Product docs', exact=True).fill(name)
    form.get_by_role('button', name=re.compile('Create', re.I)).click()
    expect(frame.get_by_text(name, exact=True)).to_be_visible(timeout=30000)
    bases = ctx.inst.request('GET', '/api/v1/knowledge/list')['items']
    row = next(row for row in bases if row.get('name') == name or (row.get('meta') or {}).get('title') == name)
    own(ctx, '/api/v1/knowledge/' + (row.get('id') or row['component_id']))


def inbox(ctx):
    name = unique('Chat Review')
    reply, transcript, _ = api_command(ctx, 'Submit a notice to my inbox titled "' + name + '" with content "Review the fictional Lantern policy".')
    used(transcript, 'SubmitToInbox')
    found = ctx.inst.wait(lambda: [row for row in ctx.inst.request('GET', '/api/v1/inbox?status=all&limit=200')['items']
                                 if row['title'] == name], 'Chat inbox effect', seconds=60)
    require(len(found) == 1 and 'Lantern' in found[0]['content'], 'Inbox loses chat content')
    own(ctx, '/api/v1/inbox/' + found[0]['id'])
    confirms(reply, name, ('submitted', 'sent', 'added', 'inbox'))


def artifact(ctx):
    name = unique('Chat Artifact')
    reply, transcript, sid = api_command(ctx, 'Create a markdown artifact titled "' + name + '" containing "Fictional Lantern checklist".')
    used(transcript, 'CreateArtifact')
    rows = ctx.inst.request('GET', '/api/v1/artifacts?session_id=' + sid)['artifacts']
    found = [row for row in rows if row['title'] == name]
    require(len(found) == 1 and found[0]['content_type'] == 'text/markdown', 'Artifact does not persist')
    confirms(reply, name, ('created', 'artifact'))


def capabilities(ctx):
    reply, transcript, sid = api_command(ctx, 'Discover your knowledge management capabilities and activate the one that creates knowledge bases.')
    calls = used(transcript, 'Capabilities', 'activate')
    require(any(json.loads(row['data'])['trait_id'] == 'kickside.knowledge.traits:knowledge_manager' for row in calls),
            'Chat activates no Knowledge Manager')
    config = ctx.inst.request('GET', '/api/v1/sessions/get?session_id=' + sid)['session']['config']
    require('kickside.knowledge.traits:knowledge_manager' in json.dumps(config['active_traits']), 'Activation does not persist')
    confirms(reply, 'Knowledge', ('activated', 'active', 'ready'))


def connections(ctx):
    expected = ctx.inst.request('GET', '/api/v1/connections')
    reply, transcript, _ = api_command(ctx, 'List my connections. State clearly if I have none.')
    used(transcript, 'Platform', 'list_connections')
    rows = expected['connections']
    require(all((row.get('name') or row.get('title') or row['id']) in reply for row in rows), 'Reply omits a connection')
    if not rows:
        require(re.search(r'no |none|0 |empty', reply, re.I), 'Reply invents connections: ' + reply)


def files(ctx):
    name = unique('Chat File').replace(' ', '-') + '.txt'
    reply, transcript, _ = api_command(ctx, 'Upload a file named ' + name + ' with base64 content TGFudGVybiBmaWxlLg==, then list my files.')
    used(transcript, 'UploadFile')
    used(transcript, 'ListFiles')
    rows = ctx.inst.request('GET', '/api/v1/uploads/list?limit=100')['uploads']
    found = [row for row in rows if row.get('filename') == name or (row.get('meta') or {}).get('filename') == name]
    require(len(found) == 1, 'Chat upload is absent from owning API')
    uid = found[0].get('uuid') or found[0]['id']
    own(ctx, '/api/v1/uploads/' + uid)
    confirms(reply, name, ('uploaded', 'created', 'file'))
    reply, transcript, _ = api_command(ctx, 'Read the file ' + name + ' and quote its exact text.')
    used(transcript, 'ViewFiles')
    require('Lantern file.' in reply, 'File read invents its content')


def sessions(ctx):
    fact = unique('LANTERN MEMORY')
    _, _, sid = api_command(ctx, 'Remember this fictional reference: ' + fact)
    reply, transcript, _ = api_command(ctx, 'What fictional reference did I ask you to remember?', session_id=sid)
    require(fact in reply, 'Continuation loses the prior user reference')
    session = ctx.inst.request('GET', '/api/v1/sessions/get?session_id=' + sid)['session']
    require(session['session_id'] == sid and len([row for row in transcript if row['type'] == 'user']) == 2,
            'Sessions API does not persist both turns')


def agents(ctx):
    name = unique('Chat Helper')
    reply, transcript, _ = api_command(ctx, 'Create a public agent called "' + name + '" using class:fast with prompt "Answer fictional Lantern questions". Then list my agents.')
    used(transcript, 'Platform', 'upsert_agent')
    used(transcript, 'Platform', 'list_agents')
    rows = ctx.inst.request('GET', '/api/v1/user-agents')['agents']
    found = [row for row in rows if row['title'] == name]
    require(len(found) == 1 and found[0]['public'] is True, 'Public agent does not persist')
    own(ctx, '/api/v1/user-agents/' + found[0]['id'])
    confirms(reply, name, ('created', 'agent'))
    reply, transcript, sid = api_command(ctx, 'Redirect this chat to ' + name + '.')
    current = current_turn(transcript)
    calls = [row for row in current if row['type'] == 'function' and row['metadata'].get('status') == 'success'
             and (row['metadata'].get('function_name'), json.loads(row['data']).get('action'))
             in (('Redirect', 'switch'), ('Agents', 'redirect'))]
    require(calls, 'Chat performs no successful agent redirect')
    session = ctx.inst.request('GET', '/api/v1/sessions/get?session_id=' + sid)['session']
    require(found[0]['id'] in json.dumps(session['config']), 'Redirect does not change the session agent')


def automations(ctx):
    from cleanup_evidence import own_automation
    name = unique('Chat Recurring Notice')
    reply, transcript, sid = api_command(ctx, 'Create a recurring task called "' + name + '" every hour that submits an inbox notice titled "' + name + '" with content "Fictional Lantern scheduled review".')
    used(transcript, 'RecurringTasks', 'create')
    rows = ctx.inst.request('GET', '/api/v1/automations')['automations']
    found = [row for row in rows if row['title'] == name]
    require(len(found) == 1, 'Recurring automation does not persist')
    aid = found[0]['id']
    own_automation(ctx.inst, aid)
    confirms(reply, name, ('created', 'scheduled'))
    reply, transcript, _ = api_command(ctx, 'List my recurring tasks and automations.', session_id=sid)
    require(name in reply, 'Automation list omits created task')
    used(transcript, 'RecurringTasks', 'list')
    reply, transcript, _ = api_command(ctx, 'Run ' + name + ' now.', session_id=sid)
    used(transcript, 'RecurringTasks', 'run_now')
    found = ctx.inst.wait(lambda: [row for row in ctx.inst.request('GET', '/api/v1/inbox?status=all&limit=200')['items']
                                 if row['title'] == name], 'Manual recurring task inbox effect', seconds=60)
    for row in found:
        own(ctx, '/api/v1/inbox/' + row['id'])
    confirms(reply, name, ('run', 'trigger', 'execut', 'queued'))
    reply, transcript, _ = api_command(ctx, 'Pause ' + name + '.', session_id=sid)
    used(transcript, 'RecurringTasks', 'pause')
    status = ctx.inst.request('GET', '/api/v1/automations/' + aid + '/status', label='pause-effect')
    require(status['drives'] and all(row['enabled'] is False and row['phase'] == 'paused' for row in status['drives']),
            'Pause does not disable and pause its drives')
    confirms(reply, name, ('paused',))


def hub(ctx):
    is_admin = ctx.inst.token == ctx.state['chat_admin']['token']
    expected = ctx.inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0',
                                label='hub-owning-api-effect')['modules'] if is_admin else None
    reply, transcript, _ = browser_command(ctx, 'List all installed Hub modules and their exact installed versions, one module per line.')
    if is_admin:
        calls = [row for row in transcript if row['type'] == 'function' and row['metadata'].get('status') == 'success'
                 and 'hub' in str(row['metadata'].get('registry_id', '')).lower()]
        require(calls, 'Hub list has no successful Hub tool call')
        require(expected, 'Owning API has no installed modules')
        for module in expected:
            require(any(module['name'] in line and re.search(
                r'(?<![0-9.])' + re.escape(module['version']) + r'(?![0-9.])', line)
                for line in reply.splitlines()),
                'Hub reply differs from owning API version for ' + module['name'] + ': ' + module['version'])
    else:
        denied = ctx.inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0', expect=(403,))
        require(denied.get('error') and re.search(r'admin|permission|access|authorized', reply, re.I),
                'Member invents Hub administration access: ' + reply)


def optional_catalog(ctx):
    catalog = ctx.inst.request('GET', '/api/v1/agents/traits')['traits']
    ids = {row['id'] for row in catalog}
    availability = {name: sorted(key for key in ids if name in key) for name in ('workflows', 'crm')}
    ctx.inst.evidence.save('optional-component-availability', availability)
    for title, installed in [('Workflows Manager', bool(availability['workflows'])), ('CRM', bool(availability['crm']))]:
        reply, transcript, _ = api_command(ctx, 'Check your capability catalog for "' + title + '". If it is absent, say "' + title + ' is unavailable".')
        used(transcript, 'Capabilities', 'list')
        if not installed:
            require(title.lower() + ' is unavailable' in reply.lower(), 'Reply invents an uninstalled capability: ' + reply)
    if availability['workflows']:
        name = unique('Chat Workflow')
        reply, transcript, _ = api_command(ctx, 'Create an empty draft workflow called "' + name + '" and list my workflows.')
        used(transcript, 'WorkflowsManage', 'create')
        rows = ctx.inst.request('GET', '/api/v1/workflows')['workflows']
        row = next((row for row in rows if row['title'] == name), None)
        require(row, 'Workflow draft is absent from owning API')
        own(ctx, '/api/v1/workflows/' + row['id'])
        confirms(reply, name, ('created', 'draft'))
    if availability['crm']:
        configured = ctx.inst.request('GET', '/api/v1/workspace/crm', label='crm-availability')
        reply, transcript, _ = api_command(ctx, 'List the CRM records I can access. Tell me if a CRM has to be configured first.')
        calls = [row for row in transcript if row['type'] == 'function' and row['metadata'].get('status') == 'success'
                 and row['metadata'].get('function_name') == 'CRMListRecords']
        require(calls or re.search(r'configur|no CRM|create.*CRM', reply, re.I), 'CRM list neither reads records nor explains the missing CRM')
        ctx.inst.evidence.save('crm-record-command', {'owning_api': configured, 'reply': reply, 'calls': calls})


def identity_awareness(ctx):
    profile = ctx.inst.request('GET', '/api/v1/user/me', label='identity-effect')
    reply, transcript, _ = api_command(ctx, 'Activate user awareness and tell me the full name of the signed-in user.')
    used(transcript, 'Capabilities', 'activate')
    require(profile['user']['full_name'] in reply, 'Chat reports a different signed-in user')


def time_awareness(ctx):
    profile = ctx.inst.request('GET', '/api/v1/user/me', label='time-effect')
    reply, transcript, _ = api_command(ctx, 'Activate time awareness and tell me the current date in YYYY-MM-DD format.')
    used(transcript, 'Capabilities', 'activate')
    require(profile['user']['timestamp'][:10] in reply, 'Chat date differs from the instance clock')


def remote_mcp_setup(ctx):
    if ctx.inst.config.get('external'):
        return
    from scenarios_providers import install_probe
    ctx.state['provider_bases'] = {'mcp': ctx.fixtures.start('mcp')}
    ctx.inst.cleanup.add('chat MCP fixture', ctx.fixtures.stop)
    install_probe(ctx)


def remote_mcp(ctx):
    import os
    inst = ctx.inst
    if inst.config.get('external'):
        cid = os.environ.get('SMOKE_CHAT_MCP_CONNECTION_ID')
        require(cid, 'Remote MCP on existing targets requires an owned SMOKE_CHAT_MCP_CONNECTION_ID')
        marker = os.environ.get('SMOKE_CHAT_MCP_EXPECTED_TEXT')
        require(marker, 'Remote MCP on existing targets requires SMOKE_CHAT_MCP_EXPECTED_TEXT')
        prompt = os.environ.get('SMOKE_CHAT_MCP_COMMAND')
        require(prompt, 'Remote MCP on existing targets requires SMOKE_CHAT_MCP_COMMAND')
        effect_path = os.environ.get('SMOKE_CHAT_MCP_EFFECT_PATH', '')
        require(effect_path.startswith('/api/'),
                'Remote MCP on existing targets requires an owning API SMOKE_CHAT_MCP_EFFECT_PATH')
    else:
        result = inst.request('POST', '/api/v1/connections', {'impl_id': 'kickside.mcp_client:remote_connection',
            'name': unique('Chat MCP'), 'private_context': {'endpoint_url': ctx.state['provider_bases']['mcp'] + '/mcp',
            'auth_type': 'none'}, 'validate': True}, label='chat-mcp-connection')
        cid = result['component_id']
        own(ctx, '/api/v1/connections/' + cid)
        marker = unique('LANTERN-MCP')
        prompt = 'Use the remote MCP connection ' + cid + ' to set the order packing note to "' + marker + '". Then read it back.'
    reply, transcript, _ = api_command(ctx, prompt)
    used(transcript, 'Capabilities', 'activate')
    require(marker in reply, 'Remote MCP reply loses the actual tool outcome')
    if inst.config.get('external'):
        effect = inst.request('GET', effect_path, label='remote-mcp-owning-api-effect')
        require(marker in json.dumps(effect), 'Remote MCP owning API does not contain the written value')
    else:
        records = ctx.fixtures.requests('mcp')
        calls = [row['body']['params'] for row in records if row.get('body', {}).get('method') == 'tools/call']
        require(any(row.get('arguments', {}).get('note') == marker for row in calls), 'Chat performs no remote MCP write')
        require(any(row.get('body', {}).get('method') == 'tools/call'
                    and row['body']['params'].get('arguments') == {}
                    and marker in json.dumps(row.get('response', {})) for row in records),
                'Chat performs no remote MCP readback of the written value')
        inst.evidence.save('remote-mcp-effect', records)


REGISTRY = [Scenario('chat_setup', 'chat', chat_setup, model=True, instance_setup=True),
            Scenario('chat_openai_reply_persistence', 'chat', for_role('admin', openai_reply_persistence),
                     ('chat_setup',), model=True, issues=('CHAT-PERSISTED-REPLY-DUPLICATION',)),
            Scenario('chat_member_setup', 'chat', member_setup, ('chat_setup',), model=True, instance_setup=True),
            Scenario('chat_stop_continuation_admin', 'chat', for_role('admin', stop_continuation),
                     ('chat_setup',), model=True,
                     issues=('SESSION-CHAT-STOP-CONTINUATION', 'SESSION-STOP-HISTORY-BOUNDARY'))]
CASES = {'empty_kb': empty_kb, 'knowledge_document': headline, 'knowledge_answer': knowledge_answer, 'knowledge_search': knowledge_search, 'knowledge_page': knowledge_page,
         'inbox': inbox, 'artifacts': artifact, 'capabilities': capabilities, 'connections': connections,
         'files': files, 'sessions': sessions, 'agents_redirect': agents, 'automations': automations,
         'hub': hub, 'optional_catalog': optional_catalog, 'identity_awareness': identity_awareness, 'time_awareness': time_awareness}
for role in ('admin', 'member'):
    for name, run in CASES.items():
        issues = ('CHAT-KB-CREATE-CATALOG', 'CHAT-EMBEDDING-PREREQUISITE') if name == 'empty_kb' else (
            ('CHAT-CAPABILITY-PARTIAL',) if name == 'capabilities' else (
                ('CHAT-UPLOAD-PROVENANCE',) if name in ('knowledge_document', 'knowledge_answer', 'knowledge_search') else ()))
        if name in ('knowledge_search', 'knowledge_document', 'knowledge_answer'):
            issues += ('KNOWLEDGE-SEARCH-ID-DISCOVERY',)
        if name == 'knowledge_search':
            issues += ('AGENTS-CAPABILITY-CONTEXT-GUIDANCE',)
        if name == 'automations':
            issues += ('AUTOMATION-RECURRING-ACTION-GUIDANCE', 'AUTOMATION-PUBLISHED-TOOL-SCHEMA-COMPATIBILITY',
                       'AGENTS-CAPABILITY-REQUEST-KEYWORDS', 'AUTOMATION-ACTION-REQUESTED-FIELDS', 'SESSION-COMMAND-REOPEN-CONTINUITY')
        if name in ('agents_redirect', 'identity_awareness', 'hub'):
            issues += ('CHAT-CAPABILITY-DISCOVERY-REFUSAL',)
        if name in ('knowledge_document', 'knowledge_search'):
            issues += ('SMOKE-CHAT-TURN-COMPLETION',)
        if name in ('empty_kb', 'knowledge_document', 'knowledge_answer', 'knowledge_search',
                    'inbox', 'artifacts', 'capabilities', 'files', 'agents_redirect',
                    'automations', 'optional_catalog'):
            issues += ('CHAT-COMMAND-EFFECT-CONFIRMATION',)
        if name in ('knowledge_document', 'knowledge_answer', 'knowledge_search', 'knowledge_page',
                    'connections', 'files', 'hub', 'identity_awareness', 'time_awareness'):
            issues += ('CHAT-COMMAND-RESULT-FIDELITY',)
        REGISTRY.append(Scenario('chat_' + name + '_' + role, 'chat', for_role(role, run),
                                ('chat_' + ('setup' if role == 'admin' else 'member_setup'),),
                                model=True, issues=issues))
REGISTRY.append(Scenario('chat_remote_mcp_setup', 'chat', remote_mcp_setup,
                        ('chat_member_setup',), instance_setup=True))
for role in ('admin', 'member'):
    REGISTRY.append(Scenario('chat_remote_mcp_' + role, 'chat', for_role(role, remote_mcp),
                   ('chat_remote_mcp_setup',), model=True))
