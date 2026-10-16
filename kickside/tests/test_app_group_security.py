from pathlib import Path
import unittest
import tempfile
from unittest.mock import patch
import sys
import os
import yaml

ROOT = Path(__file__).resolve().parents[1]


def declarations(directory):
    entries = {}
    for source in directory.rglob('_index.yaml'):
        document = yaml.safe_load(source.read_text())
        for entry in document.get('entries', []):
            entries[document['namespace'] + ':' + entry['name']] = entry
    return entries


class AppGroupSecurityTest(unittest.TestCase):
    def test_module_access_uses_defaults_without_a_bare_app_profile(self):
        entries = declarations(ROOT / 'app/src/app/deps')
        bindings = [(id, parameter) for id, entry in entries.items()
                    if entry.get('kind') == 'ns.dependency'
                    for parameter in entry.get('parameters', [])
                    if parameter['name'] == 'user_security_scope']
        self.assertEqual(bindings, [])
        relay = next(e for e in entries.values() if e.get('component') == 'wippy/relay')
        parameters = {p['name']: p['value'] for p in relay['parameters']}
        self.assertEqual(parameters['wippy.relay:user_security_scope'], 'app.security:user')
        profiles = declarations(ROOT / 'app/src/app/composition')
        for entry in profiles.values():
            for package in entry.get('packages', []):
                self.assertFalse(any(p['name'].endswith(':user_security_scope')
                                     for p in package.get('parameters', [])), package)

    def test_module_member_requirements_declare_the_platform_default(self):
        roots = [ROOT / 'core', ROOT / 'platform']
        roots.extend(Path(p) for p in os.environ.get('SECURITY_MODULE_ROOTS', '').split(os.pathsep) if p)
        found = 0
        for root in roots:
            for source in sorted(path for directory in root.glob('*/src')
                                 for path in directory.rglob('_index.yaml')):
                document = yaml.safe_load(source.read_text())
                for entry in document.get('entries', []):
                    if entry.get('kind') != 'ns.requirement' or entry.get('name') != 'user_security_scope':
                        continue
                    found += 1
                    with self.subTest(source=source):
                        self.assertEqual(entry.get('meta', {}).get('value_kind'), 'security.scope')
                        self.assertEqual(entry.get('default'), 'kickside.security.groups:members')
        self.assertGreater(found, 0)

    def test_member_requirement_scan_excludes_downloaded_sources_and_checks_owned_sources(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            owned = root / 'platform/example/src/_index.yaml'
            owned.parent.mkdir(parents=True)
            declaration = {'namespace': 'example', 'entries': [{'name': 'user_security_scope', 'kind': 'ns.requirement', 'meta': {'value_kind': 'security.scope'}, 'default': 'kickside.security.groups:members'}]}
            owned.write_text(yaml.safe_dump(declaration))
            vendor = root / 'platform/example/eval/.wippy/vendor/wippy/relay/src/_index.yaml'
            vendor.parent.mkdir(parents=True)
            vendor.write_text(yaml.safe_dump({'namespace': 'wippy.relay', 'entries': [{'name': 'user_security_scope', 'kind': 'ns.requirement'}]}))
            with patch.object(sys.modules[__name__], 'ROOT', root), patch.dict(os.environ, {'SECURITY_MODULE_ROOTS': ''}):
                result = unittest.TestResult()
                AppGroupSecurityTest('test_module_member_requirements_declare_the_platform_default').run(result)
                self.assertTrue(result.wasSuccessful(), result.failures)
                declaration['entries'][0]['default'] = 'app:unowned'
                owned.write_text(yaml.safe_dump(declaration))
                result = unittest.TestResult()
                AppGroupSecurityTest('test_module_member_requirements_declare_the_platform_default').run(result)
                self.assertFalse(result.wasSuccessful())

    def test_platform_declares_members_and_projects_installed_module_policies(self):
        entries = declarations(ROOT / 'platform/security/src')
        scope = entries['kickside.security.groups:members']
        self.assertEqual(scope['kind'], 'security.scope')
        group = entries['kickside.security.groups:members_composition']
        self.assertEqual(group['group_id'], 'kickside.security.groups:members')
        self.assertEqual(group['select'], {'meta.intent': 'module_access'})

    def test_template_exposes_a_selectable_owned_module_bundle(self):
        entries = declarations(ROOT / 'app/templates/plugin/src')
        bundle = entries['acme.starter.security:module_access']
        self.assertEqual(bundle['meta']['intent'], 'module_access')
        self.assertEqual(bundle['meta']['surface'], 'acme.starter')
        self.assertTrue(bundle['meta']['title'])
        self.assertEqual(bundle['groups'], [])
        resources = bundle['policy']['resources']
        self.assertEqual(resources, ['acme.starter.api:get_status.endpoint'])
        self.assertNotIn('*', resources)
        self.assertEqual(bundle['meta']['includes'], ['acme.starter.security:module_runtime'])

    def test_default_members_group_selects_module_policies_and_enrolls_existing_users(self):
        entries = declarations(ROOT / 'app/src/app')
        group = entries['app.composition:default_members']
        self.assertEqual(group['meta']['type'], 'kickside.security.group_composition')
        self.assertEqual(group['group_id'], 'app.security:members')
        self.assertEqual(group['groups'], ['app.security:user', 'kickside.security.groups:members'])
        enrollment = entries['app.composition:default_member_enrollment']
        self.assertEqual(enrollment['meta']['type'], 'kickside.users.default_membership')
        self.assertEqual(enrollment['group_id'], 'app.security:members')
        core = entries['app.composition:core_access']
        self.assertEqual(core['group_id'], 'app.security:user')
        self.assertNotIn('kickside.crm.security:module_access', core['policies'])
        self.assertNotIn('kickside.users.security:module_access', core['policies'])

    def test_signed_in_core_includes_chat_agent_selection_and_async_jobs(self):
        entries = declarations(ROOT / 'app/src/app/composition')
        core = entries['app.composition:core_access']['policies']
        for policy in ('kickside.agents.security:module_access', 'kickside.core.jobs.security:module_access'):
            with self.subTest(policy=policy):
                self.assertIn(policy, core)

    def test_baseline_has_no_blanket_module_grants(self):
        entries = declarations(ROOT / 'app/src/app/security')
        for id, entry in entries.items():
            if entry.get('kind') != 'security.policy' or 'app.security:user' not in entry.get('groups', []):
                continue
            resources = entry['policy']['resources']
            self.assertNotIn('kickside.*', [resources] if isinstance(resources, str) else resources, id)
        own = entries['app.security:user.self_service']
        self.assertIn('kickside.users.api:me.endpoint', own['policy']['resources'])
        self.assertNotIn('kickside.users.api:principals_search.endpoint', own['policy']['resources'])

    def test_app_wires_default_and_core_groups_without_the_global_endpoint_policy(self):
        entries = declarations(ROOT / 'app/src/app/deps')
        users = next(e for e in entries.values() if e.get('component') == 'kickside/users')
        bindings = {p['name']: p['value'] for p in users['parameters']}
        self.assertEqual(bindings['kickside.users:user_security_scope'], 'app.security:members')
        self.assertEqual(bindings['kickside.users:baseline_security_scope'], 'app.security:user')
        self.assertEqual(bindings['login_role_resource'], '*')
        security = next(e for e in entries.values() if e.get('component') == 'kickside/security')
        bindings = {p['name']: p['value'] for p in security['parameters']}
        self.assertEqual(bindings['kickside.security:sessions_invalidator'], 'kickside.users.persist:session_revoker')
        contract = next(e for e in entries.values() if e.get('component') == 'kickside/contract')
        bindings = {p['name']: p['value'] for p in contract['parameters']}
        self.assertNotIn(bindings['kickside.contract.http:user_security_scope'], ('app.security:user', 'app.security:members'))
