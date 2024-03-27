"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const openai_1 = require("@langchain/openai");
const environment_1 = require("../../../config/environment");
const agents_1 = require("langchain/agents");
const directory_1 = require("langchain/document_loaders/fs/directory");
const pdf_1 = require("langchain/document_loaders/fs/pdf");
const prompts_1 = require("langchain/prompts");
const schema_1 = require("langchain/schema");
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const text_splitter_1 = require("langchain/text_splitter");
const retriever_1 = require("langchain/tools/retriever");
const memory_1 = require("langchain/vectorstores/memory");
const readline_1 = __importDefault(require("readline"));
const wikipedia_query_run_1 = require("@langchain/community/tools/wikipedia_query_run");
async function createVectorStore() {
    const directoryLoader = new directory_1.DirectoryLoader(`src/documents/`, {
        ".pdf": (path) => new pdf_1.PDFLoader(path),
    });
    const docs = await directoryLoader.load();
    console.log({ docs });
    const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    const embeddings = new openai_1.OpenAIEmbeddings();
    // store in vector store
    const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    return vectorStore;
}
//create Retrieval chain 
const createChain = async (vectorStore) => {
    // create a model instance
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-0125",
        temperature: 0.2
    });
    // create prompt instance
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        // providde context property from system
        ["system", "You are the virtual assistant of SoftSeek Services named 'SoftSeek Chatbot', supporting users in finding information related to the company, providing information about job positions and job levels. . , salary and other related information."],
        // providde chat_history property typeof string
        new prompts_1.MessagesPlaceholder("chat_history"),
        // providde input property from user
        ["human", "Please answer the following question in vietnamese: {input}"],
        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
    ]);
    // const chain = await createStuffDocumentsChain({
    //   llm: model,
    //   prompt,
    // })
    const retriever = vectorStore.asRetriever({
        k: 2
    });
    // Tools
    const searchTool = new tavily_search_1.TavilySearchResults({
        verbose: true
    });
    searchTool.description += " .Use this tool when users ask for information about company. Please cite the source (title, url,...)";
    const wikipediaTool = new wikipedia_query_run_1.WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000
    });
    wikipediaTool.description += " .Use this tool when users ask for information about knowledge (ex: what is social media?). Please cite the source (title, url,...)";
    const retrieverTool = (0, retriever_1.createRetrieverTool)(retriever, {
        name: "info_search",
        description: "Use this tool when users ask for information about jobs and salaries. Please cite the source (title, page, line)",
    });
    const tools = [searchTool, retrieverTool, wikipediaTool];
    const agent = await (0, agents_1.createOpenAIFunctionsAgent)({
        llm: model,
        prompt,
        tools,
    });
    // Create the executor
    const agentExecutor = new agents_1.AgentExecutor({
        agent,
        tools,
    });
    // const retrieverPrompt = ChatPromptTemplate.fromMessages([
    //   new MessagesPlaceholder("chat_history"),
    //   ["user", "{input}"],
    //   ["user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation"]
    // ]);
    // const historyAwareRetrieval = await createHistoryAwareRetriever({
    //   llm: model,
    //   retriever,
    //   rephrasePrompt: retrieverPrompt
    // })
    // const conversationChain = await createRetrievalChain({
    //   combineDocsChain: agentExecutor,
    //   retriever: historyAwareRetrieval
    // })
    return agentExecutor;
};
async function main() {
    const vectorStore = await createVectorStore();
    const chain = await createChain(vectorStore);
    // User Input
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "chat0",
        config: {
            url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
            token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
        }
    });
    function askQuestion() {
        rl.question("User: ", async (input) => {
            if (input.toLowerCase() === "exit") {
                rl.close();
                return;
            }
            const chat_history = await upstashChatHistory.getMessages();
            const response = await chain.invoke({
                input: input,
                chat_history: chat_history
            });
            console.log("🚀 ~ rl.question ~ response:", response);
            console.log("Agent: ", response.output);
            await upstashChatHistory.addMessages([new schema_1.HumanMessage(input), new schema_1.AIMessage(response.output)]);
            askQuestion();
        });
    }
    askQuestion();
}
exports.main = main;
//# sourceMappingURL=pdf-chat.js.map