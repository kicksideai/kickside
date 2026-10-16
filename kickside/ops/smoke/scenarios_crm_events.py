"""CRM AI-fill and external-write production events delivered through Data Sync."""
import base64
import hashlib
from datetime import datetime, timezone
import json
import re
import urllib.request
import uuid

from fixture_member_permissions import register_member_policy_grants
from harness import Scenario, require
from browser import Browser


CRM = '/api/v1/workspace/crm/'
PORT = 'kickside.crm.ports:'
EVENT = 'kickside.crm.events:'
JIRA_SINK = 'kickside.atlassian.jira.sink:issues'


def setup(ctx):
    import yaml

    inst = ctx.inst
    Browser.release(ctx)
    base = ctx.fixtures.start('jira')
    inst.cleanup.add('CRM event Jira fixture', lambda: ctx.fixtures.stop('jira'))
    fixture = inst.app / 'src' / 'crm-event-smoke'
    fixture.mkdir()
    entries = [
        {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'resources': [base + '/*'], 'actions': ['http_client.request'], 'effect': 'allow'}},
        {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'resources': ['127.0.0.1'], 'actions': ['http_client.private_ip'], 'effect': 'allow'}},
    ]
    entries = register_member_policy_grants(inst.app, entries)
    (fixture / '_index.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': 'app.smoke.crm_events', 'entries': entries}, sort_keys=False))
    ctx.restart()
    for module in ('kickside/crm', 'kickside/sync', 'kickside/atlassian'):
        inst.install(module)
    connection = inst.request('POST', '/api/v1/connections', {
        'impl_id': 'kickside.atlassian.connection:atlassian_connection',
        'name': 'Northwind CRM write-back', 'validate': True,
        'private_context': {'site_url': base, 'deployment': 'cloud',
                            'email': 'northwind@example.invalid', 'api_token': 'fictional-jira-token'},
    }, label='jira-connection')['component_id']
    require(connection, 'CRM write-back connection has no component id')
    ctx.state['crm_event_connection'] = connection
    ctx.state['crm_event_jira'] = base
    inst.cleanup.add('CRM event Jira connection', lambda: inst.request(
        'DELETE', '/api/v1/connections/' + connection, label='jira-connection-delete'))
    inst.manifest()


def sync(ctx, cid, source, title, sink, config, transform):
    inst = ctx.inst
    result = inst.request('POST', '/api/v1/automations', {
        'type': 'kickside.sync:sync', 'input': {
            'title': title, 'enabled': True,
            'trigger': {'v': 2, 'source': PORT + source,
                        'config': {'thread_id': cid}, 'backfill': 'none'},
            'sink_port': sink, 'sink_config': config, 'transform': transform,
        },
    }, label='subscribe-' + source)
    aid = result['id']
    require(aid, 'CRM event subscription has no automation id: ' + str(result))
    inst.cleanup.add(title, lambda: inst.request(
        'DELETE', '/api/v1/automations/' + aid, label='automation-delete-' + source))
    return aid


def subscribe(ctx, cid, source, title):
    expression = '{"title":' + json.dumps(title) + ',"content":' + json.dumps(title) + ',"metadata":{"crm_event":payload}}'
    return sync(ctx, cid, source, title, 'kickside.inbox.sink:inbox_item', {},
                {'kind': 'expr', 'expr': expression})


def receipt(ctx, title, aid, source):
    inst = ctx.inst

    def delivered():
        items = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='event-inbox')['items']
        found = [item for item in items if item.get('title') == title]
        require(len(found) <= 1, 'CRM event subscription duplicates its receipt: ' + str(found))
        inst.request('GET', '/api/v1/automations/' + aid + '/status', label='subscription-status-' + source)
        return found[0] if found else None

    item = inst.wait(delivered, PORT + source + ' delivers event content', seconds=60)
    require(item.get('content') == title, 'CRM event receipt content differs: ' + str(item))
    metadata = item.get('metadata', {})
    require(metadata.get('sync_origin') == aid, 'CRM event receipt belongs to another subscription: ' + str(item))
    body = metadata.get('crm_event')
    require(isinstance(body, dict), 'CRM event receipt loses its event body: ' + str(item))
    inst.evidence.save('delivered-' + source, body)
    return body


