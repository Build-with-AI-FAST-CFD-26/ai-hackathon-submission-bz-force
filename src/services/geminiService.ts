import { GoogleGenAI, Type } from "@google/genai";
import { Alert, ImpactLevel, StackItem, UserContext } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SCAN_SYSTEM_INSTRUCTION = `You are StackSense AI, a technical intelligence layer for startup founders.
Your goal is to analyze a startup's technical stack and provide high-impact, actionable alerts.
Focus on:
1. Cost Optimization: Identifying redundant tools or cheaper alternatives (e.g., Gemini Flash vs Pro).
2. Ecosystem Updates: New model releases, deprecations, or pricing changes.
3. Performance/Architecture: Identifying bottlenecks or better integration patterns.

Return a JSON object containing a 'healthScore' (0-100), 'alerts' (array), and 'summary'.
Each alert must have: title, description, impact (low, medium, high, critical), potentialSavings (number), action (string), category (cost, performance, ecosystem, security).`;

export async function scanStack(context: UserContext): Promise<{ healthScore: number; alerts: Alert[]; summary: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `My current stack is: ${JSON.stringify(context.stack)}. 
                 My monthly spend is $${context.monthlyBudget}. 
                 My main focus is: ${context.mainFocus}.
                 Analyze this and provide stack intelligence alerts.`,
      config: {
        systemInstruction: SCAN_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: Object.values(ImpactLevel) },
                  potentialSavings: { type: Type.NUMBER },
                  action: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ["title", "description", "impact", "potentialSavings", "action", "category"],
              },
            },
          },
          required: ["healthScore", "alerts", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      alerts: result.alerts.map((a: any, i: number) => ({ ...a, id: `alert-${i}`, timestamp: Date.now() })),
    };
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
}

export async function askContextualQuestion(question: string, alert: Alert, stack: StackItem[]): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Question: ${question}
               Context: This is about an alert titled "${alert.title}" with description "${alert.description}".
               User Stack: ${JSON.stringify(stack)}
               Provide a concise, technical answer or recommendation.`,
  });
  return response.text;
}
