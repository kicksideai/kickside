import os
from contextlib import nullcontext
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch


class KnowledgeAskCapabilityTests(unittest.TestCase):
    def test_stages_the_private_ask_spec_with_selected_kb10_bytes(self):
        from scenarios_knowledge_ask import knowledge_ask_capability

        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            selected = workspace / 'selected-kb10'
            component = selected / 'ui/src/app/shared/KbSearch.vue'
            component.parent.mkdir(parents=True)
            component.write_text('selected Ask component\n')
            ctx = Mock()
            ctx.inst.root = workspace / 'run'
            ctx.inst.env = {'PATH': os.environ['PATH']}
            ctx.inst.config = {'replace': {'kickside/kb10': str(selected)}}

            def run(command, **kwargs):
                overlay = Path(kwargs['cwd'])
                self.assertEqual((overlay / 'ui/src/app/shared/KbSearch.vue').read_text(),
                                 'selected Ask component\n')
                self.assertTrue((overlay / 'ui/src/app/shared/KbSearch.spec.ts').is_file())
                self.assertTrue((overlay / 'ui/.smoke/kb10-frontend/test-setup.ts').is_file())
                self.assertEqual(command, ['make', '-f', '.smoke/kb10-frontend/Makefile', 'test'])
                return subprocess.CompletedProcess(command, 0, 'Tests 1 passed (1)\n', '')

            with patch('scenarios_knowledge_ask.subprocess.run', side_effect=run):
                knowledge_ask_capability(ctx)

        ctx.inst.evidence.save.assert_called_once()

    def test_rejects_a_successful_process_without_a_nonzero_vitest_verdict(self):
        from harness import Failure
        from scenarios_knowledge_ask import knowledge_ask_capability

        ctx = Mock()
        ctx.inst.env = {'PATH': os.environ['PATH']}
        with patch('scenarios_knowledge_ask.selected_module_overlay',
                   return_value=nullcontext(Path('/tmp/kb10'))), \
             patch('scenarios_knowledge_ask.subprocess.run',
                   return_value=subprocess.CompletedProcess([], 0, 'Tests 0 passed (0)\n', '')):
            with self.assertRaises(Failure):
                knowledge_ask_capability(ctx)
