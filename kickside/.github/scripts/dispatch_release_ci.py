"""Refresh application release locks and dispatch CI for GITHUB_TOKEN PRs."""
import base64
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
REPOSITORY = os.environ['GITHUB_REPOSITORY']

def gh(path, body=None):
    command = ['gh', 'api', path]
    if body is not None:
        command += ['--method', 'POST', '--input', '-']
    output = subprocess.check_output(command, input=json.dumps(body).encode() if body is not None else None)
    return json.loads(output) if output else None

def run(args):
    subprocess.run(args, cwd=ROOT, check=True)

prs = json.loads(os.environ.get('RELEASE_PRS') or '[]')
for proposed in prs:
    pr = gh(f'repos/{REPOSITORY}/pulls/{proposed["number"]}')
    branch = pr['head']['ref']
    if not branch.startswith('release-please--'):
        raise ValueError('unexpected release PR branch')
    run(['git', 'config', '--global', 'credential.https://github.com.helper', '!gh auth git-credential'])
    run(['git', 'fetch', 'origin', branch])
    run(['git', 'switch', '--detach', 'FETCH_HEAD'])
    manifest = json.loads((ROOT / '.release-please-manifest.json').read_text())
    if 'app' in manifest:
        previous = gh(f'repos/{REPOSITORY}/contents/.release-please-manifest.json?ref={pr["base"]["sha"]}')
        before = json.loads(base64.b64decode(previous['content']))
        if before['app'] != manifest['app']:
            run(['python3', '.github/scripts/delivery.py', 'refresh-app'])
            run(['git', 'add', 'app/wippy.lock', '.github/app-release-lock.json'])
            changed = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=ROOT, text=True)
            if changed:
                run(['git', 'config', 'user.name', 'github-actions[bot]'])
                run(['git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'])
                run(['git', 'commit', '-m', 'chore(app): refresh release dependency lock'])
                run(['git', 'push', 'origin', f'HEAD:refs/heads/{branch}'])
    gh(f'repos/{REPOSITORY}/actions/workflows/ci.yml/dispatches', {'ref': branch})
