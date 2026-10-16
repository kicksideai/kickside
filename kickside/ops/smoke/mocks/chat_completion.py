"""OpenAI Chat Completions responses for deterministic provider fixtures."""
import json
import uuid


def stream_chunks(stream):
    return [json.loads(line[6:]) for line in stream.splitlines() if line.startswith('data: {')]


def completion_usage(response):
    if isinstance(response, dict):
        return response.get('usage', {})
    return next((chunk['usage'] for chunk in reversed(stream_chunks(response)) if chunk.get('usage')), {})


def completion_response(body, message, finish, usage):
    identifier = 'completion-' + uuid.uuid4().hex
    base = {'id': identifier, 'model': body.get('model')}
    if not body.get('stream'):
        return 200, {}, {**base, 'object': 'chat.completion',
            'choices': [{'index': 0, 'message': message, 'finish_reason': finish}], 'usage': usage}
    delta = dict(message)
    if 'tool_calls' in delta:
        delta['tool_calls'] = [dict(call, index=index) for index, call in enumerate(delta['tool_calls'])]
    base['object'] = 'chat.completion.chunk'
    chunks = [
        {**base, 'choices': [{'index': 0, 'delta': delta, 'finish_reason': None}]},
        {**base, 'choices': [{'index': 0, 'delta': {}, 'finish_reason': finish}]},
        {**base, 'choices': [], 'usage': usage},
    ]
    return 200, {'Content-Type': 'text/event-stream'}, ''.join(
        'data: ' + json.dumps(chunk) + '\n\n' for chunk in chunks) + 'data: [DONE]\n\n'
