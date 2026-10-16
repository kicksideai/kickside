import unittest
import json
from pathlib import Path

from export_map import export
from report import calculate, planned, issue_report
from tests.test_report import inventory, mapping, run


class IssueReportTests(unittest.TestCase):
    def test_chat_only_guards_are_opt_in_but_still_require_guards(self):
        mapped = mapping()
        mapped['scenarios']['chat_command'] = {'tier': 'chat', 'features': [], 'issues': ['CHAT-1']}
        catalog = {'schema_version': 1, 'issues': ['CHAT-1']}
        report, failures = issue_report(mapped, {'tier': 'full', 'results': []}, catalog, ('sqlite', 'postgres'))
        self.assertEqual(report['CHAT-1']['status'], 'not_run')
        self.assertEqual(failures, [])
        _, failures = issue_report(mapped, {'tier': 'chat', 'results': []}, catalog, ('sqlite', 'postgres'))
        self.assertEqual(failures, ['Issue CHAT-1 regression is not_run'])
        _, failures = issue_report(mapping(), {'tier': 'full', 'results': []}, catalog, ('sqlite', 'postgres'))
        self.assertEqual(failures, ['Issue CHAT-1 has no guarding scenario'])

    def test_real_catalog_validates_without_execution_credit(self):
        catalog = json.loads((Path(__file__).resolve().parents[1] / 'issues.json').read_text())
        report, failures = issue_report(export(), {'results': []}, catalog, ('sqlite', 'postgres'))
        self.assertEqual(set(report), set(catalog['issues']))
        blocked = {issue for guard in catalog.get('harness_guards', {}).values()
                   if guard.get('state') == 'runtime-blocked' for issue in guard['issues']}
        active = {issue for scenario in export()['scenarios'].values() for issue in scenario['issues']}
        active.update(issue for guard in catalog.get('harness_guards', {}).values()
                      if guard.get('state') != 'runtime-blocked' for issue in guard['issues'])
        for issue, row in report.items():
            self.assertEqual(row['status'], 'runtime-blocked' if issue in blocked - active else 'not_run')
        self.assertFalse(any(row['status'] == 'passed' for row in report.values()))
        self.assertFalse(any('has no guarding scenario' in failure for failure in failures))

    def test_every_catalogued_issue_has_a_permanent_guard(self):
        catalog = json.loads((Path(__file__).resolve().parents[1] / 'issues.json').read_text())
        guarded = {issue for row in export()['scenarios'].values() for issue in row['issues']}
        guarded.update(issue for row in catalog.get('harness_guards', {}).values() for issue in row['issues'])
        self.assertEqual(guarded, set(catalog['issues']))

    def test_export_includes_issue_metadata(self):
        exported = export()['scenarios']
        self.assertTrue(exported)
        self.assertTrue(all(isinstance(row['issues'], list) for row in exported.values()))

    def test_each_issue_shows_guard_results_by_engine(self):
        mapped = mapping()
        mapped['scenarios']['one']['issues'] = ['D-1']
        results = run()
        results['results'][1]['status'] = 'failed'
        report = calculate(inventory(), mapped, results, issues={'schema_version': 1, 'issues': ['D-1']})
        self.assertEqual(report['issues']['D-1']['scenarios'], {'one': {'sqlite': 'passed', 'postgres': 'failed'}})
        self.assertEqual(report['issues']['D-1']['status'], 'failed')

    def test_unguarded_issue_blocks_even_complete_feature_coverage(self):
        report = calculate(inventory(), mapping(), run(), issues={'schema_version': 1, 'issues': ['D-1']})
        self.assertFalse(report['gate_passed'])
        self.assertIn('Issue D-1 has no guarding scenario', report['failures'])

    def test_skipped_guard_blocks_even_when_other_scenarios_cover_every_feature(self):
        mapped = mapping()
        mapped['scenarios']['guard'] = {'tier': 'full', 'features': [], 'issues': ['D-1']}
        results = run()
        results['results'] += [
            {'scenario': 'guard', 'engine': 'sqlite', 'status': 'passed'},
            {'scenario': 'guard', 'engine': 'postgres', 'status': 'skipped: blocked by setup'},
        ]
        report = calculate(inventory(), mapped, results, issues={'schema_version': 1, 'issues': ['D-1']})
        self.assertEqual(report['overall']['percent'], 100)
        self.assertFalse(report['gate_passed'])
        self.assertEqual(report['issues']['D-1']['status'], 'skipped')
        self.assertIn('Issue D-1 regression is skipped', report['failures'])

    def test_absent_execution_never_gets_pass_credit(self):
        mapped = mapping()
        mapped['scenarios']['one']['issues'] = ['D-1']
        report = calculate(inventory(), mapped, {'results': []}, issues={'schema_version': 1, 'issues': ['D-1']})
        self.assertEqual(report['issues']['D-1']['status'], 'not_run')
        self.assertEqual(report['issues']['D-1']['scenarios']['one'], {'sqlite': 'not_run', 'postgres': 'not_run'})
        plan = planned(inventory(), mapped, 'full', issues={'schema_version': 1, 'issues': ['D-1']})
        self.assertEqual(plan['issues']['D-1']['status'], 'not_run')

    def test_undeclared_and_duplicate_issue_ids_fail_validation(self):
        mapped = mapping()
        mapped['scenarios']['one']['issues'] = ['UNKNOWN']
        with self.assertRaisesRegex(ValueError, 'Unknown issue'):
            calculate(inventory(), mapped, run(), issues={'schema_version': 1, 'issues': ['D-1']})
        with self.assertRaises(ValueError):
            calculate(inventory(), mapping(), run(), issues={'schema_version': 1, 'issues': ['D-1', 'D-1']})


