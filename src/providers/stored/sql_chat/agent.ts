import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIToolsAgent, AgentExecutor } from "langchain/agents";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { AIMessage, HumanMessage } from "langchain/schema";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import readline from "readline";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
import { env } from "config/environment";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

export const getDataFromAgent = async () => {
  const datasource = new DataSource({
    type: "mysql",
    host: 3306,
    username: "root",
    password: "",
    database: "softseek"
  });

  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
  const sqlToolKit = new SqlToolkit(db, llm);
  let tools = sqlToolKit.getTools();
  const searchTool = new TavilySearchResults();
  searchTool.description += " .Use this tool when users ask for information about company. Please cite the source (title, url,...)"
  const wikipediaTool = new WikipediaQueryRun({
    topKResults: 3,
    maxDocContentLength: 4000
  });
  wikipediaTool.description += " .Use this tool when users ask for information about knowledge (ex: what is social media?). Please cite the source (title, url,...)"
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
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SQL_PREFIX],
    new MessagesPlaceholder("chat_history"),
    HumanMessagePromptTemplate.fromTemplate("Please answer the following question in vietnamese: {input}"),
    new AIMessage(SQL_SUFFIX.replace("{agent_scratchpad}", "")),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);
  const newPrompt = await prompt.partial({
    dialect: sqlToolKit.dialect,
    top_k: "10",
  });
  const runnableAgent = await createOpenAIToolsAgent({
    llm,
    tools,
    prompt: newPrompt,
  });
  const agentExecutor = new AgentExecutor({
    agent: runnableAgent,
    tools,
  });

  // User Input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const upstashChatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "hkk",
    config: {
      url: env.UPSTASH_REDIS_REST_URL || "",
      token: env.UPSTASH_REDIS_REST_TOKEN || ""
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

      await upstashChatHistory.addMessages([new HumanMessage(input), new AIMessage(response.output)]);

      askQuestion();
    });
  }

  askQuestion();
}