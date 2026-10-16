import json
import os
from pathlib import Path
import queue
import tempfile
import threading
import unittest
from unittest.mock import Mock, patch
from multiprocessing.connection import Client

from harness import Result
import smoke


LIMIT = 64 * 1024


class BoundedConnection:
    def __init__(self, connection):
        self.connection = connection

    def send_bytes(self, payload):
        if len(payload) > LIMIT:
            raise AssertionError('control frame exceeds 64 KiB')
        self.connection.send_bytes(payload)

    def recv_bytes(self, maxlength=None):
        return self.connection.recv_bytes(LIMIT if maxlength is None else min(LIMIT, maxlength))

    def __getattr__(self, name):
        return getattr(self.connection, name)

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class AttachedTransportTests(unittest.TestCase):
    def start_worker(self, root, runner):
        ready = threading.Event()
        errors = queue.Queue()
        authkey = os.urandom(32)
        smoke.private_json(root / 'startup.json', {
            'config': {}, 'engine': 'sqlite', 'authkey': authkey.hex(),
        })
        private_json = smoke.private_json

        def publish(path, value):
            private_json(path, value)
            if path.name == 'worker.json':
                ready.set()

        def serve():
            try:
                smoke.serve(root)
            except BaseException as failure:
                errors.put(failure)

        patches = [patch.object(smoke, 'EngineRunner', return_value=runner),
                   patch.object(smoke.signal, 'signal'),
                   patch.object(smoke, 'private_json', side_effect=publish)]
        for active in patches:
            active.start()
            self.addCleanup(active.stop)
        worker = threading.Thread(target=serve, daemon=True)
        worker.start()
        self.assertTrue(ready.wait(5), 'worker publishes its endpoint')
        descriptor = json.loads((root / 'worker.json').read_text())
        self.addCleanup(self.stop_worker, root, worker, errors, descriptor)
        return descriptor, worker, errors

    def stop_worker(self, root, worker, errors, descriptor):
        if worker.is_alive():
            with Client(tuple(descriptor['address']), authkey=bytes.fromhex(descriptor['authkey'])) as connection:
                smoke.send_message(connection, root, {'action': 'shutdown'})
                smoke.receive_message(connection, root)
        worker.join(5)
        self.assertFalse(worker.is_alive(), 'worker terminates after shutdown')
        if not errors.empty():
            raise errors.get()

    def roundtrip(self, command):
        runner = Mock()
        runner.pool.instances = {}
        runner.config = {}
        runner.outcomes = {}
        runner.restart_reasons = []
        runner.synchronize.return_value = {'restart': [], 'changed': [], 'edits': [], 'assets': []}
        runner.close.return_value = Result('cleanup', 'sqlite', 'passed', 0)
        large = Result('large-error', 'sqlite', 'failed', 0, 'E' * (LIMIT * 32))

        def run(tier, names, workers, completed):
            completed(large)
            return [large]

        runner.run.side_effect = run
        directory = tempfile.TemporaryDirectory(dir=os.environ['TMPDIR'])
        self.addCleanup(directory.cleanup)
        root = Path(directory.name)
        attached = root / '.attached-sqlite'
        attached.mkdir()
        self.start_worker(attached, runner)
        config = {'run_root': root, 'large_command': command}
        with patch.object(smoke, 'Client', side_effect=lambda *args, **kwargs:
                          BoundedConnection(Client(*args, **kwargs))):
            results, timing = smoke.attached(config, 'sqlite', root / 'run', 'full', ['large-error'], 1)
        self.assertEqual(results[0].error, large.error)
        self.assertEqual(timing['mode'], 'attached')
        self.assertEqual(runner.synchronize.call_args.args[0]['large_command'], config['large_command'])
        self.assertTrue(list(attached.glob('control-*.json')), 'large payloads live in the run root')

    def test_attached_oversized_result_and_command_use_bounded_frames(self):
        self.roundtrip('C' * (LIMIT * 2))

    def test_attached_oversized_result_with_a_small_command_uses_bounded_frames(self):
        self.roundtrip('small')

    def test_oversized_authentication_frame_is_reported_and_worker_remains_available(self):
        runner = Mock()
        runner.close.return_value = Result('cleanup', 'sqlite', 'passed', 0)
        directory = tempfile.TemporaryDirectory(dir=os.environ['TMPDIR'])
        self.addCleanup(directory.cleanup)
        root = Path(directory.name)
        with patch.object(smoke.sys, 'stderr') as diagnostic:
            descriptor, worker, errors = self.start_worker(root, runner)
            with Client(tuple(descriptor['address'])) as unauthenticated:
                self.assertTrue(unauthenticated.recv_bytes(256).startswith(b'#CHALLENGE#'))
                unauthenticated.send_bytes(b'X' * 257)
            self.stop_worker(root, worker, errors, descriptor)
            self.assertIn('bad message length', str(diagnostic.write.call_args_list))


class ControlMessageTests(unittest.TestCase):
    def test_missing_payload_file_returns_the_read_failure(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            connection = Mock()
            connection.recv_bytes.return_value = json.dumps({'payload_file': 'control-' + '0' * 32 + '.json'}).encode()
            with self.assertRaises(FileNotFoundError):
                smoke.receive_message(connection, Path(directory))
            connection.recv_bytes.assert_called_once_with(LIMIT)

    def test_payload_descriptor_cannot_read_outside_the_run_root(self):
        connection = Mock()
        connection.recv_bytes.return_value = b'{"payload_file":"../result.json"}'
        with self.assertRaisesRegex(ValueError, 'Invalid control payload filename'):
            smoke.receive_message(connection, Path(os.environ['TMPDIR']))

    def test_non_protocol_accept_failure_remains_visible_and_closes_the_peer(self):
        connection, listener = Mock(), Mock()
        listener.accept.return_value = connection
        failure = OSError('transport I/O fails')
        with patch.object(smoke, 'deliver_challenge', side_effect=failure):
            with self.assertRaises(OSError) as raised:
                smoke.accept_authenticated(listener, b'key')
        self.assertIs(raised.exception, failure)
        connection.close.assert_called_once_with()


if __name__ == '__main__':
    unittest.main()
