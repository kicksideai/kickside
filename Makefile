# kickside FE build interface (unix / CI). Windows uses make.bat -> make.ps1,
# which mirrors these recipes one-for-one.
#
# Usage:
#   make build MOD=inbox           build one module's static bundle
#   make watch MOD=workflows       rebuild one module on source changes
#   make cleaninstall MOD=inbox    wipe node_modules + lockfile, reinstall
#   make install MOD=inbox         npm ci from the committed lockfile
#   make typecheck MOD=inbox       vue-tsc --noEmit (where a tsconfig exists)
#   make build-all                 every FE package
#
# MOD names: app-main, plugin-template, or any platform/<name>.

WIPPY_BIN ?= wippy
TEST_ARGS ?= --maxWorkers=2

# Resolve a module name to its FE package dir; app-main is the page app.
define fe_dir
$(if $(filter app-main app,$(1)),app/frontend/applications/main,$(if $(filter plugin-template,$(1)),app/templates/plugin/ui,platform/$(1)/ui))
endef
# Deployment output belongs to this Make interface, not to Vite config.
define fe_build_args
$(if $(filter app-main app,$(1)),-- --outDir ../../../static/app/main --emptyOutDir,$(if $(filter workflows agents,$(1)),-- --outDir ../static --emptyOutDir,))
endef

# Modules that import @kickside/ui-kit. Their build materializes the package
# first, because it is not in the repo and not on any npm registry - without it
# the build dies on ENOENT for the import. Add a module here when it adopts.
UI_KIT_CONSUMERS := app-main agents automation channel connection hub inbox knowledge mcp models renderers security sessions settings skills transform ui uploads users webhooks widgets workflows
# These modules typecheck source imported from platform/widgets/ui via the
# @widgets path alias. TypeScript resolves that source's bare imports from the
# widgets package directory, so its local dependencies must exist before any
# consumer runs vue-tsc.
WIDGET_SOURCE_CONSUMERS := agents automation channel connection hub identity inbox knowledge mcp models security settings skills sync transform ui uploads users webhooks workflows

