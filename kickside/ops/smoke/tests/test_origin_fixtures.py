from harness import Cleanup
from scenarios import Context
from runtime import RuntimePool
import json
import base64
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock
from unittest.mock import patch
from urllib.request import Request, urlopen
import mocks
import scenarios_providers


class OriginFixtures(unittest.TestCase):
    def test_endpoint_overrides_include_installed_dependencies_in_the_boot_source(self):
        import yaml
        from runtime import Instance
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            (app / '.wippy.yaml').write_text('version: "1.0"\n')
            inst = object.__new__(Instance)
            inst.app = app
            inst.config = {"published": None}
            inst.evidence = Mock()
            inst.resolve_dependencies = Mock()
            dependency = {'is_root': True, 'namespace': 'app.deps', 'name': 'github',
                          'component': 'kickside/github', 'parameters': [{'name': 'scope', 'value': 'user'}]}
            def request(method, path, **kwargs):
                if path.startswith('/api/v1/keeper/hub/dependencies'):
                    return {'dependencies': [dependency]}
                return {'entry': {'data': {'targets': [
                    {'entry': 'kickside.github:endpoints', 'path': '.endpoints.api'}]}}}
            inst.request = Mock(side_effect=request)
            ctx = Mock(inst=inst)
            scenarios_providers.configure_provider_endpoints(ctx,
                {'kickside.github:endpoint_api': 'http://127.0.0.1:731/api/v3'})
            Instance.preserve_dependencies(inst)
            declarations = [entry for p in (app / 'src').rglob('_index.yaml')
                            for entry in yaml.safe_load(p.read_text())['entries']]
            self.assertEqual([{'name': 'github', 'kind': 'ns.dependency',
                               'component': 'kickside/github', 'version': '*',
                               'parameters': dependency['parameters']}], declarations)
            inst.resolve_dependencies.assert_called_once_with()

    def setUp(self):
        self.fixtures = mocks.Fixtures()

    def tearDown(self):
        self.fixtures.stop()

    def test_research_workflow_resolves_config_with_workflow_ownership(self):
        ctx = Mock()
        ctx.inst.request.side_effect = [
            {'flow_id': 'workflow-1'},
            {'entry': {'data': {'block': {'input': {'type': 'object'}}}}},
            {}, {'version': 3},
        ]
        builder = Mock(return_value={'connection_id': 'connection-1', 'owner_component_id': 'workflow-1'})
        self.assertEqual(scenarios_providers.research_workflow_fixture(ctx, 'source', builder), ('workflow-1', 3))
        builder.assert_called_once_with('workflow-1')
        apply = ctx.inst.request.call_args_list[2].args[2]
        self.assertEqual(apply['commands'][1]['body']['config'], builder.return_value)

    def test_phantombuster_workflow_policy_uses_workflow_owner_and_connection(self):
        ctx = Mock(state={'phantombuster_connection': 'connection-1'})
        with patch.object(scenarios_providers, 'probe', return_value={'bounds': {}, 'policy': {}}) as probe:
            config, data, resolved = scenarios_providers.phantombuster_research_case(ctx, 'candidate_snapshot')
            built = config('workflow-1')
        self.assertEqual(built['owner_component_id'], 'workflow-1')
        self.assertEqual(built['connection_id'], 'connection-1')
        policy = probe.call_args.kwargs['arguments']['policy']
        self.assertEqual(policy['ownership'], {'owner_component_id': 'workflow-1', 'connection_id': 'connection-1'})
        self.assertEqual(data['operation'], 'candidate_snapshot')
        self.assertEqual(resolved, {'bounds': {}, 'policy': {}})

    def test_probe_without_http_fixtures_has_no_egress_policy(self):
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            inst = Mock(app=app)
            inst.request.return_value = {'credential': {'credential_id': 'probe', 'token': 'fixture-token'}}
            ctx = Mock(inst=inst, state={})
            with patch.object(scenarios_providers, 'load_fixture'):
                scenarios_providers.install_probe(ctx)
            entries = yaml.safe_load((app / 'src/provider-smoke/_index.yaml').read_text())['entries']
            self.assertEqual([e['name'] for e in entries], ['probe'])

    def test_probe_public_http_grant_does_not_allow_private_addresses(self):
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            inst = Mock(app=app)
            inst.request.return_value = {'credential': {'credential_id': 'probe', 'token': 'fixture-token'}}
            ctx = Mock(inst=inst, state={'probe_http_resources': ['https://example.com/*']})
            with patch.object(scenarios_providers, 'load_fixture'):
                scenarios_providers.install_probe(ctx)
            entries = yaml.safe_load((app / 'src/provider-smoke/_index.yaml').read_text())['entries']
            policies = [e for e in entries if e['kind'] == 'security.policy']
            self.assertEqual(len(policies), 1)
            self.assertEqual(policies[0]['policy']['resources'], ['https://example.com/*'])
            self.assertEqual(policies[0]['policy']['actions'], ['http_client.request'])

    def request(self, base, path, method='GET', body=None, headers=None):
        headers = dict(headers or {})
        if body is not None:
            headers['Content-Type'] = 'application/json'
        with urlopen(Request(base+path, method=method, data=json.dumps(body).encode() if body is not None else None, headers=headers),timeout=5) as response:
            return json.load(response)

    def test_api_fixtures_read_and_persist_writes(self):
        contracts = {
            'github':('/user','/repos/northwind/orders/issues',{'title':'Northwind packing note'},'Bearer fictional-github-token'),
            'slack':('/api/auth.test','/api/chat.postMessage',{'channel':'NW','text':'Northwind packing note'},'Bearer fictional-slack-token'),
            'discord':('/api/v10/users/@me','/api/v10/channels/NW/messages',{'content':'Northwind packing note'},'Bot fictional-discord-token'),
            'hubspot':('/crm/v3/objects/contacts','/crm/v3/objects/contacts',{'properties':{'firstname':'Northwind packing note'}},'Bearer fictional-hubspot-token'),
            'telegram':('/botfictional-telegram-token/getMe','/botfictional-telegram-token/sendMessage',{'chat_id':'NW','text':'Northwind packing note'},None),
            'phantombuster':('/api/v2/orgs/fetch','/api/v2/agents/launch',{'id':'731'},None),
        }
        for name,(read,write,body,auth) in contracts.items():
            with self.subTest(provider=name):
                base=self.fixtures.start(name)
                headers={'Authorization':auth} if auth else {'X-Phantombuster-Key':'fictional-phantombuster-key'} if name=='phantombuster' else {}
                self.assertIn('Northwind',json.dumps(self.request(base,read,headers=headers)))
                self.assertTrue(self.request(base,write,'POST',body,headers))
                self.assertTrue(any(row['method']=='POST' and row['status']==200 for row in self.fixtures.requests(name)))

    def test_google_and_fireflies_read_contracts(self):
        google=self.fixtures.start('google')
        self.assertIn('Northwind',json.dumps(self.request(google,'/drive/v3/files',headers={'Authorization':'Bearer fictional-google-access'})))
        fireflies=self.fixtures.start('fireflies')
        value=self.request(fireflies,'/graphql','POST',{'query':'query { user { name } }'}, {'Authorization':'Bearer fictional-fireflies-key'})
        self.assertIn('Northwind',json.dumps(value['data']['user']))

    def test_search_fixture_returns_public_evidence_locations(self):
        from urllib.parse import urlsplit
        base = self.fixtures.start('google')
        result = self.request(base, '/customsearch/v1?key=fictional-google-key&cx=northwind-search&q=Northwind')
        self.assertTrue(result['items'])
        for item in result['items']:
            self.assertEqual(urlsplit(item['link']).scheme, 'https')
            self.assertNotEqual(urlsplit(item['link']).hostname, '127.0.0.1')

    def test_gmail_draft_query_and_delete_follow_message_identity(self):
        base = self.fixtures.start('google')
        headers = {'Authorization': 'Bearer fictional-google-access'}
        raw = base64.urlsafe_b64encode(b'Message-ID: <northwind@draft.local>\r\nSubject: Northwind\r\n\r\n48 crates').decode()
        row = self.request(base, '/gmail/v1/users/me/drafts', 'POST', {'message': {'raw': raw}}, headers)
        absent = self.request(base, '/gmail/v1/users/me/drafts?q=rfc822msgid:missing', headers=headers)
        self.assertEqual(absent['drafts'], [])
        found = self.request(base, '/gmail/v1/users/me/drafts?q=rfc822msgid:%3Cnorthwind%40draft.local%3E', headers=headers)
        self.assertEqual([r['id'] for r in found['drafts']], [row['id']])
        saved = self.request(base, '/gmail/v1/users/me/drafts/' + row['id'], headers=headers)
        self.assertIn({'name': 'Message-ID', 'value': '<northwind@draft.local>'}, saved['message']['payload']['headers'])
        with urlopen(Request(base + '/gmail/v1/users/me/drafts/' + row['id'], method='DELETE', headers=headers), timeout=5) as response:
            self.assertEqual(response.status, 204)
        self.assertEqual(self.request(base, '/gmail/v1/users/me/drafts', headers=headers)['drafts'], [])

    def test_hubspot_association_source_has_typed_edges(self):
        base = self.fixtures.start('hubspot')
        row = self.request(base, '/crm/v4/associations/contacts/companies/batch/read', 'POST',
            {'inputs': [{'id': '731'}]}, {'Authorization': 'Bearer fictional-hubspot-token'})['results'][0]
        self.assertEqual(row['from']['id'], '731')
        self.assertEqual(row['to'][0]['toObjectId'], 'company-731')
        self.assertEqual(row['to'][0]['associationTypes'], [{'category': 'HUBSPOT_DEFINED', 'typeId': 1, 'label': 'Primary'}])

    def test_discord_delete_removes_only_the_named_message(self):
        base = self.fixtures.start('discord')
        headers = {'Authorization': 'Bot fictional-discord-token'}
        path = '/api/v10/channels/NW/messages'
        row = self.request(base, path, 'POST', {'content': 'Northwind deletion'}, headers)
        with urlopen(Request(base + path + '/' + row['id'], method='DELETE', headers=headers), timeout=5) as response:
            self.assertEqual(response.status, 204)
        messages = self.request(base, path, headers=headers)
        self.assertNotIn(row['id'], [r['id'] for r in messages])
        self.assertIn('731', [r['id'] for r in messages])

    def test_profile_vars_own_endpoint_values(self):
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx=Mock()
            ctx.inst.app=Path(directory)
            path=ctx.inst.app/'.wippy.yaml'
            path.write_text('version: "1.0"\nprofiles:\n  quickstart:\n    override:\n      "app:gateway:addr": ":${local_port}"\n')
            ctx.inst.request.return_value = {'entry': {'data': {'targets': [
                {'entry': 'kickside.github:endpoints', 'path': '.endpoints.api'}]}}}
            scenarios_providers.configure_provider_endpoints(ctx, {'kickside.github:endpoint_api':'http://127.0.0.1:731/api/v3'})
            config=yaml.safe_load(path.read_text())
            self.assertEqual(config['vars']['provider_kickside_github_endpoint_api'],'http://127.0.0.1:731/api/v3')
            self.assertEqual(config['profiles']['quickstart']['override']['kickside.github:endpoint_api:default'],'${provider_kickside_github_endpoint_api}')
            self.assertEqual(config['profiles']['quickstart']['override']['app:gateway:addr'],':${local_port}')
            self.assertNotIn('override',config)

    def test_structured_tool_output_passes_through(self):
        value={'messages':[{'id':'m1','content':'NORTHWIND-DISCORD-731'}]}
        self.assertEqual(scenarios_providers.decode_provider_value('kickside.discord.traits:discord_get',value),value)
        self.assertEqual(scenarios_providers.decode_provider_value('kickside.slack.traits:slack_get',{'success':True}),{'success':True})

    def test_json_tool_output_parses_and_reports_malformed_json(self):
        self.assertEqual(scenarios_providers.decode_provider_value('kickside.webscout.traits:search','{"count":0}'),{'count':0})
        with self.assertRaises(json.JSONDecodeError):
            scenarios_providers.decode_provider_value('kickside.webscout.traits:search','{"count":')

    def test_webscout_search_uses_declared_credentials(self):
        from unittest.mock import patch
        ctx=Mock()
        ctx.state={'provider_bases':{'google':'http://127.0.0.1:731'}}
        ctx.inst.request.return_value={'success':True}
        with patch.object(scenarios_providers,'probe',return_value={'results':[{'title':'Northwind orders','snippet':'NORTHWIND-SEARCH-731'}]}):
            scenarios_providers.webscout_origin_search(ctx)
        keys=[call.args[2]['key'] for call in ctx.inst.request.call_args_list]
        self.assertEqual(keys,['google_search_api_key','google_search_engine_id'])

    def test_provider_fixture_uses_only_active_probe(self):
        root=Path(scenarios_providers.__file__).parent
        self.assertFalse((root/'mocks/probe.lua').exists())
        self.assertFalse((root/'mocks/probe.yaml').exists())
        readme=(root/'README.md').read_text()
        self.assertIn('providers_probe.lua',readme)
        self.assertNotIn('mocks/probe.yaml',readme)

    def test_sso_restart_settles_and_releases_browser_first(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx=Mock()
            ctx.inst.app=Path(directory)
            (ctx.inst.app/'.wippy.yaml').write_text('version: "1.0"\n')
            ctx.inst.request.return_value={'entry':{'data':{'security':{'policies':[]}}}}
            order=[]
            ctx.inst.cleanup = Cleanup()
            ctx.browser = None
            pool = RuntimePool({}, 'sqlite', Path(directory))
            pool.contexts = {'fixture': ctx}
            ctx.restart.side_effect = lambda: pool.restart(ctx)
            ctx.inst.stop.side_effect=lambda **kwargs:order.append('stop')
            with patch.object(scenarios_providers.Browser,'release',side_effect=lambda ctx:order.append('release')):
                scenarios_providers.configure_oidc_security(ctx)
            self.assertEqual(order,['release','stop'])

    def test_origin_restart_settles_and_releases_browser_first(self):
        from unittest.mock import patch
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx=Mock()
            ctx.inst.app=Path(directory)
            ctx.state={'provider_bases':{name:'http://127.0.0.1:731' for name in ('google','github','slack','discord','hubspot','telegram','fireflies','phantombuster','microsoft')}}
            root=ctx.inst.app/'src/provider-smoke';root.mkdir(parents=True)
            (root/'_index.yaml').write_text('entries: []\n')
            (ctx.inst.app/'.wippy.yaml').write_text('version: "1.0"\n')
            ctx.inst.request.side_effect=lambda method,path,**kw:{'entry':{'data':{
                'default':'http://127.0.0.1:731'+scenarios_providers.ORIGIN_ROUTES[path.split('id=')[1]][1],
                'targets':[{'entry':'northwind:endpoints','path':'.endpoints.api'}]}}}
            order=[]
            ctx.inst.cleanup = Cleanup()
            ctx.browser = None
            pool = RuntimePool({}, 'sqlite', Path(directory))
            pool.contexts = {'fixture': ctx}
            ctx.restart.side_effect = lambda: pool.restart(ctx)
            ctx.inst.stop.side_effect=lambda **kwargs:order.append('stop')
            with patch.object(scenarios_providers.Browser,'release',side_effect=lambda ctx:order.append('release')):
                scenarios_providers.provider_origins_setup(ctx)
            self.assertEqual(order,['release','stop'])

    def test_google_calendar_seed_has_meeting_attendees(self):
        base=self.fixtures.start('google')
        rows=self.request(base,'/calendar/v3/calendars/primary/events',headers={'Authorization':'Bearer fictional-google-access'})['items']
        self.assertTrue(rows)
        self.assertTrue(all(any(person['email']=='operator@northwind.example.invalid' for person in row['attendees']) for row in rows))

    def test_atlassian_tools_return_structured_records(self):
        for name in ('jira_get','jira_write','confluence_get','confluence_write'):
            product='jira' if name.startswith('jira') else 'confluence'
            tool='kickside.atlassian.'+product+'.traits:'+name
            self.assertEqual(scenarios_providers.decode_provider_value(tool,{'success':True}),{'success':True})

    def test_oauth_navigation_settles_the_shell_before_opening_its_page(self):
        from unittest.mock import patch
        ctx=Mock()
        ctx.state={'provider_bases':{'google':'http://127.0.0.1:731'}}
        ctx.inst.request.side_effect=[{'success':True},{'success':True},{'authorization_url':'http://127.0.0.1:731/authorize'}]
        ctx.inst.wait.return_value={'component_id':'northwind-oauth'}
        browser=Mock()
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(ctx.fixtures,'requests',return_value=[{'method':'POST','status':200,'path':'/token'}]):
            scenarios_providers.oauth_origin_connect(ctx,'google')
        self.assertEqual([call[0] for call in browser.mock_calls], [
            'settle', 'open_page', 'open_page().goto', 'open_page().close',
            'frame.locator', 'frame.locator().wait_for',
        ])

    def test_phantombuster_snapshot_timestamp_is_stable_and_completed(self):
        from datetime import datetime,timezone
        base=self.fixtures.start('phantombuster')
        headers={'X-Phantombuster-Key':'fictional-phantombuster-key'}
        first=self.request(base,'/api/v2/agents/fetch-output?id=731',headers=headers)
        second=self.request(base,'/api/v2/agents/fetch-output?id=731',headers=headers)
        self.assertTrue(first['completed'])
        self.assertEqual(first['snapshot_id'],second['snapshot_id'])
        self.assertEqual(first['completed_at'],second['completed_at'])
        self.assertRegex(first['completed_at'],r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$')
        captured=datetime.fromisoformat(first['completed_at'].replace('Z','+00:00'))
        self.assertGreater((datetime.now(timezone.utc)-captured).total_seconds(),0)
        self.assertLess((datetime.now(timezone.utc)-captured).total_seconds(),86400)
