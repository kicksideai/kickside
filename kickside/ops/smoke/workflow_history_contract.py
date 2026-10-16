"""Exact Workflow history continuity after the authorized first upgrade boundary."""
import json

from harness import require
from module_lifecycle_contract import update_source
from scenarios_automation import open_workflow
from scenarios_hot_update_work import database_rows


def tracker(inst, workflow_id):
    schema = ("SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() "
              "AND table_name='workflow_undo_history'" if inst.engine == 'postgres' else
              "SELECT name FROM sqlite_schema WHERE type='table' AND name='workflow_undo_history'")
    if not database_rows(inst, schema):
        return None
    rows = database_rows(inst, "SELECT tracker FROM workflow_undo_history WHERE workflow_id='" + workflow_id + "'")
    require(len(rows) <= 1, 'Workflow has duplicate history owners')
    return json.loads(rows[0]['tracker']) if rows else {'undo': [], 'redo': []}


def definition(state):
    return {key: value for key, value in state.items() if key not in ('head_seq', 'can_undo', 'can_redo')}


def durable_history(fixture, workflow_id, title, source):
    from playwright.sync_api import expect
    inst = fixture.inst
    path = '/api/v1/workflows/' + workflow_id

    def state(label):
        return inst.request('GET', path + '/state', label='undo-history-' + label)['state']

    initial = state('initial')
    inst.request('POST', path + '/apply', {'commands': [
        {'type': 'note.add', 'body': {'id': 'history-note', 'body': 'Durable editor note'}},
        {'type': 'layout.set-position', 'body': {'node_id': 'history-note', 'x': 24, 'y': 36}},
        {'type': 'param.set', 'body': {'key': 'history_marker', 'value': {'nested': ['one', 'two']}}},
        {'type': 'labels.set', 'body': {'labels': ['first durable batch']}},
    ]}, label='undo-history-first-edit')
    first = state('first')
    inst.request('POST', path + '/apply', {'commands': [
        {'type': 'note.update', 'body': {'id': 'history-note', 'body': 'Second durable note'}},
        {'type': 'labels.set', 'body': {'labels': ['second durable batch']}},
    ]}, label='undo-history-second-edit')
    second = state('second')
    inst.request('POST', path + '/undo', {}, label='undo-history-baseline-undo')
    require(definition(state('baseline')) == definition(first), 'Baseline undo changes the batch definition')
    before = state('before-update')
    stacks = tracker(inst, workflow_id)
    require(before['can_undo'] is True and before['can_redo'] is True,
            'Workflow does not expose both populated history stacks before update')
    require(len(stacks['undo']) >= 1 and len(stacks['redo']) == 1,
            'Workflow does not persist the original exact batch stacks')

    def editor():
        fixture.browser_check()
        open_workflow(fixture, title)
        return fixture.browser.frame.locator('kickside-workflow-builder')

    def action(surface, topic):
        browser = fixture.browser
        with browser.page.expect_response(lambda response: response.request.method == 'POST'
                and response.url.endswith(path + '/' + topic)) as response:
            surface.get_by_role('button', name=topic.title(), exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success') is True,
                'Restored Workflow browser ' + topic + ' fails')

    surface = editor()
    expect(surface.get_by_role('button', name='Undo', exact=True)).to_be_enabled(timeout=30000)
    expect(surface.get_by_role('button', name='Redo', exact=True)).to_be_enabled(timeout=30000)
    for phase in ('update', 'repeat', 'restart', 'cold-reboot'):
        if phase in ('update', 'repeat'):
            update_source(fixture, source, 'kickside/workflows', live=True)
        else:
            with fixture.paused(hard=phase == 'cold-reboot'):
                pass
        restored = state(phase)
        require(restored == before, 'Workflow state or availability changes across ' + phase)
        require(tracker(inst, workflow_id) == stacks, 'Exact Workflow history entries change across ' + phase)
        surface = editor()
        expect(surface.get_by_role('button', name='Undo', exact=True)).to_be_enabled(timeout=30000)
        expect(surface.get_by_role('button', name='Redo', exact=True)).to_be_enabled(timeout=30000)
        action(surface, 'undo')
        require(definition(state(phase + '-undo')) == definition(initial),
                'Restored browser undo produces a different original definition')
        action(surface, 'redo')
        require(definition(state(phase + '-redo-first')) == definition(first),
                'Restored browser redo produces a different first definition')
        action(surface, 'redo')
        require(definition(state(phase + '-redo-second')) == definition(second),
                'Restored browser redo produces a different second definition')
        action(surface, 'undo')
        before = state(phase + '-roundtrip')
        require(definition(before) == definition(first) and before['can_undo'] is True and before['can_redo'] is True,
                'Browser roundtrip changes the definition or availability')
        require(tracker(inst, workflow_id) == stacks, 'Browser roundtrip changes exact Workflow batches')
        fixture.browser.screenshot('undo-history-' + phase)
        fixture.browser.clean(0)
        inst.evidence.save('undo-history-' + phase, {'state': before, 'tracker': stacks,
            'first_definition': definition(first), 'second_definition': definition(second)})
