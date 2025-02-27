// import { type ByteArray, type Hex, parseUnits, formatUnits, type Address, encodeFunctionData, maxUint256 } from "viem";
// import {
//     type Action,
//     composeContext,
//     generateObjectDeprecated,
//     type HandlerCallback,
//     ModelClass,
//     type IAgentRuntime,
//     type Memory,
//     type State,
//     elizaLogger,
// } from "@elizaos/core";

// import { initWalletProvider, type WalletProvider } from "../providers/wallet";
// import type { Transaction } from "../types";
// import { uniswapV4SwapTemplate } from "../templates/index";

// // -------------------------------------------
// // Types and Interfaces
// // -------------------------------------------

// // Uniswap V4 specific types
// interface PoolKey {
//     currency0: Address;
//     currency1: Address;
//     fee: number;
//     tickSpacing: number;
//     hooks: Address;
// }

// interface SwapParams {
//     zeroForOne: boolean;
//     amountSpecified: bigint;
//     sqrtPriceLimitX96: bigint;
// }

// interface TestSettings {
//     takeClaims: boolean;
//     settleUsingBurn: boolean;
// }

// interface UniswapV4SwapParams {
//     inputToken: Address;
//     outputToken: Address;
//     amount: string;
//     exactInput: boolean;
//     chain: "sepolia";
//     fee?: number;
//     tickSpacing?: number;
//     slippage?: number; // As a percentage, e.g. 0.5 = 0.5%
// }

// interface TokenInfo {
//     address: Address;
//     symbol: string;
//     name: string; 
//     decimals: number;
//     logo?: string;
// }

// // -------------------------------------------
// // Constants and Configuration
// // -------------------------------------------

// // Contract addresses on Sepolia
// const CONTRACTS = {
//     POOL_MANAGER: "0xE03A1074c86CFeDd5C142C4F04F1a1536e20354" as Address,
//     POOL_SWAP_TEST: "0x9b6b46e2c869aa39918db7f52f5557fe577b6eee" as Address,
//     ZERO_ADDRESS: "0x0000000000000000000000000000000000000000" as Address,
//     USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
// };

// // Token information - more comprehensive than just addresses
// const KNOWN_TOKENS: Record<string, TokenInfo> = {
//     "eth": {
//         address: CONTRACTS.ZERO_ADDRESS,
//         symbol: "ETH",
//         name: "Ethereum",
//         decimals: 18,
//         logo: "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/13c43/eth-diamond-black.png"
//     },
//     "usdc": {
//         address: CONTRACTS.USDC,
//         symbol: "USDC",
//         name: "USD Coin",
//         decimals: 6,
//         logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
//     }
// };

// // Create a simplified lookup for just addresses
// const TOKEN_MAP: Record<string, Address> = Object.entries(KNOWN_TOKENS).reduce(
//     (acc, [key, info]) => {
//         acc[key] = info.address;
//         acc[key.toUpperCase()] = info.address; // Add uppercase variant
//         return acc;
//     }, 
//     {} as Record<string, Address>
// );

// // Standard token ABIs
// const ERC20_ABI = [
//     {
//         "inputs": [{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],
//         "name": "approve",
//         "outputs": [{"internalType":"bool","name":"","type":"bool"}],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [{"internalType":"address","name":"account","type":"address"}],
//         "name": "balanceOf",
//         "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],
//         "name": "allowance",
//         "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "decimals",
//         "outputs": [{"internalType":"uint8","name":"","type":"uint8"}],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "symbol",
//         "outputs": [{"internalType":"string","name":"","type":"string"}],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "name",
//         "outputs": [{"internalType":"string","name":"","type":"string"}],
//         "stateMutability": "view",
//         "type": "function"
//     }
// ];

