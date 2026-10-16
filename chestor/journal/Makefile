MODULE := journal
TYPE   := plugin
VIS    := public
EMBED  := --embed ui_fs
.PHONY: build dev lint test local publish
build:
	cd ui && npm install && npm run build
	cd test && wippy install $(WIPPY_INSTALL_ARGS) $(RUNTIME_ARGS) && wippy lint $(WIPPY_LINT_ARGS) $(RUNTIME_ARGS) --ns 'chestor.$(subst -,_,$(MODULE))' --ns 'chestor.$(subst -,_,$(MODULE)).*'
dev:
	cd ui && npm run dev
lint:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) $(RUNTIME_ARGS) && wippy lint $(WIPPY_LINT_ARGS) $(RUNTIME_ARGS) --ns 'chestor.$(subst -,_,$(MODULE))' --ns 'chestor.$(subst -,_,$(MODULE)).*'
test:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) $(RUNTIME_ARGS) && wippy test $(WIPPY_TEST_ARGS) $(RUNTIME_ARGS) $(TEST_ARGS)
local:
	$(MAKE) build
	cd local && wippy install $(WIPPY_INSTALL_ARGS) && wippy run -c
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: typecheck test-ui
typecheck:
	cd ui && npm run typecheck
test-ui:
	cd ui && npm run test

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
