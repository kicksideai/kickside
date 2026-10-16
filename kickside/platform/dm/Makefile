# kickside/dm — inbound external DMs onto private, user-owned agent-chat threads.
MODULE := dm
TYPE   := plugin
VIS    := public

.PHONY: lint test publish
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS)
test:
	@output="$$( cd test && wippy test $(WIPPY_TEST_ARGS) $(if $(PROFILE),--profile $(PROFILE)) 2>&1 )"; status=$$?; \
	printf '%s\n' "$$output"; \
	if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found' || \
		! printf '%s\n' "$$output" | grep -q 'PASSED' || \
		! printf '%s\n' "$$output" | grep -qE '[1-9][0-9]* tests'; then \
		exit 1; \
	fi
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)

.PHONY: policy-test-prepare
test lint lockrefresh: policy-test-prepare
policy-test-prepare:
	cp src/security/module_access/_index.yaml test/module_access_policy/production.yaml
