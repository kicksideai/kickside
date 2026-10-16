"""Host registration owns autoload, lazy loads, and descriptor failures."""
import json
import uuid
from urllib.parse import urlparse

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios import platform_onboarding


def host_component_loading(ctx):
    with isolated_fixture(ctx) as fixture:
        platform_onboarding(fixture)
        component_loading_contract(fixture)


def record_component_origin(ctx, tag, label):
    actual = ctx.inst.request('GET', '/api/v1/views/components/by-tag/' + tag, label=label)['component']
    base = urlparse(actual['baseUrl'])
    origin = {'absolute': bool(base.scheme and base.netloc), 'public_origin': base.netloc == urlparse(ctx.inst.base).netloc}
    ctx.inst.evidence.save(label + '-origin', origin)
    return origin


def component_loading_contract(ctx):
    origin = record_component_origin(ctx, 'kickside-agent-onboarding', 'onboarding-component-descriptor')
    require(origin == {'absolute': True, 'public_origin': True}, 'Registry descriptor does not resolve to the public origin: ' + str(origin))
    browser = ctx.browser_check()
    suffix = uuid.uuid4().hex[:12]
    tags = {kind: 'smoke-component-' + kind + '-' + suffix for kind in ('autoload', 'lazy', 'invalid')}
    base = '/smoke-component-' + suffix + '/'
    requests = []

    def descriptor(kind):
        return {'id': 'smoke.components:' + kind, 'name': '@smoke/' + kind,
                'version': '1.2.3', 'type': 'module', 'specification': 'wippy-component-1.0',
                'baseUrl': ctx.inst.base + base, 'browser': kind + '.js',
                'wippy': {'tagName': tags[kind], 'type': 'component', 'props': {'type': 'object', 'properties': {}}}}

    def listing(route):
        requests.append({'type': 'autoload-list', 'url': route.request.url, 'frame': route.request.frame.name})
        response = route.fetch()
        data = response.json()
        ctx.inst.evidence.save('registry-component-descriptors', data)
        if route.request.frame.name == 'wippy:page:app.views:main':
            data['components'].append(descriptor('autoload'))
        route.fulfill(response=response, json=data)

    def metadata(route):
        tag = urlparse(route.request.url).path.rsplit('/', 1)[1]
        kind = next(kind for kind, value in tags.items() if value == tag)
        component = descriptor(kind)
        if kind == 'invalid':
            del component['browser']
        requests.append({'kind': kind, 'type': 'registry', 'url': route.request.url,
                         'frame': route.request.frame.name})
        route.fulfill(json={'success': True, 'component': component})

    def entry(route):
        kind = urlparse(route.request.url).path.rsplit('/', 1)[1].removesuffix('.js')
        requests.append({'kind': kind, 'type': 'entry', 'url': route.request.url,
                         'frame': route.request.frame.name})
        tag = json.dumps(tags[kind])
        barrier = "await new Promise(resolve => state.release.push(resolve));" if kind == 'autoload' else ''
        route.fulfill(content_type='text/javascript', body=f'''
            const tag = {tag};
            const state = (window.__smokeComponentLoads ||= {{}})[tag] ||= {{ entries: 0, release: [] }};
            state.entries++;
            {barrier}
            class Element extends HTMLElement {{ connectedCallback() {{ this.textContent = 'Host component ready'; }} }}
            export async function webComponent() {{ return Element; }}
            const declared = new URL(import.meta.url).searchParams.get('declare-tag');
            if (declared) {{ customElements.define(declared, Element); }}
        ''')

    list_pattern = '**/components/list*'
    tag_pattern = '**/components/by-tag/smoke-component-*'
    entry_pattern = '**' + base + '*.js*'
    browser.page.route(list_pattern, listing)
    browser.page.route(tag_pattern, metadata)
    browser.page.route(entry_pattern, entry)
    try:
        browser.login()
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        frame = browser.page.frame(name='wippy:page:app.views:main')
        require(frame is not None, 'Shell iframe is absent')
        frame.wait_for_function('tag => window.__smokeComponentLoads?.[tag]?.release.length === 1',
                                arg=tags['autoload'], timeout=30000)
        frame.evaluate('''tag => {
            window.__smokeLoadResults = Promise.allSettled([
                window.__WIPPY_APP_API__.loadByTagName(tag),
                window.__WIPPY_APP_API__.loadByTagName(tag),
            ]).then(results => results.map(row => ({status: row.status, error: row.reason?.toString()})));
        }''', tags['autoload'])
        browser.settle()
        frame.evaluate('tag => window.__smokeComponentLoads[tag].release.forEach(resolve => resolve())', tags['autoload'])
        results = frame.evaluate('() => window.__smokeLoadResults')
        state = frame.evaluate('tag => ({entries: window.__smokeComponentLoads[tag].entries, defined: !!customElements.get(tag)})', tags['autoload'])
        ctx.inst.evidence.save('autoload-explicit-registration', {'results': results, 'state': state, 'requests': requests})
        require(all(row['status'] == 'fulfilled' for row in results) and state == {'entries': 1, 'defined': True},
                'Autoload and explicit loading do not share one definition: ' + str({'results': results, 'state': state}))

        frame.evaluate('''async tag => {
            await Promise.all([window.__WIPPY_APP_API__.loadByTagName(tag), window.__WIPPY_APP_API__.loadByTagName(tag)]);
            document.body.appendChild(document.createElement(tag));
        }''', tags['lazy'])
        require(frame.locator(tags['lazy']).inner_text() == 'Host component ready', 'Host-loaded element does not mount')
        lazy = [row for row in requests if row.get('kind') == 'lazy' and row['frame'] == frame.name]
        require([row['type'] for row in lazy].count('registry') == 1 and [row['type'] for row in lazy].count('entry') == 1,
                'Concurrent lazy callers do not share registry discovery and module execution: ' + str(lazy))
        require(all(urlparse(row['url']).netloc == urlparse(ctx.inst.base).netloc for row in lazy),
                'Host component discovery or asset loading leaves the public application origin')

        invalid = frame.evaluate('''async tag => {
            const [result] = await Promise.allSettled([window.__WIPPY_APP_API__.loadByTagName(tag)]);
            return {status: result.status, error: result.reason?.toString(), defined: !!customElements.get(tag)};
        }''', tags['invalid'])
        require(invalid['status'] == 'rejected' and 'registry entry missing baseUrl or browser' in invalid['error'] and not invalid['defined'],
                'Malformed descriptor does not preserve the Host rejection: ' + str(invalid))
        require(not any(row.get('kind') == 'invalid' and row['type'] == 'entry' for row in requests),
                'Malformed descriptor imports an entry module')
        browser.settle()
        browser.clean(0)
        ctx.inst.evidence.save('host-component-loading-contract', {'requests': requests, 'invalid': invalid, 'autoload': state})
    finally:
        ctx.inst.evidence.save('component-loading-requests', requests)
        browser.page.unroute(list_pattern, listing)
        browser.page.unroute(tag_pattern, metadata)
        browser.page.unroute(entry_pattern, entry)


