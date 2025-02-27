// src/actions/postRestake.ts
import { v4 as uuidv4 } from 'uuid';
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
import { createRestakeRequestExamples } from "../examples";
import { createP2PService } from "../services";

export const postRestakeAction: Action = {
    name: "P2P_CREATE_RESTAKE_REQUEST",
    similes: [
        "RESTAKING",
        "EIGENLAYER",
        "NODE SETUP",
        "STAKING NODES"
    ],
    description: "Create a restaking request to set up staking nodes.",
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

        // Generate UUID for the request
        const requestId = uuidv4();
        
        // Extract parameters from options or message
        const eigenPodOwnerAddress = options.eigenPodOwnerAddress as string || '';
        const feeRecipientAddress = options.feeRecipientAddress as string || '';
        const controllerAddress = options.controllerAddress as string || '';
        const validatorsCount = options.validatorsCount as number || 1;
        const location = options.location as string || "any";

        if (!eigenPodOwnerAddress || !feeRecipientAddress || !controllerAddress) {
            callback({
                text: "Missing required parameters: eigenPodOwnerAddress, feeRecipientAddress, and controllerAddress are required.",
                content: { error: "Missing required parameters" },
            });
            return false;
        }

        try {
            const response = await p2pService.createRestakingRequest(
                requestId,
                validatorsCount,
                eigenPodOwnerAddress,
                feeRecipientAddress,
                controllerAddress,
                location
            );
            
            elizaLogger.success(
                `Successfully created restaking request with ID: ${requestId}`
            );
            
            if (callback) {
                callback({
                    text: `I've created a restaking request for you with ID: ${requestId}
                    
Your request has been submitted with the following details:
- EigenPod Owner Address: ${eigenPodOwnerAddress}
- Fee Recipient Address: ${feeRecipientAddress}
- Controller Address: ${controllerAddress}
- Validators Count: ${validatorsCount}

You can check the status of your request using the request ID. Would you like me to check the status for you?`,
                    content: { 
                        requestId,
                        status: response.status
                    },
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (createRestakingRequest):", error);
            callback({
                text: `Error creating restaking request: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: createRestakeRequestExamples as ActionExample[][],
} as Action;