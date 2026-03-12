// gemini.ts - AI service for fetching metaphysical properties
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface MetaphysicalResult {
  summary: string;
  properties: string[];
  chakras?: string[];
  elements?: string[];
  zodiacSigns?: string[];
  healingAspects?: string[];
  sources: { title: string; uri: string }[];
  rawResponse?: string;
}

export interface GeminiResponse {
  success: boolean;
  data?: MetaphysicalResult;
  error?: string;
}

/**
 * Fetches metaphysical properties for a given query using Gemini with Google Search grounding
 */
export async function fetchMetaphysicalProperties(query: string, contextPhrase: string = "metaphysical properties of"): Promise<GeminiResponse> {
  try {
    const fullQuery = `${contextPhrase} ${query}`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullQuery,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract the text response
    const textContent = response.text || "";
    
    // Extract grounding sources if available
    const sources: { title: string; uri: string }[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri || "",
          });
        }
      }
    }

    // Parse the response into structured data
    const parsed = parseMetaphysicalResponse(textContent, query);
    
    return {
      success: true,
      data: {
        ...parsed,
        sources,
        rawResponse: textContent,
      },
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch metaphysical properties",
    };
  }
}

/**
 * Parses the raw Gemini response into structured metaphysical data
 */
function parseMetaphysicalResponse(text: string, query: string): Omit<MetaphysicalResult, "sources" | "rawResponse"> {
  const lines = text.split("\n").filter(line => line.trim());
  
  // Extract summary (first paragraph or first few sentences)
  const summaryMatch = text.match(/^(.+?)(?:\n\n|$)/s);
  const summary = summaryMatch ? summaryMatch[1].trim() : text.slice(0, 500);

  // Extract properties (look for bullet points or numbered lists)
  const properties: string[] = [];
  const propertyPatterns = [
    /[•\-\*]\s*(.+)/g,
    /\d+\.\s*(.+)/g,
  ];
  
  for (const pattern of propertyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const prop = match[1].trim();
      if (prop.length > 10 && prop.length < 200 && !properties.includes(prop)) {
        properties.push(prop);
      }
    }
  }

  // Extract chakras
  const chakraKeywords = ["root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown"];
  const chakras = chakraKeywords.filter(chakra => 
    text.toLowerCase().includes(chakra)
  ).map(c => c.charAt(0).toUpperCase() + c.slice(1));

  // Extract elements
  const elementKeywords = ["fire", "water", "earth", "air", "ether", "spirit"];
  const elements = elementKeywords.filter(element => 
    new RegExp(`\\b${element}\\b`, 'i').test(text)
  ).map(e => e.charAt(0).toUpperCase() + e.slice(1));

  // Extract zodiac signs
  const zodiacKeywords = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
  const zodiacSigns = zodiacKeywords.filter(sign => 
    text.toLowerCase().includes(sign)
  ).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  // Extract healing aspects
  const healingPatterns = [
    /heal(?:s|ing)?\s+(?:the\s+)?(\w+(?:\s+\w+)?)/gi,
    /(?:promotes?|enhances?|supports?)\s+(\w+(?:\s+\w+)?)/gi,
    /(?:good|beneficial|helps?)\s+for\s+(\w+(?:\s+\w+)?)/gi,
  ];
  
  const healingAspects: string[] = [];
  for (const pattern of healingPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const aspect = match[1].trim();
      if (aspect.length > 3 && aspect.length < 50 && !healingAspects.includes(aspect)) {
        healingAspects.push(aspect.charAt(0).toUpperCase() + aspect.slice(1));
      }
    }
  }

  return {
    summary: summary.slice(0, 1000),
    properties: properties.slice(0, 10),
    chakras: chakras.length > 0 ? chakras : undefined,
    elements: elements.length > 0 ? elements : undefined,
    zodiacSigns: zodiacSigns.length > 0 ? zodiacSigns : undefined,
    healingAspects: healingAspects.slice(0, 8),
  };
}

/**
 * Formats the metaphysical result as markdown for notes
 */
export function formatAsMarkdown(result: MetaphysicalResult, query: string): string {
  let md = `# Metaphysical Properties of ${query}\n\n`;
  
  md += `## Summary\n${result.summary}\n\n`;
  
  if (result.properties.length > 0) {
    md += `## Key Properties\n`;
    result.properties.forEach(prop => {
      md += `- ${prop}\n`;
    });
    md += "\n";
  }
  
  if (result.chakras && result.chakras.length > 0) {
    md += `## Associated Chakras\n${result.chakras.join(", ")}\n\n`;
  }
  
  if (result.elements && result.elements.length > 0) {
    md += `## Elements\n${result.elements.join(", ")}\n\n`;
  }
  
  if (result.zodiacSigns && result.zodiacSigns.length > 0) {
    md += `## Zodiac Signs\n${result.zodiacSigns.join(", ")}\n\n`;
  }
  
  if (result.healingAspects && result.healingAspects.length > 0) {
    md += `## Healing Aspects\n`;
    result.healingAspects.forEach(aspect => {
      md += `- ${aspect}\n`;
    });
    md += "\n";
  }
  
  if (result.sources.length > 0) {
    md += `## Sources\n`;
    result.sources.forEach(source => {
      md += `- [${source.title}](${source.uri})\n`;
    });
    md += "\n";
  }
  
  md += `\n---\n*Generated on ${new Date().toLocaleString()}*\n`;
  
  return md;
}