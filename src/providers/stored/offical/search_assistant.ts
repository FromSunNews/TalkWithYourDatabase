import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { getModelLlm } from "../../chatbot/utils/get_llm";
import { getChatHistoryBasic } from "../../chatbot/utils/upstash_chat_history";
import { promptRole } from "../../chatbot/utils/prompt";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

export const getAnswerSearchAssistant = async (sessionId: string, question: string, user_name: string) => {
  // Prompt Template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", promptRole],
    new MessagesPlaceholder("chat_history"),
    HumanMessagePromptTemplate.fromTemplate("Please answer the following question in VIETNAMESE: {question}"),
    HumanMessagePromptTemplate.fromTemplate(`
      Prioritize using tavily_search_results_json tool when looking to INFOMATION about something!
      Prioritize using wikipedia-api tool when looking to DEFINITION about something!
      Please cite the source (title, url,...)
      Don't try to make up an answer. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." then direct the questioner to email softseekservice@gmail.com to assist. 
      Always speak as if you were chatting to a friend. 
      Please mention the user's name when chatting. The user's name is {user_name}
      Please answer in VIETNAMESE
    `),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // Tools
  const searchTool = new TavilySearchResults();
  searchTool.description += "Use this tool when users ask for information about IT field. Please cite the source (title, url,...)"
  console.log("searchTool.name", searchTool.name);
  const wikipediaTool = new WikipediaQueryRun({
    topKResults: 3,
    maxDocContentLength: 4000
  });
  console.log("wikipediaTool.name", wikipediaTool.name);
  wikipediaTool.description += "Use this tool when users ask for information about definitions (e.g., what is ABC..?). Please cite the source (title, url,...)"

  const tools = [searchTool];

  const agent = await createOpenAIFunctionsAgent({
    llm: getModelLlm(),
    prompt,
    tools,
  });

  // Create the executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  const chat_history = await getChatHistoryBasic(sessionId);

  const response = await agentExecutor.invoke({
    question,
    chat_history,
    user_name
  });

  console.log("🚀 ~ getAnswerSearchAssistant ~ response:", response)
  return response?.output;
}