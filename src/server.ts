import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import { apiV1 } from './routes/v1';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/v1', cors(), apiV1)

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});