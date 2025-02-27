// import { type ByteArray, type Hex, parseUnits, type Address, encodeFunctionData, maxUint256 } from "viem";
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
// import { uniswapV4LiquidityTemplate } from "../templates/index";

// // Uniswap V4 specific types
// interface PoolKey {
//     currency0: Address;
//     currency1: Address;
//     fee: number;
//     tickSpacing: number;
//     hooks: Address;
// }

// interface ModifyLiquidityParams {
//     tickLower: number;
//     tickUpper: number;
//     liquidityDelta: bigint;
//     salt: `0x${string}`;
// }

// interface UniswapV4LiquidityParams {
//     token0: Address;
//     token1: Address;
//     amount0: string;
//     amount1: string;
//     fee?: number;
//     tickSpacing?: number;
//     minPrice?: string;
//     maxPrice?: string;
// }

// // Contract addresses on Sepolia
// const CONTRACTS = {
//     POOL_MANAGER: "0xE03A1074c86CFeDd5C142C4F04F1a1536e20354" as Address,
//     POOL_MODIFY_LIQUIDITY_TEST: "0x0c47823803a644c94c4ce1c1e7b9a087e411b0a" as Address,
//     ZERO_ADDRESS: "0x0000000000000000000000000000000000000000" as Address,
//     USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
// };

// // Token symbol to address mapping
// const TOKEN_MAP: Record<string, Address> = {
//     "eth": CONTRACTS.ZERO_ADDRESS,
//     "ETH": CONTRACTS.ZERO_ADDRESS,
//     "Eth": CONTRACTS.ZERO_ADDRESS,
//     "usdc": CONTRACTS.USDC,
//     "USDC": CONTRACTS.USDC,
//     "Usdc": CONTRACTS.USDC,
// };

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
//     }
// ];

// // Pool Modify Liquidity Test ABI
// const POOL_MODIFY_LIQUIDITY_TEST_ABI = [
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
//                 "internalType":"struct PoolKey",
//                 "name":"key",
//                 "type":"tuple"
//             },
//             {
//                 "components": [
//                     {"internalType":"int24","name":"tickLower","type":"int24"},
//                     {"internalType":"int24","name":"tickUpper","type":"int24"},
//                     {"internalType":"int256","name":"liquidityDelta","type":"int256"},
//                     {"internalType":"bytes32","name":"salt","type":"bytes32"}
//                 ],
//                 "internalType":"struct IPoolManager.ModifyLiquidityParams",
//                 "name":"params",
//                 "type":"tuple"
//             },
//             {"internalType":"bytes","name":"hookData","type":"bytes"},
//             {"internalType":"bool","name":"settleUsingBurn","type":"bool"},
//             {"internalType":"bool","name":"takeClaims","type":"bool"}
//         ],
//         "name":"modifyLiquidity",
//         "outputs":[{"internalType":"BalanceDelta","name":"delta","type":"int256"}],
//         "stateMutability":"payable",
//         "type":"function"
//     }
// ];

// // Helper functions for price <-> tick conversions
// function priceToTick(price: number, tickSpacing: number): number {
//     // Formula to convert price to tick: log_1.0001(price)
//     const tick = Math.floor(Math.log(price) / Math.log(1.0001));
//     // Round to the nearest tick spacing
//     return Math.floor(tick / tickSpacing) * tickSpacing;
// }

// function getFullRange(tickSpacing: number): [number, number] {
//     // Min and max tick values, must be divisible by tickSpacing
//     return [
//         Math.ceil(-887272 / tickSpacing) * tickSpacing,
//         Math.floor(887272 / tickSpacing) * tickSpacing
//     ];
// }

// // Standalone token resolution function
// function resolveTokenAddress(tokenInput: string): Address {
//     // For debugging
//     elizaLogger.log(`Resolving token: "${tokenInput}"`);
    
//     // If it's null or undefined, return zero address (ETH)
//     if (!tokenInput) {
//         elizaLogger.log('Token input was null/undefined, defaulting to ETH (zero address)');
//         return CONTRACTS.ZERO_ADDRESS;
//     }
    
//     // Special case for ETH (any case)
//     if (tokenInput.toLowerCase() === 'eth') {
//         elizaLogger.log('Resolved "ETH" to zero address');
//         return CONTRACTS.ZERO_ADDRESS;
//     }
    
//     // If it's already an address, return it
//     if (tokenInput.startsWith('0x') && tokenInput.length === 42) {
//         elizaLogger.log(`Input appears to be an address: ${tokenInput}`);
//         return tokenInput as Address;
//     }
    
//     // Check token map for known symbols
//     const token = TOKEN_MAP[tokenInput] || TOKEN_MAP[tokenInput.toLowerCase()];
//     if (token) {
//         elizaLogger.log(`Resolved "${tokenInput}" to address ${token} from token map`);
//         return token;
//     }
    