// // Pool Swap Test ABI - only the parts we need
// const POOL_SWAP_TEST_ABI = [
//     {
//         "inputs": [
//             {
//                 "components": [
//                     {"internalType":"Currency","name":"currency0","type":"address"},
//                     {"internalType":"Currency","name":"currency1","type":"address"},
//                     {"internalType":"uint24","name":"fee","type":"uint24"},
//                     {"internalType":"int24","name":"tickSpacing","type":"int24"},
//                     {"internalType":"contract IHooks","name":"hooks","type":"address"}
//                 ],
//                 "internalType": "struct PoolKey",
//                 "name": "key",
//                 "type": "tuple"
//             },
//             {
//                 "components": [
//                     {"internalType":"bool","name":"zeroForOne","type":"bool"},
//                     {"internalType":"int256","name":"amountSpecified","type":"int256"},
//                     {"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}
//                 ],
//                 "internalType": "struct IPoolManager.SwapParams",
//                 "name": "params",
//                 "type": "tuple"
//             },
//             {
//                 "components": [
//                     {"internalType":"bool","name":"takeClaims","type":"bool"},
//                     {"internalType":"bool","name":"settleUsingBurn","type":"bool"}
//                 ],
//                 "internalType": "struct PoolSwapTest.TestSettings",
//                 "name": "testSettings",
//                 "type": "tuple"
//             },
//             {"internalType":"bytes","name":"hookData","type":"bytes"}
//         ],
//         "name": "swap",
//         "outputs": [{"internalType":"BalanceDelta","name":"delta","type":"int256"}],
//         "stateMutability": "payable",
//         "type": "function"
//     }
// ];

// // Price limits for swaps with better precision based on direction
// const SQRT_PRICE_LIMITS = {
//     // When swapping token0 for token1 (zeroForOne), we set a min price to prevent excessive slippage
//     MIN_PRICE: BigInt("4295128740"), // Min price for 0->1 swaps
    
//     // When swapping token1 for token0 (!zeroForOne), we set a max price to prevent excessive slippage
//     MAX_PRICE: BigInt("1461446703485210103287273052203988822378723970341") // Max price for 1->0 swaps
// };

// const DEFAULT_SLIPPAGE = 0.5; // 0.5% slippage default

// // -------------------------------------------
// // Utility Functions
// // -------------------------------------------

// /**
//  * Extract JSON from text that might contain explanatory content
//  * This handles cases where the model adds explanatory text before or after the JSON
//  */
// function extractJSONFromText(text: string): any | null {
//     elizaLogger.log("[DEBUG] Trying to extract JSON from text:", text.substring(0, 100) + "...");
    
//     // Try simple parse first
//     try {
//         return JSON.parse(text);
//     } catch (e) {
//         elizaLogger.log("[DEBUG] Simple JSON parse failed, trying to extract JSON block");
//     }
    
//     // Look for JSON between triple backticks
//     const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
//     const jsonBlockMatch = text.match(jsonBlockRegex);
    
//     if (jsonBlockMatch && jsonBlockMatch[1]) {
//         const jsonContent = jsonBlockMatch[1].trim();
//         elizaLogger.log("[DEBUG] Found JSON block:", jsonContent);
//         try {
//             return JSON.parse(jsonContent);
//         } catch (e) {
//             elizaLogger.error("[DEBUG] Failed to parse extracted JSON block");
//         }
//     }
    
//     // Try to find the JSON object directly
//     const possibleJsonRegex = /(\{[\s\S]*\})/;
//     const possibleJsonMatch = text.match(possibleJsonRegex);
    
//     if (possibleJsonMatch && possibleJsonMatch[1]) {
//         const possibleJson = possibleJsonMatch[1].trim();
//         elizaLogger.log("[DEBUG] Found possible JSON object:", possibleJson);
//         try {
//             return JSON.parse(possibleJson);
//         } catch (e) {
//             elizaLogger.error("[DEBUG] Failed to parse extracted JSON object");
//         }
//     }
    
//     elizaLogger.error("[DEBUG] Could not extract valid JSON from text");
//     return null;
// }

// /**
//  * Super-defensive token resolution function with extensive logging
//  * Resolves token symbols or addresses to valid addresses
//  */
// function resolveTokenAddress(tokenInput: string): Address {
//     // Extensive logging to trace the token resolution
//     elizaLogger.log(`[TOKEN] Resolving token: "${tokenInput}" (type: ${typeof tokenInput})`);
    
//     // Null check with logging
//     if (tokenInput === null || tokenInput === undefined) {
//         elizaLogger.log('[TOKEN] ⚠️ Token input is null or undefined - defaulting to ETH (zero address)');
//         return CONTRACTS.ZERO_ADDRESS;
//     }
    
