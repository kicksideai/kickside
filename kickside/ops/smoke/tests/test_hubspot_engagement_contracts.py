import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import hubspot_engagement_contracts as engagements
import scenarios_providers as providers


class HubspotEngagementContracts(unittest.TestCase):
    def test_engagements_reuse_the_origin_connection_without_setup(self):
        ctx = SimpleNamespace(inst=Mock(), state={'hubspot_connection': 'origin-connection', 'provider_bases': {'hubspot': 'http://127.0.0.1:731'}}, fixtures=Mock())
        records = [{'method': 'GET', 'path': '/crm/v4/associations/contacts'}]
        ctx.fixtures.requests.side_effect = [records * 12, records * 24]

        def page(context, **args):
            self.assertEqual(args['connection'], 'origin-connection')
            kind = args['arguments']['config']['object_type']
            return {'success': True, 'items': [{'item_key': 'hubspot:' + kind + ':731',
                'source_version': '2026-10-01T12:00:00Z', 'payload': {
                    'content': 'NORTHWIND-ENGAGEMENT-731',
                    'associations': {'contacts': ['contact-731', 'contact-732'], 'deals': ['deal-731']},
                    'record': {'fields': {'call_status': 'COMPLETED', 'call_disposition': 'PACKED'}}}}]}

        def refusal(context, **args):
            self.assertEqual(args['connection'], 'origin-connection')
            return {'success': False, 'error': 'object_type must be writable'}

        with patch.object(providers, 'configure_provider_endpoints'), \
             patch.object(providers, 'connect', return_value='duplicate-connection'), \
             patch.object(providers, 'probe', side_effect=page), \
             patch.object(engagements, 'engagement_refusal', side_effect=refusal):
            engagements.hubspot_engagements(ctx)
        ctx.inst.install.assert_not_called()
        ctx.inst.stop.assert_not_called()
        ctx.inst.start.assert_not_called()
        ctx.inst.request.assert_not_called()

    def test_engagement_prerequisites_supply_the_origin_connection(self):
        registry = {scenario.name: scenario for scenario in providers.REGISTRY}
        self.assertEqual(registry['providers_hubspot_engagements'].requires, ('providers_hubspot_origin_connect',))
        self.assertEqual(registry['providers_hubspot_origin_connect'].requires, ('providers_origins',))
        self.assertTrue(registry['providers_origins'].instance_setup)
        self.assertTrue(registry['providers_hubspot_origin_connect'].instance_setup)
