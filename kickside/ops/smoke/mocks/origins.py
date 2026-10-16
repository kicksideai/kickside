"""Local provider wire contracts with durable fictional reads and writes."""
import base64
from email.parser import BytesParser
from decimal import Decimal
import json
import secrets
from datetime import datetime,timedelta,timezone
from urllib.parse import urlencode, unquote
from .fixture import Fixture
from .oidc import OIDC

STAMP = '2026-10-01T12:00:00Z'


class GitHub(Fixture):
    name = 'github'
    def __init__(self,*args):
        super().__init__(*args)
        self.codes = {}
        self.issues = [{'id':731,'number':1,'title':'Northwind order packing','body':'Pack 24 cartons','state':'open','updated_at':STAMP,'created_at':STAMP,'user':{'login':'northwind'},'labels':[],'html_url':self.base+'/northwind/orders/issues/1'}]
        self.comments = []
    def dispatch(self,method,path,query,body,headers):
        if method=='GET' and path=='/login/oauth/authorize':
            fields={k:v[0] for k,v in query.items()}
            if fields.get('client_id')!='northwind-client':return 400,{}, {'error':'invalid_client'}
            code=secrets.token_urlsafe(24);self.codes[code]=fields
            return 302,{'Location':fields['redirect_uri']+'?'+urlencode({'state':fields['state'],'code':code})},None
        if method=='POST' and path=='/login/oauth/access_token':
            fields=self.codes.pop(body.get('code'),None)
            if not fields or body.get('client_secret')!='fictional-oidc-secret' or body.get('client_id')!='northwind-client':return 400,{}, {'error':'invalid_grant'}
            return 200,{}, {'access_token':'fictional-github-token','token_type':'Bearer','scope':'repo read:user user:email'}
        if headers.get('Authorization') not in ('Bearer fictional-github-token','token fictional-github-token'):return 401,{}, {'message':'fictional credential required'}
        if path=='/user':return 200,{}, {'id':731,'login':'northwind','name':'Northwind Operator','email':'operator@northwind.example.invalid'}
        if path=='/user/emails':return 200,{}, [{'email':'operator@northwind.example.invalid','primary':True,'verified':True}]
        repo={'id':731,'name':'orders','full_name':'northwind/orders','owner':{'login':'northwind'},'private':False,'description':'Northwind packing orders'}
        if path in ('/user/repos','/orgs/northwind/repos'):return 200,{}, [repo]
        if path=='/repos/northwind/orders':return 200,{},repo
        prefix='/repos/northwind/orders/issues'
        if path==prefix:
            if method=='POST':
                row=dict(self.issues[0],id=732+len(self.issues),number=len(self.issues)+1,**body);self.issues.append(row);return 200,{},row
            return 200,{},self.issues
        if path.startswith(prefix+'/'):
            parts=path[len(prefix)+1:].split('/');row=next((r for r in self.issues if str(r['number'])==parts[0]),None)
            if row is None:return 404,{}, {'message':'issue missing'}
            if len(parts)>1 and parts[1]=='comments':
                if method=='POST':self.comments.append({'id':731+len(self.comments),'body':body['body'],'user':{'login':'northwind'},'created_at':STAMP})
                return 200,{},self.comments[-1] if method=='POST' else self.comments
            if method=='PATCH':row.update(body)
            return 200,{},row
        return 404,{}, {'message':'unknown GitHub route'}


