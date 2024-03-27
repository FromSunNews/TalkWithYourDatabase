import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { apiV1 } from './routes/v1';
import { connection } from 'config/db.connection';
import { llm } from 'providers/llm';
import { PromptTemplate } from 'langchain/prompts';
import { promptTemplates } from 'providers/prompt-templates';
import { outputParsers } from "providers/output-parsers";
import { getDB } from 'providers/sql_chat/langchain.provider';
import { retrievalChain } from 'providers/retrieval-chain';
import { conversationRetrieval } from 'providers/conversation-retrieval';
import { handleAgent } from 'providers/agent';
import { handleMemory } from 'providers/memory';
import { main } from 'providers/chatpdf/pdf-chat';
import { getDataFromAgent } from 'providers/sql_chat/agent';
import { handleQuestion } from 'providers/contextualizing/contextual_question';
import { getTextSplitter, runnableSequence, runnableSequenceExample, runnableSequenceMultiple, standaloneQuestion } from 'providers/supabase';
import { uploadDocumentsToSupabaseCloud, uploadMultiWebsitesToSupabaseCloud, uploadWebsiteToSupabaseCloud } from 'providers/official/upload_documents';
import { getSimplificationOutput } from 'providers/official/simplify_out';
import { getAnswerSearchAssistant } from 'providers/official/search_assistant';
import { getAnswerDatabaseAssistant } from 'providers/official/database_assistant';
import readline from "readline";
import { getAnswerChatBot } from 'providers/official';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 7500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1', cors(), apiV1);

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
  // connection.connect((err) => {
  //   if (err instanceof Error) {
  //     throw new Error(JSON.stringify(err));
  //   } else {
  //     console.log('Database is Connected!');
  //   }
  // });
  // getDB()
  // llm()
  // promptTemplates()
  // outputParsers()
  // retrievalChain()
  // conversationRetrieval
  // conversationRetrieval()
  // handleAgent()
  // handleMemory()
  // main();
  // getDataFromAgent();
  // handleQuestion()
  // getDataFromAgent()
  // standaloneQuestion()
  // runnableSequence();
  // runnableSequenceExample()
  // runnableSequenceMultiple("Phương")
  // uploadDocumentsToSupabaseCloud()
  // uploadWebsiteToSupabaseCloud()
  // uploadMultiWebsitesToSupabaseCloud();
  // getSimplificationOutput("chat_history9093", "Bạn có biêt FE là gì không?", "Nhật Phương");
  // getClassificationChain("Công việc IT ở TPHCM có nhiều không");
  // getAnswerSearchAssistant("chat_history9203", "Devops là gì?", "Nhật Phương");
  // getAnswerDatabaseAssistant("chat_history9203", "Bên bạn hiện tại đang có công việc nào?", "Nhật Phương");
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

  //     await getAnswerChatBot("2ewd", input, "Nhật Phương")

  //     askQuestion();
  //   });
  // }

  // askQuestion();
});