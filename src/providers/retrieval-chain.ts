import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { createRetrievalChain } from "langchain/chains/retrieval"
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio"
import { ChatPromptTemplate } from "langchain/prompts"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"


export const retrievalChain = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.4
  })

  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user's question. 
    Context: {context}
    Question: {input}
  `)

  // const chain = prompt.pipe(model)
  const chain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  })

  // load data from webpage 
  const loader = new CheerioWebBaseLoader("https://js.langchain.com/docs/expression_language/");
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 20
  });

  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new OpenAIEmbeddings();

  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  // Retrieve data
  const retriever = vectorStore.asRetriever({
    k: 2
  });

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever
  })

  const response = await retrievalChain.invoke({
    input: "What is LCLE?"
  })
  console.log("🚀 ~ retrievalChain ~ response:", response)
} 