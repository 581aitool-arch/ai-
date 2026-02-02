
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // 檢查 API Key 是否已正確注入 (支援 GitHub Actions 的 sed 替換)
  private getApiKey(): string {
    const key = process.env.API_KEY;
    // 如果 key 是 undefined 或者還是原本的字串樣式，表示未注入成功
    if (!key || key === 'undefined' || typeof key !== 'string' || key.includes('process.env')) {
      return '';
    }
    return key;
  }

  async optimizeFoodImage(base64Image: string, stylePrompt: string, userPrompt: string = ""): Promise<string | null> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error("系統未偵測到 API Key。請確保已在 GitHub Secrets 中設定 API_KEY。");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        TASK: Optimize this food photo for professional commercial use.
        CONSTRAINTS: 
        1. Keep the EXACT food items and their arrangement from the original photo. Do not change the type of food.
        2. Enhance the background, lighting, and textures to make it look like a high-end studio advertisement.
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
