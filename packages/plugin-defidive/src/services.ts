import type { DeFiDiveArticle, DeFiDiveResponse } from "./types";

const BASE_URL = "https://api.defidive.com/news/article/latest";

export const createDeFiDiveService = () => {
    const getLatestNews = async (numArticles: number = 5): Promise<DeFiDiveResponse> => {
        try {
            const url = `${BASE_URL}?numArticlesPerSource=${numArticles}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error?.message || response.statusText);
            }

            const data = await response.json();
            return {
                articles: data.articles.map((article: DeFiDiveArticle) => ({
                    ...article,
                    written_datetime: article.written_datetime || 0
                })).sort((a, b) => b.written_datetime - a.written_datetime)
            };
        } catch (error: any) {
            console.error("DeFiDive API Error:", error.message);
            throw error;
        }
    };

    return { getLatestNews };
};