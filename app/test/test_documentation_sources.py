"""Published documentation resolves from the application source tree."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1] / 'src/app'


class DocumentationSourceTests(unittest.TestCase):
    def test_published_pages_include_their_source_content(self):
        pages = []
        for declaration in ROOT.rglob('_index.yaml'):
            for entry in re.split(r'(?m)^\s*- name: ', declaration.read_text())[1:]:
                if 'type: wippy.documentation.page' not in entry:
                    continue
                name = entry.splitlines()[0]
                with self.subTest(entry=name):
                    match = re.search(r'(?m)^\s+content: file://([^\s]+)\s*$', entry)
                    self.assertIsNotNone(match, 'Page content must reference its source file')
                    source = declaration.parent / match[1]
                    self.assertTrue(source.is_file(), 'Page source must ship with the application')
                    self.assertTrue(source.read_text().strip(), 'Page source must contain documentation')
                    pages.append(name)
        self.assertTrue(pages, 'Application must declare documentation pages')
