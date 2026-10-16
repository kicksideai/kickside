# kickside/widgets — web-component module. `make publish` builds the bundle and
# publishes the module (public) with the filesystems declared by wippy.yaml.
MODULE  := widgets
TYPE    := plugin
VIS     := public

.PHONY: build dev publish lint
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-backend lint-backend lockrefresh
test-backend:
	bash test/prepare.sh
	cd test && wippy test $(WIPPY_TEST_ARGS)
lint: lint-backend
lint-backend:
	bash test/prepare.sh
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns kickside.widgets --ns "kickside.widgets.*"
lockrefresh:
	bash test/prepare.sh
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
