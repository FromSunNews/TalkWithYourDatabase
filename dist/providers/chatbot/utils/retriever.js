"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRetrieverSupabase = void 0;
const supabase_1 = require("langchain/vectorstores/supabase");
const openai_1 = require("langchain/embeddings/openai");
const supabase_js_1 = require("@supabase/supabase-js");
const environment_1 = require("../../../config/environment");
const getRetrieverSupabase = () => {
    const embeddings = new openai_1.OpenAIEmbeddings();
    const sbApiKey = environment_1.env.SUPABASE_API_KEY || "";
    const sbUrl = environment_1.env.SUPABASE_URL_LC_CHATBOT || "";
    const client = (0, supabase_js_1.createClient)(sbUrl, sbApiKey);
    const vectorStore = new supabase_1.SupabaseVectorStore(embeddings, {
        client,
        tableName: 'documents',
        queryName: 'match_documents'
    });
    const retriever = vectorStore.asRetriever({
        k: 3 //lấy số docs = 10 
    });
    return retriever;
};
exports.getRetrieverSupabase = getRetrieverSupabase;
//# sourceMappingURL=retriever.js.map