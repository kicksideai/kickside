# kickside/self-reflection — optional backend-only agent trait package.
MODULE := self-reflection
TYPE   := plugin
VIS    := public

.PHONY: publish lint test
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
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh one-scope-test
lockrefresh:
	cd test && wippy update --src-dir . $(WIPPY_CONFIG) --lock-file wippy.lock.fresh && mv wippy.lock.fresh wippy.lock
	cd one-scope-test && wippy update --src-dir . --config .wippy.yaml --lock-file wippy.lock.fresh && mv wippy.lock.fresh wippy.lock
one-scope-test:
	cd one-scope-test && wippy test --config .wippy.yaml $(WIPPY_TEST_ARGS)
.PHONY:
