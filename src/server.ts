import express, { Application } from 'express';
import cors from 'cors'
import { apiV1 } from './routes/v1';
import ngrok from 'ngrok';
import { env } from './config/environment';

const app: Application = express();
const port = env.APP_PORT || 7500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1', cors(), apiV1);

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