import { GoogleGenAI } from "@google/genai";
import { Task } from '../types';

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  isAvailable(): boolean {
    return !!this.ai;
  }

  async generateTasks(topic: string): Promise<Partial<Task>[]> {
    if (!this.ai) throw new Error("API Key not found");

    const prompt = `
      Generate 3 realistic tasks for a software development intern working on: "${topic}".
      Return ONLY a JSON array of objects. 
      Each object should have keys: "title", "description", "priority" (low, medium, or high), and "status" (always "todo").
      Do not include markdown code blocks. Just the raw JSON.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '[]';
      // Clean up if markdown is present despite instructions
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async improveTaskDescription(title: string, currentDesc: string): Promise<string> {
    if (!this.ai) throw new Error("API Key not found");

    const prompt = `
      Rewrite and improve the following task description to be more professional, clear, and actionable.
      Task Title: ${title}
      Current Description: ${currentDesc}
      
      Return ONLY the improved description text.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text?.trim() || currentDesc;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return currentDesc;
    }
  }
}

export const geminiService = new GeminiService();
