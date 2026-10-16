"""Concurrent scenarios clean only the resources they register."""
from concurrent.futures import ThreadPoolExecutor
import threading
import unittest

from harness import Cleanup


class ParallelCleanupTests(unittest.TestCase):
    def test_scenario_cleanup_stays_on_the_registering_worker(self):
        cleanup = Cleanup()
        barrier = threading.Barrier(2, timeout=1)
        executed = []
        def worker(identifier):
            owner = threading.get_ident()
            def close():
                self.assertEqual(threading.get_ident(), owner)
                executed.append(identifier)
            cleanup.add(str(identifier), close, scope='scenario')
            barrier.wait()
            return cleanup.run(scope='scenario')
        with ThreadPoolExecutor(max_workers=2) as pool:
            errors = list(pool.map(worker, (1, 2)))
        self.assertEqual(errors, [[], []])
        self.assertEqual(sorted(executed), [1, 2])
        self.assertEqual(cleanup.run(), [])

    def test_final_cleanup_retains_resources_from_a_failed_worker(self):
        cleanup = Cleanup()
        executed = []
        with ThreadPoolExecutor(max_workers=1) as pool:
            pool.submit(cleanup.add, 'remaining resource', lambda: executed.append('closed'), scope='scenario').result()
        self.assertEqual(cleanup.run(), [])
        self.assertEqual(executed, ['closed'])
