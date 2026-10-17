TYPE := application
VIS := public
EMBED := --embed app:app_fs
WIPPY ?= wippy

.PHONY: build dev run lint install-deps refresh-deps preboot-check build-app-main build-facade-css publish

build: build-app-main build-facade-css

# Facade CSS assembler: concatenates facade-src/{custom,children}/*.css into
# static/*.facade.generated.css (committed and checked for generated-source drift).
build-facade-css:
	node scripts/build-facade-css.mjs

# Static registry route-pattern gate. Catches http.endpoint path collisions
# (e.g. a static /components/by-tag/{tag} route crossed with a dynamic
# /components/{id}/{action} route) that registry.commit
# rejects at boot but `wippy lint` does not. Run before any cold-boot/deploy.
install-deps:
	npm ci --no-audit --no-fund
	$(WIPPY) install

refresh-deps:
	@if [ -f wippy.lock ]; then \
		$(WIPPY) update; \
	else \
		$(WIPPY) init --src-dir ./src --modules-dir .wippy; \
		$(WIPPY) update; \
	fi
	$(WIPPY) install

preboot-check: install-deps
	node scripts/check-wiki-sources.mjs
	PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_dependency_pins.py --app-dir .
	PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_dependency_parameter_ownership.py --app-dir . --wippy "$(WIPPY)"
	PYTHONDONTWRITEBYTECODE=1 python3 scripts/check_runtime_profiles.py
	PYTHONDONTWRITEBYTECODE=1 python3 test/test_postgres_history.py
	PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_wippy_routes.py --app-dir .
	PYTHONDONTWRITEBYTECODE=1 python3 ../scripts/check-release-hygiene.py --root ..

build-app-main:
	$(MAKE) -C .. build MOD=app-main

lint:
	cd frontend/applications/main && npm run type-check

dev:
	cd frontend/applications/main && npm run dev

run: preboot-check build
	@set -a; [ ! -f .env ] || . ./.env; set +a; exec $(WIPPY) run -c

# Publish the app as the kickside/kickside application module. The built SPA
# bundle (app_fs -> ./static) is embedded so a hub run serves the UI without a
# local checkout. The publisher selects the next Hub version; wippy.yaml does
# not persist a release version.
publish: refresh-deps
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: composition-lockrefresh composition-test composition-lint
composition-lockrefresh:
	cd test/composition && $(WIPPY) update --src-dir . --config .wippy.yaml --lock-file wippy.lock.fresh && mv wippy.lock.fresh wippy.lock
COMPOSITION_PYTHON ?= python3
composition-test:
	$(COMPOSITION_PYTHON) test/test_branding_binding.py
	cd test/composition && $(WIPPY) test --config .wippy.yaml $(TEST_ARGS)
composition-lint:
	cd test/composition && $(WIPPY) lint --config .wippy.yaml

.PHONY: lockrefresh test-backend lint-backend
lockrefresh:
	bash test/prepare.sh
	cd test && $(WIPPY) update --src-dir src $(WIPPY_UPDATE_ARGS)
test-backend:
	bash test/prepare.sh
	cd test && $(WIPPY) test $(WIPPY_TEST_ARGS)
lint-backend:
	bash test/prepare.sh
	cd test && $(WIPPY) lint $(WIPPY_LINT_ARGS)
