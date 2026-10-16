import os
from pathlib import Path
import tempfile
import unittest

import yaml

from upgrade_regressions import candidate_dependency_sources


class CandidateDependencySourcesTests(unittest.TestCase):
    def modules(self, root, declarations):
        sources = {}
        for module, dependencies in declarations.items():
            directory = root / module.replace('/', '_')
            source = directory / 'registry'
            source.mkdir(parents=True)
            (directory / 'wippy.yaml').write_text(yaml.safe_dump({'directories': {'src': 'registry'}}))
            (source / '_index.yaml').write_text(yaml.safe_dump({'namespace': module.replace('/', '.'),
                'entries': [{'name': 'dependency_' + str(index), 'kind': 'ns.dependency', 'component': dependency}
                            for index, dependency in enumerate(dependencies)]}))
            sources[module] = str(directory)
        return sources

    def test_selects_complete_transitive_local_closure_and_keeps_external_dependencies_external(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            sources = self.modules(Path(directory), {'example/app': ['example/core', 'vendor/external'],
                'example/core': ['example/jobs'], 'example/jobs': [], 'example/unrelated': []})
            self.assertEqual(candidate_dependency_sources(sources, ('example/app',)),
                {name: sources[name] for name in ('example/app', 'example/core', 'example/jobs')})

    def test_optional_roots_include_their_own_dependency_closure(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            sources = self.modules(Path(directory), {'example/app': [], 'example/optional': ['shared/service'],
                                                    'shared/service': []})
            self.assertEqual(candidate_dependency_sources(sources, ('example/app', 'example/optional')), sources)

    def test_shared_dependency_and_cycles_do_not_duplicate_sources(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            sources = self.modules(Path(directory), {'example/app': ['example/core', 'example/jobs'],
                'example/core': ['example/jobs'], 'example/jobs': ['example/core']})
            self.assertEqual(candidate_dependency_sources(sources, ('example/app',)), sources)

    def test_application_source_joins_the_same_transitive_candidate_closure(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            sources = self.modules(Path(directory), {'example/app': ['example/core'], 'example/core': []})
            application = Path(sources.pop('example/app'))
            manifest = yaml.safe_load((application / 'wippy.yaml').read_text())
            manifest.update(organization='example', module='app', type='application')
            (application / 'wippy.yaml').write_text(yaml.safe_dump(manifest))
            original = dict(sources)
            self.assertEqual(candidate_dependency_sources(sources, ('example/app',), application=application),
                             {'example/app': str(application), **sources})
            self.assertEqual(sources, original)

    def test_missing_requested_root_fails(self):
        with self.assertRaisesRegex(ValueError, 'Missing candidate.*example/app'):
            candidate_dependency_sources({}, ('example/app',))

    def test_source_manifest_errors_propagate(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with self.assertRaises(FileNotFoundError):
                candidate_dependency_sources({'example/app': directory}, ('example/app',))
