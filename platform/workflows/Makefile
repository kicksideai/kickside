# kickside/workflows — web-component + backend module. `make publish` builds the
# builder and Workflow node-editor bundle, then embeds it as ui_fs.
MODULE := workflows
TYPE   := plugin
VIS    := public
EMBED  := --embed ui_fs

.PHONY: build dev watch publish lint test
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	$(MAKE) -C ../.. watch MOD=$(MODULE)
watch: dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
test:
	cd test && ./run-tests.sh
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
