# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
MODULE := jobs-admin
TYPE := plugin
VIS := public
EMBED := --embed kickside.jobs_admin:ui_fs

.PHONY: build install lint test ui-test lockrefresh publish
build:
	$(MAKE) -C ../.. build MOD=$(MODULE)
install:
	$(MAKE) -C ../.. install MOD=$(MODULE)
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns kickside.jobs_admin --ns 'kickside.jobs_admin.*'
test:
	@database="$$(mktemp "$${TMPDIR:-$$(pwd)/test}/jobs-admin.XXXXXXXX.sqlite")" || exit $$?; \
	trap 'rm -f "$$database" "$$database-wal" "$$database-shm"' EXIT; \
	cd test && wippy test --set "vars.sqlite_path=$$database" $(WIPPY_TEST_ARGS)
ui-test:
	cd ui && npm test
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
