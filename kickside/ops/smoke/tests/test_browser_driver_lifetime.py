import os
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import Mock, patch

import browser
from harness import Cleanup, Failure, Scenario
from scenarios import Context
import smoke


class DriverLifetimeTests(unittest.TestCase):
    def run_scenarios(self, *, fail_run=False, fail_close=False, workers=1, pure_native=False):
        active, peaks, restored, threads = set(), [], [], []
        barrier = threading.Barrier(workers)
        lock = threading.Lock()

        class Session:
            def start(self):
                self.thread = threading.get_ident()
                with lock:
                    active.add(self)
                    peaks.append(len(active))

            def close(self):
                if self not in active:
                    return
                threads.append((self.thread, threading.get_ident()))
                with lock:
                    active.remove(self)
                if fail_close:
                    raise Failure('driver disconnect')

        def make_browser(inst, session, **options):
            session.start()
            value = Mock(errors=[], crashes=[])
            value.navigation.return_value = {'url': 'https://application.invalid/sessions/saved',
                                             'storage_state': {'cookies': []}}
            value.restore.side_effect = restored.append
            return value

        def operation(ctx):
            barrier.wait(timeout=3)
            ctx.state['receipt'] = 'saved'
            if fail_run:
                raise Failure('scenario fails')

        registry = [Scenario(name, 'regression', operation,
                             parallel=(f'native-root:kickside/{name}',) if pure_native else (name,),
                             issues=('DRIVER-LIFETIME',))
                    for name in ('first', 'second')]
        inst = Mock(cleanup=Cleanup())
        inst.evidence.paths = []
        inst.redactor.text.side_effect = str
        owner = Context(inst)
        pool = Mock(contexts={'scenarios': owner}, browser_areas=set())
        pool.context.return_value = owner
        pool.cleanup.return_value = []
        completions = []
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory, \
                patch.object(smoke, 'REGISTRY', registry), \
                patch.object(smoke, 'RuntimePool', return_value=pool), \
                patch.object(browser, 'BrowserSession', Session), \
                patch('scenarios.Browser', side_effect=make_browser):
            runner = smoke.EngineRunner({'source': '', 'replace': {}, 'binary': '/bin/true', 'model': {}},
                                        'sqlite', Path(directory))
            try:
                results = runner.run('regression', [], workers,
                                     completed=lambda row: completions.append((row.scenario, len(active))))
                self.assertEqual(active, set(), 'completed scenarios retain Chromium drivers')
                if not fail_run and not fail_close:
                    self.assertEqual(owner.state['receipt'], 'saved')
                    rerun = runner.run('regression', [], workers)
                    self.assertTrue(all(row.status == 'passed' for row in rerun))
                    self.assertEqual(len(restored), 0 if pure_native else 2,
                                     'saved navigation is lost on attached rerun')
            finally:
                self.assertEqual(runner.close().status, 'passed')
        self.assertLessEqual(max(peaks, default=0), workers)
        self.assertTrue(all(start == close for start, close in threads), 'driver closes on another thread')
        return results, completions

    def test_completed_independent_drivers_close_before_the_next_scenario(self):
        results, completions = self.run_scenarios()
        self.assertEqual([row.status for row in results], ['passed', 'passed'])
        self.assertEqual(completions, [('first', 0), ('second', 0)])

    def test_parallel_drivers_release_after_their_own_scenario(self):
        results, _ = self.run_scenarios(workers=2)
        self.assertEqual([row.status for row in results], ['passed', 'passed'])

    def test_parallel_native_claims_do_not_launch_a_browser(self):
        results, _ = self.run_scenarios(workers=2, pure_native=True)
        self.assertEqual([row.status for row in results], ['passed', 'passed'])

    def test_scenario_and_driver_cleanup_failures_both_reach_the_result(self):
        results, _ = self.run_scenarios(fail_run=True, fail_close=True)
        for row in results:
            self.assertEqual(row.status, 'failed')
            self.assertIn('scenario fails', row.error)
            self.assertIn('driver disconnect', row.error)
            self.assertEqual(row.failure_roots, [row.scenario])
