// src/examples.ts
import { ActionExample } from "@elizaos/core";

export const validateTaskExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you validate my crypto volatility task with ID 12345?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll validate your crypto volatility task now.",
                action: "VALIDATE_TASK",
                actionParams: {
                    taskId: "12345"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Check if my BTC volatility task with ID 67890 is valid",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll check the validity of that Bitcoin volatility task.",
                action: "VALIDATE_TASK",
                actionParams: {
                    taskId: "67890",
                    cryptoSymbol: "BTC"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Validate my Ethereum volatility task with ID ABC123 and IPFS hash QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll validate your Ethereum volatility task using the IPFS hash.",
                action: "VALIDATE_TASK",
                actionParams: {
                    taskId: "ABC123",
                    cryptoSymbol: "ETH",
                    ipfsHash: "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"
                }
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Validate my task with ID DEF456 and volatility data {\"volatility\": 0.0234, \"timestamp\": 1709183458, \"cryptoSymbol\": \"SOL\"}",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll validate your Solana volatility task with the provided data.",
                action: "VALIDATE_TASK",
                actionParams: {
                    taskId: "DEF456",
                    cryptoSymbol: "SOL",
                    taskData: {
                        volatility: 0.0234,
                        timestamp: 1709183458,
                        cryptoSymbol: "SOL"
                    }
                }
            },
        }
    ]
];