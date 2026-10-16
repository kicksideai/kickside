"""Read-only HubSpot engagements preserve their CRM placement."""
from harness import require


def engagement_refusal(ctx, *, tool, connection, write, arguments, label):
    from scenarios_providers import probe_value
    return probe_value(ctx, tool=tool, connection=connection, write=write,
                       arguments=arguments, label=label)


def hubspot_engagements(ctx):
    from scenarios_providers import probe
    cid = ctx.state['hubspot_connection']
    request_start = len(ctx.fixtures.requests('hubspot'))
    for object_type in ('meetings', 'notes', 'emails', 'calls'):
        page = probe(ctx, port='kickside.hubspot.source:crm', connection=cid,
                     arguments={'config': {'object_type': object_type}, 'limit': 10},
                     label='hubspot-engagement-' + object_type)
        require(page.get('success') is True and len(page.get('items', [])) == 1, 'Engagement pull loses its row: ' + object_type)
        item = page['items'][0]
        require(item['item_key'] == 'hubspot:' + object_type + ':731', 'Engagement identity differs')
        require(item['source_version'] == '2026-10-01T12:00:00Z', 'Engagement watermark differs')
        payload = item['payload']
        require('NORTHWIND-ENGAGEMENT-731' in payload['content'] and '<p>' not in payload['content'], 'Engagement content loses clean text')
        require(payload['associations']['contacts'] == ['contact-731', 'contact-732'] and payload['associations']['deals'] == ['deal-731'],
                'Engagement association continuation loses CRM placement')
        if object_type == 'calls':
            require(payload['record']['fields']['call_status'] == 'COMPLETED' and payload['record']['fields']['call_disposition'] == 'PACKED',
                    'Call status and disposition lose distinct values')
        refused = engagement_refusal(ctx, tool='kickside.hubspot.traits:write_tool', connection=cid, write=True,
                        arguments={'action': 'create_object', 'object_type': object_type, 'properties': {}},
                        label='hubspot-read-only-' + object_type)
        require(refused.get('success') is False and 'object_type must be' in refused.get('error', ''), 'Engagement write gate admits ' + object_type)
    records = ctx.fixtures.requests('hubspot')[request_start:]
    require(sum(row['path'].startswith('/crm/v4/associations/') for row in records) == 12, 'Engagement paging does not reach the transport')
    require(not any(row['method'] == 'POST' and row['path'].split('/')[-1] in ('meetings', 'notes', 'emails', 'calls') for row in records),
            'Read-only engagement writes reach the transport')