def declaration(ctx, source):
    inst = ctx.inst
    created = inst.request('POST', '/api/v1/workspace/crm', {
        'title': 'Northwind ' + source, 'idempotency_key': uuid.uuid4().hex,
    }, expect=(201,), label='crm-create')
    cid = created['component_id']
    base = CRM + cid
    initial = inst.request('GET', base + '/schema', label='schema-initial')
    prompt = 'Return exactly NORTHWIND-AI-59. The fictional shipment has 47 crates and 12 reserve crates.'
    ai = {'prompt': prompt, 'model': ctx.state['model']}
    target = {'provider': 'atlassian', 'connection_id': ctx.state['crm_event_connection'],
              'sink_port': JIRA_SINK, 'sink_config': {
                  'connection_id': ctx.state['crm_event_connection'], 'project_key': 'NW'},
              'field_map': {'summary': 'summary'}, 'target_ref_attribute': 'issue_key'}
    authored = {
        'version': 'northwind-crm-events',
        'objects': [{'type': 'shipment', 'label': 'Shipments', 'config': {'write_targets': [target]}}],
        'attributes': [
            {'object_type': 'shipment', 'attr': 'summary', 'label': 'Summary', 'data_type': 'text'},
            {'object_type': 'shipment', 'attr': 'issue_key', 'label': 'Jira issue', 'data_type': 'text'},
            {'object_type': 'shipment', 'attr': 'crate_brief', 'label': 'AI crate brief', 'data_type': 'ai', 'config': ai},
        ],
        'pipelines': [], 'views': [], 'merge_config': {'objects': {}},
    }
    inst.request('POST', base + '/schema', {
        'declaration': authored, 'expected_revision': initial['revision'],
    }, label='schema-declare')

    def assert_schema(schema):
        current = schema['declaration']
        attributes = {(attr['object_type'], attr['attr']): attr for attr in current['attributes']}
        filled = attributes[('shipment', 'crate_brief')]
        require(filled['data_type'] == 'ai' and filled['config'] == ai,
                'CRM schema loses the declared AI attribute: ' + str(filled))
        obj = next(obj for obj in current['objects'] if obj['type'] == 'shipment')
        require(obj['config']['write_targets'] == [target],
                'CRM schema loses the declared write target: ' + str(obj))
        for attr in ('summary', 'issue_key'):
            require(attributes[('shipment', attr)]['data_type'] == 'text', 'CRM write target field type differs')

    assert_schema(inst.request('GET', base + '/schema', label='schema-read-back'))
    exported = inst.request('GET', base + '/config/export', label='schema-export')['config']
    revision = inst.request('GET', base + '/schema', label='schema-import-revision')['revision']
    inst.request('POST', base + '/config/import', {'artifact': exported, 'expected_revision': revision}, label='schema-import')
    assert_schema(inst.request('GET', base + '/schema', label='schema-round-trip'))
    after = inst.request('GET', base + '/config/export', label='schema-export-after-import')['config']
    ctx.state['crm_event_schema_hashes'] = (exported['metadata']['sourceHash'], after['metadata']['sourceHash'])
    return cid, ai, target


def schema_round_trip(ctx):
    declaration(ctx, 'schema_round_trip')
    before, after = ctx.state['crm_event_schema_hashes']
    require(before == after, 'CRM declaration round-trip changes the source hash: ' + before + ' -> ' + after)


def apply(ctx, cid, kind, body):
    return ctx.inst.request('POST', CRM + cid + '/apply', {
        'commands': [{'type': EVENT + kind, 'body': body}],
    }, label=kind.replace('.', '-'))


