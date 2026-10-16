import copy
import unittest
from report import calculate, planned
from tests.test_report import inventory, mapping, run


def catalog():
    return {'schema_version': 1, 'issues': ['D-1'], 'harness_guards': {
        'core/wake': {'issues': ['D-1'], 'repository': 'kickside/kickside',
                      'test': 'core/core/test/src/suites/lifecycle/component_lifecycle_test.lua',
                      'engines': ['sqlite', 'postgres']},
        'studio/tokens': {'issues': ['D-1'], 'repository': 'kickside/ui-studio',
                          'test': 'ui/src/tokens.spec.ts', 'engines': ['independent']}}}


def results():
    r = run()
    r['harness_results'] = [{'guard': name, 'engine': engine, 'status': 'passed'}
                            for name, guard in catalog()['harness_guards'].items()
                            for engine in guard['engines']]
    return r


class HarnessGuardTests(unittest.TestCase):
    def test_explicit_results_satisfy_guards_without_feature_credit(self):
        report = calculate(inventory(), mapping(), results(), issues=catalog())
        self.assertTrue(report['gate_passed'])
        self.assertEqual(report['issues']['D-1']['status'], 'passed')
        self.assertEqual(report['issues']['D-1']['harnesses'], {
            'core/wake': {'sqlite': 'passed', 'postgres': 'passed'},
            'studio/tokens': {'independent': 'passed'}})
        self.assertEqual(report['overall']['covered'], 4)

    def test_missing_failed_and_skipped_harness_results_block(self):
        for status in ('not_run', 'failed', 'skipped: unavailable'):
            with self.subTest(status=status):
                r = results()
                if status == 'not_run': r['harness_results'].pop()
                else: r['harness_results'][-1]['status'] = status
                report = calculate(inventory(), mapping(), r, issues=catalog())
                self.assertFalse(report['gate_passed'])
                self.assertEqual(report['issues']['D-1']['status'], status.split(':')[0])

    def test_plans_and_aggregate_counts_do_not_satisfy_harness_guards(self):
        for r in (run(), {'results': [], 'harness_counts': {'passed': 999}}):
            report = calculate(inventory(), mapping(), r, issues=catalog())
            self.assertEqual(report['issues']['D-1']['status'], 'not_run')
        self.assertEqual(planned(inventory(), mapping(), 'full', issues=catalog())['issues']['D-1']['status'], 'not_run')

    def test_invalid_results_fail_validation(self):
        for update in ({'guard': 'unknown'}, {'engine': 'sqlite'}, {'status': 'PASS'}):
            r = results(); r['harness_results'][-1].update(update)
            with self.subTest(update=update), self.assertRaises(ValueError):
                calculate(inventory(), mapping(), r, issues=catalog())
        r = results(); r['harness_results'].append(copy.deepcopy(r['harness_results'][0]))
        with self.assertRaises(ValueError): calculate(inventory(), mapping(), r, issues=catalog())

    def test_invalid_declarations_fail_validation(self):
        for update in ({'issues': ['UNKNOWN']}, {'issues': ['D-1', 'D-1']}, {'engines': []},
                       {'engines': ['sqlite', 'sqlite']}, {'engines': ['independent', 'sqlite']},
                       {'engines': ['unknown']}, {'test': ''}, {'repository': ''}):
            c = catalog(); c['harness_guards']['core/wake'].update(update)
            with self.subTest(update=update), self.assertRaises(ValueError):
                calculate(inventory(), mapping(), results(), issues=c)
