"""Provider failures and malformed tool calls retain their cause through workflows."""
from contextlib import contextmanager
import json
import uuid

import yaml

from harness import Scenario, require
from mocks.chat_completion import completion_response
from runtime_fixtures import isolated_fixture
from scenarios_automation import dispatch_workflow, replace_workflow_block
from scenarios_hot_update_work import database_rows


@contextmanager
def model_fixture(ctx, response, *, models=None, provider='kickside.models:openai_compat_plain.provider'):
    inst = ctx.inst
    token = uuid.uuid4().hex
    inst.redactor.add(token)
    base = ctx.fixtures.start('openai-tools', tool_names=[], token=token, models=models, response=response)
    try:
        with ctx.paused():
            directory = inst.app / 'src' / ('model-diagnostics-' + uuid.uuid4().hex[:10])
            directory.mkdir()
            entries = [
                {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
                 'policy': {'effect': 'allow', 'actions': ['http_client.request'], 'resources': [base + '/*']}},
                {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
                 'policy': {'effect': 'allow', 'actions': ['http_client.private_ip'], 'resources': ['127.0.0.1']}},
            ]
            (directory / '_index.yaml').write_text(yaml.safe_dump(
                {'version': '1.0', 'namespace': 'app.smoke.model_' + uuid.uuid4().hex[:10], 'entries': entries}))
        profile = inst.request('POST', '/api/v1/models/provider-profiles', {
            'name': 'Model diagnostic fixture', 'provider_id': provider,
            'config': {'base_url': base + '/v1', 'timeout': 60}, 'api_key': token}, expect=(201,))['profile']['id']
        model = 'model-diagnostic-' + uuid.uuid4().hex[:12]
        inst.request('PUT', '/api/v1/models/cards', {
            'name': model, 'title': 'Model diagnostic fixture', 'provider_id': provider,
            'provider_profile_id': profile, 'provider_model': 'diagnostic-model',
            'capabilities': ['generate', 'tool_use'], 'max_tokens': 32768, 'output_tokens': 512, 'enabled': True})
        yield model, profile
    finally:
        inst.evidence.save('model-diagnostic-requests', ctx.fixtures.requests('openai-tools'))
        ctx.fixtures.stop('openai-tools')


def agent_workflow(ctx, model, *, temperature=None, title='Provider diagnostic workflow', run=True):
    ctx.inst.install('kickside/agents')
    wid, _ = dispatch_workflow(ctx, title)
    config = {'name': 'Provider diagnostic agent', 'model': model, 'tool_calling': 'auto',
              'instructions': 'Call finish with the complete answer object.',
              'exit_schema': {'type': 'object', 'required': ['answer'],
                              'properties': {'answer': {'type': 'string'}}, 'additionalProperties': False}}
    if temperature is not None:
        agent = ctx.inst.request('POST', '/api/v1/user-agents', {
            'title': 'Temperature-bearing diagnostic agent', 'model': model,
            'prompt': config['instructions'], 'temperature': temperature, 'max_tokens': 512})['component_id']
        config.pop('instructions')
        config.pop('model')
        config['agent_id'] = 'user_agent:' + agent
    replace_workflow_block(ctx.inst, wid, 'receipt', 'kickside.agents:block.agent',
                           title='Provider diagnostic agent', config=config,
                           port_map={'error': 'failed'}, transforms={'result': '', 'error': ''})
    version = ctx.inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {},
                               label='diagnostic-publish')['version']
    ctx.state['last_diagnostic_workflow'] = {'workflow_id': wid, 'title': title, 'version': version}
    if not run:
        return None
    rid = ctx.inst.request('POST', '/api/v1/workflows/' + wid + '/run',
                           {'version': version, 'input': {'task': 'Return the complete answer.'}},
                           label='diagnostic-run')['run_id']
    base = '/api/v1/workflows/' + wid + '/runs/' + rid

    def terminal():
        detail = ctx.inst.request('GET', base, label='diagnostic-run-status')
        return detail if detail['run']['status'] in ('completed', 'failed') else None

    done = ctx.inst.wait(terminal, 'Provider diagnostic workflow reaches a terminal result', seconds=90)
    # Browser guards reopen this exact durable Workflow after the provider fixture
    # settles; retaining the local identifiers avoids a title/query approximation.
    ctx.state['last_diagnostic_workflow']['run_id'] = rid
    return done


def finish_response(body, arguments, call_id):
    offered = [row.get('function', {}).get('name') for row in body.get('tools', [])]
    if 'finish' not in offered:
        raise ValueError('Agent does not offer its declared finish tool')
    return completion_response(body, {'role': 'assistant', 'content': None, 'tool_calls': [
        {'id': call_id, 'type': 'function', 'function': {'name': 'finish', 'arguments': arguments}}]},
        'tool_calls', {'prompt_tokens': 100, 'completion_tokens': 10, 'total_tokens': 110})


