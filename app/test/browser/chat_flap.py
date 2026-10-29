# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Browser assertions for the shell chat tab and hosted page edge."""


def check_chat_flap(page, frame):
    from playwright.sync_api import expect

    surface = frame.locator('.managed-surface')
    flap = frame.locator('.right-flap')
    page.mouse.move(1, 1)
    frame.locator('button[aria-label="Open chat"]').evaluate('(button) => button.blur()')
    expect(flap).to_be_visible()
    expect(flap).to_have_css('transform', 'matrix(1, 0, 0, 1, 28, 0)')
    surface.evaluate("""surface => {
        const probe = document.createElement('div');
        probe.id = 'chat-flap-edge-probe';
        probe.style.cssText = 'width:100%;height:0';
        const button = document.createElement('button');
        button.id = 'chat-flap-edge-control';
        button.textContent = 'Edge control';
        button.style.cssText = 'position:fixed;right:8px;top:calc(50% - 16px);width:32px;height:32px';
        button.onclick = () => probe.dataset.clicked = 'true';
        surface.querySelector('.surface-buffer--top').append(button);
        surface.append(probe);
    }""")
    probe = frame.locator('#chat-flap-edge-probe')
    try:
        bounds = probe.evaluate('(probe) => ({right:probe.getBoundingClientRect().right, width:innerWidth})')
        button = frame.get_by_role('button', name='Edge control', exact=True)
        box = button.bounding_box()
        assert box, 'The edge control is not visible'
        page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
        expect(flap).to_have_css('transform', 'matrix(1, 0, 0, 1, 28, 0)')
        button.click(timeout=5000)
        expect(probe).to_have_attribute('data-clicked', 'true')
        assert abs(bounds['right'] - bounds['width']) <= 1, (
            'The hosted page does not reach the viewport edge: ' + str(bounds))
        tab = flap.bounding_box()
        assert tab, 'The visible chat strip is missing'
        page.mouse.move(tab['x'] + 2, tab['y'] + tab['height'] / 2)
        expect(flap).to_have_css('transform', 'matrix(1, 0, 0, 1, 0, 0)')
        page.mouse.move(1, 1)
        expect(flap).to_have_css('transform', 'matrix(1, 0, 0, 1, 28, 0)')
        chat_button = frame.get_by_role('button', name='Open chat', exact=True)
        chat_button.focus()
        expect(chat_button).to_be_focused()
        expect(flap).to_have_css('transform', 'matrix(1, 0, 0, 1, 0, 0)')
        chat_button.evaluate('(button) => button.blur()')
        expect(flap).to_have_css('transform', 'matrix(1, 0, 0, 1, 28, 0)')
        return bounds
    finally:
        frame.locator('#chat-flap-edge-control').evaluate('(button) => button.remove()')
        probe.evaluate('(probe) => probe.remove()')

