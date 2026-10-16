# kickside/automation — `make publish` packs and publishes the module (public).
MODULE := automation
TYPE   := plugin
VIS    := public
EMBED  := --embed ui_fs

.PHONY: build dev publish lint test
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS)
test:
	cd test && bash ./run-tests.sh
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
