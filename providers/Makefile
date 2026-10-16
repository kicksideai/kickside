export VERSION
# providers monorepo — independent Wippy provider modules co-located in one repo.

MODULES := asr atlassian bitbucket code_execution discord fireflies github gitlab google hubspot kb10 llm-ocr mcp-client memory phantombuster simplefin slack sso-github sso-google sso-microsoft sso-oidc telegram webscout webscout-brave webscout-tavily
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: list build test lint publish dry-run check-release verify-declarations $(MODULES)

list:
	@echo $(MODULES)

build:
	@for module in $(MODULES); do \
		if grep -q '^build:' "$$module/Makefile"; then \
			$(MAKE) -C $$module build || exit $$?; \
		fi; \
	done

lint:
	@for module in $(MODULES); do \
		$(MAKE) -C $$module $@ || exit $$?; \
	done

test: verify-declarations
	@failed=0; \
	for module in $(MODULES); do \
		output="$$( $(MAKE) -C $$module test 2>&1 )"; status=$$?; \
		printf '%s\n' "$$output"; \
		if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found'; then \
			failed=1; \
			break; \
		fi; \
	done; \
	exit $$failed

check-release:
	./scripts/check_release_hygiene.py

publish: check-release
	./release.sh

dry-run: check-release
	./release.sh --dry-run

verify-declarations:
	./scripts/verify_provider_dependencies.sh
	python3 -m unittest discover -s scripts/tests

$(MODULES):
	$(MAKE) -C $@
