"""Endpoint access follows exact policy resources."""
from pathlib import Path

import yaml

from harness import Scenario, require
from runtime import source_directory


KNOWN_PATTERN_FAILURES = {
    'SECURITY-DYNAMIC-RESOURCE-PATTERN': {
        'id': 'app.security:user.runtime_dataflow_registry',
        'condition': {'field': 'resource', 'operator': 'matches',
                      'value': r'^dataflow[.][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'},
    },
}


def classify_policy_patterns(findings):
    known, unexpected = [], []
    for finding in findings:
        issue = next((issue for issue, expected in KNOWN_PATTERN_FAILURES.items()
                      if finding['id'] == expected['id'] and finding['condition'] == expected['condition']), None)
        if issue:
            known.append(dict(finding, issue=issue))
        else:
            unexpected.append(finding)
    return known, unexpected


def pattern_conditions(value):
    if isinstance(value, dict):
        if value.get('operator') in (
                'matches', 'starts_with', 'ends_with', 'contains'):
            yield value
        for child in value.values():
            yield from pattern_conditions(child)
    elif isinstance(value, list):
        for child in value:
            yield from pattern_conditions(child)


def policy_pattern_findings(sources):
    findings = []
    for source in sorted(set(Path(source) for source in sources)):
        for path in sorted(source.rglob('*.yaml')):
            document = yaml.safe_load(path.read_text())
            if not isinstance(document, dict):
                continue
            for entry in document.get('entries', []) or []:
                if entry.get('kind') != 'security.policy' or entry.get('policy', {}).get('effect') != 'allow':
                    continue
                for condition in pattern_conditions(entry.get('policy', {}).get('conditions', [])):
                    findings.append({'id': document['namespace'] + ':' + entry['name'],
                                     'source': str(path), 'condition': condition})
    return findings


def endpoint_access_policies(ctx):
    checkout = ctx.inst.config.get('source')
    app = Path(checkout) / 'app' if checkout else ctx.inst.app
    sources = [app / source_directory(app)] if checkout else [app / 'src']
    sources.extend(root / source_directory(root) for root in map(Path, ctx.inst.config['replace'].values()))
    findings = policy_pattern_findings(sources)
    known, unexpected = classify_policy_patterns(findings)
    ctx.inst.evidence.save('security-resource-patterns', {'known_failures': known, 'unexpected': unexpected})
    require(not unexpected, 'Security policies grant by uncataloged pattern conditions: ' + str(unexpected))


REGISTRY = [Scenario('security_exact_endpoint_resources', 'regression', endpoint_access_policies,
                     issues=('SECURITY-ENDPOINT-ID-PATTERN', 'SECURITY-DYNAMIC-RESOURCE-PATTERN',
                             'SMOKE-ENDPOINT-POLICY-SOURCE-INVENTORY'))]


def empty_endpoint_policy(ctx):
    import shutil
    from module_harness import run_focused_app_test
    fixture = ctx.inst.root / 'temp/empty-endpoint-policy'
    shutil.copytree(Path(__file__).parent / 'mocks/empty_endpoint_policy', fixture)
    run_focused_app_test(ctx, fixture, 'empty_endpoint_policy_test')


REGISTRY.append(Scenario('security_empty_endpoint_policy', 'regression', empty_endpoint_policy,
                         issues=('SECURITY-EMPTY-ENDPOINT-POLICY-LOAD',)))


def release_build_source_selection(ctx):
    import subprocess
    import sys
    repository = Path(ctx.inst.config['replace']['kickside/html2pdf']).parent
    result = subprocess.run([sys.executable, '-m', 'unittest',
        'test_delivery.PublicationTest.test_component_source_selection_materializes_only_the_requested_tree'],
        cwd=repository / '.github/scripts', env=ctx.inst.env, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('release-build-source-selection', {'code': result.returncode,
        'output': result.stdout, 'error': result.stderr})
    require(result.returncode == 0, 'Release build source selection fails: ' + result.stdout + result.stderr)


REGISTRY.append(Scenario('release_build_source_selection', 'regression', release_build_source_selection,
                         issues=('RELEASE-BUILD-SOURCE-SELECTION',)))
