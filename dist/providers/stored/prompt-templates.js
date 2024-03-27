"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptTemplates = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("langchain/prompts");
const promptTemplates = async () => {
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-3.5-turbo-0125",
        temperature: 0.7
    });
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", "Generate a joke based on a word provided by the user."],
        ["human", "{input}"]
    ]);
    // console.log(await prompt.format({ input: "Fire" }));
    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        input: "Fire"
    });
    console.log(response);
};
exports.promptTemplates = promptTemplates;
//# sourceMappingURL=prompt-templates.js.map