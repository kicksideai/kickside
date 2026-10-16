import hashlib,json,os,re,subprocess,threading,time,yaml
from pathlib import Path
L=Path.cwd()
runtime_bin=Path('/home/wolfy-j/kickside-gate/runtime/v0.3.47a/bin')
if not runtime_bin.exists():runtime_bin=Path('/home/wolfy-j/kickside/scratchpad/runtime-v0.3.47a/bin')
E=dict(os.environ,PATH=str(runtime_bin)+os.pathsep+os.environ['PATH'],TMPDIR=str(L/'temp'),PGHOST='127.0.0.1',PGPORT='5433',PGUSER='kickside',PGPASSWORD='kickside',ENCRYPTION_KEY='0'*64)
modules=json.loads((L/'modules.json').read_text()) if (L/'modules.json').exists() else {}
guard=threading.Lock()
def run(cmd,cwd,label,env=None):
 log=L/'evidence'/(label+'.log');start=time.monotonic()
 with log.open('w') as out: result=subprocess.run(cmd,cwd=cwd,env=env or E,stdout=out,stderr=subprocess.STDOUT)
 row={'rc':result.returncode,'log':str(log),'command':cmd,'seconds':round(time.monotonic()-start,3)}
 print(label,row['rc'],row['seconds'],flush=True);return row
def dump(name,data):
 with guard:(L/'evidence'/name).write_text(json.dumps(data,indent=2)+'\n')
def flags(root,original=None):
 original=original or root
 base=yaml.safe_load((original/'.wippy.yaml').read_text()) if (original/'.wippy.yaml').exists() else {};base=base or {}
 replacements=dict(modules)
 for name,path in base.get('workspace',{}).get('replacements',{}).items():
  resolved=(original/path).resolve()
  if resolved==original or resolved.is_relative_to(original):replacements[name]=str(root/resolved.relative_to(original))
  elif name not in modules:replacements[name]=str(resolved)
 config=L/'evidence'/('config-'+hashlib.sha256(str(root).encode()).hexdigest()[:16]+'.yaml')
 config.write_text(yaml.safe_dump({'version':'1.0','workspace':{'replacements':replacements}}))
 return base,(['--config',str(root/'.wippy.yaml')] if (root/'.wippy.yaml').exists() else [])+['--config',str(config)]
