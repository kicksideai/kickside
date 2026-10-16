export VERSION
# kickside/kb10 — `make publish` packs and publishes the module (public).
MODULE := kb10
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY
PYTHON ?= python3

.PHONY: build dev publish lint test
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*' --ns app --ns 'app.*'
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-ui typecheck-ui
test-ui:
	cd ui && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npm test -- $(TEST_ARGS)
typecheck-ui:
	cd ui && ./node_modules/.bin/vue-tsc --noEmit

.PHONY: test-ui-layout
test-ui-layout:
	$(PYTHON) -m unittest discover -s ui/tests -p test_drawer_deadline.py
	$(PYTHON) ui/tests/drawer_layout_test.py

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
