# Root automation for the DID smart-contract stack
ifneq (,$(wildcard .env))
	include .env
	export
endif

FORGE ?= forge
PYTHON ?= python3

LOCAL_RPC_URL ?= http://127.0.0.1:8545
SEPOLIA_CHAIN_ID := 11155111
SEPOLIA_BROADCAST := broadcast/DeployAll.s.sol/$(SEPOLIA_CHAIN_ID)/run-latest.json
PARSE_BROADCAST := $(PYTHON) tools/parse_broadcast.py

# Default RPC selection: fall back to SEPOLIA_RPC_URL if RPC_URL is empty
ifeq ($(strip $(RPC_URL)),)
	ifneq ($(strip $(SEPOLIA_RPC_URL)),)
		RPC_URL := $(SEPOLIA_RPC_URL)
	endif
endif

# Warn if the RPC mistakenly targets https localhost
ifneq (,$(findstring https://127.0.0.1,$(RPC_URL)))
	$(warning RPC_URL uses https://127.0.0.1; use $(LOCAL_RPC_URL) instead)
endif

BUILD_FLAGS ?=
SIM_FLAGS := --rpc-url $(RPC_URL) -vvvv
SIM_FLAGS_LOCAL := --rpc-url $(LOCAL_RPC_URL) -vvvv

# Conditional Blockscout verification flags
ifeq ($(strip $(BLOCKSCOUT_VERIFIER)),)
	VERIFY_FLAGS :=
else
	VERIFY_FLAGS := --verify --verifier blockscout --verifier-url $(BLOCKSCOUT_VERIFIER)
endif

BROADCAST_FLAGS := --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) $(VERIFY_FLAGS) --broadcast -vvvv
SIM_FLAGS_SEPOLIA := --rpc-url $(SEPOLIA_RPC_URL) -vvvv
BROADCAST_FLAGS_SEPOLIA := --rpc-url $(SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY) $(VERIFY_FLAGS) --broadcast -vvvv

FRONTEND_DIR := tools/frontend
PIPELINE_DIR := tools/identity-pipeline
ZK_DIR := tools/zk-circuits

define require_sepolia_rpc
	@if [ -z "$(SEPOLIA_RPC_URL)" ]; then \
		echo "ERROR: SEPOLIA_RPC_URL is empty. Set SEPOLIA_RPC_URL in your environment."; \
		exit 2; \
	fi
endef

define require_file
	@if [ ! -f "$(1)" ]; then \
		echo "ERROR: $(1) not found. $(2)"; \
		exit 2; \
	fi
endef

.PHONY: build test test-gas test-fuzz clean fmt \
	deploy-core simulate-core simulate-core-local \
	deploy-complete simulate-complete \
	deploy-umbrella simulate-umbrella \
	deploy-accounts simulate-accounts \
	deploy-zk simulate-zk simulate-zk-local zk-wire-existing \
	deploy-age-verifier deploy-age-max-verifier deploy-attr-verifier deploy-income-verifier deploy-all-verifiers \
	deploy-core-sepolia simulate-core-sepolia \
	deploy-zk-sepolia simulate-zk-sepolia \
	roles-bootstrap roles-grant-logger \
	identity-register identity-set-metadata \
	roles-bootstrap-sepolia roles-grant-logger-sepolia simulate-roles-bootstrap-sepolia simulate-roles-grant-logger-sepolia \
	identity-register-sepolia identity-set-metadata-sepolia \
	simulate-identity-register-sepolia simulate-identity-set-metadata-sepolia \
	deploy-sepolia-full simulate-sepolia-full \
	run-user-interactions show-zk-addresses \
	frontend-install frontend-build frontend-lint \
	identity-pipeline-install identity-pipeline-run \
	zk-compile zk-clean \
	anvil help

# ------------------------------
# Build & Test
# ------------------------------
build:
	@$(FORGE) build $(BUILD_FLAGS)

test:
	@$(FORGE) test -vvv

test-gas:
	@$(FORGE) test --gas-report -vvv

test-fuzz:
	@if [ -z "$(RPC_URL)" ]; then \
		echo "ERROR: RPC_URL (or SEPOLIA_RPC_URL) must be set for fork fuzzing."; \
		exit 2; \
	fi; \
	$(FORGE) test --fork-url $(RPC_URL) -vvv

clean:
	@$(FORGE) clean

fmt:
	@$(FORGE) fmt

# ------------------------------
# Deploy: Core Bundles
# ------------------------------
deploy-core:
	@$(FORGE) script script/deploy/DeployAll.s.sol:DeployAll $(BROADCAST_FLAGS)

simulate-core:
	@$(FORGE) script script/deploy/DeployAll.s.sol:DeployAll $(SIM_FLAGS)

simulate-core-local:
	@RPC_URL=$(LOCAL_RPC_URL) $(FORGE) script script/deploy/DeployAll.s.sol:DeployAll $(SIM_FLAGS_LOCAL)

deploy-complete:
	@$(FORGE) script script/deploy/DeployComplete.s.sol:DeployComplete $(BROADCAST_FLAGS)

simulate-complete:
	@$(FORGE) script script/deploy/DeployComplete.s.sol:DeployComplete $(SIM_FLAGS)

deploy-umbrella:
	@$(FORGE) script script/deploy/DeployUmbrella.s.sol:DeployUmbrella $(BROADCAST_FLAGS)

simulate-umbrella:
	@$(FORGE) script script/deploy/DeployUmbrella.s.sol:DeployUmbrella $(SIM_FLAGS)

deploy-accounts:
	@$(FORGE) script script/deploy/DeployAccountsAndBundler.s.sol:DeployAccountsAndBundler $(BROADCAST_FLAGS)

simulate-accounts:
	@$(FORGE) script script/deploy/DeployAccountsAndBundler.s.sol:DeployAccountsAndBundler $(SIM_FLAGS)

# ------------------------------
# Deploy: ZK Stack
# ------------------------------
deploy-zk:
	@$(FORGE) script script/zk/DeployAndWireZK.s.sol:DeployAndWireZK $(BROADCAST_FLAGS)

simulate-zk:
	@$(FORGE) script script/zk/DeployAndWireZK.s.sol:DeployAndWireZK $(SIM_FLAGS)

simulate-zk-local:
	@SKIP_DEVOPS_LOOKUP=1 $(FORGE) script script/zk/DeployAndWireZK.s.sol:DeployAndWireZK $(SIM_FLAGS_LOCAL)

zk-wire-existing:
	@$(FORGE) script script/zk/DeployZK.s.sol:DeployZK $(BROADCAST_FLAGS)

deploy-age-verifier:
	@$(FORGE) script script/zk/DeployAgeVerifier.s.sol:DeployAgeVerifier $(BROADCAST_FLAGS)

deploy-age-max-verifier:
	@$(FORGE) script script/zk/DeployAgeMaxVerifier.s.sol:DeployAgeMaxVerifier $(BROADCAST_FLAGS)

deploy-attr-verifier:
	@$(FORGE) script script/zk/DeployAttrVerifier.s.sol:DeployAttrVerifier $(BROADCAST_FLAGS)

deploy-income-verifier:
	@$(FORGE) script script/zk/DeployIncomeVerifier.s.sol:DeployIncomeVerifier $(BROADCAST_FLAGS)

deploy-all-verifiers:
	@$(MAKE) --no-print-directory deploy-age-verifier
	@$(MAKE) --no-print-directory deploy-attr-verifier
	@$(MAKE) --no-print-directory deploy-income-verifier
	@$(MAKE) --no-print-directory deploy-age-max-verifier

# ------------------------------
# Roles & Identity (generic)
# ------------------------------
roles-bootstrap:
	@$(FORGE) script script/roles/BootstrapRoles.s.sol:BootstrapRoles $(BROADCAST_FLAGS)

roles-grant-logger:
	@$(FORGE) script script/roles/GrantLoggerRole.s.sol:GrantLoggerRole $(BROADCAST_FLAGS)

identity-register:
	@$(FORGE) script script/identity/RegisterIdentity.s.sol:RegisterIdentity $(BROADCAST_FLAGS)

identity-set-metadata:
	@if [ -z "$(IDENTITY_METADATA_URI)" ]; then \
		echo "ERROR: Set IDENTITY_METADATA_URI before running identity-set-metadata."; \
		exit 2; \
	fi; \
	$(FORGE) script script/identity/SetIdentityMetadata.s.sol:SetIdentityMetadata $(BROADCAST_FLAGS)

# ------------------------------
# Sepolia Helpers
# ------------------------------
deploy-core-sepolia:
	$(call require_sepolia_rpc)
	@$(FORGE) script script/deploy/DeployAll.s.sol:DeployAll $(BROADCAST_FLAGS_SEPOLIA)

simulate-core-sepolia:
	$(call require_sepolia_rpc)
	@$(FORGE) script script/deploy/DeployAll.s.sol:DeployAll $(SIM_FLAGS_SEPOLIA)

deploy-zk-sepolia:
	$(call require_sepolia_rpc)
	@SKIP_DEVOPS_LOOKUP=1 $(FORGE) script script/zk/DeployAndWireZK.s.sol:DeployAndWireZK $(BROADCAST_FLAGS_SEPOLIA)

simulate-zk-sepolia:
	$(call require_sepolia_rpc)
	@SKIP_DEVOPS_LOOKUP=1 $(FORGE) script script/zk/DeployAndWireZK.s.sol:DeployAndWireZK $(SIM_FLAGS_SEPOLIA)

roles-bootstrap-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia first.)
	@TS_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" TrustScore); \
	REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$TS_ADDR" ] || [ "$$TS_ADDR" = "null" ] || [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve TrustScore/UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	echo "Granting SCORE_MANAGER_ROLE on $$TS_ADDR to $$REG_ADDR"; \
	SKIP_DEVOPS_LOOKUP=1 TRUST_SCORE_ADDRESS=$$TS_ADDR REGISTRY_ADDRESS=$$REG_ADDR $(FORGE) script script/roles/BootstrapRoles.s.sol:BootstrapRoles $(BROADCAST_FLAGS_SEPOLIA)

simulate-roles-bootstrap-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia or simulate-core-sepolia first.)
	@TS_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" TrustScore); \
	REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$TS_ADDR" ] || [ "$$TS_ADDR" = "null" ] || [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve TrustScore/UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	SKIP_DEVOPS_LOOKUP=1 TRUST_SCORE_ADDRESS=$$TS_ADDR REGISTRY_ADDRESS=$$REG_ADDR $(FORGE) script script/roles/BootstrapRoles.s.sol:BootstrapRoles $(SIM_FLAGS_SEPOLIA)

roles-grant-logger-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia first.)
	@LOG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" VerificationLogger); \
	TS_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" TrustScore); \
	REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$LOG_ADDR" ] || [ "$$LOG_ADDR" = "null" ] || [ -z "$$TS_ADDR" ] || [ "$$TS_ADDR" = "null" ] || [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve required addresses from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	echo "Granting LOGGER_ROLE on $$LOG_ADDR to $$TS_ADDR and $$REG_ADDR"; \
	SKIP_DEVOPS_LOOKUP=1 LOGGER_ADDRESS=$$LOG_ADDR GRANTEE_ADDRESS=$$TS_ADDR $(FORGE) script script/roles/GrantLoggerRole.s.sol:GrantLoggerRole $(BROADCAST_FLAGS_SEPOLIA) && \
	SKIP_DEVOPS_LOOKUP=1 LOGGER_ADDRESS=$$LOG_ADDR GRANTEE_ADDRESS=$$REG_ADDR $(FORGE) script script/roles/GrantLoggerRole.s.sol:GrantLoggerRole $(BROADCAST_FLAGS_SEPOLIA)

