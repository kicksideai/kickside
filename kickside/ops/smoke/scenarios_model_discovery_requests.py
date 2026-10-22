"""First-party discovery drives generation requests and excludes other operations."""
import json
import uuid

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios_llm_diagnostics import model_fixture, agent_workflow


MODELS = ['gpt-6-luna', 'gpt-6-sol', 'gpt-6.1-sol', 'gpt-6-astra',
          'gpt-image-1', 'tts-1', 'whisper-1', 'sora-2', 'omni-moderation-latest', 'davinci-002']


def model_rows():
    return [{'id': name, 'object': 'model', 'context_length': 32768, 'max_output_tokens': 512} for name in MODELS]


def response(body):
    if body.get('temperature') is not None:
        return 400, {}, {'error': {'type': 'invalid_request_error', 'param': 'temperature',
                                  'message': 'Unsupported parameter: temperature is not supported with this model.'}}
    return 200, {}, {'id': 'response-' + uuid.uuid4().hex, 'object': 'response', 'status': 'completed',
        'model': body['model'], 'output': [{'type': 'function_call', 'call_id': 'finish-' + uuid.uuid4().hex,
            'name': 'finish', 'arguments': '{"answer":"sampling omitted"}', 'status': 'completed'}],
        'usage': {'input_tokens': 100, 'output_tokens': 10, 'total_tokens': 110}}


def reasoning_request(ctx):
    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response, models=model_rows(), provider='wippy.llm.openai:provider') as (_, profile):
            result = fixture.inst.request('POST', '/api/v1/models/provider-profiles/' + profile + '/discover', {},
                                          label='first-party-discovery')
            cards = [row for row in result['models'] if row['provider_model'] == 'gpt-6-luna']
            require(len(cards) == 1, 'Discovery omits the configured first-party generation model')
            card = cards[0]
            done = agent_workflow(fixture, card['name'], temperature=.2)
            requests = [row for row in fixture.fixtures.requests('openai-tools') if row['path'] == '/v1/responses']
            fixture.inst.evidence.save('discovered-model-request', {'card': card, 'run': done, 'requests': requests})
            require(requests, 'The discovered card does not reach the first-party provider')
            require(all('temperature' not in row['body'] and row['status'] == 200 for row in requests),
                    'Discovered reasoning route forwards unsupported sampling: ' + str(requests))
            require(done['run']['status'] == 'completed' and done['run']['output'] == {'result': {'answer': 'sampling omitted'}},
                    'Temperature-bearing agent fails on its discovered reasoning model: ' + str(done))
            for card in result['models']:
                if card['provider_model'] in MODELS[:4]:
                    require('reasoning' in card['capabilities'] and card['options'].get('reasoning_model_request') is True,
                            'Discovered generation card loses its reasoning contract: ' + str(card))


def generation_operations(ctx):
    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response, models=model_rows(), provider='wippy.llm.openai:provider') as (_, profile):
            result = fixture.inst.request('POST', '/api/v1/models/provider-profiles/' + profile + '/discover', {},
                                          label='operation-discovery')
            listed = fixture.inst.request('GET', '/api/v1/models/list?capability=generate',
                                          label='generation-operation-list')
            fixture.inst.evidence.save('discovered-operation-cards', {'discovery': result, 'generation': listed})
            cards = {row['provider_model']: row for row in result['models']}
            require(set(cards) == set(MODELS), 'Discovery does not retain all provider model identities')
            for name in MODELS[4:]:
                require('generate' not in cards[name]['capabilities'],
                        'Discovery advertises an incompatible generation operation: ' + name)
                require(cards[name]['name'] not in json.dumps(listed),
                        'Generation API lists an incompatible discovered operation: ' + name)
            require(all(cards[name]['name'] in json.dumps(listed) for name in MODELS[:4]),
                    'Filtering unsupported operations removes valid generation cards')


REGISTRY = [
    Scenario('model_discovery_reasoning_request', 'regression', reasoning_request,
             issues=('MODELS-REASONING-GENERATIONS',), features=(
                 'kickside/models|http|POST /api/v1/models/provider-profiles/{id}/discover',
                 'kickside/agents|workflow_block|kickside.agents:block.agent',)),
    Scenario('model_discovery_generation_operations', 'regression', generation_operations,
             issues=('MODELS-GENERATION-CAPABILITIES',), features=(
                 'kickside/models|http|POST /api/v1/models/provider-profiles/{id}/discover',
                 'kickside/models|http|GET /api/v1/models/list',)),
]
