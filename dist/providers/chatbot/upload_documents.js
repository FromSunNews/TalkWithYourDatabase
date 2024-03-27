"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiWebsitesToSupabaseCloud = exports.getWebsitesPromise = exports.uploadWebsiteToSupabaseCloud = exports.uploadDocumentsToSupabaseCloud = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const directory_1 = require("langchain/document_loaders/fs/directory");
const pdf_1 = require("langchain/document_loaders/fs/pdf");
const cheerio_1 = require("langchain/document_loaders/web/cheerio");
const openai_1 = require("langchain/embeddings/openai");
const text_splitter_1 = require("langchain/text_splitter");
const supabase_1 = require("langchain/vectorstores/supabase");
const uploadDocumentsToSupabaseCloud = async () => {
    try {
        const directoryLoader = new directory_1.DirectoryLoader(`src/documents/`, {
            ".pdf": (path) => new pdf_1.PDFLoader(path),
        });
        const docs = await directoryLoader.load();
        const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 500,
            // separators: ['\n\n', '\n', ' ', ''], // default setting
            chunkOverlap: 100
        });
        const splitDocs = await textSplitter.splitDocuments(docs);
        const sbApiKey = process.env.SUPABASE_API_KEY;
        const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
        const openAIApiKey = process.env.OPENAI_API_KEY;
        const client = (0, supabase_js_1.createClient)(sbUrl || "", sbApiKey || "");
        const result = await supabase_1.SupabaseVectorStore.fromDocuments(splitDocs, new openai_1.OpenAIEmbeddings({ openAIApiKey }), {
            client,
            tableName: 'documents',
        });
        console.log("🚀 ~ uploadDocumentsToSupabaseCloud ~ result:", result);
    }
    catch (err) {
        console.log(err);
    }
};
exports.uploadDocumentsToSupabaseCloud = uploadDocumentsToSupabaseCloud;
const uploadWebsiteToSupabaseCloud = async () => {
    try {
        const loader = new cheerio_1.CheerioWebBaseLoader("https://itviec.com/blog/mau-cv-chuan-trinh-bay-du-an-it/", {
            selector: "section" // tổng hợp bài viết trên IT viec
        });
        const docs = await loader.load();
        const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 500,
            // separators: ['\n\n', '\n', ' ', ''], // default setting
            chunkOverlap: 100
        });
        const splitDocs = await textSplitter.splitDocuments(docs);
        const sbApiKey = process.env.SUPABASE_API_KEY;
        const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
        const openAIApiKey = process.env.OPENAI_API_KEY;
        const client = (0, supabase_js_1.createClient)(sbUrl || "", sbApiKey || "");
        const result = await supabase_1.SupabaseVectorStore.fromDocuments(splitDocs, new openai_1.OpenAIEmbeddings({ openAIApiKey }), {
            client,
            tableName: 'documents',
        });
        console.log("🚀 ~ uploadDocumentsToSupabaseCloud ~ result:", result);
    }
    catch (err) {
        console.log(err);
    }
};
exports.uploadWebsiteToSupabaseCloud = uploadWebsiteToSupabaseCloud;
const getWebsitesPromise = (websiteUrl) => {
    return new Promise((resolve, reject) => {
        try {
            const loader = new cheerio_1.CheerioWebBaseLoader(websiteUrl, {
                selector: "section" // tổng hợp bài viết trên IT viec
            });
            resolve(loader.load());
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.getWebsitesPromise = getWebsitesPromise;
const uploadMultiWebsitesToSupabaseCloud = async () => {
    try {
        const websiteUrls = ["https://itviec.com/blog/javascript-developer/", "https://itviec.com/blog/front-end-developer-la-gi/"];
        const promiseArr = [];
        let docsArr = [];
        websiteUrls.forEach((url) => {
            promiseArr.push((0, exports.getWebsitesPromise)(url));
        });
        await Promise.all(promiseArr)
            .then((results) => {
            docsArr = results.flat();
        })
            .catch((err) => {
            console.log("🚀 ~ getMutilImage ~ err:", err);
        });
        const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 500,
            // separators: ['\n\n', '\n', ' ', ''], // default setting
            chunkOverlap: 100
        });
        const splitDocs = await textSplitter.splitDocuments(docsArr);
        console.log("🚀 ~ uploadMultiWebsitesToSupabaseCloud ~ splitDocs:", splitDocs);
        const sbApiKey = process.env.SUPABASE_API_KEY;
        const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
        const openAIApiKey = process.env.OPENAI_API_KEY;
        const client = (0, supabase_js_1.createClient)(sbUrl || "", sbApiKey || "");
        const result = await supabase_1.SupabaseVectorStore.fromDocuments(splitDocs, new openai_1.OpenAIEmbeddings({ openAIApiKey }), {
            client,
            tableName: 'documents',
        });
        console.log("🚀 ~ uploadDocumentsToSupabaseCloud ~ result:", result);
    }
    catch (err) {
        console.log(err);
    }
};
exports.uploadMultiWebsitesToSupabaseCloud = uploadMultiWebsitesToSupabaseCloud;
//# sourceMappingURL=upload_documents.js.map