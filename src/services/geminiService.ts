import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateMockTest(day: number, topicFocus?: string) {
  const prompt = `Generate a 25-question multiple-choice mathematics mock exam for a Year 7 student preparing for the Archimedes Awards UK Final Stage. 
  The questions should range from foundational logic to high-complexity synthesis.
  Focus on these topics: Number Sense, Arithmetic, Rates/Ratios, Data/Probability, Logic/Combinatorics, Geometry.
  ${topicFocus ? `Special focus on: ${topicFocus}` : ""}
  
  Return the response as a JSON array of questions. Each question must have:
  - id (number)
  - text (string)
  - options (array of 5 strings)
  - correctAnswer (string, must be one of the options)
  - explanation (string, explaining the "Olympiad Strategy" vs "Standard Approach")
  - topic (string, one of the categories above)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctAnswer", "explanation", "topic"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating test:", error);
    return null;
  }
}

export async function getTopicExplanation(topic: string) {
  const prompt = `Explain the mathematical topic "${topic}" for a Year 7 student preparing for the Archimedes Awards. 
  Include:
  1. Core concepts and definitions.
  2. Essential formulae.
  3. A "Competitive Trick" or "Meta-solving Strategy" (like unit digit analysis or the Cat/Table/Tortoise principle).
  4. One complex example problem with a step-by-step solution.
  
  Format the response in Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining topic:", error);
    return "Failed to load explanation.";
  }
}
