// src/index.ts
import { Plugin } from "@elizaos/core";
import { validateTaskAction } from "./actions/validateTask";

export const taskValidatorPlugin: Plugin = {
    name: "task-validator",
    description: "Task Validator plugin for Eliza",
    actions: [
        validateTaskAction
    ],
    evaluators: [],
    providers: [],
};

export default taskValidatorPlugin;