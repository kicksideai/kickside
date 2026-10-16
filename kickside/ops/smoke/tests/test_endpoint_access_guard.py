from pathlib import Path
import os
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock

import yaml

SUITE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SUITE))
from scenarios_endpoint_access import pattern_conditions, policy_pattern_findings, classify_policy_patterns
from scenarios_endpoint_access import endpoint_access_policies
from harness import Failure


class EndpointAccessGuardTests(unittest.TestCase):
    def policy(self, directory, namespace, pattern=False):
        directory.mkdir(parents=True)
        policy = {'resources': [namespace + ':endpoint'], 'actions': 'access', 'effect': 'allow'}
        if pattern:
            policy['conditions'] = [{'field': 'resource', 'operator': 'matches', 'value': '^unexpected:'}]
        (directory / '_index.yaml').write_text(yaml.safe_dump({'namespace': namespace, 'entries': [
            {'name': 'access', 'kind': 'security.policy', 'policy': policy}]}))

    def context(self, directory, *, configured=True):
        root = Path(directory)
        app = root / 'checkout/app'
        app.mkdir(parents=True)
        (app / 'wippy.yaml').write_text('directories:\n  src: registry\n')
        return SimpleNamespace(inst=SimpleNamespace(app=root / 'runtime', evidence=Mock(),
            config={'source': str(root / 'checkout') if configured else None, 'replace': {}}))

    def test_policy_inventory_reads_configured_product_sources_instead_of_runtime_probes(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = self.context(directory)
            self.policy(Path(directory) / 'checkout/app/registry', 'product')
            self.policy(ctx.inst.app / 'src/probe', 'fixture', pattern=True)
            endpoint_access_policies(ctx)
            self.assertEqual(ctx.inst.evidence.save.call_args.args[1]['unexpected'], [])

    def test_policy_inventory_still_rejects_patterns_in_the_configured_application(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = self.context(directory)
            self.policy(Path(directory) / 'checkout/app/registry', 'product', pattern=True)
            self.policy(ctx.inst.app / 'src', 'runtime')
            with self.assertRaisesRegex(Failure, 'product:access'):
                endpoint_access_policies(ctx)

    def test_policy_inventory_reads_each_replacements_declared_source_directory(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = self.context(directory)
            self.policy(Path(directory) / 'checkout/app/registry', 'product')
            self.policy(ctx.inst.app / 'src', 'runtime')
            module = Path(directory) / 'module'
            self.policy(module / 'entries', 'replacement', pattern=True)
            (module / 'wippy.yaml').write_text('directories:\n  src: entries\n')
            ctx.inst.config['replace'] = {'example/module': str(module)}
            with self.assertRaisesRegex(Failure, 'replacement:access'):
                endpoint_access_policies(ctx)

    def test_policy_inventory_keeps_auditing_the_application_without_a_checkout(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = self.context(directory, configured=False)
            self.policy(ctx.inst.app / 'src', 'runtime', pattern=True)
            with self.assertRaisesRegex(Failure, 'runtime:access'):
                endpoint_access_policies(ctx)

    def test_policy_inventory_keeps_the_published_application_source_boundary(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = self.context(directory, configured=False)
            self.policy(ctx.inst.app / 'src', 'runtime')
            self.policy(ctx.inst.app / 'unrelated', 'other', pattern=True)
            endpoint_access_policies(ctx)

    def test_nested_resource_pattern_is_rejected(self):
        condition = {'field': 'resource', 'operator': 'matches', 'value': '^module:'}
        self.assertEqual(list(pattern_conditions({'any': [{'all': [condition]}]})), [condition])

    def test_resource_identity_pattern_is_rejected(self):
        condition = {'field': 'resource.id', 'operator': 'starts_with', 'value': 'module.'}
        self.assertEqual(list(pattern_conditions(condition)), [condition])

    def test_exact_resources_and_actor_conditions_are_accepted(self):
        self.assertEqual(list(pattern_conditions({'resources': ['module.api:list.endpoint'],
            'conditions': [{'field': 'actor.id', 'operator': 'eq', 'value': 'person-1'}]})), [])

    def test_actor_identity_patterns_are_rejected(self):
        condition = {'field': 'actor.id', 'operator': 'matches', 'value': '^person-'}
        self.assertEqual(list(pattern_conditions(condition)), [condition])

    def test_endpoint_resource_pattern_conditions_are_rejected(self):
        condition = {'field': 'resource', 'operator': 'matches', 'value': '^module.api:'}
        policy = {'resources': ['module.api:*'], 'actions': 'access', 'effect': 'allow',
                  'conditions': [condition]}
        self.assertEqual(list(pattern_conditions(policy)), [condition])

    def test_runtime_discovery_resources_remain_valid(self):
        policy = {'resources': ['module:*'], 'actions': ['registry.get', 'registry.find'], 'effect': 'allow'}
        self.assertEqual(list(pattern_conditions(policy)), [])

    def test_known_failure_is_cataloged_and_does_not_admit_other_patterns(self):
        import json
        from scenarios_endpoint_access import KNOWN_PATTERN_FAILURES, classify_policy_patterns
        catalog = json.loads((SUITE / 'coverage/issues.json').read_text())
        self.assertEqual(set(KNOWN_PATTERN_FAILURES), {'SECURITY-DYNAMIC-RESOURCE-PATTERN'})
        for issue, finding in KNOWN_PATTERN_FAILURES.items():
            self.assertIn(issue, catalog['issues'])
            known, unexpected = classify_policy_patterns([finding])
            self.assertEqual(known, [dict(finding, issue=issue)])
            self.assertEqual(unexpected, [])
            for changed in (dict(finding, id='other.security:runtime'),
                            dict(finding, condition=dict(finding['condition'], value='.*'))):
                self.assertEqual(classify_policy_patterns([changed]), ([], [changed]))

    def test_owned_sources_do_not_grant_by_resource_patterns(self):
        root = SUITE.parents[1]
        sources = [root / category / module / 'src' for category in ('core', 'platform')
                   for module in sorted(path.name for path in (root / category).iterdir())
                   if (root / category / module / 'wippy.yaml').is_file()]
        sources.extend([root / 'app/src', root / 'app/templates/plugin/src'])
        for sibling in sorted(root.parent.glob('kickside_*')):
            if sibling == root:
                continue
            if (sibling / 'wippy.yaml').is_file():
                sources.append(sibling / 'src')
            else:
                sources.extend(path.parent / 'src' for path in sibling.glob('*/wippy.yaml'))
        known, unexpected = classify_policy_patterns(policy_pattern_findings(sources))
        self.assertEqual(unexpected, [])
        self.assertEqual([row["issue"] for row in known], ["SECURITY-DYNAMIC-RESOURCE-PATTERN"])
