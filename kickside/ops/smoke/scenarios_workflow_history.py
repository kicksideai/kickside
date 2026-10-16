"""Published Workflow upgrade boundary and durable browser undo/redo."""
import uuid
from pathlib import Path
import shutil

import yaml

from harness import Scenario, require
from module_lifecycle_contract import published_fixture, update_source
from scenarios_hot_update_work import database_rows
from scenarios import member_identity
from scenarios_identity_policy_upgrade import published_source
from workflow_history_contract import durable_history


def browser_workflow_durable_history(ctx):
    candidate = ctx.inst.config['replace']['kickside/workflows']

    def prepare(fixture):
        inst = fixture.inst
        source = inst.root / 'temp/published-workflows'
        baseline = published_source(source, 'kickside/workflows', None)
        inst.config['replace'] = dict(inst.config['replace'], **{'kickside/workflows': str(source)})
        config_path = inst.app / '.wippy.yaml'
        config = yaml.safe_load(config_path.read_text())
        config.setdefault('workspace', {}).setdefault('replacements', {})['kickside/workflows'] = str(source)
        config_path.write_text(yaml.safe_dump(config, sort_keys=False))
        fixture.state['history_source'] = str(source)
        inst.evidence.save('undo-history-published-archive', baseline)

    with published_fixture(ctx, 'kickside/workflows', prepare=prepare) as fixture:
        inst = fixture.inst
        source = fixture.state['history_source']
        inst.install('kickside/workflows')
        title = 'Durable Workflow history ' + uuid.uuid4().hex[:8]
        workflow_id = inst.request('POST', '/api/v1/workflows', {'title': title})['flow_id']
        path = '/api/v1/workflows/' + workflow_id
        inst.request('POST', path + '/apply', {'commands': [
            {'type': 'labels.set', 'body': {'labels': ['published edit']}},
        ]}, label='undo-history-published-edit')
        original = inst.request('GET', path + '/state')['state']
        require(original['can_undo'] is True and original['can_redo'] is False,
                'Published editor has no original in-memory undo baseline')
        inst.preserve_dependencies()
        shutil.rmtree(Path(source) / 'src')
        shutil.copytree(candidate, source, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns('.git', '.wippy', 'wippy.lock', 'node_modules',
                                                     '__pycache__', 'test', 'tests', 'lint-harness'))
        update_source(fixture, source, 'kickside/workflows', live=True)
        require(not database_rows(inst, "SELECT workflow_id FROM workflow_undo_history WHERE workflow_id='" + workflow_id + "'"),
                'First upgrade invents unavailable published history')
        with fixture.paused():
            pass
        restored = inst.request('GET', path + '/state')['state']
        expected = dict(original, can_undo=False, can_redo=False)
        require(restored == expected, 'First upgrade changes saved definition data or fabricates history')
        inst.evidence.save('undo-history-first-upgrade', {'original': original, 'restored': restored,
            'owner_order': 'workflow-undo: published in-memory stacks have no export; first transition starts empty'})
        stranger = member_identity(fixture)
        for method, endpoint in (('GET', '/state'), ('POST', '/undo'), ('POST', '/redo')):
            denied = inst.request(method, path + endpoint, {} if method == 'POST' else None,
                                  auth=stranger['token'], expect=(403,), label='undo-history-access' + endpoint)
            require(denied.get('success') is False and 'state' not in denied and 'events' not in denied,
                    'History access leaks or mutates another workflow')
        durable_history(fixture, workflow_id, title, source)
        inst.request('DELETE', path, label='undo-history-delete-owner')
        inst.wait(lambda: not database_rows(inst,
            "SELECT workflow_id FROM workflow_undo_history WHERE workflow_id='" + workflow_id + "'"),
            'Workflow owner cascade removes durable history', seconds=35)


REGISTRY = [Scenario('browser_workflow_durable_history', 'regression', browser_workflow_durable_history,
                     ('boot',), instance_setup=True,
                     issues=('WORKFLOW-PUBLISHED-RESTART-STATE-CONTINUITY',))]
