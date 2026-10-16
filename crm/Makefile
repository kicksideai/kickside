.PHONY: build check-deps check-architecture lint test test-postgres verify dry-run publish
# Every CRM surface lives in ui/src and builds with the standard Wippy Vue
# toolchain into the checked-in static package artifacts.
build:
	cd ui && npm ci && npm run typecheck && npm test && npm run build
lint: check-deps check-architecture
	cd test && ./prepare.sh && wippy install $(WIPPY_INSTALL_ARGS) && wippy lint $(WIPPY_LINT_ARGS) --ns app --ns 'app.*' --ns kickside.crm --ns kickside.crm.api --ns kickside.crm.binding --ns kickside.crm.blocks --ns kickside.crm.command --ns kickside.crm.domain --ns kickside.crm.events --ns kickside.crm.migrations --ns kickside.crm.persist --ns kickside.crm.ports --ns kickside.crm.read --ns kickside.crm.registry --ns kickside.crm.resolution --ns kickside.crm.schema --ns kickside.crm.security --ns kickside.crm.service --ns kickside.crm.sink --ns kickside.crm.surface --ns kickside.crm.traits --ns kickside.crm.ui --ns kickside.crm.workspace --level error
test: check-architecture
	cd test && ./run.sh $(WIPPY_TEST_ARGS)
check-deps:
	./scripts/check_dependency_versions.sh
	! grep -q '^version:' wippy.yaml || { echo 'wippy.yaml must not pin a release version; Hub selects the next version'; exit 1; }
check-architecture:
	python3 scripts/check_flow_architecture.py
# The same suite the sqlite target runs, against the postgres backend the
# harness declares as a profile. One tree, one set of tests, both dialects.
test-postgres: check-architecture
	cd test && ./run.sh $(WIPPY_TEST_ARGS) --profile postgres

.PHONY: lockrefresh
lockrefresh:
	cd test && ./prepare.sh && wippy update $(WIPPY_UPDATE_ARGS)
verify: build lint test test-postgres
dry-run:
	./release.sh --dry-run
publish: check-deps check-architecture
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
