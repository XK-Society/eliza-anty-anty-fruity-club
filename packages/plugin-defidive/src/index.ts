import { Plugin } from "@elizaos/core";
import { getDefidiveNewsAction } from "./actions/getDefidiveNews";

export const defidivePlugin: Plugin = {
    name: "defidive",
    description: "DeFiDive news plugin for Eliza",
    actions: [getDefidiveNewsAction],
    evaluators: [],
    providers: [],
};

export default defidivePlugin;