//     // Empty string check with logging
//     if (tokenInput === '') {
//         elizaLogger.log('[TOKEN] ⚠️ Token input is empty string - defaulting to ETH (zero address)');
//         return CONTRACTS.ZERO_ADDRESS;
//     }
    
//     // ETH check - handle any case variation
//     if (tokenInput.toLowerCase() === 'eth') {
//         elizaLogger.log(`[TOKEN] ✓ Input "${tokenInput}" identified as ETH - returning zero address: ${CONTRACTS.ZERO_ADDRESS}`);
//         return CONTRACTS.ZERO_ADDRESS;
//     }
    
//     // Check if it's already a valid address
//     if (tokenInput.startsWith('0x') && tokenInput.length === 42) {
//         elizaLogger.log(`[TOKEN] ✓ Input is a valid hex address: ${tokenInput}`);
//         return tokenInput as Address;
//     }
    
//     // Map check for known token symbols
//     const token = TOKEN_MAP[tokenInput.toLowerCase()];
//     if (token) {
//         elizaLogger.log(`[TOKEN] ✓ Mapped "${tokenInput}" to address ${token} via TOKEN_MAP`);
//         return token;
//     }
    
//     // Last resort - warn and return carefully
//     elizaLogger.warn(`[TOKEN] ⚠️ Could not resolve "${tokenInput}" to a valid address - this will likely cause errors`);
    
//     // Force ETH if we can't resolve it (safer than letting an invalid address through)
//     elizaLogger.log('[TOKEN] Forcing to ETH (zero address) to prevent errors');
//     return CONTRACTS.ZERO_ADDRESS;
// }

// /**
//  * Get token info with fallbacks
//  * Tries to get token info from KNOWN_TOKENS, then falls back to fetching from chain
//  */
// async function getTokenInfo(
//     tokenAddress: Address, 
//     publicClient: any
// ): Promise<TokenInfo> {
//     // Check if it's a known token
//     const knownToken = Object.values(KNOWN_TOKENS).find(
//         token => token.address.toLowerCase() === tokenAddress.toLowerCase()
//     );
    
//     if (knownToken) {
//         elizaLogger.log(`[TOKEN] Found known token info for ${tokenAddress}`);
//         return knownToken;
//     }
    
//     // If it's the zero address (ETH), return hardcoded info
//     if (tokenAddress === CONTRACTS.ZERO_ADDRESS) {
//         elizaLogger.log('[TOKEN] Token is ETH (zero address), using hardcoded info');
//         return KNOWN_TOKENS.eth;
//     }
    
//     // Otherwise, try to fetch from chain
//     elizaLogger.log(`[TOKEN] Fetching token info for ${tokenAddress} from chain`);
//     try {
//         // Try to get decimals
//         let decimals = 18; // Default
//         try {
//             decimals = await publicClient.readContract({
//                 address: tokenAddress,
//                 abi: ERC20_ABI,
//                 functionName: "decimals",
//             }) as number;
//         } catch (e) {
//             elizaLogger.warn(`[TOKEN] Error getting decimals for ${tokenAddress}, using default: 18`);
//         }
        
//         // Try to get symbol
//         let symbol = "UNKNOWN";
//         try {
//             symbol = await publicClient.readContract({
//                 address: tokenAddress,
//                 abi: ERC20_ABI,
//                 functionName: "symbol",
//             }) as string;
//         } catch (e) {
//             elizaLogger.warn(`[TOKEN] Error getting symbol for ${tokenAddress}, using address`);
//             symbol = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;
//         }
        
//         // Try to get name
//         let name = symbol;
//         try {
//             name = await publicClient.readContract({
//                 address: tokenAddress,
//                 abi: ERC20_ABI,
//                 functionName: "name",
//             }) as string;
//         } catch (e) {
//             elizaLogger.warn(`[TOKEN] Error getting name for ${tokenAddress}, using symbol`);
//         }
        
//         return {
//             address: tokenAddress,
//             symbol,
//             name,
//             decimals
//         };
//     } catch (e) {
//         elizaLogger.error(`[TOKEN] Failed to get token info for ${tokenAddress}: ${e.message}`);
//         // Return basic info
//         return {
//             address: tokenAddress,
//             symbol: tokenAddress.slice(0, 6),
//             name: `Token ${tokenAddress.slice(0, 6)}`,
//             decimals: 18
//         };
//     }
// }

