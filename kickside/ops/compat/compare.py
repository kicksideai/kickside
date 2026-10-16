"""Published identity and schema compatibility, independent of the transport."""
import json
from pathlib import Path


def schema(value):
    return json.loads(value) if isinstance(value, str) else value


def schema_changes(old, new, path=''):
    if not isinstance(old, dict) or not isinstance(new, dict):
        if old != new:
            yield 'schema_changed', path
        return
    properties = new.get('properties', {})
    for name in sorted(set(new.get('required', [])) - set(old.get('required', []))):
        if 'default' not in properties.get(name, {}):
            yield 'new_required', path + '/required/' + name
    for name in sorted(old.get('properties', {})):
        if name not in properties:
            yield 'removed_property', path + '/properties/' + name
        else:
            yield from schema_changes(old['properties'][name], properties[name], path + '/properties/' + name)
    for key in sorted((set(old) | set(new)) - {'properties', 'required', 'description', 'title', '$schema', 'default', 'examples', '$id'}):
        a, b = old.get(key), new.get(key)
        if a == b:
            continue
        if key == 'dependentRequired':
            for trigger, required in sorted((b or {}).items()):
                covered = set((a or {}).get(trigger, [])) | set(old.get('required', []))
                for name in sorted(set(required) - covered):
                    if 'default' not in properties.get(name, {}):
                        yield 'new_required', path + '/dependentRequired/' + trigger + '/' + name
        elif key == 'items' and a is not None and b is not None:
            yield from schema_changes(a, b, path + '/items')
        elif key in {'$defs', 'definitions'} and a is None and isinstance(b, dict):
            continue
        elif key in {'$defs', 'definitions', 'patternProperties', 'dependentSchemas'} and isinstance(a, dict) and isinstance(b, dict):
            for name in sorted(a):
                if name not in b:
                    yield 'schema_changed', path + '/' + key + '/' + name
                else:
                    yield from schema_changes(a[name], b[name], path + '/' + key + '/' + name)
        elif key in {'oneOf', 'anyOf'} and isinstance(a, list) and isinstance(b, list):
            for index, branch in enumerate(a):
                if not any(not list(schema_changes(branch, candidate)) for candidate in b):
                    yield 'schema_changed', path + '/' + key + '/' + str(index)
        elif key in {'minimum', 'minLength', 'minItems', 'minProperties', 'exclusiveMinimum'} and b is not None and (a is None or b > a):
            yield 'schema_changed', path + '/' + key
        elif key in {'maximum', 'maxLength', 'maxItems', 'maxProperties', 'exclusiveMaximum'} and b is not None and (a is None or b < a):
            yield 'schema_changed', path + '/' + key
        elif key == 'enum' and b is not None and (a is None or any(v not in b for v in a)):
            yield 'schema_changed', path + '/' + key
        elif key == 'type' and b is not None and (a is None or not set(a if isinstance(a, list) else [a]) <= set(b if isinstance(b, list) else [b])):
            yield 'schema_changed', path + '/' + key
        elif key == 'additionalProperties' and isinstance(b, dict):
            yield from schema_changes(a if isinstance(a, dict) else {}, b, path + '/additionalProperties')
        elif key == 'additionalProperties' and b is False and a is not False:
            yield 'schema_changed', path + '/' + key
        elif key not in {'minimum', 'minLength', 'minItems', 'minProperties', 'exclusiveMinimum', 'maximum', 'maxLength', 'maxItems', 'maxProperties', 'exclusiveMaximum', 'enum', 'type', 'additionalProperties'}:
            yield 'schema_changed', path + '/' + key


