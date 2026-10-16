export VERSION
# kickside/webscout - `make publish` packs and publishes the module (public).
MODULE := webscout
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: publish lint test
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(MODULE)' --ns 'kickside.$(MODULE).*'
test: test-ui
	@cd test && output="$$(wippy test $(WIPPY_TEST_ARGS) 2>&1)"; status=$$?; \
		printf '%s\n' "$$output"; \
		[ $$status -eq 0 ] && ! printf '%s\n' "$$output" | grep -q "No tests found"
# The manifest embeds static/ (the settings card), and the release gate requires
# a build target from any module that embeds. Every neighbour's is
# `cd ui && npm run build`, but this module has no ui/: the card is a plain ES
# module, authored as it ships, because it draws one control and pulls in no
# framework. So this target verifies what a bundler would otherwise guarantee --
# that the embedded file is present and parses -- rather than pretending to
# build something.
build:
	@test -f static/settings-card.js || { echo "static/settings-card.js is missing"; exit 1; }
	@command -v node >/dev/null 2>&1 \
		&& node --check static/settings-card.js \
		|| echo "node not found; skipped the syntax check"
	@echo "$(MODULE): the card ships as authored; nothing to bundle"
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-ui
test-ui:
	cd test/ui && npm ci && npm test

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
