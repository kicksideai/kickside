# kickside/sso — web-component module. `make publish` builds the bundle and
# publishes the public plugin with the bundle embedded via --embed ui_fs.
MODULE := sso
TYPE   := plugin
VIS    := public
EMBED  := --embed ui_fs

.PHONY: build dev publish lint test
build:
	cd ui && { [ -d node_modules ] || npm install --no-audit --no-fund; } && npm run build
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

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)

.PHONY: test-ui
test-ui:
	cd ui && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npm test -- $(TEST_ARGS)
