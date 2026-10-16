import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock
from urllib.parse import parse_qs, urlsplit

from harness import Failure
import data_contracts
import scenarios_core as core


class ReadModelTests(unittest.TestCase):
    def test_onboarding_dismissal_waits_for_the_declared_component_in_dialog_presentation(self):
        from unittest.mock import patch
        personal, screen = Mock(), Mock()
        browser = Mock()
        browser.frame.locator.side_effect = lambda selector: personal if selector == 'kickside-agent-onboarding' else screen
        browser.current_session.return_value = 'session-id'
        ctx = Mock(browser=browser, state={})
        dismissed = False
        def expect(locator):
            def count(value, *, timeout):
                nonlocal dismissed
                self.assertEqual(value, 0)
                self.assertEqual(timeout, 30000)
                if locator is personal:
                    dismissed = True
            return Mock(to_have_count=count)
        def request(method, path, **kwargs):
            if method == 'DELETE':
                return {'success': True}
            return {'splash': None if dismissed else {'id': 'first_agent'}}
        ctx.inst.request.side_effect = request
        with patch('playwright.sync_api.expect', side_effect=expect), patch.object(core, 'first_agent') as create:
            core.core_personal_agent(ctx)
        create.assert_called_once_with(ctx)
        self.assertTrue(dismissed)
        self.assertEqual(ctx.state['session'], 'session-id')

    def test_settings_warmer_is_exactly_once_in_current_boot(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(root=Path(directory), boot_log_offset=58)
            old = 'SUCCESS: kickside.settings:cache_bootloader settings cache warmed\n'
            current = 'SUCCESS: kickside.settings:cache_bootloader settings cache warmed\n'
            (inst.root/'runtime.log').write_text(old + current)
            inst.boot_log_offset = len(old.encode())
            inst.request.return_value = {'settings': [{'key': 'language'}]}
            ctx = Mock(inst=inst)
            core.settings_cache_bootloader(ctx)
            inst.evidence.save.assert_called_once_with('settings-cache-warmers', [current.strip()])
            (inst.root/'runtime.log').write_text(old + current * 2)
            with self.assertRaises(Failure):
                core.settings_cache_bootloader(ctx)

    def test_event_window_pages_through_declared_sequence_bounds(self):
        request = Mock(side_effect=[{'events': [{'id': 'a', 'seq': 201}, {'id': 'b', 'seq': 202}]},
                                    {'events': [{'id': 'c', 'seq': 203}]}])
        rows = data_contracts.event_window(request, '/threads/t/events', 201, 203)
        self.assertEqual([r['id'] for r in rows], ['a', 'b', 'c'])
        self.assertEqual(parse_qs(urlsplit(request.call_args_list[1].args[1]).query)['from_seq'], ['203'])
        self.assertTrue(all('limit=200' in call.args[1] for call in request.call_args_list))

    def test_event_window_refuses_missing_or_repeated_source_rows(self):
        for rows in ([], [{'seq': 1}, {'seq': 1}], [{'seq': 0}], [{'seq': 2}]):
            with self.subTest(rows=rows), self.assertRaises(Failure):
                data_contracts.event_window(Mock(return_value={'events': rows}), '/events', 1, 1)

    def test_inbox_pages_find_fixture_beyond_the_first_page(self):
        request = Mock(side_effect=[{'component_id': 't', 'items': [{'id': 'old'}], 'total_count': 2},
                                    {'component_id': 't', 'items': [{'id': 'mine'}], 'total_count': 2}])
        rows, page = data_contracts.inbox_items(request, '/inbox', limit=1)
        self.assertEqual([r['id'] for r in rows], ['old', 'mine'])
        self.assertIn('page=2', request.call_args_list[1].args[1])
        self.assertEqual(page['component_id'], 't')

    def test_denial_evidence_uses_authored_source_and_preserves_content_checks(self):
        import scenarios_access as access
        from unittest.mock import patch
        fixture = access.Fixture(access.Kind('journal', 'chestor/journal', 'journal'), 't', 'Journal')
        ctx = Mock()
        thread = {'id': 't', 'attrs': {'title': 'Journal'}, 'parent_id': None, 'kind': 'journal'}
        event = {'id': 'authored', 'seq': 1, 'body': {'text': 'Original content'}}
        with patch.object(access, 'request', side_effect=[{'thread': thread}, {'events': [event]}, {'events': [event]}]), \
             patch.object(access, 'read', return_value={'recent_events': [{'embedding_status': 'pending'}]}):
            before = access.mutation_snapshot(ctx, fixture)
        with patch.object(access, 'request', side_effect=[{'thread': thread}, {'events': [event]}, {'events': [event]}]), \
             patch.object(access, 'read', return_value={'recent_events': [{'embedding_status': 'embedded'}]}):
            self.assertEqual(before, access.mutation_snapshot(ctx, fixture))
        changed = {**event, 'body': {'text': 'Corrupted content'}}
        with patch.object(access, 'request', side_effect=[{'thread': thread}, {'events': [changed]}, {'events': [changed]}]), \
             patch.object(access, 'read', return_value={'recent_events': [{'embedding_status': 'embedded'}]}):
            self.assertNotEqual(before, access.mutation_snapshot(ctx, fixture))

    def test_denied_domain_event_compares_the_same_authored_snapshot(self):
        import scenarios_access as access
        from unittest.mock import patch
        fixture = access.Fixture(access.Kind('journal', 'chestor/journal', 'journal'), 't', 'Journal')
        snapshot = {'thread': {'id': 't'}, 'events': [{'seq': 1}], 'authored': {}}
        with patch.object(access, 'mutation_snapshot', return_value=snapshot) as capture, \
             patch.object(access, 'request', return_value={'success': False}), \
             patch.object(access, 'read', return_value={'recent_events': []}):
            access.primary(Mock(), fixture, 'read', denied=True)
        self.assertEqual(capture.call_count, 2)

    def test_mutation_snapshots_compare_complete_same_source_interval_with_background_appends(self):
        import scenarios_access as access
        from unittest.mock import patch
        fixture = access.Fixture(access.Kind('resource', 'package', 'binding'), 't', 'Resource',
            {'declaration': {'meta': {'thread_class': 'resource'}, 'data': {'contracts': []}}})
        thread = {'id': 't', 'kind': 'resource', 'attrs': {'title': 'Original'}, 'state': 'open'}
        events = [{'id': 'one', 'seq': 1, 'body': {'text': 'Original'}}]
        def request(ctx, role, method, path, **kwargs):
            if path == '/threads/t':
                return {'thread': thread}
            query = parse_qs(urlsplit(path).query)
            if query.get('ascending') == ['false']:
                return {'events': events[-1:]}
            start, end = int(query['from_seq'][0]), int(query['to_seq'][0])
            self.assertEqual(query['limit'], ['200'])
            return {'events': [event for event in events if start <= event['seq'] <= end]}
        with patch.object(access, 'read', return_value={'recent_events': []}), \
             patch.object(access, 'request', side_effect=request):
            before = access.mutation_snapshot(Mock(), fixture)
            events.append({'id': 'two', 'seq': 2, 'body': {'background': True}})
            self.assertEqual(before, access.mutation_snapshot(Mock(), fixture, before))
            thread['attrs'] = {'title': 'Corrupted'}
            self.assertNotEqual(before, access.mutation_snapshot(Mock(), fixture, before))
            thread['attrs'] = {'title': 'Original'}
            events[0] = {**events[0], 'body': {'text': 'Corrupted'}}
            self.assertNotEqual(before, access.mutation_snapshot(Mock(), fixture, before))
            events.pop(0)
            with self.assertRaises(Failure):
                access.mutation_snapshot(Mock(), fixture, before)

    def test_non_thread_resource_denial_preserves_authored_identity_and_config_without_thread_calls(self):
        import scenarios_access as access
        from unittest.mock import patch
        fixture = access.Fixture(access.Kind('connection', 'provider', 'binding'), 'c', 'Connection',
                                 {'declaration': {'meta': {}, 'data': {'contracts': []}}})
        value = {'component_id': 'c', 'name': 'Connection', 'config': {'retained': True}}
        with patch.object(access, 'read', return_value=value), patch.object(access, 'request') as request:
            before = access.mutation_snapshot(Mock(), fixture)
            self.assertEqual(before, {'authored': value, 'parent_id': None})
        request.assert_not_called()
        with patch.object(access, 'read', return_value={**value, 'status': 'ready', 'updated_at': 'later'}):
            self.assertEqual(access.mutation_snapshot(Mock(), fixture), before)
        for field, changed in (('component_id', 'other'), ('name', 'Unauthorized'), ('config', {})):
            with self.subTest(field=field), patch.object(access, 'read', return_value={**value, field: changed}):
                self.assertNotEqual(access.mutation_snapshot(Mock(), fixture), before)

    def test_declared_automation_private_config_snapshot_uses_its_native_action(self):
        import scenarios_access as access
        from unittest.mock import patch
        fixture = access.Fixture(access.Kind('automation', 'channel', 'binding'), 'c', 'Automation',
            {'declaration': {'meta': {'actions': [{'name': 'read_config'}]},
                             'data': {'contracts': [{'methods': {'get_status': 'kickside.core.threads:thread_status'}}]}}})
        value = {'id': 'c', 'title': 'Automation', 'public_state': {'status': 'active'}}
        with patch.object(access, 'read', return_value=value), \
             patch.object(access, 'request', return_value={'result': {'state': {'channel_id': 'NW'}}}) as request:
            snapshot = access.mutation_snapshot(Mock(), fixture)
        self.assertEqual(snapshot['config'], {'channel_id': 'NW'})
        request.assert_called_once_with(unittest.mock.ANY, 'owner', 'POST', '/automations/c/actions/read_config', {})

    def test_canonical_status_method_does_not_require_an_uncreated_lazy_thread(self):
        import scenarios_access as access
        from unittest.mock import patch
        fixture = access.Fixture(access.Kind('recurring', 'automation', 'binding'), 't', 'Automation',
            {'declaration': {'meta': {}, 'data': {'contracts': [
                {'methods': {'get_status': 'kickside.core.threads:thread_status'}}]}}})
        with patch.object(access, 'read', return_value={'title': 'Original'}), \
             patch.object(access, 'request', return_value={'success': False, 'error': 'thread not found'}) as request:
            before = access.mutation_snapshot(Mock(), fixture)
        request.assert_called_once_with(unittest.mock.ANY, 'owner', 'GET', '/threads/t', expect=(200, 404))
        with patch.object(access, 'read', return_value={'title': 'Original'}), \
             patch.object(access, 'request', side_effect=[{'thread': {'id': 't'}}, {'events': [{'seq': 1}]},
                                                         {'events': [{'seq': 1, 'body': {'changed': True}}]}]):
            self.assertNotEqual(before, access.mutation_snapshot(Mock(), fixture))
