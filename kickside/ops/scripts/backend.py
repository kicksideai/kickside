"""Tower native gate: fresh locks, balanced suites, isolated harnesses and databases."""
import concurrent.futures
import fcntl
import copy
import sys
import json
import os
import re
import shutil
import socket
import subprocess
import time
import uuid
from pathlib import Path
import yaml
from backend_common import L,E,dump,flags,run
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"smoke"))
from module_harness import copy_harness, test_entries, _isolate_postgres_variables, _declared_postgres_database_names

ANSI=re.compile(r'\x1b\[[0-9;?]*[a-zA-Z]')


def run_engines(execute):
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        return dict(zip(('sqlite','postgres'),pool.map(execute,('sqlite','postgres'))))


def balance_suites(suites,costs,workers):
    bins=[(0,[]) for _ in range(min(workers,len(suites)))]
    for suite in sorted(suites,key=lambda name:(-costs.get(name,0.05),name)):
        index=min(range(len(bins)),key=lambda index:bins[index][0])
        total,members=bins[index]
        bins[index]=(total+costs.get(suite,0.05),members+[suite])
    return [members for _,members in bins]


def database_plan(base,prefix):
    config=copy.deepcopy(base)
    variables=_isolate_postgres_variables(config,prefix)
    return variables,sorted(_declared_postgres_database_names(config))


def shard_members(tests,costs,workers):
    initialization=sorted(identifier for identifier,entry in tests.items() if str(entry.get('meta',{}).get('suite','')).startswith('00_'))
    suites={}
    for identifier,entry in tests.items():
        if identifier not in initialization:
            suite=entry.get('meta',{}).get('suite') or identifier
            suites.setdefault(suite,[]).append(identifier)
    suite_costs={suite:sum(costs.get(identifier,0.05) for identifier in members)
                 for suite,members in suites.items()}
    partitions=balance_suites(list(suites),suite_costs,workers) or [[]]
    return [initialization+[identifier for suite in partition for identifier in suites[suite]]
            for partition in partitions]




def measured_costs(log,tests):
    text=ANSI.sub('',Path(log).read_text(errors='replace')).replace('\r','\n')
    by_name={(entry.get('meta',{}).get('suite',''), identifier.rsplit(':',1)[1]):identifier for identifier,entry in tests.items()}
    costs={};current=None
    for line in text.splitlines():
        match=re.search(r'(\S+)\s+\(\d+/\d+\)\s+(\S+)',line)
        if match:current=by_name.get((match.group(1),match.group(2)))
        case=re.search(r'\bo\s+.+?\s+(<1ms|[\d.]+(?:ms|s|m))\s*$',line)
        if current and case and not re.match(r'^\s*o\s+\S+\s+\(\d+\)',line):
            value=case.group(1)
            seconds=0.0005 if value=='<1ms' else float(value[:-2])/1000 if value.endswith('ms') else float(value[:-1])*(60 if value.endswith('m') else 1)
            costs[current]=costs.get(current,0)+seconds
    return costs


def validate(gate):
    text=ANSI.sub('',Path(gate['log']).read_text(errors='replace')).replace('\r','\n')
    totals=re.findall(r'\b(\d+) tests\b',text)
    passed=re.search(r'\b(\d+) passed\b',text);failed=re.search(r'\b(\d+) failed\b',text)
    gate['process_rc']=gate['rc']
    gate['counts']={'passed':int(passed.group(1)) if passed else int(totals[-1]) if totals else 0,
                    'failed':int(failed.group(1)) if failed else 0}
    if gate['rc']==0 and ('PASSED' not in text or re.search(r'^\s*FAILED\s+',text,re.M)
                          or 'No tests found' in text or gate['counts']['passed']<1 or gate['counts']['failed']):
        gate['rc']=1
        gate['reason']='runner does not report a successful nonempty suite'
    return gate


