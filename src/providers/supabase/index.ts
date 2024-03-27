import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import fs from 'fs';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { retriever } from './retriever';
import { combineDocuments } from './combine-documents';
import { RunnablePassthrough, RunnableSequence, RunnableBranch } from "@langchain/core/runnables"
import { formatConvHistory } from './format-conv-history';
import readline from "readline";
import { UpstashRedisChatMessageHistory } from 'langchain/stores/message/upstash_redis';
import { env } from 'config/environment';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { DynamicTool } from "@langchain/core/tools";
import { ChatPromptTemplate, MessagesPlaceholder } from 'langchain/prompts';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";


export const getTextSplitter = async () => {
  try {
    var text = fs.readFileSync('./src/providers/supabase/split_text/scrimba-info.txt', 'utf8');
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      separators: ['\n\n', '\n', ' ', ''], // default setting
      chunkOverlap: 50
    })

    const output = await splitter.createDocuments([text])

    const sbApiKey = process.env.SUPABASE_API_KEY
    const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT
    const openAIApiKey = process.env.OPENAI_API_KEY

    const client = createClient(sbUrl || "", sbApiKey || "")

    await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        client,
        tableName: 'documents',
      }
    )

  } catch (err) {
    console.log(err)
  }
}

export const standaloneQuestion = async () => {
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });
  // A string holding the phrasing of the prompt
  const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:'

  // A prompt created using PromptTemplate and the fromTemplate method
  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);

  // Take the standaloneQuestionPrompt and PIPE the model
  const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm);

  // Await the response when you INVOKE the chain. 
  // Remember to pass in a question.
  const response = await standaloneQuestionChain.invoke({
    question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'
  });

  console.log(response.content);
}

export const runnableSequence = async () => {
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });

  const punctuationTemplate = `Given a sentence, add punctuation where needed. 
    sentence: {sentence}
    sentence with punctuation:  
    `
  const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate)

  const grammarTemplate = `Given a sentence correct the grammar.
    sentence: {punctuated_sentence}
    sentence with correct grammar: 
    `
  const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate)

  const translationTemplate = `Given a sentence, translate that sentence into {language}
    sentence: {grammatically_correct_sentence}
    translated sentence:
    `
  const translationPrompt = PromptTemplate.fromTemplate(translationTemplate)

  const punctuationChain = RunnableSequence.from([
    punctuationPrompt,
    llm,
    new StringOutputParser()
  ])
  const grammarChain = RunnableSequence.from([
    grammarPrompt,
    llm,
    new StringOutputParser()
  ])
  const translationChain = RunnableSequence.from([
    translationPrompt,
    llm,
    new StringOutputParser()
  ])

  const chain = RunnableSequence.from([
    {
      punctuated_sentence: punctuationChain,
      original_input: new RunnablePassthrough()
    },
    {
      grammatically_correct_sentence: grammarChain,
      language: ({ original_input }) => original_input.language
    },
    translationChain
  ])

  const response = await chain.invoke({
    sentence: 'i dont liked mondays',
    language: 'french'
  })

  console.log(response)
}

