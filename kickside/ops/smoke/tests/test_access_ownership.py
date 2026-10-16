import unittest
from harness import Failure
from access_ownership import fixture_owner


def binding(id, classes, contracts, **meta):
    return {'id': id, 'kind': 'contract.binding', 'meta': {'class': classes, **meta},
            'data': {'contracts': [{'contract': c} for c in contracts]}}


class OwnershipTests(unittest.TestCase):
    def test_dm_fixture_links_identity_before_delivering_a_private_message(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        declaration = binding('dm', ['dm'], ['kickside.contract:component'],
                              events={'output': [{'type': 'kickside.dm.events:message.inbound', 'system_only': True}]})
        provider = binding('discord', ['connection'], ['kickside.connection:reply_provider'], provider='discord')
        kind = access.Kind('binding_dm', 'kickside/dm', 'dm')
        connection_kind = access.Kind('connection', 'kickside/discord', 'discord')
        ctx = Mock(state={'access_declarations': {'discord': provider},
                          'access_connection_bases': {'discord': 'http://fixture'}})
        def wait(condition, *args, **kwargs):
            for _ in range(3):
                value = condition()
                if value:
                    return value
            raise AssertionError('fixture condition never holds: ' + args[0])
        ctx.inst.wait.side_effect = wait
        gateway = Mock(token='token', bot_id='NW')
        conversation = [[], []]
        gateway.request.return_value = {'connections': 1}
        def response(context, role, method, path, *args, **kwargs):
            if path == '/identity/link-codes':
                return {'code': 'link-code'}
            if path == '/identity/links':
                return {'links': [{'provider': 'discord', 'external_id': gateway.send.call_args.args[0]['author']['id']}]}
            if path == '/threads/dm-thread/events?ascending=true&limit=200':
                message = gateway.send.call_args.args[0]
                conversation.append([{'type': 'kickside.dm.events:message.inbound', 'body': {'external_message_id': message['id']}}])
                return {'events': conversation.pop(0)}
            raise AssertionError(path)
        with patch.object(access, 'setup_access_connection_fixtures'), patch.object(access, 'registry'), \
             patch.object(access, 'KINDS', (connection_kind,)), \
             patch.object(access, 'create', return_value=access.Fixture(connection_kind, 'connection', 'Connection')), \
             patch.object(access, 'component_rows', side_effect=[[], [{'component_id': 'dm-thread'}]]), \
             patch.object(access, 'request', side_effect=response) as request, \
             patch.object(access, 'DiscordGatewayFixture', return_value=gateway):
            fixture = access.stream_fixture(ctx, kind, declaration, 'Private conversation', 'owner')
        self.assertEqual(fixture.id, 'dm-thread')
        self.assertEqual(request.call_args_list[0].args[3], '/identity/link-codes')
        events = [call.args[0] for call in gateway.send.call_args_list]
        self.assertEqual(events[0]['content'], 'link link-code')
        self.assertNotIn('guild_id', events[0])
        self.assertNotIn('guild_id', events[1])
        self.assertEqual(events[0]['author']['id'], events[1]['author']['id'])
        self.assertNotEqual(events[0]['id'], events[1]['id'])
        reads = [call.args[3] for call in request.call_args_list if call.args[3].startswith('/threads/dm-thread/events')]
        self.assertEqual(len(reads), 3, 'the fixture is ready before its conversation holds the inbound message')

    def test_dm_fixture_fails_when_its_listed_conversation_is_not_found(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        from harness import Failure
        declaration = binding('dm', ['dm'], ['kickside.contract:component'],
                              events={'output': [{'type': 'kickside.dm.events:message.inbound', 'system_only': True}]})
        provider = binding('discord', ['connection'], ['kickside.connection:reply_provider'], provider='discord')
        kind = access.Kind('binding_dm', 'kickside/dm', 'dm')
        connection_kind = access.Kind('connection', 'kickside/discord', 'discord')
        ctx = Mock(state={'access_declarations': {'discord': provider},
                          'access_connection_bases': {'discord': 'http://fixture'}})
        ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        gateway = Mock(token='token', bot_id='NW')
        gateway.request.return_value = {'connections': 1}
        def response(context, role, method, path, *args, **kwargs):
            if path == '/identity/link-codes':
                return {'code': 'link-code'}
            if path == '/identity/links':
                return {'links': [{'provider': 'discord', 'external_id': gateway.send.call_args.args[0]['author']['id']}]}
            if 404 in kwargs.get('expect', (200,)):
                return {'error': 'thread not found', 'success': False}
            raise Failure('GET ' + path + ': HTTP 404: thread not found')
        with patch.object(access, 'setup_access_connection_fixtures'), patch.object(access, 'registry'), \
             patch.object(access, 'KINDS', (connection_kind,)), \
             patch.object(access, 'create', return_value=access.Fixture(connection_kind, 'connection', 'Connection')), \
             patch.object(access, 'component_rows', side_effect=[[], [{'component_id': 'dm-thread'}]]), \
             patch.object(access, 'request', side_effect=response), \
             patch.object(access, 'DiscordGatewayFixture', return_value=gateway):
            with self.assertRaisesRegex(Failure, 'thread not found'):
                access.stream_fixture(ctx, kind, declaration, 'Private conversation', 'owner')

    def test_source_uses_declared_connection_provider_not_its_class_as_a_resource(self):
        facet = binding('facet', ['messages'], ['kickside.data:pullable'], provider='service')
        owner = binding('connection', ['connection'], ['kickside.contract:component'], provider='service')
        unrelated = binding('other', ['messages'], ['kickside.contract:component'], provider='other')
        ports = [{'binding': 'facet', 'id': 'port', 'config_schema': {'connection_id': {'provider': 'service'}}}]
        self.assertEqual(fixture_owner(facet, [owner, unrelated], ports), ('connection', ports[0]))

    def test_sink_uses_declared_resource_class(self):
        facet = binding('sink', ['facet'], ['kickside.data:writable'])
        owner = binding('resource', ['aggregate'], ['kickside.contract:component'])
        ports = [{'binding': 'sink', 'id': 'port', 'config_schema': {'target': {'class': 'aggregate'}}}]
        self.assertEqual(fixture_owner(facet, [owner], ports), ('resource', ports[0]))

    def test_event_facet_uses_creatable_owner_with_matching_declared_events(self):
        event = {'output': [{'type': 'content.changed'}]}
        facet = binding('events', ['event-facet'], ['kickside.contract:component'], events=event)
        owner = binding('kb', ['kb'], ['kickside.contract:component'], events=event, component={'create': {'view': 'create'}})
        self.assertEqual(fixture_owner(facet, [owner], [{'binding': 'events', 'id': 'port', 'event': 'content.changed'}])[0], 'kb')

    def test_ambiguous_owner_is_an_error(self):
        facet = binding('facet', ['messages'], ['kickside.data:pullable'], provider='service')
        owners = [binding(id, ['connection'], ['kickside.contract:component'], provider='service') for id in ('one', 'two')]
        with self.assertRaises(Failure):
            fixture_owner(facet, owners, [{'binding': 'facet', 'id': 'port', 'config_schema': {'connection_id': {'provider': 'service'}}}])

    def test_access_creation_dispatches_capability_through_declared_owner(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        facet = binding('facet', ['messages'], ['kickside.data:pullable'], provider='service')
        owner = binding('connection', ['connection'], ['kickside.contract:component'], provider='service')
        owner_kind = access.Kind('connection_fixture', 'service', 'connection')
        ctx = Mock(state={'access_declarations': {'facet': facet, 'connection': owner}})
        port = {'binding': 'facet', 'id': 'port', 'surface': 'collection',
                'config_schema': {'connection_id': {'provider': 'service'}}}
        persisted = access.Fixture(owner_kind, 'owned-id', 'Connection')
        original = access.create
        def create(context, kind, role='owner', **options):
            return persisted if kind == owner_kind else original(context, kind, role)
        with patch.object(access, 'KINDS', (owner_kind,)), patch.object(access, 'create', side_effect=create), \
             patch.object(access, 'install_package'), patch.object(access, 'renew'), patch.object(access, 'registry'), patch.object(access, 'setup_access_connection_fixtures'), \
             patch.object(access, 'request', side_effect=[{'sources': [port]}, {'sinks': []}]):
            value = original(ctx, access.Kind('binding_facet', 'service', 'facet'))
        self.assertEqual(value.id, 'owned-id')
        self.assertEqual(value.kind, owner_kind)
        self.assertEqual(value.data['port'], port)

    def test_launcher_dispatches_to_declared_installable_types_without_registering_itself(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        launcher = binding('launcher', ['automation'], ['kickside.contract:component'],
                           component={'create': {'view': 'automations'}})
        native = access.Kind('recurring', 'automation', 'native')
        ctx = Mock(state={'access_declarations': {'launcher': launcher}})
        original = access.matrix
        def matrix(context, kind, role):
            if kind == native:
                return
            return original(context, kind, role)
        with patch.object(access, 'KINDS', (native,)), patch.object(access, 'install_package'), \
             patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'request', side_effect=[{'types': [{'id': 'native', 'class': 'automation', 'installable': True}]},
                        {'success': True, 'create_view': {'tag_name': 'automations'}}]), \
             patch.object(access, 'component_rows', return_value=[]) as rows, \
             patch.object(access, 'matrix', side_effect=matrix) as run:
            original(ctx, access.Kind('binding_launcher', 'automation', 'launcher'), 'read')
        run.assert_called_once_with(ctx, native, 'read')
        self.assertEqual(rows.call_count, 2)

    def test_launcher_resolves_an_unlisted_installable_type_from_module_provenance(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        launcher = binding('launcher', ['automation'], ['kickside.contract:component'],
                           component={'create': {'view': 'automations'}})
        task = binding('fixture.tasks:manual', ['automation'], ['kickside.contract:installable'],
                       inputs=self.task_schema())
        ctx = Mock(state={'access_declarations': {'launcher': launcher, task['id']: task}})
        original = access.matrix
        def matrix(context, kind, role):
            if kind.binding == task['id']:
                return
            return original(context, kind, role)
        with patch.object(access, 'KINDS', ()), patch.object(access, 'install_package'), \
             patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'request', side_effect=[
                 {'types': [{'id': task['id'], 'class': 'automation', 'installable': True}]},
                 {'success': True, 'create_view': {'tag_name': 'automations'}},
                 {'dependencies': [{'entries': [{'id': task['id'], 'module': 'fixture/tasks'}]}]},
             ]), \
             patch.object(access, 'component_rows', return_value=[]) as rows, \
             patch.object(access, 'matrix', side_effect=matrix) as run:
            original(ctx, access.Kind('binding_launcher', 'automation', 'launcher'), 'read')
        run.assert_called_once()
        native = run.call_args.args[1]
        self.assertEqual(native.binding, task['id'])
        self.assertEqual(native.package, 'fixture/tasks')
        self.assertEqual(run.call_args.args[2], 'read')
        self.assertEqual(rows.call_count, 2)

    def test_automation_input_resolves_declared_references_and_validated_channel_discovery(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        schema = {'type': 'object', 'required': ['connection_id', 'agent_id', 'channel_id', 'target'],
                  'properties': {'connection_id': {'x-reference': {'kind': 'connection'}},
                                 'agent_id': {'x-reference': {'kind': 'agent'}},
                                 'channel_id': {'type': 'string'}, 'target': {'default': 'channel'},
                                 'title': {'type': 'string'}}}
        owner = binding('connection', ['connection', 'reply_provider'], ['kickside.contract:component', 'kickside.connection:reply_provider'])
        connection_kind = access.Kind('binding_connection', 'provider', 'connection')
        ctx = Mock(state={'access_declarations': {'connection': owner}, 'agent': 'agent-id'})
        connection = access.Fixture(connection_kind, 'connection-id', 'Connection')
        with patch.object(access, 'KINDS', (connection_kind,)), \
             patch.object(access, 'ACCESS_PROVIDER_CREDENTIALS', {'connection': {'token': 'fixture'}}), \
             patch.object(access, 'setup_access_connection_fixtures'), patch.object(access, 'registry'), \
             patch.object(access, 'create', return_value=connection), \
             patch.object(access, 'request', side_effect=[{'resources': [{'id': 'guild', 'drillable': True}]},
                                                        {'resources': [{'id': 'channel', 'selectable': True}]}]):
            value = access.automation_input(ctx, schema, 'Automation', 'owner')
        self.assertEqual(value, {'title': 'Automation', 'connection_id': 'connection-id', 'agent_id': 'agent-id',
                                 'channel_id': 'channel', 'target': 'channel'})

    def task_schema(self):
        return {'type': 'object', 'required': ['target'], 'properties': {
            'title': {'type': 'string'}, 'target': {'type': 'object', 'required': ['kind'],
                'properties': {'kind': {'type': 'string', 'enum': ['workflow', 'agent', 'action']},
                    'flow_ref': {'type': 'object', 'required': ['kind', 'id', 'version'],
                        'properties': {'kind': {'const': 'flow'},
                            'id': {'x-reference': {'kind': 'flow'}}, 'version': {'type': 'integer', 'minimum': 1}}},
                    'input': {'type': 'object'}}}}}

    def test_installable_task_inputs_use_published_workflow_without_reply_providers(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        ctx = Mock(state={'agent': 'agent-id', 'access_declarations': {}})
        with patch.object(access, 'setup_access_connection_fixtures') as connections, \
             patch.object(access, 'registry'), \
             patch('scenarios_automation.dispatch_workflow', return_value=('published-flow', 7)) as publish:
            value = access.automation_input(ctx, self.task_schema(), 'Task', 'read')
        self.assertEqual(value, {'title': 'Task', 'target': {'kind': 'workflow',
            'flow_ref': {'kind': 'flow', 'id': 'published-flow', 'version': 7},
            'input': {'marker': 'NW-ACCESS-731'}}})
        connections.assert_not_called()
        self.assertEqual(publish.call_count, 1)
        self.assertEqual(publish.call_args.kwargs['title'], 'Task target')
        self.assertTrue(callable(publish.call_args.kwargs['request']))
        self.assertTrue(ctx.inst.cleanup.add.called)

    def test_task_adapter_follows_installable_contract_and_input_capability(self):
        import scenarios_access as access
        for identity in ('fixture.alpha:one', 'fixture.beta:two'):
            declaration = binding(identity, ['automation'], ['kickside.contract:installable'], inputs=self.task_schema())
            self.assertTrue(access.supported_installable(declaration))
        unrelated = binding('fixture.alpha:one', ['automation'], [], inputs=self.task_schema())
        self.assertFalse(access.supported_installable(unrelated))
        unsupported = binding('fixture.beta:two', ['automation'], ['kickside.contract:installable'],
            inputs={'type': 'object', 'required': ['unknown'], 'properties': {'unknown': {'type': 'string'}}})
        self.assertFalse(access.supported_installable(unsupported))

    def test_connection_reference_without_channel_skips_channel_discovery(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        schema = {'type': 'object', 'required': ['reference'], 'properties': {
            'reference': {'x-reference': {'kind': 'connection'}}}}
        owner = binding('provider', ['connection'], ['kickside.connection:reply_provider'])
        kind = access.Kind('connection', 'fixture/provider', 'provider')
        ctx = Mock(state={'agent': 'agent-id', 'access_declarations': {'provider': owner}})
        fixture = access.Fixture(kind, 'connection-id', 'Connection')
        with patch.object(access, 'KINDS', (kind,)), \
             patch.object(access, 'ACCESS_PROVIDER_CREDENTIALS', {'provider': {}}), \
             patch.object(access, 'setup_access_connection_fixtures'), patch.object(access, 'registry'), \
             patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'request', side_effect=AssertionError('Unrelated channel request')):
            value = access.automation_input(ctx, schema, 'Reference', 'owner')
        self.assertEqual(value, {'reference': 'connection-id'})

    def test_discovery_accepts_an_installable_capability_and_refuses_unknown_inputs(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        declaration = binding('fixture.tasks:published', ['automation'], ['kickside.contract:installable'],
            inputs=self.task_schema())
        ctx = Mock(state={'access_declarations': {'fixture.tasks:published': declaration}})
        with patch.object(access, 'KINDS', ()), patch.object(access, 'registry'), \
             patch.object(access, 'request', return_value={}):
            access.discovery(ctx)
            declaration['meta']['inputs'] = {'required': ['unsupported'], 'properties': {'unsupported': {'type': 'string'}}}
            with self.assertRaisesRegex(Failure, 'lack an access matrix adapter'):
                access.discovery(ctx)

    def test_installable_task_primary_proves_its_published_workflow_effect(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        ctx = Mock()
        ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        target = {'kind': 'workflow', 'flow_ref': {'kind': 'flow', 'id': 'target-flow', 'version': 4},
                  'input': {'marker': 'NW-ACCESS-731'}}
        declaration = binding('fixture.task:binding', ['automation'], ['kickside.contract:installable'],
            inputs=self.task_schema())
        fixture = access.Fixture(access.Kind('automation', 'fixture/task', declaration['id']), 'automation-id', 'Task',
            {'declaration': declaration, 'input': {'target': target}, 'workflow_target': target})
        calls = []
        def reply(context, role, method, path, body=None, **kwargs):
            calls.append((role, method, path, body))
            if path == '/automations/automation-id/control':
                return {'success': True}
            if path == '/workflows/target-flow/runs':
                return {'runs': [] if len(calls) == 1 else [{'run_id': 'new-run'}]}
            if path == '/workflows/target-flow/runs/new-run':
                return {'run': {'status': 'completed', 'output': {'marker': 'NW-ACCESS-731'}}}
            raise AssertionError(path)
        with patch.object(access, 'request', side_effect=reply), \
             patch.object(access, 'workflow_publication_ready', return_value=True):
            result = access.primary(ctx, fixture, 'write')
        self.assertEqual(result['run']['status'], 'completed')
        self.assertIn(('write', 'POST', '/automations/automation-id/control'), [row[:3] for row in calls])
        self.assertEqual(calls[1][3]['control'], 'run_now')
        self.assertTrue(all(role == 'owner' for role, method, path, body in calls if method == 'GET'))

    def test_new_binding_uses_resolved_module_provenance(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        declaration = binding('unrelated.namespace:task', ['automation'], ['kickside.contract:installable'],
            inputs=self.task_schema())
        ctx = Mock(state={'access_declarations': {declaration['id']: declaration}})
        graph = {'dependencies': [{'component': 'fixture/parent', 'entries': [
            {'id': declaration['id'], 'module': 'fixture/tasks'}]},
            {'component': 'fixture/tasks', 'entries': [{'id': declaration['id'], 'module': 'fixture/tasks'}]}]}
        def reply(context, role, method, path, *args, **kwargs):
            if path == '/keeper/hub/dependencies?entries=1&migrations=0':
                return graph
            if path.startswith('/keeper/registry/entry'):
                return {'entry': declaration}
            raise AssertionError(path)
        with patch.object(access, 'KINDS', ()), patch.object(access, 'registry'), \
             patch.object(access, 'request', side_effect=reply), patch.object(access, 'matrix') as matrix:
            access.new_kinds(ctx, 'write')
        self.assertEqual(matrix.call_args.args[1].package, 'fixture/tasks')
        self.assertEqual(matrix.call_args.args[1].binding, declaration['id'])
        self.assertEqual(matrix.call_args.args[2], 'write')

    def test_entry_ownership_refuses_conflicting_resolved_modules(self):
        from access_ownership import entry_owners
        with self.assertRaisesRegex(Failure, 'multiple module owners'):
            entry_owners([{'entries': [{'id': 'binding', 'module': 'fixture/one'}]},
                          {'entries': [{'id': 'binding', 'module': 'fixture/two'}]}])

    def test_automation_controls_use_the_shared_status_reader(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        ctx = Mock()
        ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        fixture = access.Fixture(access.Kind('automation', 'fixture/task', 'fixture.task:binding'), 'automation-id', 'Task')
        state = {'phase': 'idle'}
        def reply(context, role, method, path, body=None, **kwargs):
            if method == 'POST' and path == '/automations/automation-id/control':
                state['phase'] = 'paused' if body['control'] == 'pause' else 'idle'
                return {'success': True}
            if method == 'GET' and path == '/automations/automation-id/status':
                return {'drives': [{'phase': state['phase']}]}
            raise AssertionError('Undeclared per-binding action: ' + path)
        with patch.object(access, 'request', side_effect=reply):
            access.produce_event(ctx, fixture, 'write')
        self.assertEqual(state['phase'], 'idle')

    def test_owned_requests_preserve_labels_from_shared_fixture_builders(self):
        from unittest.mock import Mock
        import scenarios_access as access
        ctx = Mock(state={'access_users': {'read': {'bearer': 'reader-bearer'}}})
        ctx.inst.request.return_value = {'flow_id': 'owned-flow'}
        value = access.request(ctx, 'read', 'POST', '/workflows', {'title': 'Owned'}, label='owned-flow-create')
        self.assertEqual(value['flow_id'], 'owned-flow')
        self.assertEqual(ctx.inst.request.call_args.kwargs['auth'], 'reader-bearer')
        self.assertEqual(ctx.inst.request.call_args.kwargs['label'], 'owned-flow-create')

    def test_native_connection_create_view_keeps_its_resource_access_matrix(self):
        from contextlib import ExitStack
        from unittest.mock import Mock, patch
        import scenarios_access as access
        declaration = binding('native', ['connection'],
            ['kickside.contract:component', 'kickside.connection:connection', 'kickside.contract:deletable'],
            component={'create': {'view': 'provider_connect'}})
        kind = access.Kind('binding_native', 'provider', 'native')
        fixture = access.Fixture(kind, 'connection-id', 'Connection', {'connection': True})
        ctx = Mock(state={'access_declarations': {'native': declaration}})
        with ExitStack() as stack:
            for name in ('install_package', 'renew', 'registry', 'read', 'primary', 'update',
                         'produce_event', 'share', 'delete', 'cascade'):
                stack.enter_context(patch.object(access, name))
            create = stack.enter_context(patch.object(access, 'create', return_value=fixture))
            request = stack.enter_context(patch.object(access, 'request', return_value={'types': []}))
            stack.enter_context(patch.object(access, 'component_rows', return_value=[]))
            access.matrix(ctx, kind, 'read')
        create.assert_called_once_with(ctx, kind)
        request.assert_not_called()
        checks = ctx.inst.evidence.save.call_args.args[1]
        self.assertTrue(all(row['status'] == 'pass' for row in checks))
        self.assertTrue({'see', 'use', 'edit', 'produce_event', 'delete_DELETE_rule',
                         'revoke_denies_actions', 'folder_cascade', 'owner_delete'} <=
                        {row['action'] for row in checks})

    def test_registry_list_summaries_are_hydrated_through_the_declared_entry_endpoint(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        ctx = Mock(state={})
        summary = {'id': 'binding', 'kind': 'contract.binding', 'meta': {'class': ['connection']}}
        full = binding('binding', ['connection'], ['kickside.contract:component'])
        with patch.object(access, 'request', side_effect=[{'entries': [summary], 'has_more': False}, {'entry': full}]) as read:
            access.registry(ctx)
        self.assertEqual(ctx.state['access_declarations']['binding'], full)
        self.assertEqual(read.call_args.args[3], '/keeper/registry/entry?id=binding')

    def test_shared_instance_fixture_configuration_is_reused_across_contexts(self):
        from unittest.mock import Mock
        import scenarios_access as access
        bases = {'slack': 'http://127.0.0.1:1234'}
        instance = Mock(fixture_state={'access_connection_bases': bases})
        context = Mock(inst=instance, state={})
        access.setup_access_connection_fixtures(context)
        self.assertIs(context.state['access_connection_bases'], bases)
        instance.install.assert_not_called()
        context.fixtures.start.assert_not_called()

    def test_source_fixture_group_closes_failed_setup_and_retains_successful_setup(self):
        import os
        from pathlib import Path
        import tempfile
        from unittest.mock import Mock, patch
        from harness import Cleanup
        import scenarios_access as access
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'src').mkdir()
            ctx = Mock(inst=Mock(app=root, fixture_state={}, cleanup=Cleanup()), state={})
            ctx.fixtures.start.side_effect = ValueError('shared mock already running')
            services = Mock()
            services.start.side_effect = lambda name: 'http://127.0.0.1:1234/' + name
            with patch('mocks.Fixtures', return_value=services), \
                 patch.object(access.DiscordGatewayFixture, 'request', return_value={'url': 'ws://127.0.0.1:1234'}), \
                 patch('scenarios_providers.configure_provider_endpoints', side_effect=RuntimeError('configuration refused')) as configure:
                with self.assertRaisesRegex(RuntimeError, 'configuration refused'):
                    access.setup_access_connection_fixtures(ctx)
                services.stop.assert_called_once_with()
                self.assertFalse((root / 'src/access-connections').exists())
                self.assertEqual(ctx.inst.fixture_state, {})
                configure.side_effect = None
                access.setup_access_connection_fixtures(ctx)
            ctx.fixtures.start.assert_not_called()
            self.assertEqual(len(ctx.inst.fixture_state['access_connection_bases']), 11)
            self.assertEqual(ctx.inst.cleanup.run(scope='scenario'), [])
            services.stop.assert_called_once_with()
            self.assertEqual(ctx.inst.cleanup.run(), [])
            self.assertEqual(services.stop.call_count, 2)

    def test_failed_source_setup_reports_the_original_and_cleanup_errors(self):
        import os
        from pathlib import Path
        import tempfile
        from unittest.mock import Mock, patch
        from harness import Cleanup
        import scenarios_access as access
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'src').mkdir()
            ctx = Mock(inst=Mock(app=root, fixture_state={}, cleanup=Cleanup()), state={})
            services = Mock()
            services.start.side_effect = lambda name: 'http://127.0.0.1:1234/' + name
            services.stop.side_effect = RuntimeError('fixture close refused')
            with patch('mocks.Fixtures', return_value=services), \
                 patch.object(access.DiscordGatewayFixture, 'request', return_value={'url': 'ws://127.0.0.1:1234'}), \
                 patch('scenarios_providers.configure_provider_endpoints', side_effect=RuntimeError('configuration refused')):
                with self.assertRaises(Failure) as caught:
                    access.setup_access_connection_fixtures(ctx)
            self.assertIn('configuration refused', str(caught.exception))
            self.assertIn('fixture close refused', str(caught.exception))
            self.assertFalse((root / 'src/access-connections').exists())


    def test_non_reconfigurable_automation_reads_public_catalog_for_read_grantee(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        declaration = binding('responder', ['automation'], ['kickside.contract:component', 'kickside.contract:installable'],
                              actions=[{'name': 'status'}, {'name': 'read_config'}])
        fixture = access.Fixture(access.Kind('automation', 'channel', 'responder', '/automations/{id}/config'),
                                 'id', 'Responder', {'declaration': declaration})
        with patch.object(access, 'request', return_value={'automations': [{'id': 'id', 'public_state': {'channel_id': 'NW'}}]}) as request:
            access.read(Mock(), fixture, 'read')
        request.assert_called_once_with(unittest.mock.ANY, 'read', 'GET', '/automations')

    def test_oauth_provider_uses_its_declared_component_owner_for_source_access(self):
        facet = binding('calendar', ['meetings'], ['kickside.data:pullable'], provider='fixture_oauth')
        owner = binding('oauth_connection', ['connection'], ['kickside.contract:component', 'kickside.oauth:oauth_connection_contract'])
        provider = {'id': 'fixture_provider', 'meta': {'oauth_provider': 'fixture_oauth'},
                    'data': {'component_contract': 'oauth_connection'}}
        port = {'id': 'source', 'binding': 'calendar', 'config_schema': {'connection': {'provider': 'fixture_oauth'}}}
        self.assertEqual(fixture_owner(facet, [owner], [port], [provider]), ('oauth_connection', port))

    def test_store_facet_exercises_native_writable_contract_and_checks_destination(self):
        from unittest.mock import Mock, patch
        import scenarios_access as access
        import json
        fixture = access.Fixture(access.Kind('crm', 'crm', 'crm', '/workspace/crm/{id}/schema'), 'id', 'CRM',
            {'writer_origin': 'sync-id', 'port': {'id': 'kickside.crm.sink:crm_records', 'surface': 'store',
                      'config_schema': {'crm_id': {'class': 'kickside.crm'}}}})
        ctx = Mock()
        ctx.inst.wait.side_effect = lambda predicate, *args, **kwargs: self.assertTrue(predicate())
        ctx.inst.request.side_effect = lambda method, path, body, **kwargs: {
            'jsonrpc': '2.0', 'id': body['id'], 'result': {'content': [{'type': 'text',
                'text': json.dumps({'value': {'success': True, 'result': 'created', 'dest_ref': {'record_id': 'record'}}})}]}}
        with patch.object(access, 'request', side_effect=[{'credential': {'credential_id': 'cred', 'token': 'token'}},
                {'record': {'record_id': 'record', 'values': {'name': 'Northwind sink access'}}}, {'success': True}]), \
             patch.object(access.uuid, 'uuid4', return_value=Mock(hex='record')):
            access.primary(ctx, fixture, 'write')
        sent = ctx.inst.request.call_args.args[2]['params']['arguments']
        self.assertEqual(sent['port'], 'kickside.crm.sink:crm_records')
        self.assertTrue(sent['write'])
        self.assertEqual(sent['arguments']['config'], {'crm_id': 'id'})
        self.assertEqual(sent['arguments']['input']['record_id'], 'record')
        self.assertEqual(sent['arguments']['origin'], 'sync-id')

    def test_collection_facet_checks_native_rows_and_rejects_missing_fixture_data(self):
        from unittest.mock import Mock, patch
        import json
        import scenarios_access as access
        from harness import Failure
        from scenarios_providers import PULL_FIXTURES
        port_id, (config, marker) = next(iter(PULL_FIXTURES.items()))
        fixture = access.Fixture(access.Kind('connection', 'provider', 'binding'), 'id', 'Connection',
            {'port': {'id': port_id, 'surface': 'collection'}})
        for value, admitted in (({'items': [{'text': marker}]}, True),
                                ({'items': []}, False),
                                ({'items': [{'text': 'unrelated'}]}, False)):
            with self.subTest(value=value):
                ctx = Mock()
                ctx.inst.request.side_effect = lambda method, path, body, **kwargs: {
                    'jsonrpc': '2.0', 'id': body['id'], 'result': {'content': [{'type': 'text',
                    'text': json.dumps({'value': value})}]}}
                with patch.object(access, 'request', side_effect=[
                        {'credential': {'credential_id': 'cred', 'token': 'token'}}, {'success': True}]):
                    if admitted:
                        access.primary(ctx, fixture, 'read')
                    else:
                        with self.assertRaisesRegex(Failure, 'declared fixture rows'):
                            access.primary(ctx, fixture, 'read')
                sent = ctx.inst.request.call_args.args[2]['params']['arguments']
                self.assertFalse(sent['write'])
                self.assertEqual(sent['arguments'], {'limit': 100, 'config': config})

    def test_declared_facet_access_scenario_counts_its_exercised_binding(self):
        import scenarios_access as access
        kind = next(kind for kind in access.KINDS if kind.binding == 'kickside.discord.source:messages_source')
        self.assertIn('kickside/discord|workspace_kind|kickside.discord.source:messages_source', access.matrix_features(kind))
