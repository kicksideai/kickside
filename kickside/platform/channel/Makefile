# kickside/channel — shared external-conversation session runtime + channel surface.
MODULE := channel
CHANNEL_LINT_UPDATE_ARGS ?= --src-dir .
TYPE   := library
VIS    := public
EMBED  := --embed ui_fs

.PHONY: build dev lint test publish
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
dev:
	cd ui && npm run dev
lint:
	cd lint-harness && wippy lint $(CHANNEL_LINT_ARGS)
	cd test && wippy lint $(WIPPY_LINT_ARGS)
test:
	cd test && wippy test $(WIPPY_TEST_ARGS) $(if $(PROFILE),--profile $(PROFILE))
publish: build
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh lockrefresh-test lockrefresh-lint-harness
lockrefresh: policy-test-prepare lockrefresh-test lockrefresh-lint-harness
lockrefresh-test: policy-test-prepare
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
lockrefresh-lint-harness: policy-test-prepare
	cd lint-harness && wippy update $(CHANNEL_LINT_UPDATE_ARGS)

.PHONY: policy-test-prepare
test lint: policy-test-prepare
policy-test-prepare:
	cp src/security/module_access/_index.yaml test/module_access_policy/production.yaml