class Slack(Fixture):
    name='slack'
    def __init__(self,*args):
        super().__init__(*args);self.messages=[{'ts':'731.000001','text':'Northwind order packing','user':'NW'}]
    def dispatch(self,method,path,query,body,headers):
        token=headers.get('Authorization','')
        if token not in ('Bearer fictional-slack-token','Bearer fictional-slack-app'):return 200,{}, {'ok':False,'error':'invalid_auth'}
        method_name=path.removeprefix('/api/')
        if method_name=='auth.test':return 200,{}, {'ok':True,'team':'Northwind','team_id':'NW','user_id':'NW','bot_id':'NW'}
        channel={'id':'NW','name':'northwind-orders','is_member':True,'topic':{'value':'Northwind packing'}}
        if method_name=='conversations.list':return 200,{}, {'ok':True,'channels':[channel],'response_metadata':{'next_cursor':''}}
        if method_name=='conversations.info':return 200,{}, {'ok':True,'channel':channel}
        if method_name=='conversations.history':
            params={key:values[-1] for key,values in query.items()}
            params.update(body or {})
            inclusive=str(params.get('inclusive','false')).lower()=='true'
            oldest=Decimal(params['oldest']) if params.get('oldest') else None
            latest=Decimal(params['latest']) if params.get('latest') else None
            rows=[]
            for row in reversed(self.messages):
                stamp=Decimal(row['ts'])
                if oldest is not None and (stamp<oldest or (stamp==oldest and not inclusive)):continue
                if latest is not None and (stamp>latest or (stamp==latest and not inclusive)):continue
                rows.append(row)
            limit=int(params.get('limit',100))
            return 200,{}, {'ok':True,'messages':rows[:limit],'has_more':len(rows)>limit}
        if method_name=='users.list':return 200,{}, {'ok':True,'members':[{'id':'NW','name':'northwind','real_name':'Northwind Operator'}]}
        if method_name=='chat.postMessage':
            row={'ts':str(732+len(self.messages))+'.000001','text':body['text'],'user':'NW'};self.messages.append(row);return 200,{}, {'ok':True,'channel':'NW','ts':row['ts'],'message':row}
        if method_name=='chat.update':
            row=next(r for r in self.messages if r['ts']==body['ts']);row['text']=body['text'];return 200,{}, {'ok':True,'ts':row['ts']}
        if method_name=='reactions.add':return 200,{}, {'ok':True}
        if method_name=='apps.connections.open':return 200,{}, {'ok':True,'url':self.base.replace('http:','ws:')+'/socket'}
        return 404,{}, {'ok':False,'error':'unknown_method'}


class HubSpot(Fixture):
    name='hubspot'
    def __init__(self,*args):
        super().__init__(*args);self.rows=[{'id':'731','properties':{'firstname':'Northwind','lastname':'Operator','email':'operator@northwind.example.invalid','hs_lastmodifieddate':STAMP,'hs_object_id':'731'},'createdAt':STAMP,'updatedAt':STAMP,'archived':False}]
        self.engagements = {}
        for name, title_key, body_key in [('meetings', 'hs_meeting_title', 'hs_meeting_body'), ('notes', None, 'hs_note_body'), ('emails', 'hs_email_subject', 'hs_email_text'), ('calls', 'hs_call_title', 'hs_call_body')]:
            properties = {body_key: '<p>NORTHWIND-ENGAGEMENT-731</p>', 'hs_lastmodifieddate': STAMP, 'hs_timestamp': STAMP, 'hs_object_id': '731'}
            if title_key:
                properties[title_key] = 'Northwind packing'
            if name == 'calls':
                properties.update(hs_call_status='COMPLETED', hs_call_disposition='PACKED')
            self.engagements[name] = [{'id': '731', 'properties': properties, 'createdAt': STAMP, 'updatedAt': STAMP, 'archived': False}]
    def dispatch(self,method,path,query,body,headers):
        if headers.get('Authorization')!='Bearer fictional-hubspot-token':return 401,{}, {'message':'invalid token'}
        if path=='/account-info/v3/details':return 200,{}, {'portalId':731,'accountType':'STANDARD','companyName':'Northwind','uiDomain':'app.hubspot.com'}
        if path.startswith('/crm/v4/associations/'):
            parts = path.removeprefix('/crm/v4/associations/').split('/')
            if parts == ['contacts', 'companies', 'batch', 'read']:
                return 200, {}, {'results': [{'from': {'id': item['id']}, 'to': [{'toObjectId': 'company-731',
                    'associationTypes': [{'category': 'HUBSPOT_DEFINED', 'typeId': 1, 'label': 'Primary'}]}]}
                    for item in body['inputs']]}
            if len(parts) != 4 or parts[2:] != ['batch', 'read'] or parts[0] not in self.engagements or parts[1] not in ('contacts', 'deals'):
                return 404, {}, {'message': 'unknown association route'}
            rows = []
            for item in body['inputs']:
                row = {'from': {'id': item['id']}, 'to': []}
                if parts[1] == 'deals':
                    row['to'] = [{'toObjectId': 'deal-731'}]
                elif item.get('after') == 'next-contact':
                    row['to'] = [{'toObjectId': 'contact-732'}]
                elif item.get('after') is None:
                    row['to'] = [{'toObjectId': 'contact-731'}]
                    row['paging'] = {'next': {'after': 'next-contact'}}
                else:
                    return 400, {}, {'message': 'invalid association cursor'}
                rows.append(row)
            return 200, {}, {'results': rows}
        if path.startswith('/crm/v3/properties/'):
            return 200,{}, {'results':[{'name':key,'label':key,'type':'string','fieldType':'text'} for key in self.engagements.get(path.removeprefix('/crm/v3/properties/'), self.rows)[0]['properties']]}
        if path.startswith('/crm/v3/objects/'):
            parts=path.removeprefix('/crm/v3/objects/').split('/')
            rows = self.engagements.get(parts[0], self.rows)
            if len(parts)==1 and method=='POST':
                row={'id':str(732+len(self.rows)),'properties':dict(body['properties']),'createdAt':STAMP,'updatedAt':STAMP,'archived':False};self.rows.append(row);return 200,{},row
            if len(parts)==1 or parts[1]=='search':return 200,{}, {'results':rows,'total':len(rows)}
            if parts[1]=='batch':return 200,{}, {'results':[r for r in rows if r['id'] in [str(v['id']) for v in body.get('inputs',[])]]}
            row=next((r for r in self.rows if r['id']==parts[1]),None)
            if row is None:return 404,{}, {'message':'object missing'}
            if method=='PATCH':row['properties'].update(body['properties'])
            if method=='DELETE':row['archived']=True;return 204,{},None
            return 200,{},row
        return 404,{}, {'message':'unknown HubSpot route'}


