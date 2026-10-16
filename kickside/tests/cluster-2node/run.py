#!/usr/bin/env python3
"""Two real KickSide runtimes, one fresh PostgreSQL database; assertions a-f."""
from __future__ import annotations
import argparse
import base64
import json
import os
import re
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import time
import urllib.error
import urllib.request
import uuid
import yaml
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

REPO = Path(__file__).resolve().parents[2]
FIXTURE = Path(__file__).parent / 'fixture'
DEFAULT_BIN = Path(shutil.which('wippy') or 'wippy')
SERVICES = ['kickside.core.threads:cursor_waiter.service', 'kickside.core.jobs.service:worker.service',
            'kickside.core.retention.service:sweeper.service']
NAMES = ['kickside.core.threads.cursor_waiter_broker','kickside.core.jobs.worker_pool',
         'kickside.core.retention.service:sweeper_process', 'kickside.channel.session_hub','wippy.central']

class Failure(Exception): pass

def save(path, value):
    path.write_text(json.dumps(value, indent=2, default=str)+'\n')

def port():
    with socket.socket() as s:
        s.bind(('127.0.0.1',0))
        return s.getsockname()[1]

def wait(check, description, seconds=90):
    deadline = time.monotonic()+seconds
    last = None
    while time.monotonic() < deadline:
        last = check()
        if last:
            return last
        # Only bounded waits for the explicitly named observable postcondition.
        time.sleep(.2)
    raise Failure(f'{description}: not observed within {seconds}s; last={last!r}')

