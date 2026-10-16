"""Fresh runtime contexts for scenarios that mutate installation state."""
from contextlib import contextmanager
import shutil
import uuid

import yaml

from harness import require
from scenarios import Context


def complete_splashes(ctx, *names):
    for name in names:
        ctx.inst.request('POST', '/api/v1/ui/splash/' + name + '/seen', label='fixture-completed-' + name)


def restart_fixture(ctx, hard=False):
    with ctx.paused(hard=hard):
        pass
    return ctx.browser


@contextmanager
def isolated_fixture(ctx, *, config=None, prepare=None):
    from browser import Browser
    from runtime import Instance
    inst = Instance(config if config is not None else ctx.inst.config, ctx.inst.engine,
                    ctx.inst.evidence.root / ctx.inst.evidence.label / ('isolated-' + uuid.uuid4().hex[:10]))
    fixture = Context(inst, ctx.browser_session)
    fixture.restart_runtime = restart_fixture
    fixture.pause_runtime = lambda context, hard=False: Browser.paused(
        inst, [context], lambda target, operation: operation(target), hard=hard)
    try:
        if prepare is not None:
            inst.prepare()
            prepare(fixture)
        inst.boot()
        yield fixture
        if fixture.browser:
            fixture.browser.clean(0)
    except Exception:
        if fixture.browser:
            browser = fixture.browser
            inst.evidence.save('isolated-browser-failure', {
                'url': browser.page.url,
                'errors': browser.errors,
                'frames': [{'name': frame.name, 'url': frame.url} for frame in browser.page.frames],
            })
        raise
    finally:
        failures = inst.cleanup.run()
        ctx.inst.evidence.save('isolated-fixture', {'root': str(inst.root), 'paths': inst.evidence.paths})
        require(not failures, 'Isolated runtime fixture cleanup fails: ' + '; '.join(failures))


@contextmanager
def temporary_source(ctx, module):
    from browser import Browser
    inst = ctx.inst
    source = inst.config['replace'].get(module)
    require(source, 'Module update requires its local source replacement')
    directory = inst.root / (module.rsplit('/', 1)[-1] + '-hub-update-' + uuid.uuid4().hex[:10])
    config_path = inst.app / '.wippy.yaml'
    original = config_path.read_text()
    replacements = inst.config['replace']
    shutil.copytree(source, directory, ignore=shutil.ignore_patterns('.git', '.wippy', 'node_modules', '__pycache__'))
    try:
        with Browser.paused(inst, [ctx], lambda context, operation: operation(context)):
            config = yaml.safe_load(original)
            config.setdefault('workspace', {}).setdefault('replacements', {})[module] = str(directory)
            config_path.write_text(yaml.safe_dump(config, sort_keys=False))
            inst.config['replace'] = dict(replacements, **{module: str(directory)})
            inst.resolve_dependencies(modules=(module,))
        yield directory
    finally:
        config_path.write_text(original)
        inst.config['replace'] = replacements
        with Browser.paused(inst, [ctx], lambda context, operation: operation(context)):
            inst.resolve_dependencies(modules=(module,))
        shutil.rmtree(directory)
