import unittest

from scenarios_ai import require_cited_sources
from harness import Failure


class KnowledgeCitationsTests(unittest.TestCase):
    def answer(self, text='Delivery takes seven days [1].'):
        return {'answer': text, 'results': [{'id': 'passage', 'content': 'Delivery takes seven days.'}]}

    def test_citations_validate_the_callers_source_facts(self):
        require_cited_sources(self.answer(), ('seven days',))

    def test_citations_reject_a_fact_absent_from_the_returned_passages(self):
        with self.assertRaisesRegex(Failure, 'support'):
            require_cited_sources(self.answer(), ('ninety days',))

    def test_citations_reject_an_out_of_range_reference(self):
        with self.assertRaisesRegex(Failure, 'identify'):
            require_cited_sources(self.answer('Delivery takes seven days [2].'), ('seven days',))

    def test_citations_reject_a_passage_without_identity(self):
        answer = self.answer()
        del answer['results'][0]['id']
        with self.assertRaisesRegex(Failure, 'identity'):
            require_cited_sources(answer, ('seven days',))
