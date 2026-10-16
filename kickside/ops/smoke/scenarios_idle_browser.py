"""Inactive smoke owners release their browser transports."""
from browser import Browser
from harness import Cleanup, Scenario, require
from scenarios import Context


def regression_idle_browser_owners(ctx):
    from smoke import execute_scenario
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    saved = browser.navigation()
    Browser.release(ctx)
    peers = []
    cleanup = Cleanup()
    parent_label = ctx.inst.evidence.label
    try:
        for index in range(13):
            peer = Context(ctx.inst, ctx.browser_session)
            peers.append(peer)
            cleanup.add('Probe owner ' + str(index), peer.close_browser)
            def visit(owner):
                owner.browser_check().restore(saved)
                owner.browser.frame.locator('.sidebar').wait_for(timeout=30000)
            result = execute_scenario({'model': {}}, ctx.inst.engine,
                                      Scenario('idle-owner-' + str(index), 'full', visit), peer, {}, lambda: None)
            require(result.status == 'passed', 'Owner boundary fails: ' + result.error)
        browser = ctx.browser_check()
        browser.restore(saved)
        browser.open_chat(ctx.state['agent'])
        require(all(peer.browser is None for peer in peers), 'Inactive smoke owners retain browser transports')
    finally:
        ctx.inst.evidence.label = parent_label
        failures = cleanup.run()
        require(not failures, 'Probe owner cleanup fails: ' + '; '.join(failures))
    ctx.inst.evidence.save('idle-browser-owners', {'owners': len(peers), 'chat_initialized': True})


REGISTRY = [Scenario('regression_idle_browser_owners', 'full', regression_idle_browser_owners,
                     ('first_agent',), issues=('R5-E09',))]
