PYTHON ?= python3
PUBLISHED ?= latest
SOURCE ?=
REPLACEMENTS ?=
ENGINE ?= both
WORKERS ?= 1
TIER ?= full
ARGS ?=
TEST ?=

DEPLOYMENT = $(if $(strip $(SOURCE)),--source "$(SOURCE)",--published "$(PUBLISHED)")
REPLACE_ARGS = $(foreach replacement,$(REPLACEMENTS),--replace "$(replacement)")
export SOURCE REPLACEMENTS

.PHONY: quick full chat source list test
quick full chat:
	$(PYTHON) smoke.py $(DEPLOYMENT) $(REPLACE_ARGS) --engine $(ENGINE) --tier $@ --workers $(WORKERS) $(ARGS)

# Use prepared checkouts on any branch; never switch, reset or publish them.
# Both engines run concurrently. The runner owns scenario resource isolation.
source: WORKERS = 4
source:
	@test -n "$$SOURCE" || { echo "source needs SOURCE=<kickside-checkout>" >&2; exit 2; }
	@case "$(TIER)" in quick|full|regression|chat) ;; *) echo "invalid TIER=$(TIER)" >&2; exit 2;; esac
	@if [ -f "$(SOURCE)/platform/widgets/ui/package.json" ]; then $(MAKE) -C "$(SOURCE)" typecheck-shared; fi
	$(MAKE) -C "$(SOURCE)/app" build
	@set -e; for replacement in $$REPLACEMENTS; do \
	  directory=$${replacement#*=}; \
	  if [ -f "$$directory/ui/package.json" ]; then $(MAKE) -C "$$directory" build; fi; \
	done
	$(PYTHON) smoke.py --source "$(SOURCE)" $(REPLACE_ARGS) --engine $(ENGINE) --tier $(TIER) --workers $(WORKERS) $(ARGS)
list:
	$(PYTHON) smoke.py --tier full --list
test:
	$(PYTHON) -m unittest -v $(TEST)