simulate-roles-grant-logger-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia or simulate-core-sepolia first.)
	@LOG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" VerificationLogger); \
	TS_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" TrustScore); \
	REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$LOG_ADDR" ] || [ "$$LOG_ADDR" = "null" ] || [ -z "$$TS_ADDR" ] || [ "$$TS_ADDR" = "null" ] || [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve required addresses from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	echo "[SIM] Would grant LOGGER_ROLE on $$LOG_ADDR to $$TS_ADDR and $$REG_ADDR"; \
	SKIP_DEVOPS_LOOKUP=1 LOGGER_ADDRESS=$$LOG_ADDR GRANTEE_ADDRESS=$$TS_ADDR $(FORGE) script script/roles/GrantLoggerRole.s.sol:GrantLoggerRole $(SIM_FLAGS_SEPOLIA) && \
	SKIP_DEVOPS_LOOKUP=1 LOGGER_ADDRESS=$$LOG_ADDR GRANTEE_ADDRESS=$$REG_ADDR $(FORGE) script script/roles/GrantLoggerRole.s.sol:GrantLoggerRole $(SIM_FLAGS_SEPOLIA)

identity-register-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia first.)
	@REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	SKIP_DEVOPS_LOOKUP=1 REGISTRY_ADDRESS=$$REG_ADDR $(FORGE) script script/identity/RegisterIdentity.s.sol:RegisterIdentity $(BROADCAST_FLAGS_SEPOLIA)

