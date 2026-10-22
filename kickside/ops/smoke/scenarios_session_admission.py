"""Member browser chats retain working context across Memory checkpoints."""
import json
import uuid

import yaml

from browser import CHAT_STATE
from chat_transport import current_turn
from fixture_member_permissions import register_member_policy_grants
from harness import Scenario, require
from mocks.context_model import message_text, prompt_tokens
from runtime_fixtures import complete_splashes
from scenarios import member_identity, refresh_member_token
from scenarios_chat import browser_command, identity
from scenarios_hot_update_work import database_rows


FACTS = ('[FACT:temporary-blue]', '[DECISION:temporary-approved]', '[OPEN:temporary-finish]')


def memory_checkpoint_chat(ctx, window=8192, real=False, mounted=True, large_tool_result=False):
    measured = []
    previous_member = ctx.state.pop('endpoint_member', None)
    try:
        return checkpoint_chat(ctx, window, real, measured, mounted, large_tool_result)
    finally:
        ctx.inst.evidence.save('context-provider-requests', ctx.fixtures.requests('context-model'))
        ctx.inst.evidence.save('context-model-usage', measured)
        ctx.fixtures.stop('context-model')
        ctx.state.pop('endpoint_member', None)
        if previous_member is not None:
            ctx.state['endpoint_member'] = previous_member


