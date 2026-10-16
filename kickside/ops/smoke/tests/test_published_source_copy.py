import shutil
import tempfile
import unittest
from pathlib import Path

from scenarios_published_run_as import module_source_ignore


class PublishedSourceCopyTests(unittest.TestCase):
    def test_candidate_copy_keeps_shipped_tests_directories_and_drops_root_harnesses(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as work:
            source = Path(work) / 'keeper'
            for path in ('src/keeper/tests/api/_index.yaml', 'test/wippy.yaml', 'tests/case.lua',
                         'lint-harness/wippy.yaml', 'src/.wippy/cache', 'wippy.lock'):
                (source / path).parent.mkdir(parents=True, exist_ok=True)
                (source / path).write_text('x')
            target = Path(work) / 'copy'
            shutil.copytree(source, target, ignore=module_source_ignore(source))
            self.assertTrue((target / 'src/keeper/tests/api/_index.yaml').is_file())
            for path in ('test', 'tests', 'lint-harness', 'src/.wippy', 'wippy.lock'):
                self.assertFalse((target / path).exists(), path)


if __name__ == '__main__':
    unittest.main()
