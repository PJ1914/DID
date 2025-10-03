export const VerificationManagerABI = [
    {
        "type": "function",
        "name": "submitVerification",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "verificationType",
                "type": "uint8",
                "internalType": "enum VerificationManager.VerificationType"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
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
        "type": "function",
        "name": "approveVerification",
        "inputs": [
            {
                "name": "verificationId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "rejectVerification",
        "inputs": [
            {
                "name": "verificationId",
                "type": "uint256",
                "internalType": "uint256"
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
        "name": "getVerification",
        "inputs": [
            {
                "name": "verificationId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct VerificationManager.Verification",
                "components": [
                    {
                        "name": "user",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "verificationType",
                        "type": "uint8",
                        "internalType": "enum VerificationManager.VerificationType"
                    },
                    {
                        "name": "status",
                        "type": "uint8",
                        "internalType": "enum VerificationManager.VerificationStatus"
                    },
                    {
                        "name": "submissionTime",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "approvalTime",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getUserVerifications",
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
                "type": "uint256[]",
                "internalType": "uint256[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isVerified",
        "inputs": [
            {
                "name": "user",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "verificationType",
                "type": "uint8",
                "internalType": "enum VerificationManager.VerificationType"
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
        "type": "event",
        "name": "VerificationSubmitted",
        "inputs": [
            {
                "name": "verificationId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "verificationType",
                "type": "uint8",
                "indexed": false,
                "internalType": "enum VerificationManager.VerificationType"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "VerificationApproved",
        "inputs": [
            {
                "name": "verificationId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "verificationType",
                "type": "uint8",
                "indexed": false,
                "internalType": "enum VerificationManager.VerificationType"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "VerificationRejected",
        "inputs": [
            {
                "name": "verificationId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "user",
                "type": "address",
                "indexed": true,
                "internalType": "address"
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