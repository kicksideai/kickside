"""Executable double for delivery's PATH-resolved `make compat` boundary."""
import argparse
import json
import os
from pathlib import Path
import shlex
import sys

sys.path.insert(0, str(Path.cwd()))
from ops.compat.gate import write_report

parser = argparse.ArgumentParser()
parser.add_argument('target', choices=['compat'])
parser.parse_args()
options = argparse.ArgumentParser()
options.add_argument('--output', type=Path, default=Path.cwd() / '.compat/evidence')
args = options.parse_args(shlex.split(os.environ.get('COMPAT_ARGS', '')))
fixture = Path(__file__).parent
(fixture / 'invocation.json').write_text(json.dumps({
    'args': sys.argv[1:], 'cwd': str(Path.cwd()),
}))
report = json.loads((fixture / 'compat-result.json').read_text())
breaking = sum(row['status'] == 'breaking' for row in report['findings'])
report['verdict'] = 'FAIL' if breaking or report['errors'] else 'PASS'
write_report(args.output.resolve(), report)
print(f"{report['verdict']}: {breaking} breaking findings; {len(report['errors'])} errors")
# make returns 2 when its gate recipe exits with a failure.
sys.exit(0 if report['verdict'] == 'PASS' else 2)
