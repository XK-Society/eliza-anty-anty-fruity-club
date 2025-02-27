// src/actions/postDeposit.ts
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
import { createDepositTxExamples } from "../examples";
import { createP2PService } from "../services";
import { DepositData } from "../types";

export const postDepositAction: Action = {
    name: "P2P_CREATE_DEPOSIT_TX",
    similes: [
        "DEPOSIT",
        "STAKING DEPOSIT",
        "VALIDATOR DEPOSIT",
        "STAKE ETH"
    ],
    description: "Create a deposit transaction for staking on EigenLayer.",
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

        // Extract parameters
        const withdrawalAddress = options.withdrawalAddress as string;
        
        // Check if we have deposit data directly provided
        let depositData: DepositData[] = [];
        
        if (options.depositData) {
            // Direct deposit data provided
            depositData = options.depositData as DepositData[];
        } else if (options.validatorPubkey) {
            // We have individual validator data
            const validatorPubkey = options.validatorPubkey as string;
            const signature = options.signature as string || 
                "0x91b710f0e3affe704e76ada81b095afbedf4b760f3160760e8fa0298cc4858e0f325c2652dc698ec63c59db65562551114ab7fcafe1d675eaaf186fa7758800f0157bd0b51cd3a131fac562d6933658ddbf182aab8d20a9483b1392085e54cf5";
            const depositDataRoot = options.depositDataRoot as string || 
                "0xd0d00dce54b4ec8a7803783fc786a859459ead1d35b856c525cb289aba4b0f89";

            depositData = [{
                pubkey: validatorPubkey,
                signature,
                depositDataRoot
            }];
        } else if (options.requestId) {
            // We have a request ID, we should fetch validator data
            try {
                const requestId = options.requestId as string;
                const statusResponse = await p2pService.getRequestStatus(requestId);
                
                if (statusResponse.validators && statusResponse.validators.length > 0) {
                    depositData = statusResponse.validators
                        .filter(v => v.depositData)
                        .map(v => v.depositData as DepositData);
                }
                
                if (depositData.length === 0) {
                    throw new Error("No deposit data available for this request. The validators may not be ready yet.");
                }
            } catch (error: any) {
                elizaLogger.error("Error fetching deposit data from request:", error);
                callback({
                    text: `Error fetching deposit data: ${error.message}`,
                    content: { error: error.message },
                });
                return false;
            }
        }

        // Validate required parameters
        if (!withdrawalAddress) {
            callback({
                text: "Missing required parameter: withdrawalAddress",
                content: { error: "Missing required parameter" },
            });
            return false;
        }

        if (depositData.length === 0) {
            callback({
                text: "No valid deposit data provided. Please provide validator information or a request ID.",
                content: { error: "Missing deposit data" },
            });
            return false;
        }

        try {
            const response = await p2pService.createDepositTransaction({
                withdrawalAddress,
                depositData
            });
            
            elizaLogger.success(
                `Successfully created deposit transaction for ${depositData.length} validator(s)`
            );
            
            if (callback) {
                let message = `I've generated a deposit transaction for ${depositData.length} validator(s) with withdrawal address ${withdrawalAddress}. You'll need to sign and submit this transaction:
                    
Transaction: ${response.transaction}

Once this transaction is confirmed, your deposit will be processed for the following validators:`;

                depositData.forEach((data, index) => {
                    message += `\n- Validator ${index + 1}: ${data.pubkey.substring(0, 10)}...${data.pubkey.substring(data.pubkey.length - 10)}`;
                });

                message += "\n\nThis transaction will stake your ETH for these validators.";
                
                callback({
                    text: message,
                    content: {
                        transaction: response.transaction,
                        depositData
                    },
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in P2P plugin handler (createDepositTransaction):", error);
            callback({
                text: `Error creating deposit transaction: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: createDepositTxExamples as ActionExample[][],
} as Action;