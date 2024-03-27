"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataFromAgent = void 0;
const prompts_1 = require("@langchain/core/prompts");
const openai_1 = require("@langchain/openai");
const agents_1 = require("langchain/agents");
const sql_1 = require("langchain/agents/toolkits/sql");
const schema_1 = require("langchain/schema");
const sql_db_1 = require("langchain/sql_db");
const typeorm_1 = require("typeorm");
const readline_1 = __importDefault(require("readline"));
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const environment_1 = require("../../../config/environment");
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const wikipedia_query_run_1 = require("@langchain/community/tools/wikipedia_query_run");
const getDataFromAgent = async () => {
    const datasource = new typeorm_1.DataSource({
        type: "mysql",
        host: "3306",
        username: "root",
        password: "",
        database: "softseek"
    });
    const db = await sql_db_1.SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
    });
    const llm = new openai_1.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    const sqlToolKit = new sql_1.SqlToolkit(db, llm);
    let tools = sqlToolKit.getTools();
    const searchTool = new tavily_search_1.TavilySearchResults();
    searchTool.description += " .Use this tool when users ask for information about company. Please cite the source (title, url,...)";
    const wikipediaTool = new wikipedia_query_run_1.WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000
    });
    wikipediaTool.description += " .Use this tool when users ask for information about knowledge (ex: what is social media?). Please cite the source (title, url,...)";
    // tools = [...tools, searchTool, wikipediaTool];
    const SQL_PREFIX = `You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most {top_k} results using the LIMIT clause.
You can order the results by a relevant column to return the most interesting examples in the database.
Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.
You have access to tools for interacting with the database.
Only use the below tools.
Only use the information returned by the below tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

If the question does not seem related to the database, just return "I don't know" as the answer.`;
    const SQL_SUFFIX = `Begin!
Question: {input}
Thought: I should look at the tables in the database to see what I can query.
{agent_scratchpad}`;
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", SQL_PREFIX],
        new prompts_1.MessagesPlaceholder("chat_history"),
        prompts_1.HumanMessagePromptTemplate.fromTemplate("Please answer the following question in vietnamese: {input}"),
        new schema_1.AIMessage(SQL_SUFFIX.replace("{agent_scratchpad}", "")),
        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
    ]);
    const newPrompt = await prompt.partial({
        dialect: sqlToolKit.dialect,
        top_k: "10",
    });
    const runnableAgent = await (0, agents_1.createOpenAIToolsAgent)({
        llm,
        tools,
        prompt: newPrompt,
    });
    const agentExecutor = new agents_1.AgentExecutor({
        agent: runnableAgent,
        tools,
    });
    // User Input
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "hkk",
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
            let chat_history = await upstashChatHistory.getMessages();
            chat_history = chat_history.slice(-25);
            const response = await agentExecutor.invoke({
                input: input,
                chat_history: chat_history
            });
            // console.log("🚀 ~ rl.question ~ response:", re`sponse)
            console.log("Agent: ", response.output);
            await upstashChatHistory.addMessages([new schema_1.HumanMessage(input), new schema_1.AIMessage(response.output)]);
            askQuestion();
        });
    }
    askQuestion();
};
exports.getDataFromAgent = getDataFromAgent;
//# sourceMappingURL=agent.js.map