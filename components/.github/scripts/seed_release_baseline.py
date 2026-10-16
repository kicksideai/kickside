"""Set the release baseline after creation of the GitHub snapshot commit."""
import argparse
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('snapshot_sha')
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
sha = subprocess.check_output(['git', 'rev-parse', '--verify', args.snapshot_sha + '^{commit}'], cwd=root, text=True).strip()
subprocess.run(['git', 'merge-base', '--is-ancestor', sha, 'HEAD'], cwd=root, check=True)
path = root / 'release-please-config.json'
config = json.loads(path.read_text())
config['last-release-sha'] = sha
path.write_text(json.dumps(config, indent=2) + '\n')
print('Release baseline: ' + sha)
