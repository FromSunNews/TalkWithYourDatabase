"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = void 0;
const openai_1 = require("@langchain/openai");
const sql_db_1 = require("langchain/chains/sql_db");
const sql_db_2 = require("langchain/sql_db");
const typeorm_1 = require("typeorm");
const sql_1 = require("langchain/tools/sql");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const getDB = async () => {
    const datasource = new typeorm_1.DataSource({
        type: "mysql",
        host: "3306",
        username: "root",
        password: "",
        database: "softseek"
    });
    const db = await sql_db_2.SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
    });
    const llm = new openai_1.ChatOpenAI({ modelName: "gpt-3.5-turbo-0125", temperature: 0 });
    const executeQuery = new sql_1.QuerySqlTool(db);
    const writeQuery = await (0, sql_db_1.createSqlQueryChain)({
        llm,
        db,
        dialect: "mysql",
    });
    const answerPrompt = prompts_1.PromptTemplate.fromTemplate(`Đưa ra câu hỏi của người dùng sau, truy vấn SQL tương ứng và kết quả SQL, hãy trả lời câu hỏi của người dùng.
    
    Câu hỏi: {question}
    Câu truy vấn: {query}
    Kết quả truy vấn: {result}
    Câu trả lời: `);
    const answerChain = answerPrompt.pipe(llm).pipe(new output_parsers_1.StringOutputParser());
    const chain = runnables_1.RunnableSequence.from([
        runnables_1.RunnablePassthrough.assign({ query: writeQuery }).assign({
            result: (i) => executeQuery.invoke(i.query),
        }),
        answerChain,
    ]);
    const result = await chain.invoke({ question: "Liệt kê nhân viên có doanh thu cao nhất tháng 3" });
    console.log(result);
    /**
    [{"COUNT(*)":8}]
    */
};
exports.getDB = getDB;
//# sourceMappingURL=langchain.provider.js.map