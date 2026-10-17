"""Published documentation resolves from the application source tree."""
from pathlib import Path
import re
import subprocess
import tempfile
import textwrap
import unittest

ROOT = Path(__file__).resolve().parents[1] / 'src/app'


class DocumentationSourceTests(unittest.TestCase):
    def test_application_sources_pass_the_checker(self):
        result = subprocess.run(['node', 'scripts/check-wiki-sources.mjs'], cwd=ROOT.parents[1],
                                text=True, capture_output=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

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


class DocumentationCheckerTests(unittest.TestCase):
    def setUp(self):
        app = ROOT.parents[1]
        self.directory = tempfile.TemporaryDirectory(prefix='wiki-check-', dir=app / 'test')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        files = {
            'scripts/check-wiki-sources.mjs': (app / 'scripts/check-wiki-sources.mjs').read_text(),
            'templates/plugin/README.md': '# Template\n',
            'src/app/templates/plugin/plugin-template.md': '# Template\n',
            'src/app/documentation.lua': 'return {}\n',
            'test/documentation/src/documentation.lua': 'return {}\n',
            'src/app/README.md': '# Home\n',
            'src/app/docs/page.md': '# Page\n',
        }
        for name, content in files.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        self.registry(0, 2)

    def registry(self, root_indent, nested_indent):
        home = '''\
        - name: documentation.home
          kind: registry.entry
          meta:
            type: wippy.documentation.page
          data:
            path: README.md
            document_kind: guide
            content: file://README.md
        '''
        nested = '''\
        - name: documentation.page
          kind: registry.entry
          meta:
            type: wippy.documentation.page
          data:
            path: docs/page.md
            document_kind: guide
            content: file://../docs/page.md
        - name: documentation.template
          kind: registry.entry
          meta:
            type: wippy.documentation.page
          data:
            path: templates/plugin/plugin-template.md
            document_kind: guide
            content: file://../templates/plugin/plugin-template.md
        - name: documentation.navigation
          kind: registry.entry
          meta:
            type: wippy.documentation.navigation
          data:
            items:
              - title: Pages
                items:
                  - document: app:documentation.home
                  - document: app:documentation.page
                  - document: app:documentation.template
        '''
        for name, entries, indent in (
            ('_index.yaml', home, root_indent),
            ('registry/_index.yaml', nested, nested_indent),
        ):
            path = self.root / 'src/app' / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('version: "1.0"\nnamespace: app\nentries:\n'
                            + textwrap.indent(textwrap.dedent(entries), ' ' * indent))

    def check(self):
        return subprocess.run(['node', 'scripts/check-wiki-sources.mjs'], cwd=self.root,
                              text=True, capture_output=True, timeout=30)

    def test_registry_sequences_accept_both_indentation_styles(self):
        for indentation in ((0, 2), (2, 0)):
            with self.subTest(indentation=indentation):
                self.registry(*indentation)
                result = self.check()
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertIn('Documentation source check passed (3 pages,', result.stdout)

    def test_registry_fields_accept_yaml_quoting_order_and_comments(self):
        index = self.root / 'src/app/_index.yaml'
        index.write_text('''\
version: "1.0"
namespace: app
entries:
- data:
    content: "file://README.md"
    document_kind: 'guide'
    path: "README.md" # published path
  meta: {type: 'wippy.documentation.page'}
  kind: "registry.entry"
  name: 'documentation.home'
''')
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_navigation_rejects_unknown_pages(self):
        for indentation in ((0, 2), (2, 0)):
            with self.subTest(indentation=indentation):
                self.registry(*indentation)
                index = self.root / 'src/app/registry/_index.yaml'
                index.write_text(index.read_text().replace('document: app:documentation.home',
                                                          'document: "app:documentation.missing"'))
                result = self.check()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('Documentation navigation references an unknown page: '
                              'app:documentation.missing', result.stderr)

    def test_unpublished_sources_fail(self):
        (self.root / 'src/app/docs/unpublished.md').write_text('# Unpublished\n')
        result = self.check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Documentation page is not published by a registry entry: '
                      'docs/unpublished.md', result.stderr)

    def test_invalid_page_fields_fail(self):
        index = self.root / 'src/app/_index.yaml'
        index.write_text(index.read_text().replace('    document_kind: guide\n', ''))
        result = self.check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Invalid documentation page entry: documentation.home', result.stderr)

    def test_malformed_yaml_fails(self):
        index = self.root / 'src/app/_index.yaml'
        index.write_text(index.read_text() + 'invalid: [\n')
        result = self.check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('YAMLParseError', result.stderr)

    def test_definition_wiki_fails(self):
        index = self.root / 'src/app/_index.yaml'
        index.write_text(index.read_text() + '- name: definition\n  kind: ns.definition\n  wiki: []\n')
        result = self.check()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Documentation must use wippy.documentation.page registry entries', result.stderr)
