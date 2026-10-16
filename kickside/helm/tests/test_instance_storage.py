from pathlib import Path
import unittest


class HelmInstanceStorageTest(unittest.TestCase):
    def test_helm_places_instance_data_on_the_data_volume(self):
        chart = Path(__file__).resolve().parents[1]
        deployment = (chart / 'templates/deployment.yaml').read_text()
        self.assertIn('"vars.instance_data_dir=/data"', deployment)
        self.assertIn('mountPath: /data', deployment)
        self.assertIn('fsGroup: 10001', deployment)
