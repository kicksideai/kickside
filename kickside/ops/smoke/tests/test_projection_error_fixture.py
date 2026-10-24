import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock

from harness import Cleanup
from projection_proc_error import refusing_proc_worker_source, verify_projection_proc_error
from scenarios import Context


class ProjectionErrorFixtureTests(unittest.TestCase):
    def test_process_fixture_supports_multiple_guards_in_one_instance(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            core = Path(directory) / 'selected-core'
            worker = core / 'test/src/test_refusing_proc_worker.lua'
            worker.parent.mkdir(parents=True)
            worker.write_text('return { run = function() return nil, "worker refused the batch" end }\n')
            inst = Mock(app=Path(directory), cleanup=Cleanup(),
                        config={'replace': {'kickside/core': str(core)}})
            (inst.app / 'src').mkdir()
            inst.request.return_value = {'projection_id': 'p', 'cursor_id': 'c'}
            ctx = Context(inst)
            ctx.restart_runtime = Mock()
            append = Mock()
            for identifier in ('journal-a', 'journal-b'):
                verify_projection_proc_error(ctx, thread_id=identifier, append_event=append)
            self.assertEqual([call.args[0] for call in append.call_args_list], ['journal-a', 'journal-b'])
            self.assertEqual(len(list((inst.app / 'src').iterdir())), 1)
            self.assertEqual((inst.app / 'src/projection-error-smoke/worker.lua').read_text(),
                             refusing_proc_worker_source(ctx))

    def test_owned_thread_is_created_after_the_runtime_restart(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            core = Path(directory) / 'selected-core'
            worker = core / 'test/src/test_refusing_proc_worker.lua'
            worker.parent.mkdir(parents=True)
            worker.write_text('return { run = function() return nil, "worker refused the batch" end }\n')
            inst = Mock(app=Path(directory), cleanup=Cleanup(),
                        config={'replace': {'kickside/core': str(core)}})
            (inst.app / 'src').mkdir()
            inst.request.return_value = {'projection_id': 'p', 'cursor_id': 'c'}
            ctx = Context(inst)
            order = []
            ctx.restart_runtime = lambda *args, **kwargs: order.append('restart')
            def factory():
                order.append('thread')
                return 'owned-journal'
            append = Mock()
            verify_projection_proc_error(ctx, thread_factory=factory, append_event=append)
            self.assertEqual(order, ['restart', 'thread'])
            append.assert_called_once_with('owned-journal')
