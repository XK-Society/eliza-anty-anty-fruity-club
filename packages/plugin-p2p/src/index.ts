// src/index.ts
import { Plugin } from "@elizaos/core";
import { postCreateEigenAction } from "./actions/postCreateEigen";
import { postRestakeAction } from "./actions/postRestake";
import { getRestakeAction } from "./actions/getRestake";
import { postDepositAction } from "./actions/postDeposit";
import { postActivetxAction } from "./actions/postActivetx";
import { getValidatorAction } from "./actions/getValidator";
import { postDelegateToAction } from "./actions/postDelegateTo";

export const p2pPlugin: Plugin = {
    name: "p2p",
    description: "P2P EigenLayer restaking plugin for Eliza",
    actions: [
        postCreateEigenAction,    // Create EigenPod for restaking
        postRestakeAction,        // Create a restaking request
        getRestakeAction,         // Check status of a restaking request
        postDepositAction,        // Create deposit transaction
        postActivetxAction,       // Verify withdrawal credentials
        getValidatorAction,       // Get list of operators
        postDelegateToAction      // Delegate to an operator
    ],
    evaluators: [],
    providers: [],
};

export default p2pPlugin;