"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerChatBot = void 0;
const classification_1 = require("./classification");
const database_assistant_1 = require("./database_assistant");
const upstash_chat_history_1 = require("./utils/upstash_chat_history");
const answer_assistant_1 = require("./answer_assistant");
const research_assistant_1 = require("./research_assistant");
const standalone_question_1 = require("./standalone_question");
const getAnswerChatBot = async (sessionId, question, user_name) => {
    // simplify question output 
    const classification = await (0, classification_1.getClassificationResult)(sessionId, question);
    let response = "";
    if (classification === "ANSWER_NORMAL") {
        console.log("🤖 Agent: ", "I'm looking to in ANSWER NORMAL....");
        const answerNormalAssistant = await (0, answer_assistant_1.getAnswerNormalAssistant)(sessionId, question, user_name);
        response = answerNormalAssistant;
    }
    else {
        // create a standaone question based on chat history and question
        const standaloneQuestion = await (0, standalone_question_1.getStandaloneQuestion)(sessionId, question);
        console.log("🤖 Agent: Created standalone question => ", standaloneQuestion);
        if (classification === "SEARCH_INTERNET") {
            const datas = {
                "message": standaloneQuestion,
                "returnSources": true,
                "returnFollowUpQuestions": true,
                "embedSourcesInLLMResponse": false,
                "textChunkSize": 1000,
                "textChunkOverlap": 400,
                "numberOfSimilarityResults": 4,
                "numberOfPagesToScan": 3
            };
            console.log("🤖 Agent: ", "I'm looking to INTERNET....");
            const answerDocAssistant = await (0, research_assistant_1.getAnswerResearchAssistant)(datas);
            response = answerDocAssistant.answer;
        }
        else if (classification === "SEARCH_JOB") {
            // using database tool
            console.log("🤖 Agent: ", "I'm looking to in DATABASE....");
            const answerDatabaseAssistant = await (0, database_assistant_1.getAnswerDatabaseAssistant)(sessionId, standaloneQuestion, user_name);
            response = answerDatabaseAssistant;
        }
    }
    // if (simplificationOutput.toLowerCase().includes("no_answer")) {
    //   // this case need to use relevant tools
    //   // Classify with using database or using docs + search tool as work_flow.excalidraw file in project
    //   const classification = await getClassificationResult(question);
    //   if (classification.toLowerCase().includes("search_job")) {
    //     // using database tool
    //     console.log("🤖 Agent: ", "I'm looking to in DATABASE....");
    //     const answerDatabaseAssistant = await getAnswerDatabaseAssistant(sessionId, question, user_name);
    //     response = answerDatabaseAssistant;
    //   } else {
    //     console.log("🤖 Agent: ", "I'm looking to in DOCUMENTS....");
    //     const answerDocAssistant = await getAnswerDocumentAssistant(sessionId, question, user_name);
    //     if (answerDocAssistant.toLowerCase().includes("no_answer")) {
    //       console.log("🤖 Agent: ", "I'm looking to INTERNET....");
    //       // using search tool lmao
    //       const answerSearchAssistant = await getAnswerSearchAssistant(sessionId, question, user_name);
    //       response = answerSearchAssistant;
    //     } else response = answerDocAssistant;
    //   }
    // } else {
    //   response = simplificationOutput;
    // }
    console.log("🤖 Agent: ", response);
    // Save question and response answers
    await (0, upstash_chat_history_1.addChatHistory)(sessionId, question, response);
    return response;
};
exports.getAnswerChatBot = getAnswerChatBot;
//# sourceMappingURL=index.js.map