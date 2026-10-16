# acme/starter — lint, run the standalone test harness, publish as a private
# plugin. `make publish` builds the bundle and publishes with it embedded.
MODULE := starter
TYPE   := plugin
VIS    := private
EMBED  := --embed ui_fs

.PHONY: build dev lint test publish
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint:
	wippy lint
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish: build
	wippy publish --create --module-visibility $(VIS) --module-type $(TYPE) $(EMBED)

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