class RuntimeBlockedIssueTests(unittest.TestCase):
    def catalog(self):
        return {'schema_version': 1, 'issues': ['D-1'], 'harness_guards': {
            'runtime/probe': {'issues': ['D-1'], 'repository': 'kickside/kickside',
                'test': 'lane/probe.lua', 'engines': ['sqlite', 'postgres'],
                'state': 'runtime-blocked', 'runtime': 'release-under-test',
                'evidence': ['lane/sqlite.log', 'lane/postgres.log'],
                'ledger': 'ledger.md#runtime-boundary'}}}

    def test_reports_blocker_without_execution_credit(self):
        report, failures = issue_report(mapping(), {'results': []}, self.catalog(), ('sqlite', 'postgres'))
        self.assertEqual(report['D-1']['status'], 'runtime-blocked')
        self.assertEqual(report['D-1']['harnesses']['runtime/probe'],
                         {'sqlite': 'not_run', 'postgres': 'not_run'})
        self.assertEqual(report['D-1']['runtime_blockers']['runtime/probe']['ledger'],
                         'ledger.md#runtime-boundary')
        self.assertEqual(failures, [])

    def test_blocker_cannot_hide_failed_or_missing_product_guards(self):
        mapped = mapping()
        mapped['scenarios']['one']['issues'] = ['D-1']
        for status in ('failed', 'not_run', 'skipped: setup unavailable'):
            with self.subTest(status=status):
                rows = {'results': [{'scenario': 'one', 'engine': 'sqlite', 'status': 'passed'}]}
                if status != 'not_run':
                    rows['results'].append({'scenario': 'one', 'engine': 'postgres', 'status': status})
                report, failures = issue_report(mapped, rows, self.catalog(), ('sqlite', 'postgres'))
                self.assertEqual(report['D-1']['status'], status.split(':')[0])
                self.assertTrue(failures)

    def test_blocker_never_becomes_a_passing_issue_from_probe_results(self):
        for status in ('passed', 'failed'):
            with self.subTest(status=status):
                rows = {'results': [], 'harness_results': [
                    {'guard': 'runtime/probe', 'engine': engine, 'status': status}
                    for engine in ('sqlite', 'postgres')]}
                report, failures = issue_report(mapping(), rows, self.catalog(), ('sqlite', 'postgres'))
                self.assertEqual(report['D-1']['status'], 'runtime-blocked')
                self.assertEqual(report['D-1']['harnesses']['runtime/probe']['sqlite'], status)
                self.assertEqual(failures, [])

    def test_incomplete_blocker_provenance_fails_validation(self):
        import copy
        guard = self.catalog()['harness_guards']['runtime/probe']
        for update in ({'runtime': ''}, {'ledger': ''}, {'evidence': []},
                       {'evidence': ['lane/sqlite.log']}, {'evidence': ['same', 'same']},
                       {'state': 'unsupported'}, {'engines': ['independent']}):
            catalog = self.catalog()
            catalog['harness_guards']['runtime/probe'] = {**copy.deepcopy(guard), **update}
            with self.subTest(update=update), self.assertRaises(ValueError):
                issue_report(mapping(), {'results': []}, catalog, ('sqlite', 'postgres'))


