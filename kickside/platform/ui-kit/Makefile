# kickside/ui-kit — shared frontend vocabulary, published as a build-time
# artifact. There is nothing to build: the package directory is the deliverable.
#
# The version in package/package.json must equal the version being published.
# `wippy publish` validates it and refuses a mismatch, so bump both together.
MODULE  := ui-kit
TYPE    := library
VIS     := public

.PHONY: test lint publish

test:
	node --test test/*.test.mjs

lint:
	wippy publish --dry-run --version $(shell node -p "require('./package/package.json').version")

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
