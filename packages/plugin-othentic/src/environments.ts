// src/environments.ts
import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const taskValidatorEnvSchema = z.object({
    TASK_VALIDATOR_API_URL: z.string().url("Valid URL is required").default("http://localhost:4003"),
});

export type TaskValidatorConfig = z.infer<typeof taskValidatorEnvSchema>;

export async function validateTaskValidatorConfig(
    runtime: IAgentRuntime
): Promise<TaskValidatorConfig> {
    try {
        const config = {
            TASK_VALIDATOR_API_URL: runtime.getSetting("TASK_VALIDATOR_API_URL") || "http://localhost:4003",
        };
        return taskValidatorEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Task Validator API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}