import json
import os
from pathlib import Path
import select
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

from harness import Failure


class ProcessSupervisionTests(unittest.TestCase):
    def start(self, script):
        process = subprocess.Popen([sys.executable, '-u', '-c', script],
                                   stdout=subprocess.PIPE, text=True)
        self.addCleanup(process.stdout.close)
        self.addCleanup(self.stop, process)
        self.assertTrue(select.select([process.stdout], [], [], 3)[0], 'Child never becomes ready')
        return process, json.loads(process.stdout.readline())

    def stop(self, process):
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=3)

    def test_stubborn_owned_descendants_stop_with_failure_evidence(self):
        from process_supervision import owned_process, stop_owned_tree
        child = "import signal,time; signal.signal(signal.SIGTERM, signal.SIG_IGN); print('ready', flush=True); time.sleep(60)"
        script = "import subprocess,sys,json,signal,time; signal.signal(signal.SIGTERM, signal.SIG_IGN); p=subprocess.Popen([sys.executable,'-u','-c'," + repr(child) + "],stdout=subprocess.PIPE,text=True); p.stdout.readline(); print(json.dumps({'child':p.pid}),flush=True); time.sleep(60)"
        process, ready = self.start(script)
        descendant = owned_process(ready['child'])
        self.addCleanup(stop_owned_tree, descendant, grace_seconds=0.05)
        receipt = stop_owned_tree(owned_process(process.pid), grace_seconds=0.05)
        process.wait(timeout=3)
        self.assertEqual(receipt['status'], 'forced')
        self.assertEqual({r['pid'] for r in receipt['processes']}, {process.pid, ready['child']})
        self.assertTrue(all(r['stopped'] for r in receipt['processes']))

    def test_descendants_spawned_by_worker_threads_are_owned(self):
        from process_supervision import owned_process, stop_owned_tree
        child = "import signal,time; signal.signal(signal.SIGTERM, signal.SIG_IGN); print('ready',flush=True); time.sleep(60)"
        script = "import subprocess,sys,json,signal,time,threading; signal.signal(signal.SIGTERM,signal.SIG_IGN); " + "exec(" + repr("def spawn():\n p=subprocess.Popen([sys.executable,'-u','-c'," + repr(child) + "],stdout=subprocess.PIPE,text=True)\n p.stdout.readline()\n print(json.dumps({'child':p.pid}),flush=True)\n time.sleep(60)\nthreading.Thread(target=spawn).start()\ntime.sleep(60)") + ")"
        process, ready = self.start(script)
        descendant = owned_process(ready['child'])
        self.addCleanup(stop_owned_tree, descendant, grace_seconds=0.05)
        receipt = stop_owned_tree(owned_process(process.pid), grace_seconds=0.05)
        process.wait(timeout=3)
        self.assertEqual({r['pid'] for r in receipt['processes']}, {process.pid, ready['child']})
        self.assertTrue(all(r['stopped'] for r in receipt['processes']))

    def test_forced_shutdown_failure_does_not_leave_a_process_suspended(self):
        import process_supervision
        import signal
        process, _ = self.start("import json,signal,time; signal.signal(signal.SIGTERM,signal.SIG_IGN); print(json.dumps({}),flush=True); time.sleep(60)")
        record = process_supervision.owned_process(process.pid)
        original = process_supervision._signal
        def signal_owned(owned, value):
            if value == signal.SIGKILL:
                raise PermissionError('Signal fails')
            original(owned, value)
        with patch('process_supervision._signal', side_effect=signal_owned) as sent:
            with self.assertRaisesRegex(PermissionError, 'Signal fails'):
                process_supervision.stop_owned_tree(record, grace_seconds=0)
        self.assertIn(signal.SIGCONT, [call.args[1] for call in sent.call_args_list])

    def test_normal_owned_process_retains_graceful_shutdown(self):
        from process_supervision import owned_process, stop_owned_tree
        process, _ = self.start("import json,time; print(json.dumps({}),flush=True); time.sleep(60)")
        receipt = stop_owned_tree(owned_process(process.pid), grace_seconds=1)
        process.wait(timeout=3)
        self.assertEqual(receipt['status'], 'graceful')
        self.assertTrue(receipt['processes'][0]['stopped'])

    def test_stale_identity_never_signals_a_reused_pid(self):
        from process_supervision import stop_owned_tree
        process, _ = self.start("import json,time; print(json.dumps({}),flush=True); time.sleep(60)")
        with self.assertRaisesRegex(Failure, 'ownership'):
            stop_owned_tree({'pid': process.pid, 'identity': 'stale'}, grace_seconds=0.05)
        self.assertIsNone(process.poll())

    def test_completed_process_requires_no_signal(self):
        from process_supervision import stop_owned_tree
        process, _ = self.start("import json; print(json.dumps({}),flush=True)")
        process.wait(timeout=3)
        receipt = stop_owned_tree({'pid': process.pid, 'identity': 'finished'}, grace_seconds=0.05)
        self.assertEqual(receipt['status'], 'exited')


