import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "langchain/prompts";
import { CommaSeparatedListOutputParser, StringOutputParser } from "langchain/schema/output_parser";
import z from "zod";



export const outputParsers = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.7
  });

  const callStringOutputParser = async () => {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "Generate a joke based on a word provided by the user."],
      ["human", "{input}"]
    ]);

    const parser = new StringOutputParser();

    // console.log(await prompt.format({ input: "Fire" }));
    const chain = prompt.pipe(model).pipe(parser);

    return await chain.invoke({
      input: "Fire"
    });

  };

  const callListOutputParser = async () => {
    const prompt = ChatPromptTemplate.fromTemplate(`
      Provide 5 synonyms, seperated by commas, for the following word {word}
    `);

    const ouptputParser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(ouptputParser);
    return await chain.invoke({
      word: "fire"
    });
  };


  const structuredOutputParsers = async () => {
    const prompt = ChatPromptTemplate.fromTemplate(`
      Extract information from the following phrase. 
      Formatting Instruction: {format_instruction}
      Phrase: {phrase}
    `);
    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
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
    const prompt = ChatPromptTemplate.fromTemplate(`
      Extract information from the following phrase. 
      Phrase: {phrase}
      Formatting Instruction: {format_instruction}
    `);

    const outputParser = StructuredOutputParser.fromZodSchema(
      z.array(
        z.object({
          name: z.string().describe("the name of the person"),
          age: z.string().describe("the age of the person")
        })
      )
    );

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
