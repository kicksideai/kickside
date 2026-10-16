"""Visible workflow teardown leaves the next browser session usable."""
from harness import require


def visible_workflow_teardown(ctx):
    from scenarios_providers import providers_chat_setup, regression_phantombuster_ui
    regression_phantombuster_ui(ctx)
    errors = ctx.inst.cleanup.run(scope='scenario')
    require(not errors, 'Visible workflow teardown fails: ' + '; '.join(errors))
    require(ctx.browser is None, 'Workflow teardown leaves its browser attached to the deleted resource')
    providers_chat_setup(ctx)
    ctx.browser.clean(0)
    ctx.browser.screenshot('workflow-teardown-next-session')
