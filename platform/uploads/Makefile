# kickside/uploads — web-component module. `make publish` builds the bundle and
# publishes the module (public) with the bundle embedded via --embed ui_fs.
MODULE  := uploads
TYPE    := plugin
VIS     := public
EMBED   := --embed ui_fs

.PHONY: build dev publish lint test
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	bash test/prepare.sh
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
test:
	bash test/prepare.sh
	@database="$$(mktemp "$${TMPDIR:-$$(pwd)/test}/uploads-test.XXXXXXXX.sqlite")" || exit $$?; \
	trap 'rm -f "$$database" "$$database-wal" "$$database-shm"' EXIT; \
	output="$$( cd test && wippy test --set "vars.sqlite_path=$$database" $(WIPPY_TEST_ARGS) 2>&1 )"; status=$$?; \
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
	bash test/prepare.sh
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
