"""Chat provider with prompt accounting and no memory outside the request."""
import json
import math
import re
import time
import uuid
import urllib.error
import urllib.request

from .fixture import Fixture
from .chat_completion import completion_response, completion_usage, stream_chunks


def message_text(message):
    content = message.get('content') or ''
    if isinstance(content, list):
        return '\n'.join(part.get('text', '') for part in content if isinstance(part, dict))
    return str(content)


def prompt_tokens(body):
    encoded = json.dumps({key: body[key] for key in ('messages', 'tools') if key in body}, ensure_ascii=False)
    return math.ceil(len(encoded.encode()) / 4) + 16 * len(body.get('messages', []))


class ContextModel(Fixture):
    name = 'context-model'

    def __init__(self, base, base_path='', *, token, window, forward=None, observe=None):
        super().__init__(base, base_path)
        self.token, self.window = token, window
        self.forward, self.observe = forward, observe

    def dispatch(self, method, path, query, body, headers):
        if headers.get('Authorization') != 'Bearer ' + self.token:
            return 401, {}, {'error': {'message': 'Fixture bearer is required'}}
        if method == 'GET' and path == '/v1/models':
            return 200, {}, {'object': 'list', 'data': [{'id': 'context-fixture', 'object': 'model'}]}
        if method != 'POST' or path != '/v1/chat/completions':
            return 404, {}, {'error': {'message': 'Unknown context fixture route'}}
        messages = body.get('messages')
        if not isinstance(messages, list) or not messages:
            return 400, {}, {'error': {'message': 'Messages are required'}}
        size, output = prompt_tokens(body), body.get('max_tokens', 0)
        if size + output > self.window:
            return 400, {}, {'error': {'type': 'invalid_request_error', 'code': 'context_length_exceeded',
                'message': f'maximum context length is {self.window} tokens; {output} output tokens and your prompt contains at least {size} input tokens'}}
        if self.forward:
            outgoing = dict(body, model=self.forward['llm'])
            if outgoing.get('stream'):
                outgoing['stream_options'] = {'include_usage': True}
            request = urllib.request.Request(self.forward['base'].rstrip('/') + '/chat/completions',
                data=json.dumps(outgoing).encode(), headers={'Authorization': 'Bearer ' + self.forward['key'],
                'Content-Type': 'application/json'})
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    raw = response.read().decode()
                    content_type = response.headers.get('Content-Type', 'application/json')
            except urllib.error.HTTPError as error:
                return error.code, {}, json.loads(error.read())
            if 'text/event-stream' in content_type:
                usage = completion_usage(raw)
                result = raw
            else:
                result = json.loads(raw)
                usage = result.get('usage')
            if not usage or not usage.get('prompt_tokens'):
                raise ValueError('Real provider does not report prompt usage')
            if self.observe:
                chunks=stream_chunks(result) if isinstance(result,str) else [result]
                finishes=[choice['finish_reason'] for chunk in chunks for choice in chunk.get('choices',[])
                          if choice.get('finish_reason') is not None]
                self.observe({'input': usage['prompt_tokens'], 'output': output,
                              'usage': usage, 'window': self.window, 'estimate': size,
                              'finish_reasons':finishes,'generated':usage.get('completion_tokens')})
            return 200, {'Content-Type': content_type}, result
        text = '\n'.join(message_text(row) for row in messages)
        system = '\n'.join(message_text(row) for row in messages if row.get('role') == 'system')
        markers = list(dict.fromkeys(re.findall(r'\[(?:FACT|DECISION|OPEN|TOOL):[\w-]+\]', text)))
        last_user = max((i for i, row in enumerate(messages) if row.get('role') == 'user'), default=-1)
        last_tool = max((i for i, row in enumerate(messages) if row.get('role') == 'tool'), default=-1)
        latest = message_text(messages[last_user]) if last_user >= 0 else ''
        finish = 'stop'
        if 'You write durable long-term' in system:
            message = {'role': 'assistant', 'content': 'NO_DURABLE_MEMORY'}
        elif 'working session checkpoint' in system or 'Store relevant details for future conversations.' in system:
            message = {'role': 'assistant', 'content': 'Working state: ' + ' '.join(markers)}
        elif 'CONTEXT-ROUND' in latest and body.get('tools') and last_tool <= last_user:
            offered = {row.get('function', {}).get('name') for row in body.get('tools', [])}
            if 'ContextEvidence' not in offered:
                return 400, {}, {'error': {'message': 'ContextEvidence is not offered'}}
            message = {'role': 'assistant', 'content': None, 'tool_calls': [{
                'id': 'context-' + uuid.uuid4().hex, 'type': 'function',
                'function': {'name': 'ContextEvidence', 'arguments': '{}'}}]}
            finish = 'tool_calls'
        else:
            message = {'role': 'assistant', 'content': 'Context answer: ' + ' '.join(markers)}
        if body.get('tools'):
            # Keep the response pending while the browser observes the running turn.
            time.sleep(1)
        usage = {'prompt_tokens': size, 'completion_tokens': 32, 'total_tokens': size + 32}
        if self.observe:
            self.observe({'input': size, 'output': output, 'usage': usage, 'window': self.window})
        return completion_response(body, message, finish, usage)
