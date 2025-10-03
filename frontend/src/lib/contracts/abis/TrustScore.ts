export const TrustScoreABI = [
    {
        "type": "function",
        "name": "getTrustScore",
        "inputs": [
            {
                "name": "user",
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
        "name": "updateTrustScore",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "points",
                "type": "int256",
                "internalType": "int256"
            },
            {
                "name": "reason",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getTrustLevel",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "enum TrustScore.TrustLevel"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getTrustHistory",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "limit",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple[]",
                "internalType": "struct TrustScore.TrustEntry[]",
                "components": [
                    {
                        "name": "timestamp",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "points",
                        "type": "int256",
                        "internalType": "int256"
                    },
                    {
                        "name": "reason",
                        "type": "string",
                        "internalType": "string"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "TrustScoreUpdated",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "oldScore",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "newScore",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "points",
                "type": "int256",
                "indexed": false,
                "internalType": "int256"
            },
            {
                "name": "reason",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    }
] as const;