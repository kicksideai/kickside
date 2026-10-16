# kickside/users — web-component module. `make publish` builds the bundle and
# publishes the module (public) with the bundle embedded via --embed ui_fs.
MODULE  := users
TYPE    := plugin
VIS     := public
EMBED   := --embed ui_fs

.PHONY: build dev publish lint test
lockrefresh:
	bash test/prepare.sh
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	bash test/prepare.sh
	cd test && wippy lint $(WIPPY_LINT_ARGS)
test:
	bash test/prepare.sh
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
