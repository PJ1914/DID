// Auto-generated ABI for SessionKeyManager
export const SessionKeyManagerABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "logger",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "manager",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "AUTHORIZED_MANAGER",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "VERIFICATION_LOGGER",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IVerificationLogger"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "_consumeAllowance",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addSessionKey",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "validUntil",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "spendingLimit",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "allowedFunctions",
        "type": "string[]",
        "internalType": "string[]"
      },
      {
        "name": "allowedContracts",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getSessionKeyConfig",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct ISessionKeyManager.SessionKeyConfig",
        "components": [
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "validUntil",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "spendingLimit",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "spent",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "allowedFunctions",
            "type": "string[]",
            "internalType": "string[]"
          },
          {
            "name": "allowedContracts",
            "type": "address[]",
            "internalType": "address[]"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSessionKeys",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isSessionKeyValid",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "revokeSessionKey",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "SessionKeyAdded",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "validUntil",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      },
      {
        "name": "spendingLimit",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SessionKeyRevoked",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sessionKey",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "InvalidSessionKey",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotAuthorized",
    "inputs": []
  }
] as const;
