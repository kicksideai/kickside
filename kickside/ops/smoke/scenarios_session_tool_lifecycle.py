"""A real chat tool completes after disconnect and settles after explicit Stop."""
import json
import time

import yaml

from browser import ASSISTANT_TEXT, CHAT_STATE
from harness import Scenario, require
from live_work_gate import work_gate
from mocks.chat_completion import completion_response
from runtime_fixtures import isolated_fixture, complete_splashes
from scenarios_ai import messages
from scenarios_hot_update_work import install_work_fixture, NS
from scenarios_llm_diagnostics import model_fixture


def active_tool(ctx, *, stop):
    from playwright.sync_api import expect

    with work_gate() as (gate, url), isolated_fixture(ctx) as fixture:
        def response(body):
            finished = any(row.get('role') == 'tool' for row in body['messages'])
            if finished:
                return completion_response(body, {'role': 'assistant', 'content': 'The held tool completes.'}, 'stop',
                    {'prompt_tokens': 100, 'completion_tokens': 10, 'total_tokens': 110})
            return completion_response(body, {'role': 'assistant', 'content': None, 'tool_calls': [{
                'id': 'held-evidence-call', 'type': 'function', 'function': {'name': 'HeldEvidence',
                    'arguments': json.dumps({'config': {'url': url, 'title': 'Held chat effect'}})}}]},
                'tool_calls', {'prompt_tokens': 100, 'completion_tokens': 10, 'total_tokens': 110})

        inst = fixture.inst
        with model_fixture(fixture, response) as (model, _):
            with fixture.paused():
                install_work_fixture(fixture, url)
                path = inst.app / 'src/hot-update-work/_index.yaml'
                document = yaml.safe_load(path.read_text())
                entry = next(row for row in document['entries'] if row['name'] == 'transform')
                entry['meta'] = {'type': 'tool', 'public': True, 'llm_alias': 'HeldEvidence',
                    'title': 'Held evidence', 'llm_description': 'Read held evidence.',
                    'input_schema': {'type': 'object', 'properties': {'config': {'type': 'object',
                        'properties': {'url': {'type': 'string'}, 'title': {'type': 'string'}},
                        'required': ['url', 'title']}}, 'required': ['config']}}
                path.write_text(yaml.safe_dump(document, sort_keys=False))
            complete_splashes(fixture, 'welcome', 'first_agent')
            agent = inst.request('POST', '/api/v1/user-agents', {
                'title': 'Held tool lifecycle agent', 'model': model,
                'prompt': 'Call HeldEvidence once, then report completion.', 'tools': [NS + ':transform'],
                'max_tokens': 512})['component_id']
            browser = fixture.browser_check()
            browser.login()
            browser.open_chat(agent)
            sid = browser.current_session()
            chat = browser.frame.locator('wippy-chat')
            box = chat.get_by_placeholder('Type a message', exact=True)
            box.fill('Read the held evidence now.')
            box.press('Enter')
            inst.wait(lambda: gate.snapshot().get('automation', {}).get('entered') == 1,
                      'Chat begins its actual held tool', seconds=60, pump=browser.page.wait_for_timeout)
            expect(chat.locator('.chat-tool-group__badge--processing')).to_have_count(1)
            browser.screenshot('held-tool-active')
            if stop:
                offset = len(browser.frames)
                chat.locator('.chat-input__stop-button').click()

                def cancelled():
                    rows = messages(fixture, sid)
                    return rows if any(row['type'] == 'function' and row.get('metadata', {}).get('outcome') == 'cancelled'
                        or row['type'] == 'function' and row.get('metadata', {}).get('status') == 'cancelled' for row in rows) else None

                transcript = inst.wait(cancelled, 'Stop durably settles its running tool', seconds=30,
                                       pump=browser.page.wait_for_timeout)
                expect(chat.locator('.chat-tool-group__badge--processing')).to_have_count(0, timeout=30000)
                expect(chat.locator('.chat-tool-group__badge--cancelled')).to_have_count(1, timeout=30000)
                require(any(isinstance(row.get('data'), dict) and row['data'].get('outcome') == 'cancelled'
                            for row in browser.frames[offset:]), 'Cancellation has no terminal live event')
                inst.evidence.save('stop-tool-live', {'messages': transcript, 'frames': browser.frames[offset:],
                                                    'gate': gate.snapshot(), 'state': chat.evaluate(CHAT_STATE)})
                browser.screenshot('held-tool-cancelled-live')
                gate.release()
                browser.reload()
                browser.open_chat(agent, session_id=sid)
                chat = browser.frame.locator('wippy-chat')
                expect(chat.locator('.chat-tool-group__badge--processing')).to_have_count(0)
                expect(chat.locator('.chat-tool-group__badge--cancelled')).to_have_count(1, timeout=30000)
                browser.screenshot('held-tool-cancelled-reload')
            else:
                before = messages(fixture, sid)
                browser.clean(0)
                fixture.close_browser()
                disconnected = time.monotonic()
                time.sleep(2)
                require(gate.snapshot() == {'automation': {'entered': 1, 'effects': 0}},
                        'Held tool has an effect before release')
                gate.release()

                def completed():
                    rows = messages(fixture, sid)
                    tools = [row for row in rows if row['type'] == 'function']
                    require(all(row.get('metadata', {}).get('status') != 'cancelled' for row in tools),
                            'Browser disconnect cancels the running tool')
                    return rows if tools and all(row.get('metadata', {}).get('status') == 'success' for row in tools) \
                        and any(row['type'] == 'assistant' and 'The held tool completes.' in str(row.get('data')) for row in rows) else None

                transcript = inst.wait(completed, 'Turn completes while the browser is disconnected', seconds=60)
                require(gate.snapshot() == {'automation': {'entered': 1, 'effects': 1}},
                        'Disconnect loses or duplicates the tool effect')
                browser = fixture.browser_check()
                browser.login()
                browser.open_chat(agent, session_id=sid)
                chat = browser.frame.locator('wippy-chat')
                expect(chat.locator('.chat-tool-group__badge--processing')).to_have_count(0)
                inst.wait(lambda: 'The held tool completes.' in chat.evaluate(ASSISTANT_TEXT),
                          'Reconnected chat restores the completed answer', seconds=30, pump=browser.page.wait_for_timeout)
                require(sum(row['type'] == 'user' for row in messages(fixture, sid)) == 1,
                        'Reconnect resubmits the existing user turn')
                inst.evidence.save('disconnect-tool-completion', {'before': before, 'after': transcript,
                    'disconnected_seconds': time.monotonic() - disconnected, 'gate': gate.snapshot()})
                browser.screenshot('held-tool-reconnected')


REGISTRY = [
    Scenario('session_disconnect_active_tool_browser', 'regression', lambda ctx: active_tool(ctx, stop=False),
             issues=('SESSION-DISCONNECT-ACTIVE-TURN',), features=(
                 'kickside/sessions|http|POST /api/v1/sessions/start-token',)),
    Scenario('session_stop_tool_settlement_browser', 'regression', lambda ctx: active_tool(ctx, stop=True),
             issues=('SESSION-CANCELLED-TOOL-SETTLEMENT',), features=(
                 'kickside/sessions|http|POST /api/v1/sessions/start-token',)),
]