class Node:
    def __init__(self, name, root, args, database, gossip, identities):
        self.name,self.root,self.args,self.database = name,root,args,database
        self.http = port()
        self.log=root/'runtime.log'
        self.app=root/'app'
        self.proc=None
        self.token=''
        self.env=os.environ.copy()
        self.env.update(ENCRYPTION_KEY='a6386f623f6a60b314ecb98b7b3afc91d63bc8e6ab122a5ee1498a91438b733f',
                        PGPASSWORD=args.pg_password,TMPDIR=str(root))
        self.gossip,self.identities=gossip,identities
    def pg(self, sql, db=None):
        result=subprocess.run(['psql','-h',self.args.pg_host,'-p',str(self.args.pg_port),'-U',self.args.pg_user,
            '-d',db or self.database,'-v','ON_ERROR_STOP=1','-Atqc',sql],env=self.env,text=True,capture_output=True)
        if result.returncode: raise Failure(result.stderr.strip())
        return result.stdout.strip()
    def prepare(self):
        self.root.mkdir()
        shutil.copytree(REPO/'app',self.app,ignore=shutil.ignore_patterns('.wippy','node_modules'))
        shutil.copytree(FIXTURE,self.app/'src/app/test/cluster')
        shutil.copytree(REPO/'app/test/e2e_fixture',self.app/'src/app/test/e2e')
        replacements={}
        for parent in (REPO/'core', REPO/'platform', REPO.parent/'components', REPO.parent/'providers'):
            for manifest in parent.glob('*/wippy.yaml'):
                pkg=yaml.safe_load(manifest.read_text())
                replacements[pkg['organization']+'/'+pkg['module']]=str(manifest.parent)
        cfg={'version':'1.0','relay':{'node_name':self.name},'workspace':{'replacements':replacements},'cluster':{
            'enabled':True,'name':self.name,
            'membership':{'bind_addr':'127.0.0.1','advertise_addr':'127.0.0.1','bind_port':self.gossip[self.name],
                'join_addrs': '' if self.name=='node-b' else f'127.0.0.1:{self.gossip["node-b"]}',
                'secret_key':base64.b64encode(bytes(range(32))).decode()},
            'internode':{'bind_addr':'127.0.0.1','bind_port':port(),'auto_port':False,
                'identity_key':self.identities[self.name]['seed'],
                'trusted_peer_keys':{n:v['public'] for n,v in self.identities.items()}},
            'raft':{'role':'server','bootstrap_expect':1 if self.name=='node-b' else 0,
                'max_voters':1,'max_standbys':1,'data_dir':str(self.root/'raft')}},
            'registry':{'history_type':'sqlite','history_path':str(self.root/'registry.db')},'override':{}}
        # Stage B's actual services until A has acquired the names. The tested
        # production services then compete normally; no replacement actors.
        if self.name=='node-b':
            for service in (SERVICES[0], SERVICES[2]):
                cfg['override'][service+':lifecycle.auto_start']=False
        else:
            cfg['override'][SERVICES[1]+':lifecycle.auto_start']=False
        (self.root/'overlay.yaml').write_text(yaml.safe_dump(cfg,sort_keys=False))
        save(self.root/'manifest.json',{'replacements':replacements,'cluster':cfg['cluster']})
    def command(self):
        # Use the postgres DB entry with independent, node-local config history.
        # Registry/config replication is audited separately; this is actor naming.
        return [str(self.args.bin),'--config','.wippy.yaml','--config',str(self.root/'overlay.yaml'),
            'run','--profile','workspace','--profile','quickstart','--profile','postgres',
            '--set',f'vars.local_port={self.http}','--set',f'vars.local_public_api_url=http://localhost:{self.http}',
            '--set',f'vars.postgres_host={self.args.pg_host}','--set',f'vars.postgres_port={self.args.pg_port}',
            '--set',f'vars.postgres_database={self.database}','--set',f'vars.postgres_username={self.args.pg_user}',
            '--set',f'vars.postgres_password={self.args.pg_password}','--set','vars.postgres_sslmode=disable',
            '--set','registry.history_type=sqlite','--set',f'registry.history_path={self.root/"registry.db"}']
    def start(self):
        with self.log.open('wb') as log:
            self.proc=subprocess.Popen(self.command(),cwd=self.app,env=self.env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
        def ready():
            if self.proc.poll() is not None: raise Failure(f'{self.name} exited {self.proc.returncode}; {self.log}')
            try:
                self.request('GET','/api/public/health')
                return True
            except (OSError,Failure): return False
        wait(ready,self.name+' health',120)
    def stop(self,hard=False):
        if self.proc and self.proc.poll() is None:
            os.killpg(self.proc.pid,signal.SIGKILL if hard else signal.SIGTERM)
            try: self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(self.proc.pid,signal.SIGKILL); self.proc.wait()
    def request(self,method,path,body=None):
        headers={'Content-Type':'application/json'}
        if self.token: headers['Authorization']='Bearer '+self.token
        req=urllib.request.Request(f'http://127.0.0.1:{self.http}'+path,
            data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
        try:
            with urllib.request.urlopen(req,timeout=45) as res: return json.load(res)
        except urllib.error.HTTPError as e: raise Failure(f'{self.name} {path}: HTTP {e.code}: {e.read().decode()[:800]}') from e
    def probe(self,op,**body): return self.request('POST','/api/public/cluster-test',{'op':op,**body})
    def observed(self,key,kind):
        raw=self.pg("SELECT COALESCE(json_agg(body::json),'[]'::json) FROM cluster_observation WHERE key='"+key+"' AND kind='"+kind+"'")
        return json.loads(raw)
    def snapshot(self,label):
        result=self.probe('snapshot',names=NAMES)
        save(self.root/(label+'.json'),result)
        return result
    def login(self):
        self.token=self.request('POST','/api/public/user/token',{'email':'admin@kickside.local','password':'kickside-admin'})['token']


def inventory():
    rows = json.loads((Path(__file__).parent/'inventory.json').read_text())
    expected = {row['file']:row['scope'] for row in rows}
    calls = []
    # Scan direct registrations and shared singleton calls in production sources.
    roots = [*REPO.glob('core/*/src'),*REPO.glob('platform/*/src'),REPO.parent/'components/sso/src',REPO/'app/src']
    explicit = r'(?:process\.registry|pool_names|proc\.registry|names)\.register'
    delegated = r'proc_supervisor\.(?:claim_singleton|claim_or_owner)'
    pattern = re.compile(r'(' + explicit + '|' + delegated + r')\(')
    singleton_scope = expected['core/jobs/src/proc_supervisor.lua']
    for root in roots:
        for path in root.rglob('*.lua'):
            rel = str(path.relative_to(REPO))
            for match in pattern.finditer(path.read_text()):
                start = match.end()
                depth, end = 1, start
                while depth:
                    char = path.read_text()[end]
                    if char == '(': depth += 1
                    elif char == ')': depth -= 1
                    end += 1
                args = path.read_text()[start:end-1]
                assert rel in expected, f'uninventoried registration: {rel}: {args}'
                if match.group(1).endswith('.register'):
                    assert 'process.registry.'+expected[rel] in args, f'wrong or missing scope: {rel}: {args}'
                else:
                    assert expected[rel] == singleton_scope, f'wrong singleton scope: {rel}: {args}'
                calls.append({'file':rel,'line':path.read_text()[:match.start()].count('\n')+1,'scope':expected[rel]})
    assert set(expected)=={call['file'] for call in calls}, 'inventory site missing from source scan'
    return {'registrations':calls,'decisions':rows}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--bin',type=Path,default=Path(os.getenv('E2E_BIN',str(DEFAULT_BIN))))
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--pg-host',default='127.0.0.1'); p.add_argument('--pg-port',type=int,default=5433)
    p.add_argument('--pg-user',default='kickside'); p.add_argument('--pg-password',default=os.getenv('PGPASSWORD','kickside'))
    args=p.parse_args()
    root=args.out/('two-node-'+uuid.uuid4().hex[:12]); root.mkdir(parents=True)
    db='cluster_'+uuid.uuid4().hex[:16]
    identities={}
    for name in ('node-a','node-b'):
        seed=os.urandom(32); public=Ed25519PrivateKey.from_private_bytes(seed).public_key().public_bytes(Encoding.Raw,PublicFormat.Raw)
        identities[name]={'seed':base64.b64encode(seed).decode(),'public':base64.b64encode(public).decode()}
    gossip={name:port() for name in identities}
    a=Node('node-a',root/'a',args,db,gossip,identities); b=Node('node-b',root/'b',args,db,gossip,identities)
    outcomes={}; created=False
    save(root/'run.json',{'commit':subprocess.check_output(['git','-C',str(REPO),'rev-parse','HEAD'],text=True).strip(),
        'binary':str(args.bin),'database':db,'topology':'B sole voter; A nonvoting standby; asymmetric A-loss test'})
    def check(label,fn):
        try: outcomes[label]={'result':'pass','evidence':fn()}
        except (Failure,AssertionError,OSError,KeyError) as e: outcomes[label]={'result':'fail','error':str(e)}
        save(root/'results.json',outcomes); print(label,outcomes[label]['result'],outcomes[label].get('error',''),flush=True)
    try:
        a.prepare(); b.prepare()
        b.pg(f'CREATE DATABASE "{db}" TEMPLATE template0','postgres'); created=True
        b.pg('CREATE TABLE cluster_observation(id BIGSERIAL PRIMARY KEY,key TEXT,kind TEXT,body TEXT)')
        b.start(); a.start()
        wait(lambda:a.probe('snapshot',names=NAMES)['raft_role']=='standby', 'A joins as nonvoting standby')
        sa=a.snapshot('joined'); sb=b.snapshot('joined')
        assert len(sa['members'])==2 and len(sb['members'])==2, 'membership did not join'
        assert sb['leader']=='node-b','B is not the surviving quorum holder'
        # B owns the pool: enqueue on A must reach a remote owner.
        assert 'node-b' in sb['names'][NAMES[1]]['resolved'], 'B must initially own pool'
        b.probe('enable',services=[SERVICES[0],SERVICES[2]])
        wait(lambda:b.probe('snapshot',names=NAMES)['names'][NAMES[1]]['resolved'], 'B can resolve pool')
        def cursor():
            key='cursor'+uuid.uuid4().hex[:8]
            projection=a.probe('prepare_cursor')
            started=b.probe('waiter',key=key,cursor_id=projection['cursor_id'])
            wait(lambda:b.observed(key,'ready'),'B bounded cursor waiter ready',15)
            committed=a.probe('commit',key=key,thread_id=projection['thread_id'])
            notice=wait(lambda:b.observed(key,'received'),'A committed thread event and projection wake B cursor waiter',30)
            assert len(notice)==1 and notice[0]['last_seq']==1,notice
            state=json.loads(b.pg("SELECT row_to_json(x) FROM (SELECT t.event_count,c.last_seq,p.body FROM kickside_thread t JOIN kickside_projection p ON p.thread_id=t.id JOIN kickside_projection_cursor c ON c.projection_id=p.id WHERE t.id='"+projection['thread_id']+"') x"))
            assert state['event_count']==state['last_seq']==state['body']['count']==1,state
            return {'projection':projection,'committed':committed,'waiter':started,'notice':notice,'durable_state':state}
        check('a',cursor)
        def one_job():
            key='job'+uuid.uuid4().hex[:8]; enqueued=a.probe('enqueue',key=key)
            wait(lambda:b.observed(key,'effect'),'one enqueued job effect',30)
            rows=b.observed(key,'attempt'); effects=b.observed(key,'effect')
            assert len(rows)==len(effects)==1 and 'node-b' in rows[0]['pid'], {'attempts':rows,'effects':effects}
            return {'job':enqueued,'attempts':rows,'effects':effects}
        check('b',one_job)
        def relay():
            key='user'+uuid.uuid4().hex[:8]; client=b.probe('client',key=key)
            ready=wait(lambda:b.observed(key,'ready'),'real relay user hub on B',15)
            assert 'node-b' in ready[0]['hub'],ready
            wait(lambda:a.probe('snapshot',names=['user.'+key])['names']['user.'+key]['resolved']==ready[0]['hub'],
                 'A observes the registered framework hub on B',15)
            a.probe('push',key=key)
            delivered=wait(lambda:b.observed(key,'received'),'A realtime push delivered by framework hub on B',15)
            assert len(delivered)==1 and delivered[0]['origin']=='A',delivered
            return {'client':client,'ready':ready,'delivered':delivered}
        check('c',relay)
        def singleton():
            left=a.snapshot('singletons'); right=b.snapshot('singletons'); failures={}
            for name in NAMES:
                l,r=left['names'][name],right['names'][name]
                if not l['resolved'] or l['resolved']!=r['resolved'] or not l['CONSISTENT'] or not r['CONSISTENT'] or l['LOCAL'] or r['LOCAL']:
                    failures[name]={'A':l,'B':r}
            assert not failures,failures
            return {'A':left['names'],'B':right['names'],'inventory':inventory()}
        check('d',singleton)
        # Move the pool to A through normal service removal/start, then restore
        # B's real service as a contender. No test-owned replacement pool.
        saved=b.probe('remove_service',services=[SERVICES[1]])['entries']
        a.probe('enable',services=[SERVICES[1]])
        wait(lambda:'node-a' in a.probe('snapshot',names=NAMES)['names'][NAMES[1]]['resolved'], 'A owns pool for failover')
        b.probe('restore_service',entries=saved)
        a.login(); b.login()
        drive={'type':'kickside.sync:sync','input':{'title':'Cluster drive','enabled':True,'reconcile':True,
            'trigger':{'v':2,'source':'app.test.e2e:records','backfill':'all','poll':{'page_size':1,'max_pages_per_run':1},
                'schedule':{'type':'interval','expression':'1h'},'config':{'items':[{'key':f'cluster{i}','content':f'cluster {i}'} for i in range(3)]}},
            'sink_port':'kickside.inbox.sink:inbox_item','sink_config':{'item_type':'notice'},'transform':{'kind':'none'}}}
        aid=a.request('POST','/api/v1/automations',drive)['id']
        a.request('POST',f'/api/v1/automations/{aid}/control',{'control':'run_now','request_id':uuid.uuid4().hex})
        def inbox():
            return [x for x in b.request('GET','/api/v1/inbox?status=all&limit=200').get('items',[]) if x.get('metadata',{}).get('sync_origin')==aid]
        before=wait(inbox,'automation pull/write before A loss',30)
        key='failover'+uuid.uuid4().hex[:8]
        leased=a.probe('enqueue',key=key,hold=True)
        attempts=wait(lambda:b.observed(key,'attempt'),'job execution starts on A',30)
        assert len(attempts)==1 and 'node-a' in attempts[0]['pid'],attempts
        save(root/'before-kill.json',{'A':a.snapshot('before-kill'),'B':b.snapshot('before-kill'),'leased':leased,'attempts':attempts,'drive':aid,'inbox':before})
        a.stop(hard=True)
        def takeover():
            wait(lambda:'node-b' in b.probe('snapshot',names=NAMES)['names'][NAMES[1]]['resolved'], 'B takes over A pool',120)
            effects=wait(lambda:b.observed(key,'effect'),'A leased job completes on B',120)
            rows=b.observed(key,'attempt')
            assert len(effects)==1 and 'node-b' in effects[0]['pid'],effects
            assert len(rows)==2 and len({x['job_id'] for x in rows})==1,rows
            snap=b.snapshot('after-kill')
            for name in NAMES[:3]: assert 'node-b' in snap['names'][name]['CONSISTENT'],snap['names'][name]
            return {'attempts':rows,'effects':effects,'names':snap['names']}
        check('e',takeover)
        b.snapshot('after-kill-observation')
        def progress():
            b.request('POST',f'/api/v1/automations/{aid}/control',{'control':'run_now','request_id':uuid.uuid4().hex})
            after=wait(lambda:inbox() if len(inbox())>len(before) else None,'drive pull/write progresses after A loss',60)
            assert len({x['metadata']['item_key'] for x in after})==len(after),after
            return {'id':aid,'before':len(before),'after':len(after)}
        check('f',progress)
    except (Failure,AssertionError,OSError,KeyError) as e:
        outcomes['setup']={'result':'fail','error':str(e)}
        print('setup',str(e),flush=True)
    finally:
        a.stop(); b.stop()
        if created:
            b.pg(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='{db}' AND pid<>pg_backend_pid()",'postgres')
            b.pg(f'DROP DATABASE "{db}"','postgres')
        save(root/'results.json',outcomes)
    print(root,flush=True)
    return 0 if set(outcomes)==set('abcdef') and all(x['result']=='pass' for x in outcomes.values()) else 1

if __name__=='__main__': raise SystemExit(main())
