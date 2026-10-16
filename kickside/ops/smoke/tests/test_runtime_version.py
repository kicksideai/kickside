import subprocess
import unittest
from unittest.mock import patch

import smoke

BANNER = '''
  ╦ ╦╦╔═╗╔═╗╦ ╦  Adaptive Application Runtime https://wippy.ai
  ║║║║╠═╝╠═╝╚╦╝  {version} 2026-10-05
'''


def reported(version):
    return subprocess.CompletedProcess([], 0, stdout=BANNER.format(version=version), stderr='')


class RuntimeVersionTests(unittest.TestCase):
    def test_records_the_version_the_binary_reports(self):
        for version in ('v0.3.44a', 'nightly-20261005-7459f97'):
            with self.subTest(version=version), patch.dict('os.environ', {}, clear=True), \
                    patch('smoke.subprocess.run', return_value=reported(version)):
                self.assertEqual(version, smoke.runtime_version('wippy'))

    def test_declared_expectation_must_match(self):
        with patch.dict('os.environ', {'SMOKE_WIPPY_VERSION': 'v0.3.44a'}, clear=True), \
                patch('smoke.subprocess.run', return_value=reported('nightly-20261005-7459f97')):
            with self.assertRaisesRegex(ValueError, 'v0.3.44a'):
                smoke.runtime_version('wippy')

    def test_unrecognized_output_fails(self):
        with patch.dict('os.environ', {}, clear=True), \
                patch('smoke.subprocess.run', return_value=subprocess.CompletedProcess([], 0, stdout='wippy', stderr='')):
            with self.assertRaisesRegex(ValueError, 'version'):
                smoke.runtime_version('wippy')


if __name__ == '__main__':
    unittest.main()
