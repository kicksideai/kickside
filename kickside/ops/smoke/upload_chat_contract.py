"""Verify the shared chat's upload lifecycle against owner websocket updates."""
from harness import require

WATCH_PROCESSING = """el => {
    const watch = {seen: false, active: true};
    const text = root => Array.from(root.childNodes, node => node.nodeType === Node.TEXT_NODE ? node.textContent
        : node.nodeType === Node.ELEMENT_NODE ? text(node) + (node.shadowRoot ? text(node.shadowRoot) : '') : '').join('');
    const tick = () => {
        watch.seen = watch.seen || text(el.shadowRoot || el).includes('Processing...');
        if (watch.active && !watch.seen) requestAnimationFrame(tick);
    };
    tick();
    return watch;
}"""


def upload_in_chat(ctx, chat, path, *, failed=False):
    from playwright.sync_api import expect
    inst, browser = ctx.inst, ctx.browser
    before = len(browser.uploads)
    frame_start = len(browser.frames)
    processing = chat.evaluate_handle(WATCH_PROCESSING)
    chat.locator('input[type=file]').set_input_files(str(path))
    result = inst.wait(lambda: browser.uploads[-1] if len(browser.uploads) > before else None,
                       'Chat document upload response', seconds=90, pump=browser.page.wait_for_timeout)
    uid = result.get('uuid')
    require(uid, 'Chat upload returns no UUID: ' + str(result))
    expect(chat.get_by_text(path.name, exact=True)).to_be_visible(timeout=30000)
    inst.wait(lambda: processing.evaluate('watch => watch.seen'), 'Chat shows the upload as Processing', seconds=30,
              pump=browser.page.wait_for_timeout)
    terminal = 'error' if failed else 'completed'

    def finished():
        upload = inst.request('GET', '/api/v1/uploads/' + uid, label='chat-upload-status')['upload']
        if not failed:
            require(upload['status'] not in ('error', 'failed'), 'Chat upload fails: ' + str(upload))
        return upload if upload['status'] == terminal else None

    record = inst.wait(finished, 'Chat document conversion', seconds=120, pump=browser.page.wait_for_timeout)
    topic = 'upload:' + uid
    def delivered(status):
        return lambda f: f.get('topic') == topic and f.get('data', {}).get('status') == status

    def updates():
        seen = {f.get('data', {}).get('status') for f in browser.frames[frame_start:] if f.get('topic') == topic}
        return True if {'processing', terminal} <= seen else None
    inst.wait(updates, 'Owner upload processing and terminal notifications', seconds=90,
              pump=browser.page.wait_for_timeout)
    browser.settle()
    processing_frames = browser.delivered_once(frame_start, delivered('processing'))
    terminal_frames = browser.delivered_once(frame_start, delivered(terminal))
    ordered = [f for f in browser.frames[frame_start:] if f.get('topic') == topic]
    statuses = [f['data']['status'] for f in ordered]
    require(statuses.index('processing') < statuses.index(terminal), 'Upload notifications reverse the lifecycle')
    frames = processing_frames + terminal_frames
    for frame in frames:
        require(frame['data']['uuid'] == uid, 'Upload topic and payload UUID differ')
    inst.evidence.save('chat-upload-' + path.suffix.lstrip('.') + '-notifications', frames)
    expect(chat).not_to_contain_text('Processing...', timeout=90000)
    if failed:
        require(record.get('error'), 'Failed upload lacks its error message')
        expect(chat).to_contain_text(record['error'], timeout=30000)
    browser.screenshot('chat-upload-' + ('error' if failed else 'ready') + '-' + path.suffix.lstrip('.'))
    return result
