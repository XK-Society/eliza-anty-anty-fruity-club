// src/actions/postCreateEigen.ts
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
import { createEigenPodExamples } from "../examples";
import { createP2PService } from "../services";

export const postCreateEigenAction: Action = {
    name: "P2P_CREATE_EIGENPOD",
    similes: [
        "EIGENLAYER",
        "EIGENPOD",
        "CREATE POD",
        "RESTAKING"
    ],
    description: "Create an EigenPod for EigenLayer restaking.",
    validate: async (runtime: IAgentRuntime) => {
        await validateP2PConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateP2PConfig(runtime);
        const p2pService = createP2PService(
            config.P2P_API_KEY,
            config.P2P_API_URL
        );

        try {
            const response = await p2pService.createEigenPod();
            elizaLogger.success(
                `Successfully created EigenPod transaction`
            );
            
            if (callback) {
                callback({
                    text: `I've generated a transaction to create your EigenPod. You'll need to sign and submit this transaction to create your EigenPod:
                    
Transaction: ${response.transaction}

Once this transaction is confirmed, you'll have an EigenPod that can be used for restaking with EigenLayer.`
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (createEigenPod):", error);
            callback({
                text: `Error creating EigenPod transaction: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: createEigenPodExamples as ActionExample[][],
} as Action;
