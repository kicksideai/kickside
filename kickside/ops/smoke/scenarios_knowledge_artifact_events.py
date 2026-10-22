"""Knowledge content events retain bounded artifact references for large documents."""
import json
import uuid

from harness import Scenario, require
from module_harness import run_focused_module_test


def artifact_events(ctx):
    run_focused_module_test(ctx, 'kickside/knowledge', 'thread_ingest_identity_test')
    run_focused_module_test(ctx, 'kickside/kb10', 'content_extractor_test')
    run_focused_module_test(ctx, 'kickside/kb10', 'kb_ingest_test')
    run_focused_module_test(ctx, 'kickside/automation', 'round_reference_payload_test')


def large_upload(ctx):
    from scenarios_ai import completed_upload, kb_create, kb_indexed, nav, shot

    title = 'Large document library ' + uuid.uuid4().hex[:8]
    kid = kb_create(ctx, 'document', title)
    base = '/api/v1/knowledge/' + kid
    marker = 'LARGE-DOCUMENT-ARTIFACT-731'
    path = ctx.inst.root / 'temp' / 'large-document.txt'
    path.write_text((' ' * (5 * 1024 * 1024)) + '# Large document\n' + marker + '\n')
    uid, artifacts = completed_upload(ctx, path)
    require(artifacts.get('primary'), 'Large upload has no stored text artifact')
    queued = ctx.inst.request('POST', base + '/ingest-upload', {'upload_id': uid}, label='large-document-ingest')
    require(queued.get('queued') == 1, 'Large upload does not enter knowledge ingestion')
    kb_indexed(ctx, kid, marker)
    events = ctx.inst.request('GET', '/api/v1/threads/' + kid + '/events?limit=100', label='large-document-events')['events']
    event = next(row for row in events if row.get('type') == 'kickside.knowledge.events:content.upserted')
    body = event.get('body')
    if isinstance(body, str):
        body = json.loads(body)
    require(body.get('content_omitted') is True and 'content' not in body,
            'Large content is copied into its event')
    require(body['content_bytes'] > 4 * 1024 * 1024 and body['source_ref']['upload_id'] == uid
            and body['source_ref'].get('artifact_id'), 'Large event loses its artifact identity or byte count')
    nav(ctx, 'Knowledge')
    ctx.browser.frame.get_by_text(title, exact=True).first.click()
    ctx.browser.frame.get_by_text(path.name, exact=False).first.wait_for(timeout=30000)
    shot(ctx, 'large-document-library')


REGISTRY = [
    Scenario('knowledge_artifact_events', 'regression', artifact_events,
             issues=('KNOWLEDGE-BOUNDED-CONTENT-EVENT',)),

]
