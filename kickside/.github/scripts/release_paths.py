"""Scope Release Please to shipped content using module packaging exclusions."""
import argparse
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


def excluded_directories(package, manifest):
    paths = sorted({package + '/' + pattern[:-3] for pattern in manifest.get('exclude', [])
                    if pattern.endswith('/**') and not any(char in pattern[:-3] for char in '*?:[')})
    return [path for path in paths if not any(path.startswith(parent + '/') for parent in paths if parent != path)]


def derive(root):
    config = json.loads((root / 'release-please-config.json').read_text())
    for package, settings in config['packages'].items():
        manifest = yaml.safe_load((root / package / 'wippy.yaml').read_text())
        settings['exclude-paths'] = excluded_directories(package, manifest)
    return json.dumps(config, indent=2) + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    path = ROOT / 'release-please-config.json'
    output = derive(ROOT)
    if args.check:
        if path.read_text() != output:
            raise SystemExit('Release Please paths differ from packaging exclusions; run .github/scripts/release_paths.py')
    else:
        path.write_text(output)
