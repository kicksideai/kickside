"""A private fixture's instance claim does not reserve the shared instance."""
import threading
import unittest

from harness import Result, Scenario, schedule


class FixtureParallelClaimTests(unittest.TestCase):
    def test_fixture_runs_during_an_exclusive_shared_instance_scenario(self):
        barrier = threading.Barrier(2, timeout=1)
        scenarios = [Scenario('restart', 'full', None),
                     Scenario('fixture', 'full', None, parallel=('instance:fixture',))]
        def run(scenario):
            barrier.wait()
            return Result(scenario.name, 'sqlite', 'passed', 0)
        results = schedule(scenarios, run, {}, workers=2)
        self.assertEqual([result.status for result in results], ['passed', 'passed'])