class UpstreamBlockedIssueTests(unittest.TestCase):
    def catalog(self):
        catalog = RuntimeBlockedIssueTests().catalog()
        guard = catalog['harness_guards'].pop('runtime/probe')
        guard.update(state='upstream-blocked', module='wippy/example@fresh-version')
        catalog['harness_guards']['sdk/probe'] = guard
        return catalog

    def test_reports_sdk_blocker_without_passing_credit(self):
        catalog = self.catalog()
        for status in ('not_run', 'passed', 'failed'):
            rows = {'results': []}
            if status != 'not_run':
                rows['harness_results'] = [{'guard': 'sdk/probe', 'engine': engine, 'status': status}
                                          for engine in ('sqlite', 'postgres')]
            with self.subTest(status=status):
                report, failures = issue_report(mapping(), rows, catalog, ('sqlite', 'postgres'))
                self.assertEqual(report['D-1']['status'], 'upstream-blocked')
                self.assertEqual(report['D-1']['upstream_blockers']['sdk/probe']['module'],
                                 'wippy/example@fresh-version')
                self.assertEqual(report['D-1']['harnesses']['sdk/probe'],
                                 {'sqlite': status, 'postgres': status})
                self.assertEqual(failures, [])

    def test_missing_sdk_provenance_is_rejected(self):
        for update in ({'module': ''}, {'module': None}, {'runtime': ''}, {'ledger': ''},
                       {'evidence': ['one-engine']}, {'evidence': ['same', 'same']}):
            catalog = self.catalog()
            catalog['harness_guards']['sdk/probe'].update(update)
            with self.subTest(update=update), self.assertRaises(ValueError):
                issue_report(mapping(), {'results': []}, catalog, ('sqlite', 'postgres'))

    def test_sdk_blocker_cannot_hide_product_failures_or_missing_guards(self):
        mapped = mapping()
        mapped['scenarios']['one']['issues'] = ['D-1']
        for status in ('failed', 'not_run', 'skipped: setup unavailable'):
            rows = {'results': [{'scenario': 'one', 'engine': 'sqlite', 'status': 'passed'}]}
            if status != 'not_run':
                rows['results'].append({'scenario': 'one', 'engine': 'postgres', 'status': status})
            report, failures = issue_report(mapped, rows, self.catalog(), ('sqlite', 'postgres'))
            self.assertEqual(report['D-1']['status'], status.split(':')[0])
            self.assertTrue(failures)

    def test_calculated_coverage_keeps_sdk_blockers_separate(self):
        report = calculate(inventory(), mapping(), run(), issues=self.catalog())
        self.assertEqual(report['upstream_blocked_issues'], ['D-1'])
        self.assertNotIn('runtime_blocked_issues', report)
        self.assertNotEqual(report['issues']['D-1']['status'], 'passed')
