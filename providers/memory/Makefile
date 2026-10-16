export VERSION
# kickside/memory — agent memory policies and knowledge-backed capabilities.
MODULE := memory

.PHONY: build dev publish lint test
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint:
	cd test && ./prepare.sh && wippy install $(WIPPY_INSTALL_ARGS) && wippy lint $(WIPPY_LINT_ARGS) --ns app --level error
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
test: test-backend
	cd ui && npm ci && npm test
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-backend test-pg
test-backend:
	cd test && ./prepare.sh && wippy install $(WIPPY_INSTALL_ARGS) && wippy test $(WIPPY_TEST_ARGS)
test-pg:
	cd test && ./prepare.sh && wippy install $(WIPPY_INSTALL_ARGS) && wippy test $(WIPPY_TEST_ARGS) --profile postgres

.PHONY: lockrefresh
lockrefresh:
	bash test/prepare.sh
	cd test && wippy update $(WIPPY_UPDATE_ARGS)

.PHONY: policy-test-prepare
test lint lockrefresh: policy-test-prepare
policy-test-prepare:
	cp src/security/module_access/_index.yaml test/module_access_policy/production.yaml
