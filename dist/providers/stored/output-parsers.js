"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputParsers = void 0;
const openai_1 = require("@langchain/openai");
const output_parsers_1 = require("langchain/output_parsers");
const prompts_1 = require("langchain/prompts");
const output_parser_1 = require("langchain/schema/output_parser");
const zod_1 = __importDefault(require("zod"));
const outputParsers = async () => {
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-0125",
        temperature: 0.7
    });
    const callStringOutputParser = async () => {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", "Generate a joke based on a word provided by the user."],
            ["human", "{input}"]
        ]);
        const parser = new output_parser_1.StringOutputParser();
        // console.log(await prompt.format({ input: "Fire" }));
        const chain = prompt.pipe(model).pipe(parser);
        return await chain.invoke({
            input: "Fire"
        });
    };
    const callListOutputParser = async () => {
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      Provide 5 synonyms, seperated by commas, for the following word {word}
    `);
        const ouptputParser = new output_parser_1.CommaSeparatedListOutputParser();
        const chain = prompt.pipe(model).pipe(ouptputParser);
        return await chain.invoke({
            word: "fire"
        });
    };
    const structuredOutputParsers = async () => {
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      Extract information from the following phrase. 
      Formatting Instruction: {format_instruction}
      Phrase: {phrase}
    `);
        const outputParser = output_parsers_1.StructuredOutputParser.fromNamesAndDescriptions({
            name: "the name of the person",
            age: "the age of the person",
        });
        const chain = prompt.pipe(model).pipe(outputParser);
        return await chain.invoke({
            phrase: "Mother's FSN is 49 years old now, Mother's FSN borned him at 23 years old!",
            format_instruction: outputParser.getFormatInstructions()
        });
    };
    const callZodOutputParser = async () => {
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      Extract information from the following phrase. 
      Phrase: {phrase}
      Formatting Instruction: {format_instruction}
    `);
        const outputParser = output_parsers_1.StructuredOutputParser.fromZodSchema(zod_1.default.array(zod_1.default.object({
            name: zod_1.default.string().describe("the name of the person"),
            age: zod_1.default.string().describe("the age of the person")
        })));
        const chain = prompt.pipe(model).pipe(outputParser);
        return await chain.invoke({
            phrase: "Mother's FSN is 49 years old now, Mother's FSN borned him at 23 years old!",
            format_instruction: outputParser.getFormatInstructions()
        });
    };
    // const response = await callStringOutputParser();
    // const response = await callListOutputParser();
    // const response = await structuredOutputParsers();
    const response = await callZodOutputParser();
    console.log(response);
};
exports.outputParsers = outputParsers;
//# sourceMappingURL=output-parsers.js.map