def ai_attribute_filled(ctx):
    inst = ctx.inst
    cid, ai, _ = declaration(ctx, 'ai_attribute_filled')
    rid = uuid.uuid4().hex
    title = 'Northwind AI event ' + rid
    aid = subscribe(ctx, cid, 'ai_attribute_filled', title)
    generation_title = 'Northwind Gemma control ' + rid
    generation = sync(ctx, cid, 'record_created', generation_title, 'kickside.inbox.sink:inbox_item',
                      {'title': generation_title}, {'kind': 'llm', **ai})
    apply(ctx, cid, 'record.created', {'record_id': rid, 'object_type': 'shipment',
                                     'values': {'summary': '47 crates and 12 reserve crates'}})

    def generated():
        rows = [row for row in inst.request('GET', '/api/v1/inbox?status=all&limit=200',
                                           label='gemma-output')['items'] if row.get('title') == generation_title]
        require(len(rows) <= 1, 'Gemma control duplicates its receipt')
        inst.request('GET', '/api/v1/automations/' + generation + '/status', label='gemma-status')
        return rows[0] if rows else None

    output = inst.wait(generated, 'Gemma generates the declared AI prompt', seconds=180)
    require(output.get('content', '').strip() == 'NORTHWIND-AI-59', 'Gemma AI content differs: ' + str(output))
    value = output['content'].strip()
    apply(ctx, cid, 'ai_attribute.filled', {'record_id': rid, 'object_type': 'shipment',
          'attr': 'crate_brief', 'value': value, 'model': ai['model']})
    record = inst.request('POST', CRM + cid + '/query', {'kind': 'record', 'record_id': rid}, label='ai-record-before-delivery')
    require(record['data']['values'].get('crate_brief') == value, 'Gemma output does not fill the declared AI attribute')
    body = receipt(ctx, title, aid, 'ai_attribute_filled')
    for key, expected in {'record_id': rid, 'object_type': 'shipment', 'attr': 'crate_brief',
                          'value': 'NORTHWIND-AI-59', 'model': ai['model']}.items():
        require(body.get(key) == expected, 'AI event ' + key + ' differs: ' + str(body))
    record = inst.request('POST', CRM + cid + '/query', {'kind': 'record', 'record_id': rid}, label='ai-record-after-delivery')
    require(record['data']['values'].get('crate_brief') == body['value'], 'AI event value does not project into the declared attribute')


