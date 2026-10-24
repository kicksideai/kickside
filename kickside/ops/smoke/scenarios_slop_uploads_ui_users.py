"""Upload, navigation, credential, and dependency ownership regressions."""
from pathlib import Path
import os
import re
import subprocess

import yaml
from harness import Scenario, require
from module_harness import public_source_overlay, run_focused_module_test, run_focused_app_test


APP_MAIN_PRIVATE_CHECKS = (
    ('Makefile', '.smoke/private-frontend-tests.mk'),
    'app/frontend/applications/main/src/facade-preauth.test.ts',
    'app/frontend/applications/main/src/login-route-contract.test.ts',
    'app/frontend/applications/main/src/theme-vocabulary.test.ts',
)

# These are public app inputs read directly by the staged specs.  Keep the
# source assertion at the app boundary: platform modules remain product source
# copied by the isolated overlay, not private test fixtures.
APP_MAIN_PUBLIC_FILES = (
    'app/frontend/applications/main/vite.config.ts',
    'app/frontend/applications/main/src/test-setup.ts',
    'app/wippy.lock',
    'app/src/app/_index.yaml',
    'app/src/app/deps/_index.yaml',
    'app/src/app/login/_index.yaml',
    'app/src/app/login/login.jet',
    'app/src/app/seo/serve.lua',
    'app/static/css-variables.facade.json',
)


def upload_json(ctx):
    run_focused_module_test(ctx, 'kickside/uploads', 'upload_record_repo_test')


def upload_projection(ctx):
    run_focused_module_test(ctx, 'kickside/uploads', 'uploads_projection_test')


def password_formats(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'password_formats_test')


def session_expiry(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'session_expiry_test')


def theme_source(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'facade_resolver_test')


def declaration_discovery(ctx):
    run_focused_module_test(ctx, "kickside/ui", "ui_discovery_errors_test")
    run_focused_module_test(ctx, "kickside/ui", "shell_access_test")


def navigation_settings(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'nav_settings_error_test')
    run_focused_module_test(ctx, 'kickside/ui', 'nav_seam_test')


def create_view(ctx):
    run_focused_module_test(ctx, 'kickside/widgets', 'create_view_errors_test')


def facade_dependency(ctx):
    root = Path(ctx.inst.config['source'])
    config = yaml.safe_load((root / 'app/.wippy.yaml').read_text())
    for name, profile in [('default', config), *config.get('profiles', {}).items()]:
        require('wippy/facade' not in profile.get('workspace', {}).get('replacements', {}),
                'Facade dependency is replaced in profile ' + name)
    require(not (root / 'app/replacements/wippy-facade-0.6.39').exists(), 'Application contains a retired facade copy')
    run_focused_module_test(ctx, 'kickside/ui', 'dependency_seam_test')
    run_focused_module_test(ctx, 'kickside/ui', 'facade_resolver_test')


def ui_kit_manifest(ctx):
    root = Path(ctx.inst.config['source'])
    environment = dict(os.environ, TMPDIR=str(ctx.inst.root / 'temp'))
    completed = subprocess.run(['node', '--test', 'scripts/wire-ui-kit.test.mjs', 'scripts/build-modules.test.mjs'], cwd=root,
                               env=environment, capture_output=True, text=True, timeout=120)
    ctx.inst.evidence.save('ui-kit-manifest-test', {'code': completed.returncode,
        'output': completed.stdout, 'error': completed.stderr})
    require(completed.returncode == 0, 'UI kit manifest validation writes or accepts an invalid manifest')


def login_theme_config(ctx):
    root = Path(ctx.inst.config["source"])
    subprocess.run(["bash", "app/test/prepare.sh"], cwd=root, check=True, timeout=120)
    run_focused_app_test(ctx, root / "app/test", "login_theme_config_test")


def template_database(ctx):
    run_focused_app_test(ctx, Path(ctx.inst.config['source']) / 'app/templates/plugin/test', 'log_test')


def user_harness_storage(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'credential_readiness_test')
    run_focused_module_test(ctx, 'kickside/users', 'session_invalidation_race_test')


