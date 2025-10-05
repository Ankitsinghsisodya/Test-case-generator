import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import express, { urlencoded } from "express";
import { getTestCase } from "./controller/getTestCase.js";
import { errorHandlingMiddleware } from "./middleware.ts/error.middleware.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import subsriptionRoute from "./routes/subscription.route.js";
import testRoute from './routes/getTest.route.js'

dotenv.config();

const app = express();

// Cookie parser MUST be before routes that use cookies
app.use(cookieParser());

// Body parsing middleware
app.use(urlencoded({ extended: true }));

// CORS configuration - allow credentials
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it before Express parses the request body.
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use("/api/subscription", subsriptionRoute);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

// Error handling middleware should be last
app.use(errorHandlingMiddleware);

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Server is running fine",
  });
});

app.use("/test", testRoute);
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on the ${process.env.PORT} PORT`);
});
