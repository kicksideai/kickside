"""Real KB uploads settle after every scheduled browser status read finishes."""
import time

import yaml

from harness import Scenario, require
from live_work_gate import work_gate
from runtime_fixtures import complete_splashes, isolated_fixture
from scenarios import nav, pdf_fixture
from scenarios_ai import kb_create
from scenarios_hot_update_work import install_work_fixture, NS as WORK_NS


NS = 'app.smoke.delayed_conversion'


def install_conversion_fixture(ctx, url):
    install_work_fixture(ctx, url)
    directory = ctx.inst.app / 'src' / 'delayed-conversion'
    directory.mkdir()
    entries = [{
        'name': 'pdf', 'kind': 'registry.entry',
        'meta': {'type': 'upload.type', 'title': 'Held PDF conversion'},
        'type_key': 'held_pdf', 'priority': 500, 'extensions': ['pdf'],
        'mime_types': ['application/pdf'],
        'pipeline': [
            {'title': 'Await conversion release', 'func': WORK_NS + ':upload', 'options': {'url': url}},
            {'title': 'Convert PDF to Markdown', 'func': 'kickside.uploads.documents:processor'},
        ],
    }]
    (directory / '_index.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))


def delayed_upload(ctx, terminal):
    from playwright.sync_api import expect

    with work_gate() as (gate, url), isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        for module in ('kickside/knowledge', 'kickside/kb10'):
            inst.install(module)
        with fixture.paused():
            install_conversion_fixture(fixture, url)
        complete_splashes(fixture, 'welcome', 'first_agent')
        fixture.state.update(model='class:fast', embed='class:embed')
        title = 'Delayed PDF ' + terminal
        kb_create(fixture, 'document', title)
        browser = fixture.browser_check()
        browser.login()
        nav(fixture, 'Knowledge')
        browser.frame.get_by_role('button', name='Open ' + title, exact=True).click()
        browser.frame.get_by_role('button', name='Add document', exact=True).click()
        path = pdf_fixture(inst, 'delayed-' + terminal)
        if terminal == 'error':
            path.write_bytes(b'%PDF-1.4\nInvalid PDF without a cross-reference table\n')
        reads = []
        started = time.monotonic()

        def observe(response):
            if response.request.method == 'GET' and response.url.startswith(inst.base + '/api/v1/uploads/'):
                payload = response.json()
                if isinstance(payload.get('upload'), dict):
                    reads.append({'at': time.monotonic() - started, 'upload': payload['upload']})

        browser.page.on('response', observe)
        try:
            with browser.page.expect_response(lambda r: r.url == inst.base + '/api/v1/uploads'
                                               and r.request.method == 'POST') as posted:
                browser.frame.locator('input.ap-file').set_input_files(str(path))
            result = posted.value.json()
            require(posted.value.status == 200 and result.get('success'), 'Browser upload fails: ' + str(result))
            uid = result['uuid']
            row = browser.frame.locator('.ap-item').filter(has_text=path.name)
            clear = browser.frame.get_by_role('button', name='Clear done', exact=True)
            inst.wait(lambda: len(reads) == 4 and gate.snapshot().get('upload', {}).get('entered') == 1,
                      'Held conversion outlasts all four browser status reads', seconds=45,
                      pump=browser.page.wait_for_timeout)
            expect(row).to_have_class('ap-item processing')
            expect(clear).to_have_count(0)
            require(all(read['upload']['uuid'] == uid and read['upload']['status'] in ('pending', 'uploaded', 'queued', 'processing')
                        for read in reads), 'A scheduled browser read sees a terminal or unrelated upload')
            require(reads[-1]['at'] - reads[0]['at'] >= 14, 'The final scheduled status read does not occur')
            require(gate.snapshot() == {'upload': {'entered': 1, 'effects': 0}}, 'Conversion runs before release')
            released = time.monotonic() - started
            inst.evidence.save('delayed-upload-before-release', {
                'terminal': terminal, 'reads': reads, 'released_at': released,
                'gate': gate.snapshot(), 'item': row.inner_text(), 'busy': clear.count() == 0,
            })
            gate.release()

            def settled():
                record = inst.request('GET', '/api/v1/uploads/' + uid, label='delayed-upload-owner')['upload']
                return record if record['status'] in ('completed', 'error', 'failed') else None

            record = inst.wait(settled, 'Real document conversion reaches its terminal state', seconds=120,
                               pump=browser.page.wait_for_timeout)
            require(record['status'] == terminal, 'Conversion terminal differs: ' + str(record))
            try:
                if terminal == 'completed':
                    expect(browser.frame.locator('input.ap-file')).to_have_count(0, timeout=10000)
                    expect(row).to_have_count(0)
                    add = browser.frame.get_by_role('button', name='Add document', exact=True)
                    expect(add).to_be_enabled()
                    add.click()
                    expect(browser.frame.locator('input.ap-file')).to_have_count(1)
                    expect(browser.frame.locator('button.ap-drop')).to_be_visible()
                    expect(browser.frame.locator('button.ap-drop')).to_be_enabled()
                    expect(browser.frame.locator('.ap-item.processing, .ap-item.uploading')).to_have_count(0)
                else:
                    expect(row).to_have_class('ap-item error', timeout=10000)
                    expect(clear).to_be_visible(timeout=10000)
                    expect(row.locator('.spin')).to_have_count(0)
                    require(record.get('error'), 'Failed conversion loses its error')
                    expect(row.locator('.ap-item-status')).to_have_text(record['error'])
                require(len(reads) == 4, 'UI settlement performs an extra status read')
            finally:
                inst.evidence.save('delayed-upload-terminal', {
                    'expected': terminal, 'upload': record, 'reads': reads, 'released_at': released,
                    'terminal_at': time.monotonic() - started, 'gate': gate.snapshot(),
                    'items': browser.frame.locator('.ap-items').all_text_contents(),
                    'clear_visible': clear.is_visible(),
                    'processing_count': browser.frame.locator('.ap-item.processing, .ap-item.uploading').count(),
                    'uploader_open': browser.frame.locator('input.ap-file').count() == 1,
                    'upload_frames': [frame for frame in browser.frames if uid in str(frame)],
                })
                browser.screenshot('delayed-upload-' + terminal)
            if terminal == 'error':
                clear.click()
                expect(row).to_have_count(0)
        finally:
            browser.page.remove_listener('response', observe)
            gate.release()


def completed(ctx):
    delayed_upload(ctx, 'completed')


def errored(ctx):
    delayed_upload(ctx, 'error')


REGISTRY = [
    Scenario('kb_upload_delayed_completed', 'regression', completed,
             issues=('KB10-UPLOAD-NOTIFICATION-CONTRACT',)),
    Scenario('kb_upload_delayed_error', 'regression', errored,
             issues=('KB10-UPLOAD-NOTIFICATION-CONTRACT', 'UPLOAD-OPTIONAL-ERROR-CALLBACK')),
]
