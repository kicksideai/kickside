"""Gate feature coverage from passed smoke scenarios on every required database engine."""
import argparse
import json
import math
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from harness import tier_includes
BLOCKER_STATES = {
    'runtime-blocked': ('runtime_blockers', 'runtime_blocked_issues'),
    'upstream-blocked': ('upstream_blockers', 'upstream_blocked_issues'),
}


def issue_report(mapping, run, catalog, engines):
    if catalog['schema_version'] != 1:
        raise ValueError('Unsupported issue schema version')
    ids = catalog['issues']
    if (not isinstance(ids, list) or any(not isinstance(i, str) or not i.strip() or i != i.strip() for i in ids)
            or len(set(ids)) != len(ids)):
        raise ValueError('Issue catalog must contain unique nonempty issue IDs')
    guards = {issue: [] for issue in ids}
    for name, declaration in mapping['scenarios'].items():
        declared = declaration.get('issues', [])
        if not isinstance(declared, list) or any(not isinstance(i, str) for i in declared) or len(set(declared)) != len(declared):
            raise ValueError('Scenario issues must be a unique list: ' + name)
        for issue in declared:
            if issue not in guards:
                raise ValueError('Unknown issue: ' + issue)
            guards[issue].append(name)
    harnesses = catalog.get('harness_guards', {})
    if not isinstance(harnesses, dict):
        raise ValueError('Harness guards must be an object')
    for name, declaration in harnesses.items():
        if not isinstance(name, str) or not name.strip() or name != name.strip() or not isinstance(declaration, dict):
            raise ValueError('Invalid harness guard declaration')
        for field in ('repository', 'test'):
            value = declaration.get(field)
            if not isinstance(value, str) or not value.strip() or value != value.strip():
                raise ValueError('Harness guard requires ' + field + ': ' + name)
        declared = declaration.get('issues')
        required = declaration.get('engines')
        if (not isinstance(declared, list) or not declared or any(not isinstance(i, str) for i in declared)
                or len(set(declared)) != len(declared)):
            raise ValueError('Harness issues must be a unique nonempty list: ' + name)
        if (not isinstance(required, list) or not required or any(e not in ('sqlite', 'postgres', 'independent') for e in required)
                or len(set(required)) != len(required) or ('independent' in required and len(required) != 1)):
            raise ValueError('Invalid harness engines: ' + name)
        for issue in declared:
            if issue not in guards:
                raise ValueError('Unknown issue: ' + issue)
        state = declaration.get('state')
        if state is not None:
            if state not in BLOCKER_STATES:
                raise ValueError('Invalid harness state: ' + name)
            blocker_label = 'Runtime blocker' if state == 'runtime-blocked' else 'Upstream blocker'
            for field in ('runtime', 'ledger') + (('module',) if state == 'upstream-blocked' else ()):
                value = declaration.get(field)
                if not isinstance(value, str) or not value.strip() or value != value.strip():
                    raise ValueError(blocker_label + ' requires ' + field + ': ' + name)
            evidence = declaration.get('evidence')
            if (set(required) != {'sqlite', 'postgres'} or not isinstance(evidence, list)
                    or len(evidence) != len(required)
                    or any(not isinstance(path, str) or not path.strip() or path != path.strip() for path in evidence)
                    or len(set(evidence)) != len(evidence)):
                raise ValueError(blocker_label + ' requires distinct evidence for both engines: ' + name)
    harness_statuses = {}
    for row in run.get('harness_results', []):
        name, engine, status = row['guard'], row['engine'], row['status']
        if name not in harnesses or engine not in harnesses[name]['engines']:
            raise ValueError('Undeclared harness result: ' + name + '/' + engine)
        if (name, engine) in harness_statuses:
            raise ValueError('Duplicate harness result: ' + name + '/' + engine)
        if status not in ('passed', 'failed') and not (isinstance(status, str) and status.startswith('skipped: ') and len(status) > 9):
            raise ValueError('Invalid harness result status: ' + str(status))
        harness_statuses[name, engine] = status
    statuses = {(row['scenario'], row['engine']): row['status'] for row in run['results']}
    report, failures = {}, []
    for issue, names in sorted(guards.items()):
        scenarios = {name: {engine: statuses.get((name, engine), 'not_run') for engine in engines}
                     for name in sorted(names)}
        harness_results = {name: {engine: harness_statuses.get((name, engine), 'not_run')
                                  for engine in declaration['engines']}
                           for name, declaration in sorted(harnesses.items()) if issue in declaration['issues']}
        blockers = {name: declaration for name, declaration in harnesses.items()
                    if issue in declaration['issues'] and declaration.get('state') in BLOCKER_STATES}
        blocker_state = next((state for state in BLOCKER_STATES
                              if any(row['state'] == state for row in blockers.values())), None)
        active_harnesses = [row for name, row in harness_results.items() if name not in blockers]
        values = [status for row in list(scenarios.values()) + active_harnesses for status in row.values()]
        status = ('failed' if 'failed' in values else 'not_run' if ('not_run' in values or not values and not blockers) else
                  'skipped' if any(v.startswith('skipped: ') for v in values) else
                  blocker_state if blockers else 'passed')
        report[issue] = {'scenarios': scenarios, 'status': status}
        if harness_results:
            report[issue]['harnesses'] = harness_results
        if blockers:
            for state, (field_name, _) in BLOCKER_STATES.items():
                declarations = {name: declaration for name, declaration in blockers.items()
                                if declaration['state'] == state}
                if declarations:
                    fields = ('runtime', 'test', 'evidence', 'ledger') + (('module',) if state == 'upstream-blocked' else ())
                    report[issue][field_name] = {
                        name: {field: declaration[field] for field in fields}
                        for name, declaration in sorted(declarations.items())}
        if not names and not harness_results:
            failures.append('Issue ' + issue + ' has no guarding scenario')
        elif (status != 'passed' and status not in BLOCKER_STATES and not
              (run.get('tier') in ('quick', 'full', 'regression') and not harness_results and names
               and all(mapping['scenarios'][name]['tier'] == 'chat' for name in names)
               and not any((name, engine) in statuses for name in names for engine in engines))):
            failures.append('Issue ' + issue + ' regression is ' + status)
    return report, failures


