PYTHON ?= python3
PUBLISHED ?= latest
ENGINE ?= both
ARGS ?=

.PHONY: quick full chat list test
quick:
	$(PYTHON) smoke.py --published $(PUBLISHED) --engine $(ENGINE) --tier quick $(ARGS)
full:
	$(PYTHON) smoke.py --published $(PUBLISHED) --engine $(ENGINE) --tier full $(ARGS)
chat:
	$(PYTHON) smoke.py --published $(PUBLISHED) --engine $(ENGINE) --tier chat $(ARGS)
list:
	$(PYTHON) smoke.py --tier full --list
test:
	$(PYTHON) -m unittest -v
