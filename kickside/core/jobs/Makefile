# kickside/jobs — `make publish` packs and publishes the module (public).
MODULE := jobs
TYPE   := library
VIS    := public

.PHONY: publish lint test
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS)
test:
	@database="$$(mktemp "$${TMPDIR:-$$(pwd)/test}/jobs-test.XXXXXXXX.sqlite")" || exit $$?; \
	trap 'rm -f "$$database" "$$database-wal" "$$database-shm"' EXIT; \
	cd test && wippy test --set "vars.sqlite_path=$$database" $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
