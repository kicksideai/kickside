"""Product WebSocket chat transport with durable transcript evidence."""
import json
import time
from urllib.parse import urlencode, urlsplit, urlunsplit
import uuid

from harness import require
from scenarios_ai import messages


def await_relay_welcome(socket, events, *, seconds=35):
    """Wait for relay admission before issuing a session command."""
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        event = json.loads(socket.recv(timeout=max(0.001, deadline - time.monotonic())))
        events.append(event)
        require(event.get('topic') != 'error', 'Relay connection fails: ' + str(event.get('data') or event))
        if event.get('topic') == 'welcome':
            return
    require(False, 'Relay does not acknowledge the WebSocket connection within ' + str(seconds) + ' seconds')


def receive_turn(socket, session_id, events, *, seconds=180):
    deadline = time.monotonic() + seconds
    reply = ''
    while time.monotonic() < deadline:
        event = json.loads(socket.recv(timeout=max(0.001, deadline - time.monotonic())))
        events.append(event)
        data = event.get('data') or {}
        if data.get('session_id') != session_id:
            continue
        require(data.get('type') != 'error', 'Chat stream error: ' + str(data.get('error') or data))
        require(data.get('type') != 'invalidate', 'Chat response is invalidated: ' + str(data.get('reason') or data))
        if data.get('type') == 'content' and not data.get('using_tools'):
            reply = data.get('content') or ''
        if data.get('type') == 'update' and data.get('status') == 'idle' and reply:
            return reply
    require(False, 'Chat does not complete within ' + str(seconds) + ' seconds')


def current_turn(transcript):
    start = max((index for index, row in enumerate(transcript) if row['type'] == 'user'), default=-1)
    return transcript[start + 1:]


def reply_if_completed(transcript):
    last = next((row for row in reversed(current_turn(transcript))
                 if row['type'] in ('assistant', 'function')), None)
    if last is not None and last['type'] == 'assistant':
        reply = last.get('data')
        if isinstance(reply, str) and reply.strip():
            return reply
    return None


def completed_reply(transcript):
    reply = reply_if_completed(transcript)
    require(reply, 'Current turn has no completed assistant reply')
    return reply


def assert_persisted_reply(events, session_id, transcript):
    final = next((event for event in reversed(events)
                  if (event.get('data') or {}).get('session_id') == session_id
                  and event['data'].get('type') == 'content'
                  and not event['data'].get('using_tools')), None)
    require(final, 'Completed reply has no final content event')
    chunks = [event['data'].get('content') or '' for event in events
              if event.get('topic') == final.get('topic')
              and (event.get('data') or {}).get('type') == 'chunk']
    streamed = ''.join(chunks)
    require(chunks and streamed, 'Completed reply has no streamed text')
    require(final['data'].get('content') == streamed, 'Final assistant content differs from streamed text')
    require(completed_reply(transcript) == streamed, 'The persisted assistant message differs from streamed text')
    return streamed


def message_payload(session_id, prompt, uploads=()):
    return {'type': 'session_message', 'session_id': session_id,
            'message_id': str(uuid.uuid4()), 'data': {'text': prompt, 'file_uuids': list(uploads)}}


def api_command(ctx, prompt, agent_id=None, *, session_id=None, uploads=()):
    from websockets.sync.client import connect

    inst = ctx.inst
    agent_id = agent_id or ctx.state['agent']
    opening = {'type': 'session_open', 'request_id': str(uuid.uuid4())}
    if session_id:
        opening['session_id'] = session_id
    else:
        agent = inst.request('GET', '/api/v1/user-agents/' + agent_id, label='command-agent')['agent']
        start = inst.request('POST', '/api/v1/sessions/start-token', {'agent': 'user_agent:' + agent_id,
                             'model': agent['model']}, label='command-start-token')['token']
        inst.redactor.add(start)
        opening['start_token'] = start
    base = urlsplit(inst.base)
    url = urlunsplit(('wss' if base.scheme == 'https' else 'ws', base.netloc, '/api/v1/ws/join',
                     urlencode({'x-auth-token': inst.token}), ''))
    events = []
    label = 'command-' + uuid.uuid4().hex
    new_session = not session_id
    reply = None
    try:
        with connect(url, open_timeout=35, close_timeout=10, max_size=4 * 1024 * 1024) as socket:
            await_relay_welcome(socket, events)
            socket.send(json.dumps(opening))
            deadline = time.monotonic() + 35
            while time.monotonic() < deadline:
                event = json.loads(socket.recv(timeout=max(0.001, deadline - time.monotonic())))
                events.append(event)
                data = event.get('data') or {}
                require(event.get('topic') != 'error', 'Session open fails: ' + str(data))
                if event.get('topic') == 'session.opened' and data.get('request_id') == opening['request_id']:
                    session_id = data['session_id']
                    break
            require(session_id, 'Session does not open within 35 seconds')
            token = inst.token
            if new_session:
                inst.cleanup.add('chat session ' + session_id, lambda: inst.request(
                    'DELETE', '/api/v1/sessions/delete?session_id=' + session_id, auth=token,
                    label='command-session-delete'), scope='scenario')
            socket.send(json.dumps(message_payload(session_id, prompt, uploads)))
            reply = receive_turn(socket, session_id, events)
        transcript = messages(ctx, session_id)
        assert_persisted_reply(events, session_id, transcript)
        return reply, transcript, session_id
    finally:
        inst.evidence.save(label + '-stream', events)
        if session_id:
            inst.evidence.save(label + '-transcript', {'prompt': prompt, 'session_id': session_id,
                'messages': messages(ctx, session_id), 'reply': reply})
