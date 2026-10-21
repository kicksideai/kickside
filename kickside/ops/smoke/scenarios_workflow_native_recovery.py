"""Native workflow admission, retained terminal proof and publication convergence."""
import json
from urllib.parse import quote

from harness import Scenario, require
from module_harness import run_focused_module_test
from scenarios import workflow


def workflow_native_recovery(ctx):
    for entry in ('launch_reconciliation_live_test', 'native_admission_recovery_test',
                  'native_capacity_recovery_test', 'native_publication_recovery_test',
                  'maintenance_live_test'):
        run_focused_module_test(ctx, 'kickside/workflows', entry)
    inst = ctx.inst
    inst.install('kickside/inbox')
    wid, version = workflow(ctx, review=True)
    rid = inst.request('POST', f'/api/v1/workflows/{wid}/run',
                       {'version': version, 'input': {'marker': 'native-recovery'}}, label='native-start')['run_id']
    base = f'/api/v1/workflows/{wid}/runs/{rid}'

    def pending():
        detail = inst.request('GET', base, label='native-wait')
        require(detail['run']['status'] not in ('completed', 'failed'), 'Native review ends before its decision')
        return detail if any(node['status'] == 'waiting' for node in detail['nodes']) else None

    inst.wait(pending, 'Native review reaches durable wait', seconds=60)

    def decision():
        rows = [item for item in inst.request('GET', '/api/v1/inbox?status=all&limit=200',
                                              label='native-inbox')['items']
                if item['metadata'].get('run_id') == rid]
        require(len(rows) <= 1, 'Native run creates duplicate decisions')
        return rows[0] if rows else None

    item = inst.wait(decision, 'Native run creates one correlated decision', seconds=35)
    inst.stop(hard=True)
    inst.start()
    inst.login()
    restored = inst.wait(decision, 'Native decision survives process restart', seconds=35)
    require(restored['id'] == item['id'] and restored['status'] == 'pending', 'Restart changes the native decision')
    inst.request('POST', '/api/v1/inbox/' + quote(item['id'], safe='') + '/approve',
                 {'form': {'reason': 'native-recovery'}}, label='native-resume')

    def completed():
        detail = inst.request('GET', base, label='native-completion')
        require(detail['run']['status'] != 'failed', 'Native resumed run fails: ' + json.dumps(detail))
        return detail if detail['run']['status'] == 'completed' else None

    done = inst.wait(completed, 'Native run completes after restart', seconds=60)
    require('native-recovery' in json.dumps(done['run']['output']), 'Restart loses native output')
    inst.stop(hard=True)
    inst.start()
    inst.login()
    durable = inst.request('GET', base, label='native-terminal-restart')
    require(durable['run']['status'] == 'completed' and durable['run']['output'] == done['run']['output'],
            'Second process restart loses terminal proof')
    runs = inst.request('GET', f'/api/v1/workflows/{wid}/runs', label='native-run-history')['runs']
    require(len([row for row in runs if row['run_id'] == rid]) == 1, 'Restart duplicates native run history')
    inst.evidence.save('native-recovery', {'run_id': rid, 'decision_id': item['id'], 'hard_restarts': 2})


def automation_prepared_output_settlement(ctx):
    for entry in ('ledger_orphan_retention_test', 'recovery_dispatch_test', 'prepared_proof_upgrade_test'):
        run_focused_module_test(ctx, 'kickside/automation', entry)


def workflow_native_creation_errors(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'launch_reconciliation_live_test')


def workflow_undo_handoff_import_closure(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'undo_test', lint=True)


def workflow_unadmitted_run_reads(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'tsplit_runs_test_workflow_runs_read_model')


def workflow_durable_undo_history(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'undo_restart_test')


REGISTRY = [Scenario('automation_prepared_output_settlement', 'regression',
                     automation_prepared_output_settlement,
                     issues=('AUTOMATION-PREPARED-OUTPUT-SETTLEMENT-PROOF',)),
            Scenario('workflow_durable_undo_history', 'regression', workflow_durable_undo_history,
                     issues=('WORKFLOW-PUBLISHED-RESTART-STATE-CONTINUITY',)),
            Scenario('workflow_unadmitted_run_reads', 'regression', workflow_unadmitted_run_reads,
                     issues=('WORKFLOW-UNADMITTED-RUN-READ-PROJECTION', 'WORKFLOW-PUBLISHED-RUN-RESPONSE-SHAPE')),
            Scenario('workflow_undo_handoff_import_closure', 'regression', workflow_undo_handoff_import_closure,
                     issues=('WORKFLOW-SUPERVISOR-HARNESS-IMPORT-CLOSURE',)),
            Scenario('workflow_native_creation_errors', 'regression', workflow_native_creation_errors,
                     issues=('WORKFLOW-DATAFLOW-CREATION-ERROR-PRESERVATION',)),
            Scenario('workflow_native_recovery', 'regression', workflow_native_recovery,
                     issues=('DESIGN-WORKFLOW-NATIVE-EVIDENCE-CONFORMANCE',
                             'WORKFLOW-ADMITTED-PENDING-REACTIVATION', 'DATAFLOW-EXECUTION-FRAME-POLICY-CAP'))]
