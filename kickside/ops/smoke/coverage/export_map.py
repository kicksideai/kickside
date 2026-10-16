"""Write scenario_map.json from the feature declarations in the smoke scenario registry."""
import argparse
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
SUITE = HERE.parent


def export():
    sys.path.insert(0, str(SUITE))
    from harness import load_registry
    scenarios = {}
    for scenario in load_registry(SUITE):
        scenarios[scenario.name] = {'tier': scenario.tier, 'features': list(scenario.features),
                                   'issues': list(scenario.issues)}
    return {'schema_version': 1,
            'provenance': {'scope': 'generated from Scenario.features and Scenario.issues in ops/smoke/scenarios*.py'},
            'scenarios': scenarios}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=HERE / 'scenario_map.json')
    parser.add_argument('--check', action='store_true', help='Fail when the committed map differs')
    args = parser.parse_args()
    text = json.dumps(export(), indent=2, sort_keys=True) + '\n'
    if args.check:
        if args.output.read_text() != text:
            raise SystemExit('scenario_map.json differs from the registry; run export_map.py')
        return
    args.output.write_text(text)


if __name__ == '__main__':
    main()
