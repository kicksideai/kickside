"""Native harnesses resolve public inputs and own their CI databases."""
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PublicHarnessTests(unittest.TestCase):
    def test_stateful_postgres_jobs_allocate_and_select_owned_databases(self):
        workflow = (ROOT / '.github/workflows/ci.yml').read_text()
        jobs = re.split(r'(?m)^        - module: ', workflow)[1:]
        checked = []
        for job in jobs:
            module = job.splitlines()[0]
            if not re.search(r'(?m)^          engine: postgres$', job):
                continue
            harness = ROOT / module / 'test/.wippy.yaml'
            if not harness.is_file() or not re.search(r'(?m)^  pg_database:', harness.read_text()):
                continue
            with self.subTest(module=module):
                self.assertIn('createdb "$database"', job)
                self.assertIn('trap cleanup_databases EXIT', job)
                for command in job.splitlines():
                    if 'wippy lint' in command or 'wippy test' in command:
                        self.assertIn('--set "vars.pg_database=${databases[0]}"', command)
            checked.append(module)
        self.assertTrue(checked, 'CI must exercise stateful PostgreSQL harnesses')

    def test_workspace_replacements_resolve_from_public_sources(self):
        paths = subprocess.check_output(['git', 'ls-files', '**/.wippy.yaml', '**/wippy.yaml'],
                                        cwd=ROOT, text=True).splitlines()
        checked = []
        for path in paths:
            config = ROOT / path
            workspace = re.search(r'(?m)^workspace:\n  replacements:\n((?:[ \t]+[^\n]*\n|\n)*)',
                                  config.read_text())
            if workspace is None:
                continue
            for target in re.findall(r'(?m)^    [^#\s][^:]*: (.+)$', workspace[1]):
                directory = config.parent / target.strip().strip("\"'")
                with self.subTest(config=path, replacement=target):
                    self.assertTrue(directory.is_dir(), 'Replacement must resolve from public sources')
                checked.append(directory)
        self.assertTrue(checked, 'Harness configurations must exercise local source replacements')
