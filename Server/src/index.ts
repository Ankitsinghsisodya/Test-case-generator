import express, { urlencoded } from "express";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { getTestCase } from "./controller/getTestCase.js";
import authRoute from './routes/auth.route.js'
import cors from 'cors'
import {job} from './jobs/cronJobs.js';
import cookieParser from 'cookie-parser'
import { errorHandlingMiddleware } from "./middleware.ts/error.middleware.js";
dotenv.config();

const app = express();
app.use(cors())
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/auth', authRoute)
app.use(errorHandlingMiddleware);
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Server is running fine",
  });
});

app.post("/getTestCase", getTestCase);
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on the ${process.env.PORT} PORT`);
});


