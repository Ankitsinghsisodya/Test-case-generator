import express, { urlencoded } from "express";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { getTestCase } from "./controller/getTestCase.js";
dotenv.config();

const app = express();
app.use(urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Server is running fine",
  });
});

app.post("/getTestCase", getTestCase);
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on the ${process.env.PORT} PORT`);
});


