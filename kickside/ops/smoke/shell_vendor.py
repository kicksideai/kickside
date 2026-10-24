"""Verify the shell's lock-derived assets and capture host request provenance."""
import base64
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.parse import urljoin, urlsplit

from harness import require


# This release-contract test is intentionally private. Source runs exercise a
# public product checkout, so stage the owned test into the disposable build
# copy rather than asking the product source to carry smoke-only fixtures.
PRIVATE_SHELL_VENDOR_TEST = Path(__file__).resolve().parents[2] / 'app/scripts/check-shell-vendor.test.mjs'


def _origin(url):
    target = urlsplit(url)
    return {'ws': 'http', 'wss': 'https'}.get(target.scheme, target.scheme), target.netloc


def verify_shell_requests(base, imports, manifest, lock, requests, responses):
    require(set(imports) == set(manifest['imports']), 'Shell import-map specifiers differ from vendor manifest')
    expected = {}
    for specifier, path in imports.items():
        entry = manifest['imports'][specifier]
        pinned = lock['packages']['node_modules/' + entry['package']]
        require(entry['version'] == pinned['version'] and entry['integrity'] == pinned['integrity'],
                'Shell module differs from lockfile: ' + specifier)
        require(path == '/app/app/main/' + entry['file'] and
                path.startswith('/app/app/main/vendor/') and '@' + pinned['version'] + '/' in path,
                'Shell module does not use its versioned instance asset: ' + specifier)
        url = urljoin(base, path)
        expected[specifier] = url
        require(any(request['url'] == url for request in requests), 'Shell module not requested: ' + specifier)
        served = [response for response in responses if response['url'] == url]
        require(served and all(response['status'] == 200 and response['digest'] == manifest['files'][entry['file']]
                               for response in served), 'Shell served asset differs from manifest: ' + specifier)

    # The host injects its bootstrap into HTML; emitted scripts and styles own their dependency requests.
    owned = {urljoin(base, '/app/app/main/' + file) for file in manifest['files']
             if Path(file).suffix in ('.js', '.css')}
    for request in requests:
        initiator = request.get('initiator', {})
        stack = initiator.get('stack', {})
        source = initiator.get('url')
        while not source and stack:
            source = next((frame['url'] for frame in stack.get('callFrames', []) if frame.get('url')), None)
            stack = stack.get('parent', {})
        if source in owned:
            require(_origin(request['url']) == _origin(base),
                    'Shell asset requests third-party resource: ' + request['url'])
    return expected


def _build_copy(source, destination):
    """Copy the source tree without installed packages, caches and the emitted shell bundle."""
    emitted = source / 'app/static/app'
    def ignore(directory, names):
        skipped = {name for name in names if name in ('.git', '.wippy', 'node_modules')}
        skipped.update(name for name in names if Path(directory) / name == emitted)
        return skipped
    shutil.copytree(source, destination, ignore=ignore, symlinks=True)
    return destination


def _stage_private_shell_vendor_test(build):
    require(PRIVATE_SHELL_VENDOR_TEST.is_file(),
            'Private shell vendor contract fixture is absent: ' + str(PRIVATE_SHELL_VENDOR_TEST))
    target = build / 'app/scripts/check-shell-vendor.test.mjs'
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PRIVATE_SHELL_VENDOR_TEST, target)
    return target


def shell_vendor_build(ctx):
    source = Path(ctx.inst.config['source'])
    scratch = Path(ctx.inst.root) / 'temp'
    scratch.mkdir(parents=True, exist_ok=True)
    commands = []
    with tempfile.TemporaryDirectory(prefix='shell-build-', dir=scratch) as directory:
        build = _build_copy(source, Path(directory) / source.name)
        try:
            _stage_private_shell_vendor_test(build)
            for command in (['make', 'install', 'MOD=app-main'],
                            ['make', 'build', 'MOD=app-main'],
                            ['node', '--test', 'app/scripts/check-shell-vendor.test.mjs']):
                result = subprocess.run(command, cwd=build, env=ctx.inst.env,
                                        capture_output=True, text=True, timeout=60)
                commands.append({'command': command, 'code': result.returncode,
                                 'output': result.stdout, 'error': result.stderr})
                require(result.returncode == 0, result.stdout + result.stderr)
        finally:
            ctx.inst.evidence.save('shell-vendor-build', {'commands': commands})


