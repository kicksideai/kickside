from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
from contextlib import contextmanager

from harness import Cleanup
import gap_ui_contract


class SyncUiFixtureTests(unittest.TestCase):
    def test_reconfigure_creates_its_sync_on_a_fresh_host(self):
        parent = Mock()
        parent.evidence.root = Path("evidence")
        parent.evidence.label = "guard"
        parent.request.return_value = {'automations': [{'id': 'existing', 'type': 'kickside.sync:sync'}]}
        fresh = Mock(cleanup=Cleanup())
        ctx = SimpleNamespace(inst=parent, browser_session=None, browser_check=Mock())
        reached = []
        def sync_fixture(fixture):
            reached.append(fixture.inst)
            raise StopIteration('fixture reached')
        with patch('runtime.Instance', return_value=fresh), patch('scenarios.Browser'), \
                patch.object(gap_ui_contract, 'sync_fixture', side_effect=sync_fixture):
            with self.assertRaisesRegex(StopIteration, 'fixture reached'):
                gap_ui_contract.reconfigure_sync(ctx)
        self.assertEqual(reached, [fresh])
        parent.install.assert_not_called()
        fresh.boot.assert_called_once()


class MountedSessionFixtureTests(unittest.TestCase):
    def test_fixture_deletes_once_and_observes_mounted_cleanup_before_closing_other_browser(self):
        events = []
        case = self

        class Rows:
            def __init__(self):
                self.count_value = 1

            @property
            def first(self):
                return self

            def wait_for(self, **_kwargs):
                events.append('wait-initial-row')

            def count(self):
                events.append('mounted-count:' + str(self.count_value))
                return self.count_value

        rows = Rows()

        class Panel:
            def locator(self, selector):
                case.assertEqual(selector, '.kx-row')
                return rows

            def element_handle(self):
                return 'retained-panel'

        panel = Panel()

        class Locator:
            def locator(self, _selector):
                return self

            def get_by_text(self, _text, **_kwargs):
                return self

            def get_by_placeholder(self, _text, **_kwargs):
                return self

            def filter(self, **_kwargs):
                return self

            def click(self):
                events.append('chat-opened')

            def wait_for(self, **_kwargs):
                events.append('wait-chat')

        class Primary:
            frames = []
            page = SimpleNamespace(wait_for_timeout=lambda *_args, **_kwargs: None)

            def login(self):
                events.append('primary-login')

            @property
            def frame(self):
                return SimpleNamespace(locator=lambda _selector: SimpleNamespace(first=panel))

        class Other:
            def __init__(self, _inst, session=None):
                self.frame = SimpleNamespace(locator=lambda _selector: Locator())

            def login(self):
                events.append('other-login')

            def clean(self, start):
                case.assertEqual(start, 0)
                events.append('other-clean')

            def close(self):
                events.append('other-close')

        class Instance:
            def __init__(self):
                self.evidence = SimpleNamespace(save=lambda *_args, **_kwargs: events.append('evidence'))

            def request(self, method, path, **_kwargs):
                events.append('request:' + method + ':' + path)
                if method == 'GET' and path == '/api/v1/sessions?limit=100':
                    if _kwargs['label'] == 'session-before-create':
                        return {'sessions': []}
                    return {'sessions': [{'session_id': 'fresh'}]}
                if method == 'GET' and path.startswith('/api/v1/user-agents/'):
                    return {'agent': {'title': 'Agent'}}
                if method == 'DELETE':
                    rows.count_value = 1
                    return {'success': True}
                case.fail('unexpected request: ' + method + ' ' + path)

            def wait(self, predicate, label, **_kwargs):
                events.append('wait:' + label)
                if label == 'New chat persists one session':
                    rows.count_value = 2
                result = predicate()
                case.assertTrue(result, label)
                return result

        inst = Instance()
        primary = Primary()
        ctx = SimpleNamespace(inst=inst, browser_check=lambda: primary, browser_session=None,
                              state={'agent': 'agent-id'})
        with patch.object(gap_ui_contract, 'Browser', Other), patch.object(gap_ui_contract, 'nav'):
            with gap_ui_contract.mounted_new_session(ctx) as (_inst, _browser, _panel, _retained, session):
                self.assertEqual(session['session_id'], 'fresh')

        delete = 'request:DELETE:/api/v1/sessions/delete?session_id=fresh'
        self.assertEqual(events.count(delete), 1)
        self.assertLess(events.index(delete), events.index('wait:Mounted session panel reflects cleanup'))
        self.assertLess(events.index('wait:Mounted session panel reflects cleanup'), events.index('other-clean'))
        self.assertLess(events.index('other-clean'), events.index('other-close'))


class SessionFreshnessTests(unittest.TestCase):
    def test_body_leaves_deletion_to_fixture_and_keeps_detachment_observation(self):
        events = []
        case = self

        class Row:
            def filter(self, **_kwargs):
                return self

            def wait_for(self, **kwargs):
                if kwargs.get('state') == 'detached':
                    events.append('renamed-row-detached')

            def locator(self, selector):
                case.assertEqual(selector, '.kx-row-meta')
                return SimpleNamespace(inner_text=lambda: 'now')

            def inner_text(self):
                return 'live session'

        row = Row()

        class Panel:
            def locator(self, selector):
                if selector == '.kx-row':
                    return row
                case.assertEqual(selector, '.kx-name')
                return SimpleNamespace(get_by_text=lambda *_args, **_kwargs: row)

        title = {'value': ''}

        class Instance:
            evidence = SimpleNamespace(save=lambda *_args, **_kwargs: None)

            def request(self, method, path, payload=None, **_kwargs):
                events.append('request:' + method + ':' + path)
                if method == 'POST' and path == '/api/v1/sessions/rename':
                    title['value'] = payload['title']
                    return {'success': True}
                if method == 'GET' and path == '/api/v1/sessions/get?session_id=fresh':
                    return {'session': {'title': title['value']}}
                case.fail('fixture owns deletion; unexpected request: ' + method + ' ' + path)

        @contextmanager
        def fixture(_ctx):
            try:
                yield Instance(), None, Panel(), SimpleNamespace(evaluate=lambda _script: True), {'session_id': 'fresh'}
            finally:
                events.append('fixture-delete')

        with patch.object(gap_ui_contract, 'mounted_new_session', fixture):
            gap_ui_contract.session_freshness(SimpleNamespace())

        self.assertEqual(sum(event.startswith('request:DELETE:') for event in events), 0)
        self.assertLess(events.index('fixture-delete'), events.index('renamed-row-detached'))


if __name__ == '__main__':
    unittest.main()
