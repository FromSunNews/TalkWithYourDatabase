import { env } from "config/environment";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { BraveSearch } from "@langchain/community/tools/brave_search";
import cheerio from 'cheerio';
import { ConfigOptions } from "common/interfaces/ConfigOptions.interface";

// 4. Initialize Groq and embeddings
let openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: env.GROQ_API_KEY,
});
const embeddings = new OpenAIEmbeddings();

async function generateFollowUpQuestions(responseText: string) {
  const groqResponse = await openai.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: [
      { role: "system", content: "You are a question generator. Generate 3 follow-up questions based on the provided text. Return the questions in an array format." },
      {
        role: "user",
        content: `Generate 3 follow-up questions based on the following text:\n\n${responseText}\n\nReturn the questions in the following format: ["Question 1", "Question 2", "Question 3"]`
      }
    ],
  });
  console.log("🚀 ~ generateFollowUpQuestions ~ groqResponse:", groqResponse)
  return JSON.parse(groqResponse.choices[0].message.content ?? "");
}

export const getAnswerResearchAssistant = async (datas: ConfigOptions) => {

  // 6. Handle POST requests
  console.log(`1. Received POST request`);
  // 7. Extract request data
  const { message, returnSources = true, returnFollowUpQuestions = true, embedSourcesInLLMResponse = false, textChunkSize = 800, textChunkOverlap = 200, numberOfSimilarityResults = 2, numberOfPagesToScan = 4 } = datas;

  console.log(`2. Destructured request data`);
  // 8. Define rephrase function
  async function rephraseInput(inputString: string): Promise<string> {
    console.log(`4. Rephrasing input`);
    // 9. Rephrase input using Groq
    const groqResponse = await openai.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: "You are a rephraser and always respond with a rephrased version of the input that is given to a search engine API. Always be succint and use the same words as the input. ONLY RETURN THE REPHRASED VERSION OF THE INPUT." },
        { role: "user", content: inputString },
      ],
    });
    console.log(`5. Rephrased input and got answer from Groq`);
    return groqResponse.choices[0].message.content ?? "";
  }
  // 10. Define search engine function
  async function searchEngineForSources(message: string) {
    console.log(`3. Initializing Search Engine Process`);
    // 11. Initialize BraveSearch
    const loader = new BraveSearch({ apiKey: env.BRAVE_SEARCH_API_KEY });
    // 12. Rephrase the message
    const rephrasedMessage = await rephraseInput(message);
    console.log(`6. Rephrased message and got documents from BraveSearch`);
    // 13. Get documents from BraveSearch 
    const docs = await loader.call(rephrasedMessage, { count: numberOfPagesToScan });
    // 14. Normalize data
    const normalizedData = normalizeData(docs);
    // 15. Process and vectorize the content
    return await Promise.all(normalizedData.map(fetchAndProcess));
  }
  // 16. Normalize data
  function normalizeData(docs: any) {
    return JSON.parse(docs)
      .filter((doc: any) => doc.title && doc.link && !doc.link.includes("brave.com"))
      .slice(0, numberOfPagesToScan)
      .map(({ title, link }: { title: string, link: string }) => ({ title, link }));
  }
  // 17. Fetch page content
  const fetchPageContent = async (link: string) => {
    console.log(`7. Fetching page content for ${link}`);
    try {
      const response = await fetch(link);
      if (!response.ok) {
        return ""; // skip if fetch fails
      }
      const text = await response.text();
      return extractMainContent(text, link);
    } catch (error) {
      console.error(`Error fetching page content for ${link}:`, error);
      return '';
    }
  };
  // 18. Extract main content from the HTML page
  function extractMainContent(html: string, link: string) {
    console.log(`8. Extracting main content from HTML for ${link}`);
    const $ = html.length ? cheerio.load(html) : null
    if ($) {
      $("script, style, head, nav, footer, iframe, img").remove();
      return $("body").text().replace(/\s+/g, " ").trim();
    } else return ""
  }
  // 19. Process and vectorize the content
  let vectorCount = 0;
  const fetchAndProcess = async (item: any) => {
    const htmlContent = await fetchPageContent(item.link);
    if (htmlContent && htmlContent.length < 250) return null;
    const splitText = await new RecursiveCharacterTextSplitter({ chunkSize: textChunkSize, chunkOverlap: textChunkOverlap }).splitText(htmlContent);
    const vectorStore = await MemoryVectorStore.fromTexts(splitText, { link: item.link, title: item.title }, embeddings);
    vectorCount++;
    console.log(`9. Processed ${vectorCount} sources for ${item.link}`);
    return await vectorStore.similaritySearch(message, numberOfSimilarityResults);
  };
  // 20. Fetch and process sources
  const sources = await searchEngineForSources(message);
  const sourcesParsed = sources.map(group =>
    group.map((doc: any) => {
      const title = doc.metadata.title;
      const link = doc.metadata.link;
      return { title, link };
    })
      .filter((doc: any, index: number, self: any) => self.findIndex((d: any) => d.link === doc.link) === index)
  );
  console.log(`10. RAG complete sources and preparing response content`);
  // 21. Prepare the response content
  const chatCompletion = await openai.chat.completions.create({
    messages:
      [{
        role: "system", content: `
         - Here is my query "${message}", respond back with an answer that is as long as possible. If you can't find any relevant results, respond with "No relevant results found." 
         - ${embedSourcesInLLMResponse ? "Return the sources used in the response with iterable numbered markdown style annotations." : ""}" : ""}`
      },
      { role: "user", content: ` - Here are the top results from a similarity search: ${JSON.stringify(sources)}. ` },
      ], stream: true, model: "mixtral-8x7b-32768"
  });
  console.log(`11. Sent content to Groq for chat completion.`);
  let responseTotal = "";
  console.log(`12. Streaming response from Groq... \n`);
  for await (const chunk of chatCompletion) {
    if (chunk.choices[0].delta && chunk.choices[0].finish_reason !== "stop") {
      // process.stdout.write(chunk.choices[0].delta.content);
      responseTotal += chunk.choices[0].delta.content;
      console.log("🚀 ~ forawait ~ responseTotal:", responseTotal)
    } else {
      let responseObj: {
        sources?: any,
        answer?: any,
        followUpQuestions?: any
      } = {};
      returnSources ? responseObj.sources = sourcesParsed : null;
      responseObj.answer = responseTotal;
      returnFollowUpQuestions ? responseObj.followUpQuestions = await generateFollowUpQuestions(responseTotal) : null;
      console.log(`\n\n13. Generated follow-up questions:  ${JSON.stringify(responseObj.followUpQuestions)}`);
      console.log("🚀 ~ forawait ~ responseObj:", responseObj)
      return responseObj;
    }
  }
}