REGISTRY = [Scenario('host_component_loading', 'regression', host_component_loading, ('boot',),
                     issues=('FE-SHELL-COMPONENT-LOADER-OWNERSHIP', 'SMOKE-LOADER-ONBOARDING-STATE-ISOLATION'))]


def member_onboarding_chat(ctx):
    with isolated_fixture(ctx) as fixture:
        platform_onboarding(fixture)
        onboarding_chat_flow(fixture)


def onboarding_chat_flow(ctx):
    from scenarios import first_agent, member_identity, refresh_member_token
    from scenarios_chat import identity

    member = member_identity(ctx)
    refresh_member_token(ctx.inst, member, '/api/v1/agents/traits', lambda value: bool(value.get('traits')),
                         'onboarding-member-admission')
    with identity(ctx, member):
        record_component_origin(ctx, 'kickside-agent-onboarding', 'member-component-descriptor')
        owned = ctx.inst.request('GET', '/api/v1/user-agents', label='member-agents-before')['agents']
        require(not owned, 'Fresh member already owns an agent')
        require((ctx.inst.request('GET', '/api/v1/nav/list', label='member-onboarding-before').get('splash') or {}).get('id') == 'first_agent',
                'Fresh member does not receive onboarding')
        browser = ctx.browser_check()
        browser.login()
        first_agent(ctx)
        marker = 'ONBOARDING-' + uuid.uuid4().hex[:12]
        stream = browser.stream('Give twelve numbered fictional Northwind office tasks, two sentences each. End with ' + marker + '.',
                                marker, 'member-onboarding-chat')
        session_id = browser.current_session()
        browser.settle()
        browser.clean(0)
        ctx.inst.evidence.save('member-onboarding-chat-receipt',
            {'member_id': member['id'], 'agent_id': ctx.state['agent'], 'session_id': session_id,
             'no_agent_before': True, 'onboarding_completed': True, 'chat': stream})


REGISTRY.append(Scenario('member_onboarding_chat', 'regression', member_onboarding_chat, ('boot',),
                         model=True, issues=('FE-SHELL-COMPONENT-LOADER-OWNERSHIP', 'ONBOARD-FIRST-AGENT')))
