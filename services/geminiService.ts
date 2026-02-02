
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private getApiKey(): string {
    // 部署腳本會將此處的 process.env.API_KEY 替換為真實字串
    const key = process.env.API_KEY;
    if (!key || key === 'undefined' || typeof key !== 'string' || key.includes('process.env')) {
      return '';
    }
    return key;
  }

  async optimizeFoodImage(base64Image: string, stylePrompt: string, userPrompt: string = ""): Promise<string | null> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error("API Key 未設定。請在 GitHub Secrets 中新增 API_KEY。");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        TASK: Optimize this food photo for professional commercial use.
        CONSTRAINTS: 
        1. Keep the EXACT food items and their arrangement from the original photo. Do not change the type of food.
        2. Enhance the background, lighting, and textures to make it look like a high-end studio advertisement.
        3. STYLE INSTRUCTION: ${stylePrompt}
        4. ADDITIONAL USER REQUESTS: ${userPrompt}
        5. The output must be an image ONLY.
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
            { text: prompt },
          ],
        },
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("AI 未能生成影像結果。");
    } catch (error) {
      console.error("Gemini optimization error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
