"""Permanent Hub-to-source compatibility gate."""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

from ops.compat.compare import apply_transitions, compare
from ops.compat.fetch_baselines import Hub, app_lock
from ops.compat.inventory import ROOT, discover, local_entries
from ops.compat.migrations import checkpoint_entries, migration_plan, rehearse


def merge_entries(target, entries):
    for identity, row in entries.items():
        if identity in target and target[identity] != row:
            raise ValueError(f'{identity}: conflicting module entries')
        target[identity] = row


def write_report(output, report):
    output.mkdir(parents=True, exist_ok=True)
    (output / 'compat.json').write_text(json.dumps(report, indent=2, sort_keys=True) + '\n')
    lines = ['# Update compatibility', '', 'Verdict: ' + report['verdict'], '', '| Module | Baseline | Identity | Finding | Path | Status |', '| --- | --- | --- | --- | --- | --- |']
    for row in report['findings']:
        lines.append('| ' + ' | '.join(str(row[key]).replace('|', '\\|').replace('\n', ' ') for key in ('module', 'baseline', 'id', 'code', 'path', 'status')) + ' |')
    lines.extend(['', '## Migrations', '', '```json', json.dumps(report['migrations'], indent=2, sort_keys=True), '```'])
    if report.get('outside_lock'):
        lines.extend(['', '## Outside the app lock', '', ', '.join(report['outside_lock'])])
    if report['errors']:
        lines.extend(['', '## Errors', ''] + ['- ' + error for error in report['errors']])
    (output / 'compat.md').write_text('\n'.join(lines) + '\n')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, action='append', help='repository root; repeat for sibling repositories')
    parser.add_argument('--baseline', type=Path, help='explicit app wippy.lock (every selected module must be present)')
    parser.add_argument('--module', action='append', help='owned module identity; default all discovered modules')
    parser.add_argument('--output', type=Path, default=ROOT / '.compat/evidence')
    parser.add_argument('--transitions', type=Path, default=ROOT / 'ops/compat/transitions.json')
    parser.add_argument('--fixtures', type=Path, default=ROOT / 'ops/compat/migration-fixtures.json')
    args = parser.parse_args(argv)
    output = args.output.resolve()
    report = {'verdict': 'FAIL', 'baselines': {}, 'findings': [], 'migrations': {}, 'errors': []}
    output.mkdir(parents=True, exist_ok=True)
    try:
        modules = discover([path.resolve() for path in (args.repo or [ROOT])])
        if args.module:
            unknown = set(args.module) - set(modules)
            if unknown:
                raise ValueError('unknown selected modules: ' + ', '.join(sorted(unknown)))
            modules = {key: value for key, value in modules.items() if key in args.module}
        if args.baseline and not args.module:
            import yaml
            installed = {row['name'] for row in yaml.safe_load(args.baseline.read_text())['modules']}
            report['outside_lock'] = sorted(set(modules) - installed)
            modules = {key: value for key, value in modules.items() if key in installed}
            if not modules:
                raise ValueError('app lock contains no locally owned modules')
        locked = app_lock(args.baseline, modules) if args.baseline else {}
        hub = Hub()
        old, new = {}, {}
        with tempfile.TemporaryDirectory(prefix='work-', dir=output) as directory:
            work = Path(directory)
            for index, (identity, module) in enumerate(modules.items()):
                item = work / str(index)
                item.mkdir()
                baseline = hub.baseline(identity, item, locked.get(identity), module['released'])
                current = local_entries(module, item / 'local')
                report['baselines'][identity] = {key: baseline[key] for key in ('version', 'sha256')}
                report['findings'].extend(compare(identity, baseline['version'], baseline['entries'], current))
                merge_entries(old, baseline['entries'])
                merge_entries(new, current)
                print(identity + '@' + baseline['version'] + ': compared', flush=True)
            declarations = json.loads(args.transitions.read_text())
            report['findings'] = apply_transitions(report['findings'], declarations, ROOT, baselines=report['baselines'])
            fixture = json.loads(args.fixtures.read_text())
            report['migrations']['plan'] = migration_plan(old, new)
            try:
                report['migrations'] = rehearse(old, new, work / 'migrations', fixture)
                checkpoints = {}
                for identity, recipe in sorted(fixture.items()):
                    if recipe.get('pending') and identity in old and identity in new:
                        before, _ = checkpoint_entries(old, identity)
                        _, after = checkpoint_entries(new, identity)
                        checkpoint_work = work / 'migrations' / identity.replace(':', '_')
                        try:
                            checkpoints[identity] = rehearse(before, after, checkpoint_work, fixture)
                        finally:
                            if (checkpoint_work / 'migration.log').exists():
                                shutil.copy(checkpoint_work / 'migration.log', output / (identity.replace(':', '_') + '.log'))
                report['migrations']['pending'] = checkpoints
            finally:
                migration_log = work / 'migrations/migration.log'
                if migration_log.exists():
                    shutil.copy(migration_log, output / 'migration.log')
        if not any(row['status'] == 'breaking' for row in report['findings']):
            report['verdict'] = 'PASS'
    except (ValueError, OSError, KeyError) as error:
        # Transport and subprocess layers provide bounded messages without response bodies or credentials.
        report['errors'].append(str(error))
    write_report(output, report)
    print(report['verdict'] + ': ' + str(sum(row['status'] == 'breaking' for row in report['findings'])) + ' breaking findings; ' + str(len(report['errors'])) + ' errors')
    return 0 if report['verdict'] == 'PASS' else 1


if __name__ == '__main__':
    sys.exit(main())
