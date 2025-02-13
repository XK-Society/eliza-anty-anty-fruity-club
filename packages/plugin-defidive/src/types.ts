export interface DeFiDiveArticle {
    url: string;
    website_name: string;
    main_headline: string;
    content_tags: string[];
    display_name: string;
    is_live: boolean;
    written_datetime: number;
}

export interface DeFiDiveResponse {
    articles: DeFiDiveArticle[];
}