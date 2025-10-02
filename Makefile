FOUNDRY_SCRIPT ?= script/deploy/DeployAll.s.sol:DeployAll
RPC_URL ?=
PRIVATE_KEY_ENV ?= PRIVATE_KEY
FORGE_FLAGS ?=

.PHONY: build
build:
	forge build $(FORGE_FLAGS)

.PHONY: test
test:
	forge test $(FORGE_FLAGS)

.PHONY: deploy
deploy:
	@if [ -z "$(RPC_URL)" ]; then echo "RPC_URL is required"; exit 1; fi
	@if ! printenv $(PRIVATE_KEY_ENV) >/dev/null; then echo "$(PRIVATE_KEY_ENV) env variable is required"; exit 1; fi
	forge script $(FOUNDRY_SCRIPT) --rpc-url $(RPC_URL) --private-key-env $(PRIVATE_KEY_ENV) --broadcast $(FORGE_FLAGS)

.PHONY: deploy-dry-run
deploy-dry-run:
	@if [ -z "$(RPC_URL)" ]; then echo "RPC_URL is required"; exit 1; fi
	@if ! printenv $(PRIVATE_KEY_ENV) >/dev/null; then echo "$(PRIVATE_KEY_ENV) env variable is required"; exit 1; fi
	forge script $(FOUNDRY_SCRIPT) --rpc-url $(RPC_URL) --private-key-env $(PRIVATE_KEY_ENV) $(FORGE_FLAGS)

.PHONY: deploy-anvil
deploy-anvil:
	@if ! printenv $(PRIVATE_KEY_ENV) >/dev/null; then echo "$(PRIVATE_KEY_ENV) env variable is required"; exit 1; fi
	forge script $(FOUNDRY_SCRIPT) --rpc-url http://127.0.0.1:8545 --private-key-env $(PRIVATE_KEY_ENV) --broadcast $(FORGE_FLAGS)