def compare(module, baseline, old, new):
    rows = []
    def add(identity, code, path=''):
        rows.append({'module': module, 'baseline': baseline, 'id': identity, 'code': code, 'path': path, 'status': 'breaking'})
    for identity in sorted(old):
        if identity not in new:
            add(identity, 'removed_id')
            continue
        a, b = old[identity], new[identity]
        if a['Kind'] != b['Kind']:
            add(identity, 'kind_changed')
            continue
        ad, bd = a.get('Data') or {}, b.get('Data') or {}
        am, bm = a.get('Meta') or {}, b.get('Meta') or {}
        if any(token in {'event', 'trait'} for token in str(am.get('type', '')).split('.')) and am.get('type') != bm.get('type'):
            add(identity, 'public_type_changed', '/meta/type')
        for side in ('input', 'output'):
            before = {item['type'] for item in am.get('events', {}).get(side, [])}
            after = {item['type'] for item in bm.get('events', {}).get(side, [])}
            for event in sorted(before - after):
                add(identity, 'removed_event', '/meta/events/' + side + '/' + event)
        if a['Kind'] == 'http.endpoint':
            for key in ('path', 'method'):
                if ad.get(key) != bd.get(key):
                    add(identity, 'endpoint_changed', '/' + key)
        if a['Kind'] == 'ns.requirement' and ad.get('default') is not None and bd.get('default') is None:
            add(identity, 'requirement_default_removed', '/default')
        if ad.get('schema'):
            if not bd.get('schema'):
                add(identity, 'schema_removed', '/schema')
            else:
                for code, path in schema_changes(schema(ad['schema']), schema(bd['schema']), '/schema'):
                    add(identity, code, path)
        for side in ('input_schema', 'output_schema'):
            if am.get(side):
                if not bm.get(side):
                    add(identity, 'schema_removed', '/meta/' + side)
                else:
                    for code, path in schema_changes(schema(am[side]), schema(bm[side]), '/meta/' + side):
                        add(identity, code, path)
        if a['Kind'] == 'contract.binding':
            contracts = {item['contract']: item for item in bd.get('contracts', [])}
            for binding in sorted(ad.get('contracts', []), key=lambda item: item['contract']):
                contract = binding['contract']
                prefix = '/contracts/' + contract
                if contract not in contracts:
                    add(identity, 'removed_binding_contract', prefix)
                else:
                    for method in sorted(set(binding.get('methods', {})) - set(contracts[contract].get('methods', {}))):
                        add(identity, 'removed_binding_method', prefix + '/methods/' + method)
        if a['Kind'] == 'contract.definition':
            methods = {m['name']: m for m in bd.get('methods', [])}
            for method in sorted(ad.get('methods', []), key=lambda m: m['name']):
                name = method['name']
                prefix = '/methods/' + name
                if name not in methods:
                    add(identity, 'removed_method', prefix)
                    continue
                for side in ('input_schemas', 'output_schemas'):
                    before, after = method.get(side, []), methods[name].get(side, [])
                    if len(before) != len(after):
                        add(identity, 'schema_removed' if len(after) < len(before) else 'schema_added', prefix + '/' + side)
                    for index, (x, y) in enumerate(zip(before, after)):
                        path = prefix + '/' + side + '/' + str(index)
                        if x.get('format') != y.get('format'):
                            add(identity, 'schema_changed', path + '/format')
                        elif x.get('format') == 'application/schema+json':
                            for code, location in schema_changes(schema(x['definition']), schema(y['definition']), path):
                                add(identity, code, location)
                        elif x != y:
                            add(identity, 'schema_changed', path)
    for identity in sorted(set(new) - set(old)):
        row = new[identity]
        if row['Kind'] == 'ns.requirement' and (row.get('Data') or {}).get('default') is None:
            add(identity, 'new_requirement')
    return sorted(rows, key=lambda row: (row['module'], row['id'], row['code'], row['path']))


def apply_transitions(rows, declarations, root, baselines=None):
    result = [dict(row) for row in rows]
    matched = set()
    keys = ('module', 'baseline', 'id', 'code', 'path')
    for declaration in declarations:
        if set(declaration) != set(keys) | {'reason', 'proof', 'owner_approval'} or not all(isinstance(v, str) and v.strip() for k, v in declaration.items() if k != 'path'):
            raise ValueError('transition requires an exact finding, reason, proof and owner_approval')
        if baselines is not None and declaration['baseline'] != baselines.get(declaration['module'], {}).get('version'):
            continue
        proof = (root / declaration['proof']).resolve()
        if not proof.is_relative_to(root.resolve()) or not proof.is_file():
            raise ValueError('transition proof must be a repository file')
        indices = [i for i, row in enumerate(result) if all(row[k] == declaration[k] for k in keys)]
        if len(indices) != 1 or indices[0] in matched:
            raise ValueError('transition is stale, duplicate or does not match one finding')
        index = indices[0]
        matched.add(index)
        result[index].update(status='transition', transition={k: declaration[k] for k in ('reason', 'proof', 'owner_approval')})
    return result
