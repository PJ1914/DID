// Auto-generated ABI for RecoveryManager
export const RecoveryManagerABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "logger",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "guardianManager_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "GUARDIAN_MANAGER",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IGuardianManager"
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
    "name": "cancelRecovery",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "currentOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "confirmRecovery",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "currentOwner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "guardian",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "executeRecovery",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "currentOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getRecoveriesCount",
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
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRecovery",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct IRecoveryManager.RecoveryDetails",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "wallet",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "currentOwner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "newOwner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "initiator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "requestedAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "executeAfter",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "confirmations",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "totalGuardians",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum IRecoveryManager.RecoveryStatus"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "requestRecovery",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "reason",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "delay",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "currentOwner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "guardian",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "RecoveryCancelled",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "wallet",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RecoveryConfirmed",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "guardian",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "confirmations",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RecoveryExecuted",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "wallet",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RecoveryRequested",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "wallet",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "initiator",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "reason",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "executeAfter",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyConfirmed",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "guardian",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "DelayNotElapsed",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "executeAfter",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MismatchedWalletOrOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoGuardiansConfigured",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotGuardian",
    "inputs": []
  },
  {
    "type": "error",
    "name": "RecoveryAlreadyActive",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "RecoveryNotPending",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ThresholdNotMet",
    "inputs": [
      {
        "name": "recoveryId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "confirmations",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "required",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "Unauthorized",
    "inputs": []
  }
] as const;
