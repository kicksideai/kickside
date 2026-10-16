# kickside/renderers — web-component module. `make publish` builds the bundle and
# publishes the module (public) with the bundle embedded via --embed ui_fs.
MODULE  := renderers
TYPE    := plugin
VIS     := public
EMBED   := --embed ui_fs

.PHONY: build dev publish lint test
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0 $(EMBED)
test:
	cd ui && npm test
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-backend lint-backend lockrefresh
test: test-backend
test-backend:
	cd test && wippy test $(WIPPY_TEST_ARGS)
lint: lint-backend
lint-backend:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns kickside.renderers --ns "kickside.renderers.*"
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