def checkpoint_chat(ctx, window, real, measured, mounted, large_tool_result=False):
    inst = ctx.inst
    inst.install('kickside/memory')
    suffix = uuid.uuid4().hex[:12]
    token = uuid.uuid4().hex
    inst.redactor.add(token)
    output = 512
    forward = inst.config['model'] if real else None
    require(not real or forward, 'Real checkpoint proof requires a configured model')
    base = ctx.fixtures.start('context-model', token=token, window=window, forward=forward, observe=measured.append)
    namespace = 'app.smoke.context_' + suffix
    with ctx.paused():
        directory = inst.app / 'src' / ('context-' + suffix)
        directory.mkdir()
        repetitions = window if large_tool_result else 24
        (directory / 'tool.lua').write_text('return {run = function() return "[TOOL:temporary-observed] " .. string.rep("evidence ", '
                                          + str(repetitions) + ') end}\n')
        entries = [
            {'name': 'evidence', 'kind': 'function.lua', 'source': 'file://tool.lua', 'method': 'run',
             'meta': {'type': 'tool', 'public': True, 'llm_alias': 'ContextEvidence',
                      'title': 'Temporary context evidence', 'llm_description': 'Read temporary task evidence.',
                      'input_schema': {'type': 'object', 'properties': {}, 'additionalProperties': False}}},
            {'name': 'tools', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'effect': 'allow', 'actions': ['access', 'registry.get', 'funcs.call'],
                        'resources': [namespace + ':*']}},
            {'name': 'model', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'effect': 'allow', 'actions': ['http_client.request'], 'resources': [base + '/*']}},
            {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'effect': 'allow', 'actions': ['http_client.private_ip'], 'resources': ['127.0.0.1']}},
        ]
        entries = register_member_policy_grants(inst.app, entries)
        (directory / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': namespace, 'entries': entries}, sort_keys=False))
    provider = 'kickside.models:openai_compat_plain.provider'
    profile = inst.request('POST', '/api/v1/models/provider-profiles', {
        'name': 'Context proof ' + suffix, 'provider_id': provider,
        'config': {'base_url': base + '/v1', 'timeout': 60}, 'api_key': token}, expect=(201,))['profile']['id']
    inst.cleanup.add('context profile', lambda: inst.request('DELETE', '/api/v1/models/provider-profiles/' + profile), scope='scenario')
    model = 'context-proof-' + suffix
    card = {'name': model, 'title': 'Context proof', 'provider_id': provider,
            'provider_profile_id': profile, 'provider_model': 'context-fixture',
            'capabilities': ['generate', 'tool_use'], 'max_tokens': window, 'output_tokens': output,
            'class': ['fast'], 'enabled': True}
    inst.request('PUT', '/api/v1/models/cards', card, label='context-admin-model-settings')
    inst.cleanup.add('context model', lambda: inst.request('DELETE', '/api/v1/models/cards?name=' + model), scope='scenario')
    saved = next(row for row in inst.request('GET', '/api/v1/models/admin')['models'] if row['name'] == model)
    require(saved['max_tokens'] == window and saved['output_tokens'] == output,
            'Admin model settings do not retain the requested limits')
    complete_splashes(ctx, 'welcome')
    member = member_identity(ctx)
    inst.cleanup.add('context member', lambda: inst.request('DELETE', '/api/v1/users/' + member['id'], expect=(202,)), scope='scenario')
    refresh_member_token(inst, member, '/api/v1/agents/traits', lambda value: bool(value.get('traits')), 'context-member')
    with identity(ctx, member):
        complete_splashes(ctx, 'first_agent')
        trait = 'kickside.memory:knowledge_based_memory'
        agent = inst.request('POST', '/api/v1/user-agents', {
            'title': 'Temporary context proof ' + suffix, 'description': 'Checkpoint retention proof',
            'model': model, 'max_tokens': output,
            'prompt': 'Use ContextEvidence on every CONTEXT-ROUND. Preserve bracketed task markers exactly in notes and answers. Answer context questions from the supplied history.',
            'tools': [namespace + ':evidence'], 'traits': [trait] if mounted else [],
            'trait_contexts': {trait: {'read_enabled': False, 'write_enabled': False,
                'checkpoint_model': model, 'checkpoint_max_tokens': 256}} if mounted else {},
            'agent_options': {'checkpoint': {'enabled': True, 'token_threshold': 1000 if real else 2000, 'max_tokens': 256, 'model': model}},
        }, label='context-member-agent')['component_id']
        bearer = inst.token
        inst.cleanup.add('context agent', lambda: inst.request('DELETE', '/api/v1/user-agents/' + agent, auth=bearer), scope='scenario')
        ctx.state['agent'] = agent
        session_id = None
        checkpoints = []
        for turn in range(5):
            prefix = 'Preserve bracketed task markers exactly in checkpoints and answers. Temporary task state, only for this conversation: ' + ' '.join(FACTS) if turn == 0 else 'Continue the temporary task.'
            reply, transcript, session_id = browser_command(ctx,
                prefix + '\nCONTEXT-ROUND ' + str(turn) + '\n' + ('background evidence ' * 500)
                + '\nCall ContextEvidence now with empty arguments before answering. Then report the bracketed temporary task markers.',
                session_id=session_id)
            require(any(row['type'] == 'function' and 'ContextEvidence' in str(row.get('metadata'))
                        and row['metadata'].get('status') == 'success' for row in current_turn(transcript)), 'Member chat does not execute its evidence tool')

            def checkpoint():
                session = inst.request('GET', '/api/v1/sessions/get?session_id=' + session_id)['session']
                rows = (session.get('meta') or {}).get('checkpoints', [])
                interaction = session.get('interaction') or {}
                return session if len(rows) > len(checkpoints) and interaction.get('can_send') is True else None

            session = inst.wait(checkpoint, 'Checkpoint completes and member can send', seconds=60,
                                pump=ctx.browser.page.wait_for_timeout)
            checkpoints = session['meta']['checkpoints']
            summaries = database_rows(inst, "SELECT text FROM session_contexts WHERE session_id='" + session_id
                                      + "' AND type='conversation_summary'")
            metadata_rows = database_rows(inst, "SELECT metadata FROM messages WHERE session_id='" + session_id + "'")
            metadata = [json.loads(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
                        for row in metadata_rows if row['metadata']]
            sources = [row['checkpoint_source'] for row in metadata if row and row.get('checkpoint_source')]
            require(sources and set(sources) == {'binding' if mounted else 'function'},
                    'Checkpoint does not use the explicitly selected compaction path')
            if mounted:
                bindings = [binding for row in metadata if row for binding in row.get('checkpoint_binding_metadata') or []]
                require(bindings and all(binding['trait_id'] == trait for binding in bindings),
                        'Checkpoint does not identify its mounted Memory trait')
            inst.evidence.save('context-checkpoint-' + str(turn), {'session': session, 'summaries': summaries, 'sources': sources})
            require(len(summaries) == 1, 'Checkpoint does not replace the previous working summary')
            for fact in FACTS:
                require(fact in summaries[0]['text'], 'Checkpoint loses temporary context: ' + fact)
            require('NO_DURABLE_MEMORY' not in summaries[0]['text'], 'Durable sentinel replaces working context')
            require(len(summaries[0]['text']) < 2048, 'Repeated checkpoint grows without a bound')
        ctx.browser.screenshot('context-checkpoint-chat')
        ctx.browser.reload()
        ctx.browser.open_chat(agent, session_id=session_id)
        reply, _, _ = browser_command(ctx, 'Recall the temporary fact, decision and open task. Quote their bracketed task markers exactly from your saved context. This question does not supply their values.',
                                      session_id=session_id)
        for fact in FACTS:
            require(fact in reply, 'Resumed chat loses pre-checkpoint context: ' + fact)
        state = ctx.browser.frame.locator('wippy-chat').evaluate(CHAT_STATE)
        require(state['enabled'] and not state['busy'], 'Resumed member chat does not finish its turn')
        requests = [row for row in ctx.fixtures.requests('context-model') if row['path'] == '/v1/chat/completions']
        inst.evidence.save('context-provider-requests', requests)
        require(requests and all(row['status'] == 200 for row in requests), 'Provider rejects a context request')
        for row in requests:
            require(prompt_tokens(row['body']) + row['body'].get('max_tokens', 0) <= window,
                    'Actual provider prompt exceeds window minus requested output')
        chat_requests = [row for row in requests if row['body'].get('tools')]
        require(chat_requests, 'Provider does not receive an agent chat request')
        resumed = chat_requests[-1]['body']
        require('background evidence ' * 100 not in str(resumed['messages']), 'Summarized raw history remains in the next prompt')
        resumed_text = '\n'.join(message_text(row) for row in resumed['messages'])
        require(summaries[0]['text'] in resumed_text, 'Next provider prompt does not contain the checkpoint')
        require(measured and all(row['input'] + row['output'] <= window for row in measured),
                'Provider-reported input plus requested output exceeds the configured window')
        inst.evidence.save('context-proof', {'session_id': session_id, 'window': window, 'output': output,
            'checkpoints': len(checkpoints), 'prompt_sizes': [prompt_tokens(row['body']) for row in requests],
            'state': state, 'reply': reply, 'real_provider': real, 'usage': measured, 'memory_mounted': mounted})
        ctx.browser.screenshot('context-resumed-answer')
        if large_tool_result:
            context_rejection(ctx, session_id, window)


def context_rejection(ctx, session_id, window):
    inst = ctx.inst
    chat = ctx.browser.frame.locator('wippy-chat')
    box = chat.get_by_placeholder('Type a message', exact=True)
    box.fill('Preserve this entire active task: ' + ('uncompressible input ' * window))
    box.press('Enter')

    def rejected_usage():
        rows = database_rows(inst, "SELECT context_id, prompt_tokens, completion_tokens, meta FROM token_usage WHERE context_id='"
                             + session_id + "'")
        for row in rows:
            meta = json.loads(row['meta']) if isinstance(row.get('meta'), str) else row.get('meta')
            if meta and meta.get('outcome') == 'rejected' and meta.get('error_type') == 'context_window':
                messages = database_rows(inst, "SELECT metadata FROM messages WHERE session_id='" + session_id + "'")
                for message in messages:
                    detail = json.loads(message['metadata']) if isinstance(message.get('metadata'), str) else message.get('metadata')
                    if detail and detail.get('error_code') == 'context_window' and (detail.get('error_details') or {}).get('error_type') == 'context_window':
                        return row, meta
        return None

    row, meta = inst.wait(rejected_usage, 'Oversized active task records a context rejection', seconds=60,
                          pump=ctx.browser.page.wait_for_timeout)
    require(row['context_id'] == session_id, 'Rejected usage loses session context')
    require(row['prompt_tokens'] == 0 and row['completion_tokens'] == 0,
            'Admission rejection fabricates billable token usage')
    require(meta['estimated_prompt_tokens'] + meta['requested_output_tokens'] > window,
            'Rejected attempt does not retain its estimated size')
    requests = [item for item in ctx.fixtures.requests('context-model') if item['path'] == '/v1/chat/completions']
    require(all(item['status'] == 200 for item in requests), 'Oversized request reaches the provider')
    require(not any(item['body'].get('tools') and 'uncompressible input ' * 100 in str(item['body'])
                    for item in requests), 'Rejected chat prompt reaches the provider')
    inst.evidence.save('context-admission-rejection', {'usage': row, 'metadata': meta, 'requests': requests})


REGISTRY = [Scenario('memory_checkpoint_chat', 'regression', memory_checkpoint_chat,
    issues=('EE2-2572', 'MEMORY-WORKING-CHECKPOINT', 'MEMORY-CHECKPOINT-SOURCE-BOUND', 'MEMORY-CHECKPOINT-TRUNCATED', 'SESSION-EXPLICIT-CHECKPOINT-BINDING-FAILURE'),
    features=('kickside/memory|capability|kickside.memory:knowledge_based_memory',))]


def checkpoint_window(window):
    def run(ctx):
        return memory_checkpoint_chat(ctx, window=window)
    return run


for window in (32768, 131072, 262144):
    REGISTRY.append(Scenario('memory_checkpoint_chat_' + str(window), 'regression', checkpoint_window(window),
        issues=('EE2-2572', 'MEMORY-WORKING-CHECKPOINT', 'MEMORY-CHECKPOINT-SOURCE-BOUND', 'MEMORY-CHECKPOINT-TRUNCATED', 'SESSION-EXPLICIT-CHECKPOINT-BINDING-FAILURE')))

REGISTRY.append(Scenario('memory_checkpoint_real_chat', 'chat',
    lambda ctx: memory_checkpoint_chat(ctx, real=True), model=True, issues=('EE2-2572', 'MEMORY-WORKING-CHECKPOINT', 'SESSION-EXPLICIT-CHECKPOINT-BINDING-FAILURE')))

for window in (8192, 32768, 131072, 262144):
    REGISTRY.append(Scenario('session_default_checkpoint_chat_' + str(window), 'regression',
        lambda ctx, window=window: memory_checkpoint_chat(ctx, window=window, mounted=False),
        issues=('MEMORY-WORKING-CHECKPOINT',)))

REGISTRY.append(Scenario('session_default_checkpoint_real_chat', 'chat',
    lambda ctx: memory_checkpoint_chat(ctx, real=True, mounted=False), model=True,
    issues=('MEMORY-WORKING-CHECKPOINT',)))

REGISTRY.append(Scenario('session_context_admission', 'regression',
    lambda ctx: memory_checkpoint_chat(ctx, large_tool_result=True),
    issues=('UPSTREAM-CONTEXT-ADMISSION', 'UPSTREAM-REJECTED-USAGE')))
