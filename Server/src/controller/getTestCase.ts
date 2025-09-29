import { check } from "../utilities/check.js";
import { getCode } from "../utilities/getCode.js";
import type { Request, Response } from "express";

export const getTestCase = async (req: Request, res: Response) => {
  try {

    const { code, problemStatement, thinkingLevel } = req.body;

    if (!code)
      return res.json({
        message: "code is missing",
      });

    if (!problemStatement)
      return res.json({
        message: "Problem Statement is missing",
      });

    const Prompt = `I am try to solve this problem ${problemStatement} but I am getting
        Wrong Answer and I am not able to figure out the test case in which it is faling. So 
        I want you to stress test my code. So, Can you please give me a code to stress
        test. This is my code ${code}. Use this in generation of random numbers std::mt19937_64
         rng{std::chrono::steady_clock::now().time_since_epoch().count()};. The code should 
         be such that If your code find any test case where my code fails 
         then it should print the test case. Else the code should output nothing. Please don't give
         me any comment or reason just give me code`;
    let cnt = 0;
    while (cnt < 10) {
      cnt++;
      const code = await getCode(Prompt, thinkingLevel);
      if(code === "")continue;
      console.log('ankit')
      const testCase = await check(code);
      console.log('ayush')
      if (!testCase || testCase.length === 0) continue;
      else
        return res.json({
          testCase,
        });
    }
     return res.json({
        message: "No issues found"
    });
  } catch (error) {
    console.log(error);
    return res.json({
      error,
    });
  } 
};
