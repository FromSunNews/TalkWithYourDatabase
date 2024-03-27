"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswerResearchAssistant1 = void 0;
const environment_1 = require("../../../config/environment");
const openai_1 = require("langchain/embeddings/openai");
const openai_2 = __importDefault(require("openai"));
const text_splitter_1 = require("langchain/text_splitter");
const memory_1 = require("langchain/vectorstores/memory");
const brave_search_1 = require("@langchain/community/tools/brave_search");
const cheerio_1 = __importDefault(require("cheerio"));
// đầu tiên khai báo openai
let openai = new openai_2.default({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: environment_1.env.GROQ_API_KEY,
});
// khai báo embedding
const embeddings = new openai_1.OpenAIEmbeddings();
// hàm lấy các câu hỏi liên quan tiếp theo 
async function generateFollowUpQuestions(responseText) {
    const a = performance.now();
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
    const b = performance.now();
    console.log('===============generateFollowUpQuestions took ' + (b - a) + ' ms.===================');
    return JSON.parse(groqResponse.choices[0].message.content ?? "");
}
const getAnswerResearchAssistant1 = async (datas) => {
    // Phân tích datas
    const { message, returnSources = true, returnFollowUpQuestions = true, embedSourcesInLLMResponse = false, textChunkSize = 800, textChunkOverlap = 200, numberOfSimilarityResults = 2, numberOfPagesToScan = 4 } = datas;
    // tái câu trúc lại câu hỏi được đưa ra => câu hỏi sẽ vào trọng tâm
    async function rephraseInput(inputString) {
        console.log(`4. Rephrasing input`);
        const groqResponse = await openai.chat.completions.create({
            model: "mixtral-8x7b-32768",
            messages: [
                { role: "system", content: "You are a rephraser and always respond with a rephrased VIETNAMESE version of the input that is given to a search engine API. Always be succint and use the same words as the input. RETURN ONLY A REVISED VIETNAMESE VERSION OF THE INPUT AND ADD NO MORE SENTENCES." },
                { role: "user", content: inputString },
            ],
        });
        console.log(`5. Rephrased input and got answer from Groq`);
        return groqResponse.choices[0].message.content ?? "";
    }
    // 10. 
    async function searchEngineForSources(message) {
        console.log(`3. Initializing Search Engine Process`);
        // 11. Khởi tạo BraveSearch
        const loader = new brave_search_1.BraveSearch({ apiKey: environment_1.env.BRAVE_SEARCH_API_KEY });
        // 12. Tái cấu trúc lại câu hỏi
        const rephrasedMessage = await rephraseInput(message);
        console.log(`6. Rephrased message and got documents from BraveSearch: `, rephrasedMessage);
        // 13. Lấy documents từ BraveSearch 
        const docs = await loader.call(rephrasedMessage);
        // 14. Normalize data => này sẽ chuyển dạng data: { title: string, link: string}
        const normalizedData = normalizeData(docs);
        console.log("🚀 ~ searchEngineForSources ~ normalizedData:", normalizedData);
        // 15. Process and vectorize the content
        return await Promise.all(normalizedData.map(fetchAndProcess));
    }
    // 16. Normalize data
    function normalizeData(docs) {
        return JSON.parse(docs)
            // lọc doc có title và link và không chứa tên miền brave.com
            .filter((doc) => doc.title && doc.link && !doc.link.includes("brave.com"))
            // tách lấy numberOfPagesToScan phần tử đầu tiên 
            .slice(0, numberOfPagesToScan)
            // chuyển mảng ban đầu về dạng có mảng 2 property: title: string, link: string  
            .map(({ title, link }) => ({ title, link }));
    }
    // 17. Lấy nội dung của 1 trang về
    const fetchPageContent = async (link) => {
        console.log(`7. Fetching page content for ${link}`);
        try {
            const response = await fetch(link);
            if (!response.ok) {
                return ""; // skip if fetch fails
            }
            // html dạng text
            const text = await response.text();
            return extractMainContent(text, link);
        }
        catch (error) {
            console.error(`Error fetching page content for ${link}:`, error);
            return '';
        }
    };
    // 18. Trích xuất nội dung từ 1 text html 
    function extractMainContent(html, link) {
        console.log(`8. Extracting main content from HTML for ${link}`);
        const $ = html.length ? cheerio_1.default.load(html) : null;
        if ($) {
            // xóa các thẻ không cần thiết
            $("script, style, head, nav, footer, iframe, img").remove();
            // trích xuất text từ body sau đó thay thế các khoảng( bao gồm dấu cách, tab, dòng mới,...) thành " " vào xóa khoảng trắng hai đầu
            return $("body").text().replace(/\s+/g, " ").trim();
        }
        else
            return "";
    }
    // 19. Xử lý và chuyển text đã lấy được từ trang web về dạng vector
    let vectorCount = 0;
    const fetchAndProcess = async (item) => {
        const a = performance.now();
        // lấy tất cả nội dung chính trong trang web 
        const htmlContent = await fetchPageContent(item.link);
        // không lấy nội dụng < 250 ký (vì đây có thể là quảng cáo)
        if (htmlContent && htmlContent.length < 250)
            return null;
        // tách ký tự với textChunkSize ký tự và chồng chéo textChunkOverlap ký tự
        const splitText = await new text_splitter_1.RecursiveCharacterTextSplitter({ chunkSize: textChunkSize, chunkOverlap: textChunkOverlap }).splitText(htmlContent);
        // lưu dạng vector
        const vectorStore = await memory_1.MemoryVectorStore.fromTexts(splitText, { link: item.link, title: item.title }, embeddings);
        vectorCount++;
        console.log(`9. Processed ${vectorCount} sources for ${item.link}`);
        // tìm các doc tương ứng với câu hỏi của người dùng 
        const similaritySearch = await vectorStore.similaritySearch(message, numberOfSimilarityResults);
        const b = performance.now();
        console.log('===============fetchAndProcess took ' + (b - a) + ' ms.===================');
        return similaritySearch;
    };
    // 20. nạp và xử lý các tài nguyên
    const sources = await searchEngineForSources(message);
    return sources;
    // const sourcesParsed = sources.map(group =>
    //   group.map((doc: any) => {
    //     const title = doc.metadata.title;
    //     const link = doc.metadata.link;
    //     return { title, link };
    //   })
    //     .filter((doc: any, index: number, self: any) => self.findIndex((d: any) => d.link === doc.link) === index)
    // );
    // console.log(`10. RAG complete sources and preparing response content`);
    // // 21. Chuẩn bị cho phản hồi
    // const chatCompletion = await openai.chat.completions.create({
    //   messages:
    //     [{
    //       role: "system", content: `
    //       - Here is my query "${message}", respond back with an answer that is as long as possible. If you can't find any relevant results, respond with "No relevant results found." 
    //       - ${embedSourcesInLLMResponse ? "Return the sources used in the response with iterable numbered markdown style annotations." : ""}" : ""}`
    //     },
    //     { role: "user", content: ` - Here are the top results from a similarity search: ${JSON.stringify(sources)}. ` },
    //     ], stream: true, model: "mixtral-8x7b-32768"
    // });
    // console.log(`11. Sent content to Groq for chat completion.`);
    // let responseTotal = "";
    // console.log(`12. Streaming response from Groq... \n`);
    // for await (const chunk of chatCompletion) {
    //   if (chunk.choices[0].delta && chunk.choices[0].finish_reason !== "stop") {
    //     // process.stdout.write(chunk.choices[0].delta.content);
    //     responseTotal += chunk.choices[0].delta.content;
    //   } else {
    //     let responseObj: {
    //       sources?: any,
    //       answer?: any,
    //       followUpQuestions?: any
    //     } = {};
    //     returnSources ? responseObj.sources = sourcesParsed : null;
    //     responseObj.answer = responseTotal;
    //     returnFollowUpQuestions ? responseObj.followUpQuestions = await generateFollowUpQuestions(responseTotal) : null;
    //     console.log(`\n\n13. Generated follow-up questions:  ${JSON.stringify(responseObj.followUpQuestions)}`);
    //     return responseObj;
    //   }
    // }
};
exports.getAnswerResearchAssistant1 = getAnswerResearchAssistant1;
//# sourceMappingURL=index%20copy.js.map