def calculate(inventory, mapping, run, threshold=80, component_floor=80, engines=('sqlite', 'postgres'), issues=None):
    for value in (threshold, component_floor):
        if not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 100:
            raise ValueError('Threshold and component floor must be finite percentages from 0 to 100')
    if not engines or len(set(engines)) != len(engines):
        raise ValueError('Required engines must be unique and nonempty')
    if inventory['schema_version'] != 1 or mapping['schema_version'] != 1:
        raise ValueError('Unsupported schema version')
    all_ids = set()
    component_ids = {}
    for name, component in inventory['components'].items():
        ids = [f['id'] for f in component['features']]
        if not ids or len(set(ids)) != len(ids) or all_ids.intersection(ids):
            raise ValueError('Empty component or duplicate feature ids: ' + name)
        component_ids[name] = set(ids)
        all_ids.update(ids)
    if not all_ids:
        raise ValueError('Inventory must contain features')
    declarations = {}
    for name, declaration in mapping['scenarios'].items():
        ids = declaration['features']
        if not isinstance(ids, list) or len(set(ids)) != len(ids):
            raise ValueError('Scenario features must be a unique list: ' + name)
        unknown = set(ids) - all_ids
        if unknown:
            raise ValueError('Unknown feature ids: ' + ', '.join(sorted(unknown)))
        declarations[name] = set(ids)
    covered = {engine: set() for engine in engines}
    seen = set()
    failed = []
    for row in run['results']:
        name, engine, status = row['scenario'], row['engine'], row['status']
        if engine not in engines:
            raise ValueError('Unexpected result engine: ' + engine)
        key = (engine, name)
        if key in seen:
            raise ValueError('Duplicate scenario result: ' + engine + '/' + name)
        seen.add(key)
        if status not in ('passed', 'failed') and not (isinstance(status, str) and status.startswith('skipped: ') and len(status) > 9):
            raise ValueError('Invalid result status: ' + str(status))
        if name not in declarations and name not in {'cleanup', 'interrupted'}:
            raise ValueError('Unknown scenario: ' + name)
        ids = declarations.get(name, set())
        if 'features' in row and (not isinstance(row['features'], list) or len(set(row['features'])) != len(row['features']) or set(row['features']) != ids):
            raise ValueError('Result feature declaration differs from map: ' + name)
        if status == 'passed':
            covered[engine].update(ids)
        elif status == 'failed':
            failed.append(engine + '/' + name + ' fails')

    def measure(ids, exercised):
        hit = ids & exercised
        return {'covered': len(hit), 'total': len(ids), 'percent': 100 * len(hit) / len(ids),
                'uncovered': sorted(ids - hit)}

    def summary(exercised):
        return {'overall': measure(all_ids, exercised),
                'components': {name: measure(ids, exercised) for name, ids in sorted(component_ids.items())}}

    result = summary(set.intersection(*covered.values()))
    result.update(schema_version=1, threshold=threshold, component_floor=component_floor,
                  required_engines=list(engines), engines={engine: summary(ids) for engine, ids in covered.items()})
    failures = list(failed)
    for engine in engines:
        if not any(e == engine for e, _ in seen):
            failures.append('Missing engine: ' + engine)
        if (engine, 'cleanup') not in seen:
            failures.append('Incomplete run: missing ' + engine + '/cleanup')
    if result['overall']['percent'] < threshold:
        failures.append(f"Overall coverage {result['overall']['percent']:.2f}% is below {threshold}%")
    for name, stats in result['components'].items():
        if stats['percent'] < component_floor:
            failures.append(f"{name} coverage {stats['percent']:.2f}% is below component floor {component_floor}%")
    if issues is not None:
        result['issues'], issue_failures = issue_report(mapping, run, issues, engines)
        failures.extend(issue_failures)
        for state, (_, field_name) in BLOCKER_STATES.items():
            blocked = [issue for issue, row in result['issues'].items() if row['status'] == state]
            if blocked:
                result[field_name] = blocked
    result.update(gate_passed=not failures, failures=failures)
    return result


