from copy import deepcopy
import json
import unittest

from harness import Failure
from scenarios_published_channel import require_activation_continuity


class PublishedChannelContinuityTests(unittest.TestCase):
    def event(self, id, **changes):
        body = {'session_id': 'session', 'thread_id': 'conversation', 'route_key': 'provider:root:room',
                'at': '2026-10-10T10:00:00Z'}
        body.update(changes)
        return {'id': id, 'seq': 1, 'body': json.dumps(body), 'thread_id': 'root'}

    def test_preserves_exact_original_references_across_normal_runtime_reactivation(self):
        original = self.event('original')
        resumed = self.event('resumed', at='2026-10-10T11:00:00Z')
        resumed['seq'] = 2
        require_activation_continuity([original], [resumed, deepcopy(original)])

    def test_rejects_a_missing_original_reference(self):
        with self.assertRaises(Failure):
            require_activation_continuity([self.event('original')], [self.event('replacement')])

    def test_rejects_a_rewritten_original_event(self):
        with self.assertRaises(Failure):
            require_activation_continuity([self.event('original')],
                                          [self.event('original', at='2026-10-10T11:00:00Z')])

    def test_rejects_duplicate_event_identifiers(self):
        original = self.event('original')
        with self.assertRaises(Failure):
            require_activation_continuity([original], [original, deepcopy(original)])

    def test_rejects_rotation_of_every_original_coordinate(self):
        original = self.event('original')
        for field in ['session_id', 'thread_id', 'route_key']:
            with self.subTest(field=field), self.assertRaises(Failure):
                require_activation_continuity([original], [self.event('rotated', **{field: 'other'}), original])

    def test_rejects_an_ambiguous_original_conversation(self):
        original = [self.event('first'), self.event('second', session_id='other')]
        with self.assertRaises(Failure):
            require_activation_continuity(original, deepcopy(original))

    def test_rejects_absent_activation_evidence(self):
        with self.assertRaises(Failure):
            require_activation_continuity([], [])
