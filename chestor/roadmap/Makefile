MODULE := roadmap
TYPE   := plugin
VIS    := public
EMBED  := --embed ui_fs

.PHONY: build dev lint test publish
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint: check-test-support
	cd test && wippy install $(WIPPY_INSTALL_ARGS) $(RUNTIME_ARGS) && wippy lint $(WIPPY_LINT_ARGS) $(RUNTIME_ARGS) --ns 'chestor.$(subst -,_,$(MODULE))' --ns 'chestor.$(subst -,_,$(MODULE)).*' --ns chestor.test_support
test: check-test-support
	cd test && wippy install $(WIPPY_INSTALL_ARGS) $(RUNTIME_ARGS) && wippy test $(WIPPY_TEST_ARGS) $(RUNTIME_ARGS) $(TEST_ARGS)
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: typecheck test-ui
typecheck:
	cd ui && npm run typecheck
test-ui:
	cd ui && npm run test

.PHONY: check-test-support
check-test-support:
	python3 ../scripts/validate-package.py --harness test

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
