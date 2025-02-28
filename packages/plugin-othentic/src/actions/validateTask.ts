// src/actions/validateTask.ts
import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { validateTaskValidatorConfig } from "../environments";
import { validateTaskExamples } from "../examples";
import { createTaskValidatorService } from "../services";

export const validateTaskAction: Action = {
    name: "VALIDATE_TASK",
    similes: [
        "TASK VALIDATION",
        "CHECK TASK",
        "VALIDATE",
        "CRYPTO VALIDATION",
        "VOLATILITY CHECK"
    ],
    description: "Validate a crypto volatility task using the AVS validation service",
    validate: async (runtime: IAgentRuntime) => {
        await validateTaskValidatorConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateTaskValidatorConfig(runtime);
        const taskValidatorService = createTaskValidatorService(
            config.TASK_VALIDATOR_API_URL
        );

        // Extract parameters
        const taskId = options.taskId as string;
        const ipfsHash = options.ipfsHash as string | undefined;
        const cryptoSymbol = options.cryptoSymbol as string | undefined;
        const taskData = options.taskData as Record<string, any> | undefined;

        if (!taskId) {
            callback({
                text: "Missing required parameter: taskId",
                content: { error: "Missing required parameter" },
            });
            return false;
        }

        try {
            const response = await taskValidatorService.validateTask({
                taskId,
                ipfsHash,
                cryptoSymbol,
                taskData
            });
            
            elizaLogger.success(
                `Successfully validated task with ID: ${taskId}`
            );
            
            if (callback) {
                let responseText = "";
                
                if (response.valid) {
                    responseText = `✅ Crypto volatility task ${taskId} is valid.`;
                    
                    if (response.message) {
                        responseText += `\n\n${response.message}`;
                    }
                } else {
                    responseText = `❌ Crypto volatility task ${taskId} is not valid.`;
                    
                    if (response.message) {
                        responseText += `\n\n${response.message}`;
                    }
                    
                    if (response.errors && response.errors.length > 0) {
                        responseText += "\n\nErrors:";
                        response.errors.forEach((error, index) => {
                            responseText += `\n${index + 1}. ${error}`;
                        });
                    }
                }
                
                if (response.details) {
                    responseText += "\n\nValidation Details:";
                    
                    if (response.details.currentVolatility !== undefined) {
                        responseText += `\n- Current Volatility: ${response.details.currentVolatility.toFixed(4)}`;
                    }
                    
                    if (response.details.storedVolatility !== undefined) {
                        responseText += `\n- Stored Volatility: ${response.details.storedVolatility.toFixed(4)}`;
                    }
                    
                    if (response.details.volatilityDiff !== undefined) {
                        responseText += `\n- Volatility Difference: ${response.details.volatilityDiff.toFixed(4)}`;
                    }
                    
                    if (response.details.acceptableMargin !== undefined) {
                        responseText += `\n- Acceptable Margin: ${response.details.acceptableMargin.toFixed(4)}`;
                    }
                    
                    if (response.details.age !== undefined) {
                        responseText += `\n- Task Age: ${response.details.age} seconds`;
                    }
                    
                    // Handle any other details
                    for (const [key, value] of Object.entries(response.details)) {
                        if (!['currentVolatility', 'storedVolatility', 'volatilityDiff', 'acceptableMargin', 'age'].includes(key)) {
                            responseText += `\n- ${key}: ${JSON.stringify(value)}`;
                        }
                    }
                }
                
                callback({
                    text: responseText,
                    content: response,
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in Task Validator handler:", error);
            callback({
                text: `Error validating crypto volatility task: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: validateTaskExamples as ActionExample[][],
} as Action;