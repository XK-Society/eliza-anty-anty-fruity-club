// src/actions/postDelegateTo.ts
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
import { delegateToOperatorExamples } from "../examples";
import { createP2PService } from "../services";

export const postDelegateToAction: Action = {
    name: "P2P_DELEGATE_TO",
    similes: [
        "DELEGATE",
        "EIGENLAYER DELEGATE",
        "RESTAKE DELEGATE"
    ],
    description: "Delegate restaked ETH to an EigenLayer operator.",
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

        const operatorAddress = options.operatorAddress as string;

        if (!operatorAddress) {
            callback({
                text: "Missing required parameter: operatorAddress",
                content: { error: "Missing required parameter" },
            });
            return false;
        }

        try {
            const response = await p2pService.delegateTo({
                operatorAddress
            });
            
            elizaLogger.success(
                `Successfully generated delegation transaction`
            );
            
            if (callback) {
                callback({
                    text: `I've generated a transaction to delegate your restaked ETH to the operator (${operatorAddress}). You'll need to sign and submit this transaction:
                    
Transaction: ${response.transaction}

Once this transaction is confirmed, your ETH will be delegated to the selected operator.`,
                    content: response,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (delegateTo):", error);
            callback({
                text: `Error creating delegation transaction: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: delegateToOperatorExamples.slice(1) as ActionExample[][],
} as Action;