class Telegram(Fixture):
    name='telegram'
    def __init__(self,*args):
        super().__init__(*args);self.messages=[]
    def dispatch(self,method,path,query,body,headers):
        if path.startswith('/file/botfictional-telegram-token/'):
            return 200,{'Content-Type':'text/plain'},'NORTHWIND-TELEGRAM-FILE-731'
        prefix='/botfictional-telegram-token/'
        if not path.startswith(prefix):return 401,{}, {'ok':False,'description':'invalid bot token'}
        action=path[len(prefix):]
        if action=='getMe':return 200,{}, {'ok':True,'result':{'id':731,'is_bot':True,'first_name':'Northwind Bot','username':'northwind_bot'}}
        if action=='getChat':return 200,{}, {'ok':True,'result':{'id':'NW','type':'supergroup','title':'Northwind orders'}}
        if action=='getUpdates':return 200,{}, {'ok':True,'result':[{'update_id':i,'message':v} for i,v in enumerate(self.messages) if i>=int(query.get('offset',['0'])[0])]}
        if action=='sendMessage':
            row={'message_id':731+len(self.messages),'text':body['text'],'date':1790865600,'chat':{'id':body['chat_id'],'type':'supergroup','title':'Northwind'}};self.messages.append(row);return 200,{}, {'ok':True,'result':row}
        if action=='editMessageText':
            row=next(r for r in self.messages if str(r['message_id'])==str(body['message_id']));row['text']=body['text'];return 200,{}, {'ok':True,'result':row}
        if action=='getFile':return 200,{}, {'ok':True,'result':{'file_id':'NW','file_path':'northwind.txt'}}
        if action in ('sendChatAction','setMessageReaction','pinChatMessage','deleteMessage'):return 200,{}, {'ok':True,'result':True}
        return 404,{}, {'ok':False,'description':'unknown Telegram route'}


