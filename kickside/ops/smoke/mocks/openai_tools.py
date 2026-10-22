"""Deterministic external Chat Completions tool turn for native agent tests."""
import json
import uuid
from .fixture import Fixture
from .chat_completion import completion_response
from .context_model import prompt_tokens


class OpenAITools(Fixture):
    name = 'openai-tools'

    def __init__(self, base, base_path='', *, tool_names, token, before_tool_response=None,
                 tool_calls=None, tool_call_plans=None, final_content='Completed tool turn',
                 models=None, response=None):
        super().__init__(base, base_path)
        self.tool_names = list(tool_names)
        self.token = token
        self.models = models if models is not None else [{'id': 'tool-fixture', 'object': 'model'}]
        self.response = response
        self.before_tool_response = before_tool_response
        self.tool_calls = [
            {'name': call['name'], 'arguments': dict(call.get('arguments') or {})}
            for call in (tool_calls or ({'name': name} for name in self.tool_names))
        ]
        self.tool_call_plans = {
            model: [{'name': call['name'], 'arguments': dict(call.get('arguments') or {})} for call in calls]
            for model, calls in (tool_call_plans or {}).items()
        }
        for plan in [self.tool_calls, *self.tool_call_plans.values()]:
            if any(call['name'] not in self.tool_names for call in plan):
                raise ValueError('tool call plan names an undeclared fixture tool')
        self.final_content = final_content

    def dispatch(self, method, path, query, body, headers):
        if headers.get('Authorization') != 'Bearer ' + self.token:
            return 401, {}, {'error': {'message': 'Fixture bearer is required'}}
        if method == 'GET' and path == '/v1/models':
            return 200, {}, {'object': 'list', 'data': self.models}
        if method != 'POST' or path not in ('/v1/chat/completions', '/v1/responses'):
            return 404, {}, {'error': {'message': 'Unknown model fixture route'}}
        messages = body.get('messages') if path == '/v1/chat/completions' else body.get('input')
        if not isinstance(messages, list) or not messages:
            return 400, {}, {'error': {'message': 'Messages are required'}}
        if self.response is not None:
            return self.response(body)
        message = {'role': 'assistant', 'content': self.final_content}
        finish = 'stop'
        last_user = max((index for index, row in enumerate(messages) if row.get('role') == 'user'), default=-1)
        last_tool = max((index for index, row in enumerate(messages) if row.get('role') == 'tool'), default=-1)
        tool_calls = self.tool_call_plans.get(body.get('model'), self.tool_calls)
        if last_tool <= last_user and tool_calls:
            offered = [row.get('function', {}).get('name') for row in body.get('tools', [])]
            if all(call['name'] in offered for call in tool_calls):
                if self.before_tool_response is not None:
                    self.before_tool_response()
                message = {'role': 'assistant', 'content': None, 'tool_calls': [{
                    'id': 'effect-' + uuid.uuid4().hex, 'type': 'function',
                    'function': {'name': call['name'], 'arguments': json.dumps(call['arguments'])}}
                    for call in tool_calls]}
                finish = 'tool_calls'
        if finish == 'stop' and callable(self.final_content):
            message['content'] = self.final_content(body)
        size = prompt_tokens(body)
        return completion_response(body, message, finish,
            {'prompt_tokens': size, 'completion_tokens': 1, 'total_tokens': size + 1})