//     // If we get here, we couldn't resolve it properly
//     elizaLogger.warn(`⚠️ Could not resolve token "${tokenInput}" to a valid address. Using as-is but this may cause errors.`);
//     return tokenInput as Address;
// }

// export class UniswapV4LiquidityAction {
//     constructor(private walletProvider: WalletProvider) {}

//     async addLiquidity(params: UniswapV4LiquidityParams): Promise<Transaction> {
//         elizaLogger.log(`Adding liquidity to Uniswap V4 on Sepolia`);
        
//         const walletClient = this.walletProvider.getWalletClient("sepolia");
//         const publicClient = this.walletProvider.getPublicClient("sepolia");
        
//         // Resolve token addresses from symbols if needed
//         const token0 = resolveTokenAddress(params.token0 as string);
//         const token1 = resolveTokenAddress(params.token1 as string);
        
//         // Verify tokens are in correct order (token0 < token1)
//         if (token0.toLowerCase() >= token1.toLowerCase()) {
//             throw new Error("token0 address must be less than token1 address");
//         }
        
//         // Get token decimals
//         let decimals0 = 18; // Default to 18 for ETH
//         let decimals1 = 18; // Default to 18 for ETH
        
//         if (token0 !== CONTRACTS.ZERO_ADDRESS) {
//             try {
//                 decimals0 = await publicClient.readContract({
//                     address: token0,
//                     abi: ERC20_ABI,
//                     functionName: "decimals",
//                 }) as number;
//             } catch (error) {
//                 elizaLogger.error(`Error reading decimals for token0: ${error.message}`);
//             }
//         }
        
//         if (token1 !== CONTRACTS.ZERO_ADDRESS) {
//             try {
//                 decimals1 = await publicClient.readContract({
//                     address: token1,
//                     abi: ERC20_ABI,
//                     functionName: "decimals",
//                 }) as number;
//             } catch (error) {
//                 elizaLogger.error(`Error reading decimals for token1: ${error.message}`);
//             }
//         }
        
//         // Parse amounts
//         const amount0 = parseUnits(params.amount0, decimals0);
//         const amount1 = parseUnits(params.amount1, decimals1);
        
//         // Set fee and tick spacing - using values from observed transactions
//         const fee = params.fee || 10000;  // Default to 1% fee (10000)
//         const tickSpacing = params.tickSpacing || 200;  // Default to 200 tick spacing
        
//         // Determine tick range
//         let tickLower: number, tickUpper: number;
        
//         if (params.minPrice && params.maxPrice) {
//             // Convert price to tick
//             tickLower = priceToTick(parseFloat(params.minPrice), tickSpacing);
//             tickUpper = priceToTick(parseFloat(params.maxPrice), tickSpacing);
//         } else {
//             // Use full range
//             [tickLower, tickUpper] = getFullRange(tickSpacing);
//         }
        
//         // Approve tokens if needed
//         if (token0 !== CONTRACTS.ZERO_ADDRESS) {
//             await this.approveTokenIfNeeded(
//                 token0, 
//                 CONTRACTS.POOL_MODIFY_LIQUIDITY_TEST, 
//                 amount0,
//                 walletClient,
//                 publicClient
//             );
//         }
        
//         if (token1 !== CONTRACTS.ZERO_ADDRESS) {
//             await this.approveTokenIfNeeded(
//                 token1, 
//                 CONTRACTS.POOL_MODIFY_LIQUIDITY_TEST, 
//                 amount1,
//                 walletClient,
//                 publicClient
//             );
//         }
        
//         // Create the pool key
//         const poolKey: PoolKey = {
//             currency0: token0,
//             currency1: token1,
//             fee,
//             tickSpacing,
//             hooks: CONTRACTS.ZERO_ADDRESS, // No hooks for basic liquidity
//         };
        
//         // Create modify liquidity params
//         // For simplifying this example, we'll use a basic implementation
//         // A real implementation would calculate exact liquidityDelta based on amounts and price range
//         const modifyParams: ModifyLiquidityParams = {
//             tickLower,
//             tickUpper,
//             liquidityDelta: BigInt(1000000000000000000), // Placeholder, would calculate precisely in production
//             salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
//         };
        
//         // Encode the function call
//         const data = encodeFunctionData({
//             abi: POOL_MODIFY_LIQUIDITY_TEST_ABI,
//             functionName: "modifyLiquidity",
//             args: [poolKey, modifyParams, "0x", true, true]
//         });
        
//         // Calculate native value to send
//         const nativeValue = token0 === CONTRACTS.ZERO_ADDRESS ? amount0 : 
//                            (token1 === CONTRACTS.ZERO_ADDRESS ? amount1 : 0n);
        
//         // Execute the liquidity addition
//         try {
//             const hash = await walletClient.sendTransaction({
//                 account: walletClient.account,
//                 to: CONTRACTS.POOL_MODIFY_LIQUIDITY_TEST,
//                 data: data as Hex,
//                 value: nativeValue,
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
            
