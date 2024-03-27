import { ChatOpenAI } from "@langchain/openai"

export const llm = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.7,
    maxTokens: 1000,
    verbose: true
  })
  const response = await model.invoke("Write a letter for sick!")
  console.log("🚀 ~ llm ~ response:", response)
}