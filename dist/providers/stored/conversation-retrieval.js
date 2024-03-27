"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRetrieval = void 0;
const openai_1 = require("@langchain/openai");
const combine_documents_1 = require("langchain/chains/combine_documents");
const history_aware_retriever_1 = require("langchain/chains/history_aware_retriever");
const retrieval_1 = require("langchain/chains/retrieval");
const cheerio_1 = require("langchain/document_loaders/web/cheerio");
const prompts_1 = require("langchain/prompts");
const schema_1 = require("langchain/schema");
const text_splitter_1 = require("langchain/text_splitter");
const memory_1 = require("langchain/vectorstores/memory");
const conversationRetrieval = async () => {
    const createVectorStore = async () => {
        // load data from webpage
        const loader = new cheerio_1.CheerioWebBaseLoader("https://js.langchain.com/docs/expression_language/");
        const docs = await loader.load();
        // split text into array Document and store in vector store
        const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            // each 200 characters for a chunk
            chunkSize: 200,
            // overlap 20 characters of each chunk
            chunkOverlap: 20
        });
        const splitDocs = await splitter.splitDocuments(docs);
        const embeddings = new openai_1.OpenAIEmbeddings();
        // store in vector store
        const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
        return vectorStore;
    };
    //create Retrieval chain 
    const createChain = async (vectorStore) => {
        // create a model instance
        const model = new openai_1.ChatOpenAI({
            modelName: "gpt-3.5-turbo-0125",
            temperature: 0.4
        });
        // create prompt instance
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            // providde context property from system
            ["system", "Answer the user's question based on the following context: {context}"],
            // providde chat_history property typeof string
            new prompts_1.MessagesPlaceholder("chat_history"),
            // providde input property from user
            ["user", "{input}"],
        ]);
        const chain = await (0, combine_documents_1.createStuffDocumentsChain)({
            llm: model,
            prompt,
        });
        const retriever = vectorStore.asRetriever({
            k: 2
        });
        const retrieverPrompt = prompts_1.ChatPromptTemplate.fromMessages([
            new prompts_1.MessagesPlaceholder("chat_history"),
            ["user", "{input}"],
            ["user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation"]
        ]);
        const historyAwareRetrieval = await (0, history_aware_retriever_1.createHistoryAwareRetriever)({
            llm: model,
            retriever,
            rephrasePrompt: retrieverPrompt
        });
        const conversationChain = await (0, retrieval_1.createRetrievalChain)({
            combineDocsChain: chain,
            retriever: historyAwareRetrieval
        });
        return conversationChain;
    };
    const vectorStore = await createVectorStore();
    const chain = await createChain(vectorStore);
    const chatHistory = [
        new schema_1.HumanMessage("Hello"),
        new schema_1.AIMessage("Hi, how can I help you?"),
        new schema_1.HumanMessage("My name is FSN"),
        new schema_1.AIMessage("Hi FSN, How can I help you?"),
        new schema_1.HumanMessage("What is LCEL"),
        new schema_1.AIMessage("LCEL stands for Langchain Expression Language")
    ];
    const response = await chain.invoke({
        input: "Tên của tôi là gì ?",
        chat_history: chatHistory
    });
    console.log("🚀 ~ retrievalChain ~ response:", response.answer);
};
exports.conversationRetrieval = conversationRetrieval;
//# sourceMappingURL=conversation-retrieval.js.map