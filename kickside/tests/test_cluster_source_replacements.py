import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import yaml

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('cluster_source', ROOT / 'tests/cluster-2node/run.py')
CLUSTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CLUSTER)


class ClusterSourceReplacementsTest(unittest.TestCase):
    def test_preparation_resolves_modules_by_their_manifest_identity(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as temporary:
            root = Path(temporary)
            repo = root / 'kickside_kickside'
            fixture = root / 'fixture'
            for path in (repo / 'app/src', repo / 'app/test/e2e_fixture', fixture):
                path.mkdir(parents=True)
            modules = {
                'kickside/core': repo / 'core/core',
                'kickside/users': repo / 'platform/users',
                'kickside/sso': root / 'components/sso',
                'example/optional': root / 'components/optional',
                'kickside/sso-google': root / 'providers/sso-google',
                'example/provider': root / 'providers/provider',
            }
            for identity, path in modules.items():
                path.mkdir(parents=True)
                organization, module = identity.split('/')
                (path / 'wippy.yaml').write_text(yaml.safe_dump({'organization': organization, 'module': module}))
            node = CLUSTER.Node.__new__(CLUSTER.Node)
            node.root = root / 'node'
            node.app = node.root / 'app'
            node.name = 'node-a'
            node.gossip = {'node-a': 1, 'node-b': 2}
            node.identities = {'node-a': {'seed': 'fixture', 'public': 'fixture'}}
            with patch.object(CLUSTER, 'REPO', repo), patch.object(CLUSTER, 'FIXTURE', fixture):
                node.prepare()
            config = yaml.safe_load((node.root / 'overlay.yaml').read_text())
            self.assertEqual(config['workspace']['replacements'], {key: str(value) for key, value in modules.items()})


if __name__ == '__main__':
    unittest.main()
