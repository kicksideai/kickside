from contextlib import contextmanager
import os
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import scenarios_automation_identity_editor as editor
import scenarios_run_as_picker as picker
import scenarios_bot_adoption as adoption
import scenarios_bot_audit_ui as audit
import scenarios_bot_creator_ui as creator
import scenarios_bot_credential_ui as credential
import scenarios_bot_root_isolation as roots


class AuthorityFixtureIsolationTests(unittest.TestCase):
    def test_retained_authority_browser_failures_clean_children_and_preserve_parent_state(self):
        cases = ((adoption, 'browser_bot_authorizer_adoption'),
                 (audit, 'browser_run_as_audit'),
                 (creator, 'browser_bot_creator_deleted'),
                 (credential, 'browser_bot_credential_ownership'),
                 (roots, 'browser_bot_group_root_isolation'))

        class SharedRuntime:
            def __getattr__(self, name):
                raise AssertionError('Destructive browser scenario reaches the shared runtime: ' + name)

        for module, name in cases:
            with self.subTest(scenario=name):
                navigation = {'url': '/automations', 'retained_roots': ['earlier-root']}
                parent = SimpleNamespace(inst=SharedRuntime(), browser_navigation=navigation)
                children, cleaned = [], []

                @contextmanager
                def isolated(context):
                    self.assertIs(context, parent)
                    child = SimpleNamespace(inst=object(), browser_navigation=None)
                    children.append(child)
                    try:
                        yield child
                    finally:
                        cleaned.append(child)

                def stopped(context):
                    self.assertIs(context, children[-1])
                    context.browser_navigation = {'url': '/login', 'retained_roots': ['deleted-authorizer-root']}
                    raise RuntimeError('isolated browser stops after retained authority changes')

                with patch('runtime_fixtures.isolated_fixture', isolated), \
                     patch.object(module, '_' + name, side_effect=stopped, create=True) as action:
                    for _ in range(2):
                        with self.assertRaisesRegex(RuntimeError, 'isolated browser stops'):
                            getattr(module, name)(parent)
                    self.assertEqual(action.call_count, 2)
                self.assertEqual(len(children), 2)
                self.assertIsNot(children[0], children[1])
                self.assertEqual(cleaned, children)
                self.assertIs(parent.browser_navigation, navigation)
                self.assertEqual(navigation, {'url': '/automations', 'retained_roots': ['earlier-root']})

    def test_isolated_source_changes_pause_only_the_fixture_runtime(self):
        from runtime_fixtures import isolated_fixture
        from harness import Cleanup
        parent = Mock()
        parent.inst.evidence.root = Path(os.environ['TMPDIR'])
        parent.inst.evidence.label = 'authority-isolation-unit'
        child = Mock(cleanup=Cleanup())
        child.evidence.paths = []
        events = []

        @contextmanager
        def paused(inst, contexts, dispatch, *, hard=False):
            self.assertIs(inst, child)
            self.assertEqual(len(contexts), 1)
            self.assertIs(contexts[0].inst, child)
            self.assertTrue(hard)
            events.append('stop')
            yield
            events.append('start')

        with patch('runtime.Instance', return_value=child), patch('browser.Browser.paused', paused):
            with isolated_fixture(parent) as fixture:
                with fixture.paused(hard=True):
                    events.append('source-update')
        self.assertEqual(events, ['stop', 'source-update', 'start'])
        parent.inst.stop.assert_not_called()
        parent.inst.start.assert_not_called()

    def test_revoked_fixture_navigation_never_replaces_the_shared_browser_session(self):
        for module, scenario in ((editor, editor.browser_automation_identity_editor),
                                 (picker, picker.browser_run_as_candidate_picker)):
            with self.subTest(scenario=scenario.__name__):
                saved = {'url': '/login', 'storage_state': {'cookies': []}}
                parent = SimpleNamespace(browser_navigation=saved, inst=object())
                child = SimpleNamespace(browser_navigation=None, inst=object())
                cleaned = []

                @contextmanager
                def isolated(context):
                    self.assertIs(context, parent)
                    try:
                        yield child
                    finally:
                        cleaned.append(child)

                def revoked(context):
                    context.browser_navigation = {'url': '/automations', 'storage_state': {
                        'cookies': [{'name': 'x-auth-token', 'value': 'revoked-fixture-credential'}]}}
                    raise RuntimeError('fixture authority revokes')

                with patch('runtime_fixtures.isolated_fixture', isolated), \
                     patch.object(module, '_candidate_fixture', side_effect=revoked):
                    with self.assertRaisesRegex(RuntimeError, 'fixture authority revokes'):
                        scenario(parent)
                self.assertIs(parent.browser_navigation, saved)
                self.assertEqual(parent.browser_navigation['storage_state']['cookies'], [])
                self.assertEqual(cleaned, [child])
