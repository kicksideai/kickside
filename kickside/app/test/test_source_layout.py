"""Source replacement discovery stays within the application's registry tree."""
from pathlib import Path
import unittest
import yaml

class SourceLayout(unittest.TestCase):
    def test_public_manifest_uses_the_application_source_directory(self):
        app = Path(__file__).resolve().parents[1]
        manifest = yaml.safe_load((app / 'wippy.yaml').read_text())
        self.assertEqual(manifest.get('directories', {}).get('src'), './src')
        self.assertTrue((app / manifest['directories']['src'] / 'app/_index.yaml').is_file())

if __name__ == '__main__':
    unittest.main()