// /**
//  * Calculates price limit based on direction and slippage
//  * This provides better price protection than static limits
//  */
// function calculatePriceLimit(
//     zeroForOne: boolean, 
//     slippagePercent: number = DEFAULT_SLIPPAGE
// ): bigint {
//     // For now we'll use static limits, but this could be improved
//     // to use current price and apply slippage percentage
//     if (zeroForOne) {
//         return SQRT_PRICE_LIMITS.MIN_PRICE;
//     } else {
//         return SQRT_PRICE_LIMITS.MAX_PRICE;
//     }
    
//     // TODO: Calculate dynamic price limits based on current price and slippage
//     // This would require additional code to query the current price
// }

// // -------------------------------------------
// // Main Class Implementation
// // -------------------------------------------

// export class UniswapV4SwapAction {
//     constructor(private walletProvider: WalletProvider) {}

//     async swap(params: UniswapV4SwapParams): Promise<Transaction> {
//         elizaLogger.log(`[SWAP] Starting Uniswap V4 swap on Sepolia`, JSON.stringify({
//             inputToken: params.inputToken,
//             outputToken: params.outputToken,
//             amount: params.amount,
//             exactInput: params.exactInput,
//             slippage: params.slippage || DEFAULT_SLIPPAGE
//         }));
        
//         const walletClient = this.walletProvider.getWalletClient("sepolia");
//         const publicClient = this.walletProvider.getPublicClient("sepolia");
        
//         // Double-check token addresses again to be absolutely sure
//         let inputToken = params.inputToken;
//         let outputToken = params.outputToken;
        
//         // Get token information for both tokens
//         const [inputTokenInfo, outputTokenInfo] = await Promise.all([
//             getTokenInfo(inputToken, publicClient),
//             getTokenInfo(outputToken, publicClient)
//         ]);
        
//         elizaLogger.log(`[SWAP] Input token: ${inputTokenInfo.symbol} (${inputTokenInfo.address})`);
//         elizaLogger.log(`[SWAP] Output token: ${outputTokenInfo.symbol} (${outputTokenInfo.address})`);
        
//         // Sort tokens to ensure currency0 < currency1 as required by Uniswap V4
//         let zeroForOne: boolean;
//         let currency0: Address, currency1: Address;
        
//         if (inputToken.toLowerCase() < outputToken.toLowerCase()) {
//             currency0 = inputToken;
//             currency1 = outputToken;
//             zeroForOne = true; // We're swapping from token0 to token1
//             elizaLogger.log(`[SWAP] Token order: ${inputTokenInfo.symbol} -> ${outputTokenInfo.symbol} (zeroForOne: true)`);
//         } else {
//             currency0 = outputToken;
//             currency1 = inputToken;
//             zeroForOne = false; // We're swapping from token1 to token0
//             elizaLogger.log(`[SWAP] Token order: ${outputTokenInfo.symbol} <- ${inputTokenInfo.symbol} (zeroForOne: false)`);
//         }
        
//         // Parse amount with correct decimals from token info
//         const amount = parseUnits(params.amount, inputTokenInfo.decimals);
//         elizaLogger.log(`[SWAP] Parsed amount ${params.amount} to ${amount} (using ${inputTokenInfo.decimals} decimals)`);
        
//         // Determine if this is positive (exact input) or negative (exact output)
//         const amountSpecified = params.exactInput ? amount : -amount;
//         elizaLogger.log(`[SWAP] ${params.exactInput ? 'Exact input' : 'Exact output'} mode: ${amountSpecified.toString()}`);
        
//         // Check if user has enough balance for the swap
//         if (inputToken !== CONTRACTS.ZERO_ADDRESS) {
//             try {
//                 const balance = await publicClient.readContract({
//                     address: inputToken,
//                     abi: ERC20_ABI,
//                     functionName: "balanceOf",
//                     args: [walletClient.account.address],
//                 });
//             } catch (error) {
//                 if (error.message.includes("Insufficient")) throw error;
//                 elizaLogger.warn(`[SWAP] Error checking balance: ${error.message}. Proceeding anyway.`);
//             }
//         }
        