def execute_shard(row,engine,index,members,tests):
    original=L/'worktrees'/row['repo']/row['path']
    scratch=L/'temp'/('backend_'+uuid.uuid4().hex)
    databases=[]
    slug=row['repo']+'-'+row['path'].replace('/','-')+'-'+engine+'-suite-'+str(index)
    try:
        lock_path=original/'.wippy/focused-module.lock'
        lock_path.parent.mkdir(parents=True,exist_ok=True)
        with lock_path.open('a+') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            root=copy_harness(original,L/'worktrees'/row['repo'],scratch)
            base,args=flags(root,original)
        focus=root/'suite.yaml'
        focus.write_text(yaml.safe_dump({'version':'1.0','override':{
            identifier+':meta.type':'test_focus_excluded' for identifier in tests if identifier not in members}}))
        cmd=['wippy','test',*args,'--config',str(focus)]
        variables=base.get('vars',{})
        if 'instance_data_dir' in variables:cmd+=['--set','vars.instance_data_dir='+str(scratch/'instance')]
        if 'sqlite_path' in variables:cmd+=['--set','vars.sqlite_path='+str(scratch/'db.sqlite')]
        if 'http_port' in variables:
            with socket.socket() as listener:listener.bind(('127.0.0.1',0));port=listener.getsockname()[1]
            cmd+=['--set','vars.http_port='+str(port)]
        if engine=='postgres' and 'postgres' in base.get('profiles',{}):
            cmd+=['--profile','postgres','--set','vars.pg_host=127.0.0.1','--set','vars.pg_port=5433',
                  '--set','vars.pg_username=kickside','--set','vars.pg_password=kickside']
            selected,declared=database_plan(base,'automationtests_'+uuid.uuid4().hex)
            for name,value in selected.items():cmd+=['--set','vars.'+name+'='+value]
            for database in declared:
                subprocess.run(['createdb',database],env=E,check=True)
                databases.append(database)
                dump("database-"+database+".json", {"database":database,"harness":str(root),"owner_pid":os.getpid()})
        temporary=scratch/'temp'
        temporary.mkdir()
        gate=validate(run(cmd,root,slug,dict(E,KICKSIDE_INTEGRATION_TESTS='1',TMPDIR=str(temporary))))
        gate.update(engine=engine,suites=members,harness=str(root),databases=list(databases))
        return gate
    finally:
        cleanup_errors=[]
        for database in databases:
            try:
                subprocess.run(['dropdb','--if-exists',database],env=E,check=True)
                (L/'evidence'/('database-'+database+'.json')).unlink()
            except (subprocess.CalledProcessError,OSError) as error:
                cleanup_errors.append(str(error))
        if scratch.exists():shutil.rmtree(scratch)
        if cleanup_errors:raise RuntimeError('Owned database cleanup fails: '+'; '.join(cleanup_errors))


def execute(row):
    root=L/'worktrees'/row['repo']/row['path']
    tests=test_entries(root)
    if not tests:raise ValueError("Harness has no registered suites: "+str(root))
    baseline=next(record for record in json.loads((L/'evidence/backend-initial-results.json').read_text())
                  if record['repo']==row['repo'] and record['path']==row['path'])
    cost_by_engine={engine:measured_costs(baseline['gates'][engine]['log'],tests) for engine in ('sqlite','postgres')}
    def engine(engine):
        plans=shard_members(tests,cost_by_engine[engine],4)
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            return list(pool.map(lambda pair:execute_shard(row,engine,*pair,tests),enumerate(plans)))
    started=time.monotonic()
    gates=run_engines(engine)
    result={**row,'gates':gates,'seconds':round(time.monotonic()-started,3),
            'suite_entries':len(tests),'coverage':{engine:sorted(identifier for gate in shards for identifier in gate['suites']) for engine,shards in gates.items()}}
    for engine,covered in result['coverage'].items():
        expected=sorted(identifier for plan in shard_members(tests,cost_by_engine[engine],4) for identifier in plan)
        if covered!=expected:raise ValueError('Shard coverage differs from the module suite inventory')
    dump(row['repo']+'-'+row['path'].replace('/','-')+'-parallel.json',result)
    return result


def main():
    rows=json.loads((L/'evidence/harness-inventory.json').read_text())
    fresh={(row['repo'],row['path']):row for row in json.loads((L/'evidence/refresh-results.json').read_text())}
    results=[]
    # Each module uses at most eight native boots across both engines.
    for row in rows:
        if fresh[(row['repo'],row['path'])]['refresh']['rc']!=0:raise ValueError('Module lock refresh fails')
        results.append(execute(row))
        dump('backend-parallel-results.json',results)
    if any(gate['rc'] for result in results for shards in result['gates'].values() for gate in shards):raise SystemExit(1)

if __name__=='__main__':main()
