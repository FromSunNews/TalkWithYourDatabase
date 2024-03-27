"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require('dotenv').config();
exports.env = {
    APP_HOST: process.env.APP_HOST,
    APP_PORT: process.env.APP_PORT,
    BUILD_MODE: process.env.BUILD_MODE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    BRAVE_SEARCH_API_KEY: process.env.BRAVE_SEARCH_API_KEY,
    SERPER_API: process.env.SERPER_API,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    LANGCHAIN_TRACING_V2: process.env.LANGCHAIN_TRACING_V2,
    LANGCHAIN_ENDPOINT: process.env.LANGCHAIN_ENDPOINT,
    LANGCHAIN_API_KEY: process.env.LANGCHAIN_API_KEY,
    LANGCHAIN_PROJECT: process.env.LANGCHAIN_PROJECT,
    // supabase
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
    SUPABASE_URL_LC_CHATBOT: process.env.SUPABASE_URL_LC_CHATBOT,
    // facebook messger
    ACCESS_TOKEN_MESSENGER: process.env.ACCESS_TOKEN_MESSENGER,
    FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
    VERIFY_TOKEN_MESSENGER: process.env.VERIFY_TOKEN_MESSENGER,
};
//# sourceMappingURL=environment.js.map