simulate-identity-register-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia or simulate-core-sepolia first.)
	@REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	SKIP_DEVOPS_LOOKUP=1 REGISTRY_ADDRESS=$$REG_ADDR $(FORGE) script script/identity/RegisterIdentity.s.sol:RegisterIdentity $(SIM_FLAGS_SEPOLIA)

identity-set-metadata-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia first.)
	@REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	URI=$${IDENTITY_METADATA_URI:-ipfs://example-demo}; \
	SKIP_DEVOPS_LOOKUP=1 REGISTRY_ADDRESS=$$REG_ADDR IDENTITY_METADATA_URI=$$URI $(FORGE) script script/identity/SetIdentityMetadata.s.sol:SetIdentityMetadata $(BROADCAST_FLAGS_SEPOLIA)

simulate-identity-set-metadata-sepolia:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia or simulate-core-sepolia first.)
	@REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	URI=$${IDENTITY_METADATA_URI:-ipfs://example-demo}; \
	SKIP_DEVOPS_LOOKUP=1 REGISTRY_ADDRESS=$$REG_ADDR IDENTITY_METADATA_URI=$$URI $(FORGE) script script/identity/SetIdentityMetadata.s.sol:SetIdentityMetadata $(SIM_FLAGS_SEPOLIA)

# ------------------------------
# Aggregated Flows
# ------------------------------
deploy-sepolia-full:
	$(call require_sepolia_rpc)
	@echo "[1/6] Deploying core stack..." && \
	$(MAKE) --no-print-directory deploy-core-sepolia && \
	echo "[2/6] Wiring ZK stack..." && \
	$(MAKE) --no-print-directory deploy-zk-sepolia || true && \
	echo "[3/6] Bootstrapping TrustScore roles..." && \
	$(MAKE) --no-print-directory roles-bootstrap-sepolia || true && \
	echo "[4/6] Granting logger roles..." && \
	$(MAKE) --no-print-directory roles-grant-logger-sepolia || true && \
	echo "[5/6] Registering deployer identity..." && \
	$(MAKE) --no-print-directory identity-register-sepolia || true && \
	echo "[6/6] Setting identity metadata..." && \
	$(MAKE) --no-print-directory identity-set-metadata-sepolia || true && \
	echo "Done. Inspect $(SEPOLIA_BROADCAST) for deployed addresses."

simulate-sepolia-full:
	$(call require_sepolia_rpc)
	@echo "[1/6] Simulating core stack..." && \
	$(MAKE) --no-print-directory simulate-core-sepolia && \
	echo "[2/6] Simulating ZK wiring..." && \
	$(MAKE) --no-print-directory simulate-zk-sepolia || true && \
	echo "[3/6] Simulating role bootstrap..." && \
	$(MAKE) --no-print-directory simulate-roles-bootstrap-sepolia || true && \
	echo "[4/6] Simulating logger grants..." && \
	$(MAKE) --no-print-directory simulate-roles-grant-logger-sepolia || true && \
	echo "[5/6] Simulating identity registration..." && \
	$(MAKE) --no-print-directory simulate-identity-register-sepolia || true && \
	echo "[6/6] Simulating metadata update..." && \
	$(MAKE) --no-print-directory simulate-identity-set-metadata-sepolia || true && \
	echo "Note: simulations do not persist state; inspect broadcast artifacts for addresses."

run-user-interactions:
	$(call require_sepolia_rpc)
	$(call require_file,$(SEPOLIA_BROADCAST),Run deploy-core-sepolia first.)
	@REG_ADDR=$$($(PARSE_BROADCAST) "$(SEPOLIA_BROADCAST)" UserIdentityRegistry); \
	if [ -z "$$REG_ADDR" ] || [ "$$REG_ADDR" = "null" ]; then \
		echo "ERROR: Could not resolve UserIdentityRegistry from $(SEPOLIA_BROADCAST)"; \
		exit 2; \
	fi; \
	SKIP_DEVOPS_LOOKUP=1 REGISTRY_ADDRESS=$$REG_ADDR $(FORGE) script script/interactions/AllUserInteractions.s.sol:AllUserInteractions $(BROADCAST_FLAGS_SEPOLIA)

show-zk-addresses:
	@CHAIN_ID=$$(cast chain-id 2>/dev/null || echo $(SEPOLIA_CHAIN_ID)); \
	FILE=broadcast/zk-addresses.$$CHAIN_ID.json; \
	if [ -f "$$FILE" ]; then \
		echo "Showing $$FILE"; \
		cat "$$FILE"; \
	else \
		echo "No $$FILE found. Run deploy-zk or deploy-sepolia-full first."; \
	fi

# ------------------------------
# Tooling Shortcuts
# ------------------------------
frontend-install:
	@cd $(FRONTEND_DIR) && npm install

frontend-build:
	@cd $(FRONTEND_DIR) && npm run build

frontend-lint:
	@cd $(FRONTEND_DIR) && npm run lint

identity-pipeline-install:
	@cd $(PIPELINE_DIR) && npm install

identity-pipeline-run:
	@cd $(PIPELINE_DIR) && npm run full-pipeline

zk-compile:
	@$(MAKE) -C $(ZK_DIR) all

zk-clean:
	@$(MAKE) -C $(ZK_DIR) clean

# ------------------------------
# Utilities
# ------------------------------
anvil:
	@echo "Starting anvil on $(LOCAL_RPC_URL) (Ctrl+C to stop)..." && anvil -p 8545

help:
	@echo "" && \
	echo "Foundry core:" && \
	printf "  %-32s %s\n" "build" "Compile contracts" && \
	printf "  %-32s %s\n" "test | test-gas | test-fuzz" "Run unit tests / reports" && \
	printf "  %-32s %s\n" "fmt" "Format Solidity sources" && \
	echo "" && \
	echo "Deploy & simulate:" && \
	printf "  %-32s %s\n" "deploy-core | simulate-core" "Core stack" && \
	printf "  %-32s %s\n" "deploy-umbrella | deploy-complete" "Extended stacks" && \
	printf "  %-32s %s\n" "deploy-zk | deploy-all-verifiers" "Zero-knowledge wiring" && \
	printf "  %-32s %s\n" "deploy-accounts" "ERC-4337 accounts factory" && \
	printf "  %-32s %s\n" "deploy-sepolia-full" "Full Sepolia rollout" && \
	printf "  %-32s %s\n" "simulate-sepolia-full" "Dry-run the full flow" && \
	echo "" && \
	echo "Roles & identity:" && \
	printf "  %-32s %s\n" "roles-bootstrap | roles-grant-logger" "TrustScore + logger setup" && \
	printf "  %-32s %s\n" "identity-register | identity-set-metadata" "Manage registry entries" && \
	echo "" && \
	echo "Tooling:" && \
	printf "  %-32s %s\n" "frontend-build | frontend-lint" "Frontend quality gates" && \
	printf "  %-32s %s\n" "identity-pipeline-run" "Encrypted identity pipeline" && \
	printf "  %-32s %s\n" "zk-compile" "Compile circuits & verifiers" && \
	echo "" && \
	echo "Misc:" && \
	printf "  %-32s %s\n" "show-zk-addresses" "Print latest zk deployment JSON" && \
	printf "  %-32s %s\n" "anvil" "Start a local forge anvil node" && \
	echo "" && \
	echo "Environment: RPC_URL or SEPOLIA_RPC_URL, PRIVATE_KEY for broadcasts, ENTRYPOINT_ADDRESS/BUNDLER_ADDRESS for accounts, IDENTITY_METADATA_URI when updating metadata. See env.example for details."
