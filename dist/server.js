"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const v1_1 = require("./routes/v1");
const environment_1 = require("./config/environment");
const app = (0, express_1.default)();
const port = environment_1.env.APP_PORT || 7500;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/v1', (0, cors_1.default)(), v1_1.apiV1);
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
    // ngrok.connect(7500).then((url) => {
    //   console.log("🚀 ~ ngrok.connect ~ url:", url)
    // })
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
    //     await getAnswerChatBot("dád", input, "Nhật Phương")
    //     askQuestion();
    //   });
    // }
    // askQuestion();
});
//# sourceMappingURL=server.js.map