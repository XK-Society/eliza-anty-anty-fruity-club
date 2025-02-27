// src/environments.ts
import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const p2pEnvSchema = z.object({
    P2P_API_KEY: z.string().min(1, "P2P API key is required"),
    P2P_API_URL: z.string().url("Valid URL is required"),
});

export type P2PConfig = z.infer<typeof p2pEnvSchema>;

export async function validateP2PConfig(
    runtime: IAgentRuntime
): Promise<P2PConfig> {
    try {
        const config = {
            P2P_API_KEY: runtime.getSetting("P2P_API_KEY"),
            P2P_API_URL: runtime.getSetting("P2P_API_URL") || "https://api.p2p.org",
        };
        return p2pEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `P2P API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}