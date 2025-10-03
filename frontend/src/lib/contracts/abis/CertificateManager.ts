export const CertificateManagerABI = [
    {
        "type": "function",
        "name": "issueCertificate",
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "certificateType",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "metadataURI",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "expiryTime",
                "type": "uint256",
                "internalType": "uint256"
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
        "name": "revokeCertificate",
        "inputs": [
            {
                "name": "tokenId",
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
        "name": "getCertificate",
        "inputs": [
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct CertificateManager.Certificate",
                "components": [
                    {
                        "name": "issuer",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "holder",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "certificateType",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "metadataURI",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "issuedAt",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "expiryTime",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "revoked",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "revokedAt",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "revocationReason",
                        "type": "string",
                        "internalType": "string"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getUserCertificates",
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
        "name": "isValidCertificate",
        "inputs": [
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
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
        "name": "verifyCertificate",
        "inputs": [
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "expectedHolder",
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
        "type": "event",
        "name": "CertificateIssued",
        "inputs": [
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "issuer",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "holder",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "certificateType",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "metadataURI",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "CertificateRevoked",
        "inputs": [
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
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