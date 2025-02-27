// src/actions/postActivetx.ts
import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateP2PConfig } from "../environments";
import { verifyCredentialsExamples } from "../examples";
import { createP2PService } from "../services";

export const postActivetxAction: Action = {
    name: "P2P_VERIFY_CREDENTIALS",
    similes: [
        "VERIFY CREDENTIALS",
        "WITHDRAWAL CREDENTIALS",
        "EIGENLAYER VERIFICATION",
        "ACTIVATE VALIDATOR"
    ],
    description: "Verify withdrawal credentials for EigenLayer.",
    validate: async (runtime: IAgentRuntime) => {
        await validateP2PConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateP2PConfig(runtime);
        const p2pService = createP2PService(
            config.P2P_API_KEY,
            config.P2P_API_URL
        );

        const eigenPodOwnerAddress = options.eigenPodOwnerAddress as string;
        const pubkey = options.pubkey as string;

        if (!eigenPodOwnerAddress || !pubkey) {
            callback({
                text: "Missing required parameters: eigenPodOwnerAddress and pubkey are required.",
                content: { error: "Missing required parameters" },
            });
            return false;
        }

        try {
            const response = await p2pService.verifyWithdrawalCredentials({
                eigenPodOwnerAddress,
                pubkey
            });
            
            elizaLogger.success(
                `Successfully generated verification transaction`
            );
            
            if (callback) {
                callback({
                    text: `I've generated a transaction to verify the withdrawal credentials for your validator with pubkey ${pubkey}. You'll need to sign and submit this transaction:
                    
Transaction: ${response.transaction}

This verification ensures that your validator's withdrawal credentials point to your EigenPod at address ${eigenPodOwnerAddress}. This step is crucial for the EigenLayer restaking process.`,
                    content: response,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (verifyWithdrawalCredentials):", error);
            callback({
                text: `Error verifying withdrawal credentials: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: verifyCredentialsExamples as ActionExample[][],
} as Action;