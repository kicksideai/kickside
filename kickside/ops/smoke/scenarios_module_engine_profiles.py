"""Delivery plans include every database engine declared by native harnesses."""
import json
from pathlib import Path

import yaml

from harness import Scenario, require


def declared_workspaces(workflow, job):
    defaults = dict(workflow.get('defaults', {}).get('run', {}))
    defaults.update(job.get('defaults', {}).get('run', {}))
    if defaults.get('working-directory'):
        yield defaults['working-directory']
    for step in job.get('steps', []):
        if step.get('working-directory'):
            yield step['working-directory']


def workflow_checkout_paths(root):
    repository = json.loads((root / '.github/modules.json').read_text())['repository']
    internal = root.parent / 'kickside-internal'
    workflows = [(root / '.github/workflows/ci.yml', 'source'),
                 (internal / '.github/workflows' / (repository + '-tests.yml'), 'kickside-internal')]
    findings = []
    for path, own_path in workflows:
        if not path.is_file():
            continue
        workflow = yaml.safe_load(path.read_text())
        for job_name, job in workflow['jobs'].items():
            workspaces = set(declared_workspaces(workflow, job))
            for step in job.get('steps', []):
                if not step.get('uses', '').startswith('actions/checkout@'):
                    continue
                checkout = step.get('with', {})
                target = checkout.get('repository', '').removeprefix('kicksideai/')
                actual = checkout.get('path', '')
                expected = (own_path if not target and not actual and own_path in workspaces else
                            '' if not target and not actual else
                            'source' if target == repository else target or own_path)
                if actual != expected:
                    findings.append({'workflow': str(path), 'job': job_name,
                                     'expected': expected, 'actual': actual})
    return findings


def module_engine_profiles(ctx):
    repositories = {Path(__file__).resolve().parents[2]}
    for source in ctx.inst.config['replace'].values():
        path = Path(source).resolve()
        repository = next((parent for parent in (path, *path.parents)
                           if (parent / '.github/modules.json').is_file()), None)
        if repository:
            repositories.add(repository)
    findings = []
    checked = []
    for root in sorted(repositories):
        findings.extend(workflow_checkout_paths(root))
        plan = json.loads((root / '.github/modules.json').read_text())
        for module in plan['modules'].values():
            if 'test' not in module['targets'] or not module.get('harness'):
                continue
            config_path = root / module['path'] / module['harness'] / '.wippy.yaml'
            config = (yaml.safe_load(config_path.read_text()) or {}) if config_path.exists() else {}
            native = set(config.get('profiles', {}))
            declared = set(module['profiles'])
            identity = module['organization'] + '/' + module['module']
            checked.append({'module': identity, 'native': sorted(native), 'declared': sorted(declared)})
            missing = native - declared
            if missing:
                findings.append({'module': identity, 'missing_profiles': sorted(missing)})
    ctx.inst.evidence.save('module-engine-profiles', {'checked': checked, 'findings': findings})
    require(not findings, 'Delivery plans or checkout paths differ from the native gates: ' + json.dumps(findings))


REGISTRY = [Scenario('regression_module_engine_profiles', 'regression', module_engine_profiles,
                     issues=('MODULE-DECLARED-ENGINE-COVERAGE', 'GITHUB-DEVELOPMENT-CHECKOUT-LAYOUT'))]