export const runnableSequenceExample = async () => {
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106", temperature: 0 });

  const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
  Conversation history: {conv_history}
  Question: {question} 
  Standalone question:`

  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

  const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
  Context: {context}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `
  const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

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

  const standaloneQuestionChain = RunnableSequence.from([
    standaloneQuestionPrompt,
    llm,
    new StringOutputParser()
  ]);

  const retrieverChain = RunnableSequence.from([
    (prevResult: any) => prevResult.standalone_question,
    retriever,
    combineDocuments
  ]);

  const answerChain = RunnableSequence.from([
    answerPrompt,
    llm,
    new StringOutputParser()
  ]);

  const chain = RunnableSequence.from([
    {
      standalone_question: standaloneQuestionChain,
      input_variables: new RunnablePassthrough()
    },
    {
      context: retrieverChain,
      question: ({ input_variables }) => input_variables.question,
      conv_history: ({ input_variables }) => input_variables.conv_history
    },
    answerChain
  ])




  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const upstashChatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "sad",
    config: {
      url: env.UPSTASH_REDIS_REST_URL || "",
      token: env.UPSTASH_REDIS_REST_TOKEN || ""
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

      const docsTool = new DynamicTool({
        name: "document_tool",
        description: "Use this tool in case of priority questions in the field of information technology",
        func: async (input: string) => {
          return await chain.invoke({
            question: input,
            conv_history: formatConvHistory(conv_history)
          });
        }
      });

      const prompt = ChatPromptTemplate.fromMessages([
        ("system", "You are a helpful assistant."),
        new MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        new MessagesPlaceholder("agent_scratchpad"),
      ]);

      const searchTool = new TavilySearchResults();
      searchTool.description += " .Use this tool when users ask for information about company. Please cite the source (title, url,...)"
      const wikipediaTool = new WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000
      });
      wikipediaTool.description += " .Use this tool when users ask for information about knowledge (ex: what is social media?). Please cite the source (title, url,...)"

      const tools = [docsTool, searchTool];

      const agent = await createOpenAIFunctionsAgent({
        llm,
        prompt,
        tools,
      });

      // Create the executor
      const agentExecutor = new AgentExecutor({
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

}

export const runnableSequenceMultiple = async (name: string) => {
  const promptTemplate =
    PromptTemplate.fromTemplate(`Given the user question below, classify it as either being about \`Basic_Conversation\` \`In_Conversation\`, \`Out_Conversation\`.                                     
    First, look at the question to determine if it's a basic, normal conversation that you can answer on your own (maybe a hello, a thank you, or something you already know). and can answer for yourself). If yes, return "Basic_Conversation"; If not, please use the following chat history to determine whether you can construct a sentence based on the chat history provided (especially the last answer in the chat history). If yes, return "In_Conversation"; otherwise return "Out_Conversation".

    <chat_history>
    {conv_history}
    </chat_history>

    <question>
    {question}
    </question>

    Classification:`);

  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0125", temperature: 0.2 });


  const classificationChain = RunnableSequence.from([
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const upstashChatHistory = new UpstashRedisChatMessageHistory({
    sessionId: "json",
    config: {
      url: env.UPSTASH_REDIS_REST_URL || "",
      token: env.UPSTASH_REDIS_REST_TOKEN || ""
    }
  });

  const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
  Conversation history: {conv_history}
  Question: {question} 
  Standalone question:`


  const answerTemplateOutConversation = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. Answer the question in your own words based on the information found. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  Context: {context}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `

  const answerTemplateInConversation = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the chat history. Try to find the answer in chat history. Answer the question in your own words based on the information found. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `

  const answerTemplateBasicConversation = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba. Answer the question in your own words based on the information found. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend. Please mention the user's name when chatting. The user's name is {user_name}
  Conversation history: {conv_history}
  Question: {question}
  Answer: `

  const standaloneQuestionChain = RunnableSequence.from([
    PromptTemplate.fromTemplate(standaloneQuestionTemplate),
    llm,
    new StringOutputParser()
  ]);

  const retrieverChain = RunnableSequence.from([
    (prevResult: any) => prevResult.standalone_question,
    retriever,
    combineDocuments
  ]);

  const answerChainOutConversation = RunnableSequence.from([
    PromptTemplate.fromTemplate(answerTemplateOutConversation),
    llm,
    new StringOutputParser()
  ]);

  const answerChainInConversation = RunnableSequence.from([
    PromptTemplate.fromTemplate(answerTemplateInConversation),
    llm,
    new StringOutputParser()
  ]);

  const answerChainBasicConversation = RunnableSequence.from([
    PromptTemplate.fromTemplate(answerTemplateBasicConversation),
    llm,
    new StringOutputParser()
  ]);

  const chainOutConversation = RunnableSequence.from([
    {
      standalone_question: standaloneQuestionChain,
      input_variables: new RunnablePassthrough()
    },
    {
      context: retrieverChain,
      question: ({ input_variables }) => input_variables.question,
      conv_history: ({ input_variables }) => input_variables.conv_history,
      user_name: ({ input_variables }) => input_variables.user_name
    },
    answerChainOutConversation
  ])

  const branch = RunnableBranch.from([
    [
      (x: { aim: string; question: string, conv_history: string, user_name: string }) => x.aim.toLowerCase().includes("basic_conversation"),
      answerChainBasicConversation,
    ],
    [
      (x: { aim: string; question: string, conv_history: string, user_name: string }) => x.aim.toLowerCase().includes("in_conversation"),
      answerChainInConversation,
    ],
    chainOutConversation,
  ]);

  const fullChain = RunnableSequence.from([
    {
      aim: classificationChain,
      question: (input: { question: string, conv_history: string, user_name: string }) => input.question,
      conv_history: (input: { question: string, conv_history: string, user_name: string }) => input.conv_history,
      user_name: (input: { question: string, conv_history: string, user_name: string }) => input.user_name,
    },
    branch,
  ]);

  const rl = readline.createInterface({
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
        conv_history: formatConvHistory(conv_history.slice(-20)),
        user_name: name
      });

      console.log("Agent: ", response);

      await upstashChatHistory.addMessages([new HumanMessage(input), new AIMessage(response)]);
      // convHistory.push(input)
      // convHistory.push(response)

      askQuestion();
    });
  }

  askQuestion();
}