//         // Approve tokens if needed (skip for native ETH)
//         if (inputToken !== CONTRACTS.ZERO_ADDRESS) {
//             await this.approveTokenIfNeeded(
//                 inputToken,
//                 CONTRACTS.POOL_SWAP_TEST,
//                 amount,
//                 walletClient,
//                 publicClient
//             );
//         }
        
//         // Create the pool key - using parameters from the observed transaction
//         const poolKey: PoolKey = {
//             currency0,
//             currency1,
//             fee: params.fee || 10000, // Default to 1% fee
//             tickSpacing: params.tickSpacing || 200, // Default to 200 tick spacing
//             hooks: CONTRACTS.ZERO_ADDRESS, // No hooks for basic swaps
//         };
        
//         // Calculate price limit based on direction and slippage
//         const sqrtPriceLimitX96 = calculatePriceLimit(zeroForOne, params.slippage);
        
//         // Set swap parameters
//         const swapParams: SwapParams = {
//             zeroForOne,
//             amountSpecified: zeroForOne === params.exactInput ? amountSpecified : -amountSpecified,
//             sqrtPriceLimitX96
//         };
        
//         // Test settings - based on observed transaction
//         const testSettings: TestSettings = {
//             takeClaims: false,
//             settleUsingBurn: false
//         };
        
//         // Encode the function call
//         const data = encodeFunctionData({
//             abi: POOL_SWAP_TEST_ABI,
//             functionName: "swap",
//             args: [poolKey, swapParams, testSettings, "0x"]
//         });
        
//         // Get the value to send - only if swapping ETH
//         const value = inputToken === CONTRACTS.ZERO_ADDRESS && params.exactInput
//             ? amount
//             : 0n;
        
//         // Execute the swap
//         try {
//             elizaLogger.log(`[SWAP] Executing swap transaction...`);
            
//             const hash = await walletClient.sendTransaction({
//                 account: walletClient.account,
//                 to: CONTRACTS.POOL_SWAP_TEST,
//                 data: data as Hex,
//                 value,
//                 chain: this.walletProvider.getChainConfigs("sepolia"),
//                 kzg: {
//                     blobToKzgCommitment: (_blob: ByteArray): ByteArray => {
//                         throw new Error("Function not implemented.");
//                     },
//                     computeBlobKzgProof: (
//                         _blob: ByteArray,
//                         _commitment: ByteArray
//                     ): ByteArray => {
//                         throw new Error("Function not implemented.");
//                     },
//                 },
//             });
            
//             elizaLogger.log(`[SWAP] Transaction sent! Hash: ${hash}`);
//             elizaLogger.log(`[SWAP] Waiting for receipt...`);
            
//             const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
//             elizaLogger.log(`[SWAP] Swap complete! Status: ${receipt.status}`);
            
//             return {
//                 hash,
//                 from: walletClient.account.address,
//                 to: CONTRACTS.POOL_SWAP_TEST,
//                 value,
//                 data: data as Hex,
//                 logs: receipt.logs,
//                 chainId: this.walletProvider.getChainConfigs("sepolia").id
//             };
//         } catch (error) {
//             // More detailed error messages based on common failures
//             if (error.message.includes("insufficient funds")) {
//                 throw new Error(`Insufficient ETH for transaction fees. Please add more ETH to your wallet.`);
//             } else if (error.message.includes("user rejected")) {
//                 throw new Error(`Transaction was rejected by the user.`);
//             } else if (error.message.includes("gas required exceeds")) {
//                 throw new Error(`Transaction would exceed gas limits. Try a smaller amount or different tokens.`);
//             } else {
//                 throw new Error(`Uniswap V4 swap failed: ${error.message}`);
//             }
//         }
//     }
    
//     private async approveTokenIfNeeded(
//         token: Address,
//         spender: Address,
//         amount: bigint,
//         walletClient: any,
//         publicClient: any
//     ): Promise<void> {
//         // Get token info for better logging
//         const tokenInfo = await getTokenInfo(token, publicClient);
        
//         // Check current allowance
//         elizaLogger.log(`[APPROVE] Checking allowance for ${tokenInfo.symbol}...`);
//         let allowance: bigint;
//         try {
//             allowance = await publicClient.readContract({
//                 address: token,
//                 abi: ERC20_ABI,
//                 functionName: "allowance",
//                 args: [walletClient.account.address, spender],
//             });
//         } catch (error) {
//             elizaLogger.error(`[APPROVE] Error checking allowance: ${error.message}`);
//             throw new Error(`Failed to check ${tokenInfo.symbol} allowance: ${error.message}`);
//         }
        