class WorkerCleanupTests(unittest.TestCase):
    def test_worker_cleanup_stops_at_the_existing_thirty_second_wait(self):
        import smoke
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'sqlite').mkdir()
            (root / 'sqlite/worker-process.json').write_text(json.dumps({'pid': 123, 'identity': 'own'}))
            process = Mock(pid=123)
            process.is_alive.side_effect = [True, True, False]
            results = []
            with patch('smoke.stop_owned_tree', return_value={'status': 'forced', 'processes': []}) as stop, \
                 patch('smoke.reap_orphan_databases', return_value=[]):
                smoke.finish_worker(process, 'sqlite', root, {}, results)
            stop.assert_called_once_with({'pid': 123, 'identity': 'own'}, grace_seconds=0)
            self.assertEqual([call.kwargs['timeout'] for call in process.join.call_args_list], [30, 10])
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0].status, 'failed')
            self.assertIn('30 seconds', results[0].error)
            self.assertTrue(Path(results[0].evidence_paths[0]).is_file())

    def test_forced_worker_reaps_only_its_recorded_databases(self):
        import smoke
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            worker = root / 'postgres'
            worker.mkdir()
            (worker / 'worker-process.json').write_text(json.dumps({'pid': 123, 'identity': 'own'}))
            (worker / 'database.json').write_text(json.dumps({'pid': 123, 'identity': 'own', 'db': 'owned_scratch'}))
            outside = root / 'other-worker'
            outside.mkdir()
            record = outside / 'database.json'
            record.write_text(json.dumps({'pid': 456, 'identity': 'other', 'db': 'other_scratch'}))
            process = Mock(pid=123)
            process.is_alive.side_effect = [True, True, False]
            results = []
            with patch('smoke.stop_owned_tree', return_value={'status': 'forced', 'processes': []}), \
                 patch('runtime.process_identity', return_value=None), patch('smoke.psql') as execute:
                smoke.finish_worker(process, 'postgres', root, {'pg': {}}, results)
            statements = [call.args[2] for call in execute.call_args_list]
            self.assertEqual(len(statements), 2)
            self.assertIn('owned_scratch', statements[0])
            self.assertEqual(statements[1], 'DROP DATABASE IF EXISTS "owned_scratch"')
            self.assertTrue(record.is_file())
            self.assertFalse((worker / 'database.json').exists())
            evidence = json.loads(Path(results[0].evidence_paths[0]).read_text())
            self.assertEqual(evidence['owned_databases_dropped'], ['owned_scratch'])

    def test_worker_record_mismatch_refuses_forced_shutdown(self):
        import smoke
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'sqlite').mkdir()
            (root / 'sqlite/worker-process.json').write_text(json.dumps({'pid': 456, 'identity': 'other'}))
            process = Mock(pid=123)
            process.is_alive.return_value = True
            with patch('smoke.stop_owned_tree') as stop:
                with self.assertRaisesRegex(RuntimeError, 'ownership'):
                    smoke.finish_worker(process, 'sqlite', root, {}, [])
            stop.assert_not_called()

    def test_completed_worker_needs_no_forced_shutdown(self):
        import smoke
        process = Mock()
        process.is_alive.return_value = False
        with patch('smoke.stop_owned_tree') as stop:
            results = []
            smoke.finish_worker(process, 'sqlite', Path('unused'), {}, results)
        stop.assert_not_called()
        process.terminate.assert_not_called()
        self.assertEqual(results, [])
