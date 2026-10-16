"""A selected webhook's payload shape controls Data Sync mapping acceptance."""
from harness import require


def verify_source_schema_mapping(ctx):
    inst = ctx.inst
    inst.install('kickside/webhooks')
    inst.install('kickside/sync')
    schema = {'type': 'object', 'required': ['email'], 'properties': {'email': {'type': 'string'}}}
    webhook = inst.request('POST', '/api/v1/webhooks', {'label': 'Northwind mapped webhook', 'schema': schema}, label='mapping-hook-create')['webhook']
    wid, token = webhook['webhook_id'], webhook['secret']
    inst.redactor.add(token)
    spec = {'title': 'Northwind selected-source mapping', 'enabled': True,
        'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received', 'config': {'thread_id': wid}, 'backfill': 'none'},
        'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
        'transform': {'kind': 'expr', 'expr': '{content: input.phone, title: "Northwind mapping receipt"}'}}
    before = inst.request('GET', '/api/v1/automations', label='mapping-before')['automations']
    refused = inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': spec}, expect=(400,), label='mapping-undeclared-field')
    require('binding mapping output' in str(refused), 'Unknown payload field does not refuse the mapping: ' + str(refused))
    after = inst.request('GET', '/api/v1/automations', label='mapping-after')['automations']
    require({a['id'] for a in before} == {a['id'] for a in after}, 'Rejected mapping creates an automation')
    spec['transform']['expr'] = '{content: input.email, title: "Northwind mapping receipt"}'
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': spec}, label='mapping-valid-create')['id']
    inst.request('POST', '/api/public/hooks/' + wid, {'email': 'warehouse@northwind.example'}, auth=token, expect=(202,), label='mapping-hook-deliver')
    def delivered():
        items = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='mapping-inbox')['items']
        return next((item for item in items if item['title'] == 'Northwind mapping receipt' and item['content'] == 'warehouse@northwind.example'), None)
    inst.wait(delivered, 'Selected-schema mapping delivers the declared field', seconds=60)
    spec['title'] = 'Northwind edited event sync'
    spec['transform']['expr'] = '{content: input.email, title: "Northwind edited mapping receipt"}'
    for attempt in range(2):
        applied = inst.request('PUT', '/api/v1/automations/' + aid, {'input': spec}, label='mapping-unchanged-source-' + str(attempt))
        require(applied.get('success') is True, 'Unchanged event source refuses an owner-field edit')
    current = inst.request('GET', '/api/v1/automations/' + aid + '/config', label='mapping-edited-config')['config']
    require(current['_portable_input']['trigger'] == spec['trigger'] and current['source']['thread_id'] == wid and current['title'] == spec['title'], 'Edit replaces the selected source declaration')
    inst.request('POST', '/api/public/hooks/' + wid, {'email': 'edited@northwind.example'}, auth=token, expect=(202,), label='mapping-edited-hook-deliver')
    def edited_delivery():
        items = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='mapping-edited-inbox')['items']
        return next((item for item in items if item['title'] == 'Northwind edited mapping receipt' and item['content'] == 'edited@northwind.example'), None)
    inst.wait(edited_delivery, 'Reconfigured unchanged source delivers through the edited transform', seconds=60)
    spec['transform']['expr'] = '{content: input.phone, title: "Northwind mapping receipt"}'
    refused = inst.request('PUT', '/api/v1/automations/' + aid, {'input': spec}, expect=(400,), label='mapping-invalid-reconfigure')
    require('binding mapping output' in str(refused), 'Reconfiguration accepts an undeclared field')
    current = inst.request('GET', '/api/v1/automations/' + aid + '/config', label='mapping-preserved-config')['config']
    require(current['transform']['expr'] == '{content: input.email, title: "Northwind edited mapping receipt"}', 'Refused mapping replaces the applied declaration')
    inst.request('DELETE', '/api/v1/automations/' + aid, label='mapping-delete-sync')
    inst.wait(lambda: aid not in str(inst.request('GET', '/api/v1/automations')), 'Mapped automation removal', seconds=60)
    inst.request('DELETE', '/api/v1/webhooks/' + wid, label='mapping-delete-hook')
