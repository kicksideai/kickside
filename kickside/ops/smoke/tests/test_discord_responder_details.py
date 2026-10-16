import unittest

from playwright.sync_api import sync_playwright

from discord_responder_contracts import assert_responder_facts


class DiscordResponderDetailTests(unittest.TestCase):
    def test_facts_resolve_inside_the_dialog_in_a_shadow_root_and_iframe(self):
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=['--no-sandbox'])
            try:
                page = browser.new_page()
                page.set_content('<iframe name="details"></iframe>')
                page.frames[1].set_content('<responder-details></responder-details>')
                page.frames[1].locator('responder-details').evaluate('''el => {
                    el.attachShadow({mode: 'open'}).innerHTML = `
                        <div role="dialog" aria-label="Responder">
                            <button role="tab">Activity</button>
                            <div class="kx-dfact"><span>Health</span><strong class="kx-dfact-v">Ready</strong></div>
                            <div class="kx-dfact"><span>Details</span><strong class="kx-dfact-v">Reply reaches the channel</strong></div>
                            <div class="kx-dfact"><span>Last outcome</span><strong class="kx-dfact-v">active</strong></div>
                            <div class="kx-dfact"><span>Failed deliveries</span><strong class="kx-dfact-v">0</strong></div>
                        </div>`;
                }''')
                details = page.frame_locator('iframe[name="details"]').get_by_role('dialog', name='Responder', exact=True)
                assert_responder_facts(details)
            finally:
                browser.close()
