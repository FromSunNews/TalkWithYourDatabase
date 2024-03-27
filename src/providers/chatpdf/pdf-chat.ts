import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { env } from "config/environment";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { AIMessage, HumanMessage } from "langchain/schema";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createRetrieverTool } from "langchain/tools/retriever";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import readline from "readline";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";



async function createVectorStore(): Promise<MemoryVectorStore> {

  const directoryLoader = new DirectoryLoader(
    `src/documents/`,
    {
      ".pdf": (path: string) => new PDFLoader(path),
    }
  );

  const docs = await directoryLoader.load();

  console.log({ docs });

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);

  const embeddings = new OpenAIEmbeddings();

  // store in vector store
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  return vectorStore;
}

//create Retrieval chain 
const createChain = async (vectorStore: MemoryVectorStore) => {
  // create a model instance
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.2
  })

  // create prompt instance
  const prompt = ChatPromptTemplate.fromMessages([
    // providde context property from system
    ["system", "You are the virtual assistant of SoftSeek Services named 'SoftSeek Chatbot', supporting users in finding information related to the company, providing information about job positions and job levels. . , salary and other related information."],
    // providde chat_history property typeof string
    new MessagesPlaceholder("chat_history"),
    // providde input property from user
    ["human", "Please answer the following question in vietnamese: {input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ])


  // const chain = await createStuffDocumentsChain({
  //   llm: model,
  //   prompt,
  // })

  const retriever = vectorStore.asRetriever({
    k: 2
  });

  // Tools
  const searchTool = new TavilySearchResults({
    verbose: true
  });
  searchTool.description += " .Use this tool when users ask for information about company. Please cite the source (title, url,...)"
  const wikipediaTool = new WikipediaQueryRun({
    topKResults: 3,
    maxDocContentLength: 4000
  });
  wikipediaTool.description += " .Use this tool when users ask for information about knowledge (ex: what is social media?). Please cite the source (title, url,...)"
  const retrieverTool = createRetrieverTool(retriever, {
    name: "info_search",
    description:
      "Use this tool when users ask for information about jobs and salaries. Please cite the source (title, page, line)",
  });

  const tools = [searchTool, retrieverTool, wikipediaTool];

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools,
  });

  // Create the executor
  const agentExecutor = new AgentExecutor({
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

  return agentExecutor
};

export async function main() {
  const vectorStore = await createVectorStore();
  const chain = await createChain(vectorStore);


  // User Input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const upstashChatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "chat0",
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
      const chat_history = await upstashChatHistory.getMessages();

      const response = await chain.invoke({
        input: input,
        chat_history: chat_history
      });
      console.log("🚀 ~ rl.question ~ response:", response)

      console.log("Agent: ", response.output);

      await upstashChatHistory.addMessages([new HumanMessage(input), new AIMessage(response.output)]);

      askQuestion();
    });
  }

  askQuestion();
}

