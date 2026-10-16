import copy
from types import SimpleNamespace
import unittest
from unittest.mock import Mock

from model_fixture import live_profile


class ModelFixtureTests(unittest.TestCase):
    def test_live_profile_configures_the_selected_discovered_cards(self):
        cards=[{'name':'profile/generation','provider_model':'generation','enabled':False,
                'max_tokens':0,'output_tokens':0},
               {'name':'profile/embedding','provider_model':'embedding','enabled':False,
                'max_tokens':0,'output_tokens':0}]
        saved=[]
        def request(method,path,body=None,**kwargs):
            if method=='POST' and path=='/api/v1/models/provider-profiles':return {'profile':{'id':'profile'}}
            if path.endswith('/discover'):return {'success':True}
            if method=='PUT' and path=='/api/v1/models/cards':
                saved.append(copy.deepcopy(body))
                cards[next(i for i,c in enumerate(cards) if c['name']==body['name'])]=copy.deepcopy(body)
                return {'success':True}
            if method=='GET' and path=='/api/v1/models/admin':return {'models':copy.deepcopy(cards)}
            raise AssertionError((method,path))
        inst=SimpleNamespace(config={'model':{'base':'https://models.invalid','key':'fixture',
                'llm':'generation','embed':'embedding'}},request=request,cleanup=Mock())
        _,configured=live_profile(SimpleNamespace(inst=inst),'Fixture models')
        self.assertEqual(len(saved),2)
        self.assertTrue(all(card['enabled'] and card['max_tokens']>0 for card in configured))
        self.assertEqual(configured[0]['output_tokens'],4096)
        self.assertEqual(configured[1]['dimensions'],512)
