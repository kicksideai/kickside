.PHONY: test
test:
	cd ui && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && ./node_modules/.bin/vitest run --config .smoke/kb10-frontend/vitest.config.ts --maxWorkers=2
