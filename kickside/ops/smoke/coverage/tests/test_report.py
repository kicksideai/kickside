import copy
import unittest
from report import calculate, planned


def inventory():
    return {'schema_version': 1, 'components': {
        'kickside/a': {'features': [{'id': 'a:1'}, {'id': 'a:2'}]},
        'chestor/b': {'features': [{'id': 'b:1'}, {'id': 'b:2'}]}}}


def mapping():
    return {'schema_version': 1, 'scenarios': {'one': {'tier': 'quick', 'features': ['a:1', 'b:1']},
                                             'two': {'tier': 'full', 'features': ['a:2', 'b:2']}}}


def run(status='passed'):
    return {'results': [{'scenario': name, 'engine': engine, 'status': status}
                        for name in ('one', 'two') for engine in ('sqlite', 'postgres')] +
            [{'scenario': 'cleanup', 'engine': engine, 'status': 'passed'} for engine in ('sqlite', 'postgres')]}


class ReportTests(unittest.TestCase):
    def test_regular_plans_exclude_opt_in_chat_features(self):
        mapped = mapping()
        mapped['scenarios']['two']['tier'] = 'chat'
        self.assertEqual(planned(inventory(), mapped, 'full')['overall']['percent'], 50)
        self.assertEqual(planned(inventory(), mapped, 'chat')['overall']['percent'], 50)

    def test_complete_both_engines(self):
        result = calculate(inventory(), mapping(), run())
        self.assertTrue(result['gate_passed'])
        self.assertEqual(100, result['overall']['percent'])

    def test_only_passed_counts(self):
        for status in ('failed', 'skipped: no model configured'):
            with self.subTest(status=status):
                result = calculate(inventory(), mapping(), run(status))
                self.assertEqual(0, result['overall']['covered'])
                self.assertFalse(result['gate_passed'])

    def test_missing_engine_cannot_pass(self):
        r = run(); r['results'] = [row for row in r['results'] if row['engine'] == 'sqlite']
        result = calculate(inventory(), mapping(), r)
        self.assertEqual(0, result['overall']['covered'])
        self.assertEqual(100, result['engines']['sqlite']['overall']['percent'])
        self.assertFalse(result['gate_passed'])

    def test_missing_cleanup_prevents_accepting_an_in_progress_run(self):
        r = run(); r['results'] = [row for row in r['results'] if row['scenario'] != 'cleanup']
        result = calculate(inventory(), mapping(), r)
        self.assertEqual(100, result['overall']['percent'])
        self.assertFalse(result['gate_passed'])
        self.assertTrue(any('cleanup' in failure for failure in result['failures']))

    def test_intersection_of_features_across_engines(self):
        r = run(); r['results'][1]['status'] = 'failed'
        result = calculate(inventory(), mapping(), r)
        self.assertEqual(2, result['overall']['covered'])
        self.assertEqual(50, result['components']['kickside/a']['percent'])

    def test_duplicate_coverage_does_not_inflate(self):
        m = mapping(); m['scenarios']['two']['features'] = ['a:1', 'b:1']
        self.assertEqual(50, calculate(inventory(), m, run())['overall']['percent'])

    def test_per_component_floor(self):
        m = mapping(); m['scenarios']['two']['features'] = ['a:2']
        result = calculate(inventory(), m, run(), threshold=75)
        self.assertEqual(75, result['overall']['percent'])
        self.assertFalse(result['gate_passed'])
        self.assertIn('chestor/b', ' '.join(result['failures']))

    def test_explicit_floor_applies_to_every_component(self):
        m = mapping(); m['scenarios']['two']['features'] = ['a:2']
        self.assertTrue(calculate(inventory(), m, run(), threshold=75, component_floor=50)['gate_passed'])

    def test_failed_run_fails_even_with_complete_coverage(self):
        r = run(); next(row for row in r['results'] if row['scenario'] == 'cleanup' and row['engine'] == 'sqlite')['status'] = 'failed'
        self.assertEqual(100, calculate(inventory(), mapping(), r)['overall']['percent'])
        self.assertFalse(calculate(inventory(), mapping(), r)['gate_passed'])

    def test_unknown_features_and_scenarios_fail(self):
        m = mapping(); m['scenarios']['one']['features'].append('unknown')
        with self.assertRaisesRegex(ValueError, 'Unknown feature'):
            calculate(inventory(), m, run())
        r = run(); r['results'][0]['scenario'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'Unknown scenario'):
            calculate(inventory(), mapping(), r)

    def test_malformed_status_duplicates_and_features_fail(self):
        for mutate in [lambda r: r['results'][0].update(status='PASS'),
                       lambda r: r['results'].append(copy.deepcopy(r['results'][0])),
                       lambda r: r['results'][0].update(features=['a:2'])]:
            r = run(); mutate(r)
            with self.assertRaises(ValueError):
                calculate(inventory(), mapping(), r)

    def test_empty_inventory_and_invalid_thresholds_fail(self):
        with self.assertRaises(ValueError):
            calculate({'schema_version': 1, 'components': {}}, mapping(), run())
        for value in (-1, 101, float('nan')):
            with self.subTest(value=value), self.assertRaises(ValueError):
                calculate(inventory(), mapping(), run(), threshold=value)

    def test_result_rows_cannot_be_replaced_by_aggregate_counts(self):
        r = {'counts': {'passed': 999, 'failed': 0}, 'results': []}
        result = calculate(inventory(), mapping(), r)
        self.assertEqual(0, result['overall']['covered'])
        self.assertFalse(result['gate_passed'])

    def test_invalid_embedded_ids_do_not_count(self):
        r = run(); r['results'][0]['features'] = ['a:1', 'unknown']
        with self.assertRaises(ValueError):
            calculate(inventory(), mapping(), r)

    def test_successful_cleanup_adds_no_features(self):
        r = {'results': [{'scenario': 'cleanup', 'engine': engine, 'status': 'passed'}
                         for engine in ('sqlite', 'postgres')]}
        self.assertEqual(0, calculate(inventory(), mapping(), r)['overall']['covered'])

    def test_threshold_uses_unrounded_ratio(self):
        inv = inventory(); inv['components']['kickside/a']['features'].append({'id': 'a:3'})
        result = calculate(inv, mapping(), run(), threshold=80.001, component_floor=0)
        self.assertFalse(result['gate_passed'])


if __name__ == '__main__':
    unittest.main()


class IntegrationResultTests(unittest.TestCase):
    def test_prerequisite_metadata_never_contributes_coverage(self):
        document = run()
        for row in document['results']:
            if row['scenario'] == 'two':
                row.update(status='failed', owner='scenarios_ai', blocked_by=['one'], failure_roots=['one'])
        result = calculate(inventory(), mapping(), document)
        self.assertEqual(result['overall']['percent'], 50)
        self.assertFalse(result['gate_passed'])
        self.assertIn('sqlite/two fails', result['failures'])
        self.assertIn('postgres/two fails', result['failures'])
