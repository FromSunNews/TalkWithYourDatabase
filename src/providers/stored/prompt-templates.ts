import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "langchain/prompts"


export const promptTemplates = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.7
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Generate a joke based on a word provided by the user."],
    ["human", "{input}"]
  ])

  // console.log(await prompt.format({ input: "Fire" }));
  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    input: "Fire"
  })

  console.log(response);
}
