// Auto-generated ABI for WalletStatsManager
export const WalletStatsManagerABI = [
  {
    "type": "function",
    "name": "getStats",
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
        "type": "tuple",
        "internalType": "struct IWalletStatsManager.UserOpStats",
        "components": [
          {
            "name": "totalOps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "successfulOps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "failedOps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalGasUsed",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalFeesPaid",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastOpTimestamp",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "recordUserOp",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "success",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "gasUsed",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "feePaid",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "UserOpRecorded",
    "inputs": [
      {
        "name": "wallet",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "success",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "gasUsed",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "feePaid",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalOps",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;
