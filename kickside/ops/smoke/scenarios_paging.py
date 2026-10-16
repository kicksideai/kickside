"""Native paging and caller continuation regressions."""
import os
from pathlib import Path
import re
import subprocess

from harness import Scenario, require
from module_harness import run_focused_module_test


def focused(module, entries):
    def run(ctx):
        for entry in entries:
            run_focused_module_test(ctx, module, entry)
    return run


def frontend(ctx):
    root = Path(ctx.inst.config['replace']['kickside/workflows']).parents[1]
    env = {**ctx.inst.env, 'PATH': str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH']}
    for module, entry in (('workflows', 'src/app/api/api.test.ts'),
                          ('widgets', 'src/component-picker/app/componentPicker.spec.ts'),
                          ('webhooks', 'src/app/api.paging.spec.ts')):
        command = ['make', 'test', 'MOD=' + module, 'TEST_ARGS=' + entry + ' --maxWorkers=2']
        result = subprocess.run(command, cwd=root, env=env, capture_output=True, text=True, timeout=900)
        ctx.inst.evidence.save('paging-ui-' + module, {'command': command, 'code': result.returncode,
            'output': result.stdout, 'error': result.stderr})
        plain = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', result.stdout)
        summaries = re.findall(r'^\s*Tests\s+(.+)$', plain, re.M)
        passing = bool(summaries) and all(re.fullmatch(r'([1-9][0-9]*) passed\s+\(\1\)', summary.strip())
                                          for summary in summaries)
        require(result.returncode == 0 and passing, 'Paging UI guards fail: ' + result.stdout + result.stderr)


REGISTRY = [
    Scenario('paging_webhook_list', 'regression', focused('kickside/webhooks', ('list_paging_test',)), issues=('PAGING-WEBHOOK-LIST',)),
    Scenario('paging_core_classes', 'regression', focused('kickside/core', ('contract_cursor_test',)), issues=('PAGING-CORE-CLASSES',)),
    Scenario('paging_skills_default', 'regression', focused('kickside/skills', ('state_test',)), issues=('PAGING-SKILLS-DEFAULT',)),
    Scenario('paging_workflow_source', 'regression', focused('kickside/workflows', ('list_paging_test',)), issues=('PAGING-WORKFLOW-SOURCE',)),
    Scenario('paging_workflow_prompt', 'regression', focused('kickside/workflows', ('published_catalog_errors_test', 'engine_execution_test')), issues=('PAGING-WORKFLOW-PROMPT',)),
    Scenario('paging_workflow_catalog', 'regression', focused('kickside/workflows', ('agent_tools_test',)), issues=('PAGING-WORKFLOW-CATALOG',)),
    Scenario('paging_crm_references', 'regression', focused('kickside/crm', ('crm_activity_reference_test',)), issues=('PAGING-CRM-REFERENCES',)),
    Scenario('paging_graph_types', 'regression', focused('chestor/graph', ('graph_projection_test',)), issues=('PAGING-GRAPH-TYPES',)),
    Scenario('paging_ui_continuations', 'regression', frontend, issues=('PAGING-UI-CONTINUATIONS', 'PAGING-WEBHOOK-LIST')),
]
