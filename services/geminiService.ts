
import { GoogleGenAI, Type } from "@google/genai";

export async function getAiFix(expression: string, errorMessage: string): Promise<{ fix: string; message: string; } | null> {
  if (!process.env.API_KEY) {
    console.log("API_KEY environment variable not set. Skipping Gemini call.");
    return null;
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Correct the following mathematical expression which caused an error.
Provide a brief, one-sentence explanation in Arabic about the error.
Expression: "${expression}"
Error: "${errorMessage}"
Respond ONLY with a valid JSON object with two keys: "fix" (the corrected expression) and "message" (the explanation in Arabic).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fix: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ['fix', 'message']
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result.fix && result.message) {
      return { fix: result.fix, message: `💡 ${result.message}` };
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
