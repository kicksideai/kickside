# kickside/dashboard — web-component module. The repository release driver
# derives publication metadata (visibility, type, embeds) from wippy.yaml.

.PHONY: build dev typecheck publish lint test
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
typecheck:
	cd ui && npm ci --include=dev --no-audit --no-fund && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json
lint:
	wippy lint $(WIPPY_LINT_ARGS)
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
