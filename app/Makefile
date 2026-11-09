TYPE := application
VIS := public
EMBED := --embed app:app_fs
WIPPY ?= wippy

.PHONY: build dev lint install-deps refresh-deps build-app-main build-facade-css publish

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

build-app-main:
	$(MAKE) -C .. build MOD=app-main

lint:
	cd frontend/applications/main && npm run type-check

dev:
	cd frontend/applications/main && npm run dev

publish: refresh-deps
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

# Both CI and release publication must build the untracked application page.
# A valid registry pack can otherwise contain only the login/static shell.
VERSION ?= $(shell cat version.txt)
HUB_REGISTRY ?= https://hub.wippy.ai
.PHONY: release-build release-check release-publish release-dependencies
release-dependencies:
	python3 scripts/check-release-dependencies.py --repository .. --wippy "$(WIPPY)"

release-build: build
	node scripts/check-app-bundle.mjs

release-check: release-build
	$(WIPPY) publish --config . --version "$(VERSION)" --registry "$(HUB_REGISTRY)" --dry-run --embed app:app_fs

release-publish: release-build
	@test "$(VERSION)" = "$$(cat version.txt)" || { echo "Use the Release Please application version" >&2; exit 1; }
	@test "$$(git rev-parse HEAD)" = "$$(git rev-parse 'kickside-v$(VERSION)^{commit}')" || { echo "Publish from the exact application release tag" >&2; exit 1; }
	$(WIPPY) publish --config . --version "$(VERSION)" --registry "$(HUB_REGISTRY)" --embed app:app_fs

.PHONY: composition-lockrefresh composition-lint
composition-lockrefresh:
	cd test/composition && $(WIPPY) update --src-dir . --config .wippy.yaml --lock-file wippy.lock.fresh && mv wippy.lock.fresh wippy.lock
COMPOSITION_PYTHON ?= python3
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
