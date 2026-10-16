"""Compose persistent smoke-fixture member grants into the shared member scope."""
import hashlib
import json
from pathlib import Path

import yaml


NAMESPACE = 'app.smoke.fixture_permissions'
DIRECTORY = 'smoke-member-policy-grants'
MEMBER_GROUP = ['app.security:user']


def register_member_policy_grants(app, entries):
    """Persist eligible member grants once and return every other fixture entry."""
    grants = [entry for entry in entries if _is_member_grant(entry)]
    if not grants:
        return entries
    path = Path(app) / 'src' / DIRECTORY / '_index.yaml'
    existing = yaml.safe_load(path.read_text()) if path.exists() else None
    policies = (existing or {}).get('entries', [])
    combined = _combine([*_policy_rows(policies), *(entry['policy'] for entry in grants)])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump({'version': '1.0', 'namespace': NAMESPACE,
                                    'entries': [_entry(policy) for policy in combined]}, sort_keys=False))
    return [entry for entry in entries if not _is_member_grant(entry)]


def _is_member_grant(entry):
    return entry.get('kind') == 'security.policy' and entry.get('groups') == MEMBER_GROUP and entry.get('policy', {}).get('effect') == 'allow'


def _policy_rows(entries):
    return [entry['policy'] for entry in entries if _is_member_grant(entry)]


def _combine(policies):
    combined = {}
    for policy in policies:
        resource_key = _resource_key(policy)
        merged = combined.setdefault(resource_key, {key: value for key, value in policy.items() if key != 'resources'})
        resources = merged.setdefault('resources', [])
        for resource in _resources(policy.get('resources')):
            if resource not in resources:
                resources.append(resource)
    return [combined[key] for key in sorted(combined)]


def _resource_key(policy):
    stable = {key: value for key, value in policy.items() if key != 'resources'}
    return json.dumps(stable, sort_keys=True, separators=(',', ':'))


def _resources(resources):
    if isinstance(resources, str):
        return [resources]
    return list(resources or [])


def _entry(policy):
    digest = hashlib.sha256(_resource_key(policy).encode()).hexdigest()[:16]
    return {'name': 'grant_' + digest, 'kind': 'security.policy', 'groups': MEMBER_GROUP, 'policy': policy}