//         const formattedAllowance = formatUnits(allowance, tokenInfo.decimals);
//         elizaLogger.log(`[APPROVE] Current allowance: ${formattedAllowance} ${tokenInfo.symbol}`);
        
//         const formattedAmount = formatUnits(amount, tokenInfo.decimals);
        
//         if (allowance < amount) {
//             elizaLogger.log(`[APPROVE] Need approval: ${formattedAmount} ${tokenInfo.symbol} > ${formattedAllowance} ${tokenInfo.symbol}`);
            
//             try {
//                 elizaLogger.log(`[APPROVE] Sending approval transaction for ${tokenInfo.symbol}...`);
//                 const approvalTx = await walletClient.writeContract({
//                     address: token,
//                     abi: ERC20_ABI,
//                     functionName: "approve",
//                     args: [spender, maxUint256], // Use MaxUint256 with capital M
//                 });
                
//                 elizaLogger.log(`[APPROVE] Approval transaction sent! Hash: ${approvalTx}`);
//                 elizaLogger.log(`[APPROVE] Waiting for approval confirmation...`);
                
//                 const receipt = await publicClient.waitForTransactionReceipt({ hash: approvalTx });
                
//                 if (receipt.status === "success") {
//                     elizaLogger.log(`[APPROVE] ${tokenInfo.symbol} approval confirmed!`);
//                 } else {
//                     elizaLogger.error(`[APPROVE] Approval transaction failed!`);
//                     throw new Error(`Failed to approve ${tokenInfo.symbol} token`);
//                 }
//             } catch (error) {
//                 if (error.message.includes("user rejected")) {
//                     throw new Error(`${tokenInfo.symbol} approval was rejected by the user`);
//                 } else {
//                     elizaLogger.error(`[APPROVE] Error in approval: ${error.message}`);
//                     throw new Error(`Failed to approve ${tokenInfo.symbol}: ${error.message}`);
//                 }
//             }
//         } else {
//             elizaLogger.log(`[APPROVE] Sufficient allowance already exists for ${tokenInfo.symbol}`);
//         }
//     }
// }

// export const uniswapV4SwapAction: Action = {
//     name: "uniswapV4Swap",
//     description: "Swap tokens using Uniswap V4 on Sepolia",
//     handler: async (
//         runtime: IAgentRuntime,
//         _message: Memory,
//         state: State,
//         _options: any,
//         callback?: HandlerCallback
//     ) => {
//         elizaLogger.log("[SWAP] Uniswap V4 swap action handler called");
//         const walletProvider = await initWalletProvider(runtime);
//         const action = new UniswapV4SwapAction(walletProvider);
        
//         // Compose swap context
//         const swapContext = composeContext({
//             state,
//             template: uniswapV4SwapTemplate,
//         });
        
//         // Process template with extraction fallback
//         let content;
//         try {
//             content = await generateObjectDeprecated({
//                 runtime,
//                 context: swapContext,
//                 modelClass: ModelClass.LARGE,
//             });
//             elizaLogger.log("[SWAP] Successfully parsed content from model");
//         } catch (error) {
//             elizaLogger.error(`[SWAP] Error generating object: ${error.message}`);
            
//             // Try to extract JSON from the error text if available
//             if (error.text) {
//                 elizaLogger.log("[SWAP] Attempting to extract JSON from error text");
//                 const extractedContent = extractJSONFromText(error.text);
//                 if (extractedContent) {
//                     elizaLogger.log("[SWAP] Successfully extracted JSON from error text");
//                     content = extractedContent;
//                 } else {
//                     // If we can't extract JSON, create a default content object
//                     elizaLogger.warn("[SWAP] Using default values for swap");
//                     content = {
//                         inputToken: "ETH",
//                         outputToken: "USDC",
//                         amount: "0.01",
//                         exactInput: true,
//                         chain: "sepolia",
//                         fee: 10000,
//                         tickSpacing: 200
//                     };
//                 }
//             } else {
//                 // Default values if there's no text in the error
//                 elizaLogger.warn("[SWAP] Using default values for swap (no error text)");
//                 content = {
//                     inputToken: "ETH",
//                     outputToken: "USDC",
//                     amount: "0.01",
//                     exactInput: true,
//                     chain: "sepolia",
//                     fee: 10000,
//                     tickSpacing: 200
//                 };
//             }
//         }
        
