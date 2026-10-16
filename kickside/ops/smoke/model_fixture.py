"""Discover live model cards for fixture agents without replaying onboarding."""

from harness import require


def configure_cards(inst, cards, *, embedding_dimensions=512):
    model=inst.config['model']
    generation=next(card for card in cards if card.get('provider_model')==model['llm'] or card['name'].endswith('/'+model['llm']))
    embedding=next(card for card in cards if card.get('provider_model')==model['embed'] or card['name'].endswith('/'+model['embed']))
    generation.update(max_tokens=32768, output_tokens=4096, enabled=True)
    embedding.update(max_tokens=8192, output_tokens=0, enabled=True)
    if embedding_dimensions is not None:
        embedding['dimensions']=embedding_dimensions
    for card in (generation,embedding):
        inst.request('PUT','/api/v1/models/cards',card,label='fixture-model-budget')
    configured=inst.request('GET','/api/v1/models/admin',label='fixture-configured-models')['models']
    by_name={card['name']:card for card in configured}
    for requested in (generation,embedding):
        actual=by_name[requested['name']]
        require(all(actual.get(key)==requested[key] for key in ('enabled','max_tokens','output_tokens')),
                'Model differs from its explicit smoke budget: '+requested['name'])
    if embedding_dimensions is not None:
        require(by_name[embedding['name']]['dimensions']==embedding_dimensions,
                'Embedding dimensions differ from the requested smoke dimensions')
    return by_name[generation['name']],by_name[embedding['name']]


def live_profile(ctx, label, *, scope='scenario'):
    inst = ctx.inst
    model = inst.config['model']
    profile = inst.request('POST', '/api/v1/models/provider-profiles', {
        'name': label, 'provider_id': 'wippy.llm.openai_compat:provider', 'enabled': True,
        'config': {'base_url': model['base'], 'api_key': model['key'], 'timeout': 600},
    }, expect=(201,), label='fixture-model-profile')['profile']
    pid = profile['id']
    inst.cleanup.add(label + ' model profile', lambda: inst.request('DELETE',
        '/api/v1/models/provider-profiles/' + pid), scope=scope)
    inst.request('POST', '/api/v1/models/provider-profiles/' + pid + '/discover', {},
        label='fixture-model-discovery', timeout=120)
    cards=inst.request('GET', '/api/v1/models/admin', label='fixture-model-cards')['models']
    return profile, list(configure_cards(inst,cards))
