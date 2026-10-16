# kickside/blocks — headless Block contract and durable composition runtime.
MODULE := blocks
TYPE   := plugin
VIS    := public

.PHONY: publish lint test native-wait-restart-proof
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.blocks' --ns 'kickside.blocks.*'
test:
	cd test && mkdir -p .proof
	@output="$$( cd test && wippy test $(WIPPY_TEST_ARGS) 2>&1 )"; status=$$?; \
	printf '%s\n' "$$output"; \
	if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found' || \
		! printf '%s\n' "$$output" | grep -q 'PASSED' || \
		! printf '%s\n' "$$output" | grep -qE '[1-9][0-9]* tests'; then \
		exit 1; \
	fi
native-wait-restart-proof:
	bash test/native-wait-restart-proof.sh
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