class Fireflies(Fixture):
    name='fireflies'
    def __init__(self,*args):
        super().__init__(*args);self.transcript={'id':'731','title':'Northwind packing meeting','date':1790865600000,'duration':10,'transcript_url':self.base+'/731','participants':['operator@northwind.example.invalid'],'sentences':[{'index':0,'speaker_name':'Northwind Operator','text':'Pack 24 cartons','start_time':0,'end_time':3}],'summary':{'overview':'Northwind packing meeting','action_items':'Pack 24 cartons'}}
    def dispatch(self,method,path,query,body,headers):
        if headers.get('Authorization')!='Bearer fictional-fireflies-key':return 401,{}, {'error':'invalid API key'}
        if method=='POST' and path=='/graphql':
            q=body.get('query','')
            if 'transcripts(' in q or 'transcripts {' in q:return 200,{}, {'data':{'transcripts':[self.transcript]}}
            if 'transcript(' in q:return 200,{}, {'data':{'transcript':self.transcript}}
            return 200,{}, {'data':{'user':{'user_id':'731','name':'Northwind Operator','email':'operator@northwind.example.invalid'}}}
        return 404,{}, {'error':'unknown Fireflies route'}


class PhantomBuster(Fixture):
    name='phantombuster'
    def __init__(self,*args):
        super().__init__(*args);self.launches=[]
        self.completed_at=(datetime.now(timezone.utc)-timedelta(minutes=1)).strftime('%Y-%m-%dT%H:%M:%SZ')
    def dispatch(self,method,path,query,body,headers):
        if headers.get('X-Phantombuster-Key')!='fictional-phantombuster-key':return 401,{}, {'error':'invalid API key'}
        if path=='/api/v2/orgs/fetch':return 200,{}, {'id':'731','name':'Northwind','orgId':'731'}
        agent={'id':'731','name':'Northwind candidate export','scriptId':'731','argument':{},'lastEndMessage':'Northwind export completes'}
        if path=='/api/v2/agents/fetch-all':return 200,{}, {'agents':[agent]}
        if path=='/api/v2/agents/fetch':return 200,{}, agent
        if path=='/api/v2/agents/fetch-output':return 200,{}, {'snapshot_id':'northwind-snapshot-731','completed':True,'completed_at':self.completed_at,'results':[{'id':'731','name':'Northwind Operator','email':'operator@northwind.example.invalid','post_id':'731','text':'Northwind packing update','url':'https://northwind.example.invalid/posts/731'}]}
        if path in ('/api/v2/agents/launch','/api/v2/agents/launch-soon'):
            row={'containerId':str(731+len(self.launches)),'agentId':body['id'],'status':'running','name':'Northwind export'};self.launches.append(row);return 200,{},row
        if path=='/api/v2/agents/stop':return 200,{}, {'status':'stopped','agentId':body['id']}
        if path=='/api/v2/containers/fetch-all':return 200,{}, {'containers':self.launches}
        if path=='/api/v2/containers/fetch-result-object':return 200,{}, [{'id':'731','name':'Northwind Operator','email':'operator@northwind.example.invalid'}]
        return 404,{}, {'error':'unknown PhantomBuster route'}


class Google(OIDC):
    name='google'
    def __init__(self,*args):
        super().__init__(*args)
        self.initial_expires_in = 3600
        self.refresh_error = ''
        self.api_rejections = 0
        self.access_tokens = {'fictional-google-access'}
        self.refresh_count = 0
        self.files=[{'id':'731','name':'Northwind packing guide','mimeType':'application/vnd.google-apps.document','modifiedTime':STAMP,'webViewLink':self.base+'/731'}]
        self.events=[{'id':'731','summary':'Northwind packing meeting','description':'Pack 24 cartons','updated':STAMP,'start':{'dateTime':'2026-10-04T12:00:00Z'},'end':{'dateTime':'2026-10-04T12:30:00Z'},'status':'confirmed','attendees':[{'email':'operator@northwind.example.invalid','displayName':'Northwind Operator'}],'htmlLink':self.base+'/731'}]
        self.drafts=[]
        self.documents={'731':{'documentId':'731','title':'Northwind packing guide','body':{'content':[{'paragraph':{'elements':[{'textRun':{'content':'Pack 24 Northwind cartons\n'}}]}}]}}}
        self.presentations={'731':{'presentationId':'731','title':'Northwind packing slides','slides':[]}}
        self.sheet_values=[['Northwind','24']]
    def dispatch(self,method,path,query,body,headers):
        if method == 'POST' and path == '/_fixture/oauth':
            allowed = {'initial_expires_in', 'api_rejections', 'refresh_error'}
            if set(body) - allowed:
                return 400, {}, {'error': 'unknown OAuth fixture option'}
            for key, value in body.items():
                if key == 'refresh_error':
                    if value not in ('', 'invalid_grant', 'temporarily_unavailable'):
                        return 400, {}, {'error': 'unknown refresh error'}
                elif not isinstance(value, int) or isinstance(value, bool) or value < 0:
                    return 400, {}, {'error': 'fixture count must be a nonnegative integer'}
                setattr(self, key, value)
            return 200, {}, {'success': True}
        if method == 'POST' and path == '/token' and body.get('grant_type') == 'refresh_token':
            if body.get('client_id') != 'northwind-client' or body.get('client_secret') != 'fictional-oidc-secret':
                return 400, {}, {'error': 'invalid_client'}
            if body.get('refresh_token') != 'fictional-google-refresh':
                return 400, {}, {'error': 'invalid_grant'}
            if self.refresh_error:
                return (400 if self.refresh_error == 'invalid_grant' else 503), {}, {'error': self.refresh_error}
            self.refresh_count += 1
            token = 'fictional-google-renewed-' + str(self.refresh_count)
            self.access_tokens.add(token)
            return 200, {}, {'access_token': token, 'token_type': 'Bearer', 'expires_in': 3600}
        if path in ('/.well-known/openid-configuration','/jwks','/authorize','/token','/userinfo'):
            if path=='/authorize' and not query.get('code_challenge'):
                fields={k:v[0] for k,v in query.items()}
                if fields.get('client_id')!='northwind-client':return 400,{}, {'error':'invalid_client'}
                code=secrets.token_urlsafe(24);self.codes[code]=fields
                return 302,{'Location':fields['redirect_uri']+'?'+urlencode({'code':code,'state':fields['state']})},None
            if path=='/token' and body.get('code') in self.codes and not self.codes[body['code']].get('code_challenge'):
                fields=self.codes.pop(body['code'])
                if body.get('client_secret')!='fictional-oidc-secret':return 400,{}, {'error':'invalid_client'}
                return 200,{}, {'access_token':'fictional-google-access','token_type':'Bearer','expires_in':self.initial_expires_in,'refresh_token':'fictional-google-refresh'}
            if path=='/userinfo' and headers.get('Authorization')=='Bearer fictional-google-access':return 200,{}, {'id':'731','sub':'northwind-operator','name':'Northwind Operator','email':'operator@northwind.example.invalid','email_verified':True}
            return super().dispatch(method,path,query,body,headers)
        if path=='/customsearch/v1':
            if query.get('key')!=['fictional-google-key'] or query.get('cx')!=['northwind-search']:return 403,{}, {'error':{'message':'invalid search credential'}}
            return 200,{}, {'items':[{'title':'Northwind orders','link':'https://northwind.example.invalid/dispatch','snippet':'Pack 24 Northwind cartons'}],'searchInformation':{'totalResults':'1'}}
        if self.api_rejections:
            self.api_rejections -= 1
            return 401, {}, {'error': {'message': 'Google access token rejected'}}
        if headers.get('Authorization', '').removeprefix('Bearer ') not in self.access_tokens:
            return 401, {}, {'error': {'message': 'invalid Google token'}}
        if path=='/drive/v3/files':
            if method=='POST':
                row=dict(body,id=str(732+len(self.files)),modifiedTime=STAMP);self.files.append(row);return 200,{},row
            return 200,{}, {'files':self.files}
        if path.startswith('/drive/v3/files/'):
            row=next(r for r in self.files if r['id']==path.split('/')[4]);return 200,{},row
        if path=='/calendar/v3/users/me/calendarList':return 200,{}, {'items':[{'id':'primary','summary':'Northwind calendar','primary':True}]}
        if path=='/calendar/v3/calendars/primary/events':
            if method=='POST':
                row=dict(body,id=str(732+len(self.events)),updated=STAMP,status='confirmed');self.events.append(row);return 200,{},row
            return 200,{}, {'items':self.events}
        if path.startswith('/calendar/v3/calendars/primary/events/'):
            row=next(r for r in self.events if r['id']==path.split('/')[6])
            if method in ('PUT','PATCH'):row.update(body)
            if method=='DELETE':self.events.remove(row);return 204,{},None
            return 200,{},row
        if path.startswith('/gmail/v1/users/me/drafts'):
            parts=path.split('/')
            if method=='POST':
                row=dict(body,id=str(731+len(self.drafts)))
                self.drafts.append(row)
            elif len(parts)>6:
                row=next((r for r in self.drafts if r['id']==parts[6]),None)
                if row is None: return 404, {}, {'error': 'draft missing'}
                if method=='DELETE':
                    self.drafts.remove(row)
                    return 204, {}, None
                if method=='PUT':row.update(body)
            else:
                rows = self.drafts
                query_text = query.get('q', [''])[0]
                if query_text.startswith('rfc822msgid:'):
                    expected = query_text.removeprefix('rfc822msgid:')
                    rows = [r for r in rows if any(h['name'].lower() == 'message-id' and h['value'] == expected
                        for h in r['message']['payload']['headers'])]
                return 200, {}, {'drafts': rows}
            if method in ('POST', 'PUT'):
                encoded = row['message']['raw']
                message = BytesParser().parsebytes(base64.urlsafe_b64decode(encoded + '=' * (-len(encoded) % 4)))
                row['message']['payload'] = {'headers': [{'name': key, 'value': value} for key, value in message.items()]}
            return 200, {}, row
        if path=='/gmail/v1/users/me/messages':return 200,{}, {'messages':[{'id':'731','threadId':'731'}],'resultSizeEstimate':1}
        if path=='/gmail/v1/users/me/messages/731':return 200,{}, {'id':'731','threadId':'731','snippet':'Northwind packing note','payload':{'headers':[{'name':'Subject','value':'Northwind packing note'}],'mimeType':'text/plain','body':{'data':base64.urlsafe_b64encode(b'Pack 24 cartons').decode()}}}
        if path=='/v1/documents' and method=='POST':
            row={'documentId':str(732+len(self.documents)),'title':body['title'],'body':{'content':[]}}
            self.documents[row['documentId']]=row
            return 200,{},row
        if path.startswith('/v1/documents/'):
            return 200,{},self.documents[path.rsplit('/',1)[1]]
        if path=='/v1/presentations' and method=='POST':
            row={'presentationId':str(732+len(self.presentations)),'title':body['title'],'slides':[]}
            self.presentations[row['presentationId']]=row
            return 200,{},row
        if path.startswith('/v1/presentations/'):
            return 200,{},self.presentations[path.rsplit('/',1)[1]]
        if path.startswith('/v4/spreadsheets'):
            if '/values/' in path:
                if method in ('PUT','POST'):self.sheet_values=body['values']
                return 200,{}, {'range':'Orders!A1:B2','values':self.sheet_values,'updatedRows':len(self.sheet_values)}
            return 200,{}, {'spreadsheetId':'731','properties':{'title':'Northwind packing sheet'},'sheets':[{'properties':{'title':'Orders','sheetId':0,'gridProperties':{'rowCount':1000,'columnCount':26}}}]}
        if path.startswith('/v1/people'):
            return 200,{}, {'connections':[{'resourceName':'people/731','names':[{'displayName':'Northwind Operator'}],'emailAddresses':[{'value':'operator@northwind.example.invalid'}]}]}
        if path.startswith('/v1beta/accountSummaries'):return 200,{}, {'accountSummaries':[{'account':'accounts/731','displayName':'Northwind','propertySummaries':[{'property':'properties/731','displayName':'Northwind orders'}]}]}
        if path.startswith('/v1beta/properties'):return 200,{}, {'reports':[],'rows':[{'dimensionValues':[{'value':'Northwind'}],'metricValues':[{'value':'24'}]}]}
        if path=='/customsearch/v1':return 200,{}, {'items':[{'title':'Northwind orders','link':self.base+'/northwind','snippet':'Pack 24 Northwind cartons'}],'searchInformation':{'totalResults':'1'}}
        return 404,{}, {'error':{'message':'unknown Google route'}}


class Microsoft(OIDC):
    name='microsoft'
