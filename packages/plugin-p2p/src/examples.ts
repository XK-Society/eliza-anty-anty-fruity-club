// src/examples.ts
import { ActionExample } from "@elizaos/core";

export const createEigenPodExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to create an EigenPod for restaking",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll generate a transaction to create an EigenPod for you.",
                action: "P2P_CREATE_EIGENPOD",
            },
        }
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "How do I start with EigenLayer restaking?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "The first step is to create an EigenPod. Would you like me to generate that transaction for you?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Yes, please do that",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll generate a transaction to create your EigenPod now.",
                action: "P2P_CREATE_EIGENPOD",
            },
        }
    ]
];

export const createRestakeRequestExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to set up restaking nodes with my EigenPod at 0x27AABeE07E0dbC8b0de20f42b1a1980871314Ef5",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll help you set up restaking nodes. I'll need some additional information. What should be the fee recipient and controller addresses?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Use 0x39D02C253dA1d9F85ddbEB3B6Dc30bc1EcBbFA17 for both",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll create a restaking request for your EigenPod now.",
                action: "P2P_CREATE_RESTAKE_REQUEST",
                actionParams: {
                    eigenPodOwnerAddress: "0x27AABeE07E0dbC8b0de20f42b1a1980871314Ef5",
                    feeRecipientAddress: "0x39D02C253dA1d9F85ddbEB3B6Dc30bc1EcBbFA17",
                    controllerAddress: "0x39D02C253dA1d9F85ddbEB3B6Dc30bc1EcBbFA17"
                }
            },
        }
    ]
];

export const checkRestakeStatusExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you check the status of my restaking request with ID 6df58880-c4c9-484a-8fc4-7f7668fe9522?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll check the status of your restaking request.",
                action: "P2P_CHECK_RESTAKE_STATUS",
                actionParams: {
                    requestId: "6df58880-c4c9-484a-8fc4-7f7668fe9522"
                }
            },
        }
    ]
];

export const createDepositTxExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I need to create a deposit transaction for my validator with pubkey 0xaed7226d86d884dd44bc45c2b57f7634e72abf247713163388b1c34d89a1322d7228ca023dbaf2465b822e35ba00da13",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll help you create a deposit transaction. What's your withdrawal address?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Use 0x1433F808a4867aDEeEb3AE0Df58691C252269A2C as the withdrawal address",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll create a deposit transaction for your validator.",
                action: "P2P_CREATE_DEPOSIT_TX",
                actionParams: {
                    withdrawalAddress: "0x1433F808a4867aDEeEb3AE0Df58691C252269A2C",
                    validatorPubkey: "0xaed7226d86d884dd44bc45c2b57f7634e72abf247713163388b1c34d89a1322d7228ca023dbaf2465b822e35ba00da13"
                }
            },
        }
    ]
];

export const verifyCredentialsExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I need to verify withdrawal credentials for my validator",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll help you verify withdrawal credentials. What's your EigenPod owner address?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "0x27AABeE07E0dbC8b0de20f42b1a1980871314Ef5",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "And what's the validator pubkey?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "0xffC08FcD7cFeF5c70fB2b0e1f2A8EaA690AaE2bDFfa5dBEc4dEef31DcC0B19eB1f9Cebe3E2fe9eefBD9a1BDF6FD89b39",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll verify the withdrawal credentials for your validator.",
                action: "P2P_VERIFY_CREDENTIALS",
                actionParams: {
                    eigenPodOwnerAddress: "0x27AABeE07E0dbC8b0de20f42b1a1980871314Ef5",
                    pubkey: "0xffC08FcD7cFeF5c70fB2b0e1f2A8EaA690AaE2bDFfa5dBEc4dEef31DcC0B19eB1f9Cebe3E2fe9eefBD9a1BDF6FD89b39"
                }
            },
        }
    ]
];

export const delegateToOperatorExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to delegate my restake to an operator",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll help you delegate your restake to an operator. Let me fetch the list of available operators.",
                action: "P2P_GET_OPERATORS",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "I want to delegate to 0xdbed88d83176316fc46797b43adee927dc2ff2f5",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll create a transaction to delegate your restake to that operator.",
                action: "P2P_DELEGATE_TO",
                actionParams: {
                    operatorAddress: "0xdbed88d83176316fc46797b43adee927dc2ff2f5"
                }
            },
        }
    ]
];