FE_MODULES := app-main plugin-template $(patsubst platform/%/ui/package.json,%,$(wildcard platform/*/ui/package.json))

.PHONY: help install build watch cleaninstall lockrefresh typecheck typecheck-shared ui-kit facade-css facade-css-check facade-css-watch install-all build-all cleaninstall-all lockrefresh-all typecheck-all test-all

help:
	@echo "kickside FE build interface"
	@echo "  make install MOD=<m>        npm ci from the committed lockfile"
	@echo "  make build MOD=<m>          install if needed, then build the static bundle"
	@echo "  make watch MOD=<m>          continuously rebuild workflows or agents"
	@echo "  make cleaninstall MOD=<m>   wipe node_modules + lockfile, npm install (fixes broken installs)"
	@echo "  make lockrefresh MOD=<m>    update lock metadata without a clean re-resolution"
	@echo "  make typecheck MOD=<m>      vue-tsc --noEmit (where a tsconfig exists)"
	@echo "  make test MOD=<m>           run the package test script"
	@echo "  make ui-kit MOD=<m>         materialize @kickside/ui-kit into the module"
	@echo "  make facade-css            assemble app/static/*.facade.generated.css from facade-src"
	@echo "  make facade-css-check      verify generated facade CSS is current"
	@echo "  make facade-css-watch      rebuild facade CSS when facade-src changes"
	@echo "  make {install,build,cleaninstall,typecheck,test}-all"
	@echo "  make module-lifecycle-e2e WIPPY_BIN=/path/to/wippy"
	@echo "  make workflow-system-e2e WIPPY_BIN=/path/to/wippy"
	@echo "  MOD names: app-main, plugin-template, or any platform/<name>"

install:
	@test -n "$(MOD)" || { echo "install needs MOD=<module> (or use install-all)"; exit 1; }
	@case " $(UI_KIT_CONSUMERS) " in *" $(MOD) "*) $(MAKE) ui-kit MOD=$(MOD) || exit 1;; esac
	cd $(call fe_dir,$(MOD)) && npm ci --no-audit --no-fund

# Removing the lockfile is what makes it clean: a lock from another platform (or
# before a @wippy-fe/* bump) can omit this platform's optional deps
# (e.g. @rollup/rollup-*-*, npm/cli#4828) so `npm ci` fails. `npm install`
# re-resolves and records all platform optionals.
cleaninstall:
	@test -n "$(MOD)" || { echo "cleaninstall needs MOD=<module> (or use cleaninstall-all)"; exit 1; }
	cd $(call fe_dir,$(MOD)) && rm -rf node_modules package-lock.json && npm install --no-audit --no-fund

lockrefresh:
	@test -n "$(MOD)" || { echo "lockrefresh needs MOD=<module> (or use lockrefresh-all)"; exit 1; }
	cd $(call fe_dir,$(MOD)) && npm install --package-lock-only --ignore-scripts --no-audit --no-fund

build:
	@test -n "$(MOD)" || { echo "build needs MOD=<module> (or use build-all)"; exit 1; }
	@case " $(UI_KIT_CONSUMERS) " in *" $(MOD) "*) $(MAKE) ui-kit MOD=$(MOD) || exit 1;; esac
	cd $(call fe_dir,$(MOD)) && { [ -d node_modules ] || npm install --no-audit --no-fund; } && npm run build $(call fe_build_args,$(MOD))

watch:
	@test -n "$(MOD)" || { echo "watch needs MOD=<module>"; exit 1; }
	@case " workflows agents " in *" $(MOD) "*) ;; *) echo "watch supports only MOD=workflows or MOD=agents"; exit 1;; esac
	cd $(call fe_dir,$(MOD)) && { [ -d node_modules ] || npm install --no-audit --no-fund; } && npm run watch $(call fe_build_args,$(MOD)) $(WATCH_ARGS)

typecheck:
	@test -n "$(MOD)" || { echo "typecheck needs MOD=<module> (or use typecheck-all)"; exit 1; }
	@case " $(WIDGET_SOURCE_CONSUMERS) " in *" $(MOD) "*) $(MAKE) typecheck-shared || exit 1;; esac
	@case " $(UI_KIT_CONSUMERS) " in *" $(MOD) "*) $(MAKE) ui-kit MOD=$(MOD) || exit 1;; esac
	cd $(call fe_dir,$(MOD)) && { [ -f tsconfig.json ] || { echo "  (no tsconfig.json, skipping)"; exit 0; }; } && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json

# Shared source dependencies for consumers of platform/widgets/ui. This is
# deliberately separate from ui-kit materialization: typechecking follows the
# Vue/TypeScript source alias and does not need the CSS-only ui-kit package.
typecheck-shared:
	cd platform/widgets/ui && { [ -d node_modules ] || npm ci --no-audit --no-fund; }

ui-kit:
	@test -n "$(MOD)" || { echo "ui-kit needs MOD=<module>"; exit 1; }
	@set -e; \
	wapp="$(UI_KIT_WAPP)"; \
	if [ -z "$$wapp" ]; then \
	  ( cd build-inputs && $(WIPPY_BIN) update --src-dir src ); \
	  wapp=$$(ls build-inputs/.wippy/vendor/kickside/ui-kit-*.wapp 2>/dev/null | grep -v sha256 | sort | tail -1); \
	fi; \
	test -n "$$wapp" || { echo "no kickside/ui-kit .wapp; is the module published?"; exit 1; }; \
	$(WIPPY_BIN) artifacts materialize "$$wapp" kickside.ui_kit:package_fs --root $(call fe_dir,$(MOD))/.wippy; \
	cd $(call fe_dir,$(MOD)) && node $(CURDIR)/scripts/wire-ui-kit.mjs && npm install --no-audit --no-fund

# Facade CSS assembler (app-level, no node_modules needed): concatenates
# app/facade-src/{custom,children}/*.css into app/static/*.facade.generated.css.
facade-css:
	cd app && node scripts/build-facade-css.mjs

facade-css-check:
	cd app && node scripts/build-facade-css.mjs --check

facade-css-watch:
	cd app && node scripts/build-facade-css.mjs --watch

install-all:
	@for m in $(FE_MODULES); do echo "== install $$m =="; $(MAKE) install MOD=$$m || exit 1; done
build-all: facade-css
	@for m in $(FE_MODULES); do echo "== build $$m =="; $(MAKE) build MOD=$$m || exit 1; done
cleaninstall-all:
	@for m in $(FE_MODULES); do echo "== cleaninstall $$m =="; $(MAKE) cleaninstall MOD=$$m || exit 1; done
lockrefresh-all:
	@for m in $(FE_MODULES); do echo "== lockrefresh $$m =="; $(MAKE) lockrefresh MOD=$$m || exit 1; done
typecheck-all:
	@for m in $(FE_MODULES); do echo "== typecheck $$m =="; $(MAKE) typecheck MOD=$$m || exit 1; done
test-all:
	@for m in $(FE_MODULES); do echo "== test $$m =="; $(MAKE) test MOD=$$m TEST_IF_PRESENT=--if-present || exit 1; done

