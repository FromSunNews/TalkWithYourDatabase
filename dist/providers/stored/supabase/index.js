"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runnableSequenceMultiple = exports.runnableSequenceExample = exports.runnableSequence = exports.standaloneQuestion = exports.getTextSplitter = void 0;
const text_splitter_1 = require("langchain/text_splitter");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_1 = require("langchain/vectorstores/supabase");
const openai_1 = require("langchain/embeddings/openai");
const fs_1 = __importDefault(require("fs"));
const prompts_1 = require("@langchain/core/prompts");
const openai_2 = require("@langchain/openai");
const output_parser_1 = require("langchain/schema/output_parser");
const retriever_1 = require("./retriever");
const combine_documents_1 = require("./combine-documents");
const runnables_1 = require("@langchain/core/runnables");
const format_conv_history_1 = require("./format-conv-history");
const readline_1 = __importDefault(require("readline"));
const upstash_redis_1 = require("langchain/stores/message/upstash_redis");
const schema_1 = require("langchain/schema");
const tools_1 = require("@langchain/core/tools");
const prompts_2 = require("langchain/prompts");
const tavily_search_1 = require("@langchain/community/tools/tavily_search");
const wikipedia_query_run_1 = require("@langchain/community/tools/wikipedia_query_run");
const agents_1 = require("langchain/agents");
const environment_1 = require("../../../config/environment");
const getTextSplitter = async () => {
    try {
        var text = fs_1.default.readFileSync('./src/providers/supabase/split_text/scrimba-info.txt', 'utf8');
        const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 500,
            separators: ['\n\n', '\n', ' ', ''], // default setting
            chunkOverlap: 50
        });
        const output = await splitter.createDocuments([text]);
        const sbApiKey = process.env.SUPABASE_API_KEY;
        const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
        const openAIApiKey = process.env.OPENAI_API_KEY;
        const client = (0, supabase_js_1.createClient)(sbUrl || "", sbApiKey || "");
        await supabase_1.SupabaseVectorStore.fromDocuments(output, new openai_1.OpenAIEmbeddings({ openAIApiKey }), {
            client,
            tableName: 'documents',
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.getTextSplitter = getTextSplitter;
const standaloneQuestion = async () => {
    const llm = new openai_2.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    // A string holding the phrasing of the prompt
    const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:';
    // A prompt created using PromptTemplate and the fromTemplate method
    const standaloneQuestionPrompt = prompts_1.PromptTemplate.fromTemplate(standaloneQuestionTemplate);
    // Take the standaloneQuestionPrompt and PIPE the model
    const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm);
    // Await the response when you INVOKE the chain. 
    // Remember to pass in a question.
    const response = await standaloneQuestionChain.invoke({
        question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'
    });
    console.log(response.content);
};
exports.standaloneQuestion = standaloneQuestion;
const runnableSequence = async () => {
    const llm = new openai_2.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    const punctuationTemplate = `Given a sentence, add punctuation where needed. 
    sentence: {sentence}
    sentence with punctuation:  
    `;
    const punctuationPrompt = prompts_1.PromptTemplate.fromTemplate(punctuationTemplate);
    const grammarTemplate = `Given a sentence correct the grammar.
    sentence: {punctuated_sentence}
    sentence with correct grammar: 
    `;
    const grammarPrompt = prompts_1.PromptTemplate.fromTemplate(grammarTemplate);
    const translationTemplate = `Given a sentence, translate that sentence into {language}
    sentence: {grammatically_correct_sentence}
    translated sentence:
    `;
    const translationPrompt = prompts_1.PromptTemplate.fromTemplate(translationTemplate);
    const punctuationChain = runnables_1.RunnableSequence.from([
        punctuationPrompt,
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const grammarChain = runnables_1.RunnableSequence.from([
        grammarPrompt,
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const translationChain = runnables_1.RunnableSequence.from([
        translationPrompt,
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const chain = runnables_1.RunnableSequence.from([
        {
            punctuated_sentence: punctuationChain,
            original_input: new runnables_1.RunnablePassthrough()
        },
        {
            grammatically_correct_sentence: grammarChain,
            language: ({ original_input }) => original_input.language
        },
        translationChain
    ]);
    const response = await chain.invoke({
        sentence: 'i dont liked mondays',
        language: 'french'
    });
    console.log(response);
};
exports.runnableSequence = runnableSequence;
const runnableSequenceExample = async () => {
    const llm = new openai_2.ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
    const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
  Conversation history: {conv_history}
  Question: {question} 
  Standalone question:`;
    const standaloneQuestionPrompt = prompts_1.PromptTemplate.fromTemplate(standaloneQuestionTemplate);
    const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
  Context: {context}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `;
    const answerPrompt = prompts_1.PromptTemplate.fromTemplate(answerTemplate);
    /**
     * Super Challenge:
     *
     * Set up a RunnableSequence so that the standaloneQuestionPrompt
     * passes the standalone question to the retriever, and the retriever
     * passes the combined docs as context to the answerPrompt. Remember,
     * the answerPrompt should also have access to the original question.
     *
     * When you have finished the challenge, you should see a
     * conversational answer to our question in the console.
     *
    **/
    const standaloneQuestionChain = runnables_1.RunnableSequence.from([
        standaloneQuestionPrompt,
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const retrieverChain = runnables_1.RunnableSequence.from([
        (prevResult) => prevResult.standalone_question,
        retriever_1.retriever,
        combine_documents_1.combineDocuments
    ]);
    const answerChain = runnables_1.RunnableSequence.from([
        answerPrompt,
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const chain = runnables_1.RunnableSequence.from([
        {
            standalone_question: standaloneQuestionChain,
            input_variables: new runnables_1.RunnablePassthrough()
        },
        {
            context: retrieverChain,
            question: ({ input_variables }) => input_variables.question,
            conv_history: ({ input_variables }) => input_variables.conv_history
        },
        answerChain
    ]);
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "sad",
        config: {
            url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
            token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
        }
    });
    // const convHistory: string[] = []
    function askQuestion() {
        rl.question("User: ", async (input) => {
            if (input.toLowerCase() === "exit") {
                rl.close();
                return;
            }
            const conv_history = await upstashChatHistory.getMessages();
            const docsTool = new tools_1.DynamicTool({
                name: "document_tool",
                description: "Use this tool in case of priority questions in the field of information technology",
                func: async (input) => {
                    return await chain.invoke({
                        question: input,
                        conv_history: (0, format_conv_history_1.formatConvHistory)(conv_history)
                    });
                }
            });
            const prompt = prompts_2.ChatPromptTemplate.fromMessages([
                ["system", "You are a helpful assistant."],
                new prompts_2.MessagesPlaceholder("chat_history"),
                ["human", "{input}"],
                new prompts_2.MessagesPlaceholder("agent_scratchpad"),
            ]);
            const searchTool = new tavily_search_1.TavilySearchResults();
            searchTool.description += " .Use this tool when users ask for information about company. Please cite the source (title, url,...)";
            const wikipediaTool = new wikipedia_query_run_1.WikipediaQueryRun({
                topKResults: 3,
                maxDocContentLength: 4000
            });
            wikipediaTool.description += " .Use this tool when users ask for information about knowledge (ex: what is social media?). Please cite the source (title, url,...)";
            const tools = [docsTool, searchTool];
            const agent = await (0, agents_1.createOpenAIFunctionsAgent)({
                llm,
                prompt,
                tools,
            });
            // Create the executor
            const agentExecutor = new agents_1.AgentExecutor({
                agent,
                tools,
                returnIntermediateSteps: true,
                verbose: true
            });
            const response = await agentExecutor.invoke({
                input,
                chat_history: conv_history
            });
            console.log("Agent: ", response);
            // await upstashChatHistory.addMessages([new HumanMessage(input), new AIMessage(response)]);
            // convHistory.push(input)
            // convHistory.push(response)
            askQuestion();
        });
    }
    askQuestion();
};
exports.runnableSequenceExample = runnableSequenceExample;
const runnableSequenceMultiple = async (name) => {
    const promptTemplate = prompts_1.PromptTemplate.fromTemplate(`Given the user question below, classify it as either being about \`Basic_Conversation\` \`In_Conversation\`, \`Out_Conversation\`.                                     
    First, look at the question to determine if it's a basic, normal conversation that you can answer on your own (maybe a hello, a thank you, or something you already know). and can answer for yourself). If yes, return "Basic_Conversation"; If not, please use the following chat history to determine whether you can construct a sentence based on the chat history provided (especially the last answer in the chat history). If yes, return "In_Conversation"; otherwise return "Out_Conversation".

    <chat_history>
    {conv_history}
    </chat_history>

    <question>
    {question}
    </question>

    Classification:`);
    const llm = new openai_2.ChatOpenAI({ modelName: "gpt-3.5-turbo-0125", temperature: 0.2 });
    const classificationChain = runnables_1.RunnableSequence.from([
        promptTemplate,
        llm,
        new output_parser_1.StringOutputParser(),
    ]);
    const upstashChatHistory = new upstash_redis_1.UpstashRedisChatMessageHistory({
        sessionId: "json",
        config: {
            url: environment_1.env.UPSTASH_REDIS_REST_URL || "",
            token: environment_1.env.UPSTASH_REDIS_REST_TOKEN || ""
        }
    });
    const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
  Conversation history: {conv_history}
  Question: {question} 
  Standalone question:`;
    const answerTemplateOutConversation = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. Answer the question in your own words based on the information found. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  Context: {context}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `;
    const answerTemplateInConversation = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the chat history. Try to find the answer in chat history. Answer the question in your own words based on the information found. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `;
    const answerTemplateBasicConversation = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba. Answer the question in your own words based on the information found. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `;
    const standaloneQuestionChain = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(standaloneQuestionTemplate),
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const retrieverChain = runnables_1.RunnableSequence.from([
        (prevResult) => prevResult.standalone_question,
        retriever_1.retriever,
        combine_documents_1.combineDocuments
    ]);
    const answerChainOutConversation = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(answerTemplateOutConversation),
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const answerChainInConversation = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(answerTemplateInConversation),
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const answerChainBasicConversation = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(answerTemplateBasicConversation),
        llm,
        new output_parser_1.StringOutputParser()
    ]);
    const chainOutConversation = runnables_1.RunnableSequence.from([
        {
            standalone_question: standaloneQuestionChain,
            input_variables: new runnables_1.RunnablePassthrough()
        },
        {
            context: retrieverChain,
            question: ({ input_variables }) => input_variables.question,
            conv_history: ({ input_variables }) => input_variables.conv_history,
            user_name: ({ input_variables }) => input_variables.user_name
        },
        answerChainOutConversation
    ]);
    const branch = runnables_1.RunnableBranch.from([
        [
            (x) => x.aim.toLowerCase().includes("basic_conversation"),
            answerChainBasicConversation,
        ],
        [
            (x) => x.aim.toLowerCase().includes("in_conversation"),
            answerChainInConversation,
        ],
        chainOutConversation,
    ]);
    const fullChain = runnables_1.RunnableSequence.from([
        {
            aim: classificationChain,
            question: (input) => input.question,
            conv_history: (input) => input.conv_history,
            user_name: (input) => input.user_name,
        },
        branch,
    ]);
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    function askQuestion() {
        rl.question("User: ", async (input) => {
            if (input.toLowerCase() === "exit") {
                rl.close();
                return;
            }
            const conv_history = await upstashChatHistory.getMessages();
            const response = await fullChain.invoke({
                question: input,
                conv_history: (0, format_conv_history_1.formatConvHistory)(conv_history.slice(-20)),
                user_name: name
            });
            console.log("Agent: ", response);
            await upstashChatHistory.addMessages([new schema_1.HumanMessage(input), new schema_1.AIMessage(response)]);
            // convHistory.push(input)
            // convHistory.push(response)
            askQuestion();
        });
    }
    askQuestion();
};
exports.runnableSequenceMultiple = runnableSequenceMultiple;
//# sourceMappingURL=index.js.map