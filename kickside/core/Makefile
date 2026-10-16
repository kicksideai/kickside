# Core module group. Each subdir is an independently published Wippy module with
# its own wippy.yaml, Makefile, and isolated test harness.

MODULES := $(notdir $(shell find . -mindepth 1 -maxdepth 1 -type d -not -name '.git' -not -name 'scripts'))

.PHONY: list build lint test publish

list:
	@echo $(MODULES)

# Build every module that ships a build target (web-component modules); the rest
# are backend-only and have nothing to build.
build:
	@for m in $(MODULES); do \
		if [ -f $$m/Makefile ] && grep -q '^build:' $$m/Makefile; then \
			echo "== build $$m =="; $(MAKE) -C $$m build || exit 1; \
		fi; \
	done

lint:
	@for m in $(MODULES); do \
		echo "== lint $$m =="; $(MAKE) -C $$m lint || exit 1; \
	done

# Run each module through its standalone test harness (modules with a test/ dir
# that pulls wippy/test). Fails if any suite fails.
test:
	@rc=0; for m in $(MODULES); do \
		if [ -d $$m/test ] && grep -q "wippy/test" $$m/test/wippy.lock 2>/dev/null; then \
			echo "== test $$m =="; $(MAKE) -C $$m test || rc=1; \
		fi; \
	done; exit $$rc

publish:
	@for m in $(MODULES); do \
		if [ -f $$m/Makefile ] && grep -q '^publish:' $$m/Makefile; then \
			echo "== publish $$m =="; $(MAKE) -C $$m publish || exit 1; \
		fi; \
	done
