import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, SearchSource } from "../types";

// Gemini AI Service
export const performGroundedSearch = async (query: string): Promise<SearchResult> => {
  // FIX: Per coding guidelines, API key must be from process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for and provide a comprehensive summary about: "${query}". Include key facts and details.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    if (!response.text && response.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error("SAFETY_BLOCK");
    }

    const answer = response.text || "No summary available.";
    
    const sources: SearchSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      answer,
      sources: uniqueSources,
    };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    
    const message = error.message || "";
    if (message.includes("429") || message.includes("quota")) return Promise.reject("RATE_LIMIT");
    if (message.includes("SAFETY_BLOCK")) return Promise.reject("SAFETY_BLOCK");
    if (message.includes("401") || message.includes("403")) return Promise.reject("AUTH_ERROR");
    if (!window.navigator.onLine) return Promise.reject("OFFLINE");
    
    return Promise.reject("UNKNOWN_ERROR");
  }
};

export const generatePhraseSuggestions = async (topic: string): Promise<string[]> => {
  if (!topic.trim()) return [];
  
  // FIX: Per coding guidelines, API key must be from process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the search topic "${topic}", generate 4 diverse and insightful contextual phrases to prepend or append to the query. The phrases should reframe the search from different perspectives (e.g., scientific, historical, philosophical, practical). For example, if the topic is "black holes", suggestions could be "the event horizon of", "hypothetical travel through", "and the theory of relativity", "in popular culture". Return only a JSON object with a "suggestions" key containing an array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
        temperature: 0.8,
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      return [];
    }

    const result = JSON.parse(jsonText);
    return result.suggestions || [];
  } catch (error) {
    console.error("Gemini Phrase Suggestion Error:", error);
    // Gracefully fail, just return no suggestions
    return [];
  }
};