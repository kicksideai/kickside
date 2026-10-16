import json
import unittest
from unittest.mock import Mock, patch

from harness import Failure
import scenarios_ai as ai


class ArtifactEmbeddingTests(unittest.TestCase):
    def run_artifact(self, kind, *, instruction=True, reference=True, referenced_id='issued-artifact'):
        title = 'Northwind ' + kind + ' review'
        artifact = {'artifact_id': 'issued-artifact', 'title': title,
                    'content_type': 'text/html' if kind == 'chart' else 'text/markdown'}
        messages = [{'type': 'function', 'data': json.dumps({'title': title}),
                     'metadata': {'function_name': 'CreateArtifact', 'status': 'success'}}]
        if instruction:
            messages.append({'type': 'developer', 'data': 'Display this exact tag: <artifact id="issued-artifact"/>'})
        messages.append({'type': 'assistant', 'data': '<artifact id="' + referenced_id + '"/>' if reference else 'Artifact summary'})
        chat, body = Mock(), Mock()
        chat.evaluate.return_value = 'Harbor tea Orchard coffee NW-AI-731'
        chat.locator.return_value = body
        body.locator.return_value.count.return_value = 3
        ctx = Mock()
        ctx.browser.frame.locator.return_value = chat
        catalog = {'artifacts': [artifact]}
        ctx.inst.request.side_effect = [{}, catalog] if kind == 'chart' else [catalog]
        with patch.object(ai, 'create_agent'), patch.object(ai, 'start_chat'), \
             patch.object(ai, 'messages', return_value=messages), \
             patch.object(ai, 'chat_shot'), patch.object(ai, 'hero_shot'):
            ai.artifact_chat(kind)(ctx)

    def test_reply_requires_the_issued_reference_in_every_content_mode(self):
        for kind in ('document', 'table', 'chart'):
            with self.subTest(kind=kind), self.assertRaisesRegex(Failure, 'embed tag'):
                self.run_artifact(kind, reference=False)

    def test_the_model_receives_the_reference_instruction(self):
        for kind in ('document', 'table', 'chart'):
            with self.subTest(kind=kind), self.assertRaisesRegex(Failure, 'embed instruction'):
                self.run_artifact(kind, instruction=False)

    def test_a_reference_to_another_artifact_does_not_satisfy_the_guard(self):
        for kind in ('document', 'table', 'chart'):
            with self.subTest(kind=kind), self.assertRaisesRegex(Failure, 'embed tag'):
                self.run_artifact(kind, referenced_id='another-artifact')

    def test_issued_reference_and_rendered_content_satisfy_the_guard(self):
        for kind in ('document', 'table', 'chart'):
            with self.subTest(kind=kind):
                self.run_artifact(kind)
