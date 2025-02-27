// src/index.ts
export * from "./actions/bridge";
export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";
export * from "./actions/uniswap-v4-liquidity";
export * from "./actions/uniswap-v4-swap";

import type { Plugin } from "@elizaos/core";
import { bridgeAction } from "./actions/bridge";
import { swapAction } from "./actions/swap";
import { transferAction } from "./actions/transfer";
import { evmWalletProvider } from "./providers/wallet";
// import { uniswapV4SwapAction } from "./actions/uniswap-v4-swap";
// import { uniswapV4LiquidityAction } from "./actions/uniswap-v4-liquidity";

export const evmPlugin: Plugin = {
    name: "evm",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [
        transferAction, 
        bridgeAction, 
        swapAction,
        // uniswapV4SwapAction,
        // uniswapV4LiquidityAction
    ],
};

export default evmPlugin;