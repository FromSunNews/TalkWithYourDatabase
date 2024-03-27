"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievalChain = void 0;
const openai_1 = require("@langchain/openai");
const combine_documents_1 = require("langchain/chains/combine_documents");
const retrieval_1 = require("langchain/chains/retrieval");
const cheerio_1 = require("langchain/document_loaders/web/cheerio");
const prompts_1 = require("langchain/prompts");
const text_splitter_1 = require("langchain/text_splitter");
const memory_1 = require("langchain/vectorstores/memory");
const retrievalChain = async () => {
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-0125",
        temperature: 0.4
    });
    const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
    Answer the user's question. 
    Context: {context}
    Question: {input}
  `);
    // const chain = prompt.pipe(model)
    const chain = await (0, combine_documents_1.createStuffDocumentsChain)({
        llm: model,
        prompt,
    });
    // load data from webpage 
    const loader = new cheerio_1.CheerioWebBaseLoader("https://js.langchain.com/docs/expression_language/");
    const docs = await loader.load();
    const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
    });
    const splitDocs = await splitter.splitDocuments(docs);
    const embeddings = new openai_1.OpenAIEmbeddings();
    const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    // Retrieve data
    const retriever = vectorStore.asRetriever({
        k: 2
    });
    const retrievalChain = await (0, retrieval_1.createRetrievalChain)({
        combineDocsChain: chain,
        retriever
    });
    const response = await retrievalChain.invoke({
        input: "What is LCLE?"
    });
    console.log("🚀 ~ retrievalChain ~ response:", response);
};
exports.retrievalChain = retrievalChain;
//# sourceMappingURL=retrieval-chain.js.map