def planned(inventory, mapping, tier, issues=None):
    selected = {name: data for name, data in mapping['scenarios'].items()
                if tier_includes(tier, data['tier'], data.get('issues'))}
    rows = [{'scenario': name, 'engine': engine, 'status': 'passed'}
            for name in selected for engine in ('sqlite', 'postgres')]
    result = calculate(inventory, mapping, {'results': rows})
    if issues is not None:
        result['issues'], failures = issue_report(mapping, {'results': []}, issues, ('sqlite', 'postgres'))
        result['failures'].extend(failures)
    result['basis'] = 'planned scenario declarations; no execution evidence'
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', type=Path, default=HERE / 'inventory.json')
    parser.add_argument('--map', type=Path, default=HERE / 'scenario_map.json')
    parser.add_argument('--issues', type=Path, default=HERE / 'issues.json')
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--results', type=Path)
    source.add_argument('--planned', choices=('quick', 'full', 'regression', 'chat'), help='Declaration upper bound; always exits nonzero')
    parser.add_argument('--threshold', type=float, default=80)
    parser.add_argument('--component-floor', type=float, default=80)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    inv, mapping = json.loads(args.inventory.read_text()), json.loads(args.map.read_text())
    issues = json.loads(args.issues.read_text())
    if args.planned:
        result = planned(inv, mapping, args.planned, issues)
    else:
        result = calculate(inv, mapping, json.loads(args.results.read_text()), args.threshold, args.component_floor, issues=issues)
    rendered = json.dumps(result, indent=2, sort_keys=True) + '\n'
    if args.output:
        args.output.write_text(rendered)
    print(f"Coverage: {result['overall']['covered']}/{result['overall']['total']} ({result['overall']['percent']:.2f}%)")
    for name, stats in result['components'].items():
        print(f"{name}: {stats['covered']}/{stats['total']} ({stats['percent']:.2f}%)")
    for issue, stats in result.get('issues', {}).items():
        print(f"{issue}: {stats['status']}; scenarios: " + ', '.join(stats['scenarios']) +
              '; harnesses: ' + ', '.join(stats.get('harnesses', {})))
    for failure in result['failures']:
        print(failure)
    return 1 if args.planned or not result['gate_passed'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
