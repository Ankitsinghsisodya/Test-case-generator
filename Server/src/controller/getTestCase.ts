import type { Request, Response } from "express";
import { check } from "../utilities/check.js";
import { getCode } from "../utilities/getCode.js";

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
    let Prompt = ` I am trying to solve this problem: ${problemStatement}
My solution code is: ${code}

Generate a single complete C++ program that stress-tests my code using std::mt19937_64 rng{static_cast<unsigned long long>(std::chrono::steady_clock::now().time_since_epoch().count())};
The stress-tester must:
- Use long long for all integer variables, loop counters, array indices, and return types (never declare variables as 'int').
- If you need unsigned integer types, use 'unsigned long long'.
- Do NOT use the keyword 'int' anywhere in variable declarations or for loop counters.
- You may keep "int main(...)" as the program entry point if strictly needed for standard compliance; otherwise prefer "int main()".
- Do NOT include any markdown fences, comments, or explanations — reply with ONLY the plain C++ source code (raw characters ready to paste).
- Do not print anything unless you find a failing test case; in that case print the test case and exit.
- Use Mod with some large number like 1000000000  depending on the problem to see the limit to generate test case 
-  use signed main(){} instead of int main(){}

IMPORTANT: Reply with only the raw C++ source code. Do NOT include any markdown fences (no "\`\`\`", no "\`\`\`cpp"), comments, or any spoken explanation — only the plain code.`;
    let cnt = 0;
    while (cnt < 10) {
      cnt++;
      const code = await getCode(Prompt, thinkingLevel);
      if (code === "") continue;

      const testCase = await check(code);

      if (!testCase || testCase.length === 0) continue;
      else
        return res.json({
          testCase,
        });
    }
    return res.json({
      message: "No issues found",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      error,
    });
  }
};
