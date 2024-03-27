import { getClassificationResult } from "./classification";
import { getAnswerDatabaseAssistant } from "./database_assistant";
import { getAnswerDocumentAssistant } from "./document_assistant";
import { getAnswerSearchAssistant } from "./search_assistant";
import { getSimplificationOutput } from "./simplify_out";
import { addChatHistory } from "./utils/upstash_chat_history";


export const getAnswerChatBot = async (sessionId: string, question: string, user_name: string): Promise<string> => {
  // simplify question output 
  const simplificationOutput = await getSimplificationOutput(sessionId, question, user_name);
  let response: string;
  if (simplificationOutput.toLowerCase().includes("no_answer")) {
    // this case need to use relevant tools
    // Classify with using database or using docs + search tool as work_flow.excalidraw file in project
    const classification = await getClassificationResult(question);
    if (classification.toLowerCase().includes("search_job")) {
      // using database tool
      console.log("🤖 Agent: ", "I'm looking to in DATABASE....");
      const answerDatabaseAssistant = await getAnswerDatabaseAssistant(sessionId, question, user_name);
      response = answerDatabaseAssistant;
    } else {
      console.log("🤖 Agent: ", "I'm looking to in DOCUMENTS....");
      const answerDocAssistant = await getAnswerDocumentAssistant(sessionId, question, user_name);
      if (answerDocAssistant.toLowerCase().includes("no_answer")) {
        console.log("🤖 Agent: ", "I'm looking to INTERNET....");
        // using search tool lmao
        const answerSearchAssistant = await getAnswerSearchAssistant(sessionId, question, user_name);
        response = answerSearchAssistant;
      } else response = answerDocAssistant;
    }
  } else {
    response = simplificationOutput;
  }
  console.log("🤖 Agent: ", response);
  // Save question and response answers
  await addChatHistory(sessionId, question, response);

  return response;
}