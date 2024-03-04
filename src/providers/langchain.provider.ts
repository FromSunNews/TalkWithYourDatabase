import { ChatOpenAI } from "@langchain/openai";
import { createSqlQueryChain } from "langchain/chains/sql_db";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { QuerySqlTool } from "langchain/tools/sql";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

import { env } from "process";

export const getDb = async () => {

  const datasource = new DataSource({
    type: "mysql",
    host: env.DB_HOST,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });
  
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0125", temperature: 0});

  const executeQuery = new QuerySqlTool(db);

  const writeQuery = await createSqlQueryChain({
    llm,
    db,
    dialect: "mysql",
  });

  const answerPrompt =
    PromptTemplate.fromTemplate(`Đưa ra câu hỏi của người dùng sau, truy vấn SQL tương ứng và kết quả SQL, hãy trả lời câu hỏi của người dùng.

    Câu hỏi: {question}
    Câu truy vấn: {query}
    Kết quả truy vấn: {result}
    Câu trả lời: `);

  const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

  const chain = RunnableSequence.from([
    RunnablePassthrough.assign({ query: writeQuery }).assign({
      result: (i: { query: string }) => executeQuery.invoke(i.query),
    }),
    answerChain,
  ]);
  
  const result = await chain.invoke({ question: "Liệt kê 5 nhân viên có doanh thu cao nhất và liệt kê số tiền của họ?" });
  console.log(result);
  /**
  [{"COUNT(*)":8}]
  */
} 
