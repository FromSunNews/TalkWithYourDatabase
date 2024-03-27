"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerDatabaseAssistant = void 0;
const prompts_1 = require("@langchain/core/prompts");
const openai_1 = require("@langchain/openai");
const agents_1 = require("langchain/agents");
const sql_1 = require("langchain/agents/toolkits/sql");
const schema_1 = require("langchain/schema");
const sql_db_1 = require("langchain/sql_db");
const typeorm_1 = require("typeorm");
const upstash_chat_history_1 = require("./utils/upstash_chat_history");
const getAnswerDatabaseAssistant = async (sessionId, question, user_name) => {
    const datasource = new typeorm_1.DataSource({
        type: "mysql",
        host: "3306",
        username: "root",
        password: "",
        database: "job_it"
    });
    const db = await sql_db_1.SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
    });
    const llm = new openai_1.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    const sqlToolKit = new sql_1.SqlToolkit(db, llm);
    let tools = sqlToolKit.getTools();
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
  Question: {question}
  Thought: I should look at the tables in the database to see what I can query.
  {agent_scratchpad}`;
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", SQL_PREFIX],
        new prompts_1.MessagesPlaceholder("chat_history"),
        prompts_1.HumanMessagePromptTemplate.fromTemplate("Please answer the following question in vietnamese: {question}"),
        prompts_1.HumanMessagePromptTemplate.fromTemplate(`
      Don't try to make up an answer. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." then direct the questioner to email softseekservice@gmail.com to assist. 
      Always speak as if you were chatting to a friend. 
      Please mention the user's name when chatting. The user's name is {user_name}
    `),
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
    const chat_history = await (0, upstash_chat_history_1.getChatHistoryBasic)(sessionId);
    const response = await agentExecutor.invoke({
        question,
        chat_history,
        user_name
    });
    // console.log("🚀 ~ getAnswerSearchAssistant ~ response:", response)
    return response?.output;
};
exports.getAnswerDatabaseAssistant = getAnswerDatabaseAssistant;
//# sourceMappingURL=database_assistant.js.map