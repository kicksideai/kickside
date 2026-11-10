# kickside/contract — `make publish` packs and publishes the module (public).
MODULE := contract
TYPE   := library
VIS    := public
PYTHON ?= python3

.PHONY: publish lint test test-schemas
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
test-schemas:
	$(PYTHON) -m unittest discover -s ../../tests -p test_data_contract_schemas.py
test: test-schemas
	@output="$$( cd test && wippy test $(WIPPY_TEST_ARGS) 2>&1 )"; status=$$?; \
	printf '%s\n' "$$output"; \
	if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found'; then \
		exit 1; \
	fi
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
