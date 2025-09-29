import { GoogleGenAI } from "@google/genai";

export const getCode = async (
  prompt: string,
  thinkingLevel: String
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    async function main() {
      const time = Date.now();
      let thinkingBudget = 0;
      if (thinkingLevel == "Moderate") {
        thinkingBudget = -1;
      } else if (thinkingLevel === "High") {
        thinkingBudget = 1024;
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}`,
        config: {
          thinkingConfig: {
            thinkingBudget: 1024,
            // Turn off thinking:
            // thinkingBudget,
            // Turn on dynamic thinking:
            // thinkingBudget: -1
          },
        },
      });
      console.log("time taken", Date.now() - time);
      return response.text;
    }

    return (await main()) || "";
  } catch (error) {
    console.log("error", error);
    return "";
  }
};
