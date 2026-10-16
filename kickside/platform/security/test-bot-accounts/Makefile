.PHONY: lockrefresh test lint
lockrefresh:
	wippy update $(WIPPY_UPDATE_ARGS)
test:
	@output="$$( wippy test $(WIPPY_TEST_ARGS) 2>&1 )"; status=$$?; \
	printf '%s\n' "$$output"; \
	if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found|No tests match' || \
		! printf '%s\n' "$$output" | grep -q 'PASSED' || \
		! printf '%s\n' "$$output" | grep -qE '[1-9][0-9]* tests'; then \
		exit 1; \
	fi
lint:
	wippy lint $(WIPPY_LINT_ARGS)
