// src/actions/getRestake.ts
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
import { checkRestakeStatusExamples } from "../examples";
import { createP2PService } from "../services";

export const getRestakeAction: Action = {
    name: "P2P_CHECK_RESTAKE_STATUS",
    similes: [
        "CHECK STATUS",
        "RESTAKING STATUS",
        "NODE STATUS"
    ],
    description: "Check the status of a restaking request.",
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

        const requestId = options.requestId as string;
        if (!requestId) {
            callback({
                text: "Missing required parameter: requestId",
                content: { error: "Missing required parameter" },
            });
            return false;
        }

        try {
            const response = await p2pService.getRequestStatus(requestId);
            elizaLogger.success(
                `Successfully fetched status for request: ${requestId}`
            );
            
            if (callback) {
                let statusMessage = `Status of your restaking request (ID: ${requestId}): ${response.status}\n`;
                statusMessage += `Validators Count: ${response.validatorsCount}\n\n`;
                
                if (response.validators && response.validators.length > 0) {
                    statusMessage += "Validator Details:\n";
                    response.validators.forEach((validator, index) => {
                        statusMessage += `\nValidator ${index + 1}:\n`;
                        statusMessage += `- Public Key: ${validator.pubkey}\n`;
                        statusMessage += `- Status: ${validator.status}\n`;
                        
                        if (validator.depositData) {
                            statusMessage += "- Deposit Data Available: Yes\n";
                        } else {
                            statusMessage += "- Deposit Data Available: No\n";
                        }
                    });
                }
                
                callback({
                    text: statusMessage,
                    content: response,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (getRequestStatus):", error);
            callback({
                text: `Error checking request status: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: checkRestakeStatusExamples as ActionExample[][],
} as Action;