"""Developer profile scopes govern the live agent-trait picker."""
import subprocess
import uuid

import yaml

from harness import Scenario, require


TRAIT = 'kickside.self_reflection.traits:self_reflection'


def self_reflection_discovery(ctx):
    from playwright.sync_api import expect
    from scenarios_issue_guards import session_screen
    from scenarios_jira import agent_form, add_capability
    inst = ctx.inst
    inst.install('kickside/mcp')
    profile = inst.request('GET', '/api/v1/keeper/registry/entry?id=app.composition%3Aonboarding_profile.developer',
                           label='reflection-developer-profile')['entry']
    package = next(row for row in profile['data']['packages'] if row['component'] == 'kickside/self-reflection')
    require({row['name']: row['value'] for row in package['parameters']} == {
        'kickside.self_reflection.security:admin_scope': 'app.security:admin',
        'kickside.self_reflection.security:forbid_scope': 'app.security:user',
    }, 'Developer profile lacks the separate execution and discovery scopes')
    email = 'reflection-' + uuid.uuid4().hex[:12] + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {
        'email': email, 'password': inst.password, 'full_name': 'Reflection Reader',
        'groups': ['app.security:members'],
    }, expect=(201,), label='reflection-create-reader')['user']
    inst.cleanup.add('reflection reader', lambda: inst.request(
        'DELETE', '/api/v1/users/' + user['user_id'], expect=(202,), label='reflection-delete-reader'))
    login = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label='reflection-reader-login')
    token = login['token']
    inst.redactor.add(token)
    before = inst.request('GET', '/api/v1/agents/traits', auth=token, label='reflection-member-before')['traits']
    with ctx.paused():
        fixture = inst.app / 'src' / 'reflection-smoke'
        fixture.mkdir()
        (fixture / '_index.yaml').write_text(yaml.safe_dump({
            'version': '1.0', 'namespace': 'app.smoke.reflection', 'entries': [{
                'name': 'dependency', 'kind': 'ns.dependency', 'component': package['component'],
                'version': '*', 'parameters': package['parameters'],
            }],
        }, sort_keys=False))
        for action in ('update', 'install'):
            completed = subprocess.run([inst.config['binary'], '--config', '.wippy.yaml', action],
                cwd=inst.app, env=inst.env, capture_output=True, text=True, timeout=300)
            inst.evidence.save('reflection-' + action, {'code': completed.returncode,
                'output': completed.stdout, 'error': completed.stderr})
            require(completed.returncode == 0, 'Reflection composition ' + action + ' fails: ' + completed.stderr)
    inst.manifest()
    admin = inst.request('GET', '/api/v1/agents/traits', label='reflection-admin-traits')['traits']
    require(any(row['id'] == TRAIT for row in admin), 'Administrator cannot discover installed Self Reflection')
    login = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label='reflection-reader-renew')
    token = login['token']
    inst.redactor.add(token)
    member = inst.request('GET', '/api/v1/agents/traits', auth=token, label='reflection-member-traits')['traits']
    require(not any(row['id'].startswith('kickside.self_reflection') for row in member),
            'Member trait discovery leaks Self Reflection')
    unrelated = {row['id'] for row in before}
    require(unrelated and unrelated == {row['id'] for row in member},
            'Discovery denial changes unrelated public traits')
    selected = inst.request('GET', '/api/v1/agents/traits?ids=' + TRAIT, auth=token,
                            label='reflection-hidden-selected-chip')['traits']
    require(selected == [], 'Selected-chip lookup leaks the hidden trait')
    browser = ctx.browser_check()
    browser.login()
    session_screen(ctx)
    form = agent_form(ctx)
    title = next(row['title'] for row in admin if row['id'] == TRAIT)
    expect(add_capability(form, title)).to_be_visible(timeout=30000)
    form.get_by_role('button', name='Cancel', exact=True).click()
    browser.reset_context()
    browser.login(email, inst.password)
    session_screen(ctx)
    form = agent_form(ctx)
    picker = form.get_by_role('combobox', name='Search capabilities to add', exact=True)
    picker.fill(title)
    expect(form.get_by_text('No matching capabilities.', exact=True)).to_be_visible(timeout=30000)
    expect(form.get_by_role('option').filter(has_text=title)).to_have_count(0)
    public = next(row for row in member if not (row.get('context_schema') or {}).get('required'))
    public_title = public.get('title') or public['id']
    picker.fill(public_title)
    expect(form.get_by_role('option').filter(has_text=public_title)).to_be_visible(timeout=30000)
    browser.screenshot('reflection-member-picker')
    form.get_by_role('button', name='Cancel', exact=True).click()
    from scenarios import nav
    browser.reload()
    session_screen(ctx)
    nav(ctx, 'MCP')
    browser.frame.get_by_role('button', name='New credential', exact=True).first.click()
    credential_form = browser.frame.get_by_role('dialog', name='New MCP credential', exact=True)
    search = credential_form.get_by_role('combobox', name='Search capabilities to add', exact=True)
    search.fill(title)
    expect(credential_form.get_by_text('No matching capabilities.', exact=True)).to_be_visible(timeout=30000)
    expect(credential_form.get_by_role('option').filter(has_text=title)).to_have_count(0)
    search.fill(public_title)
    public_option = credential_form.get_by_role('option').filter(has_text=public_title)
    expect(public_option).to_be_visible(timeout=30000)
    public_option.click()
    expect(credential_form.locator('.kx-trait-row').filter(has_text=public_title)).to_be_visible(timeout=30000)
    search.press('Tab')
    expect(search).to_have_attribute('aria-expanded', 'false', timeout=30000)
    label = 'Northwind member capability ceiling'
    credential_form.get_by_placeholder('research-agent', exact=True).fill(label)
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/mcp/credentials')) as response:
        credential_form.get_by_role('button', name='Create credential', exact=True).click()
    receipt = response.value.json()
    require(response.value.status == 200 and receipt.get('credential'), 'Member cannot save its allowed capability in the credential UI')
    credential = receipt['credential']
    inst.redactor.add(credential['token'])
    inst.cleanup.add('member UI credential', lambda: inst.request('DELETE', '/api/v1/mcp/credentials/' + credential['credential_id'], auth=token))
    expect(credential_form.get_by_text('Credential created', exact=True)).to_be_visible(timeout=30000)
    credential_form.get_by_role('button', name='Done', exact=True).click()
    expect(browser.frame.locator('kickside-mcp').get_by_text(label, exact=True)).to_be_visible(timeout=30000)
    browser.reset_context()
    browser.login()
    inst.evidence.save('self-reflection-discovery', {'admin_visible': True, 'member_visible': False,
                                                   'unrelated_public_traits': len(unrelated)})


REGISTRY = [Scenario('self_reflection_discovery', 'full', self_reflection_discovery, ('first_agent',), instance_setup=True,
    issues=('SELF-REFLECTION-DISCOVERY', 'SEC-MCP-OWNER-CEILING'),
    features=('kickside/self-reflection|capability|' + TRAIT,))]
