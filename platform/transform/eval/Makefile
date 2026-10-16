# transform-eval — real-LLM eval harness for kickside/transform.
# Standalone evaluation application beside Transform's unit test tree, not a published module.
# Its replacement points at Transform's package root, so app-namespaced eval
# entries cannot be loaded as module source. The suite self-skips without KICKSIDE_INTEGRATION_TESTS
# and a live model.

.PHONY: lint test
lint:
	wippy lint --ns 'app' --ns 'app.*'
test:
	wippy test
