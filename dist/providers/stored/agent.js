"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAgent = void 0;
const readline_1 = __importDefault(require("readline"));
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const messages_1 = require("@langchain/core/messages");
const agents_1 = require("langchain/agents");
// Tool imports
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const retriever_1 = require("langchain/tools/retriever");
// Custom Data Source, Vector Stores
const text_splitter_1 = require("langchain/text_splitter");
const cheerio_1 = require("langchain/document_loaders/web/cheerio");
const memory_1 = require("langchain/vectorstores/memory");
const openai_2 = require("@langchain/openai");
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const environment_1 = require("../../config/environment");
const handleAgent = async () => {
    // Create Retriever
    const loader = new cheerio_1.CheerioWebBaseLoader("https://js.langchain.com/docs/expression_language/");
    const docs = await loader.load();
    const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    const embeddings = new openai_2.OpenAIEmbeddings();
    const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    const retriever = vectorStore.asRetriever({
        k: 2,
    });
    // Instantiate the model
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-1106",
        temperature: 0.2,
    });
    // Prompt Template
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant."],
        new prompts_1.MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
    ]);
    // Tools
    const searchTool = new tavily_search_1.TavilySearchResults();
    const retrieverTool = (0, retriever_1.createRetrieverTool)(retriever, {
        name: "lcel_search",
        description: "Use this tool when searching for information about Lanchain Expression Language (LCEL)",
    });
    const tools = [searchTool, retrieverTool];
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
    // User Input
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    // const prompt = ChatPromptTemplate.fromTemplate(`
    //   You are an AI assistant.
    //   History: {history}
    //   {input}
    // `);
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "chat1",
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
            const response = await agentExecutor.invoke({
                input: input,
                chat_history: chat_history,
            });
            console.log("Agent: ", response.output);
            await upstashChatHistory.addMessages([new messages_1.HumanMessage(input), new messages_1.AIMessage(response.output)]);
            askQuestion();
        });
    }
    askQuestion();
};
exports.handleAgent = handleAgent;
//# sourceMappingURL=agent.js.map