//         // Log the raw content for debugging
//         elizaLogger.log("[SWAP] Raw content:", JSON.stringify(content));
        
//         // Make sure input and output tokens are defined
//         if (!content.inputToken) {
//             elizaLogger.warn("[SWAP] Input token missing! Forcing to ETH");
//             content.inputToken = "ETH";
//         }
        
//         if (!content.outputToken) {
//             elizaLogger.warn("[SWAP] Output token missing! Forcing to USDC");
//             content.outputToken = "USDC";
//         }
        
//         // Resolve token addresses
//         const resolvedInput = resolveTokenAddress(content.inputToken as string);
//         const resolvedOutput = resolveTokenAddress(content.outputToken as string);
        
//         elizaLogger.log(`[SWAP] Resolved input token: "${content.inputToken}" -> "${resolvedInput}"`);
//         elizaLogger.log(`[SWAP] Resolved output token: "${content.outputToken}" -> "${resolvedOutput}"`);
        
//         // Prepare swap parameters
//         const swapParams: UniswapV4SwapParams = {
//             inputToken: resolvedInput,
//             outputToken: resolvedOutput,
//             amount: content.amount || "0.01", // Default if missing
//             exactInput: content.exactInput !== undefined ? content.exactInput : true,
//             chain: "sepolia",
//             fee: content.fee || 10000,
//             tickSpacing: content.tickSpacing || 200,
//             slippage: content.slippage || DEFAULT_SLIPPAGE
//         };
        
//         try {
//             elizaLogger.log("[SWAP] Starting swap execution...");
//             const swapResp = await action.swap(swapParams);
            
//             if (callback) {
//                 // Get token info for display
//                 const publicClient = walletProvider.getPublicClient("sepolia");
//                 const [inputTokenInfo, outputTokenInfo] = await Promise.all([
//                     getTokenInfo(swapParams.inputToken, publicClient),
//                     getTokenInfo(swapParams.outputToken, publicClient)
//                 ]);
                
//                 // Create user-friendly success message
//                 const message = `Successfully swapped ${swapParams.exactInput ? 'exactly ' : ''}${swapParams.amount} ${inputTokenInfo.symbol} ${swapParams.exactInput ? 'for' : 'to receive exactly'} ${outputTokenInfo.symbol} using Uniswap V4\n\nTransaction Hash: ${swapResp.hash}`;
                
//                 callback({
//                     text: message,
//                     content: {
//                         success: true,
//                         hash: swapResp.hash,
//                         inputToken: swapParams.inputToken,
//                         outputToken: swapParams.outputToken,
//                         inputTokenSymbol: inputTokenInfo.symbol,
//                         outputTokenSymbol: outputTokenInfo.symbol,
//                         amount: swapParams.amount,
//                         exactInput: swapParams.exactInput
//                     },
//                 });
//             }
//             return true;
//         } catch (error) {
//             // Create user-friendly error message
//             elizaLogger.error("[SWAP] Error in Uniswap V4 swap:", error.message);
//             if (callback) {
//                 callback({ 
//                     text: `Error executing Uniswap V4 swap: ${error.message}`,
//                     content: { error: error.message }
//                 });
//             }
//             return false;
//         }
//     },
//     validate: async (runtime: IAgentRuntime) => {
//         const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
//         return typeof privateKey === "string" && privateKey.startsWith("0x");
//     },
//     examples: [
//         [
//             {
//                 user: "user",
//                 content: {
//                     text: "Swap 0.1 ETH for USDC on Uniswap V4 on Sepolia",
//                     action: "UNISWAP_V4_SWAP",
//                 },
//             },
//         ],
//         [
//             {
//                 user: "user",
//                 content: {
//                     text: "Swap USDC to get exactly 0.05 ETH on Uniswap V4 on Sepolia",
//                     action: "UNISWAP_V4_SWAP",
//                 },
//             },
//         ],
//     ],
//     similes: ["UNISWAP_V4_SWAP", "V4_SWAP", "UNISWAP_SWAP"],
// };