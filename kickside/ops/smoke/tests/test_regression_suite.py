import unittest
import json
import os
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

from harness import Cleanup, Scenario, load_registry, select_attached, select_scenarios
from smoke import parser
import smoke
import runtime


class RegressionSelectionTests(unittest.TestCase):
    def registry(self):
        return [Scenario('setup', 'quick', lambda ctx: None),
                Scenario('ordinary', 'full', lambda ctx: None),
                Scenario('guard', 'full', lambda ctx: None, ('setup',), issues=('DEFECT-1',))]

    def test_regression_selects_issue_guards_and_required_setup(self):
        registry = self.registry()
        self.assertEqual([s.name for s in select_scenarios(registry, 'regression', [])], ['setup', 'guard'])
        self.assertEqual([s.name for s in select_attached(registry, 'regression', [], {})], ['setup', 'guard'])
        self.assertEqual([s.name for s in select_scenarios(registry, 'full', [])], ['setup', 'ordinary', 'guard'])

    def test_cli_regression_defaults_to_both_engines(self):
        args = parser().parse_args(['--tier', 'regression', '--list'])
        self.assertEqual(args.tier, 'regression')
        self.assertEqual(args.engine, 'both')

    def test_regression_rerun_retains_unrequested_setup_and_results(self):
        calls = []
        registry = [Scenario('setup', 'quick', lambda ctx: calls.append('setup')),
                    Scenario('ordinary', 'full', lambda ctx: None, ('setup',)),
                    Scenario('guard', 'full', lambda ctx: calls.append('guard'), ('setup',), issues=('D',))]
        instance = Mock(cleanup=Cleanup())
        instance.evidence.paths = []
        instance.redactor.text.side_effect = str
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(runtime, 'Instance', return_value=instance):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}},
                                            'sqlite', Path(directory))
                try:
                    runner.run('full', [], 1)
                    ordinary = runner.outcomes['ordinary']
                    rows = runner.run('regression', [], 1)
                    self.assertEqual([row.scenario for row in rows], ['guard'])
                    self.assertIs(runner.outcomes['ordinary'], ordinary)
                    self.assertEqual(calls, ['setup', 'guard', 'guard'])
                finally:
                    runner.close()

    def test_issue_metadata_rejects_empty_duplicate_and_non_string_ids(self):
        for issues in (('',), ('D', 'D'), (1,), 'DEFECT-1'):
            with self.subTest(issues=issues), self.assertRaises(ValueError):
                Scenario('guard', 'full', lambda ctx: None, issues=issues)

    def test_projection_browser_guard_requires_the_core_onboarding_fixture(self):
        guard = next(row for row in load_registry(Path(__file__).resolve().parents[1])
                     if row.name == 'regression_projection_retry_ui')
        self.assertIn('core_personal_agent', guard.requires)

    def test_restricted_workflow_browser_guard_covers_the_current_identity_baseline(self):
        guard = next(row for row in load_registry(Path(__file__).resolve().parents[1])
                     if row.name == 'browser_workflow_selected_restricted_baseline')
        self.assertEqual(guard.tier, 'regression')
        self.assertTrue({'EXECUTION-BASELINE-IDENTITY-RESOLUTION', 'RA-B05'} <= set(guard.issues))

    def test_release_packaging_checks_require_the_built_shell_bundle(self):
        scenarios = {row.name: row for row in load_registry(Path(__file__).resolve().parents[1])}
        self.assertIn('shell_vendor_build', scenarios['release_runtime_profiles'].requires)
        self.assertIn('shell_vendor_build', scenarios['release_frontend_entrypoints'].requires)

    def test_large_knowledge_cleanup_has_a_dedicated_issue_guard(self):
        suite = Path(__file__).resolve().parents[1]
        catalog = json.loads((suite / 'coverage/issues.json').read_text())
        guard = next(row for row in load_registry(suite) if row.name == 'regression_large_kb_delete')
        self.assertIn('KNOWLEDGE-CLEANUP-PROGRESS', catalog['issues'])
        self.assertIn('KNOWLEDGE-CLEANUP-PROGRESS', guard.issues)
        self.assertIn('B04', guard.issues)

    def test_knowledge_cleanup_status_error_has_a_dedicated_issue_guard(self):
        suite = Path(__file__).resolve().parents[1]
        catalog = json.loads((suite / 'coverage/issues.json').read_text())
        guard = next(row for row in load_registry(suite) if row.name == 'regression_large_kb_delete_status_error')
        self.assertIn('KNOWLEDGE-CLEANUP-STATUS-ERROR', catalog['issues'])
        self.assertEqual(guard.issues, ('KNOWLEDGE-CLEANUP-STATUS-ERROR',))

    def test_knowledge_revision_ui_guards_structured_model_output(self):
        suite = Path(__file__).resolve().parents[1]
        catalog = json.loads((suite / 'coverage/issues.json').read_text())
        guard = next(row for row in load_registry(suite) if row.name == 'regression_N01')
        self.assertIn('SMOKE-KNOWLEDGE-SEARCH-MODEL-OUTPUT', catalog['issues'])
        self.assertIn('SMOKE-KNOWLEDGE-SEARCH-MODEL-OUTPUT', guard.issues)

    def test_EE2_2572_has_a_direct_result_chat_guard(self):
        suite = Path(__file__).resolve().parents[1]
        catalog = json.loads((suite / 'coverage/issues.json').read_text())
        guard = next(row for row in load_registry(suite) if row.name == 'regression_EE2_2572_direct_result_chat')
        self.assertIn('EE2-2572', catalog['issues'])
        # This regression must retain its direct chat-result contract.  Extra
        # related guards may be added as the scenario's responsibility grows.
        required = {'EE2-2572', 'SMOKE-CHAT-RELAY-WELCOME-HANDSHAKE',
                    'UPSTREAM-SESSION-PREDISPATCH-INVALIDATE',
                    'SMOKE-MODEL-STREAM-RESPONSE', 'SMOKE-NATIVE-TOOL-TRANSCRIPT',
                    'SMOKE-MODEL-TOKEN-ACCOUNTING'}
        self.assertTrue(required <= set(guard.issues))
        self.assertFalse(guard.model)
