"""Validate installed data contract schemas and their request boundaries."""
import json
from urllib.parse import quote

from jsonschema import Draft202012Validator

from harness import require


METHODS = {
    'definable': ('types', 'define'),
    'loadable': ('list', 'describe', 'describe_scope', 'begin', 'append', 'commit', 'rehearse', 'discard'),
    'readable': ('list', 'describe', 'plan', 'query', 'lookup'),
}


def check_refs(root, node):
    if isinstance(node, dict):
        if '$ref' in node:
            ref = node['$ref']
            require(ref.startswith('#/'), 'Data contract has an external schema reference: ' + ref)
            resolved = root
            for token in ref[2:].split('/'):
                resolved = resolved[token.replace('~1', '/').replace('~0', '~')]
        for value in node.values():
            check_refs(root, value)
    elif isinstance(node, list):
        for value in node:
            check_refs(root, value)


def validators(entry, name):
    require(entry['kind'] == 'contract.definition', name + ' is not a contract')
    methods = entry['data']['methods']
    require(tuple(method['name'] for method in methods) == METHODS[name], name + ' changes its method surface')
    result = {}
    for method in methods:
        for side in ('input_schemas', 'output_schemas'):
            schemas = method[side]
            require(len(schemas) == 1, name + '.' + method['name'] + ' has no single JSON schema')
            require(schemas[0]['format'] == 'application/schema+json', name + ' has an unexpected schema format')
            schema = json.loads(schemas[0]['definition'])
            require(schema.get('type') == 'object', name + ' schema is not an object')
            Draft202012Validator.check_schema(schema)
            check_refs(schema, schema)
            result[method['name'], side] = Draft202012Validator(schema)
    return result


def check_case(validator, value, accepted, label):
    errors = list(validator.iter_errors(value))
    require(bool(errors) != accepted, label + ': ' + ('; '.join(error.message for error in errors) or 'accepts invalid input'))


def verify_boundaries(entries):
    specs = {name: validators(entries[name], name) for name in METHODS}
    target = 'northwind:packing'
    column = {'name': 'amount', 'type': 'receiver_money', 'options': {'scale': 2}}
    define = specs['definable']['define', 'input_schemas']
    require('enum' not in define.schema['properties']['columns']['items']['properties']['type'],
            'Definable closes the receiver type vocabulary')
    check_case(define, {'target': target, 'columns': [column], 'dry_run': True}, True, 'Alter target')
    check_case(define, {'code': 'packing', 'title': 'Packing', 'columns': [column]}, True, 'Create target')
    for request in (
        {'columns': [column]},
        {'code': 'packing', 'columns': [column]},
        {'target': target, 'code': 'packing', 'title': 'Packing', 'columns': [column]},
        {'target': target, 'code': 'packing', 'columns': [column]},
    ):
        check_case(define, request, False, 'Define selects one named target')

    append = specs['loadable']['append', 'input_schemas']
    batch = {'load_id': 'northwind-load', 'target': target, 'batch_index': 1, 'rows': [{'amount': 4869}]}
    check_case(append, batch, True, 'Append rows')
    check_case(append, dict(batch, batch_index=0), False, 'Append indexes start at one')
    commit = specs['loadable']['commit', 'input_schemas']
    for scope in ({'all': True}, {'period_in': ['2026-10']}):
        check_case(commit, {'load_id': 'northwind-load', 'targets': [{'target': target, 'replace_scope': scope}]}, True, 'Replace scope')
    for scope in ({}, {'all': True, 'period_in': ['2026-10']}, {'period_in': []}):
        check_case(commit, {'load_id': 'northwind-load', 'targets': [{'target': target, 'replace_scope': scope}]}, False, 'Replace scope selects one boundary')

    query = {'from': {'target': target}, 'select': [{'expr': {'col': 'amount'}}],
             'where': {'op': 'gte', 'args': [{'col': 'amount'}, {'param': 'minimum'}]},
             'params': {'minimum': 0}, 'limit': 10}
    for method in ('plan', 'query'):
        validator = specs['readable'][method, 'input_schemas']
        check_case(validator, query, True, method + ' binds a structural query')
        for invalid in (
            dict(query, sql='select * from packing'),
            dict(query, select=[{'expr': 'amount'}]),
            dict(query, select=[{'expr': {'fn': 'execute_sql', 'args': []}}]),
            dict(query, limit=0),
            dict(query, from_={'target': target}),
        ):
            check_case(validator, invalid, False, method + ' rejects text and invalid bounds')

    for name, methods in specs.items():
        for (method, side), validator in methods.items():
            if side != 'output_schemas':
                continue
            error = {'code': 'invalid_request', 'message': 'Invalid request', 'retriable': False, 'scope': 'flow'}
            check_case(validator, {'success': False, 'error': error}, True, name + '.' + method + ' returns a DataError')
            check_case(validator, {'success': False}, False, name + '.' + method + ' requires the error')
            check_case(validator, {'success': True, 'error': error}, False, name + '.' + method + ' separates success and error')
            check_case(validator, {'success': False, 'error': dict(error, retry_after_ms=-1)}, False,
                       name + '.' + method + ' refuses a negative retry floor')
    return sum(len(methods) for methods in specs.values())


def data_contracts(ctx):
    entries = {}
    for name in METHODS:
        entries[name] = ctx.inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.data:' + name,
                                         label='data-contract-' + name)['entry']
    count = verify_boundaries(entries)
    ctx.inst.evidence.save('data-contract-schemas', {'contracts': list(entries), 'schemas': count})


def event_window(request, base, from_seq, to_seq, *, label=None):
    events, cursor = [], from_seq
    while cursor <= to_seq:
        page = request('GET', base + '?from_seq=' + str(cursor) + '&to_seq=' + str(to_seq) +
                       '&ascending=true&limit=200', **({'label': label} if label else {}))
        require(not page.get('source_gap'), 'Event interval loses retained source events')
        rows = page['events']
        sequences = [row['seq'] for row in rows]
        require(rows and all(cursor <= seq <= to_seq for seq in sequences),
                'Event interval omits its committed tail or returns an out-of-range sequence')
        require(sequences == sorted(set(sequences)), 'Event interval is not strictly ascending')
        events.extend(rows)
        cursor = sequences[-1] + 1
    return events


def inbox_items(request, base='/api/v1/inbox', *, limit=200, label=None, identifier=None):
    rows, number = [], 1
    while True:
        identity = '&id=' + quote(identifier, safe='') if identifier is not None else ''
        page = request('GET', base + '?status=all&limit=' + str(limit) + '&page=' + str(number) + identity,
                       **({'label': label} if label else {}))
        if identifier is not None:
            require(page['total_count'] <= 1 and all(row['id'] == identifier for row in page['items']),
                    'Inbox point query ignores the requested identity')
        rows.extend(page['items'])
        if number * limit >= page['total_count']:
            return rows, page
        require(page['items'], 'Inbox paging ends before its declared total')
        number += 1
