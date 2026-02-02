
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async optimizeFoodImage(base64Image: string, stylePrompt: string, userPrompt: string = ""): Promise<string | null> {
    try {
      // 確保 API Key 存在
      if (!process.env.API_KEY) throw new Error("API Key is missing");

      // 重新實例化以獲取最新 Key (根據規範)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        TASK: Optimize this food photo for professional commercial use.
        CONSTRAINTS: 
        1. Keep the EXACT food items and their arrangement from the original photo. Do not change the type of food (e.g., if it is a burger, keep it as this specific burger).
        2. Enhance the background, lighting, and textures to make it look like a professional studio advertisement.
        3. STYLE INSTRUCTION: ${stylePrompt}
        4. ADDITIONAL USER REQUESTS: ${userPrompt}
        5. The output must be an image only.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: prompt
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      return null;
    } catch (error) {
      console.error("Gemini optimization error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
