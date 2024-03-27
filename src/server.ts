import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { apiV1 } from './routes/v1';
import { connection } from 'config/db.connection';
import { llm } from 'providers/stored/llm';
import { PromptTemplate } from 'langchain/prompts';
import { promptTemplates } from 'providers/stored/prompt-templates';
import { outputParsers } from "providers/stored/output-parsers";
import { getDB } from 'providers/stored/sql_chat/langchain.provider';
import { retrievalChain } from 'providers/stored/retrieval-chain';
import { conversationRetrieval } from 'providers/stored/conversation-retrieval';
import { handleAgent } from 'providers/stored/agent';
import { handleMemory } from 'providers/stored/memory';
import { main } from 'providers/stored/chatpdf/pdf-chat';
import { getDataFromAgent } from 'providers/stored/sql_chat/agent';
import { handleQuestion } from 'providers/stored/contextualizing/contextual_question';
import { getTextSplitter, runnableSequence, runnableSequenceExample, runnableSequenceMultiple, standaloneQuestion } from 'providers/stored/supabase';
import { uploadDocumentsToSupabaseCloud, uploadMultiWebsitesToSupabaseCloud, uploadWebsiteToSupabaseCloud } from 'providers/chatbot/upload_documents';
import { getAnswerSearchAssistant } from 'providers/stored/offical/search_assistant';
import { getAnswerDatabaseAssistant } from 'providers/chatbot/database_assistant';
import readline from "readline";
import { getAnswerChatBot } from 'providers/chatbot';
import ngrok from 'ngrok';
import { env } from 'config/environment';

const app: Application = express();
const port = env.APP_PORT || 7500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1', cors(), apiV1);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
  ngrok.connect(7500).then((url) => {
    console.log("🚀 ~ ngrok.connect ~ url:", url)
  })
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });
  // function askQuestion() {
  //   rl.question("User: ", async (input) => {
  //     if (input.toLowerCase() === "exit") {
  //       rl.close();
  //       return;
  //     }

  //     await getAnswerChatBot("dád", input, "Nhật Phương")

  //     askQuestion();
  //   });
  // }

  // askQuestion();
});