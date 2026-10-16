from types import SimpleNamespace
import unittest
from unittest.mock import patch

import scenarios_providers as providers
from mocks.origins import Google, Slack


class ProviderNativeDetails(unittest.TestCase):
    def test_slack_verifies_selected_message_text_after_listing_identities(self):
        calls=[]
        def tool(ctx, provider, tool, role, args, *rest, **kwargs):
            calls.append(args)
            return {'list_channels': {'channels': [{'name': 'northwind-orders'}]},
                'send_message': {'message_ts': 'created'}, 'add_reaction': {},
                'get_messages': {'messages': [{'ts': 'created'}]},
                'get_message': {'message': {'text': 'NORTHWIND-SLACK-731'}}}[args['action']]
        with patch.object(providers, 'origin_tool', tool):
            providers.slack_origin_tools(SimpleNamespace())
        self.assertEqual(calls[-1], {'action': 'get_message', 'channel_id': 'NW', 'message_ts': 'created'})

    def test_hubspot_verifies_properties_from_complete_object_details(self):
        calls=[]
        def tool(ctx, provider, tool, role, args, *rest, **kwargs):
            calls.append(args)
            if args['action']=='list_objects':return {'results': [{'id':'seed'}]}
            if args['action']=='create_object':return {'id':'created'}
            if args['action']=='update_object':return {}
            if args['action']=='get_object':
                self.assertEqual(args, {'action':'get_object', 'object_type':'contacts', 'object_id':args['object_id']})
                return {'id':args['object_id'], 'properties': {
                    'firstname': 'Northwind' if args['object_id']=='seed' else 'NORTHWIND-HUBSPOT-731'}}
            raise AssertionError(args)
        with patch.object(providers, 'origin_tool', tool), patch.object(providers,'pull_port'):
            providers.hubspot_origin_tools(SimpleNamespace(state={'hubspot_connection':'connection'}))
        self.assertEqual([x['object_id'] for x in calls if x['action']=='get_object'], ['seed','created'])

    def test_hubspot_sink_reads_updated_properties_and_archive_state_from_details(self):
        archived=False
        def probe(ctx, **kwargs):
            nonlocal archived
            operation=kwargs['arguments']['sink_op'];archived=operation=='delete'
            return {'result': 'deleted' if archived else 'created' if not kwargs['arguments'].get('dest_ref') else 'updated',
                'dest_ref': {'object_id':'created'}}
        def tool(ctx, provider, tool, role, args):
            self.assertEqual(args, {'action':'get_object', 'object_type':'contacts', 'object_id':'created'})
            return {'id':'created','archived':archived,'properties':{'firstname':'NW-HUBSPOT-SINK-UPDATE'}}
        with patch.object(providers,'probe',probe),patch.object(providers,'origin_tool',tool):
            providers.hubspot_sink(SimpleNamespace(state={'hubspot_connection':'connection'}))
        self.assertTrue(archived)

    def test_phantombuster_uses_native_mutation_identity(self):
        def tool(ctx, provider, tool, role, args, *rest, **kwargs):
            return {'list_agents':['Northwind candidate export'],'launch_agent':{'containerId':'created'},
                'list_containers':[{'id':'created'}]}[args['action']]
        with patch.object(providers,'origin_tool',tool),patch.object(providers,'pull_port'), \
             patch.object(providers,'phantom_control',return_value={'bounds':{},'policy':{}}):
            providers.phantombuster_origin_tools(SimpleNamespace(state={'phantombuster_connection':'connection'}))

    def test_google_sheet_fixture_declares_its_native_grid(self):
        fixture=Google("http://google.invalid")
        _,_,data=fixture.dispatch('GET','/v4/spreadsheets/731',{},None,{'Authorization':'Bearer fictional-google-access'})
        grid=data['sheets'][0]['properties']['gridProperties']
        self.assertGreaterEqual(grid['rowCount'],len(fixture.sheet_values))
        self.assertGreaterEqual(grid['columnCount'],max(map(len,fixture.sheet_values)))

    def test_slack_fixture_applies_provider_timestamp_bounds_and_page_size(self):
        fixture=Slack("http://slack.invalid")
        fixture.messages=[{'ts':stamp,'text':stamp} for stamp in ['731.000001','732.000001','733.000001']]
        headers={'Authorization':'Bearer fictional-slack-token'}
        _,_,data=fixture.dispatch('POST','/api/conversations.history',{},
            {'oldest':'732.000001','latest':'732.000001','inclusive':'true','limit':'1'},headers)
        self.assertEqual([row['ts'] for row in data['messages']],['732.000001'])
        _,_,data=fixture.dispatch('POST','/api/conversations.history',{},
            {'oldest':'731.000001','latest':'733.000001','inclusive':'false','limit':'10'},headers)
        self.assertEqual([row['ts'] for row in data['messages']],['732.000001'])