def external_write(ctx, source):
    inst = ctx.inst
    cid, _, target = declaration(ctx, source)
    rid = uuid.uuid4().hex
    title = 'Northwind ' + source + ' ' + rid
    issue = 'NW-404' if source == 'external_write_failed' else 'NW-1'
    summary = 'Northwind mirrored shipment ' + rid
    apply(ctx, cid, 'record.created', {'record_id': rid, 'object_type': 'shipment',
                                     'values': {'summary': 'Northwind shipment draft', 'issue_key': issue}})
    aid = subscribe(ctx, cid, source, title)
    outbound = sync(ctx, cid, 'record_updated', 'Northwind Jira mirror ' + rid, target['sink_port'],
                    target['sink_config'], {'kind': 'expr', 'expr':
                    '{"issue_key":payload.set.issue_key,"fields":{"summary":payload.set.summary}}'})
    apply(ctx, cid, 'record.updated', {'record_id': rid, 'object_type': 'shipment',
                                     'set': {'summary': summary, 'issue_key': issue}})

    def mirrored():
        rows = [row for row in ctx.fixtures.requests('jira') if row['method'] == 'PUT'
                and row['path'] == '/rest/api/3/issue/' + issue
                and row['body'] == {'fields': {'summary': summary}}]
        require(len(rows) <= 1, 'CRM write-back duplicates its Jira request: ' + str(rows))
        inst.request('GET', '/api/v1/automations/' + outbound + '/status', label='jira-write-status')
        inst.evidence.save('jira-requests', ctx.fixtures.requests('jira'))
        return rows[0] if rows else None

    write = inst.wait(mirrored, 'CRM record change reaches the Jira fixture', seconds=60)
    require(write['auth_ok'], 'CRM external write lacks fixture authentication')
    if source == 'external_write_failed':
        require(write['status'] == 404 and write['response'] == {'message': 'mock endpoint or resource not found'},
                'Jira fixture does not force the requested failure: ' + str(write))
    else:
        require(write['status'] == 204, 'Jira fixture rejects the CRM mirror: ' + str(write))
        auth = base64.b64encode(b'northwind@example.invalid:fictional-jira-token').decode()
        request = urllib.request.Request(ctx.state['crm_event_jira'] + '/rest/api/3/issue/' + issue,
                                         headers={'Authorization': 'Basic ' + auth})
        with urllib.request.urlopen(request, timeout=35) as response:
            read = json.load(response)
        inst.evidence.save('jira-mirror-read-back', read)
        require(read['key'] == issue and read['fields']['summary'] == summary,
                'CRM external write does not persist its Jira summary: ' + str(read))
    hashes = {'summary': hashlib.sha256(json.dumps(summary, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()}
    ledger = {'provider': target['provider'], 'connection_id': target['connection_id'],
              'target_ref': issue, 'object_type': 'shipment', 'value_hashes': hashes,
              'write_ref': outbound + ':' + rid, 'origin': {'run_id': outbound + ':' + rid}}
    timestamp = {'external_write_requested': 'requested_at', 'external_write_succeeded': 'completed_at',
                 'external_write_failed': 'failed_at'}[source]
    ledger[timestamp] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    if source == 'external_write_failed':
        ledger['error'] = {'code': 'not_found', 'retriable': False, 'message': write['response']['message']}
    apply(ctx, cid, '.'.join(source.rsplit('_', 1)), ledger)
    body = receipt(ctx, title, aid, source)
    require(all(body.get(key) == value for key, value in ledger.items()),
            'CRM write-ledger event differs from its producer fact: ' + str(body))
    actor = inst.request('GET', '/api/v1/user/me', label='write-ledger-actor')['user']['id']
    require(body.get('actor') == actor and isinstance(body.get('occurred_at'), str),
            'CRM ledger loses its authenticated actor or event timestamp: ' + str(body))
    for key, expected in {'provider': target['provider'], 'connection_id': target['connection_id'],
                          'target_ref': issue, 'object_type': 'shipment', 'value_hashes': hashes}.items():
        require(body.get(key) == expected, 'External-write event ' + key + ' differs: ' + str(body))
    require(isinstance(body.get('write_ref'), str) and body['write_ref'], 'External-write event loses its delivery key')
    require(isinstance(body.get('origin'), dict) and body['origin'].get('run_id'), 'External-write event loses its run origin')
    timestamp = {'external_write_requested': 'requested_at', 'external_write_succeeded': 'completed_at',
                 'external_write_failed': 'failed_at'}[source]
    require(isinstance(body.get(timestamp), str)
            and re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z', body[timestamp]),
            'External-write event loses its UTC timestamp')
    if source == 'external_write_failed':
        error = body.get('error')
        require(isinstance(error, dict) and error.get('code') == 'not_found' and error.get('retriable') is False
                and 'mock endpoint or resource not found' in error.get('message', ''),
                'External-write failure loses the fixture error: ' + str(body))


REGISTRY = [
    Scenario('crm_events_setup', 'full', setup, ('first_agent',), instance_setup=True),
    Scenario('crm_events_schema_round_trip', 'full', schema_round_trip, ('crm_events_setup',), model=True,
             features=('kickside/crm|http|GET /api/v1/workspace/crm/{id}/schema',
                       'kickside/crm|http|POST /api/v1/workspace/crm/{id}/schema',
                       'kickside/crm|http|GET /api/v1/workspace/crm/{id}/config/export',
                       'kickside/crm|http|POST /api/v1/workspace/crm/{id}/config/import')),
    Scenario('crm_events_ai_attribute_filled', 'full', ai_attribute_filled, ('crm_events_setup',), model=True,
             features=('kickside/crm|trigger|kickside.crm.ports:ai_attribute_filled',)),
    Scenario('crm_events_external_write_requested', 'full', lambda ctx: external_write(ctx, 'external_write_requested'),
             ('crm_events_setup',), features=('kickside/crm|trigger|kickside.crm.ports:external_write_requested',)),
    Scenario('crm_events_external_write_succeeded', 'full', lambda ctx: external_write(ctx, 'external_write_succeeded'),
             ('crm_events_setup',), features=('kickside/crm|trigger|kickside.crm.ports:external_write_succeeded',)),
    Scenario('crm_events_external_write_failed', 'full', lambda ctx: external_write(ctx, 'external_write_failed'),
             ('crm_events_setup',), features=('kickside/crm|trigger|kickside.crm.ports:external_write_failed',)),
]
