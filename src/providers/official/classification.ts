import { PromptTemplate } from "langchain/prompts";
import { getModelLlm } from "./utils/get_llm";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnablePassthrough, RunnableSequence, RunnableBranch } from "@langchain/core/runnables"
import { ParamsFromFString } from "@langchain/core/prompts";
import { promptRole } from "./utils/prompt";


export const getClassificationResult = async (question: string): Promise<string> => {
  const promptTemplate = PromptTemplate.fromTemplate(`
  Regarding the user question below, please classify it as about \`SEARCH_JOB\` \`SEARCH_OTHER\`.
  Based on question and type, if question is related to FINDING JOBS, return "SEARCH_JOB" otherwise NOT FINDING JOBS return "SEARCH_OTHER"
  Do not respond with more than one word.

  <question>
  {question}
  </question>

  Classification:`);

  const classificationChain = RunnableSequence.from([
    promptTemplate,
    getModelLlm,
    new StringOutputParser(),
  ]);
  const respone = await classificationChain.invoke({
    question
  });
  // console.log("🚀 ~ getSimplificationOutput ~ respone:", respone)
  return respone;
} 