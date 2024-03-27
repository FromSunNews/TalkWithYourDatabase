"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerSearchAssistant = void 0;
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const agents_1 = require("langchain/agents");
const prompts_1 = require("langchain/prompts");
const get_llm_1 = require("../../chatbot/utils/get_llm");
const upstash_chat_history_1 = require("../../chatbot/utils/upstash_chat_history");
const prompt_1 = require("../../chatbot/utils/prompt");
const wikipedia_query_run_1 = require("@langchain/community/tools/wikipedia_query_run");
const getAnswerSearchAssistant = async (sessionId, question, user_name) => {
    // Prompt Template
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", prompt_1.promptRole],
        new prompts_1.MessagesPlaceholder("chat_history"),
        prompts_1.HumanMessagePromptTemplate.fromTemplate("Please answer the following question in VIETNAMESE: {question}"),
        prompts_1.HumanMessagePromptTemplate.fromTemplate(`
      Prioritize using tavily_search_results_json tool when looking to INFOMATION about something!
      Prioritize using wikipedia-api tool when looking to DEFINITION about something!
      Please cite the source (title, url,...)
      Don't try to make up an answer. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." then direct the questioner to email softseekservice@gmail.com to assist. 
      Always speak as if you were chatting to a friend. 
      Please mention the user's name when chatting. The user's name is {user_name}
      Please answer in VIETNAMESE
    `),
        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
    ]);
    // Tools
    const searchTool = new tavily_search_1.TavilySearchResults();
    searchTool.description += "Use this tool when users ask for information about IT field. Please cite the source (title, url,...)";
    console.log("searchTool.name", searchTool.name);
    const wikipediaTool = new wikipedia_query_run_1.WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000
    });
    console.log("wikipediaTool.name", wikipediaTool.name);
    wikipediaTool.description += "Use this tool when users ask for information about definitions (e.g., what is ABC..?). Please cite the source (title, url,...)";
    const tools = [searchTool];
    const agent = await (0, agents_1.createOpenAIFunctionsAgent)({
        llm: (0, get_llm_1.getModelLlm)(),
        prompt,
        tools,
    });
    // Create the executor
    const agentExecutor = new agents_1.AgentExecutor({
        agent,
        tools,
    });
    const chat_history = await (0, upstash_chat_history_1.getChatHistoryBasic)(sessionId);
    const response = await agentExecutor.invoke({
        question,
        chat_history,
        user_name
    });
    console.log("🚀 ~ getAnswerSearchAssistant ~ response:", response);
    return response?.output;
};
exports.getAnswerSearchAssistant = getAnswerSearchAssistant;
//# sourceMappingURL=search_assistant.js.map