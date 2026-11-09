# kickside/ui-kit — shared frontend vocabulary, published as a build-time
# artifact. There is nothing to build: the package directory is the deliverable,
# and consumers compile its TypeScript and Vue sources with their own toolchain.
# The root package.json only carries the test and typecheck toolchain.
#
# The version in package/package.json must equal the version being published.
# `wippy publish` validates it and refuses a mismatch, so bump both together.
MODULE  := ui-kit
TYPE    := library
VIS     := public

.PHONY: install test typecheck lint publish

install:
	[ -d node_modules ] || npm ci --no-audit --no-fund

test: install
	node --test test/*.test.mjs
	npx --no-install vitest run

typecheck: install
	npx --no-install vue-tsc --noEmit -p tsconfig.json

lint:
	wippy publish --dry-run --version $(shell node -p "require('./package/package.json').version")

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
