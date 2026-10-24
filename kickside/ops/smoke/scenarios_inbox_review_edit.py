"""Per-item review titles and editable drafts share the canonical review contract."""
from urllib.parse import quote

from harness import Scenario, require
from module_harness import run_focused_module_test


def review_arm(ctx):
    run_focused_module_test(ctx, 'kickside/inbox', 'arm_decision_test')
    run_focused_module_test(ctx, 'kickside/inbox', 'resume_decision_test')


def open_review_inbox(ctx):
    """Enter Inbox as the provisioned owner without assuming a first-agent splash."""
    from scenarios import nav
    from scenarios_access import actor_browser

    browser = actor_browser(ctx, 'owner')
    nav(ctx, 'Inbox')
    return browser


def review_edit(ctx):
    from scenarios_automation import flow_detail

    inst = ctx.inst
    inst.install('kickside/workflows')
    wid = inst.request('POST', '/api/v1/workflows', {'title': 'Review follow-up drafts'})['flow_id']
    base = '/api/v1/workflows/' + wid
    schema = {'type': 'object', 'additionalProperties': True}
    form = {'type': 'object', 'required': ['body'], 'properties': {
        'body': {'type': 'string', 'title': 'Email draft', 'format': 'textarea', 'default_expr': 'input.draft'},
        'stage': {'type': 'integer', 'enum': [0, 1], 'default_expr': 'input.stage'},
        'notify': {'type': 'boolean', 'enum': [False, True], 'default_expr': 'input.notify'},
    }}
    def node(identifier, kind, **values):
        return {'type': 'node.add', 'body': dict(id=identifier, kind=kind, **values)}
    def edge(identifier, source, target, port):
        return {'type': 'edge.add', 'body': {'id': identifier, 'source_id': source, 'target_id': target,
                                            'source_port': port, 'target_port': 'in'}}
    commands = [
        node('start', 'start', config={'input_schema': schema}),
        node('each', 'for_each', title='Review every draft', config={'source_array_key': 'items', 'batch_size': 2}),
        node('review', 'block', title='Review draft', ref='kickside.inbox:block.review', config={
            'prompt': 'Review the follow-up draft.', 'title_expr': "'Follow-up: ' + input.name", 'form': form}),
        node('finish', 'finish', config={'output_schema': schema}),
        edge('start-each', 'start', 'each', 'out'), edge('each-review', 'each', 'review', 'body'),
        edge('each-finish', 'each', 'finish', 'done'),
    ]
    inst.request('POST', base + '/apply', {'commands': commands})
    version = inst.request('POST', base + '/publish', {})['version']
    items = [{'name': 'Example renewal', 'draft': 'Hello team,\nPlease review the proposal.', 'stage': 0, 'notify': False},
             {'name': 'Example expansion', 'draft': 'Hello team,\nCan we discuss the next step?', 'stage': 1, 'notify': True}]
    rid = inst.request('POST', base + '/run', {'version': version, 'input': {'items': items}})['run_id']
    def pending():
        rows = [row for row in inst.request('GET', '/api/v1/inbox?status=pending&limit=200')['items']
                if row.get('metadata', {}).get('run_id') == rid]
        require(len(rows) <= len(items), 'Review creates duplicate items')
        return rows if len(rows) == len(items) else None
    rows = inst.wait(pending, 'Each item reaches its own review', seconds=60)
    by_title = {row['title']: row for row in rows}
    require(set(by_title) == {'Follow-up: ' + item['name'] for item in items}, 'Review titles do not distinguish inputs')
    browser = open_review_inbox(ctx)
    expected = []
    for index, item in enumerate(items):
        title = 'Follow-up: ' + item['name']
        row = by_title[title]
        require(row['metadata']['form']['properties']['body']['default'] == item['draft'], 'Review loses input default')
        browser.frame.locator('.kx-item').filter(has_text=title).click()
        draft = browser.frame.locator('textarea[data-testid="decision-body"]')
        draft.wait_for(timeout=30000)
        require(draft.input_value() == item['draft'], 'Draft opens without its input value')
        edited = item['draft'] + '\nReviewed and corrected.'
        draft.fill(edited)
        browser.screenshot('inbox-edited-draft-' + str(index))
        path = '/api/v1/inbox/' + quote(row['id'], safe='') + '/approve'
        with browser.page.expect_response(lambda response: response.url.endswith(path) and response.request.method == 'POST') as response:
            browser.frame.get_by_test_id('inbox-action').filter(has_text='Approve').first.click()
        require(response.value.status == 200, 'Edited approval fails')
        submitted = {'body': edited, 'stage': item['stage'], 'notify': item['notify']}
        require(response.value.request.post_data_json == {'form': submitted}, 'Approval loses reviewer edits or scalar types')
        expected.append({'outcome': 'approve', 'form': submitted})
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Edited reviews complete the For each', seconds=60)
    require(done['run']['output'] == {'result': expected}, 'Review outputs differ from the edited drafts: ' + str(done['run']['output']))
    inst.evidence.save('inbox-edited-review-output', done)
    from scenarios_automation import open_workflow
    open_workflow(ctx, 'Review follow-up drafts')
    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    browser.frame.locator('.wf-runs-row').filter(has_text=rid[:8]).click()
    browser.frame.locator('.vue-flow__node[data-id="each"]').click()
    output = browser.frame.locator('.wf-payload').filter(has=browser.frame.get_by_text('Output', exact=True)).locator('.wf-run-output')
    output.wait_for(timeout=30000)
    require('Reviewed and corrected.' in output.inner_text(), 'Run inspector does not show the edited output')
    output.scroll_into_view_if_needed()
    browser.screenshot('inbox-edited-draft-output')


ISSUES = ('INBOX-REVIEW-INPUT-TITLE', 'INBOX-REVIEW-EDITABLE-INPUT')
REGISTRY = [
    Scenario('inbox_review_input_arm', 'regression', review_arm, issues=ISSUES),
    Scenario('inbox_review_edit', 'regression', review_edit, ('platform_onboarding',), issues=ISSUES + ('INBOX-REVIEW-ENUM-VALUE-TYPES',),
             features=('kickside/inbox|workflow_block|kickside.inbox:block.review',
                       'kickside/inbox|http|POST /api/v1/inbox/{id}/{action}'), instance_setup=True),
]
