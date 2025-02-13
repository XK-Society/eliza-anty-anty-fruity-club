import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { createDeFiDiveService } from "../services";
import type { DeFiDiveArticle } from "../types";

export const getDefidiveNewsAction: Action = {
    name: "DEFIDIVE_GET_NEWS",
    similes: [
        "CRYPTO NEWS",
        "DEFI NEWS",
        "BLOCKCHAIN NEWS",
        "CRYPTOCURRENCY",
        "CRYPTO HEADLINES"
    ],
    description: "Get the latest DeFi and crypto news articles.",
    validate: async () => true,
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const defidiveService = createDeFiDiveService();

        try {
            const newsData = await defidiveService.getLatestNews();
            elizaLogger.success("Successfully fetched DeFiDive news");
            
            if (callback) {
                const formattedNews = newsData.articles
                    .slice(0, 5) // Limit to 5 most recent articles
                    .map(article => {
                        const date = new Date(article.written_datetime * 1000);
                        const tags = article.content_tags.length ? 
                            `[${article.content_tags.join(', ')}]` : '';
                        
                        return `📰 ${article.main_headline}
   Source: ${article.display_name} ${tags}
   Link: ${article.url}
   Published: ${date.toLocaleString()}\n`;
                    })
                    .join('\n');
                
                callback({
                    text: `Here are the latest crypto news headlines:\n\n${formattedNews}`
                });
                return true;
            }
        } catch (error: any) {
            elizaLogger.error("Error in DeFiDive plugin handler:", error);
            callback({
                text: `Error fetching crypto news: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's the latest in crypto?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me fetch the latest crypto news for you.",
                    action: "DEFIDIVE_GET_NEWS",
                },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the latest DeFi news",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll get you the latest DeFi and crypto headlines.",
                    action: "DEFIDIVE_GET_NEWS",
                },
            }
        ]
    ],
};