"""Keeper edits retain their transport session and UTC publication time."""
from datetime import datetime, timezone
import yaml
import uuid
from urllib.parse import urlencode

from harness import Scenario, require
from mcp_client import MCPClient
from runtime_fixtures import isolated_fixture
from scenarios_keeper_mcp import mint


def editing_client(inst):
    client = mint(inst, 'Independent editing sessions')
    client.initialize()
    client.call('use_trait', {'ids': ['keeper.agents.traits.wippy:operator']})
    return client


def tool(client, name, arguments):
    return client.call('call_tool', {'id': 'keeper.state.tools:' + name, 'arguments': arguments})


def open_branch(inst, client, name):
    result = tool(client, 'branch', {'action': 'set', 'branch': name})
    require(result.get('branch') == name and result.get('changeset_id'),
            'Keeper does not open the requested branch: ' + str(result))
    return result['changeset_id']


def create_entry(client, entry_id, marker):
    entry = {'name': entry_id.split(':', 1)[1], 'kind': 'registry.entry', 'data': {'marker': marker}}
    tool(client, 'edit', {'command': 'create', 'path': entry_id,
                          'file_text': '<definition>\n' + yaml.safe_dump(entry) + '</definition>\n'})


def manage_namespace(inst, namespace):
    config = inst.request('GET', '/api/v1/keeper/sync/config')
    inst.request('PUT', '/api/v1/keeper/sync/config', {
        'managed_namespaces': sorted(set(config['managed_namespaces']) | {namespace})})
    inst.await_keeper()


def session_isolation(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        first = editing_client(inst)
        second = MCPClient(inst, first.token, first.endpoint)
        second.initialize()
        require(first.session != second.session, 'MCP initialize reuses a transport session')
        suffix = uuid.uuid4().hex[:12]
        namespace = 'app.smoke.context_' + suffix
        manage_namespace(inst, namespace)
        left, right = namespace + ':left', namespace + ':right'
        a = open_branch(inst, first, 'editing-left-' + suffix)
        b = open_branch(inst, second, 'editing-right-' + suffix)
        create_entry(first, left, 'left-original')
        create_entry(second, right, 'right-original')
        tool(first, 'edit', {'command': 'str_replace', 'path': left,
                            'old_str': 'left-original', 'new_str': 'left-updated'})
        tool(second, 'edit', {'command': 'str_replace', 'path': right,
                             'old_str': 'right-original', 'new_str': 'right-updated'})
        evidence = {}
        for name, changeset in (('left', a), ('right', b)):
            evidence[name] = inst.request('GET', '/api/v1/keeper/changesets/' + changeset + '/changes',
                                          label='editing-' + name + '-changes')
        evidence['left_context'] = tool(first, 'branch', {'action': 'get'})
        evidence['right_context'] = tool(second, 'branch', {'action': 'get'})
        inst.evidence.save('independent-editing-sessions', evidence)
        require(left in str(evidence['left']) and right not in str(evidence['left']),
                'First session edits land outside its changeset: ' + str(evidence))
        require(right in str(evidence['right']) and left not in str(evidence['right']),
                'Second session edits land outside its changeset: ' + str(evidence))
        require(evidence['left_context'].get('changeset_id') == a
                and evidence['right_context'].get('changeset_id') == b,
                'A shared credential redirects the active changeset')
        tool(first, 'branch', {'action': 'clear'})
        require(tool(second, 'branch', {'action': 'get'}).get('changeset_id') == b,
                'Clearing one transport session clears another session')
        require('right-updated' in tool(second, 'edit', {'command': 'view', 'path': right}),
                'Second session loses its edited entry after the first clears')


def changelog_utc(ctx):
    def non_utc(fixture):
        fixture.inst.env['TZ'] = 'Etc/GMT-4'

    with isolated_fixture(ctx, prepare=non_utc) as fixture:
        inst = fixture.inst
        client = editing_client(inst)
        suffix = uuid.uuid4().hex[:12]
        namespace = 'app.smoke.changelog_' + suffix
        entry_id = namespace + ':record'
        manage_namespace(inst, namespace)
        branch = 'publication-time-' + suffix
        open_branch(inst, client, branch)
        create_entry(client, entry_id, 'publication-time')
        before = datetime.now(timezone.utc).timestamp()
        tool(client, 'push', {'branch': branch, 'message': 'Create timestamp fixture'})
        after = datetime.now(timezone.utc).timestamp()
        response = inst.request('GET', '/api/v1/keeper/changelog/list?' + urlencode({'entry_id': entry_id}),
                                label='published-entry-changelog')
        rows = response['entries']
        require(len(rows) == 1, 'Registry publication has no unique changelog record: ' + str(rows))
        row = rows[0]
        inst.evidence.save('changelog-publication-time', {'before': before, 'after': after, 'row': row,
                                                       'timezone': inst.env['TZ']})
        for field in ('timestamp', 'created_at'):
            value = row[field]
            stamp = datetime.fromisoformat(value.replace('Z', '+00:00'))
            require(stamp.utcoffset().total_seconds() == 0 and before - 1 <= stamp.timestamp() <= after + 1,
                    'Changelog ' + field + ' does not record the publication UTC instant: ' + value)


REGISTRY = [
    Scenario('keeper_mcp_session_edit_isolation', 'regression', session_isolation,
             issues=('KEEPER-MCP-TRANSPORT-CONTEXT',), features=()),
    Scenario('keeper_changelog_publication_utc', 'regression', changelog_utc,
             issues=('KEEPER-CHANGELOG-UTC',), features=()),
]