def app_ui_contracts(ctx):
    source = Path(ctx.inst.config['source']).resolve()
    command = ['make', '-f', '.smoke/private-frontend-tests.mk', 'test', 'MOD=app-main',
               'FE_TEST_COMMAND=./node_modules/.bin/vitest run',
               'TEST_ARGS=src/facade-preauth.test.ts src/login-route-contract.test.ts '
               'src/theme-vocabulary.test.ts --maxWorkers=2']
    environment = dict(ctx.inst.env, PATH=str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH'])
    with public_source_overlay(ctx, APP_MAIN_PRIVATE_CHECKS) as root:
        for relative in APP_MAIN_PUBLIC_FILES:
            selected = source / relative
            exercised = root / relative
            require(selected.is_file() and exercised.is_file() and selected.read_bytes() == exercised.read_bytes(),
                    'App UI guard must exercise the selected public app source: ' + relative)
        result = subprocess.run(command, cwd=root, env=environment,
                                capture_output=True, text=True, timeout=900)
        ctx.inst.evidence.save('app-ui-contracts', {
            'command': command, 'code': result.returncode,
            'output': result.stdout, 'error': result.stderr,
        })
        plain = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', result.stdout)
        summaries = re.findall(r'^\s*Tests\s+(.+)$', plain, re.M)
        passing = bool(summaries) and all(re.fullmatch(r'([1-9][0-9]*) passed\s+\(\1\)', summary.strip())
                                          for summary in summaries)
        require(result.returncode == 0 and passing,
                'App UI contracts fail: ' + result.stdout + result.stderr)


REGISTRY = [
    Scenario('app_ui_contracts', 'regression', app_ui_contracts,
             issues=('APP-UI-PUBLISHED-FACADE-GUARD', 'APP-UI-LOGIN-ROUTE-GUARD',
                     'SETTINGS-NOTICES-THEME-RADIUS')),
    Scenario("slop_login_theme_config", "regression", login_theme_config, issues=("DESIGN-LOGIN-THEME-CONFIG",)),
    Scenario('slop_ui_declaration_discovery', 'regression', declaration_discovery, issues=('DESIGN-UI-DECLARATION-DISCOVERY',)),
    Scenario('slop_template_database_owner', 'regression', template_database, issues=('DESIGN-TEMPLATE-DATABASE-OWNER', 'TEMPLATE-HARNESS-TEST-DEPENDENCY')),
    Scenario('slop_user_harness_storage', 'regression', user_harness_storage, issues=('USER-HARNESS-UPLOAD-STORAGE-BINDING',)),
    Scenario('slop_upload_persisted_json', 'regression', upload_json, issues=('DESIGN-UPLOAD-PERSISTED-JSON',)),
    Scenario('slop_upload_projection_owner', 'regression', upload_projection, issues=('DESIGN-UPLOAD-PROJECTION-OWNER',)),
    Scenario('slop_user_password_formats', 'regression', password_formats, issues=('DESIGN-USER-PASSWORD-FORMATS',)),
    Scenario('slop_user_session_expiry', 'regression', session_expiry, issues=('DESIGN-USER-SESSION-EXPIRY',)),
    Scenario('slop_ui_theme_source', 'regression', theme_source, issues=('DESIGN-UI-THEME-SOURCE',)),
    Scenario('slop_ui_navigation_settings', 'regression', navigation_settings, issues=('DESIGN-UI-NAV-SETTINGS',)),
    Scenario('slop_widget_create_view_errors', 'regression', create_view, issues=('DESIGN-WIDGET-CREATE-VIEW-ERROR',)),
    Scenario('slop_app_facade_dependency', 'regression', facade_dependency, issues=('DESIGN-APP-FACADE-OWNER',)),
    Scenario('slop_ui_kit_manifest', 'regression', ui_kit_manifest, issues=('DESIGN-UI-KIT-MANIFEST-WRITES', 'BUILD-MODULE-SEED-OWNERSHIP')),
]
