.PHONY: build dev typecheck test test-ui lint setup lockrefresh
build:
	cd ui && npm ci --include=dev --no-audit --no-fund && npm run build
dev:
	cd ui && npm run dev
typecheck:
	cd ui && npm ci --include=dev --no-audit --no-fund && ./node_modules/.bin/vue-tsc --noEmit -p tsconfig.json
test-ui: build
	cd ui && npm test -- --maxWorkers=2
setup:
	cd test && wippy update --src-dir . && wippy install $(WIPPY_INSTALL_ARGS)
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.agent_onboarding' --ns 'kickside.agent_onboarding.*'
test:
	python3 test/test_package_contract.py
	cd test && wippy test $(WIPPY_TEST_ARGS)

lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
	cd ui && npm install --package-lock-only --include=dev --no-audit --no-fund
