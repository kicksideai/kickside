# kickside/hub — web-component module. `make publish` builds the bundle and
# publishes the module (public) with the bundle embedded via --embed ui_fs.
MODULE := hub
TYPE   := plugin
VIS    := public
EMBED  := --embed ui_fs
UI_TEST_ARGS ?= --maxWorkers=2

.PHONY: build dev publish lint test
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
test:
	@output="$$( cd test && wippy test $(WIPPY_TEST_ARGS) 2>&1 )"; status=$$?; \
	printf '%s\n' "$$output"; \
	if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found' || \
		! printf '%s\n' "$$output" | grep -q 'PASSED' || \
		! printf '%s\n' "$$output" | grep -qE '[1-9][0-9]* tests'; then \
		exit 1; \
	fi
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: typecheck-ui
typecheck-ui:
	cd ui && npm run type-check

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)

.PHONY: test-ui
test-ui:
	cd ui && npm test -- $(UI_TEST_ARGS)
