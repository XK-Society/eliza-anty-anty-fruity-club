// src/actions/getValidator.ts
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

export const getValidatorAction: Action = {
    name: "P2P_GET_OPERATORS",
    similes: [
        "EIGENLAYER OPERATORS",
        "DELEGATE",
        "VALIDATORS",
        "OPERATOR LIST"
    ],
    description: "Get a list of EigenLayer operators for delegation.",
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
            const response = await p2pService.getOperators();
            elizaLogger.success(
                `Successfully fetched EigenLayer operators`
            );
            
            if (callback) {
                let operatorMessage = "Here are the available EigenLayer operators:\n\n";
                
                if (response.operators && response.operators.length > 0) {
                    response.operators.forEach((operator, index) => {
                        operatorMessage += `${index + 1}. ${operator.name || "Unnamed Operator"}\n`;
                        operatorMessage += `   Address: ${operator.address}\n`;
                        operatorMessage += `   Delegated Shares: ${operator.delegatedShares}\n\n`;
                    });
                    
                    operatorMessage += "To delegate to an operator, please provide their address.";
                } else {
                    operatorMessage = "No operators found. Please try again later.";
                }
                
                callback({
                    text: operatorMessage,
                    content: response,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (getOperators):", error);
            callback({
                text: `Error fetching EigenLayer operators: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: delegateToOperatorExamples.slice(0, 1) as ActionExample[][],
} as Action;