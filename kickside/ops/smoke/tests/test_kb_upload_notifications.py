import os
from contextlib import nullcontext
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch


class KBUploadNotificationsTests(unittest.TestCase):
    def test_stages_private_spec_and_tooling_with_selected_kb10_source(self):
        from scenarios_kb_upload_notifications import kb_upload_notifications

        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            selected = workspace / 'selected-kb10'
            source = selected / 'ui/src/app/useIngest.ts'
            source.parent.mkdir(parents=True)
            source.write_text('selected upload implementation\n')
            ctx = Mock()
            ctx.inst.root = workspace / 'run'
            ctx.inst.env = {'PATH': os.environ['PATH']}
            ctx.inst.config = {'replace': {'kickside/kb10': str(selected)}}

            def run(command, **kwargs):
                overlay = Path(kwargs['cwd'])
                self.assertEqual((overlay / 'ui/src/app/useIngest.ts').read_text(),
                                 'selected upload implementation\n')
                self.assertTrue((overlay / 'ui/src/app/useIngest.spec.ts').is_file())
                self.assertTrue((overlay / 'ui/.smoke/kb10-frontend/test-setup.ts').is_file())
                self.assertTrue((overlay / 'ui/.smoke/kb10-frontend/vitest.config.ts').is_file())
                self.assertEqual(command, ['make', '-f', '.smoke/kb10-frontend/Makefile', 'test'])
                return subprocess.CompletedProcess(command, 0, 'Tests 1 passed (1)\n', '')

            with patch('scenarios_kb_upload_notifications.subprocess.run', side_effect=run):
                kb_upload_notifications(ctx)

        ctx.inst.evidence.save.assert_called_once()

    def test_rejects_a_successful_process_without_a_nonzero_vitest_verdict(self):
        from harness import Failure
        from scenarios_kb_upload_notifications import kb_upload_notifications

        ctx = Mock()
        ctx.inst.env = {'PATH': os.environ['PATH']}
        with patch('scenarios_kb_upload_notifications.selected_module_overlay',
                   return_value=nullcontext(Path('/tmp/kb10'))), \
             patch('scenarios_kb_upload_notifications.subprocess.run',
                   return_value=subprocess.CompletedProcess([], 0, 'Tests 0 passed (0)\n', '')):
            with self.assertRaises(Failure):
                kb_upload_notifications(ctx)