def shell_origin_only(ctx):
    ctx.inst.install('kickside/workflows')
    return _shell_origin_only(ctx, Path(ctx.inst.config['source']))


def _shell_origin_only(ctx, source):
    from scenarios import Context, nav
    from scenarios_core import system
    case = Context(ctx.inst, ctx.browser_session)
    browser = case.browser_check(service_workers='block')
    manifest = json.loads((source / 'app/static/app/main/vendor/manifest.json').read_text())
    lock = json.loads((source / 'app/frontend/applications/main/package-lock.json').read_text())
    requests, console, visited = [], [], []
    observed = []
    upstream_sources = {}
    imports, verified, runtime_maps = {}, {}, []
    cdp = browser.context.new_cdp_session(browser.page)
    cdp.send('Network.enable')
    cdp.on('Network.requestWillBeSent', lambda event: requests.append({
        'url': event['request']['url'], 'frame': event.get('frameId'),
        'document': event.get('documentURL'), 'initiator': event.get('initiator', {})}))
    cdp.on('Network.webSocketCreated', lambda event: requests.append({
        'url': event['url'], 'initiator': event.get('initiator', {})}))
    def finished(request):
        response = request.response()
        require(response is not None, 'Finished browser request has no response: ' + request.url)
        file = urlsplit(response.url).path.removeprefix('/app/app/main/')
        digest = None
        if response.status == 200 and _origin(response.url) == _origin(ctx.inst.base) and file in manifest['files']:
            digest = 'sha256-' + base64.b64encode(hashlib.sha256(response.body()).digest()).decode()
        if response.status == 200 and request.resource_type == 'script' and _origin(response.url) != _origin(ctx.inst.base):
            upstream_sources[response.url] = response.text()
        observed.append({'url': response.url, 'status': response.status, 'digest': digest})

    browser.page.on('requestfinished', finished)
    browser.page.on('console', lambda message: console.append(message.text) if message.type == 'error' else None)
    browser.page.on('pageerror', lambda error: console.append(str(error)))
    try:
        browser.login()
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        browser.settle()
        shell = browser.page.frame(name='wippy:page:app.views:main')
        runtime_maps = shell.evaluate('''() => Array.from(document.querySelectorAll('script[type="importmap"]'),
            script => ({id: script.id, map: JSON.parse(script.textContent)}))''')
        imports = {specifier: '/app/app/main/' + entry['file'] for specifier, entry in manifest['imports'].items()}
        require(set(imports) == set(manifest['imports']), 'Shell import-map specifiers differ from vendor manifest')
        shell.evaluate('''async paths => {
            for (const path of paths) await import(path)
        }''', list(imports.values()))
        pages = [('Dashboard', 'kickside-dashboard'), ('Agents', 'kickside-agents'),
                 ('Knowledge', 'kickside-knowledge'), ('Automations', 'kickside-automation-manager'),
                 ('Inbox', 'kickside-inbox'), ('Workflows', 'kickside-workflow-builder'),
                 ('Settings', 'kickside-settings')]
        for label, tag in pages:
            if label == 'Settings':
                system(case, label)
            else:
                nav(case, label)
            browser.frame.locator(tag).wait_for(state='visible', timeout=30000)
            browser.settle()
            browser.screenshot('origin-only-' + label.lower())
            visited.append(label)
            require(not console, 'Shell console errors: ' + str(console))
            browser.clean(0)
        verified = verify_shell_requests(ctx.inst.base, imports, manifest, lock, requests, observed)
    finally:
        ctx.inst.evidence.save('upstream-script-sources', upstream_sources)
        external = [request for request in requests if _origin(request['url']) != _origin(ctx.inst.base)]
        ctx.inst.evidence.save('origin-only-network', {'pages': visited, 'imports': imports,
            'runtime_import_maps': runtime_maps,
            'served_assets': observed,
            'verified_modules': verified, 'requests': requests, 'upstream_external': external,
            'console': console, 'errors': browser.errors})
        cdp.detach()
        case.close_browser()