//             const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
//             return {
//                 hash,
//                 from: walletClient.account.address,
//                 to: CONTRACTS.POOL_MODIFY_LIQUIDITY_TEST,
//                 value: nativeValue,
//                 data: data as Hex,
//                 logs: receipt.logs,
//                 chainId: this.walletProvider.getChainConfigs("sepolia").id
//             };
//         } catch (error) {
//             throw new Error(`Uniswap V4 add liquidity failed: ${error.message}`);
//         }
//     }
    
//     private async approveTokenIfNeeded(
//         token: Address,
//         spender: Address,
//         amount: bigint,
//         walletClient: any,
//         publicClient: any
//     ): Promise<void> {
//         // Check current allowance
//         const allowance = await publicClient.readContract({
//             address: token,
//             abi: ERC20_ABI,
//             functionName: "allowance",
//             args: [walletClient.account.address, spender],
//         });
        
//         if (allowance < amount) {
//             elizaLogger.log(`Approving ${token} for liquidity provision...`);
//             const approvalTx = await walletClient.writeContract({
//                 address: token,
//                 abi: ERC20_ABI,
//                 functionName: "approve",
//                 args: [spender, maxUint256], // Use MaxUint256 with capital M
//             });
            
//             await publicClient.waitForTransactionReceipt({ hash: approvalTx });
//             elizaLogger.log(`Approval transaction confirmed: ${approvalTx}`);
//         }
//     }
// }

// export const uniswapV4LiquidityAction: Action = {
//     name: "uniswapV4Liquidity",
//     description: "Add liquidity to Uniswap V4 pools on Sepolia",
//     handler: async (
//         runtime: IAgentRuntime,
//         _message: Memory,
//         state: State,
//         _options: any,
//         callback?: HandlerCallback
//     ) => {
//         elizaLogger.log("Uniswap V4 liquidity action handler called");
//         const walletProvider = await initWalletProvider(runtime);
//         const action = new UniswapV4LiquidityAction(walletProvider);
        
//         // Compose liquidity context
//         const liquidityContext = composeContext({
//             state,
//             template: uniswapV4LiquidityTemplate,
//         });
        
//         const content = await generateObjectDeprecated({
//             runtime,
//             context: liquidityContext,
//             modelClass: ModelClass.LARGE,
//         });
        
//         // Log raw content for debugging
//         elizaLogger.log("Raw content from template:", JSON.stringify(content));
        
//         const liquidityParams: UniswapV4LiquidityParams = {
//             // Use standalone function to resolve tokens
//             token0: resolveTokenAddress(content.token0 as string),
//             token1: resolveTokenAddress(content.token1 as string),
//             amount0: content.amount0,
//             amount1: content.amount1,
//             fee: content.fee || 10000,  // Default to 1% fee (10000)
//             tickSpacing: content.tickSpacing || 200,  // Default to 200 tick spacing
//             minPrice: content.minPrice,
//             maxPrice: content.maxPrice,
//         };
        
//         try {
//             const liquidityResp = await action.addLiquidity(liquidityParams);
//             if (callback) {
//                 // Create readable token names for display
//                 const token0Display = liquidityParams.token0 === CONTRACTS.ZERO_ADDRESS ? 
//                     "ETH" : (Object.entries(TOKEN_MAP).find(([_, addr]) => addr === liquidityParams.token0)?.[0]?.toUpperCase() || liquidityParams.token0);
                
//                 const token1Display = liquidityParams.token1 === CONTRACTS.ZERO_ADDRESS ? 
//                     "ETH" : (Object.entries(TOKEN_MAP).find(([_, addr]) => addr === liquidityParams.token1)?.[0]?.toUpperCase() || liquidityParams.token1);
                
//                 callback({
//                     text: `Successfully added liquidity to Uniswap V4 pool (${token0Display}/${token1Display})\nAmount0: ${liquidityParams.amount0}\nAmount1: ${liquidityParams.amount1}\nTransaction Hash: ${liquidityResp.hash}`,
//                     content: {
//                         success: true,
//                         hash: liquidityResp.hash,
//                         token0: liquidityParams.token0,
//                         token1: liquidityParams.token1,
//                         amount0: liquidityParams.amount0,
//                         amount1: liquidityParams.amount1,
//                         fee: liquidityParams.fee,
//                     },
//                 });
//             }
//             return true;
//         } catch (error) {
//             elizaLogger.error("Error in Uniswap V4 liquidity:", error.message);
//             if (callback) {
//                 callback({ 
//                     text: `Error adding Uniswap V4 liquidity: ${error.message}`,
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
//                     text: "Add liquidity to Uniswap V4 on Sepolia with 0.1 ETH and 100 USDC",
//                     action: "UNISWAP_V4_LIQUIDITY",
//                 },
//             },
//         ],
//     ],
//     similes: ["UNISWAP_V4_LIQUIDITY", "V4_LIQUIDITY", "ADD_LIQUIDITY"],
// };