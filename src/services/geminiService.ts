import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

// Helper to get the AI instance. 
// Note: We recreate this in the function to ensure we pick up the latest key if it changes (though standard env vars are static).
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateSalesScript = async (lead: Lead): Promise<{ whatsapp: string, script: string } | null> => {
  const ai = getAI();
  if (!ai) {
    console.warn("Gemini API Key missing");
    return null;
  }

  const prompt = `
    You are an expert sales agent for "DTH Store", a reseller of DTH and Broadband services.
    Generate a personalized sales pitch for a lead with the following details:
    Name: ${lead.name}
    Service Interested: ${lead.serviceType}
    Operator: ${lead.operator}
    Location: ${lead.location}
    
    Goal: Convince them to book the installation today. Mention "Fast Installation" and "Best Offer".
    
    Return the response in JSON format with two fields:
    1. 'whatsapp': A short, emoji-rich, friendly WhatsApp message (max 50 words).
    2. 'script': A professional phone call opening script (max 100 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatsapp: { type: Type.STRING },
            script: { type: Type.STRING }
          },
          required: ["whatsapp", "script"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating sales script:", error);
    return null;
  }
};