def tool_arguments(ctx, *, malformed):
    first = '{"answer":' if malformed else '{}'
    count = 0

    def response(body):
        nonlocal count
        count += 1
        if count > 2:
            raise ValueError('Agent repeats a corrected finish call')
        return finish_response(body, first if count == 1 else '{"answer":"corrected"}',
                               'malformed-call' if count == 1 else 'corrected-call')

    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response) as (model, _):
            done = agent_workflow(fixture, model)
            require(done['run']['status'] == 'completed' and done['run']['output'] == {'result': {'answer': 'corrected'}},
                    'Corrected tool call does not complete the workflow: ' + str(done))
            flow = done['run']['dataflow_id']
            content = "convert_from(content, 'UTF8')" if fixture.inst.engine == 'postgres' else 'CAST(content AS TEXT)'
            rows = database_rows(fixture.inst, 'SELECT type, ' + content + " AS content FROM dataflow_data WHERE dataflow_id='"
                                 + flow + "' AND type IN ('agent.action', 'agent.observation') ORDER BY created_at, data_id")
            for row in rows:
                if row['type'] == 'agent.action':
                    row['content'] = json.loads(row['content'])
            requests = [row for row in fixture.fixtures.requests('openai-tools') if row['path'] == '/v1/chat/completions']
            fixture.inst.evidence.save('tool-argument-diagnostics', {'malformed': malformed, 'rows': rows,
                                                                   'requests': requests, 'run': done})
            calls = [call for row in rows if row['type'] == 'agent.action'
                     for call in row['content'].get('tool_calls', []) if call['id'] == 'malformed-call']
            require(len(calls) == 1 and len(requests) == 2, 'Tool argument fixture does not produce exactly one correction')
            feedback = [message for message in requests[1]['body']['messages']
                        if message.get('role') == 'tool' and message.get('tool_call_id') == 'malformed-call']
            require(len(feedback) == 1, 'The rejected tool call has no unique model observation')
            text = str(feedback[0]['content'])
            if malformed:
                require(calls[0].get('raw_arguments') == first and calls[0].get('arguments_error'),
                        'Stored action loses the original malformed arguments and decoder error: ' + str(calls))
                require('json' in text.lower() and 'missing required fields' not in text.lower(),
                        'Agent tells the model a schema error instead of its JSON parse failure: ' + text)
            else:
                require(not calls[0].get('arguments_error') and not calls[0].get('raw_arguments'),
                        'Valid empty arguments are incorrectly classified as a parse failure')
                require('missing required fields' in text.lower() and 'answer' in text.lower(),
                        'Valid empty arguments lose their required-field diagnostic: ' + text)


def has_error_type(value, expected):
    if isinstance(value, dict):
        return value.get('error_type') == expected or any(has_error_type(item, expected) for item in value.values())
    if isinstance(value, list):
        return any(has_error_type(item, expected) for item in value)
    if isinstance(value, str) and value.startswith('{'):
        return has_error_type(json.loads(value), expected)
    return False


def provider_error(ctx, status, code, expected):
    def response(body):
        return status, {}, {'error': {'type': 'rate_limit_error' if status == 429 else 'billing_error',
                                     'code': code, 'message': 'Synthetic provider rejection: ' + code}}

    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response) as (model, _):
            done = agent_workflow(fixture, model)
            requests = [row for row in fixture.fixtures.requests('openai-tools') if row['path'] == '/v1/chat/completions']
            fixture.inst.evidence.save('provider-error-cause', {'expected': expected, 'requests': requests, 'run': done})
            require(requests and all(row['status'] == status for row in requests), 'Provider rejection is not exercised')
            require(done['run']['status'] == 'failed' or done.get('error_routed') is True,
                    'Provider rejection is reported as an ordinary successful workflow')
            require(has_error_type(done, expected),
                    'Workflow caller loses the machine-readable provider error cause: ' + str(done))


def unconfigured_class(ctx):
    with isolated_fixture(ctx) as fixture:
        done = agent_workflow(fixture, 'class:unconfigured-' + uuid.uuid4().hex[:10])
        fixture.inst.evidence.save('unconfigured-model-cause', done)
        require(done['run']['status'] == 'failed' or done.get('error_routed') is True,
                'Unconfigured class is reported as an ordinary successful workflow')
        require(has_error_type(done, 'model_error'),
                'Workflow caller loses the machine-readable missing-model cause: ' + str(done))


REGISTRY = [
    Scenario('workflow_unconfigured_model_cause', 'regression', unconfigured_class,
             issues=('UPSTREAM-PROVIDER-ERROR-CAUSE',), features=(
                 'kickside/agents|workflow_block|kickside.agents:block.agent',)),
    Scenario('workflow_malformed_tool_arguments', 'regression', lambda ctx: tool_arguments(ctx, malformed=True),
             issues=('UPSTREAM-TOOL-ARGUMENT-DIAGNOSTIC',), features=(
                 'kickside/agents|workflow_block|kickside.agents:block.agent',
                 'kickside/workflows|http|POST /api/v1/workflows/{id}/run',)),
    Scenario('workflow_valid_empty_tool_arguments', 'regression', lambda ctx: tool_arguments(ctx, malformed=False),
             features=('kickside/agents|workflow_block|kickside.agents:block.agent',)),
]

for name, status, code, expected in (
    ('payment', 402, 'insufficient_quota', 'payment_required'),
    ('quota', 429, 'insufficient_quota', 'payment_required'),
    ('rate_limit', 429, 'rate_limit_exceeded', 'rate_limit_exceeded'),
):
    REGISTRY.append(Scenario('workflow_provider_' + name + '_cause', 'regression',
        lambda ctx, status=status, code=code, expected=expected: provider_error(ctx, status, code, expected),
        issues=('UPSTREAM-PROVIDER-ERROR-CAUSE',), features=(
            'kickside/agents|workflow_block|kickside.agents:block.agent',
            'kickside/workflows|http|GET /api/v1/workflows/{id}/runs/{run_id}',)))
