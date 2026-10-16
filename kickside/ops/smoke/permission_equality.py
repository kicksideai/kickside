"""Targeted native permission equality evidence for installation rehearsals."""


class PermissionChange(AssertionError):
    """A native decision changes between two installation states."""


def _values(value, field):
    values = value if isinstance(value, list) else [value]
    if not values or any(not isinstance(item, str) for item in values):
        raise ValueError('policy ' + field + ' must contain strings')
    return values


def _policy_pairs(rules):
    pairs = set()
    if isinstance(rules, dict):
        iterable = rules.values()
    elif isinstance(rules, (list, tuple)):
        iterable = rules
    else:
        raise ValueError('account rules must be a mapping or sequence')
    for rule in iterable:
        if not isinstance(rule, dict):
            raise ValueError('account rule must be an object')
        for action in _values(rule.get('actions'), 'actions'):
            for resource in _values(rule.get('resources'), 'resources'):
                pairs.add((action, resource))
    return pairs


def _entry_data(entry):
    data = entry.get('data')
    return data if isinstance(data, dict) else entry


def _component_kind(entry):
    if entry.get('kind') != 'contract.binding':
        return False
    contracts = _entry_data(entry).get('contracts', [])
    if not isinstance(contracts, list):
        raise ValueError('component binding contracts must be a list')
    return any(isinstance(contract, dict) and contract.get('contract') == 'kickside.contract:component'
               for contract in contracts)


def target_pairs(catalog, rules):
    """Return the native decisions which represent an account's authority.

    Policy rules retain their declared action/resource pairs, including wildcard
    patterns.  Endpoint authorization always evaluates ``access`` against the
    declared endpoint id.  Component authorization evaluates ``registry.get``
    against the declared component binding id, matching component service access.
    """
    pairs = _policy_pairs(rules)
    for entry in catalog:
        if not isinstance(entry, dict) or not isinstance(entry.get('id'), str) or not entry['id']:
            raise ValueError('registry catalog entry needs a non-empty id')
        if entry.get('kind') == 'http.endpoint':
            pairs.add(('access', entry['id']))
        if _component_kind(entry):
            pairs.add(('registry.get', entry['id']))
    return tuple(sorted(pairs))


def exhaustive_pairs(actions, catalog):
    """Return the former action-by-registry-entry proof universe."""
    action_values = _values(list(actions), 'actions')
    resources = []
    for entry in catalog:
        if not isinstance(entry, dict) or not isinstance(entry.get('id'), str) or not entry['id']:
            raise ValueError('registry catalog entry needs a non-empty id')
        resources.append(entry['id'])
    return tuple(sorted((action, resource) for action in action_values for resource in resources))


def snapshot(pairs, evaluate):
    """Capture native decisions in the supplied stable pair order."""
    normalized = tuple(pairs)
    if normalized != tuple(sorted(set(normalized))):
        raise ValueError('permission pairs must be unique and sorted')
    return tuple((action, resource, evaluate(action, resource)) for action, resource in normalized)


def equal(before, after):
    """Return whether matching proof universes have identical decisions."""
    if tuple((action, resource) for action, resource, _ in before) != tuple((action, resource) for action, resource, _ in after):
        raise ValueError('permission proof universes differ')
    return before == after


def compare(before, after):
    """Raise with every changed native decision; never omit a comparison."""
    if tuple((action, resource) for action, resource, _ in before) != tuple((action, resource) for action, resource, _ in after):
        raise ValueError('permission proof universes differ')
    changes = [(action, resource, old, new) for (action, resource, old), (_, _, new) in zip(before, after)
               if old != new]
    if changes:
        rendered = ', '.join(action + ' ' + resource + ': ' + str(old) + ' -> ' + str(new)
                             for action, resource, old, new in changes)
        raise PermissionChange('native permission decisions change: ' + rendered)


def compare_captures(before, after):
    """Compare account admission, groups, and native decisions together."""
    if before.get('user_id') != after.get('user_id'):
        raise ValueError('permission captures belong to different accounts')
    before_refused = bool(before.get('subject_refusal'))
    after_refused = bool(after.get('subject_refusal'))
    if before_refused != after_refused:
        raise PermissionChange('native permission admission changes for ' + before['user_id'])
    if before.get('groups', []) != after.get('groups', []):
        raise PermissionChange('native permission groups change for ' + before['user_id'])
    if before_refused:
        if (before.get('error_kind'), before.get('subject_refusal')) != (after.get('error_kind'), after.get('subject_refusal')):
            raise PermissionChange('native permission refusal changes for ' + before['user_id'])
        return
    compare(before['snapshot'], after['snapshot'])


def comparison_pairs(catalog, before_rules, after_rules):
    """Include either version's policy references before comparing decisions."""
    return tuple(sorted(set(target_pairs(catalog, before_rules)).union(target_pairs(catalog, after_rules))))


def _pair(value):
    if isinstance(value, dict):
        action, resource = value.get('action'), value.get('resource')
    elif isinstance(value, (list, tuple)) and len(value) == 2:
        action, resource = value
    else:
        raise ValueError('permission pair needs action and resource')
    if not isinstance(action, str) or not isinstance(resource, str):
        raise ValueError('permission pair needs string action and resource')
    return action, resource


def capture_account(request, user_id, catalog, *, previous_pairs=(), candidate_catalog=None, candidate_rules=()):
    """Capture an account through the shared native audit endpoint.

    ``request`` receives a JSON-ready request body and returns its parsed response.
    A zero-pair request discovers the account's current effective rules.  The
    measured request then evaluates the union of those rules' target pairs,
    candidate policy/registry declarations supplied before the update, and every
    pair retained from the earlier installation state.  Supplying candidate
    declarations makes the before snapshot cover the after proof universe.
    """
    if not isinstance(user_id, str) or not user_id:
        raise ValueError('user id must be a non-empty string')
    discovered = request({'user_id': user_id, 'pairs': []})
    if not isinstance(discovered, dict):
        raise ValueError('native audit response must be an object')
    if discovered.get('subject_refusal'):
        return {'user_id': user_id, 'subject_refusal': discovered['subject_refusal'],
                'error_kind': discovered.get('error_kind'), 'groups': discovered.get('groups', []),
                'pairs': [], 'snapshot': ()}
    rules = discovered.get('rules')
    candidate_catalog = catalog if candidate_catalog is None else candidate_catalog
    pairs = tuple(sorted({_pair(pair) for pair in previous_pairs}.union(
        target_pairs(catalog, rules), target_pairs(candidate_catalog, candidate_rules))))
    payload = {'user_id': user_id,
               'pairs': [{'action': action, 'resource': resource} for action, resource in pairs]}
    measured = request(payload)
    if not isinstance(measured, dict) or measured.get('subject_refusal'):
        raise ValueError('native audit subject changes during permission capture')
    if measured.get('rules') != rules:
        raise ValueError('effective policy rules change during permission capture')
    decisions = measured.get('decisions')
    if not isinstance(decisions, list) or len(decisions) != len(pairs):
        raise ValueError('native audit decision count does not match requested pairs')
    result = {'user_id': user_id, 'groups': measured.get('groups', []), 'rules': rules,
              'pairs': payload['pairs'],
              'snapshot': tuple((action, resource, decision) for (action, resource), decision in zip(pairs, decisions))}
    return result
