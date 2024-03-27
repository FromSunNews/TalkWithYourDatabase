import { ChatOpenAI } from "@langchain/openai";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";

export const getHistoryAwareRetrieverChain = async () => {
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
  ]);

  const historyAwareRetrieverChain = historyAwarePrompt.pipe(llm).pipe(new StringOutputParser());

  const re = await historyAwareRetrieverChain.invoke({

  })
}