# kickside/research — web-component module. The repository release driver
# derives publication metadata and exact embeds from wippy.yaml.

.PHONY: build dev typecheck publish lint test
build:
	cd ui && npm ci && npm run build
dev:
	cd ui && npm run dev
typecheck:
	cd ui && npm ci --include=dev --no-audit --no-fund && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json
lint:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.research' --ns 'kickside.research.*'
test:
	python3 test/check_block_architecture.py
	cd test && wippy test $(WIPPY_TEST_ARGS)
	cd ui && npm ci --include=dev --no-audit --no-fund && npm test
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)

.PHONY: test-ui
test-ui:
	cd ui && npm test -- $(UI_TEST_ARGS)
