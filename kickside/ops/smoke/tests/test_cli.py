import json
from pathlib import Path
import select
import signal
import subprocess
import sys
import tempfile
import unittest
from urllib.request import Request, urlopen


class CLITests(unittest.TestCase):
    def test_signal_shutdown_records_requests_and_closes_socket(self):
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory(prefix='smoke-mocks-test-') as directory:
            record = Path(directory) / 'requests.json'
            process = subprocess.Popen([sys.executable, '-m', 'mocks', 'gitlab', '--record', str(record)],
                                       cwd=root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            try:
                ready, _, _ = select.select([process.stdout], [], [], 5)
                self.assertTrue(ready, 'mock readiness times out')
                base = json.loads(process.stdout.readline())['base_url']
                with urlopen(Request(base + '/api/v4/user', headers={'PRIVATE-TOKEN': 'fictional-gitlab-token'}), timeout=5) as response:
                    self.assertEqual(response.status, 200)
                process.send_signal(signal.SIGTERM)
                stdout, stderr = process.communicate(timeout=5)
                self.assertEqual(process.returncode, 0, stderr)
                rows = json.loads(record.read_text())
                self.assertEqual(rows[0]['path'], '/api/v4/user')
                self.assertTrue(rows[0]['auth_ok'])
                self.assertNotIn('fictional-gitlab-token', record.read_text())
            finally:
                if process.poll() is None:
                    process.kill()
                    process.communicate(timeout=5)
                process.stdout.close()
                process.stderr.close()


if __name__ == '__main__':
    unittest.main()
