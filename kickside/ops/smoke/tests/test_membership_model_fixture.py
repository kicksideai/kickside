import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import scenarios_identity_authority as guards


class MembershipModelFixtureTests(unittest.TestCase):
    def test_configures_model_cards_before_member_onboarding(self):
        inst=Mock(config={'model':{'llm':'fixture-generation','embed':'fixture-embedding'}})
        inst.password='fixture-password'
        def request(method,path,*args,**kwargs):
            if path=='/api/v1/security/policies':
                return {'policies':[{'id':'example:knowledge','surface':'kickside.knowledge','intent':'module_access'}]}
            if path=='/api/v1/users':return {'user':{'user_id':'fixture-member'}}
            return {}
        inst.request.side_effect=request
        browser=Mock()
        ctx=SimpleNamespace(inst=inst,browser_check=Mock(return_value=browser))
        class UIReached(Exception):pass
        with patch('model_fixture.live_profile') as configure, \
             patch.object(guards,'login',return_value='fixture-token'):
            generation={'name':'fixture/generation','enabled':True,'max_tokens':32768,'output_tokens':4096}
            configure.return_value=({'id':'fixture-profile'},[generation,{'name':'fixture/embedding'}])
            def login(*args):
                configure.assert_called_once_with(ctx,'Membership authority',scope='instance')
                inst.request.assert_any_call('PUT','/api/v1/models/cards',
                    {**generation,'class':['fast']},label='membership-default-model')
                raise UIReached()
            browser.login.side_effect=login
            with self.assertRaises(UIReached):guards.membership_expansion_session(ctx)
        scenario=next(row for row in guards.REGISTRY if row.name=='identity_membership_expansion_session')
        self.assertTrue(scenario.model)

    def test_retained_credentials_gain_access_before_another_login(self):
        inst=Mock()
        inst.password='fixture-password'
        groups={'expanded':False,'reduced':False}
        order=[]
        def request(method,path,*args,**kwargs):
            if path=='/api/v1/security/policies':
                return {'policies':[{'id':'example:knowledge','surface':'kickside.knowledge','intent':'module_access'}]}
            if path=='/api/v1/users':return {'user':{'user_id':'fixture-member'}}
            if path.endswith('/groups') and method=='PUT':
                groups['expanded']=len(args[0]['groups'])==3
                groups['reduced']=not groups['expanded']
            if path=='/api/v1/knowledge/list':
                expected=(200,) if groups['expanded'] else (403,)
                self.assertEqual(kwargs.get('expect',(200,)),expected)
                order.append(('knowledge',kwargs['auth']))
            if path=='/api/v1/user/me':
                if kwargs.get('expect')==(401,):self.assertTrue(groups['reduced'])
                return {'user':{'id':'fixture-member'}}
            return {}
        inst.request.side_effect=request
        browser=Mock()
        browser.frame.locator.return_value.count.return_value=0
        browser.page.evaluate.return_value='browser-token'
        browser.login.side_effect=lambda *args:order.append(('login',args))
        ctx=SimpleNamespace(inst=inst,browser_check=Mock(return_value=browser))
        with patch('model_fixture.live_profile',return_value=({},[{'name':'generation'}])), \
             patch.object(guards,'login',side_effect=['initial-token','fresh-token']), \
             patch.object(guards,'nav',side_effect=lambda ctx,page:order.append(('nav',page))), \
             patch('playwright.sync_api.expect'):
            guards.membership_expansion_session(ctx)
        member_logins=[i for i,row in enumerate(order) if row[0]=='login' and row[1]]
        self.assertEqual(len(member_logins),2)
        expanded_read=next(i for i,row in enumerate(order) if row==('knowledge','initial-token') and i>member_logins[0])
        navigation=order.index(('nav','Knowledge'))
        self.assertLess(expanded_read,member_logins[1])
        self.assertLess(navigation,member_logins[1])
