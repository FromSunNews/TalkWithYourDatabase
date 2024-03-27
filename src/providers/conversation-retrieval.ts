import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever"
import { createRetrievalChain } from "langchain/chains/retrieval"
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio"
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts"
import { AIMessage, HumanMessage } from "langchain/schema"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"


export const conversationRetrieval = async () => {
  const createVectorStore = async () => {
    // load data from webpage
    const loader = new CheerioWebBaseLoader("https://js.langchain.com/docs/expression_language/");
    const docs = await loader.load();

    // split text into array Document and store in vector store
    const splitter = new RecursiveCharacterTextSplitter({
      // each 200 characters for a chunk
      chunkSize: 200,
      // overlap 20 characters of each chunk
      chunkOverlap: 20
    });
    const splitDocs = await splitter.splitDocuments(docs);

    const embeddings = new OpenAIEmbeddings();

    // store in vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    return vectorStore
  };

  //create Retrieval chain 
  const createChain = async (vectorStore: MemoryVectorStore) => {
    // create a model instance
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-0125",
      temperature: 0.4
    })

    // create prompt instance
    const prompt = ChatPromptTemplate.fromMessages([
      // providde context property from system
      ["system", "Answer the user's question based on the following context: {context}"],
      // providde chat_history property typeof string
      new MessagesPlaceholder("chat_history"),
      // providde input property from user
      ["user", "{input}"],
    ])


    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    })

    const retriever = vectorStore.asRetriever({
      k: 2
    });

    const retrieverPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      ["user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation"]
    ]);

    const historyAwareRetrieval = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: retrieverPrompt
    })

    const conversationChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever: historyAwareRetrieval
    })

    return conversationChain
  };

  const vectorStore = await createVectorStore();
  const chain = await createChain(vectorStore);

  const chatHistory = [
    new HumanMessage("Hello"),
    new AIMessage("Hi, how can I help you?"),
    new HumanMessage("My name is FSN"),
    new AIMessage("Hi FSN, How can I help you?"),
    new HumanMessage("What is LCEL"),
    new AIMessage("LCEL stands for Langchain Expression Language")
  ]

  const response = await chain.invoke({
    input: "Tên của tôi là gì ?",
    chat_history: chatHistory
  })
  console.log("🚀 ~ retrievalChain ~ response:", response.answer)
} 