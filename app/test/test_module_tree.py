# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""The application manifest supports local replacement trees with build inputs."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


APP = Path(__file__).resolve().parents[1]


class ModuleTreeTests(unittest.TestCase):
    def test_local_replacement_excludes_node_dependencies_and_keeps_sources(self):
        with tempfile.TemporaryDirectory(prefix='app-tree-') as directory:
            root = Path(directory)
            module = root / 'module'
            source = module / 'src'
            source.mkdir(parents=True)
            (module / 'wippy.yaml').write_text((APP / 'wippy.yaml').read_text())
            (source / '_index.yaml').write_text(json.dumps({
                'version': '1.0', 'namespace': 'app', 'entries': [
                    {'name': 'module_tree_probe', 'kind': 'process.lua',
                     'source': 'file://probe.lua', 'method': 'run'},
                ],
            }))
            (source / 'probe.lua').write_text('return {run = function() return true end}\n')
            for parent in ('', 'frontend', 'frontend/applications/main', 'templates/plugin/ui'):
                binary = module / parent / 'node_modules/.bin/tool'
                binary.parent.mkdir(parents=True)
                binary.symlink_to('../tool/bin/tool.js')
            consumer = root / 'consumer'
            (consumer / 'src').mkdir(parents=True)
            (consumer / 'wippy.yaml').write_text(json.dumps({
                'organization': 'test', 'module': 'app-tree', 'directories': {'src': 'src'},
            }))
            (consumer / '.wippy.yaml').write_text(json.dumps({
                'version': '1.0', 'workspace': {'replacements': {'kickside/kickside': str(module)}},
                'registry': {'dispatch_internal_kinds': ['registry.entry', 'ns.dependency']},
            }))
            (consumer / 'src/_index.yaml').write_text(json.dumps({
                'version': '1.0', 'namespace': 'test', 'entries': [
                    {'name': 'app', 'kind': 'ns.dependency', 'component': 'kickside/kickside', 'version': '*'},
                    {'name': 'terminal', 'kind': 'terminal.host', 'lifecycle': {'auto_start': True}},
                ],
            }))
            command = [os.environ.get('WIPPY', 'wippy'), 'update', '--src-dir', 'src']
            loaded = subprocess.run(command, cwd=consumer, capture_output=True, text=True, timeout=60)
            self.assertEqual(loaded.returncode, 0, loaded.stdout + loaded.stderr)
            self.assertIn('kickside/kickside', (consumer / 'wippy.lock').read_text())
            command = [os.environ.get('WIPPY', 'wippy'), 'run', '-x', 'app:module_tree_probe']
            loaded = subprocess.run(command, cwd=consumer, capture_output=True, text=True, timeout=60)
            self.assertEqual(loaded.returncode, 0, loaded.stdout + loaded.stderr)
            (source / 'unexcluded.lua').symlink_to('probe.lua')
            rejected = subprocess.run(command, cwd=consumer, capture_output=True, text=True, timeout=60)
            self.assertNotEqual(rejected.returncode, 0, rejected.stdout + rejected.stderr)
            self.assertIn('module tree contains symlink', rejected.stdout + rejected.stderr)
