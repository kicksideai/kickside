import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch


class KB10BrowserDeadlineTests(unittest.TestCase):
    def test_stages_private_layout_checks_with_the_selected_kb10_source(self):
        from scenarios_kb10_browser_deadline import kb10_browser_deadline

        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            workspace = Path(directory)
            selected = workspace / 'selected-kb10'
            styles = selected / 'ui/src/styles.css'
            styles.parent.mkdir(parents=True)
            styles.write_text('selected KB10 styles\n')
            ctx = Mock()
            ctx.inst.root = workspace / 'run'
            ctx.inst.env = {'PATH': os.environ['PATH']}
            ctx.inst.config = {'replace': {'kickside/kb10': str(selected)}}
            observed = []

            def run(command, **kwargs):
                overlay = Path(kwargs['cwd'])
                observed.append((command, overlay))
                self.assertEqual((overlay / 'ui/src/styles.css').read_text(), 'selected KB10 styles\n')
                self.assertTrue((overlay / 'ui/tests/test_drawer_deadline.py').is_file())
                self.assertTrue((overlay / 'ui/tests/drawer_layout_test.py').is_file())
                return subprocess.CompletedProcess(command, 0, 'passed\n', '')

            with patch('scenarios_kb10_browser_deadline.subprocess.run', side_effect=run):
                kb10_browser_deadline(ctx)

        self.assertEqual([command[:2] for command, _ in observed], [
            [os.sys.executable, '-m'], [os.sys.executable, 'ui/tests/drawer_layout_test.py'],
        ])
        self.assertEqual([call.args[0] for call in ctx.inst.evidence.save.call_args_list], [
            'kb10-browser-deadline-deadline', 'kb10-browser-deadline-layout',
        ])
